from flask import Flask, request, jsonify
from track_order import track_shipment
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)

@app.route('/track', methods=['POST'])
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
