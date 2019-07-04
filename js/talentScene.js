var talentScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:

    function talentScene()
    {
        Phaser.Scene.call(this, { key: 'talentScene' });
    },

    preload: function () {
        //this.load.image('sword', 'assets/talent/winged-sword.png');
        //this.load.image('shuriken', 'assets/talent/shuriken.png');

        playerGuy.talent.forEach(element => {
            let icon = null;

            if (element.attackRef)
                icon = playerGuy.attackList[element.attackRef].icon;
            else
                icon = element.passive.icon;

            if (!playerGuy.imageLoader(icon, this.textures)) {
                this.load.image(icon, 'assets/talent/'+icon+'.png');
                console.log("test");
            }
        });
    },

    create: function() {
        const background = this.add.image(400, 300, 'background').setScale(2).setScrollFactor(0, 0);

        
        this.input.setDefaultCursor('url(assets/mouse/test.cur), pointer');
        this.cameras.main.setBounds(0, 0, 2048, 1024);

        this.txtTalentPoints = this.add.text(640, 30, '', { fontSize: '16px', fill: '#000' }).setScrollFactor(0, 0).setDepth(4);
        this.txtTalentPoints.setText("Talentpunke: " + playerGuy.talentPoint);


        this.tooltip = new Tooltip(this, 0, 0);
        this.tooltip.setDepth(5);

        this.lineStates = {
            inactive: {lineColor: 0x555555, depth: 0, state: 0},
            active: {lineColor: 0xff0000, depth: 1, state: 1},
            learned: {lineColor: 0x000000, depth: 2, state: 2}
        };

        let dragCamera = false;

        this.input.on('pointerdown', () => {
            if (!this.tooltip.active)
                dragCamera = true;
        });
    
        this.input.on('pointerup', () => { dragCamera = false; });
        this.input.on('pointermove', (pointer) => {
            if (dragCamera)
            {
                const x = (pointer.prevPosition.x - pointer.position.x);
                const y = (pointer.prevPosition.y - pointer.position.y);

                this.cameras.main.setScroll(this.cameras.main.scrollX + x, this.cameras.main.scrollY + y);
            }
    
        });

        this.talentTree = [];
        this.talentTreeLine = [];


        playerGuy.talent.forEach((element, index) => {
            this.talentTreeGenerator(element, index);
        });

        new GameButton(this, 800, 570, "Schließen", () => this.closeScene()).setDepth(4).setScrollFactor(0, 0);
    },

//#region GenerateTalentTree
    talentTreeGenerator: function(element, index) {
        let icon = null;
        if (element.attackRef)
            icon = playerGuy.attackList[element.attackRef].icon;
        else
            icon = element.passive.icon;
            
        
        const sprite = this.add.image(element.position.x, element.position.y, icon).setOrigin(0, 0).setScale(0.25).setInteractive();
        sprite.setDepth(3);
        const txtSprite = this.add.text(element.position.x+38, element.position.y+50, '', { fontSize: '14px', fill: '#fff', align: 'right' });
        txtSprite.setText(element.count + "/" + element.max);
        txtSprite.setDepth(3);


        if (element.next.length > 0) {
            element.next.forEach(arrLine => {
                const x1 = sprite.x;
                const y1 = sprite.y;
                const talent = playerGuy.talent[arrLine]

                const pos2 = talent.position;


                let lineState = this.lineStates.inactive;
                if (element.count == element.max) {
                    if (talent.skillable && !element.skillable) {
                        lineState = this.lineStates.active;
                    } else if (talent.count == talent.max) {
                        lineState = this.lineStates.learned;
                    }
                }

                
                const line = this.drawLine(x1, y1, pos2.x, pos2.y, 64, 64, lineState);

                this.talentTreeLine.push({start: index, end: arrLine, state: lineState.state, line: line});
            });
        }
        
        let graph = null;
        if (element.skillable) graph = this.makeMarker(element.position);
        this.talentTree.push([txtSprite, graph]);
        

        const i = this.talentTree.length-1;

        sprite.on('pointerup', () => this.learnTalent(element, i));
        //sprite.on('pointerup', () => this.changeAttack(element, i));

        sprite.on('pointerover', (pointer) => this.tooltipCreate(pointer, element));
        sprite.on('pointermove', (pointer) => this.tooltip.setPosition(pointer.position.x, pointer.position.y));
        sprite.on('pointerout', () => this.tooltipRemove());
    },
