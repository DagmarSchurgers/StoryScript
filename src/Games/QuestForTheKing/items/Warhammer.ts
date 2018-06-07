﻿module QuestForTheKing.Items {
    export function Warhammer(): IItem {
        return {
            name: 'Warhammer',
            description: StoryScript.Constants.HTML,
            damage: '2',
            equipmentType: StoryScript.EquipmentType.LeftHand,
            value: 5,
            attackText: 'You swing your warhammer',
            itemClass: Class.Warrior
        }
    }
}