namespace StoryScript {
    function CreateObject<T>(entity: T, type: string)
    {
        var definitions = window.StoryScript.ObjectFactory.GetDefinitions();
        var error = new Error();
        var stack = error.stack.split('\n');

        // Skip the stack lines Error, at CreateObject and the first at {type}, e.g. at Item.
        for (var i = 3; i < stack.length; i++) {
            var line = stack[i];
            var functionName = line.trim().split(' ')[1];
            functionName = functionName.replace('Object.', '');
            
            if (['Location', 'Item', 'Key', 'Enemy', 'Person'].indexOf(functionName) < 0) {
                (<any>entity).id = functionName;
                break;
            }
        }

        addFunctionIds(entity, type, getDefinitionKeys(definitions));

        // Add the type to the object so we can distinguish between them in the combine functionality.
        (<any>entity).type = GetPlural(type);
        return entity;
    }

    export function Location<T extends ILocation>(entity: T): T {
        var definitions = window.StoryScript.ObjectFactory.GetDefinitions();
        var location = CreateObject(entity, 'location');

        if (location.destinations) {
            location.destinations.forEach(d => {
                if (d.barrier && d.barrier.key && typeof(d.barrier.key) === 'function') {
                    d.barrier.key = d.barrier.key();
                }
            });
        }

        if (!definitions.dynamicLocations && !location.destinations) {
            console.log('No destinations specified for location ' + location.name);
        }

        setRuntimeProperties(location, 'location');

        return location;
    }

    export function Enemy<T extends IEnemy>(entity: T, type?: string): T {
        var enemy = CreateObject(entity, type || 'enemy');
        compileCombinations(enemy);
        setRuntimeProperties(enemy, 'enemy');
        return enemy;
    }

    export function Person<T extends IPerson>(entity: T): T {
        var person = Enemy(entity, 'person');
        createReadOnlyCollection(person, 'quests', <any>person.quests || []);
        return person;
    }

    export function Item<T extends IItem>(entity: T): T {
        var item = CreateObject(entity, 'item');
        compileCombinations(item);
        setRuntimeProperties(item, 'item');
        return item;
    }

    export function Key<T extends IKey>(entity: T): T {
        return Item(entity);
    }

    export function Feature<T extends IFeature>(entity: T): IFeature {
        entity.id = entity.name.toLowerCase().replace(/\s/g,'');
        return entity;
    }

    export function Quest<T extends IQuest>(entity: T): T {
        var item = CreateObject(entity, 'quest');
        setRuntimeProperties(item, 'quest');
        return item;
    }

    export function setRuntimeProperties(entity: any, type: string) {
        if (type === 'item' || type === 'enemy' || type === 'person') {
            var combinable = <ICombinable>entity;
            
            if (combinable.combinations)
            {
                createReadOnlyCollection(combinable.combinations, 'combine', combinable.combinations.combine || []);
            }
        }

        if (type === 'enemy' || type === 'person') {
            var enemy = <IEnemy>entity;
            createReadOnlyCollection(enemy, 'items', <any>enemy.items || []);
        }

        if (type ==='location') {
            var location = <ICompiledLocation>entity;

            createReadOnlyCollection(location, 'features', location.features || <any>[]);
            createReadOnlyCollection(location, 'actions', <any>location.actions || []);
            createReadOnlyCollection(location, 'combatActions', <any>location.combatActions || []);
            createReadOnlyCollection(location, 'persons', location.persons || <any>[]);
            createReadOnlyCollection(location, 'enemies', location.enemies || <any>[]);
            createReadOnlyCollection(location, 'items', location.items || <any>[]);
    
            createActiveCollections(location);
        }
    }

    export function addFunctionIds(entity: any, type: string, definitionKeys: string[], path?: string) {
        if (!path) {
            path = entity.id || entity.name;
        }

        for (var key in entity) {
            if (!entity.hasOwnProperty(key)) {
                continue;
            }

            if (definitionKeys.indexOf(key) != -1 || key === 'target') {
                continue;
            }

            var value = entity[key];

            if (value == undefined) {
                return;
            }
            else if (typeof value === "object") {
                addFunctionIds(entity[key], type, definitionKeys, getPath(value, key, path, definitionKeys));
            }
            else if (typeof value === 'function' && !value.isProxy) {
                var functionId = path ? path + '_' + key : key;
                value.functionId = 'function#' + type + '_' + functionId + '#' + createFunctionHash(value);
            }
        }
    }

    function getPath(value, key: string, path: string, definitionKeys: string[]): string {
        if (definitionKeys.indexOf(key) != -1) {
            path = key;
        }
        else if (definitionKeys.indexOf(path) != -1 && !isNaN(parseInt(key))) {

        }
        else {
            path = path === undefined ? key : path + '_' + key;
        }

        if (value.id) {
            path = path + '_' + value.id;
        }

        return path;
    }

    function compileCombinations(entry: ICombinable) {
        if (entry.combinations) {
            var combines = <ICombine<() => ICombinable>[]>[];
            var failText = entry.combinations.failText;

            entry.combinations.combine.forEach((combine: ICombine<() => ICombinable>) => {
                var compiled = combine;
                compiled.tool = compiled.tool && (<any>compiled.tool).name;
                combines.push(compiled);
            });

            entry.combinations.combine = combines;
            entry.combinations.failText = failText;
            createReadOnlyCollection(entry.combinations, 'combine', combines);
        }
    }

    function createActiveCollections(location: ICompiledLocation) {
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
    }
}