/* eslint-env browser */

'use strict';

function doSomething() {
    const element = document.getElementById('content');
    const context = {
        mountOrigin: element.getAttribute('data-mount-origin'),
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
}

if (document.readyState === 'loading') {
    // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', doSomething);
} else {
    // `DOMContentLoaded` has already fired
    doSomething();
}
