import { IGame, IInterfaceTexts } from '../../../../../Engine/Interfaces/storyScript';

export class ActionLogController implements ng.IComponentController {
    constructor(_game: IGame, _texts: IInterfaceTexts) {
        this.game = _game;
        this.texts = _texts;
    }

    game: IGame;
    texts: IInterfaceTexts;
}

ActionLogController.$inject = ['game', 'customTexts'];