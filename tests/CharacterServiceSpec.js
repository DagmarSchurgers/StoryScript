describe("CharacterService", function() {

    beforeEach(() => {
        // Trigger object factory initialization.
        StoryScript.ObjectFactory.GetGame();
    });

    it("should return the properties defined for the character sheet", function() {
        var service = getService();
        var result = service.getSheetAttributes().sort();
        var expected = sheetAttributes.sort();
        expect(result).toEqual(expected);
    });

    it("should set the first step of the character sheet as the selected step when starting character creation", function() {    
        var game = {};

        var service = getService(game);
        var result = service.setupCharacter();
        var gameSheet = game.createCharacterSheet;
        var createSheet = new MyNewGame.Rules().getCreateCharacterSheet();
        createSheet.currentStep = 0;

        // Remove the next step function from the object for comparison.
        var nextStep = result.nextStep;
        delete result.nextStep;

        expect(result).toEqual(createSheet);
        expect(gameSheet).toEqual(createSheet);

        // Trigger the next step in the sheet to set the selected entry for the question.
        nextStep(result);

        expect(result.steps[1].questions[0].selectedEntry).toEqual(createSheet.steps[1].questions[0].entries[0]);
    });

    it("should set the first step of the level up sheet as the selected step preparing level up", function() {
        var rules = {
            getLevelUpSheet: function() {
                return levelUpSheet
            }
        };

        var game = {};

        var service = getService(game, rules);
        var result = service.setupLevelUp();
        var gameSheet = game.createCharacterSheet;

        expect(result).toBe(levelUpSheet);
        expect(gameSheet).toBe(levelUpSheet);
        expect(result.steps[0].questions[0].selectedEntry).toBe(levelUpSheet.steps[0].questions[0].entries[0]);
    });

    it("should move an equipped item back to the backpack when equipping an item of the same type", function() {
        var game = {
            character: {
                equipment: {},
                items: []
            }
        }
        var service = getService(game);
        var equippedBoots = MyNewGame.Items.LeatherBoots();
        var backPackBoots = MyNewGame.Items.LeatherBoots();
        game.character.equipment.feet = equippedBoots;
        game.character.items.push(backPackBoots);
        service.equipItem(backPackBoots);

        expect(game.character.equipment.feet).not.toBeNull();
        expect(game.character.equipment.feet).toBe(backPackBoots);

        expect(game.character.items.length).toBe(1);
        expect(game.character.items[0]).toBe(equippedBoots); 
    });

    var sheetAttributes = [
        'strength',
        'agility',
        'intelligence'
    ];

    var levelUpSheet = {
        steps: [
            {
                questions: [
                    {
                        question: 'Gaining more experience, you become...',
                        entries: [
                            {
                                text: 'Stronger',
                                value: 'strength',
                                bonus: 1
                            },
                            {
                                text: 'Faster',
                                value: 'agility',
                                bonus: 1
                            },
                            {
                                text: 'Smarter',
                                value: 'intelligence',
                                bonus: 1
                            }
                        ]
                    }
                ]
            }
        ]
    };

    function getService(game, rules) {
        return new StoryScript.CharacterService({}, game || {}, rules || new MyNewGame.Rules());
    }

});