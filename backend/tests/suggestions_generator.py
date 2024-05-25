import time
import json
import os
import argparse
import sys

sys.path.append('.')
sys.path.append('utils/')
sys.path.append('text-filtering/syntactic')
sys.path.append('text-filtering/semantic')
from LLM_assistant import LLMAssistant, ITEMS_COUNT
from text_utility import Field, FieldUI, TextUtility, UserChoice


DIRECTORY_PATH = os.path.join("domain-modeling-benchmark", "evaluation domain models")
domain_models = ["aircraft manufacturing 48982a787d8d25", "conference papers 56cd5f7cf40f52", "farming 97627e23829afb"] #, "college 1dc8e791-1d0e-477c-b5c2-24e376e3f6f1", "zoological gardens e95b5ea472deb8", "registry of road vehicles 60098f15-668b-4a39-8503-285e0b51d56d"]
domain_models_name = ["aircraft-manufacturing", "conference-papers", "farming"] #, "college", "zoological-gardens", "registry-of-road-vehicles"]
DOMAIN_DESCRIPTIONS_COUNT = [3, 3, 3, 1, 1, 1]

ACTUAL_OUTPUT = "actual"
EXPECTED_OUTPUT = "expected"
TIMESTAMP_PREFIX = time.strftime('%Y-%m-%d-%H-%M-%S')

OUTPUT_DIRECTORY = "out"
OUTPUT_EXPECTED_DIRECTORY = os.path.join(OUTPUT_DIRECTORY, "expected")
OUTPUT_ACTUAL_DIRECTORY = os.path.join(OUTPUT_DIRECTORY, "actual")

# In prompt for entities output examples
# We use this list to check if the LLM is leaking the example into the actual output
CLASSES_IN_EXAMPLE = ["employee", "department", "manager"]

# Settings
CSV_SEPARATOR = ','
CSV_HEADER = f"Matches class{CSV_SEPARATOR}Matches attribute{CSV_SEPARATOR}Matches association"


def create_entities_expected_output(test_cases):

    result = []
    for test_case in test_cases:
        entity_name = test_case['entity']
        original_text = test_case[Field.ORIGINAL_TEXT.value]
        
        entity = f"Entity: {entity_name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n\n"
        result.append(entity)

    return result


def create_attributes_expected_output(test_cases):

    result = []
    for test_case in test_cases:
        entity = f"Entity: {test_case['entity']}"
        result.append(entity)

        expected_output = test_case['expected_output']

        for index, output in enumerate(expected_output):
            name = output[Field.NAME.value]
            original_text = output[Field.ORIGINAL_TEXT.value]
            entry = f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n\n"
            result.append(entry)

    return result


def create_relationships_expected_output(test_cases):

    result = []
    for test_case in test_cases:
        entity = f"Entity: {test_case['entity']}"
        result.append(entity)

        expected_output = test_case['expected_output']

        for index, output in enumerate(expected_output):
            name = output[Field.NAME.value]
            original_text = output[Field.ORIGINAL_TEXT.value]
            source_entity = output[Field.SOURCE_CLASS.value]
            target_entity = output[Field.TARGET_CLASS.value]

            entry = f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n- {FieldUI.SOURCE_ENTITY.value}: {source_entity}\n- {FieldUI.TARGET_ENTITY.value}: {target_entity}\n\n"
            result.append(entry)

    return result


def create_relationships2_expected_output(test_cases):

    result = []
    for test_case in test_cases:
        name = test_case[Field.NAME.value]
        original_text = test_case[Field.ORIGINAL_TEXT.value]
        source_entity = test_case[Field.SOURCE_CLASS.value]
        target_entity = test_case[Field.TARGET_CLASS.value]


        entry = f"{name}\n- {Field.ORIGINAL_TEXT.value}: {original_text}\n- {FieldUI.SOURCE_ENTITY.value}: {source_entity}\n- {FieldUI.TARGET_ENTITY.value}: {target_entity}\n\n"
        result.append(entry)

    return result


def generate_expected_output(test_file_path, output_file_path, user_choice):

    with open(test_file_path) as file:
        test_data = json.load(file)

    test_cases = test_data[user_choice]

    if user_choice == UserChoice.CLASSES.value:
        expected_output = create_entities_expected_output(test_cases)

    elif user_choice == UserChoice.ATTRIBUTES.value:
        expected_output = create_attributes_expected_output(test_cases)
    
    elif user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value:
        expected_output = create_relationships_expected_output(test_cases)
    
    elif user_choice == UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value:
        expected_output = create_relationships2_expected_output(test_cases)

    else:
        raise ValueError(f"Unexpected user choice: \"{user_choice}\".")
    
    with open(output_file_path, 'w') as file:
        for output in expected_output:
            file.write(f"{output}\n")


