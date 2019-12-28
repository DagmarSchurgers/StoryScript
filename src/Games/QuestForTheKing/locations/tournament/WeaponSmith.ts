﻿import { Location, IGame, ITrade, IItem } from '../../types';
import description from './WeaponSmith.html';
import { HealersTent } from './HealersTent';
import { Class } from '../../classes';

export function WeaponSmith() {
    return Location({
        name: 'Weapon Smith',
        description: description,
        descriptionSelector: (game: IGame) => {
            return 'day' + game.worldProperties.currentDay;
        },
        destinations: [
            {
                name: 'Healers Tent',
                target: HealersTent
            }
        ],
        trade: [{
            name: 'Trade with Bjarni',
            description: 'Bjarni has several items for sale',
            currency: 10,
            initCollection: (game: IGame, trade: ITrade) => {
                var reset = false;
                trade.currentDay = trade.currentDay || 0;

                if (game.worldProperties.currentDay != trade.currentDay) {
                    trade.currentDay = game.worldProperties.currentDay;
                    reset = true;
                }

                return reset;
            },
            buy: {
                description: 'Buy from Bjarni',
                emptyText: 'Bjarni has nothing to trade',
                itemSelector: (game: IGame, item: IItem) => {
                    return game.worldProperties.currentDay == item.dayAvailable && !item.arcane && (item.itemClass == game.character.class || (Array.isArray(item.itemClass) && (<Class[]>item.itemClass).indexOf(game.character.class) > -1));
                },
                maxItems: 5
            },
            sell: {
                description: 'Sell to Bjarni',
                emptyText: 'There is nothing for you to trade',
                itemSelector: (game: IGame, item: IItem) => {
                    return !item.arcane;
                },
                maxItems: 5
            }
        }]
    });
}