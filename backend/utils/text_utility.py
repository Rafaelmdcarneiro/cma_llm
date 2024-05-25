import re
from difflib import SequenceMatcher
from enum import Enum
import string


LOGGER_NAME = "LLM_logger"


class UserChoice(Enum):
    CLASSES = "classes"
    ATTRIBUTES = "attributes"
    ASSOCIATIONS_ONE_KNOWN_CLASS = "associations1"
    ASSOCIATIONS_TWO_KNOWN_CLASSES = "associations2"
    SUMMARY_PLAIN_TEXT = "summaryPlainText"
    SUMMARY_DESCRIPTIONS = "summaryDescriptions"
    SINGLE_FIELD = "singleField"


class TextFilteringVariation(Enum):
    NONE = "none"
    SYNTACTIC = "syntactic"
    SEMANTIC = "semantic"


class DataType(Enum):
    STRING = "string"
    NUMBER = "number"
    TIME = "time"
    BOOLEAN = "boolean"

DEFINED_DATA_TYPES = [DataType.STRING.value, DataType.NUMBER.value, DataType.TIME.value, DataType.BOOLEAN.value]


class Field(Enum):
    NAME = "name"
    DESCRIPTION = "description"
    ORIGINAL_TEXT = "originalText"
    ORIGINAL_TEXT_INDEXES = "originalTextIndexes"
    DATA_TYPE = "dataType"
    CARDINALITY = "cardinality"
    SOURCE_CLASS = "source"
    TARGET_CLASS = "target"


class FieldUI(Enum):
    NAME = "name"
    DESCRIPTION = "description"
    ORIGINAL_TEXT = "original text"
    ORIGINAL_TEXT_INDEXES = "original text indexes"
    DATA_TYPE = "data type"
    CARDINALITY = "cardinality"
    SOURCE_ENTITY = "source entity"
    TARGET_ENTITY = "target entity"


class PromptFileSymbols(Enum):
    SOURCE_CLASS = "{source_class}"
    TARGET_CLASS = "{target_class}"
    DOMAIN_DESCRIPTION = "{domain_description}"
    ITEMS_COUNT_TO_SUGGEST = "{items_count}"
    CONCEPTUAL_MODEL = "{conceptual_model}"
    ATTRIBUTE_NAME = "{attribute_name}"
    ASSOCIATION_NAME = "{association_name}"
    FIELD_NAME = "{field_name}"


PRONOUNS_TO_DETECT = ["It", "This", "The", "They"]

alphabets= "([A-Za-z])"
prefixes = "(Mr|St|Mrs|Ms|Dr)[.]"
suffixes = "(Inc|Ltd|Jr|Sr|Co)"
starters = "(Mr|Mrs|Ms|Dr|Prof|Capt|Cpt|Lt|He\s|She\s|It\s|They\s|Their\s|Our\s|We\s|But\s|However\s|That\s|This\s|Wherever)"
acronyms = "([A-Z][.][A-Z][.](?:[A-Z][.])?)"
websites = "[.](com|net|org|io|gov|edu|me)"
digits = "([0-9])"
multiple_dots = r'\.{2,}'


