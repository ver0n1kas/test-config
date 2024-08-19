import sys
import yaml
from schema import Schema, SchemaError


with open("schemas/org-schema.json") as stream:
    try:
        yaml_schema = Schema(yaml.safe_load(stream))
    except yaml.YAMLError as exc:
        print(exc)

print(yaml_schema)

def validate_yaml(file_path):
    try:
        with open(file_path, 'r') as stream:
            data = yaml.safe_load(stream)
            yaml_schema.validate(data)  # Use the imported schema
    except yaml.YAMLError as exc:
        print(f"YAML Error in {file_path}: {exc}")
        return False
    except SchemaError as exc:
        print(f"Schema Error in {file_path}: {exc}")
        return False
    return True

if __name__ == "__main__":
    if not validate_yaml("api-sys-h2o-2-24678-h2o-vmware-com/Org1/Org.yml"):
            all_valid = False

    if not all_valid:
        print('Not valid')