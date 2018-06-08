﻿namespace StoryScript {
    /**
     * An item that can be found in the game and used by the character.
     */
    export interface IItem {
        /**
         * The id of the item.
         */
        id?: string;

        /**
         * The name of the item as shown to the player.
         */
        name: string;

        /**
         * The file name of the image to display for the item. The file name should be relative to the index.html file. Note that if you
         * use an HTML-page to describe the item, you can add an image-tag to it with the class 'picture'. The source of the image-tag
         * will then be used to set this property at run-time.
         */
        pictureFileName?: string;

        /**
         * One or more parts of the character body this item is for (or no part, in case of a miscellaneous item).
         */
        equipmentType: EquipmentType | EquipmentType[];

        /**
         * The details about this item as displayed to the player. If you use an HTML-page to describe the item, the contents of that HTM-page
         * will be used to set this property at run-time.
         */
        description?: string;

        /**
         * The damage done by this item when used in combat.
         */
        damage?: string;

        /**
         * The defense offered by this item.
         */
        defense?: number;

        /**
         * The number of times the item can be used before disappearing. If not specified, the item can be used indefinitely.
         */
        charges?: number;

        /**
         * Any bonuses the item offers to the player.
         */
        bonuses?: any;

        /**
         * When this flag is set to true and the item has a use function specified, the use action will also be available during combat.
         */
        useInCombat?: boolean;

        /**
         * The value of the item in whatever credits are used in the game.
         */
        value?: number;

        /**
         * When this flag is set to true, the item is not shown to the player. Useful to only conditionally make items available on a location.
         */
        inactive?: boolean;

        /**
         * When specified, this function will be executed when the item is equipped by the player.
         * @param item The item to be equipped
         * @param game The game object
         */
        equip?(item: IItem, game: IGame): boolean;

         /**
         * When specified, this function will be executed when the item is unequipped by the player.
         * @param item The item to be unequipped
         * @param game The game object
         */
        unequip?(item: IItem, game: IGame): boolean;

        /**
         * When specified, this item can be used and a use action becomes available on the item. The function will be executed when the player
         * executes this action.
         * @param game The game object
         * @param item The item to use
         */
        use?(game: IGame, item: IItem): void
    }
}