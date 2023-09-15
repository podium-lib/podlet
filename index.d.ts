import { HttpIncoming, AssetJs, AssetCss } from '@podium/utils';
import PodiumProxy from '@podium/proxy';
import MetricsClient from '@metrics/client';

// Use declaration merging to extend Express.
declare global {
    namespace Express {
        interface Response {
            podiumSend(fragment: string, ...args: unknown[]): Response;
        }
    }
}

declare class Podlet {
    constructor(options: Podlet.PodletOptions);

    name: string;

    version: string;

    manifestRoute: string;

    contentRoute: string;

    fallbackRoute: string;

    cssRoute: AssetCss[];

    jsRoute: AssetJs[];

    proxyRoutes: Record<string, string>;

    log: Podlet.AbsLogger;

    development: boolean;

    httpProxy: PodiumProxy;

    baseContext: Podlet.PodletContext;

    defaultContext: Podlet.PodletContext;

    metrics: MetricsClient;

    pathname(): string;

    middleware(): (req: any, res: any, next: any) => Promise<void>;

    manifest(options?: { prefix?: boolean }): string;

    content(options?: { prefix?: boolean }): string;

    fallback(options?: { prefix?: boolean }): string;

    js(options: AssetJs | Array<AssetJs>): void;

    css(options: AssetCss | Array<AssetCss>): void;

    proxy(options: { target: string; name: string }): string;

    defaults(context: any): any;

    view<T = { [key: string]: unknown }>(
        template: (
            incoming: HttpIncoming<T>,
            fragment: string,
            ...args: unknown[]
        ) => string,
    ): void;

    render<T = { [key: string]: unknown }>(
        incoming: HttpIncoming<T>,
        fragment: string,
        ...args: unknown[]
    ): string;

    process(incoming: HttpIncoming): Promise<HttpIncoming>;
}

declare namespace Podlet {
    export type AbsLogger = {
        trace: LogFunction;
        debug: LogFunction;
        info: LogFunction;
        warn: LogFunction;
        error: LogFunction;
        fatal: LogFunction;
    };

    type LogFunction = (...args: any) => void;

    export type PodletContext = {
        debug: 'true' | 'false';
        locale: string;
        deviceType: string;
        requestedBy: string;
        mountOrigin: string;
        mountPathname: string;
        publicPathname: string;
    };

    export interface PodletOptions {
        name: string;
        pathname: string;
        version: string;
        manifest?: string;
        content?: string;
        fallback?: string;
        logger?: Console | AbsLogger;
        development?: boolean;
    }
}

export = Podlet;
