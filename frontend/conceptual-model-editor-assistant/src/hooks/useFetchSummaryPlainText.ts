import { useSetRecoilState } from "recoil"
import { isLoadingSummaryPlainTextState, summaryTextState } from "../atoms"
import { SUGGEST_SUMMARY_URL, HEADER } from "../utils/urls"


const useFetchSummaryPlainText = () =>
{
    const setIsLoadingSummaryPlainText = useSetRecoilState(isLoadingSummaryPlainTextState)
    const setSummaryText = useSetRecoilState(summaryTextState)


    const fetchSummaryPlainText = (bodyData : any) =>
    {
        setIsLoadingSummaryPlainText(_ => true)
    
        fetch(SUGGEST_SUMMARY_URL, { method: "POST", headers: HEADER, body: bodyData })
        .then(response =>
        {
            const stream = response.body // Get the readable stream from the response body
    
            if (stream === null)
            {
                console.log("Stream is null")
                setIsLoadingSummaryPlainText(_ => false)
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
                            setIsLoadingSummaryPlainText(_ => false)
                            return
                        }
    
                        // Convert the `value` to a string
                        var jsonString = new TextDecoder().decode(value)
                        console.log("JsonString: ", jsonString)
                        
                        const parsedData = JSON.parse(jsonString)
                        console.log("Parsed data:", parsedData)
                        setSummaryText(parsedData["summary"])
    
                        readChunk() // Read the next chunk
                    })
                    .catch(error =>
                    {
                    console.error(error)
                    })
            }
            readChunk() // Start reading the first chunk
        })
        .catch(error =>
        {
            console.error(error)
            setIsLoadingSummaryPlainText(_ => false)
            alert("Error: request failed")
        })
    }

    return { fetchSummaryPlainText }
}

export default useFetchSummaryPlainText