'use strict';

const Metrics = require('@podium/metrics');
const express = require('express');
const Podlet = require('../');
const http = require('http');
const url = require('url');

/**
 * Fake server utility
 * Spinns up a http server and attaches a Podlets instanse .middleware()
 * The .get() does a proper http request to the http server and returns
 * a JSON with the http headers sent by the server and the res.locals
 * object set by the Podlet instanse .middleware()
 */

class FakeServer {
    constructor(podlet) {
        this.app = express();
        this.app.use(podlet.middleware());
        this.app.use((req, res) => {
            res.status(200).json(res.locals);
        });
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
                        locals: JSON.parse(chunks.join('')),
                    });
                });
            }).on('error', error => {
                reject(error);
            });
        });
    }
}

/**
 * Constructor
 */

test('Podlet() - instantiate new podlet object - should create an object', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    expect(podlet).toBeInstanceOf(Podlet);
});

test('Podlet() - object tag - should be PodiumPodlet', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    expect(Object.prototype.toString.call(podlet)).toEqual(
        '[object PodiumPodlet]'
    );
});

test('Podlet() - no value given to "name" argument - should throw', () => {
    expect.hasAssertions();
    expect(() => {
        const podlet = new Podlet({ version: 'v1.0.0' }); // eslint-disable-line no-unused-vars
    }).toThrowError(
        'The value, "", for the required argument "name" on the Podlet constructor is not defined or not valid.'
    );
});

test('Podlet() - invalid value given to "name" argument - should throw', () => {
    expect.hasAssertions();
    expect(() => {
        const podlet = new Podlet({ name: 'foo bar', version: 'v1.0.0' }); // eslint-disable-line no-unused-vars
    }).toThrowError(
        'The value, "foo bar", for the required argument "name" on the Podlet constructor is not defined or not valid.'
    );
});

test('Podlet() - no value given to "version" argument - should throw', () => {
    expect.hasAssertions();
    expect(() => {
        const podlet = new Podlet({ name: 'foo' }); // eslint-disable-line no-unused-vars
    }).toThrowError(
        'The value, "", for the required argument "version" on the Podlet constructor is not defined or not valid.'
    );
});

test('Podlet() - invalid value given to "version" argument - should throw', () => {
    expect.hasAssertions();
    expect(() => {
        const podlet = new Podlet({ name: 'foo', version: true }); // eslint-disable-line no-unused-vars
    }).toThrowError(
        'The value, "true", for the required argument "version" on the Podlet constructor is not defined or not valid.'
    );
});

test('Podlet() - serialize default values - should set "name" to same as on constructor', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.name).toEqual('foo');
});

test('Podlet() - serialize default values - should set "version" to same as on constructor', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.version).toEqual('v1.0.0');
});

test('Podlet() - serialize default values - should set "content" to "/"', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.content).toEqual('/');
});

test('Podlet() - serialize default values - should set "fallback" to empty String', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.fallback).toEqual('');
});

test('Podlet() - serialize default values - should set "assets.js" to empty String', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.assets.js).toEqual('');
});

test('Podlet() - serialize default values - should set "assets.css" to empty String', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.assets.css).toEqual('');
});

test('Podlet() - serialize default values - should set "proxy" to empty Object', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.proxy).toEqual({});
});

/**
 * .manifest()
 */

test('.manifest() - call method with no arguments - should return default value', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = podlet.manifest();
    expect(result).toEqual('/manifest.json');
});

test('.manifest() - set legal value on "path" argument - should return set value', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = podlet.manifest('/foo/bar');
    expect(result).toEqual('/foo/bar');
});

test('.manifest() - call method with "path" argument, then call it a second time with no argument - should return first set value on second call', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.manifest('/foo/bar');
    const result = podlet.manifest();
    expect(result).toEqual('/foo/bar');
});

/**
 * .content()
 */

test('.content() - call method with no arguments - should return default value', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = podlet.content();
    expect(result).toEqual('/');
});

test('.content() - set legal value on "path" argument - should return set value', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = podlet.content('/foo/bar');
    expect(result).toEqual('/foo/bar');
});

test('.content() - set legal relative value on "path" argument - should set "content" to set value when serializing Object', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.content('/foo/bar');
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.content).toEqual('/foo/bar');
});

test('.content() - set legal absolute value on "path" argument - should set "content" to set value when serializing Object', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.content('http://somewhere.remote.com');
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.content).toEqual('http://somewhere.remote.com');
});

test('.content() - set illegal value on "path" argument - should throw', () => {
    expect.hasAssertions();
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });

    expect(() => {
        podlet.content('/foo / bar');
    }).toThrowError('The value for "path", "/foo / bar", is not valid');
});

test('.content() - call method with "path" argument, then call it a second time with no argument - should return first set value on second call', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.content('/foo/bar');
    const result = podlet.content();
    expect(result).toEqual('/foo/bar');
});

