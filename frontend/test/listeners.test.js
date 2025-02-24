// simulazione eventi DOM e verificare che lo state venga aggiornato di conseguenze
import { setupListeners } from '../environment/listeners.js';
import { initState, getState } from '../environment/store.js';

describe('User Events Listeners', () => {
    beforeEach(() => {
        document.body.innerHTML = `<div id="myBanner"></div>`;
        initState('test-session');
        jest.useFakeTimers();
        setupListeners();
    });

    afterEach(() => {
        // Ripulisce i timer finti
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    test('dovrebbe incrementare clicksCount al click', () => {
        const initialClicks = getState().user.clicksCount;
        document.dispatchEvent(new MouseEvent('click'));
        expect(getState().user.clicksCount).toBe(initialClicks + 1);
    });

    test('dovrebbe aggiornare scrollDepth durante lo scroll', () => {
        // Simula uno scroll
        Object.defineProperty(window, 'scrollY', {value: 100, writable: true});
        Object.defineProperty(document.documentElement, 'scrollHeight', {value: 2000, writable: true});
        Object.defineProperty(window, 'innerHeight', {value: 800, writable: true});
        window.dispatchEvent(new Event('scroll'));
        const percentage = getState().context.scrollDepth;
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(100);
    });

    test('dovrebbe incrementare timeOnPage e timeFromLastAction con il timer', () => {
        const initialState = getState();
        const initialTimeOnPage = initialState.user.timeOnPage;
        const initialTimeFromLastAction = initialState.user.timeFromLastAction;

        // Avanza il timer di 1 secondo
        jest.advanceTimersByTime(1000);

        const newState = getState();
        expect(newState.user.timeOnPage).toBe(initialTimeOnPage + 1);
        expect(newState.user.timeFromLastAction).toBe(initialTimeFromLastAction + 1);
    });
});