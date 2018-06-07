﻿module QuestForTheKing.Items {
    export function Claymore(): IItem {
        return {
            name: 'Claymore',
            description: StoryScript.Constants.HTML,
            damage: '2',
            equipmentType: [StoryScript.EquipmentType.LeftHand, StoryScript.EquipmentType.RightHand],
            dayAvailable: 3,
            arcane: false,
            value: 30,
            attackText: 'You swing your claymore',
            itemClass: Class.Warrior
        }
    }
}