﻿module QuestForTheKing.Locations {
    export function DarkmagicDay(): StoryScript.ILocation {
        return {
            name: 'Dark Magic',
            destinations: [
                {
                    name: 'Back to the Map',
                    target: Locations.Quest1map4
                }              
            ],
                enemies: [
                    Enemies.Mirrorimage
                    
                ]
        }
    }
}    
