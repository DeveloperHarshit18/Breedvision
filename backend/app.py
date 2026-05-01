"""
BreedVision - Flask Backend Entry Point
---------------------------------------
Main application factory. Registers all routes and configures CORS,
MongoDB, and upload settings.
"""

import os
from flask import Flask,request,jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import mongo
import requests
from dotenv import load_dotenv
load_dotenv()

# Load environment variables from .env file
load_dotenv()



def create_app():
    """Application factory pattern for clean, testable Flask apps."""
    app = Flask(__name__)

    # ── Configuration ──────────────────────────────────────────────────────────
    app.config["MONGO_URI"] = os.getenv(
        "MONGO_URI", "mongodb://localhost:27017/breedvision"
    )
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB max upload
    app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), "uploads")

    # Create uploads directory if it doesn't exist
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # ── Extensions ─────────────────────────────────────────────────────────────
    CORS(app, resources={r"/api/*": {"origins": "*"}})  # Allow all origins for dev
    mongo.init_app(app)

    # ── Blueprints ─────────────────────────────────────────────────────────────
    from routes.predict import predict_bp
    from routes.history import history_bp
    from routes.breeds import breeds_bp

    app.register_blueprint(predict_bp, url_prefix="/api")
    app.register_blueprint(history_bp, url_prefix="/api")
    app.register_blueprint(breeds_bp, url_prefix="/api")

    # ── Health check ───────────────────────────────────────────────────────────
    @app.route("/api/health")
    def health():
        return {"status": "ok", "service": "BreedVision API"}

    return app


if __name__ == "__main__":
    app = create_app()
    debug_mode = os.getenv("FLASK_DEBUG", "0").lower() in ("1", "true", "yes")
    import os

app.run(
    debug=debug_mode,
    host="0.0.0.0",
    port=int(os.environ.get("PORT", 5000))
)
