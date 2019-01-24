'use strict';

const Metrics = require('@metrics/client');
const express = require('express');
const Podlet = require('../');
const http = require('http');
const url = require('url');
const template = require('../lib/template');

/**
 * Fake server utility
 * Spinns up a http server and attaches a Podlets instanse .middleware()
 * The .get() does a proper http request to the http server and returns
 * a JSON with the http headers sent by the server and the res.locals
 * object set by the Podlet instanse .middleware()
 */

class FakeServer {
    constructor(podlet, middleware) {
        this.app = express();
        this.app.use(podlet.middleware());
        this.app.use(middleware || ((req, res) => {
                      res.status(200).json(res.locals);
                  })
        );
        this.server = undefined;
        this.address = '';
    }

    listen() {
        return new Promise(resolve => {
            this.server = this.app.listen(0, 'localhost', () => {
                this.address = `http://${this.server.address().address}:${
                    this.server.address().port
                }`;

                resolve(this.address);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.server.close(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    get(options = {}) {
        return new Promise((resolve, reject) => {
            const opts = url.parse(this.address);
            Object.assign(opts, options);

            http.get(opts, res => {
                const chunks = [];
                res.on('data', chunk => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    resolve({
                        headers: res.headers,
                        response: opts.raw
                            ? chunks.join('')
                            : JSON.parse(chunks.join('')),
                    });
                });
            }).on('error', error => {
                reject(error);
            });
        });
    }
}

const DEFAULT_OPTIONS = { name: 'foo', version: 'v1.0.0', pathname: '/' };

// #############################################
// Constructor
// #############################################

test('Podlet() - instantiate new podlet object - should create an object', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    expect(podlet).toBeInstanceOf(Podlet);
});

test('Podlet() - object tag - should be PodiumPodlet', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    expect(Object.prototype.toString.call(podlet)).toEqual(
        '[object PodiumPodlet]'
    );
});

test('Podlet() - no value given to "name" argument - should throw', () => {
    expect.hasAssertions();
    expect(() => {
        const podlet = new Podlet({ version: 'v1.0.0', pathname: '/' }); // eslint-disable-line no-unused-vars
    }).toThrowError(
        'The value, "", for the required argument "name" on the Podlet constructor is not defined or not valid.'
    );
});

test('Podlet() - invalid value given to "name" argument - should throw', () => {
    expect.hasAssertions();
    expect(() => {
        // Yeah; silly formatting, but only way to please ESLint
        const options = {
            name: 'foo bar',
            version: 'v1.0.0',
            pathname: '/',
        };
        const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
    }).toThrowError(
        'The value, "foo bar", for the required argument "name" on the Podlet constructor is not defined or not valid.'
    );
});

test('Podlet() - no value given to "version" argument - should throw', () => {
    expect.hasAssertions();
    expect(() => {
        const podlet = new Podlet({ name: 'foo', pathname: '/' }); // eslint-disable-line no-unused-vars
    }).toThrowError(
        'The value, "", for the required argument "version" on the Podlet constructor is not defined or not valid.'
    );
});

test('Podlet() - invalid value given to "version" argument - should throw', () => {
    expect.hasAssertions();
    expect(() => {
        // Yeah; silly formatting, but only way to please ESLint
        const options = {
            name: 'foo',
            version: true,
            pathname: '/',
        };
        const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
    }).toThrowError(
        'The value, "true", for the required argument "version" on the Podlet constructor is not defined or not valid.'
    );
});

test('Podlet() - no value given to "pathname" argument - should throw', () => {
    expect.hasAssertions();
    expect(() => {
        const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' }); // eslint-disable-line no-unused-vars
    }).toThrowError(
        'The value, "", for the required argument "pathname" on the Podlet constructor is not defined or not valid.'
    );
});

test('Podlet() - invalid value given to "pathname" argument - should throw', () => {
    expect.hasAssertions();
    expect(() => {
        // Yeah; silly formatting, but only way to please ESLint
        const options = {
            name: 'foo',
            version: 'v1.0.0',
            pathname: 'æ / ø',
        };
        const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
    }).toThrowError(
        'The value, "æ / ø", for the required argument "pathname" on the Podlet constructor is not defined or not valid.'
    );
});

test('Podlet() - invalid value given to "manifest" argument - should throw', () => {
    expect.hasAssertions();
    expect(() => {
        // Yeah; silly formatting, but only way to please ESLint
        const options = Object.assign({ manifest: 'æ / ø' }, DEFAULT_OPTIONS);
        const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
    }).toThrowError(
        'The value, "æ / ø", for the optional argument "manifest" on the Podlet constructor is not valid.'
    );
});

test('Podlet() - invalid value given to "content" argument - should throw', () => {
    expect.hasAssertions();
    expect(() => {
        // Yeah; silly formatting, but only way to please ESLint
        const options = Object.assign({ content: 'æ / ø' }, DEFAULT_OPTIONS);
        const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
    }).toThrowError(
        'The value, "æ / ø", for the optional argument "content" on the Podlet constructor is not valid.'
    );
});

test('Podlet() - invalid value given to "fallback" argument - should throw', () => {
    expect.hasAssertions();
    expect(() => {
        // Yeah; silly formatting, but only way to please ESLint
        const options = Object.assign({ fallback: 'æ / ø' }, DEFAULT_OPTIONS);
        const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
    }).toThrowError(
        'The value, "æ / ø", for the optional argument "fallback" on the Podlet constructor is not valid.'
    );
});

test('Podlet() - serialize default values - should set "name" to same as on constructor', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.name).toEqual('foo');
});

test('Podlet() - serialize default values - should set "version" to same as on constructor', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.version).toEqual('v1.0.0');
});

