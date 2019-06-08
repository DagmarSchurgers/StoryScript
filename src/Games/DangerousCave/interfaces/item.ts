﻿namespace DangerousCave {
    export function Item<T extends IItem>(entity: T): T {
        return StoryScript.Item(entity);
    }

    export interface IItem extends IFeature, StoryScript.IItem {
        // Add game-specific item properties here
    }
}