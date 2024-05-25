import sys
sys.path.append('.')
sys.path.append('utils/')
sys.path.append('text-filtering/syntactic')
sys.path.append('text-filtering/semantic')

import argparse
import json
import os
from text_utility import TextFilteringVariation, TextUtility, UserChoice
from syntactic_text_filterer import SyntacticTextFilterer


DIRECTORY_PATH = os.path.join("domain-modeling-benchmark", "evaluation domain models")
domain_models = ["aircraft manufacturing 48982a787d8d25", "conference papers 56cd5f7cf40f52", "farming 97627e23829afb", "college 1dc8e791-1d0e-477c-b5c2-24e376e3f6f1", "zoological gardens e95b5ea472deb8", "registry of road vehicles 60098f15-668b-4a39-8503-285e0b51d56d"]
domain_models_name = ["aircraft-manufacturing", "conference-papers", "farming", "college", "zoological-gardens", "registry-of-road-vehicles"]
DOMAIN_DESCRIPTIONS_COUNT = [3, 3, 3, 1, 1, 1]
DOMAIN_TEXTS_COUNT = 12

# Indexes correspond to texts in domain models and last index corresponds to all texts together
recall_entities = [0] * (DOMAIN_TEXTS_COUNT + 1)
recall_attributes = [0] * (DOMAIN_TEXTS_COUNT + 1)
recall_relationships = [0] * (DOMAIN_TEXTS_COUNT + 1)

recall_entities_max = [0] * (DOMAIN_TEXTS_COUNT + 1)
recall_attributes_max = [0] * (DOMAIN_TEXTS_COUNT + 1)
recall_relationships_max = [0] * (DOMAIN_TEXTS_COUNT + 1)

precision = [0] * (DOMAIN_TEXTS_COUNT + 1)
precision_max = [0] * (DOMAIN_TEXTS_COUNT + 1)


