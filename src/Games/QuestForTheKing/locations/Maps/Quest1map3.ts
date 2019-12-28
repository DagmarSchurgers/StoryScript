﻿import { Location, IGame } from '../../types';
import description from './ForestPond.html';
import { Quest1map2 } from './Quest1map2';
import { Quest1map4 } from './Quest1map4';
import { Oceanshrine } from '../Oceanshrine/Oceanshrine';
import { Dryad } from '../Dryad/Dryad';
import { Treestump } from '../Treestump/Treestump';
import { Troll } from '../Troll/Troll';

export function Quest1map3() {
    return Location({
        name: 'The Eastern Forest',
        description: description,
        destinations: [
            {                          
                name: 'Go to the Northern Forest',
                target: Quest1map2,
                style: 'location-danger'
            },
            {
                name: 'Go to the Southern Forest',
                target: Quest1map4,
                style: 'location-danger'
            },
                {                          
                name: 'The Ocean Shrine',
                target: Oceanshrine
            },
            {                          
                name: 'The Dryad Tree',
                target: Dryad
            },
            {                          
                name: 'The Tree Stump',
                target: Treestump
            },   
            {                       
                name: 'The Troll',
                target: Troll
            },           
        ]
    });
}