import Button from '@mui/material/Button';
import { useState } from 'react';
import { NodeProps, Position } from 'reactflow';
import { Attribute, Class, Field, NodeData, PRIMARY_COLOR, Item } from '../../../interfaces/interfaces';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { clipString } from '../../../utils/utility';
import { editedSuggestedItemState, isItemInConceptualModelState, isShowEditDialogState, isSuggestedItemState, selectedSuggestedItemState } from '../../../atoms';
import { useSetRecoilState } from 'recoil';
import CustomHandle from './CustomHandle';
import DropdownMenu from './DropdownMenu';


// List of all NodeProps: https://reactflow.dev/api-reference/types/node-props
export default function TextUpdaterNode({ selected, data } : NodeProps)
{
    const setIsSuggestedItem = useSetRecoilState(isSuggestedItemState)
    const setIsItemInConceptualModel = useSetRecoilState(isItemInConceptualModelState)
    const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)

    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [isClassHovered, setIsClassHovered] = useState<boolean>(false)

    const nodeData: NodeData = data as NodeData
    const clss: Class = nodeData.class

    const attributes: Attribute[] = nodeData.attributes

    const borderNonSelected = "1px solid black"
    const borderSelected = `1px solid ${PRIMARY_COLOR}`


    const handleEditAttribute = (attribute: Attribute) =>
    {
        setIsSuggestedItem(false)
        setIsItemInConceptualModel(true)
        onEditItem(attribute)
    }


    const onEditItem = (item: Item): void =>
    {
      setIsSuggestedItem(false)
      setSelectedSuggestedItem(item)
      setEditedSuggestedItem(item)

      handleClose()
      setIsShowEditDialog(true)
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () =>
    {
        setAnchorEl(null)
    }

    const handleOffset = 7


    return (
        <Box sx={{ minWidth: "260px", textAlign: "center", backgroundColor: "white", border: (selected || isClassHovered) ? borderSelected : borderNonSelected}}>

            <CustomHandle id="source-top" type="source" handleOffset={handleOffset} isSelected={selected} position={Position.Top} isHovered={isClassHovered} />
            <CustomHandle id="source-bottom" type="source" handleOffset={handleOffset} isSelected={selected} position={Position.Bottom} isHovered={isClassHovered} />

            <CustomHandle id="target-left" type="target" handleOffset={handleOffset} isSelected={selected} position={Position.Left} isHovered={isClassHovered} />
            <CustomHandle id="target-right" type="target" handleOffset={handleOffset} isSelected={selected} position={Position.Right} isHovered={isClassHovered} />


            <Button size="small" fullWidth={true}
                sx={{ color: selected ? PRIMARY_COLOR : "black", fontSize: "16px", textTransform: "none", overflow: "hidden", direction: "ltr" }}
                onMouseEnter={() => setIsClassHovered(_ => true)} 
                onMouseLeave={() => setIsClassHovered(_ => false)}
                >
                <strong>{ clipString(clss[Field.NAME], 22) }</strong>

                <Typography
                    id="long-button"
                    onClick={ handleClick }
                    sx={{ display: (isClassHovered || anchorEl) ? "block" : "none", position: "absolute", right: "0px", top: "6px" }}
                    >
                    <MoreVertIcon />
                </Typography>
            </Button>

            <DropdownMenu clss={clss} anchorEl={anchorEl} setAnchorEl={setAnchorEl} />

            { attributes.length > 0 && <Divider sx={{backgroundColor: selected ? PRIMARY_COLOR : "gray"}}></Divider> }

            <Stack>
                {attributes.map((attribute: Attribute, index: number) =>
                (
                    <Button size="small" key={`${attribute[Field.NAME]}-${index}`}
                        style={{justifyContent: "flex-start"}}
                        sx={{ color: selected ? PRIMARY_COLOR : "black", fontSize: "12px", textTransform: "lowercase"}}
                        onClick={ () => { handleEditAttribute(attribute) }}>
                        - { clipString(attribute[Field.NAME], 30) }
                    </Button>
                ))}
            </Stack>
        </Box>

    )
}