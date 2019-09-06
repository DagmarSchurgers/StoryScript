namespace TheMiner {
    export function Rules(): StoryScript.IRules {
        return {
            setup: {
                getCombinationActions: (): StoryScript.ICombinationAction[] => {
                    return [
                        { text: Constants.USE,
                            preposition: 'on',
                            failText: (game, target, tool): string => {
                                return 'I can\'t do that.';
                            }
                           },
                           { text: Constants.LOOKAT,
                            preposition: 'at',
                            requiresTool: false,
                            failText: (game, target, tool): string => {
                                return 'I look at the ' + target.name + ', there is nothing special about it.';
                            }
                           },
                            {
                            text: Constants.TAKE,  
                            requiresTool: false
                           },
                           {
                            text: Constants.EAT,  
                            requiresTool: false,
                            failText: (game, target, tool): string => {
                                return 'I can\'t eat that!';
                           }
                        }
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

                getCreateCharacterSheet: (): StoryScript.ICreateCharacter => {
                    return {
                        steps: [
                            // Add the character creation steps here, if you want to use character creation.
                        ]
                    };
                },

                createCharacter: (game: IGame, characterData: StoryScript.ICreateCharacter): StoryScript.ICharacter => {
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
                        game.currentLocation.activeEnemies.filter((enemy: IEnemy) => { return enemy.hitpoints > 0; }).forEach(function (enemy) {
                            // Implement monster attack here
                        });
                    }
                }
            }
        };
    }
}