import * as util from "./utils.js";
import { Window } from "./Window.js";
import { WindowManager } from "./WindowManager.js";

util.addStylesheet(util.css`
html {
  height: 100%;
}
body {
  background-image: linear-gradient(to bottom right, #15d46f, #4f15d4);
  background-position: center;
  background-scale: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
}	
`);

const wm = new WindowManager();

for (let i = 0; i < 10; i++) {
  let window = new Window();
  wm.addWindow(window);
}

document.body.appendChild(wm.node);
