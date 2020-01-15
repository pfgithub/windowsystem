# a window manager

One polyfill dependency, 1451 dev dependencies.

# TODO:

mouse: lmb on titlebar, then rmb while lmb to start resizing, then let go to return to dragging
alt+rmb support (not sure how to do this with pointer events, new clicks don't get registered as a click and don't get added to existing clicks.)

touch: ~~guess resize pos based on nearest wall, when one touchup return others to previous positions. support up to 4 fingers (3 because ios takes 4th)~~ guess resize direction based on position relative to other fingers. with 0 fingers, it makes sense for the next to do closest edge, but with 1 already it should be related to that finger's position relative to the other

in general, other than keyboard, events should be pretty similar. what if you have multiple mice

add back fast resize (while touching, update --pw instead of --w. once over, update --w. occasionally update --pw while resizing (maybe))

add momentum with requestanimationframe, linear from last two pos+times, per pin

# API Concepts

```
class AppBuilder extends App{
	mainWindow: Window;
	mainUI: UI;
	constructor(){
		this.mainWindow = WM.createWindow("AppBuilder");
		this.mainUI = UI.attach(mainWindow.body);
		let toolbar = new UI.Toolbar();
		toolbar.add
	}
}

function App(){
// dmf
return <Window>
<Titlebar></Titlebar>
<Body></Body>
</Window>
}


```

```
$scss`
a{}
b{}
`
$class`ul`
$class`li`

why $? it looks different
```
