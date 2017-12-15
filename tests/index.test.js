const ServerRussianRouter = require('../src/index.js');
const {utils} = require('russian-router');

const routes = {
    index: {
        uri: '/',
        key: 'index.{key}'
    },
    user: {
        uri: '/user/{id}',
        params: {
            id: /\d+/
        },
        key: (matchObject) => {
            return 'user.' + matchObject.params.id
        }
    },
    about: {
        uri: '/about'
    },
    hello: {
        uri: '?hello={entity}',
        params: {
            entity: /\w+/
        }
    }
};
const options = {};

const requests = {
    node: {
        url: '/?hello=world',
        connection: {},
        headers: {
            host: 'localhost'
        },
        socket: {
            address: () => ({port: 80})
        }
    },
    express: {
        url: '/?hello=world',
        connection: {},
        get: (headerName='host') => 'localhost',
        socket: {
            address: () => ({port: 80})
        }
    },
    custom: {
        protocol: 'http',
        domain: 'localhost',
        port: 80,
        path: '/',
        query: 'hello=world',
        hash: ''
    },
    index: {
        protocol: 'https',
        domain: 'google.com',
        port: 443,
        path: '/',
        query: '',
        hash: ''
    },
    user: {
        protocol: 'https',
        domain: 'google.com',
        port: 443,
        path: '/user/123',
        query: '',
        hash: ''
    },
    about: {
        protocol: 'https',
        domain: 'google.com',
        port: 443,
        path: '/about',
        query: '',
        hash: ''
    }
};

test('Router throws an error for invalid request', () => {
    expect(() => new ServerRussianRouter(routes, options)).toThrow();
    expect(() => new ServerRussianRouter(routes, options, {})).toThrow();
    expect(() => new ServerRussianRouter(routes, options, {
        protocol: 'http',
        domain: 'localhost',
        path: '/'
    })).toThrow();
});

test('Router parses request correctly', () => {
    const testRequest = (request) => {
        let router;
        expect(() => router = new ServerRussianRouter(routes, options, request)).not.toThrow();
        expect(router._currentUri.protocol).toBe('http');
        expect(router._currentUri.domain).toBe('localhost');
        expect(router._currentUri.port).toBe('80');
        expect(router._currentUri.port).toBe('80');
        expect(router._currentUri.path).toBe('/');
        expect(router._currentUri.query).toBe('hello=world');
        expect(router._currentUri.hash).toBe('');
    };

    testRequest(requests.node);
    testRequest(requests.express);
    testRequest(requests.custom);
});

test('Router matches current uri during initialization', () => {
    let router;

    router = new ServerRussianRouter(routes, options, requests.index);
    expect(router.getMatchObjects().length).toBe(1);
    expect(router.getMatchObjects()[0].name).toBe('index');
    expect(router.getMatchObjects()[0].domain).toBe('google.com');

    router = new ServerRussianRouter(routes, options, requests.user);
    expect(router.getMatchObjects().length).toBe(1);
    expect(router.getMatchObjects()[0].name).toBe('user');
    expect(router.getMatchObjects()[0].params.id).toBe('123');
});

test('Router extracts the keys correctly', () => {
    let router;

    router = new ServerRussianRouter(routes, options, requests.index);
    expect(router.getMatchObjects()[0].key).toBe('User/index.0');

    router = new ServerRussianRouter(routes, options, requests.user);
    expect(router.getMatchObjects()[0].key).toBe('User/user.123');

    router = new ServerRussianRouter(routes, options, requests.about);
    expect(router.getMatchObjects()[0].key).toBe('RussianRouter/about');
});

test('Router resolves uri correctly', () => {
    const router = new ServerRussianRouter(routes, options, requests.user);
    expect(router.resolveUri('delete')).toBe('/user/123/delete');
    expect(router.resolveUri('?xyz=777')).toBe('/user/123?xyz=777');
    expect(router.resolveUri('#матрёшка')).toBe('/user/123#матрёшка');
    expect(router.resolveUri('?xyz=777#матрёшка')).toBe('/user/123?xyz=777#матрёшка');
    expect(router.resolveUri('/already/resolved/')).toBe('/already/resolved/');
});

test('Router matches uri correctly', () => {
    let router;

    router = new ServerRussianRouter(routes, options, requests.node);
    expect(router.getMatchObjects().length).toBe(2);

    router = new ServerRussianRouter(routes, options, requests.user);
    expect(router.matchUri('?hello=world').length).toBe(2);
});

test('Router generates uri correctly', () => {
    const router = new ServerRussianRouter(routes, {
        dataConsistency: false
    }, requests.user);
    expect(router.generateUri('hello', {entity: 'world'})).toBe('/user/123?hello=world');
    expect(router.generateUri('hello', {entity: null})).toBe('/user/123');
    expect(router.generateUri('hello')).toBe('/user/123');
});

test('Router returns correct navigation key', () => {
    const router = new ServerRussianRouter(routes, options, requests.user);
    expect(router.getNavigationKey()).toBe(0);
    router.matchUri('?hello=world');
    router.generateUri('hello', {entity: 'world'});
    expect(router.getNavigationKey()).toBe(0);
});

test('Router returns correct default values', () => {
    const router = new ServerRussianRouter(routes, options, requests.custom);
    utils.forEachPartName((partName, p) => {
        const defaultPart = router.getDefaultPart(partName);
        const PartConstructor = utils.getPartConstructor(partName);
        expect(defaultPart).toBeInstanceOf(PartConstructor);
        expect(defaultPart + '').toBe(p > 2 ? '' : requests.custom[partName] + '');
    });
});
