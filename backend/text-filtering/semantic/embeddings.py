# Example from: https://huggingface.co/BAAI/bge-large-en-v1.5

from FlagEmbedding import FlagModel
from termcolor import cprint
import numpy as np
import os
import time
from text_utility import TextUtility


#INPUT_TEXT = "What do you know about Dormitory Units?"
#INPUT_TEXT = "Which part of the text contains info about courses?"
#INPUT_TEXT = "Course mentions"
#INPUT_TEXT = "Info about courses"
#INPUT_TEXT = "What do you know about professors?"
# INPUT_TEXT = "Information about motorcycles"
INPUT_TEXT = "bodywork"

SCORE_MIN_THRESHOLD = 0.5
SCORE_POSITIVE_THRESHOLD = 0.6

MODEL_PATH = os.path.join("BAAI", "bge-large-en-v1.5")


def print_green_on_black(x):
    return cprint(x, 'green', 'on_black')

def print_yellow_on_black(x):
    return cprint(x, 'yellow', 'on_black')

class Embeddings:
    def __init__(self):
        self.passage_embeddings = None
        query_instruction_for_retrieval = "Represent this sentence for searching relevant passages: "
        self.model = FlagModel(MODEL_PATH, query_instruction_for_retrieval=query_instruction_for_retrieval,
                  use_fp16=False) # Setting use_fp16 to True speeds up computation with a slight performance degradation

    # for s2p(short query to long passage) retrieval task, suggest to use encode_queries() which will automatically add the instruction to each query
    # corpus in retrieval task can still use encode() or encode_corpus(), since they don't need instruction
    def encode_queries(self, queries):
        return self.model.encode_queries(queries)


    def encode(self, chunks_of_text):
        return self.model.encode(chunks_of_text)


    def compare_two_names(self, name1, name2):
        name1_encoded = self.encode(name1)
        name2_encoded = self.encode(name2)

        scores = name1_encoded @ name2_encoded.T
        scores = scores.flatten()
        return scores[0]
    

    def __parse_result(self, scores, text_chunks, min_threshold, is_debug):

        if is_debug:
            # print(f"Input: {queries[0]}")
            for i in range(len(text_chunks)):
                msg = f"Score: {scores[i]} | {text_chunks[i]}"
                if scores[i] >= SCORE_POSITIVE_THRESHOLD:
                    print_green_on_black(msg)
                elif scores[i] >= min_threshold:
                    print_yellow_on_black(msg)
                else:
                    print(msg)
        print()

        result = ""
        for i in range(len(text_chunks)):
            if scores[i] >= min_threshold:
                is_bullet_point = not text_chunks[i][0].isupper()
                # print(f"Is bullet point: {is_bullet_point}; letter: {text_chunks[i][0]}")

                # TODO: if is_bullet_point: prepend the first sentence before this bullet point only if it is not already contained in the result
                # It is in the result if:
                #   I) This sentence has >= score than min_threshold
                #   II) This sentence was already prepended because of some previous bullet point

                # TODO: if text_chunks[i] contains a sentence and the previous sentence does not have score >= min_threshold then
                # add a new line for separation to make it clear that these part of texts probably does not follow the same context

                if result == "":
                    result += text_chunks[i]
                else:
                    result += f"\n{text_chunks[i]}" if is_bullet_point else f" {text_chunks[i]}"
        
        # If result is empty try again the same thing but with a lower min threshold
        if result == "":
            for _ in range(3):
                result = self.__parse_result(scores, text_chunks, min_threshold - 0.05, is_debug)
                if result != "":
                    return result
        
        return result

    
    def remove_unsimilar_text(self, queries, plain_text="", text_chunks=[], is_debug=True):

        if len(text_chunks) == 0:
            text_chunks = TextUtility.split_into_sentences(plain_text)

        queries_embeddings = self.encode_queries(queries)

        is_caching = True
        if is_caching:
            cached_file_name = "cached_embeddings.npy"
            if os.path.isfile(cached_file_name):
                print("Using cached embeddings")
                self.passage_embeddings = np.load(cached_file_name)
            else:
                self.passage_embeddings = self.encode(text_chunks)
                np.save('cached_embeddings.npy', self.passage_embeddings)
        else:
            if self.passage_embeddings == None:
                print("Encoding text chunks")
                self.passage_embeddings = self.encode(text_chunks)
                print("Text chunks encoded")
        
        print("Computing score")
        scores = queries_embeddings @ self.passage_embeddings.T
        scores = scores.flatten()
        print("Score computed")

        return self.__parse_result(scores, text_chunks, SCORE_MIN_THRESHOLD, is_debug)


def main():

    time_start = time.time()

    file_name = "input.txt"
    chunks = TextUtility.split_file_into_chunks(file_name)

    embeddings = Embeddings()
    result = embeddings.remove_unsimilar_text(queries=[INPUT_TEXT], text_chunks=chunks)
    print(f"Result:\n{result}")

    time_end = time.time()
    print(f"\nTime: {time_end - time_start:.2f} seconds")

if __name__ == "__main__":
    main()