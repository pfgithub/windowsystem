import * as util from "../utils";
import { settings } from "../settings";
import { Window } from "../Window";
import { WindowManager } from "../WindowManager";

const $scss = util.css;

util.addStylesheet($scss`

`);

export class Settings {
    window: Window;

    settingsPane: HTMLDivElement;
    dragModeSelect: HTMLSelectElement;
    buttonStyleSelect: HTMLElement;
    scaleDynamicButton: HTMLButtonElement;
    scaleFastButton: HTMLButtonElement;
    removalHandlers: (() => void)[];
    constructor(wm: WindowManager) {
        this.window = new Window(wm);

        this.removalHandlers = [];

        this.window.titletext.appendChild(document.createTextNode("Settings"));
        this.settingsPane = document.createElement("div");
        this.settingsPane.classList.add("settings");

        this.dragModeSelect = document.createElement("select");
        this.settingsPane.appendChild(this.dragModeSelect);

        {
            (["dragabove", "dragbelow"] as const).map(it => {
                let option = document.createElement("option");
                option.value = it;
                option.appendChild(document.createTextNode(it));
                this.dragModeSelect.appendChild(option);
            });
            this.dragModeSelect.addEventListener("input", () => {
                settings.uiStyle = this.dragModeSelect.value as any;
            });
            let onch = () => {
                this.dragModeSelect.value = settings.uiStyle;
            };
            onch();
            this.removalHandlers.push(settings.watch("uiStyle", onch));
        }
        this.buttonStyleSelect = document.createElement("select");
        this.settingsPane.appendChild(this.buttonStyleSelect);
        {
            (["1", "2"] as const).map(it => {
                let option = document.createElement("option");
                option.value = it;
                option.appendChild(document.createTextNode(it));
                this.buttonStyleSelect.appendChild(option);
            });
            this.buttonStyleSelect.addEventListener("input", () => {
                settings.buttonStyle = this.buttonStyleSelect.value as any;
            });
            let onch = () => {
                this.buttonStyleSelect.value = settings.buttonStyle;
            };
            onch();
            this.removalHandlers.push(settings.watch("buttonStyle", onch));
        }

        this.scaleDynamicButton = document.createElement("button");
        this.scaleDynamicButton.appendChild(
            document.createTextNode("Scale Dynamic"),
        );
        this.settingsPane.appendChild(this.scaleDynamicButton);
        this.scaleDynamicButton.addEventListener(
            "click",
            () => (settings.scaleMode = "dynamic"),
        );

        this.scaleFastButton = document.createElement("button");
        this.settingsPane.appendChild(this.scaleFastButton);
        this.scaleFastButton.appendChild(document.createTextNode("Scale Fast"));
        this.scaleFastButton.addEventListener(
            "click",
            () => (settings.scaleMode = "fast"),
        );

        let testbtn = document.createElement("button");
        this.settingsPane.appendChild(testbtn);
        testbtn.appendChild(document.createTextNode("Open new window"));
        testbtn.addEventListener("click", () => new Settings(wm));

        this.window.body.appendChild(this.settingsPane);

        this.window.open();
        this.window.on("close", () => this.onClose());
    }

    onClose() {
        // nothing to do
        this.removalHandlers.forEach(rh => rh());
    }
}
