# API Endpoints


**POST** /suggest/items

| Parameter | Mandatory  | Data type | Description  |
|---|---|---|---|
| userChoice  | yes |  string (`classes`, `attributes`, `associations1`, `associations2`) | What items the LLM should suggest. `associations1` means associations where the source class is provided, `associations2` means associations where both the source class and the target class is provided. |
| domainDescription  | yes | string | Solely based on this text the LLM generates suggestions. If `domainDescription=""` then the LLM generates 5 random suggestions. |
| sourceClass  | no | string  | Name of the source class if `userChoice=attributes` or `userChoice=associations1` or `userChoice=associations2`. |
| targetClass  | no  | string | Name of the target class if `userChoice=associations2`.  |


<br/>

**Response**
- stream of JSON objects
- each JSON object contains the field `name`
    - if `domainDescription=""` then also `description`
    - else `originalText` and `originalTextIndexes` except for `userChoice=classes`
        - `associations` also contain field `source` as source class and `target` as target class

- note: our prompts with `dd` (domain description) inside their name usually contain examples of input and output so check out [our prompts](https://github.com/Dominik7131/Conceptual-Modeling-LLM-Assistant/tree/master/prompts) for examples
- warning: when buffering is not disabled multiple JSON objects can be received in one response and then basic json parsing functions such as `json.loads` in Python won't work because first you need to split the received string object by newline character
<br/>
<br/>


**POST** /suggest/single_field
- for a given item's name and it's field the LLM generates this field's content

| Parameter | Mandatory | Data type | Description |
|-----------|-----------|-----------|-------------|
| name      | yes       | string    | Item name.  |
| field     | yes       | string (`originalText`, `description`, `dataType`, `sourceCardinality`, `targetCardinality`) | Item field to suggest. |
| userChoice | yes     | string (`classes`, `attributes`, `associations`) | Type of the item. |
| domainDescription | yes     | string | Solely based on this text the LLM generates the output.
| sourceClass  | no | string  | Name of the source class when the userChoice `attribute` or `associations` is provided. |
| targetClass  | no  | string | Name of the target target class when the userChoice `associations` is provided.  |

<br/>

**Response**
- JSON object containing a single field named by the `field` parameter


<br/>
<br/>

**POST** /suggest/summary

| Parameter | Mandatory | Data type | Description |
|-----------|-----------|-----------|-------------|
| summaryType | yes     | string (`summaryPlainText`, `summaryDescriptions`) | Type of the summary to suggest. |
| domainDescription | yes     | string | Solely based on this text the LLM generates the summary.
| conceptualModel | yes | object | Conceptual model in JSON format preferably exactly as specified in the example of [this prompt](https://github.com/Dominik7131/Conceptual-Modeling-LLM-Assistant/blob/master/prompts/summary-descriptions/dd.txt#L8-L9). |

<br/>

**Response**
- if `userChoice=summaryPlainText` then a single JSON object with a single field `summary`
- otherwise stream of JSON objects as specified in [this prompt](https://github.com/Dominik7131/Conceptual-Modeling-LLM-Assistant/blob/master/prompts/summary-descriptions/dd.txt#L15-L22)

<br/>
<br/>


**POST** /merge_original_texts
- used for merging original text indexes with their labels to highlight in the domain description the objects that the user had already modeled in his conceptual model
- note: original text indexes for a given item denote the start and the end of this item context inside a domain description

| Parameter | Mandatory | Data type | Description |
|-----------|-----------|-----------|-------------|
| originalTextIndexesObject          | yes  | object[] | Array of JSON objects like this: `{"indexes": [10, 20], "label": "Employee: ID"}`. |

<br/>

**Response**
- JSON object in the same format as in the `originalTextIndexesObject` parameter

<br/>
<br/>


## Save endpoints
- used for saving user's liked and disliked suggestions
- all **POST** save endpoints return no value

<br/>

**POST** /save/suggested_item

| Parameter | Mandatory | Data type | Description |
|-----------|-----------|-----------|-------------|
| item          | yes | object | The item to save. |
| userChoice  | yes |  string (`classes`, `attributes`, `associations1`, `associations2`) | What user choice was used to generate this item. |
| domainDescription | yes | string | The domain description that was used to generate this item. | The original domain description that the item was generated from
| isPositive | yes | bool | True if the user liked this suggestion otherwise False.  |

<br/>

**POST** /save/suggested_single_field

| Parameter | Mandatory | Data type | Description |
|-----------|-----------|-----------|-------------|
| fieldName      | yes       | string (`originalText`, `description`, `data type`, `sourceCardinality`, `targetCardinality`)    | Name of the item's field.   |
| fieldText     | yes       | string    | Generated text of the item field.
| userChoice | yes     | string (`classes`, `attributes`, `associations1`, `associations2`) | Type of the original suggestion. |
| domainDescription | yes     | string | The domain description that was used to generate this item. | The original domain description that the field was generated from.
| sourceClass  | no | string  | Name of the source class if `userChoice=attributes` or `userChoice=associations1` or `userChoice=associations2`. |
| targetClass  | no  | string | Name of the target class if `userChoice=associations2`.  |
| isPositive  | yes | bool | True if the user liked this suggestion otherwise False.  |

<br/>

**POST** /save/suggested_summary

| Parameter | Mandatory | Data type | Description |
|-----------|-----------|-----------|-------------|
| summaryType | yes     | string (`summaryPlainText`, `summaryDescriptions`) | Type of the summary. |
| domainDescription | yes     | string | The exact domain description that was used to generate this item.
| conceptualModel | yes | object | The exact conceptual model in JSON format used to generate this summary. |
| isPositive  | yes | bool | True if the user liked the suggested summary otherwise False.  |

<br/>