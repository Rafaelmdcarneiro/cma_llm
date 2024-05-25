import { ListItemIcon, Menu, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import { Attribute, Class, Field, Item, ItemType, UserChoice } from '../../../interfaces/interfaces';
import useSuggestItems from '../../../hooks/useSuggestItems';
import { useSetRecoilState } from 'recoil';
import { editedSuggestedItemState, isItemInConceptualModelState, isShowEditDialogState, isSuggestedItemState, selectedSuggestedItemState } from '../../../atoms';


interface Props
{
    clss: Class
    anchorEl: any
    setAnchorEl: any
}


const DropdownMenu: React.FC<Props> = ({ clss, anchorEl, setAnchorEl }): JSX.Element =>
{
    // Menu component use cases: https://mui.com/material-ui/react-menu/
    
    const open = Boolean(anchorEl)

    const setIsSuggestedItem = useSetRecoilState(isSuggestedItemState)
    const setIsItemInConceptualModel = useSetRecoilState(isItemInConceptualModelState)
    const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)

    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)

    const { onSuggestItems } = useSuggestItems()


    const handleClose = () =>
    {
        setAnchorEl(null)
    }


    const handleEditClass = () =>
    {
        setIsSuggestedItem(false)
        setIsItemInConceptualModel(true)
        onEditItem(clss)
    }


    const onEditItem = (item: Item): void =>
    {
        setIsSuggestedItem(false)
        setSelectedSuggestedItem(item)
        setEditedSuggestedItem(item)

        handleClose()
        setIsShowEditDialog(true)
    }
    
    
    const handleAddNewAttribute = () =>
    {
        setIsSuggestedItem(false)
        setIsItemInConceptualModel(false)

        const newAttribute: Attribute = {
            [Field.IRI]: "", [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.DATA_TYPE]: "", [Field.ORIGINAL_TEXT]: "",
            [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.TYPE]: ItemType.ATTRIBUTE, [Field.SOURCE_CARDINALITY]: "",
            [Field.SOURCE_CLASS]: clss[Field.IRI]
        }
        
        setSelectedSuggestedItem(newAttribute)
        setEditedSuggestedItem(newAttribute)
        handleClose()
        setIsShowEditDialog(true)
    }


    return (
        <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{"aria-labelledby": "basic-button"}}
        >
            <MenuItem onClick={ handleEditClass }>
                <ListItemIcon>
                    <EditIcon fontSize="small" />
                </ListItemIcon>
                    Edit class
            </MenuItem>

            <MenuItem onClick={ handleAddNewAttribute }>
                <ListItemIcon>
                    <AddIcon fontSize="small" />
                </ListItemIcon>
                    Add new attribute
            </MenuItem>


            <MenuItem onClick={() => { onSuggestItems(UserChoice.ATTRIBUTES, clss[Field.NAME], null); handleClose(); }}>
                <ListItemIcon>
                    <AutoFixNormalIcon fontSize="small" />
                </ListItemIcon>
                    Suggest attributes
            </MenuItem>
            
            <MenuItem onClick={() => { onSuggestItems(UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS, clss[Field.NAME], null); handleClose(); }}>
                <ListItemIcon>
                    <AutoFixNormalIcon fontSize="small" />
                </ListItemIcon>
                    Suggest associations
            </MenuItem>
        </Menu>
    )
}


export default DropdownMenu