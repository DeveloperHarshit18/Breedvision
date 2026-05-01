"""
BreedVision - /api/predict route
----------------------------------
Accepts a multipart image upload, runs breed prediction,
fetches breed details from MongoDB, saves to history, and returns JSON.
"""

import os
import sys
import uuid
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename

from extensions import mongo
from ml.predictor import predict_breed
from utils.validators import allowed_file
from utils.logger import get_logger

logger = get_logger(__name__)
predict_bp = Blueprint("predict", __name__)


@predict_bp.route("/predict", methods=["POST"])
def predict():
    """
    POST /api/predict
    Body: multipart/form-data  { image: <file> }
    Returns: JSON prediction with breed details
    """
    print("[DEBUG] PREDICT ENDPOINT CALLED!")
    sys.stdout.flush()

    # ── 1. Validate request ────────────────────────────────────────────────────
    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Use key 'image'."}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "Empty filename — please select an image."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Allowed: jpg, jpeg, png, webp"}), 415

    # ── 2. Save uploaded file ──────────────────────────────────────────────────
    ext = file.filename.rsplit(".", 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], secure_filename(unique_name))
    file.save(save_path)
    logger.info(f"Image saved to {save_path}")

    # ── 3. Run ML prediction ───────────────────────────────────────────────────
    try:
        result = predict_breed(save_path)
        predicted_breed = result["breed"]
        confidence = result["confidence"]
    except RuntimeError as e:
        # Specific API errors (credits exhausted, invalid key, etc.)
        logger.error(f"Prediction error: {e}")
        if os.path.exists(save_path):
            os.remove(save_path)
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        # Clean up saved file on error
        if os.path.exists(save_path):
            os.remove(save_path)
        return jsonify({"error": "Prediction service unavailable. Please try again."}), 503

    # ── 4. Fetch breed details from MongoDB ────────────────────────────────────
    print(f"[DEBUG] Looking for breed: '{predicted_breed}'")
    sys.stdout.flush()
    breed_doc = mongo.db.breeds.find_one(
        {"name": {"$regex": f"^{predicted_breed}$", "$options": "i"}},
        {"_id": 0}   # exclude internal MongoDB _id from response
    )
    print(f"[DEBUG] breed_doc result: {breed_doc}")
    sys.stdout.flush()

    if not breed_doc:
        # Fallback so the API always returns something useful
        breed_doc = {
            "name": predicted_breed,
            "origin": "Unknown",
            "milk_production": "N/A",
            "features": "Details not available in database.",
            "purpose": "N/A",
            "weight_kg": "N/A",
            "image_hint": "",
        }

    # ── 5. Persist prediction history ─────────────────────────────────────────
    history_entry = {
        "breed": predicted_breed,
        "confidence": confidence,
        "filename": unique_name,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "details": breed_doc,
    }
    mongo.db.history.insert_one(history_entry)

    # ── 6. Build and return response ───────────────────────────────────────────
    response_payload = {
        "breed": predicted_breed,
        "confidence": confidence,
        "details": {
            "origin": breed_doc.get("origin", "N/A"),
            "milk": breed_doc.get("milk_production", "N/A"),
            "features": breed_doc.get("features", "N/A"),
            "purpose": breed_doc.get("purpose", "N/A"),
            "weight_kg": breed_doc.get("weight_kg", "N/A"),
        },
    }

    return jsonify(response_payload), 200
