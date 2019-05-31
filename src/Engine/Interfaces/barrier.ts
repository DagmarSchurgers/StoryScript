﻿namespace StoryScript {
    /**
     * The base properties for barriers that block a player from moving between one world location to the next.
     */
    export interface IBarrierBase extends ICombinable {
        /**
         * The actions the player can perform on the barrier (e.g. inspect or open).
         */
        actions?: ICollection<IBarrierAction>;

        /**
         * The currently selected action for the barrier. Used during run-time only.
         */
        selectedAction?: IBarrierAction;
    }

    /**
     * Barriers that block a player from moving between one world location to the next.
     */
    export interface IBarrier extends IBarrierBase {
        /**
         * The key used to remove this barrier. This is an item implementing the IKey interface.
         */
        key?: () => IKey;
    }

    /**
     * Barriers that block a player from moving between one world location to the next, compiled for runtime.
     */
    export interface ICompiledBarrier extends IBarrierBase, ICompiledCombinable {
        /**
         * The key used to remove this barrier. This is an item implementing the IKey interface.
         */
        key?: ICompiledKey;
    }

    /**
     * Actions that can be performed on barriers, like opening doors or rowing across rivers.
     */
    export interface IBarrierAction {
        /**
         * The name of the barrier action as show to the player.
         */
        name: string;

        /**
         * The function to execute when the player selects this action.
         * @param game The game object
         * @param params The parameters for the action
         */
        // Todo: should the params collection be this generic or should it be more specific, e.g. just passing in the barrier
        // the action is for? Right now only the game, the destination the action is for, the barrier and the action itself are passed in.
        action(game: IGame, ...params): void;
    }
}