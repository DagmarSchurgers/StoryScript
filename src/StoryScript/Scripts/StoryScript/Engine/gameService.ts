﻿module StoryScript.Interfaces {
    export interface IGameService {
        init(): void;
        startNewGame(characterData: any): void;
        reset(): void;
        restart(): void;
        saveGame(): void;
        rollDice(dice: string): number;
    }
}

module StoryScript {
    export class GameService implements ng.IServiceProvider, Interfaces.IGameService {
        private dataService: Interfaces.IDataService;
        private locationService: Interfaces.ILocationService;
        private characterService: Interfaces.ICharacterService;
        private ruleService: Interfaces.IRuleService;
        private game: Game;

        constructor(dataService: Interfaces.IDataService, locationService: Interfaces.ILocationService, characterService: Interfaces.ICharacterService, ruleService: Interfaces.IRuleService, game: Game) {
            var self = this;
            self.dataService = dataService;
            self.locationService = locationService;
            self.characterService = characterService;
            self.ruleService = ruleService;
            self.game = game;
        }

        public $get(dataService: Interfaces.IDataService, locationService: Interfaces.ILocationService, characterService: Interfaces.ICharacterService, ruleService: Interfaces.IRuleService, game: Game): Interfaces.IGameService {
            var self = this;
            self.dataService = dataService;
            self.locationService = locationService;
            self.characterService = characterService;
            self.ruleService = ruleService;
            self.game = game;

            return {
                init: self.init,
                startNewGame: self.startNewGame,
                reset: self.reset,
                restart: self.restart,
                saveGame: self.saveGame,
                rollDice: null
            };
        }

        init = (): void => {
            var self = this;
            self.locationService.init(self.game);
            self.game.highScores = self.dataService.load<string[]>(StoryScript.DataKeys.HIGHSCORES);
            self.game.character = self.dataService.load<CharacterBase>(StoryScript.DataKeys.CHARACTER);

            var locationName = self.dataService.load(StoryScript.DataKeys.LOCATION);

            if (locationName) {
                var lastLocation = self.game.locations.first(locationName);
                var previousLocationName = self.dataService.load(StoryScript.DataKeys.PREVIOUSLOCATION);

                if (previousLocationName) {
                    self.game.previousLocation = self.game.locations.first(previousLocationName);
                }

                self.locationService.changeLocation(lastLocation, self.game);
                self.game.state = 'play';
            }
            else {
                self.game.state = 'createCharacter';
            }

            self.game.rollDice = self.rollDice;
        }

        reset = () => {
            var self = this;
            self.dataService.save(StoryScript.DataKeys.WORLD, {});
            //dataService.save(game.keys.HIGHSCORES, []);
            self.locationService.init(self.game);
            var location = self.dataService.load(StoryScript.DataKeys.LOCATION);

            if (location) {
                self.locationService.changeLocation(location, self.game);
            }
        }

        startNewGame = (characterData: any): void => {
            var self = this;
            self.game.character = self.characterService.createCharacter(characterData);
            self.dataService.save(StoryScript.DataKeys.CHARACTER, self.game.character);
            self.ruleService.startGame();
        }

        restart = (): void => {
            var self = this;
            self.dataService.save(StoryScript.DataKeys.CHARACTER, {});
            self.dataService.save(StoryScript.DataKeys.LOCATION, '');
            self.dataService.save(StoryScript.DataKeys.PREVIOUSLOCATION, '');
            self.dataService.save(StoryScript.DataKeys.WORLD, {});
            self.init();
        }

        saveGame = (): void => {
            var self = this;
            self.dataService.save(StoryScript.DataKeys.CHARACTER, self.game.character);
            self.dataService.save(StoryScript.DataKeys.WORLD, { locations: self.game.locations });
        }

        rollDice = (input: string): number => {
            //'xdy+/-z'
            var positiveModifier = input.indexOf('+') > -1;
            var splitResult = input.split('d');
            var numberOfDice = parseInt(splitResult[0]);
            splitResult = positiveModifier ? splitResult[1].split('+') : splitResult[1].split('-');
            var dieCount = parseInt(splitResult[0]);
            var bonus = parseInt(splitResult[1]);
            bonus = isNaN(bonus) ? 0 : bonus;
            bonus = positiveModifier ? bonus : bonus * -1;
            var result = 0;

            for (var i = 0; i < numberOfDice; i++) {
                result += Math.floor(Math.random() * dieCount + 1);
            }

            result += bonus;
            return result;
        }
    }

    GameService.$inject = ['dataService', 'locationService', 'characterService', 'ruleService', 'game'];
}