from collections import deque

def is_connected(grid, points, categories):
    """
    Check if all points are reachable from the first point using BFS.
    :param grid: 2D list representing the grid layout.
    :param points: List of (x, y) coordinates.
    :param categories: List of categories corresponding to each point.
    :return: (True, None) if connected, or (False, problematic_category).
    """
    from collections import deque

    def bfs(start, grid):
        rows, cols = len(grid), len(grid[0])
        visited = [[False for _ in range(cols)] for _ in range(rows)]
        queue = deque([start])
        visited[start[0]][start[1]] = True
        reachable = set()

        while queue:
            x, y = queue.popleft()
            reachable.add((x, y))

            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:  # 4 directions
                nx, ny = x + dx, y + dy
                if 0 <= nx < rows and 0 <= ny < cols and grid[nx][ny] == 0 and not visited[nx][ny]:
                    visited[nx][ny] = True
                    queue.append((nx, ny))
        return reachable

    # Start BFS from the first point
    reachable_points = bfs(points[0], grid)

    # Check if all points are reachable
    for i, point in enumerate(points):
        if point not in reachable_points:
            return False, categories[i]  # Return problematic category
    return True, None