import {
  memoize,
  TreeNode,
  Bounds,
  KeyValue,
  reduceTree,
  NodeFilter,
  EMPTY_ARRAY,
  generateUID,
  EMPTY_OBJECT,
  findNestedNode,
  flattenTreeNode,
  replaceNestedNode,
  filterNestedNodes,
  getTreeNodesByName,
  filterTreeNodeParents,
  getNestedTreeNodeById,
  KeyValuePair,
  keyValuePairToHash,
  hashToKeyValuePair
} from "tandem-common";
import { uniq, isEqual, defaults } from "lodash";
import { Dependency, DependencyGraph, updateGraphDependency } from "./graph";
import * as crc32 from "crc32";

export const PAPERCLIP_MODULE_VERSION = "1.0.4";

/*------------------------------------------
 * CONSTANTS
 *-----------------------------------------*/

export enum PCSourceTagNames {
  // the root node which contains all pc nodes
  MODULE = "module",

  // components are living UI that are exported to application code
  COMPONENT = "component",

  // Style mixins define re-usable groups of styles, and nested styles. Maybe
  // this later on: https://css-tricks.com/part-theme-explainer/
  STYLE_MIXIN = "style-mixin",

  // Variables define a single value (like colors) that can be used in any style property (and attributes later on)
  VARIABLE = "variable",
  ELEMENT = "element",
  COMPONENT_INSTANCE = "component-instance",
  VARIANT = "variant",
  VARIANT_TRIGGER = "variant-trigger",

  // Slots are sections of components where text & elements can be inserted into
  SLOT = "slot",
  QUERY = "query",

  // Plugs provide content for slots
  PLUG = "plug",

  TEXT = "text"
}

export enum PCOverridableType {
  TEXT = "text",
  INHERIT_STYLE = "styleMixins",

  // DEPRECATED
  VARIANT_IS_DEFAULT = "isDefault",
  VARIANT = "variant",

  STYLES = "styles",
  ATTRIBUTES = "attributes",
  LABEL = "label",
  SLOT = "slot",
  CONTENT = "content"
}

export const VOID_TAG_NAMES = [
  "area",
  "base",
  "basefont",
  "bgsound",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "image",
  "img",
  "input",
  "isindex",
  "keygen",
  "link",
  "menuitem",
  "meta",
  "nextid",
  "param",
  "source",
  "track",
  "wbr"
];

export const TEXT_STYLE_NAMES = [
  "font-family",
  "font-size",
  "font-style",
  "font-variant",
  "font-weight",
  "letter-spacing",
  "font",
  "color",
  "text-align",
  "text-indent",
  "line-height",
  "text-transform",
  "word-spacing",
  "white-space"
];

export const INHERITABLE_STYLE_NAMES = [
  ...TEXT_STYLE_NAMES,
  "azimuth",
  "border-collapse",
  "border-spacing",
  "caption-side",
  "cursor",
  "direction",
  "elevation",
  "empty-cells",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "list-style",
  "orphans",
  "pitch-range",
  "pitch",
  "quotes",
  "richness",
  "speak-header",
  "speak-numeral",
  "speak-punctuation",
  "speak",
  "speech-rate",
  "stress",
  "visibility",
  "voice-family",
  "volume",
  "widows"
];

export const CSS_COLOR_ALIASES = {
  aliceblue: "#F0F8FF",
  antiquewhite: "#FAEBD7",
  aqua: "#00FFFF",
  aquamarine: "#7FFFD4",
  azure: "#F0FFFF",
  beige: "#F5F5DC",
  bisque: "#FFE4C4",
  black: "#000000",
  blanchedalmond: "#FFEBCD",
  blue: "#0000FF",
  blueviolet: "#8A2BE2",
  brown: "#A52A2A",
  burlywood: "#DEB887",
  cadetblue: "#5F9EA0",
  chartreuse: "#7FFF00",
  chocolate: "#D2691E",
  coral: "#FF7F50",
  cornflowerblue: "#6495ED",
  cornsilk: "#FFF8DC",
  crimson: "#DC143C",
  cyan: "#00FFFF",
  darkblue: "#00008B",
  darkcyan: "#008B8B",
  darkgoldenrod: "#B8860B",
  darkgray: "#A9A9A9",
  darkgrey: "#A9A9A9",
  darkgreen: "#006400",
  darkkhaki: "#BDB76B",
  darkmagenta: "#8B008B",
  darkolivegreen: "#556B2F",
  darkorange: "#FF8C00",
  darkorchid: "#9932CC",
  darkred: "#8B0000",
  darksalmon: "#E9967A",
  darkseagreen: "#8FBC8F",
  darkslateblue: "#483D8B",
  darkslategray: "#2F4F4F",
  darkslategrey: "#2F4F4F",
  darkturquoise: "#00CED1",
  darkviolet: "#9400D3",
  deeppink: "#FF1493",
  deepskyblue: "#00BFFF",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1E90FF",
  firebrick: "#B22222",
  floralwhite: "#FFFAF0",
  forestgreen: "#228B22",
  fuchsia: "#FF00FF",
  gainsboro: "#DCDCDC",
  ghostwhite: "#F8F8FF",
  gold: "#FFD700",
  goldenrod: "#DAA520",
  gray: "#808080",
  grey: "#808080",
  green: "#008000",
  greenyellow: "#ADFF2F",
  honeydew: "#F0FFF0",
  hotpink: "#FF69B4",
  "indianred ": "#CD5C5C",
  "indigo  ": "#4B0082",
  ivory: "#FFFFF0",
  khaki: "#F0E68C",
  lavender: "#E6E6FA",
  lavenderblush: "#FFF0F5",
  lawngreen: "#7CFC00",
  lemonchiffon: "#FFFACD",
  lightblue: "#ADD8E6",
  lightcoral: "#F08080",
  lightcyan: "#E0FFFF",
  lightgoldenrodyellow: "#FAFAD2",
  lightgray: "#D3D3D3",
  lightgrey: "#D3D3D3",
  lightgreen: "#90EE90",
  lightpink: "#FFB6C1",
  lightsalmon: "#FFA07A",
  lightseagreen: "#20B2AA",
  lightskyblue: "#87CEFA",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#B0C4DE",
  lightyellow: "#FFFFE0",
  lime: "#00FF00",
  limegreen: "#32CD32",
  linen: "#FAF0E6",
  magenta: "#FF00FF",
  maroon: "#800000",
  mediumaquamarine: "#66CDAA",
  mediumblue: "#0000CD",
  mediumorchid: "#BA55D3",
  mediumpurple: "#9370DB",
  mediumseagreen: "#3CB371",
  mediumslateblue: "#7B68EE",
  mediumspringgreen: "#00FA9A",
  mediumturquoise: "#48D1CC",
  mediumvioletred: "#C71585",
  midnightblue: "#191970",
  mintcream: "#F5FFFA",
  mistyrose: "#FFE4E1",
  moccasin: "#FFE4B5",
  navajowhite: "#FFDEAD",
  navy: "#000080",
  oldlace: "#FDF5E6",
  olive: "#808000",
  olivedrab: "#6B8E23",
  orange: "#FFA500",
  orangered: "#FF4500",
  orchid: "#DA70D6",
  palegoldenrod: "#EEE8AA",
  palegreen: "#98FB98",
  paleturquoise: "#AFEEEE",
  palevioletred: "#DB7093",
  papayawhip: "#FFEFD5",
  peachpuff: "#FFDAB9",
  peru: "#CD853F",
  pink: "#FFC0CB",
  plum: "#DDA0DD",
  powderblue: "#B0E0E6",
  purple: "#800080",
  rebeccapurple: "#663399",
  red: "#FF0000",
  rosybrown: "#BC8F8F",
  royalblue: "#4169E1",
  saddlebrown: "#8B4513",
  salmon: "#FA8072",
  sandybrown: "#F4A460",
  seagreen: "#2E8B57",
  seashell: "#FFF5EE",
  sienna: "#A0522D",
  silver: "#C0C0C0",
  skyblue: "#87CEEB",
  slateblue: "#6A5ACD",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#FFFAFA",
  springgreen: "#00FF7F",
  steelblue: "#4682B4",
  tan: "#D2B48C",
  teal: "#008080",
  thistle: "#D8BFD8",
  tomato: "#FF6347",
  turquoise: "#40E0D0",
  violet: "#EE82EE",
  wheat: "#F5DEB3",
  white: "#FFFFFF",
  whitesmoke: "#F5F5F5",
  yellow: "#FFFF00",
  yellowgreen: "#9ACD32"
};

