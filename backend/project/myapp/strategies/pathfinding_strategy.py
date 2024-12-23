from queue import PriorityQueue
import heapq
from abc import ABC, abstractmethod

class PathfindingStrategy(ABC):
    @abstractmethod
    def find_path(self, grid, start, goal):
        pass
class AStarPathfinding(PathfindingStrategy):
    # def __init__(self):
    #     self.directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]  # Right, Down, Left, Up
    def heuristic(self, current, goal):
        # Manhattan distance heuristic
        dx = abs(current[0] - goal[0])
        dy = abs(current[1] - goal[1])
        return dy + dx * -1.1

    def find_path(self, grid, start, goal):
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        open_set = PriorityQueue()
        open_set.put((0, start))  # (priority, position)
        came_from = {}
        cost_so_far = {start: 0}

        while not open_set.empty():
            current = open_set.get()[1]

            if current == goal:
                return self.reconstruct_path(came_from, start, goal)

            for direction in directions:
                neighbor = (current[0] + direction[0], current[1] + direction[1])

                # Validate neighbor based on aisles
                if (
                    0 <= neighbor[0] < len(grid) and
                    0 <= neighbor[1] < len(grid[0]) and
                    grid[neighbor[0]][neighbor[1]] == 0  # Must be an aisle
                ):
                    new_cost = cost_so_far[current] + 1
                    if neighbor not in cost_so_far or new_cost < cost_so_far[neighbor]:
                        cost_so_far[neighbor] = new_cost
                        priority = new_cost + self.heuristic(neighbor, goal)
                        open_set.put((priority, neighbor))
                        came_from[neighbor] = current

        return None

    def reconstruct_path(self, came_from, start, goal):
        path = []
        current = goal
        while current != start:
            path.append(current)
            current = came_from[current]
        path.append(start)
        path.reverse()
        return path
    
"""
import heapq
from abc import ABC, abstractmethod

class PathfindingStrategy(ABC):
    @abstractmethod
    def find_path(self, grid, start, goal):
        pass

class AStarPathfinding(PathfindingStrategy):
    def find_path(self, grid, start, goal):
        rows, cols = len(grid), len(grid[0])
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
        # validate grid
        print("Validating grid...")
        for row in grid:
            assert all(cell in [0,1] for cell in row), "Invalid grid values"
        # validate start 
        x,y = start 
        assert 0 <= x < len(grid) and 0 <= y < len(grid[0]), "Start position out of bounds"
        assert grid[x][y] == 0, "Start position is not walkable"
        # validate goal
        x,y = goal
        assert 0 <= x < len(grid) and 0 <= y < len(grid[0]), "Goal position out of bounds"
        assert grid[x][y] == 0, "Goal position is not walkable"
        # Check heuristic 
        print("validation passed in A* algorithm")
        def heuristic(a, b):
            return abs(a[0] - b[0]) + abs(a[1] - b[1])
        # assert heuristic((0,0),(3,4) == 7), "Incorrect Manhattan distance"
        print(f"Heuristic (start to goal):{heuristic(start, goal)}")
        
        open_set = []
        heapq.heappush(open_set, (0, start))
        came_from = {}
        g_score = {start: 0}
        f_score = {start: heuristic(start, goal)}
        # Validate initial state of came_from
        assert isinstance(came_from,dict), "came_from must be a dictionary"
        assert all(isinstance(k,tuple) and isinstance(v,tuple) for k, v in came_from.items()), "Invalid entries in came_from"
        print("came_from fir:",came_from)
        while open_set:
            _, current = heapq.heappop(open_set)

            if current == goal:
                path = []
                while current in came_from:
                    path.append(current)
                    current = came_from[current]
                print(f"path: {path}")
                print(f"current: {current}")
                return path[::-1]

            for direction in directions:
                neighbor = (current[0] + direction[0], current[1] + direction[1])
                neighbor = x,y
                assert 0 <= x < rows and 0 <= y < cols, "Neighbor out of bounds"
                assert grid[x][y] == 0, "Neighbor is not walkable"
                print(f"Cheking neighbor: {neighbor}, valid: {0 <= x < rows and 0 <= y < cols and grid[x][y] == 0}")
                if 0 <= neighbor[0] < rows and 0 <= neighbor[1] < cols and grid[neighbor[0]][neighbor[1]] == 0:
                    tentative_g_score = g_score[current] + 1
                    if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                        came_from[neighbor] = current
                        g_score[neighbor] = tentative_g_score
                        f_score[neighbor] = tentative_g_score + heuristic(neighbor, goal)
                        heapq.heappush(open_set, (f_score[neighbor], neighbor))
                        # Validate after modifying came_from
                        assert isinstance(came_from,dict), "came_from must be a dictionary"
                        assert all(isinstance(k,tuple) and isinstance(v,tuple) for k,v in came_from.items()), "Invalid entries in came_from"
                        print("came_from sec:",came_from)
        # Final validation (if no path is found)
        assert isinstance(came_from,dict), "came_from must be a dictionary"
        assert all(isinstance(k, tuple) and isinstance(v, tuple) for k, v in came_from.items()) , "Invalid entries in came_from"
        print("came_from th:",came_from)
        # print(f"path: {path}")
        return None  # No path found
"""