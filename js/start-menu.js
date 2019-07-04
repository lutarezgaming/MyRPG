var startMenu = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:

    function startMenu()
    {
        Phaser.Scene.call(this, { key: 'startMenu'/*, active: true*/ });
    },

    preload: function () {
        this.load.image('startMenuBG', 'assets/startMenuBG.jpg');
		this.load.image('background', 'assets/sky.png');
        this.load.image('btn-close', 'assets/close.png');
        this.load.image('deadly-strike', 'assets/talent/deadly-strike.png');


        this.load.bitmapFont('testFont', 'assets/font/font.png', 'assets/font/font.fnt');
        this.load.image("testButton", "assets/button/Button5.jpg");
        this.load.image("testButton2", "assets/button/Button4.jpg");
        
        
		this.load.image('textbox', 'assets/textbox1.png');
    },

    create: function() {
        this.input.setDefaultCursor('url(assets/mouse/test.cur), pointer');


        this.add.image(0, 0, 'startMenuBG').setOrigin(0, 0).setScale(0.75);

        this.titel = this.add.text(250, 70, 'DemoCraft', { fontSize: '70px', fill: '#f00', fontStyle: 'bold' });
        this.titel.setStroke('#000', 3);

        this.subtitel = this.add.text(300, 130, 'Rise of Stupsi-chan', { fontSize: '25px', fill: '#f00', fontStyle: 'bold' });
        this.subtitel.setStroke('#000', 1);
        

        this.werbung = this.add.graphics();
		this.werbung.fillStyle(0x000000, 0.4);
        this.werbung.fillRect(800, 180, 960, 300);

        this.werbungtxt = this.add.text(820, 230, 'Hier\nkönnte\nIhre\nWerbung\nstehen\n', { fontSize: '30px', fill: '#fff'});
        this.werbungtxt.setAlign("center");

        this.isFading = false;
        new GameButton(this, 400, 300, "Neues Spiel", () => this.newGame());
        new GameButton(this, 400, 400, "Steuerung", () => this.startControl());
    },

    newGame: function() {
        if (this.isFading) return;
        this.isFading = true;
        this.cameras.main.fadeOut(300);

        //currentEnemie = null;
        //flee = false;

        playerGuy = new Player("Stupsi");
        playerGuy.useUnusedPassive();


//#region loader-json
        const test = {
            map3: {
                map: "json/maps/map3.json",
                enemies: [{
                    icon: "spider",
                    x: 18,
                    y: 1,
                    scale: 0.5,
                    origin: {x: 0, y: 0},
                    move: [[18, 1], [18, 3]],
                    duration: 200,
                    chara: [{
                        name: "Spinni",
                        icon: "spider",
                        stats: {maxHealth: 100, health: 100, attack: 10, luck: 0},
                        attacks: [],
                        passive: [],
                        ep: 70,
                        options: {},
                    }]
                },{
                    icon: "slime",
                    x: 1,
                    y: 15,
                    scale: 0.5,
                    origin: {x: 0, y: 0},
                    move: [[1, 15], [13, 15], [3, 4]],
                    duration: 400,
                    aggro: {
                        rangeX: 3,
                        rangeY: 3,
                    },
                    chara: [{
                        name: "Schleim",
                        icon: "slime",
                        stats: {maxHealth: 10, health: 10, attack: 1, luck: 2},
                        attacks: [],
                        passive: [],
                        ep: 1000,
                        options: {},
                    },{
                        name: "Spinni",
                        icon: "spider",
                        stats: {maxHealth: 100, health: 90, attack: 100, luck: 2},
                        attacks: [],
                        passive: [],
                        ep: 1,
                        options: {},
                    }]
                },{
                    icon: "bat",
                    x: 5,
                    y: 3,
                    scale: 0.5,
                    origin: {x: 0.25, y: 0},
                    move: [[5, 3], [20, 3]],
                    duration: 100,
                    chara: [{
                        name: "Feldermaus",
                        icon: "bat",
                        stats: {maxHealth: 20, health: 20, attack: 30, luck: 60},
                        attacks: [],
                        passive: [],
                        ep: 30,
                        options: {},
                    }]
                },{
                    icon: "deceleon",
                    x: 3,
                    y: 1,
                    scale: 0.25,
                    origin: {x: 0.35, y: 0.5},
                    chara: [{
                        name: "Deceleon",
                        icon: "deceleon",
                        stats: {maxHealth: 500, health: 500, attack: 200, luck: 30},
                        attacks: [],
                        passive: [],
                        ep: 200,
                        options: {noFlee: true},
                    },{
                        name: "Deceleon",
                        icon: "deceleon",
                        stats: {maxHealth: 500, health: 500, attack: 200, luck: 30},
                        attacks: [],
                        passive: [],
                        ep: 10,
                        options: {},
                    }]
                },],
                npc: [{
                    name: "Test1",
                    icon: "daemarbora",
                    x: 20,
                    y: 5,
                    scale: 0.25,
                    origin: {x: 0, y: 0}
                },{
                    name: "Test2",
                    icon: "daemarbora",
                    x: 22,
                    y: 3,
                    scale: 0.25,
                    origin: {x: 0, y: 0}
                },{
                    name: "Test3",
                    icon: "daemarbora",
                    x: 17,
                    y: 10,
                    scale: 0.25,
                    origin: {x: 0, y: 0}
                }]
            },
            testmap: {
                map: "json/maps/testmap.json",
                enemies: [{
                    icon: "bat",
                    x: 7,
                    y: 5,
                    scale: 0.5,
                    origin: {x: 0.25, y: 0},
                    move: [[12, 2], [3, 5], [7, 7]],
                    duration: 200,
                    chara: [{
                        name: "Feldermaus",
                        icon: "bat",
                        stats: {maxHealth: 20, health: 20, attack: 30, luck: 60},
                        attacks: [],
                        passive: [],
                        ep: 30,
                        options: {},
                    }]
                }],
                npc: []
            },
            infinityMap: {
                map: "json/maps/infinityMap.json",
                enemies: [],
                npc: [],
                shader: true,
                ambientColor: "0x000000"
            },
            assets: {
                image: [{
                    key: "tiles",
                    url: "assets/tilesets/gridtiles.png"
                },{
                    key: "tree",
                    url: "assets/tilesets/tree-variations.png"
                },{
                    key: "bat",
                    url: ["assets/enemies/bat.png", "assets/enemies/bat_n.png"]
                },{
                    key: "slime",
                    url: ["assets/enemies/green_slime.png", "assets/enemies/green_slime_n.png"]
                },{
                    key: "spider",
                    url: ["assets/enemies/spider.png", "assets/enemies/spider_n.png"]
                },{
                    key: "deceleon",
                    url: ["assets/enemies/deceleon.png", "assets/enemies/deceleon_n.png"]
                }],
                spritesheet: [{
                    key: "daemarbora",
                    url: "assets/enemies/daemarbora.png",
                    frame: { frameWidth: 128, frameHeight: 128}
                },]
            }
        };


        const test3 = {
            area2: {
                map: "json/maps/area2.json",
                enemies: [],
                npc: []
            },
            cave: {
                map: "json/maps/cave.json",
                enemies: [],
                npc: [],
                shader: true
            },
            assets: {
                image: [{
                    key: "terrain-1",
                    url: "assets/tilesets/terrain-1.png"
                }]
            }
        }
        
        //console.log(JSON.stringify(test, null, 2));
//#endregion


        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('OverworldMapScene');
            this.scene.start('FightScene');
            
            //this.cameras.main.resetFX();
        });
    },

    startControl: function() {
        if (this.isFading) return;
        // TODO: Info: Start zerstört die aktuelle Scene
        this.scene.start('controlScene', {gameScene: false});
    },
});