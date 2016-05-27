﻿module StoryScript.Locations {
    export function LeftCorridor(): ILocation {
        return {
            name: 'Een pikdonkere gang',
            events: [
                (game: DangerousCave.Game) => {
                    var damage = Math.floor(Math.random() * 6 + 1) - game.character.vlugheid;
                    game.character.currentHitpoints -= Math.max(0, damage);
                    game.logToActionLog('Aah! Je valt plotseling in een diepe kuil en bezeert je. Je krijgt ' + damage + ' schade door het vallen!');
                    game.logToLocationLog('Er is hier een diepe valkuil.')
                }
            ],
            actions: [
                    {
                    text: 'Klim uit de kuil',
                    type: 'skill',
                    execute: (game: DangerousCave.Game) => {
                        // Todo: skill check
                        //if (false) {
                        //    game.logToActionLog('Het lukt je niet uit de kuil te klimmen.');
                        //    return;
                        //}

                        game.logToActionLog('Je klimt uit de kuil.');

                        game.currentLocation.destinations.push(
                            {
                                text: 'Dieper de grot in',
                                target: Locations.DoorOne
                            },
                            {
                                text: 'Richting ingang',
                                target: Locations.Entry
                            }
                        );

                        // Todo: does this work?
                        var action = game.currentLocation.actions.first((x: IAction) => { return x.text === 'Klim uit de kuil'; });
                        game.currentLocation.actions.remove(action);
                        delete game.currentLocation.actions['klimmen'];
                    }
                },
                Actions.Search({
                    text: 'Doorzoek de kuil',
                    difficulty: 9,
                    success: (game) => {
                        game.currentLocation.items.push(Items.LeatherHelmet());
                        game.logToLocationLog('In de kuil voel je botten, spinrag en de resten van kleding. Ook vind je er een nog bruikbare helm!')
                    },
                    fail: (game) => {
                        game.logToLocationLog('In de kuil voel je botten, spinrag en de resten van kleding.');
                    }
                })
            ]
        }
    }
}