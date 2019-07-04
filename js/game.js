/**
 * Created by Jerome Renaux (jerome.renaux@gmail.com) on 25-02-18.
 * Copied and Edited by Philipp Hager on 04-2018
 */



var Game = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:

    function Game()
    {
        Phaser.Scene.call(this, { key: 'game', active: false });
    },

    preload: function () {
        //this.scene = this; // Handy reference to the scene (alternative to `this` binding)
    //    this.load.image('tileset', 'assets/gridtiles.png');
        /*this.load.image('tileset', 'assets/testmap/gridtiles.png');
        this.load.image('objectset', 'assets/testmap/objectset.png');
        this.load.image('tree', 'assets/testmap/tree-variations.png');*/
        //this.load.tilemapTiledJSON('map', 'assets/map.json');
        /*this.load.tilemapTiledJSON('map3', 'assets/testmap/map3.json'); // Tiled Map editor
        this.load.tilemapTiledJSON('testmap', 'assets/testmap/testmap.json');
        this.load.tilemapTiledJSON('infinityMap', 'assets/testmap/infinityMap.json');*/
        //this.load.image('phaserguy', 'assets/phaserguy.png');
        //this.load.image('computerguy', 'assets/star.png');
        /*this.load.spritesheet('bat', 'assets/enemies/bat.png', { frameWidth: 128, frameHeight: 64 });
		this.load.spritesheet('slime', 'assets/enemies/green_slime.png', { frameWidth: 64, frameHeight: 64 });
		this.load.spritesheet('spider', 'assets/enemies/spider.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('deceleon', 'assets/enemies/deceleon.png', { frameWidth: 256, frameHeight: 256 });
        this.load.spritesheet('daemarbora', 'assets/enemies/daemarbora.png', { frameWidth: 128, frameHeight: 128});*/

        //this.load.json("asdf", "json/test.json");



		//this.load.image('textbox', 'assets/textbox1.png');
    },


    create: function () {
        //let data = this.cache.json.get('asdf');
        //console.log(data);

        var menuBG = this.add.image(640, 0, 'startMenuBG').setOrigin(0, 0).setScale(0.75);
        menuBG.setDepth(3);

        //this.cameras.main.setSize(400, 300);
        this.camera = this.cameras.add(0, 0, 640, 640);
        // this.cameras.main.setSize(20*32, 20*32);
        // this.camera = this.cameras.main;
        //this.camera.setBounds(0, 0, 20*32, 20*32);
        this.camera.setBounds(0, 0, 40*32, 40*32);


        //this.lastResume = null;
        //this.isMoving = false;
        this.isPaused = false;
        this.isChoosing = false;
        //this.fightingEnemie = false;


        this.dialog = new Dialog(this, 76, 420, 'textbox', 75, true);


        //this.minimap = this.cameras.add(200, 10, 6*32, 6*32).setZoom(0.2);
        //this.minimap.setBounds(0, 0, 40*32, 40*32);
        //this.minimap.setBackgroundColor(0x000000);
        //this.minimap.scrollX = 384;
        //this.minimap.scrollY = 384;

	    // ### Player ### //

        //var phaserGuy = this.add.image(32,32,'phaserguy');
		//phaserGuy.alive = true;
        //phaserGuy.setDepth(1);
        //phaserGuy.setOrigin(0,0.5);
        //phaserGuy.name = "Player";
        phaserGuy.posChanged = false;
        phaserGuy.lastPos = [0, 0];
        /*phaserGuy.stats = {maxHealth: 1000, health: 950, maxMana: 100, mana: 100, attack: 20, magic: 30, luck: 25, manaReg: 5};
        //phaserGuy.attacks = {schlag: 75, spucken: 1000, beleidigen: 0, heilen: 100};
        phaserGuy.attacks = [{name: "Schlag", strength: 75, type: 0, cost: 5}, {name: "Spucken", strength: 1000, type: 0, cost: 0}, 
                            {name: "Beleidigen", strength: 10, duration: 4, type: 2, cost: 10}, {name: "Heilen", strength: 100, type: 1, cost: 20}]
        phaserGuy.level = {curLevel: 1, curEp: 0, maxEp:100};
        phaserGuy.look = [0, 0];*/
        
        //this.camera.startFollow(phaserGuy);
        //this.minimap.startFollow(phaserGuy);
        //this.player = phaserGuy;

        
        
        // TODO: enemies hier entfernen
//#region Enemies & NPC
        // ### Enemies ### //

        /*var computerGuy = this.add.sprite(32,32,'spider').setScale(0.5);
        //computerGuy.setXY(100, 100);
		computerGuy.name = 'Spinne'; // TODO: kommt weg
        computerGuy.setDepth(1);
        computerGuy.x = 576;
        computerGuy.setOrigin(0,0);
		//computerGuy.stats = {maxHealth: 100, health: 100, attack: 10, luck: 0}; //luck: 20
        //computerGuy.ep = 70;
        computerGuy.move = [[18, 1], [18, 3]];
        computerGuy.chara = new KIClass("Spinne", "spider", {maxHealth: 100, health: 100, attack: 10, luck: 0}, [], [], 70);



        var computerGuy2 = this.add.sprite(32,32,'slime').setScale(0.5);
		computerGuy2.name = 'Schleim'; // tmp
        computerGuy2.setDepth(1);
        //computerGuy2.x = 160; // tmp
        computerGuy2.y = 480;
        computerGuy2.setOrigin(0, 0);
		//computerGuy2.stats = {maxHealth: 10, health: 10, attack: 1, luck: 2};
        //computerGuy2.ep = 1000;
        computerGuy2.move = [[1, 15], [13, 15], [3, 4]];
        computerGuy2.duration = 400;
        computerGuy2.aggro = 0;
        computerGuy2.home = [160, 480];
        computerGuy2.chara = [
            new KIClass("Schleim", "slime", {maxHealth: 10, health: 10, attack: 1, luck: 2}, [], [], 1000),
            new KIClass("Spinni", "spider", {maxHealth: 100, health: 90, attack: 100, luck: 2}, [], [], 1)
        ];
        //computerGuy2.help = {stats: {maxHealth: 100, health: 90, attack: 100, luck: 2}, name: "Spinni", icon: "spider" };
        //computerGuy2.help.stats = {maxHealth: 10, health: 10, attack: 1, luck: 2};


        var computerGuy3 = this.add.sprite(32,32,'bat').setScale(0.5);
		computerGuy3.name = 'Fledermaus'; // tmp
        computerGuy3.setDepth(1);
        computerGuy3.x = 160;
        computerGuy3.y = 96;
        computerGuy3.setOrigin(0.25, 0);
		//computerGuy3.stats = {maxHealth: 20, health: 20, attack: 30, luck: 60};
        //computerGuy3.ep = 30;
        computerGuy3.move = [[5, 3], [20, 3]];
        computerGuy3.duration = 100;
        computerGuy3.chara = new KIClass("Feldermaus", "bat", {maxHealth: 20, health: 20, attack: 30, luck: 60}, [], [], 30);


        var computerGuy4 = this.add.sprite(32,32,'deceleon').setScale(0.25);
		computerGuy4.name = 'Deceleon'; // tmp
        computerGuy4.setDepth(1);
        computerGuy4.x = 96;
        computerGuy4.setOrigin(0.35, 0.5);
		//computerGuy4.stats = {maxHealth: 500, health: 500, attack: 200, luck: 30};
        //computerGuy4.ep = 210;
        //computerGuy4.noFlee = true;
        //computerGuy4.help = { stats: {maxHealth: 500, health: 500, attack: 200, luck: 30} };
        computerGuy4.chara = [
            new KIClass("Deceleon", "deceleon", {maxHealth: 500, health: 500, attack: 200, luck: 30}, [], [], 200, {noFlee: true}),
            new KIClass("Deceleon", "deceleon", {maxHealth: 500, health: 500, attack: 200, luck: 30}, [], [], 10)
        ];

        var npc = this.add.sprite(32,32,'daemarbora').setScale(0.25);
        npc.name = 'daemarbora';
        npc.setDepth(1);
        npc.x = 8*32;
        npc.y = 12*32;
        npc.setOrigin(0, 0);
        npc.text = ["Test Text!!!! kljlkjkdkkdkdkdiiidfdf kdkdkdkdkdkdkdkdkdkd kdkdkdkdddddddddd yolo", "Test", "Yolo", [["Ja1", "Ja2"], ["Nein"]], "Ende!"];

        this.npc = npc;


        var npc2 = this.add.sprite(32,32,'daemarbora').setScale(0.25);
        npc2.name = 'daemarbora';
        npc2.setDepth(1);
        npc2.x = 13*32;
        npc2.y = 8*32;
        npc2.setOrigin(0, 0);
        npc2.text = ["Yolo"];

        this.npc2 = npc2;


        this.test1 = computerGuy;
        this.test2 = computerGuy2;
        this.test3 = computerGuy3;
        this.test4 = computerGuy4;*/
        
//#endregion

        //this.enemies = [];
        //this.npcList = [];

        //this.timerCursor = 0;

        //mapChanged = false; // TODO: unused?

        //this.mapLoader("map3");

        //this.map.layers[0].data[12][8].properties.npc = this.npc;
        //this.map.layers[0].data[8][13].properties.npc = this.npc2;
    
        //this.generateControl();

        /*self = this;
        this.input.keyboard.on('keydown_E', function (event) {
            var player = self.player;
                
            fromX = Math.round(player.x/32);
            fromY = Math.round(player.y/32);

            if (self.map.layers[0].data[fromY+player.look[1]][fromX+player.look[0]].properties.npc) {
                console.log('Du bist doff!');
            }
        });
        */

        
        this.btnTalent = this.add.image(680, 32, 'button').setOrigin(0, 0).setScale(0.5).setInteractive();
        this.btnTalent.setDepth(3);
        this.btnTalent.on('pointerup', () => this.openTalentTree());


        this.btnChara = this.add.image(680, 180, 'button').setOrigin(0, 0).setScale(0.5).setInteractive();
        this.btnChara.setDepth(3);
        this.btnChara.on('pointerup', () => this.openCharaScene());


        this.btnControl = this.add.image(680, 328, 'button').setOrigin(0, 0).setScale(0.5).setInteractive();
        this.btnControl.setDepth(3);
        this.btnControl.on('pointerup', () => this.openControlScene());


        this.btnGodMode = this.add.image(680, 600, 'button').setOrigin(0, 0).setScale(0.5).setInteractive();
        this.btnGodMode.setDepth(3);
        this.btnGodMode.on('pointerup', () => this.godMode());


        this.camera.ignore([this.btnTalent, this.btnChara, this.btnControl, this.btnGodMode, menuBG, this.dialog]);
        /*this.camera.ignore(menuBG);
        this.camera.ignore(this.dialog);*/


        /*this.events.on('resume', (system = null, state = null) => {
            if (state == "won") {
                this.fightEnd(this.fightingEnemie);
            }
            else if (state == "flee") {
                let enemie = this.fightingEnemie;
                enemie.active = false;

                let arr = [];
                if (!Array.isArray(enemie.chara))
                    arr = [(enemie.chara)];
                else
                    arr = enemie.chara;

                arr.forEach((ele) => {ele.stats.health = ele.stats.maxHealth;});

                let tween = this.tweens.getTweensOf(enemie);

                if (tween[0])
                    tween[0].pause();
                this.blink(enemie, tween[0]);
            }

            this.keyUp.reset();
            this.keyLeft.reset();
            this.keyDown.reset();
            this.keyRight.reset();

            if (hotkeys.version != this.hotkeyVersion) {
                this.generateControl();
            }
        });*/

    },

    /*generateControl: function() {
        cursors = this.input.keyboard.createCursorKeys();



        this.hotkeyVersion = hotkeys.version;
		this.keyUp = this.input.keyboard.addKey(hotkeys.up.keyCode);
		this.keyLeft = this.input.keyboard.addKey(hotkeys.left.keyCode);
		this.keyDown = this.input.keyboard.addKey(hotkeys.down.keyCode);
        this.keyRight = this.input.keyboard.addKey(hotkeys.right.keyCode);
        this.keyConfrim = this.input.keyboard.addKey(hotkeys.confirm.keyCode);
    },*/

    godMode: function() {
        playerGuy.stats = {maxHealth: 10000, health: 10000, maxMana: 10000, mana: 10000, attack: 10000, magic: 10000, luck: 10000, manaReg: 10000, speed: 10000};
    },

    update: function () {
        if (!playerGuy.alive) {
			return;
        }

        
		if (playerGuy.stats.health <= 0) {
            this.gameOver();
            playerGuy.alive = false;
            return;
        }

        //this.timerCursor++;
        //var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

         // Rounds down to nearest tile
        /*var pointerTileX = this.map.worldToTileX(worldPoint.x);
        var pointerTileY = this.map.worldToTileY(worldPoint.y);
        this.marker.x = this.map.tileToWorldX(pointerTileX);
        this.marker.y = this.map.tileToWorldY(pointerTileY);
        this.marker.setVisible(!this.checkCollision(pointerTileX,pointerTileY));*/

        /*this.enemies.forEach(element => {
            this.collisionSprite(this.player, element);
        });*/


        //var fromX = Math.round(this.player.x/32);
        //var fromY = Math.round(this.player.y/32);

        /*if (this.player.x != this.player.lastPos[0] || this.player.y != this.player.lastPos[1]) {
            this.player.posChanged = true;
            this.player.lastPos = [this.player.x, this.player.y];
        }*/

     //   var tile = this.map.getTileAt(fromX, fromY);
        /*var tile = this.objectLayer.getTileAt(fromX, fromY);

        if (tile.properties.port != null && !this.isMoving) {
            this.mapLoader(tile.properties.port);
        }
        
        if (tile.properties.x && !this.isMoving) {
            this.player.setX(tile.properties.x * 32);
            fromX = tile.properties.x;
        }
        if (tile.properties.y && !this.isMoving) {
            this.player.setY(tile.properties.y * 32);
            fromY = tile.properties.y;
        }*/

        if (!this.isMoving && !this.isPaused) {
           /* if (this.keyLeft.isDown) {
                this.player.look = [-1, 0];
                this.move(-1, 0, fromX, fromY, this.player);
            }
            else if (this.keyRight.isDown) {
                this.player.look = [1, 0];
                this.move(1, 0, fromX, fromY, this.player);
            }
            else if (this.keyUp.isDown) {
                this.player.look = [0, -1];
                this.move(0, -1, fromX, fromY, this.player);
            }
            else if (this.keyDown.isDown) {
                this.player.look = [0, 1];
                this.move(0, 1, fromX, fromY, this.player);
            }*/

            


            if (cursors.left.isDown) {
                this.player.look = [-1, 0];
            }
            else if (cursors.right.isDown) {
                this.player.look = [1, 0];
            }
            else if (cursors.up.isDown) {
                this.player.look = [0, -1];
            }
            else if (cursors.down.isDown) {
                this.player.look = [0, 1];
            }


        }

        if (this.isPaused) {
            this.isChoosing = this.dialog.activeContext;
        }

        if (this.isPaused && this.isChoosing) {
            if ((cursors.up.isDown && cursors.up.repeats == 1) || Phaser.Input.Keyboard.JustDown(this.keyUp)) {
                if (cursors.up.isDown) cursors.up.repeats++;
                this.dialog.nextChoose(-1);
            }
            else if ((cursors.down.isDown && cursors.down.repeats == 1) || Phaser.Input.Keyboard.JustDown(this.keyDown)) {
                if (cursors.down.isDown) cursors.down.repeats++;
                this.dialog.nextChoose(1);
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyConfrim)) {
        //if (this.keyConfrim.isDown && this.keyConfrim.repeats == 1) {
            //this.keyConfrim.repeats += 1;

            // nicht löschen, cost änderung
            //this.map.layers[0].data[fromY+this.player.look[1]][fromX+this.player.look[0]].properties.cost = null;

            if (this.isChoosing) { this.dialog.hasChoosed(); this.isChoosing = false; }
            else if (this.map.layers[0].data[fromY+this.player.look[1]][fromX+this.player.look[0]].properties.npc) {
                /*if (!this.dialog.activeDialog) {
                    console.log('Du bist doff!');
                    this.dialog.toggle();
                    this.dialog.setText(this.npc.text);

                    //if (!this.isPaused) this.tweens._active[0].pause();

                    this.tweens._active.forEach(element => {
                        if (this.isPaused) element.resume();
                        else element.pause();
                    })

                    this.isPaused = !this.isPaused;
                } else {
                    console.log("dfasdfsdf");
                }*/


                if (!this.dialog.active) {
                    this.dialog.open(this.map.layers[0].data[fromY+this.player.look[1]][fromX+this.player.look[0]].properties.npc.text);

                    //this.dialog.openContext();

                    //this.dialog.setText(this.npc.text[this.dialogCount]);
                    this.dialog.nextText();

                    //this.dialogCount++;
                    this.isPaused = true;
                } else {
                    if (this.dialog.activeDialog) {
                        this.dialog.stopAnimate();
                    } else {
                        //if (this.dialogCount < this.npc.text.length) {
                            //this.dialog.setText(this.npc.text[this.dialogCount]);
                            var asdf = this.dialog.nextText();
                            //this.dialogCount++;
                        /*}*/ if (!asdf) {
                            this.dialog.shutdown();
                                    

                            this.isPaused = false;
                            //this.dialogCount = 0;
                        } //else if (asdf == 2) { this.isChoosing = true; }
                    }
                }


                this.tweens._active.forEach(element => {
                    if (this.isPaused) element.pause();
                    else element.resume();
                })
            }
        }


        
        if (tile.properties.cost != null) {
            playerGuy.stats.health -= 1;
            console.log(playerGuy.stats.health);
        }

        //this.checkAggro(this.player, this.test2);
        
        /*this.enemies.forEach(element => {
            if (element.name == "Schleim") { this.aggroRange(this.player, element); }
            else {
                if (element.movement > -1) {
                    if (element.timer >= element.movement && element.active) {
                        this.enemieMove(element);
                        element.timer = 0;
                    }
                    else {
                        element.timer++;
                    }
                }
            }
        });*/
    },

    /*checkCollision: function(x,y){
        var tile = this.map.getTileAt(x, y);
        if (tile != null)
        return tile.properties.collide == true;
        return false;
    },*/

    /*getTileID: function(x,y){
    //    var tile = this.map.getTileAt(x, y);
        var tile = this.objectLayer.getTileAt(x, y);
        return tile.index;
    },*/


    /*collisionSprite: function(player, enemie) {
        if (!enemie.active) {
            return;
        }

        if (player.x < enemie.x + 32 && player.x + 32 > enemie.x && player.y < enemie.y + 32 && player.y + 32 > enemie.y) {
            console.log("collision");

            this.lastResume = "fightScreen";
            this.scene.pause();
            //this.scene.resume('fightScreen', 1233);
            this.scene.resume('FightSceneNew', [playerGuy, enemie.chara]);
            currentEnemie = enemie;
            this.fightingEnemie = enemie;
            console.log(playerGuy.stats.health);
        }
    },*/


    // TODO: Aggro
