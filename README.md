# @podium/podlet

[![Build Status](https://travis.schibsted.io/Podium/podlet.svg?token=qt273uGfEz64UyWuNHJ1&branch=master)](https://travis.schibsted.io/Podium/podlet)

Module for building a podlet server.

## Installation

```bash
$ npm i @podium/podlet
```

## Getting started

Building a simple podlet server using [Express](https://expressjs.com/)

```js
const express = require('express');
const Podlet = require('@podium/podlet');

// create a new podlet instance
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.3.1',
    pathname: '/',
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

Create a new podlet instance.

```js
const podlet = new Podlet(options);
```

### options

| option   | type      | default          | required |
| -------- | --------- | ---------------- | -------- |
| name     | `string`  |                  | &check;  |
| version  | `string`  |                  | &check;  |
| pathname | `string`  |                  | &check;  |
| manifest | `string`  | `/manifest.json` |          |
| content  | `string`  | `/`              |          |
| fallback | `string`  |                  |          |
| logger   | `object`  |                  |          |
| defaults | `boolean` | `false`          |          |

#### name

The name the podlet identifies itself by. The name value must be in camelCase.

_Example:_

```js
const podlet = new Podlet({
    name: 'myPodlet';
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

#### pathname

Pathname of where a Podlet is mounted in a http server. It is important that
this value match with where the entry point of a route are in a http server
since this value is used to define where the manifest are in a podlet.

If the podlet is mounted on "root", set `pathname` to `/`:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
});

app.use(podlet.middleware());

app.get('/', (req, res, next) => {
    [ ... ]
});
```

If the podlet is mouned on ex `/foo` one should do like this:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/foo',
});

app.use('/foo', podlet.middleware());

app.get('/foo', (req, res, next) => {
    [ ... ]
});

app.get('/foo/:id', (req, res, next) => {
    [ ... ]
});
```

#### manifest

Defines the pathname for the manifest of the Podlet. Defaults to `/manifest.json`.

The value should be relative to the value set on the `pathname` argument. In other
words; if a Podlet is mounted in a http server at `/foo` and the manifest is at
`/foo/component.json` one should do as follow:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/foo',
    manifest: '/component.json',
});

app.get('/foo/component.json', (req, res, next) => {
    [ ... ]
});
```

The value can be a relative URL. One can use the `.manifest()` method to retrieve
the set value.

#### content

Defines the pathname for the content of the Podlet. Defaults to `/`.

The value should be relative to the value set on the `pathname` argument. In other
words; if a Podlet is mounted in a http server at `/foo` and the content is at
`/foo/index.html` one should do as follow:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/foo',
    content: '/index.html',
});

app.get('/foo/index.html', (req, res, next) => {
    [ ... ]
});
```

The value can be a relative or absolute URL. One can use the `.content()` method to
retrieve the set value.

#### fallback

Defines the pathname for the fallback of the Podlet. Defaults to an empty string.

The value should be relative to the value set on the `pathname` argument. In other
words; if a Podlet is mounted in a http server at `/foo` and the fallback is at
`/foo/fallback.html` one should do as follow:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/foo',
    fallback: '/fallback.html',
});

app.get('/foo/fallback.html', (req, res, next) => {
    [ ... ]
});
```

The value can be a relative or absolute URL. One can use the `.fallback()` method to
retrieve the set value.

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

Turns on or off the setting of a default context on the HTTP response at `res.locals.podium.context`.
This can be very useful when developing locally.

When a layout server sends a request to a podlet, the default context will be overridden
by the context from the layout server. Because of this, appending the
default context does not have much value in production.

_Example of turning on the default context only in development mode:_

```js
const podlet = new Podlet({
    defaults: process.env.NODE_ENV !== 'production';
});
```

The content of the default context can be altered by calling the `.defaults()` method of
the podlet instance.

## Podlet Instance

The podlet instance has the following API:

### .defaults(context)

Alters the default context set on the HTTP response at `res.locals.podium.context`.
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
    name: 'foo',
    version: '1.0.0',
});

podlet.defaults({
    deviceType: 'mobile',
});
```

Additional values not defined by Podium can also be appended to the
default context in the same way.

_Example of adding a context value:_

```js
const podlet = new Podlet({
    name: 'foo',
    version: '1.0.0',
});

podlet.defaults({
    token: '9fc498984f3ewi',
});
```

N.B. The default context will only be appended to the response when the
constructor argument `defaults` is set to `true`.

### .middleware()

Returns an array of connect compatible middleware functions which take care of the multiple operations needed for
a podlet to fully work.

What it does:

-   Parses the [context](https://github.schibsted.io/Podium/context) from a request from the layout server into an object on the HTTP response at `res.locals.podium.context`.
-   Adds a podium version HTTP header to the HTTP response.
-   Provides information on `res.locals.podium.template` about whether the request is from a layout server or not.

**Important:** This middleware must be mounted before defining any routes.

_Example:_

```js
const app = express();
app.use(podlet.middleware());
```

Returns an Array of internal middleware performing the tasks described above.

### .manifest(options)

This method returns the value of the `manifest` argument set on the constructor.

_Examples:_

Set the manifest on the default pathname which is `/manifest.json`:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
});

app.get(podlet.manifest(), (req, res) => { ... });
```

Set the manifest at `/component.json`:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/foo',
    manifest: '/component.json',
});

app.get(podlet.manifest(), (req, res) => { ... });
```

Podium expects podlet manifest routes to return a JSON document describing
the podlet. This can be achieved by simply serializing the podlet object
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

### options

| option   | type      | default | required |
| -------- | --------- | --------| -------- |
| prefix   | `boolean` | `false` |          |

#### prefix

