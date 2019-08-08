﻿namespace PathOfHeroes {
    export class Rules implements StoryScript.IRules {
        general = {
            scoreChange: (game: IGame, change: number): boolean => {
                var self = this;
    
                // Implement logic to occur when the score changes. Return true when the character gains a level.
                return false;
            }
        };

        character = {
            getSheetAttributes: (): string[] => {
                return [
                    'currency',
                    'strength',
                    'melee',
                    'armor',
                    'agility',
                    'ranged',
                    'stealth',
                    'intelligence',
                    'creation',
                    'destruction',
                    'charisma',
                    'body',
                    'spirit'
                ];
            },

            getCreateCharacterSheet: (): StoryScript.ICreateCharacter => {
                return {
                    steps: [
                        {
                            questions: [
                                {
                                    question: 'Do you want to start play...',
                                    entries: [
                                        {
                                            text: 'Right away',
                                            value: '1'
                                        },
                                        {
                                            text: 'After telling your story',
                                            value: '2'
                                        },
                                        {
                                            text: 'By fine-tuning your sheet',
                                            value: '3'
                                        }
                                    ]
                                }
                            ],
                            nextStepSelector: (character, currentStep) => {
                                switch (currentStep.questions[0].selectedEntry.value) {
                                    case '1': {
                                        return 1;
                                    };
                                    case '2': {
                                        return 2;
                                    };
                                    case '3': {
                                        return 3;
                                    };
                                    default: {
                                        return 0;
                                    }
                                }
                            }
                        },
                        {
                            questions: [
                                {
                                    question: 'Select your hero',
                                    entries: [
                                        {
                                            text: 'Barlon the Oak',
                                            value: 'barlon',
                                            bonus: 1
                                        },
                                        {
                                            text: 'Stella the Quick',
                                            value: 'stella',
                                            bonus: 1
                                        },
                                        {
                                            text: 'Jane Orion',
                                            value: 'jane',
                                            bonus: 1
                                        },
                                        {
                                            text: 'Marlin Peacemaker',
                                            value: 'marlin',
                                            bonus: 1
                                        }
                                    ]
                                }
                            ],
                            nextStepSelector: 4
                        },
                        {
                            questions: [
                                {
                                    question: 'As a child, you were always...',
                                    entries: [
                                        {
                                            text: 'strong in fights',
                                            value: 'strength',
                                            bonus: 1
                                        },
                                        {
                                            text: 'a fast runner',
                                            value: 'agility',
                                            bonus: 1
                                        },
                                        {
                                            text: 'a curious reader',
                                            value: 'intelligence',
                                            bonus: 1
                                        }
                                    ]
                                }
                            ],
                            nextStepSelector: 4
                        },
                        {
                            attributes: [
                                {
                                    question: 'As a child, you were always...',
                                    numberOfPointsToDistribute: 10,
                                    entries: [
                                        {
                                            attribute: 'strength',
                                            max: 5,
                                            min: 1
                                        },
                                        {
                                            attribute: 'agility',
                                            max: 5,
                                            min: 1
                                        },
                                        {
                                            attribute: 'intelligence',
                                            max: 5,
                                            min: 1
                                        },
                                        {
                                            attribute: 'charisma',
                                            max: 5,
                                            min: 1
                                        }
                                    ]
                                }
                            ],
                            nextStepSelector: 4
                        },
                        {
                            questions: [
                                {
                                    question: 'Select your weapon...',
                                    entries: [
                                    ]
                                }
                            ]
                        }
                    ]
                };
            },

            createCharacter: (game: IGame, characterData: StoryScript.ICreateCharacter): StoryScript.ICharacter => {
                var self = this;
                var character = new Character();
                return character;
            }
        };

        combat = {
            fight: (game: IGame, enemy: IEnemy): void => {
                var self = this;

                // Implement character attack here.

                game.currentLocation.enemies.filter((enemy: IEnemy) => { return enemy.hitpoints > 0; }).forEach(function (enemy) {
                    // Implement monster attack here
                });
            }
        }
    }
}