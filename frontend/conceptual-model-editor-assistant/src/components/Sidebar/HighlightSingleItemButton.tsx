import { Button, Tooltip } from "@mui/material"
import HighlightIcon from '@mui/icons-material/Highlight';
import { domainDescriptionState, isIgnoreDomainDescriptionState, isShowHighlightDialogState, isShowTitleDialogDomainDescriptionState, originalTextIndexesListState, selectedSuggestedItemState, tooltipsState } from "../../atoms";
import { RecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Attribute, Field, Item, ItemType, Association } from "../../interfaces/interfaces";
import { capitalizeString } from "../../utils/utility";
import { useState } from "react";
import { SIDEBAR_BUTTON_SIZE } from "../../utils/urls";
import { createNameFromIRI } from "../../utils/conceptualModel";


interface Props
{
    item: Item
}

const HighlightSingleItemButton: React.FC<Props> = ({ item }): JSX.Element =>
{
    const domainDescription = useRecoilValue(domainDescriptionState)
    const isIgnoreDomainDescription = useRecoilValue(isIgnoreDomainDescriptionState)
    const isDisabled = (!item.hasOwnProperty(Field.ORIGINAL_TEXT_INDEXES)) || domainDescription === "" || isIgnoreDomainDescription

    const setSelectedSuggestedItem = useSetRecoilState(selectedSuggestedItemState)
    const setIsShowHighlightDialog = useSetRecoilState(isShowHighlightDialogState)
    const setOriginalTextIndexesList = useSetRecoilState(originalTextIndexesListState)
    const setTooltips = useSetRecoilState(tooltipsState)
    const setIsShowTitleDialogDomainDescription = useSetRecoilState(isShowTitleDialogDomainDescriptionState)


    const onHighlightSingleItem = () =>
    {
        if (!item.hasOwnProperty(Field.ORIGINAL_TEXT_INDEXES))
        {
            item = { ...item, [Field.ORIGINAL_TEXT_INDEXES]: [] }
        }

        setIsShowTitleDialogDomainDescription(true)
        setIsShowHighlightDialog(_ => true)
        setSelectedSuggestedItem(_ => item)
        setOriginalTextIndexesList(_ => item[Field.ORIGINAL_TEXT_INDEXES])
    
        // Create tooltips for highlighted original text
        let tooltip = ""
    
        if (item[Field.TYPE] === ItemType.CLASS)
        {
            tooltip = `Class: ${item[Field.NAME]}`
        }
        else if (item[Field.TYPE] === ItemType.ATTRIBUTE)
        {
            const attribute: Attribute = item as Attribute
            const sourceName = createNameFromIRI(attribute[Field.SOURCE_CLASS])
            
            tooltip = `${sourceName}: ${item.name}`
        }
        else if (item[Field.TYPE] === ItemType.ASSOCIATION)
        {
            const association: Association = item as Association
            const sourceName = createNameFromIRI(association[Field.SOURCE_CLASS])
            const targetName = createNameFromIRI(association[Field.TARGET_CLASS])

            tooltip = `${sourceName} - ${item[Field.NAME]} - ${targetName}`
        }
    
        let newTooltips : string[] = Array(item.originalTextIndexes.length).fill(tooltip)
        setTooltips(_ => newTooltips)
    }

    if (isDisabled)
    {
        return <></>
    }

    return (
        <Tooltip
            title="Highlight in domain description"
            enterDelay={500}
            leaveDelay={200}>

            <Button
                disabled={isDisabled}
                size={ SIDEBAR_BUTTON_SIZE }
                sx={{ textTransform: "none" }}
                onClick={ () => onHighlightSingleItem() }>
                    <HighlightIcon/>
            </Button>
        </Tooltip>
    )
}

export default HighlightSingleItemButton
