﻿namespace MyNewGame {
    export interface ICompiledLocation extends ILocation, StoryScript.ICompiledLocation {
        activeEnemies?: StoryScript.ICompiledCollection<IEnemy, ICompiledEnemy>;
        enemies?: StoryScript.ICompiledCollection<IEnemy, ICompiledEnemy>;
        items?: StoryScript.ICollection<IItem>;
    }
}