﻿module QuestForTheKing.Items {
    export function Poisondagger(): IItem {
        return {
            name: 'Poison Dagger',
            damage: '3',
            equipmentType: StoryScript.EquipmentType.LeftHand,           
            value: 5,
            attackText: 'You thrust your dagger',
            itemClass: Class.Rogue           
        }
    }
}