test('Podlet() - serialize default values - should set "content" to "/"', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.content).toEqual('/');
});

test('Podlet() - serialize default values - should set "fallback" to empty String', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.fallback).toEqual('');
});

test('Podlet() - serialize default values - should set "assets.js" to empty String', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.assets.js).toEqual('');
});

test('Podlet() - serialize default values - should set "assets.css" to empty String', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.assets.css).toEqual('');
});

test('Podlet() - serialize default values - should set "proxy" to empty Object', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.proxy).toEqual({});
});

// #############################################
// .pathname()
// #############################################

test('.pathname() - call method - should return default value', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = podlet.pathname();
    expect(result).toEqual('/');
});

test('.pathname() - constructor has "pathname" set - should return set value', () => {
    const options = Object.assign({}, DEFAULT_OPTIONS, { pathname: '/foo' });
    const podlet = new Podlet(options);
    const result = podlet.pathname();
    expect(result).toEqual('/foo');
});

// #############################################
// .manifest()
// #############################################

test('.manifest() - call method - should return default value', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = podlet.manifest();
    expect(result).toEqual('/manifest.json');
});

test('.manifest() - constructor has "pathname" and "manifest" set - "prefix" argument is default - should return "manifest" value', () => {
    const options = Object.assign({}, DEFAULT_OPTIONS, {
        pathname: '/foo',
        manifest: '/component.json',
    });
    const podlet = new Podlet(options);

    const result = podlet.manifest();
    expect(result).toEqual('/component.json');
});

test('.manifest() - constructor has "pathname" and "manifest" set - "prefix" argument is set "true" - should return "manifest" prefixed with "pathname"', () => {
    const options = Object.assign({}, DEFAULT_OPTIONS, {
        pathname: '/foo',
        manifest: '/component.json',
    });
    const podlet = new Podlet(options);

    const result = podlet.manifest({ prefix: true });
    expect(result).toEqual('/foo/component.json');
});

// #############################################
// .content()
// #############################################

test('.content() - call method - should return default value', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);

    const result = podlet.content();
    const parsed = JSON.parse(JSON.stringify(podlet));

    expect(result).toEqual('/');
    expect(parsed.content).toEqual('/');
});

