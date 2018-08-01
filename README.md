# @podium/podlet

[![Build Status](https://travis.schibsted.io/Podium/podlet.svg?token=qt273uGfEz64UyWuNHJ1&branch=master)](https://travis.schibsted.io/Podium/podlet)

Module for building a Podlet server.

## Installation

```bash
$ npm i @podium/podlet
```

## Getting started

Building a simple Podlet server using [Express](https://expressjs.com/)

```js
const express = require("express");
const Podlet = require("@podium/podlet");

// create a new podlet instance
const podlet = new Podlet({
    name: "myPodlet",
    version: "1.3.1"
});

// create a new express app instance
const app = express();

// mount podlet middleware in express app
app.use(podlet.middleware());

// create a route to serve the podlet's manifest file
app.get(podlet.manifest(), (req, res) => {
    res.json(podlet);
});

// create a route to server the podlet's content
app.get(podlet.content(), (req, res) => {
    res.send(`<div>hello world</div>`);
});

// start the app on port 7100
app.listen(7100);
```

## API Documentation

### Constructor

Create a new Podlet instance.

```js
const podlet = new Podlet(options);
```

### options

| option   | type      | default   | required |
| -------- | --------- | --------- | -------- |
| name     | `string`  | `null`    | `true`   |
| version  | `string`  | `null`    | `true`   |
| logger   | `object`  | `console` | `false`  |
| defaults | `boolean` | `false`   | `false`  |

#### name

The name that the podlet identifies itself by. The name value must be in camelCase.

_Example:_

```js
const podlet = new Podlet({
    name: 'myPodletName';
});
```

#### version

The current version of the podlet. It is important that this value be updated when a
new version of the podlet is deployed as the page (layout) that the podlet is
displayed in uses this value to know whether to refresh the podlet or not.

_Example:_

```js
const podlet = new Podlet({
    version: '1.1.0';
});
```

#### logger

Any log4j compatible logger can be passed in and will be used for logging.
Console is also supported for easy test / development.

_Example:_

```js
const podlet = new Podlet({
    logger: console;
});
```

Under the hood [abslog](https://github.com/trygve-lie/abslog) is used to
abstract out logging. Please see [abslog](https://github.com/trygve-lie/abslog)
for further details.

#### defaults

Turns on or off the setting of a default context on the http response at `res.locals.podium`. This
can be very useful when developing locally.

When a layout server sends a request to a podlet, the default context will be overridden
by the context from the layout server. Because of this, appending the
default context does not have much value in production.

_Example of turning on the default context only in development mode:_

```js
const podlet = new Podlet({
    defaults: process.env.NODE_ENV !== 'production';
});
```

The content of the default context can be altered by calling the `.defaults()` method of the podlet instance.

## Podlet Instance

The Podlet instance has the following API:

### .defaults(context)

Alters the default context set on the http response at `res.locals.podium`.
By default this context has the following shape:

```js
{
    debug: 'false',
    locale: 'en-EN',
    deviceType: 'desktop',
    requestedBy: 'the_name_of_the_podlet',
    mountOrigin: 'http://localhost:port',
    mountPathname: '/same/as/manifest/method',
    publicPathname: '/same/as/manifest/method',
}
```

The default context can be overridden by passing an object with the
desired key / values to override.

_Example of overriding `deviceType`:_

```js
const podlet = new Podlet({
    name: "foo",
    version: "1.0.0"
});

podlet.defaults({
    deviceType: "mobile"
});
```

Additional values not defined by Podium can also be appended to the
default context in the same way.

_Example of adding a context value:_

```js
const podlet = new Podlet({
    name: "foo",
    version: "1.0.0"
});

podlet.defaults({
    token: "9fc498984f3ewi"
});
```

N.B. The default context will only be appended to the response when the
constructor argument `defaults` is set to `true`.

### .middleware()

Returns an array of connect compatible middleware functions which take care of the multiple operations needed for
a Podlet to fully work.

What it does:

-   Parses the [context](https://github.schibsted.io/Podium/context) from a request from the layout server into an object on the http response at `res.locals.podium.context`.
-   Adds a podium version http header to the http response.
-   Provides information on `res.locals.podium.template` about whether the request is from a layout server or not.

**Important:** This middleware must be mounted before defining any routes.

_Example:_

```js
const app = express();
app.use(podlet.middleware());
```

Returns an Array of internal middleware performing the tasks described above.

### .manifest(pathname)

Defines the pathname for the manifest of the Podlet. The pathname is the url at which the Podlet's manifest is served and can be a relative or absolute URI.

In the Express context, a route handler will be added for the pathname value. This handler will then return json containing metadata describing the podlet.

This method returns the value of `pathname` and internally keeps track of the
value of `pathname` for use when the podlet instance is serialized into manifest
manifest.

_Examples:_

Mounts the manifest on the default which is `/manifest.json`:

```js
const app = express();
app.get(podlet.manifest(), (req, res) => { ... });
```

Mounts the manifest at `/`:

```js
const app = express();
app.get(podlet.manifest('/'), (req, res) => { ... });
```

Mounts the manifest at `/manifest`:

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

This route will then respond with something like:

```json
{
    "name": "myPodlet",
    "version": "1.0.0",
    "content": "/",
    "fallback": "/fallback",
    "assets": {
        "js": "",
        "css": ""
    },
    "proxy": {}
}
```

### .content(pathname)

Defines the pathname for the content of the Podlet. The pathname is the url at which the Podlet's content is served and can be a relative or absolute URI.

In the Express context, a route handler will be added for the pathname value. This handler will do all the work required to produce the podlet's content (which is typically an HTML fragment).

This method returns the value of `pathname` and internally keeps track of the
value of `pathname` for use when the podlet instance is serialized into manifest
content.

_Examples:_

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

Mounts the content on `/content` and uses multiple sub routes to take
different URI parameters:

```js
const app = express();
app.get('/content', (req, res) => { ... });
app.get('/content/info', (req, res) => { ... });
app.get('/content/info/:id', (req, res) => { ... });
podlet.content('/content')
```

Sets an absolute URI to where the content is:

```js
podlet.content("http://sub.mysite.com/content/index.html");
```

### .fallback(pathname)

Defines the pathname for the fallback of the Podlet. The pathname is the url at which the Podlet's fallback is served and can be a relative or absolute URI.

In the Express context, a route handler will be added for the pathname value. This handler will do all the work required to produce the podlet's fallback (which is typically an HTML fragment).

This method returns the value of `pathname` and internally keeps track of the
value of `pathname` for use when the podlet instance is serialized into manifest
fallback.

_Examples:_

Mounts the fallback on `/fallback`:

```js
const app = express();
app.get(podlet.fallback('/fallback'), (req, res) => { ... });
```

Sets an absolute URI to where the content is:

```js
podlet.fallback("http://sub.mysite.com/fallback.html");
```

### .js(pathname)

Defines the javascript pathname for the Podlet. The pathname is the url at which the Podlet's user facing JavaScript is served and can be a relative or absolute URI.

This method returns the value of `pathname` and internally keeps track of the
value of `pathname` for use when the podlet instance is serialized into manifest
content.

_Examples:_

Serve a javascript file at `/assets/main.js`:

```js
const app = express();
app.get(podlet.js("/assets/main.js"), (req, res) => {
    res.status(200).sendFile("./app/assets/main.js", err => {});
});
```

Serve assets from a static file server and set a relative URI to the javascript file:

```js
const app = express();
app.use("/assets", express.static("./app/files/assets"));
podlet.js("/assets/main.js");
```

Set an absolute URI to where the javascript file is located:

```js
podlet.js("http://cdn.mysite.com/assets/js/e7rfg76.js");
```

### .css(pathname)

Defines the CSS pathname for the Podlet. The pathname is the url at which the Podlet's user facing CSS is served and can be a relative or absolute URI.

This method returns the value of `pathname` and internally keeps track of the
value of `pathname` for use when the podlet instance is serialized into manifest
content.

_Examples:_

Serve a CSS file at `/assets/main.css`:

```js
const app = express();
app.get(podlet.css("/assets/main.css"), (req, res) => {
    res.status(200).sendFile("./app/assets/main.css", err => {});
});
```

Serve assets from a static file server and set a relative URI to the CSS file:

```js
const app = express();
app.use("/assets", express.static("./app/files/assets"));
podlet.css("/assets/main.css");
```

Set an absolute URI to where the CSS file is located:

```js
podlet.css("http://cdn.mysite.com/assets/js/mn3sa898.css");
```

### .proxy(target, name)

Method for defining proxy targets to be mounted by the [proxy](https://github.schibsted.io/Podium/proxy) module
in a layout server. It's worth mentioning that this will **not** mount a
proxy in the server where the podlet instance is used.

Proxying is intended to be used as a way to make podlet endpoints public.
A common use case for this is creating endpoints for client side code to
interact with (ajax requests from the browser). One might also make use
of proxying to pass form submissions from the browser back to the podlet.

This method returns the value of the `target` argument and internally keeps
track of the value of `target` for use when the podlet instance is serialized
into manifest content.

In a podlet it is possible to define up to 4 proxy targets and each target can be a
relative or absolute URI.

For each podlet, each proxy target must have a unique name.

_Examples:_

Mounts one proxy target `/api` with the name `api`:

```js
const app = express();
app.get(podlet.proxy('/api', 'api'), (req, res) => { ... });
```

Defines multiple endpoints on one proxy target `/api` with the name `api`:

```js
const app = express();
app.get('/api', (req, res) => { ... });
app.get('/api/foo', (req, res) => { ... });
app.post('/api/foo', (req, res) => { ... });
app.get('/api/bar/:id', (req, res) => { ... });

podlet.proxy('/api', 'api');
```

Sets a remote target by defining an absolute URI:

```js
podlet.proxy("http://remote.site.com/api/", "remoteApi");
```

#### Knowing where proxy endpoints are mounted in a layout

When proxy targets are mounted in a layout server they are namespaced
to avoid proxy targets from multiple podlets conflicting with each other.

This can cause a proxy endpoint in a podlet to have different pathnames
in different layout servers if the podlet is included in multiple layout
servers.

Information regarding where proxy endpoints are mounted in any given layout can be found by inspecting the
[`publicPathname`](https://github.schibsted.io/Podium/context#public-pathname) key
of the Podium [context](https://github.schibsted.io/Podium/context) for each
request made to the podlet by a layout.

By combining [`publicPathname`](https://github.schibsted.io/Podium/context#public-pathname)
and [`mountOrigin`](https://github.schibsted.io/Podium/context#mount-origin)
from the [context](https://github.schibsted.io/Podium/context) object, it is
possible to build absolute URIs to a Podlet's proxy endpoints.

_Example:_

This example demonstrates a Podlet server that exposes one http POST endpoint which will be made publicly
available through a proxy in a layout and one content endpoint which supplies an HTML form
that, when submitted, will make a POST request to the http POST endpoint we defined.

```js
const app = express();
const podlet = new Podlet({ ... });

// route serving the manifest
app.get(podlet.manifest(), (req, res) => {
    res.status(200).json(podlet);
});

// this give us, among others, the context
app.use(podlet.middleware());

// route recieving the submitted form made public by proxying
app.post(podlet.proxy('/api', 'api'), (req, res) => { ... });

// content route serving an HTML form
app.get(podlet.content('/'), (req, res) => {
    const ctx = res.locals.podium.context;
    res.status(200).send(`
        <form action="${ctx.mountOrigin}${ctx.publicPathname}/api" method="post">
            [ ... ]
        </form>
    `)
});

app.listen(7100);
```
