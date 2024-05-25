import { Button, Stack } from "@mui/material"
import DomainDescriptionTextArea from "./DomainDescriptionTextArea";
import AddIcon from '@mui/icons-material/Add';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import useSuggestItems from "../../hooks/useSuggestItems";
import HighlightSelectedItemsButton from "./HighlightSelectedItemsButton";
import { UserChoice } from "../../interfaces/interfaces";
import { blankClass } from "../../utils/utility";
import { useSetRecoilState } from "recoil";
import { editedSuggestedItemState, isItemInConceptualModelState, isShowEditDialogState, isSuggestedItemState, selectedSuggestedItemState } from "../../atoms";
import SummaryPlainTextButton from "./SummaryPlainTextButton";
import SummaryDescriptionsButton from "./SummaryDescriptionsButton";


const ControlButtons: React.FC = (): JSX.Element =>
{
    const setIsSuggestedItem = useSetRecoilState(isSuggestedItemState)
    const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)
    const setIsItemInConceptualModel = useSetRecoilState(isItemInConceptualModelState)

    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)

    const { onSuggestItems } = useSuggestItems()


    const onAddNewClass = () : void =>
    {    
        setIsItemInConceptualModel(false)
        setIsSuggestedItem(true)
        setSelectedSuggestedItem(blankClass)
        setEditedSuggestedItem(blankClass)
    
        setIsShowEditDialog(true)
    }


    return (
        <>
            <DomainDescriptionTextArea/>
            
            <Stack direction="row" justifyContent="space-between" paddingX={1} paddingY={"8px"}>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        sx={{textTransform: "none"}}
                        disableElevation
                        startIcon={<AutoFixNormalIcon/>}
                        onClick={() => onSuggestItems(UserChoice.CLASSES, null, null)}>
                            Suggest classes
                    </Button>

                    <Button
                        variant="contained"
                        sx={{textTransform: "none"}}
                        disableElevation
                        startIcon={<AddIcon/>}
                        onClick={ onAddNewClass }>
                            Add new class
                    </Button>
                </Stack>

                <Stack direction="row" spacing={2}>

                    <SummaryPlainTextButton/>

                    <SummaryDescriptionsButton/>
                    
                    <HighlightSelectedItemsButton/>
                </Stack>
            </Stack>
        </>
    )
}

export default ControlButtons