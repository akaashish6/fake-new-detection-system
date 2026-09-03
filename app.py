import os
import logging
from urllib.parse import urlparse

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from PIL import Image, UnidentifiedImageError

import database
import gemini_service
import image_forensics


# =========================================================
# CONFIGURATION
# =========================================================

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")

# Maximum request size: 15 MB
MAX_REQUEST_SIZE = 15 * 1024 * 1024


# =========================================================
# LOGGING
# =========================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger(__name__)


# =========================================================
# FLASK APP
# =========================================================

if os.path.exists(FRONTEND_DIST):
    app = Flask(
        __name__,
        static_folder=FRONTEND_DIST,
        static_url_path=""
    )
else:
    app = Flask(__name__)

# Limit uploads/request bodies
app.config["MAX_CONTENT_LENGTH"] = MAX_REQUEST_SIZE

# Prototype CORS
CORS(app)


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def error_response(message, code, status=400, details=None):
    """
    Standard API error response.
    """
    response = {
        "success": False,
        "error": {
            "code": code,
            "message": message
        }
    }

    if details is not None:
        response["error"]["details"] = details

    return jsonify(response), status


def validate_url(url):
    """
    Validate that the supplied value is an HTTP/HTTPS URL.
    """
    if not url:
        return False

    try:
        parsed = urlparse(url)

        return (
            parsed.scheme in ("http", "https")
            and bool(parsed.netloc)
        )

    except Exception:
        return False


def validate_image(image_bytes):
    """
    Validate that uploaded bytes represent a readable image.
    """
    if not image_bytes:
        raise ValueError("The uploaded image is empty.")

    try:
        image = Image.open(
            __import__("io").BytesIO(image_bytes)
        )

        # Force PIL to actually read the image
        image.verify()

    except UnidentifiedImageError:
        raise ValueError(
            "The uploaded file is not a valid image."
        )

    except Exception:
        raise ValueError(
            "The image could not be read or is corrupted."
        )


# =========================================================
# FRONTEND ROUTING
# =========================================================

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):

    if (
        path
        and os.path.exists(
            os.path.join(FRONTEND_DIST, path)
        )
    ):
        return send_from_directory(
            FRONTEND_DIST,
            path
        )

    if os.path.exists(
        os.path.join(FRONTEND_DIST, "index.html")
    ):
        return send_from_directory(
            FRONTEND_DIST,
            "index.html"
        )

    return jsonify({
        "name": "TruthLens Fake News Detection API",
        "status": "running",
        "frontend_dev": "http://localhost:5173"
    })


# =========================================================
# MAIN FACT-CHECK ENDPOINT
# =========================================================

