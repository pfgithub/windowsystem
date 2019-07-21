import * as util from "./utils.js";

util.addStylesheet(util.css`
	
`);

export class WindowManager {
  constructor() {
    this.windowlist = document.createElement("div");
    this.windowlist.classList.add("windowlist");
    this.node = this.windowlist;
    this.windows = [];
  }
  addWindow(window /*:window*/) {
    this.windows.push(window);
    window.manager = this;

    this.windowlist.appendChild(window.node);
  }
  bringToFront(window) {
    this.windows = this.windows.filter(w => w !== window);
    this.windows.push(window);

    this.windowlist.appendChild(window.node);
  }
}
