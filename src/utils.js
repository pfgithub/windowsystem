window.addEventListener("contextmenu", e => e.preventDefault());

export function css(text) {
  return "" + text;
}

export function addStylesheet(css /*:string*/) {
  const style = document.createElement("style");
  style.type = "text/css";
  style.appendChild(document.createTextNode(css));

  document.head.appendChild(style);
}

export function getButton(e) {
  return [1, 4, 2, 8, 16][e.button];
}

export function startDragWatcher(
  button,
  cb /*: e => void*/
) /*: Promise<e: mouseupevent>*/ {
  return new Promise(resolve => {
    let moveListener = e => {
      if (!(e.buttons & button)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      cb(e);
    };
    window.addEventListener("mousemove", moveListener, { capture: true });
    let stopListener = e => {
      if (e.buttons & button) {
        // button will be excluded on a mouseup
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      window.removeEventListener("mousemove", moveListener, {
        capture: true
      });
      window.removeEventListener("mouseup", stopListener, {
        capture: true
      });
      resolve(e);
    };
    window.addEventListener("mouseup", stopListener, { capture: true });
  });
}
