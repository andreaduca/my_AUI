import datetime

from db.db_connection import get_db

db = get_db()

def save_transition(session_id, step_id, state, action, next_state = None, reward = None, status = "partial", done = False):
    """
    Saves a RL transition to the local MongoDB (reinforceWeb_DB).
    """
    doc = {
        "session_id": session_id,
        "step_id": step_id,
        "state": state,
        "action": action,
        "next_state": next_state,
        "reward": reward,
        "done": done,
        "status": status,
        "created_at": datetime.datetime.now(datetime.timezone.utc)
    }
    db.transitions.insert_one(doc)
    return doc

def get_transition(session_id, step_id):
    """
    Retrieves a single transition from the local DB, matching session_id and step_id.
    """
    doc = db.transitions.find_one({"session_id": session_id, "step_id": step_id})
    return doc

def list_transitions():
    """
    Returns a list of all transitions in 'reinforceWeb_DB.transitions'.
    """
    cursor = db.transitions.find()
    return list(cursor)

def find_update_transition(session_id, step_id, updates: dict):
    db.transitions.update_one(
        {"session_id": session_id, "step_id": step_id},
        {"$set": updates}
    )

def update_transition(transition, updates: dict):
    updated_transition = db.transitions.find_one_and_update(
        {"_id": transition["_id"]},
        {"$set": updates},
        return_document=True
    )
    return updated_transition