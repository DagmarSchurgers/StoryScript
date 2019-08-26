namespace LanternofWorlds {
    export class Character implements StoryScript.ICharacter {
        name: string = "";
        score: number = 0;
        hitpoints: number = 10;
        currentHitpoints: number = 10;
        currency: number = 0;

        // Add character properties here.

        items: StoryScript.ICollection<IItem> = [];

        equipment: {
            // Remove the slots you don't want to use
            head: IItem,
            body: IItem,
            hands: IItem,
            feet: IItem
        };

        constructor() {
            this.equipment = {
                // Remove the slots you don't want to use
                head: null,
                body: null,
                hands: null,
                feet: null
            }
        }
    }
}