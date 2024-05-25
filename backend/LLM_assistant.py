import os
import time
import logging
import json
import openai
import sys

sys.path.append('utils/')
sys.path.append('text-filtering/syntactic')
sys.path.append('text-filtering/semantic')
from text_utility import DEFINED_DATA_TYPES, LOGGER_NAME, Field, PromptFileSymbols, TextFilteringVariation, TextUtility, UserChoice, DataType
from syntactic_text_filterer import SyntacticTextFilterer
from semantic_text_filterer import SemanticTextFilterer


ITEMS_COUNT = 5
IS_SYSTEM_MSG = True
IS_IGNORE_DOMAIN_DESCRIPTION = False
IS_RELATIONSHIPS_IS_A = False

logger = logging.getLogger(LOGGER_NAME)

TIMESTAMP = time.strftime('%Y-%m-%d-%H-%M-%S')
LOG_DIRECTORY = "logs"
LOG_FILE_PATH = os.path.join(LOG_DIRECTORY, f"{TIMESTAMP}-log.txt")
logging.basicConfig(level=logging.INFO, format="%(message)s", filename=LOG_FILE_PATH, filemode='w')


PROMPT_DIRECTORY = os.path.join("..", "prompts")
SYSTEM_PROMPT_DIRECTORY = os.path.join(PROMPT_DIRECTORY, "system")

LLM_BACKEND_URL = "http://localhost:8080/v1"

ENTITIES_BLACK_LIST = ["employee", "department", "manager"]


