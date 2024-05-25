import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { Field, ItemType, UserChoice } from "../interfaces/interfaces"
import { domainDescriptionSnapshotsState, domainDescriptionState, editDialogErrorMsgState, fieldToLoadState, isIgnoreDomainDescriptionState, regeneratedItemState, regeneratedOriginalTextIndexesState, textFilteringVariationSnapshotsState, textFilteringVariationState } from "../atoms"
import { snapshotDomainDescription, snapshotTextFilteringVariation } from "../utils/snapshot"
import { HEADER, SUGGEST_SINGLE_FIELD_URL } from "../utils/urls"


const useGenerateSingleField = () =>
{
    const domainDescription = useRecoilValue(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
    const textFilteringVariation = useRecoilValue(textFilteringVariationState)

    const setRegeneratedItem = useSetRecoilState(regeneratedItemState)
    const setSnapshotDomainDescription = useSetRecoilState(domainDescriptionSnapshotsState)
    const setSnapshotTextFilteringVariation = useSetRecoilState(textFilteringVariationSnapshotsState)
    const setRegeneratedOriginalTextIndexes = useSetRecoilState(regeneratedOriginalTextIndexesState)

    const setFieldToLoad = useSetRecoilState(fieldToLoadState)

    const setErrorMessage = useSetRecoilState(editDialogErrorMsgState)
    

    const onGenerateField = (itemType: ItemType, name: string, sourceClass: string, targetClass: string, field: Field) =>
    {
        const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription
        snapshotDomainDescription(UserChoice.SINGLE_FIELD, currentDomainDescription, setSnapshotDomainDescription)
        snapshotTextFilteringVariation(UserChoice.SINGLE_FIELD, textFilteringVariation, setSnapshotTextFilteringVariation)
    
        let userChoice = UserChoice.CLASSES
    
        if (itemType === ItemType.ATTRIBUTE)
        {
            userChoice = UserChoice.ATTRIBUTES 
        }
        else if (itemType === ItemType.ASSOCIATION)
        {
            userChoice = UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS
        }
    
        if (userChoice === UserChoice.CLASSES)
        {
            sourceClass = name
        }
    
        if (!sourceClass) { sourceClass = "" }
        if (!targetClass) { targetClass = "" }
    
        const bodyData = JSON.stringify({
            "name": name, "sourceClass": sourceClass, "targetClass": targetClass, "field": field, "userChoice": userChoice,
            "domainDescription": currentDomainDescription
        })
    
        setErrorMessage("")
        setFieldToLoad(fieldsToLoad => [...fieldsToLoad, field])
        fetchStreamedDataGeneral(bodyData, field)
    }


    const fetchStreamedDataGeneral = (bodyData: any, field: Field) =>
    {
        fetch(SUGGEST_SINGLE_FIELD_URL, { method: "POST", headers: HEADER, body: bodyData })
        .then(response =>
        {
            const stream = response.body; // Get the readable stream from the response body
    
            if (stream === null)
            {
                console.log("Stream is null")
                setFieldToLoad(fields => fields.filter(currentField => currentField !== field))
                return
            }
    
            const reader = stream.getReader()
    
            const readChunk = () =>
            {
                reader.read()
                    .then(({value, done}) =>
                    {
                        if (done)
                        {
                            console.log("Stream finished")
                            setFieldToLoad(fields => fields.filter(currentField => currentField !== field))
                            return
                        }
    
                        onProcessStreamedDataGeneral(value, field)
                        
                        readChunk()
                    })
                    .catch(error =>
                    {
                        console.error(error)
                        setFieldToLoad(fields => fields.filter(currentField => currentField !== field))
                    })
            }
            readChunk() // Start reading the first chunk
        })
        .catch(error =>
        {
            console.error(error)
            const message = "Server is not responding"
            setErrorMessage(message)
            setFieldToLoad(fields => fields.filter(currentField => currentField !== field))
        })
    }
    
    
    function onProcessStreamedDataGeneral(value: any, field: Field): void
    {
        // Convert the `value` to a string
        var jsonString = new TextDecoder().decode(value)
        console.log(jsonString)
        console.log("\n")
    
        const parsedData = JSON.parse(jsonString)
        setRegeneratedItem((regeneratedItem) =>
        {
            return {...regeneratedItem, [field]: parsedData[field]}
        })

        if (field === Field.ORIGINAL_TEXT)
        {
            const originalTextIndexes = parsedData[Field.ORIGINAL_TEXT_INDEXES]
            setRegeneratedOriginalTextIndexes(originalTextIndexes)
        }
    }

    return { onGenerateField }
}

export default useGenerateSingleField