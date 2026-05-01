"""
BreedVision - /api/history route
----------------------------------
Returns paginated prediction history from MongoDB.
"""

from flask import Blueprint, request, jsonify
from bson import ObjectId
from extensions import mongo
from utils.logger import get_logger

logger = get_logger(__name__)
history_bp = Blueprint("history", __name__)


def _serialize(doc):
    """Convert MongoDB document to JSON-safe dict."""
    doc["id"] = str(doc.pop("_id"))
    return doc


@history_bp.route("/history", methods=["GET"])
def get_history():
    """
    GET /api/history?page=1&limit=10
    Returns paginated prediction history, newest first.
    """
    try:
        page = max(1, int(request.args.get("page", 1)))
        limit = min(50, max(1, int(request.args.get("limit", 10))))
    except ValueError:
        return jsonify({"error": "page and limit must be integers"}), 400

    skip = (page - 1) * limit
    total = mongo.db.history.count_documents({})

    cursor = (
        mongo.db.history.find({})
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
    )

    items = [_serialize(doc) for doc in cursor]

    return jsonify({
        "items": items,
        "total": total,
        "page": page,
        "pages": max(1, -(-total // limit)),  # ceiling division
    }), 200


@history_bp.route("/history/<string:entry_id>", methods=["DELETE"])
def delete_history_entry(entry_id):
    """DELETE /api/history/<id>  — remove a single history record."""
    try:
        result = mongo.db.history.delete_one({"_id": ObjectId(entry_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Record not found"}), 404
        return jsonify({"message": "Deleted successfully"}), 200
    except Exception as e:
        logger.error(f"Delete error: {e}")
        return jsonify({"error": "Invalid ID format"}), 400


@history_bp.route("/history", methods=["DELETE"])
def clear_history():
    """DELETE /api/history  — wipe all history records."""
    result = mongo.db.history.delete_many({})
    return jsonify({"message": f"Cleared {result.deleted_count} records"}), 200
