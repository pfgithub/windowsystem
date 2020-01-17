import * as util from "./utils";
import { settings } from "./settings";
import { WindowManager } from "./WindowManager";

const $scss = util.css;

util.addStylesheet($scss`

:root{
    --border-width: 10px;
    --n-border-width: -10px;
}

.outerwindow{
    transform:
        translate( var(--x), var(--y) );
    top: 0;
    left: 0;
    width: var(--w);
    height: var(--h);

    position: relative;

    .window{
        display: grid;
        max-height: 100%;
        height: 100%;
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

    .border{
        position: absolute;
        &.ul{
            top: var(--n-border-width);
            left: var(--n-border-width);
            width: var(--border-width);
            height: var(--border-width);
            cursor: nwse-resize;
        }
        &.u{
            top: var(--n-border-width);
            left: 0;
            right: 0;
            height: var(--border-width);
            cursor: ns-resize;
        }
        &.ur{
            top: var(--n-border-width);
            right: var(--n-border-width);
            width: var(--border-width);
            height: var(--border-width);
            cursor: nesw-resize;
        }
        &.l{
            top: 0;
            bottom: 0;
            left: var(--n-border-width);
            width: var(--border-width);
            cursor: ew-resize;
        }
        &.r{
            top: 0;
            bottom: 0;
            right: var(--n-border-width);
            width: var(--border-width);
            cursor: ew-resize;
        }
        &.dl{
            bottom: var(--n-border-width);
            height: var(--border-width);
            left: var(--n-border-width);
            width: var(--border-width);
            cursor: nesw-resize;
        }
        &.d{
            bottom: var(--n-border-width);
            height: var(--border-width);
            left: 0;
            right: 0;
            cursor: ns-resize;
        }
        &.dr{
            bottom: var(--n-border-width);
            height: var(--border-width);
            right: var(--n-border-width);
            width: var(--border-width);
            cursor: nwse-resize;
        }
    }
}

.animator{
    opacity: 1.0;
    transition: 0.1s opacity;
    transform-origin: var(--origin-x) var(--origin-y);
    transform: scale(var(--progress-w), var(--progress-h));
    cursor: default;
    position:absolute; /*for z-index on ios safari*/

    max-height: 0;

    &.drag{
        cursor: move;
        opacity: 0.5;
    }
    &.scale{
        cursor: resize;
    }
    &.closing{
        transition: 0.1s transform ease-in, 0.1s opacity ease-in;
        transform: scale(0.8);
        opacity: 0;
        pointer-events: none;
    }
    &.opening{
        transition: 0.1s transform ease-in, 0.1s opacity ease-in;
        &.openinit{
            transform: scale(0.8);
            opacity: 0;
        }
    }
}

.titlebar{
    padding: 5px;
    cursor: inherit;
    -webkit-user-select: none;
    user-select: none;
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-columns: max-content;
    grid-auto-flow: column;
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
    }
}

`);

type WindowPosition = {
    x1: Readonly<number>;
    y1: Readonly<number>;
    x2: Readonly<number>;
    y2: Readonly<number>;
    resizing: boolean;
};

type ComputedWindowPosition = {
    x: number;
    y: number;
    w: number;
    h: number;
    pw: number;
    ph: number;
};

export class WindowState {
    setX1() {} // sets the window x1
    setX2() {} // sets the window x2
    calculate() {} // calculates new positioning based on changed values
}

let borderDirections = ["ul", "u", "ur", "l", "r", "dl", "d", "dr"] as const;
type BorderDirection = typeof borderDirections[number];

