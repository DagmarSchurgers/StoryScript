﻿module RidderMagnus.Items {
    export function KleinSchild(): IItem {
        return {
            name: 'Klein schild',
            defense: 1 ,
            equipmentType: StoryScript.EquipmentType.LeftHand ,
            value: 4
            //requirement: vechten >1
        }
    }
}