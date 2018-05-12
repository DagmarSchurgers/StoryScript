﻿module QuestForTheKing.Locations {
    export function Ravendal(): StoryScript.ILocation {
        return {
            name: 'Ravendal',
            destinations: [
                {
                    name: 'Fasold the Storyteller',
                    target: Locations.Fasold1
                },
                {

                    name: 'Aifor',
                    target: Locations.Aifor
                },            
                {

                    name: 'Gelandri',
                    target: Locations.Gelandri
                },
                {

                    name: 'Idunia',
                    target: Locations.Idunia2
                },       
                {

                    name: 'Lysa',
                    target: Locations.Lysa
                },        
                {

                    name: 'Sandfell',
                    target: Locations.Sandfell
                },  
            ]
        }
    }
}