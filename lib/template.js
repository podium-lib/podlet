'use strict';

module.exports = ({
    head = '',
    body = '',
    encoding = 'utf-8',
    locale = 'en-US',
    title = '',
    js = '',
    css = '',
} = {}) => `<!doctype html>
<html lang="${locale}">
    <head>
        <meta charset="${encoding}">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=Edge">
        ${js ? `<script src="${js}" defer></script>` : ''}
        ${
            css
                ? `<link media="all" rel="stylesheet" type="text/css" href="${css}">`
                : ''
        }
        <title>${title}</title>
        ${head}
    </head>
    <body>
        <!-- START: Podlet -->
        ${body}
        <!-- END: Podlet -->
    </body>
</html>`;
