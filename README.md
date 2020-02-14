# @podium/podlet

A Module for building page fragment servers in a micro frontend architecture.

See the [official Podium documentation](https://podium-lib.io/) site.

[![Dependencies](https://img.shields.io/david/podium-lib/podlet.svg?style=flat-square)](https://david-dm.org/podium-lib/podlet)
[![GitHub Actions status](https://github.com/podium-lib/podlet/workflows/Run%20Lint%20and%20Tests/badge.svg)](https://github.com/podium-lib/podlet/actions?query=workflow%3A%22Run+Lint+and+Tests%22)
[![Known Vulnerabilities](https://snyk.io/test/github/podium-lib/podlet/badge.svg?targetFile=package.json&style=flat-square)](https://snyk.io/test/github/podium-lib/podlet?targetFile=package.json)

This is a module for building a podlet server. A podlet server is responsible for
generating HTML fragments which can then be used in a [@podium/layout] server to compose a
full HTML page.

This module can be used together with a plain node.js HTTP server or any HTTP
framework and any templating language of your choosing (or none if you prefer).

_Note:_ Connect compatible middleware based frameworks (such as [Express]) are considered
first class in Podium so this module provides a `.middleware()` method for
convenience.

For writing podlet servers with other HTTP frameworks, the following modules also exist:

-   [Fastify Podlet Plugin]
-   [Hapi Podlet Plugin]
-   [Koa Podlet Plugin]

## Installation

```bash
$ npm install @podium/podlet
```

## Getting started

Building a simple podlet server using [Express].

```js
const express = require('express');
const Podlet = require('@podium/podlet');

// create a new podlet instance
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.3.1',
    pathname: '/',
    development: true,
});

// create a new express app instance
const app = express();

// mount podlet middleware in express app
app.use(podlet.middleware());

// create a route to serve the podlet's manifest file
app.get(podlet.manifest(), (req, res) => {
    res.json(podlet);
});

// create a route to serve the podlet's content
app.get(podlet.content(), (req, res) => {
    res.podiumSend(`<div>hello world</div>`);
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

| option      | type      | default          | required |
| ----------- | --------- | ---------------- | -------- |
| name        | `string`  |                  | &check;  |
| version     | `string`  |                  | &check;  |
| pathname    | `string`  |                  | &check;  |
| manifest    | `string`  | `/manifest.json` |          |
| content     | `string`  | `/`              |          |
| fallback    | `string`  |                  |          |
| logger      | `object`  |                  |          |
| development | `boolean` | `false`          |          |

#### name

The name the podlet identifies itself by. This value must be in camelCase.

_Example:_

```js
const podlet = new Podlet({
    name: 'myPodlet';
});
```

#### version

The current version of the podlet. It is important that this value be updated
when a new version of the podlet is deployed since the page (layout) that the
podlet is displayed in uses this value to know whether to refresh the podlet's manifest and fallback content or
not.

_Example:_

```js
const podlet = new Podlet({
    version: '1.1.0';
});
```

#### pathname

Pathname for where a Podlet is mounted in an HTTP server. It is important that
this value matches where the entry point of a route is in an HTTP server since
this value is used to define where the manifest is for the podlet.

If the podlet is mounted at the "root", set `pathname` to `/`:

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

If the podlet is to be mounted at `/foo`, set pathname to `/foo` and mount
middleware and routes at or under `/foo`

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

Defines the pathname for the manifest of the podlet. Defaults to `/manifest.json`.

The value should be relative to the value set on the `pathname` argument. In
other words if a Podlet is mounted into an HTTP server at `/foo` and the
manifest is at `/foo/component.json`, set pathname and manifest as follows:

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

The value can be a relative URL and the `.manifest()` method can be used to
retrieve the value after it has been set.

#### content

Defines the pathname for the content of the Podlet. Defaults to `/`.

The value should be relative to the value set on the `pathname` argument. In
other words if a podlet is mounted into an HTTP server at `/foo` and the
content is at `/foo/index.html`, set pathname and content as follows:

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

The value can be a relative or absolute URL and the `.content()` method can be used to retrieve the value after it has been set.

#### fallback

Defines the pathname for the fallback of the Podlet. Defaults to an empty
string.

The value should be relative to the value set with the `pathname` argument. In
other words if a Podlet is mounted into an HTTP server at `/foo` and the
fallback is at `/foo/fallback.html`, set pathname and fallback as follows:

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

The value can be a relative or absolute URL and the `.fallback()` method can be
used to retrieve the value after it has been set.

#### logger

Any log4j compatible logger can be passed in and will be used for logging.
Console is also supported for easy test / development.

_Example:_

```js
const podlet = new Podlet({
    logger: console;
});
```

Under the hood [abslog] is used to abstract out logging. Please see [abslog] for
further details.

#### development

Turns development mode on or off. See the section about development mode.

## Podlet Instance

The podlet instance has the following API:

### .process(HttpIncoming, options)

Method for processing a incoming HTTP request. This method is intended to be
used to implement support for multiple HTTP frameworks and in most cases will not need to be
used directly by library users to create podlet servers.

What it does:

-   Handles detection of development mode and sets appropriate defaults
-   Runs context deserializing on the incoming request and sets a context object at `HttpIncoming.context`.

Returns an [HttpIncoming] object.

The method takes the following arguments:

#### HttpIncoming (required)

An instance of the [HttpIncoming] class.

```js
const { HttpIncoming } = require('@podium/utils');
const Podlet = require('@podium/podlet');

const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
});

app.use(async (req, res, next) => {
    const incoming = new HttpIncoming(req, res, res.locals);
    try {
        await podlet.process(incoming);
        if (!incoming.proxy) {
            res.locals.podium = result;
            next();
        }
    } catch (error) {
        next(error);
    }
});
```

#### options

| option | default | type      | required | details                                                                 |
| ------ | ------- | --------- | -------- | ----------------------------------------------------------------------- |
| proxy  | `true`  | `boolean` | `false`  | If `@podium/proxy` should be applied as part of the `.process()` method |

### .middleware()

A Connect compatible middleware function which takes care of the multiple
operations needed for a podlet to operate correctly. This function is more or less a wrapper for
the `.process()` method.

**Important:** This middleware must be mounted before defining any routes.

_Example:_

```js
const app = express();
app.use(podlet.middleware());
```

Returns an Array of internal middleware that performs the tasks described above.

### .manifest(options)

This method returns the value of the `manifest` argument that has been set on the constructor.

_Examples:_

Set the manifest using the default pathname which is `/manifest.json`:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
});

app.get(podlet.manifest(), (req, res) => { ... });
```

Set the manifest using `/component.json`:

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

Podium expects the podlet's manifest route to return a JSON document describing
the podlet. This can be achieved by simply serializing the podlet object
instance.

Example:

```js
const app = express();
app.get(podlet.manifest(), (req, res) => {
    res.status(200).json(podlet);
});
```

The route will then respond with something like:

```json
{
    "name": "myPodlet",
    "version": "1.0.0",
    "content": "/",
    "fallback": "/fallback",
    "css": [],
    "js": [],
    "proxy": {}
}
```

### options

| option | type      | default | required |
| ------ | --------- | ------- | -------- |
| prefix | `boolean` | `false` |          |

#### prefix

Sets whether the method should prefix the return value with the value for
`pathname` that was set in the constructor.

_Examples:_

return the full pathname to the manifest (`/foo/component.json`):

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

This method returns the value of the `content` argument set in the constructor.

_Examples:_

Set the content using the default pathname (`/`):

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
});

app.get(podlet.content(), (req, res) => { ... });
```

Set the content path to `/index.html`:

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

Set the content path to `/content` and define multiple sub-routes each taking different
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

| option | type      | default | required |
| ------ | --------- | ------- | -------- |
| prefix | `boolean` | `false` |          |

#### prefix

Specifies whether the method should prefix the return value with the `pathname` value
that was set in the constructor.

_Examples:_

return the full pathname to the content (`/foo/index.html`):

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

The prefix will be ignored if the returned value is an absolute URL.

### .fallback(options)

This method returns the value of the `fallback` argument set in the constructor.

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

| option | type      | default | required |
| ------ | --------- | ------- | -------- |
| prefix | `boolean` | `false` |          |

#### prefix

Specifies whether the fallback method should prefix the return value with the value for `pathname` set
in the constructor.

_Examples:_

Return the full pathname to the fallback (`/foo/fallback.html`):

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

The prefix will be ignored if the returned value is an absolute URL.

### .js(options)

Sets the pathname for a podlet's javascript assets.

`options` can be either an object or an array of options objects as described below.

When a value is set it will be internally kept and used when the podlet
instance is serialized into a manifest JSON string.

### options

| option | type      | default   | required |
| ------ | --------- | --------- | -------- |
| value  | `string`  |           |          |
| prefix | `boolean` | `false`   |          |
| type   | `string`  | `default` |          |

#### value

Used to set the `pathname` for the podlets JavaScript assets. This value
can be a URL at which the podlet's user facing JavaScript is served. The value
can be either the [pathname] of a [URL] or an absolute URL.

_Examples:_

Serve a javascript file at `/assets/main.js`:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
});

podlet.js({ value: '/assets/main.js' });

// or

podlet.js([{ value: '/assets/main.js' }, { value: '/assets/secondary.js' }]);
```

Serve assets statically along side the app and set a relative URI to the
JavaScript file:

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

Specify whether the method should prefix the return value with the value for
`pathname` that was set in the constructor.

_Examples:_

Return the full pathname, `/foo/assets/main.js`, to the JavaScript assets:

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

#### type

Set the type of script which is set. `default` indicates an unknown type.
`module` inidcates as ES6 module.

### .css(options)

Sets the options for a podlet's CSS assets.

`options` can be either an object or an array of options objects as described below.

When a value is set it will be internally kept and used when the podlet
instance is serialized into a manifest JSON string.

### options

| option | type      | default | required |
| ------ | --------- | ------- | -------- |
| value  | `string`  |         |          |
| prefix | `boolean` | `false` |          |

#### value

Used to set the pathname for the CSS assets for the Podlet. The value can be a
URL at which the podlet's user facing CSS is served. The value can be the
[pathname] of a [URL] or an absolute URL.

The value can be set only once. If called multiple times with a value, the
method will throw. The method can be called multiple times to retrieve the
value however.

_Examples:_

Serve a CSS file at `/assets/main.css`:

```js
const app = express();
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
});

podlet.css({ value: '/assets/main.css' });

// or

podlet.css([{ value: '/assets/main.css' }, { value: '/assets/secondary.css' }]);
```

Serve assets from a static file server and set a relative URI to the CSS file:

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

Set an absolute URL to where the CSS file is located:

```js
const podlet = new Podlet({
    name: 'myPodlet',
    version: '1.0.0',
    pathname: '/',
});

podlet.css({ value: 'http://cdn.mysite.com/assets/css/3ru39ur.css' });
```

#### prefix

Sets whether the method should prefix the return value with the value for
`pathname` set in the constructor.

_Examples:_

Return the full pathname (`/foo/assets/main.css`) to the CSS assets:

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

### .proxy({ target, name })

Method for defining proxy targets to be mounted by the [@podium/proxy] module
in a layout server. It's worth mentioning that this will **not** mount a proxy
in the server where the podlet instance is used.

Proxying is intended to be used as a way to make podlet endpoints public. A
common use case for this is creating endpoints for client side code to interact
with (ajax requests from the browser). One might also make use of proxying to
pass form submissions from the browser back to the podlet.

This method returns the value of the `target` argument and internally keeps
track of the value of `target` for use when the podlet instance is serialized
into a manifest JSON string.

In a podlet it is possible to define up to 4 proxy targets and each target can
be the [pathname] part of a [URL] or an absolute URL.

For each podlet, each proxy target must have a unique name.

_Examples:_

Mounts one proxy target `/api` with the name `api`:

```js
const app = express();
app.get(podlet.proxy({ target: '/api', name: 'api' }), (req, res) => { ... });
```

Defines multiple endpoints on one proxy target `/api` with the name `api`:

```js
const app = express();
app.get('/api', (req, res) => { ... });
app.get('/api/foo', (req, res) => { ... });
app.post('/api/foo', (req, res) => { ... });
app.get('/api/bar/:id', (req, res) => { ... });

podlet.proxy({ target: '/api', name: 'api' });
```

Sets a remote target by defining an absolute URL:

```js
podlet.proxy({ target: 'http://remote.site.com/api/', name: 'remoteApi' });
```

#### Knowing where proxy endpoints are mounted in a layout

When proxy targets are mounted in a layout server they are namespaced to avoid
proxy targets from multiple podlets conflicting with each other.

This can cause a proxy endpoint in a podlet to have different pathnames in
different layout servers if the podlet is included in multiple layout servers.

Information regarding where proxy endpoints are mounted in any given layout can
be found by inspecting the [publicPathname] key of the [@podium/context] for
each request made to the podlet by a layout.

By combining [publicPathname] and [mountOrigin] from the [@podium/context]
object, it is possible to build absolute URLs to a podlet's proxy endpoints.

_Example:_

This example demonstrates a podlet server that exposes one HTTP POST endpoint
which will be made publicly available through a proxy in a layout and one
content endpoint which supplies an HTML form that, when submitted, will make a
POST request to the HTTP POST endpoint we defined.

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
app.post(podlet.proxy({ target: '/api', name: 'api' }), (req, res) => { ... });

// content route serving an HTML form
app.get(podlet.content(), (req, res) => {
    const ctx = res.locals.podium.context;
    res.podiumSend(`
        <form action="${ctx.mountOrigin}${ctx.publicPathname}/api" method="post">
            [ ... ]
        </form>
    `)
});

app.listen(7100);
```

### res.podiumSend(fragment)

Method on the `http.ServerResponse` object for sending an HTML fragment. Calls
the send / write method on the `http.ServerResponse` object.

When in development mode this method will wrap the provided fragment in a
default HTML document before dispatching. When not in development mode, this
method will just dispatch the fragment.

_Example of sending an HTML fragment:_

```js
app.get(podlet.content(), (req, res) => {
    res.podiumSend('<h1>Hello World</h1>');
});
```

### .defaults(context)

Alters the default context set when in development mode.

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

The default development mode context can be overridden by passing an object with
the desired key / values to override.

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

Additional values not defined by Podium can also be appended to the default
development mode context in the same way.

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

N.B. The default development mode context will only be appended to the response
when the constructor argument `development` is set to `true`.

### .view(template)

Override the default encapsulating HTML document when in development mode.

Takes a function in the following shape:

```js
podlet.view(data => `<!doctype html>
<html lang="${data.locale}">
    <head>
        <meta charset="${data.encoding}">
        <title>${data.title}</title>
        <link href="${data.css}" rel="stylesheet">
        <script src="${title.js}" defer></script>
        ${title.head}
    </head>
    <body>
        ${title.body}
    </body>
</html>`;
);
```

## Development mode

In most cases podlets are fragments of a whole HTML document. When a layout
server is requesting a podlet's content or fallback, the podlet should serve
just that fragment and not a whole HTML document with its `<html>`, `<head>`
and `<body>`. It is also the case that when a layout server is requesting a
podlet it provides a context.

These things can prove challenging for local development since accessing a
podlet directly, from a web browser, in local development will render the
podlet without either an encapsulating HTML document or a Podium context that
the podlet might need to function properly.

To solve this it is possible to switch a podlet to development mode by setting
the `development` argument in the constructor to `true`.

When in development mode a default context on the HTTP response will be set and
an encapsulating HTML document will be provided (so long as `res.podiumSend()`
is used) when dispatching the content or fallback.

The default HTML document for encapsulating a fragment will reference the
values set on `.css()` and `.js()` and use `locale` from the default context to
set language on the document.

The default context in development mode can be altered by the `.defaults()`
method of the podlet instance.

The default encapsulating HTML document used in development mode can be replaced
by the `.view()` method of the podlet instance.

_Note:_ Only turn on development mode during local development, ensure it is turned
off when in production.

_Example of turning on development mode only in local development:_

```js
const podlet = new Podlet({
    development: process.env.NODE_ENV !== 'production';
});
```

When a layout server sends a request to a podlet in development mode, the
default context will be overridden by the context from the layout server and
the encapsulating HTML document will not be applied.

## License

Copyright (c) 2019 FINN.no

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[@podium/context]: https://github.com/podium-lib/context '@podium/context'
[@podium/layout]: https://github.com/podium-lib/layout '@podium/layout'
[@podium/proxy]: https://github.com/podium-lib/proxy '@podium/proxy'
[express]: https://expressjs.com/ 'Express'
[hapi podlet plugin]: https://github.com/podium-lib/hapi-podlet 'Hapi Podlet Plugin'
[httpincoming]: https://github.com/podium-lib/utils/blob/master/lib/http-incoming.js 'HttpIncoming'
[publicpathname]: https://github.com/podium-lib/context#public-pathname '`publicPathname`'
[mountorigin]: https://github.com/podium-lib/context#mount-origin '`mountOrigin`'
[abslog]: https://github.com/trygve-lie/abslog 'abslog'
[pathname]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/pathname 'pathname'
[url]: https://developer.mozilla.org/en-US/docs/Web/API/URL 'URL'
