import { IGame, IInterfaceTexts } from '../../../../../Engine/Interfaces/storyScript';
import { IGameService } from '../../../../../Engine/Services/interfaces/services';

export class VictoryController implements ng.IComponentController {
    constructor(private _gameService: IGameService, _game: IGame, _texts: IInterfaceTexts) {
        this.game = _game;
        this.texts = _texts;
    }

    game: IGame;
    texts: IInterfaceTexts;

    restart = (): void => this._gameService.restart();
}

VictoryController.$inject = ['gameService', 'game', 'customTexts'];