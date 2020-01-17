import * as util from "../utils";
import { settings } from "../settings";
import { Window } from "../Window";
import { WindowManager } from "../WindowManager";

const $scss = util.css;

util.addStylesheet($scss`
@font-face {
	font-family: 'icons';
	src: url('/font/icons.eot?23213982');
	src: url('/font/icons.eot?23213982#iefix') format('embedded-opentype'),
		url('/font/icons.woff2?23213982') format('woff2'),
		url('/font/icons.woff?23213982') format('woff'),
		url('/font/icons.ttf?23213982') format('truetype'),
		url('/font/icons.svg?23213982#icons') format('svg');
	font-weight: normal;
	font-style: normal;
}

.appgrid{
	display: grid;
	grid-template-columns: [left] 80px [minusleftmost] repeat(auto-fill, 80px) [right];
	grid-gap: 10px;
	padding: 10px;
	height:calc(100% - 20px);
	overflow-y: scroll;
	& .appgridheader{
		grid-column: left / right;
		font-family: sans-serif;
		& h1{
			display: inline-block;
			font-size: 2em;
			margin: 0;
		}
		& h2{
			display: inline-block;
			font-variant: small-caps;
			opacity: 0.6;
			font-size: 1em;
			margin: 0;
		}
	}
	& .appgridapp{
		& img{
			width: 100%;
			object-fit:center;
			border-radius: 15px;
		}
		& span{
			text-align: center;
			width:100%;
			display:block; /*great job 10/10*/
		}
	}
	& .appgriddetails{
		margin: 0;
		grid-column: minusleftmost / right;
	}
	&.icons .appgriddetails{
		display: none;
	}
	& .appgridsortmode{
		grid-column: left / right;
		grid-template-columns: repeat(auto-fill, 45px);
		display: grid;
		& button{

			font-family: 'icons';
		}
	}
	&.details .appgridsortmode button.icons{
		border: transparent;
	}
	&.icons .appgridsortmode button.details{
		border: transparent;
	}
}

`);

type Header = { title: string; subtitle: string };
type App = { name: string; description: string; icon: string; url: string };
type AppListItem = ({ type: "App" } & App) | ({ type: "Header" } & Header);

function createButton(app: App): Node[] {
    let container = document.createElement("a");
    container.addEventListener("contextmenu", e => e.stopPropagation()); // unfortunately this will still show a context menu after a drag if the cursor is on a pin
    container.href = app.url;
    container.title = app.description;
    container.classList.add("appgridapp");
    let icon = document.createElement("img");
    icon.src = app.icon;
    container.appendChild(icon);
    let name = document.createElement("span");
    name.appendChild(document.createTextNode(app.name));
    container.appendChild(name);
    let details = document.createElement("p");
    details.classList.add("appgriddetails");
    details.appendChild(document.createTextNode(app.description)); // maybe show and hide this based on DisplayMode
    return [container, details];
}

function createHeader(header: Header): Node[] {
    let container = document.createElement("div");
    container.classList.add("appgridheader");
    let title = document.createElement("h1");
    let subtitle = document.createElement("h2");
    title.appendChild(document.createTextNode(header.title));
    subtitle.appendChild(document.createTextNode(header.subtitle));
    container.appendChild(title);
    container.appendChild(document.createTextNode(" "));
    container.appendChild(subtitle);
    return [container];
}

function createAppGridItem(app: AppListItem): Node[] {
    if (app.type === "App") {
        return createButton(app);
    } else if (app.type === "Header") {
        return createHeader(app);
    }
    throw new Error(
        "Invalid App Grid Item Type " +
            (app as { type: "something went wrong" }).type,
    );
}

function displayModeHeader(
    defaultMode: "details" | "icons",
    setDetails: () => void,
    setIcons: () => void,
): Node[] {
    let container = document.createElement("div");
    container.classList.add("appgridsortmode");
    container.setAttribute("aria-hidden", "true");
    let detailsButton = document.createElement("button");
    detailsButton.classList.add("details");
    let iconsButton = document.createElement("button");
    iconsButton.classList.add("icons");
    detailsButton.addEventListener("click", () => setDetails());
    iconsButton.addEventListener("click", () => setIcons());

    iconsButton.appendChild(document.createTextNode("\ue800")); // e8001 and e8003 are also available for large and small icons and details
    detailsButton.appendChild(document.createTextNode("\ue802"));

    container.appendChild(detailsButton);
    container.appendChild(iconsButton);
    if (defaultMode === "details") {
        setDetails();
    } else {
        setIcons();
    }
    return [container];
}

export class AppList {
    constructor(wm: WindowManager, appList: AppListItem[]) {
        let window = new Window(wm);

        window.titletext.appendChild(document.createTextNode("pfg.pw"));
        let appGrid = document.createElement("div");
        appGrid.classList.add("appgrid");

        displayModeHeader(
            "details",
            () => {
                appGrid.classList.add("details");
                appGrid.classList.remove("icons");
            },
            () => {
                appGrid.classList.remove("details");
                appGrid.classList.add("icons");
            },
        ).forEach(n => appGrid.appendChild(n));

        appList.forEach(app =>
            createAppGridItem(app).forEach(n => appGrid.appendChild(n)),
        );

        window.body.appendChild(appGrid);

        window.open();
    }
}
