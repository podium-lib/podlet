const { join } = require('path');
const { readFileSync } = require('fs');

const script = readFileSync(join(__dirname, '../dist/isolated-podlet.js'));

// deal with the FOUC
const styles =
    '<style>:not(:defined) { visibility: hidden; display: none; opacity: 0; }</style>';

// inline the <isolated-podlet> custom element definition
const scripts = `<script type="module">${script}</script>`;

// wrap the content with FOUC CSS and <isolated-podlet> definition
module.exports = (content) => `
    ${styles}
    <isolated-podlet>
        <template>
            ${content}
        </template>
    </isolated-podlet>
    ${scripts}
`;
