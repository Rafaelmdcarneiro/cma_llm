import { useRecoilValue } from "recoil";
import { Item } from "../../interfaces/interfaces"
import Alert from '@mui/material/Alert';
import { editDialogErrorMsgState } from "../../atoms";


const ErrorMessage: React.FC = (): JSX.Element =>
{
    const message = useRecoilValue(editDialogErrorMsgState)

    if (message === "")
    {
        return <></>
    }

    return (
            <Alert variant="outlined" severity="warning" sx={{marginX:"20px", marginTop: "20px"}}>
                { message }
            </Alert>
    )
}
    
export default ErrorMessage