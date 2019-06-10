﻿namespace StoryScript {
    export interface IGameService {
        init(): void;
        initTexts(customTexts: IInterfaceTexts): IInterfaceTexts;
        startNewGame(characterData: any): void;
        reset(): void;
        restart(): void;
        saveGame(name?: string): void;
        getSaveGames(): string[];
        loadGame(name: string): void;
        hasDescription(type: string, item: { id?: string, description?: string }): boolean;
        getDescription(type: string, entity: any, key: string): string;
        initCombat(): void;
        fight(enemy: IEnemy, retaliate?: boolean): void;
        useItem(item: IItem): void;
        executeBarrierAction(destination: IDestination, barrier: IBarrier): void;
        scoreChange(change: number): void;
        hitpointsChange(change: number): void;
        changeGameState(state: GameState): void;
        dynamicLocations(): boolean;
    }
}

namespace StoryScript {
    export class GameService implements IGameService {
        private mediaTags = ['autoplay="autoplay"', 'autoplay=""', 'autoplay'];

        constructor(private _dataService: IDataService, private _locationService: ILocationService, private _characterService: ICharacterService, private _combinationService: ICombinationService, private _events: EventTarget, private _rules: IRules, private _helperService: IHelperService, private _game: IGame) {
        }

        init = (): void => {
            var self = this;
            self._game.helpers = self._helperService;

            if (self._rules.setupGame) {
                self._rules.setupGame(self._game);
            }

            self.setupGame();
            self._game.highScores = self._dataService.load<ScoreEntry[]>(StoryScript.DataKeys.HIGHSCORES);
            self._game.character = self._dataService.load<ICharacter>(StoryScript.DataKeys.CHARACTER);
            self._game.statistics = self._dataService.load<IStatistics>(StoryScript.DataKeys.STATISTICS) || self._game.statistics || {};
            self._game.worldProperties = self._dataService.load(StoryScript.DataKeys.WORLDPROPERTIES) || self._game.worldProperties || {};
            var locationName = self._dataService.load<string>(StoryScript.DataKeys.LOCATION);
            var characterSheet = self._rules.getCreateCharacterSheet && self._rules.getCreateCharacterSheet();
            var hasCreateCharacterSteps = characterSheet && characterSheet.steps && characterSheet.steps.length > 0;

            if (!hasCreateCharacterSteps && !self._game.character) {
                self._game.character = <ICharacter>{};
                locationName = 'Start';
            }

            if (self._game.character && locationName) {
                self.resume(locationName);
            }
            else {
                self._game.state = StoryScript.GameState.CreateCharacter;
            }
        }

        initTexts = (customTexts: IInterfaceTexts): IInterfaceTexts => {
            var self = this;
            var defaultTexts = new DefaultTexts();

            for (var n in defaultTexts.texts) {
                customTexts[n] = customTexts[n] ? customTexts[n] : defaultTexts.texts[n];
            }

            customTexts.format = defaultTexts.format;
            customTexts.titleCase = defaultTexts.titleCase;
            return customTexts;
        }

        reset = () => {
            var self = this;
            self._dataService.save(StoryScript.DataKeys.WORLD, {});
            self._locationService.init(self._game);
            self._game.worldProperties = self._dataService.load(StoryScript.DataKeys.WORLDPROPERTIES);
            var location = self._dataService.load<string>(StoryScript.DataKeys.LOCATION);

            if (location) {
                self._locationService.changeLocation(location, false, self._game);
            }
        }

        startNewGame = (characterData: any): void => {
            var self = this;
            self._game.character = self._characterService.createCharacter(self._game, characterData);
            self._dataService.save(StoryScript.DataKeys.CHARACTER, self._game.character);
            self.setupCharacter();
            self._game.changeLocation('Start');
            self._game.state = StoryScript.GameState.Play;
        }

