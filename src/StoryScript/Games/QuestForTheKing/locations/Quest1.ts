﻿module QuestForTheKing.Locations {
    export function Quest1(): StoryScript.ILocation {
        return {
            name: 'Your First Quest',
            destinations: [
                {
                    text: 'Begin your Quest',
                    target: Locations.Quest1map1
                }             
            ]
        }
    }
}