export enum PCVisibleNodeMetadataKey {
  // defined when dropped into the root document
  BOUNDS = "bounds"
}

export enum HtmlAttribute {
  href = "href",
  title = "title",
  src = "src",
  placeholder = "placeholder",
  type = "type"
}

/*------------------------------------------
 * STATE
 *-----------------------------------------*/

type PCBaseSourceNode<TName extends PCSourceTagNames> = {
  children: PCBaseSourceNode<any>[];
  metadata: KeyValue<any>;
} & TreeNode<TName>;

export type PCDependency = Dependency<PCModule>;

export type PCModule = {
  version: string;
  children: Array<
    PCComponent | PCVisibleNode | PCVariable | PCStyleMixin | PCMediaQuery
  >;
} & PCBaseSourceNode<PCSourceTagNames.MODULE>;

export type PCComponentChild = PCVisibleNode | PCVariant | PCSlot;

type BaseComponentLike<TType extends PCSourceTagNames> = {
  variant: KeyValue<boolean>;
  overrides: PCOverride[];
} & PCBaseElement<TType>;

export type PCComponent = {
  /**
   * Controller source files, can be any supported language, filtered by compile target.
   * Example: ["./component.tsx", "./component.vue.ts", "./component.php"]
   *
   * Note that controllers can wrap each other. For example:
   *
   * ["./enhancer.tsx", "./another-enhancer.tsx"]
   *
   * ./noather-enhancer.tsx in this base would wrap around ./enhancer.tsx, which would wrap around the
   * actual presentational component.
   *
   *
   * @type {string[]}
   */
  controllers?: string[];
  is?: string;
  children: PCComponentChild[];
} & BaseComponentLike<PCSourceTagNames.COMPONENT>;

export type PCElementStyleMixin = {
  targetType: PCSourceTagNames.ELEMENT;
  children: PCBaseVisibleNode<any>[];
} & PCBaseVisibleNode<PCSourceTagNames.STYLE_MIXIN>;

export type PCTextStyleMixin = {
  targetType: PCSourceTagNames.TEXT;
  value: string;
} & PCBaseVisibleNode<PCSourceTagNames.STYLE_MIXIN>;

export type PCStyleMixin = PCElementStyleMixin | PCTextStyleMixin;

export type PCVariant = {
  label?: string;
  isDefault?: boolean;
} & PCBaseSourceNode<PCSourceTagNames.VARIANT>;

export type PCVariantTrigger = {
  source: PCVariantTriggerSource | null;
  targetVariantId: string | null;
} & PCBaseSourceNode<PCSourceTagNames.VARIANT_TRIGGER>;

export type PCBaseOverride<TOverrideType extends PCOverridableType> = {
  id: string;
  type: TOverrideType;
  targetIdPath: string[];

  // __DEPRECATED__
  variantId?: string;
};

export type PCSlot = {
  // export name
  label?: string;
} & PCBaseSourceNode<PCSourceTagNames.SLOT>;

export enum PCQueryType {
  MEDIA,
  VARIABLE
}

type PCStyleBlockPseudoParts = {
  before?: boolean;
  after?: boolean;
  firstLine?: boolean;
  selection?: boolean;
  placeholder?: boolean;
};

export type PCContentNode = PCVisibleNode | PCComponent | PCStyleMixin;

export type PCStyleBlock = {
  id: string;
  variantId?: string;
  mixinId?: string;
  label?: string;
  parts: PCStyleBlockPseudoParts;
  properties: KeyValuePair<string>[];
};

export type PCBaseQuery<TType extends PCQueryType, TCondition> = {
  label?: string;
  type: TType;
  condition?: TCondition;
} & PCBaseSourceNode<PCSourceTagNames.QUERY>;

