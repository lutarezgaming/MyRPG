class OverworldMapScene extends Phaser.Scene{
    constructor() {
        super({key: "OverworldMapScene"}); // call the mother with the class key as parameter
    }

    /**
     * Load the assets before the scene is created
     */
    preload() {
        this.load.image("objectset", ["assets/tilesets/objectset.png", "assets/tilesets/objectset_n.png"]);
        this.load.image("phaserguy", "assets/phaserguy.png");

        this.load.spritesheet('back', 'assets/anim/back.png', { frameWidth: 28, frameHeight: 40 });
        this.load.spritesheet('front', 'assets/anim/front.png', { frameWidth: 28, frameHeight: 40 });
        this.load.spritesheet('left', 'assets/anim/left.png', { frameWidth: 28, frameHeight: 40 });
        this.load.spritesheet('right', 'assets/anim/right.png', { frameWidth: 28, frameHeight: 40 });

        // Load Plugin for the animated tiles
        this.load.scenePlugin({
            key: 'AnimatedTiles',
            url: 'js/AnimatedTiles.js',
            sceneKey: 'animatedTiles'
        });
    }

    /**
     * function to set up the scene
     */
    create() {
        this.mainAreaName = null; // init the mainAreaName variable
        this.subAreaName = null; // init the subAreaName variable
        this.isloading = true; // init and set loading variable to true
        this.isWalking = false; // init walking variable
        this.isTalking = false;
        this.activeEnemies = []; // init activeEnemie Array
        this.cachedEnemies= {}; // init the cachedEnemie Object
        this.activeNPC = [];
        this.cachedNPC = {};
        this.hasShader = false; // init shader variable

        
        // Generate Light for the player
        this.playerLight = this.lights.addLight(48, 48, 200).setColor(0xffffff).setIntensity(1);
        this.playerLight.name = "playerLight";


        this.cameras.main.alpha = 0; // set the alpha of the camera to 0

        this.loadMainArea("testground", "map3"); // init the area loader

        // Add player sprite
        this.player = this.add.sprite(32,32,'phaserguy').setOrigin(-0.05, 0.3).setDepth(1);
        this.player.name = "Player"; // set name to 'Player' TODO: wirds gebraucht?
        this.cameras.main.startFollow(this.player); // set the camera following to the player


        // set the movement hotkeys
        this.generateMoveKeys();

//#region Animation
        this.anims.create({
            key: "walk-left",
            frames: this.anims.generateFrameNames("left", { start: 1, end: 2}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "stand-left",
            frames: [{key: "left", frame: 0}],
            frameRate: 10
        });
        this.anims.create({
            key: "walk-right",
            frames: this.anims.generateFrameNames("right", { start: 0, end: 1}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "stand-right",
            frames: [{key: "right", frame: 2}],
            frameRate: 10,
        });
        this.anims.create({
            key: "walk-back",
            frames: this.anims.generateFrameNames("back", { start: 1, end: 2}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "stand-back",
            frames: [{key: "back", frame: 0}],
            frameRate: 10,
        });
        this.anims.create({
            key: "walk-front",
            frames: this.anims.generateFrameNames("front", { start: 1, end: 2}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "stand-front",
            frames: [{key: "front", frame: 0}],
            frameRate: 10,
        });
//#endregion

        this.input.keyboard.on('keydown', (event) => {
            if (this.isloading) return;

            if (event.keyCode == hotkeys.confirm.keyCode)
                this.npcInteraction();
            else if (event.keyCode == hotkeys.talents.keyCode)
                this.openTalentTree();
            else if (event.keyCode == hotkeys.character.keyCode)
                this.openCharaScene();
            else if (event.keyCode == hotkeys.control.keyCode)
                this.openControlScene();
        });

        // logic when the scene is resumed
        this.events.on('resume', (system = null, state = null) => {
            this.input.manager.canvas.style.cursor = this.input.manager.defaultCursor; // reset the cursor to default, because after resume from GameButton the default won't be called

            // reset the key input, there was a problem that the key doesn't reset by scene switches
            this.keyUp.reset();
            this.keyLeft.reset();
            this.keyDown.reset();
            this.keyRight.reset();


            if (state == "won") { // if the won state is passed, than call the fightEnd function
                this.fightEnd(this.fightingEnemie);
            }
            else if (state == "flee") { // if the flee state is passed, than reset the life and set a blink tween
                const enemie = this.fightingEnemie;
                enemie.active = false; // set active to false, for no collision detection

                enemie.chara.forEach((ele) => { ele.stats.health = ele.stats.maxHealth; }); // loop all enemies and reset the health


                let resumeTween = null; // tween to resume after blink
                if (enemie.aggro) { // check if enemie has aggro
                    // check the aggro state and pause the correct tween/timeline
                    if (enemie.aggro.state == 2)
                        resumeTween = enemie.aggro.tweens.escape.pause();
                    else if (enemie.aggro.state == 1)
                        resumeTween = enemie.aggro.tweens.aggro.pause();
                    else
                        resumeTween = enemie.aggro.tweens.move.pause();
                }
                else { 
                    const tween = this.tweens.getTweensOf(enemie); // get all tweens of a sprite

                    if (tween[0]) // check if there is a tween
                        resumeTween = tween[0].pause(); // pause the tween
                }

                this.blink(enemie, resumeTween); // start the blink tween
            }

            if (state.keyChanged)
                this.generateMoveKeys();
        });
    }

    /**
     * function loop that is called every frame
     */
    update() {
        //console.log(this.tweens._active);
        //console.log(this.isloading, this.isWalking, this.tweens._active);
        if (this.isloading) return; // if is loading than break

        // loop through all enemies and check for collision
        this.activeEnemies.forEach(enemie => {
            this.collisionSprite(this.player, enemie);
        })


        if (this.isWalking) return; // if player is already walking, than break the function

        // if a walking key is down, than start player walking
        if (this.keyUp.isDown)
            this.movePlayer(0, -32, "back");
        else if (this.keyDown.isDown)
            this.movePlayer(0, 32, "front");
        else if (this.keyLeft.isDown)
            this.movePlayer(-32, 0, "left");
        else if (this.keyRight.isDown)
            this.movePlayer(32, 0, "right");

    }

    generateMoveKeys() {
        this.keyUp = this.input.keyboard.addKey(hotkeys.up.keyCode);
		this.keyLeft = this.input.keyboard.addKey(hotkeys.left.keyCode);
		this.keyDown = this.input.keyboard.addKey(hotkeys.down.keyCode);
        this.keyRight = this.input.keyboard.addKey(hotkeys.right.keyCode);
    }

    openTalentTree() {
        this.scene.pause();
        this.scene.launch('talentScene');
    }
    
    openCharaScene() {
        this.scene.pause();
        this.scene.launch('charaScene');
    }

    openControlScene() {
        this.scene.pause();
        this.scene.launch("controlScene", { gameScene: true });
    }

    /**
     * check if there is collision between player and enemie, if collision than start the fight
     * @param {Phaser.GameObjects.Sprite} player the player sprite
     * @param {Phaser.GameObjects.Sprite} enemie the enemie sprite
     */
    collisionSprite(player, enemie) {
        if (!enemie.active) { // if sprite is inactive than break.
            return;
        }

        // if there is no collision than break the function. Note: if the first is ture, then the other arn't needed to calculate -> Better Performance
        if (player.y >= enemie.y+32 || player.x+32 <= enemie.x || player.y+32 <= enemie.y || player.x >= enemie.x+32) {
            return;
        }

        this.scene.pause(); // pause this scene
        this.scene.resume('FightScene', [playerGuy, enemie.chara]); // resume the fight scene and pass the data
        this.fightingEnemie = enemie; // set the enemie to the fighting variable
    }


    /**
     * Remove the enemie after a won battle
     * @param {*} enemie enemie-sprite of the current battle
     */
    fightEnd(enemie) {
        // TODO: überlegen on gameover hier her kommt
		if (playerGuy.stats.health <= 0) {
			playerGuy.alive = false;
			//this.gameOver(); //TODO: Gameover
		} else {
            this.tweens.killTweensOf(enemie); // Kill all tweens of the enemie
            enemie.destroy(); // Destroy the sprite

            this.activeEnemies = this.activeEnemies.filter(ele => ele.active == true); // Remove it from the active-enemie array
            this.cachedEnemies[this.subAreaName] = this.activeEnemies; // update the cached enemies
        }
        this.fightingEnemie = null; // Reset the reference
	}


    /**
     * Move the player
     * @param {Number} x the distance the player on the x-axis move in px
     * @param {Number} y the distance the player on the y-axis move in px
     * @param {String} direction in wich direction he move
     */
    movePlayer(x, y, direction) {
        if (this.isloading)  { return; } // if loading is active, than break the function
        this.isWalking = true;


        const newX = this.player.x + x; // New X position
        const newY = this.player.y + y; // New Y position


        const tile = this.map.getTileAtWorldXY(newX, newY, true); // get the tile of the new position

        if (tile == null || tile.properties.collide == true) { // if is there no tile or has collision, than no walking with stand animation
            this.player.anims.play("stand-"+direction, true);
            this.isWalking = false;
            return;
        }

        for (let i = 0; i < this.activeNPC.length; i++) {
            const npc = this.activeNPC[i];
            if (newY >= npc.y+32 || newX+32 <= npc.x || newY+32 <= npc.y || newX >= npc.x+32) {
                continue;
            }
            this.player.anims.play("stand-"+direction, true);
            this.isWalking = false;
            return;
        }

        this.player.anims.play('walk-'+direction, true); // start the walking animation

        this.tweens.add({ // tween for the movement
            targets: this.player,
            x: newX,
            y: newY,
            duration: 200, // TODO: dynamischer wert vom spieler
            onComplete: this._playerCompleteMove, // when complete call the function
            onCompleteParams: [direction, tile]
        });


        if (this.hasShader) // if a shader is active, than a tween for the player-light
            this.tweens.add({
                targets: this.playerLight,
                x: newX+16,
                y: newY+16,
                duration: 200
            });
    }

    /**
     * Check if there is still a input and the current standing tile
     * @param {Phaser.Tweens.Tween} tween tween from where it is called
     * @param {Array} sprite the target of the tweens
     * @param {String} direction wich direction it was moving
     * @param {Phaser.Tilemaps.Tile} tile the tile of the postion of the sprite
     */
    _playerCompleteMove(tween, sprite, direction, tile) {
        tween.stop(); // stop the tween
        const self = this.parent.scene; // get the scene context

        const canMove = self.checkStandingTile(tile, sprite); // check the tile for port-tiles


        if (!canMove) { // if player can't move than start the stand animation and set walking to false
            self.isWalking = false;
            self.player.anims.play("stand-"+direction, true);
            return;
        }

        // if there is still a input, than move the player again
        if (self.keyUp.isDown)
            self.movePlayer(0, -32, "back");
        else if (self.keyDown.isDown)
            self.movePlayer(0, 32, "front");
        else if (self.keyLeft.isDown)
            self.movePlayer(-32, 0, "left");
        else if (self.keyRight.isDown)
            self.movePlayer(32, 0, "right");
        else { // else set walking to false and start the stand animation
            self.isWalking = false;
            self.player.anims.play("stand-"+direction, true);
        }
    }

    /**
     * Check the tile for port properties
     * @param {Phaser.Tilemaps.Tile} tile the tile which is checked
     * @param {Array} targets the targets which should be ported
     * @returns {Boolean} true if there is no port property set
     */
    checkStandingTile(tile, targets) {
        const {subArea = null, x = null, y = null, noFade = null} = tile.properties; // deconstruct the tile-properties and set a default value if the property is not set

        if (subArea) { // if there is a subArea propertie, than call function to check which loader should called
            this.isloading = true;
            this.fadeCamera(0, 300, () => {this.checkWhichArea(tile)});
        }
        else if (x || y) { // if there is a x or y-propertie, then port the target
            if (noFade) // if noFade is set, then port with no fade
                this._portSprite(targets[0], x, y, false);
            else { // else port with fade effect
                this.isloading = true;
                this.fadeCamera(0, 150, () => { this._portSprite(targets[0], x, y, true) });
            }
        }
        else // else return true
            return true;

        return false; // if is porting than return false
    }

    /**
     * Change the position of a sprite
     * @param {Phaser.GameObjects.Sprite} sprite The sprite to be ported
     * @param {Number} x x position of the grid
     * @param {Number} y y position of the grid
     * @param {Boolean} fadeIn true when it should fade the camera back in
     */
    _portSprite(sprite, x = null, y = null, fadeIn = false) {
        x = x*32 || sprite.x; // calculate x from grid to world-postion, if not set, than take the sprite x position
        y = y*32 || sprite.y; // calculate y from grid to world-postion, if not set, than take the sprite y position

        sprite.setPosition(x, y); // set the new position


        if (this.hasShader) { // check if a shader is active
            const tween = this.tweens.getTweensOf(this.playerLight); // get the tweens of the light

            if (tween[0]) // check if there is a tween
                tween[0].stop(); // stop the tween
            this.playerLight.setPosition(x+16, y+16); // set the new postion of the light
        }

        if (fadeIn) // if fadeIn is true, than fade the camera in
            this.fadeCamera(1, 150, () => {this.isloading = false});
    }


//#region Loader
    /**
     * Check which loader should start
     * @param {Phaser.Tilemaps.Tile} tile Tile-Object to check the properties
     */
    checkWhichArea(tile) {
        const { mainArea = null, subArea = null, ...seetings} = tile.properties;

        if (mainArea) { // call the mainArea-Loader, when the property is set
            this.loadMainArea(mainArea, subArea, seetings); }
        else if (subArea) // call the subArea-Loader, when the property is set
            this.loadSubArea(subArea, seetings);

    }

    /**
     * Unload and Destroy every Enemie & NPC Sprite
     */
    unloadSprites() {
        this.activeEnemies = []; // set the active enemies to a empty array

        for (const key in this.cachedEnemies) { // loop through all properties
            this.cachedEnemies[key].forEach(element => { // loop through all sprites in the array
                element.destroy(); // destroy the sprite
            });

            delete this.cachedEnemies[key]; // remove the property from the object
        }

        for (const key in this.cachedNPC) {
            this.cachedNPC[key].forEach(element => {
                element.destroy();
            });

            delete this.cachedNPC[key];
        }
    }

    /**
     * Load the main-area.json and then the subarea
     * @param {String} areaName name of the main area
     * @param {String} subAreaName name of the sub area
     * @param {Object} settings optional data like startposition
     */
    loadMainArea(mainAreaName, subAreaName, settings = {}) {
        this.mainAreaName = mainAreaName;
        this.subAreaName = subAreaName;

        this.unloadSprites();

        this.load.once('complete', () => { this.loadAssets(subAreaName, settings) }, this);
        this.load.json(mainAreaName, "json/areas/"+mainAreaName+".json");
        this.load.start();
    }


    /**
     * Load all assets of the main-area
     * @param {String} subAreaName name of the sub-area that is loaded after completed load
     * @param {Object} settings optional data like startposition for the sub-area
     */
    loadAssets(subAreaName = null, settings = {}) {
        const data = this.cache.json.get(this.mainAreaName);

        this.load.once('complete', () => {this.loadSubArea(subAreaName, settings)}, this);
        // load all images
        if (data.assets.image)
            data.assets.image.forEach(element => {
                this.load.image(element.key, element.url);
            });
        // load all spritesheets with frame size
        if (data.assets.spritesheet)
            data.assets.spritesheet.forEach(element => {
                this.load.spritesheet(element.key, element.url, element.frame);
            });
        
        this.load.start();
    }

    /**
     * Load json for tiled-map
     * @param {String} subAreaName Name of the sub-area
     * @param {Object} settings optional data like startposition
     */
    loadSubArea(subAreaName = null, settings = {}) {
        if (typeof subAreaName == "string") // if subAreaName is a string, than set it as new name
            this.subAreaName = subAreaName;

        const data = this.cache.json.get(this.mainAreaName); // get loader data


        const lightArr= [];
        this.lights.forEachLight(light => { // loop through each light
            if (light.name !== "playerLight") // if is not the player light, than push it to a array
                lightArr.push(light);
        });

        lightArr.forEach(light => { // loop through the nonPlayer-lights and remove it
            this.lights.removeLight(light);
        });


        if (data[this.subAreaName].shader) { // check if a shader is set
            this.hasShader = true; // set tracking-variable to true

            const color = data[this.subAreaName].ambientColor || 0x111111; // get the ambient-color if set, else use the default

            this.lights.enable().setAmbientColor(color); // enable lights and set the abmient-color
        }
        else { // else disable the lights
            this.lights.disable();
            this.hasShader = false;
        }

        // load the tiledmap json and then start the map generator
        this.load.once('complete', () => {this._generateMap(settings)}, this);
        this.load.tilemapTiledJSON(this.subAreaName, data[this.subAreaName].map);
        this.load.start();
    }


    /**
     * Generate the map
     * @param {Object} settings optional data like startposition
     */
    _generateMap(settings = {}) {
        const { x = null, y = null } = settings; // get the x & y property of the settings
        let setBounds = true; // set world bounds variable to true

        if (this.map) // if a map exist, than destroy it
            this.map.destroy();

        this.map = this.make.tilemap({key: this.subAreaName}); // Make a new map

        let tiles = []; // the used tileset array

        this.map.tilesets.forEach(element => { // loop through all tilesets
            tiles.push(this.map.addTilesetImage(element.name)); // Add a Tileset image and push it to the tileset-array
        });

        this.map.layers.forEach(element => { // loop through all of the layers
            let layer = this.map.createDynamicLayer(element.name, tiles, 0, 0); // Create a dynamic Layer

            if (element.properties.constructor === Array) { // if there are properties set than loop through all
                element.properties.forEach(ele => {
                    if (ele.name == "depth") layer.setDepth(ele.value); // change the depth if is set
                    else if (ele.name == "noBounds") setBounds = false; // change the wourldbounce to if is set
                });
            }

            if (this.hasShader) // if shader is active, than acitve the Light2D pipeline, else the layer isn't affected from the shader
                layer.setPipeline('Light2D');

            if (element.name == "technical") // TODO: vlt auserhalb der loop setzen?s
                layer.setVisible(false);
        });
        this.map.setLayer("technical"); // set the object layer as default

        this.animatedTiles.init(this.map); // animate the tiles if there is a animation
        

        if (setBounds) this.cameras.main.setBounds(0, 0, this.map.width*32, this.map.height*32); // if bounds is set than set the bounds to the map border
        else this.cameras.main.removeBounds(); // else remove the bounce


        let startPoint = null;
        if (this.map.objects.length > 0) { // check if there is a object-layer defined
            startPoint = this.map.findObject("objLayer", ele => ele.name == "startPoint"); // check for a startpoint object

            if (this.hasShader) { // check if shader is active
                this.map.findObject("objLayer", ele => { // loop through the objects
                    if (ele.name == "light") { // check if name is light
                        const x = ele.x + (ele.width / 2); // get the center x position
                        const y = ele.y + (ele.height / 2); // get the center y position

                        const eleRadius = ele.properties.find(prop => prop.name == "radius") || {}; // get the radius property
                        const eleColor = ele.properties.find(prop => prop.name == "color") || {}; // get the color property
                        const eleIntensity = ele.properties.find(prop => prop.name == "intensity") || {}; // get the intensity property

                        // get the values or use the defaults
                        const radius = eleRadius.value || 100;
                        const color = eleColor.value || 0xffffff;
                        const intensity = eleIntensity.value || 1;

                        this.lights.addLight(x, y, radius).setColor(color).setIntensity(intensity); // add the light
                    }
                        
                });
            }
        }


        if (x || y) // if the tile has a position set, than port the sprite
            this._portSprite(this.player, x, y, false);
        else if (startPoint) // else if a startpoint is set than use this position
            this.player.setPosition(startPoint.x, startPoint.y);

        
        if (this.hasShader) // if shader is active, set the position to the player
            this.playerLight.setPosition(this.player.x+16, this.player.y+16);


        // ----Easystar-----
        this.finder = new EasyStar.js();

        // We create the 2D array representing all the tiles of our map
        let grid = [];
        for(let y = 0; y < this.map.height; y++){
            let col = [];
            for(let x = 0; x < this.map.width; x++){
                // In each cell we store the ID of the tile, which corresponds
                // to its index in the tileset of the map ("ID" field in Tiled)
                col.push(this.getTileID(x,y));
            }
            grid.push(col);
        }

        this.finder.setGrid(grid);

        const tileset = this.map.getTileset("objectset");
        const properties = tileset.tileProperties;
        
        let acceptableTiles = [];

        // We need to list all the tile IDs that can be walked on. Let's iterate over all of them
        // and see what properties have been entered in Tiled.
        for(let i = tileset.firstgid-1; i < tileset.total; i++){ // firstgid and total are fields from Tiled that indicate the range of IDs that the tiles can take in that tileset
            if(!properties.hasOwnProperty(i)) {
                // If there is no property indicated at all, it means it's a walkable tile
                acceptableTiles.push(i+1);
                continue;
            }
            if(!properties[i].collide) acceptableTiles.push(i+1);
            if(properties[i].cost) this.finder.setTileCost(i+1, properties[i].cost); // If there is a cost attached to the tile, let's register it
        }
        this.finder.setAcceptableTiles(acceptableTiles);

        this.loadEnemies();
        this.loadNPC();
        
        this.fadeCamera(1, 300, () => {
            this.isloading = false;
            this.activeEnemies.forEach(ele => {
                this.enemieMove(ele); // Start moving of the enemie
            });
        }); // Fade the camera in and after complete, afterwards set loading to false
    }


    /**
     * Load the enemies
     */
    loadEnemies() {
        this.tweens.killAll(); // Kill all tweens

        // set the visibility of all active enemie-sprite to false
        this.activeEnemies.forEach(element => {
            element.setVisible(false);
        });
        this.activeEnemies = []; // assigne a empty array for the new enemies


        // if cached enemies are available use this, else generate new enemies
        if (this.cachedEnemies[this.subAreaName]) {
            this.activeEnemies = this.cachedEnemies[this.subAreaName];

            this.activeEnemies.forEach(element => { // set the enemies active again, and start moving
                if (element.active) {
                    element.setVisible(true);
                    this.enemieMove(element);
                }
            })
            return;
        }

        const data = this.cache.json.get(this.mainAreaName); // get data of the main area

        // loop throw all enemie-datas of the sub area and generate new enemies
        data[this.subAreaName].enemies.forEach(element => {
            // generate the sprite for the overworld
            const enemie = this.add.sprite(element.x * 32, element.y * 32, element.icon).setScale(element.scale);
            enemie.setDepth(1);
            enemie.setOrigin(element.origin.x, element.origin.y);
            enemie.move = element.move || null;
            enemie.duration = element.duration || null;
            enemie.nextMoveNum = 0;

            if (this.hasShader) // if a shader is active, than set the Light2D pipline, else the sprite isn't affected by the shader
                enemie.setPipeline('Light2D');

            if (element.aggro) { // if aggro is defined, than set the aggro object
                enemie.aggro = element.aggro;
                enemie.aggro.state = 0;
                enemie.aggro.home = {x: enemie.x, y: enemie.y};
                enemie.aggro.tweens = {
                    move: null,
                    escape: null,
                    aggro: null,
                }
            }

            enemie.chara = [];
            // generate ai-class for the fight scene
            element.chara.forEach(ele => {
                enemie.chara.push(new KIClass(ele.name, ele.icon, ele.stats, ele.attacks, ele.passive, ele.ep, ele.options));
            })

            this.activeEnemies.push(enemie); // push it to the active enemie array

        });

        this.cachedEnemies[this.subAreaName] = this.activeEnemies; // make cache entry for the new enemies

        console.log(this.cachedEnemies);
    }

    loadNPC() {
        this.activeNPC.forEach(element => {
            element.setVisible(false);
        });
        this.activeNPC = [];

        if (this.cachedNPC[this.subAreaName]) {
            this.activeNPC = this.cachedNPC[this.subAreaName];

            this.activeNPC.forEach(element => { // set the npc active again
                if (element.active) {
                    element.setVisible(true);
                }
            });
            return;
        }

        const data = this.cache.json.get(this.mainAreaName);

        data[this.subAreaName].npc.forEach(npc => {
            const sprite = this.add.sprite(npc.x*32, npc.y*32, npc.icon).setScale(npc.scale).setOrigin(npc.origin.x, npc.origin.y).setDepth(1);
            sprite.name = npc.name;

            this.activeNPC.push(sprite);
        });

        this.cachedNPC[this.subAreaName] = this.activeNPC;

        console.log(this.cachedNPC);
    }
//#endregion

    /**
     * Return the index of tile
     * @param {Number} x x position of the tile
     * @param {Number} y y position of the tile
     * @returns {Number} Index of the tile
     */
    getTileID(x, y) {
        return this.map.getTileAt(x, y).index;
    }

    /**
     * Fade Camera In/out
     * @param {Number} alpha value of end alpha
     * @param {Number} duration duration for fading
     * @param {CallableFunction} completeCallback callback that is fired when tween is complete
     * @param {CallableFunction} startCallback callback that is fired when tween is starting
     */
    fadeCamera(alpha = 1, duration = 300, completeCallback = () => {}, startCallback = () => {}) {
        this.tweens.add({
            targets: this.cameras.main,
			duration: duration,
			alpha: alpha,
            onComplete: completeCallback,
            onStart: startCallback,
        });
    }


    /**
     * Add a tween to make the target blinking
     * @param {Phaser.GameObjects.Sprite} enemie the target enemie-sprite
     * @param {Phaser.Tweens.Tween} tween // the paused tween that should be resumed
     */
    blink(enemie, tween = null) {
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
                enemie.active = true; // set the enemie active, for the collison detection
                if (tween)
                    tween.resume(); // resume the tween, if there is a tween
            }
        });
    }


    /**
     * Calculate the pause between the movements and start the movement afterwards
     * @param {Phaser.GameObjects.Sprite} enemie The enemie sprite which should move
     */
    enemieMove(enemie) { // TODO: umbenennen
        if (this.isloading) return;
        if (enemie.move == null) return; // if no move is defined, than stop the function

        const delay = Phaser.Math.Between(1, 500); // calulate the pause in milliseconds

        this.time.delayedCall(delay, this._enemieMove, [enemie], this); // after the pause call the movement function
    }

    /**
     * Calculate the movement of the sprite
     * @param {Phaser.GameObjects.Sprite} enemie The enemie sprite which should move
     */
    _enemieMove(enemie) {
        if (this.isloading) return;
        let { nextMoveNum = 0 } = enemie; // Get the index for the next movement

        const toX = enemie.move[nextMoveNum][0]; // get the x position of the destination
        const toY = enemie.move[nextMoveNum][1]; // get the y position of the destination

        const fromX = Math.floor(enemie.x / 32); // get the x position where is started in grid coordinate
        const fromY = Math.floor(enemie.y / 32); // get the y position where is started in grid coordinate

        this.finder.findPath(fromX, fromY, toX, toY, (path) => { // get the best path
            if (path === null) // if there is no path, than thow a warning
                console.warn("Path was not found.")
            else if (path.length == 0) // if path has no entries, than call the function again
                this.enemieMove(enemie);
            else // else move the sprite
                this.moveSprite(path, enemie);
        });

        this.finder.calculate(); // start the calulation for the patch

        enemie.nextMoveNum++; // increment the number for the next movement position
        if (enemie.nextMoveNum == enemie.move.length) // if the next position is out of the array, than reset it
            enemie.nextMoveNum = 0;
    }

    /**
     * Generate the tweens for movement
     * @param {Array} path The path to move
     * @param {Phaser.GameObjects.Sprite} target Sprite to move
     * @param {CallableFunction} timelineComplete function that is called after the timeline is finished
     */
    moveSprite(path, target, timelineComplete = () => { this.enemieMove(target); }, escape = false) {
        const duration = target.duration || 200; // get the duration, if not set than a set default value

        let tweens = [];
        for(let i = 0; i < path.length-1; i++) { // loop through the path
            const ex = path[i+1].x * 32; // get the x position of the world  // TODO: was ist wenn ich 0 index überspring, müsste dann weniger berechnen
            const ey = path[i+1].y * 32; // get the y position of the world

            tweens.push({ // make a tween
                targets: target,
                x: ex,
                y: ey,
                duration: duration,
                onComplete: () => { // when tween is complete, then check for aggro, when aggro is defined
                    if (target.aggro) this.checkForAggro(target);
                }
            });
        }

        // make a timeline with the tween-array
        const timeline = this.tweens.timeline({
            tweens: tweens,
            onComplete: timelineComplete
        });

        if (target.aggro) {
            if (escape)
                target.aggro.tweens.escape = timeline;
            else {
                target.aggro.tweens.move = timeline;
                if (target.aggro.state != 0)
                    timeline.pause();
            }
        }
    }

    // TODO: vlt bisschen aufsplitten? vlt auch wegen unterschiedliche ranges für aggro-trigger und verfolgen?
    checkForAggro(enemie) {
        const player = this.player;
        const aggro = enemie.aggro;

        if (aggro.state == 2) return;

        const { x = 0, y = 0} = enemie.aggro.home

        const top = y - (aggro.rangeY * 32);
        const left = x - (aggro.rangeX * 32);
        const right = x+32 + (aggro.rangeX * 32);
        const bottom = y+32 + (aggro.rangeY * 32);

        if (player.y >= bottom || player.x+32 <= left || player.y+32 <= top || player.x >= right) {
            if (aggro.state == 1) {

                const fromX = Math.floor(enemie.x / 32);
                const fromY = Math.floor(enemie.y / 32);

                const toX = Math.floor(x / 32);
                const toY = Math.floor(y / 32);

                this.finder.findPath(fromX, fromY, toX, toY, (path) => {
                    if (path === null)
                        console.warn("Path was not found.");
                    else
                        this.moveSprite(path, enemie, () => {
                            if (aggro.tweens.move.duration == 0)
                                aggro.tweens.move.play();
                            else
                                aggro.tweens.move.resume();
                            aggro.state = 0
                        }, true);
                });

                this.finder.calculate();

                aggro.state = 2;
                return;
            }

            aggro.home.x = enemie.x;
            aggro.home.y = enemie.y;
            return;
        }


        if (aggro.state == 0) {
            aggro.state = 1;
            aggro.home.x = enemie.x;
            aggro.home.y = enemie.y;
            aggro.tweens.move.pause();
        }


        const fromX = Math.floor(enemie.x / 32);
        const fromY = Math.floor(enemie.y / 32);

        const toX = Math.floor(player.x / 32);
        const toY = Math.floor(player.y / 32);


        this.finder.findPath(fromX, fromY, toX, toY, (path) => {
            if (path === null)
                console.warn("Path was not found.");
            else {
                const duration = enemie.duration || 200;
                const ex = path[1].x * 32;
                const ey = path[1].y * 32;
                const tween = this.tweens.add({
                    targets: enemie,
                    x: ex,
                    y: ey,
                    duration: duration,
                    onComplete: () => {
                        this.checkForAggro(enemie);
                    }
                });
                enemie.aggro.tweens.aggro = tween;
            }
        });

        this.finder.calculate();

    }

    npcInteraction() {
        if (!this.player.anims.currentAnim) return;

        const directionText = this.player.anims.currentAnim.key.split("-");
        
        let newX = this.player.x;
        let newY = this.player.y;

        if (directionText[1] == "left")
            newX -= 32;
        else if (directionText[1] == "right")
            newX += 32;
        else if (directionText[1] == "back")
            newY -= 32;
        else
            newY += 32;



        // TODO: eigene function für collide checken?
        for (let i = 0; i < this.activeNPC.length; i++) {
            const npc = this.activeNPC[i];
            if (newY >= npc.y+32 || newX+32 <= npc.x || newY+32 <= npc.y || newX >= npc.x+32) {
                continue;
            }
            console.log(npc.name);
            this.tweens.pauseAll();
            console.log(this.tweens);
            return;
        }
        
    }


}