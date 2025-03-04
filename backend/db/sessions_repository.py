from pymongo import ReturnDocument
from db.db_connection import get_db

db = get_db()

def save_session(session_id):
    doc = {
        '_id': session_id,
        'seq': 0
    }
    result = db.sessions.insert_one(doc)
    return str(result.inserted_id)

def get_last_step(session_id):
    doc = db.sessions.find_one({'_id': session_id})
    return doc.get("seq")

def get_next_step(session_id):
    doc = db.sessions.find_one_and_update(
        {"_id": session_id},               # find
        {"$inc": {"seq": 1}},              # increment by 1
        return_document=ReturnDocument.AFTER  # return the updated doc
    )
    return doc.get("seq")

def get_all_sessions():
    return list(db.sessions.find({}))


