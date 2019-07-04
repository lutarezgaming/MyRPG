class HealthBar {

    constructor (scene, x, y, color1, { color2 = color1, width = 100, height = 12 })
    {
        this.bar = new Phaser.GameObjects.Graphics(scene);

        this.x = x;
        this.y = y;
        //this.value = 100;
		this.pixelPercent = width / 100;
		this.color1 = color1;
        this.color2 = color2;
        this.width = width;
        this.height = height;

        this.bar.setPosition(this.x, this.y);

        this._draw(100);

        scene.add.existing(this.bar);
    }

    /*position(x, y) {
        this.x = x;
        this.y = y;

        this.draw();
    }*/

   /* // TODO: Braucht man das?
    decrease (damage, maxHealth)
    {
		const amount = (damage * 100) / maxHealth;

		this.value -= amount;

        if (this.value < 0)
        {
            this.value = 0;
        }

        this.draw();

        return (this.value === 0);
	}

    // Todo. Braucht man das?
	increase (heal, maxHealth) {
		const amount = (heal * 100) / maxHealth;

		this.value += amount;

		this.draw();
	}*/
	
	setValue(cur, max) {
        if (cur > max) cur = max;
        const value = (cur * 100) / max;

		this._draw(value);
    }

    setDepth(depth) {
        this.bar.setDepth(depth);
    }

    setVisible(visible) {
        this.bar.setVisible(visible);
    }

    clear() {
        this.bar.clear();
    }

    destroy() {
        this.bar.destroy();
        this.bar = undefined;
    }

    setPosition(x = this.x, y = this.y) {
        this.bar.setPosition(x, y);
    }

    _draw(value) {
        this.bar.clear();

        //  Background
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(0, 0, this.width + 2, this.height + 2);

        //  Health
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(1, 1, this.width, this.height);


        if (value <= 30)
            this.bar.fillStyle(this.color2);
        else
            this.bar.fillStyle(this.color1);


        const width = Math.floor(this.pixelPercent * value);

        this.bar.fillRect(1, 1, width, this.height);
    }

}