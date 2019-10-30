import { ComponentType } from 'react';
import Point from './geom/Point';
import Rect from './geom/Rect';
import { Translatable } from './geom/types';

// x, y
export type PointTuple = [number, number];

export interface Layout {
  layout(): void;
  destroy(): void;
}

export type Model = {
  graph?: Graph;
  nodes?: Node[];
  edges?: Edge[];
};

export enum AnchorEnd {
  target,
  source,
  both,
}

export type GroupStyle = {
  padding?: number;
};

export enum NodeShape {
  circle,
  rect,
}

export interface Element {
  id: string;
  type: string;
  label?: string;
  visible?: boolean;
  children?: string[];
  data?: any;
  style?: { [key: string]: any };
}

export interface Node extends Element {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  group?: boolean;
  shape?: NodeShape;
}

export interface Edge extends Element {
  source?: string;
  target?: string;
  bendpoints?: PointTuple[];
}

export interface Graph extends Element {
  layout?: string;
  x?: number;
  y?: number;
  scale?: number;
}

export interface Anchor<E extends NodeEntity = NodeEntity> {
  getLocation(reference: Point): Point;
  getReferencePoint(): Point;
}

export const isGraphEntity = (entity: ElementEntity): entity is GraphEntity => {
  return entity && entity.kind === 'graph';
};

export const isNodeEntity = (entity: ElementEntity): entity is NodeEntity => {
  return entity && entity.kind === 'node';
};

export const isEdgeEntity = (entity: ElementEntity): entity is EdgeEntity => {
  return entity && entity.kind === 'edge';
};

export enum ModelKind {
  graph = 'graph',
  node = 'node',
  edge = 'edge',
}
export interface ElementEntity<E extends Element = Element, D = any> extends WithState {
  readonly kind: ModelKind;
  getLabel(): string;
  setLabel(label: string): void;
  getOrderKey(): number[];
  isDetached(): boolean;
  getController(): Controller;
  setController(controller?: Controller): void;
  getGraph(): GraphEntity;
  getParent(): ElementEntity;
  hasParent(): boolean;
  setParent(parent: ElementEntity | undefined): void;
  getId(): string;
  setId(id: string): void;
  getType(): string;
  setType(type: string): void;
  setVisible(visible: boolean): void;
  isVisible(): boolean;
  getData(): D | undefined;
  setData(data: D | undefined): void;
  getChildren(): ElementEntity[];
  insertChild(child: ElementEntity, index: number): void;
  appendChild(child: ElementEntity): void;
  removeChild(child: ElementEntity): void;
  remove(): void;
  setModel(model: E): void;
  raise(): void;
  getStyle<T extends {}>(): T;
  translateToAbsolute(t: Translatable): void;
  translateFromAbsolute(t: Translatable): void;
  translateToParent(t: Translatable): void;
  translateFromParent(t: Translatable): void;
}

export interface NodeEntity<E extends Node = Node, D = any> extends ElementEntity<E, D> {
  getAnchor(end: AnchorEnd, type?: string): Anchor;
  setAnchor(anchor: Anchor, end?: AnchorEnd, type?: string): void;
  getNodes(): NodeEntity[];
  // TODO return an immutable rect
  getBounds(): Rect;
  setBounds(bounds: Rect): void;
  isGroup(): boolean;
  getNodeShape(): NodeShape;
  setNodeShape(shape: NodeShape): void;
  getSourceEdges(): EdgeEntity[];
  getTargetEdges(): EdgeEntity[];
}

export interface EdgeEntity<E extends Edge = Edge, D = any> extends ElementEntity<E, D> {
  getSource(): NodeEntity;
  setSource(source: NodeEntity): void;
  getTarget(): NodeEntity;
  setTarget(target: NodeEntity): void;
  getStartPoint(): Point;
  setStartPoint(x?: number, y?: number): void;
  getEndPoint(): Point;
  setEndPoint(x?: number, y?: number): void;
  getBendpoints(): Point[];
  setBendpoints(points: Point[]): void;
  removeBendpoint(point: Point | number): void;
}

export interface GraphEntity<E extends Graph = Graph, D = any> extends ElementEntity<E, D> {
  getNodes(): NodeEntity[];
  getEdges(): EdgeEntity[];
  getBounds(): Rect;
  setBounds(bounds: Rect): void;
  getScale(): number;
  setScale(scale: number): void;
  getLayout(): string | undefined;
  setLayout(type: string | undefined): void;
  layout(): void;

  // viewport operations
  reset(): void;
  scaleBy(scale: number, location?: Point): void;
  fit(padding?: number): void;
  panIntoView(entity: NodeEntity, options: { offset?: number; minimumVisible?: number }): void;
}

export type EventListener<Args extends any[] = any[]> = (...args: Args) => void;

export type State = { [key: string]: any };

export interface WithState {
  getState<S extends {} = {}>(): S;
  setState(state: State): void;
}

export interface Controller extends WithState {
  getStore<S extends {} = {}>(): S;
  fromModel(model: Model): void;
  getGraph(): GraphEntity;
  setGraph(Graph: GraphEntity): void;
  getLayout(type: string | undefined): Layout | undefined;
  getEntityById(id: string): ElementEntity | undefined;
  getNodeById(id: string): NodeEntity | undefined;
  getEdgeById(id: string): EdgeEntity | undefined;
  addEntity(entity: ElementEntity): void;
  removeEntity(entity: ElementEntity): void;
  getWidget(kind: ModelKind, type: string): ComponentType<{ entity: ElementEntity }>;
  registerLayoutFactory(factory: LayoutFactory): void;
  registerWidgetFactory(factory: WidgetFactory): void;
  registerEntityFactory(factory: EntityFactory): void;
  addEventListener<L extends EventListener = EventListener>(type: string, listener: L): Controller;
  removeEventListener(type: string, listener: EventListener): Controller;
  fireEvent(type: string, ...args: any): void;
  getEntities(): ElementEntity[];
}

export type LayoutFactory = (type: string, graph: GraphEntity) => Layout | undefined;

export type WidgetFactory = (
  kind: ModelKind,
  type: string,
) => ComponentType<{ entity: ElementEntity }> | undefined;

export type EntityFactory = (kind: ModelKind, type: string) => ElementEntity | undefined;
