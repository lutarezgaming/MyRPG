var charaScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:

    function charaScene()
    {
        Phaser.Scene.call(this, { key: 'charaScene' });
    },

    preload: function () {
    },

    create: function() {
        const background = this.add.image(400, 300, 'background').setScale(2);

        this.tooltip = new Tooltip(this, 0, 0);
        this.chooseTooltip = new Tooltip(this, 0, 0);


        this.chooseLayer = this.add.graphics();
		this.chooseLayer.fillStyle(0x000000, 0.5);
        this.chooseLayer.fillRect(0, 0, 960, 640);
        this.chooseLayer.fillStyle(0xffffff);
        this.chooseLayer.fillRect(32, 32, 896, 576)
		this.chooseLayer.setDepth(3);
        this.chooseLayer.setVisible(false);


        this.arrCounter = 0;
        this.arrMelee = [];
        this.arrMagic = [];
        this.arrHeal = [];
        this.arrDebuff = [];
        this.arrBuff = [];

        playerGuy.avaibleAttackList.forEach(element => {
            let attack = playerGuy.getAttack(element.ref);

            if (attack.type == 0)
                this.arrMelee.push(element);
            else if (attack.type == 1)
                this.arrMagic.push(element);
            else if (attack.type == 2)
                this.arrHeal.push(element);
            else if (attack.type == 3)
                this.arrDebuff.push(element);
            else if (attack.type == 4)
                this.arrBuff.push(element);
        });

        this.arrActive = this.arrMelee;
        
        this.marker = this.add.graphics();
        

        this.chooseAtk = false;
        this.chooseBtn;
        this.choosePos;

        this.target = 0;


        this.attackListContainer = this.add.container(64, 96).setDepth(5);
        this.passiveListContainer = this.add.container(625, 350);


        this.passiveListGenerator();

//#region Buttons
        this.btnCloseChoose = this.add.image(880, 40, 'btn-close').setOrigin(0, 0).setScale(0.15).setDepth(4).setInteractive().setVisible(false).setScrollFactor(0, 0);
        this.btnCloseChoose.on('pointerup', () => this.closeChoose());


        new GameButton(this, 800, 570, "Schließen", () => this.closeScene());

        this.btnAtk1 = generateSprite(this, 640, 32, playerGuy.attacks[0].icon, () => playerGuy.getAttackText(0));
        this.btnAtk2 = generateSprite(this, 764, 32, playerGuy.attacks[1].icon, () => playerGuy.getAttackText(1));
        this.btnAtk3 = generateSprite(this, 640, 156, playerGuy.attacks[2].icon, () => playerGuy.getAttackText(2));
        this.btnAtk4 = generateSprite(this, 764, 156, playerGuy.attacks[3].icon, () => playerGuy.getAttackText(3));

        this.btnAtk1.on('pointerup', () => this.atkChoose(this.btnAtk1, 0));
        this.btnAtk2.on('pointerup', () => this.atkChoose(this.btnAtk2, 1));
        this.btnAtk3.on('pointerup', () => this.atkChoose(this.btnAtk3, 2));
        this.btnAtk4.on('pointerup', () => this.atkChoose(this.btnAtk4, 3));
//#endregion


        this.playerSprite = this.add.image(96, 128, 'phaserguy').setScale(2);

        const pos = this.playerSprite.getBottomLeft();

        this.buffListContainer = this.add.container(pos.x-50, pos.y+32);

        playerGuy.buffList.forEach((element, index) => {
           const pos = iconPos(index, 6, 18);

           let sprite = generateSprite(this, pos.x, pos.y, element.icon, playerGuy.getBuffText(element), {scale: 0.0625});

           this.buffListContainer.add(sprite);
       })



        this.txtStats = this.add.text(32, 450, '', { fontSize: '16px', fill: '#000' });
        this.txtStats2 = this.add.text(0, 0, '', { fontSize: '16px', fill: '#000' });

        this.drawStats();


//#region Tabs
        this.tabContainer = this.add.container(48, 48).setDepth(5);
        this.tabContainer.setVisible(false);

        let style = {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
        };

        let width;

        this.arrTabText = [];
        this.activeTab = 0;

        let text1 = this.add.text(0, -8, 'Physisch', style).setPadding({ x: 32, y: 8 }).setInteractive().setBackgroundColor('#aa0000');
        width = text1.width;
        let text2 = this.add.text(width, 0, 'Magie', style).setPadding({ x: 32, y: 4 }).setInteractive().setBackgroundColor('#0000aa');
        width += text2.width;
        let text3 = this.add.text(width, 0, 'Heilung', style).setPadding({ x: 32, y: 4 }).setInteractive().setBackgroundColor('#00aa00');
        width += text3.width;
        let text4 = this.add.text(width, 0, 'Verstärkung', style).setPadding({ x: 32, y: 4 }).setInteractive().setBackgroundColor('#aa00aa');
        width += text4.width;
        let text5 = this.add.text(width, 0, 'Schwächung', style).setPadding({ x: 32, y: 4 }).setInteractive().setBackgroundColor('#aaaa00');


        text1.on('pointerup', () => this.changeActiveTab(0));
        text2.on('pointerup', () => this.changeActiveTab(1));
        text3.on('pointerup', () => this.changeActiveTab(2));
        text4.on('pointerup', () => this.changeActiveTab(3));
        text5.on('pointerup', () => this.changeActiveTab(4));

        this.arrTabText.push(text1, text2, text3, text4, text5);

        this.tabContainer.add(this.arrTabText);
//#endregion

//#region Hotkeys
        this.keyAtk1 = this.input.keyboard.addKey(hotkeys.atk1.keyCode);
		this.keyAtk2 = this.input.keyboard.addKey(hotkeys.atk2.keyCode);
        this.keyAtk3 = this.input.keyboard.addKey(hotkeys.atk3.keyCode);
        this.keyAtk4 = this.input.keyboard.addKey(hotkeys.atk4.keyCode);
        this.keyBack = this.input.keyboard.addKey(hotkeys.back.keyCode);

        this.keyUp = this.input.keyboard.addKey(hotkeys.up.keyCode);
		this.keyLeft = this.input.keyboard.addKey(hotkeys.left.keyCode);
        this.keyDown = this.input.keyboard.addKey(hotkeys.down.keyCode);
        this.keyRight = this.input.keyboard.addKey(hotkeys.right.keyCode);
        this.keyConfirm = this.input.keyboard.addKey(hotkeys.confirm.keyCode);

        this.nextTab = this.input.keyboard.addKey(hotkeys.nextTab.keyCode);
        this.previousTab = this.input.keyboard.addKey(hotkeys.previousTab.keyCode);
//#endregion
    },

    update: function() {
        if (Phaser.Input.Keyboard.JustDown(this.keyAtk1))
            this.atkChoose(this.btnAtk1, 0);
        else if (Phaser.Input.Keyboard.JustDown(this.keyAtk2))
            this.atkChoose(this.btnAtk2, 1);
        else if (Phaser.Input.Keyboard.JustDown(this.keyAtk3))
            this.atkChoose(this.btnAtk3, 2);
        else if (Phaser.Input.Keyboard.JustDown(this.keyAtk4))
            this.atkChoose(this.btnAtk4, 3);
        else if (Phaser.Input.Keyboard.JustDown(this.keyBack)) {
            if (this.chooseAtk)
                this.closeChoose();
            else
                this.closeScene();
        }

        if (this.chooseAtk) {
            if (Phaser.Input.Keyboard.JustDown(this.keyRight))
                this.switchTarget(1);
            else if (Phaser.Input.Keyboard.JustDown(this.keyLeft))
                this.switchTarget(-1);
            else if (Phaser.Input.Keyboard.JustDown(this.keyUp))
                this.switchTarget(-9);
            else if (Phaser.Input.Keyboard.JustDown(this.keyDown))
                this.switchTarget(9);
            else if (Phaser.Input.Keyboard.JustDown(this.keyConfirm))
                this.changeAtk();
            else if (Phaser.Input.Keyboard.JustDown(this.nextTab))
                this.changeActiveTab(1, true);
            else if (Phaser.Input.Keyboard.JustDown(this.previousTab))
                this.changeActiveTab(-1, true);
        }
    },

    changeActiveTab: function(tab, calculation = false) {
        this.tooltipRemove();
        this.attackListContainer.removeAll(true);
        this.arrTabText[this.activeTab].setY(0).setPadding({ x: 32, y: 4 });

        if (calculation) {
            this.activeTab += tab;

            if (this.activeTab >= this.arrTabText.length)
                this.activeTab = 0;
            else if (this.activeTab <= -1)
                this.activeTab = this.arrTabText.length-1;
        }
        else
            this.activeTab = tab;

        this.arrTabText[this.activeTab].setY(-8).setPadding({ x: 32, y: 8});

        if (this.activeTab == 0)
            this.arrActive = this.arrMelee;
        else if (this.activeTab == 1)
            this.arrActive = this.arrMagic;
        else if (this.activeTab == 2)
            this.arrActive = this.arrHeal;
        else if (this.activeTab == 4)
            this.arrActive = this.arrDebuff;
        else if (this.activeTab == 3)
           this.arrActive = this.arrBuff;


        this.attackListGenerator();
        this.target = 0;

        if (this.attackListContainer.length <= 0) {
            this.marker.clear();
        }
        else
            this.markerPostitionGenerator(0);
    },

    switchTarget: function(direction = 0) {
        if (this.attackListContainer.length <= 0 && this.chooseAtk)
            return;

        let move = this.target + direction;

        let length = this.attackListContainer.length;

        if (move >= length) {
            move = 0;
        }
        else if (move < 0) {
            move = length-1;
        }
        
        this.markerPostitionGenerator(move);

        this.target = move;

    },

    markerPostitionGenerator(pos) {
        let x = this.attackListContainer.list[pos].x;
        let y = this.attackListContainer.list[pos].y;

        x += this.attackListContainer.x;
        y += this.attackListContainer.y;

        this.marker.clear();
        /*this.marker.fillStyle(0xff0000);
        this.marker.fillRect(x - 4, y - 4 , 84, 84);*/
        this.marker.lineStyle(5, 0xff0000);
        this.marker.strokeRect(x-2, y-2, 80, 80);
        this.marker.setDepth(4);

    },

    atkChoose: function(btn, pos) {
        if (this.chooseAtk)
            return;
        this.tooltipRemove();

        this.chooseBtn = btn;
        this.choosePos = pos;
        
        this.chooseAtk = true;

        this.setVisibles(true);
        this.attackListGenerator();
        this.switchTarget();
    },

    attackListGenerator: function() {
        this.arrActive.forEach(element => {
            if (element.choosed)
                return;

            const position = this._positionCalculator(this.attackListContainer, 9, 90, 90);
            const image = this._imageGenerator(element, playerGuy.getAttackText(element.ref, true), 0.3, position, true);

            image.on('pointerup', () => this.changeAtk(element));

            this.attackListContainer.add(image);
        });
    },

    passiveListGenerator: function() {
        playerGuy.passiveList.forEach(element => {
            const position = this._positionCalculator(this.passiveListContainer, 8, 32, 32);
            const image = this._imageGenerator(element, playerGuy.getPassiveText(element), 0.1, position);

            this.passiveListContainer.add(image);
        });
    },

    _positionCalculator: function(container, lineWidth, rowWidth, colWidth) {
        const row = Math.floor(container.length / lineWidth);
        const col = container.list.length - (row * lineWidth);

        const x = col * colWidth;
        const y = row * rowWidth;

        return {x, y};
    },

    // TODO: vielleicht den neuen nützten
    _imageGenerator: function(element, message, scale, { x, y }, tooltip = false) {
        const image = this.add.image(x, y, element.icon).setOrigin(0, 0).setScale(scale).setInteractive();
        image.attack = element;

        image.on('pointerover', (pointer) => this.tooltipCreate(pointer, message, tooltip));
        image.on('pointermove', (pointer) => this.tooltip.setPosition(pointer.position.x, pointer.position.y));
        image.on('pointerout', () => this.tooltipRemove());

        return image;
    },

    changeAtk: function(attack = null) {
        if (this.attackListContainer.length == 0)
            return;
        
        this.setVisibles(false);
        this.tooltipRemove();

        let pos = this.choosePos;

        if (attack == null) {
            attack = this.attackListContainer.list[this.target].attack;
        }

        attack.choosed = true;

        let oldRef = playerGuy.attacks[pos].ref;

        let obj = playerGuy.avaibleAttackList.find(obj => obj.ref == oldRef);
        obj.choosed = false;

        playerGuy.attacks[pos] = playerGuy.getAttack(attack.ref);

        this.chooseAtk = false;

        this.chooseBtn.setTexture(attack.icon);
        
        this.attackListContainer.removeAll(true);
    },

    closeChoose: function() {
        this.setVisibles(false);

        this.chooseAtk = false;
        this.chooseBtn = null;
        this.choosePos = null;

        this.attackListContainer.removeAll(true);
    },

    setVisibles: function(visisble) {
        this.attackListContainer.setVisible(visisble);
        this.tabContainer.setVisible(visisble);
        this.chooseLayer.setVisible(visisble);
        this.btnCloseChoose.setVisible(visisble);

        if (!visisble)
            this.marker.clear();
        else
            this.target = 0;
    },

    drawStats: function() {
        let stats = playerGuy.getBoostedStat();
        let level = playerGuy.level;
        //let name = playerGuy.name;

 
        let text = `Level: ${level.curLevel}
\n\nGesundheit: ${stats.health}/${stats.maxHealth}
\nAngriff: ${stats.attack}
Magie: ${stats.magic}
Glück: ${stats.luck}`;

        let text2 = `Erfahrung: ${level.curEp}/${level.maxEp}
\n\nMana: ${stats.mana}/${stats.maxMana}
\nVerteidung: ${stats.defence}
Resistenz: ${stats.resistenc}
Mana Regeneration: ${stats.manaReg}`;


        this.txtStats.setText(text);
        this.txtStats2.setText(text2);

        let width = this.txtStats.width;

        let x = this.txtStats.x + width + 40;
        this.txtStats2.setX(x);
        this.txtStats2.setY(this.txtStats.y);

    },


//#region Tooltip
    tooltipCreate: function(pointer, message, choose = false) {
        if (this.chooseAtk && !choose)
            return;
        const position = pointer.position;
        const x = position.x;
        const y = position.y;

        this.tooltip.setText(x, y, message);
	},

	tooltipRemove: function() {
		this.tooltip.clear();
    },
//#endregion

    closeScene: function() {
        if (this.chooseAtk)
            return;
        
        this.scene.setVisible(false);

        this.scene.pause();
        this.scene.resume("OverworldMapScene");
    },
});