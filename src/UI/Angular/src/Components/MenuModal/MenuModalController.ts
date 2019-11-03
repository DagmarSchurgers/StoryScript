import StoryScript from '../../../../../types/storyscript';
import { StoryScriptScope } from '../StoryScriptScope';

export class MenuModalController implements ng.IComponentController {

    constructor(private _scope: StoryScriptScope, private _gameService: StoryScript.IGameService, private _game: StoryScript.IGame, _texts: StoryScript.IInterfaceTexts) {
        this.texts = _texts;
        this.game = _game;
        this._scope.game = _game;
        this.state = StoryScript.PlayState.Menu;

        this._scope.$watch('game.playState', (newValue: StoryScript.PlayState) => {
            if (newValue == StoryScript.PlayState.Menu) {
                this.openModal();
            }
        });
    }

    texts: StoryScript.IInterfaceTexts;
    game: StoryScript.IGame;
    saveKeys: string[];
    selectedGame: string;
    state: string;

    openModal = (): JQLite => $('#menumodal').modal('show');

    closeModal = (): void => {
        this.setSelected(null);
        this.state = 'Menu';
        this._game.playState = null;
        $('#menumodal').modal('hide');
    }

    restart = (): string => this.state = 'ConfirmRestart';

    cancel = (): void => {
        this.setSelected(null);
        this.state = 'Menu';
    }

    restartConfirmed = (): void => {
        this.closeModal();
        this._gameService.restart();
    }

    save = (): void => {
        this.saveKeys = this._gameService.getSaveGames();
        this.state = 'Save';
    }

    load = (): void => {
        this.saveKeys = this._gameService.getSaveGames();
        this.state = 'Load';
    }

    setSelected = (name: string): string => this.selectedGame = name;

    overwriteSelected = (): boolean => this._gameService.getSaveGames().indexOf(this.selectedGame) > -1;

    saveGame = (): void => {
        this._gameService.saveGame(this.selectedGame);
        this.closeModal();
    }

    loadGame = (): void => {
        this._gameService.loadGame(this.selectedGame);
        this.closeModal();
    }
}

MenuModalController.$inject = ['$scope', 'gameService', 'game', 'customTexts'];