//#region Aggro
    /*aggroRange: function(player, enemie) {
        if (!enemie.active) {
            return;
        }

        
        this.finder.cancelPath(enemie.findPath);

        //console.log(enemie.x + " " + enemie.y);

        if (player.x / 32 < enemie.home.x + 4 && player.x / 32 + 1 > enemie.home.x - 3 && player.y / 32 < enemie.home.y + 4 && player.y / 32 + 1 > enemie.home.y - 3) {
            console.log("Aggro!!!!!!");
            enemie.aggro = 1;
            this.aggroFindPath(Math.round(player.x / 32), Math.round(player.y / 32), Math.round(enemie.x / 32), Math.round(enemie.y / 32), enemie);
        }
        else if (Math.round(enemie.x) != enemie.home.x * 32 && Math.round(enemie.y) != enemie.home.y * 32) {
            
            console.log ("Aggro verloren")
            this.aggroFindPath(Math.round(enemie.x / 32), Math.round(enemie.y / 32), enemie.home.x, enemie.home.y, enemie);

        } 
        else {
            if (enemie.timer >= enemie.movement && enemie.active) {
                this.enemieMove(enemie);
                enemie.timer = 0;
            }
            else {
                enemie.timer++;
            }
        }
    },*/

    /*aggroFindPath: function(toX, toY, fromX, fromY, target) {
    //    var tile = this.map.getTileAt(toX, toY);
        var tile = this.objectLayer.getTileAt(toX, toY);

        target.findPath = this.finder.findPath(fromX, fromY, toX, toY, function( path ) {
            if (path === null || tile.properties.npc == true) {
                //console.warn("Path was not found.");
            } else {
                self.moveSprite(path, target);
            }
        });

        this.finder.calculate();
    },*/
//#endregion

	/*fightEnd: function(enemie) {
		if (playerGuy.stats.health <= 0) {
			playerGuy.alive = false;
			this.gameOver();
		} else {
            
            this.tweens.killTweensOf(enemie);
            enemie.destroy();
        }


        /*this.keyUp.reset();
        this.keyLeft.reset();
        this.keyDown.reset();
        this.keyRight.reset();* /
	},*/

    /*move: function(moveX, moveY, fromX, fromY, target) {
        
        toX = fromX + moveX;
        toY = fromY + moveY;
        self = this;


    //    var tile = this.map.getTileAt(toX, toY);
        var tile = this.objectLayer.getTileAt(toX, toY);

        this.finder.findPath(fromX, fromY, toX, toY, function( path ) {
            if (path === null || tile.properties.npc) {
                //console.warn("Path was not found.");
            } else {
                //console.log(path);
                self.moveSprite(path, target);
                self.isMoving = true;
            }
        });

        this.finder.calculate();
    },*/


    /*openTalentTree: function() {
        this.lastResume = "talentScene";

        this.scene.pause();
        this.scene.launch('talentScene');
    },
    
    openCharaScene: function() {
        this.lastResume = "charaScene";

        this.scene.pause();
        this.scene.launch('charaScene');
    },

    openControlScene: function() {
        this.lastResume = "controlScene";

        this.scene.pause();
        this.scene.launch("controlScene", { gameScene: true });
    },*/



    /*moveSprite: function(path, target) {
        // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
        var tweens = [];
        for(var i = 0; i < path.length-1; i++){
            var ex = path[i+1].x;
            var ey = path[i+1].y;
            tweens.push({
                targets: target,
                x: {value: ex*this.map.tileWidth, duration: 200}, // TODO: Velocity
                y: {value: ey*this.map.tileHeight, duration: 200},
                //onComplete: function () { console.log('onComplete'); console.log(arguments); },
            });
        }

        //this.scene.tweens.timeline({
        this.tweens.timeline({
            tweens: tweens
        });
    },*/

	gameOver: function() {
        //this.cameras.main.shake(500);
        this.camera.shake(500);
        
        this.fading(250, 250, 500);

        this.tweens.killAll();

		/*this.time.delayedCall(250, function() {
  		  	this.cameras.main.fade(250);
  		}, [], this);

		this.time.delayedCall(500, function() {
			this.cameras.main.resetFX();
        }, [], this);*/
        
    },
    
    fading: function(delayed1, time, delayed2) {
        this.time.delayedCall(delayed1, function() {
            //this.cameras.main.fade(time);
            this.camera.fade(time);
        }, [], this);

        this.time.delayedCall(delayed2, function() {
            //this.cameras.main.resetFX();
            this.camera.resetFX();
        }, [], this);
    },

    /*mapLoader: function(mapName) {

        // Display map
        this.map = this.make.tilemap({ key: mapName});
        //this.map = this.scene.make.tilemap({ key: 'map'});
        // The first parameter is the name of the tileset in Tiled and the second parameter is the key
        // of the tileset image used when loading the file in preload.
        var tiles = this.map.addTilesetImage('tiles', 'tileset');
        var tiles2 = this.map.addTilesetImage('objectset');
        var treeTiles = this.map.addTilesetImage('tree');
    //    this.map.createStaticLayer(0, tiles, 0,0);

        if (this.objectLayer)
            this.objectLayer.destroy();
        if (this.groundLayer)
            this.groundLayer.destroy();
        if (this.underPlayerLayer)
            this.underPlayerLayer.destroy();
        if (this.abovePlayerLayer)
            this.abovePlayerLayer.destroy();


        this.objectLayer = this.map.createStaticLayer('object', tiles2, 0, 0);
        this.groundLayer = this.map.createStaticLayer('ground', tiles, 0, 0);
        this.underPlayerLayer = this.map.createStaticLayer('underPlayer', treeTiles, 0, 0);
        this.abovePlayerLayer = this.map.createStaticLayer('abovePlayer', treeTiles, 0, 0);
        this.abovePlayerLayer.setDepth(2);

        // Marker that will follow the mouse
        /*this.marker = this.add.graphics();
        this.marker.lineStyle(3, 0xffffff, 1);
        this.marker.strokeRect(0, 0, this.map.tileWidth, this.map.tileHeight);*/

        // ### Pathfinding stuff ###
        // Initializing the pathfinder
        /*this.finder = new EasyStar.js();

        // We create the 2D array representing all the tiles of our map
        var grid = [];
        for(var y = 0; y < this.map.height; y++){
            var col = [];
            for(var x = 0; x < this.map.width; x++){
                // In each cell we store the ID of the tile, which corresponds
                // to its index in the tileset of the map ("ID" field in Tiled)
                col.push(this.getTileID(x,y));
            }
            grid.push(col);
        }

        this.finder.setGrid(grid);

        var tileset = this.objectLayer.tileset[0];
        //var tileset = this.objectLayer.tileset[0];
        var properties = tileset.tileProperties;
        var acceptableTiles = [];

        // We need to list all the tile IDs that can be walked on. Let's iterate over all of them
        // and see what properties have been entered in Tiled.
        for(var i = tileset.firstgid-1; i < tiles2.total; i++){ // firstgid and total are fields from Tiled that indicate the range of IDs that the tiles can take in that tileset
            if(!properties.hasOwnProperty(i)) {
                // If there is no property indicated at all, it means it's a walkable tile
                acceptableTiles.push(i+1);
                continue;
            }
            if(!properties[i].collide) acceptableTiles.push(i+1);
            if(properties[i].cost) this.finder.setTileCost(i+1, properties[i].cost); // If there is a cost attached to the tile, let's register it
        }
        this.finder.setAcceptableTiles(acceptableTiles);



        
        // Loading Enemies
        this.loadEnemies(mapName);
        this.loadNpc(mapName);
    },*/

    /*loadEnemies: function(mapName) {
        this.isMoving = false;

        this.tweens.killAll();
        this.enemies.forEach(element => {
            if (element.active) {
                //element.destroy();
                element.setVisible(false);
            }
        });

        if (mapName == "map3") {

            this.enemies = [this.test1, this.test2, this.test3, this.test4];
        }
        else if (mapName == "testmap") {
            let asdf = this.cache.json.get('asdf');*/
            /*var computerGuyTest = this.add.sprite(32,32,'bat').setScale(0.5);
            computerGuyTest.name = 'bat'; // tmp
            computerGuyTest.setDepth(1);
            computerGuyTest.x = 224;
            computerGuyTest.y = 160;
            computerGuyTest.setOrigin(0.25, 0);
            computerGuyTest.stats = {health: 20, attack: 30, speed: 100, luck: 60};
            computerGuyTest.ep = 30;*/

            /*let info = asdf.overworld.enemies.ai;

            var computerGuyTest = this.add.sprite(32,32, info.name).setScale(0.5);
            computerGuyTest.name = info.name; // tmp
            computerGuyTest.setDepth(info.depth);
            computerGuyTest.x = info.x;
            computerGuyTest.y = info.y;
            computerGuyTest.setOrigin(info.Origin[0], info.Origin[1]);
            computerGuyTest.stats = {health: info.stats.health, attack: info.stats.attack, speed: info.stats.speed, luck: info.stats.luck};
            computerGuyTest.ep = info.ep;
            computerGuyTest.move = info.move;

    
            this.enemies = [computerGuyTest];
        }
        else {
            this.enemies = [];
        }

        this.enemies.forEach(element => {
            if (element.active) {
                element.setVisible(true);

                if (element.move) {
                    this.enemieMove(element, 0);
                }
            }
        });
    },*/

    /*loadNpc(mapName) {
        this.npcList.forEach(element => {
            element.setVisible(false);
        });

        
        if (mapName == "map3") {
            this.npcList = [this.npc, this.npc2];
        } else {
            this.npcList = [];
        }

        this.npcList.forEach(element => {
            element.setVisible(true);

            this.map.layers[0].data[element.y / 32][element.x / 32].properties.npc = element;
        });
    },*/

    // TODO: delete code