class LLMAssistant:
    def __init__(self):   

        self.client = openai.OpenAI(base_url=LLM_BACKEND_URL, api_key="sk-no-key-required")

        self.syntactic_text_filterer = SyntacticTextFilterer()
        self.semantic_text_filterer = SemanticTextFilterer()
        
        self.debug_info = self.DebugInfo()


    class DebugInfo:
        def __init__(self):
            self.prompt = ""
            self.assistant_message = ""
            self.deleted_items = []


    def __create_system_prompt(self, user_choice, is_domain_description):

        prompt_file_name = f"{user_choice}"
        if is_domain_description:
            prompt_file_name += "-dd"
        prompt_file_name += ".txt"

        prompt_file_path = os.path.join(SYSTEM_PROMPT_DIRECTORY, prompt_file_name)

        with open(prompt_file_path, 'r') as file:
            system_prompt = file.read()
        
        return system_prompt


    def __append_default_messages(self, user_choice, is_domain_description=False):

        if IS_SYSTEM_MSG:
            system_prompt = self.__create_system_prompt(user_choice, is_domain_description)
        else:
            system_prompt = ""

        self.messages.append({"role": "system", "content": system_prompt})
        self._are_default_messages_appended = True
        return


    # Returns (parsed_item, is_item_ok)
    # is_item_ok: False if there is any issue while parsing otherwise True
    def __parse_item_streamed_output(self, item, user_choice, source_class, target_class="", field_name=""):
        try:
            # Replace invalid characters from JSON
            item = item.replace('\_', ' ')
            item = item.replace('\n', ' ')

            completed_item = json.loads(item)

        except ValueError:
            logging.error(f"Cannot decode JSON: {item}\n")
            completed_item = { "name": f"Error: {item}"}
            yield completed_item, False
            return
        
        is_item_ok = True
        source_class = source_class.lower()
        target_class = target_class.lower()

        if field_name != "":
            is_item_ok = field_name in completed_item

            if not is_item_ok:
                logging.error(f"No {field_name} in the item")

            yield completed_item, is_item_ok
            return

        
        if user_choice == UserChoice.SUMMARY_PLAIN_TEXT.value:
            is_item_ok = "summary" in completed_item

            if not is_item_ok:
                logging.error("No summary in the item")

            yield completed_item, is_item_ok
            return

        elif user_choice == UserChoice.SUMMARY_DESCRIPTIONS.value:
            yield completed_item, is_item_ok
            return

        if "name" not in completed_item or not completed_item["name"] or completed_item["name"] == "none":
            completed_item["name"] = "error: no name"
            is_item_ok = False

        else:
            # Lower case the first letter in the `name` to consistently have all names with the first letter in lower case
            # completed_item["name"] = completed_item["name"][0].lower() + completed_item["name"][1:]

            completed_item[Field.NAME.value] = TextUtility.convert_string_to_standard_convention(completed_item[Field.NAME.value])

            if Field.SOURCE_CLASS.value in completed_item:
                completed_item[Field.SOURCE_CLASS.value] = TextUtility.convert_string_to_standard_convention(completed_item[Field.SOURCE_CLASS.value])

            if Field.TARGET_CLASS.value in completed_item:
                completed_item[Field.TARGET_CLASS.value] = TextUtility.convert_string_to_standard_convention(completed_item[Field.TARGET_CLASS.value])
        

        if not is_item_ok:
            yield completed_item, is_item_ok
            return
        
        if user_choice == UserChoice.ATTRIBUTES.value:
            # TODO: define all attribute field names so we do not have to type "dataType" but can use some variable instead
            if "dataType" in completed_item:
                if completed_item["dataType"] == "float":
                    logging.info(f"Converting float data type to number")
                    completed_item["dataType"] = "number"

                elif completed_item["dataType"] == "date":
                    logging.info(f"Converting date data type to time")
                    completed_item["dataType"] = "time"

                # Convert any unknown data type to string
                if not completed_item["dataType"] in DEFINED_DATA_TYPES:
                    logging.info(f"Converting unknown data type to string")
                    completed_item["dataType"] = "string"

            # Remove attributes in which their inferred text does not contain the given entity
            # is_originalText = "originalText" in completed_item
            # if is_originalText and user_input_entity1 not in completed_item['originalText'].lower():
                # completed_item['name'] = "(Deleted: Source entity is not contained in the original text) " + completed_item['name']
                # logging.warning("Source entity is not contained in the original text")
                # is_item_ok = True


        elif user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value:
            if not Field.SOURCE_CLASS.value in completed_item or not completed_item[Field.SOURCE_CLASS.value]:
                completed_item[Field.NAME.value] = "error: no source class"
                is_item_ok = False

            
            if not Field.TARGET_CLASS.value in completed_item or not completed_item[Field.TARGET_CLASS.value]:
                completed_item[Field.NAME.value] = "error: no target class"
                is_item_ok = False
            
            if not is_item_ok:
                yield completed_item, is_item_ok
                return
            
            source_generated_lower = completed_item[Field.SOURCE_CLASS.value].lower().replace('s', 'z')
            target_generated_lower = completed_item[Field.TARGET_CLASS.value].lower().replace('s', 'z')

            source_class_replaced = source_class.replace('s', 'z')
            target_class_replaced = source_class.replace('s', 'z')

            is_source_or_target_included = source_class_replaced == source_generated_lower or target_class_replaced == target_generated_lower
            is_none = (source_generated_lower == "none") or (target_generated_lower == "none")
            
            if not is_source_or_target_included or is_none:
                # For debugging purpuses do not end parsing but otherwise we would probably end
                #self.end_parsing_prematurely = True
                #return completed_item

                if not is_source_or_target_included:
                    logging.info(f"{source_class} != {source_generated_lower} and {target_class} != {target_generated_lower}")

                completed_item['name'] = "(Deleted: Inputed entity is not source/target entity) " + completed_item['name']
                is_item_ok = False


        elif user_choice == UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES.value:
            if "source" in completed_item and "target" in completed_item:

                # Replace 's' for 'z' to solve the following issue:
                #   - input: motoriSed vehicle with S
                #   - LLM output: motoriZed vehicle with Z
                source_generated_lower = completed_item["source"].lower().replace('s', 'z')
                target_generated_lower = completed_item["target"].lower().replace('s', 'z')

                source_class = source_class.lower().replace('s', 'z')
                target_class = target_class.lower().replace('s', 'z')

                is_match = (source_class == source_generated_lower and target_class == target_generated_lower) or (target_class == source_generated_lower and source_class == target_generated_lower)
                is_none = (source_generated_lower == "none") or (target_generated_lower == "none")

                if not is_match:
                    logging.info(f"Not matched:\n- given classes: {source_class}, {target_class}\n- generated classes: {source_generated_lower}, {target_generated_lower}\n")

                if not is_match or is_none:
                    completed_item["name"] = f"Deleted: Inputed classes are not contained in source and target classes: {completed_item['name']}"
                    is_item_ok = False

        logging.info(f"Completed item: {completed_item['name']}")

        for key in completed_item:
            if key == "name":
                continue
            key_name = key.replace('_', ' ').capitalize()
            logging.info(f"- {key_name}: {completed_item[key]}")

        logging.info("\n")

        yield completed_item, is_item_ok


    def __parse_streamed_output(self, messages, user_choice, source_class, target_class="", field_name=""):

        self.debug_info = self.DebugInfo() # Reset debug info

        output = self.client.chat.completions.create(messages=messages, model="", stream=True, temperature=0)

        items = []
        item = ""
        new_lines_in_a_row = 0
        last_char = ''
        self.end_parsing_prematurely = False
        opened_curly_brackets_count = 0

        # E.g.: "classNames": {[{ "name": "customer", "originalText": "Customers represent..."}, {...}]}
        # To parse the item with "name": "customer", we need to reset parsing when we encounter '{' symbol
        is_disable_JSON_nesting = user_choice != UserChoice.SUMMARY_DESCRIPTIONS.value


        for text in output:

            if text.choices[0].delta.content is None:
                continue

            text = text.choices[0].delta.content

            self.debug_info.assistant_message += text

            for char in text:
                if char == '{':

                    if opened_curly_brackets_count == 1 and is_disable_JSON_nesting:
                        item = ""
                    else:
                        opened_curly_brackets_count += 1

                if char == '\n' and last_char == '\n':
                    new_lines_in_a_row += 1
                else:
                    new_lines_in_a_row = 0

                
                # Return when LLM gets stuck in printing only new lines
                if new_lines_in_a_row > 3:
                    logging.warning("Warning: too many new lines")
                    return
                
                if opened_curly_brackets_count > 0:
                    item += char
                
                if char == '}':
                    opened_curly_brackets_count -= 1


                if opened_curly_brackets_count == 0 and item != '':

                    iterator = self.__parse_item_streamed_output(item, user_choice, source_class, target_class, field_name)

                    for completed_item, is_item_ok in iterator:
                        # TODO: Add comment what this code is doing
                        if self.end_parsing_prematurely:
                            logging.info(f"Ending parsing prematurely: {completed_item}")
                            return
                            
                        if is_item_ok:
                            yield completed_item
                        else:
                            self.debug_info.deleted_items.append(completed_item)

                    item = ""
                
                last_char = char

        if IS_IGNORE_DOMAIN_DESCRIPTION and len(items) != ITEMS_COUNT:
            logging.info(f"Incorrect amount of items\n- expected: {ITEMS_COUNT}\n- actual: {len(items)}")

        # If the JSON object is not properly finished then insert the needed amount of closed curly brackets
        if opened_curly_brackets_count > 0:
            logging.info(f"JSON object is not properly finished: {item}")
            item += '}' * opened_curly_brackets_count

            iterator = self.__parse_item_streamed_output(item, user_choice, source_class)

            for completed_item, is_item_ok in iterator:
                if is_item_ok:
                    yield completed_item
                else:
                    self.debug_info.deleted_items.append(completed_item)
        
        logging.info(f"\nFull message: {self.debug_info.assistant_message}")
        return
    

    def __edit_prompt(self, prompt, attempt_number):
        
        # Remove text from the end of the prompt until the `attempt_number`-th new line character 
        for i in range(attempt_number):
            last_new_line_index = prompt.rfind('\n')

            if last_new_line_index == -1:
                return prompt

            if i + 1 == attempt_number:
                return prompt[:last_new_line_index]
            else:
                prompt = prompt[:last_new_line_index]


    def get_prompt(self, user_choice, field_name="", is_domain_description=True, is_chain_of_thoughts=True):

        prompt_file_name = ""

        if field_name != "":
            prompt_file_name += f"-{field_name}"

        if is_domain_description:
            prompt_file_name += "-dd"
        else:
            # For now disable chain of thoughts if we do not have any domain description
            is_chain_of_thoughts = False
        
        if is_chain_of_thoughts:
            prompt_file_name += "-cot"

        prompt_file_name += ".txt"

        if prompt_file_name[0] == '-':
            prompt_file_name = prompt_file_name[1:]

        prompt_file_path = os.path.join(PROMPT_DIRECTORY, user_choice, prompt_file_name)

        with open(prompt_file_path, 'r') as file:
            prompt = file.read()

        return prompt


    def __create_prompt(self, user_choice, source_class="", target_class="", relevant_texts = "", is_domain_description=True,
                        items_count_to_suggest = 5, is_chain_of_thoughts = True, conceptual_model = {}, field_name = "",
                        attribute_name="", association_name=""):

        original_prompt = self.get_prompt(user_choice=user_choice, field_name=field_name, is_domain_description=is_domain_description, is_chain_of_thoughts=is_chain_of_thoughts)

        replacements = {
            PromptFileSymbols.SOURCE_CLASS.value: source_class,
            PromptFileSymbols.TARGET_CLASS.value: target_class,
            PromptFileSymbols.DOMAIN_DESCRIPTION.value: relevant_texts,
            PromptFileSymbols.ITEMS_COUNT_TO_SUGGEST.value: str(items_count_to_suggest),
            PromptFileSymbols.CONCEPTUAL_MODEL.value: json.dumps(conceptual_model),
            PromptFileSymbols.ATTRIBUTE_NAME.value: attribute_name,
            PromptFileSymbols.ASSOCIATION_NAME.value: association_name,
        }
        
        # Substitute all special symbols in the given prompt
        prompt = TextUtility.multireplace(original_prompt, replacements)

        return prompt


    def __get_text_filterer(self, text_filtering_variation):

        if text_filtering_variation == TextFilteringVariation.SYNTACTIC.value:
            return self.syntactic_text_filterer
        
        elif text_filtering_variation == TextFilteringVariation.SEMANTIC.value:
            return self.semantic_text_filterer

        else:
            return None


    def suggest_items(self, source_class, target_class, user_choice, domain_description, text_filtering_variation=TextFilteringVariation.SYNTACTIC.value, count_items_to_suggest=5):

        source_class = source_class.strip()

        if IS_IGNORE_DOMAIN_DESCRIPTION:
            domain_description = ""

        is_domain_description = domain_description != ""

        self.messages = []
        self.__append_default_messages(user_choice=user_choice, is_domain_description=is_domain_description)        


        if user_choice != UserChoice.CLASSES.value:
            relevant_texts = self.get_relevant_texts(self, source_class=source_class, domain_description=domain_description, filtering_variation=text_filtering_variation)
        else:
            relevant_texts = domain_description


        if is_domain_description and not relevant_texts:
            logging.warn("No relevant texts found.")
            return

        is_chain_of_thoughts = True

        # For entities with Mixtral it works better to disable chain of thoughts
        if user_choice == UserChoice.CLASSES.value:
            is_chain_of_thoughts = False    


        max_attempts_count = 2
        is_some_item_generated = False

        for attempt_number in range(max_attempts_count):

            prompt = self.__create_prompt(user_choice=user_choice, source_class=source_class, target_class=target_class,
                is_domain_description=is_domain_description, items_count_to_suggest=count_items_to_suggest, relevant_texts=relevant_texts,
                is_chain_of_thoughts=is_chain_of_thoughts)

            # Slightly change the prompt without any semantic changes to force different output
            # Reason: changing parameters of `chat.completions.create` did not have any effect
            if attempt_number > 0:
                logging.info(f"Attempt: {attempt_number}")
                prompt = self.__edit_prompt(prompt, attempt_number)
            
            new_messages = self.messages.copy()
            new_messages.append({"role": "user", "content": prompt})

            messages_prettified = TextUtility.messages_prettify(new_messages)
            logging.info(f"\nSending this prompt to llm:\n{messages_prettified}\n")
            self.debug_info.prompt = messages_prettified

            items_iterator = self.__parse_streamed_output(new_messages, user_choice=user_choice, source_class=source_class, target_class=target_class)


            if user_choice == UserChoice.CLASSES.value:
                suggested_entities = []

            for item in items_iterator:
                is_some_item_generated = True
                suggestion_dictionary = json.loads(json.dumps(item))

                if user_choice == UserChoice.CLASSES.value:
                    if suggestion_dictionary['name'] in suggested_entities:
                        logging.info(f"Skipping duplicate entity: {suggestion_dictionary['name']}")
                        continue

                    if suggestion_dictionary['name'] in ENTITIES_BLACK_LIST:
                        logging.info(f"Skipping black-listed entity: {suggestion_dictionary['name']}")
                        continue

                    suggested_entities.append(suggestion_dictionary['name'])

                    if not Field.ORIGINAL_TEXT.value in suggestion_dictionary:
                        # Find occurencies of the entity name in the domain description
                        item[Field.ORIGINAL_TEXT.value] = suggestion_dictionary['name']

                # Find originalText indexes for `item['originalText']` in `domain_description`
                if Field.ORIGINAL_TEXT.value in item:
                    original_text = item[Field.ORIGINAL_TEXT.value]
                    original_text_indexes, _, _ = TextUtility.find_text_in_domain_description(original_text, domain_description, user_choice)
                    suggestion_dictionary[Field.ORIGINAL_TEXT_INDEXES.value] = original_text_indexes
                else:
                    logging.warn(f"Warning: original text not in item: {item}")

                json_item = json.dumps(suggestion_dictionary)
                yield f"{json_item}\n"
            
            if is_some_item_generated:
                break
    

    def get_relevant_texts(self, source_class, domain_description, filtering_variation):

        if filtering_variation == TextFilteringVariation.NONE.value:
            return domain_description

        text_filterer = self.__get_text_filterer(filtering_variation)
        relevant_texts = text_filterer.get(source_class, domain_description)

        result = ""
        for text in relevant_texts:
            result += f"{text}\n"
        
        relevant_texts = result.rstrip() # Remove trailing new line
        
        return relevant_texts


    def suggest_single_field(self, user_choice, name, source_class, target_class, domain_description, field_name, text_filtering_variation=TextFilteringVariation.SYNTACTIC.value):

        source_class = source_class.strip()

        relevant_texts = self.get_relevant_texts(source_class=source_class, domain_description=domain_description, filtering_variation=text_filtering_variation)
        is_domain_description = domain_description != ""

        prompt = self.__create_prompt(user_choice=user_choice, source_class=source_class, target_class=target_class, 
            attribute_name=name, association_name=name, relevant_texts=relevant_texts, field_name=field_name, is_chain_of_thoughts=False, is_domain_description=is_domain_description)

        self.messages = []
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})
        messages_prettified = TextUtility.messages_prettify(new_messages)
        self.debug_info.prompt = messages_prettified

        logging.info(f"\nSending this prompt to llm:\n{messages_prettified}\n")

        items_iterator = self.__parse_streamed_output(new_messages, user_choice, source_class, field_name=field_name)

        for item in items_iterator:
            # Parse string to json to dictionary
            dictionary = json.loads(json.dumps(item))


            if field_name == Field.ORIGINAL_TEXT.value:
                original_text_indexes, _, _ = TextUtility.find_text_in_domain_description(dictionary[Field.ORIGINAL_TEXT.value], domain_description, user_choice)
                dictionary[Field.ORIGINAL_TEXT_INDEXES.value] = original_text_indexes
            
            json_item = json.dumps(dictionary)
            return json_item


    def suggest_summary_plain_text(self, conceptual_model, domain_description):
        
        prompt = self.__create_prompt(user_choice=UserChoice.SUMMARY_PLAIN_TEXT.value, conceptual_model=conceptual_model,
            relevant_texts=domain_description, is_chain_of_thoughts=False)

        self.messages = []
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})
        messages_prettified = TextUtility.messages_prettify(new_messages)
        self.debug_info.prompt = messages_prettified

        logging.info(f"\nSending this prompt to llm:\n{messages_prettified}\n")

        items_iterator = self.__parse_streamed_output(new_messages, UserChoice.SUMMARY_PLAIN_TEXT.value, "")

        for item in items_iterator:
            dictionary = json.loads(json.dumps(item))

            json_item = json.dumps(dictionary)
            return json_item


    def suggest_summary_descriptions(self, conceptual_model, domain_description):

        prompt = self.__create_prompt(user_choice=UserChoice.SUMMARY_DESCRIPTIONS.value, conceptual_model=conceptual_model, 
            relevant_texts=domain_description, is_chain_of_thoughts=False)

        self.messages = []
        new_messages = self.messages.copy()
        new_messages.append({"role": "user", "content": prompt})
        messages_prettified = TextUtility.messages_prettify(new_messages)
        self.debug_info.prompt = messages_prettified

        logging.info(f"\nSending this prompt to llm:\n{messages_prettified}\n")

        items_iterator = self.__parse_streamed_output(new_messages, UserChoice.SUMMARY_DESCRIPTIONS.value, "")

        for item in items_iterator:
            dictionary = json.loads(json.dumps(item))

            json_item = json.dumps(dictionary)
            yield f"{json_item}\n"