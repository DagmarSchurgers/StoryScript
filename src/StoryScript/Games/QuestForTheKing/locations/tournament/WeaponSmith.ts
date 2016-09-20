﻿module QuestForTheKing.Locations {
    export function WeaponSmith(): StoryScript.ILocation {
        return {
            name: 'Weapon Smith',
            descriptionSelector: (game: IGame) => {
                return 'day' + game.currentDay;
            },
            destinations: [
                {
                    text: 'Healers Tent',
                    target: Locations.HealersTent
                }
            ],
            trade: {
                title: 'Trade with Bjarni',
                description: 'Bjarni has several items for sale',
                currency: 10,
                initCollection: (game: IGame, trade: ITrade) => {
                    var reset = false;
                    trade.currentDay = trade.currentDay || 0;

                    if (game.currentDay != trade.currentDay) {
                        trade.currentDay = game.currentDay;
                        reset = true;
                    }

                    return reset;
                },
                buy: {
                    description: 'Sell to Bjarni',
                    emptyText: 'There is nothing for you to trade',
                    itemSelector: (game: IGame, item: IItem) => {
                        return !item.arcane;
                    },
                    maxItems: 5
                },
                sell: {
                    description: 'Buy from Bjarni',
                    emptyText: 'Bjarni has nothing to trade',
                    itemSelector: (game: IGame, item: IItem) => {
                        return game.currentDay == item.dayAvailable && !item.arcane && (item.itemClass == game.character.class || (Array.isArray(item.itemClass) && (<Class[]>item.itemClass).indexOf(game.character.class) > -1));
                    },
                    maxItems: 5
                }
            }
        }
    }
}