import { IGame, IInterfaceTexts, CreateCharacters, ICharacter } from '../../../../../Engine/Interfaces/storyScript';
import { IGameService, ICharacterService } from '../../../../../Engine/Services/interfaces/services';

export class LevelUpController implements ng.IComponentController {
    constructor(private _gameService: IGameService, private _characterService: ICharacterService, private _game: IGame, _texts: IInterfaceTexts) {
        this.game = _game;
        this.texts = _texts;
    }

    sheet: CreateCharacters.ICreateCharacter;
    game: IGame;
    texts: IInterfaceTexts;

    distributionDone = (step: CreateCharacters.ICreateCharacterStep): boolean => this._characterService.distributionDone(this.sheet, step);

    levelUp = (): ICharacter => this._gameService.levelUp();
}

LevelUpController.$inject = ['gameService', 'characterService', 'game', 'customTexts'];