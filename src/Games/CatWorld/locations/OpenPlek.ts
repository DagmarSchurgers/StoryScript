import { format } from 'util';
import { removeAction } from '../helpers';
import { Muis } from '../items/Muis';
import { Mus } from '../items/Mus';
import { Moeder } from '../persons/Moeder';
import { IGame, Location } from '../types';
import description from './OpenPlek.html';

export function OpenPlek() {
	const waitText = 'wacht';
	const walkText = 'Loop naar de muis toe.';

	const showMother = (game: IGame, text: string): void => {
		game.currentLocation.persons.push(Moeder);
		game.currentLocation.actions.length = 0;
		game.logToLocationLog(text);
	}

	return Location({
		name: 'De Open Plek',
		description: description,
		destinations: [
			
		],
		features: [
		],
		items: [
		],
		enemies: [
		],
		persons: [
		],
		trade: [
		],
        enterEvents: [
            (game: IGame) => {
                game.logToActionLog('Op het eerste gezicht is alles rustig. Maar dan ruik je prooi en als je wat beter kijkt dan zie je een muis op de grond liggen.')
            }
        ],
		leaveEvents: [
		],
		actions: [
			{
				text: walkText,
				execute: (game: IGame) => {
					game.currentLocation.items.push(Muis);
					game.currentLocation.items.push(Mus);
					showMother(game, `De muis is versgevangen en je ruikt de geur van je moeder.Opeens hoor je :"Hallo ${game.character.name}".`);
				},
			},
			{
				text: waitText,
				execute: (game: IGame) => {
					removeAction(game, walkText);
					game.logToLocationLog(`Als je wacht hoor je een kat naar de open plek toe lopen. Even later zie je moeder met een mus het struikgewas uit komen. 
					Ze zegt: "kom maar, ${game.character.name}".`);

					game.currentLocation.actions.push({ 
						text: 'blijf waar je bent', 
						execute: (game: IGame) => {
							showMother(game, ``);
					}});

					game.currentLocation.actions.push({ 
						text: 'loop naar je moeder toe', 
						execute: (game: IGame) => {
							showMother(game, ``);
					}});
				},
			},
		],
		combatActions: [
		],
	});
}