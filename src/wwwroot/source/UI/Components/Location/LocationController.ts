namespace StoryScript {   
    export class LocationController implements ng.IComponentController {
        constructor(private _sce: ng.ISCEService, private _gameService: IGameService, private _game: IGame, private _texts: IInterfaceTexts) {
            var self = this;
            self.game = _game;
            self.texts = _texts;
            self.worldProperties = [];

            for (var n in self._game.worldProperties) {
                if (self._game.worldProperties.hasOwnProperty(n)) {
                    var value = self._game.worldProperties[n];
                    self.worldProperties.push({ name: n, value: null});
                }
            }
        }

        game: IGame;
        texts: IInterfaceTexts;
        worldProperties: { name: string, value: string }[];

        getDescription = (entity: any, key: string): string => {
            var self = this;
            return self._sce.trustAsHtml( self._gameService.getDescription(entity, key));
        }

        getWorldProperties = (): any[] => {
            var self = this;

            for (var i = 0; i < self.worldProperties.length; i++) {
                var property = self.worldProperties[i];
                var value = self._game.worldProperties[property.name];
                var text = self._texts.format(self._texts.worldProperties[property.name], [value]);
                property.value = text;
            }

            return self.worldProperties;
        }
    }

    LocationController.$inject = ['$sce', 'gameService', 'game', 'customTexts'];
}