﻿import { Item, EquipmentType } from 'storyScript/Interfaces/storyScript';
import { Class } from '../classes';
import description from './Strengthpotion.html';

export function Strengthpotion() {
    return Item({
        name: 'Strength Potion',
        description: description,
        damage: '2',
        equipmentType: EquipmentType.Miscellaneous,
        dayAvailable: 2,
        arcane: true,
        value: 5
    });
}