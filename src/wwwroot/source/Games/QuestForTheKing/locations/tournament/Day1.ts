﻿module QuestForTheKing.Locations {
    export function Day1(): StoryScript.ILocation {
        return {
            name: 'Day 1',
            destinations: [
                {
                    name: 'Day 2',
                    target: Locations.Day2
                },
                {

                    name: 'Weapon Smith',
                    target: Locations.WeaponSmith
                },
                {

                    name: 'The Storyteller',
                    target: Locations.Fasold1
                },
                {

                    name: 'Healers Tent',
                    target: Locations.HealersTent
                }

            ],
            enemies: [
                Enemies.Farmboy
            ],
            events: [
                changeDay
            ]
        }
    }
}