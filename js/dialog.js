class Dialog {

	constructor(scene, x, y, image, delay = 150, context = false) {
		this.scene = scene;

		this.textboxBG = new Phaser.GameObjects.Image(scene, x, y, image);
		this.text = new Phaser.GameObjects.Text(scene, x+35, y+35, "Test", { fontSize: '18px', fill: '#000' });

		this.textboxBG.setDepth(10);
		this.textboxBG.setOrigin(0, 0);
		this.textboxBG.setScale(0.5);
		this.textboxBG.setScrollFactor(0, 0);
		this.textboxBG.setVisible(false);


		
		this.text.font = "Arial";
		this.text.setDepth(11);
		this.text.setOrigin(0, 0);
		this.text.setScrollFactor(0, 0);
		this.text.setVisible(false);
		this.text.setWordWrapWidth(Math.round(((this.textboxBG.width / 2) - 60)), true);


		this.delay = delay; // Text speed
		this.type = null; // Single or Tree TODO: braucht man?

		this.active = false; // active or not TODO: braucht man?
		this.activeAnimation = false; // text-animation is active or not
		this.dialog = null; // Array of the splitted letters for animation TODO: andere name
		this.eventCounter = 0; // Array index for the next letter.
		this.fullText = null; // Full text that is current splitted and animated
		this.timedEvent = null; // time event for animation

		this.closeCallback = () => {};

		this.callback = null; // callback
		this.oneTime = false; // one time or not

		this.contextOpen = false;
		this.addContext();
		
		this.fullDialog = null; // complete Dialog (single/tree)
		this.currentTreeposition = 0; // index of the Text-Tree array

		scene.add.existing(this.textboxBG);
		scene.add.existing(this.text);
	}

	// TODO: container?
	addContext() {
		let graphics = new Phaser.GameObjects.Graphics(this.scene);
		graphics.setDepth(10);
		graphics.setScrollFactor(0, 0);
		graphics.fillStyle(0xffffff);
		graphics.fillRect(376, 300, 100, 100);

		graphics.setVisible(false);

		let chooseTxt = new Phaser.GameObjects.Text(this.scene, 420, 304, '', { fontSize: '16px', fill: '#000' });
		chooseTxt.setDepth(11);
		chooseTxt.setScrollFactor(0, 0);
		
		chooseTxt.setVisible(false);

		let chooseCursor = new Phaser.GameObjects.Text(this.scene, 400, 304, '*', { fontSize: '16px', fill: '#000' });
		chooseCursor.setDepth(11);
		chooseCursor.setScrollFactor(0, 0);

		chooseCursor.setVisible(false);

		
		
		this.context = {
			background: graphics,
			text: chooseTxt,
			cursor: chooseCursor
		};
		this.scene.add.existing(graphics);
		this.scene.add.existing(chooseTxt);
		this.scene.add.existing(chooseCursor);
	}

	openContext() {
		this.context.background.setVisible(true);
		this.context.text.setVisible(true);
		this.context.cursor.setVisible(true);
		this.contextOpen = true;
	}

	closeContext() {
		this.context.background.setVisible(false);
		this.context.text.setVisible(false);
		this.context.cursor.setVisible(false);
		this.contextOpen = false;
	}


	openBox(text = "", closeCallback = () => {}) {
		this.active = true;
		this.fullDialog = text;
		this.currentTreeposition = 0;
		this.closeCallback = closeCallback;

		this.textboxBG.setVisible(true);
		this.text.setVisible(true);

		this.text.setText(text);
	}

	closeBox() {
		this.active = false;
		this.fullDialog = null;
		this.currentTreeposition = 0;
		this.dialog = null;
		this.eventCounter = 0;
		this.fullText = null;
		this.timedEvent = null;
		this.type = null;

		this.textboxBG.setVisible(false);
		this.text.setVisible(false);
		this.text.setText("");

		this.closeCallback();
		this.closeCallback = () => {};
	}

	openBoxWithTree(textTree, closeCallback = () => {}) {
		this.openBox("", closeCallback);

		this.setTextWithTree(textTree);
	}


	setTextWithTree(textTree) {
		this.fullDialog = textTree;
		this.type = "tree";

		this._settingText(textTree[this.currentTreeposition].text);
	}

	openBoxWithSingle(text, closeCallback = () => {}, callback = null, oneTime = false) {
		this.openBox("", closeCallback);

		this.setSingleText(text, callback, oneTime);
	}

	setSingleText(text, callback = null, oneTime = false) {
		this.type = "single";

		if (callback)
			this.setCallback(callback, oneTime);

		this._settingText(text);

	}

	/*
	
	ZieL
	var story = [
		{ text: "Hi!" },
		{ text: "This is my new game." },
		{ question: "Do you like it?", answers: [
			{ choose: "yes", next: "like_yes" },
			{ choose: "no", next: "like_no" },
		] },
		{ label: "like_yes", m: "I am happy you like my game!", next: "like_end" },
		{ label: "like_no", m: "You made me sad!", next: "like_end" },
		{ label: "like_end" },
		{ m: "OK, let's change the topic" }
	];
	
	
	Derzeit:
	story = [
		{text: "Hi!"},
		{text: "This is my new game."},
		{question: "Do you like it?", answers: [
			{ choose: "yes", next: "like_yes" },
			{ choose: "no", next: "like_no"}
		]}
	];
	*/

	next() {
		if (this.activeAnimation)
			this.stopAnimate();
		else if (this.type == "single")
			this.closeBox();
		else if (this.type == "tree")
			this.nextText();
	}

	nextText() {
		this.currentTreeposition++;

		if (this.currentTreeposition >= this.fullDialog.length) {
			this.closeBox();
			return;
		}


		let text = this.fullDialog[this.currentTreeposition];

		if (text.question) {
			this._setQuestion(text);
		}
		else {
			this._settingText(text.text);
		}
	}

	_setQuestion(textObj) {
		//this.context.text
		
		let text = "";

		textObj.answers.forEach(element => {
			text += element.choose+ "\n";
		});

		this.context.text.setText(text);

		this.callback = () => { this.openContext(); };
		this.oneTime = true;

		this._settingText(textObj.question);
	}


	_settingText(text) {
		this.eventCounter = 0;
		this.fullText = text;
		this.dialog = text.split("");

		if (this.timedEvent) this.timedEvent.remove();

		this.text.setText("");
		this.activeAnimation = true;

		this.timedEvent = this.scene.time.addEvent({
			delay: this.delay,
			callback: this._animateText,
			callbackScope: this,
			loop: true,
		});
	}

	_animateText() {
		this.eventCounter++;
		this.text.setText(this.text.text + this.dialog[this.eventCounter - 1]);
		if (this.eventCounter === this.dialog.length) {
			this.timedEvent.remove();
			this.timedEvent = null;
			this.activeAnimation = false;

			if (this.callback)
				this.scene.time.delayedCall(150, () => {
					this.callback();

					if (this.oneTime) this.callback = null;
				});
		}
	}


	stopAnimate() {
		this.timedEvent.remove();
		this.timedEvent = null;
		this.activeAnimation = false;
		this.eventCounter = 0;

		this.text.setText(this.fullText);
	}

	setCallback(callback, oneTime = false) {
		this.callback = callback;
		this.oneTime = oneTime;
	}

	destroy() {
		this.text.destroy();
		this.text = null;
		this.textboxBG.destroy();
		this.textboxBG = null;
		this.scene = null;
		if (this.timedEvent)
			this.timedEvent.remove();
		this.timedEvent = null;

		this.delay = null;
		this.type = null;

		this.active = null;
		this.activeAnimation = null;
		this.dialog = null;
		this.eventCounter = null;
		this.fullText = null;

		this.closeCallback = null;

		this.context = null; // TODO: deleten

		this.callback = null;
		this.oneTime = null;

		
		this.fullDialog = null;
		this.currentTreeposition = null;
	}


}