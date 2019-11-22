import { IGame, IInterfaceTexts, IItem } from '../../../../../Engine/Interfaces/storyScript';
import { SharedMethodService } from '../../Services/SharedMethodService';
import { CharacterService } from '../../../../../Engine/Services/characterService';
import { ObjectFactory } from '../../../../../Engine/ObjectFactory';
import { Component } from '@angular/core';
import template from './equipment.component.html';

@Component({
    selector: 'equipment',
    template: template,
})
export class EquipmentComponent {
    constructor(private _sharedMethodService: SharedMethodService, private _characterService: CharacterService, objectFactory: ObjectFactory) {
        this.game = objectFactory.GetGame();
        this.texts = objectFactory.GetTexts();
        this._sharedMethodService.useEquipment = true;
    }

    game: IGame;
    texts: IInterfaceTexts;

    showEquipment = (): boolean => this._sharedMethodService.showEquipment(this.game);

    unequipItem = (item: IItem): boolean => this._characterService.unequipItem(item);

    isSlotUsed = (slot: string): boolean => {
        return this._characterService.isSlotUsed(slot);
    }
}