test('.content() - constructor has "pathname" and "content" set - "prefix" argument is default - should return "content" value', () => {
    const options = Object.assign({}, DEFAULT_OPTIONS, {
        pathname: '/foo',
        content: '/bar/foo.html',
    });
    const podlet = new Podlet(options);

    const result = podlet.content();
    const parsed = JSON.parse(JSON.stringify(podlet));

    expect(result).toEqual('/bar/foo.html');
    expect(parsed.content).toEqual('/bar/foo.html');
});

test('.content() - constructor has "pathname" and "content" set - "prefix" argument is set "true" - should return "content" prefixed with "pathname"', () => {
    const options = Object.assign({}, DEFAULT_OPTIONS, {
        pathname: '/foo',
        content: '/bar/foo.html',
    });
    const podlet = new Podlet(options);

    const result = podlet.content({ prefix: true });
    const parsed = JSON.parse(JSON.stringify(podlet));

    expect(result).toEqual('/foo/bar/foo.html');
    expect(parsed.content).toEqual('/bar/foo.html');
});

test('.content() - constructor has "content" set with absolute URI - should return absolute URI', () => {
    const options = Object.assign({}, DEFAULT_OPTIONS, {
        content: 'http://somewhere.remote.com',
    });
    const podlet = new Podlet(options);

    const result = podlet.content();
    const parsed = JSON.parse(JSON.stringify(podlet));

    expect(result).toEqual('http://somewhere.remote.com');
    expect(parsed.content).toEqual('http://somewhere.remote.com');
});

// #############################################
// .fallback()
// #############################################

test('.fallback() - call method - should return default value', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);

    const result = podlet.fallback();
    const parsed = JSON.parse(JSON.stringify(podlet));

    expect(result).toEqual('');
    expect(parsed.fallback).toEqual('');
});

test('.fallback() - constructor has "pathname" and "fallback" set - "prefix" argument is default - should return "fallback" value', () => {
    const options = Object.assign({}, DEFAULT_OPTIONS, {
        pathname: '/foo',
        fallback: '/bar/foo.html',
    });
    const podlet = new Podlet(options);

    const result = podlet.fallback();
    const parsed = JSON.parse(JSON.stringify(podlet));

    expect(result).toEqual('/bar/foo.html');
    expect(parsed.fallback).toEqual('/bar/foo.html');
});

test('.fallback() - constructor has "pathname" and "fallback" set - "prefix" argument is set "true" - should return "fallback" prefixed with "pathname"', () => {
    const options = Object.assign({}, DEFAULT_OPTIONS, {
        pathname: '/foo',
        fallback: '/bar/foo.html',
    });
    const podlet = new Podlet(options);

    const result = podlet.fallback({ prefix: true });
    const parsed = JSON.parse(JSON.stringify(podlet));

    expect(result).toEqual('/foo/bar/foo.html');
    expect(parsed.fallback).toEqual('/bar/foo.html');
});

test('.fallback() - constructor has "fallback" set with absolute URI - should return absolute URI', () => {
    const options = Object.assign({}, DEFAULT_OPTIONS, {
        fallback: 'http://somewhere.remote.com',
    });
    const podlet = new Podlet(options);

    const result = podlet.fallback();
    const parsed = JSON.parse(JSON.stringify(podlet));

    expect(result).toEqual('http://somewhere.remote.com');
    expect(parsed.fallback).toEqual('http://somewhere.remote.com');
});

// #############################################
// .css()
// #############################################

test('.css() - call method with no arguments - should return default value', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = podlet.css();
    expect(result).toEqual('');
});

test('.css() - set legal value on "value" argument - should return set value', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);

    const result = podlet.css({ value: '/foo/bar' });
    const parsed = JSON.parse(JSON.stringify(podlet));

    expect(result).toEqual('/foo/bar');
    expect(parsed.assets.css).toEqual('/foo/bar');
});

