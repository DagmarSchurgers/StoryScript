﻿module StoryScript {
    export interface ILocationService {
        init(game: IGame): void;
        loadWorld(): ICollection<ICompiledLocation>;
        saveWorld(locations: ICollection<ICompiledLocation>): void;
        changeLocation(location: any, game: IGame): void;
    }
}

module StoryScript {
    export class LocationService implements ng.IServiceProvider, ILocationService {
        private dataService: IDataService;
        private ruleService: IRuleService;
        private game: IGame;
        private definitions: any;
        private pristineLocations: ICollection<ICompiledLocation>;
        private functionIdCounter: number = 0;
        private functionList: { [id: number]: Function };

        constructor(dataService: IDataService, ruleService: IRuleService, game: IGame, definitions: any) {
            var self = this;
            self.dataService = dataService;
            self.ruleService = ruleService;
            self.game = game;
            self.definitions = definitions;
        }

        public $get(dataService: IDataService, ruleService: IRuleService, game: IGame, definitions: any): ILocationService {
            var self = this;
            self.dataService = dataService;
            self.ruleService = ruleService;
            self.game = game;
            self.definitions = definitions;

            return {
                loadWorld: self.loadWorld,
                saveWorld: self.saveWorld,
                changeLocation: self.changeLocation,
                init: self.init
            };
        }

        init = (game: IGame) => {
            var self = this;
            game.changeLocation = (location) => { self.changeLocation.call(self, location, game); };
            game.currentLocation = null;
            game.previousLocation = null;
            self.functionList = {};
            game.locations = self.loadWorld();
        }

        public loadWorld(): ICollection<ICompiledLocation> {
            var self = this;
            var locations = <ICollection<ICompiledLocation>>self.dataService.load(DataKeys.WORLD);
            self.pristineLocations = self.buildWorld();

            if (isEmpty(locations)) {
                self.save(self.pristineLocations, self.pristineLocations);
                locations = <ICollection<ICompiledLocation>>self.dataService.load(DataKeys.WORLD);
            }

            self.restore(locations);

            // Add a proxy to the destination collection push function, to replace the target function pointer
            // with the target id when adding destinations and enemies at runtime.
            locations.forEach(function (location) {
                location.destinations = location.destinations || [];
                location.destinations.push = (<any>location.destinations.push).proxy(self.addDestination);
                location.enemies = location.enemies || [];
                location.enemies.push = (<any>location.enemies.push).proxy((function (): Function {
                    return function () {
                        var args = [].slice.apply(arguments);
                        args.splice(0, 0, this);
                        self.addEnemy(self, args);
                    }
                })());
                location.combatActions = location.combatActions || [];
            });

            return locations;
        }

        public saveWorld(locations: ICollection<ICompiledLocation>) {
            var self = this;
            self.save(locations, self.pristineLocations);
        }

        private save(values, pristineValues, clone?, save?) {
            var self = this;

            save = save == undefined ? true : false;

            if (!clone) {
                clone = [];
            }

            for (var key in values) {
                if (!values.hasOwnProperty(key)) {
                    continue;
                }

                var value = values[key];
                var pristineValue = pristineValues && pristineValues.hasOwnProperty(key) ? pristineValues[key] : undefined;

                if (!value) {
                    return;
                }
                else if (Array.isArray(value)) {
                    clone[key] = [];
                    self.save(value, pristineValue, clone[key], save);
                }
                else if (typeof value === "object") {
                    if (Array.isArray(clone)) {
                        clone.push(angular.copy(value));
                    }
                    else {
                        clone[key] = angular.copy(value);
                    }

                    self.save(value, pristineValue, clone[key], save);
                }
                else if (typeof value == 'function') {
                    if (!value.isProxy) {
                        if (pristineValues && pristineValues[key]) {
                            if (Array.isArray(clone)) {
                                clone.push('_function_' + value.functionId);
                            }
                            else {
                                clone[key] = '_function_' + value.functionId;
                            }
                        }
                        else {
                            clone[key] = value.toString();
                        }
                    }
                }
                else {
                    clone[key] = value;
                }
            }

            if (save) {
                self.dataService.save(StoryScript.DataKeys.WORLD, clone);
            }
        }

