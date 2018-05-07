namespace StoryScript {   
    export class ExplorationController implements ng.IComponentController {
        constructor(private _scope: ng.IScope, private _gameService: IGameService, private _sharedMethodService: ISharedMethodService, private _game: IGame, private _rules: IRules, private _texts: IInterfaceTexts) {
            var self = this;
            self.game = _game;
            self.rules = _rules;
            self.texts = _texts;
        }

        game: IGame;
        rules: IRules;
        texts: IInterfaceTexts;

        actionsPresent = () => {
            var self = this;
            return !self.enemiesPresent() && !isEmpty(self.game.currentLocation.actions);
        }

        enemiesPresent = () => {
            var self = this;
            return self._sharedMethodService.enemiesPresent();
        }

        getButtonClass = (action: IAction): string => {
            var self = this;
            return self._sharedMethodService.getButtonClass(action);
        }

        disableActionButton = (action: IAction) => {
            var self = this;
            return typeof action.status === "function" ? (<any>action).status(self.game) == ActionStatus.Disabled : action.status == undefined ? false : (<any>action).status == ActionStatus.Disabled;
        }

        hideActionButton = (action: IAction) => {
            var self = this;
            return typeof action.status === "function" ? (<any>action).status(self.game) == ActionStatus.Unavailable : action.status == undefined ? false : (<any>action).status == ActionStatus.Unavailable;
        }

        executeAction = (action: IAction): void => {
            var self = this;
            self._sharedMethodService.executeAction(action, self);
        }

        executeBarrierAction = (destination: IDestination, barrier: IBarrier) => {
            var self = this;
            self._gameService.executeBarrierAction(destination, barrier);
            self._scope.$emit('refreshCombine');
        }

        trade = (game: IGame, actionIndex: number, trade: ICompiledPerson | ITrade) => {
            var self = this;
            return self._sharedMethodService.trade(game, actionIndex, trade);
        }

        changeLocation = (location: string) => {
            var self = this;

            // Call changeLocation without using the execute action as the game parameter is not needed.
            self.game.changeLocation(location, true);
            self._scope.$emit('refreshCombine');
            self._gameService.saveGame();
        }

        pickupItem = (item: IItem): void => {
            var self = this;
            self.game.character.items.push(item);
            self.game.currentLocation.items.remove(item);
            self._scope.$emit('refreshCombine');
        }
    }

    ExplorationController.$inject = ['$scope', 'gameService', 'sharedMethodService', 'game', 'rules', 'customTexts'];
}