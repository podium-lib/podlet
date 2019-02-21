'use strict';

module.exports = (fragment = '', incoming = {}) => `<!doctype html>
<html lang="${
    incoming.context && incoming.context.locale ? incoming.context.locale : 'en-US'
}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=Edge">
        ${incoming.js ? `<script src="${incoming.js}" defer></script>` : ''}
        ${
            incoming.css
                ? `<link media="all" rel="stylesheet" type="text/css" href="${
                      incoming.css
                  }">`
                : ''
        }
        <title>${incoming.name ? incoming.name : ''}</title>
    </head>
    <body>
        <!-- START: Podlet -->
        ${fragment}
        <!-- END: Podlet -->
    </body>
</html>`;
