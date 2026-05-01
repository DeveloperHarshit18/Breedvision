"""
BreedVision — Shared extensions
--------------------------------
Single source of truth for the MongoDB connection.
Both app.py and route blueprints import `mongo` from here,
avoiding the __main__ vs module double-import problem.
"""

from pymongo import MongoClient


class _Mongo:
    """Thin wrapper so routes can do `from extensions import mongo; mongo.db.xxx`."""

    def __init__(self):
        self._db = None

    def init_app(self, app):
        uri = app.config["MONGO_URI"]
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        # Extract DB name from the URI (last path segment) or default
        db_name = uri.rsplit("/", 1)[-1].split("?")[0] or "breedvision"
        self._db = client[db_name]

    @property
    def db(self):
        return self._db


mongo = _Mongo()
