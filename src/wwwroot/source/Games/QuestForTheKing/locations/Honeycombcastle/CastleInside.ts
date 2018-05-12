﻿module QuestForTheKing.Locations {
    export function CastleInside(): StoryScript.ILocation {
        return {
            name: 'Entering the Castle',
            destinations: [
                {
                    name: 'Back to the Map',
                    target: Locations.Quest1map2
                }
            ],
            persons: [
                Persons.QueenBee
            ]
        }
    }
}    
