﻿namespace StoryScript {
    export interface ICharacterService {
        getSheetAttributes(): string[];
        setupCharacter(): ICreateCharacter;
        createCharacter(game: IGame, characterData: any): ICharacter;
        limitSheetInput(value: number, attribute: ICreateCharacterAttribute, entry: ICreateCharacterAttributeEntry): void;
        distributionDone(sheet: ICreateCharacter, step: ICreateCharacterStep): boolean;
        canEquip(item: IItem): boolean;
        equipItem(item: IItem): void;
        unequipItem(item: IItem): void;
        isSlotUsed(slot: string): boolean;
        dropItem(item: IItem): void;
        questStatus(quest: IQuest): string;
    }
}

namespace StoryScript {
    export class CharacterService implements ng.IServiceProvider, ICharacterService {
        constructor(private _dataService: IDataService, private _game: IGame, private _rules: IRules) {
            var self = this;
        }

        public $get(dataService: IDataService, game: IGame, rules: IRules): ICharacterService {
            var self = this;
            self._dataService = dataService;
            self._game = game;
            self._rules = rules;

            return {
                setupCharacter: self.setupCharacter,
                getSheetAttributes: self.getSheetAttributes,
                createCharacter: self.createCharacter,
                limitSheetInput: self.limitSheetInput,
                distributionDone: self.distributionDone,
                canEquip: self.canEquip,
                equipItem: self.equipItem,
                unequipItem: self.unequipItem,
                isSlotUsed: self.isSlotUsed,
                dropItem: self.dropItem,
                questStatus: self.questStatus
            };
        }

        getSheetAttributes = (): string[] => {
            var self = this;
            return self._rules.getSheetAttributes();
        }

        setupCharacter = (): ICreateCharacter => {
            var self = this;
            var sheet = self._rules.getCreateCharacterSheet();
            sheet.currentStep = 0;

            sheet.nextStep = (data: ICreateCharacter) => {
                var selector = data.steps[data.currentStep].nextStepSelector;
                var previousStep = data.currentStep;

                if (selector) {
                    var nextStep = typeof selector === 'function' ? (<any>selector)(data, data.steps[data.currentStep]) : selector;
                    data.currentStep = nextStep;
                }
                else {
                    data.currentStep++;
                }

                var currentStep = data.steps[data.currentStep];

                if (currentStep.initStep) {
                    currentStep.initStep(data, previousStep, currentStep);
                }

                if (currentStep.attributes) {
                    currentStep.attributes.forEach(attr => {
                        attr.entries.forEach(entry => {
                            if (entry.min) {
                                entry.value = entry.min;
                            }
                        });
                    });
                }
            };

            self._game.createCharacterSheet = sheet;
            return sheet;
        }

        limitSheetInput = (value: number, attribute: ICreateCharacterAttribute, entry: ICreateCharacterAttributeEntry): void => {
            var self = this;

            if (!isNaN(value)) {
                var totalAssigned = 0;

                attribute.entries.forEach((innerEntry, index) => {
                    if (index !== attribute.entries.indexOf(entry)) {
                        totalAssigned += <number>innerEntry.value || 1;
                    }
                });

                if (totalAssigned + value > attribute.numberOfPointsToDistribute) {
                    value = attribute.numberOfPointsToDistribute - totalAssigned;
                }

                entry.value = value;

                if (entry.value > entry.max) {
                    entry.value = entry.max;
                }
                else if (entry.value < entry.min) {
                    entry.value = entry.min;
                }
            }
            else {
                entry.value = entry.min;
            }
        }

        distributionDone = (sheet: ICreateCharacter, step: ICreateCharacterStep): boolean => {
            var self = this;
            var done = true;

            if (step) {
                done = self.checkStep(step);
            }
            else {
                if (sheet && sheet.steps) {
                    sheet.steps.forEach(step => {
                        done = self.checkStep(step);
                    });
                }
            }

            return done;
        }

