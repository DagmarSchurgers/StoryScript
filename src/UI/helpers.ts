const _templates = new Map<string, string>();

export function getTemplate(componentName: string, defaultTemplate?: any): string {
    if (_templates.size === 0) {
        var componentRegex = /\/[a-z_A-Z]{2,}\.component\.html$/;

        // Todo: when the components folder is missing, this fails!
        var r = require.context('game/ui/components', false, /.component.html$/);

        r.keys().map(i => {
            var match = componentRegex.exec(i);

            if (match) {
                _templates.set(match[0].substring(1, match[0].indexOf('.')), r(i).default);
            }
        });
    }

    return _templates.get(componentName) || defaultTemplate?.default;
}