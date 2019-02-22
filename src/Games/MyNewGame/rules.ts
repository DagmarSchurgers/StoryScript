﻿namespace MyNewGame {
    export class Rules implements StoryScript.IRules {
        getSheetAttributes = () => {
            return [
                'strength',
                'agility',
                'intelligence'
            ]
        };

        getCreateCharacterSheet = (): StoryScript.ICreateCharacter => {
            return {
                steps: [
                    {
                        attributes: [
                            {
                                question: 'What is your name?',
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
                        ]
                    },
                    {
                        questions: [
                            {
                                question: 'When time came to become an apprentice, you chose to...',
                                entries: [
                                    {
                                        text: 'become a guard',
                                        value: 'strength',
                                        bonus: 1
                                    },
                                    {
                                        text: 'learn about locks',
                                        value: 'agility',
                                        bonus: 1
                                    },
                                    {
                                        text: 'go to magic school',
                                        value: 'intelligence',
                                        bonus: 1
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
        }

        public createCharacter(game: IGame, characterData: StoryScript.ICreateCharacter): StoryScript.ICharacter {
            var self = this;
            var character = new Character();
            return character;
        }

        fight = (game: IGame, enemy: ICompiledEnemy) => {
            var self = this;
            var damage = game.helpers.rollDice('1d6') + game.character.strength + game.helpers.calculateBonus(game.character, 'damage');
            game.logToCombatLog('You do ' + damage + ' damage to the ' + enemy.name + '!');
            enemy.hitpoints -= damage;

            if (enemy.hitpoints <= 0) {
                game.logToCombatLog('You defeat the ' + enemy.name + '!');
            }

            game.currentLocation.activeEnemies.filter((enemy: ICompiledEnemy) => { return enemy.hitpoints > 0; }).forEach(function (enemy) {
                var damage = game.helpers.rollDice(enemy.attack) + game.helpers.calculateBonus(enemy, 'damage');
                game.logToCombatLog('The ' + enemy.name + ' does ' + damage + ' damage!');
                game.character.currentHitpoints -= damage;
            });
        }

        scoreChange(game: IGame, change: number): boolean {
            var self = this;

            // Implement logic to occur when the score changes. Return true when the character gains a level.
            return false;
        }

        getCombinationActions = (): StoryScript.ICombinationAction[] => {
            return [
                {
                    text: 'Use',
                    preposition: 'with',
                    failText: (game, tool, target): string => { return 'That is not going to work.'; }
                },
                {
                    text: 'Look',
                    preposition: 'at',
                    requiresTarget: false,
                    failText: (game, tool, target): string => { return 'There is nothing special about ' + target.name; }
                },
                {
                    text: 'Pull',
                    requiresTarget: false,
                    failText: (game, tool, target): string => { return 'You can\'t pull that.'; }
                },
                {
                    text: 'Push',
                    requiresTarget: false,
                    failText: (game, tool, target): string => { return 'You can\'t push that.'; }
                }
            ];
        }
    }
}