class OverworldInteractionScene extends Phaser.Scene{
	constructor() {
		super({key: "OverworldInteractionScene"}); // call the mother with the class key as parameter
	}

	init(data)
	{
		console.log('init', data);
		this.text = data.text;
	}


	preload() {
	}

	create() {
		console.log(this.text);

	
		this.dialog = new Dialog(this, 250, 420, 'textbox', 75, true);

		this.dialog.openBoxWithTree(this.text, () => {this.closeScene()});
		//this.dialog.openBoxWithTree([{text: "sdfsfdsdfsfsadfsdfsdfsdfsdfsdfsaf\ndsdfsafdsdfsdfsadfsadsdfsdf"}]);
		//this.dialog.openBoxWithSingle("dsfsafdsadfsdfsadfw");


		this.input.keyboard.on('keydown', (event) => {
			/*this.scene.pause();
			this.scene.resume("OverworldMapScene");*/
			if (event.keyCode == hotkeys.confirm.keyCode)
				this.dialog.next();
		});
	}

	update() {

	}

	closeScene() {
		this.dialog.destroy();
		this.dialog = null;
		
		this.scene.stop();
		this.scene.resume("OverworldMapScene");
	}
}