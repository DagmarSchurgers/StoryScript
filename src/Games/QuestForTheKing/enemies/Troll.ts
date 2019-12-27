﻿import { Enemy } from 'storyScript/Interfaces/storyScript';

export function Troll() {
    return Enemy({
        name: 'Troll',
        hitpoints: 22,
        attack: '1d8',
        reward: 4
    });
}