class RAGTester:

    def compare_texts(expected_relevant_texts, actual_relevant_texts, domain_description_path, user_choice, name, source_entity="", target_entity="", is_print_failed_tests=False):
        total_tests = 0
        successful_tests = 0

        for expected_text in expected_relevant_texts:
            total_tests += 1
            is_relevant_text_found = False
            for actual_relevant_text in actual_relevant_texts:
                if expected_text in actual_relevant_text:
                    is_relevant_text_found = True
                    break

            if not is_relevant_text_found:

                if is_print_failed_tests:
                    print("Test failed:")
                    print(f"- file: {domain_description_path}")

                    # Note: name in capslock represents the entity used for filtering
                    if user_choice == UserChoice.ENTITIES.value:
                        print(f"- ENTITY: {name}")

                    elif user_choice == UserChoice.ATTRIBUTES.value:
                        print(f"- SOURCE ENTITY: {source_entity}")
                        print(f"- attribute name: {name}")

                    elif user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value:
                        if source_entity != "":
                            print(f"- SOURCE ENTITY: {source_entity}")
                        else:
                            print(f"- TARGET ENTITY: {target_entity}")

                        print(f"- relationship name: {name}")

                    elif user_choice == UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value:
                        print(f"- SOURCE ENTITY: {source_entity}")
                        print(f"- TARGET ENTITY: {target_entity}")
                        print(f"- relationship name: {name}")

                    print(f"- relevant text not found: {expected_text}\n")
                    # print(f"Actual relevant texts:\n{actual_relevant_texts}\n")
            else:
                successful_tests += 1
        
        return total_tests, successful_tests


    def get_actual_relevant_texts(filtering_variation, domain_description, source_entity, text_finder=None):

        if filtering_variation == TextFilteringVariation.NONE.value:
            actual_relevant_texts = TextUtility.split_into_sentences(domain_description)
        else:
            actual_relevant_texts = text_finder.get(source_entity, domain_description)
        
        return actual_relevant_texts
    

    def process_test_casses_attributes(test_case, actual_relevant_texts, all_expected_relevant_texts, domain_description_path, text_index, entity, is_print_failed_tests):
        if "attributes" in test_case:
            attributes_tests = test_case['attributes']

            for attributes_test in attributes_tests:
                name = attributes_test["name"]

                expected_relevant_texts = attributes_test["relevant_texts"]

                for text in expected_relevant_texts:
                    if text not in all_expected_relevant_texts:
                        all_expected_relevant_texts.append(text)

                current_total, current_successfull_tests = RAGTester.compare_texts(expected_relevant_texts, actual_relevant_texts, domain_description_path, name=name, user_choice=UserChoice.ATTRIBUTES.value, source_entity=entity, is_print_failed_tests=is_print_failed_tests)

                recall_attributes[text_index] += current_successfull_tests
                recall_attributes[-1] += current_successfull_tests
                recall_attributes_max[text_index] += current_total
                recall_attributes_max[-1] += current_total


    def process_test_casses_relationships(test_case, actual_relevant_texts, all_expected_relevant_texts, domain_description_path, text_index, entity, is_print_failed_tests):
        if "relationships" in test_case:
            relationships_tests = test_case['relationships']

            for relationship_test in relationships_tests:
                name = relationship_test["name"]

                expected_relevant_texts = relationship_test["relevant_texts"]
                for text in expected_relevant_texts:
                    if text not in all_expected_relevant_texts:
                        all_expected_relevant_texts.append(text)

                source_entity = ""
                target_entity = ""

                if relationship_test['is_source']:
                    source_entity = entity
                else:
                    target_entity = entity

                current_total, current_successfull_tests = RAGTester.compare_texts(expected_relevant_texts, actual_relevant_texts, domain_description_path, name=name, user_choice=UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value, source_entity=source_entity, target_entity=target_entity, is_print_failed_tests=is_print_failed_tests)

                recall_relationships[text_index] += current_successfull_tests
                recall_relationships[-1] += current_successfull_tests
                recall_relationships_max[text_index] += current_total
                recall_relationships_max[-1] += current_total


    def process_test_cases(test_cases, text_index, filtering_variation, text_finder, domain_description, domain_description_path, is_print_failed_tests):

        for test_case in test_cases:
            entity = test_case["entity"]
            expected_relevant_texts = test_case["relevant_texts"]
            all_expected_relevant_texts = expected_relevant_texts

            actual_relevant_texts = RAGTester.get_actual_relevant_texts(filtering_variation, domain_description, entity, text_finder)

            current_total, current_successfull_tests = RAGTester.compare_texts(expected_relevant_texts, actual_relevant_texts, domain_description_path, name=entity, user_choice=UserChoice.ENTITIES.value, is_print_failed_tests=is_print_failed_tests)

            recall_entities[text_index] += current_successfull_tests
            recall_entities[-1] += current_successfull_tests
            recall_entities_max[text_index] += current_total
            recall_entities_max[-1] += current_total
            
            RAGTester.process_test_casses_attributes(test_case, actual_relevant_texts, all_expected_relevant_texts, domain_description_path, text_index, entity, is_print_failed_tests)
            RAGTester.process_test_casses_relationships(test_case, actual_relevant_texts, all_expected_relevant_texts, domain_description_path, text_index, entity, is_print_failed_tests)

            # Calculate precision for this test case:
            for expected_text in all_expected_relevant_texts:
                for actual_text in actual_relevant_texts:
                    if expected_text in actual_text:
                        precision[text_index] += 1
                        precision[-1] += 1
                        break
            
            precision_max[text_index] += len(actual_relevant_texts)
            precision_max[-1] += len(actual_relevant_texts)


    def test_filtering(filtering_variation, is_print_failed_tests):

        if filtering_variation == TextFilteringVariation.SYNTACTIC.value:
            text_finder = SyntacticTextFilterer()
        
        elif filtering_variation == TextFilteringVariation.SEMANTIC.value:
            from semantic_text_filterer import SemanticTextFilterer
            text_finder = SemanticTextFilterer()

        else:
            text_finder = None


        text_index = 0
        for index, domain_model in enumerate(domain_models):
            for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

                domain_description_file_name = f"domain-description-0{i + 1}.txt"
                test_file_name = f"relevant-texts-one-known_entity-0{i + 1}.json"

                domain_description_path = os.path.join(DIRECTORY_PATH, domain_model, domain_description_file_name)
                test_file_path = os.path.join(DIRECTORY_PATH, domain_model, test_file_name)

                if not os.path.isfile(domain_description_path):
                    raise ValueError(f"Domain description not found: {domain_description_path}")

                if not os.path.isfile(test_file_path):
                    raise ValueError(f"Test file not found: {test_file_path}")

                
                with open(test_file_path) as file:
                    test_cases = json.load(file)["test_cases"]
                
                with open(domain_description_path) as file:
                    domain_description = file.read()

                RAGTester.process_test_cases(test_cases, text_index, filtering_variation, text_finder, domain_description, domain_description_path, is_print_failed_tests)

                text_index += 1


    def output_relevant_text_for_given_entities(filtering_variation, domain_description_path):
        # entities = ["vehicle type", "motorised vehicle", "structural component", "manufacturer", "vehicle system", "owner", "operator", "natural person", "business natural person", "address", "legal person", "registration", "registration application", "third party insurance", "insurance contract", "policy holder", "insurer", "green card", "technical inspection", "technical inspection report", "defect"]
        entities = ["cultivated variety"]
        
        if filtering_variation == TextFilteringVariation.SYNTACTIC.value:
            relevant_text_finder = SyntacticTextFilterer()

        elif filtering_variation == TextFilteringVariation.SEMANTIC.value:
            from semantic_text_filterer import SemanticTextFilterer
            relevant_text_finder = SemanticTextFilterer()

        with open(domain_description_path, 'r') as file:
            domain_description = file.read()

        for entity in entities:

            if filtering_variation == TextFilteringVariation.NONE.value:
                relevant_texts = TextUtility.split_into_sentences(domain_description)
            else:
                relevant_texts = relevant_text_finder.get(entity, domain_description)

            print(f"Entity: {entity}")
            for text in relevant_texts:
                print(text)

            print("\n\n")