test('.css() - set "prefix" argument to "true" - should prefix value returned by method, but not in manifest', () => {
    const options = Object.assign({}, DEFAULT_OPTIONS, {
        pathname: '/xyz',
    });
    const podlet = new Podlet(options);

    const result = podlet.css({ value: '/foo/bar', prefix: true });
    const parsed = JSON.parse(JSON.stringify(podlet));

    expect(result).toEqual('/xyz/foo/bar');
    expect(parsed.assets.css).toEqual('/foo/bar');
});

test('.css() - set legal absolute value on "value" argument - should set "css" to set value when serializing Object', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.css({ value: 'http://somewhere.remote.com' });
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.assets.css).toEqual('http://somewhere.remote.com');
});

test('.css() - set illegal value on "value" argument - should throw', () => {
    expect.hasAssertions();
    const podlet = new Podlet(DEFAULT_OPTIONS);

    expect(() => {
        podlet.css({ value: '/foo / bar' });
    }).toThrowError(
        'Value on argument variable "value", "/foo / bar", is not valid'
    );
});

test('.css() - call method with "value" argument, then call it a second time with no argument - should return first set value on second call', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.css({ value: '/foo/bar' });
    const result = podlet.css();
    expect(result).toEqual('/foo/bar');
});

test('.css() - call method twice with a value for "value" argument - should throw', () => {
    expect.hasAssertions();
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.css({ value: '/foo/bar' });

    expect(() => {
        podlet.css({ value: '/foo/bar' });
    }).toThrowError('Value for "css" has already been set');
});

// #############################################
// .js()
// #############################################

test('.js() - call method with no arguments - should return default value', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = podlet.js();
    expect(result).toEqual('');
});

test('.js() - set legal value on "value" argument - should return set value', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);

    const result = podlet.js({ value: '/foo/bar' });
    const parsed = JSON.parse(JSON.stringify(podlet));

    expect(result).toEqual('/foo/bar');
    expect(parsed.assets.js).toEqual('/foo/bar');
});

test('.js() - set "prefix" argument to "true" - should prefix value returned by method, but not in manifest', () => {
    const options = Object.assign({}, DEFAULT_OPTIONS, {
        pathname: '/xyz',
    });
    const podlet = new Podlet(options);

    const result = podlet.js({ value: '/foo/bar', prefix: true });
    const parsed = JSON.parse(JSON.stringify(podlet));

    expect(result).toEqual('/xyz/foo/bar');
    expect(parsed.assets.js).toEqual('/foo/bar');
});

test('.js() - set legal absolute value on "value" argument - should set "js" to set value when serializing Object', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.js({ value: 'http://somewhere.remote.com' });
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.assets.js).toEqual('http://somewhere.remote.com');
});

test('.js() - set illegal value on "value" argument - should throw', () => {
    expect.hasAssertions();
    const podlet = new Podlet(DEFAULT_OPTIONS);

    expect(() => {
        podlet.js({ value: '/foo / bar' });
    }).toThrowError(
        'Value on argument variable "value", "/foo / bar", is not valid'
    );
});

test('.js() - call method with "value" argument, then call it a second time with no argument - should return first set value on second call', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.js({ value: '/foo/bar' });
    const result = podlet.js();
    expect(result).toEqual('/foo/bar');
});

test('.js() - call method twice with a value for "value" argument - should throw', () => {
    expect.hasAssertions();
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.js({ value: '/foo/bar' });

    expect(() => {
        podlet.js({ value: '/foo/bar' });
    }).toThrowError('Value for "js" has already been set');
});

// #############################################
// .middleware()
// #############################################

test('.middleware() - call method - should append podlet name on "res.locals.podium.name"', async () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeServer(podlet);
    await server.listen();

    const result = await server.get();
    expect(result.response.podium.name).toEqual(DEFAULT_OPTIONS.name);

    await server.close();
});

test('.middleware() - .css() is NOT set with a value - should append empty String to "res.locals.podium.css"', async () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeServer(podlet);
    await server.listen();

    const result = await server.get();
    expect(result.response.podium.css).toEqual('');

    await server.close();
});

