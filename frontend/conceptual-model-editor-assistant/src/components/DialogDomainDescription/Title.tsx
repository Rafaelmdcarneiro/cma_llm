import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useRecoilValue } from 'recoil';
import { isLoadingHighlightOriginalTextState, isShowTitleDialogDomainDescriptionState, originalTextIndexesListState, selectedSuggestedItemState } from '../../atoms';


const Title: React.FC = (): JSX.Element =>
{
    const originalTextIndexes = useRecoilValue(originalTextIndexesListState)
    const isLoading = useRecoilValue(isLoadingHighlightOriginalTextState)
    const selectedItem = useRecoilValue(selectedSuggestedItemState)
    const isShowTitleDialogDomainDescription = useRecoilValue(isShowTitleDialogDomainDescriptionState)

    const isOriginalTextIndexesEmpty = originalTextIndexes.length === 0

    
    return (
        <DialogTitle>
            <Stack spacing={2}>

            {
                isLoading &&
                <Alert variant="outlined" severity="info">

                <Box display="flex" alignItems="center" overflow="hidden">
                    <Box mr={1} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis"> Updating </Box>
                    <CircularProgress size={20} />
                </Box>

                </Alert>
            }

            { isOriginalTextIndexesEmpty &&
                <Alert variant="outlined" severity="warning">
                Unable to find original text in domain description
                </Alert>
            }

            {  isShowTitleDialogDomainDescription ?
                <Typography variant="h5"> Selected {selectedItem.type}: <strong>{selectedItem.name}</strong> </Typography>
                : <Typography variant="h5"> Highlighting selected items in domain description </Typography> }

            </Stack>
        </DialogTitle>
    )
}

export default Title