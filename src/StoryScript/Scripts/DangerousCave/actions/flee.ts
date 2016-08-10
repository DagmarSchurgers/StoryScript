﻿module DangerousCave.Actions {
    export function Flee(text: string): StoryScript.IAction {
        return {
            text: text || 'Vluchten!',
            type: StoryScript.ActionType.Check,
            status: function (game: IGame) {
                return StoryScript.isEmpty(game.currentLocation.enemies) ? StoryScript.ActionStatus.Unavailable : StoryScript.ActionStatus.Available;
            },
            execute: function (game: IGame) {
                var check = game.rollDice(game.character.vlugheid + 'd6');
                var result = check * game.character.vlugheid;
                var totalHitpoints = 0;

                game.currentLocation.enemies.forEach(function (enemy) {
                    totalHitpoints += enemy.hitpoints;
                });

                if (result >= totalHitpoints / 2) {
                    game.changeLocation();
                }
                else {
                    game.logToActionLog('Je ontsnapping mislukt!');
                };

                return true;
            }
        }
    }
}