import * as util from "./utils";
import { settings } from "./settings";
import { WindowManager } from "./WindowManager";

const $scss = util.css;

util.addStylesheet($scss`
    
.window{
    transform:
        translate( var(--x), var(--y) );
    top: 0;
    left: 0;
    width: var(--w);
    height: var(--h);
    
    position: absolute;
    display: grid;
    
    .ui[uistyle=dragabove] &{
        border-radius: 6px;
        overflow: hidden;
    	grid-template-rows: max-content 1fr;
        box-shadow: 0px 10px 25px rgba(0,0,0,0.2);
    }
    .ui[uistyle=dragbelow] &{
    	grid-template-rows: 1fr max-content;
    }
}

.animator{
    transform: scale(1);
    opacity: 1.0;
    transition: 0.1s opacity;
    transform-origin: var(--origin-x) var(--origin-y);
    cursor: default;
    position:absolute; /*for z-index on ios safari*/
    &.drag{
        cursor: move;
    }
    &.scale{
        transform: scale(var(--progress-w), var(--progress-h)); // could do --pw / --w for pixels
        cursor: resize;
    }
}

.titlebar{
    padding: 5px;
    cursor: inherit;
    -webkit-user-select: none;
    user-select: none;
    .ui[uistyle=dragabove] &{
        background-color: rgba(255,255,255,0.9);
    }
    .ui[uistyle=dragbelow] &{
        grid-row: 2;
    }
}
.body{
    background-color: rgba(255, 255, 255, 1.0);
    overflow: hidden;
    width:100%; /*for ios safari fullscreen*/
    height:100%;
    .ui[uistyle=dragbelow] &{
        border-radius: 6px;
        box-shadow: 0px 10px 25px rgba(0,0,0,0.2);
        	grid-template-rows: 0 1fr;
    }
}

`);

type WindowPosition = {
  x1: Readonly<number>;
  y1: Readonly<number>;
  x2: Readonly<number>;
  y2: Readonly<number>;
};

type ComputedWindowPosition = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export class Window {
  node: HTMLDivElement;
  animator: HTMLDivElement;
  isDragging: boolean; // remove
  window: HTMLDivElement;
  titlebar: HTMLDivElement;
  body: HTMLDivElement;
  manager?: WindowManager;
  _rect?: ClientRect | DOMRect;
  _computedPosition: ComputedWindowPosition;
  _pos: WindowPosition;
  pins: { x1?: number; y1?: number; x2?: number; y2?: number };
  constructor() {
    this.animator = document.createElement("div");
    this.animator.classList.add("animator");

    this.isDragging = false;

    this.window = document.createElement("div");
    this.window.classList.add("window");

    this.pins = {};
    this._pos = { x1: -1, y1: -1, x2: -1, y2: -1 };
    this._computedPosition = { x: -1, y: -1, w: -1, h: -1 };
    this.pos = {
      x1: 25,
      y1: 25,
      x2: 125,
      y2: 125
    };

    this.titlebar = document.createElement("div");
    this.titlebar.classList.add("titlebar");
    this.titlebar.appendChild(document.createTextNode("my window"));
    this.window.appendChild(this.titlebar);

    this.body = document.createElement("div");
    this.body.classList.add("body");
    this.window.appendChild(this.body);
    this.animator.appendChild(this.window);

    this.node = this.animator;

    this.titlebar.addEventListener("pointerdown", this.pinnedDrag.bind(this)); // not capture because buttons
    this.window.addEventListener;
    this.window.addEventListener(
      "pointerdown",
      e => {
        this.bringToFront();
        if (e.pointerType === "mouse") {
          if (e.altKey) {
            if (util.getButton(e) === 1) {
              this.pinnedDrag(e);
            }
            if (util.getButton(e) === 2) {
              // this.resizeEvent(e);
            }
          }
        }
        if (e.pointerType === "touch") {
          // if touch down on titlebar, resize
          if (this.isDragging) {
            // this.resizeEvent(e);
          }
        }
      },
      { capture: true }
    );
  }
  bringToFront() {
    this.manager && this.manager.bringToFront(this);
  }
  // redo these:
  // drag event = move top left bottom right based on cursor pos
  // resize event = move bototm right based on cursor pos. two resizes at once = move multiple
  async pinnedDrag(e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const rect = this.window.getBoundingClientRect();
    let oldX = e.clientX;
    let oldY = e.clientY;

    this.pins.x1
      ? (this.pins = {
          ...this.pins,
          x2: e.pointerId,
          y2: e.pointerId
        })
      : (this.pins = {
          x1: e.pointerId,
          y1: e.pointerId,
          x2: e.pointerId,
          y2: e.pointerId
        });

    await util.startDragWatcher(e, (e: PointerEvent) => {
      this.pos = {
        x1: this.pos.x1 + (this.pins.x1 === e.pointerId ? e.clientX - oldX : 0),
        y1: this.pos.y1 + (this.pins.y1 === e.pointerId ? e.clientY - oldY : 0),
        x2: this.pos.x2 + (this.pins.x2 === e.pointerId ? e.clientX - oldX : 0),
        y2: this.pos.y2 + (this.pins.y2 === e.pointerId ? e.clientY - oldY : 0)
      };
      oldX = e.clientX;
      oldY = e.clientY;
    });
    this.pins = {
      x1: this.pins.x1 === e.pointerId ? undefined : this.pins.x1,
      y1: this.pins.y1 === e.pointerId ? undefined : this.pins.y1,
      x2: this.pins.x2 === e.pointerId ? undefined : this.pins.x2,
      y2: this.pins.y2 === e.pointerId ? undefined : this.pins.y2
    };
  }
  get rect() {
    return this._rect || this.window.getBoundingClientRect();
  }
  get pos(): Readonly<WindowPosition> {
    return this._pos;
  }
  set pos(newval: Readonly<WindowPosition>) {
    console.log("setting pos", newval);
    this._pos = newval;
    let oldComputed = this._computedPosition;
    this._computedPosition = this.computePosition();
    this.updatePosition(oldComputed);
  }
  updatePosition(old: ComputedWindowPosition) {
    let pos = this._computedPosition;
    pos.x !== old.x && this.window.style.setProperty("--x", pos.x + "px");
    pos.y !== old.y && this.window.style.setProperty("--y", pos.y + "px");
    pos.w !== old.w && this.window.style.setProperty("--w", pos.w + "px");
    pos.h !== old.h && this.window.style.setProperty("--h", pos.h + "px");
    // pw && this.animator.style.setProperty("--progress-w", "" + pw); // coming soon
    // ph && this.animator.style.setProperty("--progress-h", "" + ph); // coming soon
    pos.x !== old.x &&
      this.animator.style.setProperty("--origin-x", pos.x + "px");
    pos.y !== old.y &&
      this.animator.style.setProperty("--origin-y", pos.y + "px");
    this._rect = this.window.getBoundingClientRect();
  }
  computePosition(): ComputedWindowPosition {
    return {
      x: this._pos.x1,
      y: this._pos.y1,
      w: this._pos.x2 - this._pos.x1,
      h: this._pos.y2 - this._pos.y1
    };
  }
}