@app.route("/api/check", methods=["POST"])
def check_claim():

    input_type = request.form.get(
        "type",
        "text"
    ).strip().lower()

    content = ""
    image_bytes = None
    audio_bytes = None
    audio_mime_type = None

    try:

        # -------------------------------------------------
        # Validate input type
        # -------------------------------------------------

        allowed_types = {
            "text",
            "url",
            "image",
            "audio"
        }

        if input_type not in allowed_types:
            return error_response(
                "Invalid input type.",
                "INVALID_INPUT_TYPE",
                400,
                {
                    "allowed_types": list(allowed_types)
                }
            )


        # -------------------------------------------------
        # TEXT
        # -------------------------------------------------

        if input_type == "text":

            content = request.form.get(
                "text",
                ""
            ).strip()

            if not content:
                return error_response(
                    "Please enter text or a claim to verify.",
                    "EMPTY_TEXT",
                    400
                )

            if len(content) > 10000:
                return error_response(
                    "The text is too long. Please keep the claim under 10,000 characters.",
                    "TEXT_TOO_LONG",
                    400
                )


        # -------------------------------------------------
        # URL
        # -------------------------------------------------

        elif input_type == "url":

            content = request.form.get(
                "url",
                ""
            ).strip()

            if not content:
                return error_response(
                    "Please enter a news article URL.",
                    "EMPTY_URL",
                    400
                )

            if not validate_url(content):
                return error_response(
                    "Please enter a valid HTTP or HTTPS URL.",
                    "INVALID_URL",
                    400
                )


        # -------------------------------------------------
        # IMAGE
        # -------------------------------------------------

        elif input_type == "image":

            if "image" not in request.files:
                return error_response(
                    "No image file was uploaded.",
                    "IMAGE_MISSING",
                    400
                )

            file = request.files["image"]

            if not file or not file.filename:
                return error_response(
                    "No image file was selected.",
                    "IMAGE_MISSING",
                    400
                )

            image_bytes = file.read()

            if not image_bytes:
                return error_response(
                    "The uploaded image is empty.",
                    "IMAGE_EMPTY",
                    400
                )

            # Validate before sending to Gemini/forensics
            validate_image(image_bytes)

            content = (
                f"Image screenshot ({file.filename})"
            )


        # -------------------------------------------------
        # AUDIO
        # -------------------------------------------------

        elif input_type == "audio":

            if "audio" not in request.files:
                return error_response(
                    "No audio file was uploaded or recorded.",
                    "AUDIO_MISSING",
                    400
                )

            file = request.files["audio"]

            if not file or not file.filename:
                return error_response(
                    "No audio file was selected.",
                    "AUDIO_MISSING",
                    400
                )

            audio_bytes = file.read()

            if not audio_bytes:
                return error_response(
                    "The uploaded audio file is empty.",
                    "AUDIO_EMPTY",
                    400
                )

            audio_mime_type = (
                file.mimetype or "audio/mpeg"
            )

            content = (
                f"Audio Voice Note ({file.filename})"
            )


        # =================================================
        # RUN FACT CHECK
        # =================================================

        logger.info(
            "Starting fact-check | type=%s",
            input_type
        )

        try:

            result = gemini_service.analyze_claim(
                input_type,
                content,
                image_bytes=image_bytes,
                audio_bytes=audio_bytes,
                audio_mime_type=audio_mime_type
            )

        except ValueError as exc:

            logger.warning(
                "Fact-check validation error: %s",
                exc
            )

            return error_response(
                str(exc),
                "FACT_CHECK_INPUT_ERROR",
                400
            )

        except RuntimeError as exc:

            logger.error(
                "Fact-check service error: %s",
                exc
            )

            return error_response(
                "The fact-checking service could not complete the verification.",
                "FACT_CHECK_SERVICE_ERROR",
                503
            )

        except Exception:

            logger.exception(
                "Unexpected fact-checking error"
            )

            return error_response(
                "An unexpected error occurred while analyzing the claim.",
                "FACT_CHECK_INTERNAL_ERROR",
                500
            )


        # =================================================
        # IMAGE FORENSICS
        # =================================================

        forensics_data = None

        if (
            input_type == "image"
            and image_bytes
        ):

            try:

                forensics_data = (
                    image_forensics.perform_forensic_ela(
                        image_bytes
                    )
                )

                result["forensics"] = (
                    forensics_data
                )

            except Exception:

                logger.exception(
                    "Image forensic analysis failed"
                )

                # IMPORTANT:
                # Do not destroy an otherwise successful
                # fact-check just because ELA failed.

                result["forensics"] = {
                    "available": False,
                    "error": (
                        "Image forensic analysis "
                        "could not be completed."
                    )
                }


        # =================================================
        # SAVE RESULT
        # =================================================

        try:

            scan_id = database.save_scan(
                input_type=input_type,
                input_content=content[:300],
                language=result.get(
                    "language_detected",
                    "English"
                ),
                verdict=result.get(
                    "verdict",
                    "Unverifiable"
                ),
                confidence_score=result.get(
                    "confidence_score",
                    0
                ),
                reasoning=result.get(
                    "reasoning",
                    ""
                ),
                manipulation_techniques=result.get(
                    "manipulation_techniques",
                    []
                ),
                sources=result.get(
                    "sources",
                    []
                ),
                forensics=forensics_data,
                claim_text=result.get(
                    "claim_text"
                ),
                verdict_reasons=result.get(
                    "verdict_reasons",
                    []
                )
            )

            result["scan_id"] = scan_id
            from datetime import datetime
            from zoneinfo import ZoneInfo
            result["timestamp"] = datetime.now(ZoneInfo("Asia/Kolkata")).strftime("%d %b %Y, %I:%M %p")

        except Exception:

            logger.exception(
                "Database save failed"
            )

            # The fact-check itself succeeded.
            # Do not pretend the analysis failed.

            return jsonify({
                "success": True,
                "scan_id": None,
                "database_saved": False,
                "input_type": input_type,
                "input_content": content,
                "data": result,
                "warning": {
                    "code": "DATABASE_SAVE_FAILED",
                    "message": (
                        "The fact-check completed successfully, "
                        "but the result could not be saved to history."
                    )
                }
            }), 200


        # =================================================
        # SUCCESS
        # =================================================

        logger.info(
            "Fact-check completed successfully | scan_id=%s",
            scan_id
        )

        return jsonify({
            "success": True,
            "scan_id": scan_id,
            "database_saved": True,
            "input_type": input_type,
            "input_content": content,
            "data": result
        }), 200


    # =====================================================
    # REQUEST TOO LARGE
    # =====================================================

    except Exception as exc:

        logger.exception(
            "Unexpected /api/check error"
        )

        return error_response(
            "An unexpected server error occurred.",
            "INTERNAL_SERVER_ERROR",
            500
        )


