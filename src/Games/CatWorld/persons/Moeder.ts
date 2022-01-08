import { Start } from '../locations/start';
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
				'terugNaarNest': (game: IGame, person: IPerson) => {
					var nest = game.locations.get(Start);
					nest.persons.push(person);
					game.currentLocation.persons.length = 0;
					game.changeLocation(Start);
				}
			}
		},
	});
}