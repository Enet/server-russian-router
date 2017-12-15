// Look at the example how to use server-russian-router with node
const ServerRussianRouter = require('../src/index.js');

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
