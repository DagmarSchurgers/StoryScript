namespace StoryScript {
    export class ShowCombinationTextEvent extends Event {
        constructor() {
            super('showCombinationText');
        }

        combineText: string;
        featuresToRemove: string[];
    }

    export class MainController {
        constructor(private _scope: ng.IScope, private _timeout: ng.ITimeoutService, private _eventListener: EventTarget, private _gameService: IGameService, private _sharedMethodService: ISharedMethodService, private _game: IGame, private _texts: IInterfaceTexts) {
            var self = this;
            self.game = self._game;
            self.texts = self._texts;
            (<any>self._scope).game = self._game;

            self._scope.$on('restart', (ev) => { 
                self.broadcast(ev, null, () => self.init(true));
            });

            self._scope.$on('gameLoaded', self.broadcast);
            self._scope.$on('showDescription', self.broadcast);
            self._scope.$on('showMenu', self.broadcast);

            self._scope.$watch('game.currentLocation', self.watchLocation);
            self._scope.$watch('game.character.currentHitpoints', self.watchCharacterHitpoints);
            self._scope.$watch('game.character.score', self.watchCharacterScore);
            self._scope.$watch('game.state', self.watchGameState);

            self._game.dynamicStyles = self._game.dynamicStyles || [];

            self._scope.$watchCollection('game.dynamicStyles', function(newForm, oldForm) {
                self.applyDynamicStyling();
            });

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

            self._gameService.init();
            self._scope.$broadcast('createCharacter');
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

        private watchGameState(newValue: GameState, oldValue: GameState, scope) {
            if (newValue == GameState.LevelUp) {
                scope.$broadcast('initLevelUp');
            }
            
            if (oldValue == GameState.LevelUp && newValue == GameState.Play) {
                // Level-up was just completed. Save the game from here, because the character service cannot depend on the game service.
                scope.$ctrl._gameService.saveGame();
            }

            scope.$ctrl._gameService.changeGameState(newValue);
        }

        private watchLocation(newValue: ICompiledLocation, oldValue: ICompiledLocation, scope) {
            if (!scope.$ctrl._game.loading) {
                if (oldValue != undefined && newValue != undefined) {
                    // Don't change the game state change to 'play' when a level-up is in progress. This level-up
                    // can be triggered on location change.
                    if (scope.$ctrl._game.state != StoryScript.GameState.LevelUp) {
                        scope.$ctrl._game.state = GameState.Play;
                    }
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