﻿import { Item, EquipmentType } from 'storyScript/Interfaces/storyScript';
import { Class } from '../classes';
import description from './DetectMagic.html';

export function DetectMagic() {
    return Item({
        name: 'Detect Magic',
        description: description,
        damage: '2',
        equipmentType: EquipmentType.Hands,
        dayAvailable: 1,
        arcane: true,
        value: 7,
        itemClass: Class.Wizard    
    });
}