/* jshint esversion:10 */

async function init() {
    const listenPort = process.env.PORT || 8080;

    const express = require('express');
    const cookieParser = require('cookie-parser');

    const db = require('./database');
    await db.init();


    const app = express()
        .set('views', './views')
        .set('view engine', 'pug')
        .set('view cache', false)
        .use(cookieParser())
        .use(express.json())
        .use(express.static('static'))
        .use(express.urlencoded({ extended: true }));


    const routes = require('./routes')(app, db);
    const startedApp = app.listen(listenPort, () => {
        console.log('We are live on ' + listenPort);
    });
}

init(); // Required because of the async function