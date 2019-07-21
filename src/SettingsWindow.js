import * as util from "./utils.js";
import {Window} from "./Window.js";

util.addStylesheet(util.css`
	
`);

export class SettingsWindow extends Window {
	constructor(){
		super();
		this.settingsPane = document.createElement("div");
		this.settingsPane.classList.add("settings");
		
		this.body.appendChild(settingsPane);
	}
}