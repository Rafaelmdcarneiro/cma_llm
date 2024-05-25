import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import { editedSuggestedItemState, fieldToLoadState, nodesState, regeneratedItemState, selectedSuggestedItemState } from "../../atoms"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { Node } from 'reactflow';
import { Association, Attribute, Field, ItemFieldUIName, ItemType } from "../../interfaces/interfaces"
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useEffect, useState } from "react"
import { onClearRegeneratedItem, onItemEdit } from "../../utils/editItem"
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import IconButton from '@mui/material/IconButton';
import { Stack } from "@mui/material"
import useGenerateSingleField from "../../hooks/useGenerateSingleField"
import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import useConfirmRegeneratedField from "../../hooks/useConfirmRegeneratedField"



interface Props
{
    attribute: Attribute
}

const DATA_TYPE_CHOICES = ["string", "number", "time", "boolean"]


const DataTypeSelector: React.FC<Props> = ({ attribute }) =>
{
    const setEditedItem = useSetRecoilState(editedSuggestedItemState)
    const [regeneratedItem, setRegeneratedItem] = useRecoilState(regeneratedItemState)
    const fieldToLoad = useRecoilValue(fieldToLoadState)

    const regeneratedAttribute = regeneratedItem as Attribute
    const isRegeneratedText = regeneratedAttribute[Field.DATA_TYPE] && regeneratedAttribute[Field.DATA_TYPE] !== ""
    const actualValue = isRegeneratedText ? regeneratedAttribute[Field.DATA_TYPE] : attribute[Field.DATA_TYPE]

    const textColor = isRegeneratedText ? "gray" : "black"

    const { onGenerateField } = useGenerateSingleField()
    const { onConfirmRegeneratedText } = useConfirmRegeneratedField()


    const handleChange = (event: SelectChangeEvent) =>
    {
        // If some data type is suggested then cancel this suggestion
        onClearRegeneratedItem(Field.DATA_TYPE, setRegeneratedItem)

        onItemEdit(Field.DATA_TYPE, event.target.value, setEditedItem)
    }

    // Clear the generated suggestion when the component is unmounted
    useEffect(() =>
    {
        return () => { onClearRegeneratedItem(Field.DATA_TYPE, setRegeneratedItem) }
    }, [])


    return (
        <Stack direction="row">
            <FormControl fullWidth variant="standard">

                <InputLabel>
                    { ItemFieldUIName.DATA_TYPE }
                </InputLabel>

                <Select
                    value={ actualValue }
                    onChange={ handleChange }
                    sx={{ color: textColor }}
                >
                    { DATA_TYPE_CHOICES.map((dataType: string) => <MenuItem key={dataType} value={dataType}> {dataType} </MenuItem>) }
                </Select>
                
            </FormControl>

                { !isRegeneratedText ?
                    ( (fieldToLoad.includes(Field.DATA_TYPE)) ? <CircularProgress sx={{position: "relative", right: "3px", top: "5px"}} size={"30px"} /> :
                    <IconButton color="primary" size="small" onClick={() => onGenerateField(ItemType.ATTRIBUTE, attribute[Field.NAME], attribute[Field.SOURCE_CLASS], "", Field.DATA_TYPE)}>
                        <AutoFixNormalIcon/>
                    </IconButton>)
                    :
                    <Stack direction="row">
                        <IconButton onClick={() => onConfirmRegeneratedText(Field.DATA_TYPE)}>
                            <CheckIcon color="success"/>
                        </IconButton>
                        <IconButton onClick={() => { onClearRegeneratedItem(Field.DATA_TYPE, setRegeneratedItem) }}>
                            <CloseIcon color="error"/>
                        </IconButton>
                    </Stack>
                }
        </Stack>
    )
}

export default DataTypeSelector