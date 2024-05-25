import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Attribute, Field, Item, ItemType, UserChoice } from "../interfaces/interfaces";
import { HEADER, SAVE_SUGESTED_SINGLE_FIELD_URL } from "../utils/urls";
import { itemTypeToUserChoice } from "../utils/utility";
import { domainDescriptionSnapshotsState, editedSuggestedItemState, regeneratedItemState, regeneratedOriginalTextIndexesState, textFilteringVariationSnapshotsState } from "../atoms";
import { getSnapshotDomainDescription } from "../utils/snapshot";
import { onClearRegeneratedItem } from "../utils/editItem";


const useConfirmRegeneratedField = () =>
{
    const domainDescriptionSnapshot = useRecoilValue(domainDescriptionSnapshotsState)
    const textFilteringVariationSnapshot = useRecoilValue(textFilteringVariationSnapshotsState)

    const setEditedItem = useSetRecoilState(editedSuggestedItemState)
    const [regeneratedItem, setRegeneratedItem] = useRecoilState(regeneratedItemState)
    const regeneratedOriginalTextIndexes = useRecoilValue(regeneratedOriginalTextIndexesState)

    
    const saveSingleFieldSuggestion = (fieldName: string, fieldText: string, itemType: ItemType, sourceClass: string): void =>
    {
        // Save generated single field to the backend
    
        const currentDomainDescription = getSnapshotDomainDescription(UserChoice.SINGLE_FIELD, domainDescriptionSnapshot)
        const userChoice = itemTypeToUserChoice(itemType)
    
        const suggestionData = {
            domainDescription: currentDomainDescription, fieldName: fieldName, fieldText: fieldText,
            userChoice: userChoice, sourceClass: sourceClass, isPositive: true, textFilteringVariation: textFilteringVariationSnapshot
        }
    
        fetch(SAVE_SUGESTED_SINGLE_FIELD_URL, { method: 'POST', headers: HEADER, body: JSON.stringify(suggestionData)})
    }
    
        
    const onConfirmRegeneratedText = (field : Field) =>
    {
        let itemType = ItemType.CLASS
        let sourceClass = ""
    
        setEditedItem((editedItem: Item) =>
        {
            // Set type to "any" because Typescript doesn't recognise that we already did the check
            // Otherwise we need to write an if-statement for each field of type Item
            if (regeneratedItem.hasOwnProperty(field))
            {
                itemType = editedItem[Field.TYPE]
    
                if (itemType === ItemType.CLASS)
                {
                    sourceClass = editedItem[Field.NAME]
                }
                else
                {
                    sourceClass = (editedItem as Attribute)[Field.SOURCE_CLASS]
                }

                if (field === Field.ORIGINAL_TEXT)
                {
                    return { ...editedItem, [field]: (regeneratedItem as any)[field], [Field.ORIGINAL_TEXT_INDEXES]: regeneratedOriginalTextIndexes }
                }
                else
                {
                    return { ...editedItem, [field]: (regeneratedItem as any)[field] }
                }
            }
            return editedItem
        })
    
        saveSingleFieldSuggestion(field, (regeneratedItem as any)[field], itemType, sourceClass)
    
        onClearRegeneratedItem(field, setRegeneratedItem)
    }

    return { onConfirmRegeneratedText, saveSingleFieldSuggestion }
}

export default useConfirmRegeneratedField