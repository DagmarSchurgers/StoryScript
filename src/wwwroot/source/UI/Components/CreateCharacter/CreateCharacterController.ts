namespace StoryScript {
    export class CreateCharacterController implements ng.IComponentController {
        constructor(private _scope: ng.IScope, private _characterService: ICharacterService, private _gameService: IGameService, private _game: IGame, private _texts: IInterfaceTexts) {
            var self = this;
            self.game = _game;
            self.texts = _texts;

            self._scope.$on('createCharacter', function (event: ng.IAngularEvent) {
                self.sheet = self._characterService.setupCharacter();
            });
        }

        sheet: ICreateCharacter;
        game: IGame;
        texts: IInterfaceTexts;

        startNewGame = () => {
            var self = this;
            self._gameService.startNewGame(self._game.createCharacterSheet);
        }

        limitInput = (event: ng.IAngularEvent, attribute: ICreateCharacterAttribute, entry: ICreateCharacterAttributeEntry) => {
            var self = this;
            var value = parseInt((<any>event).target.value);
            self._characterService.limitSheetInput(value, attribute, entry);
        }

        distributionDone = (step: ICreateCharacterStep) => {
            var self = this;
            return self._characterService.distributionDone(self.sheet, step);
        }
    }

    CreateCharacterController.$inject = ['$scope', 'characterService', 'gameService', 'game', 'customTexts'];
}