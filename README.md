# @podium/podlet

[![Build Status](https://travis.schibsted.io/Podium/podlet.svg?token=qt273uGfEz64UyWuNHJ1&branch=master)](https://travis.schibsted.io/Podium/podlet)

Module for building a Podlet server.


## Installation

```bash
$ npm i @podium/podlet
```


## Simple usage

Build a simple Podlet server with Express serving content but no fallback:

```js
const nunjucks = require('nunjucks');
const express = require('express');
const Podlet = require('@podium/podlet');

const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.3.1',
});

const app = express();

nunjucks.configure(
    ['./views', podlet.views('njk')],
    { autoescape: true, express: app }
);

app.use(podlet.middleware());

app.get(podlet.content(), (req, res) => {
    res.status(200).render('content.njk');
});

app.get(podlet.manifest(), (req, res) => {
    res.status(200).json(podlet);
});

app.listen(7100);
```



## Constructor

Create a new Podlet instance.

```js
const podlet = new Podlet(options);
```

### options

| option         | default   | type     | required |
| -------------- | --------- | -------- | -------- |
| name           | `null`    | `string` | `true`   |
| version        | `null`    | `string` | `true`   |
| logger         | `console` | `object` | `false`  |

#### name

Name that the podlet identifies itself by. The name value must be in camelCase

Example

```js
const podlet = new Podlet({
    name: 'myPodletName';
});
```

#### version

Current version of the podlet, it is important that this value be updated when a
new version of the podlet is deployed as the page (layout) that the podlet is
displayed in uses this value to know whether to refresh the podlet or not.

Example

```js
const podlet = new Podlet({
    version: '1.1.0';
});
```

#### logger

Any log4j compatible logger can be passed in and will be used for logging.
Console is also supported for easy test / development.

Example

```js
const podlet = new Podlet({
    logger: console;
});
```

Under the hood [abslog](https://github.com/trygve-lie/abslog) is used to
abstract out logging. Please see [abslog](https://github.com/trygve-lie/abslog)
for further details.


## API

The Podlet instance has the following API:


### .middleware()

A connect compatible middleware which takes care of multiple operations needed for
a Podlet to fully work.

It does:

 * Parse the [context](https://github.schibsted.io/Podium/context) from a request from the layout server into an object on the `res.locals.podium.context` object.
 * Adds a podium version http header to the http response.
 * Provides information on `res.locals.podium.template` about whether the request is from a layout server or not.

This middleware should be mounted before defining any routes.

Example

```js
const app = express();
app.use(podlet.middleware());
```

Returns an Array of internal middleware performing the tasks described above.


### .content(source)

Method for defining the source for the content of the Podlet. This is where one
will serve the HTML of a Podlet and do all the logic which makes your Podlet.

Source can be a relative or absolute URI.

This method returns the value of `source` and internally keeps track of the
value of `source` for use when the podlet instance is serialized into manifest
content.

Examples:

Mounts the content on the default (which is `/`):

```js
const app = express();
app.get(podlet.content(), (req, res) => { ... });
```

Mounts the content on `/content`:

```js
const app = express();
app.get(podlet.content('/content'), (req, res) => { ... });
```

Mounts the content on `/content` and use multiple sub routes to take
different URI parameters:

```js
const app = express();
app.get('/content', (req, res) => { ... });
app.get('/content/info', (req, res) => { ... });
app.get('/content/info/:id', (req, res) => { ... });
podlet.content('/content')
```

Set absolute URI to where the content is:

```js
podlet.content('http://sub.mysite.com/content/index.html');
```


### .fallback(source)

Method for defining the source for the fallback of the Podlet.

Source can be a relative or absolute URI.

This method returns the value of `source` and internally keeps track of the
value of `source` for use when the podlet instance is serialized into manifest
content.

Examples:

Mounts the fallback on `/fallback`:

```js
const app = express();
app.get(podlet.fallback('/fallback'), (req, res) => { ... });
```

Set absolute URI to where the content is:

```js
podlet.fallback('http://sub.mysite.com/fallback.html');
```


### .js(source)

Method for defining the source for the user facing javascript of the Podlet.

Source can be a relative or absolute URI.

This method returns the value of `source` and internally keeps track of the
value of `source` for use when the podlet instance is serialized into manifest
content.

Examples:

Serve javascript file on `/assets/main.js`:

```js
const app = express();
app.get(podlet.js('/assets/main.js'), (req, res) => {
    res.status(200).sendFile('./app/assets/main.js', (err) => {

    });
});
```

Serve assets from a static file server and set relative URI to the javascript file:

```js
const app = express();
app.use('/assets', express.static('./app/files/assets'));
podlet.js('/assets/main.js');
```

Set absolute URI to where the javascript file is:

```js
podlet.js('http://cdn.mysite.com/assets/js/e7rfg76.js');
```


### .css(source)

Method for defining the source for the user facing CSS of the Podlet.

Source can be a relative or absolute URI.

This method returns the value of `source` and internally keeps track of the
value of `source` for use when the podlet instance is serialized into manifest
content.

Examples:

Serve CSS file on `/assets/main.css`:

```js
const app = express();
app.get(podlet.css('/assets/main.css'), (req, res) => {
    res.status(200).sendFile('./app/assets/main.css', (err) => {

    });
});
```

Serve assets a from static file server and set relative URI to the CSS file:

```js
const app = express();
app.use('/assets', express.static('./app/files/assets'));
podlet.css('/assets/main.css');
```

Set absolute URI to where the css file is:

```js
podlet.css('http://cdn.mysite.com/assets/js/mn3sa898.css');
```


### .proxy(target, name)

Method for defining proxy targets to be mounted by the [proxy](https://github.schibsted.io/Podium/proxy)
in the layout server. It's worth mentioning that this will **not** mount a
proxy in the server where the podlet instance is used.

Proxying is intended to be used as a way to make podlet endpoints public.
A common use case for this is creating endpoints for client side code to
interact with (ajax requests from the browser). One might also make use
of proxying to pass form submissions from the browser back to the podlet.

This method returns the value of the `target` argument and internally keeps
track of the value of `target` for use when the podlet instance is serialized
into manifest content.

In a podlet it's possible to define 4 proxy targets and each target can be a
relative or absolute URI.

For each podlet, each proxy target must have a unique name.

Examples:

Mount one proxy target `/api` with the name `api`:

```js
const app = express();
app.get(podlet.proxy('/api', 'api'), (req, res) => { ... });
```

Define multiple endpoints on one proxy target `/api` with the name `api`:

```js
const app = express();
app.get('/api', (req, res) => { ... });
app.get('/api/foo', (req, res) => { ... });
app.post('/api/foo', (req, res) => { ... });
app.get('/api/bar/:id', (req, res) => { ... });

podlet.proxy('/api', 'api');
```

Set a remote target by defining an absolute URI:

```js
podlet.proxy('http://remote.site.com/api/', 'remoteApi');
```

#### Knowing where proxy endpoints are mounted in a layout

When proxy targets are mounted in a layout server they are namespaced
to avoid proxy targets from multiple podlets conflicting with each other.

This can cause a proxy endpoint in a podlet to have different pathnames
in different layout servers if the podlet is included in multiple layout
servers.

Where the proxy endpoints is mounted in a layout is available on the
[`publicPathname`](https://github.schibsted.io/Podium/context#public-pathname)
of the [context](https://github.schibsted.io/Podium/context) of each
request to the podlet.

By combining [`publicPathname`](https://github.schibsted.io/Podium/context#public-pathname)
and [`mountOrigin`](https://github.schibsted.io/Podium/context#mount-origin)
from the [context](https://github.schibsted.io/Podium/context) it is
possible to build absolute URIs to the proxy endpoints in a podlet.

Example:

This example exposes one http POST endpoint which will be made publicly
available through a proxy and one endpoint which will expose a form
that has an absolute URI to the http POST endpoint.

```js
const app = express();
const podlet = new Podlet({ ... });

// this give us, among others, the context
app.use(podlet.middleware());

// route recieving the submitted form
// made public by proxying it in
app.post(podlet.proxy('/api', 'api'), (req, res) => {

});

// content route serving the content with the form
app.get(podlet.content('/'), (req, res) => {
    const ctx = res.locals.podium.context;
    res.status(200).send(`
        <form action="${ctx.mountOrigin}${ctx.publicPathname}/api" method="post">
            [ ... ]
        </form>
    `)
});

// route serving the manifest
app.get(podlet.manifest(), (req, res) => {
    res.status(200).json(podlet);
});

app.listen(7100);
```



### .manifest(pathname)

Method for defining the pathname for the manifest of the Podlet.

This method returns the value of the `pathname` argument and internally keeps
track of the value of `pathname` for use when the podlet instance is serialized
into manifest content.

Examples:

Mounts the manifest on the default which is `/manifest.json`:

```js
const app = express();
app.get(podlet.manifest(), (req, res) => { ... });
```

Mounts the manifest on `/`:

```js
const app = express();
app.get(podlet.manifest('/'), (req, res) => { ... });
```

Mounts the manifest on `/manifest`:

```js
const app = express();
app.get(podlet.manifest('/manifest'), (req, res) => { ... });
```

Podium expects podlet manifest routes to return a JSON document describing
the podlet. This can be achieved by simply serializing the Podlet object
instance.

Example:

```js
const app = express();
app.get(podlet.manifest(), (req, res) => {
    res.status(200).json(podlet);
 });
```

This route will then respond with:

```json
{
    "name":"myPodlet",
    "version":"1.0.0",
    "content":"/",
    "fallback":"/fallback",
    "assets": {
        "js":"",
        "css":""
        },
    "proxy":{}
}
```
