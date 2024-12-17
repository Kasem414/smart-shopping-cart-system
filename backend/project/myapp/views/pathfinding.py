from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from ..utils.extend_grid import extend_grid
from ..utils.validation_path import is_connected
from ..utils.scale_point import scale_point
# from ..validations import validate_path
from ..models import Store, StoreLayout, Product,ShoppingList, Component, ShoppingListItem
from ..utils.context import PathfindingContext, NavigationContext
from ..strategies.pathfinding_strategy import AStarPathfinding
from ..strategies.navigation_strategy import TSPNavigation

class ShortestPathView(APIView):
    
    # End-point لحساب أقصر مسار لمنتج معين
    def get(self, request, product_id):
        # الحصول على المتجر الذي يحتوي المنتج 
        product = get_object_or_404(Product,id=product_id)
        # store = product.store_id
        store = Store.objects.get(id=1)
        # التأكد من وجود خريطة المتجر (StoreLayout) أو إرسال خطأ إذا لم تكن موجودة
        layout = get_object_or_404(StoreLayout, store=store)
        grid_size = layout.grid_size  # حجم شبكة الخريطة

        # إنشاء الشبكة بناءً على مكونات الخريطة (المناطق التي يمكن أو لا يمكن عبورها)
        components = layout.components.all()
        grid = [[0 for _ in range(grid_size)] for _ in range(grid_size)]  # شبكة فارغة
        # Automatically adjust grid size to fit all components
        # max_x = max(component.position_x + component.width for component in components)
        # max_y = max(component.position_y + component.height for component in components)
        # grid_size = max(grid_size, max(max_x, max_y))

        # # Rebuild the grid with the new size
        # grid = [[0 for _ in range(grid_size)] for _ in range(grid_size)]
        for component in components:
            # وضع قيمة 1 لأي جزء من الشبكة يمثل عقبة (Obstacle)
            for x in range(component.position_x,min(component.position_x + component.width,grid_size)):
                for y in range(component.position_y, min(component.position_y + component.height,grid_size)):
                    grid[x][y] = 1
        
        # Retrieve the component representing the category
        category_name = product.category.name.capitalize()
        components = Component.objects.filter(layout=layout,categories__contains = category_name)
        # Try case-insensitive
        components = Component.objects.filter(layout=layout,categories__icontains= category_name)
        # Check if there are matching components
        # if no match found , try without capitalization
        if not components.exists():
            category_name = product.category.name # Use original case
            components = Component.objects.filter(layout=layout,categories__icontains= category_name)
            # return Response({"detail": f"No component matches the category '{category_name}'"},status=status.HTTP_404_NOT_FOUND)
        # If still no match, try lowercase 
        if not components.exists():
            category_name = product.category.name.lower() 
            components = Component.objects.filter(layout=layout,categories__icontains= category_name)
            # return Response({"detail": f"No component matches the category '{category_name}'"},status=status.HTTP_404_NOT_FOUND)
        if not components.exists():
            return Response({"detail": f"No component matches the category '{category_name}'"},status=status.HTTP_404_NOT_FOUND)
        category_component = components.first()
        # Set product location based on the component's position
        product_location = (category_component.position_x, category_component.position_y // 2)
        # for row in grid:
        #     assert all(cell in [0,1] for cell in row),"Invalid grid value"
        # تعريف نقطة البداية (مدخل المتجر) ونقطة الهدف (موقع المنتج)
        entrance = Component.objects.filter(type="entrance",layout=layout).first()
        if entrance:
            center_x = (entrance.position_x + entrance.width) * 2
            center_y = entrance.position_y + entrance.height // 2
            start = (center_x,center_y)  # مدخل المتجر
        else:
            return Response({"details":"You Should drag and drop entrance component on your layout!"},status=status.HTTP_400_BAD_REQUEST)
        goal = product_location  # موقع المنتج
        """
        # start = (0,0)  
        # assert 0 <= 0 < len(grid) and 0 <= 0 < len(grid[0]), "Start position out of bounds"
        # assert grid[0][0] == 0, "Start position is not walkable"
        # goal = (10,20)
        # assert 0 <= goal[0] < len(grid) and 0 <= goal[1] < len(grid[0]), "Goal position out of bounds"
        # assert grid[0][1] == 0, "Goal position is not walkable"
        # print("validation passed. Inputs are valid.")
        # print(f"Product location:{goal}, Grid Size:{len(grid)} x {len(grid[0])}")
        # استخدام استراتيجية A* لحساب المسار
        """

        # def adjust_to_bounds(grid, position):
        #     """

        #     Adjust the given position to be within the bounds of the grid.
        #     """
        #     rows, cols = len(grid), len(grid[0])
        #     x, y = position
        #     x = min(max(x, 0), rows - 1)  # Clamp x to [0, rows - 1]
        #     y = min(max(y, 0), cols - 1)  # Clamp y to [0, cols - 1]
        #     return x, y
        # def adjust_positions_and_find_path(grid, start, goal):
        #     """
        #     Adjust the start and goal positions if they are out of bounds and find the path.
        #     """
        #     start = adjust_to_bounds(grid, start)
        #     goal = adjust_to_bounds(grid, goal)

        #     # Validate walkability
        #     if grid[start[0]][start[1]] != 0:
        #         raise ValueError(f"Adjusted start position {start} is not walkable.")

        #     if grid[goal[0]][goal[1]] != 0:
        #         raise ValueError(f"Adjusted goal position {goal} is not walkable.")
        #     return goal
        # adjust_to_bounds(grid=grid,position=product_location)
        # goal=adjust_positions_and_find_path(grid=grid,start=start,goal=goal)
        def extend_grid(grid, start, goal):
            """
            Extend the grid dynamically to include the start and goal positions.
            """
            rows, cols = len(grid), len(grid[0])
            # Determine new grid size
            max_x = max(rows - 1, start[0], goal[0])
            max_y = max(cols - 1, start[1], goal[1])
            # Create a new grid with walkable cells
            new_grid = [[0] * (max_y + 1) for _ in range(max_x + 1)]
            # Copy the original grid into the new grid
            for i in range(rows):
                for j in range(cols):
                    new_grid[i][j] = grid[i][j]
            return new_grid
        # def extend_and_find_path(grid, start, goal):
        #     """
        #     Extend the grid if needed and find the path.
        #     """
        #     grid = extend_grid(grid, start, goal)
        #     # print(f"Grid Size:{len(grid)} x {len(grid[0])}")
        #     # Validate walkability
        #     if grid[start[0]][start[1]] != 0:
        #         raise ValueError(f"Start position {start} is not walkable after grid extension.")

        #     if grid[goal[0]][goal[1]] != 0:
        #         raise ValueError(f"Goal position {goal} is not walkable after grid extension.")
        grid=extend_grid(grid=grid,start=start,goal=goal)    
        # extend_and_find_path(grid=grid,start=start,goal=goal)
        pathfinding_context = PathfindingContext(AStarPathfinding())  # تعيين الاستراتيجية
        path = pathfinding_context.calculate_path(grid, start, goal)  # حساب المسار
        # في حالة عدم وجود مسار صالح، إرسال رسالة خطأ
        if not path:
            return Response({"error": "No path available"}, status=status.HTTP_400_BAD_REQUEST)
        # validate_path(grid,path,start,goal)
        # إرسال المسار كاستجابة JSON
        return Response({"path": path}, status=status.HTTP_200_OK)

class ShoppingListPathView(APIView):
    """
    View to calculate the optimal path for a shopping list using TSP and A*.
    """
    def get(self, request):
        """
        Calculate the optimal path for the logged-in user's shopping list.
        حساب المسار المثالي لقائمة التسوق الخاصة بالمستخدم الحالي.
        """
        # Retrieve the shopping list for the logged-in user
        # جلب قائمة التسوق الخاصة بالمستخدم الحالي
        shopping_list = ShoppingList.objects.filter(customer=request.user).first()
        if not shopping_list:
            # Return error if no shopping list exists
            # إرسال خطأ إذا لم تكن هناك قائمة تسوق
            return Response({"error": "No shopping list found for this user."}, status=status.HTTP_404_NOT_FOUND)
        # Get a product from shopping list to specify store that customer picked up items from
        shopping_list_item = ShoppingListItem.objects.filter(shopping_list=shopping_list.id).first()
        product_store = shopping_list_item.product.store_id
        # التأكد من وجود خريطة المتجر (StoreLayout) أو إرسال خطأ إذا لم تكن موجودة
        # Retrieve the store layout (map)
        layout = get_object_or_404(StoreLayout, store=product_store)
        # Get the grid size and components of the layout
        # جلب حجم الشبكة ومكونات الخريطة
        grid_size = layout.grid_size
        components = layout.components.all()
        # Create an empty grid for the layout
        # إنشاء شبكة فارغة للخريطة
        grid = [[0 for _ in range(grid_size)] for _ in range(grid_size)]
        # Fill the grid with obstacles based on the layout's components
        # ملء الشبكة بالعوائق بناءً على مكونات الخريطة
        for component in components:
            for x in range(component.position_x, min(component.position_x + component.width, grid_size)):
                for y in range(component.position_y, min(component.position_y + component.height,grid_size)):
                    grid[x][y] = 1  # Mark as obstacle / عائق
        # for row in grid:
        #     print(row)
        # Get product locations from the shopping list
        # جلب مواقع المنتجات من قائمة التسوق
        product_list = ShoppingListItem.objects.filter(shopping_list=shopping_list.id)
        product_locations = []
        # Loop through all products in the shopping list
        for item in product_list:
            product = item.product
            # Retrieve the component representing the category
            category_name = product.category.name.capitalize() # Get the category name
            components = Component.objects.filter(layout=layout,categories__contains=[category_name])
            if not components.exists():
                return Response({"detail":f"No component matches the category '{category_name}' for product '{product.name}'"},status=status.HTTP_404_NOT_FOUND)
            # Get the first matching component and add its position
            category_component = components.first()
            product_locations.append((category_component.position_x,category_component.position_y))
        # تعريف نقطة البداية (مدخل المتجر) ونقطة الهدف (موقع المنتج)
        entrance = Component.objects.filter(type="entrance",layout=layout).first()
        if entrance:
            start = [(entrance.position_x,entrance.position_y)]  # مدخل المتجر
        else:
            return Response({"details":"You Should drag and drop entrance component on your layout!"},status=status.HTTP_400_BAD_REQUEST)
        # Add the store entrance as the starting point
        # إضافة مدخل المتجر كنقطة بداية
        points = start + product_locations
        # Map points to categories for better error reporting
        categories = ['entrance'] + [item.product.category.name for item in product_list]
        # Validate connectivity
        # Use TSP strategy to calculate the optimal sequence
        # استخدام خوارزمية TSP لحساب التسلسل الأمثل للنقاط
        navigation_context = NavigationContext(TSPNavigation())
        tsp_result = navigation_context.calculate_navigation(points)
        # for point in tsp_result:
        print("Tsp result points:",tsp_result)
        grid = extend_grid(grid, points=tsp_result)
        # connected ,problematic_category = is_connected(grid,points,categories)
        # if not connected:
        #     return Response({"error":f"No valid path to the category '{problematic_category}'. Check the layout for disconnected, areas."}
        #                     ,status=status.HTTP_400_BAD_REQUEST)
        #     print("Debug Point:",point,type(point))
        if not tsp_result:
            # Return error if TSP fails
            # إرسال خطأ إذا فشل حساب TSP
            return Response({"error": "Unable to calculate an optimal path."}, status=status.HTTP_400_BAD_REQUEST)
        # Dynamically determine max_x and max_y based on tsp_result
        # max_x = max(float(point[0]) for point in tsp_result)
        # max_y = max(float(point[1]) for point in tsp_result)
        # scaled_tsp_result = [scale_point(point=point,max_x=max_x,max_y=max_y,grid_size=grid_size) for point in tsp_result]
        # print("Scaled TSP Result Points:", scaled_tsp_result)
        # Calculate paths between points using A*
        # حساب المسارات بين النقاط باستخدام A*
        pathfinding_context = PathfindingContext(AStarPathfinding())
        full_path = []
        # Calculate paths between the scaled points
        for i in range(len(tsp_result) - 1):
            segment = pathfinding_context.calculate_path(grid, tsp_result[i], tsp_result[i + 1])
            # segment = pathfinding_context.calculate_path(grid, scaled_tsp_result[i], scaled_tsp_result[i+1])
            # print(f"path from {tsp_result[i]} to {tsp_result[i+1]}:",segment)
            # print(f"path from {scaled_tsp_result[i]} to {scaled_tsp_result[i+1]}:",segment)
            if not segment:
                # Return error if a path segment cannot be found
                # إرسال خطأ إذا تعذر العثور على جزء من المسار
                return Response({"error": f"No valid path between points. {tsp_result[i]} and {tsp_result[i+1]}. Check the layout"},
                                 status=status.HTTP_400_BAD_REQUEST)
            full_path.extend(segment)
        # Return the full path as a response
        # إرسال المسار الكامل كاستجابة
        return Response({"path": full_path}, status=status.HTTP_200_OK)