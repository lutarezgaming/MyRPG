/**
 * Created by Philipp Hager on 04-2018
 */
var config = {
    type: Phaser.AUTO,
    mode: Phaser.Scale.FIT,
    width: 30*32, // 960
    height: 20*32, // 640
    parent: 'game',
    pixelArt: true,
    scene: [startMenu, OverworldMapScene, FightScene, talentScene, charaScene, controlScene],
};

var game = new Phaser.Game(config);


/**
 * Clones object, also the nested objects
 * @param {Object} obj Object to be cloned
 * @return the cloned object
 */
function cloneObj(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    let copy = obj.constructor();
    for (let attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

/**
 * Get the last position for a Table-visualation
 * @param {Number} length length of the array
 * @param {Number} column how many cloumns
 * @param {Number} width where the icon should be
 * @return x and y position
 */
function iconPos(length, column, width) {
    const row = Math.floor(length / column);
    const col = length % column;

    return {x: col * width, y: row * width};
}


/**
 * Add Tooltip-Listeners for Sprite
 * @param {Phaser.GameObjects.Sprite} sprite Target sprite
 * @param {Tooltip} tooltip Tooltip for the message
 * @param {CallableFunction, String} message Function or String to display
 */
function addTooltipListener(sprite, tooltip, message) {
    sprite.on('pointerover', (pointer) => tooltip.setText(pointer.position.x, pointer.position.y, message)); // init the gui when the mouse over the element
    sprite.on('pointermove', (pointer) => tooltip.setPosition(pointer.position.x, pointer.position.y)); // reset the position when the mouse is moving
    sprite.on('pointerout', () => tooltip.clear()); // clear when the mouse is leaving
}

/**
 * Generate Icon with tooltip
 * @param {Phaser.Scene} scene current scene
 * @param {Number} x x Position
 * @param {Number} y x Position
 * @param {String} icon icon to Display
 * @param {String|CallableFunction} message String for static text or Callback to get dynamic text
 * @param {Object} [options={}] Optional Parameters, like scale & tooltip variable
 * @return Returns the generates Sprtie
 */
function generateSprite(scene, x, y, icon, message, options = {}) {
    let { scale = 0.4, tooltip = scene.tooltip} = options;

    let sprite = new Phaser.GameObjects.Sprite(scene, x, y, icon).setOrigin(0, 0).setScale(scale).setInteractive();

    addTooltipListener(sprite, tooltip, message);

    scene.add.existing(sprite);
    
    return sprite;
}


String.prototype.capitalizeFistChar = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


hotkeys = {
    up: { name: "Rauf: W", keyCode: Phaser.Input.Keyboard.KeyCodes.W },
    down: { name: "Runter: S", keyCode: Phaser.Input.Keyboard.KeyCodes.S },
    left: { name: "Links: A", keyCode: Phaser.Input.Keyboard.KeyCodes.A },
    right: { name: "Rechts: D", keyCode: Phaser.Input.Keyboard.KeyCodes.D },
    atk1: { name: "Angriff 1: 1", keyCode: Phaser.Input.Keyboard.KeyCodes.ONE },
    atk2: { name: "Angriff 2: 2", keyCode: Phaser.Input.Keyboard.KeyCodes.TWO },
    atk3: { name: "Angriff 3: 3", keyCode: Phaser.Input.Keyboard.KeyCodes.THREE },
    atk4: { name: "Angriff 4: 4", keyCode: Phaser.Input.Keyboard.KeyCodes.FOUR },
    nothing: { name: "Nichts tun: 5", keyCode: Phaser.Input.Keyboard.KeyCodes.FIVE },
    flee: { name: "Flucht: 6", keyCode: Phaser.Input.Keyboard.KeyCodes.SIX },
    confirm: { name: "Bestätigen/Weiter: E", keyCode: Phaser.Input.Keyboard.KeyCodes.E },
    back: { name: "Zurück: Q", keyCode: Phaser.Input.Keyboard.KeyCodes.Q },
    nextTab: { name: "Nächster Tab: ArrowRight", keyCode: Phaser.Input.Keyboard.KeyCodes.RIGHT },
    previousTab: { name: "Vorheriger Tab: ArrowLeft", keyCode: Phaser.Input.Keyboard.KeyCodes.LEFT },
    talents: { name: "Talente: T", keyCode: Phaser.Input.Keyboard.KeyCodes.T },
    character: {name: "Charakter: C", keyCode: Phaser.Input.Keyboard.KeyCodes.C },
    control: {name: "Steuerung: P", keyCode: Phaser.Input.Keyboard.KeyCodes.P}
};