test('.middleware() - .css() is set with a value - should append value to "res.locals.podium.css"', async () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.css({ value: '/style.css' });

    const server = new FakeServer(podlet);
    await server.listen();

    const result = await server.get();
    expect(result.response.podium.css).toEqual(podlet.css());

    await server.close();
});

test('.middleware() - .js() is NOT set with a value - should append empty String to "res.locals.podium.js"', async () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeServer(podlet);
    await server.listen();

    const result = await server.get();
    expect(result.response.podium.js).toEqual('');

    await server.close();
});

test('.middleware() - .js() is set with a value - should append value to "res.locals.podium.js"', async () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.js({ value: '/script.js' });

    const server = new FakeServer(podlet);
    await server.listen();

    const result = await server.get();
    expect(result.response.podium.js).toEqual(podlet.js());

    await server.close();
});

test('.middleware() - contructor argument "development" is NOT set and "user-agent" on request is NOT set to "@podium/client" - should append "false" value on "res.locals.podium.decorate"', async () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeServer(podlet);
    await server.listen();

    const result = await server.get();
    expect(result.response.podium.development).toEqual(false);

    await server.close();
});

test('.middleware() - contructor argument "development" is set to "true" and "user-agent" on request is set to "@podium/client" - should append "false" value on "res.locals.podium.decorate"', async () => {
    const options = Object.assign({}, DEFAULT_OPTIONS, {
        development: true,
    });
    const podlet = new Podlet(options);
    const server = new FakeServer(podlet);
    await server.listen();

    const result = await server.get({
        headers: {
            'user-agent': '@podium/client',
        },
    });
    expect(result.response.podium.development).toEqual(false);

    await server.close();
});

test('.middleware() - contructor argument "development" is set to "true" and "user-agent" on request is NOT set to "@podium/client" - should append "true" value on "res.locals.podium.decorate"', async () => {
    const options = Object.assign({}, DEFAULT_OPTIONS, {
        development: true,
    });
    const podlet = new Podlet(options);
    const server = new FakeServer(podlet);
    await server.listen();

    const result = await server.get();
    expect(result.response.podium.development).toEqual(true);

    await server.close();
});

test('.middleware() - valid "version" value is set on constructor - should append "podlet-version" http header with the given version value', async () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeServer(podlet);
    await server.listen();

    const result = await server.get();
    expect(result.headers['podlet-version']).toEqual('v1.0.0');

    await server.close();
});

// #############################################
// .render()
// #############################################

/*
test('.render() - contructor argument "development" is NOT set to "true" - should NOT append default wireframe document', async () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeServer(podlet, (req, res) => {
        res.send(podlet.render('<h1>OK!</h1>', res));
    });

    await server.listen();
    const result = await server.get({ raw: true });

    expect(result.response).toEqual('<h1>OK!</h1>');
    await server.close();
});

test('.render() - contructor argument "development" is set to "true" - should append default wireframe document', async () => {
    const options = Object.assign({}, DEFAULT_OPTIONS, {
        development: true,
    });
    const podlet = new Podlet(options);
    const server = new FakeServer(podlet, (req, res) => {
        res.send(podlet.render('<h1>OK!</h1>', res));
    });

    await server.listen();
    const result = await server.get({ raw: true });

    expect(result.response).toEqual(
        template('<h1>OK!</h1>', {
            locals: {
                podium: {
                    name: DEFAULT_OPTIONS.name,
                },
            },
        })
    );
    await server.close();
});
*/

// #############################################
// .res.podiumSend()
// #############################################

test('res.podiumSend() - .podiumSend() method - should be a function on http.response', async () => {
    expect.hasAssertions();

    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeServer(podlet, (req, res) => {
        expect(typeof res.podiumSend).toBe('function');
        res.json({});
    });

    await server.listen();
    await server.get();
    await server.close();
});

test('res.podiumSend() - contructor argument "development" is NOT set to "true" - should NOT append default wireframe document', async () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeServer(podlet, (req, res) => {
        res.podiumSend('<h1>OK!</h1>');
    });

    await server.listen();
    const result = await server.get({ raw: true });

    expect(result.response).toEqual('<h1>OK!</h1>');
    await server.close();
});

