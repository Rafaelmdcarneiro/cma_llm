import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { useEffect } from 'react';
import { isShowHighlightDialogState } from '../../atoms';
import { useRecoilState } from 'recoil';
import Title from './Title';
import HighlightedOriginalText from './HighlightedOriginalText';
import { ORIGINAL_TEXT_ID } from '../../utils/utility';



const HighlightDialog: React.FC = () =>
{
  const [isOpened, setIsOpened] = useRecoilState(isShowHighlightDialogState)


  useEffect(() =>
  {
    if (!isOpened)
    {
      return
    }

    // Scroll down to the first highlighted original text in the dialog
    const delay = async () =>
    {
      await new Promise(resolve => setTimeout(resolve, 200))

      let highlightedText = document.getElementById(`${ORIGINAL_TEXT_ID}-1`)

      if (highlightedText)
      {
        highlightedText.scrollIntoView( { behavior: 'smooth', block: 'center'})
      }
    }

    delay()
  }, [isOpened])


  const onClose = () =>
  {
    setIsOpened(false)
  }


  return (
      <Dialog
        open={ isOpened }
        fullWidth={ true }
        maxWidth={ "xl" }
        scroll={ "paper" }
        onClose={ onClose }
      >

        <Title/>

        <DialogContent dividers={true}>
          <DialogContentText>
            <HighlightedOriginalText/>
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" sx={{textTransform: "none"}} onClick={ onClose }>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
}

export default HighlightDialog