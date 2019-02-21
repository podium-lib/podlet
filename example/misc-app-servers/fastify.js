'use strict';

const fastify = require('fastify');
const Podlet = require('../../');

const app = fastify();

// https://github.com/fastify/fastify/issues/303#issuecomment-332190934

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

app.decorateReply('locals', {
    podium: {},
});

app.addHook('preHandler', podlet.middleware());

// app.use(podlet.middleware());

app.get(podlet.content(), async (req, res) => {
    const p = res.locals.podium;
    if (p.context.locale === 'nb-NO') {
        return p.render('<h2>Hei verden</h2>');
    }
    return p.render('<h2>Hello world</h2>');
});

app.get(podlet.fallback(), async (req, res) => {
    const p = res.locals.podium;
    return p.render('<h2>We are sorry but we can not display this!</h2>');
});

app.get(podlet.manifest(), async () => JSON.stringify(podlet));

/*
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
*/

podlet.css({ value: '/assets/module.css' });
podlet.js({ value: '/assets/module.js' });

app.listen(7100, () => {
    console.log(`http://localhost:7100`);
});