def print_recall(index):

    recall_entities_percentage = (recall_entities[index] / recall_entities_max[index]) * 100
    recall_attributes_percentage = (recall_attributes[index] / recall_attributes_max[index]) * 100
    recall_relationships_percentage = (recall_relationships[index] / recall_relationships_max[index]) * 100

    print("Recall")
    print(f"- entities: {recall_entities[index]}/{recall_entities_max[index]} - " + "{:.2f}".format(recall_entities_percentage) + "%")
    print(f"- attributes: {recall_attributes[index]}/{recall_attributes_max[index]} - " + "{:.2f}".format(recall_attributes_percentage) + "%")
    print(f"- relationships: {recall_relationships[index]}/{recall_relationships_max[index]} - " + "{:.2f}".format(recall_relationships_percentage) + "%\n")


def print_precision(index):

    precision_percentage = (precision[index] / precision_max[index]) * 100

    print("Precision")
    print(f"- {precision[index]}/{precision_max[index]} - " + "{:.2f}".format(precision_percentage) + "%\n\n")


def print_evaluation():

    text_index = 0
    for index, _ in enumerate(domain_models):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            print(f"---- {domain_models_name[index]}-0{i + 1} ---- ")
            print_recall(text_index)
            print_precision(text_index)
            text_index += 1

    print(f"---- Results for all texts ---- ")
    print_recall(text_index)
    print_precision(text_index)


def main():

    parser = argparse.ArgumentParser(description = "Relevant texts tester")
    parser.add_argument("--filtering", choices = [TextFilteringVariation.NONE.value, TextFilteringVariation.SYNTACTIC.value, TextFilteringVariation.SEMANTIC.value], type=str, default=TextFilteringVariation.SYNTACTIC.value, help = "Choose variation for domain description filtering")
    parser.add_argument("--print_failed_tests", action = "store_true", default=False, help = "")

    args = parser.parse_args()
    is_print_failed_tests = args.print_failed_tests

    RAGTester.test_filtering(args.filtering, is_print_failed_tests)

    print_evaluation()

    # Get relevant text for a given domain description and entity
    # domain_description_path = "domain-modeling-benchmark\\domain-models\\farming 97627e23829afb\\domain-description-03.txt"
    # RAGTester.output_relevant_text_for_given_entities(filtering_variation, domain_description_path)


if __name__ == "__main__":
    main()