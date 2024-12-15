from abc import ABC, abstractmethod
from itertools import permutations

class NavigationStrategy(ABC):
    @abstractmethod
    def calculate_path(self, points):
        pass

class TSPNavigation(NavigationStrategy):
    def calculate_path(self, points):
        best_path = None
        min_distance = float('inf')

        for perm in permutations(points):
            distance = sum(
                abs(perm[i][0] - perm[i + 1][0]) + abs(perm[i][1] - perm[i + 1][1])
                for i in range(len(perm) - 1)
            )
            if distance < min_distance:
                min_distance = distance
                best_path = perm

        return best_path