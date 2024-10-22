declare global {
    namespace Express {
        export interface PodiumHttpIncomingParameters {
            [key: string]: unknown;
        }

        export interface PodiumHttpIncomingContext {
            /**
             * @see https://podium-lib.io/docs/guides/context#default-context-variables
             */
            debug?: string;
            /**
             * Does user agent sniffing to try to guess the visitor's device type.
             * @see https://podium-lib.io/docs/guides/context#default-context-variables
             */
            deviceType?: string;
            /**
             * Locale information from the layout.
             * @see https://podium-lib.io/docs/guides/context#default-context-variables
             */
            locale?: string;
            /**
             * Used to calculate the podlet's public URL when proxied behind a layout.
             * @see https://podium-lib.io/docs/guides/context#construct-public-urls
             */
            mountOrigin?: string;
            /**
             * Used to calculate the podlet's public URL when proxied behind a layout.
             * @see https://podium-lib.io/docs/guides/context#construct-public-urls
             */
            mountPathname?: string;
            /**
             * Used to calculate the podlet's public URL when proxied behind a layout.
             * @see https://podium-lib.io/docs/guides/context#construct-public-urls
             */
            publicPathname?: string;
            /**
             * Name of the caller.
             */
            requestedBy?: string;
            [key: string]: unknown;
        }

        export interface PodiumHttpIncomingViewParameters {
            [key: string]: unknown;
        }

        export interface Locals {
            podium: HttpIncoming<
                PodiumHttpIncomingParameters,
                PodiumHttpIncomingContext,
                PodiumHttpIncomingViewParameters
            >;
        }

        export interface Response {
            /**
             * Calls the send / write method on the `http.ServerResponse` object.
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
