import pymongo

from config import DB_NAME


def get_db(db_name=DB_NAME):
    """
    Returns a reference to the local MongoDB database.
    By default, connects to localhost:27017 (standard port).
    """
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client[db_name]
    return db