import { IGame } from "./types";

export function removeAction(game: IGame, text: string) {
    let waitAction = game.currentLocation.actions.filter(a => a.text === text)[0];

    if (waitAction) {
        game.currentLocation.actions.remove(waitAction);
    }
}