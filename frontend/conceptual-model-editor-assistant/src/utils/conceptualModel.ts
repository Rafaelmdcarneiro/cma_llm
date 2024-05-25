import { Node, Edge, MarkerType, EdgeMarker, internalsSymbol } from 'reactflow';
import { Association, Attribute, Class, EdgeData, Field, Item, ItemType, NodeData } from '../interfaces/interfaces';
import { SetterOrUpdater } from 'recoil';
import { blankClass } from './utility';


export const CUSTOM_EDGE_TYPE = "custom-edge"
export const CUSTOM_EDGE_MARKER: EdgeMarker = { type: MarkerType.Arrow, width: 50, height: 50, strokeWidth: 1 }
export const CUSTOM_ISA_EDGE_MARKER: EdgeMarker = { type: MarkerType.ArrowClosed, width: 40, height: 40, strokeWidth: 0.8 }


export const getNodeByID = (nodes: Node[], nodeID: string): Node | null =>
{
    for (let i = 0; i < nodes.length; i++)
    {
        if (nodes[i].id === nodeID)
        {
            return nodes[i]
        }
    }
    
    return null
}


export const createEdgeUniqueID = (source: string, target: string, iri: string): string =>
{
    return `${source}-${iri}-${target}`
}


export const doesNodeAlreadyExist = (nodes: Node[], nodeID: string): boolean =>
{
    for (let i = 0; i < nodes.length; i++)
    {
        if (nodes[i].id === nodeID)
        {
            return true
        }
    }

    return false
}


export const doesNodeAlreadyExistSetter = (setNodes: SetterOrUpdater<Node[]>, nodeID: string): boolean =>
{
    // It would be more readable to use `doesNodeAlreadyExist` function
    // however, that triggers re-rendering any time a node is moved

    let isNodeAlreadyPresent = false

    setNodes((nodes: Node[]) => nodes.map(currentNode => 
    {
        if (nodeID === currentNode.id)
        {
            isNodeAlreadyPresent = true
        }
        return currentNode
    }))

    return isNodeAlreadyPresent
}


export const doesEdgeAlreadyExist = (edges: Edge[], edgeID: string): boolean =>
{
    for (let i = 0; i < edges.length; i++)
    {
        const edge: Edge = edges[i]

        if (edge.id === edgeID)
        {
            return true
        }
    }

    return false
}


export const doesEdgeAlreadyExistSetter = (setEdges: SetterOrUpdater<Edge[]>, edgeID: string): boolean =>
{
    let isEdgeAlreadyPresent = false

    setEdges((edges: Edge[]) => edges.map(currentEdge => 
    {
        if (edgeID === currentEdge.id)
        {
            isEdgeAlreadyPresent = true
        }
        return currentEdge
    }))

    return isEdgeAlreadyPresent
}

export const doesSameEdgeBetweenNodesAlreadyExistSetter = (setEdges: SetterOrUpdater<Edge[]>, newEdgeIRI: string, associationType: string, sourceNodeID: string, targetNodeID: string): boolean =>
{
    let isEdgeAlreadyPresent = false

    setEdges((edges: Edge[]) => edges.map(currentEdge => 
    {
        const isEdgeBetweenTheSameNodes = currentEdge.source === sourceNodeID && currentEdge.target === targetNodeID
        const isSameType = associationType === currentEdge.data.association[Field.TYPE]
        const edgeData: EdgeData = currentEdge.data

        if (isEdgeBetweenTheSameNodes && isSameType && edgeData.association[Field.IRI] === newEdgeIRI)
        {
            isEdgeAlreadyPresent = true
        }

        return currentEdge
    }))

    return isEdgeAlreadyPresent
}

export const onAddItem = (item: Item, setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>): boolean =>
{
    if (item[Field.TYPE] === ItemType.CLASS)
    {
        const maxRandomValue = 400
        const randomX = Math.floor(Math.random() * maxRandomValue)
        const randomY = Math.floor(Math.random() * maxRandomValue)
        return onAddClass(item as Class, randomX, randomY, setNodes)
    }
    else if (item[Field.TYPE] === ItemType.ATTRIBUTE)
    {
        return onAddAttribute(item as Attribute, setNodes)
    }
    else if (item[Field.TYPE] === ItemType.ASSOCIATION || item[Field.TYPE] === ItemType.GENERALIZATION)
    {
        return onAddAssociation(item as Association, setNodes, setEdges)
    }
    else
    {
        throw Error("Unknown item type")
    }
}


export const onAddClass = (clss: Class, positionX: number, positionY: number, setNodes: SetterOrUpdater<Node[]>): boolean =>
{
    if (doesNodeAlreadyExistSetter(setNodes, clss[Field.IRI]))
    {
        return false
    }

    const iri = createIRIFromName(clss[Field.NAME])
    clss = { ...clss, [Field.IRI]: iri}

    const nodeData: NodeData = { class: clss, attributes: [] }

    const newNode: Node = {
        id: clss[Field.IRI], type: "customNode", position: { x: positionX, y: positionY },
        data: nodeData
    }

    setNodes((previousNodes: Node[]) => {
        return [...previousNodes, newNode]
    })

    return true
}


const onAddAttribute = (attribute : Attribute, setNodes: SetterOrUpdater<Node[]>) =>
{
    const nodeID = attribute[Field.SOURCE_CLASS]
    let isAttributePresent = false
    let isAttributeAdded = false

    setNodes((nodes: Node[]) => nodes.map((currentNode : Node) =>
    {
        // Skip nodes which are not getting a new attribute
        if (currentNode.id !== nodeID)
        {
            return currentNode
        }

        // If the node already contains the selected attribute do not add anything
        currentNode.data.attributes.forEach((currentAttribute : Attribute) =>
        {
            if (currentAttribute[Field.IRI] === attribute[Field.IRI])
            {
                isAttributePresent = true
            }
        })

        if (isAttributePresent)
        {
            return currentNode 
        }

        const newAttributes = [...currentNode.data.attributes, attribute]  
        const newData : NodeData = { ...currentNode.data, attributes: newAttributes }
        const updatedNode: Node = {...currentNode, data: newData}
        isAttributeAdded = true

        return updatedNode
    }))


    const doesSourceClassExist = isAttributePresent || isAttributeAdded
    if (!doesSourceClassExist)
    {
        const name = createNameFromIRI(nodeID)
        const newClass: Class = { ...blankClass, [Field.IRI]: nodeID, [Field.NAME]: name }
        onAddClass(newClass, 100, 100, setNodes)
    }

    return !isAttributePresent
}


const onAddAssociation = (association : Association, setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>): boolean =>
{
    // Returns "true" if the operation was successfull otherwise "false"
    console.log("on add association: ", association)

    if (doesSameEdgeBetweenNodesAlreadyExistSetter(setEdges, association[Field.IRI], association[Field.TYPE], association[Field.SOURCE_CLASS], association[Field.TARGET_CLASS]))
    {
        return false
    }

    const newEdgeID = createEdgeUniqueID(association[Field.SOURCE_CLASS], association[Field.TARGET_CLASS], association[Field.IRI])
    const isTargetNodeCreated: boolean = doesNodeAlreadyExistSetter(setNodes, association[Field.TARGET_CLASS])

    if (!isTargetNodeCreated)
    {
        const associationName = createNameFromIRI(association[Field.TARGET_CLASS])
        const newNode: Node = createNode(associationName, 500, 100)

        setNodes((previousNodes: Node[]) => 
        {
            return [...previousNodes, newNode]
        })
    }

    const isSourceNodeCreated: boolean = doesNodeAlreadyExistSetter(setNodes, association[Field.SOURCE_CLASS])
    if (!isSourceNodeCreated)
    {
        const associationName = createNameFromIRI(association[Field.SOURCE_CLASS])
        const newNode: Node = createNode(associationName, 500, 200)

        setNodes((previousNodes: Node[]) =>
        {
            return [...previousNodes, newNode]
        })
    }


    const edgeData: EdgeData = { association: association }

    const markerEnd = association[Field.TYPE] === ItemType.GENERALIZATION ? CUSTOM_ISA_EDGE_MARKER : CUSTOM_EDGE_MARKER

    const newEdge : Edge = {
        id: newEdgeID, type: "custom-edge", source: association[Field.SOURCE_CLASS], target: association[Field.TARGET_CLASS], data: edgeData,
        markerEnd: markerEnd
    }

    console.log("New edge: ", newEdge)

    setEdges((previousEdges: Edge[]) =>
    {
        return [...previousEdges, newEdge]
    })

    return true
}