        private restore(loaded) {
            var self = this;

            for (var key in loaded) {
                if (!loaded.hasOwnProperty(key)) {
                    continue;
                }

                var value = loaded[key];

                if (value == undefined) {
                    return;
                }
                else if (typeof value === "object") {
                    self.restore(loaded[key]);
                }
                else if (typeof value === 'string') {
                    if (value.indexOf('_function_') > -1) {
                        loaded[key] = self.functionList[parseInt(value.replace('_function_', ''))];
                    }
                    else if (typeof value === 'string' && value.indexOf('function ') > -1) {
                        // Todo: create a new function instead of using eval.
                        loaded[key] = eval('(' + value + ')');
                    }
                }
            }

            return loaded;
        }

        public changeLocation(location: ILocation, game: IGame) {
            var self = this;

            // If no location is specified, go to the previous location.
            if (!location) {
                var tempLocation = game.currentLocation;
                game.currentLocation = game.previousLocation;
                game.previousLocation = tempLocation;
                // Todo: can this be typed somehow?
                location = <any>game.currentLocation;
            }
            // If currently at a location, make this the previous location.
            else if (game.currentLocation) {
                game.previousLocation = game.currentLocation;
            }

            // If there is no location, we are starting a new game. Quit for now.
            if (!location) {
                return;
            }

            var key = typeof location == 'function' ? location.name : location.id ? location.id : location;
            game.currentLocation = game.locations.first(key);

            // remove the return message from the current location destinations.
            if (game.currentLocation.destinations) {
                game.currentLocation.destinations.forEach(function (destination) {
                    if ((<any>destination).isPreviousLocation) {
                        (<any>destination).isPreviousLocation = false;
                    }
                });
            }

            // Mark the previous location in the current location's destinations to allow
            // the player to more easily backtrack his last step. Also, check if the user
            // has the key for one or more barriers at this location, and add the key actions
            // if that is the case.
            if (game.currentLocation.destinations) {
                game.currentLocation.destinations.forEach(destination => {
                    if (game.previousLocation && destination.target && (<any>destination.target) == game.previousLocation.id) {
                        (<any>destination).isPreviousLocation = true;
                    }

                    if (destination.barrier && destination.barrier.key) {
                        var barrierKey = <IKey>game.character.items.first(destination.barrier.key);

                        if (barrierKey) {

                            // Todo: improve using find on barrier actions.
                            var existing = null;
                            destination.barrier.actions.forEach(x => { if (x.text == barrierKey.open.text) { existing = x; }; });

                            if (existing) {
                                destination.barrier.actions.splice(destination.barrier.actions.indexOf(existing), 1);
                            }

                            destination.barrier.actions.push(barrierKey.open);
                        }
                    }
                });
            }

            // Save the previous and current location, then get the location text.
            self.dataService.save(StoryScript.DataKeys.LOCATION, game.currentLocation.id);

            if (game.previousLocation) {
                self.dataService.save(StoryScript.DataKeys.PREVIOUSLOCATION, game.previousLocation.id);
            }

            game.currentLocation.items = game.currentLocation.items || [];
            game.currentLocation.enemies = game.currentLocation.enemies || [];

            self.loadLocationDescriptions(game);

            self.ruleService.initCombat(game.currentLocation);
            self.ruleService.enterLocation(game.currentLocation);

            // If the player hasn't been here before, play the location events.
            if (!game.currentLocation.hasVisited) {
                game.currentLocation.hasVisited = true;
                self.playEvents(game);
            }
        }

        private buildWorld(): ICompiledLocation[] {
            var self = this;
            self.functionIdCounter = 0;
            var locations = self.definitions.locations;
            var compiledLocations = [];

            for (var n in locations) {
                var definition = locations[n];
                var location = definitionToObject<ICompiledLocation>(definition);
                location.id = definition.name;

                if (!location.destinations) {
                    console.log('No destinations specified for location ' + location.id);
                }

                self.setDestinations(location);
                self.buildEnemies(location);
                self.buildItems(location);
                self.getFunctions(location);
                compiledLocations.push(location);
            }

            return compiledLocations;
        }

