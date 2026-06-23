import re

def match_route(routes, incoming_path, incoming_method):

    for route in routes:

        if route["method"] != incoming_method:
            continue

        pattern = re.sub(
            r"\{[^/]+\}",
            r"[^/]+",
            route["path"]
        )

        pattern = "^" + pattern + "$"

        if re.match(pattern, incoming_path):
            return route

    return None