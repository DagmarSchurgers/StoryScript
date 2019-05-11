﻿namespace RidderMagnus {
    export function BuildLocation<T extends ILocation>(entity: T): T {
        return StoryScript.BuildLocation(entity);
    }

    export interface ILocation extends StoryScript.ILocation {
        sluipCheck?: number;
    }
}