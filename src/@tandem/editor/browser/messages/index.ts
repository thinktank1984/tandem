import { uniq } from "lodash";
import { toArray } from "@tandem/common/utils/array";
import { IRange, IPoint } from "@tandem/common/geom";
import { ISyntheticObject } from "@tandem/sandbox";
import { CoreEvent } from "@tandem/common/messages";
import { File, serialize, deserialize, LogLevel } from "@tandem/common";
import { Workspace, IWorkspaceTool, IHistoryItem } from "@tandem/editor/browser/stores";
import { WorkspaceToolFactoryProvider } from "@tandem/editor/browser/providers";

export class MouseAction extends CoreEvent {

  static readonly CANVAS_MOUSE_DOWN = "canvasMouseDown";
  static readonly SELECTION_DOUBLE_CLICK = "selectionDoubleClick";

  constructor(type, readonly originalEvent: MouseEvent) {
    super(type);
    Object.assign(this, {
      clientX : originalEvent.clientX,
      clientY : originalEvent.clientY,
      metaKey : originalEvent.metaKey
    });
  }
  preventDefault() {
    this.originalEvent.preventDefault();
  }
}

export class AlertMessage extends CoreEvent {
  static readonly ALERT = "alert";
  constructor(type: string, readonly level: LogLevel, readonly text: string) {
    super(type);
  }

  static createWarningMessage(text: string) {
    return new AlertMessage(this.ALERT, LogLevel.WARNING, text);
  }

  static createErrorMessage(text: string) {
    return new AlertMessage(this.ALERT, LogLevel.ERROR, text);
  }
}

export class KeyboardAction extends CoreEvent {

  static readonly CANVAS_KEY_DOWN = "canvasKeyDown";

  readonly keyCode: number;
  readonly which: number;
  constructor(type, readonly originalEvent: KeyboardEvent) {
    super(type);
    Object.assign(this, {
      which : originalEvent.which,
      keyCode: originalEvent.keyCode
    });
  }

  preventDefault() {
    this.originalEvent.preventDefault();
  }
}

export class SelectRequest extends CoreEvent {

  static readonly SELECT = "SELECT";

  public items: Array<any>;
  public keepPreviousSelection: boolean;
  public toggle: boolean;

  constructor(items: any = undefined, keepPreviousSelection = false, toggle = false) {
    super(SelectRequest.SELECT);
    this.items = toArray(items);
    this.keepPreviousSelection = !!keepPreviousSelection;
    this.toggle = toggle;
  }
}

export class SelectionChangeEvent extends CoreEvent {
  static readonly SELECTION_CHANGE = "selectionChange";
  constructor(readonly items: any[] = []) {
    super(SelectionChangeEvent.SELECTION_CHANGE);
  }
}

export class SelectAllRequest extends CoreEvent {
  static readonly SELECT_ALL = "selectAll";
  constructor() {
    super(SelectAllRequest.SELECT_ALL);
  }
}

export class ToggleSelectRequest extends SelectRequest {
  constructor(items = undefined, keepPreviousSelection: boolean = false) {
    super(items, keepPreviousSelection, true);
  }
}

export class ZoomRequest extends CoreEvent {
  static readonly ZOOM = "zoom";
  constructor(readonly delta: number, readonly ease: boolean = false, readonly round: boolean = false) {
    super(ZoomRequest.ZOOM);
  }
}

export class ZoomInRequest extends CoreEvent {
  static readonly ZOOM_IN = "zoomIn";
  constructor() {
    super(ZoomInRequest.ZOOM_IN);
  }
}

export class ZoomOutRequest extends CoreEvent {
  static readonly ZOOM_OUT = "zoomOut";
  constructor() {
    super(ZoomOutRequest.ZOOM_OUT);
  }
}

export class SetZoomRequest extends CoreEvent {
  static readonly SET_ZOOM = "setZoom";
  constructor(readonly value: number, readonly ease: boolean = false) {
    super(SetZoomRequest.SET_ZOOM);
  }
}

export class PasteRequest extends CoreEvent {
  static readonly PASTE = "paste";
  constructor(readonly item: DataTransferItem) {
    super(PasteRequest.PASTE);
  }
}

export class SetToolRequest extends CoreEvent {
  static readonly SET_TOOL = "setTool";
  constructor(readonly toolFactory: { create(workspace: Workspace): IWorkspaceTool }) {
    super(SetToolRequest.SET_TOOL);
  }
}

export class KeyCommandEvent extends CoreEvent {
  static readonly KEY_COMMAND = "keyCommand";
  constructor(readonly combo: string) {
    super(KeyCommandEvent.KEY_COMMAND);
  }
}

export class RemoveSelectionRequest extends CoreEvent {
  static readonly REMOVE_SELECTION = "removeSelection";
  constructor() {
    super(RemoveSelectionRequest.REMOVE_SELECTION);
  }
}

export * from "../../common/messages";