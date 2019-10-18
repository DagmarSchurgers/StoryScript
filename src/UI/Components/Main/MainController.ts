namespace StoryScript {
    export class ShowCombinationTextEvent extends Event {
        constructor() {
            super('showCombinationText');
        }

        combineText: string;
        featuresToRemove: string[];
    }

    export class MainController {
        constructor(private _scope: StoryScriptScope, private _timeout: ng.ITimeoutService, private _eventListener: EventTarget, private _gameService: IGameService, private _sharedMethodService: ISharedMethodService, private _game: IGame, private _texts: IInterfaceTexts) {
            var self = this;
            self.game = self._game;
            self.texts = self._texts;
            self._scope.game = self._game;

            self._scope.$on('restart', (ev) => { 
                self.broadcast(ev, null, () => self.init(true));
            });

            self._scope.$on('gameLoaded', self.broadcast);
            self._scope.$on('showDescription', self.broadcast);
            self._scope.$on('showMenu', self.broadcast);

            self._scope.$watch('game.character.currentHitpoints', self.watchCharacterHitpoints);
            self._scope.$watch('game.character.score', self.watchCharacterScore);

            self._game.dynamicStyles = self._game.dynamicStyles || [];

            self._scope.$watchCollection('game.dynamicStyles', () => self.applyDynamicStyling());

            _eventListener.addEventListener('combinationFinished', function(finishedEvent: StoryScript.CombinationFinishedEvent) {
                var showEvent = new ShowCombinationTextEvent();
                showEvent.combineText = finishedEvent.combineText;
                showEvent.featuresToRemove = finishedEvent.featuresToRemove;
                self._scope.$broadcast(showEvent.type, showEvent);
            });

            self.init();
        }

        showCharacterPane = () => {
            var self = this;
            return self._sharedMethodService.useCharacterSheet || self._sharedMethodService.useEquipment || self._sharedMethodService.useBackpack || self._sharedMethodService.useQuests;
        }

        game: IGame;
        texts: IInterfaceTexts;

        private init(restart?: boolean) {
            var self = this;

            if (restart) {
                self._gameService.restart();
            }
            else {
                self._gameService.init();
            }
        }

        private broadcast(event: ng.IAngularEvent, args?: any[], callback?: Function)
        {
            if (event.currentScope !== event.targetScope) {
                if (callback) {
                    callback();
                }

                event.currentScope.$broadcast(event.name, args);
            }
        }

        private watchCharacterHitpoints(newValue, oldValue, scope) {
            if (!scope.$ctrl._game.loading) {
                if (parseInt(newValue) && parseInt(oldValue) && newValue != oldValue) {
                    var change = newValue - oldValue;
                    scope.$ctrl._gameService.hitpointsChange(change);
                }
            }
        }

        private watchCharacterScore(newValue, oldValue, scope) {
            if (!scope.$ctrl._game.loading) {
                if (parseInt(newValue) && parseInt(oldValue) && newValue != oldValue) {
                    var increase = newValue - oldValue;
                    scope.$ctrl._gameService.scoreChange(increase);
                }
            }
        }

        private applyDynamicStyling() {
            var self = this;

            self._timeout(() => {
                self._game.dynamicStyles.forEach(s => {
                    var element = angular.element(s.elementSelector);

                    if (element.length) {
                        var styleText = '';
                        s.styles.forEach(e => styleText += e[0] + ': ' + e[1] + ';' );
                        element.attr('style', styleText);
                    }

                });
            }, 0, false);
        }
    }

    MainController.$inject = ['$scope', '$timeout', 'eventListener', 'gameService', 'sharedMethodService', 'game', 'customTexts'];
}