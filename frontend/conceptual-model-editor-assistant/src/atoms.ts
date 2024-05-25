import { atom, selector } from 'recoil'
import { Attribute, Class, Field, Item, ItemType, ItemsMessage, Association, SummaryObject, UserChoice, TextFilteringVariation } from './interfaces/interfaces';
import { Node, Edge } from 'reactflow';
import { TEXT_FILTERING_VARIATION_DEFAULT_VALUE, blankClass } from './utils/utility';
import { DATASPECER_MODEL_URL } from './utils/urls';
import { ConceptualModelSnapshot, DomainDescriptionSnapshot, TextFilteringVariationSnapshot } from './interfaces/snapshots';

// TODO: Divide atoms into separate files

export const isShowEditDialogState = atom({
    key: "isShowEditDialogState",
    default: false,
})

export const isShowHighlightDialogState = atom({
    key: "isShowHighlightDialogState",
    default: false,
})

export const isShowCreateEdgeDialogState = atom({
    key: "isShowCreateEdgeDialogState",
    default: false,
})


// export const suggestedItemsState = atom<any>({
//     key: "suggestedItemsState",
//     default: { classes: [], attributes: [], associations: []},
// })

export const suggestedClassesState = atom<Class[]>({
    key: "suggestedClassesState",
    default: [],
})

export const suggestedAttributesState = atom<Attribute[]>({
    key: "suggestedAttributesState",
    default: [],
})

export const suggestedAssociationsState = atom<Association[]>({
    key: "suggestedAssociationsState",
    default: [],
})


export const sidebarTitlesState = atom<ItemsMessage>({
    key: "sidebarTitlesState",
    default: { classes: "", attributes: "", associations: "" },
})


export const isIgnoreDomainDescriptionState = atom({
    key: "isIgnoreDomainDescriptionState",
    default: false,
})

export const domainDescriptionState = atom({
    key: "domainDescriptionState",
    default: "",
})

export const domainDescriptionSnapshotsState = atom<DomainDescriptionSnapshot>({
    key: "domainDescriptionSnapshotsState",
    default: { [UserChoice.CLASSES]: "", [UserChoice.ATTRIBUTES]: "", [UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS]: "", [UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES]: "",
    [UserChoice.SINGLE_FIELD]: "", [UserChoice.SUMMARY_PLAIN_TEXT]: "", [UserChoice.SUMMARY_DESCRIPTIONS]: ""},
})


