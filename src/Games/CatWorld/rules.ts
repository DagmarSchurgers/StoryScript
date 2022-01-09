import { IItem } from 'Games/MyAdventureGame/types';
import { ICreateCharacterQuestionEntry } from 'storyScript/Interfaces/createCharacter/createCharacterQuestionEntry';
import { IRules, ICharacter, ICreateCharacter, ICombinationAction, ICreateCharacterStep } from 'storyScript/Interfaces/storyScript';
import { IGame, IEnemy, Character } from './types';

export function Rules(): IRules {
    const vachtKleurKeuzes: ICreateCharacterQuestionEntry[] = ['zwart', 'wit', 'rood', 'bruin', 'grijs','zilvergrijs','donkergrijs','lichtgrijs','lichtbruin','donkerbruin'].map(r => <ICreateCharacterQuestionEntry>{
        text: r,
        value: r,
        bonus: 1
    });

    const oogKleurKeuzes : ICreateCharacterQuestionEntry[] = ['groen', 'blauw'].map(r => <ICreateCharacterQuestionEntry>{
        text: r,
        value: r,
        bonus: 1
    });

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
                                        {
                                            text: 'Gestreept',
                                            value: 'gestreept',
                                            bonus: 1
                                        },
                                        {
                                            text: 'Gestipt',
                                            value: 'gestipt',
                                            bonus: 1
                                        },
                                    ]
                                },
                            ],
                            nextStepSelector: (characterData: ICreateCharacter, step: ICreateCharacterStep) => {
                                var selected = characterData.steps[characterData.currentStep].questions[0].selectedEntry;
            
                                if (selected.value != 'effen') {
                                    let effect;
                                    
                                    switch (selected.value)
                                    {
                                        case 'gevlekt': {
                                            effect = 'vlekken';
                                        }; break;
                                        case 'gestreept': {
                                            effect = 'strepen';
                                        }; break;
                                        case 'gestipt': {
                                            effect = 'stippen';
                                        }; break;
                                    }
                                    
                                    characterData.steps.splice(3, 0, {
                                        questions: [
                                            {
                                                question: `Wat is de kleur van je ${effect}?`,
                                                entries: vachtKleurKeuzes
                                            },
                                        ]
                                    },)
                                }

                                return 2;
                            }
                        },
                        {
                            questions: [
                                {
                                    question: 'Wat is de kleur van je vacht?',
                                    entries: vachtKleurKeuzes
                                },
                            ],
                        },
                        {
                            questions: [
                                {
                                    question: 'Wat is de kleur van je ogen?',
                                    entries: oogKleurKeuzes
                                },
                            ],
                        },
                        {
                            questions: [
                                {
                                    question: 'Wat kun je?',
                                    entries: [
                                        {
                                            text: 'jagen',
                                            value: 'jagen',
                                            bonus: 1
                                        },
                                        {
                                            text: 'vechten',
                                            value: 'vechten',
                                            bonus: 1
                                        },
                                        {
                                            text: 'klimmen',
                                            value: 'klimmen',
                                            bonus: 1
                                        },
                                    ]                                       
                                
                                   
                                
                                    }
                            ],
                        }
                    ]
                };
            },

            createCharacter: (game: IGame, characterData: ICreateCharacter): ICharacter => {
                var character = new Character();
                return character;
            },
            
            beforePickup: (game: IGame, character: ICharacter, item: IItem) => {
                character.items.forEach(i => game.currentLocation.items.push(i));
                character.items.length = 0;
                return true;
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