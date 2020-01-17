import * as util from "./utils";
import { Window } from "./Window";
import { Settings } from "./apps/Settings";
import { AppList } from "./apps/AppList";
import { WindowManager } from "./WindowManager";
import { settings } from "./settings";
import { Calculator } from "./apps/Calculator";

if ("PointerEvent" in window) {
} else {
    //@ts-ignore
    import("pepjs");
}

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
fullscreenFix.setAttribute("touch-action", "none");

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

let addwindow = document.createElement("button");
addwindow.appendChild(document.createTextNode("Add Window"));
fullscreenFix.appendChild(addwindow);

export const wm = new WindowManager();

// for (let i = 0; i < 10; i++) {
//   let window = new Window();
//   wm.addWindow(window);
// }
// wm.addWindow(new BrowserWindow());
new Settings(wm);

new AppList(wm, [
    {
        type: "App",
        name: "GitHub",
        icon:
            "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
        description: "my github page.",
        url: "https://github.com/pfgithub",
    },
    { type: "Header", title: "Projects", subtitle: "" },
    {
        type: "App",
        name: "ScPL",
        icon: "https://scpl.dev/assets/favicon/apple-touch-icon.png",
        description:
            "programming language that compiles to the iOS Visual Scripting tool, Shortcuts.",
        url: "https://scpl.dev",
    },
    {
        type: "App",
        name: "interpunctbot",
        icon:
            "https://cdn.discordapp.com/avatars/433078185555656705/bcc3d8799adc00afd50b9c3168b4743e.png?size=128",
        description:
            "a discord bot that does a few things like adding spaces to channel names and letting mods rank people with emojis. a new version, ipv3, is currently being worked on that will improve the user experience and add a few new features.",
        url: "https://interpunct.info",
    },
    { type: "Header", title: "Other Things", subtitle: "" },
    {
        type: "App",
        name: "electron-music-player",
        icon:
            "https://raw.githubusercontent.com/pfgithub/electron-music-player/master/.github/demo-2019-06-30_21-51.png",
        description:
            "a simple, lightweight* music player that shows lyrics of the current song (* as lightweight as an electron project can be, which is not very)",
        url: "https://github.com/pfgithub/electron-music-player",
    },
    {
        type: "App",
        name: "sitepages",
        icon:
            "https://raw.githubusercontent.com/pfgithub/electron-music-player/master/.github/demo-2019-06-30_21-51.png",
        description:
            "quickly hacked together interfaces to quickly hacked together javascript code.",
        url: "https://pfg.pw/sitepages",
    },
]);

fullscreenFix.appendChild(wm.node);
document.body.appendChild(fullscreenFix);

Calculator(wm);

addwindow.addEventListener("click", () => {
    new Settings(wm);
});
