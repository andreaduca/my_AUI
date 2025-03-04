export const initialState = {

    // UI state
    ui: {
        myBanner: {
            show: false,
        },
    },

    // User state and reactions
    user: {
        lastInteractions: [],
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

const HOST = 'http://localhost:5020'

export const CONFIG = {
    getActionUrl: HOST+'/getAction',
    createSessionUrl: HOST+'/createSession',
    addToTransitionUrl: HOST+'/addToTransition',
};