test('res.podiumSend() - contructor argument "development" is set to "true" - should append default wireframe document', async () => {
    const options = Object.assign({}, DEFAULT_OPTIONS, {
        development: true,
    });
    const podlet = new Podlet(options);
    const server = new FakeServer(podlet, (req, res) => {
        res.podiumSend('<h1>OK!</h1>');
    });

    await server.listen();
    const result = await server.get({ raw: true });

    expect(result.response).toEqual(
        template('<h1>OK!</h1>', {
            name: DEFAULT_OPTIONS.name,
        })
    );
    await server.close();
});

// #############################################
// .defaults()
// #############################################

test('.defaults() - call method with no arguments - should return default value', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = podlet.defaults();
    expect(result).toEqual({
        debug: 'false',
        deviceType: 'desktop',
        locale: 'en-US',
        mountOrigin: '',
        mountPathname: '/',
        publicPathname: '/',
        requestedBy: 'foo',
    });
});

test('.defaults() - set value on "context" argument - should return set value', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = podlet.defaults({ foo: 'bar' });
    expect(result).toEqual({
        debug: 'false',
        deviceType: 'desktop',
        foo: 'bar',
        locale: 'en-US',
        mountOrigin: '',
        mountPathname: '/',
        publicPathname: '/',
        requestedBy: 'foo',
    });
});

test('.defaults() - call method with "context" argument, then call it a second time with no argument - should return first set value on second call', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.defaults({ foo: 'bar' });
    const result = podlet.defaults();
    expect(result).toEqual({
        debug: 'false',
        deviceType: 'desktop',
        foo: 'bar',
        locale: 'en-US',
        mountOrigin: '',
        mountPathname: '/',
        publicPathname: '/',
        requestedBy: 'foo',
    });
});

test('.defaults() - constructor argument "development" is not set - should not append a default context to "res.locals"', async () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeServer(podlet);
    await server.listen();

    const result = await server.get();
    expect(result.response.podium.context).toEqual({});

    await server.close();
});

test('.defaults() - constructor argument "development" is to "true" - should append a default context to "res.locals"', async () => {
    const podlet = new Podlet({
        name: 'foo',
        version: 'v1.0.0',
        pathname: '/',
        development: true,
    });
    const server = new FakeServer(podlet);
    const address = await server.listen();
    const result = await server.get();

    expect(result.response.podium.context.debug).toEqual('false');
    expect(result.response.podium.context.locale).toEqual('en-US');
    expect(result.response.podium.context.deviceType).toEqual('desktop');
    expect(result.response.podium.context.requestedBy).toEqual('foo');
    expect(result.response.podium.context.mountOrigin).toEqual(address);
    expect(result.response.podium.context.mountPathname).toEqual('/');
    expect(result.response.podium.context.publicPathname).toEqual('/');

    await server.close();
});

test('.defaults() - set "context" argument where a key overrides one existing context value - should override default context value but keep rest untouched', async () => {
    const podlet = new Podlet({
        name: 'foo',
        version: 'v1.0.0',
        pathname: '/',
        development: true,
    });
    podlet.defaults({
        locale: 'no-NO',
    });
    const server = new FakeServer(podlet);
    const address = await server.listen();
    const result = await server.get();

    expect(result.response.podium.context.debug).toEqual('false');
    expect(result.response.podium.context.locale).toEqual('no-NO');
    expect(result.response.podium.context.deviceType).toEqual('desktop');
    expect(result.response.podium.context.requestedBy).toEqual('foo');
    expect(result.response.podium.context.mountOrigin).toEqual(address);
    expect(result.response.podium.context.mountPathname).toEqual('/');
    expect(result.response.podium.context.publicPathname).toEqual('/');

    await server.close();
});

