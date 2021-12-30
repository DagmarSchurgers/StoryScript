import { IGame, Location } from '../types';
import description from './bos.html';
import { OpenPlek } from './OpenPlek';

export function Bos() {
	return Location({
		name: 'Het Bos',
		description: description,
		destinations: [
			{
                name: 'Volg het paadje',
                target: OpenPlek
            },
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
		],
		leaveEvents: [
		],
		actions: [
		],
		combatActions: [
		],
	});
}