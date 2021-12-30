import { IGame, Item } from '../types';
import { EquipmentType } from 'storyScript/Interfaces/storyScript';
import description from './Muis.html';

export function Muis() {
	return Item({
		name: 'Muis',
		description: description,
		equipmentType: EquipmentType.Miscellaneous,
		
	});
}