# =========================================================
# HISTORY
# =========================================================

@app.route("/api/history", methods=["GET"])
def get_history():

    try:

        scans = database.get_scans()

        return jsonify({
            "success": True,
            "scans": scans
        })

    except Exception:

        logger.exception(
            "Failed to retrieve scan history"
        )

        return error_response(
            "Could not retrieve scan history.",
            "HISTORY_FETCH_FAILED",
            500
        )


@app.route(
    "/api/history/<int:scan_id>",
    methods=["DELETE"]
)
def delete_history_item(scan_id):

    try:

        database.delete_scan(scan_id)

        return jsonify({
            "success": True,
            "message": "Scan deleted successfully."
        })

    except Exception:

        logger.exception(
            "Failed to delete scan %s",
            scan_id
        )

        return error_response(
            "Could not delete the scan.",
            "HISTORY_DELETE_FAILED",
            500
        )


@app.route(
    "/api/history/clear",
    methods=["DELETE"]
)
def clear_history():

    try:

        database.clear_scans()

        return jsonify({
            "success": True,
            "message": "Scan history cleared."
        })

    except Exception:

        logger.exception(
            "Failed to clear scan history"
        )

        return error_response(
            "Could not clear scan history.",
            "HISTORY_CLEAR_FAILED",
            500
        )


# =========================================================
# 404 HANDLER
# =========================================================

@app.errorhandler(404)
def not_found(error):

    if request.path.startswith("/api"):

        return error_response(
            "API endpoint not found.",
            "API_NOT_FOUND",
            404
        )

    if os.path.exists(
        os.path.join(FRONTEND_DIST, "index.html")
    ):

        return send_from_directory(
            FRONTEND_DIST,
            "index.html"
        )

    return jsonify({
        "error": "Page not found"
    }), 404


# =========================================================
# REQUEST TOO LARGE HANDLER
# =========================================================

@app.errorhandler(413)
def request_too_large(error):

    return error_response(
        "The uploaded file or request is too large. Maximum size is 15 MB.",
        "REQUEST_TOO_LARGE",
        413
    )


# =========================================================
# SERVER
# =========================================================

if __name__ == "__main__":

    port = int(
        os.environ.get(
            "PORT",
            5000
        )
    )

    debug = (
        os.environ.get(
            "FLASK_DEBUG",
            "false"
        ).lower() == "true"
    )

    app.run(
        host="0.0.0.0",
        port=port,
        debug=debug
    )