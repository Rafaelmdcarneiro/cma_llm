
export const PRIMARY_COLOR = "#2196f3"

export const enum UserChoice
{
  CLASSES = "classes",
  ATTRIBUTES = "attributes",
  ASSOCIATIONS_ONE_KNOWN_CLASS = "associations1",
  ASSOCIATIONS_TWO_KNOWN_CLASSES = "associations2",
  SUMMARY_PLAIN_TEXT = "summaryPlainText",
  SUMMARY_DESCRIPTIONS = "summaryDescriptions",
  SINGLE_FIELD = "singleField"
}

export const enum ItemType
{
  CLASS = "class",
  ATTRIBUTE = "attribute",
  ASSOCIATION = "association",
  GENERALIZATION = "generalization",
}

export const enum Field
{
  IRI = "iri",
  TYPE = "type",
  NAME = "name",
  DESCRIPTION = "description",
  ORIGINAL_TEXT = "originalText",
  ORIGINAL_TEXT_INDEXES = "originalTextIndexes",
  DATA_TYPE = "dataType",
  SOURCE_CLASS = "source",
  TARGET_CLASS = "target",
  SOURCE_CARDINALITY = "sourceCardinality",
  TARGET_CARDINALITY = "targetCardinality",
}


export const enum ItemFieldUIName
{
  ID = "ID",
  TYPE = "Type",
  NAME = "Name",
  DESCRIPTION = "Description",
  ORIGINAL_TEXT = "Original text",
  ORIGINAL_TEXT_INDEXES = "Original text indexes",
  DATA_TYPE = "Data type",
  SOURCE_CLASS = "Source class",
  TARGET_CLASS = "Target class",
  CARDINALITY = "Cardinality",
  SOURCE_CARDINALITY = "Source cardinality",
  TARGET_CARDINALITY = "Target cardinality",
  GENERAl_CLASS = "General class",
  SPECIAL_CLASS = "Special class",
}


export const enum TextFilteringVariation
{
  NONE = "none",
  SYNTACTIC = "syntactic",
  SEMANTIC = "semantic",
}


export const enum TopbarTabs
{
  MAIN = "0",
  SUMMARY_PLAIN_TEXT = "1",
  SUMMARY_DESCRIPTION = "2",
  IMPORT_EXPORT = "3",
  SETTINGS = "4",
  INFO = "5",
}

export const enum SidebarTabs
{
  CLASSES = "0",
  ATTRIBUTES = "1",
  ASSOCIATIONS = "2",
}


export interface SummaryObject
{
  classes: any[]
  associations: any[]
}


export interface NodeData
{
  class: Class
  attributes: Attribute[]
}


export interface EdgeData
{
  association: Association
}


export type Item = Class | Attribute | Association


export type ItemFieldsUnification = keyof Class | keyof Attribute | keyof Association


interface BaseItem
{
  type : ItemType
  iri: string
  name: string
  description: string
  originalText: string
  originalTextIndexes: number[]
}

export interface Class extends BaseItem { }

export interface Attribute extends BaseItem
{
  source: string
  dataType: string
  sourceCardinality: string
}

export interface Association extends BaseItem
{
  source: string
  target: string
  sourceCardinality: string
  targetCardinality: string
}

export interface OriginalTextIndexesItem
{
  indexes: [number, number]
  label: string
}


export interface SerializedConceptualModel
{
  classes: any[] // TODO: Provide correct type
  associations: Association[]
}

export interface ItemJson
{
  iri: string
  title: string
  description: string
}

export interface ClassJson extends ItemJson { }

interface DomainRangeJson
{
  // TODO: Why do we have "target class" in attributes?
  // Isn't that going to be always empty string?

  // Possible cardinalities: "optional-one" | "optional-many" | "one-one" | "one-many" | null
  domain: string
  domainCardinality: string | null
  range: string
  rangeCardinality: string | null
}

export interface AttributeJson extends ItemJson, DomainRangeJson { }

export interface RelationshipJson extends ItemJson, DomainRangeJson { }

export interface GeneralizationJson extends ItemJson
{
  generalClass: string
  specialClass: string
}

export interface ConceptualModelJson
{
  $schema: string
  classes: ClassJson[]
  attributes: AttributeJson[]
  relationships: RelationshipJson[]
  generalizations: GeneralizationJson[]
}


export interface ItemsMessage
{
  classes: string
  attributes: string
  associations: string
}