// TODO: Rename to AIClass
class KIClass extends Charactar {

    constructor (name, icon, stats, attacks, passive, ep=0, options = {})
    {
        const { noFlee = false } = options;
        
        super(name, icon, stats, attacks, passive, ep);

        
        this.noFlee = noFlee;
    }
}