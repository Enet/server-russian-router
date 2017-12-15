// Look at the general example of using server-russian-router
const ServerRussianRouter = require('../src/index.js');

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
