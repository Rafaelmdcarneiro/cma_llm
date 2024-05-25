import csv
import json
import os
import sys

sys.path.append('utils/')
sys.path.append('backend/utils/')
from text_utility import UserChoice


INPUT_DIRECTORY_PATH = os.path.join("backend/domain-modeling-benchmark", "evaluation domain models")
domain_models = ["aircraft manufacturing 48982a787d8d25", "conference papers 56cd5f7cf40f52", "farming 97627e23829afb", "college 1dc8e791-1d0e-477c-b5c2-24e376e3f6f1", "zoological gardens e95b5ea472deb8", "registry of road vehicles 60098f15-668b-4a39-8503-285e0b51d56d"]

OUTPUT_DIRECTORY_PATH = os.path.join("backend", "out", "evaluated", "actual")
domain_models_name = ["aircraft-manufacturing", "conference-papers", "farming", "college", "zoological-gardens", "registry-of-road-vehicles"]

DOMAIN_DESCRIPTIONS_COUNT = [3, 3, 3, 1, 1, 1]
DOMAIN_TEXTS_COUNT = 12

IS_CSV = True
SEPARATOR = ','
SCORE_LENGTH = DOMAIN_TEXTS_COUNT + 1

expected_classes, expected_attributes, expected_associations = [], [], []

checked_classes_strict, checked_classes_construct, checked_classes_isa, checked_classes_list = [], [], [], []
checked_attributes_strict, checked_attributes_construct, checked_attributes_isa, checked_attributes_list = [], [], [], []
checked_associations_strict, checked_associations_construct, checked_associations_isa, checked_associations_list = [], [], [], []

# Indexes correspond to texts in domain models and last index corresponds to all texts together
recall_classes_strict = [0] * SCORE_LENGTH
recall_attributes_strict = [0] * SCORE_LENGTH
recall_associations_strict = [0] * SCORE_LENGTH

recall_classes_construct = [0] * SCORE_LENGTH
recall_attributes_construct = [0] * SCORE_LENGTH
recall_associations_construct = [0] * SCORE_LENGTH

recall_classes_isa = [0] * SCORE_LENGTH
recall_attributes_isa = [0] * SCORE_LENGTH
recall_associations_isa = [0] * SCORE_LENGTH

recall_classes_list = [0] * SCORE_LENGTH
recall_attributes_list = [0] * SCORE_LENGTH
recall_associations_list = [0] * SCORE_LENGTH

recall_classes_max = [0] * SCORE_LENGTH
recall_attributes_max = [0] * SCORE_LENGTH
recall_associations_max = [0] * SCORE_LENGTH


# TODO: Add reference to reasoning why we compute this types of recall and precision
precision_classes_strict = [0] * SCORE_LENGTH
precision_attributes_strict = [0] * SCORE_LENGTH
precision_associations_strict = [0] * SCORE_LENGTH

precision_classes_construct = [0] * SCORE_LENGTH
precision_attributes_construct = [0] * SCORE_LENGTH
precision_associations_construct = [0] * SCORE_LENGTH

precision_classes_isa = [0] * SCORE_LENGTH
precision_attributes_isa = [0] * SCORE_LENGTH
precision_associations_isa = [0] * SCORE_LENGTH

precision_classes_list = [0] * SCORE_LENGTH
precision_attributes_list = [0] * SCORE_LENGTH
precision_associations_list = [0] * SCORE_LENGTH

precision_classes_max = [0] * SCORE_LENGTH
precision_attributes_max = [0] * SCORE_LENGTH
precision_associations_max = [0] * SCORE_LENGTH


def get_domain_model_index(text_index):

    domain_model_index = 0
    for count in DOMAIN_DESCRIPTIONS_COUNT:
        text_index -= count

        if (text_index < 0):
            return domain_model_index
        
        domain_model_index += 1


def construct_expected_elements(test_data_path_classes, test_data_path_attributes, test_data_path_associations):

    construct_expected_classes(test_data_path_classes)
    construct_expected_attributes(test_data_path_attributes)
    construct_expected_associations(test_data_path_associations)


def construct_expected_classes(test_data_path):

    global expected_classes
    global checked_classes_strict, checked_classes_construct, checked_classes_isa, checked_classes_list

    with open(test_data_path) as file:
        test_data = json.load(file)
    
    expected_classes = []
    test_cases = test_data[UserChoice.CLASSES.value]

    for test_case in test_cases:
        expected_classes.append(test_case["class"].replace(' ', '-').lower())
    
    checked_classes_strict = [False] * len(expected_classes)
    checked_classes_construct = [False] * len(expected_classes)
    checked_classes_isa = [False] * len(expected_classes)
    checked_classes_list = [False] * len(expected_classes)



def construct_expected_attributes(test_data_path):

    global expected_attributes
    global checked_attributes_strict, checked_attributes_construct, checked_attributes_isa, checked_attributes_list

    with open(test_data_path) as file:
        test_data = json.load(file)

    expected_attributes = []
    test_cases = test_data["attributes"]

    for test_case in test_cases:
        expected_output = test_case["expected_output"]
        source_entity = test_case["class"]

        for output in expected_output:
            attribute_identificator = f"{output['name']};{source_entity}".replace(' ', '-').lower()
            expected_attributes.append(attribute_identificator)
    
    checked_attributes_strict = [False] * len(expected_attributes)
    checked_attributes_construct = [False] * len(expected_attributes)
    checked_attributes_isa = [False] * len(expected_attributes)
    checked_attributes_list = [False] * len(expected_attributes)


def construct_expected_associations(test_data_path):

    global expected_associations
    global checked_associations_strict, checked_associations_construct, checked_associations_isa, checked_associations_list


    with open(test_data_path) as file:
        test_data = json.load(file)

    expected_associations = []
    test_cases = test_data[UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value]

    for test_case in test_cases:
        expected_output = test_case["expected_output"]
        inputed_entity = test_case["class"]

        for output in expected_output:
            expected_associations.append(f"{output['name']};{inputed_entity}".replace(' ', '-').lower())
    
    checked_associations_strict = [False] * len(expected_associations)
    checked_associations_construct = [False] * len(expected_associations)
    checked_associations_isa = [False] * len(expected_associations)
    checked_associations_list = [False] * len(expected_associations)


def check_suggestion(user_choice, matched_user_choice, matched_element, evaluated_path, source_class=""):

    global checked_classes_strict, checked_classes_construct, checked_classes_isa, checked_classes_list
    global checked_attributes_strict, checked_attributes_construct, checked_attributes_isa, checked_attributes_list
    global checked_associations_strict, checked_associations_construct, checked_associations_isa, checked_associations_list
    global expected_classes, expected_attributes, expected_associations

    if matched_element == "" or matched_element == "*":
        return

    if matched_user_choice == UserChoice.CLASSES.value:
        checked_element_strict, checked_element_construct, checked_element_isa, checked_element_list = checked_classes_strict, checked_classes_construct, checked_classes_isa, checked_classes_list
        expected_elements = expected_classes

    elif matched_user_choice == UserChoice.ATTRIBUTES.value:
        checked_element_strict, checked_element_construct, checked_element_isa, checked_element_list = checked_attributes_strict, checked_attributes_construct, checked_attributes_isa, checked_attributes_list
        expected_elements = expected_attributes

    elif matched_user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value:
        checked_element_strict, checked_element_construct, checked_element_isa, checked_element_list = checked_associations_strict, checked_associations_construct, checked_associations_isa, checked_associations_list
        expected_elements = expected_associations
    else:
        raise ValueError(f"Received unexpected user choice: {user_choice}")


    elements_to_check = [matched_element]
    is_list = ';' in matched_element or matched_element.startswith('-')
    if is_list:
        elements_to_check = matched_element.split(';')

    
    is_match_found = [False] * len(elements_to_check)

    
    for element_index, element in enumerate(elements_to_check):

        if is_match_found[element_index]:
            continue

        if element.startswith('-'):
            element = element[1:]

        is_isa = element.startswith(':')
        if is_isa:
            element = element[1:]

        if user_choice == UserChoice.CLASSES.value or matched_user_choice == UserChoice.CLASSES.value:
            matched_element_id = element.replace(' ', '-').lower()
        else:
            if is_isa:
                matched_element_id = element.replace(' ', '-').lower()
            else:
                matched_element_id = f"{element};{source_class}".replace(' ', '-').lower()


        for i, expected_element in enumerate(expected_elements):

            # Attributes and associations have source classes in their ID
            # However, class does not have source class in its ID so when class matches some attribute and association
            # we need to remove this source class from ID
            if (user_choice == UserChoice.CLASSES.value and matched_user_choice != UserChoice.CLASSES.value) or is_isa:
                expected_element = expected_element.split(';')[0]

            if expected_element != matched_element_id:
                continue

            if is_list:
                checked_element_list[i] = True
                is_match_found[element_index] = True
                break

            if is_isa:
                checked_element_isa[i] = True
                checked_element_list[i] = True
                is_match_found[element_index] = True
                break

            if user_choice != matched_user_choice:
                checked_element_construct[i] = True
                checked_element_isa[i] = True
                checked_element_list[i] = True
                is_match_found[element_index] = True
                break

            checked_element_strict[i] = True
            checked_element_construct[i] = True
            checked_element_isa[i] = True
            checked_element_list[i] = True
            is_match_found[element_index] = True


    for is_match in is_match_found:

        if is_match or element == '*':
            continue

        is_isa_match = False
        if not is_match:
            # print(f"Element not found: {element}\n- original matches element: {matched_element}\n- source class: {source_class}\n- user choice: {user_choice}\n- matched column: {matched_user_choice}\nfile: {evaluated_path}\n")

            # Element is not found = either typo or source class of the element does not correspond => set `is_isa` to True

            for i, expected_element in enumerate(expected_elements):

                expected_element = expected_element.split(';')[0]
                matched_element_id = matched_element_id.split(';')[0]

                if expected_element != matched_element_id:
                    continue

                if is_list:
                    checked_element_list[i] = True
                    is_isa_match = True
                    break

                if is_isa:
                    checked_element_isa[i] = True
                    checked_element_list[i] = True
                    is_isa_match = True
                    break

                if user_choice != matched_user_choice:
                    checked_element_construct[i] = True
                    checked_element_isa[i] = True
                    checked_element_list[i] = True
                    is_isa_match = True
                    break

                checked_element_strict[i] = True
                checked_element_construct[i] = True
                checked_element_isa[i] = True
                checked_element_list[i] = True
                is_isa_match = True

        if not is_isa_match:
            print(f"Element still not found: {element}\n- original matches element: {matched_element}\n- source class: {source_class}\n- user choice: {user_choice}\n- matched column: {matched_user_choice}\nfile: {evaluated_path}\n")


def compute_precision(user_choice, text_index, matched_class, matched_attribute, matched_association):

    global precision_classes_strict, precision_classes_construct, precision_classes_isa, precision_classes_list, precision_classes_max
    global precision_attributes_strict, precision_attributes_construct, precision_attributes_isa, precision_attributes_list, precision_attributes_max
    global precision_associations_strict, precision_associations_construct, precision_associations_isa, precision_associations_list, precision_associations_max

    if user_choice == UserChoice.CLASSES.value:
        precision_elements_strict, precision_elements_construct, precision_elements_isa, precision_elements_list, precision_elements_max = precision_classes_strict, precision_classes_construct, precision_classes_isa, precision_classes_list, precision_classes_max

    elif user_choice == UserChoice.ATTRIBUTES.value:
        precision_elements_strict, precision_elements_construct, precision_elements_isa, precision_elements_list, precision_elements_max = precision_attributes_strict, precision_attributes_construct, precision_attributes_isa, precision_attributes_list, precision_attributes_max

    elif user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value:
        precision_elements_strict, precision_elements_construct, precision_elements_isa, precision_elements_list, precision_elements_max = precision_associations_strict, precision_associations_construct, precision_associations_isa, precision_associations_list, precision_associations_max


    precision_elements_list[-1] += 1
    precision_elements_list[text_index] += 1

    is_class_list = matched_class.startswith('+') or matched_class.startswith('-')
    is_attribute_list = matched_attribute.startswith('+') or matched_attribute.startswith('-')
    is_association_list = matched_association.startswith('+') or matched_association.startswith('-')

    is_class_isa = matched_class.startswith(':')
    is_attribute_isa = matched_attribute.startswith(':')
    is_association_isa = matched_association.startswith(':')

    is_strict_class = not is_class_list and not is_class_isa and matched_class != ""
    is_strict_attribute = not is_attribute_list and not is_attribute_isa and matched_attribute != ""
    is_strict_association = not is_association_list and not is_association_isa and matched_association != ""

    # is_not_construct = is_strict_attribute or is_strict_association
    is_not_construct = (user_choice != UserChoice.CLASSES.value and is_strict_class) or (user_choice != UserChoice.ATTRIBUTES.value and is_strict_attribute) or (user_choice != UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value and is_strict_association)

    is_isa = is_not_construct and (is_class_isa or is_attribute_isa or is_association_isa)

    is_strict = (user_choice == UserChoice.CLASSES.value and is_strict_class) or (user_choice == UserChoice.ATTRIBUTES.value and is_strict_attribute) or (user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value and is_strict_association)

    if is_strict:
        precision_elements_strict[-1] += 1
        precision_elements_strict[text_index] += 1
        precision_elements_construct[-1] += 1
        precision_elements_construct[text_index] += 1
        precision_elements_isa[-1] += 1
        precision_elements_isa[text_index] += 1

    elif is_not_construct:
        precision_elements_construct[-1] += 1
        precision_elements_construct[text_index] += 1
        precision_elements_isa[-1] += 1
        precision_elements_isa[text_index] += 1

    elif is_isa:
        precision_elements_isa[-1] += 1
        precision_elements_isa[text_index] += 1


def evaluate_classes(evaluated_path, text_index):

    with open(evaluated_path, "r", newline="") as file:
        reader = csv.reader(file, delimiter=SEPARATOR)
        for index, row in enumerate(reader):
            if index == 0 or len(row) == 0:
                continue

            # TODO: Make enum to give each row a name
            matched_class = row[1]
            matched_attribute = row[2]
            matched_association = row[3]

            precision_classes_max[-1] += 1
            precision_classes_max[text_index] += 1

            if matched_class == "" and matched_attribute == "" and matched_association == "":
                continue

            compute_precision(UserChoice.CLASSES.value, text_index, matched_class, matched_attribute, matched_association)

            # Check if suggested class matches some expected class
            check_suggestion(UserChoice.CLASSES.value, UserChoice.CLASSES.value, matched_class, evaluated_path)
            
            # Check if suggested class matches some expected attribute
            check_suggestion(UserChoice.CLASSES.value, UserChoice.ATTRIBUTES.value, matched_attribute, evaluated_path)

            # Check if suggested class matches some expected association
            check_suggestion(UserChoice.CLASSES.value, UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value, matched_association, evaluated_path)


def evaluate_attributes(evaluated_path, text_index):

    with open(evaluated_path, "r", newline="") as file:
        reader = csv.reader(file, delimiter=SEPARATOR)
        for index, row in enumerate(reader):
            if index == 0 or len(row) == 0:
                continue

            source_class = row[1]
            matched_class = row[3]
            matched_attribute = row[4]
            matched_association = row[5]

            precision_attributes_max[-1] += 1
            precision_attributes_max[text_index] += 1

            if matched_class == "" and matched_attribute == "" and matched_association == "":
                continue

            compute_precision(UserChoice.ATTRIBUTES.value, text_index, matched_class, matched_attribute, matched_association)

            # Check if suggested attribute matches some expected class
            check_suggestion(UserChoice.ATTRIBUTES.value, UserChoice.CLASSES.value, matched_class, evaluated_path, source_class=source_class)
            
            # Check if suggested attribute matches some expected attribute
            check_suggestion(UserChoice.ATTRIBUTES.value, UserChoice.ATTRIBUTES.value, matched_attribute, evaluated_path, source_class=source_class)

            # Check if suggested attribute matches some expected association
            check_suggestion(UserChoice.ATTRIBUTES.value, UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value, matched_association, evaluated_path, source_class=source_class)


def evaluate_associations(evaluated_path, text_index):

    with open(evaluated_path, "r", newline="") as file:
        reader = csv.reader(file, delimiter=SEPARATOR)
        for index, row in enumerate(reader):
            if index == 0 or len(row) == 0:
                continue

            inputed_entity = row[1]
            matched_class = row[5]
            matched_attribute = row[6]
            matched_association = row[7]

            precision_associations_max[-1] += 1
            precision_associations_max[text_index] += 1

            if matched_class == "" and matched_attribute == "" and matched_association == "":
                continue

            compute_precision(UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value, text_index, matched_class, matched_attribute, matched_association)

            # Check if suggested association matches some expected class
            check_suggestion(UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value, UserChoice.CLASSES.value, matched_class, evaluated_path, source_class=inputed_entity)
            
            # Check if suggested association matches some expected attribute
            check_suggestion(UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value, UserChoice.ATTRIBUTES.value, matched_attribute, evaluated_path, source_class=inputed_entity)

            # Check if suggested association matches some expected association
            check_suggestion(UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value, UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value, matched_association, evaluated_path, source_class=inputed_entity)


def check_file(path, user_choice):

    if not os.path.isfile(path):
        print(f"Stopping: {user_choice.capitalize()} evaluated file not found: {path}\n")
        return False
    return True


def compute_recall_wrapper(text_index):

    compute_recall(UserChoice.CLASSES.value, text_index)
    compute_recall(UserChoice.ATTRIBUTES.value, text_index)
    compute_recall(UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value, text_index)


def compute_recall(user_choice, text_index):

    global checked_classes_strict, checked_classes_construct, checked_associations_isa, checked_classes_list
    global checked_attributes_strict, checked_attributes_construct, checked_associations_isa, checked_attributes_list
    global checked_associations_strict, checked_associations_construct, checked_associations_isa, checked_associations_list
    global recall_classes_strict, recall_classes_construct, recall_classes_isa, recall_classes_list, recall_classes_max
    global recall_attributes_strict, recall_attributes_construct, recall_attributes_isa, recall_attributes_list, recall_attributes_max
    global recall_associations_strict, recall_associations_construct, recall_associations_isa, recall_associations_list, recall_associations_max

    if user_choice == UserChoice.CLASSES.value:
        checked_element_strict, checked_element_construct, checked_element_isa, checked_element_list = checked_classes_strict, checked_classes_construct, checked_classes_isa, checked_classes_list
        recall_strict, recall_construct, recall_isa, recall_list, recall_max = recall_classes_strict, recall_classes_construct, recall_classes_isa, recall_classes_list, recall_classes_max

    elif user_choice == UserChoice.ATTRIBUTES.value:
        checked_element_strict, checked_element_construct, checked_element_isa, checked_element_list = checked_attributes_strict, checked_attributes_construct, checked_attributes_isa, checked_attributes_list
        recall_strict, recall_construct, recall_isa, recall_list, recall_max = recall_attributes_strict, recall_attributes_construct, recall_attributes_isa, recall_attributes_list, recall_attributes_max

    elif user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value:
        checked_element_strict, checked_element_construct, checked_element_isa, checked_element_list = checked_associations_strict, checked_associations_construct, checked_associations_isa, checked_associations_list
        recall_strict, recall_construct, recall_isa, recall_list, recall_max = recall_associations_strict, recall_associations_construct, recall_associations_isa, recall_associations_list, recall_associations_max

    else:
        raise ValueError(f"Received unexpected user choice: {user_choice}")
    
    for checked_element in checked_element_strict:
        if checked_element:
            recall_strict[-1] += 1
            recall_strict[text_index] += 1

        recall_max[-1] += 1
        recall_max[text_index] += 1
    
    for checked_element in checked_element_construct:
        if checked_element:
            recall_construct[-1] += 1
            recall_construct[text_index] += 1

    for checked_element in checked_element_isa:
        if checked_element:
            recall_isa[-1] += 1
            recall_isa[text_index] += 1
    
    for checked_element in checked_element_list:
        if checked_element:
            recall_list[-1] += 1
            recall_list[text_index] += 1


