namespace PathOfHeroes {
    export function Rules(): StoryScript.IRules {
        return {
            setup: {
                getCombinationActions: (): StoryScript.ICombinationAction[] => {
                    return [
                        // Add combination action names here if you want to use this feature.
                        {
                            text: 'Walk',
                            preposition: 'to',
                            requiresTool: false,
                            failText: (game, target, tool): string => { return 'test'; },
                            isDefault: true,
                            defaultMatch: (game: IGame, target: IFeature, tool: StoryScript.ICombinable): string => {
                                setCoordinates(game, target);

                                if (target.linkToLocation) {
                                    game.changeLocation(target.linkToLocation);
                                }

                                return 'Ok';
                            },
                        }
                    ];
                },
                gameStart: (game: IGame): void => {
                    game.worldProperties.mapCenterX = -558;
                    game.worldProperties.mapLocationX = game.worldProperties.mapCenterX;
                    game.worldProperties.mapCenterY = -584;
                    game.worldProperties.mapLocationY = game.worldProperties.mapCenterY;
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
                applyDynamicStyling: (game: IGame): StoryScript.IDynamicStyle[] => {
                    return [
                        {
                            elementSelector: '#visual-features img',
                            styles: [
                                ['margin-top', (game.worldProperties.mapLocationY || 0).toString() + 'px'],
                                ['margin-left', (game.worldProperties.mapLocationX || 0).toString() + 'px']
                            ]
                        }
                    ]
                }
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
    
    function setCoordinates(game, target: IFeature) {  
        var coords = target.coords.split(',').map(c => parseInt(c));
        var centerX = coords[6] - coords[0];
        var centerY = coords[7] - coords[1];

        game.worldProperties.mapLocationX = -(centerX + coords[0] - 800);
        game.worldProperties.mapLocationY = -(centerY + coords[1] - 650);      
    }
}