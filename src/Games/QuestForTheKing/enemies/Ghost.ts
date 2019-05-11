﻿module QuestForTheKing.Enemies {
    export function Ghost() {
        return BuildEnemy({
            name: 'Wraith',
            hitpoints: 14,
            attack: '1d4',
            reward: 1,
            activeNight: true
        });
    }
}