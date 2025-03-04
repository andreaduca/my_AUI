import { addToTransition, getAction, new_session } from './api'
import { getState, initState, subscribe } from './environment/store'
import { setupListeners } from './environment/listeners'
import { applyUIState } from './action/UIController'
import { applyAction } from './action/actions'

export async function startAdaptiveProcess() {
    try {
        const sessionData = await new_session();
        initState(sessionData.sessionId);

        setupListeners();

        subscribe((newState) => {
            applyUIState(newState);
        });

        // TODO: ask for action in a smarter way?
        setInterval(async () => {
            const action = await getAction(getState());
            if (action) {
                applyAction(getState(), action);
            }
            // TODO: If I discriminate events, I can set done=true for end episode events
            await addToTransition(getState(), action);
            console.log('NEW state', getState())
        }, 5000); // ogni 5 secondi
    } catch (error) {
        console.error('Errore durante l\'avvio del processo adattivo:', error);
    }
}