test('.content() - call method twice with different "path" arguments - should set "content" to last set value when serializing Object', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.content('/foo/bar');
    podlet.content('/bar/foo');
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.content).toEqual('/bar/foo');
});

/**
 * .fallback()
 */

test('.fallback() - call method with no arguments - should return default value', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = podlet.fallback();
    expect(result).toEqual('');
});

test('.fallback() - set legal value on "path" argument - should return set value', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = podlet.fallback('/foo/bar');
    expect(result).toEqual('/foo/bar');
});

test('.fallback() - set legal relative value on "path" argument - should set "fallback" to set value when serializing Object', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.fallback('/foo/bar');
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.fallback).toEqual('/foo/bar');
});

test('.fallback() - set legal absolute value on "path" argument - should set "fallback" to set value when serializing Object', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.fallback('http://somewhere.remote.com');
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.fallback).toEqual('http://somewhere.remote.com');
});

test('.fallback() - set illegal value on "path" argument - should throw', () => {
    expect.hasAssertions();
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });

    expect(() => {
        podlet.fallback('/foo / bar');
    }).toThrowError('The value for "path", "/foo / bar", is not valid');
});

test('.fallback() - call method with "path" argument, then call it a second time with no argument - should return first set value on second call', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.fallback('/foo/bar');
    const result = podlet.fallback();
    expect(result).toEqual('/foo/bar');
});

test('.fallback() - call method twice with different "path" arguments - should set "fallback" to last set value when serializing Object', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.fallback('/foo/bar');
    podlet.fallback('/bar/foo');
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.fallback).toEqual('/bar/foo');
});

/**
 * .css()
 */

test('.css() - call method with no arguments - should return default value', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = podlet.css();
    expect(result).toEqual('');
});

test('.css() - set legal value on "path" argument - should return set value', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = podlet.css('/foo/bar');
    expect(result).toEqual('/foo/bar');
});

test('.css() - set legal relative value on "path" argument - should set "css" to set value when serializing Object', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.css('/foo/bar');
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.assets.css).toEqual('/foo/bar');
});

test('.css() - set legal absolute value on "path" argument - should set "css" to set value when serializing Object', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.css('http://somewhere.remote.com');
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.assets.css).toEqual('http://somewhere.remote.com');
});

test('.css() - set illegal value on "path" argument - should throw', () => {
    expect.hasAssertions();
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });

    expect(() => {
        podlet.css('/foo / bar');
    }).toThrowError('The value for "path", "/foo / bar", is not valid');
});

test('.css() - call method with "path" argument, then call it a second time with no argument - should return first set value on second call', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.css('/foo/bar');
    const result = podlet.css();
    expect(result).toEqual('/foo/bar');
});

test('.css() - call method twice with different "path" arguments - should set "css" to last set value when serializing Object', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.css('/foo/bar');
    podlet.css('/bar/foo');
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.assets.css).toEqual('/bar/foo');
});

/**
 * .js()
 */

test('.js() - call method with no arguments - should return default value', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = podlet.js();
    expect(result).toEqual('');
});

test('.js() - set legal value on "path" argument - should return set value', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = podlet.js('/foo/bar');
    expect(result).toEqual('/foo/bar');
});

test('.js() - set legal relative value on "path" argument - should set "js" to set value when serializing Object', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.js('/foo/bar');
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.assets.js).toEqual('/foo/bar');
});

test('.js() - set legal absolute value on "path" argument - should set "js" to set value when serializing Object', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.js('http://somewhere.remote.com');
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.assets.js).toEqual('http://somewhere.remote.com');
});

test('.js() - set illegal value on "path" argument - should throw', () => {
    expect.hasAssertions();
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });

    expect(() => {
        podlet.js('/foo / bar');
    }).toThrowError('The value for "path", "/foo / bar", is not valid');
});

test('.js() - call method with "path" argument, then call it a second time with no argument - should return first set value on second call', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.js('/foo/bar');
    const result = podlet.js();
    expect(result).toEqual('/foo/bar');
});

test('.js() - call method twice with different "path" arguments - should set "js" to last set value when serializing Object', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.js('/foo/bar');
    podlet.js('/bar/foo');
    const result = JSON.parse(JSON.stringify(podlet));
    expect(result.assets.js).toEqual('/bar/foo');
});

/**
 * .middleware()
 */

test('.middleware() - call method - should return an Array with 4 functions', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = podlet.middleware();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toEqual(4);
    expect(typeof result[0]).toBe('function');
    expect(typeof result[1]).toBe('function');
    expect(typeof result[2]).toBe('function');
    expect(typeof result[3]).toBe('function');
});

test('.middleware() - "user-agent" on request is not set to "@podium/client" - should append "full" template value on "res.locals.podium.template"', async () => {
    const podlet = new Podlet({
        name: 'foo',
        version: 'v1.0.0',
    });
    const server = new FakeServer(podlet);
    await server.listen();

    const result = await server.get();
    expect(result.locals.podium.template).toEqual('full.njk');

    await server.close();
});

