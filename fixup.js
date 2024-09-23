import fs from 'node:fs';
import path from 'node:path';

let fixup = path.join(process.cwd(), 'types', 'fixup.d.ts');
let module = path.join(process.cwd(), 'types', 'podlet.d.ts');

fs.writeFileSync(
    module,
    `${fs.readFileSync(fixup, 'utf-8')}
${fs.readFileSync(module, 'utf-8')}`,
    'utf-8',
);
