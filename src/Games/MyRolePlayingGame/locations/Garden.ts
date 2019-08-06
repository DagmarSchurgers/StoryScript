namespace MyRolePlayingGame.Locations {
    export function Garden() {
        return Location({
            name: 'Garden',
            destinations: [
                {
                    name: 'Enter your home',
                    target: Locations.Start,
                }
            ],
            enterEvents: [
                (game) => {
                    game.logToActionLog('You see a squirrel running off.');
                }
            ],
            actions: [
                {
                    text: 'Search the Shed',
                    execute: (game) => {
                        // Add a new destination.
                        // Todo: make sure the destination action function pointer is set correctly when storing the game.
                        game.currentLocation.destinations.push({
                            name: 'Enter the basement',
                            target: Locations.Basement,
                            barrier: {
                                name: 'Wooden trap door',
                                key: Items.BasementKey,
                                actions: [
                                    {
                                        name: 'Inspect',
                                        action: (game: IGame) => {
                                            game.logToLocationLog('The trap door looks old but still strong due to steel reinforcements. It is locked.');
                                        }
                                    }
                                ]
                            }
                        });
                    }
                },
                {
                    text: 'Look in the pond',
                    execute: (game: IGame) => {
                        game.logToLocationLog(`The pond is shallow. There are frogs
                             and snails in there, but nothing of interest.`);
                    }
                }
            ]
        });
    }
}