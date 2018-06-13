# @podium/podlet

[![Build Status](https://travis.schibsted.io/Podium/podlet.svg?token=qt273uGfEz64UyWuNHJ1&branch=master)](https://travis.schibsted.io/Podium/podlet)

Module for building a Podlet server.


## Installation

```bash
$ npm i @podium/podlet --save
```


## Simple usage

Build a simple Podlet server with Express serving content but no fallback:

```js
const nunjucks = require('nunjucks');
const express = require('express');
const Podlet = require('../../');

const podlet = new Podlet();

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
| logger         | `console` | `string` | `false`  |
| assetServerUrl | `null`    | `string` | `false`  |
| assets         | `null`    | `object` | `false`  |

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
abstract out logging. Please see abslog for further details.


## API

The Podlet instance have the following API:


### .middleware()

A connect compatible middleware which take care of multiple operations needed for
a Podlet to fully work.

It does:

 * Parse the context from request from the layout server into a object on the `res.locals` object.
 * Adds a podium version http header to the http response.
 * Provides information on the `res.locals` object if the request are from a layout server or not.

This middleware should be mounted before defining any routes.

Example

```js
const app = express();
app.use(podlet.middleware());
```

Returns an Array of internal middleware performing the tasks described above.


### .content(pathname)

Method for defining the pathname for the content of the Podlet.

This method returns the value of `pathname` and internally keeps track of the
value of `pathname` for use when the podlet instance is serialized into manifest
content.

Examples:

Mounts the content on the default which is `/content`:

```js
const app = express();
app.get(podlet.content(), (req, res) => { ... });
```

Mounts the content on `/`:

```js
const app = express();
app.get(podlet.content('/'), (req, res) => { ... });
```

Mounts the content on `/foobar`:

```js
const app = express();
app.get(podlet.content('/foobar'), (req, res) => { ... });
```


### .fallback(pathname)

Method for defining the pathname for the fallback of the Podlet.

This method returns the value of `pathname` and internally keeps track of the
value of `pathname` for use when the podlet instance is serialized into manifest
content.

Examples:

Mounts the fallback on the default which is `/fallback`:

```js
const app = express();
app.get(podlet.fallback(), (req, res) => { ... });
```

Mounts the fallback on `/`:

```js
const app = express();
app.get(podlet.fallback('/'), (req, res) => { ... });
```

Mounts the fallback on `/foobar`:

```js
const app = express();
app.get(podlet.fallback('/barfoo'), (req, res) => { ... });
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

Serve assets from static file server and set relative URI to the javascript file:

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

Serve assets from static file server and set relative URI to the CSS file:

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

Within the route for the manifest one will normally serve the manifest.
This can be achieved by simply serializing the Podlet object instance.

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
