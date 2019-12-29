﻿import { Item, EquipmentType } from 'storyScript/Interfaces/storyScript';
import { Class } from '../classes';
import description from './Heavymace.html';

export function Heavymace() {
    return Item({
        name: 'Heavy Mace',
        description: description,
        damage: '2',
        equipmentType: [EquipmentType.LeftHand, EquipmentType.RightHand],
        dayAvailable: 3,
        arcane: false,
        value: 25,
        attackText: 'You swing your heavy mace',
        itemClass: Class.Warrior
    });
}