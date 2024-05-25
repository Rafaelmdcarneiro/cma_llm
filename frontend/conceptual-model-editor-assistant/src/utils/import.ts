import { Node, Edge } from "reactflow"
import { Association, Attribute, Class, ConceptualModelJson, EdgeData, Field, ItemType, NodeData, UserChoice } from "../interfaces/interfaces"
import { SetterOrUpdater } from "recoil"
import { CUSTOM_EDGE_MARKER, CUSTOM_EDGE_TYPE, CUSTOM_ISA_EDGE_MARKER, createEdgeUniqueID, createIRIFromName, onAddItem } from "./conceptualModel"


export const importConceptualModelFromJson = (conceptualModelJson: ConceptualModelJson, setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>) =>
{
    // TODO: Divide into smaller functions
    
    const incrementX = 500
    const incrementY = 200
    let positionX = 100
    let positionY = 100
    let newNodes : Node[] = []
    let newEdges : Edge[] = []

    if (!conceptualModelJson.attributes) { conceptualModelJson.attributes = [] }
    if (!conceptualModelJson.relationships) { conceptualModelJson.relationships = [] }
    if (!conceptualModelJson.generalizations) { conceptualModelJson.generalizations = [] }


    for (const [, entity] of Object.entries(conceptualModelJson.classes))
    {
        const entityIriLowerCase = entity.iri.toLowerCase()
        const entityTitle = entity.title

        const newClass: Class = {
            [Field.IRI]: entityIriLowerCase, [Field.NAME]: entityTitle, [Field.DESCRIPTION]: entity.description,
            [Field.TYPE]: ItemType.CLASS, [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
        }

        const nodeData : NodeData = { class: newClass, attributes: [] }

        const maxRandomValue = 400
        const randomX = Math.floor(Math.random() * maxRandomValue)
        const randomY = Math.floor(Math.random() * maxRandomValue)
        const newPositionX = positionX + randomX
        const newPositionY = positionY + randomY

        const newNode : Node = {
            id: entityIriLowerCase, type: "customNode", position: { x: newPositionX, y: newPositionY }, data: nodeData
        }

        positionX += incrementX

        if (positionX >= 1300)
        {
            positionX = 100
            positionY += incrementY
        }

        newNodes.push(newNode)
    }

    setNodes(() => { return newNodes })


    for (const [, attribute] of Object.entries(conceptualModelJson.attributes))
    {
        const sourceEntityLowerCase = attribute.domain.toLowerCase()
        const attributeName = attribute.title

        const rangeCardinality = attribute.rangeCardinality ?? ""

        const newAttribute: Attribute = {
            [Field.IRI]: attribute[Field.IRI], [Field.NAME]: attributeName, [Field.TYPE]: ItemType.ATTRIBUTE, [Field.DESCRIPTION]: attribute.description,
            [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: [], [Field.SOURCE_CLASS]: sourceEntityLowerCase,
            [Field.DATA_TYPE]: "",
            [Field.SOURCE_CARDINALITY]: rangeCardinality // Set to rangeCardinality because domainCardinality right now should be always "many"
        }
    

        for (let i = 0; i < newNodes.length; i++)
        {
            const entityName = newNodes[i].id
    
            if (entityName === newAttribute[Field.SOURCE_CLASS])
            {
                onAddItem(newAttribute, setNodes, setEdges)
            }
        }
    }

    for (const [, association] of Object.entries(conceptualModelJson.relationships))
    {
        const iriLowerCase = association[Field.IRI]
        const sourceEntityLowerCase = association.domain.toLowerCase()
        const targetEntityLowerCase = association.range.toLowerCase()

        const domainCardinality = association.domainCardinality ?? ""
        const rangeCardinality = association.rangeCardinality ?? ""
    
        const newRelationship: Association = {
            [Field.IRI]: iriLowerCase, [Field.NAME]: association.title, [Field.DESCRIPTION]: association[Field.DESCRIPTION], [Field.TYPE]: ItemType.ASSOCIATION,
            [Field.SOURCE_CLASS]: sourceEntityLowerCase, [Field.TARGET_CLASS]: targetEntityLowerCase,
            [Field.SOURCE_CARDINALITY]: domainCardinality, [Field.TARGET_CARDINALITY]: rangeCardinality,
            [Field.ORIGINAL_TEXT]: "", [Field.ORIGINAL_TEXT_INDEXES]: []
        }
    
        const edgeData: EdgeData = { association: newRelationship }
    
        const newID: string = createEdgeUniqueID(sourceEntityLowerCase, targetEntityLowerCase, iriLowerCase)
        const newEdge : Edge = {
            id: newID, source: sourceEntityLowerCase, target: targetEntityLowerCase, type: "custom-edge",
            data: edgeData, markerEnd: CUSTOM_EDGE_MARKER
        }
    
        newEdges.push(newEdge)
    }

    for (const [, generalization] of Object.entries(conceptualModelJson.generalizations))
    {
        const iriLowerCase = generalization.iri.toLowerCase()
        const sourceEntityLowerCase = generalization.specialClass.toLowerCase()
        const targetEntityLowerCase = generalization.generalClass.toLowerCase()
    
        const newGeneralization: Association = {
            [Field.IRI]: iriLowerCase, [Field.NAME]: generalization.title, [Field.DESCRIPTION]: "", [Field.TYPE]: ItemType.GENERALIZATION,
            [Field.SOURCE_CLASS]: sourceEntityLowerCase, [Field.TARGET_CLASS]: targetEntityLowerCase,
            [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: "", [Field.ORIGINAL_TEXT]: "",
            [Field.ORIGINAL_TEXT_INDEXES]: []
        }
    
        const edgeData: EdgeData = { association: newGeneralization }
    
        const newID: string = createEdgeUniqueID(sourceEntityLowerCase, targetEntityLowerCase, iriLowerCase)
        const newEdge : Edge = {
            id: newID, source: sourceEntityLowerCase, target: targetEntityLowerCase, type: "custom-edge",
            data: edgeData, markerEnd: CUSTOM_ISA_EDGE_MARKER
        }
    
        newEdges.push(newEdge)
    }

    setEdges(() => { return newEdges })
}


export const loadDefaultConceptualModel = (setNodes: SetterOrUpdater<Node[]>, setEdges: SetterOrUpdater<Edge[]>): void =>
{
    const input = { classes: [
        {name: "Farmer", description: "", originalText: "", [Field.ORIGINAL_TEXT_INDEXES]: [], attributes: []},
        {name: "Manufacturer", description: "", originalText: "", [Field.ORIGINAL_TEXT_INDEXES]: [], attributes: []},
        {name: "Road vehicle", description: "", originalText: "", [Field.ORIGINAL_TEXT_INDEXES]: [4, 10], attributes: []}],
            associations: [
                    {"name": "manufactures", "source": "manufacturer", "target": "road vehicle", "originalText": "s"}]}


    const incrementX = 500
    const incrementY = 200
    let positionX = 100
    let positionY = 100
    let newNodes : Node[] = []
    let newEdges : Edge[] = []

    for (const [, entity] of Object.entries(input[UserChoice.CLASSES]))
    {
        const nodeIRI = createIRIFromName(entity.name)

        for (let index = 0; index < entity.attributes.length; index++)
        {
            // TODO: Do not use "any"
            (entity.attributes[index] as any)[Field.TYPE] = ItemType.ATTRIBUTE;

            (entity.attributes[index] as any)[Field.SOURCE_CLASS] = nodeIRI
        }

        const newEntity : Class = {
            [Field.IRI]: nodeIRI, [Field.NAME]: entity.name, [Field.TYPE]: ItemType.CLASS, [Field.DESCRIPTION]: "", [Field.ORIGINAL_TEXT]: "",
            [Field.ORIGINAL_TEXT_INDEXES]: entity[Field.ORIGINAL_TEXT_INDEXES]}

        const maxRandomValue = 200
        const randomX = Math.floor(Math.random() * maxRandomValue)
        const randomY = Math.floor(Math.random() * maxRandomValue)

        const newPositionX = positionX + randomX
        const newPositionY = positionY + randomY

        const nodeData : NodeData = { class: newEntity, attributes: entity.attributes }
        const newNode : Node = { id: nodeIRI, type: "customNode", position: { x: newPositionX, y: newPositionY }, data: nodeData }

        newNodes.push(newNode)

        positionX += incrementX

        if (positionX >= 1300)
        {
            positionX = 100
            positionY += incrementY
        }
    }

    for (const [, association] of Object.entries(input["associations"]))
    {
        const nameIRI = createIRIFromName(association.name)
        const sourceIRI = createIRIFromName(association.source)
        const targetIRI = createIRIFromName(association.target)

        const newID: string = createEdgeUniqueID(sourceIRI, targetIRI, nameIRI)

        const newAssociation: Association = {
            [Field.IRI]: nameIRI, [Field.TYPE]: ItemType.ASSOCIATION, [Field.NAME]: association.name, [Field.DESCRIPTION]: "",
            [Field.SOURCE_CLASS]: sourceIRI, [Field.TARGET_CLASS]: targetIRI,
            [Field.SOURCE_CARDINALITY]: "", [Field.TARGET_CARDINALITY]: "", [Field.ORIGINAL_TEXT]: association.originalText,
            [Field.ORIGINAL_TEXT_INDEXES]: []
        }
        const edgeData: EdgeData = { association: newAssociation }

        const newEdge: Edge = {
            id: newID, source: newAssociation[Field.SOURCE_CLASS], target: newAssociation[Field.TARGET_CLASS], type: CUSTOM_EDGE_TYPE,
            data: edgeData, markerEnd: CUSTOM_EDGE_MARKER
        }

        newEdges.push(newEdge)
    }
    
    setNodes(() => { return newNodes })
    setEdges(() => { return newEdges })
}