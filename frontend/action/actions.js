import {updateState} from "../environment/store";

import jsonData from "../../actions.json" assert { type: "json" };

const Actions = Object.freeze(jsonData);

export function applyAction(state, action) {
    // TODO: if I have more component in state, action is a list of actions, and I have to apply this action for each component
    let newUIState = { ...state.ui };

    if (action === Actions.SHOW_BANNER) {
        newUIState.myBanner.show = true;
    } else if (action === Actions.HIDE_BANNER) {
        newUIState.myBanner.show = false;
    }

    // Aggiorniamo lo stato della ui, verra' notificato automaticamente i subscriber sincronizzando la ui
    updateState({ ui: newUIState });
}
