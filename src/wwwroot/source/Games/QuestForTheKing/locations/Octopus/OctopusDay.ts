﻿module QuestForTheKing.Locations {
    export function OctopusDay(): StoryScript.ILocation {
        return {
            name: 'The Giant Octopus',
            destinations: [
                {
                    name: 'Back to the Map',
                    target: Locations.Quest1map2
                }              
            ],
                enemies: [
                    Enemies.Octopus
                    
            ],               
        }
    }
}    
