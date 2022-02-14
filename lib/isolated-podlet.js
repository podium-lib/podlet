/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */

import { LitElement, html } from 'lit';

class IsolatedPodlet extends LitElement {
    render() {
        return html`
            ${this.querySelector('template').content.cloneNode(true)}
        `;
    }
}

if (!customElements.get('isolated-podlet')) {
    customElements.define('isolated-podlet', IsolatedPodlet);
}
