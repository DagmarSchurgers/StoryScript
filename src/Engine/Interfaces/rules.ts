﻿namespace StoryScript {
    export interface IRules {
        /**
         * Run custom code to prepare the game before play, e.g. adding game-specific world properties to it.
         * @param game The game about to be started
         */
        setupGame?(game: IGame): void;

        /**
         * If you want to use combinations in your game, use this function to return the combination actions that
         * your game uses (e.g. 'Look at', 'Use', etc.).
         */
        getCombinationActions?(): ICombinationAction[];

        /**
         * Use this function to determine what character attributes should be shown on the chaarcter sheet. Return the names
         * of the attributes (e.g. 'strength', 'currentcy').
         */
        getSheetAttributes(): string[];

        /**
         * Use this function to specify the steps in your character creation process. Return the character creation sheet.
         */
        getCreateCharacterSheet(): ICreateCharacter;

        /**
         * Use this function to specify the steps in your character level up process. Return the level-up sheet.
         */
        getLevelUpSheet?(): ICreateCharacter;

        /**
         * This function is called when the character sheet has been filled in and the game is about to start.
         * You can add custom logic here to prepare your character before game start. Return the player character.
         * @param game The game about to start
         * @param characterData The character sheet filled in
         */
        createCharacter(game: IGame, characterData: ICreateCharacter): ICharacter;

        /**
         * This function is called when the level-up sheet has been filled in and the game is about to continue.
         * You can add custom logic here to process the level-up sheet before the game continues. Return true if
         * you also want the default level-up sheet processing to run.
         * @param game The game about to continue
         * @param characterData The level-up sheet filled in
         */
        levelUp?(character: ICharacter, characterData: ICreateCharacter): boolean;

        /**
         * When specified, this function will be called whenever an enemy is added to a location, allowing you
         * to add some custom logic to this event.
         * @param game The active game
         * @param location The location the enemy is added to
         * @param enemy The enemy added
         */
        addEnemyToLocation?(game: IGame, location: ICompiledLocation, enemy: ICompiledEnemy): void;

        /**
         * When specified, this function will be called whenever the player enters a location.
         * @param game The active game
         * @param location The location the player enters
         * @param travel True if the player arrived by travelling, false or undefined otherwise. A player can get
         * to a location without travelling when a game is loaded, for example.
         */
        // Todo: should there not also be a leaveLocation counterpart? Should that not be used for QuestForTheKing?
        enterLocation?(game: IGame, location: ICompiledLocation, travel?: boolean): void;

        /**
         * This function allows you to add custom logic to execute before combat starts.
         * @param game The active game
         * @param location The current location
         */
        initCombat?(game: IGame, location: ICompiledLocation): void;

        /**
         * This function determines the combat rules for your game.
         * @param game The active game
         * @param enemy The enemy being attacked
         * @param retaliate True if the enemies present can fight back, false or undefined otherwise
         */
        fight(game: IGame, enemy: ICompiledEnemy, retaliate?: boolean): void;

        /**
         * This function will be called when an enemy is defeated.
         * @param game The active game
         * @param enemy The enemy just defeated
         */
        enemyDefeated?(game: IGame, enemy: ICompiledEnemy): void;

        /**
         * Specify this function if you want to do something special when the player's health changes.
         * @param game The active game
         * @param change The change in health points. If the player is wounded, the number will be negative.
         */
        hitpointsChange?(game: IGame, change: number): void;

        /**
         * This function is called when the player's score changes. Return true if you want to toggle the level-up
         * status afterwards.
         * @param game The active game
         * @param change The change in score.
         */
        scoreChange(game: IGame, change: number): boolean;

        /**
         * Use this function if you want to run additonal logic when determining the player's final score on game end.
         * @param game The game about to be ended
         */
        determineFinalScore?(game: IGame): void;

        /**
         * Specify this function if you want to apply custom rules before allowing a player to equip an item. If the player
         * is not allowed to equip the item, return false.
         * @param game The active game
         * @param character The player character
         * @param item The item about to be equipped
         */
        beforeEquip?(game: IGame, character: ICharacter, item: IItem): boolean;

        /**
         * Specify this function if you want to apply custom rules before allowing a player to unequip an item. If the player
         * is not allowed to unequip the item, return false.
         * @param game The active game
         * @param character The player character
         * @param item The item about to be unequipped
         */
        beforeUnequip?(game: IGame, character: ICharacter, item: IItem): boolean;

        /**
         * Use this function if you want to run custom logic to process descriptions before showing them. Get the description using
         * parent[key].
         * @param game The active game
         * @param parent The item containing the description, e.g. the location
         * @param key The property of the item that is the description, e.g. location.description
         */
        // Todo: this seems to be unused. Keep it in?
        processDescription?(game: IGame, parent: any, key: string);

        /**
         * Specify this function if you want to run custom logic to set the description selector when selecting the description when
         * entering a location. Return the selector string. This is useful if you for example want to show different descriptions at
         * night.
         * @param game The active game
         */
        descriptionSelector?(game: IGame): string;
    }
}