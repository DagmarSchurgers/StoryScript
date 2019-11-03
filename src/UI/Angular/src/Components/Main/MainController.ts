import { ISharedMethodService } from '../../Services/SharedMethodService';
import { StoryScriptScope } from '../StoryScriptScope';
import angular from 'angular';

export class MainController {
    constructor(private _scope: StoryScriptScope, private _timeout: ng.ITimeoutService, private _gameService: StoryScript.IGameService, private _sharedMethodService: ISharedMethodService, private _game: StoryScript.IGame, _texts: StoryScript.IInterfaceTexts) {
        this.game = _game;
        this.texts = _texts;
        this._scope.game = _game;

        // Watch for dynamic styling.
        this._game.dynamicStyles = this._game.dynamicStyles || [];
        this._scope.$watchCollection('game.dynamicStyles', () => this.applyDynamicStyling());

        this._gameService.init();
    }
    
    game: StoryScript.IGame;
    texts: StoryScript.IInterfaceTexts;

    showCharacterPane = (): boolean => this._sharedMethodService.useCharacterSheet || this._sharedMethodService.useEquipment || this._sharedMethodService.useBackpack || this._sharedMethodService.useQuests;

    private applyDynamicStyling = (): void => {
        this._timeout(() => {
            this._game.dynamicStyles.forEach(s => {
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

MainController.$inject = ['$scope', '$timeout', 'gameService', 'sharedMethodService', 'game', 'customTexts'];