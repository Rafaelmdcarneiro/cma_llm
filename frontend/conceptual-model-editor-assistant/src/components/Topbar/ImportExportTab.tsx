import { Stack } from "@mui/material"
import ImportJSONButton from "./ImportJSONButton"
import ExportIntoDataspecerButton from "./ExportIntoDataspecerButton";
import ExportJSONButton from "./ExportJSONButton";
import ImportFromDataspecerButton from "./ImportFromDataspecerButton";


const ImportTab: React.FC = (): JSX.Element =>
{
    return (
        <Stack direction="row" spacing={2} sx={{ display: 'flex', justifyContent:"center" }}>

            <ImportFromDataspecerButton/>
            <ImportJSONButton/>

            <ExportJSONButton/>
            <ExportIntoDataspecerButton/>

        </Stack>
    )
}

export default ImportTab