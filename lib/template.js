'use strict';

module.exports = (fragment = '', state = {}) => `<!doctype html>
<html lang="${
    state.context && state.context.locale ? state.context.locale : 'en-US'
}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=Edge">
        ${state.js ? `<script src="${state.js}" defer></script>` : ''}
        ${
            state.css
                ? `<link media="all" rel="stylesheet" type="text/css" href="${
                      state.css
                  }">`
                : ''
        }
        <title>${state.name ? state.name : ''}</title>
    </head>
    <body>
        <!-- START: Podlet -->
        ${fragment}
        <!-- END: Podlet -->
    </body>
</html>`;
