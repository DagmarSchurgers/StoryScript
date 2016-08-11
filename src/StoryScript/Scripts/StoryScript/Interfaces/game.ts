﻿module StoryScript {
    export class ScoreEntry {
        name: string;
        score: number;
    }

    export interface IGame {
        nameSpace: string;
        definitions: IDefinitions;
        createCharacterSheet?: ICreateCharacter;
        character: ICharacter;
        locations: ICompiledCollection<ICompiledLocation>;
        currentLocation: ICompiledLocation;
        previousLocation: ICompiledLocation;

        highScores: ScoreEntry[];
        actionLog: string[];
        state: string;

        changeLocation(location?: string | (() => ILocation)): void;
        rollDice(dice: string): number;
        calculateBonus(person: IActor, type: string): number;
        logToLocationLog(message: string): void;
        logToActionLog(message: string): void;

        randomEnemy: (selector: (enemy: IEnemy) => boolean) => IEnemy;
        randomItem: (selector: (enemy: IItem) => boolean) => IItem;
    }
}