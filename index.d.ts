import {HttpIncoming, AssetJs, AssetCss} from '@podium/utils';
import * as Proxy from '@podium/proxy';
import MetricsClient from '@metrics/client';

// Use declaration merging to extend Express.
declare global {
    namespace Express {
        interface Response {
            podiumSend(fragment: string, ...args: unknown[]): Response;
        }
    }
}

type AbsLogger = {
    trace: LogFunction;
    debug: LogFunction;
    info: LogFunction;
    warn: LogFunction;
    error: LogFunction;
    fatal: LogFunction;
}

type LogFunction = (...args: any) => void

type PodletContext = {
    debug: 'true' | 'false';
    locale: string;
    deviceType: string;
    requestedBy: string;
    mountOrigin: string;
    mountPathname: string;
    publicPathname: string;
}

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

export default class Podlet {
    constructor(options: PodletOptions);

    name: string;

    version: string;

    manifestRoute: string;

    contentRoute: string;

    fallbackRoute: string;

    cssRoute: [];

    jsRoute: [];

    proxyRoutes: Record<string, string>;

    log: AbsLogger;

    development: boolean;

    httpProxy: Proxy;

    baseContext: PodletContext;

    defaultContext: PodletContext;

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

    view(
        template: (
            incoming: HttpIncoming,
            fragment: string,
            ...args: unknown[]
        ) => string,
    ): void;

    render(
        incoming: HttpIncoming,
        fragment: string,
        ...args: unknown[]
    ): string;

    process(incoming: HttpIncoming): Promise<HttpIncoming>;
}
