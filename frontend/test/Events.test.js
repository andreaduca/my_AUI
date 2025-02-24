import {initState} from "../environment/store.js";
import {ClickEvent} from "../environment/events.js";

describe('Store Module', () => {
    beforeEach(() => {
        // Inizializza lo state con un valore fittizio per ogni test
        initState('test-session');
    });

    test('ClickEvent.increment() dovrebbe incrementare il conteggio dei click', () => {
        const clickEvent = new ClickEvent({elementId: 'btn-3'});

        // Inizialmente il clickCount deve essere 1
        expect(clickEvent.clickCount).toBe(1);

        // Chiamando increment() il clickCount deve aumentare
        clickEvent.increment();
        expect(clickEvent.clickCount).toBe(2);

        // Chiamando increment() più volte
        clickEvent.increment();
        clickEvent.increment();
        expect(clickEvent.clickCount).toBe(4);
    });

    test('ClickEvent.increment() dovrebbe incrementare il conteggio dei click', () => {
        const clickEvent = new ClickEvent({ elementId: 'btn-3' });

        // Inizialmente il clickCount deve essere 1
        expect(clickEvent.clickCount).toBe(1);

        // Chiamando increment() il clickCount deve aumentare
        clickEvent.increment();
        expect(clickEvent.clickCount).toBe(2);

        // Chiamando increment() più volte
        clickEvent.increment();
        clickEvent.increment();
        expect(clickEvent.clickCount).toBe(4);
    });
});