test('.middleware() - "user-agent" on request is set to "@podium/client" - should append "slim" template value on "res.locals.podium.template"', async () => {
    const podlet = new Podlet({
        name: 'foo',
        version: 'v1.0.0',
    });
    const server = new FakeServer(podlet);
    await server.listen();

    const result = await server.get({
        headers: {
            'user-agent': '@podium/client'
        }
    });
    expect(result.locals.podium.template).toEqual('slim.njk');

    await server.close();
});

test('.middleware() - valid "version" value is set on constructor - should append "podlet-version" http header with the given version value', async () => {
    const podlet = new Podlet({
        name: 'foo',
        version: 'v1.0.0',
    });
    const server = new FakeServer(podlet);
    await server.listen();

    const result = await server.get();
    expect(result.headers['podlet-version']).toEqual('v1.0.0');

    await server.close();
});

/**
 * .defaults()
 */

test('.defaults() - call method with no arguments - should return default value', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = podlet.defaults();
    expect(result).toEqual({});
});

test('.defaults() - set value on "context" argument - should return set value', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = podlet.defaults({ foo: 'bar' });
    expect(result).toEqual({ foo: 'bar' });
});

test('.defaults() - call method with "context" argument, then call it a second time with no argument - should return first set value on second call', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.defaults({ foo: 'bar' });
    const result = podlet.defaults();
    expect(result).toEqual({ foo: 'bar' });
});

test('.defaults() - constructor argument "defaults" is not set - should not append a default context to "res.locals"', async () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const server = new FakeServer(podlet);
    await server.listen();

    const result = await server.get();
    expect(result.locals.podium.context).toEqual({});

    await server.close();
});

test('.defaults() - constructor argument "defaults" is to "true" - should append a default context to "res.locals"', async () => {
    const podlet = new Podlet({
        name: 'foo',
        version: 'v1.0.0',
        defaults: true,
    });
    const server = new FakeServer(podlet);
    const address = await server.listen();
    const result = await server.get();

    expect(result.locals.podium.context.debug).toEqual('false');
    expect(result.locals.podium.context.locale).toEqual('en-EN');
    expect(result.locals.podium.context.deviceType).toEqual('desktop');
    expect(result.locals.podium.context.requestedBy).toEqual('foo');
    expect(result.locals.podium.context.mountOrigin).toEqual(address);
    expect(result.locals.podium.context.mountPathname).toEqual('/');
    expect(result.locals.podium.context.publicPathname).toEqual('/');

    await server.close();
});

test('.defaults() - set "context" argument where a key override one existing context value - should override default context value but keep rest untouched', async () => {
    const podlet = new Podlet({
        name: 'foo',
        version: 'v1.0.0',
        defaults: true,
    });
    podlet.defaults({
        locale: 'no-NO',
    });
    const server = new FakeServer(podlet);
    const address = await server.listen();
    const result = await server.get();

    expect(result.locals.podium.context.debug).toEqual('false');
    expect(result.locals.podium.context.locale).toEqual('no-NO');
    expect(result.locals.podium.context.deviceType).toEqual('desktop');
    expect(result.locals.podium.context.requestedBy).toEqual('foo');
    expect(result.locals.podium.context.mountOrigin).toEqual(address);
    expect(result.locals.podium.context.mountPathname).toEqual('/');
    expect(result.locals.podium.context.publicPathname).toEqual('/');

    await server.close();
});

test('.defaults() - set "context" argument where a key is not a default context value - should append key and value to default context', async () => {
    const podlet = new Podlet({
        name: 'foo',
        version: 'v1.0.0',
        defaults: true,
    });
    podlet.defaults({
        foo: 'bar',
    });
    const server = new FakeServer(podlet);
    const address = await server.listen();
    const result = await server.get();

    expect(result.locals.podium.context.foo).toEqual('bar');
    expect(result.locals.podium.context.debug).toEqual('false');
    expect(result.locals.podium.context.locale).toEqual('en-EN');
    expect(result.locals.podium.context.deviceType).toEqual('desktop');
    expect(result.locals.podium.context.requestedBy).toEqual('foo');
    expect(result.locals.podium.context.mountOrigin).toEqual(address);
    expect(result.locals.podium.context.mountPathname).toEqual('/');
    expect(result.locals.podium.context.publicPathname).toEqual('/');

    await server.close();
});

/**
 * .metrics
 */

test('.metrics - assigned object to property - should be instance of @podium/metrics', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    expect(podlet.metrics).toBeInstanceOf(Metrics);
});

test('.metrics - assigned object to property - should have object tag with "PodiumMetrics" as name', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    expect(Object.prototype.toString.call(podlet.metrics)).toEqual(
        '[object PodiumMetrics]'
    );
});