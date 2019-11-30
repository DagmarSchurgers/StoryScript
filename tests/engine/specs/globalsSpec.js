describe("Utilities", function() {

    beforeEach(() => {
        // Trigger object factory initialization.
        StoryScript.ObjectFactory.GetGame();
    });

    it("named functions should have a name property", function() {
        StoryScript.addFunctionExtensions();

        function MyFunction() {
        };

        var result = MyFunction.name;
        expect(result).toEqual('MyFunction');
    });

    it("should create a proxy that is called when calling the function and is identifiable as a proxy", function() {
        StoryScript.addFunctionExtensions();

        function MyFunction(x, y) {
            return x + y;
        };

        function AddOn(myScope, myFunction, x, y, z) {
            var myFunctionResult = myFunction(x, y);
            return myFunctionResult * z;
        }

        MyFunction = MyFunction.proxy(AddOn, 5);
        var result = MyFunction(2, 6);

        expect(result).toEqual(40);
        expect(MyFunction.proxy).toBeTruthy();
    });

    it("Deserializing function should get working function", function() {
        StoryScript.addFunctionExtensions();

        var functionString = 'function MyFunction(x, y) { return x + y; }';
        var myFunction = functionString.parseFunction();
        var result = myFunction(2, 3);
        
        expect(result).toEqual(5);
    });

    it("Deserializing a multiline function should get a working function", function() {
        StoryScript.addFunctionExtensions();

        var functionString = `function MyFunction(x, y) { 
                                return x + y; 
                            }`;
                            
        var myFunction = functionString.parseFunction();
        var result = myFunction(2, 3);
        
        expect(result).toEqual(5);
    });

    it("Creating a function hash should get a unique hash for each function", function() {
        function FirstFunction(x, y) { return x + y; };
        function SecondFunction(x, y) { if (x === null && y === null) { return null; } else { return x > y; } };
        var firstFunctionHash = StoryScript.createFunctionHash(FirstFunction);
        var secondFunctionHash = StoryScript.createFunctionHash(SecondFunction);

        expect(firstFunctionHash).toEqual(-601740997);
        expect(secondFunctionHash).toEqual(-2091158808);
        expect(firstFunctionHash).not.toEqual(secondFunctionHash);
    });

    it("should get an entity using the function name", function() {
        StoryScript.addArrayExtensions();
        var testArray = getTestArray();
        var result = testArray.get(_TestGame.Items.Journal);

        expect(result).not.toBeNull();
        expect(compareId(result.id, _TestGame.Items.Journal)).toBeTruthy();
    });

    it("should get an entity using an id string", function() {
        StoryScript.addArrayExtensions();
        var testArray = getTestArray();
        var result = testArray.get(_TestGame.Items.Journal.name || _TestGame.Items.Journal.originalFunctionName);

        expect(result).not.toBeNull();
        expect(compareId(result.id, _TestGame.Items.Journal)).toBeTruthy();
    });

    it("should not get an entity when passing in a new object", function() {
        StoryScript.addArrayExtensions();
        var testArray = getTestArray();
        var result = testArray.get(_TestGame.Items.Journal());

        expect(result).toBeUndefined();
    });

    it("should get the first entity in the array when no parameter is passed", function() {
        StoryScript.addArrayExtensions();
        var testArray = getTestArray();
        var result = testArray.get();

        expect(result).not.toBeUndefined();
        expect(compareId(result.id, _TestGame.Items.Sword)).toBeTruthy();
    });

    it("should get an entity using its object reference", function() {
        StoryScript.addArrayExtensions();
        var journal = _TestGame.Items.Journal();

        var testArray = [
            _TestGame.Items.Sword(),
            journal
        ];
        var result = testArray.get(journal);

        expect(result).not.toBeUndefined();
        expect(result).toBe(journal);
    });

    it("should get a destination matching a string id to the destination target", function() {
        StoryScript.addArrayExtensions();
        var gardenDestination = {
            name: 'To the garden',
            target: 'Garden'
        };

        var testArray = [
            {
                name: 'To the bedroom',
                target: 'Bedroom'
            },
            gardenDestination
        ];
        var result = testArray.get(gardenDestination.target);

        expect(result).not.toBeUndefined();
        expect(result).toBe(gardenDestination);
    });

    it("should get a destination matching a function to the destination target", function() {
        StoryScript.addArrayExtensions();
        function Garden() {};           

        var testArray = [
            {
                name: 'To the bedroom',
                target: 'Bedroom'
            },
            {
                name: 'To the garden',
                target: 'Garden'
            }
        ];
        var result = testArray.get(Garden);

        expect(result).not.toBeUndefined();
        expect(compareId(result.target, Garden.name || Garden.originalFunctionName)).toBeTruthy();
    });

    it("should get all entities in the array matching the id", function() {
        StoryScript.addArrayExtensions();
        var testArray = [
            _TestGame.Items.Sword(),
            _TestGame.Items.Sword()
        ];;
        var result = testArray.all(_TestGame.Items.Sword);

        expect(result).not.toBeUndefined();
        expect(result.length).toBe(2);
        expect(compareId(result[0].id, _TestGame.Items.Sword)).toBeTruthy();
        expect(compareId(result[1].id, _TestGame.Items.Sword)).toBeTruthy();
    });

    it("should remove an entity using the function name", function() {
        StoryScript.addArrayExtensions();
        var testArray = getTestArray();
        testArray.remove(_TestGame.Items.Journal);

        expect(testArray.length).toBe(1);
        expect(compareId(testArray[0].id, _TestGame.Items.Sword)).toBeTruthy();
    });

    it("should remove an entity using an id string", function() {
        StoryScript.addArrayExtensions();
        var testArray = getTestArray();
        testArray.remove(_TestGame.Items.Journal.name || _TestGame.Items.Journal.originalFunctionName);

        expect(testArray.length).toBe(1);
        expect(compareId(testArray[0].id, _TestGame.Items.Sword)).toBeTruthy();
    });

    it("should not remove an entity when passing in a new object", function() {
        StoryScript.addArrayExtensions();
        var testArray = getTestArray();
        testArray.remove(_TestGame.Items.Journal());

        expect(testArray.length).toBe(2);
        expect(compareId(testArray[1].id, _TestGame.Items.Journal)).toBeTruthy();
    });

    it("should remove an entity using its object reference", function() {
        StoryScript.addArrayExtensions();
        var journal = _TestGame.Items.Journal();
        var testArray = [
            _TestGame.Items.Sword(),
            journal
        ];
        testArray.remove(journal);

        expect(testArray.length).toBe(1);
        expect(compareId(testArray[0].id, _TestGame.Items.Sword)).toBeTruthy();
    });

    it("should remove a destination using the string id of the destination", function() {
        StoryScript.addArrayExtensions();
        var gardenDestination = {
            name: 'To the garden',
            target: 'Garden'
        };

        var testArray = [
            {
                name: 'To the bedroom',
                target: 'Bedroom'
            },
            gardenDestination
        ];
        testArray.remove(gardenDestination.target);

        expect(testArray.length).toBe(1);
        expect(testArray[0].target).toBe('Bedroom');
    });

    it("should remove a destination using the function of the destination", function() {
        StoryScript.addArrayExtensions();
        function Garden() {};     
        var testArray = [
            {
                name: 'To the bedroom',
                target: 'Bedroom'
            },
            {
                name: 'To the garden',
                target: 'Garden'
            }
        ];
        testArray.remove(Garden);

        expect(testArray.length).toBe(1);
        expect(testArray[0].target).toBe('Bedroom');
    });

    it("should remove nothing when no parameter is passed", function() {
        StoryScript.addArrayExtensions();
        var testArray = getTestArray();
        testArray.remove();

        expect(testArray.length).toBe(2);
    });

    it("should return correct results when comparing strings", function() {
        expect(StoryScript.compareString(undefined, undefined)).toBeTruthy();
        expect(StoryScript.compareString(null, null)).toBeTruthy();
        expect(StoryScript.compareString(null, undefined)).toBeFalsy();
        expect(StoryScript.compareString(undefined, null)).toBeFalsy();
        expect(StoryScript.compareString('', null)).toBeFalsy();
        expect(StoryScript.compareString(null, '')).toBeFalsy();
        expect(StoryScript.compareString('', '')).toBeTruthy();
        expect(StoryScript.compareString('Test', 'test')).toBeTruthy();
        expect(StoryScript.compareString('Test', 'TEST')).toBeTruthy();
    });

    function getTestArray() {
        return [
            _TestGame.Items.Sword(),
            _TestGame.Items.Journal()
        ];
    }

    function compareId(id, func) {
        var name = func.name || func.originalFunctionName || func;
        return id.toLowerCase() === name.toLowerCase();
    }
});