def print_recall(index, is_csv):

    recall_classes_strict_percentage = (recall_classes_strict[index] / recall_classes_max[index])
    recall_classes_construct_percentage = (recall_classes_construct[index] / recall_classes_max[index])
    recall_classes_isa_percentage = (recall_classes_isa[index] / recall_classes_max[index])
    recall_classes_list_percentage = (recall_classes_list[index] / recall_classes_max[index])

    recall_attributes_strict_percentage = (recall_attributes_strict[index] / recall_attributes_max[index])
    recall_attributes_construct_percentage = (recall_attributes_construct[index] / recall_attributes_max[index])
    recall_attributes_isa_percentage = (recall_attributes_isa[index] / recall_attributes_max[index])
    recall_attributes_list_percentage = (recall_attributes_list[index] / recall_attributes_max[index])

    recall_associations_strict_percentage = (recall_associations_strict[index] / recall_associations_max[index])
    recall_associations_construct_percentage = (recall_associations_construct[index] / recall_associations_max[index])
    recall_associations_isa_percentage = (recall_associations_isa[index] / recall_associations_max[index])
    recall_associations_list_percentage = (recall_associations_list[index] / recall_associations_max[index])

    if is_csv:
        row_classes = "{:.2f}".format(recall_classes_strict_percentage) + ',' + "{:.2f}".format(recall_classes_construct_percentage) + ',' + "{:.2f}".format(recall_classes_isa_percentage) + ',' + "{:.2f}".format(recall_classes_list_percentage)
        row_attributes = "{:.2f}".format(recall_attributes_strict_percentage) + ',' + "{:.2f}".format(recall_attributes_construct_percentage) + ',' + "{:.2f}".format(recall_attributes_isa_percentage) + ',' + "{:.2f}".format(recall_attributes_list_percentage)
        row_associations = "{:.2f}".format(recall_associations_strict_percentage) + ',' + "{:.2f}".format(recall_associations_construct_percentage) + ',' + "{:.2f}".format(recall_associations_isa_percentage) + ',' + "{:.2f}".format(recall_associations_list_percentage)
        print(f"{row_classes},{row_attributes},{row_associations}", end="")
        return

    print("Recall: strict")
    print(f"- classes: {recall_classes_strict[index]}/{recall_classes_max[index]} - " + "{:.2f}".format(recall_classes_strict_percentage))
    print(f"- attributes: {recall_attributes_strict[index]}/{recall_attributes_max[index]} - " + "{:.2f}".format(recall_attributes_strict_percentage))
    print(f"- associations: {recall_associations_strict[index]}/{recall_associations_max[index]} - " + "{:.2f}".format(recall_associations_strict_percentage))
    print()

    print("Recall: construct")
    print(f"- classes: {recall_classes_construct[index]}/{recall_classes_max[index]} - " + "{:.2f}".format(recall_classes_construct_percentage))
    print(f"- attributes: {recall_attributes_construct[index]}/{recall_attributes_max[index]} - " + "{:.2f}".format(recall_attributes_construct_percentage))
    print(f"- associations: {recall_associations_construct[index]}/{recall_associations_max[index]} - " + "{:.2f}".format(recall_associations_construct_percentage))
    print()

    print("Recall: isa")
    print(f"- classes: {recall_classes_isa[index]}/{recall_classes_max[index]} - " + "{:.2f}".format(recall_classes_isa_percentage))
    print(f"- attributes: {recall_attributes_isa[index]}/{recall_attributes_max[index]} - " + "{:.2f}".format(recall_attributes_isa_percentage))
    print(f"- associations: {recall_associations_isa[index]}/{recall_associations_max[index]} - " + "{:.2f}".format(recall_associations_isa_percentage))
    print()

    print("Recall: list")
    print(f"- classes: {recall_classes_list[index]}/{recall_classes_max[index]} - " + "{:.2f}".format(recall_classes_list_percentage))
    print(f"- attributes: {recall_attributes_list[index]}/{recall_attributes_max[index]} - " + "{:.2f}".format(recall_attributes_list_percentage))
    print(f"- associations: {recall_associations_list[index]}/{recall_associations_max[index]} - " + "{:.2f}".format(recall_associations_list_percentage) + "\n\n")


