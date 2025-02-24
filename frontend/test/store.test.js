import { initState, getState, updateState, subscribe } from '../environment/store.js';
import {ClickEvent, ScrollEvent} from "../environment/events.js";


/*
	•	Verificare che l’inizializzazione dello state (in initStore o initState) imposti correttamente
	 i campi come sessionId e deviceType.
	•	Controllare che la funzione updateState aggiorni lo state in maniera immutabile.
	•	Assicurarsi che il meccanismo di subscribe notifichi le funzioni registrate quando lo state viene aggiornato.

 */

describe('Store Module', () => {
    beforeEach(() => {
        // Inizializza lo state con un valore fittizio per ogni test
        initState('test-session');
    });

    test('dovrebbe impostare correttamente sessionId e deviceType', () => {
        const state = getState();
        expect(state.context.sessionId).toBe('test-session');
        // In base alla dimensione della finestra, puoi controllare che deviceType sia mobile/tablet/desktop
        expect(['mobile', 'tablet', 'desktop']).toContain(state.context.deviceType);
    });

    test('dovrebbe aggiornare lo state in maniera immutabile', () => {
        const initial = getState();
        updateState({ user: { clicksCount: initial.user.clicksCount + 1 } });
        const updated = getState();
        expect(updated.user.clicksCount).toBe(initial.user.clicksCount + 1);
        // Verifica che altre parti dello state rimangano invariate
        expect(updated.context).toEqual(initial.context);
    });

    test(' NON dovrebbe notificare i subscriber quando lo state cambia ma non la parte UI', () => {
        const mockCallback = jest.fn();
        subscribe(mockCallback);
        updateState({ user: { clicksCount: 5 } });
        expect(mockCallback).not.toHaveBeenCalledWith(getState());
    });

    test('dovrebbe aggiornare il campo lastInteraction con un oggetto ClickEvent', () => {
        const clickEvent = new ClickEvent({ elementId: 'btn-1', targetUrl: 'http://example.com' });
        updateState({ lastInteraction: clickEvent });
        const state = getState();

        // Verifica che il campo lastInteraction contenga l’oggetto inviato
        expect(state.lastInteraction).toBe(clickEvent);
        expect(state.lastInteraction.type).toBe('click');
        expect(state.lastInteraction.elementId).toBe('btn-1');
        expect(state.lastInteraction.targetUrl).toBe('http://example.com');
        expect(state.lastInteraction.erroneous).toBe(false);
        expect(typeof state.lastInteraction.timestamp).toBe('number');
        expect(state.lastInteraction.clickCount).toBe(1);
    });


    test('dovrebbe aggiornare il campo lastInteraction con un oggetto ScrollEvent', () => {
        const scrollEvent = new ScrollEvent({ start: 0, end: 500, duration: 300 });
        updateState({ lastInteraction: scrollEvent });
        const state = getState();

        expect(state.lastInteraction).toBe(scrollEvent);
        expect(state.lastInteraction.type).toBe('scroll');
        expect(state.lastInteraction.start).toBe(0);
        expect(state.lastInteraction.end).toBe(500);
        expect(state.lastInteraction.duration).toBe(300);
        expect(typeof state.lastInteraction.timestamp).toBe('number');
    });

    test('i NON subscriber devono essere notificati anche quando viene aggiornato lastInteraction', () => {
        const mockSubscriber = jest.fn();
        subscribe(mockSubscriber);

        const clickEvent = new ClickEvent({ elementId: 'btn-2' });
        updateState({ lastInteraction: clickEvent });

        // Il subscriber deve essere stato chiamato con lo state aggiornato che include lastInteraction
        expect(mockSubscriber).not.toHaveBeenCalledWith(expect.objectContaining({
            lastInteraction: clickEvent
        }));
    });


    test('notifica i subscriber quando la parte UI dello stato cambia', () => {
        const callback = jest.fn();
        subscribe(callback);

        // Verifica che lo stato iniziale UI abbia myBanner.show = false
        const stateBefore = getState();
        expect(stateBefore.ui.myBanner.show).toBe(false);

        // Aggiorna la UI: cambia myBanner.show a true
        updateState({ ui: { myBanner: { show: true, variant: 'default' } } });

        // Il subscriber dovrebbe essere notificato
        expect(callback).toHaveBeenCalled();
    });

});

