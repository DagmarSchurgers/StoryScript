﻿namespace StoryScript {
    export function getPlural(name: string): string {
        return name.endsWith('y') ? 
                name.substring(0, name.length - 1) + 'ies' 
                : name.endsWith('s') ? 
                    name 
                    : name + 's';
    }

    export function getSingular(name: string): string {
        return name.endsWith('ies') ? 
                name.substring(0, name.length - 3) + 'y' 
                : name.substring(0, name.length - 1);
    }

    export function isEmpty(object: any, property?: string) {
        var objectToCheck = property ? object[property] : object;
        return objectToCheck ? Array.isArray(objectToCheck) ? objectToCheck.length === 0 : Object.keys(objectToCheck).length === 0 : true;
    }

    export function createReadOnlyCollection(entity: any, propertyName: string, collection: { id?: string, type?: string }[]) {
        Object.defineProperty(entity, propertyName, {
            enumerable: true,
            get: function () {
                return collection;
            },
            set: function () {
                var type = entity.type ? entity.type : null;
                var messageStart = 'Cannot set collection ' + propertyName;
                var message = type ? messageStart + ' on type ' + type : messageStart + '.';
                throw new Error(message);
            }
        });
    }

    export function getDefinitionKeys(definitions: IDefinitions) {
        var definitionKeys: string[] = [];

        for (var i in definitions) {
            if (i !== 'actions') {
                definitionKeys.push(i);
            }
        }

        return definitionKeys;
    }

    export function random<T>(type: string, definitions: IDefinitions, selector?: (item: T) => boolean): T {
        var collection = definitions[type];

        if (!collection) {
            return null;
        }

        var selection = getFilteredInstantiatedCollection<T>(collection, type, definitions, selector);

        if (selection.length == 0) {
            return null;
        }

        var index = Math.floor(Math.random() * selection.length);
        return selection[index];
    }

    export function randomList<T>(collection: T[] | ([() => T]), count: number, type: string, definitions: IDefinitions, selector?: (item: T) => boolean): ICollection<T> {
        var selection = getFilteredInstantiatedCollection<T>(collection, type, definitions, selector);
        var results = <ICollection<T>>[];

        if (count === undefined) {
            count = selection.length;
        }

        if (selection.length > 0) {
            while (results.length < count && results.length < selection.length) {
                var index = Math.floor(Math.random() * selection.length);

                if (results.indexOf(selection[index]) == -1) {
                    results.push(selection[index]);
                }
            }
        }

        return results;
    }

    export function find<T>(selector: string, type: string, definitions: IDefinitions): T {
        var collection = definitions[type];

        if (!collection && !selector) {
            return null;
        }

        var match = (<[() => T]>collection).filter((definition: () => T) => {
            return (<any>definition).name === selector;
        });

        return match[0] ? match[0]() : null;
    }

    export function custom<T>(definition: () => T, customData: {}): () => T {
        return (): T => {
            var instance = definition();
            return extend(instance, customData);
        };
    }

    export function equals<T>(entity: T, definition: () => T): boolean {
        return (<any>entity).id === (<any>definition).name;
    }

    // Taken from https://stackoverflow.com/questions/15308371/custom-events-model-without-using-dom-events-in-javascript.
    export function EventTarget(options: any): void {
        // Create a DOM EventTarget object
        var target = document.createTextNode(null);
        // Pass EventTarget interface calls to DOM EventTarget object
        this.addEventListener = target.addEventListener.bind(target);
        this.removeEventListener = target.removeEventListener.bind(target);
        this.dispatchEvent = target.dispatchEvent.bind(target);
    }

    function getFilteredInstantiatedCollection<T>(collection: T[] | (() => T)[], type: string, definitions: IDefinitions, selector?: (item: T) => boolean) {
        var collectionToFilter = <T[]>[]

        if (typeof collection[0] === 'function') {
            (<[() => T]>collection).forEach((def: () => T) => {
                collectionToFilter.push(def());
            });
        }
        else {
            collectionToFilter = <T[]>collection;
        }

        return selector ? collectionToFilter.filter(selector) : collectionToFilter;
    }

    function extend(target, source) {
        if (!source.length) {
            source = [source];
        }

        for (var i = 0, ii = source.length; i < ii; ++i) {
            var obj = source[i];

            if (!(obj !== null && typeof obj === 'object') && typeof obj !== 'function')
            {
                continue;
            }

            var keys = Object.keys(obj);
            
            for (var j = 0, jj = keys.length; j < jj; j++) {
                var key = keys[j];
                var src = obj[key];
                target[key] = src;
            }
        }

        return target;
    }
}