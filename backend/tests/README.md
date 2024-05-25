# Main test scripts

`generate_suggestions.py`
- test data: domain description, user choice for defining what we want to suggest, expected suggested items
- output: actual suggested items

Purpose: Test the quality of suggested items by LLM both syntactically and manually

<br />


`relevant_text_finder.py`
- test data: domain description, entity to filter the domain description, expected filtered texts
- output: actual filtered texts

Purpose: Compute recall and precision of automatic domain description filtering

<br />


`original_text_indexes.py`
- test data: domain description, original text, expected original text indexes
- output: actual original text indexes

Purpose: Test if original text indexes are correctly computed


<br />

`merge_original_text_indexes.py`
- test data: multiple original text indexes including their labels, expected original text indexes including their labels
- output: actual merged original text indexes including their labels

Purpose: Test if we are correctly merging the original text indexes