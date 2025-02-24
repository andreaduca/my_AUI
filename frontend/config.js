/*
  Defines the initial state object
 */

export const initialState = {

    // UI state
    ui: {
        myBanner: {
            show: false,
            variant: 'default'
        },
    },

    // User state and reactions
    user: {
        action: null,   // TODO: oggetto che modella evento
        timeFromLastAction: 0,
        timeOnPage: 0,
        clicksCount: 0,
        // userType, visitedPages, etc.
    },

    // context/environment state
    context: {
        deviceType: null, // mobile, desktop, tablet
        sessionId: null,
        scrollDepth: 0,    // scroll percentage 0–100
        // browser info, etc.
    }
};

export const CONFIG = {
    // TODO: set host const
    getActionUrl: 'http://localhost:5020/getAction',
    createSessionUrl: 'http://localhost:5020/createSession',
    addToTransitionUrl: 'http://localhost:5020/addToTransition',
    monitoredEvents: ['click', 'scroll', 'mouseover']
};