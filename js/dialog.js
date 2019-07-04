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


        this.delay = delay;

        this.active = false;
        this.activeDialog = false;
        this.dialog = null;
        this.fullDialog = null;
        this.eventCounter = 0;
        this.timedEvent = null;



        this.callback = null;
        this.oneTime = false;

        
        this.fullText = [];
        this.currentText = 0;

        scene.add.existing(this.textboxBG);
        scene.add.existing(this.text);
    }

    openBox(text = "") {
        this.active = true;
        this.fullText = text;
        this.currentText = 0;

        this.textboxBG.setVisible(true);
        this.text.setVisible(true);

        this.text.setText(text);
    }

    openBoxWithTree(textTree) {
        this.openBox();

        this.setTextWithTree(textTree);
    }


    setTextWithTree(textTree) {
        this.fullText = textTree;

        this._settingText(textTree[0].text);
    }

    setSingleText(text, callback = null, oneTime = false) {
        if (callback)
            this.setCallback(callback, oneTime);

        this._settingText(text);
    }

    _settingText(text) {
        this.eventCounter = 0;
        this.fullDialog = text;
        this.dialog = text.split("");

        if (this.timedEvent) this.timedEvent.remove();

        this.text.setText("");
        this.activeDialog = true;

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
            this.activeDialog = false;

            if (this.callback)
                this.scene.time.delayedCall(150, () => {
                    this.callback();

                    if (this.oneTime) this.callback = null;
                });
        }
    }



    setCallback(callback, oneTime = false) {
        this.callback = callback;
        this.oneTime = oneTime;
    }


}