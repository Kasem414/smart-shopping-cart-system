class PathfindingContext:
    def __init__(self, strategy):
        self.strategy = strategy

    def set_strategy(self, strategy):
        self.strategy = strategy

    def calculate_path(self, grid, start, goal):
        return self.strategy.find_path(grid, start, goal)


class NavigationContext:
    def __init__(self, strategy):
        self.strategy = strategy

    def set_strategy(self, strategy):
        self.strategy = strategy

    def calculate_navigation(self, points):
        return self.strategy.calculate_path(points)