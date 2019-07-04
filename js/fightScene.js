class FightScene extends Phaser.Scene{
    constructor() {
        super({key: "FightScene"});
    }

    preload() {
        // TODO: wann assets laden?
		this.load.image('exit', 'assets/exit.png');
		this.load.image('cancel', 'assets/cancel.png')

		playerGuy.attacks.forEach(element => {
            if (!playerGuy.imageLoader(element.icon, this.textures)) {
                this.load.image(element.icon, 'assets/talent/'+element.icon+'.png');
            }
		});
    }

    create() {
        this.add.image(400, 300, 'background').setScale(2); // Create the Background TODO: dynamischer background

        this.targetArr = [];
        this.resetSystemVariable();

        // Choose layer
        // Create the graphic for the choosing phase
        this.chooseLayer = this.add.graphics();
		this.chooseLayer.fillStyle(0x000000, 0.5);
		this.chooseLayer.fillRect(0, 0, 960, 320);
		this.chooseLayer.setDepth(3);
        this.chooseLayer.setVisible(false);

        // Damage Text
        // Text variable for dispaying the damage/heal
        this.txtDamage = this.add.text(100, 100, '', { fontSize: '30px', fill: '#f00', fontStyle: 'bold' });
		this.txtDamage.setStroke('#000', 3);
		this.txtDamage.setDepth(20);
		this.txtDamage.setVisible(false);


        // tween stats
        this.chooseTween = {
            targets: null,
            y: "-=10",
            duration: 1,
            repeat: -1,
            hold: 750,
            yoyo: true,
            repeatDelay: 750,
        };
        

        this.tooltip = new Tooltip(this, 0, 0); // init the tooltip
        this.levelStats = new Tooltip(this, 0, 0); // init the leveling stats for the level ups
        

        // Create buttons and add functionality for the flee and do nothing buttons
        this.cancel = generateSprite(this, 265, 388, "cancel", "Nichts tun");
        this.exit = generateSprite(this, 265, 512, "exit", "Flucht");
        this.cancel.on('pointerup', () => this.startRound(1));
        this.exit.on('pointerup', () => this.startRound(2));

        
        // init and open the dialog
        this.dialog = new Dialog(this, 460, 416, 'textbox', 10);
		this.dialog.openBox("");

        // pause the scene and set it invisble after creating this scene
        this.scene.setVisible(false);
        this.scene.pause();


        // event that is called when the scene is resumed
        this.events.on('resume', (system, charas) => {
			this.initFight(charas[0], charas[1]); // call the init function with the passed variables from the other scene
        });

        // init the hotkey listiner
        this.input.keyboard.on('keyup', (event) => {
            if (this.isLeveling) { // check if leveling phase is active
                if (this.hasLevelUp) { // check if a level up is active
                    if (event.keyCode == hotkeys.confirm.keyCode) // check if the confirm key is pressed
                        this.levelPlayers(); // call the funtion
                }
            }
            else if (!this.isFighting) { // check if fithing is not active
                if (!this.isChoosing) { // check if choosing is not active
                    if (event.keyCode == hotkeys.atk1.keyCode)
                        this.startChoose(playerGuy.attacks[0]); // hotkey for the first attack
                    else if (event.keyCode == hotkeys.atk2.keyCode)
                        this.startChoose(playerGuy.attacks[1]); // hotkey for the second attack
                    else if (event.keyCode == hotkeys.atk3.keyCode)
                        this.startChoose(playerGuy.attacks[2]); // hotkey for the third attack
                    else if (event.keyCode == hotkeys.atk4.keyCode)
                        this.startChoose(playerGuy.attacks[3]); // hotkey for the fourth attack
                    else if (event.keyCode == hotkeys.nothing.keyCode)
                        this.startRound(1); // hotkey for do nothing
                    else if (event.keyCode == hotkeys.flee.keyCode)
                        this.startRound(2); // hotkey for flee
                } else { // check if choosing is active
                    if (event.keyCode == hotkeys.left.keyCode)
                        this.chooseChange(); // hotkey for switching the target in the left direction
                    else if (event.keyCode == hotkeys.right.keyCode)
                        this.chooseChange(); // hotkey for swiching the target in the right direction
                    else if (event.keyCode == hotkeys.back.keyCode)
                        this.cancelChoose(); // hotkey for cancel the choosing
                    else if (event.keyCode == hotkeys.confirm.keyCode)
                        this.hasChoosed(); // hotkey for confirm the choosing
                }
            }
        });
    }

    /**
     * Create a object with the importants informations and init the ui-element
     * @param {Charactar} chara Charactar infos
     * @param {Number} x horizontal position of the sprite
     * @param {Number} y vertical position of the sprite
     * @param {Object} options optional settings
     * @return Object with ui, boosted stats, and chara properies
     */
    _createCharaObj(chara, x, y, options = {}) {
        const level = (chara.level) ? chara.level : null;

        const UI = new UIElements(this, x, y, chara.icon, chara.stats, level, options); // create the ui-element

        // create the object
        const obj = {
            ui: UI,
            stats: chara.getBoostedStat(),
            mother: chara,
        };

        return obj;
    }

    /**
     * Init all GUI elements and rested all system variables
     * @param {Charactar} players the player charactar
     * @param {Array} enemies Array of the enemie-charactars
     */
    initFight(players, enemies) {
        this.playersObjArr = []; // Array for the player objects
        this.enemiesObjArr = []; // Array for the enemie objects

        const playerObj = this._createCharaObj(players, 64, 128, {scale: 2}); // create the object for the player

        addTooltipListener(playerObj.ui.sprite, this.tooltip, () => playerObj.mother.getLife()); // add tooltip for the player TODO: wird vlt noch anderster gemacht

        playerObj.ui.drawBuffList(this, players); // draw the de-/buffs for the player
        this.playersObjArr = [playerObj];
        
        let noFlee = false; // temp variable for possible flee
        enemies.forEach((element, index) => { // loop through all enemies
            const x = 864 - (index * 164); // get the x position wiht a gap
            const obj = this._createCharaObj(element, x, 128, {}); // create the object for the enemie

            if (element.noFlee) noFlee = true; // if flee is not possible, than set the temp variable to true

            if (index >= 1) { // if there is already a sprtie than reposition the new sprite for no overlapping
                const pos = this.enemiesObjArr[0].ui.sprite.getTopLeft();
                const pos2 = obj.ui.sprite.getTopRight();

                let diff = pos2.x - pos.x;
                diff -= -100;
                obj.ui.setPosition(pos2.x - diff, obj.ui.sprite.y);
            }
            
            this.enemiesObjArr.unshift(obj); // add the new object at the start of the array
        });


        // Generate the attacking buttons
        this.btnAtk1 = generateSprite(this, 16, 388, players.attacks[0].icon, () => players.getAttackText(0));
        this.btnAtk2 = generateSprite(this, 140, 388, players.attacks[1].icon, () => players.getAttackText(1));
        this.btnAtk3 = generateSprite(this, 16, 512, players.attacks[2].icon, () => players.getAttackText(2));
        this.btnAtk4 = generateSprite(this, 140, 512, players.attacks[3].icon, () => players.getAttackText(3));
        this.btnAtk1.on('pointerup', () => this.startChoose(players.attacks[0]));
        this.btnAtk2.on('pointerup', () => this.startChoose(players.attacks[1]));
        this.btnAtk3.on('pointerup', () => this.startChoose(players.attacks[2]));
        this.btnAtk4.on('pointerup', () => this.startChoose(players.attacks[3]));
        

        this.resetSystemVariable(); // reset the system variables
        this.noFlee = noFlee; // set possible to flee
        this.scene.setVisible(true); // make the scene visible
    }

    /**
     * Init/Reset the system variables
     */
    resetSystemVariable() {
        this.isFighting = false; // state for fithing
        this.isChoosing = false; // state for choosing
        this.isLeveling = false; // state for leveling
        this.hasLevelUp = false; // state for level up
        this.currentLevelingPlayer = 0; // number of the current levling player
        this.canSwitchChoose = false; // state for possible to switch target
        this.playerAtk = null; // attack of the player TODO: komment weg
        this.target = 0; // index of the target TODO: bessere logic
        this.targetArr.length = 0; // clear the array
        this.getEp = 0; // amount of ep the player gets
        this.noFlee = false; // state of flee is possible
    }

//#region choose
    /**
     * Start the choosing phase
     * @param {Object} attack attack of the player
     */
    startChoose(attack) {
        if (this.isFighting || this.isChoosing || this.isLeveling) // break when the false phase is active
            return;
        if (this.playersObjArr[0].stats.mana < attack.cost) { // break and info when the player don't have enough mana // TODO: kommt weg bei mehreren spielern
            this.dialog.setSingleText(`Nicht genügend Mana.`);
            return;
        }
        this.playerAtk = attack;

        const { type, switchTarget = false } = attack

        this.chooseLayer.setVisible(true); // active the choosing layer
        this.isChoosing = true; // set the phase
        this.target = 0;
        this.canSwitchChoose = switchTarget; // set if switching is possible

        // get the correct target array for the attack
        if (type == 0 || type == 1 || type == 3 || type == 5) {
            this.targetArr = this.enemiesObjArr
        } else {
            this.targetArr = this.playersObjArr;
        }

        this.targetArr[0].ui.setDepth(4).addTween(this, this.chooseTween); // set tween and depth for the default target
    }

    /**
     * Change the target
     */
    chooseChange() {
        if (!this.canSwitchChoose) // break when switching is not possible
            return;
        
        if (this.targetArr.length != 2) // break when only one target is avaible
            return;
        
        this.targetArr[this.target].ui.setDepth(0).stopTween(); // reset depth & tween of the old target
        this.target = 1 - this.target; // change index of the target
        this.targetArr[this.target].ui.setDepth(4).addTween(this, this.chooseTween); // set depth & tween for the new target

    }

    /**
     * Init the round when choose is confirmed
     */
    hasChoosed() {
        this.cancelChoose();  // call the cancel function to reset the target and system variables
        
        this.startRound(0); // start the round
    }

    /**
     * Reset the target and variables when choosing is canceled
     */
    cancelChoose() {
        this.targetArr[this.target].ui.setDepth(0).stopTween(); // reset the depth & tween

        this.isChoosing = false; // change the phase
        this.chooseLayer.setVisible(false); // set the layer invisible
    }
//#endregion


    /**
     * Logic for the round
     * @param {Number} type the type which the player choosed (attack, nothing, flee)
     */
    async startRound(type) {
        if (this.isFighting || this.isLeveling) // break when the false phase is active
            return;

        if (type == 2 && this.noFlee) { // break and info when the player tries to flee, when flee is not possible
            this.dialog.setSingleText('Flucht nicht möglich!');
            return;
        }
            
        this.isFighting = true; // set the phase
        const fightOrder = [];

        // Compine the player and enemie arrays
        Array.prototype.push.apply(fightOrder, this.playersObjArr);
        Array.prototype.push.apply(fightOrder, this.enemiesObjArr);

        // TODO: Flucht priorisieren
        fightOrder.sort((a, b) => { // sort the array
            if (a.stats.speed == b.stats.speed) // when speed is equal, then roll a random number who attacks first
                return Phaser.Math.Between(1, 10) <= 5;
            return a.stats.speed < b.stats.speed; // charas with higher speed attacks earlier
        });

        for (const element of fightOrder) { // loop through the array
            if (element.stats.health <= 0) // when chara is death, than coniune with the next one
                continue;

            if (element.mother.constructor.name == "Player") { // check if is a player
                const toBreak = await this.playerRoundLogic(type); // start the logic for the player
                if (toBreak) return; // break when player is sucessfull fleeing
            }
            else
                await this.enemieAttack(element, "resolve"); // logic for enemie attack
        }


        await this.roundEnd(); // wait for the round end logic

        
        if (this.playersObjArr.length <= 0) { // when players are dead, than close scene with gameover
            this.sceneClose("gameover");
            return;
        }
        if (this.enemiesObjArr.length <= 0) { // when all enemies are dead, call the fightEnd function
            this.fightEnd();
            return;
        }

        this.isFighting = false; // set fithing state to false
        console.log("Turn endo");
    }

    /**
     * do the stuff which is handeled at the end of a round
     */
    async roundEnd() {
        for (const element of this.playersObjArr) { // loop through all players
            if (element.stats.health > 0) { // check if life is above 0
                await this.buffRemover(element); // check the buffs
                if (typeof element.stats.manaReg !== "undefined") // check if has a manareg stat
                    this.lifeCalculator(element, "mana", element.stats.manaReg, false)(); // regenerate the mana
            }
            if (element.stats.health <= 0) { // check if life is under 0
                this._destroyCharaObj(element, false); // remove it from the scene
            }
        };

        for (const element of this.enemiesObjArr) { // loop through all enemies
            if (element.stats.health > 0) { // check if life is above 0
                await this.buffRemover(element); // check the buffs
                if (typeof element.stats.manaReg !== "undefined") // check if has a manareg stat
                    this.lifeCalculator(element, "mana", element.stats.manaReg, false)(); // regenerate the mana
            } 
            if (element.stats.health <= 0 ) { // check if life is under 0
                this.getEp += element.mother.ep; // count the added ep to it
                this._destroyCharaObj(element, true); // remove it from the scene
            }
        };

        this.playersObjArr = this.playersObjArr.filter((element) => element.ui !== undefined); // filter the dead player out
        this.enemiesObjArr = this.enemiesObjArr.filter((element) => element.ui !== undefined); // filter the dead enemies out
    }

    /**
     * stuff do be handeld after the fight is complete, like leveling
     */
    fightEnd() {
        this.isLeveling = true; // set leveling phase

        if (this.playersObjArr.length > this.currentLevelingPlayer) { // check if there is a player to leveling
            const chara = this.playersObjArr[this.currentLevelingPlayer]; // get the player-chara

            this.dialog.setSingleText(`${chara.mother.name} erhält ${this.getEp} Erfahrung.`); // set the text
            chara.mother.ep = this.getEp; // set the gained ep

            this.levelPlayers(); // level the player
        } else {
            this.time.delayedCall(500, function() { this.sceneClose("won"); }, [], this); // close the scene as won
        }
    }

    /**
     * level the player
     */
    levelPlayers() {
        this.hasLevelUp = false; // set the phase
        this.levelStats.clear(); // clear the stats dialog

        const chara = this.playersObjArr[this.currentLevelingPlayer]; // get the chara

        const message = chara.mother.leveling(); // level the player and get the leveling-text

        // TODO: bar animation?
        chara.ui.setBarValue(chara.mother.level.curEp, chara.mother.level.maxEp, "ep"); // set the ep bar to the new value

        if (message) { // check if the player has a level up
            this.hasLevelUp = true; // set the phase
            this.levelStats.setText(200, 200, message); // set the text
        } else {
            this.currentLevelingPlayer++; // go to the next player
            this.fightEnd(); // recall the fightEnd function
        }
    }

    /**
     * call the function for the active move from the player
     * @param {Number} type Which move the player take, 0 = attack, 1 = nothing, 2 = escape
     * @returns true when escape is successfull
     */
    async playerRoundLogic(type) {
        if (type == 0)
            await this.attacking(this.playersObjArr[0], this.targetArr[this.target], this.playerAtk); // attack logic
        else if (type == 1) {
            await new Promise((resolve, reject) => this.dialog.setSingleText(`${playerGuy.name} macht nichts.`, resolve, true)); // write only the text
        }
        else if (type == 2) {
            const flee = await this.flee(); // check if player can escape
            if (flee) {
                this.sceneClose("flee"); // close scene escape is successfull
                return true;
            }
        }
    }

    
    // TODO: Hier Kommt logik für KI hin
    async enemieAttack(enemie) {
        await this.attacking(enemie, this.playersObjArr[0], {type: 0, strength: 50, cost:0, name: "TestAtk"});
    }

    /**
     * Logic for the attack
     * @param {Object} attacker The attacker object
     * @param {Object} target The target object
     * @param {Object} attack The attack object
     */
    async attacking(attacker, target, attack) {
        let stat = 0; // amount of damage/heal
        let txt = " "; // message
        let color = "#000"; // color for damage/heal number
        let isDamage = true; // if attack make damage
        let dmgTxtCallback = () => {}; // callback for the damage/heal text
        let manaCallback = this.lifeCalculator(attacker, "mana", attack.cost, true);
        let buffCallback = () => {};


        // Melee & Magic Attack Handling
        if (attack.type == 0 || attack.type == 1) {
            if (attack.type == 0)
                stat = this.damageCalculator({atk: attacker.stats.attack, luck: attacker.stats.luck}, {def: target.stats.defence, luck: target.stats.luck}, attack.strength);
            else
                stat = this.damageCalculator({atk: attacker.stats.magic, luck: attacker.stats.luck}, {def: target.stats.resistance, luck: target.stats.luck}, attack.strength);
            
            txt = `${attacker.mother.name} greift ${target.mother.name} mit ${attack.name} an!`;
            color = "#f00";

            
        }
        // Heal Handling
        else if (attack.type == 2) {
            stat = this.healCalculator(attacker.stats, attack.strength);
            txt = `${attacker.mother.name} heilt sich selbst mit ${attack.name}!`;
            color = "#0f0";
            isDamage = false;
        }
        // Debuff and Buff Handling
        else if (attack.type == 3 || attack.type == 4) {
            stat = '';
            txt = (attack.type == 3) ? `${attacker.mother.name} schwächt ${target.mother.name} mit ${attack.name}` : `${attacker.mother.name} stärkt sich mit ${attack.name}`;

            buffCallback = () => { this.buffhandler(target, attack, { attack: attacker.stats.attack, magic: attacker.stats.magic, luck: attacker.stats.luck })};
        }

        
        if (typeof stat == "number")
            dmgTxtCallback = this.lifeCalculator(target, "health", stat, isDamage);


        await new Promise((resolve, reject) => this.dialog.setSingleText(txt, resolve, true));

        this.damageText(stat, target.ui.sprite, color, dmgTxtCallback, manaCallback);
        
        await new Promise((resolve, reject) => { this.shakeEffect(target.ui, resolve, buffCallback) });


        if (attack.effect) {
            this.effectCalculator(attack, attacker, target);
        }


        console.log("yolo");
    }

    // TODO: bessers effeckt Handling?
    effectCalculator(attack, attacker, target) {
        if (attack.effect.type == 3 || attack.effect.type == 4) {
            this.buffhandler(target, attack, { attack: attacker.stats.attack, magic: attacker.stats.magic, luck: attacker.stats.luck }, true);
        }
    }


    damageCalculator(attackerStats, targetStats, strength) {
        let { atk = 0, luck: atkLuck = 0 } = attackerStats;
        let { def = 0, luck: defLuck = 0 } = targetStats;

        const critNumber = Phaser.Math.Between(1, 100);
        const isCrit = (critNumber <= atkLuck) ? 2 : 1;

        let damage = Math.ceil((strength / 100 * (atk - def / 2)) * isCrit);


        return (damage <= 0) ? 0 : damage;
    }


    healCalculator(stats, strength) {
        let { magic = 0, luck = 0 } = stats;

        const critNumber = Phaser.Math.Between(1, 100);
        const isCrit = (critNumber <= luck) ? 1.5 : 1;

        let heal = Math.ceil(magic / 100 * strength * isCrit);

        return (heal <= 0) ? 0 : heal;
    }

//#region Buff Handling
    buffhandler(target, attack, stats, useEffect = false) {
        let buff = (useEffect) ? attack.effect : attack;

        let isActive = false;

        for (let element of target.mother.buffList) {
			if (element.ref == attack.ref) {
				if (element.stack < element.max) {
					element.stack++;
				}
				
                element.duration = buff.duration;
                isActive = true;

                target.stats = target.mother.getBoostedStat();
                break;
			}
        };

        if (!isActive) {
            this.addBuffAndIcon(target, attack, stats, useEffect);
        }
    }

    addBuffAndIcon(target, attack, attackerStats, useEffect = false) {
        let buff = (useEffect) ? attack.effect : attack;

        const pos = iconPos(target.ui.container.length, 6, 18);

        let newBuff = {
            name: attack.name,
            strength: buff.strength,
            duration: buff.duration,
            stack: 1,
            target: buff.target,
            ref: attack.ref,
            stats: attackerStats,
            max: buff.max,
            icon: attack.icon, 
            positive: buff.positive
        };

        target.mother.buffList.push(newBuff);

        target.stats = target.mother.getBoostStat(target.stats, newBuff, true);

        let sprite = generateSprite(this, pos.x, pos.y, attack.icon, () => target.mother.getBuffText(newBuff), {scale: 0.0625});
        
        target.ui.container.add(sprite);
    }

    async buffRemover(target) {
        const { ui, mother } = target;
        let runningOut = false;

        for (const element of mother.buffList) {
            if (target.stats.health <= 0) break;

            element.duration--;
            if (element.duration <= 0) runningOut = true;

            if (element.target == 0 || element.target == 1) {
                await this.dotCalculator(target, element);
            }
        };


        if (runningOut) {
            mother.buffList = mother.buffList.filter(element => element.duration > 0);

            target.stats = target.mother.getBoostedStat();

            ui.drawBuffList(this, mother);
        }
    }

    async dotCalculator(target, buff) {
        let damage = 0;
        let txt = " ";
        let color = "#000";
        let isDamage = true;
        let dmgTxtCallback = () => {};


        if (!buff.positive) {
            if (buff.target == 0) {
                damage = this.damageCalculator({atk: buff.stats.attack, luck: buff.stats.luck}, {def: target.stats.defence, luck: target.stats.luck}, buff.strength);
            }
            else if (buff.target == 1) {
                damage = this.damageCalculator({atk: buff.stats.magic, luck: buff.stats.luck}, {def: target.stats.resistance, luck: target.stats.luck}, buff.strength);
            }

            txt = `${target.mother.name} erleidet Schaden durch ${buff.name}!`;
            color = "#f00";
        }
        else {
            // TODO: überlegen ob auch attack zählt
            damage = this.healCalculator(buff.stats, buff.strength);
            txt = `${target.mother.name} heilt sich mit ${buff.name}!`;
            color = "#0f0";
            isDamage = false;
        }

        damage *= buff.stack;

        dmgTxtCallback = this.lifeCalculator(target, "health", damage, isDamage);


        await new Promise((resolve, reject) => { this.dialog.setSingleText(txt, resolve, true)} );

        this.damageText(damage, target.ui.sprite, color, dmgTxtCallback);
        await new Promise((resolve, reject) => { this.shakeEffect(target.ui, resolve) });

        if (target.stats.health <= 0)
            target.ui.setVisible(false);
    }

    lifeCalculator(target, affectedStat, amount, damage = true) {
        if (typeof target.stats[affectedStat] === 'undefined')
            return () => {};

        target.mother.changeLife(affectedStat, amount, damage);

        return () => {target.ui.setBarValue(target.stats[affectedStat], target.stats["max" + affectedStat.capitalizeFistChar()], affectedStat)};
    }


//#endregion

    async flee() {
        const num = Phaser.Math.Between(1, 100);
        let message = "";
        let flee = false;
        
        if (num >= 50) {
            flee = true;
            message = "Flucht erfolgreich.";
		} else
            message = "Flucht gescheitert.";
        
        await new Promise((resolve, reject) => this.dialog.setSingleText(message, resolve, true));

        return flee;
	}

    // TODO: vielleicht besser schreiben?
    damageText(txt, target, color, callback = () => {}, manaCallback = () => {}) {
		const pos = target.getCenter();
		this.txtDamage.setText(txt);

		const width = this.txtDamage.width;
		const height = this.txtDamage.height;
		
		this.txtDamage.setX(pos.x - (width / 2));
		this.txtDamage.setY(pos.y - (height / 2));
        this.txtDamage.setColor(color);
        
        this.textAnim(this.txtDamage, callback, manaCallback);
    }
    
    textAnim(target, callback, manaCallback) {
		target.setVisible(true);

		this.tweens.add({
            targets: target,
			duration: 750,
			x: '-=30',
			y: '-=75',
            onComplete: function() {
				target.setVisible(false);
				target.setText('');
            },
            onStart: function() {
                callback();
                manaCallback();
            }
        });

        //TODO: gefunden:
        /*this.add.tween({
            targets: [sprite],
            ease: 'Sine.easeInOut',
            duration: 1000,
            delay: 0,
            x: {
              getStart: () => startX,
              getEnd: () => endX,
            },
            y: {
              getStart: () => startY,
              getEnd: () => endY,
            },
            alpha: {
              getStart: () => startAlpha,
              getEnd: () => endAlpha
            },
            onComplete: () => {
              //handle completion
            }
          });*/
	}

    shakeEffect(target, resolve, callback = () => {}) {

        // TODO: bessere tween?
        let tween = {
            targets: null,
            x: "-=20",
            duration: 100,
            repeat: 2,
            hold: 100,
            //ease: 'Power3',
            ease: 'Bounce.easeInOut',
            onComplete: function () {
                this.targets[0].setX(this.targets[0].x - 10);
                resolve();
            },
            onStart: function () {
                this.targets[0].setX(this.targets[0].x + 10);
                callback();
            },
            yoyo: true,
            //repeatDelay: 750,
        };

        target.addTween(this, tween);
	}

    sceneClose(state = "won") {
        this.playersObjArr.forEach(ele => {
            this._destroyCharaObj(ele, false);
            // TODO: buffs behalten oder entfernen?
        });
        this.playersObjArr.length = 0;

        this.btnAtk1.destroy();
        this.btnAtk1 = undefined
        this.btnAtk2.destroy();
        this.btnAtk2 = undefined
        this.btnAtk3.destroy();
        this.btnAtk3 = undefined
        this.btnAtk4.destroy();
        this.btnAtk4 = undefined

        this.tooltip.clear();
        this.levelStats.clear();
        this.dialog.setSingleText(" "); // TODO: text mit empty string vlt eingen function (reset())

        this.enemiesObjArr.forEach(ele => {
            this._destroyCharaObj(ele, true);
        });

        
        this.resetSystemVariable();
        this.scene.pause();
        this.scene.setVisible(false);
		this.scene.resume('OverworldMapScene', state);
    }

    _destroyCharaObj(obj, buffReset = false) {
        obj.ui.destroy();
        obj.ui = undefined;
        obj.stats = undefined;

        if (buffReset)
            obj.mother.buffList.length = 0;
        obj.mother = undefined;
    }

    /* ##################################

TODO: Death Animation:


this.tweens.add({
	targets: gameObject,
	alpha: 0, 
	scaleX: 0,
	scaleY: 0
});


####################################*/
};