        createCharacter = (game: IGame, characterData: ICreateCharacter): ICharacter => {
            var self = this;
            var character = self._dataService.load<ICharacter>(StoryScript.DataKeys.CHARACTER);

            if (isEmpty(character)) {

                var self = this;
                character = self._rules.createCharacter(game, characterData);

                characterData.steps.forEach(function (step) {
                    if (step.questions) {
                        step.questions.forEach(function (question) {
                            if (character.hasOwnProperty(question.selectedEntry.value)) {
                                character[question.selectedEntry.value] += question.selectedEntry.bonus;
                            }
                        });
                    }
                });

                characterData.steps.forEach(function (step) {
                    if (step.attributes) {
                        step.attributes.forEach(function (attribute) {
                            attribute.entries.forEach(function (entry) {
                                if (character.hasOwnProperty(entry.attribute)) {
                                    character[entry.attribute] = entry.value;
                                }
                            });
                        });
                    }
                }); 
            }

            return character;
        }

        canEquip = (item: IItem): boolean => {
            return item.equipmentType != StoryScript.EquipmentType.Miscellaneous;
        }

        equipItem = (item: IItem): void => {
            var self = this;

            var equipmentTypes = Array.isArray(item.equipmentType) ? <EquipmentType[]>item.equipmentType : [<EquipmentType>item.equipmentType];

            for (var n in equipmentTypes) {
                var type = self.getEquipmentType(equipmentTypes[n]);
                self.unequip(type);
            }

            if (self._rules.beforeEquip) {
                if (!self._rules.beforeEquip(self._game, self._game.character, item)) {
                    return;
                }
            }

            if (item.equip) {
                if (!item.equip(item, self._game)) {
                    return;
                }
            }

            for (var n in equipmentTypes) {
                var type = self.getEquipmentType(equipmentTypes[n]);
                self._game.character.equipment[type] = item;
            }

            self._game.character.items.remove(item);
        }

        unequipItem = (item: IItem): void => {
            var self = this;
            var equipmentTypes = Array.isArray(item.equipmentType) ? <EquipmentType[]>item.equipmentType : [<EquipmentType>item.equipmentType];

            for (var n in equipmentTypes) {
                var type = self.getEquipmentType(equipmentTypes[n]);
                self.unequip(type);
            }
        }

        isSlotUsed = (slot: string): boolean => {
            var self = this;

            if (self._game.character) {
                return self._game.character.equipment[slot] !== undefined;
            }

            return false;
        }

        dropItem = (item: IItem): void => {
            var self = this;
            self._game.character.items.remove(item);
            self._game.currentLocation.items.push(item);
        }

        questStatus = (quest: IQuest): string => {
            var self = this;
            return typeof quest.status === 'function' ? (<any>quest).status(self._game, quest, quest.checkDone(self._game, quest)) : quest.status;
        }

        private checkStep(step: ICreateCharacterStep) {
            var done = true;

            if (step.attributes) {
                step.attributes.forEach(attr => {
                    var totalAssigned = 0;
                    var textChoicesFilled = 0;

                    attr.entries.forEach((entry) => {
                        if (!entry.max) {
                            if (entry.value) {
                                textChoicesFilled += 1;
                            }
                        }
                        else {
                            totalAssigned += <number>entry.value || 1;
                        }
                    });

                    done = totalAssigned === attr.numberOfPointsToDistribute || textChoicesFilled === attr.entries.length;
                });
            }

            return done;
        }

        private unequip(type: string, currentItem?: IItem) {
            var self = this;
            var equippedItem = self._game.character.equipment[type];

            if (equippedItem) {
                if (Array.isArray(equippedItem.equipmentType) && !currentItem) {
                    for (var n in equippedItem.equipmentType) {
                        var type = self.getEquipmentType(equippedItem.equipmentType[n]);
                        self.unequip(type, equippedItem);
                    }
                }

                if (self._rules.beforeUnequip) {
                    if (!self._rules.beforeUnequip(self._game, self._game.character, equippedItem)) {
                        return;
                    }
                }

                if (equippedItem.unequip) {
                    if (!equippedItem.unequip(equippedItem, self._game)) {
                        return;
                    }
                }

                if (equippedItem && !isNaN( equippedItem.equipmentType) && self._game.character.items.indexOf(equippedItem) === -1) {
                    self._game.character.items.push(equippedItem);
                }

                self._game.character.equipment[type] = null;
            }
        }

        private getEquipmentType = (slot: StoryScript.EquipmentType) => {
            var type = StoryScript.EquipmentType[slot];
            return type.substring(0, 1).toLowerCase() + type.substring(1);
        }
    }

    CharacterService.$inject = ['dataService', 'game', 'rules'];
}