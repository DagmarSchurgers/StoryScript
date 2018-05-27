﻿namespace StoryScript {
    /**
     * Actions available to the player when exploring the location.
     */
    export interface IAction {
        /**
         * The text shown for this action (e.g. 'Search').
         */
        text?: string;

        /**
         * How to visually identify this action to the player.
         */
        type?: ActionType;

         /**
         * The action status or a function that returns an action status to set the status dynamically.
         */
        status?: ActionStatus | ((game: IGame, ...params) => ActionStatus);

         /**
         * The function to execute when the player selects the action.
         */
        // Todo: it seems only the game parameter is used right now. Do we need the other arguments?
        execute: ((game: IGame, actionIndex: number, ...params) => void) | string;

        /**
         * Additional parameters to pass to the execute function.
         */
        // Todo: will this ever be used? Do we need this?
        arguments?: any[];
    }
}