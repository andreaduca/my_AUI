import {updateState} from "../environment/store";
import jsonData from "../../actions.json" assert { type: "json" };

const actionsDict = Object.freeze(jsonData);
const actionsArray = Object.values(actionsDict);

export function applyAction(state, actionIndex) {
    // TODO: if I have more component in state, action is a list of actions, and I have to apply this action for each component
    let newUIState = { ...state.ui };
    const action = actionsArray[actionIndex];

    if (action === actionsDict.SHOW_BANNER) {
        newUIState.myBanner.show = true;
    } else if (action === actionsDict.HIDE_BANNER) {
        newUIState.myBanner.show = false;
    }

    // Aggiorniamo lo stato della ui, verra' notificato automaticamente i subscriber sincronizzando la ui
    updateState({ ui: newUIState });
}
