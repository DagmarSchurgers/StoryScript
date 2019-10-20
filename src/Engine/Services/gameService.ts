﻿namespace StoryScript {
    export class CombinationFinishedEvent extends Event {
        constructor() {
            super('combinationFinished');
        }

        combineText: string;
        featuresToRemove: string[];
    }

    export interface IGameService {
        init(): void;
        startNewGame(characterData: any): void;
        levelUp(sheet: ICreateCharacter): ICharacter;
        reset(): void;
        restart(skipIntro?: boolean): void;
        saveGame(name?: string): void;
        getSaveGames(): string[];
        loadGame(name: string): void;
        hasDescription(type: string, item: { id?: string, description?: string }): boolean;
        getDescription(type: string, entity: any, key: string): string;
        initCombat(): void;
        fight(enemy: IEnemy, retaliate?: boolean): void;
        useItem(item: IItem): void;
        executeBarrierAction(barrier: IBarrier, destination: IDestination): void;
        getCurrentMusic(): string;
    }
}

namespace StoryScript {
    export class GameService implements IGameService {
        private mediaTags = ['autoplay="autoplay"', 'autoplay=""', 'autoplay'];
        private _musicStopped: boolean = false;

        constructor(private _dataService: IDataService, private _locationService: ILocationService, private _characterService: ICharacterService, private _combinationService: ICombinationService, private _events: EventTarget, private _rules: IRules, private _helperService: IHelperService, private _game: IGame, private _texts: IInterfaceTexts) {
        }

        init = (skipIntro?: boolean): void => {
            var self = this;
            self._game.helpers = self._helperService;

            if (self._rules.setup && self._rules.setup.setupGame) {
                self._rules.setup.setupGame(self._game);
            }

            self.setupGame();
            self.initTexts();
            self._game.highScores = self._dataService.load<ScoreEntry[]>(StoryScript.DataKeys.HIGHSCORES);
            self._game.character = self._dataService.load<ICharacter>(StoryScript.DataKeys.CHARACTER);
            self._game.statistics = self._dataService.load<IStatistics>(StoryScript.DataKeys.STATISTICS) || self._game.statistics || {};
            self._game.worldProperties = self._dataService.load(StoryScript.DataKeys.WORLDPROPERTIES) || self._game.worldProperties || {};
            
            if (!self._game.character && self._rules.setup.intro && !skipIntro) {
                self._game.state = StoryScript.GameState.Intro;
                return;
            }
            
            var locationName = self._dataService.load<string>(StoryScript.DataKeys.LOCATION);
            var characterSheet = self._rules.character.getCreateCharacterSheet && self._rules.character.getCreateCharacterSheet();
            var hasCreateCharacterSteps = characterSheet && characterSheet.steps && characterSheet.steps.length > 0;

            if (!hasCreateCharacterSteps && !self._game.character) {
                self.createCharacter(<ICharacter>{});
                locationName = 'Start';
            }

            if (self._game.character && locationName) {
                self.initSetInterceptors();
                self.resume(locationName);
            }
            else {
                self._game.state = StoryScript.GameState.CreateCharacter;
            }
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
            self.createCharacter(characterData);

            if (self._rules.setup.gameStart) {
                self._rules.setup.gameStart(self._game);
            }

            if (!self._game.currentLocation) {
                self._game.changeLocation('Start');
            }

            self.initSetInterceptors();

            self._game.state = StoryScript.GameState.Play;
            self.saveGame();
        }

        levelUp = (sheet: ICreateCharacter): ICharacter => {
            var self = this;
            var levelUpResult = self._characterService.levelUp(self._game, sheet);
            self.saveGame();
            return levelUpResult;
        }

        restart = (skipIntro?: boolean): void => {
            var self = this;
            self._dataService.save(StoryScript.DataKeys.CHARACTER, {});
            self._dataService.save(StoryScript.DataKeys.STATISTICS, {});
            self._dataService.save(StoryScript.DataKeys.LOCATION, '');
            self._dataService.save(StoryScript.DataKeys.PREVIOUSLOCATION, '');
            self._dataService.save(StoryScript.DataKeys.WORLDPROPERTIES, {});
            self._dataService.save(StoryScript.DataKeys.WORLD, {});
            self.init(skipIntro);
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
                    location: self._game.currentLocation && self._game.currentLocation.id,
                    previousLocation: self._game.previousLocation ? self._game.previousLocation.id : null,
                    state: self._game.state
                };

                self._dataService.save(StoryScript.DataKeys.GAME + '_' + name, saveGame);

                if ( self._game.playState === PlayState.Menu) {
                    self._game.playState = null;
                }
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

                self.initSetInterceptors();
                
                if ( self._game.playState === PlayState.Menu) {
                    self._game.playState = null;
                }

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
            }