export type PCMediaQueryCondition = {
  minWidth?: number;
  maxWidth?: number;
};

// TODO - may need to tack more info on here
export type PCMediaQuery = {} & PCBaseQuery<
  PCQueryType.MEDIA,
  PCMediaQueryCondition
>;

export type PCVariableQueryCondition = {
  equals: string;
  notEquals: string;
};

export type PCVariableQuery = {
  sourceVariableId?: string;
} & PCBaseQuery<PCQueryType.VARIABLE, PCVariableQueryCondition>;

export type PCQuery = PCMediaQuery | PCVariableQuery;

export enum PCVariableType {
  UNIT = "unit",
  TEXT = "text",
  NUMBER = "number",
  COLOR = "color",
  FONT = "font"
}

export type PCVariable = {
  label?: string;
  type: PCVariableType;
  value?: string;
} & PCBaseSourceNode<PCSourceTagNames.VARIABLE>;

export type PCPlug = {
  slotId: string;
} & PCBaseSourceNode<PCSourceTagNames.PLUG>;

export type PCBaseValueOverride<
  TOverrideType extends PCOverridableType,
  TValue
> = {
  value: TValue;
} & PCBaseOverride<TOverrideType>;

export type PCStylesOverride = PCBaseValueOverride<
  PCOverridableType.STYLES,
  PCStyleBlock[]
>;
export type PCTextOverride = PCBaseValueOverride<
  PCOverridableType.TEXT,
  string
>;
export type PCAddAttributesOverride = PCBaseValueOverride<
  PCOverridableType.ATTRIBUTES,
  KeyValuePair<string>[]
>;
export type PCLabelOverride = PCBaseValueOverride<
  PCOverridableType.LABEL,
  string
>;
export type PCVariantOverride = PCBaseValueOverride<
  PCOverridableType.VARIANT_IS_DEFAULT,
  string[]
>;

export type PCVariant2Override = PCBaseValueOverride<
  PCOverridableType.VARIANT,
  string[]
>;

export type PCVisibleNodeOverride = PCStylesOverride | PCLabelOverride;
export type PCTextNodeOverride = PCVisibleNodeOverride | PCTextOverride;
export type PCElementOverride = PCAddAttributesOverride;
export type PCComponentInstanceOverride = PCElementOverride | PCVariantOverride;

export type PCOverride =
  | PCStylesOverride
  | PCTextOverride
  | PCAddAttributesOverride
  | PCVariantOverride
  | PCLabelOverride
  | PCVariant2Override;

export type StyleMixinItem = {
  priority: number;

  // not actually implemented het
  variantId?: string;
};

export type PCBaseVisibleNode<TName extends PCSourceTagNames> = {
  label?: string;
  styles: PCStyleBlock[];
} & PCBaseSourceNode<TName>;

export type PCBaseElementChild = PCBaseVisibleNode<any> | PCSlot | PCPlug;

export type PCBaseElement<TName extends PCSourceTagNames> = {
  is: string;
  attributes: KeyValuePair<string>[];
  children: PCBaseElementChild[];
} & PCBaseVisibleNode<TName>;

export type PCElement = PCBaseElement<PCSourceTagNames.ELEMENT>;

export type PCComponentInstanceChild = PCBaseElementChild | PCPlug;

export type PCComponentInstanceElement = {} & BaseComponentLike<
  PCSourceTagNames.COMPONENT_INSTANCE
>;

export type PCTextNode = {
  value: string;
} & PCBaseVisibleNode<PCSourceTagNames.TEXT>;

export type PCVisibleNode = PCElement | PCTextNode | PCComponentInstanceElement;
export type PCTextLikeNode = PCTextNode | PCTextStyleMixin;
export type PCElementLikeNode =
  | PCElement
  | PCComponent
  | PCComponentInstanceElement
  | PCElementStyleMixin;
export type PCNode =
  | PCModule
  | PCComponent
  | PCVariant
  | PCVisibleNode
  | PCSlot
  | PCPlug
  | PCVariable
  | PCElementStyleMixin
  | PCTextStyleMixin
  | PCVariantTrigger
  | PCQuery;

export enum PCVariantTriggerSourceType {
  QUERY,
  STATE
}

// https://www.w3schools.com/css/css_pseudo_classes.asp
export enum PCElementState {
  // a
  ACTIVE = "active",

  // input
  CHECKED = "checked",
  DISABLED = "disabled",
  OPTIONAL = "optional",
  REQUIRED = "required",
  VALID = "valid",

  // p
  EMPTY = "empty",

  ENABLED = "enabled",
  FOCUS = "focus",
  HOVER = "hover",
  LINK = "link",
  VISITED = "visited"
}

export type PCBaseVariantTriggerSource<
  TType extends PCVariantTriggerSourceType
> = {
  type: TType;
};

export type PCVariantTriggerQuerySource = {
  queryId: string;
} & PCBaseVariantTriggerSource<PCVariantTriggerSourceType.QUERY>;

export type PCVariantTriggerStateSource = {
  state: PCElementState;
} & PCBaseVariantTriggerSource<PCVariantTriggerSourceType.STATE>;

export type PCVariantTriggerSource =
  | PCVariantTriggerQuerySource
  | PCVariantTriggerStateSource;

/*------------------------------------------
 * FACTORIES
 *-----------------------------------------*/

export const createPCModule = (
  children: Array<PCComponent | PCVisibleNode> = EMPTY_ARRAY
): PCModule => ({
  id: generateUID(),
  name: PCSourceTagNames.MODULE,
  version: PAPERCLIP_MODULE_VERSION,
  children,
  metadata: EMPTY_OBJECT
});

export const createPCStyleBlock = (
  properties: KeyValuePair<string>[]
): PCStyleBlock => ({
  id: generateUID(),
  parts: EMPTY_OBJECT,
  properties
});

