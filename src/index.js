const {
    RussianRouter,
    utils
} = require('russian-router');

const Protocol = utils.getPartConstructor('protocol');
const Domain = utils.getPartConstructor('domain');
const Port = utils.getPartConstructor('port');
const Path = utils.getPartConstructor('path');
const navigationKey = 0;

let routesCache = new Map();
let optionsCache = new Map();

module.exports = class ServerRussianRouter extends RussianRouter {
    constructor (rawRoutes, rawOptions, request) {
        super(...arguments);

        let [path, ...query] = request.url.split('?');
        query = query.join(encodeURIComponent('?'));
        const currentUri = {
            protocol: request.connection.encrypted ? 'https' : 'http',
            domain: (request.headers ? request.headers.host : request.get('host')).replace(/:\d+$/, ''),
            port: request.socket.address().port,
            path,
            query,
            hash: ''
        };
        this._currentUri = currentUri;

        const rawUri = currentUri.protocol + '://' + currentUri.domain + ':' + currentUri.port + request.url;
        const matchObjects = this.matchUri(rawUri).map((matchObject) => {
            return Object.assign(matchObject, {
                key: this._extractKey(matchObject)
            });
        });
        this._matchObjects = matchObjects;
    }

    getDefaultPart (partName) {
        const currentUri = this._currentUri;
        switch (partName) {
            case 'protocol':
                return new Protocol(currentUri.protocol);
            case 'domain':
                return new Domain(currentUri.domain);
            case 'port':
                return new Port(+currentUri.port || utils.getPortByProtocol(currentUri.protocol));
            default:
                return super.getDefaultPart(...arguments);
        }
    }

    resolveUri (rawUri) {
        const currentUri = this._currentUri;
        const splittedUri = utils.splitUri(rawUri, utils.getRegExp('uri'));
        const path = new Path(splittedUri.path);
        if (splittedUri.protocol || splittedUri.domain || splittedUri.port || path.isAbsolute()) {
            return rawUri;
        } else {
            let absoluteUri = currentUri.path;
            const isPathEmpty = !path.toString();
            if (!isPathEmpty) {
                absoluteUri = currentUri.path.replace(/\/$/, '') + '/' + path.toString();
            }
            if (splittedUri.query) {
                absoluteUri += '?' + splittedUri.query;
            } else if (isPathEmpty) {
                absoluteUri += (currentUri.query ? '?' : '') + currentUri.query;
            }
            if (splittedUri.hash) {
                absoluteUri += '#' + splittedUri.hash;
            }
            return absoluteUri;
        }
    }

    matchUri (rawUri, ...restArguments) {
        return super.matchUri(this.resolveUri(rawUri), ...restArguments);
    }

    generateUri () {
        return this.resolveUri(super.generateUri(...arguments));
    }

    getMatchObjects () {
        return this._matchObjects;
    }

    getNavigationKey () {
        return navigationKey;
    }

    _parseOptions (rawOptions) {
        if (optionsCache.has(rawOptions)) {
            return optionsCache.get(rawOptions);
        }
        const parsedOptions = super._parseOptions(...arguments);
        optionsCache.set(rawOptions, parsedOptions);
        return parsedOptions;
    }

    _parseRoutes (rawRoutes) {
        if (routesCache.has(rawRoutes)) {
            return routesCache.get(rawRoutes);
        }
        const parsedRoutes = super._parseRoutes(...arguments);
        routesCache.set(rawRoutes, parsedRoutes);
        return parsedRoutes;
    }

    _extractKey (matchObject) {
        if (typeof matchObject.key === 'function') {
            return 'User/' + matchObject.key(matchObject, navigationKey);
        } else if (matchObject.key) {
            return ('User/' + matchObject.key).replace(/{key}/g, navigationKey);
        } else {
            return 'RussianRouter/' + matchObject.name;
        }
    }

    static resetOptionsCache () {
        optionsCache = new Map();
    }

    static resetRoutesCache () {
        routesCache = new Map();
    }
};
