import { Typography, CircularProgress, Button, Tooltip, Stack } from "@mui/material"
import { useRecoilState, useRecoilValue } from "recoil"
import { conceptualModelSnapshotState, domainDescriptionSnapshotsState, isLoadingSummaryPlainTextState, isSummaryPlainTextReactButtonClickedState, summaryTextState } from "../../atoms"
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { UserChoice } from "../../interfaces/interfaces";
import { HEADER, SAVE_SUGESTED_SUMMARY_URL } from "../../utils/urls";
import { getSnapshotConceptualModel, getSnapshotDomainDescription } from "../../utils/snapshot";


const SummaryPlainTextTab: React.FC = (): JSX.Element =>
{
    const [isClicked, setIsClicked] = useRecoilState(isSummaryPlainTextReactButtonClickedState)
    
    const summary = useRecoilValue(summaryTextState)

    const isLoadingSummaryPlainText = useRecoilValue(isLoadingSummaryPlainTextState)
    const domainDescriptionSnapshot = useRecoilValue(domainDescriptionSnapshotsState)
    const conceptualModelSnapshot = useRecoilValue(conceptualModelSnapshotState)


    const handleSaveSuggestion = (isPositiveReaction: boolean) =>
    {
        const userChoice = UserChoice.SUMMARY_PLAIN_TEXT
        const currentDomainDescription = getSnapshotDomainDescription(userChoice, domainDescriptionSnapshot)
        const currentConceptualModel = getSnapshotConceptualModel(userChoice, conceptualModelSnapshot)

        const suggestionData = {
            domainDescription: currentDomainDescription, isPositive: isPositiveReaction, summary: summary,
            "summaryType": userChoice, conceptualModel: currentConceptualModel
        }

        fetch(SAVE_SUGESTED_SUMMARY_URL, { method: 'POST', headers: HEADER, body: JSON.stringify(suggestionData)})

        setIsClicked(true)
    }


    return (
        <>
            <Typography>
                { summary }
                { isLoadingSummaryPlainText && <CircularProgress /> }
            </Typography>

            {
                summary !== "" && !isLoadingSummaryPlainText &&
                <Stack direction="row" spacing={"8px"}>
                    <Tooltip
                        title="Like"
                        enterDelay={500}
                        leaveDelay={200}>

                        <Button
                            size={ "small" }
                            color="inherit"
                            sx={{ textTransform: "none", maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px' }}
                            disabled={isClicked}
                            onClick={ () => { handleSaveSuggestion(true) } }
                            >
                                <ThumbUpIcon sx={{ width: "20px", height: "20px" }}/>
                        </Button>
                    </Tooltip>

                    <Tooltip
                        title="Dislike"
                        enterDelay={500}
                        leaveDelay={200}>

                        <Button
                            color="inherit"
                            size={ "small" }
                            sx={{ textTransform: "none", maxWidth: '50px', maxHeight: '30px', minWidth: '30px', minHeight: '30px', paddingRight: "10px" }}
                            disabled={isClicked}
                            onClick={ () => { handleSaveSuggestion(false) } }
                            >
                                <ThumbDownIcon sx={{ width: "20px", height: "20px" }}/>
                        </Button>
                    </Tooltip>
                </Stack>
            }
        </>
    )
}

export default SummaryPlainTextTab