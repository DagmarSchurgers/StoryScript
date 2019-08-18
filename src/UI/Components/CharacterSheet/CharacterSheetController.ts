namespace StoryScript {
    export class CharacterSheetController {
        constructor(private _scope: ng.IScope, private _characterService: ICharacterService, private _game: IGame, private _texts: IInterfaceTexts) {
            var self = this;
            self.game = self._game;
            self.texts = self._texts;
            self.displayCharacterAttributes = self._characterService.getSheetAttributes();
        }

        game: IGame;
        texts: IInterfaceTexts;
        displayCharacterAttributes: string[];
    }

    CharacterSheetController.$inject = ['$scope', 'characterService', 'game', 'customTexts'];
}