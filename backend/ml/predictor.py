"""
BreedVision - ML Prediction Module
Breed prediction using Roboflow with fallback to mock predictor
"""

import os
import requests
from utils.logger import get_logger

logger = get_logger(__name__)

# ── Supported breeds ──────────────────────────────────────────────────────────
BREEDS = ["Gir", "Sahiwal", "Murrah", "Holstein Friesian"]

# ── Environment flags ─────────────────────────────────────────────────────────
USE_ROBOFLOW = os.getenv("USE_ROBOFLOW", "false").lower() == "true"
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY", "")
ROBOFLOW_PROJECT_URL = os.getenv(
    "ROBOFLOW_PROJECT_URL",
    "https://detect.roboflow.com/cattle-breed-detection/1"
)

print("USE_ROBOFLOW:", USE_ROBOFLOW)
print("URL:", ROBOFLOW_PROJECT_URL)
print("API KEY PRESENT:", bool(ROBOFLOW_API_KEY))

print(f"🔍 Predictor loaded: USE_ROBOFLOW={USE_ROBOFLOW}, API_KEY present={bool(ROBOFLOW_API_KEY)}")

# ══════════════════════════════════════════════════════════════════════════════
# PUBLIC FUNCTION
# ══════════════════════════════════════════════════════════════════════════════

def predict_breed(image_path: str) -> dict:
    logger.info(f"Running prediction on: {image_path}")

    # 🔥 MAIN FIX: real prediction use karo
    if USE_ROBOFLOW and ROBOFLOW_API_KEY:
        return _predict_with_roboflow(image_path)

    logger.warning("⚠️ Using fallback predictor (Roboflow disabled or API key missing)")
    return _fallback_predict(image_path)


# ══════════════════════════════════════════════════════════════════════════════
# ROBOTFLOW PREDICTION
# ══════════════════════════════════════════════════════════════════════════════

def _predict_with_roboflow(image_path: str) -> dict:
    try:
        print("🚀 Roboflow function started")

        with open(image_path, "rb") as f:
            response = requests.post(
                f"{ROBOFLOW_PROJECT_URL}?api_key={ROBOFLOW_API_KEY}",
                files={"file": f},
                timeout=20
            )

        print("STATUS:", response.status_code)
        print("RESPONSE TEXT:", response.text[:500])

        data = response.json()
        print("PARSED JSON:", data)

        predictions = data.get("predictions", [])

        if not predictions:
            print("⚠️ No predictions returned")
            return {"breed": "Unknown", "confidence": 0}

        best = max(predictions, key=lambda p: p.get("confidence", 0))

        return {
            "breed": best.get("class", "Unknown"),
            "confidence": round(best.get("confidence", 0) , 2)
        }

    except Exception as e:
        print("❌ FULL ERROR:", str(e))
        return {"breed": "Error", "confidence": 0}
    
# ══════════════════════════════════════════════════════════════════════════════
# SAFE FALLBACK (NOT PURE RANDOM)
# ══════════════════════════════════════════════════════════════════════════════

def _fallback_predict(image_path: str) -> dict:
    """
    Controlled fallback:
    - File size based seed (stable)
    - Confidence low rakha hai (taaki clearly pata chale fake hai)
    """

    try:
        file_size = os.path.getsize(image_path)

        # Stable but not fully random
        index = file_size % len(BREEDS)
        breed = BREEDS[index]

        confidence = round(50 + (file_size % 30), 2)  # 50–80 range

        logger.info(f"Fallback prediction → breed={breed}, confidence={confidence}")

        return {"breed": breed, "confidence": confidence}

    except Exception as e:
        logger.error(f"Fallback failed: {e}")
        return {"breed": "Unknown", "confidence": 0}