from sentence_transformers import SentenceTransformer, util
from text_utility import PRONOUNS_TO_DETECT, TextUtility
import os


# Settings for "all-MiniLM-L6-v2"
SCORE_NECESSARY_THRESHOLD = 0.08
RANGE_FROM_TOP = 0.46 # E.g. if max score is 0.7 then invalidate any text with score lower than 0.7 - `RANGE_FROM_TOP`

# Settings for "all-mpnet-base-v2"
# SCORE_NECESSARY_THRESHOLD = 0.04
# RANGE_FROM_TOP = 0.52


class SemanticTextFilterer:

    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        # self.model = SentenceTransformer('all-mpnet-base-v2') # Symmetric
        # self.model = SentenceTransformer('msmarco-distilbert-base-v4') # Asymmetric
    
    def encode(self, queries):
        self.model.encode(queries, convert_to_tensor=True)
    

    def enhance_chunks(self, chunks):

        enhanced_chunks = []

        for index, sentence in enumerate(chunks):
            if (index == 0):
                enhanced_chunks.append(sentence)
                continue

            is_sentence_enhanced = False
            for pronoun in PRONOUNS_TO_DETECT:
                if sentence.startswith(pronoun):
                    is_sentence_enhanced = True
                    enhanced_chunks.append(f"{chunks[index - 1]} {sentence}")
                    break
            
            if not is_sentence_enhanced:
               enhanced_chunks.append(sentence)
        
        return enhanced_chunks

    

    def get(self, entity, domain_description):

        chunks = TextUtility.split_into_sentences(domain_description)
        chunks = self.enhance_chunks(chunks)

        query = f"Info about {entity}"

        queries_embeddings = self.model.encode(query, convert_to_tensor=True)
        chunks_embeddings = self.model.encode(chunks, convert_to_tensor=True)

        scores = util.cos_sim(queries_embeddings, chunks_embeddings)
        max_score = scores[0].max().item()

        threshold = max(max_score - RANGE_FROM_TOP, SCORE_NECESSARY_THRESHOLD)

        result = []

        for i in range(len(chunks)):
            score = scores[0, i]
            
            if score > threshold:
                result.append(chunks[i])
        
        return result


def main():

    # Simple usage example
    path = os.path.join("domain-modeling-benchmark", "evaluation domain models", "farming 97627e23829afb", "domain-description-01.txt")
    with open(path) as file:
        domain_description = file.read()

    filterer = SemanticTextFilterer()
    entity = "farmer"
    actual_texts = filterer.get(entity, domain_description)
    print(actual_texts)


if __name__ == "__main__":
    main()