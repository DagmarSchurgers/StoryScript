﻿module QuestForTheKing.Items {
    export function Leatherarmor() {
        return BuildItem({
            name: 'Leather Armor',
            damage: '2',
            equipmentType: StoryScript.EquipmentType.Body,
            dayAvailable: 1,
            arcane: false,
            value: 10,
            itemClass: [Class.Rogue, Class.Warrior]
        });
    }
}