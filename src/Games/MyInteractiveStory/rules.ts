﻿import { IRules, CreateCharacters, ICharacter, Combinations, Enumerations } from '../../Engine/Interfaces/storyScript';
import { IGame, IEnemy, Character } from './types';

export function Rules(): IRules {
    return {
        setup: {
            autoBackButton: true,
            playList: [
                [Enumerations.GameState.Play, 'Contemplate_the_stars.mp3']
            ],
            getCombinationActions: (): Combinations.ICombinationAction[] => {
                return [
                    // Add combination action names here if you want to use this feature.
                ];
            }
        },

        general: {  
            scoreChange: (game: IGame, change: number): boolean => {
                // Implement logic to occur when the score changes. Return true when the character gains a level.
                return false;
            }
        },
        
        character: {
            getSheetAttributes: (): string[] => {
                return [
                    // Add the character attributes that you want to show on the character sheet here
                ];
            },

            getCreateCharacterSheet: (): CreateCharacters.ICreateCharacter => {
                return {
                    steps: [
                        // Add the character creation steps here, if you want to use character creation.
                    ]
                };
            },

            createCharacter: (game: IGame, characterData: CreateCharacters.ICreateCharacter): ICharacter => {
                var character = new Character();
                return character;
            }
        },

        exploration: {
            
        },

        combat: {     
            fight: (game: IGame, enemy: IEnemy, retaliate?: boolean) => {
                retaliate = retaliate == undefined ? true : retaliate;

                // Implement character attack here.

                if (retaliate) {
                    game.currentLocation.activeEnemies.filter((enemy: IEnemy) => { return enemy.hitpoints > 0; }).forEach(enemy => {
                        // Implement monster attack here
                    });
                }
            }
        }
    };
}