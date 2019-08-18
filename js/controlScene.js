var controlScene = new Phaser.Class({
	Extends: Phaser.Scene,

	initialize:

	function controlScene()
	{
		Phaser.Scene.call(this, { key: 'controlScene' });
	},

	preload: function () {
	},

	init: function (data)
	{
		this.gameScene = data.gameScene;
	},

	create: function() {
		let background = this.add.image(400, 300, 'background').setScale(2);

		new GameButton(this, 800, 580, "Speichern", () => this.sceneClose());
		new GameButton(this, 150, 580, "Zurücksetzen", () => this.resetKeys());

		this.textBackground = this.add.graphics();
		this.arrHitbox = [];

		this.doupleKeyBG = this.add.graphics().setDepth(3);

		this.doupleKeyText = this.add.text(0, 0, "Taste wird bereits verwendet", { fontSize: '12px', fill: '#000' }).setDepth(4).setVisible(false);

		this.controlTextContainer = this.add.container(100, 100);

		this.buttonGenerator();

		this.keyChanged = false;
		this.focus = false;
		this.pressed = false;
		this.textTarget = null;
		this.objKey = null;

		this.input.keyboard.on('keydown', function (event) {
			if (this.scene.pressed || !this.scene.focus)
				return;

			this.scene.pressed = true;

			this.scene.changeKey(event);
		});
		
	},

	buttonGenerator: function() {
		let self = this;

		Object.keys(hotkeys).forEach(function(key) {
			//if (key == "version") TODO: entfernen
				//return;

			let row = Math.floor(self.controlTextContainer.length / 3);
			let col = self.controlTextContainer.list.length - (row * 3);

			let x = col * 250;
			let y = row * 70;
		

			let text = self.add.text(x, y, hotkeys[key].name, { fontSize: '14px', fill: '#000'}).setDepth(2);


			let width = 200;
			let height = text.height;


			let hitbox = self.add.zone(x+90, y+95, width+20, height+10).setInteractive().setOrigin(0, 0);
			hitbox.on('pointerdown', function() { this.scene.controlFocus(text, key); });
			self.arrHitbox.push(hitbox);


			self.textBackground.fillStyle(0x222222);
			self.textBackground.fillRect(x+90, y + 95, width + 20, height + 10);
			
		
			self.textBackground.fillStyle(0xeeeeee);
			self.textBackground.fillRect(x + 92, y + 97, width + 16, height + 6);


			self.controlTextContainer.add(text);


		});
	},

	controlFocus: function(target, key) {
		if (this.focus)
			return;
		let text = target.text.split(':');

		target.setText(`${text[0]}: ???`);

		this.textTarget = target;
		this.objKey = key;

		this.focus = true;
	},

	changeKey: function(event) {
		let douple = Object.keys(hotkeys).find(key => hotkeys[key].keyCode === event.keyCode);

		if (douple && douple != this.objKey) {

			this.doupleErrorGenerator();
			this.pressed = false;
			return;
		}

		let text = this.textTarget.text.split(':');

		let code = event.key;

		if (event.keyCode >= 65 && event.keyCode <= 90)
			code = code.toUpperCase();
		else if (event.keyCode >= 96 && event.keyCode <= 105)
			code = "Num" + code;
		else if (event.keyCode == 32)
			code = event.code;
		else if (event.keyCode == 186 || event.keyCode == 192 || event.keyCode == 222)
			code = code.toUpperCase();

		let text1 = `${text[0]}: ${code}`;
		hotkeys[this.objKey].name = text1;

		this.textTarget.setText(text1);


		hotkeys[this.objKey].keyCode = event.keyCode;


		this.doupleKeyBG.clear();
		this.doupleKeyText.setVisible(false);


		this.keyChanged = true;
		this.focus = false;
		this.pressed = false;
	},

	doupleErrorGenerator: function() {
		/* Position */
		let x = this.textTarget.x + 80;
		let height = this.textTarget.height + 15;
		let y = this.textTarget.y + 100 + height;

		/* Styles */
		this.doupleKeyBG.lineStyle(2, 0x000000, 1);
		this.doupleKeyBG.fillStyle(0xff2222, 1);

		/* Border */
		this.doupleKeyBG.strokeTriangle(x+109, y-1, x+120, y-11, x+131, y-1);
		this.doupleKeyBG.strokeRoundedRect(x-1, y-1, 242, 26, 11);

		/* Background */
		this.doupleKeyBG.fillRoundedRect(x, y, 240, 24, 10);
		this.doupleKeyBG.fillTriangle(x+110, y, x+120, y-10, x+130, y);
		
		/* Text */
		this.doupleKeyText.setVisible(true);
		this.doupleKeyText.setX(x+20);
		this.doupleKeyText.setY(y+6);
	},

	resetKeys: function() {
		/* Reset objects */
		this.doupleKeyBG.clear();
		this.doupleKeyText.setVisible(false);
		this.pressed = false;
		this.focus = false;

		/* Rest Hotkey object */
		hotkeys = {
			up: { name: "Rauf: W", keyCode: Phaser.Input.Keyboard.KeyCodes.W },
			down: { name: "Runter: S", keyCode: Phaser.Input.Keyboard.KeyCodes.S },
			left: { name: "Links: A", keyCode: Phaser.Input.Keyboard.KeyCodes.A },
			right: { name: "Rechts: D", keyCode: Phaser.Input.Keyboard.KeyCodes.D },
			atk1: { name: "Angriff 1: 1", keyCode: Phaser.Input.Keyboard.KeyCodes.ONE },
			atk2: { name: "Angriff 2: 2", keyCode: Phaser.Input.Keyboard.KeyCodes.TWO },
			atk3: { name: "Angriff 3: 3", keyCode: Phaser.Input.Keyboard.KeyCodes.THREE },
			atk4: { name: "Angriff 4: 4", keyCode: Phaser.Input.Keyboard.KeyCodes.FOUR },
			nothing: { name: "Nichts tun: 5", keyCode: Phaser.Input.Keyboard.KeyCodes.FIVE },
			flee: { name: "Flucht: 6", keyCode: Phaser.Input.Keyboard.KeyCodes.SIX },
			confirm: { name: "Bestätigen/Weiter: E", keyCode: Phaser.Input.Keyboard.KeyCodes.E },
			back: { name: "Zurück: Q", keyCode: Phaser.Input.Keyboard.KeyCodes.Q },
			nextTab: { name: "Nächster Tab: ArrowRight", keyCode: Phaser.Input.Keyboard.KeyCodes.RIGHT },
			previousTab: { name: "Vorheriger Tab: ArrowLeft", keyCode: Phaser.Input.Keyboard.KeyCodes.LEFT },
			talents: { name: "Talente: T", keyCode: Phaser.Input.Keyboard.KeyCodes.T },
			character: {name: "Charakter: C", keyCode: Phaser.Input.Keyboard.KeyCodes.C },
			control: {name: "Steuerung: P", keyCode: Phaser.Input.Keyboard.KeyCodes.P}
		};

		/* Remove & Renew entries */
		this.textBackground.clear();
		this.controlTextContainer.removeAll(true);
		this.buttonGenerator();
	},

	export: function() {
		var blob = new Blob([JSON.stringify(hotkeys)], {type: "text/json"});


		var a = document.createElement("a");
		document.body.appendChild(a);
		a.style = "display: none";

		var link = window.URL.createObjectURL(blob);

		a.href = link;
		a.download = "test.json";
		a.click();

		window.URL.revokeObjectURL(link);
		a.parentNode.removeChild(a);

	},

	sceneClose: function() {
		this.scene.pause();

		if (!this.gameScene)
			this.scene.start('startMenu');
		else
		{
			this.scene.setVisible(false);
			this.scene.resume('OverworldMapScene', "keyChanged");
		}
	},
});