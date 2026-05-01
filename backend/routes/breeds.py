"""
BreedVision - /api/breeds route
---------------------------------
CRUD-lite endpoint for browsing the breed catalogue.
"""

from flask import Blueprint, jsonify
from extensions import mongo
from utils.logger import get_logger

logger = get_logger(__name__)
breeds_bp = Blueprint("breeds", __name__)


def _serialize(doc):
    doc["id"] = str(doc.pop("_id"))
    return doc


@breeds_bp.route("/breeds", methods=["GET"])
def list_breeds():
    """GET /api/breeds  — return all breeds in the catalogue."""
    breeds = [_serialize(d) for d in mongo.db.breeds.find({})]
    return jsonify(breeds), 200


@breeds_bp.route("/breeds/<string:name>", methods=["GET"])
def get_breed(name):
    """GET /api/breeds/<name>  — return a single breed by name (case-insensitive)."""
    doc = mongo.db.breeds.find_one(
        {"name": {"$regex": f"^{name}$", "$options": "i"}}
    )
    if not doc:
        return jsonify({"error": f"Breed '{name}' not found"}), 404
    return jsonify(_serialize(doc)), 200
