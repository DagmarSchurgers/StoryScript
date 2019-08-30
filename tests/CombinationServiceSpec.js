describe("CombinationService", function() {

    it("should return the combinations defined for the game", function() {
        var service = getService();
        var result = service.getCombinationActions();
        var names = result.map(c => c.text);
        expect(names).toEqual(combinationActionNames);
    });

    describe("Combination css class", function() {

        it("should return an empty string for a class when there is no active combination and no tool", function() {
            var service = getService({
                combinations: {}
            });
            var result = service.getCombineClass();
            expect(result).toBe('');
        });

        it("should return the hiding class when there is an active combination and no tool", function() {
            var service = getService({
                combinations: {
                    activeCombination: {}
                }
            });
            var result = service.getCombineClass();
            expect(result).toBe('combine-active-hide');
        });

        it("should return an empty string for a class when there is a tool but no active combination", function() {
            var service = getService({
                combinations: {
                }
            });
            var result = service.getCombineClass({});
            expect(result).toBe('');
        });

        it("should return the selectable class when there is a tool and an active combination but without a tool match", function() {
            var service = getService({
                combinations: {
                    activeCombination: {}
                }
            });
            var result = service.getCombineClass({});
            expect(result).toBe('combine-selectable');
        });

        it("should return the selected class when there is a tool and an active combination that has a tool with the same id", function() {
            var service = getService({
                combinations: {
                    activeCombination: {
                        selectedTool: {
                            id: 'test'
                        }
                    }
                }
            });
            var result = service.getCombineClass({ id: 'test' });
            expect(result).toBe('combine-active-selected');
        });

    });

    describe("Trying combinations", function() {

        it("should return false when no target is passed and no default action is defined", function() {
            var game = getGame();
            var service = getService(game);
            var result = service.tryCombination();
            expect(result.success).toBeFalsy();
        });

        it("should return false when a target is passed and no default action is defined", function() {
            var game = getGame();
            var service = getService(game);
            var result = service.tryCombination();
            expect(result.success).toBeFalsy();
        });

    });

    var combinationActionNames = [
        'Use',
        'Look',
        'Pull',
        'Push'
    ];

    function getService(game) {
        return new StoryScript.CombinationService({}, {}, game, new _TestGame.Rules(), {});
    }

    function getGame() {
        return {
            combinations: {
                activeCombination: {
                    
                }
            }
        };
    }
});