class TextUtility:

    def messages_prettify(messages):
        result = ""
        for message in messages:
            result += f"{message['role']}: {message['content']}\n"
        
        return result


    def json_to_pretty_text(json_item, index, user_choice, ATTRIBUTES_STRING):

        result = ""
        result += f"{index + 1}: {json_item['name'].capitalize()}\n"

        if "description" in json_item:
            result += f"- Description: {json_item['description']}\n"


        if user_choice == ATTRIBUTES_STRING:
            if "inference" in json_item:
                result += f"- Inference: {json_item['inference']}\n"
            if "data_type" in json_item:
                result += f"- Data type: {json_item['data_type']}\n"

        else:
            if "source" in json_item:
                result += f"- Source: {json_item['source']}\n"
            if "target" in json_item:
                result += f"- Target: {json_item['target']}\n"
            if "sentence" in json_item:
                result += f"- Sentence: {json_item['sentence']}\n"
            if "inference" in json_item:
                result += f"- Inference: {json_item['inference']}\n"
            if "cardinality" in json_item:
                result += f"- Cardinality: {json_item['cardinality']}\n"
        
        return result


    def split_into_sentences(text: str) -> list[str]:
        # https://stackoverflow.com/a/31505798
        """
        Split the text into sentences.

        If the text contains substrings "<prd>" or "<stop>", they would lead 
        to incorrect splitting because they are used as markers for splitting.

        :param text: text to be split into sentences
        :type text: str

        :return: list of sentences
        :rtype: list[str]
        """
        text = " " + text + "  "
        text = text.replace("\n"," ")
        text = re.sub(prefixes,"\\1<prd>",text)
        text = re.sub(websites,"<prd>\\1",text)
        text = re.sub(digits + "[.]" + digits,"\\1<prd>\\2",text)
        text = re.sub(multiple_dots, lambda match: "<prd>" * len(match.group(0)) + "<stop>", text)

        # Titles
        if "Ph.D" in text: text = text.replace("Ph.D.","Ph<prd>D<prd>")
        if "B.Sc." in text: text = text.replace("B.Sc.","B<prd>Sc<prd>")
        if "B.A." in text: text = text.replace("B.A.","B<prd>A<prd>")
        if "Ing." in text: text = text.replace("Ing.","Ing<prd>")
        if "Ing. arch." in text: text = text.replace("Ing. arch.","Ing<prd> arch<prd>")
        if "M.D." in text: text = text.replace("M.D.","M<prd>D<prd>")
        if "MDDr." in text: text = text.replace("MDDr.","MDDr<prd>")
        if "MVDr." in text: text = text.replace("MVDr.","MVDr<prd>")
        if "MgA." in text: text = text.replace("MgA.","MgA<prd>")
        if "Mgr." in text: text = text.replace("Mgr.","Mgr<prd>")

        text = re.sub("\s" + alphabets + "[.] "," \\1<prd> ",text)
        text = re.sub(acronyms+" "+starters,"\\1<stop> \\2",text)
        text = re.sub(alphabets + "[.]" + alphabets + "[.]" + alphabets + "[.]","\\1<prd>\\2<prd>\\3<prd>",text)
        text = re.sub(alphabets + "[.]" + alphabets + "[.]","\\1<prd>\\2<prd>",text)
        text = re.sub(" "+suffixes+"[.] "+starters," \\1<stop> \\2",text)
        text = re.sub(" "+suffixes+"[.]"," \\1<prd>",text)
        text = re.sub(" " + alphabets + "[.]"," \\1<prd>",text)
        if "”" in text: text = text.replace(".”","”.")
        if "\"" in text: text = text.replace(".\"","\".")
        if "!" in text: text = text.replace("!\"","\"!")
        if "?" in text: text = text.replace("?\"","\"?")
        text = text.replace(".",".<stop>")
        text = text.replace("?","?<stop>")
        text = text.replace("!","!<stop>")
        text = text.replace("<prd>",".")
        sentences = text.split("<stop>")
        sentences = [s.strip() for s in sentences]
        if sentences and not sentences[-1]: sentences = sentences[:-1]
        return sentences


    def is_camel_case(string, can_be_snake_case = True):
        if not string:
            return False
        
        if ' ' in string:
            return False
        
        if string.isspace():
            return False
        
        # TODO: Describe why is `can_be_snake_case` needed
        if can_be_snake_case and '_' in string:
            return False

        return True


    def convert_string_to_standard_convention(name):
        # Convert text in any convention to a lower-cased text where each word is delimited with a space

        # TODO: Convert camel case starting with a small letter
        # E.g.: periodOfInterruptionOfInsurance, dateOfChangeOfInsurance
        
        if not name:
            return ""
        
        # Detect full upper-case name
        is_all_uppercase = all((char.isupper() or char in string.punctuation) for char in name)
        if is_all_uppercase:
            name = name.lower()

        # Detect snake_case_convention
        if name[0].islower() and '_' in name:
            name_parts = name.split('_')
            result = ""

            for name_part in name_parts:
                result += name_part + ' '
            
            result = result.rstrip() # Remove trailing space
            return result.lower()
        
        # Detect CamelCase
        if TextUtility.is_camel_case(name, can_be_snake_case=False):
            result = ""

            for index, char in enumerate(name):
                if index == 0:
                    result += char
                    continue

                if (char.isupper()):
                    result += ' '
                    # If the next word is all in upper-case then make one space and skip it
                    # E.g. indexURL -> index URL
                    if (index + 1 < len(name) and name[index + 1].isupper()):
                        result += name[index:]
                        break
                    else:
                        result += char.lower()
                else:
                    result += char

            return result.lower()

        return name.lower()


    # Source: https://gist.github.com/bgusach/a967e0587d6e01e889fd1d776c5f3729
    def multireplace(string, replacements, ignore_case=False):
        """
        Given a string and a replacement map, it returns the replaced string.
        :param str string: string to execute replacements on
        :param dict replacements: replacement dictionary {value to find: value to replace}
        :param bool ignore_case: whether the match should be case insensitive
        :rtype: str
        """
        if not replacements:
            # Edge case that'd produce a funny regex and cause a KeyError
            return string
        
        # If case insensitive, we need to normalize the old string so that later a replacement
        # can be found. For instance with {"HEY": "lol"} we should match and find a replacement for "hey",
        # "HEY", "hEy", etc.
        if ignore_case:
            def normalize_old(s):
                return s.lower()

            re_mode = re.IGNORECASE

        else:
            def normalize_old(s):
                return s

            re_mode = 0

        replacements = {normalize_old(key): val for key, val in replacements.items()}
        
        # Place longer ones first to keep shorter substrings from matching where the longer ones should take place
        # For instance given the replacements {'ab': 'AB', 'abc': 'ABC'} against the string 'hey abc', it should produce
        # 'hey ABC' and not 'hey ABc'
        rep_sorted = sorted(replacements, key=len, reverse=True)
        rep_escaped = map(re.escape, rep_sorted)
        
        # Create a big OR regex that matches any of the substrings to replace
        pattern = re.compile("|".join(rep_escaped), re_mode)
        
        # For each match, look up the new string in the replacements, being the key the normalized old string
        return pattern.sub(lambda match: replacements[normalize_old(match.group(0))], string)


    def create_query(entity):
        #query = f'What attributes does \"{entity}\" have?'
        #query = f"Information about {entity}"
        query = f"What are the information about {entity}?"
        return query


    def is_bullet_point(text):
        # E.g.: - text, * text, (a) text
        if text[0] == '-' or text[0] == '*' or text[0] == '(':
            return True
        
        # For example text starts with: "I)", "a)", "I."
        if len(text) > 1 and (text[1] == ')' or text[1] == '.'):
            return True

        # For example text starts with: "15)", "aa)", "15."
        if len(text) > 2 and (text[2] == ')' or text[2] == '.'):
            return True
        
        return False


    # TODO: This method is for syntactic filtering so it should be in the script `syntactit_text_filterer.py`
    def split_text_into_chunks(domain_description):
        # Divide the text into: sentences and bullets
        lines = domain_description.split(sep='\n')
        lines = list(filter(None, lines)) # Remove empty elements
        sentences = [TextUtility.split_into_sentences(line) for line in lines]
        sentences = [x for xs in sentences for x in xs] # flatten sentences
        
        edited_sentences = []
        text_before_bullet_points = ""
        chunk_before_bullet_points_index = 0
        is_bullet_point_processing = False

        is_bullet_point_enhancement = True
        if not is_bullet_point_enhancement:
            return sentences, sentences, [], []
        
        # If a sentence contains pronoun then enhance then chunk by adding the previous sentence
        # It would be better to replace the pronoun instead. However, there is no easy way to do this.
        is_pronouns_enhancement = True

        is_bullet_point_list = []
        title_references = []

        # For each bullet point prepend text from row before these bullet points
        # TODO: Refactor: no need to do for example "edited_sentences.append()"
        # TODO: Do TextUtility.is_bullet_point() testing only once not in two different parts of code
        for index, sentence in enumerate(sentences):

            if index == 0:
                edited_sentences.append(sentence)
                is_bullet_point_list.append(False)
                title_references.append(-1)
                continue

            if is_bullet_point_processing:
                if TextUtility.is_bullet_point(sentence):
                    edited_sentences.append(f"{sentence[:2]}{text_before_bullet_points} {sentence[2:]}")
                    is_bullet_point_list.append(True)
                    title_references.append(chunk_before_bullet_points_index)
                else:
                    is_bullet_point_processing = False
                    edited_sentences.append(sentence)
                    is_bullet_point_list.append(False)
                    title_references.append(-1)
                continue

            if TextUtility.is_bullet_point(sentence):
                text_before_bullet_points = sentences[index - 1]
                chunk_before_bullet_points_index = index - 1
                # TODO: if `text_before_bullet_points` is a bullet point then skip the current group of bullet points
                #   - for example this can happen when the file starts with I), II), III), ...
                edited_sentences.append(f"{sentence[:2]}{text_before_bullet_points} {sentence[2:]}")
                is_bullet_point_processing = True
                is_bullet_point_list.append(True)
                title_references.append(chunk_before_bullet_points_index)
                continue

            is_sentence_enhanced = False
            if is_pronouns_enhancement:
                for pronoun in PRONOUNS_TO_DETECT:
                    # If the sentence starts with a pronoun then append the previous sentences too for more context
                    if sentence.startswith(pronoun):
                        is_sentence_enhanced = True
                        edited_sentences.append(f"{sentences[index - 1]} {sentence}")
                        break

            if not is_sentence_enhanced:
                edited_sentences.append(sentence)
            is_bullet_point_list.append(False)
            title_references.append(-1)

        return edited_sentences, sentences, is_bullet_point_list, title_references


    # TODO: Add sliding window to each sentence
    def split_file_into_chunks_sliding_window(file_name):
        with open(file_name) as file:
            lines = [line.rstrip() for line in file]

        # Divide the text into: sentences and bullets
        sentences = [TextUtility.split_into_sentences(line) for line in lines]
        sentences = [x for xs in sentences for x in xs] # flatten sentences
        return sentences
    

    def find_text_in_domain_description(inference, domain_description, user_choice):

        # Convert all text to lower-case as LLM sometimes does not generate case-sensitive inference
        domain_description = domain_description.lower()
        
        # Split inference if it contains more inferences:
        # E.g.: "The insurance contract shall always contain... the limit of the insurance benefit..."
        # -> ["The insurance contract shall always contain", "the limit of the insurance benefit"]
        result = []

        inference_parts = inference.split(sep="...")
        inference_parts = list(filter(None, inference_parts)) # Remove empty strings

        inference_parts_total = len(inference_parts)
        inference_parts_found = 0

        for inference_part in inference_parts:
            inference_part = inference_part.lower().strip()
            is_inference_found = False

            # TODO: Do not iterate from 0 every time because each inference part should not be at index < the previous part index
            for i in range(len(domain_description)):
                # Append all occurencies of the `inference_part` in the `domain_description`
                if domain_description[i:].startswith(inference_part):
                    is_inference_found = True
                    result.append(i)
                    result.append(i + len(inference_part))

            # TODO: Backup plan: if an inference is not found at least try to find some relevant setence with lemmatization
            # Relevant sentece = sentence that contains all lemmas in `inference_part` (probably except brackets, punctuation etc.)        
            if is_inference_found:
                inference_parts_found += 1
            elif not user_choice == UserChoice.CLASSES.value:
                new_result = TextUtility.findSubstrings(inference_part, domain_description)
                if new_result:
                    is_inference_found = True
                    for inference_index in new_result:
                        result.append(inference_index)
                else:
                    print(f"Warning: inference not found: {inference_part}")


        # TODO: Fix bug with too many inference indexes
        # Do not limit number of outputs if we are suggesting entities
        if not user_choice == UserChoice.CLASSES.value and len(result) > 10:
            result = []

        return result, inference_parts_found, inference_parts_total


    def show_inference_in_domain_description(inference_indexes, domain_description):
        # TODO: Add domain description as an method argument
        # E.g. inference_indexes = [4, 10, 20, 24]

        from termcolor import cprint

        start_at_index = 0
        
        for i in range(0, len(inference_indexes), 2):
            inference_index_start = inference_indexes[i]
            inference_index_end = inference_indexes[i + 1]
            print(domain_description[start_at_index : inference_index_start], end="")
            cprint(domain_description[inference_index_start : inference_index_end], "green", "on_black", end='')
            start_at_index = inference_index_end

        
        print(domain_description[start_at_index:])
        print("\n\n")


    def longest_substring(s1, s2):

        seq_match = SequenceMatcher(None, s1, s2)

        match = seq_match.find_longest_match(0, len(s1), 0, len(s2))

        # returns the longest substring
        if (match.size != 0):
            return (s1[match.a: match.a + match.size])
        else:
            return ("")


    def find_inference_indexes(inference_parts, domain_description):
        result = []
        for inference_part in inference_parts:
            inference_part = inference_part.lower().strip()

            last_result_index = 0
            append_only_first_occurence = False

            # Skip immediately to the previous detected inference as the next inference part should not be before the previous one
            # We cannot skip immediately to the index at result[-1] if there are more inferences found for the previous inference part
            if result:
                last_result_index = result[1]
                append_only_first_occurence = True

            for i in range(last_result_index, len(domain_description)):

                # Append all occurencies of the `inference_part` in the `domain_description`
                if domain_description[i:].startswith(inference_part):
                    result.append(i)
                    result.append(i + len(inference_part))

                    if append_only_first_occurence:
                        break

        # TODO: Find out a better way to analyze if everything was found
        is_everything_found = len(result) > 2
        return result, is_everything_found


    def findSubstrings(inference, domain_description):
        longest_substring = TextUtility.longest_substring(domain_description, inference)

        if not longest_substring:
            return

        if inference.startswith(longest_substring):
            inference_parts = [inference[0:len(longest_substring)], inference[len(longest_substring):]]
            result, is_everything_found = TextUtility.find_inference_indexes(inference_parts, domain_description)

            # Try to detect one typo by dividing inference into two inferences and skipping the character at which it failed
            if not is_everything_found:
                inference_parts = [inference[0:len(longest_substring)], inference[len(longest_substring) + 1:]]
                result, is_everything_found = TextUtility.find_inference_indexes(inference_parts, domain_description)
            
            return result
        
        elif inference.endswith(longest_substring):
            # Symmetrically do the same thing as before
            split = len(inference) - len(longest_substring)
            inference_parts = [inference[:split], inference[split:]]
            result, is_everything_found = TextUtility.find_inference_indexes(inference_parts, domain_description)

            # Try to detect one typo by dividing inference into two inferences and skipping the character at which it failed
            if not is_everything_found:
                inference_parts = [inference[0:len(longest_substring)], inference[len(longest_substring) + 1:]]
                result, is_everything_found = TextUtility.find_inference_indexes(inference_parts, domain_description)
            
            return result

        else: # Longest substring was detected in the middle of the inference

            # Get start index and end index of the middle part of the inference
            for i in range(len(inference)):
                if inference[i:].startswith(longest_substring):
                    start_index = i
                    end_index = i + len(longest_substring)
                    break

            inference_parts = [inference[:start_index], inference[start_index : end_index], inference[end_index:]]
            result, is_everything_found = TextUtility.find_inference_indexes(inference_parts, domain_description)

            return result

    
    def are_tuples_sorted(tuples):

        last_x1 = 0
        last_x2 = 0

        for i in range(len(tuples)):
            x1 = tuples[i][0]
            x2 = tuples[i][1]

            if x1 < last_x1:
                return False

            if x1 == last_x1 and x2 < last_x2:
                return False
            
            last_x1 = x1
            last_x2 = x2
    
        return True




    def merge_original_texts(input):

        input = sorted(input, key=lambda x: (x[0], x[1]))

        i = 0
        while i < len(input):

            if i + 1 >= len(input):
                break

            # [(x1, x2, l1), (y1, y2, l2)]
            x1 = input[i][0]
            x2 = input[i][1]
            l1 = input[i][2]
            y1 = input[i + 1][0]
            y2 = input[i + 1][1]
            l2 = input[i + 1][2]

            is_still_sorted = x1 < y1 or (x1 == y1 and x2 <= y2)

            if not is_still_sorted:
                # E.g.: Input: [(2, 4, "l1"), (2, 6, "l2"), (2, 8, "l3")]
                # After first step: [(2, 4, "l1, l2"), (5, 6, "l2"), (2, 8, "l3")]
                # - first index in second tuple is greater than first index in third tuple
                # -> we need to sort the tuples again and start from the beginning
                input = sorted(input, key=lambda x: (x[0], x[1]))
                i = 0

            elif x1 == y1:

                if x2 == y2:
                    merged_tuples = (x1, x2, f"{l1}, {l2}")
                    input[i] = merged_tuples
                    input.pop(i + 1)

                else:
                    merged_tuples = (x1, x2, f"{l1}, {l2}")
                    input[i] = merged_tuples
                    input[i + 1] = (x2 + 1, y2, l2)

            elif x2 == y1:
                merged_tuples = (x1, y2, f"{l1}, {l2}")
                input[i] = merged_tuples
                input.pop(i + 1)
            
            elif x2 > y1 and x2 >= y2:
                merged_tuples = (x1, x2, f"{l1}, {l2}")
                input[i] = merged_tuples
                input.pop(i + 1)
            
            elif x2 > y1 and x2 < y2:
                merged_tuples = (y1, x2, f"{l1}, {l2}")
                input[i] = (x1, y1 - 1, l1)
                input.insert(i + 1, merged_tuples)
                input[i + 2] = (x2 + 1, y2, l2)

            else:
                i += 1

        return input