/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */

'use strict';

const Hapi = require('hapi');
const HapiPodlet = require('./hapi-plugin');
const Podlet = require('../../');

const app = Hapi.Server({
    host: 'localhost',
    port: 7100,
});

// https://github.com/hapijs/discuss/issues/368#issuecomment-247932200

const podlet = new Podlet({
    pathname: '/',
    fallback: '/fallback',
    version: `2.0.0-${Date.now().toString()}`,
    logger: console,
    name: 'podletContent',
    development: true,
});

podlet.defaults({
    locale: 'nb-NO',
});

app.register({
    plugin: new HapiPodlet(),
    options: podlet,
});

app.route({
    method: 'GET',
    path: podlet.content(),
    handler: (request, h) => {
        if (request.app.podium.context.locale === 'nb-NO') {
            return h.podiumSend('<h2>Hei verden</h2>');
        }
        return h.podiumSend('<h2>Hello world</h2>');
    },
});

app.route({
    method: 'GET',
    path: podlet.fallback(),
    handler: (request, h) =>
        h.podiumSend('<h2>We are sorry but we can not display this!</h2>'),
});

app.route({
    method: 'GET',
    path: podlet.manifest(),
    handler: () => JSON.stringify(podlet),
});

app.route({
    method: 'GET',
    path: '/public',
    handler: () => JSON.stringify({ say: 'Hello world' }),
});

// Test URL: http://localhost:7100/podium-resource/podletContent/localApi
podlet.proxy({ target: '/public', name: 'localApi' });
// Test URL: http://localhost:7100/podium-resource/podletContent/remoteApi
podlet.proxy({ target: 'https://api.ipify.org', name: 'remoteApi' });

podlet.css({ value: '/assets/module.css' });
podlet.js({ value: '/assets/module.js' });

async function start() {
    try {
        await app.start();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', app.info.uri);
}
setTimeout(() => {
    start();
}, 1000);
