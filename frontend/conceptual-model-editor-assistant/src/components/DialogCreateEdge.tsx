import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { Field, Item, ItemType, Association, UserChoice } from '../interfaces/interfaces';
import AddIcon from '@mui/icons-material/Add';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import { editedSuggestedItemState, isShowCreateEdgeDialogState, isShowEditDialogState, selectedSuggestedItemState } from '../atoms';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import useSuggestItems from '../hooks/useSuggestItems';
import { createNameFromIRI } from '../utils/conceptualModel';


const DialogCreateEdge: React.FC = () =>
{
  const [isOpened, setIsOpened] = useRecoilState(isShowCreateEdgeDialogState)
  const association = useRecoilValue(selectedSuggestedItemState) as Association

  const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)

  const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
  const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)

  const { onSuggestItems } = useSuggestItems()

  if (!association[Field.SOURCE_CLASS] || !association[Field.TARGET_CLASS])
  {
    return <></>
  }

  // Right now in the UI we are showing names converted from IRIs but it would be better to show exact class names
  const sourceClassName = createNameFromIRI(association[Field.SOURCE_CLASS])
  const targetClassName = createNameFromIRI(association[Field.TARGET_CLASS])


  const handleClose = (): void =>
  {
    setIsOpened(false)
  }


  const handleManuallyAddNewAssociation = (isGeneralization: boolean): void =>
  {
    const itemType: ItemType = isGeneralization ? ItemType.GENERALIZATION : ItemType.ASSOCIATION
    const newObject = { ...association, [Field.TYPE]: itemType}
    setSelectedSuggestedItem(newObject)
    setEditedSuggestedItem(newObject)

    setIsShowEditDialog(true)
    handleClose()
  }


  return (
    <>
      <Dialog
        open={isOpened}
        fullWidth={true}
        maxWidth={"md"}
        scroll={"paper"}
        onClose={handleClose}
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          <Stack>
            Select how to create association with source as "{ sourceClassName }" and target as "{ targetClassName }"
          </Stack>
        </DialogTitle>

        <DialogContent dividers={true}>

            <Stack direction="row" sx={{justifyContent:"space-around"}}>
                <Button
                  startIcon={ <AddIcon/> }
                  variant="outlined"
                  sx={{textTransform: "none"}}
                  onClick={() => { handleManuallyAddNewAssociation(false) } }
                  >
                    Create association manually
                </Button>

                <Button
                  startIcon={ <AddIcon/> }
                  variant="outlined"
                  sx={{textTransform: "none"}}
                  onClick={() => { handleManuallyAddNewAssociation(true) } }
                  >
                    Create generalization manually
                </Button>

                <Button
                  startIcon={ <AutoFixNormalIcon/> }
                  variant="outlined"
                  sx={{textTransform: "none"}}
                  onClick={() => { onSuggestItems(UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES, sourceClassName, targetClassName); handleClose() } }
                  >
                    Suggest associations
                </Button>
            </Stack>

        </DialogContent>
      </Dialog>
    </> )
}

export default DialogCreateEdge