export const createPCComponent = (
  label?: string,
  is?: string,
  styles?: PCStyleBlock[],
  attributes?: KeyValuePair<string>[],
  children?: PCComponentChild[],
  metadata?: any
): PCComponent => ({
  label,
  is: is || "div",
  styles: styles || EMPTY_ARRAY,
  attributes: attributes || EMPTY_ARRAY,
  id: generateUID(),
  name: PCSourceTagNames.COMPONENT,
  children: children || EMPTY_ARRAY,
  metadata: metadata || EMPTY_OBJECT,
  variant: EMPTY_OBJECT,
  overrides: EMPTY_ARRAY
});

export const getDerrivedPCLabel = (
  node: PCVisibleNode | PCComponent,
  graph: DependencyGraph
) => {
  let label: string = node.label;
  if (label) {
    return label;
  }
  let current = node;
  while (extendsComponent(current)) {
    current = getPCNode((current as PCComponent).is, graph) as PCComponent;
    label = current.label;
    if (label) {
      break;
    }
  }

  return label;
};

export const createPCTextStyleMixin = (
  styles: PCStyleBlock[],
  textValue: string,
  label: string = textValue
): PCTextStyleMixin => ({
  id: generateUID(),
  name: PCSourceTagNames.STYLE_MIXIN,
  label,
  styles,
  value: textValue,
  targetType: PCSourceTagNames.TEXT,
  children: EMPTY_ARRAY,
  metadata: EMPTY_OBJECT
});

export const createPCElementStyleMixin = (
  styles: PCStyleBlock[],
  label?: string
): PCElementStyleMixin => ({
  id: generateUID(),
  label,
  name: PCSourceTagNames.STYLE_MIXIN,
  styles,
  targetType: PCSourceTagNames.ELEMENT,
  children: EMPTY_ARRAY,
  metadata: EMPTY_OBJECT
});

export const createPCVariant = (
  label?: string,
  isDefault?: boolean
): PCVariant => ({
  id: generateUID(),
  name: PCSourceTagNames.VARIANT,
  label,
  isDefault,
  children: EMPTY_ARRAY,
  metadata: EMPTY_OBJECT
});

export const createPCQuery = (
  type: PCQueryType,
  label?: string,
  condition?: any
): PCQuery =>
  ({
    id: generateUID(),
    name: PCSourceTagNames.QUERY,
    type,
    label,
    condition,
    children: EMPTY_ARRAY,
    metadata: EMPTY_OBJECT
  } as any);

export const createPCVariantTrigger = (
  source: PCVariantTriggerSource,
  targetVariantId: string
): PCVariantTrigger => ({
  id: generateUID(),
  name: PCSourceTagNames.VARIANT_TRIGGER,
  targetVariantId,
  source,
  children: EMPTY_ARRAY,
  metadata: EMPTY_OBJECT
});

export const createPCVariable = (
  label: string,
  type: PCVariableType,
  value?: string
): PCVariable => ({
  id: generateUID(),
  name: PCSourceTagNames.VARIABLE,
  value,
  label,
  type,
  children: EMPTY_ARRAY,
  metadata: EMPTY_OBJECT
});

export const createPCElement = (
  is: string = "div",
  styles: PCStyleBlock[] = EMPTY_ARRAY,
  attributes: KeyValuePair<string>[] = EMPTY_ARRAY,
  children: PCBaseElementChild[] = EMPTY_ARRAY,
  label?: string,
  metadata?: KeyValue<any>
): PCElement => ({
  id: generateUID(),
  label,
  is: is || "div",
  name: PCSourceTagNames.ELEMENT,
  attributes: attributes || EMPTY_ARRAY,
  styles: styles || EMPTY_ARRAY,
  children: children || EMPTY_ARRAY,
  metadata: metadata || EMPTY_OBJECT
});

export const createPCComponentInstance = (
  is: string,
  styles: PCStyleBlock[] = EMPTY_ARRAY,
  attributes: KeyValuePair<string>[] = EMPTY_ARRAY,
  children: PCComponentInstanceChild[] = EMPTY_ARRAY,
  metadata?: KeyValue<any>,
  label?: string
): PCComponentInstanceElement => ({
  id: generateUID(),
  is: is || "div",
  label,
  name: PCSourceTagNames.COMPONENT_INSTANCE,
  attributes: attributes || EMPTY_ARRAY,
  styles: styles || EMPTY_ARRAY,
  children: children || EMPTY_ARRAY,
  metadata: metadata || EMPTY_OBJECT,
  variant: EMPTY_OBJECT,
  overrides: EMPTY_ARRAY
});

export const createPCTextNode = (
  value: string,
  label?: string,
  styles: PCStyleBlock[] = EMPTY_ARRAY
): PCTextNode => ({
  id: generateUID(),
  name: PCSourceTagNames.TEXT,
  label: label || value,
  value,
  styles: styles || EMPTY_ARRAY,
  children: [],
  metadata: {}
});

export const createPCSlot = (
  defaultChildren?: PCBaseElementChild[]
): PCSlot => ({
  id: generateUID(),
  children: defaultChildren || EMPTY_ARRAY,
  metadata: EMPTY_OBJECT,
  name: PCSourceTagNames.SLOT,
  label: "Slot"
});

export const createPCPlug = (
  slotId: string,
  children?: PCBaseElementChild[]
): PCPlug => ({
  slotId,
  id: generateUID(),
  children: children || EMPTY_ARRAY,
  metadata: EMPTY_OBJECT,
  name: PCSourceTagNames.PLUG
});

export const createPCOverride = (
  targetIdPath: string[],
  type: PCOverridableType,
  value: any,
  variantId?: string
): PCOverride => {
  const id = generateUID();

  let children;

  return {
    id,
    variantId,
    type,
    targetIdPath,
    value,
    children: []
  } as PCBaseValueOverride<any, any>;
};

export const createPCDependency = (
  uri: string,
  module: PCModule
): Dependency<PCModule> => ({
  uri,
  content: module
});

/*------------------------------------------
 * TYPE UTILS
 *-----------------------------------------*/

export const isValueOverride = (
  node: PCOverride
): node is PCBaseValueOverride<any, any> => {
  return true;
};

export const isVisibleNode = (node: PCNode): node is PCVisibleNode =>
  node.name === PCSourceTagNames.ELEMENT ||
  node.name === PCSourceTagNames.TEXT ||
  node.name === PCSourceTagNames.STYLE_MIXIN ||
  isPCComponentInstance(node);
