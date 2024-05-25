import { Node, Edge } from "reactflow"
import { Association, Attribute, AttributeJson, Class, ClassJson, ConceptualModelJson, EdgeData, Field, GeneralizationJson, ItemType, NodeData, RelationshipJson } from "../interfaces/interfaces"
import { createNameFromIRI } from "./conceptualModel"


const JSON_SCHEMA = "https://schemas.dataspecer.com/adapters/simplified-semantic-model.v1.0.schema.json"


export const convertConceptualModelToJSON = (nodes: Node[], edges: Edge[]): ConceptualModelJson =>
{
    // TODO: Divide into smaller functions
    let conceptualModel: ConceptualModelJson = { $schema: JSON_SCHEMA, classes: [], attributes: [], relationships: [], generalizations: [] }

    for (let i = 0; i < nodes.length; i++)
    {
        const node: Node = nodes[i]
        const nodeData: NodeData = node.data
        const clss: Class = nodeData.class
        const attributes: Attribute[] = nodeData.attributes
    
        const newEntityJson: ClassJson = {
            iri: clss[Field.IRI], title: clss[Field.NAME], description: clss[Field.DESCRIPTION]
        }
    
        conceptualModel.classes.push(newEntityJson)
    
        for (let j = 0; j < attributes.length; j++)
        {
            const attribute: Attribute = attributes[j]

            const newAttributeJson: AttributeJson = {
                iri: attribute[Field.IRI], title: attribute[Field.NAME], description: attribute[Field.DESCRIPTION],
                domain: attribute[Field.SOURCE_CLASS], domainCardinality: "many",
                range: "", rangeCardinality: convertCardinality(attribute[Field.SOURCE_CARDINALITY])
            }
    
            conceptualModel.attributes.push(newAttributeJson)
        }
    }

    for (let i = 0; i < edges.length; i++)
    {
        const edge: Edge = edges[i]
        const edgeData: EdgeData = edge.data
    
        const relationship: Association = edgeData.association

        if (relationship[Field.TYPE] !== ItemType.GENERALIZATION)
        {
            // Relationships
            const newRelationshipJson: RelationshipJson = {
                iri: relationship[Field.IRI], title: relationship[Field.NAME], description: relationship[Field.DESCRIPTION],
                domain: relationship[Field.SOURCE_CLASS], domainCardinality: relationship[Field.SOURCE_CARDINALITY],
                range: relationship[Field.TARGET_CLASS], rangeCardinality: relationship[Field.TARGET_CARDINALITY]
            }
    
            conceptualModel.relationships.push(newRelationshipJson)
        }
        else
        {
            // Generalizations
            const newGeneralizationJson: GeneralizationJson = {
                iri: relationship[Field.IRI], title: relationship[Field.NAME], description: relationship[Field.DESCRIPTION],
                specialClass: relationship[Field.SOURCE_CLASS], generalClass: relationship[Field.TARGET_CLASS]
            }
    
            conceptualModel.generalizations.push(newGeneralizationJson)
        }
    }

    return conceptualModel
}

export const convertConceptualModelToJSONSummary = (nodes: Node[], edges: Edge[], isOnlyNames : boolean) =>
{
    let result: { [key: string]: any } = {
        classes: []
    }

    for (let node of nodes)
    {
        let attributes = []
        for (let attribute of node.data.attributes)
        {
            if (isOnlyNames)
            {
                attributes.push({[Field.NAME]: attribute[Field.NAME]})
            }
            else
            {
                attributes.push({[Field.NAME]: attribute[Field.NAME], [Field.ORIGINAL_TEXT]: attribute[Field.ORIGINAL_TEXT]})
            }
        }

        const nodeData: NodeData = node.data
        result.classes.push({[Field.NAME]: nodeData.class[Field.NAME], attributes: attributes})
    }


    let associations = []
    for (let edge of edges)
    {
        const edgeData: EdgeData = edge.data

        const sourceClassName = createNameFromIRI(edge[Field.SOURCE_CLASS])
        const targetClassName = createNameFromIRI(edge[Field.TARGET_CLASS])        

        if (isOnlyNames)
        {
            associations.push({ [Field.NAME]: edgeData.association[Field.NAME], "sourceClass": sourceClassName, "targetClass": targetClassName })
        }
        else
        {
            associations.push({ [Field.NAME]: edgeData.association[Field.NAME], [Field.ORIGINAL_TEXT]: edgeData.association[Field.ORIGINAL_TEXT], "sourceClass": sourceClassName, "targetClass": targetClassName })
        }
    }

    result.associations = associations

    return result
}


export const convertCardinality = (cardinality: string): string =>
{
    if (cardinality === "optional-one" || cardinality === "one" || cardinality === "many")
    {
        return cardinality
    }

    const defaultCardinality = "many"
    return defaultCardinality
}