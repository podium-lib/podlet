'use strict';

const template = require('../lib/template');

const sanitize = str => str.replace(/\s+/g, ' ').trim();

test('template() - no arguments given - should render default', () => {
    const str = `<!doctype html>
        <html lang="en-US">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta http-equiv="X-UA-Compatible" content="IE=Edge">
                <title></title>
            </head>
            <body>
                <!-- START: Podlet -->

                <!-- END: Podlet -->
            </body>
        </html>`;

    const tmpl = template();
    expect(sanitize(tmpl)).toEqual(sanitize(str));
});

test('template() - "str" argument is given - should include "str" in the render', () => {
    const str = `<!doctype html>
        <html lang="en-US">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta http-equiv="X-UA-Compatible" content="IE=Edge">
                <title></title>
            </head>
            <body>
                <!-- START: Podlet -->
                foo
                <!-- END: Podlet -->
            </body>
        </html>`;

    const tmpl = template('foo');
    expect(sanitize(tmpl)).toEqual(sanitize(str));
});

test('template() - "res" argument is given with a full .locals.podium object - should include js and css and name in the render', () => {
    const str = `<!doctype html>
        <html lang="en-US">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta http-equiv="X-UA-Compatible" content="IE=Edge">
                <script src="/script.js" defer></script>
                <link media="all" rel="stylesheet" type="text/css" href="/styles.css">
                <title>bar</title>
            </head>
            <body>
                <!-- START: Podlet -->
                foo
                <!-- END: Podlet -->
            </body>
        </html>`;

    const tmpl = template('foo', {
        locals: {
            podium: {
                name: 'bar',
                css: '/styles.css',
                js: '/script.js',
            },
        },
    });
    expect(sanitize(tmpl)).toEqual(sanitize(str));
});
