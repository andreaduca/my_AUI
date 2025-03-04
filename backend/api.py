import uuid

from flask import request, jsonify, Flask
from flask_cors import CORS

from ai_model.agent import DQRNModel
from db.sessions_repository import save_session, get_last_step, get_next_step
from db.transitions_repository import get_transition, update_transition, save_transition
from preprocessing import state_to_features
from reward import calculate_reward

app = Flask(__name__)
CORS(app)

agent = DQRNModel(device = 'cpu')

@app.route('/createSession', methods=['POST'])
def create_session():

    session_id = f"session_{uuid.uuid4()}"
    save_session(session_id)

    return {"sessionId": session_id}

@app.route('/addToTransition', methods=['POST'])
def add_to_transition():
    data = request.get_json()
    current_state = data.get("state", {})
    # features = state_to_features(current_state)
    session_id = current_state.get("context", {}).get("sessionId")
    action = data.get("action", None)
    done = data.get("done", False)

    step = get_last_step(session_id)
    last_transition = get_transition(session_id, step)
    if last_transition and last_transition.get('status') == 'partial':
        reward = calculate_reward(current_state)

        updating = {
            "next_state": current_state,
            "reward": reward,
            "status": "complete",
        }
        transition_completed = update_transition(last_transition, updating)
        # trainer.handle_transition(transition_completed)
        print("Completed transition step_id=%d" % last_transition["step_id"])

    next_step = get_next_step(session_id)
    save_transition(session_id, next_step, current_state, action, done = done)
    print("Created partial transition step_id=%d" % next_step)

    return jsonify({"status": "ok", "message": "Transition added and updated successfully"})

@app.post("/getAction")
def get_action():

    row_state = request.get_json()
    features = state_to_features(row_state)
    action = agent.select_action(features)

    return {"action": action}

@app.route("/", methods=['GET'])
def startApp():
    return {"status": "success"}


if __name__ == '__main__':
    try:
        app.run('localhost', port=5020, debug=True)
    except Exception:
        import traceback, pdb
        traceback.print_exc()  # Stampa lo stack trace
        pdb.post_mortem()      # Avvia il debug post-mortem