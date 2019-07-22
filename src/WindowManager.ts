import * as util from "./utils";
import { Window } from "./Window";

const $scss = util.css;

util.addStylesheet($scss`
.windowlist{
	/*unfortunately, some fixes would be required to allow custom positioning on windowlist because mouse events must be on document*/
	position: absolute;
	top: 0;
	left: 0;
}
`);

export class WindowManager {
  windowlist: HTMLDivElement;
  node: HTMLDivElement;
  windows: Window[];
  zIndex: number;
  constructor() {
    this.windowlist = document.createElement("div");
    this.windowlist.classList.add("windowlist");
    this.node = this.windowlist;
    this.windows = [];
    this.zIndex = 0;
  }
  addWindow(window: Window) {
    this.windows.push(window);
    window.manager = this;

    window.node.style.zIndex = "" + this.zIndex++;
    this.windowlist.appendChild(window.node);
  }
  bringToFront(window: Window) {
    if (this.windows[this.windows.length - 1] === window) {
      return;
    }
    this.windows = this.windows.filter(w => w !== window);
    this.windows.push(window);

    window.node.style.zIndex = "" + this.zIndex++;

    // this.windowlist.appendChild(window.node);
  }
}
