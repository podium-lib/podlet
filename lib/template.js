'use strict';

const utils = require('@podium/utils');

const template = (ctx, name, css, js, str = '') => `<!doctype html>
<html lang="${ctx && ctx.locale ? ctx.locale : 'en-US'}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=Edge">
        ${js ? `<script src="${js}" defer></script>` : ''}
        ${
            css
                ? `<link media="all" rel="stylesheet" type="text/css" href="${css}">`
                : ''
        }
        <title>${name ? name : ''}</title>
    </head>
    <body>
        <!-- START: Podlet -->
        ${str}
        <!-- END: Podlet -->
    </body>
</html>`;

module.exports = (str, res) => {
    const name = utils.getFromLocalsPodium(res, 'name');
    const ctx = utils.getFromLocalsPodium(res, 'context');
    const css = utils.getFromLocalsPodium(res, 'css');
    const js = utils.getFromLocalsPodium(res, 'js');
    return template(ctx, name, css, js, str);
};
