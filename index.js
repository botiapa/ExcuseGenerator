async function init() {
const listenPort = process.env.PORT || 8080;

const express = require('express');

const db = require('./database');
await db.init();

const app = express()
.use(express.json())
.use(express.urlencoded({ extended: true }));


const routes = require('./routes')(app, db);
const startedApp = app.listen(listenPort, () => {
	console.log('We are live on ' + listenPort);
});
}

init(); // Required because of the async function