//#region Aggro2
    /*checkAggro: function(player, ai) {
        var plX = Math.round(player.x / 32);
        var plY = Math.round(player.y / 32);
        var aiX = Math.round(ai.home[0] / 32);
        var aiY = Math.round(ai.home[1] / 32);

        var self = this;


        if (plX > aiX - 4 && plY > aiY - 4 && plX < aiX + 4 && plY < aiY + 4 && player.posChanged) {
            player.posChanged = false;
            //this.tweens.killTweensOf(ai);
            
            console.log("Aggro!!!!1");
        //}

        //if (plX < aiX + 4 && plX + 1 > aiX - 3 && plY < aiY + 4 && aiY + 1 > aiY - 3) {
            //console.log("Aggro!!!!!!");
            ai.aggro = 1;

        //    var tile = this.map.getTileAt(plX, plY);
            var tile = this.objectLayer.getTileAt(plX, plY);

            this.finder.findPath(aiX, aiY, plX, plY, function( path ) {
                if (path === null || tile.properties.npc == true) {
                    //console.warn("Path was not found.");
                } else {
                    //console.log(path);
                    self.moveSprite(path, ai);
                }
            });

            this.finder.calculate();

        } else if (ai.aggro == 1 && player.posChanged) {
            this.tweens.killTweensOf(ai);
            ai.aggro = 0;
            //this.enemieMove(ai, 0);


            this.finder.findPath(Math.round(ai.x / 32), Math.round(ai.y / 32), aiX, aiY, function( path ) {
                if (path === null) {
                    //console.warn("Path was not found.");
                } else {
                    //console.log(path);
                    self.moveSprite(path, ai);
                }
            });
        }
    },*/

