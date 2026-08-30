import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

import database
import gemini_service
import image_forensics

# Load environment variables
load_dotenv()

FRONTEND_DIST = os.path.join(os.path.dirname(__file__), 'frontend', 'dist')

if os.path.exists(FRONTEND_DIST):
    app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')
else:
    app = Flask(__name__)

CORS(app)  # Enable Cross-Origin Resource Sharing for React frontend

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return send_from_directory(FRONTEND_DIST, path)
    if os.path.exists(os.path.join(FRONTEND_DIST, 'index.html')):
        return send_from_directory(FRONTEND_DIST, 'index.html')
    return jsonify({
        'name': 'TruthLens Fake News Detection API',
        'status': 'running',
        'frontend_dev': 'http://localhost:5173'
    })

@app.route('/api/check', methods=['POST'])
def check_claim():
    try:
        input_type = request.form.get('type', 'text')
        content = ""
        image_bytes = None
        
        if input_type == 'text':
            content = request.form.get('text', '').strip()
            if not content:
                return jsonify({'success': False, 'error': 'Please enter text or a claim to verify.'}), 400
                
        elif input_type == 'url':
            content = request.form.get('url', '').strip()
            if not content:
                return jsonify({'success': False, 'error': 'Please enter a valid news article URL.'}), 400
                
        elif input_type == 'image':
            if 'image' not in request.files:
                return jsonify({'success': False, 'error': 'No image file uploaded.'}), 400
            file = request.files['image']
            if file.filename == '':
                return jsonify({'success': False, 'error': 'No image file selected.'}), 400
            image_bytes = file.read()
            content = f"Image screenshot ({file.filename})"
            
        elif input_type == 'audio':
            if 'audio' not in request.files:
                return jsonify({'success': False, 'error': 'No audio voice file uploaded or recorded.'}), 400
            file = request.files['audio']
            if file.filename == '':
                return jsonify({'success': False, 'error': 'No audio file selected.'}), 400
            audio_bytes = file.read()
            audio_mime_type = file.mimetype or 'audio/mp3'
            content = f"Audio Voice Note ({file.filename or 'Recorded Audio'})"
        else:
            return jsonify({'success': False, 'error': 'Invalid input type specified.'}), 400
            
        # Call Fact-checking service
        result = gemini_service.analyze_claim(
            input_type,
            content,
            image_bytes=image_bytes,
            audio_bytes=audio_bytes if input_type == 'audio' else None,
            audio_mime_type=audio_mime_type if input_type == 'audio' else None
        )
        
        # If image, perform deep Error Level Analysis (ELA) and manipulation heatmap
        forensics_data = None
        if input_type == 'image' and image_bytes:
            forensics_data = image_forensics.perform_forensic_ela(image_bytes)
            result['forensics'] = forensics_data
        
        # Save scan result to SQLite Database
        scan_id = database.save_scan(
            input_type=input_type,
            input_content=content[:300],  # Truncate content for index display if long
            language=result.get('language_detected', 'English'),
            verdict=result.get('verdict', 'Unverifiable'),
            confidence_score=result.get('confidence_score', 0),
            reasoning=result.get('reasoning', ''),
            manipulation_techniques=result.get('manipulation_techniques', []),
            sources=result.get('sources', []),
            forensics=forensics_data,
            claim_text=result.get('claim_text')
        )
        
        return jsonify({
            'success': True,
            'scan_id': scan_id,
            'input_type': input_type,
            'input_content': content,
            'data': result
        })
        
    except ValueError as ve:
        return jsonify({'success': False, 'error': str(ve)}), 400
    except RuntimeError as re:
        return jsonify({'success': False, 'error': str(re)}), 503
    except Exception as e:
        return jsonify({'success': False, 'error': f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        scans = database.get_scans()
        return jsonify({'success': True, 'scans': scans})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/history/<int:scan_id>', methods=['DELETE'])
def delete_history_item(scan_id):
    try:
        database.delete_scan(scan_id)
        return jsonify({'success': True, 'message': 'Scan deleted successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/history/clear', methods=['DELETE'])
def clear_history():
    try:
        database.clear_scans()
        return jsonify({'success': True, 'message': 'Scan history cleared.'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api'):
        return jsonify({'success': False, 'error': 'API endpoint not found'}), 404
    if os.path.exists(os.path.join(FRONTEND_DIST, 'index.html')):
        return send_from_directory(FRONTEND_DIST, 'index.html')
    return jsonify({'error': 'Page not found'}), 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
