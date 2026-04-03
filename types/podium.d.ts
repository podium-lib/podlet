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
            podiumSend(fragment: string | TemplateResult, ...args: unknown[]): Response;
        }
    }
}

export type PodletOptions = {
    name: string;
    version: string;
    pathname: string;
    /**
     * Path where the podlet manifest file is served from.
     * @default "/manifest.json"
     */
    manifest?: string;
    /**
     * Path where the podlet content HTML markup is served from
     * @default "/"
     */
    content?: string;
    /**
     * - path where the podlet fallback HTML markup is served from
     * @default "/fallback"
     */
    fallback?: string;
    /**
     * Enables additional development setup such as rendering the podlet in a shared HTML document template.
     * @default false
     */
    isLocalhost?: boolean;
    /**
     * Enables additional development setup (default false)
     * @deprecated Use {@link isLocalhost} for clarity
     * @default false
     */
    development?: boolean;
    /**
     * When true, enables the use of ShadowDOM to isolate the podlet CSS as much as possible.
     */
    useShadowDOM?: boolean;
    /**
     * Can be the console object if console logging is desired but can also be any Log4j compatible logging object as well. Nothing is logged if no logger is provided. (default null)
     */
    logger?: import("abslog").AbstractLoggerOptions;
    /**
     * Options that can be provided to configure the Podium proxy
     */
    proxy?: import("@podium/proxy").PodiumProxyOptions;
};
