import { Button, ButtonGroup, IconButton, Stack, Tooltip } from "@mui/material"
import HighlightSingleItemButton from "./HighlightSingleItemButton"
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Attribute, Field, Item, ItemType, Association } from "../../interfaces/interfaces";
import { domainDescriptionSnapshotsState, domainDescriptionState, edgesState, editedSuggestedItemState, isIgnoreDomainDescriptionState, isItemInConceptualModelState, isShowEditDialogState, isSuggestedItemState, nodesState, selectedSuggestedItemState, sidebarErrorMsgState, textFilteringVariationSnapshotsState } from "../../atoms";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { createErrorMessage, itemTypeToUserChoice } from "../../utils/utility";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useState } from "react";
import { HEADER, SAVE_SUGESTED_ITEM_URL, SIDEBAR_BUTTON_COLOR, SIDEBAR_BUTTON_SIZE } from "../../utils/urls";
import { onAddItem } from "../../utils/conceptualModel";
import { getSnapshotDomainDescription, getSnapshotTextFilteringVariation } from "../../utils/snapshot";


interface Props
{
    item: Item
}

const ControlButtons: React.FC<Props> = ({ item }): JSX.Element =>
{
    const setNodes = useSetRecoilState(nodesState)
    const setEdges = useSetRecoilState(edgesState)

    const setErrorMessage = useSetRecoilState(sidebarErrorMsgState)
    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setEditedSuggestedItem = useSetRecoilState(editedSuggestedItemState)
    const setIsSuggestedItem = useSetRecoilState(isSuggestedItemState)
    const setIsItemInConceptualModel = useSetRecoilState(isItemInConceptualModelState)
    const setIsShowEditDialog = useSetRecoilState(isShowEditDialogState)

    const domainDescriptionSnapshot = useRecoilValue(domainDescriptionSnapshotsState)
    const textFilteringVariationSnapshot = useRecoilValue(textFilteringVariationSnapshotsState)

    const [isClicked, setIsClicked] = useState(false)


    const handleAddItem = (): void =>
    {
        setErrorMessage("")

        if (item.name === "")
        {
            const message = "Name cannot be empty"
            setErrorMessage(_ => message)
            return
        }

        const isOperationSuccessful = onAddItem(item, setNodes, setEdges)

        if (isOperationSuccessful)
        {
            return
        }

        createErrorMessage(item, setErrorMessage)
    }


    const handleEditSuggestedItem = (): void =>
    {
        setSelectedSuggestedItem(item)
        setEditedSuggestedItem(item)
        setIsSuggestedItem(true)
        setIsItemInConceptualModel(false)
        setIsShowEditDialog(true)
    }

    const handleSaveSuggestion = (isPositiveReaction: boolean) =>
    {
        const userChoice = itemTypeToUserChoice(item[Field.TYPE])
        const currentDomainDescription = getSnapshotDomainDescription(userChoice, domainDescriptionSnapshot)
        const currentTextFilteringVariation = getSnapshotTextFilteringVariation(userChoice, textFilteringVariationSnapshot)

        console.log("Snapshot: ", currentTextFilteringVariation)

        const suggestionData = {
            domainDescription: currentDomainDescription, isPositive: isPositiveReaction, item: item, userChoice: userChoice,
            textFilteringVariation: currentTextFilteringVariation
        }

        fetch(SAVE_SUGESTED_ITEM_URL, { method: 'POST', headers: HEADER, body: JSON.stringify(suggestionData)})

        setIsClicked(true)
    }

    
    return (

        // <Stack direction="row" spacing="30px" marginTop="10px" sx={{ display: 'flex', justifyContent:"left" }}>
        <ButtonGroup
            variant="outlined"
            color={ SIDEBAR_BUTTON_COLOR }
            fullWidth
            size="small"
            sx={{ marginTop: "15px" }}>

            <Tooltip
                title="Like"
                enterDelay={500}
                leaveDelay={200}>

                <Button
                    size={ SIDEBAR_BUTTON_SIZE }
                    sx={{ textTransform: "none" }}
                    disabled={isClicked}
                    onClick={ () => { handleSaveSuggestion(true) } }
                    >
                        <ThumbUpIcon/>
                </Button>
            </Tooltip>

            <Tooltip
                title="Add"
                enterDelay={500}
                leaveDelay={200}
                >
                <Button
                    size={ SIDEBAR_BUTTON_SIZE }
                    sx={{ textTransform: "none" }}
                    onClick={ handleAddItem }
                    >
                        <AddIcon/>
                </Button>
            </Tooltip>
            

            <Tooltip
                title="Edit"
                enterDelay={500}
                leaveDelay={200}
                >
                <Button
                    size="small"
                    sx={{ textTransform: "none" }}
                    onClick={ handleEditSuggestedItem }
                    >
                        <EditIcon/>
                </Button>
            </Tooltip>


            <HighlightSingleItemButton item={item}/>

            <Tooltip
                title="Dislike"
                enterDelay={500}
                leaveDelay={200}>

                <Button
                    size={ SIDEBAR_BUTTON_SIZE }
                    sx={{ textTransform: "none" }}
                    disabled={isClicked}
                    onClick={ () => { handleSaveSuggestion(false) } }
                    >
                    <ThumbDownIcon/>
                </Button>
            </Tooltip>

        </ButtonGroup>
    )
}

export default ControlButtons