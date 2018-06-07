﻿module QuestForTheKing.Enemies {
    export function Farmboy(): IEnemy {
        return {
            name: 'Farmboy',
            description: StoryScript.Constants.HTML,
            hitpoints: 10,
            attack: '1d4',
            reward: 1,
            currency: 10
        }
    }
}