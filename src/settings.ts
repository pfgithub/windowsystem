type UIStyle = "dragabove" | "dragbelow" | "fullscreen";
type RemovalHandler = () => void;

export class Settings {
    private _scaleMode!: "fast" | "dynamic";
    private _uiStyle!: UIStyle;
    private _watchers: { [key: string]: (() => void)[] };
    constructor() {
        this._watchers = {};
        this.scaleMode = "dynamic";
        this.uiStyle = "dragabove";
        // ability to watch settings and see when they change
    }
    set uiStyle(newStyle: UIStyle) {
        this._uiStyle = newStyle;
        document.body.setAttribute("uistyle", this.uiStyle);
        this.emit("uiStyle");
    }
    get uiStyle() {
        return this._uiStyle;
    }
    set scaleMode(newScaleMode: "fast" | "dynamic") {
        this._scaleMode = newScaleMode;
        this.emit("scaleMode");
    }
    get scaleMode() {
        return this._scaleMode;
    }
    emit(event: "scaleMode" | "uiStyle") {
        this._watchers[event] && this._watchers[event].forEach(q => q());
    }
    watch(item: "scaleMode" | "uiStyle", cb: () => void): RemovalHandler {
        if (!this._watchers[item]) this._watchers[item] = [];
        this._watchers[item].push(cb);
        return () =>
            (this._watchers[item] = this._watchers[item].filter(
                it => it !== cb,
            ));
    }
}

export const settings = new Settings();
