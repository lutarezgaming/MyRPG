// TODO: neuschreiben
class Dialog {

    constructor (scene, x, y, image, delay = 150, context = false)
    {
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

        
        this.fullText = [];
        this.currentText = 0;



        this.context = this.context;



        
        this.subDialog = false;
        this.currentSubText = 0;
        this.activeContext = false;


        this.chooseMax = 1;
        this.chooseCurrent = 0;
        this.choosePosition = 304;

        if (context) {
            this.addContext();
        }





        scene.add.existing(this.textboxBG);
        scene.add.existing(this.text);
    }

    addContext() {
        this.graphics = new Phaser.GameObjects.Graphics(this.scene);
        this.graphics.setDepth(10);
        this.graphics.setScrollFactor(0, 0);
        this.graphics.fillStyle(0xffffff);
        this.graphics.fillRect(376, 300, 100, 100);

        this.graphics.setVisible(false);

        this.choose = new Phaser.GameObjects.Text(this.scene, 420, 304, 'Ja\nNein', { fontSize: '16px', fill: '#000' });
        this.choose.setDepth(10);
        this.choose.setScrollFactor(0, 0);
        
        this.choose.setVisible(false);

        this.chooseCursor = new Phaser.GameObjects.Text(this.scene, 400, 304, '*', { fontSize: '16px', fill: '#000' });
        this.chooseCursor.setDepth(10);
        this.chooseCursor.setScrollFactor(0, 0);

        this.chooseCursor.setVisible(false);

        
        this.scene.add.existing(this.graphics);
        this.scene.add.existing(this.choose);
        this.scene.add.existing(this.chooseCursor);
    }


    // TODO: Old
    toggle() {
        this.active = !this.active;

        this.textboxBG.setVisible(this.active);
        this.text.setVisible(this.active);
    }

    open(text) {
        this.active = true;
        this.fullText = text;
        this.currentText = 0;
        this.currentSubText = 0;
        this.chooseCurrent = 0;

        this.textboxBG.setVisible(true);
        this.text.setVisible(true);

        this._setText('');
    }

    shutdown() {
        this.active = false;
        this.activeDialog = false;


        this.timedEvent.remove();
        this.textboxBG.setVisible(false);
        this.text.setVisible(false);

        if (this.activeContext) this.closeContext();
    }

    openContext() {
        this.subDialog = false;
        this.activeContext = true;

        this.graphics.setVisible(true);
        this.choose.setVisible(true);
        this.chooseCursor.setVisible(true);
    }

    closeContext() {
        this.activeContext = false;

        this.graphics.setVisible(false);
        this.choose.setVisible(false);
        this.chooseCursor.setVisible(false);
        this.chooseCursor.setY(this.choosePosition);
    }

    nextChoose(step) {
        var num = this.chooseCurrent + step;

        if (num <= -1) this.chooseCurrent = this.chooseMax;
        else if (num > this.chooseMax) this.chooseCurrent = 0;
        else this.chooseCurrent = num;

        this.chooseCursor.setY(this.choosePosition + (this.chooseCurrent * 16));
    }

    hasChoosed() {
        this._settingText(this.fullText[this.currentText][this.chooseCurrent][this.currentSubText]);
        this.currentSubText++;
        
        this.subDialog = true;

        this.closeContext();
    }

    nextText() {
        if (this.subDialog) {
            var text = this.fullText[this.currentText][this.chooseCurrent];

            if (text.length <= this.currentSubText) {
                this.subDialog = false;
                this.currentText++;
            } else {
                text = text[this.currentSubText];
                this.currentSubText++;

                this._settingText(text);

                return true;
            }
        }


        if (this.fullText.length <= this.currentText) return false;

        var text = this.fullText[this.currentText];

        this.currentText++;
        this._settingText(text);

        return true;
    }
    
    _settingText(text, resolve = null) {
        this.resolve = resolve;

        this.eventCounter = 0;
        this.fullDialog = text;
        this.dialog = text.split('');
        if (this.timedEvent) this.timedEvent.remove();

        this._setText('');
        this.activeDialog = true;

        this.timedEvent = this.scene.time.addEvent({
            delay: this.delay,
            callback: this._animateText,
            callbackScope: this,
            loop: true
        });
    }


    _setText(text) {
        this.text.setText(text);
    }

    _animateText() {
        this.eventCounter++;
        this.text.setText(this.text.text + this.dialog[this.eventCounter - 1]);
        if (this.eventCounter === this.dialog.length) {
            this.timedEvent.remove();
            this.activeDialog = false;

            if (this.resolve)
                this.scene.time.delayedCall(150, () => {this.resolve();});
                //this.resolve();

            this.checkNext();
        }
    }

    stopAnimate() {
        this.timedEvent.remove();
        this.activeDialog = false;

        this._setText(this.fullDialog);

        this.checkNext();
    }

    checkNext() {
        if (typeof this.fullText[this.currentText] == "object" && this.subDialog == false) {
            this.scene.time.addEvent({
                delay: 100,
                callback: this.openContext,
                callbackScope: this,
                loop: false
            });
        }
    }

    duration(multiplicator = 1) {
        var dur = this.dialog.length * this.delay * multiplicator;

        return dur;
    }

}