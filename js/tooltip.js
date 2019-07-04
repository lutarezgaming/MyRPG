class Tooltip {

    constructor (scene, x, y, ftSize = '16px', ftColor = '#fff', ftFont = "Arial")
    {
        this.container = new Phaser.GameObjects.Container(scene, x, y);
        this.active = false;


        const backGround = new Phaser.GameObjects.Graphics(scene).setScrollFactor(0, 0);
        const text = new Phaser.GameObjects.Text(scene, 10, 10, "", { fontSize: ftSize, fill: ftColor }).setScrollFactor(0, 0);
        text.setOrigin(0, 0);
        text.font = ftFont;
        text.setWordWrapWidth(400);

        this.container.add(backGround);
        this.container.add(text);
        this.container.setDepth(11);

        scene.add.existing(this.container);
    }

    // TODO: Braucht man width, height???
	setText(x, y, message, width = 960, height = 640) {
        const list = this.container.list[1];
        this.active = true;

        const text = typeof message == "function" ? message() : message;

        list.setText(text);
        
        this.draw();
        this.setPosition(x, y, width, height);

    }

    updateText(message) {
        this.clear();

        const x = this.container.x;
        const y = this.container.y;

        this.setText(x, y, message);

    }

    setPosition(x, y, width = 960, height = 640) {
        const list = this.container.list[1];

        if ((list.width + 20 + x) >= (width))
            this.container.x = (x - list.width - 20);
        else
            this.container.x = x;

        if ((list.height + 20 + y) >= (height))
            this.container.y = (y - list.height - 20);
        else
            this.container.y = y;
    }

    setDepth(depth) {
        this.container.setDepth(depth);
    }

    clear() {
        this.container.list[0].clear();
        this.container.list[1].setText("");

        this.active = false;
    }

    draw()
    {
        const backGround = this.container.list[0];

        const width = this.container.list[1].width;
        const height = this.container.list[1].height;
        
		backGround.fillStyle(0xaaaaaa);
		backGround.fillRect(0, 0, width + 20, height + 20);
		
		backGround.fillStyle(0x222222, 0.8);
        backGround.fillRect(2, 2, width + 16, height + 16);
    }

}