def print_precision(index, is_csv):

    precision_classes_strict_percentage = (precision_classes_strict[index] / precision_classes_max[index])
    precision_classes_construct_percentage = (precision_classes_construct[index] / precision_classes_max[index])
    precision_classes_isa_percentage = (precision_classes_isa[index] / precision_classes_max[index])
    precision_classes_list_percentage = (precision_classes_list[index] / precision_classes_max[index])

    precision_attributes_strict_percentage = (precision_attributes_strict[index] / precision_attributes_max[index])
    precision_attributes_construct_percentage = (precision_attributes_construct[index] / precision_attributes_max[index])
    precision_attributes_isa_percentage = (precision_attributes_isa[index] / precision_attributes_max[index])
    precision_attributes_list_percentage = (precision_attributes_list[index] / precision_attributes_max[index])

    precision_associations_strict_percentage = (precision_associations_strict[index] / precision_associations_max[index])
    precision_associations_construct_percentage = (precision_associations_construct[index] / precision_associations_max[index])
    precision_associations_isa_percentage = (precision_associations_isa[index] / precision_associations_max[index])
    precision_associations_list_percentage = (precision_associations_list[index] / precision_associations_max[index])

    if is_csv:
        row_classes = "{:.2f}".format(precision_classes_strict_percentage) + ',' + "{:.2f}".format(precision_classes_construct_percentage) + ',' + "{:.2f}".format(precision_classes_isa_percentage) + ',' + "{:.2f}".format(precision_classes_list_percentage)
        row_attributes = "{:.2f}".format(precision_attributes_strict_percentage) + ',' + "{:.2f}".format(precision_attributes_construct_percentage) + ',' + "{:.2f}".format(precision_attributes_isa_percentage) + ',' + "{:.2f}".format(precision_attributes_list_percentage)
        row_associations = "{:.2f}".format(precision_associations_strict_percentage) + ',' + "{:.2f}".format(precision_associations_construct_percentage) + ',' + "{:.2f}".format(precision_associations_isa_percentage) + ',' + "{:.2f}".format(precision_associations_list_percentage)
        print(f",{row_classes},{row_attributes},{row_associations}")
        return

    print("Precision: strict")
    print(f"- classes: {precision_classes_strict[index]}/{precision_classes_max[index]} - " + "{:.2f}".format(precision_classes_strict_percentage) )
    print(f"- attributes: {precision_attributes_strict[index]}/{precision_attributes_max[index]} - " + "{:.2f}".format(precision_attributes_strict_percentage) )
    print(f"- associations: {precision_associations_strict[index]}/{precision_associations_max[index]} - " + "{:.2f}".format(precision_associations_strict_percentage) )
    print()

    print("Precision: construct")
    print(f"- classes: {precision_classes_construct[index]}/{precision_classes_max[index]} - " + "{:.2f}".format(precision_classes_construct_percentage) )
    print(f"- attributes: {precision_attributes_construct[index]}/{precision_attributes_max[index]} - " + "{:.2f}".format(precision_attributes_construct_percentage) )
    print(f"- associations: {precision_associations_construct[index]}/{precision_associations_max[index]} - " + "{:.2f}".format(precision_associations_construct_percentage) )
    print()

    print("Precision: isa")
    print(f"- classes: {precision_classes_isa[index]}/{precision_classes_max[index]} - " + "{:.2f}".format(precision_classes_isa_percentage) )
    print(f"- attributes: {precision_attributes_isa[index]}/{precision_attributes_max[index]} - " + "{:.2f}".format(precision_attributes_isa_percentage) )
    print(f"- associations: {precision_associations_isa[index]}/{precision_associations_max[index]} - " + "{:.2f}".format(precision_associations_isa_percentage) )
    print()

    print("Precision: list")
    print(f"- classes: {precision_classes_list[index]}/{precision_classes_max[index]} - " + "{:.2f}".format(precision_classes_list_percentage) )
    print(f"- attributes: {precision_attributes_list[index]}/{precision_attributes_max[index]} - " + "{:.2f}".format(precision_attributes_list_percentage) )
    print(f"- associations: {precision_associations_list[index]}/{precision_associations_max[index]} - " + "{:.2f}".format(precision_associations_list_percentage) + "\n\n")


