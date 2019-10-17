namespace StoryScript {   
    export class ExplorationController implements ng.IComponentController {
        constructor(private _gameService: IGameService, private _sharedMethodService: ISharedMethodService, private _game: IGame, private _texts: IInterfaceTexts) {
            var self = this;
            self.game = _game;
            self.texts = _texts;
        }

        game: IGame;
        texts: IInterfaceTexts;

        actionsPresent = () => {
            var self = this;
            return self.game.currentLocation && !self.enemiesPresent() && !isEmpty(self.game.currentLocation.actions);
        }

        enemiesPresent = () => {
            var self = this;
            return self._sharedMethodService.enemiesPresent();
        }

        getButtonClass = (action: IAction): string => {
            var self = this;
            return self._sharedMethodService.getButtonClass(action);
        }

        getCombineClass = (barrier: IBarrier) => {
            var self = this;
            return self._game.combinations.getCombineClass(barrier);
        }

        disableActionButton = (action: IAction) => {
            var self = this;
            return typeof action.status === 'function' ? (<any>action).status(self.game) == ActionStatus.Disabled : action.status == undefined ? false : (<any>action).status == ActionStatus.Disabled;
        }

        hideActionButton = (action: IAction) => {
            var self = this;
            return typeof action.status === 'function' ? (<any>action).status(self.game) == ActionStatus.Unavailable : action.status == undefined ? false : (<any>action).status == ActionStatus.Unavailable;
        }

        executeAction = (action: IAction): void => {
            var self = this;
            self._sharedMethodService.executeAction(action, self);
        }

        executeBarrierAction = (barrier: IBarrier, destination: IDestination) => {
            var self = this;

            if (self._game.combinations.tryCombine(barrier))
            {
                return;
            }
            else if (self._game.combinations.activeCombination) {
                return;
            }

            self._gameService.executeBarrierAction(barrier, destination);
        }

        trade = (game: IGame, actionIndex: number, trade: IPerson | ITrade) => {
            var self = this;
            return self._sharedMethodService.trade(game, actionIndex, trade);
        }

        changeLocation = (location: string) => {
            var self = this;
            self.game.changeLocation(location, true);
        }
    }

    ExplorationController.$inject = ['gameService', 'sharedMethodService', 'game', 'customTexts'];
}