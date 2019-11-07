export default function TodoApp(){
	const app = new App();
	const mainWindow = app.createWindow("Todo"	)
	app.on("shouldOpenNewWindow", () => {
		// called when the app is expected to open a new window (for example, clicking the app in the app menu while it is already open)
	})
	const vbox = ui.VBox();
	mainWindow.layout.add(vbox);
	
}