def print_evaluation(is_csv):

    if is_csv:
        header_text_name = "text-name"
        header_recall = "R-strict-classes,R-construct-classes,R-isa-classes,R-list-classes,R-strict-attributes,R-construct-attributes,R-isa-attributes,R-list-attributes,R-strict-associations,R-construct-associations,R-isa-associations,R-list-associations"
        header_precision = "P-strict-classes,P-construct-classes,P-isa-classes,P-list-classes,P-strict-attributes,P-construct-attributes,P-isa-attributes,P-list-attributes,P-strict-associations,P-construct-associations,P-isa-associations,P-list-associations"
        print(f"{header_text_name}{SEPARATOR}{header_recall}{SEPARATOR}{header_precision}")

    text_index = 0
    for index, _ in enumerate(domain_models):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            if not is_csv:
                print(f"---- Results for {domain_models_name[index]}-0{i + 1} ---- ")
            else:
                print(f"{domain_models_name[index]}-0{i + 1}{SEPARATOR}", end="")

            print_recall(text_index, is_csv)
            print_precision(text_index, is_csv)
            text_index += 1


    if not is_csv:
        print(f"---- Results for all texts ---- ")
    else:
        print(f"all{SEPARATOR}", end="")

    print_recall(text_index, is_csv)
    print_precision(text_index, is_csv)


def print_elements_count(is_csv):

    if is_csv:
        header = f"text name{SEPARATOR}classes{SEPARATOR}attributes{SEPARATOR}associations"
        print(header)

    text_index = 0
    for index, _ in enumerate(domain_models):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            if not is_csv:
                print(f"---- Results for {domain_models_name[index]}-0{i + 1} ---- ")
            else:
                print(f"{domain_models_name[index]}-0{i + 1}{SEPARATOR}", end="")

            if not is_csv:
                print(f"Classes count: {recall_classes_max[text_index]}")
                print(f"Attributes count: {recall_attributes_max[text_index]}")
                print(f"Associations count: {recall_associations_max[text_index]}")
            else:
                print(f"{recall_classes_max[text_index]}{SEPARATOR}{recall_attributes_max[text_index]}{SEPARATOR}{recall_associations_max[text_index]}")
            text_index += 1
    
    if not is_csv:
        print(f"---- Results for all texts ---- ")
        print(f"Classes count: {recall_classes_max[text_index]}")
        print(f"Attributes count: {recall_attributes_max[text_index]}")
        print(f"Associations count: {recall_associations_max[text_index]}")
    else:
        print(f"all{SEPARATOR}", end="")
        print(f"{recall_classes_max[text_index]}{SEPARATOR}{recall_attributes_max[text_index]}{SEPARATOR}{recall_associations_max[text_index]}")



def main():
    
    text_index = 0
    for index, domain_model in enumerate(domain_models):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            classes_expected_suggestions_path = os.path.join(INPUT_DIRECTORY_PATH, domain_model, f"{UserChoice.CLASSES.value}-expected-suggestions-0{i + 1}.json")
            attributes_expected_suggestions_path = os.path.join(INPUT_DIRECTORY_PATH, domain_model, f"{UserChoice.ATTRIBUTES.value}-expected-suggestions-0{i + 1}.json")
            associations_expected_suggestions_path = os.path.join(INPUT_DIRECTORY_PATH, domain_model, f"{UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value}-expected-suggestions-0{i + 1}.json")

            classes_evaluated_path = os.path.join(OUTPUT_DIRECTORY_PATH, f"{domain_models_name[index]}-{UserChoice.CLASSES.value}-actual-0{i + 1}.csv")
            attributes_evaluated_path = os.path.join(OUTPUT_DIRECTORY_PATH, f"{domain_models_name[index]}-{UserChoice.ATTRIBUTES.value}-actual-0{i + 1}.csv")
            associations_evaluated_path = os.path.join(OUTPUT_DIRECTORY_PATH, f"{domain_models_name[index]}-{UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value}-actual-0{i + 1}.csv")

            is_file = check_file(classes_evaluated_path, UserChoice.CLASSES.value)
            is_file = is_file and check_file(attributes_evaluated_path, UserChoice.ATTRIBUTES.value)
            is_file = is_file and check_file(associations_evaluated_path, UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value)

            if not is_file:
                if text_index > 0:
                    print_evaluation(IS_CSV)
                exit(0)

            construct_expected_elements(classes_expected_suggestions_path, attributes_expected_suggestions_path, associations_expected_suggestions_path)

            evaluate_classes(classes_evaluated_path, text_index)
            evaluate_attributes(attributes_evaluated_path, text_index)
            evaluate_associations(associations_evaluated_path, text_index)

            compute_recall_wrapper(text_index)

            text_index += 1

    print_evaluation(IS_CSV)
    # print_elements_count(IS_CSV)

    


if __name__ == "__main__":
    main()