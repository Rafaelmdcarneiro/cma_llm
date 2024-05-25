import { useSetRecoilState } from "recoil"
import { isLoadingSummaryDescriptionsState, summaryDescriptionsState } from "../atoms"
import { UserChoice, ItemType } from "../interfaces/interfaces"
import { SUGGEST_SUMMARY_URL, HEADER } from "../utils/urls"


const useFetchSummaryDescriptions = () =>
{
    const setIsLoadingSummaryDescriptions = useSetRecoilState(isLoadingSummaryDescriptionsState)
    const setSummaryDescriptions = useSetRecoilState(summaryDescriptionsState)


    const fetchSummaryDescriptions = (bodyData : any) =>
    {
        setIsLoadingSummaryDescriptions(_ => true)
    
        fetch(SUGGEST_SUMMARY_URL, { method: "POST", headers: HEADER, body: bodyData })
        .then(response =>
        {
            const stream = response.body // Get the readable stream from the response body
    
            if (stream === null)
            {
                console.log("Stream is null")
                setIsLoadingSummaryDescriptions(_ => false)
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
                            setIsLoadingSummaryDescriptions(_ => false)
                            return
                        }
    
                        // Convert the `value` to a string
                        var jsonString = new TextDecoder().decode(value)
                        console.log("JsonString: ", jsonString)
    
    
                        // Handle situation when the `jsonString` contains more than one JSON object because of stream buffering
                        const jsonStringParts = jsonString.split('\n').filter((string => string !== ''))
    
                        for (let i = 0; i < jsonStringParts.length; i++)
                        {
                            const parsedData = JSON.parse(jsonStringParts[i])
        
                            if (!parsedData[UserChoice.ATTRIBUTES])
                            {
                                parsedData[UserChoice.ATTRIBUTES] = []
                            }
                            
                            console.log("Parsed data:", parsedData)
        
                            if (parsedData.hasOwnProperty(ItemType.CLASS))
                            {
                                setSummaryDescriptions(previousSummary => ({
                                ...previousSummary,
                                classes: [...previousSummary.classes, parsedData],
                                }))
                            }
                            else if (parsedData.hasOwnProperty(ItemType.ASSOCIATION))
                            {
                                setSummaryDescriptions(previousSummary => ({
                                ...previousSummary,
                                associations: [...previousSummary.associations, parsedData],
                                }))
                            }
                            else
                            {
                                console.log("Received unknown object: ", parsedData)
                            }
                        }
    
                        readChunk()
                    })
                    .catch(error =>
                    {
                        console.error(error)
                    })
            }
            readChunk()
        })
        .catch(error =>
        {
            console.error(error)
            setIsLoadingSummaryDescriptions(_ => false)
            alert("Error: request failed")
        })
    }

    return { fetchSummaryDescriptions }
}

export default useFetchSummaryDescriptions