﻿namespace DePrinsesInDeToren {
    export function Key(entity: IKey): IKey {
        return StoryScript.Key(entity);
    }

    export interface IKey extends IItem, StoryScript.IKey {
        // Add game-specific key properties here
    }
}