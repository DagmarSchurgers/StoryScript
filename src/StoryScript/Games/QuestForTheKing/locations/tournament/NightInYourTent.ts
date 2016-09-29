﻿module QuestForTheKing.Locations {
    export function NightInYourTent(): StoryScript.ILocation {
        return {
            name: 'Night in your tent',
            destinations: [
                {
                    text: 'Day 3',
                    target: Locations.Day3
                }
            ],
            enemies: [
                custom(Enemies.Assassin, { name: 'Female Assassin'}),
                custom(Enemies.Assassin, { name: 'Male Assassin' })
            ]
        }
    }
}    