// export const isPCOverride = (node: PCNode): node is PCOverride =>
//   node.name === PCSourceTagNames.OVERRIDE;
export const isComponent = (node: PCNode): node is PCComponent =>
  node.name === PCSourceTagNames.COMPONENT;

export const isSlot = (node: PCNode): node is PCSlot =>
  node.name === PCSourceTagNames.SLOT;
export const isPCPlug = (node: PCNode): node is PCPlug =>
  node.name === PCSourceTagNames.PLUG;
export const isPCComponentInstance = (
  node: PCNode
): node is PCComponentInstanceElement =>
  node.name === PCSourceTagNames.COMPONENT_INSTANCE;
export const isPCComponentOrInstance = (node: PCNode) =>
  isPCComponentInstance(node) || isComponent(node);

export const extendsComponent = (element: PCNode) =>
  (element.name == PCSourceTagNames.COMPONENT ||
    element.name === PCSourceTagNames.COMPONENT_INSTANCE) &&
  element.is.length > 6 &&
  /\d/.test(element.is);

export const isTextLikePCNode = (node: PCNode): node is PCTextLikeNode =>
  node.name === PCSourceTagNames.TEXT ||
  (node.name === PCSourceTagNames.STYLE_MIXIN &&
    node.targetType === PCSourceTagNames.TEXT);
export const isElementLikePCNode = (node: PCNode): node is PCElementLikeNode =>
  node.name === PCSourceTagNames.ELEMENT ||
  node.name === PCSourceTagNames.COMPONENT ||
  node.name === PCSourceTagNames.COMPONENT_INSTANCE ||
  (node.name === PCSourceTagNames.STYLE_MIXIN &&
    node.targetType === PCSourceTagNames.ELEMENT);

/*------------------------------------------
 * GETTERS
 *-----------------------------------------*/

export const getModuleComponents = memoize(
  (root: PCModule): PCComponent[] =>
    root.children.reduce((components, contentNode) => {
      return contentNode.name === PCSourceTagNames.COMPONENT
        ? [...components, contentNode]
        : components;
    }, [])
);

// export const computeNodeStyles = memoize((node: PCVisibleNode | PCComponent, options:) => {
//   const style = {};
//   for (const block of node.styles) {
//     if (!block.mixinId && !block.variantId) {

//     }
//   }
// });

export const getVisibleChildren = memoize(
  (node: PCNode) => node.children.filter(isVisibleNode) as PCVisibleNode[]
);

export const getVisibleOrSlotChildren = memoize(
  (node: PCNode) =>
    (node.children as PCNode[]).filter(
      child => isVisibleNode(child) || child.name === PCSourceTagNames.SLOT
    ) as PCVisibleNode[]
);
export const getOverrides = memoize((node: PCNode) => {
  if (
    node.name === PCSourceTagNames.COMPONENT ||
    node.name == PCSourceTagNames.COMPONENT_INSTANCE
  ) {
    return node.overrides;
  }
  return EMPTY_ARRAY;
});

export const getPCVariants = memoize(
  (component: PCComponent | PCVisibleNode): PCVariant[] =>
    component.children.filter(
      child => child.name === PCSourceTagNames.VARIANT
    ) as PCVariant[]
);

export const getPCVariantOverrides = memoize(
  (
    instance: PCComponent | PCComponentInstanceElement,
    variantId: string
  ): PCVariantOverride[] =>
    instance.overrides.filter(
      override =>
        override.type === PCOverridableType.VARIANT_IS_DEFAULT &&
        override.variantId == variantId
    ) as PCVariantOverride[]
);

export const getPCImportedChildrenSourceUris = (
  { id: nodeId }: PCNode,
  graph: DependencyGraph
) => {
  const node = getPCNode(nodeId, graph);
  const imported = {};
  findNestedNode(node, (child: PCNode) => {
    const dep = getPCNodeDependency(child.id, graph);
    imported[dep.uri] = 1;
  });
  return Object.keys(imported);
};

export const getNativeComponentName = memoize(
  ({ id }: PCElementLikeNode, graph: DependencyGraph) => {
    let current = getPCNode(id, graph) as PCComponent;
    while (extendsComponent(current)) {
      current = getPCNode(current.is, graph) as PCComponent;
    }
    return current.is;
  }
);

// export const getComponentProperties = (memoize)

export const getPCNodeDependency = memoize(
  (nodeId: string, graph: DependencyGraph) => {
    for (const uri in graph) {
      const dependency = graph[uri];
      if (getNestedTreeNodeById(nodeId, dependency.content)) {
        return dependency;
      }
    }
    return null;
  }
);

export const getGlobalVariables = memoize(
  (graph: DependencyGraph): PCVariable[] => {
    return Object.values(graph).reduce(
      (variables, dependency: PCDependency) => {
        return [
          ...variables,
          ...dependency.content.children.filter(
            child => child.name === PCSourceTagNames.VARIABLE
          )
        ];
      },
      EMPTY_ARRAY
    );
  }
);

export const getGlobalMediaQueries = memoize(
  (graph: DependencyGraph): PCMediaQuery[] => {
    return Object.values(graph).reduce(
      (variables, dependency: PCDependency) => {
        return [
          ...variables,
          ...dependency.content.children.filter(
            child => child.name === PCSourceTagNames.QUERY
          )
        ];
      },
      EMPTY_ARRAY
    );
  }
);

export const filterVariablesByType = memoize(
  (variables: PCVariable[], type: PCVariableType) => {
    return variables.filter(variable => variable.type === type);
  }
);

export const getInstanceSlots = memoize(
  (
    node: PCComponentInstanceElement | PCComponent,
    graph: DependencyGraph
  ): PCSlot[] => {
    if (!extendsComponent(node)) {
      return [];
    }
    return getComponentSlots(getPCNode(node.is, graph) as PCComponent);
  }
);

export const getComponentSlots = memoize(
  (component: PCComponent): PCSlot[] => {
    return flattenTreeNode(component).filter(isSlot);
  }
);

