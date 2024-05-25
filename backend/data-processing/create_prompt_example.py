import os
import json
import sys

sys.path.append('.')
from text_utility import Field, FieldUI, UserChoice


DIRECTORY_PATH = os.path.join("domain-modeling-benchmark", "prompting domain models")
MODEL_NAME = "company employees 4ffd4466-50ec-4d98-b2c1-c3fdba90a65c"
FILE_NAME = "domain-description-01-annotated.txt"

ENTITIES_IN_FILE_PATH = os.path.join(DIRECTORY_PATH, MODEL_NAME, "entities-expected-suggestions-01.json")
ATTRIBUTES_IN_FILE_PATH = os.path.join(DIRECTORY_PATH, MODEL_NAME, "attributes-expected-suggestions-01.json")
RELATIONSHIPS1_IN_FILE_PATH = os.path.join(DIRECTORY_PATH, MODEL_NAME, "relationships-expected-suggestions-01.json")
RELATIONSHIPS2_IN_FILE_PATH = os.path.join(DIRECTORY_PATH, MODEL_NAME, "relationships2-expected-suggestions-01.json")

ENTITIES_OUTPUT_FILE_PATH = os.path.join(DIRECTORY_PATH, MODEL_NAME, "entities-prompt-example.txt")
ATTRIBUTES_OUTPUT_FILE_PATH = os.path.join(DIRECTORY_PATH, MODEL_NAME, "attributes-prompt-example.txt")
RELATIONSHIPS1_OUTPUT_FILE_PATH = os.path.join(DIRECTORY_PATH, MODEL_NAME, "relationships-prompt-example.txt")
RELATIONSHIPS2_OUTPUT_FILE_PATH = os.path.join(DIRECTORY_PATH, MODEL_NAME, "relationships2-prompt-example.txt")


def get_entities_examples(expected_suggestions):

    result = []

    entities = expected_suggestions[UserChoice.ENTITIES.value]

    for entity in entities:
        entity_name = entity["entity"]
        original_text = entity[Field.ORIGINAL_TEXT.value]
        result.append(f"{FieldUI.NAME.value}: {entity_name}")
        result.append(f"{FieldUI.ORIGINAL_TEXT.value}: {original_text}")

        # We cannot use dictionary and `json.dumps(dictionary)` because we want to specify the ordering of the elements
        # dictionary = { Field.NAME.value: entity_name, Field.ORIGINAL_TEXT.value: original_text }
        # print(json.dumps(dictionary))

        JSON_object = f"\"{Field.NAME.value}\": \"{entity_name}\", \"{Field.ORIGINAL_TEXT.value}\": \"{original_text}\""
        result.append("JSON object: {" + JSON_object + "}\n")

    return result


def get_attributes_examples(expected_suggestions):

    result = []

    expected_suggestions = expected_suggestions[UserChoice.ATTRIBUTES.value]

    for suggestion in expected_suggestions:
        source_entity = suggestion["entity"]
        expected_output = suggestion["expected_output"]
        result.append(f"---- Example for entity: {source_entity} ----")

        for output in expected_output:
            name = output[Field.NAME.value]
            original_text = output[Field.ORIGINAL_TEXT.value]

            result.append(f"context: {original_text}")
            result.append(f"name: {name}")

            JSON_object = f"\"{Field.ORIGINAL_TEXT.value}\": \"{original_text}\", \"{Field.NAME.value}\": \"{name}\""
            result.append("JSON object: {" + JSON_object + "}\n")
        
        result.append("")

    return result


def get_relationships1_examples(expected_suggestions):

    result = []
    expected_suggestions = expected_suggestions[UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value]

    for suggestion in expected_suggestions:
        source_entity = suggestion["entity"]
        expected_output = suggestion["expected_output"]
        result.append(f"---- Example for entity: {source_entity} ----")

        for output in expected_output:
            name = output[Field.NAME.value]
            original_text = output[Field.ORIGINAL_TEXT.value]
            source_entity = output[Field.SOURCE_CLASS.value]
            target_entity = output[Field.TARGET_CLASS.value]

            result.append(f"context: {original_text}")
            result.append(f"name: {name}")
            result.append(f"source entity: {source_entity}")
            result.append(f"target entity: {target_entity}")

            JSON_object = f"\"{Field.ORIGINAL_TEXT.value}\": \"{original_text}\", \"{Field.NAME.value}\": \"{name}\", \"{Field.SOURCE_CLASS.value}\": \"{source_entity}\", \"{Field.TARGET_CLASS.value}\": \"{target_entity}\""
            result.append("JSON object: {" + JSON_object + "}\n")

        result.append("")

    return result


def get_relationships2_examples(expected_suggestions):

    result = []
    expected_suggestions = expected_suggestions[UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value]

    for suggestion in expected_suggestions:

        name = suggestion[Field.NAME.value]
        original_text = suggestion[Field.ORIGINAL_TEXT.value]
        source_entity = suggestion[Field.SOURCE_CLASS.value]
        target_entity = suggestion[Field.TARGET_CLASS.value]

        result.append(f"context: {original_text}")
        result.append(f"name: {name}")
        result.append(f"source entity: {source_entity}")
        result.append(f"target entity: {target_entity}")

        JSON_object = f"\"{Field.ORIGINAL_TEXT.value}\": \"{original_text}\", \"{Field.NAME.value}\": \"{name}\", \"{Field.SOURCE_CLASS.value}\": \"{source_entity}\", \"{Field.TARGET_CLASS.value}\": \"{target_entity}\""
        result.append("JSON object: {" + JSON_object + "}\n")

    return result


def load_expected_suggestions_from_file(input_file_path):
    with open(input_file_path, 'r') as file:
        examples = json.load(file)

    return examples


def write_examples_to_file(output_file_path, examples):
    with open(output_file_path, 'w') as file:
        for example in examples:
            file.write(f"{example}\n")

    return


def main():

    entities_expected = load_expected_suggestions_from_file(ENTITIES_IN_FILE_PATH)
    attributes_expected = load_expected_suggestions_from_file(ATTRIBUTES_IN_FILE_PATH)
    relationships1_expected = load_expected_suggestions_from_file(RELATIONSHIPS1_IN_FILE_PATH)
    relationships2_expected = load_expected_suggestions_from_file(RELATIONSHIPS2_IN_FILE_PATH)
    
    entities_examples = get_entities_examples(entities_expected)
    attributes_examples = get_attributes_examples(attributes_expected)
    relationships1_examples = get_relationships1_examples(relationships1_expected)
    relationships2_examples = get_relationships2_examples(relationships2_expected)

    write_examples_to_file(ENTITIES_OUTPUT_FILE_PATH, entities_examples)
    write_examples_to_file(ATTRIBUTES_OUTPUT_FILE_PATH, attributes_examples)
    write_examples_to_file(RELATIONSHIPS1_OUTPUT_FILE_PATH, relationships1_examples)
    write_examples_to_file(RELATIONSHIPS2_OUTPUT_FILE_PATH, relationships2_examples)

if __name__ == "__main__":
    main()