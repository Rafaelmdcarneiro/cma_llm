from text_utility import TextUtility
from morphodita_tagger import Morphodita_Tagger
import json
import os

PATH_TO_DATA_DIRECTORY = os.path.join("data", "56-2001-extract-llm-assistant-test-case")
INPUT_DOMAIN_DESCRIPTION_FILE_NAME = "56-2001-extract-llm-assistant-test-case.txt"
# INPUT_DOMAIN_DESCRIPTION_FILE_PATH = os.path.join(PATH_TO_DATA_DIRECTORY, INPUT_DOMAIN_DESCRIPTION_FILE_NAME)
INPUT_DOMAIN_DESCRIPTION_FILE_PATH = "domain-modeling-benchmark\\evaluation domain models\\college 1dc8e791-1d0e-477c-b5c2-24e376e3f6f1\\domain-description-01.txt"

CACHED_FILE_PATH = os.path.join("cache", INPUT_DOMAIN_DESCRIPTION_FILE_NAME)
OUTPUT_FILE = "out_manual.txt"

IS_SAVE_OUTPUT_TO_FILE = True

IS_CACHE_DOMAIN_DESCRIPTION = False
IS_USE_CACHE = False


class SyntacticTextFilterer:

    def __init__(self):
        self.tagger = Morphodita_Tagger()


    def load_chunks(self, domain_description):
        # Edited chunks contain more text than chunks for more context
        self.edited_chunks, self.chunks, self.is_bullet_point_list, self.title_references = TextUtility.split_text_into_chunks(domain_description)

        if IS_CACHE_DOMAIN_DESCRIPTION:
            SyntacticTextFilterer.cache_chunks(self)
            print("Domain description successfully cached")


    def cache_chunks(self):
        with open(CACHED_FILE_PATH, 'w') as file:
            for chunk in self.edited_chunks:
                lemmas = self.tagger.get_lemmas_one_by_one(chunk)
                lemmas_json = json.dumps(lemmas)
                lemmas_json = '{"lemmas" : ' + lemmas_json + ' }'

                file.write(f"{lemmas_json}\n")


    def get(self, entity, domain_description):

        result = []
        is_chunk_included = []

        self.load_chunks(domain_description)
        entity_lemmas = self.tagger.get_lemmas_one_by_one(entity)

        # print("Entity lemmas: ", entity_lemmas)

        if IS_USE_CACHE:

            with open(CACHED_FILE_PATH, 'r') as caching_file:
                for index, chunk in enumerate(self.chunks):
                    chunk_lemmas = caching_file.readline()
                    chunk_lemmas_json = json.loads(chunk_lemmas)
                    chunk_lemmas_list = chunk_lemmas_json['lemmas']

                    # Check if entity lemmas are contained in chunk lemmas
                    are_entity_lemmas_contained = True
                    for entity_lemma in entity_lemmas:
                        if not entity_lemma in chunk_lemmas_list:
                            are_entity_lemmas_contained = False
                            is_chunk_included.append(False)
                            break
                    
                    if are_entity_lemmas_contained:
                        is_chunk_included.append(True)

                        # If a bullet point is included then make sure that the text in front of these bullet points is included
                        if self.is_bullet_point_list[index]:
                            if not is_chunk_included[self.title_references[index]]:
                                result.append(self.chunks[self.title_references[index]])
                                is_chunk_included[self.title_references[index]] = True

                        result.append(chunk)
                    

            return result
        

        # No cache
        for index, chunk in enumerate(self.chunks):

            enhanced_chunk = self.edited_chunks[index]
            chunk_lemmas_list = self.tagger.get_lemmas_one_by_one(enhanced_chunk)


            # Check if entity lemmas are contained in chunk lemmas
            are_entity_lemmas_contained = True
            for entity_lemma in entity_lemmas:
                if not entity_lemma in chunk_lemmas_list:
                    are_entity_lemmas_contained = False
                    is_chunk_included.append(False)
                    break
            
            if are_entity_lemmas_contained:
                is_chunk_included.append(True)

                # If a bullet point is included then make sure that the text in front of these bullet points is included
                if self.is_bullet_point_list[index]:
                    if not is_chunk_included[self.title_references[index]]:
                        result.append(self.chunks[self.title_references[index]])
                        is_chunk_included[self.title_references[index]] = True

                result.append(chunk)

        return result
        

    def get_relevant_texts_and_save_to_file(entity_lemmas, chunks):
        with open(CACHED_FILE_PATH, 'r') as caching_file:
            with open(OUTPUT_FILE, 'w') as output_file:
                for chunk in chunks:

                    # Load chunk lemmas from the cached file
                    chunk_lemmas = caching_file.readline()
                    chunk_lemmas_json = json.loads(chunk_lemmas)
                    chunk_lemmas_list = chunk_lemmas_json['lemmas']

                    # Check if entity lemmas are contained in chunk lemmas
                    are_entity_lemmas_contained = True
                    for entity_lemma in entity_lemmas:
                        if not entity_lemma in chunk_lemmas_list:
                            are_entity_lemmas_contained = False
                            break
                    
                    if are_entity_lemmas_contained:
                        output_file.write(f"{chunk}\n")

def main():

    # Simple usage example
    entity = "green card"
    with open(INPUT_DOMAIN_DESCRIPTION_FILE_PATH, 'r') as domain_description_file:
        domain_description = domain_description_file.read()

    relevant_text_finder = SyntacticTextFilterer()
    relevant_texts = relevant_text_finder.get(entity, domain_description)

    if IS_SAVE_OUTPUT_TO_FILE:
        with open(OUTPUT_FILE, 'w') as file:
            for relevant_text in relevant_texts:
                file.write(f"{relevant_text}\n")
        return
    
    # Else print relevant texts in the terminal
    for relevant_text in relevant_texts:
        print(f"{relevant_text}\n")


if __name__ == "__main__":
    main()