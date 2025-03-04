import {getState, updateState} from './store.js';
import {ClickEvent} from "./events.js";

// TODO: use class event
export function setupListeners() {

    document.addEventListener('click', (event) => {

        const targetElement = event.target;
        const elementId = targetElement.id || null;
        const targetUrl = targetElement.tagName === 'A' ? targetElement.href : null; // se ha un link
        const timestamp = Date.now();

        const clickEvent = new ClickEvent({
            elementId: elementId,
            targetUrl: targetUrl,
            erroneous: false,  // TODO: un criterio di definizione se il click è erroneo
            timestamp: timestamp
        });

        const currentState = getState();
        updateState({
            user: {
                ...currentState.user,
                clicksCount: currentState.user.clicksCount + 1,
                timeFromLastAction: 0,
                lastInteractions: [...(currentState.user.event || []), clickEvent]
            }
        });
    });

    window.addEventListener('scroll', () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollTop = window.scrollY;
        let percentage = 0;
        if (docHeight > 0) {
            percentage = Math.round((scrollTop / docHeight) * 100);
            percentage = Math.min(100, Math.max(0, percentage));
        }
        // dispatch({ type: 'SCROLL', payload: { scrollDepth: percentage } });
        const currentState = getState();
        updateState({
            context: {
                ...currentState.context,
                scrollDepth: percentage,
            }
        });
    });

    // timer
    setInterval(() => {
        const current = getState();
        updateState({
            user: {
                ...current.user,
                timeOnPage: current.user.timeOnPage + 1,
                timeFromLastAction: current.user.timeFromLastAction + 1
            }
        });
    }, 1000);
}