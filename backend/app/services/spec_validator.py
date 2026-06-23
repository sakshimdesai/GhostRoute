from openapi_spec_validator import validate_spec


def validate_openapi_spec(spec_dict):
    try:
        validate_spec(spec_dict)
        return True, []
    except Exception as e:
        return False, [str(e)]