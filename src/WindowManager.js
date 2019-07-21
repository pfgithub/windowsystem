import * as util from "./utils.js";

util.addStylesheet(util.css`
.windowlist{
	/*unfortunately, some fixes would be required to allow custom positioning on windowlist because mouse events must be on document*/
	position: absolute;
	top: 0;
	left: 0;
}
`);

export class WindowManager {
  constructor() {
    this.windowlist = document.createElement("div");
    this.windowlist.classList.add("windowlist");
    this.node = this.windowlist;
    this.windows = [];
    this.zIndex = 0;
  }
  addWindow(window /*:window*/) {
    this.windows.push(window);
    window.manager = this;

    window.node.style.zIndex = this.zIndex++;
    this.windowlist.appendChild(window.node);
  }
  bringToFront(window) {
    if (this.windows[this.windows.length - 1] === window) {
      return;
    }
    this.windows = this.windows.filter(w => w !== window);
    this.windows.push(window);

    window.node.style.zIndex = this.zIndex++;

    // this.windowlist.appendChild(window.node);
  }
}
