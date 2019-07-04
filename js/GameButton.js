class GameButton extends Phaser.GameObjects.Image {
    /**
     * 
     * @param {Phaser.Scene} scene Phaser's scene instance
     * @param {Number} x the horizontal position
     * @param {Number} y the vertical position
     * @param {String} text Text to be displayed
     * @param {Function} callback function to be called when the button is pressed
     */
    constructor(scene, x, y, text, callback) {
        super(scene, x, y, "testButton").setScale(0.5, 0.33); // call parent constructor

        this.text = new Phaser.GameObjects.BitmapText(scene, x, y, "testFont", text, 30).setTint(0xffffff, 0xffffff, 0x888888, 0x888888); // set text and tint it
        this.text.tintFill = true;

        this.centerText(); // center the text to the button

        this.setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.enterButtonHoverState() )
            .on('pointerout', () => this.enterButtonRestState() )
            .on('pointerdown', () => this.enterButtonActiveState() )
            .on('pointerup', () => {
                this.enterButtonHoverState();
                callback();
            });

        // add the gameobjects to the scene
        scene.add.existing(this);
        scene.add.existing(this.text);
    }

    /**
     * Set the position of the text to the center
     */
    centerText() {
        const width = this.text.width / 2; // get the half width
        const height = this.text.height / 2; // get the half height

        this.text.setPosition(this.x - width, this.y - height); // set the position from the center of the image minus the half width & height
    }

    /**
     * Change the texture when mouse is hover the button
     */
    enterButtonHoverState() {
        //this.setStyle({ fill: '#f00'});
        this.setTexture("testButton2");
    }

    /**
     * Reset the texture when the mouse is out
     */
    enterButtonRestState() {
        //this.setStyle({ fill: '#000'});
        this.setTexture("testButton");
    }

    /**
     * Change the texture when the button is pressed
     */
    enterButtonActiveState() {
    }

    /**
     * Set the depth of the button
     * @param {Number} depth The depth which is to be set
     * @returns This Button instance
     */
    setDepth(depth) {
        super.setDepth(depth);
        this.text.setDepth(depth);

        return this;
    }

    /**
     * Set the scroll factor of the button
     * @param {Number} x horizontal scroll factor
     * @param {Number} y vertical scroll factor
     * @returns This Button instance
     */
    setScrollFactor(x, y) {
        super.setScrollFactor(x, y);
        this.text.setScrollFactor(x, y);

        return this;
    }
}