export const getComponentVariantTriggers = (component: PCComponent) => {
  return getTreeNodesByName(
    PCSourceTagNames.VARIANT_TRIGGER,
    component
  ) as PCVariantTrigger[];
};

export const getVariantTriggers = (
  variant: PCVariant,
  component: PCComponent
) => {
  return getComponentVariantTriggers(component).filter(
    trigger => trigger.targetVariantId === variant.id
  );
};

export const getInstanceSlotContent = memoize(
  (slotId: string, node: PCComponentInstanceElement | PCComponent) => {
    return node.children.find(
      child => isPCPlug(child) && child.slotId === slotId
    ) as PCPlug;
  }
);

let slotCount = 0;

export const addPCNodePropertyBinding = memoize(
  (
    node: PCVisibleNode | PCComponent,
    bindProperty: string,
    sourceProperty: string
  ) => {
    // TODO - assert that property binding does not exist
    // TODO
  }
);

export const getInstanceShadow = memoize(
  (
    instance: PCComponentInstanceElement,
    graph: DependencyGraph
  ): PCComponent => {
    return getPCNode(instance.is, graph) as PCComponent;
  }
);

export const getSlotPlug = memoize(
  (
    instance: PCComponent | PCComponentInstanceElement,
    slot: PCSlot
  ): PCPlug => {
    return instance.children.find(
      (child: PCNode) =>
        child.name === PCSourceTagNames.PLUG && child.slotId === slot.id
    ) as PCPlug;
  }
);

export const getInstanceExtends = memoize(
  (
    instance: PCComponentInstanceElement,
    graph: DependencyGraph
  ): PCComponent[] => {
    let current: PCComponent | PCComponentInstanceElement = instance;
    const components = [];

    while (1) {
      current = getPCNode(current.is, graph) as PCComponent;
      if (!current) break;
      components.push(current);
    }

    return components;
  }
);

export const getPCNode = (nodeId: string, graph: DependencyGraph) => {
  const dep = getPCNodeDependency(nodeId, graph);
  if (!dep) {
    return null;
  }
  return getNestedTreeNodeById(nodeId, dep.content) as PCNode;
};

export const filterPCNodes = (
  graph: DependencyGraph,
  filter: NodeFilter<PCNode>
): PCNode[] => {
  const found = [];
  for (const uri in graph) {
    const dep = graph[uri];
    found.push(...filterNestedNodes(dep.content, filter));
  }

  return found;
};

export const isPCContentNode = (node: PCNode, graph: DependencyGraph) => {
  const module = getPCNodeModule(node.id, graph);
  return module.children.some(child => child.id === node.id);
};

export const getPCNodeModule = (
  nodeId: string,
  graph: DependencyGraph
): PCModule => {
  const dep = getPCNodeDependency(nodeId, graph);
  return dep && dep.content;
};

export const getPCNodeContentNode = (nodeId: string, module: PCModule) => {
  return module.children.find(contentNode =>
    Boolean(getNestedTreeNodeById(nodeId, contentNode))
  );
};

export const updatePCNodeMetadata = <TNode extends PCNode>(
  metadata: KeyValue<any>,
  node: TNode
): TNode => ({
  ...(node as any),
  metadata: {
    ...node.metadata,
    ...metadata
  }
});

export const getComponentTemplate = (component: PCComponent) =>
  component.children.find(isVisibleNode) as PCVisibleNode;

export const getComponentVariants = (component: PCComponent) =>
  component.children.filter(
    child => child.name === PCSourceTagNames.VARIANT
  ) as PCVariant[];

export const getDefaultVariantIds = (component: PCComponent) =>
  getComponentVariants(component)
    .filter(variant => variant.isDefault)
    .map(variant => variant.id);

export const getNodeSourceComponent = memoize(
  (node: PCComponentInstanceElement, graph: DependencyGraph) =>
    getPCNodeContentNode(node.name, getPCNodeModule(node.id, graph))
);

export const getAllPCComponents = memoize(
  (graph: DependencyGraph): PCComponent[] => {
    const components: PCComponent[] = [];

    for (const uri in graph) {
      const dep = graph[uri];
      components.push(
        ...getTreeNodesByName(PCSourceTagNames.COMPONENT, dep.content)
      );
    }

    return components;
  }
);

export const getAllStyleMixins = memoize(
  (
    graph: DependencyGraph,
    targetType?: PCSourceTagNames.TEXT | PCSourceTagNames.ELEMENT
  ): PCStyleMixin[] => {
    const mixins: PCStyleMixin[] = [];

    for (const uri in graph) {
      const dep = graph[uri];
      mixins.push(
        ...getTreeNodesByName(PCSourceTagNames.STYLE_MIXIN, dep.content).filter(
          (mixin: PCStyleMixin) => {
            return !targetType || mixin.targetType === targetType;
          }
        )
      );
    }

    return mixins;
  }
);

export const isVoidTagName = (name: string) =>
  VOID_TAG_NAMES.indexOf(name) !== -1;

const addBlocksRefMaps = (blocks: PCStyleBlock[]) => {
  let iss = [];
  for (const block of blocks) {
    if (block.mixinId) {
      iss = [...iss, block.mixinId];
    }
  }
  return iss;
};

export const getComponentRefIds = memoize(
  (node: PCNode): string[] => {
    return uniq(
      reduceTree(
        node,
        (iss: string[], node: PCNode) => {
          if (
            node.name === PCSourceTagNames.COMPONENT_INSTANCE ||
            (node.name === PCSourceTagNames.COMPONENT && extendsComponent(node))
          ) {
            iss = [...iss, node.is];

            for (const override of node.overrides) {
              if (override.type === PCOverridableType.STYLES) {
                iss = [...iss, ...addBlocksRefMaps(override.value)];
              }
            }
          }

          if ((node as PCVisibleNode).styles) {
            iss = [...iss, ...addBlocksRefMaps((node as PCVisibleNode).styles)];
          }
          return iss;
        },
        []
      )
    );
  }
);

export const getSortedStyleMixinIds = memoize(
  (node: PCVisibleNode | PCStyleMixin | PCComponent) => {
    return node.styles.map(style => style.mixinId).filter(Boolean);
  }
);

