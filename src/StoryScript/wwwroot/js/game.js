var Strix;
(function (Strix) {
    var directivesModule = angular.module('strixIT', []);
    directivesModule.directive('strixDropDown', DropDownDirective);
    function DropDownDirective() {
        return {
            require: 'ngModel',
            priority: 100,
            scope: { model: '=ngModel', data: '=source', changeCallback: '=' },
            link: function (scope, elem, attr, ngModel) {
                var optionLabel = attr['optionLabel'] || 'Name';
                var optionValue = attr['optionValue'] || undefined;
                var defaultFlag = attr['defaultFlag'];
                var tabIndex = attr['tabindex'];
                var select = null;
                // Save the model value on linking of the directive. This value needs to be stored to be able to set a
                // dropdown correctly when multiple changes of the datasource are triggered before its value is set.
                scope.oldModelValue = null;
                // Create the select element, if it is not present already.
                select = findOrCreateSelectElement(elem, tabIndex);
                // Watch the data source for changes and recreate the dropdown when changes occur.
                scope.$watchCollection('data', function (newValue, oldValue) {
                    dataChanged(select, scope, ngModel, optionLabel, optionValue, defaultFlag);
                });
                // Handle the selection of a dropdown option.
                select.change(function (e) {
                    onChange(e.currentTarget.value, scope, optionLabel, optionValue, ngModel);
                });
            }
        };
        function findOrCreateSelectElement(elem, tabIndex) {
            var select;
            if (elem.is('select')) {
                select = elem;
            }
            else {
                select = elem.find('select');
            }
            if (!select.length) {
                select = $('<select class="pre-select"></select>');
                elem.append(select);
            }
            // If a tabindex was specified, set this index on the select and remove it from the parent element.
            if (tabIndex && !select.attr('tabIndex')) {
                select.attr('tabindex', tabIndex);
                elem.removeAttr('tabindex');
            }
            return select;
        }
        function dataChanged(select, scope, ngModel, optionLabel, optionValue, defaultFlag) {
            if (scope.data) {
                var selectedValue;
                // Store the old model value on the first data change.
                if (!scope.oldModelValue) {
                    scope.oldModelValue = scope.model;
                }
                selectedValue = buildSelect(select, scope, optionLabel, optionValue, defaultFlag);
                // Call onchange to actually set the view value.
                onChange(selectedValue, scope, optionLabel, optionValue, ngModel);
            }
        }
        function buildSelect(select, scope, optionLabel, optionValue, defaultFlag) {
            var selectedValue, options = [];
            select.empty();
            for (var n in scope.data) {
                var entry = scope.data[n];
                var entryValue = optionValue && entry[optionValue] || entry[optionLabel];
                if (scope.model == entryValue || scope.oldModelValue == entryValue || (entry[defaultFlag] && !selectedValue)) {
                    selectedValue = entryValue;
                }
                options.push($('<option value="' + entryValue + '">' + (entry[optionLabel] || entry) + '</option>'));
            }
            if (!selectedValue) {
                selectedValue = scope.data[0] ? optionValue && scope.data[0][optionValue] || scope.data[0] : null;
            }
            for (var n in options) {
                var option = options[n];
                if (option.attr('value') == selectedValue) {
                    option.attr('selected', 'selected');
                }
                select.append(option);
            }
            return selectedValue;
        }
        function onChange(value, scope, optionLabel, optionValue, ngModel) {
            if (!optionValue) {
                value = typeof value === 'object' ? value : scope.data.filter(function (x) { return x[optionLabel] == value; })[0];
            }
            // Do the callback before updating the view value. This order is important, which has something
            // to do with the angular digest cycle. I'm not sure what exactly.
            if (scope.changeCallback) {
                scope.changeCallback(value);
            }
            ngModel.$setViewValue(value);
        }
    }
    Strix.DropDownDirective = DropDownDirective;
})(Strix || (Strix = {}));
var StoryScript;
(function (StoryScript) {
    var CharacterService = (function () {
        function CharacterService(dataService, ruleService) {
            var self = this;
            self.dataService = dataService;
            self.ruleService = ruleService;
        }
        CharacterService.prototype.$get = function (dataService, ruleService) {
            var self = this;
            self.dataService = dataService;
            self.ruleService = ruleService;
            return {
                createCharacter: self.createCharacter
            };
        };
        CharacterService.prototype.createCharacter = function (characterData) {
            var self = this;
            var character = self.dataService.load(StoryScript.DataKeys.CHARACTER);
            if (StoryScript.isEmpty(character)) {
                var self = this;
                character = self.ruleService.createCharacter(characterData);
                character.name = characterData.name;
                characterData.steps.forEach(function (step) {
                    if (step.questions) {
                        step.questions.forEach(function (question) {
                            character[question.selectedEntry.value] += question.selectedEntry.bonus;
                        });
                    }
                });
                characterData.steps.forEach(function (step) {
                    if (step.attributes) {
                        step.attributes.forEach(function (attribute) {
                            character[attribute.attribute] = attribute.value;
                        });
                    }
                });
                return character;
            }
            if (StoryScript.isEmpty(character.items)) {
                character.items = [];
            }
            return character;
        };
        return CharacterService;
    }());
    StoryScript.CharacterService = CharacterService;
    CharacterService.$inject = ['dataService', 'ruleService'];
})(StoryScript || (StoryScript = {}));
var StoryScript;
(function (StoryScript) {
    var DataService = (function () {
        function DataService($q, $http, $localStorage) {
            var self = this;
            self.$http = $http;
            self.$q = $q;
            self.$localStorage = $localStorage;
        }
        DataService.prototype.$get = function ($q, $http, $localStorage) {
            var self = this;
            self.$http = $http;
            self.$q = $q;
            self.$localStorage = $localStorage;
            return {
                functionList: self.functionList,
                getDescription: self.getDescription,
                save: self.save,
                load: self.load
            };
        };
        DataService.prototype.getDescription = function (descriptionId) {
            var self = this;
            var deferred = self.$q.defer();
            var url = '/locations/' + descriptionId + '.html';
            self.$http.get(url)
                .success(function (data, status, headers, config) {
                deferred.resolve(data);
            }).
                error(function (data, status, headers, config) {
                deferred.reject();
            });
            return deferred.promise;
        };
        DataService.prototype.save = function (key, value, pristineValues) {
            var self = this;
            var clone = self.buildClone(value, pristineValues, null);
            self.$localStorage[key] = JSON.stringify({ data: clone });
        };
        DataService.prototype.load = function (key) {
            var self = this;
            try {
                var data = JSON.parse(self.$localStorage[key]).data;
                if (StoryScript.isEmpty(data)) {
                    return null;
                }
                self.restore(data);
                return data;
            }
            catch (exception) {
                console.log('No data loaded for key ' + key);
            }
        };
        DataService.prototype.buildClone = function (values, pristineValues, clone) {
            var self = this;
            if (!clone) {
                clone = Array.isArray(values) ? [] : typeof value === "object" ? {} : values;
                if (clone == values) {
                    return clone;
                }
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
                    self.buildClone(value, pristineValue, clone[key]);
                }
                else if (typeof value === "object") {
                    if (Array.isArray(clone)) {
                        clone.push(angular.copy(value));
                    }
                    else {
                        clone[key] = angular.copy(value);
                    }
                    self.buildClone(value, pristineValue, clone[key]);
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
            return clone;
        };
        DataService.prototype.restore = function (loaded) {
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
        };
        return DataService;
    }());
    StoryScript.DataService = DataService;
    DataService.$inject = ['$q', '$http', '$localStorage', 'definitions'];
})(StoryScript || (StoryScript = {}));
var StoryScript;
(function (StoryScript) {
    var DefaultTexts = (function () {
        function DefaultTexts() {
            this.equipmentHeader = "Equipment";
            this.head = "Head";
            this.amulet = "Amulet";
            this.rightHand = "Right hand";
            this.leftHand = "Left hand";
            this.body = "Body";
            this.legs = "Legs";
            this.feet = "Feet";
            this.backpack = "Backpack";
            this.equip = "Equip";
            this.use = "Use";
            this.drop = "Drop";
            this.enemies = "Enemies";
            this.attack = "Attack {0}!";
            this.newGame = "New game";
            this.yourName = "What is your name?";
            this.nextQuestion = "Next question";
            this.startAdventure = "Start adventure";
            this.actions = "Actions";
            this.destinations = "Destinations";
            this.back = "Back: ";
            this.onTheGround = "On the ground";
            this.youLost = "You lost...";
            this.questFailed = "You have failed your quest!";
            this.finalScore = "Your score: ";
            this.tryAgain = "Try again";
            this.highScores = "High Scores";
            this.youWon = "You won!";
            this.congratulations = "Congratulations! You have won the game!";
            this.playAgain = "Play again";
            this.startOver = "Start over";
            this.resetWorld = "Reset world";
            this.gameName = "Game template";
            this.loading = "Loading...";
            this.youAreHere = "You are here";
            this.messages = "Messages";
            this.format = function (template, tokens) {
                for (var i = 0; i < tokens.length; i++) {
                    template = template.replace('{' + i + '}', tokens[i]);
                }
                return template;
            };
        }
        return DefaultTexts;
    }());
    StoryScript.DefaultTexts = DefaultTexts;
})(StoryScript || (StoryScript = {}));
var StoryScript;
(function (StoryScript) {
    var GameService = (function () {
        function GameService(dataService, locationService, characterService, ruleService, game, gameNameSpace, definitions) {
            var _this = this;
            this.init = function () {
                var self = _this;
                self.game.nameSpace = self.gameNameSpace;
                self.definitions.locations = window[self.gameNameSpace]['Locations'];
                var actions = window['StoryScript']['Actions'];
                var customActions = window[self.gameNameSpace]['Actions'];
                self.definitions.actions = customActions ? angular.extend(customActions, actions) : actions;
                self.definitions.enemies = window[self.gameNameSpace]['Enemies'];
                self.definitions.items = window[self.gameNameSpace]['Items'];
                self.game.definitions = self.definitions;
                self.game.createCharacterSheet = self.ruleService.getCreateCharacterSheet();
                self.game.createCharacterSheet.currentStep = 0;
                self.game.createCharacterSheet.nextStep = function (data) { data.currentStep++; };
                if (self.ruleService.setupGame) {
                    self.ruleService.setupGame(self.game);
                }
                // Game setup start
                self.game.highScores = [];
                self.game.actionLog = [];
                self.game.logToLocationLog = function (message) {
                    self.game.currentLocation.log = self.game.currentLocation.log || [];
                    self.game.currentLocation.log.push(message);
                };
                self.game.logToActionLog = function (message) {
                    self.game.actionLog.splice(0, 0, message);
                };
                // Game setup end
                self.locationService.init(self.game);
                self.game.highScores = self.dataService.load(StoryScript.DataKeys.HIGHSCORES);
                self.game.character = self.dataService.load(StoryScript.DataKeys.CHARACTER);
                var locationName = self.dataService.load(StoryScript.DataKeys.LOCATION);
                if (self.game.character && locationName) {
                    var lastLocation = self.game.locations.first(locationName);
                    var previousLocationName = self.dataService.load(StoryScript.DataKeys.PREVIOUSLOCATION);
                    if (previousLocationName) {
                        self.game.previousLocation = self.game.locations.first(previousLocationName);
                    }
                    self.locationService.changeLocation(lastLocation, self.game);
                    self.game.state = 'play';
                }
                else {
                    self.game.state = 'createCharacter';
                }
                self.game.rollDice = self.rollDice;
                self.game.calculateBonus = function (person, type) { return self.calculateBonus(self.game, person, type); };
            };
            this.reset = function () {
                var self = _this;
                self.dataService.save(StoryScript.DataKeys.WORLD, {});
                self.locationService.init(self.game);
                var location = self.dataService.load(StoryScript.DataKeys.LOCATION);
                if (location) {
                    self.locationService.changeLocation(location, self.game);
                }
            };
            this.startNewGame = function (characterData) {
                var self = _this;
                self.game.character = self.characterService.createCharacter(characterData);
                self.dataService.save(StoryScript.DataKeys.CHARACTER, self.game.character);
                self.game.changeLocation(self.game.locations.first('Start'));
            };
            this.restart = function () {
                var self = _this;
                self.dataService.save(StoryScript.DataKeys.CHARACTER, {});
                self.dataService.save(StoryScript.DataKeys.LOCATION, '');
                self.dataService.save(StoryScript.DataKeys.PREVIOUSLOCATION, '');
                self.dataService.save(StoryScript.DataKeys.WORLD, {});
                self.init();
            };
            this.saveGame = function () {
                var self = _this;
                self.dataService.save(StoryScript.DataKeys.CHARACTER, self.game.character);
                self.locationService.saveWorld(self.game.locations);
            };
            this.rollDice = function (input) {
                //'xdy+/-z'
                var positiveModifier = input.indexOf('+') > -1;
                var splitResult = input.split('d');
                var numberOfDice = parseInt(splitResult[0]);
                splitResult = positiveModifier ? splitResult[1].split('+') : splitResult[1].split('-');
                var dieCount = parseInt(splitResult[0]);
                var bonus = parseInt(splitResult[1]);
                bonus = isNaN(bonus) ? 0 : bonus;
                bonus = positiveModifier ? bonus : bonus * -1;
                var result = 0;
                for (var i = 0; i < numberOfDice; i++) {
                    result += Math.floor(Math.random() * dieCount + 1);
                }
                result += bonus;
                return result;
            };
            this.calculateBonus = function (game, person, type) {
                var self = _this;
                var bonus = 0;
                if (game.character == person) {
                    for (var n in person.equipment) {
                        var item = person.equipment[n];
                        if (item && item.bonuses && item.bonuses[type]) {
                            bonus += item.bonuses[type];
                        }
                    }
                    ;
                }
                else {
                    person.items.forEach(function (item) {
                        if (item && item.bonuses && item.bonuses[type]) {
                            bonus += item.bonuses[type];
                        }
                    });
                }
                return bonus;
            };
            this.fight = function (enemy) {
                var self = _this;
                var win = self.ruleService.fight(enemy);
                if (win) {
                    if (enemy.items && enemy.items.length) {
                        enemy.items.forEach(function (item) {
                            self.game.currentLocation.items = self.game.currentLocation.items || [];
                            // Todo: type
                            self.game.currentLocation.items.push(item);
                        });
                        enemy.items.splice(0, enemy.items.length);
                    }
                    self.game.currentLocation.enemies.remove(enemy);
                    self.ruleService.enemyDefeated(enemy);
                    if (enemy.onDefeat) {
                        enemy.onDefeat(self.game);
                    }
                }
            };
            this.scoreChange = function (change) {
                var self = _this;
                // Todo: change if xp can be lost.
                if (change > 0) {
                    var character = self.game.character;
                    var levelUp = self.ruleService.scoreChange(change);
                    if (levelUp) {
                        self.game.state = 'levelUp';
                    }
                }
            };
            this.hitpointsChange = function (change) {
                var self = _this;
                var defeat = self.ruleService.hitpointsChange(change);
                if (defeat) {
                    self.game.state = 'gameOver';
                }
            };
            this.changeGameState = function (state) {
                var self = _this;
                if (state == 'gameOver' || state == 'victory') {
                    self.updateHighScore();
                    self.dataService.save(StoryScript.DataKeys.HIGHSCORES, self.game.highScores);
                }
            };
            var self = this;
            self.dataService = dataService;
            self.locationService = locationService;
            self.characterService = characterService;
            self.ruleService = ruleService;
            self.game = game;
            self.gameNameSpace = gameNameSpace;
            self.definitions = definitions;
        }
        GameService.prototype.$get = function (dataService, locationService, characterService, ruleService, game, gameNameSpace, definitions) {
            var self = this;
            self.dataService = dataService;
            self.locationService = locationService;
            self.characterService = characterService;
            self.ruleService = ruleService;
            self.game = game;
            self.gameNameSpace = gameNameSpace;
            self.definitions = definitions;
            return {
                init: self.init,
                startNewGame: self.startNewGame,
                reset: self.reset,
                restart: self.restart,
                saveGame: self.saveGame,
                rollDice: self.rollDice,
                fight: self.fight,
                hitpointsChange: self.hitpointsChange,
                scoreChange: self.scoreChange,
                changeGameState: self.changeGameState
            };
        };
        GameService.prototype.updateHighScore = function () {
            var self = this;
            var scoreEntry = { name: self.game.character.name, score: self.game.character.score };
            if (!self.game.highScores || !self.game.highScores.length) {
                self.game.highScores = [];
            }
            var scoreAdded = false;
            self.game.highScores.forEach(function (entry) {
                if (self.game.character.score > entry.score && !scoreAdded) {
                    var index = self.game.highScores.indexOf(entry);
                    if (self.game.highScores.length >= 5) {
                        self.game.highScores.splice(index, 1, scoreEntry);
                    }
                    else {
                        self.game.highScores.splice(index, 0, scoreEntry);
                    }
                    scoreAdded = true;
                }
            });
            if (self.game.highScores.length < 5 && !scoreAdded) {
                self.game.highScores.push(scoreEntry);
            }
            self.dataService.save(StoryScript.DataKeys.HIGHSCORES, self.game.highScores);
        };
        return GameService;
    }());
    StoryScript.GameService = GameService;
    GameService.$inject = ['dataService', 'locationService', 'characterService', 'ruleService', 'game', 'gameNameSpace', 'definitions'];
})(StoryScript || (StoryScript = {}));
var StoryScript;
(function (StoryScript) {
    // This code has to be outside of the addFunctionExtensions to have the correct function scope for the proxy.
    if (Function.prototype.proxy === undefined) {
        Function.prototype.proxy = function (proxyFunction) {
            var self = this;
            return (function () {
                var func = function () {
                    var args = [].slice.call(arguments);
                    args.splice(0, 0, self);
                    return proxyFunction.apply(this, args);
                };
                func.isProxy = true;
                return func;
            })();
        };
    }
    function isEmpty(object, property) {
        var objectToCheck = property ? object[property] : object;
        return objectToCheck ? Object.keys(objectToCheck).length === 0 : true;
    }
    StoryScript.isEmpty = isEmpty;
    function addFunctionExtensions() {
        // Need to cast to any for ES5 and lower
        if (Function.prototype.name === undefined) {
            Object.defineProperty(Function.prototype, 'name', {
                get: function () {
                    return /function ([^(]*)/.exec(this + "")[1];
                }
            });
        }
    }
    StoryScript.addFunctionExtensions = addFunctionExtensions;
    function addArrayExtensions() {
        Object.defineProperty(Array.prototype, 'first', {
            enumerable: false,
            value: function (id) {
                if (id) {
                    return find(id, this)[0];
                }
                else {
                    return this[0];
                }
            }
        });
        Object.defineProperty(Array.prototype, 'all', {
            enumerable: false,
            value: function (id) {
                return find(id, this);
            }
        });
        Object.defineProperty(Array.prototype, 'remove', {
            enumerable: false,
            value: function (item) {
                // Need to cast to any for ES5 and lower
                var index = Array.prototype.findIndex.call(this, function (x) {
                    return x === item || (item.id && x.id && item.id === x.id);
                });
                if (index != -1) {
                    Array.prototype.splice.call(this, index, 1);
                }
            }
        });
    }
    StoryScript.addArrayExtensions = addArrayExtensions;
    function definitionToObject(definition) {
        var item = definition();
        // todo: type
        // Need to cast to any for ES5 and lower
        item.id = definition.name;
        return item;
    }
    StoryScript.definitionToObject = definitionToObject;
    function convertOjectToArray(item) {
        var isArray = !isEmpty(item);
        for (var n in item) {
            if (isNaN(parseInt(n))) {
                isArray = false;
                break;
            }
        }
        if (!isArray) {
            return;
        }
        var newArray = [];
        for (var n in item) {
            newArray.push(item[n]);
        }
        return newArray;
    }
    StoryScript.convertOjectToArray = convertOjectToArray;
    var DataKeys = (function () {
        function DataKeys() {
        }
        DataKeys.HIGHSCORES = 'highScores';
        DataKeys.CHARACTER = 'character';
        DataKeys.LOCATION = 'location';
        DataKeys.PREVIOUSLOCATION = 'previousLocation';
        DataKeys.WORLD = 'world';
        return DataKeys;
    }());
    StoryScript.DataKeys = DataKeys;
    function find(id, array) {
        if (typeof id === 'function') {
            id = id.name;
        }
        var callBack = id.callBack ? id.callBack : matchById(id);
        return Array.prototype.filter.call(array, callBack);
    }
    function matchById(id) {
        return function (x) {
            return x.id === id || (x.target && x.target === id || (typeof x.target === 'function' && x.target.name === id));
        };
    }
})(StoryScript || (StoryScript = {}));
var StoryScript;
(function (StoryScript) {
    var LocationService = (function () {
        function LocationService(dataService, ruleService, game, definitions) {
            var _this = this;
            this.functionIdCounter = 0;
            this.init = function (game) {
                var self = _this;
                game.changeLocation = function (location) { self.changeLocation.call(self, location, game); };
                game.currentLocation = null;
                game.previousLocation = null;
                game.locations = self.loadWorld();
            };
            var self = this;
            self.dataService = dataService;
            self.ruleService = ruleService;
            self.game = game;
            self.definitions = definitions;
        }
        LocationService.prototype.$get = function (dataService, ruleService, game, definitions) {
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
        };
        LocationService.prototype.loadWorld = function () {
            var self = this;
            var locations = self.dataService.load(StoryScript.DataKeys.WORLD);
            self.pristineLocations = self.buildWorld();
            if (StoryScript.isEmpty(locations)) {
                self.dataService.save(StoryScript.DataKeys.WORLD, self.pristineLocations, self.pristineLocations);
                locations = self.dataService.load(StoryScript.DataKeys.WORLD);
            }
            // Add a proxy to the destination collection push function, to replace the target function pointer
            // with the target id when adding destinations and enemies at runtime.
            locations.forEach(function (location) {
                location.destinations = location.destinations || [];
                location.destinations.push = location.destinations.push.proxy(self.addDestination);
                location.enemies = location.enemies || [];
                location.enemies.push = location.enemies.push.proxy((function () {
                    return function () {
                        var args = [].slice.apply(arguments);
                        args.splice(0, 0, this);
                        self.addEnemy(self, args);
                    };
                })());
                location.combatActions = location.combatActions || [];
            });
            return locations;
        };
        LocationService.prototype.saveWorld = function (locations) {
            var self = this;
            self.dataService.save(StoryScript.DataKeys.WORLD, locations, self.pristineLocations);
        };
        LocationService.prototype.changeLocation = function (location, game) {
            var self = this;
            // If no location is specified, go to the previous location.
            if (!location) {
                var tempLocation = game.currentLocation;
                game.currentLocation = game.previousLocation;
                game.previousLocation = tempLocation;
                // Todo: can this be typed somehow?
                location = game.currentLocation;
            }
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
                    if (destination.isPreviousLocation) {
                        destination.isPreviousLocation = false;
                    }
                });
            }
            // Mark the previous location in the current location's destinations to allow
            // the player to more easily backtrack his last step. Also, check if the user
            // has the key for one or more barriers at this location, and add the key actions
            // if that is the case.
            if (game.currentLocation.destinations) {
                game.currentLocation.destinations.forEach(function (destination) {
                    if (game.previousLocation && destination.target && destination.target == game.previousLocation.id) {
                        destination.isPreviousLocation = true;
                    }
                    if (destination.barrier && destination.barrier.key) {
                        var barrierKey = game.character.items.first(destination.barrier.key);
                        if (barrierKey) {
                            // Todo: improve using find on barrier actions.
                            var existing = null;
                            destination.barrier.actions.forEach(function (x) { if (x.text == barrierKey.open.text) {
                                existing = x;
                            } ; });
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
            if (self.ruleService.initCombat) {
                self.ruleService.initCombat(game.currentLocation);
            }
            if (self.ruleService.enterLocation) {
                self.ruleService.enterLocation(game.currentLocation);
            }
            // If the player hasn't been here before, play the location events.
            if (!game.currentLocation.hasVisited) {
                game.currentLocation.hasVisited = true;
                self.playEvents(game);
            }
        };
        LocationService.prototype.buildWorld = function () {
            var self = this;
            self.functionIdCounter = 0;
            var locations = self.definitions.locations;
            var compiledLocations = [];
            self.functionList = {};
            for (var n in locations) {
                var definition = locations[n];
                var location = StoryScript.definitionToObject(definition);
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
            self.dataService.functionList = self.functionList;
            return compiledLocations;
        };
        LocationService.prototype.setDestinations = function (location) {
            var self = this;
            // Replace the function pointers for the destination targets with the function keys.
            // That's all that is needed to navigate, and makes it easy to save these targets.
            // Also set the barrier selected actions to the first one available for each barrier.
            if (location.destinations) {
                location.destinations.forEach(function (destination) {
                    //if (typeof destination.target == 'function') {
                    destination.target = destination.target.name;
                    //}
                    if (destination.barrier) {
                        if (destination.barrier.actions && destination.barrier.actions.length > 0) {
                            destination.barrier.selectedAction = destination.barrier.actions[0];
                        }
                    }
                });
            }
        };
        LocationService.prototype.buildEnemies = function (location) {
            var self = this;
            if (location.enemies) {
                var enemies = [];
                location.enemies.forEach(function (enDef) {
                    var enemy = StoryScript.definitionToObject(enDef);
                    self.buildItems(enemy);
                    enemies.push(enemy);
                });
                location.enemies = enemies;
            }
        };
        LocationService.prototype.buildItems = function (entry) {
            var self = this;
            if (entry.items) {
                var items = [];
                entry.items.forEach(function (itemDef) {
                    var item = StoryScript.definitionToObject(itemDef);
                    items.push(item);
                });
                entry.items = items;
            }
        };
        LocationService.prototype.getFunctions = function (location) {
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
        };
        LocationService.prototype.addDestination = function () {
            var self = this;
            var args = [].slice.apply(arguments);
            var originalFunction = args.shift();
            // Replace the target function pointer with the target id.
            for (var n in args) {
                var param = args[n];
                param.target = param.target.name;
            }
            originalFunction.apply(this, args);
        };
        LocationService.prototype.addEnemy = function (scope, args) {
            var array = args[0];
            var originalFunction = args[1];
            var enemy = args[2];
            originalFunction.call(array, enemy);
            var ruleService = scope.ruleService;
            if (ruleService.addEnemyToLocation) {
                ruleService.addEnemyToLocation(scope.game.currentLocation, enemy);
            }
        };
        LocationService.prototype.playEvents = function (game) {
            var self = this;
            for (var n in game.currentLocation.events) {
                game.currentLocation.events[n](game);
            }
        };
        LocationService.prototype.loadLocationDescriptions = function (game) {
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
                    var descriptionSelector = game.currentLocation.defaultDescriptionSelector;
                    game.currentLocation.text = descriptionSelector ? descriptionSelector() : game.currentLocation.descriptions['default'];
                }
                // If the description selector did not return a text, use the default description.
                if (!game.currentLocation.text) {
                    game.currentLocation.text = game.currentLocation.descriptions['default'];
                }
            });
        };
        return LocationService;
    }());
    StoryScript.LocationService = LocationService;
    LocationService.$inject = ['dataService', 'ruleService', 'game', 'definitions'];
})(StoryScript || (StoryScript = {}));
var StoryScript;
(function (StoryScript) {
    var MainController = (function () {
        function MainController($scope, $window, locationService, ruleService, gameService, game, textService) {
            var _this = this;
            this.texts = {};
            this.startNewGame = function () {
                var self = _this;
                self.gameService.startNewGame(self.game.createCharacterSheet);
                self.game.state = 'play';
            };
            this.restart = function () {
                var self = _this;
                self.gameService.restart();
                self.init();
            };
            this.getButtonClass = function (action) {
                var type = action.type || 'move';
                var buttonClass = 'btn-';
                switch (type) {
                    case 'move':
                        {
                            buttonClass += 'info';
                        }
                        break;
                    case 'skill':
                        {
                            buttonClass += 'warning';
                        }
                        break;
                    case 'fight':
                        {
                            buttonClass += 'danger';
                        }
                        break;
                }
                return buttonClass;
            };
            this.enemiesPresent = function () {
                var self = _this;
                return self.game.currentLocation && self.game.currentLocation.enemies.length;
            };
            this.barriersPresent = function () {
                var self = _this;
                return self.game.currentLocation.destinations && self.game.currentLocation.destinations.some(function (destination) { return !StoryScript.isEmpty(destination.barrier); });
            };
            this.actionsPresent = function () {
                var self = _this;
                return !self.enemiesPresent() && !StoryScript.isEmpty(self.game.currentLocation.actions);
            };
            this.disableActionButton = function (action) {
                var self = _this;
                return typeof action.active === "function" ? !action.active(self.game) : action.active == undefined ? false : !action.active;
            };
            this.executeBarrierAction = function (destination, barrier) {
                var self = _this;
                var action = barrier.actions.first({ callBack: function (x) { return x.text == barrier.selectedAction.text; } });
                var args = [action.action, destination, barrier, action];
                self.executeAction.apply(_this, args);
            };
            this.changeLocation = function (location) {
                var self = _this;
                // Call changeLocation without using the execute action as the game parameter is not needed.
                self.game.changeLocation(location);
                self.gameService.saveGame();
            };
            this.pickupItem = function (item) {
                var self = _this;
                self.game.character.items.push(item);
                self.game.currentLocation.items.remove(item);
            };
            this.dropItem = function (item) {
                var self = _this;
                self.game.character.items.remove(item);
                self.game.currentLocation.items.push(item);
            };
            this.canEquip = function (item) {
                return item.equipmentType != StoryScript.EquipmentType.Miscellaneous;
            };
            this.equipItem = function (item) {
                var self = _this;
                var equippedItem = self.game.character.equipment[StoryScript.EquipmentType[item.equipmentType]];
                if (equippedItem) {
                    self.game.character.items.push(equippedItem);
                }
                self.game.character.equipment[StoryScript.EquipmentType[item.equipmentType]] = item;
                self.game.character.items.remove(item);
            };
            this.fight = function (game, enemy) {
                var self = _this;
                self.gameService.fight(enemy);
            };
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
        // Todo: can this be done differently?
        MainController.prototype.reset = function () { };
        ;
        MainController.prototype.init = function () {
            var self = this;
            self.gameService.init();
            self.reset = function () { self.gameService.reset.call(self.gameService); };
            // Set the texts
            var defaultTexts = new StoryScript.DefaultTexts();
            var customTexts = self.textService.$get();
            for (var n in defaultTexts) {
                self.texts[n] = customTexts[n] ? customTexts[n] : defaultTexts[n];
            }
            self.texts.format = defaultTexts.format;
            // Todo: type
            self.$scope.game = self.game;
            self.$scope.texts = self.texts;
            // Watch functions.
            self.$scope.$watch('game.character.currentHitpoints', self.watchCharacterHitpoints);
            self.$scope.$watch('game.character.score', self.watchCharacterScore);
            self.$scope.$watch('game.state', self.watchGameState);
        };
        MainController.prototype.executeAction = function (action) {
            var self = this;
            if (action && typeof action === 'function') {
                // Modify the arguments collection to add the game to the collection before
                // calling the function specified.
                var args = [].slice.call(arguments);
                args.shift();
                args.splice(0, 0, self.game);
                action.apply(this, args);
                // After each action, save the game.
                self.gameService.saveGame();
            }
        };
        MainController.prototype.watchCharacterHitpoints = function (newValue, oldValue, scope) {
            if (parseInt(newValue) && parseInt(oldValue) && newValue != oldValue) {
                var change = newValue - oldValue;
                scope.controller.gameService.hitpointsChange(change);
            }
        };
        MainController.prototype.watchCharacterScore = function (newValue, oldValue, scope) {
            if (parseInt(newValue) && parseInt(oldValue) && newValue != oldValue) {
                var increase = newValue - oldValue;
                scope.controller.gameService.scoreChange(increase);
            }
        };
        MainController.prototype.watchGameState = function (newValue, oldValue, scope) {
            if (newValue != undefined) {
                scope.controller.gameService.changeGameState(newValue);
            }
        };
        return MainController;
    }());
    StoryScript.MainController = MainController;
    MainController.$inject = ['$scope', '$window', 'locationService', 'ruleService', 'gameService', 'game', 'textService'];
})(StoryScript || (StoryScript = {}));
var StoryScript;
(function (StoryScript) {
    (function (EquipmentType) {
        EquipmentType[EquipmentType["Head"] = 0] = "Head";
        EquipmentType[EquipmentType["Amulet"] = 1] = "Amulet";
        EquipmentType[EquipmentType["Hands"] = 2] = "Hands";
        EquipmentType[EquipmentType["LeftHand"] = 3] = "LeftHand";
        EquipmentType[EquipmentType["LeftRing"] = 4] = "LeftRing";
        EquipmentType[EquipmentType["RightHand"] = 5] = "RightHand";
        EquipmentType[EquipmentType["RightRing"] = 6] = "RightRing";
        EquipmentType[EquipmentType["Body"] = 7] = "Body";
        EquipmentType[EquipmentType["Legs"] = 8] = "Legs";
        EquipmentType[EquipmentType["Feet"] = 9] = "Feet";
        EquipmentType[EquipmentType["Miscellaneous"] = 10] = "Miscellaneous";
    })(StoryScript.EquipmentType || (StoryScript.EquipmentType = {}));
    var EquipmentType = StoryScript.EquipmentType;
})(StoryScript || (StoryScript = {}));
var StoryScript;
(function (StoryScript) {
    var ScoreEntry = (function () {
        function ScoreEntry() {
        }
        return ScoreEntry;
    }());
    StoryScript.ScoreEntry = ScoreEntry;
})(StoryScript || (StoryScript = {}));
var StoryScript;
(function (StoryScript) {
    StoryScript.addFunctionExtensions();
    StoryScript.addArrayExtensions();
    var storyScriptModule = angular.module("storyscript", ['ngSanitize', 'ngStorage', 'strixIT']);
    var game = {};
    storyScriptModule.value('game', game);
    var definitions = {};
    storyScriptModule.value('definitions', definitions);
    storyScriptModule.service("dataService", StoryScript.DataService);
    storyScriptModule.service("locationService", StoryScript.LocationService);
    storyScriptModule.service("characterService", StoryScript.CharacterService);
    storyScriptModule.service("gameService", StoryScript.GameService);
    storyScriptModule.controller("MainController", StoryScript.MainController);
})(StoryScript || (StoryScript = {}));
var MyNewGame;
(function (MyNewGame) {
    var Character = (function () {
        function Character() {
            this.score = 0;
            this.level = 1;
            this.hitpoints = 0;
            this.currentHitpoints = 0;
            this.strength = 1;
            this.agility = 1;
            this.intelligence = 1;
            this.items = [];
            this.equipment = {
                head: null,
                amulet: null,
                body: null,
                hands: null,
                leftHand: null,
                leftRing: null,
                rightHand: null,
                rightRing: null,
                legs: null,
                feet: null
            };
        }
        return Character;
    }());
    MyNewGame.Character = Character;
})(MyNewGame || (MyNewGame = {}));
var MyNewGame;
(function (MyNewGame) {
    var RuleService = (function () {
        function RuleService(game) {
            var _this = this;
            this.getCreateCharacterSheet = function () {
                return {
                    steps: [
                        {
                            questions: [
                                {
                                    question: 'As a child, you were always...',
                                    entries: [
                                        {
                                            text: 'strong in fights',
                                            value: 'strength',
                                            bonus: 1
                                        },
                                        {
                                            text: 'a fast runner',
                                            value: 'agility',
                                            bonus: 1
                                        },
                                        {
                                            text: 'a curious reader',
                                            value: 'intelligence',
                                            bonus: 1
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            questions: [
                                {
                                    question: 'When time came to become an apprentice, you chose to...',
                                    entries: [
                                        {
                                            text: 'become a guard',
                                            value: 'strength',
                                            bonus: 1
                                        },
                                        {
                                            text: 'learn about locks',
                                            value: 'agility',
                                            bonus: 1
                                        },
                                        {
                                            text: 'go to magic school',
                                            value: 'intelligence',
                                            bonus: 1
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                };
            };
            this.fight = function (enemyToFight) {
                var self = _this;
                var win = false;
                // Todo: change when multiple enemies of the same type can be present.
                var enemy = self.game.currentLocation.enemies.first(enemyToFight.id);
                // Implement character attack here.
                if (win) {
                    return true;
                }
                self.game.currentLocation.enemies.forEach(function (enemy) {
                    // Implement monster attack here
                });
                return false;
            };
            var self = this;
            self.game = game;
        }
        RuleService.prototype.$get = function (game) {
            var self = this;
            self.game = game;
            return {
                getCreateCharacterSheet: self.getCreateCharacterSheet,
                createCharacter: self.createCharacter,
                fight: self.fight,
                hitpointsChange: self.hitpointsChange,
                scoreChange: self.scoreChange
            };
        };
        RuleService.prototype.createCharacter = function (characterData) {
            var self = this;
            var character = new MyNewGame.Character();
            return character;
        };
        RuleService.prototype.hitpointsChange = function (change) {
            var self = this;
            // Implement additional logic to occur when hitpoints are lost. Return true when the character has been defeated.
            return false;
        };
        RuleService.prototype.scoreChange = function (change) {
            var self = this;
            // Implement logic to occur when the score changes. Return true when the character gains a level.
            return false;
        };
        return RuleService;
    }());
    MyNewGame.RuleService = RuleService;
    RuleService.$inject = ['game'];
    var storyScriptModule = angular.module("storyscript");
    storyScriptModule.service("ruleService", RuleService);
})(MyNewGame || (MyNewGame = {}));
var MyNewGame;
(function (MyNewGame) {
    var TextService = (function () {
        function TextService() {
        }
        TextService.prototype.$get = function (game) {
            var self = this;
            return {};
        };
        return TextService;
    }());
    MyNewGame.TextService = TextService;
    var storyScriptModule = angular.module("storyscript");
    storyScriptModule.service("textService", TextService);
})(MyNewGame || (MyNewGame = {}));
var MyNewGame;
(function (MyNewGame) {
    var storyScriptModule = angular.module("storyscript");
    storyScriptModule.value("gameNameSpace", 'MyNewGame');
})(MyNewGame || (MyNewGame = {}));
var MyNewGame;
(function (MyNewGame) {
    var Locations;
    (function (Locations) {
        function Start() {
            return {
                name: 'Start'
            };
        }
        Locations.Start = Start;
    })(Locations = MyNewGame.Locations || (MyNewGame.Locations = {}));
})(MyNewGame || (MyNewGame = {}));

//# sourceMappingURL=../maps/game.js.map