test('.defaults() - set "context" argument where a key is not a default context value - should append key and value to default context', async () => {
    const podlet = new Podlet({
        name: 'foo',
        version: 'v1.0.0',
        pathname: '/',
        development: true,
    });
    podlet.defaults({
        foo: 'bar',
    });
    const server = new FakeServer(podlet);
    const address = await server.listen();
    const result = await server.get();

    expect(result.response.podium.context.foo).toEqual('bar');
    expect(result.response.podium.context.debug).toEqual('false');
    expect(result.response.podium.context.locale).toEqual('en-US');
    expect(result.response.podium.context.deviceType).toEqual('desktop');
    expect(result.response.podium.context.requestedBy).toEqual('foo');
    expect(result.response.podium.context.mountOrigin).toEqual(address);
    expect(result.response.podium.context.mountPathname).toEqual('/');
    expect(result.response.podium.context.publicPathname).toEqual('/');

    await server.close();
});

// #############################################
// .proxy()
// #############################################

test('.proxy() - no arguments - should throw', () => {
    expect.hasAssertions();
    const podlet = new Podlet(DEFAULT_OPTIONS);
    expect(() => {
        podlet.proxy();
    }).toThrowError(
        'Value on argument variable "target", "null", is not valid'
    );
});

test('.proxy() - set a non valid "target" argument value - should throw', () => {
    expect.hasAssertions();
    const podlet = new Podlet(DEFAULT_OPTIONS);
    expect(() => {
        podlet.proxy({ target: 'æøå æåø', name: 'foo' });
    }).toThrowError(
        'Value on argument variable "target", "æøå æåø", is not valid'
    );
});

test('.proxy() - set a non valid "name" argument value - should throw', () => {
    expect.hasAssertions();
    const podlet = new Podlet(DEFAULT_OPTIONS);
    expect(() => {
        podlet.proxy({ target: '/foo', name: 'æøå æåø' });
    }).toThrowError(
        'Value on argument variable "name", "æøå æåø", is not valid'
    );
});

test('.proxy() - set more than 4 proxy entries - should throw', () => {
    expect.hasAssertions();
    const podlet = new Podlet(DEFAULT_OPTIONS);
    expect(() => {
        podlet.proxy({ target: '/foo1', name: 'foo1' });
        podlet.proxy({ target: '/foo2', name: 'foo2' });
        podlet.proxy({ target: '/foo3', name: 'foo3' });
        podlet.proxy({ target: '/foo4', name: 'foo4' });
        podlet.proxy({ target: '/foo5', name: 'foo5' });
    }).toThrowError(
        'One can not define more than 4 proxy targets for each podlet'
    );
});

test('.proxy() - set valid "name" and "target" - should return target', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = podlet.proxy({ target: '/foo', name: 'foo' });
    expect(result).toEqual('/foo');
});

// #############################################
// .view()
// #############################################

test('.view() - set a non valid argument value - should throw', () => {
    expect.hasAssertions();
    const podlet = new Podlet(DEFAULT_OPTIONS);
    expect(() => {
        podlet.view('test');
    }).toThrowError('Value on argument variable "template" must be a function');
});

test('.view() - append a custom wireframe document - should render development output with custom wireframe document', async () => {
    const options = Object.assign({}, DEFAULT_OPTIONS, {
        development: true,
    });
    const podlet = new Podlet(options);
    podlet.view(str => `<div>${str}</div>`);

    const server = new FakeServer(podlet, (req, res) => {
        res.podiumSend('<h1>OK!</h1>');
    });

    await server.listen();
    const result = await server.get({ raw: true });

    expect(result.response).toEqual('<div><h1>OK!</h1></div>');
    await server.close();
});

// #############################################
// .metrics()
// #############################################

test('.metrics - assigned object to property - should be instance of @metrics/client', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    expect(podlet.metrics).toBeInstanceOf(Metrics);
});

test('.metrics - assigned object to property - should have object tag with "Metrics" as name', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    expect(Object.prototype.toString.call(podlet.metrics)).toEqual(
        '[object MetricsClient]'
    );
});
