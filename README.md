# :ru: server-russian-router :computer:

[![npm version](https://img.shields.io/npm/v/server-russian-router.svg)](https://www.npmjs.com/package/server-russian-router)
[![gzip size](http://img.badgesize.io/https://npmcdn.com/server-russian-router/dist/server-russian-router.min.js?compression=gzip)](https://npmcdn.com/server-russian-router/dist/server-russian-router.min.js?compression=gzip)
[![test coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/Enet/russian-router)
[![stepan zhevak](https://img.shields.io/badge/stepan-zhevak-1a8b8e.svg)](https://zhevak.name)

Here is a universal javascript router for server environment. It allows to match and generate uris on Node.JS with the same algorithms and routes as in the browser. If you use [react](https://github.com/facebook/react), be sure to take a look at [react-russian-router](https://github.com/Enet/react-russian-router), that is isomorphic/universal and uses inside both [browser-russian-router](https://github.com/Enet/browser-russian-router) and [server-russian-router](https://github.com/Enet/server-russian-router).

- :whale: [Installation](#whale-installation)
- :tropical_fish: [API](#tropical_fish-api)
- :blowfish: [Examples](#blowfish-examples)
- :dolphin: [Contributors](#dolphin-contributors)

# :whale: Installation
To install the current version with **npm** use the command below:
```sh
npm install --save server-russian-router
```
Or if you prefer **yarn**:
```sh
yarn add server-russian-router
```

Now the package is installed and you can start using it on **Node.JS** environment. Note that server-russian-router doesn't export any additional classes, only router itself.
```javascript
const ServerRussianRouter = require('server-russian-router');
```

# :tropical_fish: API
Since the server-russian-router only extends capabilities of [russian-router](https://github.com/Enet/russian-router), it's strongly recommended to read original documentation before usage.

Note that server-russian-router is statical. It means that one instance of `ServerRussianRouter` never changes its uri. All the magic happens in constructor. To handle multiple requests you need to create multiple instances!

> Don't worry about performance issues, because server-russian-router has an internal caches for routes' tables and router's options. It doesn't parse `rawRoutes` and `rawOptions` each time, because `parsedRoutes` and `parsedOptions` are already stored to corresponding caches after the first instance was created.

## `new ServerRussianRouter(rawRoutes, rawOptions, request)`
Returns a new instance of `ServerRussianRouter`. Depending on uri from the `request`, default protocol, domain and port are set; also some routes are matched immediately in constructor. Then default values are used for matching and generating another uris, and match objects are available via `router.getMatchObjects`.

`request` is required and must be presented by native Node.JS request object or by [express](https://github.com/expressjs/express) request object. Also a plain object can be given as well, but it must contain all the corresponding properties: protocol, domain, port, path, query and hash. If so, note that path must be absolute, query and hash are specified without `?` and `#`.

## `router.resolveUri(rawUri)`
Transforms any `rawUri` to uri, that has an absolute path. The result depends on `request` object, passed to the constructor.

## `router.matchUri(rawUri)`
Firstly resolves uri using `router.resolveUri`, then matches routes. So the method always matches uri, that has an absolute path.

## `router.generateUri(routeName, userParams)`
Firstly generates uri, then resolves it using `router.resolveUri`. Returns a uri (string), that has an absolute path.

## `router.getMatchObjects()`
Returns already cached array of match objects. The result depends on `request` object, passed to the constructor.

## `router.getNavigationKey()`
Just a stub method to preserve the same interface with [browser-russian-router](https://github.com/Enet/browser-russian-router). Returns `0` always (because there is no the concept of navigation in server-russian-router).

## `ServerRussianRouter.resetOptionsCache()`
Resets the cache of the router's options. After reset all the router's options are parsed again during initialization.

## `ServerRussianRouter.resetRoutesCache()`
Resets the cache of the routes' tables. After reset all the routes' tables are parsed again during initialization.

# :blowfish: Examples
Look at the examples how to use router in some cases. If you want to use [react](https://github.com/facebook/react), check out [react-russian-router](https://github.com/Enet/react-russian-router).
<details><summary><strong>See examples/routes.js</strong></summary>

```javascript
module.exports = {
    index: {
        uri: '/',
        // {key} will be replaced with navigation key, that is always 0 on the server
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
        // Note the relative path here, that's not recommended to use
        uri: '?hello={entity}',
        params: {
            entity: /\w+/
        }
    }
};
```

</details>
<details><summary><strong>See examples/demo.js</strong></summary>

```javascript
const ServerRussianRouter = require('server-russian-router');

const options = {};
const routes = require('./routes.js');
const request = {
    protocol: 'https',
    domain: 'localhost',
    port: 443,
    path: '/user/123',
    query: '',
    hash: ''
};

// Third argument must be node/express request or custom uri like here
const router = new ServerRussianRouter(routes, options, request);

// Router has already matched all the routes during initialization
const requestMatchObjects = router.getMatchObjects();
console.log(requestMatchObjects.length); // 1
console.log(requestMatchObjects[0].key); // 'User/user.123'

const indexMatchObjects = router.matchUri('/');
console.log(indexMatchObjects[0].key); // 'User/index.0'

const aboutMatchObjects = router.matchUri('/about');
console.log(aboutMatchObjects[0].key); // 'RussianRouter/about'

console.log(router.resolveUri('delete')); // '/user/123/delete'
console.log(router.resolveUri('?xyz=777')); // '/user/123?xyz=777'
console.log(router.resolveUri('#матрёшка')); // '/user/123#матрёшка'
console.log(router.resolveUri('?xyz=777#матрёшка')); // '/user/123?xyz=777#матрёшка'
console.log(router.resolveUri('/already/resolved/')); // '/alrady/resolved/'

const helloMatchObjects = router.matchUri('?hello=world');
console.log(helloMatchObjects.length); // 2
console.log(helloMatchObjects[0].name); // 'user'
console.log(helloMatchObjects[1].name); // 'hello'
console.log(helloMatchObjects[1].path); // '/user/123'
console.log(helloMatchObjects[1].query); // {hello: 'world'}
console.log(helloMatchObjects[1].params.entity); // 'world'

console.log(router.generateUri('about')); // '/about'
console.log(router.generateUri('hello', {entity: 'world'})); // '/user/123?hello=world'

console.log(router.getNavigationKey()); // 0
```

</details>
<details><summary><strong>See examples/node.js</strong></summary>

```javascript
const ServerRussianRouter = require('server-russian-router');

const options = {};
const routes = require('./routes.js');

const http = require('http');
const port = 8080;
const server = http.createServer((request, response) => {
    const router = new ServerRussianRouter(routes, options, request);
    const matchObjects = router.getMatchObjects();
    response.end(JSON.stringify(matchObjects));
});

server.listen(port, (error) => {
    if (error) {
        throw error;
    }
    console.log('Node server is started on ' + port);
});
```

</details>
<details><summary><strong>See examples/express.js</strong></summary>

```javascript
const ServerRussianRouter = require('server-russian-router');
const express = require('express'); // npm install express

const options = {};
const routes = require('./routes.js');

const port = 8080;
const server = express();
server.get('*', (request, response) => {
    const router = new ServerRussianRouter(routes, options, request);
    const matchObjects = router.getMatchObjects();
    response.end(JSON.stringify(matchObjects));
});
server.listen(port, (error) => {
    if (error) {
        throw error;
    }
    console.log('Express server is started on ' + port);
});
```

</details>

# :dolphin: Contributors
Pull requests are welcome :feet: Let improve the package together. But, please, respect the code style.

If you don't understand how to use the router or you have additional questions about internal structure, be free to write me at [enet@protonmail.ch](enet@protonmail.ch). Also if you are looking for front-end software developer, be aware that I'm looking for a job. Check out my portfolio at [https://zhevak.name](https://zhevak.name) :frog:
