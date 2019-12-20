﻿import { ILocation as StoryScriptILocation } from 'storyScript/Interfaces/location';
import { ICompiledLocation as StoryScriptICompiledLocation } from 'storyScript/Interfaces/compiledLocation';
import { Location as StoryScriptLocation } from 'storyScript/ObjectConstructors';
import { ICollection } from 'storyScript/Interfaces/collection';
import { IEnemy, IItem, IPerson } from '../types';

export function Location(entity: ILocation): ILocation  {
    return StoryScriptLocation(entity);
}

export interface ILocation extends StoryScriptILocation {
    // Add game-specific location properties here
}

export interface ICompiledLocation extends ILocation, StoryScriptICompiledLocation {
    activeEnemies?: ICollection<IEnemy>;
    enemies?: ICollection<IEnemy>;
    activeItems?: ICollection<IItem>;
    items?: ICollection<IItem>;
    activePersons?: ICollection<IPerson>;
    persons?: ICollection<IPerson>;
}