def write_outputs_to_file(file, outputs):
    for index, output in enumerate(outputs):
        write_to_file(file, index, output)


def write_to_file(file, index, output):
    file.write(f"{index + 1}) {output['name']}\n")

    for key in output:
        # We already outputed the name
        if key == "name" or key == "inference_indexes":
            continue

        file.write((f"- {key}: {output[key]}\n"))

    file.write("\n")


def create_entities_actual_output(llm_assistant, test_cases, user_choice, domain_description, is_csv_output):

    expected_entities = []
    for test_case in test_cases:
        expected_entities.append(test_case["entity"])
    
    matched_entities = 0
    total_expected_entities = len(test_cases)

    iterator = llm_assistant.suggest_items(source_class="", target_class="", user_choice=user_choice, domain_description=domain_description)
    result = []

    if is_csv_output:
        result.append(f"Generated class{CSV_SEPARATOR}{CSV_HEADER}")

    for index, suggested_item in enumerate(iterator):
        suggested_item = json.loads(suggested_item)

        entity_name = suggested_item[Field.NAME.value]

        # Warn about examples being leaked into actual output
        if entity_name in CLASSES_IN_EXAMPLE:
            print(f"Warning: {entity_name}")

        if is_csv_output:
            result.append(f"\"{entity_name}\"")
        else:
            result.append(f"Entity: {entity_name}")

        if Field.ORIGINAL_TEXT.value in suggested_item:
            original_text = suggested_item[Field.ORIGINAL_TEXT.value]
            result.append(f"Original text: {original_text}\n\n")
        else:
            if not is_csv_output:
                result.append("\n")
        
        if entity_name in expected_entities:
            matched_entities += 1
    
    print(f"Found {matched_entities} / {total_expected_entities} entities\n")

    return result


