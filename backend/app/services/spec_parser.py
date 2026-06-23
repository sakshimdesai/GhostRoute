import re


def path_to_regex(path_pattern):

    pattern = re.sub(
        r"\{(\w+)\}",
        r"(?P<\1>[^/]+)",
        path_pattern
    )

    return re.compile(
        f"^{pattern}$"
    )


def extract_routes(spec_dict):

    routes = []

    paths = spec_dict.get(
        "paths",
        {}
    )

    for path, methods in paths.items():

        for method, operation in methods.items():

            response_schema = {}

            responses = operation.get(
                "responses",
                {}
            )

            success_response = (
                responses.get("200")
                or responses.get("201")
                or responses.get("default")
            )

            if success_response:

                content = success_response.get(
                    "content",
                    {}
                )

                app_json = content.get(
                    "application/json",
                    {}
                )

                response_schema = app_json.get(
                    "schema",
                    {}
                )

            routes.append({
                "path": path,
                "method": method.upper(),
                "response_schema": response_schema,
                "path_regex": path_to_regex(path)
            })

    return routes