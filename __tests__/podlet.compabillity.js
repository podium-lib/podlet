'use strict';

const Podlet = require('../');

const DEFAULT_OPTIONS = { name: 'foo', version: 'v1.0.0', pathname: '/' };

// NB; these tests are here only to test compabillity between
// V3 and V4 manifest changes. Can be removed when V3 manifest
// support is removed.

test('.js() - set legal value on "value" argument - should return set value', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);

    const result = podlet.js({ value: '/foo/bar' });
    const parsed = JSON.parse(JSON.stringify(podlet));

    expect(result).toEqual('/foo/bar');
    expect(parsed.assets.js).toEqual('/foo/bar');
    expect(parsed.js[0].value).toEqual('/foo/bar');
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
    expect(parsed.js[0].value).toEqual('/foo/bar');
});

test('.css() - set legal value on "value" argument - should return set value', () => {
    const podlet = new Podlet(DEFAULT_OPTIONS);

    const result = podlet.css({ value: '/foo/bar' });
    const parsed = JSON.parse(JSON.stringify(podlet));

    expect(result).toEqual('/foo/bar');
    expect(parsed.assets.css).toEqual('/foo/bar');
    expect(parsed.css[0].value).toEqual('/foo/bar');
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
    expect(parsed.css[0].value).toEqual('/foo/bar');
});