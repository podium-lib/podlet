import express from 'express';
import Podlet from '../../lib/podlet.js';

const app = express();

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

app.use(podlet.middleware());

app.get(podlet.content(), (req, res) => {
    if (res.locals.podium.context.locale === 'nb-NO') {
        res.podiumSend('<h2>Hei verden</h2>');
        return;
    }
    res.podiumSend('<h2>Hello world</h2>');
});

app.get(podlet.fallback(), (req, res) => {
    res.podiumSend('<h2>We are sorry but we can not display this!</h2>');
});

app.get(podlet.manifest(), (req, res) => {
    res.json(podlet);
});

app.get('/public', (req, res) => {
    if (res.locals.podium.context.locale === 'nb-NO') {
        res.json({ say: 'Hei verden' });
        return;
    }
    res.json({ say: 'Hello world' });
});

podlet.proxy({ target: '/public', name: 'localApi' });
podlet.proxy({ target: 'https://api.ipify.org', name: 'remoteApi' });

app.use('/assets', express.static('assets'));
podlet.css({ value: '/assets/module.css' });
podlet.js({ value: '/assets/module.js' });

app.listen(7100, () => {
    console.log(`Podlet server running at http://localhost:7100/`);
});
