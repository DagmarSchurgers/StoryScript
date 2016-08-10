﻿module RidderMagnus.Actions {
    export function RandomEnemy(game: IGame) {
        var enemies = game.definitions.enemies;
        var enemyCount = 0;
        var randomEnemy = null;

        for (var n in enemies) {
            enemyCount++;
        }

        var enemyToGet = game.rollDice('1d' + enemyCount) - 1;
        var index = 0;

        for (var n in enemies) {
            if (index == enemyToGet) {
                randomEnemy = enemies[n]();
                break;
            }
            index++;
        }

        randomEnemy.items = randomEnemy.items || [];

        for (var n in randomEnemy.items) {
            StoryScript.definitionToObject(randomEnemy.items[n]);
        }

        game.currentLocation.enemies.push(randomEnemy);

        return randomEnemy;
    }
}