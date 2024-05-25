import { Button } from "@mui/material"
import DownloadIcon from '@mui/icons-material/Download';
import { isDialogEnterIRIOpenedState, isDialogImportState } from "../../atoms";
import { useSetRecoilState } from "recoil";


const ExportJSONButton: React.FC = (): JSX.Element =>
{
    const setIsDialogEditModelIDOpened = useSetRecoilState(isDialogEnterIRIOpenedState)
    const setIsDialogImport = useSetRecoilState(isDialogImportState)

    // const importedFileName = useRecoilValue(importedFileNameState)
    // const export_name = `${useRecoilValue(modelIDState)}.json`
    // const export_file_name = importedFileName === "" ? export_name : `${importedFileName}-${export_name}`

    const handleClick = () =>
    {
        setIsDialogEditModelIDOpened(true)
        setIsDialogImport(false)
    }

    
    return (
        <Button
            variant="contained"
            color="secondary"
            disableElevation
            sx={{textTransform: "none"}}
            startIcon={ <DownloadIcon/> }
            onClick={ handleClick }>
        Export into Dataspecer
    </Button>
    )
}

export default ExportJSONButton