export const isVariantTriggered = memoize(
  (
    instance: PCComponentInstanceElement | PCComponent,
    variant: PCVariant,
    graph: DependencyGraph
  ) => {
    const instanceModule = getPCNodeModule(instance.id, graph);
    const instanceContentNode = getPCNodeContentNode(
      instance.id,
      instanceModule
    );
    const instanceContentNodeBounds = instanceContentNode.metadata[
      PCVisibleNodeMetadataKey.BOUNDS
    ] as Bounds;

    const instanceContentNodeSize = {
      width: instanceContentNodeBounds.right - instanceContentNodeBounds.left,
      height: instanceContentNodeBounds.bottom - instanceContentNodeBounds.top
    };

    const variantModule = getPCNodeModule(variant.id, graph);
    const variantComponent = getPCNodeContentNode(
      variant.id,
      variantModule
    ) as PCComponent;
    const variantTriggers = getVariantTriggers(variant, variantComponent);

    return variantTriggers.some(trigger => {
      if (!trigger.source) {
        return false;
      }

      if (trigger.source.type !== PCVariantTriggerSourceType.QUERY) {
        return false;
      }

      const query = getPCNode(trigger.source.queryId, graph) as PCQuery;
      if (!query || !query.condition) {
        return false;
      }
      if (query.type === PCQueryType.MEDIA) {
        const { minWidth, maxWidth } = query.condition;
        if (minWidth != null && instanceContentNodeSize.width < minWidth) {
          return false;
        }
        if (maxWidth != null && instanceContentNodeSize.width > maxWidth) {
          return false;
        }
      }

      if (query.type === PCQueryType.VARIABLE) {
        const variable = getPCNode(query.sourceVariableId, graph) as PCVariable;

        if (!variable) {
          return false;
        }

        const { equals, notEquals } = query.condition;

        if (equals != null && String(variable.value) !== String(equals)) {
          return false;
        }

        if (notEquals != null && String(variable.value) === String(notEquals)) {
          return false;
        }
      }

      return true;
    });
  }
);

export const clonePCNode = (node: PCNode) => {
  let clone = {
    ...node,
    id: generateUID(),
    children: node.children.map(clonePCNode)
  };

  if (isVisibleNode(clone)) {
    clone.styles = clone.styles.map(clonePCStyleBlock);
  }

  return clone;
};

export const clonePCStyleBlock = (block: PCStyleBlock) => ({
  ...block,
  id: generateUID()
});

export const variableQueryPassed = (
  query: PCVariableQuery,
  varMap: KeyValue<PCVariable>
) => {
  const variable = varMap[query.sourceVariableId];
  if (!variable || !query.condition) return false;

  if (query.condition.equals) {
    return String(variable.value) === query.condition.equals;
  }

  if (query.condition.notEquals) {
    return String(variable.value) !== query.condition.notEquals;
  }

  return false;
};

export const getVanillStyle = (blocks: PCStyleBlock[], variantId?: string) => {
  return styleBlocksToHash(
    blocks,
    style =>
      !style.mixinId &&
      style.variantId == variantId &&
      !Object.keys(style.parts).length
  );
};

export const styleBlocksToHash = (
  blocks: PCStyleBlock[],
  filter = (block: PCStyleBlock) => true
) => {
  return blocks.filter(filter).reduce(
    (style, block) => ({
      ...keyValuePairToHash(block.properties),
      ...style
    }),
    {}
  );
};

export const isComponentLike = (
  node: PCNode
): node is BaseComponentLike<any> => {
  return (
    node.name === PCSourceTagNames.COMPONENT_INSTANCE ||
    node.name === PCSourceTagNames.COMPONENT
  );
};

export const filterStyleMixins = memoize((blocks: PCStyleBlock[]) => {
  return blocks.filter(style => style.mixinId);
});

export const computePCNodeStyle = memoize(
  (
    node: PCVisibleNode | PCComponent | PCStyleMixin,
    componentRefs: KeyValue<PCComponent>,
    varMap: KeyValue<PCVariable>
  ) => {
    let style = {};

    const styleMixinIds = getSortedStyleMixinIds(node);
    for (let i = 0, { length } = styleMixinIds; i < length; i++) {
      const inheritComponent = componentRefs[styleMixinIds[i]];
      if (!inheritComponent) {
        continue;
      }
      Object.assign(
        style,
        computePCNodeStyle(inheritComponent, componentRefs, varMap)
      );
    }

    for (const block of node.styles) {
      Object.assign(style, keyValuePairToHash(block.properties));
    }

    return computeStyleWithVars(style, varMap);
  }
);

export const computePCStyleBlock = memoize(
  (
    block: PCStyleBlock,
    componentRefs: KeyValue<PCComponent>,
    varMap: KeyValue<PCVariable>
  ) => {
    let style = {};

    if (block.mixinId) {
      const mixin = componentRefs[block.mixinId];
      if (!mixin) {
        console.warn(`Style block mixinId ${block.mixinId} does not exist`);
        return style;
      }
      Object.assign(
        style,
        computePCStyleBlocks(mixin.styles, componentRefs, varMap)
      );
    } else {
      Object.assign(style, keyValuePairToHash(block.properties));
    }

    return computeStyleWithVars(style, varMap);
  }
);

export const computePCStyleBlocks = memoize(
  (
    blocks: PCStyleBlock[],
    componentRefs: KeyValue<PCComponent>,
    varMap: KeyValue<PCVariable>,
    variantId?: string
  ) => {
    return blocks
      .filter(block => block.variantId == variantId)
      .reduce(
        (style, block) => ({
          ...computePCStyleBlock(block, componentRefs, varMap),
          ...style
        }),
        {}
      );
  }
);

