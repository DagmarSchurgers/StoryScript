﻿import { Location, IGame } from '../../types';
import description from './Day3.html';
import { Day4 } from './Day4';
import { WeaponSmith } from './WeaponSmith';
import { HealersTent } from './HealersTent';
import { Shieldmaiden } from '../../enemies/Shieldmaiden';
import { changeDay } from '../../gameFunctions';

export function Day3() {
    return Location({
        name: 'Day 3',
        description: description,
        destinations: [
            {
                name: 'Day 4',
                target: Day4
            },
            {

                name: 'Weapon Smith',
                target: WeaponSmith
            },
            {

                name: 'Healers Tent',
                target: HealersTent
            },
        ],
        enemies: [
            Shieldmaiden()
        ],
        enterEvents: [
            changeDay
        ]
    });
}