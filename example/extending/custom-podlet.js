import PodiumPodlet from '../../lib/podlet.js';

export default class CustomPodlet extends PodiumPodlet {
    constructor(...args) {
        super(...args);

        Object.defineProperty(this, 'fallbackRoute', {
            value: '/backfall',
            writable: true,
        });
    }

    get [Symbol.toStringTag]() {
        return 'CustomPodlet';
    }
}
