﻿module QuestForTheKing.Enemies {
    export function Brownbear() {
        return BuildEnemy({
            name: 'Brown Bear',
            hitpoints: 20,
            attack: '1d8',
            reward: 2,
            activeDay: true
        });
    }
}