﻿module StoryScript {
    export interface ILocationService {
        init(game: IGame): void;
        saveWorld(locations: ICompiledCollection<ILocation, ICompiledLocation>): void;
        changeLocation(location: string | (() => ILocation), travel: boolean, game: IGame): void;
    }
}

module StoryScript {
    export class LocationService implements ng.IServiceProvider, ILocationService {
        private dataService: IDataService;
        private ruleService: IRuleService;
        private game: IGame;
        private definitions: any;
        private pristineLocations: ICompiledCollection<ILocation, ICompiledLocation>;
        private functionList: { [id: string]: { function: Function, hash: number } };

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
                saveWorld: self.saveWorld,
                changeLocation: self.changeLocation,
                init: self.init
            };
        }

        init = (game: IGame) => {
            var self = this;
            game.changeLocation = (location, travel) => { self.changeLocation.call(self, location, travel, game); };
            game.currentLocation = null;
            game.previousLocation = null;
            game.locations = self.loadWorld();
        }

        private loadWorld(): ICompiledCollection<ILocation, ICompiledLocation> {
            var self = this;
            self.pristineLocations = self.buildWorld();
            var locations = <ICompiledCollection<ILocation, ICompiledLocation>>self.dataService.load(DataKeys.WORLD);

            if (isEmpty(locations)) {
                self.dataService.save(DataKeys.WORLD, self.pristineLocations, self.pristineLocations);
                locations = <ICompiledCollection<ILocation, ICompiledLocation>>self.dataService.load(DataKeys.WORLD);
            }

            locations.forEach(function (location) {
                location.destinations = location.destinations || [];

                // Add a proxy to the destination collection push function, to replace the target function pointer
                // with the target id when adding destinations and enemies at runtime.
                location.destinations.push = (<any>location.destinations.push).proxy(self.addDestination, self.game);

                location.persons = location.persons || [];
                location.enemies = location.enemies || [];
                location.items = location.items || [];
                location.combatActions = location.combatActions || [];

                Object.defineProperty(location, 'activePersons', {
                    get: function () {
                        return location.persons.filter(e => { return !e.inactive; });
                    }
                });

                Object.defineProperty(location, 'activeEnemies', {
                    get: function () {
                        return location.enemies.filter(e => { return !e.inactive; });
                    }
                });

                Object.defineProperty(location, 'activeItems', {
                    get: function () {
                        return location.items.filter(e => { return !e.inactive; });
                    }
                });
            });

            return locations;
        }

        public saveWorld(locations: ICompiledCollection<ILocation, ICompiledLocation>) {
            var self = this;
            self.dataService.save(DataKeys.WORLD, locations, self.pristineLocations);
        }

        public changeLocation(location: string | (() => ILocation), travel: boolean, game: IGame) {
            var self = this;
            var presentLocation: ICompiledLocation;

            // If no location is specified, go to the previous location.
            if (!location) {
                var tempLocation = game.currentLocation;
                game.currentLocation = game.previousLocation;
                game.previousLocation = tempLocation;
                presentLocation = game.currentLocation;
            }
            // If currently at a location, make this the previous location.
            else if (game.currentLocation) {
                game.previousLocation = game.currentLocation;
            }

            // If there is no location, we are starting a new game. Quit for now.
            if (!location && !presentLocation) {
                return;
            }

            var key = typeof location == 'function' ? <string>(<any>location).name : location ? location : presentLocation.id;
            game.currentLocation = game.locations.get(key);

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

                    addKeyAction(self.game, destination);
                });
            }

            // Save the previous and current location, then get the location text.
            self.dataService.save(StoryScript.DataKeys.LOCATION, game.currentLocation.id);

            if (game.previousLocation) {
                if (!game.previousLocation.hasVisited) {
                    game.previousLocation.hasVisited = true;
                    self.game.statistics.LocationsVisited = self.game.statistics.LocationsVisited || 0;
                    self.game.statistics.LocationsVisited += 1;
                }

                if (game.previousLocation.complete) {
                    game.previousLocation.complete(game, game.previousLocation);
                }

                self.dataService.save(StoryScript.DataKeys.PREVIOUSLOCATION, game.previousLocation.id);
            }

            game.currentLocation.items = game.currentLocation.items || [];
            game.currentLocation.enemies = game.currentLocation.enemies || [];

            if (self.ruleService.enterLocation) {
                self.ruleService.enterLocation(game.currentLocation, travel);
            }

            self.loadLocationDescriptions(game);

            self.initTrade(game);

            // If the player hasn't been here before, play the location events.
            if (!game.currentLocation.hasVisited) {
                self.playEvents(game);
            }

            self.loadConversations(game);
        }

        private initTrade(game: IGame) {
            // Todo: better way to get action. Use action function name from function list?
            if (game.currentLocation.trade && (!game.currentLocation.actions || !game.currentLocation.actions.some(a => a.type == ActionType.Trade))) {
                game.currentLocation.actions = game.currentLocation.actions || [];

                game.currentLocation.actions.push({
                    text: game.currentLocation.trade.title,
                    type: ActionType.Trade,
                    execute: 'trade',
                    arguments: [
                        game.currentLocation.trade
                    ]
                });
            }
        }

        private buildWorld(): ICompiledLocation[] {
            var self = this;
            var locations = self.definitions.locations;
            var compiledLocations = [];
            self.functionList = {};

            for (var n in locations) {
                var definition = locations[n];
                var location = definitionToObject<ICompiledLocation>(definition);
                location.id = definition.name;

                if (!location.destinations) {
                    console.log('No destinations specified for location ' + location.id);
                }

                self.setDestinations(location);
                self.buildEntries(location, 'enemies', self.game.getEnemy);
                self.buildEntries(location, 'persons', self.game.getNonPlayerCharacter);
                self.buildEntries(location, 'items', self.game.getItem);
                self.getFunctions(location, null);
                compiledLocations.push(location);
            }

            // TODO
            // Register all functions for enemies/persons/items that are added to the game later and are not
            // referenced when loading the world.
            //for (var n in self.definitions.enemies) {
            //}

            //for (var n in self.definitions.persons) {
            //}

            //for (var n in self.definitions.items) {
            //}

            self.dataService.functionList = self.functionList;
            return compiledLocations;
        }

        private buildEntries(location: ICompiledLocation, collectionName: string, instantiateFunction: Function) {
            var self = this;
            var collection = [];

            for (var n in location[collectionName]) {
                var name = location[collectionName][n].name;
                var entry = name ? instantiateFunction(location[collectionName][n]) : location[collectionName][n]();
                collection.push(entry);
            }

            location[collectionName] = collection;
        }

        private setDestinations(location: ICompiledLocation) {
            var self = this;

            // Replace the function pointers for the destination targets with the function keys.
            // That's all that is needed to navigate, and makes it easy to save these targets.
            // Also set the barrier selected actions to the first one available for each barrier.
            if (location.destinations) {
                location.destinations.forEach(destination => {
                    destination.target = (<any>destination.target).name;

                    if (destination.barrier) {
                        if (destination.barrier.actions && destination.barrier.actions.length > 0) {
                            destination.barrier.selectedAction = destination.barrier.actions[0];
                        }
                    }
                });
            }
        }

        private getFunctions(location: any, parentId: any) {
            var self = this;

            if (!parentId) {
                parentId = location.id || location.name;
            }

            for (var key in location) {
                if (!location.hasOwnProperty(key)) {
                    continue;
                }

                var value = location[key];

                if (value == undefined) {
                    return;
                }
                else if (typeof value === "object") {
                    self.getFunctions(location[key], parentId + '_' + key);
                }
                else if (typeof value == 'function' && !value.isProxy) {
                    var functionId = parentId + '_' + key;

                    if (self.functionList[functionId]) {
                        throw new Error('Trying to register a duplicate function key: ' + functionId);
                    }

                    self.functionList[functionId] = {
                        function: value,
                        hash: createFunctionHash(value)
                    }

                    value.functionId = functionId;
                }
            }
        }

        private addDestination() {
            var self = this;
            var args = [].slice.apply(arguments);
            var originalFunction = args.shift();

            // Replace the target function pointer with the target id.
            var param = args[0];
            param.target = param.target.name;
            addKeyAction(args[1], param);
            args.splice(1, 1);
            originalFunction.apply(this, args);
        }

        private playEvents(game: IGame) {
            var self = this;

            for (var n in game.currentLocation.events) {
                game.currentLocation.events[n](game);
            }
        }

        private loadConversations(game: IGame) {
            var self = this;

            if (!game.currentLocation.persons) {
                return;
            }

            game.currentLocation.persons.filter(p => !p.conversation.nodes).forEach((person) => {
                self.dataService.loadDescription('persons', person).then(function (conversations) {
                    var parser = new DOMParser();

                    if (conversations.indexOf('<conversation>') == -1) {
                        conversations = '<conversation>' + conversations + '</conversation>';
                    }

                    var htmlDoc = parser.parseFromString(conversations, "text/html");
                    var defaultReplyNodes = htmlDoc.getElementsByTagName("default-reply");
                    var defaultReply = null;

                    if (defaultReplyNodes.length > 1) {
                        throw new Error('More than one default reply in conversation for person ' + person.id + '.');
                    }
                    else if (defaultReplyNodes.length === 1) {
                        defaultReply = defaultReplyNodes[0].innerHTML.trim();
                    }

                    var conversationNodes = htmlDoc.getElementsByTagName("node");

                    person.conversation.nodes = [];

                    for (var i = 0; i < conversationNodes.length; i++) {
                        var node = conversationNodes[i];
                        var nameAttribute = <string>node.attributes['name'].nodeValue;

                        if (!nameAttribute) {
                            throw new Error('Missing name attribute on node for conversation for person ' + person.id + '.');
                        }

                        if (person.conversation.nodes.some((node) => { return node.node == nameAttribute; })) {
                            throw new Error('Duplicate nodes with name ' + name + ' for conversation for person ' + person.id + '.');
                        }

                        var newNode = <IConversationNode>{
                            node: nameAttribute,
                            lines: '',
                            replies: null,
                        };

                        for (var j = 0; j < node.childNodes.length; j++) {
                            var replies = node.childNodes[j];

                            if (replies.nodeName.toLowerCase() == 'replies') {
                                var addDefaultValue = self.GetNodeValue(replies, 'default-reply');
                                var addDefaultReply = addDefaultValue ? getTypedValue(addDefaultValue) : true;

                                newNode.replies = <IConversationReplies>{
                                    defaultReply: <boolean>addDefaultReply,
                                    options: <ICollection<IConversationReply>>[]
                                };

                                for (var k = 0; k < replies.childNodes.length; k++) {
                                    var replyNode = replies.childNodes[k];

                                    if (replyNode.nodeName.toLowerCase() == 'reply') {
                                        var requires = self.GetNodeValue(replyNode, 'requires');
                                        var linkToNode = self.GetNodeValue(replyNode, 'node');
                                        var trigger = self.GetNodeValue(replyNode, 'trigger');
                                        var questStart = self.GetNodeValue(replyNode, 'quest-start');
                                        var questComplete = self.GetNodeValue(replyNode, 'quest-complete');

                                        if (trigger && !person.conversation.actions[trigger]) {
                                            console.log('No action ' + trigger + ' for node ' + newNode.node + ' found.');
                                        }

                                        var reply = <IConversationReply>{
                                            requires: requires,
                                            linkToNode: linkToNode,
                                            trigger: trigger,
                                            questStart: questStart,
                                            questComplete: questComplete,
                                            lines: (<any>replyNode).innerHTML.trim(),
                                        };

                                        newNode.replies.options.push(reply);
                                    }
                                }

                                node.removeChild(replies);

                                if (defaultReply && newNode.replies.defaultReply) {
                                    newNode.replies.options.push(<IConversationReply>{
                                        lines: defaultReply
                                    });
                                }
                            }
                        }

                        if (!newNode.replies && defaultReply) {
                            newNode.replies = <IConversationReplies>{
                                defaultReply: true,
                                options: <ICollection<IConversationReply>>[
                                    {
                                        lines: defaultReply
                                    }
                                ]
                            }
                        }

                        newNode.lines = node.innerHTML.trim();
                        person.conversation.nodes.push(newNode);
                    }
                });
            });
        }

        private GetNodeValue(node: Node, attribute: string): string {
            return node.attributes[attribute] && node.attributes[attribute].value
        }

        private loadLocationDescriptions(game: IGame) {
            var self = this;

            if (game.currentLocation.descriptions) {
                self.selectLocationDescription(game);
                return;
            }

            self.dataService.loadDescription('locations', game.currentLocation).then(function (descriptions) {
                var parser = new DOMParser();

                if (descriptions.indexOf('<descriptions>') == -1) {
                    descriptions = '<descriptions>' + descriptions + '</descriptions>';
                }

                var htmlDoc = parser.parseFromString(descriptions, "text/html");
                var descriptionNodes = htmlDoc.getElementsByTagName("description");
                game.currentLocation.descriptions = {};

                for (var i = 0; i < descriptionNodes.length; i++) {
                    var node = descriptionNodes[i];
                    var nameAttribute = node.attributes['name'] && node.attributes['name'].nodeValue;
                    var name = nameAttribute ? nameAttribute : 'default';

                    if (game.currentLocation.descriptions[name]) {
                        throw new Error('There is already a description with name ' + name + ' for location ' + game.currentLocation.id + '.');
                    }

                    game.currentLocation.descriptions[name] = node.innerHTML;
                }

                self.selectLocationDescription(game);
            });
        }

        private selectLocationDescription(game: IGame) {
            var self = this;
            var selector = null;

            // A location can specify how to select the proper selection using a descriptor selection function. If it is not specified,
            // use the default description selector function.
            if (game.currentLocation.descriptionSelector) {
                // Use this casting to allow the description selector to be a function or a string.
                selector = typeof game.currentLocation.descriptionSelector == 'function' ? (<any>game.currentLocation.descriptionSelector)(game) : game.currentLocation.descriptionSelector;
                game.currentLocation.text = game.currentLocation.descriptions[selector];
            }
            else if (self.ruleService.descriptionSelector && (selector = self.ruleService.descriptionSelector(game))) {
                game.currentLocation.text = game.currentLocation.descriptions[selector] || game.currentLocation.descriptions['default'] || game.currentLocation.descriptions[0];
            }
            else {
                game.currentLocation.text = game.currentLocation.text || game.currentLocation.descriptions['default'] || game.currentLocation.descriptions[0];
            }
        }
    }

    function addKeyAction(game: IGame, destination: IDestination) {
        if (destination.barrier && destination.barrier.key) {
            var barrierKey = <IKey>game.character.items.get(destination.barrier.key);

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
    }

    LocationService.$inject = ['dataService', 'ruleService', 'game', 'definitions'];
}