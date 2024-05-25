import { SetterOrUpdater } from "recoil";
import { Attribute, Class, Field, Item, ItemType, ItemsMessage, Association, SidebarTabs, UserChoice, TextFilteringVariation } from "../interfaces/interfaces"
import { createNameFromIRI } from "./conceptualModel";


export const SUMMARY_DESCRIPTIONS_NAME = "Summary: descriptions"
export const SUMMARY_PLAIN_TEXT_NAME = "Summary: plain text"

export const ORIGINAL_TEXT_ID = "highlightedOriginalText"
export const NOTHING_SELECTED_MSG = "Please select some part of your conceptual model."

export const TEXT_FILTERING_VARIATION_DEFAULT_VALUE = TextFilteringVariation.SYNTACTIC


// TODO: It is probably better to use "null" instead of blank item
export const blankClass: Class = {
  [Field.IRI]: "", [Field.TYPE]: ItemType.CLASS, [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
}

export const blankAttribute: Attribute = {
  [Field.IRI]: "", [Field.NAME]: "", [Field.DESCRIPTION]: "", [Field.DATA_TYPE]: "", [Field.ORIGINAL_TEXT]: "",
  [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.TYPE]: ItemType.ATTRIBUTE, [Field.SOURCE_CARDINALITY]: "",
  [Field.SOURCE_CLASS]: ""
}


export const capitalizeString = (inputString : string) =>
{
  if (!inputString)
  {
    return ""
  }

  return inputString.charAt(0).toUpperCase() + inputString.slice(1)
}


export const clipString = (string: string, maxLength: number): string =>
{
  if (string.length > maxLength)
  {
    const newString = string.substring(0, maxLength) + "..."
    return newString
  }
  return string
}


export const userChoiceToItemType = (userChoice: UserChoice): ItemType =>
{
  if (userChoice === UserChoice.CLASSES)
  {
    return ItemType.CLASS 
  }

  if (userChoice === UserChoice.ATTRIBUTES)
  {
    return ItemType.ATTRIBUTE
  }

  if (userChoice === UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS || userChoice === UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES)
  {
    return ItemType.ASSOCIATION
  }

  throw Error(`Unexpected user choice: ${userChoice}`)
}


export const itemTypeToUserChoice = (itemType: ItemType): UserChoice =>
{
  if (itemType === ItemType.CLASS)
  {
    return UserChoice.CLASSES
  }
  else if (itemType === ItemType.ATTRIBUTE)
  {
    return UserChoice.ATTRIBUTES
  }
  else if (itemType === ItemType.ASSOCIATION || itemType === ItemType.GENERALIZATION)
  {
    return UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS
  }

  throw Error(`Received unknown item type: ${itemType}`)
}


export const createErrorMessage = (item: Item, setErrorMessage: SetterOrUpdater<string>): void =>
{
  let message = ""

  if (item[Field.TYPE] === ItemType.CLASS)
  {
    message = `Class "${item.name}" already exists`
  }
  else if (item[Field.TYPE] === ItemType.ATTRIBUTE)
  {
    const attribute: Attribute = item as Attribute
    const sourceClassName = createNameFromIRI(attribute[Field.SOURCE_CLASS])

    message = `Class "${sourceClassName}" already contains attribute: "${item[Field.NAME]}"`
  }
  else if (item[Field.TYPE] === ItemType.ASSOCIATION || item[Field.TYPE] === ItemType.GENERALIZATION)
  {
    const association: Association = item as Association
    const sourceClassName = createNameFromIRI(association[Field.SOURCE_CLASS])
    const targetClassName = createNameFromIRI(association[Field.TARGET_CLASS])

    message = `Association "${item[Field.NAME]}" in between source class "${sourceClassName}" and target class "${targetClassName}" already exists`
  }
  else
  {
    throw Error("Received unexpected item type: ", item[Field.TYPE])
  }

  setErrorMessage(message)
}


export const changeTitle = (userChoice: UserChoice, sourceItemName: string, targetItemName: string, setTitle: any): void =>
{
  if (userChoice === UserChoice.CLASSES)
  {
    const message = "All suggested classes: "
    setTitle((title: ItemsMessage) => { return { ...title, classes: message} })
  }
  else if (userChoice === UserChoice.ATTRIBUTES)
  {
    const message = `Selected class: ${sourceItemName}`
    setTitle((title: ItemsMessage) => { return { ...title, attributes: message} })
  }
  else if (userChoice === UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS)
  {
    const message = `Selected class: ${sourceItemName}`
    setTitle((title: ItemsMessage) => { return { ...title, associations: message} })
  }
  else if (userChoice === UserChoice.ASSOCIATIONS_TWO_KNOWN_CLASSES)
  {
    const message = `Source class: ${sourceItemName}\nTarget class: ${targetItemName}`
    setTitle((title: ItemsMessage) => { return { ...title, associations: message} })
  }
}


export const onClearSuggestedItems = (itemType: ItemType, setSuggestedEntities: any, setSuggestedAttributes: any, setSuggestedRelationships: any): void =>
{
  if (itemType === ItemType.CLASS)
  {
    setSuggestedEntities([])
  }
  else if (itemType === ItemType.ATTRIBUTE)
  {
    setSuggestedAttributes([])
  }
  else if (itemType === ItemType.ASSOCIATION)
  {
    setSuggestedRelationships([])
  }
}


export const changeSidebarTab = (itemType: ItemType, setSidebarTab: any) =>
{
  if (itemType === ItemType.CLASS)
  {
    setSidebarTab(SidebarTabs.CLASSES)
  }
  else if (itemType === ItemType.ATTRIBUTE)
  {
    setSidebarTab(SidebarTabs.ATTRIBUTES)
  }
  else if (itemType === ItemType.ASSOCIATION || itemType === ItemType.GENERALIZATION)
  {
    setSidebarTab(SidebarTabs.ASSOCIATIONS)
  }
  else
  {
    throw Error(`Received unknown item type: ${itemType}`)
  }
}