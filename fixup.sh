#!/usr/bin/env bash

## Append the following to types/podlet.d.ts
cat >> types/podlet.d.ts <<!EOF
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
!EOF
