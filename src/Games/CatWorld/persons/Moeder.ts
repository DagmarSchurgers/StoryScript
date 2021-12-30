import { IGame, IPerson, Person } from '../types';
import description from './Moeder.html';

export function Moeder() {
	return Person({
		name: 'Wolk, je moeder.',
		description: description,
		hitpoints: 10,
		canAttack: false,
		items: [
		],
		quests: [
		],
		conversation: {
			actions: {
			}
		},
	});
}