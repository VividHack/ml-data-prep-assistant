from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import json
from werkzeug.utils import secure_filename
import tempfile
from data_processor import (
    get_data_summary,
    detect_issues,
    suggest_fixes,
    apply_fixes
)
from report_generator import generate_report

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'csv'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            df = pd.read_csv(filepath)
            summary = get_data_summary(df)
            
            # Store filepath in session or DB for later use
            # For simplicity, we'll just return it to frontend
            return jsonify({
                'message': 'File uploaded successfully',
                'filename': filename,
                'filepath': filepath,
                'summary': summary
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/detect-issues', methods=['POST'])
def detect_file_issues():
    data = request.json
    filepath = data.get('filepath')
    
    if not filepath or not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    
    try:
        df = pd.read_csv(filepath)
        issues = detect_issues(df)
        
        return jsonify({
            'issues': issues
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/suggest-fixes', methods=['POST'])
def suggest_file_fixes():
    data = request.json
    filepath = data.get('filepath')
    issues = data.get('issues')
    
    if not filepath or not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    
    try:
        df = pd.read_csv(filepath)
        fixes = suggest_fixes(df, issues)
        
        return jsonify({
            'fixes': fixes
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/apply-fixes', methods=['POST'])
def apply_file_fixes():
    data = request.json
    filepath = data.get('filepath')
    fixes = data.get('fixes')
    
    if not filepath or not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    
    try:
        df = pd.read_csv(filepath)
        updated_df, applied_fixes = apply_fixes(df, fixes)
        
        # Save the updated dataframe to a new file
        output_filepath = os.path.join(
            app.config['UPLOAD_FOLDER'], 
            'cleaned_' + os.path.basename(filepath)
        )
        updated_df.to_csv(output_filepath, index=False)
        
        return jsonify({
            'message': 'Fixes applied successfully',
            'output_filepath': output_filepath,
            'applied_fixes': applied_fixes
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-report', methods=['POST'])
def create_report():
    data = request.json
    original_filepath = data.get('original_filepath')
    cleaned_filepath = data.get('cleaned_filepath')
    applied_fixes = data.get('applied_fixes')
    
    if not original_filepath or not cleaned_filepath:
        return jsonify({'error': 'Missing file paths'}), 400
    
    if not os.path.exists(original_filepath) or not os.path.exists(cleaned_filepath):
        return jsonify({'error': 'File not found'}), 404
    
    try:
        # Generate PDF report
        report_path = generate_report(
            original_filepath,
            cleaned_filepath,
            applied_fixes
        )
        
        return jsonify({
            'message': 'Report generated successfully',
            'report_path': report_path
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add a route to serve HTML reports
@app.route('/api/reports/<filename>', methods=['GET'])
def serve_report(filename):
    return send_from_directory(tempfile.gettempdir(), filename)

# Add a route to serve the cleaned CSV file
@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True) 