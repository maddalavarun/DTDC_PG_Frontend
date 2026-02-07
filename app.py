import os
from flask import Flask, request, jsonify, send_from_directory
from track_order import track_shipment
import logging

app = Flask(__name__, static_folder='dist', static_url_path='')

# Configure logging
logging.basicConfig(level=logging.INFO)

@app.route('/api/track', methods=['POST'])
def track():
    data = request.get_json()
    if not data or 'tracking_id' not in data:
        return jsonify({"error": "Missing tracking_id"}), 400
    
    tracking_id = data['tracking_id']
    logging.info(f"Received tracking request for ID: {tracking_id}")
    
    try:
        result = track_shipment(tracking_id)
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(debug=False, host='0.0.0.0', port=port)
