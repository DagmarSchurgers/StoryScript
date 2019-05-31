﻿namespace StoryScript {
    /**
     * The base properties of a character in the game the player can talk or trade with.
     */
    export interface IPersonBase extends IEnemyBase {
        /**
         * True if the player can attack the character, false otherwise.
         */
        canAttack?: boolean;
    }

    /**
     * Defines a character in the game the player can talk or trade with.
     */
    export interface IPerson extends IPersonBase {
        /**
         * The trade settings for the person.
         */
        trade?: ITrade;

        /**
         * The conversation options for the person.
         */
        conversation?: IConversationOptions;

        /**
         * The quests this person has available.
         */
        quests?: ICollection<() => IQuest>;
    }

    /**
     * A character in the game the player can talk or trade with, compiled for run-time.
     */
    export interface ICompiledPerson extends IPersonBase, ICompiledEnemy {
        /**
         * The trade settings for the person.
         */
        trade?: ICompiledTrade;

        /**
         * The conversation options for the person.
         */
        conversation?: IConversation;

        /**
         * The quests this person has available.
         */
        quests?: ICollection<IQuest>;
    }
}