import { IGame, Item } from '../types';
import { EquipmentType } from '../../../Engine/Interfaces/storyScript';

export function Sword() {
    return Item({
        name: 'Sword',
        equipmentType: EquipmentType.Hands,
        useInCombat: true,
        combatSound: 'sword-unsheathe5.wav'
    });
}