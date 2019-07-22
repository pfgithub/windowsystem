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

export class Window {
  node: HTMLDivElement;
  animator: HTMLDivElement;
  isDragging: boolean; // remove
  window: HTMLDivElement;
  titlebar: HTMLDivElement;
  body: HTMLDivElement;
  manager?: WindowManager;
  _rect?: ClientRect | DOMRect;
  constructor() {
    this.animator = document.createElement("div");
    this.animator.classList.add("animator");

    this.isDragging = false;

    this.window = document.createElement("div");
    this.window.classList.add("window");
    this.setPosition({
      x: 25,
      y: 50,
      w: 500,
      h: 600,
      pw: 1,
      ph: 1,
      ox: 0,
      oy: 0
    });

    this.titlebar = document.createElement("div");
    this.titlebar.classList.add("titlebar");
    this.titlebar.appendChild(document.createTextNode("my window"));
    this.window.appendChild(this.titlebar);

    this.body = document.createElement("div");
    this.body.classList.add("body");
    this.window.appendChild(this.body);
    this.animator.appendChild(this.window);

    this.node = this.animator;

    this.titlebar.addEventListener("pointerdown", this.dragEvent.bind(this)); // not capture because buttons
    this.window.addEventListener;
    this.window.addEventListener(
      "pointerdown",
      e => {
        this.bringToFront();
        if (e.pointerType === "mouse") {
          if (e.altKey) {
            if (util.getButton(e) === 1) {
              this.dragEvent(e);
            }
            if (util.getButton(e) === 2) {
              this.resizeEvent(e);
            }
          }
        }
        if (e.pointerType === "touch") {
          // if touch down on titlebar, resize
          if (this.isDragging) {
            this.resizeEvent(e);
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
  async dragEvent(e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const rect = this.window.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    await util.startDragWatcher(e, (e: PointerEvent) => {
      this.setPosition({
        x: e.clientX - offsetX,
        y: e.clientY - offsetY
      });
      if (!this.isDragging) {
        this.animator.classList.add("drag");
        this.isDragging = true;
      }
    });
    // use requestanimationframe
    // if touch, add momentum
    this.isDragging && this.animator.classList.remove("drag");
    this.isDragging = false;
  }
  get rect() {
    return this._rect || this.window.getBoundingClientRect();
  }
  async resizeEvent(e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const rect = this.rect;

    const initialX = e.clientX;
    const initialY = e.clientY;

    const initialWidth = rect.width;
    const initialHeight = rect.height;

    let lastWidth;
    let lastHeight;

    let addedDrag = false;
    await util.startDragWatcher(e, (e: PointerEvent) => {
      lastWidth = e.clientX - initialX + initialWidth;
      lastHeight = e.clientY - initialY + initialHeight;
      if (settings.scaleMode === "fast") {
        this.setPosition({
          pw: lastWidth / initialWidth,
          ph: lastHeight / initialHeight,
          ox: rect.left,
          oy: rect.top
        });
      } else {
        this.setPosition({
          pw: 1,
          ph: 1,
          w: lastWidth,
          h: lastHeight
        });
      }
      if (!addedDrag) {
        this.animator.classList.add("scale");
        addedDrag = true;
      }
    });
    if (lastWidth && lastHeight) {
      this.setPosition({
        pw: 1,
        ph: 1,
        w: lastWidth,
        h: lastHeight
      });
    }
    addedDrag && this.animator.classList.remove("scale");
  }
  setPosition({
    x,
    y,
    w,
    h,
    pw,
    ph,
    ox,
    oy
  }: {
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    pw?: number;
    ph?: number;
    ox?: number;
    oy?: number;
  } = {}) {
    x && this.window.style.setProperty("--x", x + "px");
    y && this.window.style.setProperty("--y", y + "px");
    w && this.window.style.setProperty("--w", w + "px");
    h && this.window.style.setProperty("--h", h + "px");
    pw && this.animator.style.setProperty("--progress-w", "" + pw);
    ph && this.animator.style.setProperty("--progress-h", "" + ph);
    ox && this.animator.style.setProperty("--origin-x", ox + "px");
    oy && this.animator.style.setProperty("--origin-y", oy + "px");
    this._rect = this.window.getBoundingClientRect();
  }
}
