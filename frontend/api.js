/*
  This file contains functions to communicate with the backend.
 */

import {CONFIG} from "./config.js";

export async function getAction(state) {
    try {
        const action = await fetch(CONFIG.getActionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state)
        });
        // action is 'showBanner', 'hideBanner'
        return await action.json();
    } catch (error) {
        console.error('Error when sending status to the backend to calculate an action', error);
        return null;
    }
}

export async function new_session() {
    try {
        const response = await fetch(CONFIG.createSessionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        return data; // => { sessionId: "..." }
    } catch (error) {
        console.error('Error: could not create session', error);
        return null;
    }
}

export async function addToTransition(state, action, done=false) {
    try {
        const result = await fetch(CONFIG.addToTransitionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state, action, done })
        });
        return await result.json();
    } catch (error) {
        console.error('Error: problems to transitions management', error);
        return null;
    }
}