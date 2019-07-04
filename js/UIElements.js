/**
 * Class for Sprite and Bar handling
 */
class UIElements {
    /**
     * Generate Sprite and Bars
     * @param {Phaser.Scene} scene current scene
     * @param {number} x x Position
     * @param {number} y y Position
     * @param {string} icon icon of the sprite
     * @param {Object} stats Stats for the bars (health & mana)
     * @param {Object} [level=null] Ep for the ep bars
     * @param {Object} [options={}] Parameters like scale
     */
   constructor(scene, x, y, icon, stats, level = null, options = {}) {
       let { scale = 1 } = options;

       this.sprite = new Phaser.GameObjects.Sprite(scene, x, y, icon).setScale(scale).setInteractive();
       this.spritePos = {x, y};


       const bottomLeft = this.sprite.getBottomLeft();

       // TODO: überlegen ob man es braucht
       this.position = {
           x: x,
           y: bottomLeft.y
       };
       this.position.x -= 50;
       this.tween = undefined;

       this.healthBar = this._createBar(scene, stats.health, stats.maxHealth, 0x00ff00, {color2: 0xff0000});

       // TODO:? vlt besser (probleme wenn mana 0 ist, wird als false angesehen)
       if (typeof stats.mana !== "undefined") {
           this.manaBar = this._createBar(scene, stats.mana, stats.maxMana, 0x0000ff);}
       if (level)
           this.epBar = this._createBar(scene, level.curEp, level.maxEp, 0x005599, { width: 100, height: 7})
       
       
       this.position.y += 32;
       this.container = new Phaser.GameObjects.Container(scene, this.position.x, this.position.y);
       
       scene.add.existing(this.sprite);
       scene.add.existing(this.container);
   }

   _createBar(scene, curValue, maxValue, color, styles = {}) {
       this.position.y += 32;

       let bar = new HealthBar(scene, this.position.x, this.position.y, color, styles);
       bar.setValue(curValue, maxValue);

       return bar;
   }

   /**
    * Set position of Sprite, Bars and Container
    * @param {number} x X Position
    * @param {number} y Y Position
    * @returns {this} This UI instance
    */
   setPosition(x = undefined, y = undefined) {
       if (!x)
           x = this.sprite.y;
       if (!y)
           y = this.sprite.y;

       this.sprite.setPosition(x, y);

       const bottomLeft = this.sprite.getBottomLeft();
       this.position = {
           x: x-50,
           y: bottomLeft.y + 32
       };

       this.healthBar.setPosition(this.position.x, this.position.y);
       this.position.y += 32;

       if (this.manaBar) {
           this.manaBar.setPosition(this.position.x, this.position.y);
           this.position.y += 32;
       }
       if (this.epBar) {
           this.epBar.setPosition(this.position.x, this.position.y);
           this.position.y += 32;
       }

       this.container.setPosition(this.position.x, this.position.y);

       return this;
   }

   /**
    * Set the Value of the bar
    * @param {number} curValue current Value
    * @param {number} maxValue maximal Value
    * @param {string} [bar="health"] mana for Manabar & ep for Epbar
    * @return {this} This UI instance.
    */
   setBarValue(curValue, maxValue, bar = "health") {
       let usedBar = this.healthBar;
       if (bar == "mana" && this.manaBar)
           usedBar = this.manaBar;
       else if (bar == "ep" && this.epBar)
           usedBar = this.epBar;

       usedBar.setValue(curValue, maxValue);

       return this;
   }

   /**
    * Set depth of the sprite and bars
    * @param {number} depth depth of the elements
    * @return {this} This UI instance.
    */
   setDepth(depth) {
       this.sprite.setDepth(depth);
       this.healthBar.setDepth(depth);

       if (this.manaBar)
           this.manaBar.setDepth(depth);
       if (this.epBar)
           this.epBar.setDepth(depth);

       this.container.setDepth(depth);
       
       return this;
   }

   /**
    * Set visible of the sprite and bars
    * @param {boolean} visible is the element visible
    * @return {this} This UI instance.
    */
   setVisible(visible) {
       this.sprite.setVisible(visible);
       this.healthBar.setVisible(visible);

       if (this.manaBar)
           this.manaBar.setVisible(visible);
       if (this.epBar)
           this.epBar.setVisible(visible);

       this.container.setVisible(visible);
       
       return this;
   }

   /**
    * Add a fixed Tween
    * @param {Phaser.Scene} scene current scene
    * @param {Object} tween Object for sprite tween
    * @return {this} This UI instance.
    */
   addTween(scene, tween) {
       tween.targets = this.sprite;

       this.tween = scene.tweens.add(tween);

       return this;
   }

   /**
    * Stop the tween
    * @return {this} This UI instance.
    */
   stopTween() {
       this.tween.stop();
       this.tween = undefined;

       this.sprite.setY(this.spritePos.y);

       return this;
   }

   // TODO: Generieren von Sprite in Charactar-Class hinzufügen?
   /**
    * Draw the Buffs
    * @param {Phaser.Scene} scene Phaser Scene
    * @param {*} charactar Charactar Class
    * @return {this} This UI instance
    */
   drawBuffList(scene, charactar) {
       this.container.removeAll(true);

       charactar.buffList.forEach((element, index) => {
           const pos = iconPos(index, 6, 18);

           let sprite = generateSprite(scene, pos.x, pos.y, element.icon, charactar.getBuffText(element), {scale: 0.0625});

           this.container.add(sprite);
       })

       return this;
   }

   /**
    * Destroy all bars and Sprite
    * Can't be undone
    * @return {this} This UI instance.
    */
   destroy() {
       this.healthBar.destroy();
       this.healthBar = undefined;

       if (this.manaBar) {
           this.manaBar.destroy();
           this.manaBar = undefined;
       }
       if (this.epBar) {
           this.epBar.destroy();
           this.epBar = undefined;
       }

       if (this.tween)
           this.tween.stop();
       this.tween = undefined;

       this.sprite.destroy();
       this.sprite = undefined;

       this.container.removeAll(true);
       this.container.destroy();
       this.container = undefined;

       return this;
   }

};