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

export function requestFullscreen(node /*: HTMLElement*/) {
  try {
    node.requestFullscreen();
  } catch (e) {
    try {
      node.webkitRequestFullScreen();
    } catch (e) {
      alert("Fullscreen not available.");
    }
  }
}

export function getButton(e) {
  return [1, 4, 2, 8, 16][e.button];
}

export function startDragWatcher(
  startEvent,
  cb /*: e => void*/
) /*: Promise<e: mouseupevent>*/ {
  return new Promise(resolve => {
    let moveListener = e => {
      if (e.pointerId !== startEvent.pointerId) {
        return;
      }
      if (e.pointerType === "mouse" && !(e.buttons & getButton(startEvent))) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      cb(e);
    };
    window.addEventListener("pointermove", moveListener, { capture: true });
    let stopListener = e => {
      if (e.pointerId !== startEvent.pointerId) {
        return;
      }
      if (e.pointerType === "mouse" && e.buttons & getButton(startEvent)) {
        // button will be excluded on a mouseup
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      window.removeEventListener("pointermove", moveListener, {
        capture: true
      });
      window.removeEventListener("pointerup", stopListener, {
        capture: true
      });
      resolve(e);
    };
    window.addEventListener("pointerup", stopListener, { capture: true });
  });
}
