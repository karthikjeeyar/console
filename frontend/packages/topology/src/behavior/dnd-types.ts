export type DragEvent = {
  initialX: number;
  initialY: number;
  totalDx: number;
  totalDy: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
};

export type DragSource = {
  type: SourceType;
  canDrag(dndManager: DndManager): boolean;
  beginDrag(dndManager: DndManager): any;
  drag(dndManager: DndManager): void;
  endDrag(dndManager: DndManager): void;
};

export type DropTarget = {
  type: TargetType;
  drop(dndManager: DndManager): any;
  hover(dndManager: DndManager): void;
  canDrop(dndManager: DndManager): boolean;
  hitTest(x: number, y: number): boolean;
};

export interface DndState {
  isDragging?: boolean;
  sourceId?: string;
  targetIds?: string[];
  item?: any;
  dropResult?: any;
  didDrop?: boolean;
  event?: DragEvent;
}

export type DndStateContainer = {
  dragDrop: DndState;
};

export interface DndActions {
  beginDrag(sourceIds: string | string[], x: number, y: number): void;
  hover(targetIds: string[]): void;
  endDrag(): void;
  drag(x: number, y: number): void;
  drop(): void;
}

export type Unregister = () => void;
export interface DndManager extends DndActions {
  registerSource(source: DragSource): [string, Unregister];
  registerTarget(target: DropTarget): [string, Unregister];
  canDragSource(sourceId: string | undefined): boolean;
  canDropOnTarget(targetId: string | undefined): boolean;
  isDragging(): boolean;
  isDraggingSource(sourceId: string | undefined): boolean;
  isOverTarget(
    targetId: string | undefined,
    options?: {
      shallow?: boolean;
    },
  ): boolean;
  getItemType(): Identifier | undefined;
  getItem(): any;
  getSourceId(): string | undefined;
  getTargetIds(): string[];
  getDropResult(): any;
  didDrop(): boolean;
  getDragEvent(): DragEvent | undefined;
}

export type DndStore = {
  dndManager: DndManager;
};

// TODO address type such that useRef work without cast to any
export type DragElementWrapper = (elementOrNode: Element | null) => void;
// | React.RefObject<Element>;

export type ConnectDragSource = DragElementWrapper;
export type ConnectDropTarget = DragElementWrapper;

export type Identifier = string;

export type TargetType = Identifier | Identifier[];

export type SourceType = Identifier;

export interface DragObjectWithType {
  type: SourceType;
}

export interface DragSourceSpec<
  DragObject extends DragObjectWithType,
  DropResult,
  CollectedProps,
  Props extends {} = {}
> {
  item: DragObject;
  begin?: (monitor: DragSourceMonitor, props?: Props) => any;
  drag?: (event: DragEvent, monitor: DragSourceMonitor, props?: Props) => void;
  end?: (dropResult: DropResult | undefined, monitor: DragSourceMonitor, props?: Props) => void;
  canDrag?: boolean | ((monitor: DragSourceMonitor, props?: Props) => boolean);
  collect?: (monitor: DragSourceMonitor, props?: Props) => CollectedProps;
}

export type DropTargetSpec<
  DragObject extends DragObjectWithType,
  DropResult,
  CollectedProps,
  Props extends {} = {}
> = {
  accept: TargetType;
  hitTest?(x: number, y: number, props?: Props): boolean;
  drop?: (item: DragObject, monitor: DropTargetMonitor, props?: Props) => DropResult | undefined;
  hover?: (item: DragObject, monitor: DropTargetMonitor, props?: Props) => void;
  canDrop?: (item: DragObject, monitor: DropTargetMonitor, props?: Props) => boolean;
  collect?: (monitor: DropTargetMonitor, props?: Props) => CollectedProps;
};

export interface HandlerManager {
  receiveHandlerId: (handlerId: string | undefined) => void;
  getHandlerId: () => string | undefined;
}

export interface DragSourceMonitor extends HandlerManager {
  canDrag(): boolean;
  isDragging(): boolean;
  getItemType(): Identifier | undefined;
  getItem(): any;
  getDropResult(): any;
  didDrop(): boolean;
  getDragEvent(): DragEvent | undefined;
}

export interface DropTargetMonitor extends HandlerManager {
  canDrop(): boolean;
  isDragging(): boolean;
  isOver(options?: { shallow?: boolean }): boolean;
  getItemType(): Identifier | undefined;
  getItem(): any;
  getDropResult(): any;
  didDrop(): boolean;
  getDragEvent(): DragEvent | undefined;
}