            return description;
        }

        initCombat = (): void => {
            var self = this;

            if (self._rules.combat && self._rules.combat.initCombat) {
                self._rules.combat.initCombat(self._game, self._game.currentLocation);
            }

            self._game.currentLocation.activeEnemies.forEach(enemy => {
                if (enemy.onAttack) {
                    enemy.onAttack(self._game);
                }
            });
        }

        fight = (enemy: IEnemy, retaliate?: boolean) => {
            var self = this;

            if (!self._rules.combat || !self._rules.combat.fight)
            {
                return;
            }

            self._rules.combat.fight(self._game, enemy, retaliate);

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

        executeBarrierAction = (barrier: IBarrier, destination: IDestination, ): void => {
            var self = this;

            if (isEmpty(barrier.actions)) {
                return;
            }

            var actionIndex = barrier.actions.indexOf(barrier.selectedAction);
            barrier.selectedAction.execute(self._game, barrier, destination);
            barrier.actions.splice(actionIndex, 1);

            if (barrier.actions.length) {
                barrier.selectedAction = barrier.actions[0];
            }

            self.saveGame();
        }

        getCurrentMusic = (): string => {
            var self = this;
            var currentEntry = !self._musicStopped && self._rules.setup.playList && self._rules.setup.playList.filter(e => self._game.playState ? e[0] === self._game.playState : e[0] === self._game.state)[0];
            return currentEntry && <string>currentEntry[1];
        }

        startMusic = (): void => {
            var self = this;
            self._musicStopped = false;
        }

        stopMusic = (): void => {
            var self = this;
            self._musicStopped = true;
        }

        private initTexts(): void {
            var self = this;
            var defaultTexts = new DefaultTexts();

            for (var n in defaultTexts.texts) {
                self._texts[n] = self._texts[n] ? self._texts[n] : defaultTexts.texts[n];
            }

            self._texts.format = defaultTexts.format;
            self._texts.titleCase = defaultTexts.titleCase;
        }

        private resume(locationName: string) {
            var self = this;
            var lastLocation = self._game.locations.get(locationName) || self._game.locations.get('start');
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

        private createCharacter(characterData : ICharacter) {
            var self = this;
            var character = self._characterService.createCharacter(self._game, characterData);
            character.items = character.items || [];
            character.quests = character.quests || [];
            self._dataService.save(StoryScript.DataKeys.CHARACTER, character);
            self._game.character = self._dataService.load(StoryScript.DataKeys.CHARACTER);
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

            if (self._rules.combat && self._rules.combat.enemyDefeated) {
                self._rules.combat.enemyDefeated(self._game, enemy);
            }

            if (enemy.onDefeat) {
                enemy.onDefeat(self._game);
            }
        }

        private setupGame(): void {
            var self = this;
            self.initLogs();
            self._game.fight = self.fight;
            self._game.sounds = { 
                startMusic: self.startMusic,
                stopMusic: self.stopMusic
            };

            self.setupCombinations();
            self._locationService.init(self._game);

            self._game.changeLocation = (location, travel) => 
            { 
                self._locationService.changeLocation(location, travel, self._game);

                if (travel) {
                    self.saveGame();
                }
            };
        }

        private initSetInterceptors(): void {
            var self = this;

            let currentHitpoints = self._game.character.currentHitpoints || self._game.character.hitpoints;
            let score = self._game.character.score || 0;
            let gameState = self._game.state;

            Object.defineProperty(self._game.character, 'currentHitpoints', {
                get: function() {
                    return currentHitpoints;
                },
                set: function (value) {
                    var change = value - currentHitpoints;
                    currentHitpoints = value;

                    if (self._rules.character.hitpointsChange) {
                        self._rules.character.hitpointsChange(self._game, change);
                    }
                }
            });

            if (!self._game.character.score) {
                Object.defineProperty(self._game.character, 'score', {
                    get: function() {
                        return score;
                    },
                    set: function (value) {
                        var change = value - score;
                        score = value;

                        // Change when xp can be lost.
                        if (change > 0) {
                            var levelUp = self._rules.general && self._rules.general.scoreChange && self._rules.general.scoreChange(self._game, change);
            
                            if (levelUp) {
                                self._game.state = StoryScript.GameState.LevelUp;
                            }
                        }
                    }
                });
            }
     
            if (!self._game.state) {
                Object.defineProperty(self._game, 'state', {
                    get: function()
                    {
                        return gameState;
                    },
                    set: function (state) {
                        if (state === GameState.GameOver || state === GameState.Victory) {
                            self._game.playState = null;

                            if (self._rules.general && self._rules.general.determineFinalScore) {
                                self._rules.general.determineFinalScore(self._game);
                            }
                            
                            self.updateHighScore();
                            self._dataService.save(StoryScript.DataKeys.HIGHSCORES, self._game.highScores);
                        }

                        gameState = state;
                    }
                });
            }
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
                    var activeCombo = self._game.combinations.activeCombination;
                    var result = self._combinationService.tryCombination(target);

                    if (result.text) {
                        var evt = new CombinationFinishedEvent();
                        evt.combineText = result.text;

                        if (result.success) {
                            evt.featuresToRemove = [];

                            if (result.removeTarget) {
                                evt.featuresToRemove.push(target.id);
                            }

                            if (result.removeTool) {
                                evt.featuresToRemove.push(activeCombo.selectedTool.id);
                            }
                        }

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