export const textFilteringVariationSnapshotsState = atom<TextFilteringVariationSnapshot>({
    key: "textFilteringVariationSnapshotsState",
    default: {
        [UserChoice.CLASSES]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE, [UserChoice.ATTRIBUTES]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE,
        [UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE, [UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE,
        [UserChoice.SINGLE_FIELD]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE, [UserChoice.SUMMARY_PLAIN_TEXT]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE,
        [UserChoice.SUMMARY_DESCRIPTIONS]: TEXT_FILTERING_VARIATION_DEFAULT_VALUE
    },
})


export const conceptualModelSnapshotState = atom<ConceptualModelSnapshot>({
    key: "conceptualModelSnapshotState",
    default: { [UserChoice.SUMMARY_PLAIN_TEXT]: "", [UserChoice.SUMMARY_DESCRIPTIONS]: ""},
})


export const fieldToLoadState = atom<Field[]>({
    key: "fieldToLoadState",
    default: [],
})


export const itemTypesToLoadState = atom<ItemType[]>({
    key: "itemTypesToLoadState",
    default: [],
})


// TODO: Do not use initial invalid item, instead make a type: Item | null
export const selectedSuggestedItemState = atom<Item>({
    key: "selectedSuggestedItemState",
    default: blankClass,
})

export const editedSuggestedItemState = atom<Item>({
    key: "editedSuggestedItemState",
    default: blankClass,
})

export const regeneratedItemState = atom<Item>({
    key: "regeneratedItemState",
    default: blankClass,
})

export const isSuggestedItemState = atom({
    key: "isSuggestedItemState",
    default: true,
})


export const isItemInConceptualModelState = atom({
    key: "isItemInConceptualModelState",
    default: true,
})


export const originalTextIndexesListState = atom<number[]>({
    key: "originalTextIndexesListState",
    default: [],
})

export const tooltipsState = atom<string[]>({
    key: "tooltipsState",
    default: [],
})



export const isLoadingSuggestedItemsState = atom({
    key: "isLoadingSuggestedItemsState",
    default: false,
})

export const isLoadingEditState = atom({
    key: "isLoadingEditState",
    default: false,
})

export const isLoadingSummaryPlainTextState = atom({
    key: "isLoadingSummaryPlainTextState",
    default: false,
})

export const isLoadingSummaryDescriptionsState = atom({
    key: "isLoadingSummaryDescriptionsState",
    default: false,
})

export const isLoadingHighlightOriginalTextState = atom({
    key: "isLoadingHighlightOriginalTextState",
    default: false,
})


export const summaryTextState = atom({
    key: "summaryTextState",
    default: "",
})

// TODO: This object should contain descriptions for "classes": array of classes and "associations": array of associations
export const summaryDescriptionsState = atom<SummaryObject>({
    key: "summaryDescriptionsState",
    default: { classes: [], associations: []},
})


export const isSidebarOpenState = atom({
    key: "isSidebarOpenState",
    default: true,
})


export const nodesState = atom<Node[]>({
    key: "nodesState",
    default: [],
})


// Possible optimization: save only indexes of the selected nodes
export const selectedNodesState = selector<Node[]>({
    key: "selectedNodesState",
    get: ({get}) =>
    {
        const nodes = get(nodesState)
        return nodes.filter((node) => node.selected)   
    }
})

export const edgesState = atom<Edge[]>({
    key: "edgesState",
    default: [],
})


export const selectedEdgesState = selector<Edge[]>({
    key: "selectedEdgesState",
    get: ({get}) =>
    {
        const edges = get(edgesState)
        return edges.filter((edge) => edge.selected)
    }
})


export const topbarTabValueState = atom({
    key: "topbarTabValueState",
    default: "0",
})


export const sidebarTabValueState = atom({
    key: "sidebarTabValueState",
    default: "0",
})


export const editDialogErrorMsgState = atom({
    key: "editDialogErrorMsgState",
    default: "",
})


export const sidebarErrorMsgState = atom({
    key: "sidebarErrorMsgState",
    default: "",
})


export const importedFileNameState = atom({
    key: "importedFileNameState",
    default: "",
})


export const isDialogEnterIRIOpenedState = atom({
    key: "isDialogEnterIRIOpenedState",
    default: false,
})


export const isShowTitleDialogDomainDescriptionState = atom({
    key: "isShowTitleDialogDomainDescriptionState",
    default: true,
})

export const modelIDState = atom({
    key: "modelIDState",
    default: DATASPECER_MODEL_URL,
})


export const isSummaryPlainTextReactButtonClickedState = atom({
    key: "isSummaryPlainTextReactButtonClickedState",
    default: false,
})

export const isSummaryDescriptionReactButtonClickedState = atom({
    key: "isSummaryDescriptionReactButtonClickedState",
    default: false,
})


export const isSidebarCollapsedState = atom({
    key: "isSidebarCollapsedState",
    default: false,
})


export const isDialogImportState = atom({
    key: "isDialogImportState",
    default: true,
})


export const regeneratedOriginalTextIndexesState = atom<number[]>({
    key: "regeneratedOriginalTextIndexesState",
    default: [],
})


export const textFilteringVariationState = atom<TextFilteringVariation>({
    key: "textFilteringVariationState",
    default: TEXT_FILTERING_VARIATION_DEFAULT_VALUE,
})