        restart = (): void => {
            var self = this;
            self._dataService.save(StoryScript.DataKeys.CHARACTER, {});
            self._dataService.save(StoryScript.DataKeys.STATISTICS, {});
            self._dataService.save(StoryScript.DataKeys.LOCATION, '');
            self._dataService.save(StoryScript.DataKeys.PREVIOUSLOCATION, '');
            self._dataService.save(StoryScript.DataKeys.WORLDPROPERTIES, {});
            self._dataService.save(StoryScript.DataKeys.WORLD, {});
            self.init();
        }

        saveGame = (name?: string): void => {
            var self = this;

            if (name) {
                var saveGame = <ISaveGame>{
                    name: name,
                    character: self._game.character,
                    world: self._locationService.copyWorld(),
                    worldProperties: self._game.worldProperties,
                    statistics: self._game.statistics,
                    location: self._game.currentLocation.id,
                    previousLocation: self._game.previousLocation ? self._game.previousLocation.id : null,
                    state: self._game.state
                };

                self._dataService.save(StoryScript.DataKeys.GAME + '_' + name, saveGame);
            }
            else {
                SaveWorldState(self._dataService, self._locationService, self._game);
            }
        }

        loadGame = (name: string): void => {
            var self = this;
            var saveGame = self._dataService.load<ISaveGame>(StoryScript.DataKeys.GAME + '_' + name);

            if (saveGame) {
                self._game.loading = true;
                self._game.character = saveGame.character;

                self.setupCharacter();

                self._game.locations = saveGame.world;
                self._game.worldProperties = saveGame.worldProperties;
            
                self._locationService.init(self._game, false);
                self._game.currentLocation = self._game.locations.get(saveGame.location);

                if (saveGame.previousLocation) {
                    self._game.previousLocation = self._game.locations.get(saveGame.previousLocation);
                }

                SaveWorldState(self._dataService, self._locationService, self._game);
                self._dataService.save(StoryScript.DataKeys.LOCATION, self._game.currentLocation.id);
                self._game.actionLog = [];
                self._game.state = saveGame.state;

                setTimeout(() => {
                    self._game.loading = false;
                }, 0);
            }
        }

        getSaveGames = (): string[] => {
            var self = this;
            return self._dataService.getSaveKeys();
        }

        hasDescription = (type: string, item: { id?: string, description?: string }): boolean => {
            var self = this;
            return self._dataService.hasDescription(type, item);
        }

        getDescription = (type: string, entity: any, key: string): string => {
            var self = this;
            var description = entity && entity[key] ? entity[key] : null;

            if (!description) {
                self._dataService.loadDescription(type, entity);
                description = entity[key];
            }

            if (description) {
                self.processMediaTags(entity, key);
                description = self.processCodeFeatures(entity, description);
                self.processVisualFeatures(self._game);
            }

            return description;
        }

        initCombat = (): void => {
            var self = this;

            if (self._rules.initCombat) {
                self._rules.initCombat(self._game, self._game.currentLocation);
            }

            self._game.currentLocation.activeEnemies.forEach(enemy => {
                if (enemy.onAttack) {
                    enemy.onAttack(self._game);
                }
            });
        }

        fight = (enemy: IEnemy, retaliate?: boolean) => {
            var self = this;

            if (!self._rules || !self._rules.fight)
            {
                return;
            }

            self._rules.fight(self._game, enemy, retaliate);

            if (enemy.hitpoints <= 0) {
                self.enemyDefeated(enemy);
            }

            if (self._game.character.currentHitpoints <= 0) {
                self._game.state = StoryScript.GameState.GameOver;
            }

            self.saveGame();
        }

        useItem = (item: IItem): void => {
            var self = this;
            item.use(self._game, item);
        }

        executeBarrierAction = (destination: IDestination, barrier: IBarrier): void => {
            var self = this;

            // Todo: improve, use selected action as object.
            if (!barrier.actions || !barrier.actions.length) {
                return;
            }

            var action = barrier.actions.filter((item: IBarrierAction) => { return item.name == barrier.selectedAction.name; })[0];
            action.action(self._game, destination, barrier, action);
            barrier.actions.remove(action);

            if (barrier.actions.length) {
                barrier.selectedAction = barrier.actions[0];
            }

            self.saveGame();
        }

