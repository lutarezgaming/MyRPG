class Player extends Charactar {

    constructor (name)
    {
        let stats = {maxHealth: 1000, health: 950, maxMana: 100, mana: 50, attack: 20, magic: 30, luck: 25, manaReg: 5, speed: 10};
        let attacks = [{name: "Schlag", strength: 75, type: 0, cost: 5, ref: 0, icon: "winged-sword", switchTarget: false},
                            //{name: "Spucken", strength: 1000, type: 1, cost: 0, ref: 1, icon: "shuriken", switchTarget: true},
                            {name: "Gift", strength: 10, type: 1, cost: 30, effect: {
                                    strength: 100, type: 3, duration: 2, max: 1, target: 1, positive: false,
                                }, ref: 7, icon: "winged-sword", switchTarget: true, text: "Vergiftet das Ziel für %effect_duration% Runden und verursacht zusätzlich %effect_strength% Schaden"},
                            {name: "Beleidigen", strength: 10, type: 3, cost: 10, duration: 4, max: 2, target: 3, positive: false, ref: 2, icon: "shuriken", switchTarget: true, text: "Senkt den Angriff um %strength%%. %max%x stapelbar"},
                            {name: "Heilen", strength: 100, type: 2, cost: 20, ref: 3, icon: "shuriken", switchTarget: false}];



        /* Type: 0=attack, 1=defence, 2=magic, 3=resistance, 4=luck, 5=speed, 6=manareg */
        let passiveList = [{name: "Trainiert", stat: 100, percent: false, positive: true, type: 0, icon: "winged-sword", used: false},
                            {name: "Unkonzentriert", stat: 50, percent: true, positive: false, type: 2, icon: "shuriken"},
                            {name: "Adrenalin", stat: 50, percent: true, positive: true, type: 0, icon: "shuriken"},
                            {name: "Asdf", stat: 30, percent: true, positive: true, type: 0, icon: "deadly-strike", stack: {cur: 2, max: 2}}];



        
        super(name, "phaserguy", stats, attacks, passiveList);


        
        this.alive = true;
        
        this.level = {curLevel: 1, curEp: 30, maxEp: 100};
        this.look = [0, 0];


        this.talentPoint = 100;
        this.talent = [{count: 0, max: 1, attackRef: 4, position: {x: 320, y: 16}, skillable: true, next: [1, 2]},
                        {count: 0, max: 1, attackRef: 5, position: {x: 110, y: 180}, skillable: false, next: [3, 4]},
                        {count: 0, max: 2, attackRef: 4, position: {x: 450, y: 180}, skillable: false, next: [5, 6]},

                        {count: 0, max: 2, attackRef: 5, position: {x: 60, y: 280}, skillable: false, next: []},
                        {count: 0, max: 2, attackRef: 5, position: {x: 140, y: 320}, skillable: false, next: [7]},
                        {count: 0, max: 2, attackRef: 4, position: {x: 400, y: 280}, skillable: false, next: []},
                    
                        {count: 0, max: 5, passive: {name: "TestTalent", stat: 100, percent: false, positive: true, type: 0, icon: "deadly-strike", stack: {cur: 0, max: 5}},
                            position: {x: 500, y: 350}, skillable: false, next: [7]},
                        {count: 0, max: 2, passive: {name: "Talent2", stat: 10, percent: false, positive: true, type: 0, icon: "deadly-strike", stack: {cur: 0, max: 2}},
                            position: {x: 320, y: 450}, skillable: false, next: []}];


        this.avaibleAttackList = [{ref: 0, icon: "winged-sword", choosed: true},
                                    {ref: 1, icon: "shuriken", choosed: false}, 
                                    {ref: 2, icon: "shuriken", choosed: true},
                                    {ref: 3, icon: "shuriken", choosed: true},
                                    {ref: 6, icon: "winged-sword", choosed: false},
                                    {ref: 7, icon: "winged-sword", choosed: true}];


        

        /* TODO: Type für Magie (1) */
        // TODO: bessers Dot/HoT handling
        /* Attack-Type: 0=Melee, 1=Magie, 2=Heal, 3=Debuff, 4=Buff */
        /* Buff-Type: 0=Health-Melee, 1=Health-Magic, 2=Mana, 3=Attack, 4=Defence, 5=Magic, 6=Resistence, 7=Luck, 8=Speed, 9=Manareg, 10=Lifereg? */
        this.attackList = [{name: "Schlag", strength: 75, type: 0, cost: 5, ref: 0, icon: "winged-sword", switchTarget: false},
                        {name: "Spucken", strength: 1000, type: 1, cost: 0, ref: 1, icon: "shuriken", switchTarget: true},
                        {name: "Beleidigen", strength: 10, type: 3, cost: 10, duration: 4, max: 2, target: 3, positive: false, ref: 2, icon: "shuriken", switchTarget: true, text: "Senkt den Angriff um %strength%%. %max%x stapelbar"},
                        {name: "Heilen", strength: 100, type: 2, cost: 20, ref: 3, icon: "shuriken", switchTarget: false},
                        {name: "Hieb", strength: 10000, type: 0, cost: 100, ref: 4, icon: "winged-sword", switchTarget: true},
                        {name: "Verstärken", strength: 100, type: 4, cost: 0, duration: 2, max: 3, target: 3, positive: true, ref: 5, icon: "shuriken", switchTarget: false},
                        {name: "Test", strength: 100, type: 4, cost: 0, duration: 2, max: 3, target: 3, positive: false, ref: 6, icon: "winged-sword", switchTarget: false},
                        {name: "Gift", strength: 10, type: 1, cost: 30, effect: {
                                strength: 100, type: 3, duration: 2, max: 1, target: 1, positive: false,
                            }, ref: 7, icon: "winged-sword", switchTarget: true, text: "Vergiftet das Ziel für %effect_duration% Runden und verursacht zusätzlich %effect_strength% Schaden"}];

        
    }

    getLife() {
        console.log(this);
        let info = this.stats;

        let message = "Level: " + this.level.curLevel + "\nGesundheit: " + info.health + "/" + info.maxHealth + 
                        "\nMana: " + info.mana + "/" + info.maxMana + "\nErfahrung: " + this.level.curEp + "/"  + this.level.maxEp;
        return message;
    }

    leveling(ep = null, multiplicator = 1.3) {
        if (ep) this.ep = ep;

        const { level } = this;

        if (level.curEp >= level.maxEp) {
            level.curEp -= level.maxEp;

            level.maxEp *= multiplicator;
            level.maxEp = Math.ceil(level.maxEp);
        }


        const diff = level.maxEp - level.curEp;
        const epForLevel = (this.ep < diff) ? this.ep : diff;

        this.ep -= epForLevel;
        level.curEp += epForLevel;

        if (level.curEp >= level.maxEp) {
            return this.levelup();
        }

        return false;
    }

    levelup() {
        let info = this.stats;

        let health = Phaser.Math.Between(1, 10);
        let mana = Phaser.Math.Between(1, 10);
        let attack = Phaser.Math.Between(1, 5);
        let magic = Phaser.Math.Between(1, 5);
        let luck = Phaser.Math.Between(1, 5);
        let manaReg = Phaser.Math.Between(1, 3);

        /*let message = "Gesundheit: " + info.maxHealth + " + " + health + 
                        "\nMana: " + info.maxMana + " + " + mana + 
                        "\nAngriff: " + info.attack + " + " + attack +
                        "\nMagie: " + info.magic + " + " + magic + 
                        "\nGlück: " + info.luck + " + " + luck + 
                        "\nRegenation: " + info.manaReg + " + " + manaReg;*/
        let message = `Gesundheit: ${info.maxHealth} + ${health}
Mana: ${info.maxMana} + ${mana}
Angriff: ${info.attack} + ${attack}
Magie: ${info.magic} + ${magic}
Glück: ${info.luck} + ${luck}
Regeneration: ${info.manaReg} + ${manaReg}`;


        this.stats.maxHealth += health;
        this.stats.health += health;

        this.stats.maxMana += mana;
        this.stats.mana += mana;

        this.stats.attack += attack;
        this.stats.magic += magic;

        this.stats.luck += luck;
        this.stats.manaReg += manaReg;

        this.level.curLevel++; // TODO: einblenden?
        this.talentPoint++;

        
        return message;
    }
}