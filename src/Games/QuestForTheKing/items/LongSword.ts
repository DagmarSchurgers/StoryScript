﻿import { Item, EquipmentType } from 'storyScript/Interfaces/storyScript';
import { Class } from '../classes';
import description from './Longsword.html';

export function LongSword() {
    return Item({
        name: 'Long Sword',
        description: description,
        damage: '1D6',
        equipmentType: EquipmentType.LeftHand,
        value: 5,
        attackText: 'You swing your longsword',
        itemClass: Class.Warrior
    });
}