const BASE_URL = "http://127.0.0.1:5000/" // "https://llm-backend.opendata.cz/"
export const HEADER = { "Content-Type": "application/json" }

export const SIDEBAR_BUTTON_SIZE = "small"
export const SIDEBAR_BUTTON_COLOR = "secondary"

const SUGGEST_ITEMS_ENDPOINT = "suggest/items"
const SUGGEST_SINGLE_FIELD_ENDPOINT = "suggest/single_field"
const SUGGEST_SUMMARY_ENDPOINT = "suggest/summary"

const SAVE_SUGESTED_ITEM = "save/suggested_item"
const SAVE_SUGESTED_SINGLE_FIELD = "save/suggested_single_field"
const SAVE_SUGESTED_SUMMARY = "save/suggested_summary"

const MERGE_ORIGINAL_TEXT_ENDPOINT = "merge_original_texts"

export const SUGGEST_ITEMS_URL = BASE_URL + SUGGEST_ITEMS_ENDPOINT
export const SUGGEST_SINGLE_FIELD_URL = BASE_URL + SUGGEST_SINGLE_FIELD_ENDPOINT
export const SUGGEST_SUMMARY_URL = BASE_URL + SUGGEST_SUMMARY_ENDPOINT

export const SAVE_SUGESTED_ITEM_URL = BASE_URL + SAVE_SUGESTED_ITEM
export const SAVE_SUGESTED_SINGLE_FIELD_URL = BASE_URL + SAVE_SUGESTED_SINGLE_FIELD
export const SAVE_SUGESTED_SUMMARY_URL = BASE_URL + SAVE_SUGESTED_SUMMARY

export const MERGE_ORIGINAL_TEXT_URL = BASE_URL + MERGE_ORIGINAL_TEXT_ENDPOINT

export const DATASPECER_MODEL_URL = "https://backend.dataspecer.com/simplified-semantic-model?iri="