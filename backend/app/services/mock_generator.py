import random


def generate_mock_response(schema):

    if not schema:
        return {
            "message": "Mock Response Generated"
        }

    schema_type = schema.get("type")

    if schema_type == "string":
        return "sample_text"

    if schema_type == "integer":
        return random.randint(1, 100)

    if schema_type == "number":
        return round(random.uniform(1, 100), 2)

    if schema_type == "boolean":
        return True

    if schema_type == "array":
        items_schema = schema.get("items", {})
        return [
            generate_mock_response(items_schema)
        ]

    if schema_type == "object":

        result = {}

        properties = schema.get("properties", {})

        for field, field_schema in properties.items():
            result[field] = generate_mock_response(field_schema)

        return result

    return {}