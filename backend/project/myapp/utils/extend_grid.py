def extend_grid(grid, points):
            """
            Extend the grid size to ensure all points fit within the grid boundaries.
            """
            max_x = max(point[0] for point in points)
            max_y = max(point[1] for point in points)
            current_size = len(grid)
            # Calculate the required size of the grid
            required_size = max(max_x + 1, max_y + 1)
            # Extend the grid if the required size exceeds the current size
            if required_size > current_size:
                # Create a new grid with the extended size
                new_grid = [[0 for _ in range(required_size)] for _ in range(required_size)]
            # Copy the values from the old grid into the new grid
                for x in range(current_size):
                    for y in range(current_size):
                        new_grid[x][y] = grid[x][y]
                return new_grid
            return grid
# def extend_grid(grid, scaled_tsp_result):
        #     # Determine current grid dimensions
        #     grid_height = len(grid)
        #     grid_width = len(grid[0]) if grid else 0
        #     # Find the maximum X and Y values in scaled_tsp_result
        #     max_x = max(point[0] for point in scaled_tsp_result)
        #     max_y = max(point[1] for point in scaled_tsp_result)
        #     # Extend grid rows if needed
        #     while len(grid) <= max_y:
        #         grid.append([0] * grid_width)

        #     # Extend grid columns if needed
        #     for row in grid:
        #         while len(row) <= max_x:
        #             row.append(0)

        #     print(f"Grid extended to size: {len(grid)}x{len(grid[0])}")
        #     return grid
