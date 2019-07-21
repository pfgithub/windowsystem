export class Settings {
  readonly scaleMode: "fast" | "dynamic";
  readonly uiStyle: "dragabove" | "dragbelow" | "fullscreen";
  constructor() {
    this.scaleMode = "fast";
    this.uiStyle = "dragabove";
    // ability to watch settings and see when they change
  }
}

export const settings = new Settings();
