﻿namespace MyNewGame.Items {
    export function BasementKey() {
        return Item({
            name: 'Basement key',
            keepAfterUse: false,
            open: {
                name: 'Open',
                action: StoryScript.Actions.OpenWithKey((game: IGame, destionation: StoryScript.IDestination) => {
                    game.logToLocationLog('You open the trap door. A wooden staircase leads down into the darkness.');
                })
            },
            equipmentType: StoryScript.EquipmentType.Miscellaneous
        });
    }
}