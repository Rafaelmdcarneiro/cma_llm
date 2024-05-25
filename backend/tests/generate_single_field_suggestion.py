import sys
sys.path.append('.')
from LLM_assistant import LLMAssistant
import json
import os

PATH_TO_DATA_DIRECTORY = os.path.join("data", "56-2001-extract-llm-assistant-test-case")
INPUT_DOMAIN_DESCRIPTION_FILE_PATH = os.path.join(PATH_TO_DATA_DIRECTORY, "56-2001-extract-llm-assistant-test-case.txt")
OUTPUT_FILE_PATH = os.path.join(PATH_TO_DATA_DIRECTORY, "descriptions.txt")

def main():
    llm_assistant = LLMAssistant()

    # Test case 1
    attribute_name = "engine power"
    source_entity = "engine"
    with open(INPUT_DOMAIN_DESCRIPTION_FILE_PATH, 'r') as file:
        domain_description = file.read()

    items_iterator = llm_assistant.get_field_content(attribute_name, source_entity, domain_description)

    with open(OUTPUT_FILE_PATH, 'w') as file:
        file.write(f"Attribute name: {attribute_name}")
        file.write(f"- entity: {source_entity}")
        for item in items_iterator:
            suggested_item = json.loads(item)
            description = suggested_item["description"]
            file.write(f"- description: {description}")


if __name__ == "__main__":
    main()