        scoreChange = (change: number): void => {
            var self = this;

            // Todo: change if xp can be lost.
            if (change > 0) {
                var character = self._game.character;
                var levelUp = self._rules && self._rules.scoreChange && self._rules.scoreChange(self._game, change);

                if (levelUp) {
                    self._game.state = StoryScript.GameState.LevelUp;
                }
            }
        }

        hitpointsChange = (change: number): void => {
            var self = this;

            if (self._rules.hitpointsChange) {
                self._rules.hitpointsChange(self._game, change);
            }
        }

        changeGameState = (state: GameState) => {
            var self = this;

            if (state == StoryScript.GameState.GameOver || state == StoryScript.GameState.Victory) {
                if (self._rules.determineFinalScore) {
                    self._rules.determineFinalScore(self._game);
                }
                self.updateHighScore();
                self._dataService.save(StoryScript.DataKeys.HIGHSCORES, self._game.highScores);
            }
        }

        dynamicLocations = (): boolean => {
            var self = this;
            return self._game.definitions.dynamicLocations;
        }

        private resume(locationName: string) {
            var self = this;

            self.setupCharacter();

            var lastLocation = self._game.locations.get(locationName);
            var previousLocationName = self._dataService.load<string>(StoryScript.DataKeys.PREVIOUSLOCATION);

            if (previousLocationName) {
                self._game.previousLocation = self._game.locations.get(previousLocationName);
            }

            // Reset loading descriptions so changes to the descriptions are shown right away instead of requiring a world reset.
            self.resetLoadedHtml(self._game.locations);
            self.resetLoadedHtml(self._game.character);

            self._locationService.changeLocation(lastLocation.id, false, self._game);

            self._game.state = StoryScript.GameState.Play;
        }

        private enemyDefeated(enemy: IEnemy) {
            var self = this;

            if (enemy.items) {
                enemy.items.forEach((item: IItem) => {
                    self._game.currentLocation.items.push(item);
                });

                enemy.items.length = 0;
            }

            self._game.character.currency = self._game.character.currency || 0;
            self._game.character.currency += enemy.currency || 0;
            self._game.statistics.enemiesDefeated = self._game.statistics.enemiesDefeated || 0;
            self._game.statistics.enemiesDefeated += 1;
            self._game.currentLocation.enemies.remove(enemy);

            if (self._rules.enemyDefeated) {
                self._rules.enemyDefeated(self._game, enemy);
            }

            if (enemy.onDefeat) {
                enemy.onDefeat(self._game);
            }
        }

        private setupGame(): void {
            var self = this;
            self.initLogs();
            self._game.fight = self.fight;

            // Add a string variant of the game state so the string representation can be used in HTML instead of a number.
            if (!(<any>self._game).stateString) {
                Object.defineProperty(self._game, 'stateString', {
                    enumerable: true,
                    get: function () {
                        return GameState[self._game.state];
                    }
                });
            }

            self.setupCombinations();
            self._locationService.init(self._game);
        }

        private initLogs() {
            var self = this;

            self._game.actionLog = [];
            self._game.combatLog = [];

            self._game.logToLocationLog = (message: string) => {
                self._game.currentLocation.log = self._game.currentLocation.log || [];
                self._game.currentLocation.log.push(message);
            }

            self._game.logToActionLog = (message: string) => {
                self._game.actionLog.splice(0, 0, message);
            }

            self._game.logToCombatLog = (message: string) => {
                self._game.combatLog.splice(0, 0, message);
            }
        }

        private setupCombinations() {
            var self = this;

            self._game.combinations = {
                activeCombination: null,
                tryCombine: (target: ICombinable): boolean => {
                    var result = self._combinationService.tryCombination(target);

                    if (typeof result === 'string') {
                        var evt = new Event('combinationFinished');
                        (<any>evt).combineText = result;
                        self._events.dispatchEvent(evt);
                        return true;
                    }

                    return false;
                },
                getCombineClass: (tool: ICombinable): string => {
                    return self._combinationService.getCombineClass(tool);
                }
            };
        }

