﻿module DangerousCave {
    export interface IGame extends StoryScript.IGame {
        character: Character;
        locations: StoryScript.ICollection<StoryScript.ICompiledLocation>;
        currentLocation: StoryScript.ICompiledLocation;
        previousLocation: StoryScript.ICompiledLocation;
        highScores: StoryScript.ScoreEntry[];
        actionLog: string[];
        state: string;
    }

    var storyScriptModule = angular.module("storyscript");
    storyScriptModule.value("gameNameSpace", 'DangerousCave');
}