import { Node, Edge } from "reactflow"
import { Association, Attribute, Class, Field, Item, ItemType } from "../interfaces/interfaces"
import { SetterOrUpdater } from "recoil"
import { createIRIFromName, editEdgeAssociation, editNodeAttribute, editNodeClass } from "./conceptualModel"


export const onClose = (setIsOpened: SetterOrUpdater<boolean>, setErrorMessage: SetterOrUpdater<string>): void =>
{
    setIsOpened(_ => false)
    setErrorMessage(_ => "")
}


export const onClearRegeneratedItem = (field: Field, setRegeneratedItem: SetterOrUpdater<Item>) : void =>
{
    setRegeneratedItem((previousRegeneratedItem: Item) =>
    {
        if (previousRegeneratedItem.hasOwnProperty(field))
        {
            return { ...previousRegeneratedItem, [field]: ""}   
        }
        
        return previousRegeneratedItem
    })
}


export const onItemEdit = (field: Field, newValue: string, setEditedItem: SetterOrUpdater<Item>) : void =>
{
    setEditedItem((previousItem: Item) =>
    {
        if (field === Field.NAME)
        {
            const newIRI = createIRIFromName(newValue)
            return { ...previousItem, [field]: newValue, [Field.IRI]: newIRI }
        }
        else
        {
            return { ...previousItem, [field]: newValue }
        }
    })
}


export const onSave = (newItem: Item, oldItem: Item, setIsOpened: SetterOrUpdater<boolean>, setErrorMessage: SetterOrUpdater<string>, setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>): void =>
{
    console.log("Saving: ", newItem)
    
    if (!newItem[Field.NAME])
    {
        setErrorMessage(_ => "Name cannot be empty")
        return
    }

    setIsOpened(_ => false)

    if (newItem[Field.TYPE] === ItemType.CLASS)
    {
        editNodeClass(newItem as Class, oldItem as Class, setNodes, setEdges)
    }
    else if (newItem[Field.TYPE] === ItemType.ATTRIBUTE)
    {
        editNodeAttribute(newItem as Attribute, oldItem as Attribute, setNodes)
    }
    else if (newItem[Field.TYPE] === ItemType.ASSOCIATION || newItem[Field.TYPE] === ItemType.GENERALIZATION)
    {
        editEdgeAssociation(newItem as Association, oldItem as Association, setEdges)
    }
    else
    {
        throw Error("Unknown item type: ", newItem[Field.TYPE])
    }
}