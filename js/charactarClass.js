class Charactar {

    constructor (name, icon, stats, attacks, passive, ep=0)
    {
        this.name = name;
        this.stats = stats;
        this.attacks = attacks;
        this.ep = ep;
        this.icon = icon;

        /* Type: 0=strength, 1=defence, 2=magic, 3=resistance, 4=krit, 5=manareg, 6=speed */
        this.passiveList = passive;

        this.buffList = [];

        //this.boostStat = this.getBoostedStat();
        this.boostStats = {};
        this.getBoostedStat();
    }


    // TODO: vielleicht bessers handling
    useUnusedPassive() {
        this.passiveList.forEach(element => {
            this.usePassive(element);
        });
    }

    usePassive(passive) {
        if (passive.percent)
            return;

        if (passive.used)
            return;
        else if (passive.stack)
            if (passive.stack.cur == passive.stack.max)
                return;

        const stat = (passive.positive) ? passive.stat : passive.stat * -1;


        switch (passive.type) {
            case 0:
                this.stats.attack += stat;
                break;
            case 1:
                this.stats.defence += stat;
                break;
            case 2:
                this.stats.magic += stat;
                break;
            case 3:
                this.stats.resistance += stat;
                break;
            case 4:
                this.stats.luck += stat;
                break;
            case 5:
                this.stats.manaReg += stat;
                break;
            case 6:
                this.stats.speed += stat;
        }

        if (passive.stack)
            passive.stack.cur++;
        else
            passive.used = true;
    }

    getBoostedStat() {
        let boostStat = cloneObj(this.stats);

        this.passiveList.forEach(passive => {
            if (!passive.percent)
                return;

            boostStat = this.getBoostStat(boostStat, passive);
        });

        this.buffList.forEach(buff => {
            boostStat = this.getBoostStat(boostStat, buff, true);
        })


        // for cache
        this.boostStats = boostStat;
        return boostStat;
    }

    getBoostStat(stat, passive, convert = false) {
        if (convert) {
            passive = {
                stat: passive.strength,
                percent: true,
                positive: passive.positive,
                type: passive.target - 3,
                stack: {cur: passive.stack, max: passive.max}
            };
        }

        switch (passive.type) {
            case 0:
                stat.attack = this._statBoost(stat.attack, passive);
                break;
            case 1:
                stat.defence = this._statBoost(stat.defence, passive);
                break;
            case 2:
                stat.magic = this._statBoost(stat.magic, passive);
                break;
            case 3:
                stat.resistance = this._statBoost(stat.resistance, passive);
                break;
            case 4:
                stat.luck = this._statBoost(stat.luck, passive);
                break;
            case 5:
                stat.speed = this._statBoost(stat.manaReg, passive);
                break;
            case 6:
                stat.manaReg = this._statBoost(stat.manaReg, passive);
        }

        return stat;
    }

    _statBoost(stat, passive) {
        let percent = passive.stat / 100;
        percent *= (passive.positive) ? 1 : -1;
        
        if (passive.stack)
            percent *= passive.stack.cur;

        stat += stat * percent;
        
        return stat <= 0 ? 0 : Math.ceil(stat);
    }

    getAttack(pos) {
        return this.attackList[pos];
    }

    getAttackText(attack, look = false) {
        let type = '';
        

        let info = (look) ? this.getAttack(attack) : this.attacks[attack];

        let msg1 = "";
        let msg2 = "";

        // TODO: besser schreiben?
        if (info.text) {
            msg2 = "\n" + info.text.replace(/%\w+%/g, (all) => {
                let newText = all.replace(/%/g, "");

                newText = newText.split('_');


                let returnVal = "";
                let helpinfo = info;
                let isStrengh = "";
                if (newText.length == 2) {
                    returnVal = newText[0] in info ? info[newText[0]][newText[1]] : all;
                    helpinfo = info[newText[0]];
                    isStrengh = newText[1];
                }
                else {
                    returnVal = newText[0] in info ? info[newText[0]] : all;
                    isStrengh = newText[0];
                }

                if (isStrengh == "strength") {
                    if (helpinfo.target == 0)
                        returnVal = this._calcDamageForText(returnVal, this.boostStats.attack);
                    else if (helpinfo.target == 1)
                        returnVal = this._calcDamageForText(returnVal, this.boostStats.magic);
                }

                return returnVal;
            });
        }

        
        if (info.type == 0) {
            type = "Physisch";
            msg1 = "\nSchaden: " + this._calcDamageForText(info.strength, this.boostStats.attack);
        } else if (info.type == 1) {
            type = "Magisch";
            msg1 = "\nSchaden: " + this._calcDamageForText(info.strength, this.boostStats.magic);
        }else if (info.type == 2) {
            type = "Heilung";
            msg1 = "\nHeilung: " + this._calcDamageForText(info.strength, this.boostStats.magic);
        } else if (info.type == 3) {
            type = "Schwächung";
        } else if (info.type == 4) {
            type = "Stärkung";
        }

        //let message = "Attacke: " + info.name + "\nStärke: " + info.strength + "\nKosten: " + info.cost + "\nTyp: " + type;
        let message = `Attacke: ${info.name}${msg1}${msg2}
Kosten: ${info.cost}
Typ: ${type}`;

        return message;
    }

    changeLife(stat, amount, damage = true) {
        if (!damage) amount *= -1;


        this.stats[stat] -= amount;
        this.boostStats[stat] -= amount;
        if (this.stats[stat] < 0) {
            this.stats[stat] = 0;
            this.boostStats[stat] = 0;
        }
        if (this.stats[stat] > this.stats["max"+stat.capitalizeFistChar()]) {
            this.stats[stat] = this.stats["max"+stat.capitalizeFistChar()];
            this.boostStats[stat] = this.stats["max"+stat.capitalizeFistChar()];
        }
    }

    getBuffText(buff) {
        const { duration = 1, stack = 1, max = 1} = buff;

        let message = "";

        let msg1 = "";
        switch (buff.target) {
            case 0:
            case 1:
                msg1 = "Leben";
                break;
            case 2:
                msg1 = "Mana";
                break;
            case 3:
                msg1 = "Angriff";
                break;
            case 4:
                msg1 = "Verteidigung";
                break;
            case 5:
                msg1 = "Magie";
                break;
            case 6:
                msg1 = "Resistance"; //TODO: Besseres Name
                break;
            case 7:
                msg1 = "Glück";
                break;
            case 8:
                msg1 = "Geschwindigkeit";
                break;
            case 9:
                msg1 = "Manaregenaration";
                break;
            case 10:
                msg1 = "Lebensregenaration";
                break;
        }

        if (buff.target <= 2) {
            let amount = buff.strength;
            if (buff.target == 0) amount = this._calcDamageForText(buff.strength, buff.stats.attack, stack);
            else if (buff.target == 1) amount = this._calcDamageForText(buff.strength, buff.stats.magic, stack); 

            if (buff.positive) message = `Regeneriert ${amount} ${msg1}.`;
            else message = `Verliert ${amount} ${msg1}`;
        } else {
            let msg2 = (buff.positive) ? "erhöht" : "verringert";

            const strength = buff.strength * stack

            message = `${msg1} wird um ${strength}% ${msg2}.`;
        }

        return `${message}
Dauer: ${duration}
Stapel ${stack}/${max}`;
    }

    _calcDamageForText(strength = 0, stat = 0, stack = 1) {
        return Math.ceil((strength / 100 * stat) * stack);
    }

    
    // TODO: passive Text anpassen?
    getPassiveText(passive, nextStat = false) {
        let positive = (passive.positive) ? 'Erhöht' : 'Senkt';
        
        let type;
        if (passive.type == 0)
            type = "den Angriff";
        if (passive.type == 2)
            type = "die Magie";

        let percent = (passive.percent) ? "%" : "";


        let stat;

        if (passive.stack) {
            if (nextStat)  {
                let mul = 1;
                if (passive.stack.cur == passive.stack.max)
                    mul = 0;
                stat = passive.stat * (passive.stack.cur + mul);
            }
            else
                stat = passive.stat * passive.stack.cur;
        }
        else {
            stat = passive.stat;
        }

        //let stat = (passive.stack) ? passive.stat * passive.stack.cur : passive.stat;

        let message = `${passive.name}
${positive} ${type} um ${stat}${percent}`;

        return message;
    }

    // TODO: kommt weg?
    imageLoader(icon, texture) {
        let tex = texture.get(icon);

        if (tex.key != icon) {
            return false;
        }

        return true;
    }
}