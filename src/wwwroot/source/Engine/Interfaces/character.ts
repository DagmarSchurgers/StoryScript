﻿namespace StoryScript {
    /**
     * The player character in the StoryScript game.
     */
    export interface ICharacter {
        /**
         * The name of the player character.
         */
        name: string;

        /**
         * The file name of the image to display for the character. The file name should be relative to the index.html file.
         */
        portraitFileName?: string;

        /**
         * The number of points scored by the player so far. This property should be managed in your game rules. The score will
         * be used to determine the player's ranking in the high-score list on game end.
         */
        score: number;

        /**
         * The total health of the player when in top condition.
         */
        hitpoints: number;

        /**
         * The current health of the player.
         */
        currentHitpoints: number;

        /**
         * The amount of credits the player has, in whatever form.
         */
        currency: number;

        /**
         * All items the player is carrying in his backpack. Note that equipped items are not in this list.
         */
        items: ICollection<StoryScript.IItem>;

        /**
         * All items the character has that can be used during combat.
         */
        // Todo: is this used?
        combatItems?: ICollection<StoryScript.IItem>;

        /**
         * All the quests the player has accepted, both active and complete.
         */
        quests?: ICollection<StoryScript.IQuest>;

        /**
         * The items the character has equipped.
         */
        equipment: {
            head?: IItem,
            body: IItem,
            hands?: IItem,
            leftHand?: IItem,
            leftRing?: IItem,
            rightHand?: IItem,
            rightRing?: IItem,
            legs?: IItem,
            feet?: IItem
        }

        /**
         * The player character level. This is an optional element, you should track level and take care of level
         * up in your game rules.
         */
        level?: number;
    }
}