import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import { editedSuggestedItemState, nodesState, regeneratedItemState, selectedSuggestedItemState } from "../../atoms"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { Node } from 'reactflow';
import { Association, Field, ItemFieldUIName } from "../../interfaces/interfaces"
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useState } from "react"
import { createNameFromIRI, doesNodeAlreadyExist } from "../../utils/conceptualModel"
import { onItemEdit } from "../../utils/editItem"


interface Props
{
    fieldName: Field
    association: Association
}

const ClassListSelector: React.FC<Props> = ({ fieldName, association }) =>
{
    const nodes: Node[] = useRecoilValue(nodesState)
    const selectedAssociation: Association = useRecoilValue(selectedSuggestedItemState) as Association

    const setEditedItem = useSetRecoilState(editedSuggestedItemState)

    const [value, setValue] = useState(association[fieldName as keyof Association])
    const fieldUIName = fieldName === Field.SOURCE_CLASS ? ItemFieldUIName.SOURCE_CLASS : ItemFieldUIName.TARGET_CLASS

    const iri = fieldName === Field.SOURCE_CLASS ? selectedAssociation[Field.SOURCE_CLASS] : selectedAssociation[Field.TARGET_CLASS]
    const name = createNameFromIRI(iri)

    const handleChange = (event: SelectChangeEvent) =>
    {
        setValue(event.target.value)
        onItemEdit(fieldName, event.target.value, setEditedItem)
    }
    
    // Documentation: https://mui.com/material-ui/react-select/#props
    return (
        <FormControl fullWidth variant="standard">
            <InputLabel>{ fieldUIName }</InputLabel>
            <Select
                value={ value.toString() }
                onChange={ handleChange }
            >
                { !doesNodeAlreadyExist(nodes, iri) && <MenuItem value={iri}> {name} </MenuItem> }
                
                { nodes.map((node: Node) => <MenuItem key={node.id} value={node.id}> {node.data.class[Field.NAME]} </MenuItem>) }
            </Select>
        </FormControl>
    )
}

export default ClassListSelector