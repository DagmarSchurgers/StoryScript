import { Location } from '../types'
import { Bos } from './bos';
import { OpenPlek } from './OpenPlek';
import description from './Start.html'

export function Start() {
    return Location({
        name: 'Je nest',
        description: description,
        destinations: [
            {
                name: 'Naar het bos',
                target: Bos
            },
        ]
    });
}