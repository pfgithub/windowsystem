import * as util from "./utils.js";
import { Window } from "./Window.js";

util.addStylesheet(util.css`
.browser{
	border: none;
	width: 100%;
	height: 100%;
	overflow: scroll;
}
`);

export class BrowserWindow extends Window {
  constructor() {
    super();
    this.fullscreenBtn = document.createElement("button");
    this.fullscreenBtn.appendChild(document.createTextNode("Fullscreen"));
    this.fullscreenBtn.addEventListener("click", e => {
      util.requestFullscreen(this.body);
    });
    this.body.appendChild(this.fullscreenBtn);

    this.inputelem = document.createElement("input");
    this.body.appendChild(this.inputelem);
  }
}
