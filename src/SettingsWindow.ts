import * as util from "./utils";
import { Window } from "./Window";

const $scss = util.css;

util.addStylesheet($scss`
	
`);

export class SettingsWindow extends Window {
  settingsPane: HTMLDivElement;
  constructor() {
    super();
    this.settingsPane = document.createElement("div");
    this.settingsPane.classList.add("settings");

    this.body.appendChild(this.settingsPane);
  }
}
