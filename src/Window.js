import * as util from "./utils.js";

util.addStylesheet(util.css`
/*css*/
    
.window{
    transform:
        translate( var(--x), var(--y) );
    top: 0;
    left: 0;
    width: var(--w);
    height: var(--h);

	position: absolute;
	display: grid;
	grid-template-rows: max-content 1fr;
    overflow: hidden;
    border-radius: 6px;
    box-shadow: 0px 10px 25px rgba(0,0,0,0.2);
}

.animator{
    transform: scale(1);
    opacity: 1.0;
    /* transition: 0.1s transform, 0.1s opacity; */
    transform-origin: var(--origin-x) var(--origin-y);
    cursor: default;
    width:100%;
    height:100%;
}
.animator.drag{
    transform: scale(1.05);
    opacity: 0.9;
    cursor: move;
}
.animator.scale{
    transform: scale(var(--progress-w), var(--progress-h));
    opacity: 0.9;
    cursor: resize;
}

.titlebar{
    background-color: rgba(255, 255, 255, 0.8);
    padding: 5px;
    cursor: inherit;
    -webkit-user-select: none;
    user-select: none;
}
.body{
    background-color: rgba(255, 255, 255, 1.0);
    padding: 5px;
}

/*css*/
`);

export class Window {
  // node: HTMLDivElement
  // titlebar: HTMLDivElement
  // manager?: WindowManager
  constructor() {
    this.animator = document.createElement("div");
    this.animator.classList.add("animator");

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
    this.body.appendChild(document.createTextNode("window body"));
    this.window.appendChild(this.body);
    this.animator.appendChild(this.window);

    this.node = this.animator;

    this.titlebar.addEventListener("mousedown", this.dragEvent.bind(this)); // not capture because buttons
    this.window.addEventListener(
      "mousedown",
      e => {
        this.bringToFront();
        if (e.altKey) {
          if (util.getButton(e) === 1) {
            this.dragEvent(e);
          }
          if (util.getButton(e) === 2) {
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
  async dragEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    const rect = this.window.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    let addedDrag = false;
    await util.startDragWatcher(util.getButton(e), e => {
      this.setPosition({
        x: e.clientX - offsetX,
        y: e.clientY - offsetY,
        ox: e.clientX,
        oy: e.clientY
      });
      if (!addedDrag) {
        this.animator.classList.add("drag");
        addedDrag = true;
      }
    });
    addedDrag && this.animator.classList.remove("drag");
  }
  async resizeEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    const rect = this.window.getBoundingClientRect();

    const initialX = e.clientX;
    const initialY = e.clientY;

    const initialWidth = rect.width;
    const initialHeight = rect.height;

    let lastWidth;
    let lastHeight;

    let addedDrag = false;
    await util.startDragWatcher(util.getButton(e), e => {
      lastWidth = e.clientX - initialX + initialWidth;
      lastHeight = e.clientY - initialY + initialHeight;
      this.setPosition({
        // w: e.clientX - initialX + initialWidth,
        // h: e.clientY - initialY + initialHeight,
        pw: lastWidth / initialWidth,
        ph: lastHeight / initialHeight,
        ox: rect.left,
        oy: rect.top
      });
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
  setPosition({ x, y, w, h, pw, ph, ox, oy, wox, woy } = {}) {
    x && this.window.style.setProperty("--x", x + "px");
    y && this.window.style.setProperty("--y", y + "px");
    w && this.window.style.setProperty("--w", w + "px");
    h && this.window.style.setProperty("--h", h + "px");
    pw && this.animator.style.setProperty("--progress-w", pw);
    ph && this.animator.style.setProperty("--progress-h", ph);
    ox && this.animator.style.setProperty("--origin-x", ox + "px");
    oy && this.animator.style.setProperty("--origin-y", oy + "px");
  }
}
