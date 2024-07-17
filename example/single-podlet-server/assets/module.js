/* eslint-env browser */

'use strict';

window.addEventListener('load', () => {
    const element = document.getElementById('content');
    const context = {
        mountOrigin: element.getAttribute('data-mount-origin'),
        mountPathname: element.getAttribute('data-mount-pathname'),
        publicPathname: element.getAttribute('data-public-pathname'),
    };

    const base = new URL(
        context.publicPathname,
        context.mountOrigin ? context.mountOrigin : window.location.origin,
    );
    const localApiUri = new URL('localApi', base);

    fetch(localApiUri)
        .then((response) => response.json())
        .then((obj) => {
            element.innerHTML = `Proxied local REST API says: ${obj.say}`;
        });
});
