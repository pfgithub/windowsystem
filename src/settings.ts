type UIStyle = "dragabove" | "dragbelow" | "fullscreen";

export class Settings {
  scaleMode: "fast" | "dynamic";
  private _uiStyle: UIStyle;
  constructor() {
    this.scaleMode = "dynamic";
    this._uiStyle = "dragabove";
    this.uiStyle = "dragabove";
    // ability to watch settings and see when they change
  }
  set uiStyle(newStyle: UIStyle) {
    this._uiStyle = newStyle;
    document.body.setAttribute("uistyle", this.uiStyle);
  }
  get uiStyle() {
    return this._uiStyle;
  }
}

export const settings = new Settings();