        private setDestinations(location: ICompiledLocation) {
            var self = this;

            // Replace the function pointers for the destination targets with the function keys.
            // That's all that is needed to navigate, and makes it easy to save these targets.
            // Also set the barrier selected actions to the first one available for each barrier.
            if (location.destinations) {
                location.destinations.forEach(destination => {
                    //if (typeof destination.target == 'function') {
                    destination.target = (<any>destination.target).name;
                    //}

                    if (destination.barrier) {
                        if (destination.barrier.actions && destination.barrier.actions.length > 0) {
                            destination.barrier.selectedAction = destination.barrier.actions[0];
                        }
                    }
                });
            }
        }

        private buildEnemies(location: ICompiledLocation) {
            var self = this;

            if (location.enemies) {
                var enemies: IEnemy[] = [];

                location.enemies.forEach((enDef) => {
                    var enemy = definitionToObject<IEnemy>(<any>enDef);
                    self.buildItems(enemy);
                    enemies.push(enemy);
                });

                (<any>location).enemies = enemies;
            }
        }

        private buildItems(entry: any) {
            var self = this;

            if (entry.items) {
                var items: IItem[] = [];

                entry.items.forEach((itemDef) => {
                    var item = definitionToObject<IItem>(itemDef);
                    items.push(item);
                });

                (<any>entry).items = items;
            }
        }

        private getFunctions(location: any) {
            var self = this;

            for (var key in location) {
                if (!location.hasOwnProperty(key)) {
                    continue;
                }

                var value = location[key];

                if (value == undefined) {
                    return;
                }
                else if (typeof value === "object") {
                    self.getFunctions(location[key]);
                }
                else if (typeof value == 'function') {
                    self.functionList[self.functionIdCounter] = value;
                    value.functionId = self.functionIdCounter;
                    self.functionIdCounter++;
                }
            }
        }

        private addDestination() {
            var self = this;
            var args = [].slice.apply(arguments);
            var originalFunction = args.shift();

            // Replace the target function pointer with the target id.
            for (var n in args) {
                var param = args[n];
                param.target = param.target.name;
            }

            originalFunction.apply(this, args);
        }

        private addEnemy(scope: any, args: any) {
            var array = args[0];
            var originalFunction = args[1];
            var enemy = args[2];
            originalFunction.call(array, enemy);
            scope.ruleService.addEnemyToLocation(scope.game.currentLocation, enemy);
        }

        private playEvents(game: IGame) {
            var self = this;

            for (var n in game.currentLocation.events) {
                game.currentLocation.events[n](game);
            }
        }

        private loadLocationDescriptions(game: IGame) {
            var self = this;

            if (game.currentLocation.descriptions) {
                return;
            }

            self.dataService.getDescription(game.currentLocation.id).then(function (descriptions) {
                var parser = new DOMParser();

                if (descriptions.indexOf('<descriptions>') == -1) {
                    descriptions = '<descriptions>' + descriptions + '</descriptions>';
                }

                var xmlDoc = parser.parseFromString(descriptions, "text/xml");
                var descriptionNodes = xmlDoc.getElementsByTagName("description");
                game.currentLocation.descriptions = {};

                for (var i = 0; i < descriptionNodes.length; i++) {
                    var node = descriptionNodes[i];
                    var nameAttribute = node.attributes['name'];
                    var name = nameAttribute ? nameAttribute.value : 'default';

                    if (game.currentLocation.descriptions[name]) {
                        throw new Error('There is already a description with name ' + name + ' for location ' + game.currentLocation.id + '.');
                    }

                    game.currentLocation.descriptions[name] = node.innerHTML;
                }

                // A location can specify how to select the proper selection using a descriptor selection function. If it is not specified,
                // use the default description selector function.
                if (game.currentLocation.descriptionSelector) {
                    game.currentLocation.text = game.currentLocation.descriptionSelector();
                }
                else {
                    var descriptionSelector = (<any>game.currentLocation).defaultDescriptionSelector;
                    game.currentLocation.text = descriptionSelector ? descriptionSelector() : game.currentLocation.descriptions['default'];
                }

                // If the description selector did not return a text, use the default description.
                if (!game.currentLocation.text) {
                    game.currentLocation.text = game.currentLocation.descriptions['default'];
                }
            });
        }
    }

    LocationService.$inject = ['dataService', 'ruleService', 'game', 'definitions'];
}