type UIStyle = "dragabove" | "dragbelow" | "fullscreen";
type RemovalHandler = () => void;

export type SettingsEvent = "scaleMode" | "uiStyle" | "dragMode";

export class Settings {
    private _scaleMode!: "fast" | "dynamic";
    private _uiStyle!: UIStyle;
    private _watchers: { [key: string]: (() => void)[] };
    private _dragMode!: "trailing" | "full";
    constructor() {
        this._watchers = {};
        this.scaleMode = "dynamic";
        this.uiStyle = "dragabove";
        this.dragMode = "trailing";
        // ability to watch settings and see when they change
    }
    set uiStyle(newStyle: UIStyle) {
        this._uiStyle = newStyle;
        document.body.setAttribute("uistyle", this._uiStyle);
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
    set dragMode(newDragMode: "trailing" | "full") {
        this._dragMode = newDragMode;
        document.body.setAttribute("dragmode", this._dragMode);
        this.emit("dragMode");
    }
    get dragMode() {
        return this._dragMode;
    }
    emit(event: SettingsEvent) {
        this._watchers[event] && this._watchers[event].forEach(q => q());
    }
    watch(item: SettingsEvent, cb: () => void): RemovalHandler {
        if (!this._watchers[item]) this._watchers[item] = [];
        this._watchers[item].push(cb);
        return () =>
            (this._watchers[item] = this._watchers[item].filter(
                it => it !== cb,
            ));
    }
}

export const settings = new Settings();
