namespace PathOfHeroes {
    var _mapDimensions: {
        width: number,
        height: number
    }

    var _temparateFeatures: StoryScript.IFeatureCollection;

    export function temparateFeatures() {
        if (!_temparateFeatures) {
            _temparateFeatures = [
                createTileFeature('top', 1, 2, Locations.Plains.name),
                createTileFeature('topleft', 2, 1),
                createTileFeature('topright', 2, 3),
                createTileFeature('middle', 3, 2, Locations.Start.name),
                createTileFeature('bottomleft', 4, 1, Locations.Water.name),
                createTileFeature('bottom', 5, 2),
                createTileFeature('bottomright', 4, 3)
            ];

            //_temparateFeatures.collectionHtml = '<visual-features img="tile demo.png"></visual-features>';
            _temparateFeatures.collectionPicture = 'test';
        }

        // Todo: this does not get reset on game restart. Use one of the setup rules?
        return _temparateFeatures;
    }

    export function createTileFeature(name: string, row: number, column: number, linkToLocation?: string): IFeature {
        return StoryScript.DynamicEntity(() => Feature({
                name: name,
                shape: 'poly',
                coords: getTileCoordinates(row, column),
                linkToLocation: linkToLocation,
                combinations: {
                    combine: [
                        {
                            combinationType: Constants.WALK
                        },
                    ],
                },
            }), name);
    }

    function getTileCoordinates(row: number, column: number): string {
        // Hexagon math at https://rechneronline.de/pi/hexagon.php.       
        var edgeLength = Constants.MAPDIMENSIONS.tileWidth / 2;
        var halfEdge = edgeLength / 2;
        var tileHeight = Constants.MAPDIMENSIONS.tileHeight;
        var halfHeight = Constants.MAPDIMENSIONS.tileHeight / 2;

        if (!_mapDimensions) {
            var divisions = (Constants.MAPDIMENSIONS.mapRows - 1) * 10;

            _mapDimensions = {
                height: tileHeight * Constants.MAPDIMENSIONS.mapRows + divisions,
                width: Math.ceil(Constants.MAPDIMENSIONS.mapColumns / 2) * Constants.MAPDIMENSIONS.tileWidth + Math.floor(Constants.MAPDIMENSIONS.mapColumns / 2) * edgeLength + divisions
            };
        }

        var offsetTop = Constants.MAPDIMENSIONS.startRow % 2 * halfHeight;
        var offsetleft = halfEdge;
        var topY = offsetTop + (row - 1) * halfHeight;
        var topX = offsetleft + (column - 1) * (edgeLength + halfEdge);

        var coords = [
            topX, topY, 
            topX - halfEdge, topY + halfHeight, 
            topX, topY + tileHeight,
            topX + edgeLength, topY + tileHeight,
            topX + edgeLength + halfEdge, topY + halfHeight,
            topX + edgeLength, topY
        ];

        return coords.map(c => c.toString()).join(',');
    }
}