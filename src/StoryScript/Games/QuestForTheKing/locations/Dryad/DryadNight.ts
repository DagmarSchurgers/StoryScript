﻿module QuestForTheKing.Locations {
    export function DryadNight(): StoryScript.ILocation {
        return {
            name: 'The Dryad Tree',
            destinations: [
                {
                    text: 'Back to the Map',
                    target: Locations.Quest1map3
                }           

            ]
        }
    }
}    
