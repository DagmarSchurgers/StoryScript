﻿module StoryScript {
    export interface IModalSettings {
        title: string;
        closeText: string;
        canClose: boolean;
        closeAction: (game: IGame) => void;
    }

    export interface IMainControllerScope extends ng.IScope {
        modalSettings: IModalSettings;
        game: IGame;
        texts: any;
    }

    export class MainController {
        private $scope: IMainControllerScope;
        private $window: ng.IWindowService;
        private locationService: ILocationService;
        private ruleService: IRuleService;
        private gameService: IGameService;
        private game: IGame;
        private textService: ITextService;
        private texts: any = {};
        private encounters: ICollection<IEnemy>;
        private modalSettings: IModalSettings;

        // Todo: can this be done differently?
        private nonDisplayAttributes: string[] = [ 'name', 'items', 'equipment', 'hitpoints', 'currentHitpoints', 'level', 'score'];
        private characterAttributes: string[];

        // Todo: can this be done differently?
        public reset(): void { };

        constructor($scope: IMainControllerScope, $window: ng.IWindowService, locationService: ILocationService, ruleService: IRuleService, gameService: IGameService, game: IGame, textService: ITextService) {
            var self = this;
            self.$scope = $scope;
            self.$window = $window;
            self.locationService = locationService;
            self.ruleService = ruleService;
            self.gameService = gameService;
            self.game = game;
            self.textService = textService;
            self.init();
        }

        private init() {
            var self = this;
            self.gameService.init();

            self.$scope.game = self.game;
            self.$scope.texts = self.texts;

            self.setDisplayTexts();
            self.getCharacterAttributesToShow();

            // Watch functions.
            self.$scope.$watch('game.character.currentHitpoints', self.watchCharacterHitpoints);
            self.$scope.$watch('game.character.score', self.watchCharacterScore);
            self.$scope.$watch('game.state', self.watchGameState);

            self.reset = () => { self.gameService.reset.call(self.gameService); };

            self.$scope.modalSettings = <IModalSettings>{
                title: '',
                closeText: self.texts.closeModal
            }
        }

        startNewGame = () => {
            var self = this;
            self.gameService.startNewGame(self.game.createCharacterSheet);
            self.getCharacterAttributesToShow();
            self.game.state = StoryScript.GameState.Play;
        }

        restart = () => {
            var self = this;
            self.gameService.restart();
            self.init();
        }

        isSlotUsed(slot: string) {
            var self = this;

            if (self.game.character) {
                return self.game.character.equipment[slot] !== undefined;
            }
        }

        getButtonClass = (action: IAction) => {
            var type = action.type || ActionType.Regular;
            var buttonClass = 'btn-';

            switch (type) {
                case ActionType.Regular: {
                    buttonClass += 'info'
                } break;
                case ActionType.Check: {
                    buttonClass += 'warning';
                } break;
                case ActionType.Combat: {
                    buttonClass += 'danger';
                } break;
            }

            return buttonClass;
        }

        enemiesPresent = () => {
            var self = this;
            return self.game.currentLocation && self.game.currentLocation.enemies.length;
        }

        barriersPresent = () => {
            var self = this;
            return self.game.currentLocation.destinations && self.game.currentLocation.destinations.some(function (destination) { return !isEmpty(destination.barrier); });
        }

        actionsPresent = () => {
            var self = this;
            return !self.enemiesPresent() && !isEmpty(self.game.currentLocation.actions);
        }

        disableActionButton = (action: IAction) => {
            var self = this;
            return typeof action.status === "function" ? (<any>action).status(self.game) == ActionStatus.Disabled : action.status == undefined ? false : (<any>action).status == ActionStatus.Disabled;
        }

        hideActionButton = (action: IAction) => {
            var self = this;
            return typeof action.status === "function" ? (<any>action).status(self.game) == ActionStatus.Unavailable : action.status == undefined ? false : (<any>action).status == ActionStatus.Unavailable;
        }

        public executeAction(action: IAction) {
            var self = this;

            if (action && action.execute) {
                // Modify the arguments collection to add the game to the collection before calling the function specified.
                var args = [].slice.call(arguments);
                args.shift();
                args.splice(0, 0, self.game);

                // Execute the action and when nothing or false is returned, remove it from the current location.
                var result = action.execute.apply(this, args);

                // Todo: combat actions will never be removed this way.
                if (!result && self.game.currentLocation.actions) {
                    self.game.currentLocation.actions.remove(action);
                }

                // After each action, save the game.
                self.gameService.saveGame();
            }
        }

        executeBarrierAction = (destination, barrier: IBarrier) => {
            var self = this;

            // improve, use selected action as object.
            var action = barrier.actions.filter((item: IBarrier) => { return item.text == barrier.selectedAction.text; })[0];
            var result = action.action(self.game, destination, barrier, action);

            if (!result) {
                barrier.actions.remove(action);
            }

            self.gameService.saveGame();
        }

        changeLocation = (location: string) => {
            var self = this;

            // Call changeLocation without using the execute action as the game parameter is not needed.
            self.game.changeLocation(location);

            self.gameService.saveGame();
        }

        pickupItem = (item: IItem): void => {
            var self = this;
            self.game.character.items.push(item);
            self.game.currentLocation.items.remove(item);
        }

        dropItem = (item: IItem): void => {
            var self = this;
            self.game.character.items.remove(item);
            self.game.currentLocation.items.push(item);
        }

        canEquip = (item: IItem): boolean => {
            return item.equipmentType != StoryScript.EquipmentType.Miscellaneous;
        }

        equipItem = (item: IItem) => {
            var self = this;
            var type = StoryScript.EquipmentType[item.equipmentType];
            type = type.substring(0, 1).toLowerCase() + type.substring(1);

            var equippedItem = self.game.character.equipment[type];

            if (equippedItem) {
                self.game.character.items.push(equippedItem);
            }

            self.game.character.equipment[type] = item;
            self.game.character.items.remove(item);
        }

        unequipItem = (item: IItem) => {
            var self = this;
            var type = StoryScript.EquipmentType[item.equipmentType];
            type = type.substring(0, 1).toLowerCase() + type.substring(1);

            var equippedItem = self.game.character.equipment[type];

            if (equippedItem) {
                self.game.character.items.push(equippedItem);
            }

            self.game.character.equipment[type] = null;
        }

        fight = (enemy: IEnemy) => {
            var self = this;
            self.gameService.fight(enemy);
            self.gameService.saveGame();
        }

        canPay = (currency: number, value: number) => {
            return value != undefined && currency != undefined && currency >= value;
        }

        buy = (item: IItem, trade: ITrade) => {
            var self = this;
            self.game.character.currency -= item.value;
            self.game.character.items.push(item);
            trade.currency += item.value;
            trade.sell.items.remove(item);
        }

        sell = (item: IItem, trade: ITrade) => {
            var self = this;
            self.game.character.currency += item.value;
            self.game.character.items.remove(item);
            trade.buy.items.remove(item);
            trade.currency -= item.value;
            trade.sell.items.push(item);
        }

        talk = (person: IPerson) => {
            var self = this;
            self.$scope.modalSettings.title = person.conversation.title || self.texts.format(self.texts.talk, [person.name]);
            self.$scope.modalSettings.canClose = true;
            self.game.currentLocation.activePerson = person;

            var activePerson = self.game.currentLocation.activePerson;

            var activeNode = activePerson.conversation.activeNode;

            if (!activeNode) {
                activeNode = activePerson.conversation.nodes.some((node) => { return node.active; })[0];

                if (!activeNode) {
                    activePerson.conversation.nodes[0].active = true;
                    activePerson.conversation.activeNode = activePerson.conversation.nodes[0];
                }
            }

            self.game.state = GameState.Conversation;
        }

        answer = (node: IConversationNode, reply: IConversationReply) => {
            var self = this;
            var activePerson = self.game.currentLocation.activePerson;

            activePerson.conversation.conversationLog = activePerson.conversation.conversationLog || [];

            activePerson.conversation.conversationLog.push({
                lines: node.lines,
                reply: reply.lines
            });

            if (reply.linkToNode) {
                activePerson.conversation.activeNode = activePerson.conversation.nodes.filter((node) => { return node.node == reply.linkToNode; })[0];
            }
            else {
                activePerson.conversation.nodes.forEach((node) => {
                    node.active = false;
                });
                activePerson.conversation.activeNode = null;
            }
        }

        closeModal = () => {
            var self = this;
            self.game.state = GameState.Play;
        }

        private watchCharacterHitpoints(newValue, oldValue, scope) {
            if (parseInt(newValue) && parseInt(oldValue) && newValue != oldValue) {
                var change = newValue - oldValue;
                scope.controller.gameService.hitpointsChange(change);
            }
        }

        private watchCharacterScore(newValue, oldValue, scope) {
            if (parseInt(newValue) && parseInt(oldValue) && newValue != oldValue) {
                var increase = newValue - oldValue;
                scope.controller.gameService.scoreChange(increase);
            }
        }

        private watchGameState(newValue: GameState, oldValue, scope: IMainControllerScope) {
            if (oldValue != undefined) {
                if ((oldValue == GameState.Combat || oldValue == GameState.Trade || oldValue == GameState.Conversation) && scope.modalSettings.closeAction) {
                    scope.modalSettings.closeAction(scope.game);
                }
            }

            if (newValue != undefined) {
                if (newValue == GameState.Combat || newValue == GameState.Trade || newValue == GameState.Conversation) {
                    $('#encounters').modal('show');
                }
                else {
                    $('#encounters').modal('hide');
                }

                (<any>scope).controller.gameService.changeGameState(newValue);
            }
        }

        private getCharacterAttributesToShow() {
            var self = this;
            self.characterAttributes = [];

            for (var n in self.game.character) {
                if (self.game.character.hasOwnProperty(n) && self.nonDisplayAttributes.indexOf(n) == -1) {
                    self.characterAttributes.push(n);
                }
            }

            self.characterAttributes.sort();
        }

        private setDisplayTexts() {
            var self = this;

            var defaultTexts = new DefaultTexts();
            var customTexts = (<any>self.textService).$get();

            for (var n in defaultTexts) {
                self.texts[n] = customTexts[n] ? customTexts[n] : defaultTexts[n];
            }

            self.texts.format = defaultTexts.format;
        }
    }

    MainController.$inject = ['$scope', '$window', 'locationService', 'ruleService', 'gameService', 'game', 'textService'];
}