﻿module StoryScript.Locations {
    export function LeftRoom(): Interfaces.ILocation {
        return {
            name: 'De slaapkamer van de orks',
            enemies: [
                Enemies.Orc,
                Enemies.Goblin
            ],
            destinations: [
                {
                    text: 'De kamer van de ork',
                    target: Locations.RoomOne
                }
            ]
        }
    }
}