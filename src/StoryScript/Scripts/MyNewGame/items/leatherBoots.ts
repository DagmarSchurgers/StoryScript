﻿module MyNewGame.Items {
    export function LeatherBoots(): StoryScript.IItem {
        return {
            name: 'Leather boots',
            defense: 1,
            equipmentType: StoryScript.EquipmentType.Feet
        }
    }
}