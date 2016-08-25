﻿module QuestForTheKing {
    export interface IGame extends StoryScript.IGame {
        definitions: IDefinitions;
        character: Character;
        locations: StoryScript.ICompiledCollection<ICompiledLocation>;
        currentLocation: ICompiledLocation;
        previousLocation: ICompiledLocation;

        randomEnemy: (selector?: (enemy: IEnemy) => boolean) => IEnemy;
        randomItem: (selector?: (enemy: IItem) => boolean) => IItem;
        getEnemy: (selector: string | (() => IEnemy)) => IEnemy;
        getItem: (selector: string | (() => IItem)) => IItem;

        currentDay?: number;
    }

    var storyScriptModule = angular.module("storyscript");
    storyScriptModule.value("gameNameSpace", 'QuestForTheKing');
    storyScriptModule.service("ruleService", RuleService);
    storyScriptModule.value("customTexts", new CustomTexts().texts);
}