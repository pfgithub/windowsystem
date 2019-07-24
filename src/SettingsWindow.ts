import * as util from "./utils";
import { settings } from "./settings";
import { Window } from "./Window";

const $scss = util.css;

util.addStylesheet($scss`
	
`);

export class SettingsWindow extends Window {
  settingsPane: HTMLDivElement;
  dragAboveButton: HTMLButtonElement;
  dragBelowButton: HTMLButtonElement;
  constructor() {
    super();
    this.settingsPane = document.createElement("div");
    this.settingsPane.classList.add("settings");

    this.dragAboveButton = document.createElement("button");
    this.dragAboveButton.appendChild(document.createTextNode("Drag Above"));
    this.settingsPane.appendChild(this.dragAboveButton);
    this.dragAboveButton.addEventListener(
      "click",
      () => (settings.uiStyle = "dragabove")
    );

    this.dragBelowButton = document.createElement("button");
    this.settingsPane.appendChild(this.dragBelowButton);
    this.dragBelowButton.appendChild(document.createTextNode("Drag Below"));
    this.dragBelowButton.addEventListener(
      "click",
      () => (settings.uiStyle = "dragbelow")
    );

    this.body.appendChild(this.settingsPane);
  }
}
