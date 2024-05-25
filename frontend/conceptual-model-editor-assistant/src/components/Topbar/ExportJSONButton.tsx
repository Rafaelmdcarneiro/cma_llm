import { Button } from "@mui/material"
import DownloadIcon from '@mui/icons-material/Download';
import { edgesState, importedFileNameState, modelIDState, nodesState } from "../../atoms";
import { useRecoilValue } from "recoil";
import { convertConceptualModelToJSON } from "../../utils/serialization";
import { DATASPECER_MODEL_URL } from "../../utils/urls";


const ExportJSONButton: React.FC = (): JSX.Element =>
{
    const nodes = useRecoilValue(nodesState)
    const edges = useRecoilValue(edgesState)

    const importedFileName = useRecoilValue(importedFileNameState)

    const modelID = useRecoilValue(modelIDState)
    const export_name = (modelID === "" || modelID === DATASPECER_MODEL_URL) ? "export.json" : `${modelID}.json`
    const export_file_name = importedFileName === "" ? export_name : `${importedFileName}-${export_name}`


    const onExport = () =>
    {
        const conceptualModelJson = convertConceptualModelToJSON(nodes, edges)
        const content = JSON.stringify(conceptualModelJson)

        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = export_file_name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }


    return (
        <Button
            variant="contained"
            color="secondary"
            disableElevation
            sx={{textTransform: "none"}}
            startIcon={ <DownloadIcon/> }
            onClick={ onExport }>
        Export into JSON
    </Button>
    )
}

export default ExportJSONButton