def create_attributes_actual_output(llm_assistant, test_cases, user_choice, domain_description, is_csv_output):

    result = []

    if is_csv_output:
        result.append(f"Generated attribute{CSV_SEPARATOR}Source class{CSV_SEPARATOR}Generated original text{CSV_SEPARATOR}{CSV_HEADER}")

    for test_case in test_cases:
        source_entity = test_case["entity"]

        print(f"Generating attributes for: {source_entity}")

        if not is_csv_output:
            result.append(f"Entity: {source_entity}")

        iterator = llm_assistant.suggest_items(source_class=source_entity, target_class="", user_choice=user_choice, domain_description=domain_description)

        for index, suggested_item in enumerate(iterator):
            suggested_item = json.loads(suggested_item)

            name = suggested_item[Field.NAME.value]
            original_text = suggested_item[Field.ORIGINAL_TEXT.value]

            if is_csv_output:
                original_text = original_text.replace('"', "'")
                result.append(f"\"{name}\"{CSV_SEPARATOR}\"{source_entity}\"{CSV_SEPARATOR}\"{original_text}\"")
            else:
                result.append(f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n\n")

    return result


def create_relationships_actual_output(llm_assistant, test_cases, user_choice, domain_description, is_csv_output):

    result = []

    if is_csv_output:
        result.append(f"Generated association{CSV_SEPARATOR}Inputed class{CSV_SEPARATOR}Source class{CSV_SEPARATOR}Target class{CSV_SEPARATOR}Generated original text{CSV_SEPARATOR}{CSV_HEADER}")

    for test_case in test_cases:
        inputed_entity = test_case["entity"]

        print(f"Generating associations for: {inputed_entity}")

        if not is_csv_output:
            result.append(f"Entity: {source_entity}")

        iterator = llm_assistant.suggest_items(source_class=inputed_entity, target_class="", user_choice=user_choice, domain_description=domain_description)

        for index, suggested_item in enumerate(iterator):
            suggested_item = json.loads(suggested_item)

            name = suggested_item[Field.NAME.value]

            if Field.ORIGINAL_TEXT.value in suggested_item:
                original_text = suggested_item[Field.ORIGINAL_TEXT.value]
            else:
                original_text = ""

            source_entity = suggested_item[Field.SOURCE_CLASS.value].lower()
            target_entity = suggested_item[Field.TARGET_CLASS.value].lower()

            if is_csv_output:
                original_text = original_text.replace('"', "'")
                result.append(f"\"{name}\"{CSV_SEPARATOR}\"{inputed_entity}\"{CSV_SEPARATOR}\"{source_entity}\"{CSV_SEPARATOR}\"{target_entity}\"{CSV_SEPARATOR}\"{original_text}\"")
            else:
                result.append(f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n- {FieldUI.SOURCE_ENTITY.value}: {source_entity}\n- {FieldUI.TARGET_ENTITY.value}: {target_entity}\n\n")

    return result


def create_relationships2_actual_output(llm_assistant, test_cases, user_choice, domain_description):

    result = []
    for test_case in test_cases:
        source_entity = test_case[Field.SOURCE_CLASS.value]
        target_entity = test_case[Field.TARGET_CLASS.value]

        result.append(f"Source entity: {source_entity}, Target entity: {target_entity}")
        iterator = llm_assistant.suggest_items(source_class=source_entity, target_class=target_entity, user_choice=user_choice, domain_description=domain_description)

        for index, suggested_item in enumerate(iterator):
            suggested_item = json.loads(suggested_item)

            name = suggested_item[Field.NAME.value]
            original_text = suggested_item[Field.ORIGINAL_TEXT.value]

            result.append(f"{index + 1}) {name}\n- {FieldUI.ORIGINAL_TEXT.value}: {original_text}\n\n")

    return result


def generate_actual_output(llm_assistant, domain_description, test_file_path, actual_output_file_path, user_choice, is_csv_output):

    with open(test_file_path) as file:
        test_data = json.load(file)

    test_cases = test_data[user_choice]

    if user_choice == UserChoice.CLASSES.value:
        results = create_entities_actual_output(llm_assistant, test_cases, user_choice, domain_description, is_csv_output)

    elif user_choice == UserChoice.ATTRIBUTES.value:
        results = create_attributes_actual_output(llm_assistant, test_cases, user_choice, domain_description, is_csv_output)
    
    elif user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value:
        results = create_relationships_actual_output(llm_assistant, test_cases, user_choice, domain_description, is_csv_output)
    
    elif user_choice == UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value:
        results = create_relationships2_actual_output(llm_assistant, test_cases, user_choice, domain_description)

    else:
        raise ValueError(f"Unexpected user choice: \"{user_choice}\".")
    
    with open(actual_output_file_path, 'w') as file:
        for result in results:
            file.write(f"{result}\n")


def main():

    parser = argparse.ArgumentParser(description = "Suggestions generator")
    parser.add_argument("--user_choice", choices = [UserChoice.CLASSES.value, UserChoice.ATTRIBUTES.value, UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value, UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value], type=str, default=UserChoice.CLASSES.value, help = "Choose elements to generate")
    parser.add_argument("--output_format", choices = ["txt", "csv"], type=str, default="csv", help = "Choose output file format")
    parser.add_argument("--generate_expected_output_only", action = "store_true", default=False, help = "")
    args = parser.parse_args()

    user_choice = args.user_choice
    is_generate_expected_output = args.generate_expected_output_only
    is_csv_output = args.output_format == "csv"

    if not is_generate_expected_output:
        llm_assistant = LLMAssistant()

    
    for index, domain_model in enumerate(domain_models):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            test_file_name = f"{user_choice}-expected-suggestions-0{i + 1}.json"
            test_file_path = os.path.join(DIRECTORY_PATH, domain_model, test_file_name)
            expected_output_file_path = os.path.join(OUTPUT_EXPECTED_DIRECTORY, f"{domain_models_name[index]}-{user_choice}-{EXPECTED_OUTPUT}-0{i + 1}.txt")

            if not os.path.isfile(test_file_path):
                raise ValueError(f"Test file not found: {test_file_path}")
 
            if is_generate_expected_output:

                if not os.path.exists(OUTPUT_EXPECTED_DIRECTORY):
                    os.makedirs(OUTPUT_EXPECTED_DIRECTORY)

                generate_expected_output(test_file_path, expected_output_file_path, user_choice)
                continue
            
            if not os.path.exists(OUTPUT_ACTUAL_DIRECTORY):
                os.makedirs(OUTPUT_ACTUAL_DIRECTORY)

            output_file_extension = ".csv" if is_csv_output else ".txt"
            actual_output_file_path = os.path.join(OUTPUT_ACTUAL_DIRECTORY, f"{domain_models_name[index]}-{user_choice}-{ACTUAL_OUTPUT}-0{i + 1}{output_file_extension}")
            domain_description_file_name = f"domain-description-0{i + 1}.txt"
            domain_description_path = os.path.join(DIRECTORY_PATH, domain_model, domain_description_file_name)

            if not os.path.isfile(domain_description_path):
                raise ValueError(f"Domain description not found: {domain_description_path}")

            with open(domain_description_path, 'r') as file:
                domain_description = file.read()
            
            generate_actual_output(llm_assistant, domain_description, test_file_path, actual_output_file_path, user_choice, is_csv_output)


if __name__ == "__main__":
    main()
