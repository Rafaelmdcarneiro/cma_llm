from sentence_transformers import SentenceTransformer, util
from text_utility import PRONOUNS, TextUtility
import os


SCORE_NECESSARY_THRESHOLD = 0.6

class SemanticComparator:

    def __init__(self):
        # self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.model = SentenceTransformer("all-mpnet-base-v2") # Symmetric
        # self.model = SentenceTransformer('msmarco-distilbert-base-v4') # Asymmetric


    def encode(self, queries):
        self.model.encode(queries, convert_to_tensor=True)


    def compare_elements(self, actual_element, expected_elements):
        queries_embeddings = self.model.encode(actual_element, convert_to_tensor=True)
        chunks_embeddings = self.model.encode(expected_elements, convert_to_tensor=True)

        scores = util.cos_sim(queries_embeddings, chunks_embeddings)
        print(scores)


    def compare_multiple_elements(self, actual_elements, expected_elements):
        queries_embeddings = self.model.encode(actual_elements, convert_to_tensor=True)
        chunks_embeddings = self.model.encode(expected_elements, convert_to_tensor=True)

        scores_list = util.cos_sim(queries_embeddings, chunks_embeddings)
        print()

        for index, scores in enumerate(scores_list):

            is_accepted = False
            for score in scores:
                if score > SCORE_NECESSARY_THRESHOLD:
                    is_accepted = True
                    break

            if is_accepted:
                print(f"+ {actual_elements[index]}, scores: {scores_list[index]}")
            else:
                print(f"- {actual_elements[index]}, scores: {scores_list[index]}")

        # for i in range(len(actual_elements)):

        #     is_accepted = False
        #     for j in range(len(expected_elements)):
        #         current_score = scores[i, j]

        #         if current_score > SCORE_NECESSARY_THRESHOLD:
        #             is_accepted = True
        #             break

        #     if is_accepted:
        #         print(f"+Accepted: {actual_elements[i]}, scores: {scores[:, i]}")
        #     else:
        #         print(f"-Rejected: {actual_elements[i]}, scores: {scores[:, i]}")


    


def main():

    actual_elements = ["notification date", "start date", "interruption period", "change date", "end date", "date"]
    # actual_elements = "end date"
    expected_elements = ["date of notification", "date of commencement", "period of interruption", "date of change", "date of termination"]

    comparator = SemanticComparator()
    # comparator.compare_elements(actual_element, expected_elements)
    comparator.compare_multiple_elements(actual_elements, expected_elements)



if __name__ == "__main__":
    main()