import * as util from "../utils";
import { settings } from "../settings";
import { Window } from "../Window";
import { WindowManager } from "../WindowManager";

const $scss = util.css;

util.addStylesheet($scss`
.calculator {
	display: grid;
	grid-template-columns: [start] repeat(3, 1fr) [end];
	.output{
		grid-column: start / end;
	}
}
`);

function mkbtn(className: string, c: string) {
    let button = document.createElement("button");
    button.className = className + " btn";
    button.appendChild(document.createTextNode(c));
    return button;
}

export function Calculator(wm: WindowManager) {
    let w = new Window(wm);

    w.titletext.nodeValue = "Calculator";

    let btn1 = mkbtn("btn1", "1");
    let btn2 = mkbtn("btn2", "2");
    let btn3 = mkbtn("btn3", "3");
    let btn4 = mkbtn("btn4", "4");
    let btn5 = mkbtn("btn5", "5");
    let btn6 = mkbtn("btn6", "6");
    let btn7 = mkbtn("btn7", "7");
    let btn8 = mkbtn("btn8", "8");
    let btn9 = mkbtn("btn9", "9");

    let outputDisplay = document.createElement("div");
    let outputText = document.createTextNode("1+2=3");
    outputDisplay.appendChild(outputText);
    outputDisplay.classList.add("output");

    w.body.appendChild(outputDisplay);
    w.body.appendChild(btn7);
    w.body.appendChild(btn8);
    w.body.appendChild(btn9);
    w.body.appendChild(btn4);
    w.body.appendChild(btn5);
    w.body.appendChild(btn6);
    w.body.appendChild(btn1);
    w.body.appendChild(btn2);
    w.body.appendChild(btn3);
    w.body.classList.add("calculator");

    w.open();
}
