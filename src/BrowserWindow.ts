import * as util from "./utils";
import { Window } from "./Window";

const $scss = util.css;

util.addStylesheet($scss`
.browser{
	border: none;
	width: 100%;
	height: 100%;
	overflow: scroll;
}
`);

export class BrowserWindow extends Window {
  fullscreenBtn: HTMLButtonElement;
  inputelem: HTMLInputElement;
  constructor() {
    super();
    this.fullscreenBtn = document.createElement("button");
    this.fullscreenBtn.appendChild(document.createTextNode("Fullscreen"));
    this.fullscreenBtn.addEventListener("click", () => {
      util.requestFullscreen(this.body);
    });
    this.body.appendChild(this.fullscreenBtn);

    this.inputelem = document.createElement("input");
    this.body.appendChild(this.inputelem);
  }
}
