import * as util from "./utils";
import { Window } from "./Window";
import { BrowserWindow } from "./BrowserWindow";
import { WindowManager } from "./WindowManager";
import { settings } from "./settings";

const $scss = util.css;

util.addStylesheet($scss`
html {
  height: 100%;
  width:100%;
  overflow: hidden;
  touch-action: none;
}
body{   
    height: 100%;
    overflow: hidden;
    margin: 0;
    width:100%;
    touch-action: none;
}
.fullscreenfix {
    background-image: linear-gradient(to bottom right, #15d46f, #4f15d4);
    background-position: center;
    background-scale: 100%;
    overflow: hidden;
    height: 100%;
    width:100%;
    touch-action: none;
}	
`);

document.body.classList.add("ui");
document.body.setAttribute("uistyle", settings.uiStyle);

let fullscreenFix = document.createElement("div");
fullscreenFix.classList.add("fullscreenfix");

let enterFullscreen = document.createElement("button");
enterFullscreen.appendChild(document.createTextNode("Enter Fullscreen"));
enterFullscreen.addEventListener("click", () => {
  util.requestFullscreen(fullscreenFix);
});
fullscreenFix.appendChild(enterFullscreen);

let refresh = document.createElement("button");
refresh.appendChild(document.createTextNode("Refresh"));
refresh.addEventListener("click", () => {
  location.reload();
});
fullscreenFix.appendChild(refresh);

const wm = new WindowManager();

for (let i = 0; i < 10; i++) {
  let window = new Window();
  wm.addWindow(window);
}
wm.addWindow(new BrowserWindow());

fullscreenFix.appendChild(wm.node);
document.body.appendChild(fullscreenFix);
