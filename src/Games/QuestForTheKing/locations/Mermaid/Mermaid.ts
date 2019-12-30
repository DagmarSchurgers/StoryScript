import { IGame, Location } from '../../types';
import description from './mermaid.html';
import { Pearl } from '../../items/Pearl';
import { Magicflower } from '../../items/Magicflower';
import { Quest1map2 } from '../Maps/Quest1map2';

export function Mermaid() {
    return Location({
        name: 'Mermaid',
        description: description,
        destinations: [
            {
                name: 'Back to the Map',
                target: Quest1map2
            },  
        ],
        actions: [
            {
                text: 'Help the Mermaid',
                execute: (game: IGame) => {
                    game.character.items.push(Pearl());
                    setCompleted(game, 'helpmermaid');
                },
                activeDay: true
            },
            {
                text: 'Give the Magic Flower to the Mermaid',
                execute: (game: IGame) => {
                    game.character.items.remove(Magicflower);
                    game.character.items.push(Pearl());
                    setCompleted(game, 'giveflower');
                },
                activeNight: true
            },
            {
                text: 'Keep the Magic Flower',
                execute: (game: IGame) => {
                    setCompleted(game, 'refuseflower');
                    
                },
                activeNight: true
            },
        ],
        leaveEvents: [
            (game: IGame) => {
                game.currentLocation.descriptionSelector = null;
            }
        ]
    });

    function setCompleted(game: IGame, descriptionSelector: string) {
        game.currentLocation.descriptionSelector = descriptionSelector;
        game.currentLocation.actions.length = 0;
        game.currentLocation.completedDay = true;
        game.currentLocation.completedNight = true;
    }
}