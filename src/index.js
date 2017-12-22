const {
    RussianRouter,
    RouterError,
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
        super(rawRoutes, rawOptions);
        this._mapKeyToString = this._mapKeyToString.bind(this);

        try {
            this._currentUri = this._parseRequest(request);
        } catch (error) {
            throw new RouterError(RouterError.CUSTOM_ERROR, {
                message: 'Request cannot be parsed! Check third argument of ServerRussianRouter constructor.'
            });
        }

        const currentUri = this._currentUri;
        const rawUri = currentUri.protocol + '://' + currentUri.domain + ':' + currentUri.port + currentUri.uri;
        const matchObjects = this.matchUri(rawUri);
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
        return super.matchUri(this.resolveUri(rawUri), ...restArguments).map(this._mapKeyToString);
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

    _parseRequest (request) {
        let currentUri = {};
        utils.forEachPartName((partName) => {
            if (request.hasOwnProperty(partName)) {
                currentUri[partName] = request[partName] + '';
            }
        });
        if (Object.keys(currentUri).length === 6) {
            currentUri.uri = [
                currentUri.path,
                currentUri.query ? '?' + currentUri.query : '',
                currentUri.hash ? '#' + currentUri.hash : ''
            ].join('');
        } else {
            let [path, ...query] = request.url.split('?');
            query = query.join(encodeURIComponent('?'));
            currentUri = {
                uri: request.url,
                protocol: request.connection.encrypted ? 'https' : 'http',
                domain: (request.headers ? request.headers.host : request.get('host')).replace(/:\d+$/, ''),
                port: request.socket.address().port + '',
                path,
                query,
                hash: ''
            };
        }
        currentUri.port = +currentUri.port || 0;
        return currentUri;
    }

    _mapKeyToString (matchObject) {
        return Object.assign({}, matchObject, {
            key: this._extractKey(matchObject)
        });
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
