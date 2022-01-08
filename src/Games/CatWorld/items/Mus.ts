import { IGame, Item } from '../types';
import { EquipmentType } from 'storyScript/Interfaces/storyScript';
import description from './Mus.html';

export function Mus() {
	return Item({
		name: 'Mus',
		description: description,
		equipmentType: EquipmentType.Miscellaneous,
	});
}