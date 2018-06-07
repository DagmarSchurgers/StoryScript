﻿namespace StoryScript {
    /**
     * A quest a player can complete.
     */
    export interface IQuest {
        /**
         * The name of the quest as shown to the player.
         */
        name: string;

        /**
         * The name of the person the player is pursuing this quest for.
         */
        issuedBy?: string;

        /**
         * The quest status, either as a string or a function that can produce a quest status dynamically.
         */
        status: string | ((game: IGame, quest: IQuest, done: boolean) => string),

        /**
         * A function to execute when the player starts this quest.
         * @param game The game object
         * @param quest The quest to start
         * @param person The person this quest is for
         */
        start?(game: IGame, quest: IQuest, person: ICompiledPerson): void;

        /**
         * A function that is called by the engine to determine whether a quest is completed.
         */
        checkDone: ((game: IGame, quest: IQuest) => boolean);

        /**
         * A function to execute when the player completes this quest.
         */
        complete?: ((game: IGame, quest: IQuest, person: ICompiledPerson) => void);

        /**
         * True if the player completed the quest, false otherwise.
         */
        completed?: boolean;

        /**
         * A custom object to track quest progress.
         */
        progress?: any
    }
}