namespace PathOfHeroes.Locations {
    export function Start() {
        return Location({
            name: 'Start',
            destinations: [
                
            ],
            enemies: [
                Enemies.Tiger()
            ],
            features: temparateFeatures()
        });
    }
}