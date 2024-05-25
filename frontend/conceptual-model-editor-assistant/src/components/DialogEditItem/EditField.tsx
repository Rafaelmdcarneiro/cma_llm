import Stack from '@mui/material/Stack';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import CircularProgress from '@mui/material/CircularProgress';
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { domainDescriptionSnapshotsState, domainDescriptionState, editDialogErrorMsgState, editedSuggestedItemState, fieldToLoadState, isIgnoreDomainDescriptionState, isShowEditDialogState, regeneratedItemState, regeneratedOriginalTextIndexesState } from "../../atoms";
import { Association, Attribute, Field, Item, ItemType, UserChoice } from '../../interfaces/interfaces';
import { onClearRegeneratedItem, onItemEdit } from '../../utils/editItem';
import { getSnapshotDomainDescription, snapshotDomainDescription } from '../../utils/snapshot';
import { HEADER, SAVE_SUGESTED_SINGLE_FIELD_URL, SUGGEST_SINGLE_FIELD_URL } from '../../utils/urls';
import { itemTypeToUserChoice } from '../../utils/utility';
import { useEffect, useRef } from 'react';
import useGenerateSingleField from '../../hooks/useGenerateSingleField';
import useConfirmRegeneratedField from '../../hooks/useConfirmRegeneratedField';


interface Props
{
    label: string
    field: Field
}

const EditField: React.FC<Props> = ({ label, field }) =>
{
    const [editedItem, setEditedItem] = useRecoilState(editedSuggestedItemState)
    const [regeneratedItem, setRegeneratedItem] = useRecoilState(regeneratedItemState)

    const domainDescription = useRecoilValue(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)

    const fieldToLoad = useRecoilValue(fieldToLoadState)

    const { onGenerateField } = useGenerateSingleField()
    const { onConfirmRegeneratedText } = useConfirmRegeneratedField()
    

    const value = editedItem[field as keyof Item]

    let newValue : string | number[] = ""
    let isRegeneratedText : boolean = true
    let color : string = "gray"

    if (regeneratedItem.hasOwnProperty(field))
    {
        newValue = regeneratedItem[field as keyof Item]
    }

    if (!newValue)
    {
        if (value)
        {
            newValue = value
        }
        isRegeneratedText = false
    }

    if (!isRegeneratedText)
    {
        color = "black"
    }

    const isDisableOriginalTextSuggestion = field === Field.ORIGINAL_TEXT && (domainDescription === "" || isIgnoreDomainDescription)
    const isDisabledFieldSuggestion = field === Field.NAME || field === Field.SOURCE_CLASS || field === Field.TARGET_CLASS || isDisableOriginalTextSuggestion


    // Clear the generated suggestion when the component is unmounted
    useEffect(() =>
    {
        return () => { onClearRegeneratedItem(field, setRegeneratedItem) }
    }, [])



    return (
        <Stack direction="row" spacing={4}>

                <TextField margin="dense" fullWidth variant="standard" spellCheck={false} label={label} multiline
                    sx={{'& textarea': {color: color} }}
                    onChange={(event) => onItemEdit(field, event.target.value, setEditedItem)}
                    value={newValue}
                />

                { !isRegeneratedText ?
                    ( (fieldToLoad.includes(field)) ? <CircularProgress sx={{position: "relative", right: "3px", top: "5px"}} size={"30px"} /> :
                    <IconButton disabled={isDisabledFieldSuggestion} color="primary" size="small" onClick={() => onGenerateField(editedItem[Field.TYPE], editedItem[Field.NAME], (editedItem as Association)[Field.SOURCE_CLASS], (editedItem as Association)[Field.TARGET_CLASS], field)}>
                        <AutoFixNormalIcon/>
                    </IconButton>)
                    :
                    <Stack direction="row">
                        <IconButton onClick={() => onConfirmRegeneratedText(field)}>
                            <CheckIcon color="success"/>
                        </IconButton>
                        <IconButton onClick={() => { onClearRegeneratedItem(field, setRegeneratedItem) }}>
                            <CloseIcon color="error"/>
                        </IconButton>
                    </Stack>
                }
        </Stack>
    )
}
    
export default EditField