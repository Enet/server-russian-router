# :ru: server-russian-router :computer:
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

## new ServerRussianRouter(rawRoutes, rawOptions, request)
Returns a new instance of `ServerRussianRouter`. Depending on uri from the `request`, default protocol, domain and port are set; also some routes are matched immediately in constructor. Then default values are used for matching and generating another uris, and match objects are available via `router.getMatchObjects`.

## router.resolveUri(rawUri)
Transforms any `rawUri` to uri, that has an absolute path. The result depends on `request` object, passed to the constructor.

## router.matchUri(rawUri)
Firstly resolves uri using `router.resolveUri`, then matches routes. So the method always matches uri, that has an absolute path.

## router.generateUri(routeName, userParams)
Firstly generates uri, then resolves it using `router.resolveUri`. Returns a uri (string), that has an absolute path.

## router.getMatchObjects()
Returns already cached array with match objects. The result depends on `request` object, passed to the constructor.

## router.getNavigationKey()
Just a stub method to preserve the same interface with [browser-russian-router](https://github.com/Enet/browser-russian-router). Returns `0` always (because there is no the concept of navigation in server-russian-router).

## ServerRussianRouter.resetOptionsCache()
Resets the cache of the router's options. After reset all the router's options are parsed again during initialization.

## ServerRussianRouter.resetRoutesCache()
Resets the cache of the routes' tables. After reset all the routes' tables are parsed again during initialization.

# :blowfish: Examples
I'll be making more tests and examples over the time. More than zero!

# :dolphin: Contributors
Pull requests are welcome :feet: Let improve the package together. But, please, respect the code style.

If you don't understand how to use the router or you have additional questions about internal structure, be free to write me at [enet@protonmail.ch](enet@protonmail.ch). Also if you are looking for front-end software developer, be aware that I'm looking for a job. Check out my portfolio at [https://zhevak.name](https://zhevak.name) :frog:
