﻿module QuestForTheKing.Items {
    export function Warhammer() {
        return BuildItem({
            name: 'Warhammer',
            damage: '2',
            equipmentType: StoryScript.EquipmentType.LeftHand,
            value: 5,
            attackText: 'You swing your warhammer',
            itemClass: Class.Warrior
        });
    }
}