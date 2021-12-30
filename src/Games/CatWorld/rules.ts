import { IRules, ICharacter, ICreateCharacter, ICombinationAction } from 'storyScript/Interfaces/storyScript';
import { IGame, IEnemy, Character } from './types';

export function Rules(): IRules {
    return {
        setup: {
            getCombinationActions: (): ICombinationAction[] => {
                return [
                    // Add combination action names here if you want to use this feature.
                ];
            },
            autoBackButton: true
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

            getCreateCharacterSheet: (): ICreateCharacter => {
                return {
                    steps: [
                        // Add the character creation steps here, if you want to use character creation.
                        {
                            attributes: [
                                {
                                    question: 'Hoe heet je?',
                                    entries: [
                                        {
                                            attribute: 'name'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            questions: [
                                {
                                    question: 'Wat is de kleur van je vacht?',
                                    entries: [
                                        {
                                            text: 'Zwart',
                                            value: 'zwart',
                                            bonus: 1
                                        },
                                        {
                                            text: 'Wit',
                                            value: 'wit',
                                            bonus: 1
                                        },
                                    ]
                                },
                            ],
                        },
                        {
                            questions: [
                                {
                                    question: 'Wat is het patroon van je vacht?',
                                    entries: [
                                        {
                                            text: 'Effen',
                                            value: 'effen',
                                            bonus: 1
                                        },
                                        {
                                            text: 'Gevlekt',
                                            value: 'gevlekt',
                                            bonus: 1
                                        },
                                    ]
                                },
                            ]
                        },
                    ]
                };
            },

            createCharacter: (game: IGame, characterData: ICreateCharacter): ICharacter => {
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