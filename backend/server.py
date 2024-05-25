from flask import Flask, request
from flask_cors import CORS, cross_origin
import json
import os
import time
import logging
import sys
from LLM_assistant import LLMAssistant

sys.path.append("utils/")
from text_utility import LOGGER_NAME, Field, TextUtility, UserChoice


app = Flask(__name__)
llm_assistant = None

TIMESTAMP = time.strftime("%Y-%m-%d-%H-%M-%S")
LOG_DIRECTORY = "logs"
LOG_FILE_PATH = os.path.join(LOG_DIRECTORY, f"{TIMESTAMP}-log.txt")

logging.basicConfig(level=logging.DEBUG, format="%(message)s", filename=LOG_FILE_PATH, filemode="w")
logger = logging.getLogger(LOGGER_NAME)


STORAGE_DIRECTORY = "storage"

# CORS error from frontend solution: https://stackoverflow.com/a/33091782
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"


@app.route("/suggest/items", methods=["POST"])
def suggest_items():

    body_data = request.get_json()
    source_class = body_data.get("sourceClass", "")
    target_class = body_data.get("targetClass", "")

    user_choice = body_data["userChoice"]
    domain_description = body_data["domainDescription"]
    text_filtering_variation = body_data["textFilteringVariation"]

    return llm_assistant.suggest_items(source_class, target_class, user_choice, domain_description=domain_description, text_filtering_variation=text_filtering_variation, count_items_to_suggest=5)



@app.route("/suggest/single_field", methods=["POST"])
def suggest_single_field():

    body_data = request.get_json()
    source_class = body_data.get("sourceClass", "")
    target_class = body_data.get("targetClass", "")

    name = body_data["name"]
    field = body_data["field"]
    domain_description = body_data["domainDescription"]
    user_choice = body_data["userChoice"]
    text_filtering_variation = body_data["textFilteringVariation"]

    if user_choice == "associations":
        user_choice = UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value

    single_field = llm_assistant.suggest_single_field(user_choice, name, source_class, target_class, domain_description, field,text_filtering_variation=text_filtering_variation)

    return single_field


@app.route("/suggest/summary", methods=["POST"])
def suggest_summary():

    body_data = request.get_json()
    summary_type = body_data["summaryType"]
    domain_description = body_data["domainDescription"]
    conceptual_model = body_data["conceptualModel"]

    if summary_type == UserChoice.SUMMARY_PLAIN_TEXT.value:
        return llm_assistant.suggest_summary_plain_text(conceptual_model, domain_description)

    elif summary_type == UserChoice.SUMMARY_DESCRIPTIONS.value:
        return llm_assistant.suggest_summary_descriptions(conceptual_model, domain_description)

    else:
        return f"Unexpected summary type: {summary_type}", 400


@app.route("/merge_original_texts", methods=["POST"])
def merge_original_texts():

    body_data = request.get_json()
    original_text_indexes_object = body_data["originalTextIndexesObject"]
    # print(f"Received: {original_text_indexes_object}\n")

    parsed_original_text_indexes_object = [(item["indexes"][0], item["indexes"][1], item["label"]) for item in original_text_indexes_object]
    result = TextUtility.merge_original_texts(parsed_original_text_indexes_object)

    return result


def save_item_to_storage(item):

    # TODO: Check storage size
    # If the storage size > 1GB then print warning and do not store anything

    timestamp = time.strftime("%Y-%m-%d-%H-%M-%S")
    file_to_write_path = f"{os.path.join(STORAGE_DIRECTORY, timestamp)}.json"

    with open(file_to_write_path, "w") as file:
        json.dump(item, file)


@app.route("/save/suggested_item", methods=["POST"])
def save_suggested_item():

    body_data = request.get_json()
    user_choice = body_data["userChoice"]
    domain_description = body_data["domainDescription"]
    item = body_data["item"]
    isPositive = body_data["isPositive"]
    text_filtering_variation = body_data["textFilteringVariation"]

    completed_item = { "domain_description": domain_description, "item": item, "is_positive": isPositive }

    is_domain_description = domain_description != ""
    is_chain_of_thoughts = (user_choice == UserChoice.ATTRIBUTES.value or user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value)
    prompt = llm_assistant.get_prompt(user_choice=user_choice, is_chain_of_thoughts=is_chain_of_thoughts, is_domain_description=is_domain_description)
    completed_item["prompt"] = prompt

    if user_choice == UserChoice.ATTRIBUTES or user_choice == UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value:
        relevant_texts = llm_assistant.get_relevant_texts(domain_description=domain_description, source_class=item[Field.SOURCE_CLASS.value], filtering_variation=text_filtering_variation)
        completed_item["filtered_domain_description"] = relevant_texts

    save_item_to_storage(completed_item)

    return "Done"


@app.route("/save/suggested_single_field", methods=["POST"])
def save_suggested_single_field():

    body_data = request.get_json()
    user_choice = body_data["userChoice"]
    field_name = body_data["fieldName"]
    field_text = body_data["fieldText"]
    source_class = body_data.get("sourceClass", "")
    domain_description = body_data["domainDescription"]
    isPositive = body_data["isPositive"]
    text_filtering_variation = body_data["textFilteringVariation"]

    completed_item = { "domain_description": domain_description, "field_name": field_name, "field_text": field_text, "is_positive": isPositive }

    prompt = llm_assistant.get_prompt(user_choice=user_choice, field_name=field_name, is_chain_of_thoughts=False)
    completed_item["prompt"] = prompt

    relevant_texts = llm_assistant.get_relevant_texts(domain_description=domain_description, source_class=source_class, filtering_variation=text_filtering_variation)
    completed_item["filtered_domain_description"] = relevant_texts

    save_item_to_storage(completed_item)

    return "Done"


@app.route("/save/suggested_summary", methods=["POST"])
def save_suggested_summary():

    body_data = request.get_json()
    summaryType = body_data["summaryType"]
    domain_description = body_data["domainDescription"]
    conceptual_model = body_data["conceptualModel"]
    summary = body_data["summary"]
    isPositive = body_data["isPositive"]

    completed_item = { "domain_description": domain_description, "summary": summary, "is_positive": isPositive, "conceptual_model": conceptual_model }

    prompt = llm_assistant.get_prompt(user_choice=summaryType, is_chain_of_thoughts=False)
    completed_item["prompt"] = prompt

    save_item_to_storage(completed_item)

    return "Done"


@app.route('/')
def index():
    return "LLM assistant backend"


if __name__ == "__main__":

    if (not os.path.exists(LOG_DIRECTORY)):
        os.makedirs(LOG_DIRECTORY)
    
    if (not os.path.exists(STORAGE_DIRECTORY)):
        os.makedirs(STORAGE_DIRECTORY)

    llm_assistant = LLMAssistant()

    app.run(port=5000, threaded=False, host="0.0.0.0")