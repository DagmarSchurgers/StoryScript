namespace StoryScript {   
    export interface IModalSettings {
        title: string;
        closeText?: string;
        canClose?: boolean;
        closeAction?: (game: IGame) => void;
        descriptionEntity?: {};
    }

    export class EncounterModalController implements ng.IComponentController {
        constructor(private _scope: ng.IScope, private _gameService: IGameService, private _game: IGame, private _rules: IRules, private _texts: IInterfaceTexts) {
            var self = this;
            self.game = _game;
            self.texts = _texts;
            (<any>self._scope).game = self._game;

            self.modalSettings = <IModalSettings>{
                title: '',
                canClose: false,
                closeText: self.texts.closeModal
            }

            self._scope.$watch('game.state', (newValue: GameState, oldValue: GameState) => {
                self.watchGameState(newValue, oldValue, self);
            });
            self._scope.$watchCollection('game.currentLocation.enemies', self.initCombat);
        }

        modalSettings: IModalSettings;
        game: IGame;
        texts: IInterfaceTexts;

        openModal = (modalSettings: any) => {
            var self = this;
            self.modalSettings = modalSettings;
            $('#encounters').modal('show');
        }

        closeModal = () => {
            var self = this;

            if (self.modalSettings.closeAction) {
                self.modalSettings.closeAction(self._game);
            }

            self._gameService.saveGame();
            self._scope.$emit('refreshCombine');
            self._game.state = GameState.Play;
        }

        getDescription(entity: any, key: string) {
            var self = this;
            return entity && entity[key] ? self._rules.processDescription ? self._rules.processDescription(self._game, entity, key) : entity[key] : null;
        }

        private watchGameState(newValue: GameState, oldValue: GameState, controller: EncounterModalController) {
            if (oldValue != undefined) {
                // If there is a person trader, sync the money between him and the shop on trade end.
                if (oldValue == GameState.Trade) {
                    if (controller._game.currentLocation.activePerson && controller._game.currentLocation.activePerson.trade === controller._game.currentLocation.activeTrade) {
                        controller._game.currentLocation.activePerson.currency = controller._game.currentLocation.activeTrade.currency;
                    }
                }
            }
            
            switch (newValue) {
                case GameState.Combat: {
                    controller.modalSettings.title = controller._texts.combatTitle;
                    controller.modalSettings.canClose = false;
                } break;
                case GameState.Conversation: {
                    var person = controller._game.currentLocation.activePerson;
                    controller.modalSettings.title = person.conversation.title || controller._texts.format(controller._texts.talk, [person.name]);
                    controller.modalSettings.canClose = true;
                } break;
                case GameState.Trade: {
                    var trader = controller._game.currentLocation.activeTrade;
                    controller.modalSettings.title = trader.title;
                    controller.modalSettings.canClose = true;
                } break;
                case GameState.Description: {
                    // Todo
                } break;
                default: {

                } break;
            }

            if (newValue != undefined) {
                if (newValue == GameState.Combat || newValue == GameState.Trade || newValue == GameState.Conversation || newValue == GameState.Description) {
                    $('#encounters').modal('show');
                    controller._scope.$broadcast('init');
                }
                else {
                    $('#encounters').modal('hide');
                }

                controller._gameService.changeGameState(newValue);
            }
        }

        private initCombat = (newValue: ICompiledEnemy[]): void => {
            var self = this;

            if (newValue && !newValue.some(e => !e.inactive)) {
                self.modalSettings.canClose = true;
            }

            if (newValue && self._rules.initCombat) {
                self._rules.initCombat(self.game, self.game.currentLocation);
            }

            self._scope.$broadcast('refreshCombine');
        }
    }

    EncounterModalController.$inject = ['$scope', 'gameService', 'game', 'rules', 'customTexts'];
}