//#endregion


    drawLine: function(x1, y1, x2, y2, width, height, { lineColor, depth}) {
        const line = this.add.graphics().setDepth(depth);
        line.lineStyle(4, lineColor, 1);

        const halfwidth = width / 2;


        line.beginPath();

        line.moveTo(x1+halfwidth, y1+height);
        line.lineTo(x1+halfwidth, y1+height+((y2-(y1+height)) / 2));
        line.lineTo(x2+halfwidth, y1+height+((y2-(y1+height))) / 2);
        line.lineTo(x2+halfwidth, y2);

        line.strokePath();

        return line;
    },

    changeLine: function(talentTreeLine,{ lineWidth=4, lineColor, alpha=1, depth, state }, filter) {
        const result = talentTreeLine.filter(obj => {return filter(obj)});

        result.forEach(obj => {
            obj.state = state;
            obj.line.lineStyle(lineWidth, lineColor, alpha).setDepth(depth).strokePath();
        });
    },

    // TODO: Später löschen
    /*demo2: function(x1, y1, x2, y2, width, height, lineColor, depth = 0) {
        let line = this.add.graphics().setDepth(depth);
        line.lineStyle(4, lineColor, 1);

        let halfwidth = width / 2;

        line.moveTo(x1+halfwidth-2, y1+height-2);
        line.lineTo(x2+halfwidth-2, y2+2);

        line.strokePath();

        return line;
    },

    // Demo
    demo: function() {
        let demo = this.add.graphics();

        demo.lineStyle(4, 0x000000, 1);

        demo.beginPath();

        demo.moveTo(110+32, 180+64);
        demo.lineTo(110+32, 180+64+((280-(180+64)) / 2));
        demo.lineTo(60+32, 180+64+((280-(180+64))) / 2);
        demo.lineTo(60+32, 280);


        demo.moveTo(110+32, 180+64);
        demo.lineTo(110+32, 180+64+((320-(180+64)) / 2));
        demo.lineTo(140+32, 180+64+((320-(180+64))) / 2);
        demo.lineTo(140+32, 320);


        demo.moveTo(450+30, 180+62);
        demo.lineTo(400+30, 280+2);


        demo.moveTo(450+30, 180+62);
        demo.lineTo(500+30, 350+2);

        demo.strokePath();
    },*/

//#region Tooltip
    tooltipCreate: function(pointer, element) {
        const position = pointer.position;

        const message = this.getTextForTooltip(element);

		this.tooltip.setText(position.x, position.y, message);
    },
    
    getTextForTooltip: function(element) {
        let message = null;
        
        if (element.attackRef)
            message = playerGuy.getAttackText(element.attackRef, true);
        else
            message = playerGuy.getPassiveText(element.passive, true);

        return message;
    },

	tooltipRemove: function() {
		this.tooltip.clear();
    },
//#endregion

    learnTalent: function(element, pos) {
        if (!element.skillable || playerGuy.talentPoint <= 0)
            return;

        if (element.count == 0) {
            if (element.attackRef) {
                const attack = playerGuy.getAttack(element.attackRef);
                playerGuy.avaibleAttackList.push({
                    ref: attack.ref,
                    icon: attack.icon,
                    choosed: false
                });
            } else {
                playerGuy.passiveList.push(element.passive);
                playerGuy.usePassive(element.passive);
            }
        } else {
            // TODO: Attack mit Stacks????
            if (element.attackRef) {}
            else playerGuy.usePassive(playerGuy.passiveList.find(x => x.name == element.passive.name))
        }

        element.count++;

        this.talentTree[pos][0].setText(element.count + "/" + element.max);
        playerGuy.talentPoint--;
        this.txtTalentPoints.setText("Talentpunke: " + playerGuy.talentPoint);
        this.tooltip.updateText(this.getTextForTooltip(element));


        // check if max
        if (element.count != element.max) return;

        element.skillable = false;
        this.talentTree[pos][1].destroy();

        // check if next talent available
        element.next.forEach(ele => {
            const talent = playerGuy.talent[ele];
            const filter = (obj) => { return obj.start == pos && obj.end == ele && obj.state == 0 };

            // if next is skilled than draw line and break
            if (talent.count == talent.max) {
                this.changeLine(this.talentTreeLine, this.lineStates.learned, filter);
                return;
            }

            this.changeLine(this.talentTreeLine, this.lineStates.active, filter);

            talent.skillable = true;

            if (this.talentTree[ele][1] != null)
                return;

            const graph = this.makeMarker(talent.position);

            this.talentTree[ele][1] = graph;

        });

        this.changeLine(this.talentTreeLine, this.lineStates.learned, (obj) => {return obj.end == pos && obj.state == 1});

    },

    makeMarker: function({ x, y }) {
        const graph = this.add.graphics();
        graph.fillStyle(0xff0000);
        graph.fillRect(x - 2, y - 2 , 68, 68);
        graph.setDepth(1);

        return graph;
    },


    closeScene: function() {
        this.scene.setVisible(false);

        this.talentTree.forEach(element => {
            element[0].destroy();
            if (element[1] != null) {
                element[1].destroy();
            }
        });

        this.talentTreeLine.forEach(obj => {
            obj.line.destroy();
        });

        this.scene.pause();
        this.scene.resume("OverworldMapScene");
    },
});