import { IInterfaceTexts, IGame } from '../../../../../Engine/Interfaces/storyScript';
import { ISharedMethodService } from '../../Services/SharedMethodService';
import { ICharacterService } from '../../../../../Engine/Services/interfaces/services';

export class CharacterSheetController {
    constructor(private _characterService: ICharacterService, private _sharedMethodService: ISharedMethodService, _game: IGame, _texts: IInterfaceTexts) {
        this.game = _game;
        this.texts = _texts;
        this.displayCharacterAttributes = this._characterService.getSheetAttributes();
        this._sharedMethodService.useCharacterSheet = true;
    }

    game: IGame;
    texts: IInterfaceTexts;
    displayCharacterAttributes: string[];
}

CharacterSheetController.$inject = ['characterService', 'sharedMethodService', 'game', 'customTexts'];