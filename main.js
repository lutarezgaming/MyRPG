const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu} = electron;

let win;

function createWindow() {
	win = new BrowserWindow({icon: __dirname+"/assets/icons/icon.ico", title: "Test RPG"});
	win.maximize();
	
	// TODO: Menu?
	//win.setMenu(null);
	
	win.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));
	
	win.on('closed', () => {
		win = null;
	});
	
	win.webContents.openDevTools();
	
	
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);
}

const mainMenuTemplate = [{
		label: 'Dev',
		submenu: [{
				label: 'Toggle DevTools',
				accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
				click(item, focusedWindow) {
					focusedWindow.toggleDevTools();
				}
		},
		{role: 'reload'},
		{
			label: 'Exit',
			accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Alt+F4',
			click() {
				app.quit();
			}
	}]
}];

// If mac, add empty object to menu
if (process.platform == 'darwin') {
	mainMenuTemplate.unshift({label: 'MyRPG'});
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});