export const getComponentGraphRefs = memoize(
  (node: PCNode, graph: DependencyGraph): PCComponent[] => {
    const allRefs: PCComponent[] = [];
    const refIds = getComponentRefIds(node);
    for (let i = 0, { length } = refIds; i < length; i++) {
      const component = getPCNode(refIds[i], graph) as PCComponent;
      if (!component) {
        continue;
      }
      allRefs.push(component);
      allRefs.push(...getComponentGraphRefs(component, graph));
    }
    return uniq(allRefs);
  }
);
const nodeAryToRefMap = memoize(
  <TItem extends PCNode>(refs: TItem[]): KeyValue<TItem> => {
    const componentRefMap = {};
    for (let i = 0, { length } = refs; i < length; i++) {
      const ref = refs[i];
      componentRefMap[ref.id] = ref;
    }

    return componentRefMap;
  }
);

export const getComponentGraphRefMap = memoize(
  (node: PCNode, graph: DependencyGraph): KeyValue<PCComponent> =>
    nodeAryToRefMap(getComponentGraphRefs(node, graph)) as KeyValue<PCComponent>
);

export const getVariableRefMap = memoize(
  (node: PCNode, graph: DependencyGraph) =>
    nodeAryToRefMap(getVariableGraphRefs(node, graph)) as KeyValue<PCVariable>
);

export const getQueryRefMap = memoize(
  (node: PCNode, graph: DependencyGraph) =>
    nodeAryToRefMap(getQueryGraphRefs(node, graph)) as KeyValue<PCMediaQuery>
);

export const getAllVariableRefMap = memoize(
  (graph: DependencyGraph) =>
    nodeAryToRefMap(getGlobalVariables(graph)) as KeyValue<PCVariable>
);

export const getQueryGraphRefs = memoize(
  (node: PCNode, graph: DependencyGraph): PCMediaQuery[] => {
    const triggers = getTreeNodesByName(
      PCSourceTagNames.VARIANT_TRIGGER,
      node
    ) as PCVariantTrigger[];

    return uniq(
      triggers
        .filter(trigger => {
          return (
            trigger.source &&
            trigger.source.type === PCVariantTriggerSourceType.QUERY
          );
        })
        .map(trigger => {
          return getPCNode(
            (trigger.source as PCVariantTriggerQuerySource).queryId,
            graph
          ) as PCQuery;
        })
    );
  }
);

export const getVariableGraphRefs = memoize(
  (node: PCNode, graph: DependencyGraph) => {
    const allRefs: PCVariable[] = [];

    if (
      node.name === PCSourceTagNames.VARIANT_TRIGGER &&
      node.source &&
      node.source.type === PCVariantTriggerSourceType.QUERY
    ) {
      const query = getPCNode(node.source.queryId, graph) as PCQuery;
      if (query.type === PCQueryType.VARIABLE) {
        const ref = getPCNode(query.sourceVariableId, graph) as PCVariable;
        if (ref) {
          allRefs.push(ref);
        }
      }
    }

    const refIds: string[] = [];

    if (
      node.name === PCSourceTagNames.COMPONENT ||
      node.name === PCSourceTagNames.COMPONENT_INSTANCE
    ) {
      for (const override of node.overrides) {
        if (override.type === PCOverridableType.STYLES) {
          refIds.push(...getNodeStyleRefIds(override.value, graph));
        }
      }
    }

    if (isVisibleNode(node) || node.name === PCSourceTagNames.COMPONENT) {
      refIds.push(...getNodeStyleRefIds(node.styles, graph));
    }

    for (let i = 0, { length } = refIds; i < length; i++) {
      const variable = getPCNode(refIds[i], graph) as PCVariable;
      if (!variable) {
        continue;
      }
      allRefs.push(variable);
    }

    for (let i = 0, { length } = node.children; i < length; i++) {
      const child = node.children[i];
      allRefs.push(...getVariableGraphRefs(child, graph));
    }
    return uniq(allRefs);
  }
);

export const getPCParentComponentInstances = memoize(
  (node: PCNode, root: PCNode) => {
    const parents = filterTreeNodeParents(node.id, root, isPCComponentInstance);

    return parents;
  }
);

export const styleValueContainsCSSVar = (value: string) => {
  return value.search(/var\(.*?\)/) !== -1;
};

// not usable yet -- maybe with computed later on
export const getCSSVars = (value: string) => {
  return (value.match(/var\(--[^\s]+?\)/g) || EMPTY_ARRAY).map(
    v => v.match(/var\(--(.*?)\)/)[1]
  );
};

export const computeStyleWithVars = (
  style: KeyValue<string>,
  varMap: KeyValue<PCVariable>
) => {
  const expandedStyle = {};
  for (const key in style) {
    expandedStyle[key] = computeStyleValue(style[key], varMap);
  }
  return expandedStyle;
};

export const computeStyleValue = (
  value: string,
  varMap: KeyValue<PCVariable>
) => {
  if (value && styleValueContainsCSSVar(String(value))) {
    const cssVars = getCSSVars(value);
    for (const cssVar of cssVars) {
      var ref = varMap[cssVar];
      value = ref ? value.replace(`var(--${cssVar})`, ref.value) : value;
    }
    if (value.indexOf(`var`) !== -1) {
      console.warn(`var still exists: ${value}`);
    }
  }

  return value;
};

export const getNodeStyleRefIds = memoize(
  (blocks: PCStyleBlock[], graph: DependencyGraph) => {
    const refIds = [];
    for (const block of blocks) {
      if (block.mixinId) {
        const mixin = getPCNode(block.mixinId, graph) as PCStyleMixin;
        if (mixin) {
          refIds.push(...getNodeStyleRefIds(mixin.styles, graph));
        }
      } else {
        for (const { value } of block.properties) {
          // value c
          if (value && styleValueContainsCSSVar(String(value))) {
            const cssVars = getCSSVars(value);
            for (const cssVar of cssVars) {
              refIds.push(cssVar);
            }
          }
        }
      }
    }
    return uniq(refIds);
  }
);

/*------------------------------------------
 * SETTERS
 *-----------------------------------------*/

export const replacePCNode = (
  newNode: PCNode,
  oldNode: PCNode,
  graph: DependencyGraph
) => {
  const dependency = getPCNodeDependency(oldNode.id, graph);
  return updateGraphDependency(
    {
      content: replaceNestedNode(newNode, oldNode.id, dependency.content)
    },
    dependency.uri,
    graph
  );
};
