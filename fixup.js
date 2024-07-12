import fs from 'node:fs';
import path from 'node:path';

let module = path.join(process.cwd(), 'types', 'podlet.d.ts');

fs.writeFileSync(
    module,
    /* ts */ `
declare global {
  namespace Express {
    export interface Response {
      /**
       * Calls the send / write method on the \`http.ServerResponse\` object.
       *
       * When in development mode this method will wrap the provided fragment in a
       * default HTML document before dispatching. When not in development mode, this
       * method will just dispatch the fragment.
       *
       * @example
       * app.get(podlet.content(), (req, res) => {
       *     res.podiumSend('<h1>Hello World</h1>');
       * });
       */
      podiumSend(fragment: string, ...args: unknown[]): Response;
    }
  }
}

${fs.readFileSync(module, 'utf-8')}`,
    'utf-8',
);
