﻿module RidderMagnus.Locations {
    export function Tunnel(): ILocation {
        return {
            name: 'Een tunnel onder het paleis',

            destinations: [
                {
                    text: 'Naar beneden',
                    target: Locations.EersteGang
                },
                {
                    text: 'Naar boven',
                    target: Locations.Kelder
                }
            ],
           //event: hier zit een val. Licht en Zoeken kan het voorkomen, anders gaat hij af.
           //Een lading stenen valt van boven op de held. Een helm helpt.
        }
    }
}