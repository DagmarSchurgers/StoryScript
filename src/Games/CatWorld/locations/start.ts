import { ICollection } from 'storyScript/Interfaces/collection';
import { IGame, Location } from '../types'
import { Bos } from './bos';
import { OpenPlek } from './OpenPlek';
import description from './Start.html'

export function Start() {
    return Location({
        name: 'Je nest',
        description: description,
        destinations: [
            {
                name: 'Naar het bos',
                target: Bos
            },
        ],
        enterEvents: [
            (game: IGame) => {
                game.logToActionLog('Als je rondt kijkt zie je je broer die ligt te slapen.Je moeder is gaan jagen.Je ruikt dat ze het nest uit is gegaan,het bos in.');
            }
        ]
    });
}