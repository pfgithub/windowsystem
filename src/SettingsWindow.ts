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
  scaleDynamicButton: HTMLButtonElement;
  scaleFastButton: HTMLButtonElement;
  constructor() {
    super();
    this.titletext.appendChild(document.createTextNode("Settings"));
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

    this.scaleDynamicButton = document.createElement("button");
    this.scaleDynamicButton.appendChild(
      document.createTextNode("Scale Dynamic")
    );
    this.settingsPane.appendChild(this.scaleDynamicButton);
    this.scaleDynamicButton.addEventListener(
      "click",
      () => (settings.scaleMode = "dynamic")
    );

    this.scaleFastButton = document.createElement("button");
    this.settingsPane.appendChild(this.scaleFastButton);
    this.scaleFastButton.appendChild(document.createTextNode("Scale Fast"));
    this.scaleFastButton.addEventListener(
      "click",
      () => (settings.scaleMode = "fast")
    );

    this.body.appendChild(this.settingsPane);
  }
}
