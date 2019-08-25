namespace PathOfHeroes {
    export class Constants {
        static WALK: string = 'Walk';
        static MAPDIMENSIONS: {
            mapRows: number,
            mapColumns: number,
            startRow: number,
            tileWidth: number,
            tileHeight: number
        } = {
            mapRows: 3,
            mapColumns: 3,
            startRow: 2,
            tileWidth: 800,
            tileHeight: 600
        };
    }
}