import { ObjectFactory } from './ObjectFactory';

interface String {
    parseFunction: Function;
}

interface Function {
    proxy: Function;
    isProxy: boolean;

    // A workaround for Edge, in which making a proxy a named function doesn't work. 
    originalFunctionName: string;
}

interface Window {
    StoryScript: {
        ObjectFactory: ObjectFactory;
        GetGameDescriptions(): Map<string, string>;
    }
}