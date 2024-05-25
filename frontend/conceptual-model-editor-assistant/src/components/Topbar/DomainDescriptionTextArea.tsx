import { Box, TextField } from "@mui/material"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { domainDescriptionState, edgesState, isIgnoreDomainDescriptionState, nodesState } from "../../atoms"
import { useEffect } from "react"
import { invalidateAllOriginalTextIndexes } from "../../utils/conceptualModel"


const DomainDescriptionTextArea: React.FC = ():JSX.Element =>
{
    const [domainDescription, setDomainDescription] = useRecoilState(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)

    const setNodes = useSetRecoilState(nodesState)
    const setEdges = useSetRecoilState(edgesState)


    const loadDomainDescriptionFromFile = () =>
    {
        const domainDescriptionFileName = "input.txt"

        fetch(domainDescriptionFileName)
        .then((result) => result.text())
        .then((text) =>
        {
            setDomainDescription(_ => text)
        })
        .catch((e) => console.error(e));
    }

    // Just for testing automatically load a given domain description
    // TODO: Remove this code before production
    useEffect(() =>
    {
        if (domainDescription === "")
        {
            // loadDomainDescriptionFromFile()
        }
    }, [])



    return (
        <Box
            sx={{ '& .MuiTextField-root': { m: 1, width: '98.9%' } }}
            component="form"
            noValidate
            autoComplete="off"
        >
            <TextField
                id="domain description text area"
                label="Domain description"
                variant="outlined"
                disabled={isIgnoreDomainDescription}
                multiline
                rows={7}
                onChange={event => { setDomainDescription(_ => event.target.value); invalidateAllOriginalTextIndexes(setNodes, setEdges) }}
                value={domainDescription}
                spellCheck="false">
            </TextField>
        </Box>
    )
}

export default DomainDescriptionTextArea