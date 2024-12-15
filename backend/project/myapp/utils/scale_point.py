def scale_point(point, max_x, max_y, grid_size):
            # try:
                print("Point:",point,"Type of point[0]:",type(point[0]),"Type of point[1]:",type(point[1]))
                x,y = point
                scale_x = grid_size / float(max_x)
                scale_y = grid_size / float(max_y)
                scaled_x = int(round(float(x) * scale_x))
                scaled_y = int(round(float(y) * scale_y))
                return scaled_x,scaled_y
            # except (ValueError, TypeError) as e:
                # print(f"Error in scale_point: {e}, point: {point}")