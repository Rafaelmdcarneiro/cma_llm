import { Button } from "@mui/material"
import HighlightIcon from '@mui/icons-material/Highlight';
import { domainDescriptionState, isLoadingHighlightOriginalTextState, isShowHighlightDialogState, isShowTitleDialogDomainDescriptionState, originalTextIndexesListState, selectedEdgesState, selectedNodesState, selectedSuggestedItemState, tooltipsState } from "../../atoms";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { Attribute, EdgeData, Field, Item, ItemType, NodeData, OriginalTextIndexesItem } from "../../interfaces/interfaces";
import { NOTHING_SELECTED_MSG, capitalizeString } from "../../utils/utility";
import { HEADER, MERGE_ORIGINAL_TEXT_URL } from "../../utils/urls";
import { createNameFromIRI } from "../../utils/conceptualModel";


const HighlightSelectedItemsButton: React.FC = ():JSX.Element =>
{
    const selectedNodes = useRecoilValue(selectedNodesState)
    const selectedEdges = useRecoilValue(selectedEdgesState)

    const setIsLoading = useSetRecoilState(isLoadingHighlightOriginalTextState)

    const domainDescription = useRecoilValue(domainDescriptionState)
    const isDisabled = domainDescription === ""

    const setIsShowHighlightDialog = useSetRecoilState(isShowHighlightDialogState)
    const setOriginalTextIndexesList = useSetRecoilState(originalTextIndexesListState)
    const setTooltips = useSetRecoilState(tooltipsState)
    const setIsShowTitleDialogDomainDescription = useSetRecoilState(isShowTitleDialogDomainDescriptionState)



    // TODO: Put this fetch logic into a separate file
    const fetchMergedOriginalTexts = (bodyData: any) =>
    {
        fetch(MERGE_ORIGINAL_TEXT_URL, { method: "POST", headers: HEADER, body: bodyData})
        .then(response => response.json())
        .then(data =>
        {
            // TODO: Specify `data` type
            onProcessMergedOriginalTexts(data)
            setIsLoading(false)
        })
        .catch(error =>
        {
            setIsLoading(false)
            console.log(error)
            alert("Error: request failed")
        })

        return
    }


    function onProcessMergedOriginalTexts(data: any): void
    {
        let tooltips : string[] = []
        let originalTextIndexes : number[] = []

        for (let index = 0; index < data.length; index++)
        {
            const element = data[index];
            originalTextIndexes.push(element[0])
            originalTextIndexes.push(element[1])
            tooltips.push(element[2])
        }

        setOriginalTextIndexesList(_ => originalTextIndexes)
        setTooltips(_ => tooltips)
    }


    const onHighlightSelectedItems = (): void =>
    {
        if (selectedNodes.length === 0 && selectedEdges.length === 0)
        {
            alert(NOTHING_SELECTED_MSG)
            return
        }

        setIsLoading(true)

        setIsShowTitleDialogDomainDescription(false)

        let originalTextsIndexesObjects : OriginalTextIndexesItem[] = []
    
        // Process all selected nodes
        for (let i = 0; i < selectedNodes.length; i++)
        {
            const nodeData: NodeData = selectedNodes[i].data
            // console.log("Node data:", nodeData)

            // Process each attribute for the given entity
            const className: string = nodeData.class[Field.NAME]
            // console.log("Class name: ", className)
            for (let j = 0; j < nodeData.attributes.length; j++)
            {
                const attribute = nodeData.attributes[j]
                const originalTextIndexes = attribute[Field.ORIGINAL_TEXT_INDEXES]
        
                if (!attribute[Field.ORIGINAL_TEXT_INDEXES])
                {
                    continue
                }
        
                // Process each original text indexes for the given attribute
                for (let k = 0; k < originalTextIndexes.length; k += 2)
                {
                    const ii1: number = originalTextIndexes[k]
                    const ii2: number = originalTextIndexes[k + 1]
            
                    originalTextsIndexesObjects.push( { indexes: [ii1, ii2], label: `${className}: ${attribute[Field.NAME]}`} )
                }
            }

            const originalTextIndexes = nodeData.class[Field.ORIGINAL_TEXT_INDEXES]
            // console.log("OTI: ", originalTextIndexes)

            if (!originalTextIndexes)
            {
                continue
            }
        
            // Process each original text indexes for the given entity 
            for (let k = 0; k < originalTextIndexes.length; k += 2)
            {
                const ii1 : number = originalTextIndexes[k]
                const ii2 : number = originalTextIndexes[k + 1]
        
                originalTextsIndexesObjects.push( { indexes: [ii1, ii2], label: `Class: ${nodeData.class[Field.NAME]}`} )
            }
        }
    
        // Process also all selected edges
        for (let i = 0; i < selectedEdges.length; i++)
        {
            const edgeData: EdgeData = selectedEdges[i].data
            const originalTextIndexes = edgeData.association.originalTextIndexes
            
            if (!originalTextIndexes)
            {
                continue
            }
        
            // Process each original text indexes for the given edge 
            for (let k = 0; k < originalTextIndexes.length; k += 2)
            {
                const ii1 : number = originalTextIndexes[k]
                const ii2 : number = originalTextIndexes[k + 1]

                const sourceName = createNameFromIRI(selectedEdges[i][Field.SOURCE_CLASS])
                const targetName = createNameFromIRI(selectedEdges[i][Field.TARGET_CLASS])
        
                originalTextsIndexesObjects.push({
                    indexes: [ii1, ii2], label: `${sourceName} - ${edgeData.association[Field.NAME]} - ${targetName}`
                })
            }
        }

        const bodyData = JSON.stringify({ "originalTextIndexesObject": originalTextsIndexesObjects})
    
        fetchMergedOriginalTexts(bodyData)
        setIsShowHighlightDialog(true)
    }


    return (
        <Button
            disabled={isDisabled}
            startIcon={<HighlightIcon/>}
            variant="contained"
            sx={{textTransform: "none"}}
            disableElevation 
            onClick={ onHighlightSelectedItems }>
                { capitalizeString("Highlight original text") }
        </Button>

    )
}

export default HighlightSelectedItemsButton