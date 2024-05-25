import { Button } from "@mui/material"
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import { NOTHING_SELECTED_MSG, SUMMARY_PLAIN_TEXT_NAME } from "../../utils/utility";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { conceptualModelSnapshotState, domainDescriptionSnapshotsState, domainDescriptionState, isIgnoreDomainDescriptionState, isSummaryPlainTextReactButtonClickedState, selectedEdgesState, selectedNodesState, summaryTextState, topbarTabValueState } from "../../atoms";
import { TopbarTabs, UserChoice } from "../../interfaces/interfaces";
import { snapshotConceptualModel, snapshotDomainDescription } from "../../utils/snapshot";
import { convertConceptualModelToJSONSummary } from "../../utils/serialization";
import useFetchSummaryPlainText from "../../hooks/useFetchSummaryPlainText";


const SummaryPlainTextButton: React.FC= (): JSX.Element =>
{
    const selectedNodes = useRecoilValue(selectedNodesState)
    const selectedEdges = useRecoilValue(selectedEdgesState)

    const setTopbarTab = useSetRecoilState(topbarTabValueState)
    const setSummaryText = useSetRecoilState(summaryTextState)

    const domainDescription = useRecoilValue(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
    const setDomainDescriptionSnapshot = useSetRecoilState(domainDescriptionSnapshotsState)
    const setConceptualModelSnapshot = useSetRecoilState(conceptualModelSnapshotState)

    const setIsReactButtonClicked = useSetRecoilState(isSummaryPlainTextReactButtonClickedState)
    
    const isDisabled = domainDescription === "" || isIgnoreDomainDescription

    const { fetchSummaryPlainText } = useFetchSummaryPlainText()

    
    const handleSummaryPlainTextClick = (): void =>
    {
        if (selectedNodes.length === 0 && selectedEdges.length === 0)
        {
            alert(NOTHING_SELECTED_MSG)
            return
        }

        const userChoice = UserChoice.SUMMARY_PLAIN_TEXT
        setSummaryText("")
        setIsReactButtonClicked(false)
        
        const currentDomainDescription = isIgnoreDomainDescription ? "" : domainDescription
        snapshotDomainDescription(userChoice, currentDomainDescription, setDomainDescriptionSnapshot)

        const conceptualModel = convertConceptualModelToJSONSummary(selectedNodes, selectedEdges, false)
        snapshotConceptualModel(userChoice, conceptualModel, setConceptualModelSnapshot)

        setTopbarTab(TopbarTabs.SUMMARY_PLAIN_TEXT)

        const bodyData = JSON.stringify({"summaryType": userChoice, "conceptualModel": conceptualModel, "domainDescription": currentDomainDescription})

        fetchSummaryPlainText(bodyData)
    }


    return (
        <Button
            disabled={isDisabled}
            variant="contained"
            sx={{textTransform: "none"}}
            disableElevation
            startIcon={<AutoFixNormalIcon/>}
            onClick={ handleSummaryPlainTextClick }>
                { SUMMARY_PLAIN_TEXT_NAME }
        </Button>
    )
}

export default SummaryPlainTextButton