export const createNode = (nodeName: string, positionX: number, positionY: number): Node =>
{
    const nodeIRI = createIRIFromName(nodeName)

    const newEntity: Class = {
        [Field.IRI]: nodeIRI, [Field.NAME]: nodeName, [Field.TYPE]: ItemType.CLASS, [Field.DESCRIPTION]: "",
        [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [],
    }

    const nodeData: NodeData = { class: newEntity, attributes: [] }

    const newNode: Node = { id: nodeIRI, type: "customNode", position: { x: positionX, y: positionY }, data: nodeData }

    return newNode
}


export const addNode = (nodeName: string, positionX: number, positionY: number, setNodes: SetterOrUpdater<Node[]>) =>
{
    if (!nodeName)
    {
        alert("Node name is empty")
        return
    }

    if (doesNodeAlreadyExistSetter(setNodes, nodeName))
    {
        return
    }

        const newNode: Node = createNode(nodeName, positionX, positionY)

        setNodes((previousNodes: Node[]) => {
        return [...previousNodes, newNode]
    })
}


export const createIRIFromName = (name: string): string =>
{
    // Replace one or more whitespace characters with only one whitespace
    // global ('g') flag is used so the regex does not stop after the first match
    name = name.replace(/\s+/g, ' ')

    const iri = name.split(' ').join('-').toLowerCase() // Replace every whitespace character with '-'
    return iri
}


export const createNameFromIRI = (iri: string): string =>
{
    const name = iri.split('-').join(' ').toLowerCase()
    return name
}


export const editNodeClass = (newClass: Class, oldClass: Class, setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>): void =>
{
    if (newClass.name !== oldClass.name)
    {
        // Update iri
        const newIRI = createIRIFromName(newClass[Field.NAME])
        newClass = {...newClass, [Field.IRI]: newIRI}

        // Update all edges that connect to the changed source or target class
        setEdges((edges) => edges.map((currentEdge: Edge) =>
        {
            if (currentEdge.source === oldClass.iri)
            {
                const newAssociation: Association = { ...currentEdge.data.association, source: newClass[Field.IRI] }
                const newEdgeData: EdgeData = { ...currentEdge.data, association: newAssociation }
                const edgeID = createEdgeUniqueID(newClass[Field.IRI], currentEdge.target, currentEdge.data.association[Field.IRI])
                const updatedEdge: Edge = {
                    ...currentEdge, id: edgeID, source: newClass[Field.IRI], data: newEdgeData
                }

                return updatedEdge
            }
            else if (currentEdge.target === oldClass.iri)
            {
                const newAssociation: Association = { ...currentEdge.data.association, target: newClass[Field.IRI] }
                const newEdgeData: EdgeData = { ...currentEdge.data, association: newAssociation }
                const edgeID = createEdgeUniqueID(currentEdge.source, newClass[Field.IRI], currentEdge.data.association[Field.IRI])
                const updatedEdge: Edge = {
                    ...currentEdge, id:edgeID, target: newClass[Field.IRI], data: newEdgeData
                }

                console.log(updatedEdge)

                return updatedEdge
            }
            return currentEdge
        }))
    }

    setNodes((nodes: Node[]) => nodes.map((currentNode : Node) =>
    {
        if (currentNode.id === oldClass.iri)
        {
            let newAttributes = currentNode.data.attributes

            // For each attribute update their source entity if the iri of the entity changed
            if (oldClass.iri !== newClass.iri)
            {                   
                newAttributes = currentNode.data.attributes.map((attribute: Attribute) =>
                {
                    return { ...attribute, [Field.SOURCE_CLASS]: newClass[Field.IRI] }
                })
            }


            const newData: NodeData = { ...currentNode.data, class: newClass, attributes: newAttributes }
            const newNode: Node = {...currentNode, id: newClass[Field.IRI], data: newData}

            return newNode
        }
        else
        {
            return currentNode
        }
    }))
}

    
export const editNodeAttribute = (newAttribute: Attribute, oldAttribute: Attribute, setNodes: SetterOrUpdater<Node[]>): void =>
{
    const id: string = oldAttribute.source

    setNodes((nodes: Node[]) => nodes.map((currentNode: Node) =>
    {
        if (currentNode.id === id)
        {
            const newAttributes = currentNode.data.attributes.map((attribute: Attribute) =>
            {
                if (attribute.name === oldAttribute.name)
                {
                    return newAttribute
                }
                else
                {
                    return attribute
                }
            })

            const newData: NodeData = { ...currentNode.data, attributes: newAttributes}
            const newNode: Node = { ...currentNode, data: newData}
            return newNode
        }
        else
        {
            return currentNode
        }
    }))
}


export const editEdgeAssociation = (newAssociation: Association, oldAssociation : Association, setEdges: SetterOrUpdater<Edge[]>): void =>
{
    // Find the edge to update based on the old ID
    const oldID: string = createEdgeUniqueID(oldAssociation[Field.SOURCE_CLASS], oldAssociation[Field.TARGET_CLASS], oldAssociation[Field.IRI])

    setEdges((edges) => edges.map((currentEdge : Edge) =>
    {
        if (currentEdge.id === oldID)
        {
            const newData: EdgeData = { ...currentEdge.data, association: newAssociation }
            const newID = createEdgeUniqueID(newAssociation[Field.SOURCE_CLASS], newAssociation[Field.TARGET_CLASS], newAssociation[Field.IRI])

            let newEdge: Edge = {
                ...currentEdge, id: newID, source: newAssociation[Field.SOURCE_CLASS], target: newAssociation[Field.TARGET_CLASS], data: newData
            }

            console.log("Edited edge: ", newEdge)

            return newEdge
        }
        else
        {
            return currentEdge
        }
    }))
}



export const onRemove = (item: Item, setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>): void =>
{
    if (item[Field.TYPE] === ItemType.CLASS)
    {
        const nodeID = item[Field.IRI]
        removeNode(nodeID, setNodes)
    }
    else if (item[Field.TYPE] === ItemType.ATTRIBUTE)
    {
        removeNodeAttribute(item as Attribute, setNodes)
    }
    else if (item[Field.TYPE] === ItemType.ASSOCIATION || item[Field.TYPE] === ItemType.GENERALIZATION)
    {
        const association: Association = (item as Association)
        const edgeID = createEdgeUniqueID(association[Field.SOURCE_CLASS], association[Field.TARGET_CLASS], association[Field.NAME])
        removeEdge(edgeID, setEdges)
    }
    else
    {
        alert("Unknown action")
    }
}


export const removeNode = (nodeID: string, setNodes: SetterOrUpdater<Node[]>): void =>
{
    setNodes((previousNodes) => previousNodes.filter(node => node.id !== nodeID))
}


export const removeEdge = (edgeID: string, setEdges: SetterOrUpdater<Edge[]>): void =>
{
    setEdges((edges: Edge[]) => edges.filter(edge => edge.id !== edgeID))
}


export const removeNodeAttribute = (attribute: Attribute, setNodes: SetterOrUpdater<Node[]>): void =>
{
    const nodeID: string = attribute.source

    setNodes((nodes) => nodes.map((currentNode : Node) =>
    {
        if (currentNode.id === nodeID)
        {
            const newAttributes = currentNode.data.attributes.filter((element: Attribute) => element.name !== attribute.name)
            const newData: NodeData = { ...currentNode.data, attributes: newAttributes }
            const newNode = { ...currentNode, data: newData }
            return newNode
        }
        else
        {
            return currentNode
        }
    }))
}


export const invalidateAllOriginalTextIndexes = (setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>) =>
{   
    invalidateAllOriginalTextIndexesNodes(setNodes)
    invalidateAllOriginalTextIndexesEdges(setEdges)
}


export const invalidateAllOriginalTextIndexesNodes = (setNodes: SetterOrUpdater<Node[]>) =>
{
    setNodes((nodes: Node[]) => nodes.map(currentNode => 
    {
        const currentNodeData: NodeData = currentNode.data

        let newNode: Node = { ...currentNode }

        if (currentNodeData.class.hasOwnProperty(Field.ORIGINAL_TEXT_INDEXES))
        {
            newNode = {...currentNode, data: { ...currentNodeData, class: { ...currentNodeData.class, [Field.ORIGINAL_TEXT_INDEXES]: [] }}}
        }

        let newAttributes: Attribute[] = []
        const currentAttributes: Attribute[] = currentNodeData.attributes

        for (let i = 0; i < currentAttributes.length; i++)
        {
            if (currentAttributes[i].hasOwnProperty(Field.ORIGINAL_TEXT_INDEXES))
            {
                newAttributes.push( {...currentAttributes[i], [Field.ORIGINAL_TEXT_INDEXES]: [] })
            }
            else
            {
                newAttributes.push(currentAttributes[i])
            }
        }

        newNode = { ...newNode, data: { ...newNode.data, attributes: newAttributes }}

        return newNode
    }))
}

export const invalidateAllOriginalTextIndexesEdges = (setEdges: SetterOrUpdater<Edge[]>) =>
{
    setEdges((edges: Edge[]) => edges.map(currentEdge => 
    {
        const currentEdgeData: EdgeData = currentEdge.data

        if (currentEdgeData.association.hasOwnProperty(Field.ORIGINAL_TEXT_INDEXES))
        {
            const newEdge: Edge = {...currentEdge, data: { ...currentEdgeData, association: { ...currentEdgeData.association, [Field.ORIGINAL_TEXT_INDEXES]: [] }}}
            return newEdge
        }

        return currentEdge
    }))
}


export function getLoopPath(sourceNode: Node, targetNode: Node, isGeneralization: boolean)
{
    const sourceHandleID = isGeneralization ? "source-bottom" : "source-top"
    const targetHandleID = "target-right"

    const handleSource = sourceNode[internalsSymbol]?.handleBounds?.source?.find((h) => h.id === sourceHandleID)
    const handleTarget = sourceNode[internalsSymbol]?.handleBounds?.target?.find((h) => h.id === targetHandleID)

    const offsetX = -60
    const offsetY = isGeneralization ? 85 : -55

    const newX = sourceNode.position.x + sourceNode.width! + offsetX
    const newY = sourceNode.position.y + offsetY

    const position = { x: newX, y: newY }

    const path = `M ${sourceNode.position.x + handleSource!.x + 5},${sourceNode.position.y + handleSource!.y + 5} A 1 1 90 0 ${isGeneralization ? 0 : 1} ${
        targetNode.position.x + handleTarget!.x
    } ${targetNode.position.y + handleTarget!.y}`

    return [path, position.x, position.y] as const
}