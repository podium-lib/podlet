import { HttpIncoming, AssetJs, AssetCss } from '@podium/utils';

// Use declaration merging to extend Express.
declare global {
    namespace Express {
        interface Response {
            podiumSend(fragment: string, ...args: unknown[]): Response;
        }
    }
}

export interface PodletOptions {
    name: string;
    pathname: string;
    version: string;
    manifest?: string;
    content?: string;
    fallback?: string;
    logger?: any;
    development?: boolean;
}

export default class Podlet {
    constructor(options: PodletOptions);

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
