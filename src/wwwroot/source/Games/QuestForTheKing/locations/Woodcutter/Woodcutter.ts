﻿module QuestForTheKing.Locations {
    export function Woodcutter(): StoryScript.ILocation {
        return {
            name: 'The Woodcutters Cottage',
            destinations: [
                {
                    name: 'Back to the Map',
                    target: Locations.Quest1map1                       
                }
            ],
            enemies: [
                Enemies.Ghost
            ],
            items: [
                Items.Parchment,
                Items.Bow,
            ]
        }
    }
}