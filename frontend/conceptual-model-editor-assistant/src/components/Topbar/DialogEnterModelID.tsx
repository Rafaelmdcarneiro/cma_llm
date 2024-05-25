import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { edgesState, isDialogEnterIRIOpenedState, isDialogImportState, modelIDState, nodesState } from '../../atoms';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { importConceptualModelFromJson } from '../../utils/import';
import { HEADER } from '../../utils/urls';
import { convertConceptualModelToJSON } from '../../utils/serialization';


const DialogEnterModelID: React.FC = (): JSX.Element =>
{
    const nodes = useRecoilValue(nodesState)
    const edges = useRecoilValue(edgesState)
    const setNodes = useSetRecoilState(nodesState)
    const setEdges = useSetRecoilState(edgesState)
    
    const modelD = useRecoilValue(modelIDState)
    const setModelD = useSetRecoilState(modelIDState)

    const [enteredURL, setEnteredURL] = useState(modelD)
    const [isOpened, setIsOpened] = useRecoilState(isDialogEnterIRIOpenedState)
    const isDialogImport = useRecoilValue(isDialogImportState)


    const IRI_IDENTIFICATOR = "iri="

    const getIDFromURL = (url: string): string =>
    {
        const startIndex = url.indexOf(IRI_IDENTIFICATOR)

        if (startIndex === -1)
        {
            return ""
        }

        // Extract the substring starting from "iri=" to the end of the URL
        const iriLength = IRI_IDENTIFICATOR.length
        const substring = url.substring(startIndex + iriLength)
        return substring
    }


    const onImport = () =>
    {
        onClose()

        const fetchOptions = { method: "GET" }

        fetch(enteredURL, fetchOptions)
            .then(response => response.json())
            .then(json => importConceptualModelFromJson(json, setNodes, setEdges))
        
        const modelID = getIDFromURL(enteredURL)
        setModelD(modelID)
    }


    const onExport = () =>
    {
        onClose()
        const conceptualModelJson = convertConceptualModelToJSON(nodes, edges)
        const content = JSON.stringify(conceptualModelJson)

        const fetchOptions = { method: "PUT", headers: HEADER, body: content }
        console.log(content)
        fetch(enteredURL, fetchOptions)
    }

    const onClose = () =>
    {
        setIsOpened(_ => false)
    }

    return (
        <Dialog
            open={isOpened}
            fullWidth={true}
            maxWidth={'xl'}
            scroll={'paper'}
            onClose={onClose}
        >
            <DialogTitle>
                <Stack spacing={2}>
                    <Typography variant="h5"> Enter model URL </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent dividers={true}>
                <TextField margin="dense" fullWidth variant="standard" spellCheck={false} label={"Model URL"} multiline
                        // sx={{'& textarea': {color: color} }}
                        onChange={ event => setEnteredURL(_ => event.target.value) }
                        value={ enteredURL }
                    />
            </DialogContent>

            <DialogActions>

                { isDialogImport ? 
                    <Button
                        variant="contained"
                        color="success"
                        disableElevation
                        sx={{ textTransform: "none" }}
                        onClick={ onImport }>
                            Import
                    </Button>
                    :
                    <Button
                        variant="contained"
                        color="success"
                        disableElevation
                        sx={{ textTransform: "none" }}
                        onClick={ onExport }>
                            Export
                    </Button>
                }

                <Button
                    variant="contained"
                    color="error"
                    disableElevation
                    sx={{ textTransform: "none" }}
                    onClick={ onClose }>
                        Close
                </Button>

            </DialogActions>
        </Dialog>
    )
}

export default DialogEnterModelID