export class Window {
    node: HTMLDivElement;
    animator: HTMLDivElement;
    isDragging: boolean; // remove
    window: HTMLDivElement;
    titlebar: HTMLDivElement;
    body: HTMLDivElement;
    manager: WindowManager;
    _rect?: ClientRect | DOMRect;
    _computedPosition: ComputedWindowPosition;
    _computedBeforeResize: { w: number; h: number };
    _pos: WindowPosition;
    _onevent: { [key: string]: (() => void)[] };
    pins: { x1?: number; y1?: number; x2?: number; y2?: number };
    pointersDown: number[];
    borders: { [key in BorderDirection]: HTMLDivElement };
    contentwindow: HTMLDivElement;
    btnclose: HTMLButtonElement;
    titletext: HTMLSpanElement;
    isOpen: boolean;
    constructor(manager: WindowManager) {
        this.manager = manager;
        this._onevent = {};
        this.isOpen = false;

        this.animator = document.createElement("div");
        this.animator.classList.add("animator");

        this.isDragging = false;

        this.window = document.createElement("div");
        this.window.classList.add("outerwindow");

        this.contentwindow = document.createElement("div");
        this.contentwindow.classList.add("window");

        this.borders = {} as any;
        borderDirections.forEach(borderdir => {
            let border = document.createElement("div");
            border.classList.add("border");
            border.classList.add(borderdir);
            this.window.appendChild(border);
            this.borders[borderdir] = border;

            border.addEventListener("pointerdown", e => {
                this.bringToFront();
                this.pinnedDrag(borderdir, e);
            });
        });

        this.pins = {};
        this.pointersDown = [];
        this._pos = { x1: -1, y1: -1, x2: -1, y2: -1, resizing: true };
        this._computedPosition = { x: -1, y: -1, w: -1, h: -1, pw: -1, ph: -1 };
        this._computedBeforeResize = { w: -1, h: -1 };
        this.pos = {
            x1: 25,
            y1: 25,
            x2: 125,
            y2: 125,
            resizing: false,
        };

        this.titlebar = document.createElement("div");
        this.titlebar.classList.add("titlebar");

        this.titletext = document.createElement("span");
        this.titletext.classList.add("titletext");
        this.titlebar.appendChild(this.titletext);

        this.btnclose = document.createElement("button");
        this.btnclose.classList.add("btnclose");
        this.btnclose.appendChild(document.createTextNode("x"));
        this.titlebar.appendChild(this.btnclose);

        this.btnclose.addEventListener("pointerdown", e => e.stopPropagation());
        this.btnclose.addEventListener("click", e => {
            this.close();
        });

        this.contentwindow.appendChild(this.titlebar);

        this.body = document.createElement("div");
        this.body.classList.add("body");
        this.contentwindow.appendChild(this.body);
        this.window.appendChild(this.contentwindow);
        this.animator.appendChild(this.window);

        this.node = this.animator;

        this.titlebar.addEventListener("pointerdown", e => {
            this.pinnedDrag(4, e);
        }); // not capture because buttons
        this.window.addEventListener(
            "pointerdown",
            e => {
                this.bringToFront();
                if (e.pointerType === "mouse") {
                    if (e.altKey) {
                        if (util.getButton(e) === 1) {
                            return this.pinnedDrag(4, e);
                        }
                        if (util.getButton(e) === 2) {
                            return this.pinnedDrag(2, e);
                        }
                    }
                }
                // if touch down on titlebar, resize
                if (this.pointersDown.length >= 1) {
                    return this.pinnedDrag(2, e);
                }
            },
            { capture: true },
        );
    }
    bringToFront() {
        this.isOpen && this.manager.bringToFront(this);
    }
    open() {
        if (this.isOpen) throw new Error("already open");
        this.animator.classList.remove("closing");
        this.animator.classList.add("opening");
        this.animator.classList.add("openinit");
        this.manager.addWindow(this);
        window.requestAnimationFrame(() =>
            window.requestAnimationFrame(() =>
                this.animator.classList.remove("openinit"),
            ),
        );
        setTimeout(() => this.animator.classList.remove("opening"), 200);
        this.isOpen = true;
    }
    close() {
        if (!this.isOpen) throw new Error("already closed");
        this.animator.classList.add("closing");
        this.emit("close");
        setTimeout(() => this.manager.removeWindow(this), 200);
        this.isOpen = false;
    }
    on(ev: "close", cb: () => void) {
        if (!this._onevent[ev]) this._onevent[ev] = [];
        this._onevent[ev].push(cb);
    }
    emit(ev: "close") {
        this._onevent[ev] && this._onevent[ev].map(c => c());
    }
    // redo these:
    // drag event = move top left bottom right based on cursor pos
    // resize event = move bototm right based on cursor pos. two resizes at once = move multiple
    async pinnedDrag(pins: number | BorderDirection, e: PointerEvent) {
        e.preventDefault();
        e.stopPropagation();
        const rect = this.window.getBoundingClientRect();
        let oldX = e.clientX;
        let oldY = e.clientY;

        let leftDist = Math.abs(rect.left - e.clientX);
        let rightDist = Math.abs(rect.right - e.clientX);
        let topDist = Math.abs(rect.top - e.clientY);
        let bottomDist = Math.abs(rect.bottom - e.clientY);

        console.log(e.clientX, rect.width, e.clientY, rect.height);

        let expectedPins = {
            ...(e.clientX - rect.left < 0.33 * rect.width
                ? { x1: e.pointerId }
                : {}),
            ...(e.clientX - rect.left > 0.66 * rect.width
                ? { x2: e.pointerId }
                : {}),
            ...(e.clientY - rect.top < 0.33 * rect.height
                ? { y1: e.pointerId }
                : {}),
            ...(e.clientY - rect.top > 0.66 * rect.height
                ? { y2: e.pointerId }
                : {}),
        };

        if (Object.keys(expectedPins).length === 0) {
            expectedPins = {
                x1: e.pointerId,
                y1: e.pointerId,
                x2: e.pointerId,
                y2: e.pointerId,
            };
        }

        e.clientX - rect.left;

        if (typeof pins === "number") {
            this.pointersDown.length >= 1 || pins === 2
                ? (this.pins = {
                      ...this.pins,
                      ...expectedPins,
                  })
                : (this.pins = {
                      x1: e.pointerId,
                      y1: e.pointerId,
                      x2: e.pointerId,
                      y2: e.pointerId,
                  });
        } else {
            let has = (pn: string, l: string) =>
                pins.indexOf(l) > -1 ? { [pn]: e.pointerId } : {};
            this.pins = {
                ...has("x1", "l"),
                ...has("x2", "r"),
                ...has("y1", "u"),
                ...has("y2", "d"),
            };
        }
        this.pointersDown.push(e.pointerId);

        await util.startDragWatcher(
            e,
            (e: PointerEvent) => {
                this.pos = {
                    x1:
                        this.pos.x1 +
                        (this.pins.x1 === e.pointerId ? e.clientX - oldX : 0),
                    y1:
                        this.pos.y1 +
                        (this.pins.y1 === e.pointerId ? e.clientY - oldY : 0),
                    x2:
                        this.pos.x2 +
                        (this.pins.x2 === e.pointerId ? e.clientX - oldX : 0),
                    y2:
                        this.pos.y2 +
                        (this.pins.y2 === e.pointerId ? e.clientY - oldY : 0),
                    resizing: true,
                };
                oldX = e.clientX;
                oldY = e.clientY;
            },
            { trailing: settings.dragMode === "trailing" },
        );
        this.pointersDown = this.pointersDown.filter(id => id !== e.pointerId);
        let refillPointer: number | undefined = this.pointersDown[0];
        this.pins = {
            x1: this.pins.x1 === e.pointerId ? refillPointer : this.pins.x1,
            y1: this.pins.y1 === e.pointerId ? refillPointer : this.pins.y1,
            x2: this.pins.x2 === e.pointerId ? refillPointer : this.pins.x2,
            y2: this.pins.y2 === e.pointerId ? refillPointer : this.pins.y2,
        };
        this.pos = {
            ...this.pos,
            resizing:
                this.pointersDown.length > 0 &&
                !Object.values(this.pins).reduce((total, current) =>
                    total === current ? total : undefined,
                ),
        };
    }
    get rect() {
        return this._rect || this.window.getBoundingClientRect();
    }
    get pos(): Readonly<WindowPosition> {
        return this._pos;
    }
    set pos(newval: Readonly<WindowPosition>) {
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
        pos.pw !== old.pw &&
            this.animator.style.setProperty("--progress-w", "" + pos.pw);
        pos.ph !== old.ph &&
            this.animator.style.setProperty("--progress-h", "" + pos.ph);
        pos.x !== old.x &&
            this.animator.style.setProperty("--origin-x", pos.x + "px");
        pos.y !== old.y &&
            this.animator.style.setProperty("--origin-y", pos.y + "px");
        this._rect = this.window.getBoundingClientRect();
    }
    computePosition(): ComputedWindowPosition {
        let w = Math.max(this._pos.x2 - this._pos.x1, 100);
        let h = Math.max(this._pos.y2 - this._pos.y1, 100);
        if (!this.pos.resizing) {
            this._pos.x2 = this._pos.x1 + w;
            this._pos.y2 = this._pos.y1 + h;
        }
        if (!this.pos.resizing || settings.scaleMode === "dynamic") {
            this._computedBeforeResize = { w, h };
            return {
                x: this._pos.x1,
                y: this._pos.y1,
                w,
                h,
                pw: 1,
                ph: 1,
            };
        }
        return {
            x: this._pos.x1,
            y: this._pos.y1,
            w: this._computedBeforeResize.w,
            h: this._computedBeforeResize.h,
            pw: w / this._computedBeforeResize.w,
            ph: h / this._computedBeforeResize.h,
        };
    }
}
