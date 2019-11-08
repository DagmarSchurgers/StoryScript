import { ICompiledLocation } from '../compiledLocation';
import { IGame } from '../game';

export interface IExplorationRules {
    /**
     * When specified, this function will be called whenever the player enters a location.
     * @param game The active game
     * @param location The location the player enters
     * @param travel True if the player arrived by travelling, false or undefined otherwise. A player can get
     * to a location without travelling when a game is loaded, for example.
     */
    enterLocation?(game: IGame, location: ICompiledLocation, travel?: boolean): void;

    /**
     * When specified, this function will be called whenever the player enters a location.
     * @param game The active game
     * @param location The location the player leaves
     */
    leaveLocation?(game: IGame, location: ICompiledLocation): void;

    /**
     * Specify this function if you want to run custom logic to set the description selector when selecting the description when
     * entering a location. Return the selector string. This is useful if you for example want to show different descriptions at
     * night.
     * @param game The active game
     */
    descriptionSelector?(game: IGame): string;
}