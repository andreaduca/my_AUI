import {initialState} from "../config";


const subscribers = [];

// Permette ad altri moduli di registrarsi per ricevere notifiche quando lo state cambia
export function subscribe(callback) {
    subscribers.push(callback);
}


let state = JSON.parse(JSON.stringify(initialState));

export function initState(sessionId) {
    state.context.sessionId = sessionId;
    state.context.deviceType = detectDeviceType();
}

export function getState() {
    return state;
}

// Aggiorna lo state in maniera immutabile
export function updateState(newState) {
    const prevUIState = state.ui;

    state = {
        ...state,
        ...newState
    };
    // Verifica se la parte UI è cambiata (confronto shallow)
    if (!shallowEqual(prevUIState, state.ui)) {
        // Lo stato dela UI e' cambiato, quindi va sincronizzato il DOM
        subscribers.forEach(callback => callback(state));
    }}

// helper
function detectDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
}

// confronto shallow tra due oggetti
function shallowEqual(obj1, obj2) {
    // Controlla le proprietà di obj1
    for (let key in obj1) {
        if (Object.prototype.hasOwnProperty.call(obj1, key) && obj1[key] !== obj2[key]) {
            return false;
        }
    }
    // Controlla se obj2 contiene proprietà non presenti in obj1
    for (let key in obj2) {
        if (Object.prototype.hasOwnProperty.call(obj2, key) && !(key in obj1)) {
            return false;
        }
    }
    return true;
}