//#endregion

    /*enemieMove: function(ai, num) {
        var i;

        if (num+1 == ai.move.length) {
            i = 0;
        } else {
            i = num+1;
        }

        var toX = ai.move[i][0];
        var toY = ai.move[i][1];
        var fromX = Math.round(ai.x / 32)
        var fromY = Math.round(ai.y / 32);

        var self = this;

    //    var tile = this.map.getTileAt(toX, toY);
        var tile = this.objectLayer.getTileAt(toX, toY);

        this.finder.findPath(fromX, fromY, toX, toY, function( path ) {
            if (path === null || tile.properties.npc) {
                //console.warn("Path was not found.");
            } else {
                //console.log(path);
                self.moveSprite(path, ai, i);
            }
        });

        this.finder.calculate();
    },*/

    /*moveSprite: function(path, target, num = 0) {
        // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline

        var self = this;
        var duration = target.duration || 200;

        var tweens = [];
        for(var i = 0; i < path.length-1; i++){
            var ex = path[i+1].x;
            var ey = path[i+1].y;
            tweens.push({
                targets: target,
                x: {value: ex*this.map.tileWidth, duration: duration},
                y: {value: ey*this.map.tileHeight, duration: duration},
                onComplete: function() {
                   if (target.name == "Schleim" && target.aggro == 3) {
                        target.home = [target.x, target.y];
                        //self.checkAggro(self.player, target);
                        
                        console.log("target.home");
                    } else if (target.name == "Player") {
                        self.isMoving = false;
                        self.player.posChanged = true;

                        //self.checkAggro(self.player, self.test2);
                    }
                }
            });
        }


        this.tweens.timeline({
            tweens: tweens,
            onComplete: function () {
                //console.log('onComplete');
                if (target.name != "Player")
                    self.enemieMove(target, num);
            }
        });

       //console.log(this.tweens);

    },*/

    /*blink: function(enemie, tween) {
        this.tweens.add({
            targets: enemie,
            scaleX: 0,
            scaleY: 0,
            duration: 1,
            repeat: 5,
            yoyo: true,
            hold: 500,
            repeatDelay: 500,
            onComplete: function() {
                enemie.active = true;
                if (tween)
                    tween.resume();
            }
        });
    }*/

});