        private setupCharacter(): void {
            var self = this;

            self._game.character.items = self._game.character.items || [];
            self._game.character.quests = self._game.character.quests || [];

            Object.defineProperty(self._game.character, 'combatItems', {
                get: function () {
                    return self._game.character.items.filter(e => { return e.useInCombat; });
                }
            });
        }

        private resetLoadedHtml(entity: any): void {
            var self = this;

            if (entity === null) {
                return;
            }

            if (entity.hasHtmlDescription) {
                if (entity.descriptions) {
                    entity.descriptions = null;
                    entity.text = null;
                }
                
                if (entity.description) {
                    entity.description = null;
                }

                if (entity.conversation && entity.conversation.nodes) {
                    entity.conversation.nodes = null;
                }
            }

            for (var i in Object.keys(entity))
            {
                var key = Object.keys(entity)[i];

                if (entity.hasOwnProperty(key)) {
                    var nestedEntity = entity[key];

                    if (typeof nestedEntity === 'object') {
                        this.resetLoadedHtml(entity[key]);
                    }
                }
            }
        }

        private processMediaTags(parent: any, key: string) {
            var self = this;
            var descriptionEntry = parent;
            var descriptionKey = key;
    
            // For locations, the descriptions collection must be updated as well as the text.
            if (parent === self._game.currentLocation) {
                var location = self._game.currentLocation;
                descriptionEntry = location.descriptions;
    
                for (let n in location.descriptions) {
                    if (location.descriptions[n] === location.text) {
                        descriptionKey = n;
                        break;
                    }
                }
            }

            if (descriptionKey !== key) {
                self.updateMediaTags(descriptionEntry, descriptionKey, self.mediaTags, '');
            }

            var startPlay = self.updateMediaTags(parent, key, self.mediaTags, 'added="added"');

            if (startPlay)
            {
                self.startPlay('audio', parent, key);
                self.startPlay('video', parent, key);
            }
        }

        private startPlay(type: string, parent: any, key: string): void {
            var self = this;

            setTimeout(function () {
                var mediaElements = document.getElementsByTagName(type);

                for (var i = 0; i < mediaElements.length; i++) {
                    var element = <HTMLMediaElement>mediaElements[i];
                    var added = element.getAttribute('added');

                    if (element.play && added === 'added') {
                        var loop = element.getAttribute('loop');

                        if (loop != null) {
                            self.updateMediaTags(parent, key, ['added="added"'], 'autoplay');
                        }
                        else {
                            self.updateMediaTags(parent, key, ['added="added"'], '');
                        }

                        // Chrome will block autoplay when the user hasn't interacted with the page yet, use this workaround to bypass that.
                        const playPromise = element.play();

                        if (playPromise !== null) {
                            playPromise.catch(() => { 
                                setTimeout(function () {
                                    element.play(); 
                                }, 1000);
                            });
                        }
                    }
                }
            }, 0);
        }

        private updateMediaTags(entity: any, key: string, tagToFind: string[], tagToReplace: string): boolean {
            let startPlay = false;
            var entry = entity[key];

            if (entry) {
                for (var i in tagToFind)
                {
                    var tag = tagToFind[i];

                    if (entry.indexOf(tag) > -1) {
                        entity[key] = entry.replace(tag, tagToReplace);
                        startPlay = true;
                    }
                }
            }

            return startPlay;
        }