If the method should prefix the return value with the value for `pathname`
set at the constructor.

_Examples:_

return the full pathname, `/foo/component.json`, to the manifest:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/foo',
    manifest: '/component.json',
});

podlet.manifest({ prefix: true });
```

### .content(options)

This method returns the value of the `content` argument set on the constructor.

_Examples:_

Set the content on the default pathname which is `/`:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
});

app.get(podlet.content(), (req, res) => { ... });
```

Set the content at `/index.html`:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/foo',
    content: '/index.html',
});

app.get(podlet.content(), (req, res) => { ... });
```

set the content too `/content` and uses multiple sub routes to take different
URI parameters:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
    content: '/content',
});

app.get('/content', (req, res) => { ... });
app.get('/content/info', (req, res) => { ... });
app.get('/content/info/:id', (req, res) => { ... });
```

### options

| option   | type      | default | required |
| -------- | --------- | --------| -------- |
| prefix   | `boolean` | `false` |          |

#### prefix

If the method should prefix the return value with the value for `pathname`
set at the constructor.

_Examples:_

return the full pathname, `/foo/index.html`, to the content:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/foo',
    content: '/index.html',
});

podlet.content({ prefix: true });
```

Prefix will be ignored if the returned value is an absolute URL.

### .fallback(options)

This method returns the value of the `fallback` argument set on the constructor.

_Examples:_

Set the fallback to `/fallback.html`:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
    fallback: '/fallback.html',
});

app.get(podlet.fallback(), (req, res) => { ... });
```

### options

| option   | type      | default | required |
| -------- | --------- | --------| -------- |
| prefix   | `boolean` | `false` |          |

#### prefix

If the method should prefix the return value with the value for `pathname`
set at the constructor.

_Examples:_

Return the full pathname, `/foo/fallback.html`, to the fallback:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/foo',
    fallback: '/fallback.html',
});

podlet.fallback({ prefix: true });
```

Prefix will be ignored if the returned value is an absolute URL.

### .js(options)

Sets and returns the pathname for a Podlets javascript assets. Defaults to empty String.

When a value is set it will be internally keep and used when the podlet instance is serialized
into a manifest JSON string.

### options

| option   | type      | default | required |
| -------- | --------- | --------| -------- |
| value    | `string`  |         |          |
| prefix   | `boolean` | `false` |          |

#### value

Used to set the pathname for the javascript assets for the Podlet. The value can be a URL at
which the podlet's user facing JavaScript is served. The value can be the [pathname](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/pathname)
of a [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) or an absolute URL.

The value can be set only once. If called multiple times with a value, the method will throw.
The method can be called multiple times to retrieve the value though.

_Examples:_

Serve a javascript file at `/assets/main.js`:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
});

app.get(podlet.js({ value: '/assets/main.js' }), (req, res) => {
    res.status(200).sendFile('./app/assets/main.js', err => {});
});
```

Serve assets from a static file server and set a relative URI to the javascript file:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
});

app.use('/assets', express.static('./app/files/assets'));
podlet.js({ value: '/assets/main.js' });
```

Set an absolute URL to where the javascript file is located:

```js
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
});

podlet.js({ value: 'http://cdn.mysite.com/assets/js/e7rfg76.js' });
```

#### prefix

If the method should prefix the return value with the value for `pathname`
set at the constructor.

_Examples:_

Return the full pathname, `/foo/assets/main.js`, to the javascript assets:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/foo',
});

podlet.js({ value: '/assets/main.js', prefix: true });
```

Prefix will be ignored if the returned value is an absolute URL.

### .css(pathname)

Sets and returns the pathname for a Podlets css assets. Defaults to empty String.

When a value is set it will be internally keep and used when the podlet instance is serialized
into a manifest JSON string.

### options

| option   | type      | default | required |
| -------- | --------- | --------| -------- |
| value    | `string`  |         |          |
| prefix   | `boolean` | `false` |          |

#### value

Used to set the pathname for the css assets for the Podlet. The value can be a URL at
which the podlet's user facing css is served. The value can be the [pathname](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/pathname)
of a [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) or an absolute URL.

The value can be set only once. If called multiple times with a value, the method will throw.
The method can be called multiple times to retrieve the value though.

_Examples:_

Serve a css file at `/assets/main.css`:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
});

app.get(podlet.css({ value: '/assets/main.css' }), (req, res) => {
    res.status(200).sendFile('./app/assets/main.css', err => {});
});
```

Serve assets from a static file server and set a relative URI to the css file:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
});

app.use('/assets', express.static('./app/files/assets'));
podlet.css({ value: '/assets/main.css' });
```

Set an absolute URL to where the css file is located:

```js
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
});

podlet.css({ value: 'http://cdn.mysite.com/assets/css/3ru39ur.css' });
```

#### prefix

If the method should prefix the return value with the value for `pathname`
set at the constructor.

_Examples:_

Return the full pathname, `/foo/assets/main.css`, to the css assets:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/foo',
});

podlet.css({ value: '/assets/main.css', prefix: true });
```

Prefix will be ignored if the returned value is an absolute URL.

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
into a manifest JSON string.

In a podlet it is possible to define up to 4 proxy targets and each target can be the [pathname](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/pathname) part of a [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) or an absolute URL.

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

Sets a remote target by defining an absolute URL:

```js
podlet.proxy('http://remote.site.com/api/', 'remoteApi');
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
possible to build absolute URLs to a podlet's proxy endpoints.

_Example:_

This example demonstrates a podlet server that exposes one HTTP POST endpoint which will be made publicly
available through a proxy in a layout and one content endpoint which supplies an HTML form
that, when submitted, will make a POST request to the HTTP POST endpoint we defined.

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
