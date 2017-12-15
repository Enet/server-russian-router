// Look at the example how to use server-russian-router with express
const ServerRussianRouter = require('../src/index.js');
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