        private processCodeFeatures(location: ICompiledLocation, description: string): string {
            if (location.features && location.features.length > 0) {
                var parser = new DOMParser();
                var htmlDoc = parser.parseFromString(description, 'text/html');

                var map = htmlDoc.getElementsByTagName("map")[0];

                if (map) {
                    var existingFeatures: string[] = [];
                    map.childNodes.forEach(n => { 
                        var name = <string>(<HTMLAreaElement>n).attributes['name'].nodeValue;

                        if (name) {
                            existingFeatures.push(name.toLowerCase());
                        }
                    });

                    location.features.forEach(f => {
                        if (f.shape && f.coords && existingFeatures.indexOf(f.id) < 0) {
                            var newNode = <HTMLAreaElement>document.createElement('area');
                            newNode.setAttribute('name', f.id);
                            newNode.setAttribute('shape', f.shape);
                            newNode.setAttribute('coords', f.coords);
                            description = description.replace('</map>', newNode.outerHTML + '</map>');
                        }
                    });
                }
            }

            return description;
        }

        private processVisualFeatures(game: IGame) {
            var self = this;

            // Get map, shape and coordinates information for image map features and add pictures for them.
            // For this to work, the description needs to be updated in the browser, hence the timeout.
            setTimeout(() => {
                var map = document.getElementsByTagName("map")[0];

                if (map) {
                    var mapName = map.attributes['name'] && map.attributes['name'].nodeValue;
                    var areaNodes = map.childNodes;

                    for (var f = 0; f < areaNodes.length; f++) {
                        const node = <HTMLAreaElement>areaNodes[f];
                        var nameAttribute = node.attributes['name'] && node.attributes['name'].nodeValue;

                        if (nameAttribute) {
                            var feature = game.currentLocation.features.get(nameAttribute);

                            if (feature) {
                                if (!node.hasChildNodes()) {
                                    var shapeAttribute = node.attributes['shape'] && node.attributes['shape'].nodeValue;
                                    var coordsAttribute = node.attributes['coords'] && node.attributes['coords'].nodeValue;
                                    feature.map = mapName;
                                    feature.coords = coordsAttribute;
                                    feature.shape = shapeAttribute;
                                    self.addFeaturePicture(feature, coordsAttribute, node);
                                }
                            }
                            else {
                                map.removeChild(node);
                            }
                        }
                    }
                }
            }, 0);
        }

        private addFeaturePicture(feature: IFeature, coordsAttribute: any, node: HTMLAreaElement) {
            if (!feature.picture) {
                return;
            }
    
            var image = document.createElement('img');
            var coords = coordsAttribute.split(",");
            var top = null, left = null;
    
            if (feature.shape.toLowerCase() === 'poly') {
                var x = [], y = [];
    
                for (var i = 0; i < coords.length; i++) {
                    var value = coords[i];
                    if (i % 2 === 0) {
                        x.push(value);
                    }
                    else {
                        y.push(value);
                    }
                }
    
                left = x.reduce(function (p, v) {
                    return (p < v ? p : v);
                });
                
                top = y.reduce(function (p, v) {
                    return (p < v ? p : v);
                });
            }
            else {
                left = coords[0];
                top = coords[1];
            }
    
            image.src = 'resources/' + feature.picture;
            image.style.position = 'absolute';
            image.style.top = top + 'px';
            image.style.left = left + 'px';
            node.appendChild(image);
        }

        private updateHighScore(): void {
            var self = this;
            var scoreEntry = { name: self._game.character.name, score: self._game.character.score };

            if (!self._game.highScores || !self._game.highScores.length) {
                self._game.highScores = [];
            }

            var scoreAdded = false;

            self._game.highScores.forEach((entry) => {
                if (self._game.character.score > entry.score && !scoreAdded) {
                    var index = self._game.highScores.indexOf(entry);

                    if (self._game.highScores.length >= 5) {
                        self._game.highScores.splice(index, 1, scoreEntry);
                    }
                    else {
                        self._game.highScores.splice(index, 0, scoreEntry);
                    }

                    scoreAdded = true;
                }
            });

            if (self._game.highScores.length < 5 && !scoreAdded) {
                self._game.highScores.push(scoreEntry);
            }

            self._dataService.save(StoryScript.DataKeys.HIGHSCORES, self._game.highScores);
        }
    }
}