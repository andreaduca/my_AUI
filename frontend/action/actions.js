import {updateState} from "../environment/store";

export function applyAction(state, action) {
    // TODO: if I have more component in state, action is a list of actions, and I have to apply this action for each component
    let newUIState = { ...state.ui };

    if (action === 'showBanner') {
        newUIState.myBanner.show = true;
    } else if (action === 'hideBanner') {
        newUIState.myBanner.show = false;
    }

    // Aggiorniamo lo stato della ui, verra' notificato automaticamente i subscriber sincronizzando la ui
    updateState({ ui: newUIState });
}
