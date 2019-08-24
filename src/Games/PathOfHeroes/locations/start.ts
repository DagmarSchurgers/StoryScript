namespace PathOfHeroes.Locations {
    export function Start() {
        return Location({
            name: 'Start',
            destinations: [
                
            ],
            features:[
                {
                    name: 'top',
                    combinations: {
                        combine: [
                            {
                                combinationType: 'Walk',
                                match: (game: IGame, target, tool): string => {
                                    setCoordinates(game, target);
                                    return 'Ok';
                                },
                            },
                        ],
                    },
                },
                {
                    name: 'topleft',
                    combinations: {
                        combine: [
                            {
                                combinationType: 'Walk',
                                match: (game: IGame, target, tool): string => {
                                    setCoordinates(game, target);
                                    return 'Ok';
                                },
                            },
                        ],
                    },
                },
                {
                    name: 'topright',
                    combinations: {
                        combine: [
                            {
                                combinationType: 'Walk',
                                match: (game: IGame, target, tool): string => {
                                    setCoordinates(game, target);
                                    return 'Ok';
                                },
                            },
                        ],
                    },
                },
                {
                    name: 'middle',
                    combinations: {
                        combine: [
                            {
                                combinationType: 'Walk',
                                match: (game: IGame, target, tool): string => {
                                    setCoordinates(game, target);
                                    return 'Ok';
                                },
                            },
                        ],
                    },
                },
                {
                    name: 'bottom',
                    combinations: {
                        combine: [
                            {
                                combinationType: 'Walk',
                                match: (game: IGame, target, tool): string => {
                                    setCoordinates(game, target);
                                    return 'Ok';
                                },
                            },
                        ],
                    },
                },
                {
                    name: 'bottomleft',
                    combinations: {
                        combine: [
                            {
                                combinationType: 'Walk',
                                match: (game: IGame, target, tool): string => {
                                    setCoordinates(game, target);
                                    return 'Ok';
                                },
                            },
                        ],
                    },
                },
                {
                    name: 'bottomright',
                    combinations: {
                        combine: [
                            {
                                combinationType: 'Walk',
                                match: (game: IGame, target, tool): string => {
                                    setCoordinates(game, target);
                                    return 'Ok';
                                },
                            },
                        ],
                    },
                },
            ]
        });
    }

    function setCoordinates(game, target: StoryScript.ICombinable) {
        var feature = target && (<any>target).type === 'feature' ? <StoryScript.IFeature>target : null;
        
        if (feature) {
            var coords = feature.coords.split(',').map(c => parseInt(c));
            var centerX = coords[6] - coords[0];
            var centerY = coords[7] - coords[1];
        }


        game.worldProperties.mapLocationX = -(centerX + coords[0] - 800);
        game.worldProperties.mapLocationY = -(centerY + coords[1] - 650);
    }
}