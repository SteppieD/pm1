#!/usr/bin/env python3
"""
Simple local project management tool server
Run with: python app.py
"""

from flask import Flask, render_template, jsonify, request
import json
import os
from datetime import datetime

app = Flask(__name__)

DATA_DIR = 'data'
PROJECTS_DIR = os.path.join(DATA_DIR, 'projects')
PROJECTS_FILE = os.path.join(DATA_DIR, 'projects.json')

def ensure_data_structure():
    """Create data directories and files if they don't exist"""
    os.makedirs(PROJECTS_DIR, exist_ok=True)
    
    if not os.path.exists(PROJECTS_FILE):
        with open(PROJECTS_FILE, 'w') as f:
            json.dump({"projects": []}, f, indent=2)

def load_projects():
    """Load the master projects list"""
    ensure_data_structure()
    with open(PROJECTS_FILE, 'r') as f:
        return json.load(f)

def load_project_info(project_id):
    """Load detailed project info"""
    project_path = os.path.join(PROJECTS_DIR, project_id, 'info.json')
    if os.path.exists(project_path):
        with open(project_path, 'r') as f:
            return json.load(f)
    return None

def load_time_log(project_id):
    """Load time tracking data for a project"""
    time_path = os.path.join(PROJECTS_DIR, project_id, 'time-log.json')
    if os.path.exists(time_path):
        with open(time_path, 'r') as f:
            return json.load(f)
    return {"sessions": []}

def save_time_log(project_id, time_data):
    """Save time tracking data"""
    time_path = os.path.join(PROJECTS_DIR, project_id, 'time-log.json')
    with open(time_path, 'w') as f:
        json.dump(time_data, f, indent=2)

@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('index.html')

@app.route('/api/projects')
def get_projects():
    """Get all projects"""
    return jsonify(load_projects())

@app.route('/api/project/<project_id>')
def get_project(project_id):
    """Get detailed project info"""
    project_info = load_project_info(project_id)
    time_log = load_time_log(project_id)
    
    if project_info:
        # Add time tracking data to tasks
        for task in project_info.get('tasks', []):
            task['timeSpent'] = 0  # Will calculate from time log
        
        return jsonify({
            'project': project_info,
            'timeLog': time_log
        })
    return jsonify({'error': 'Project not found'}), 404

@app.route('/api/project/<project_id>/task/<task_id>/toggle', methods=['POST'])
def toggle_task(project_id, task_id):
    """Toggle task completion status"""
    project_info = load_project_info(project_id)
    if not project_info:
        return jsonify({'error': 'Project not found'}), 404
    
    # Find and toggle task
    for task in project_info.get('tasks', []):
        if task['id'] == task_id:
            task['completed'] = not task.get('completed', False)
            break
    
    # Save updated project
    project_path = os.path.join(PROJECTS_DIR, project_id, 'info.json')
    with open(project_path, 'w') as f:
        json.dump(project_info, f, indent=2)
    
    return jsonify({'success': True})

@app.route('/api/project/<project_id>/task/<task_id>/time', methods=['POST'])
def log_time(project_id, task_id):
    """Log time for a task"""
    time_data = request.get_json()
    time_log = load_time_log(project_id)
    
    # Add new time session
    session = {
        'taskId': task_id,
        'start': time_data.get('start'),
        'end': time_data.get('end'),
        'duration': time_data.get('duration'),
        'timestamp': datetime.now().isoformat()
    }
    
    time_log['sessions'].append(session)
    save_time_log(project_id, time_log)
    
    return jsonify({'success': True})

if __name__ == '__main__':
    ensure_data_structure()
    print("🚀 Project Management Tool starting...")
    print("📊 Open http://localhost:5000 to view your projects")
    print("💡 Use Claude Code to create projects in the data/ folder")
    app.run(debug=True, host='0.0.0.0', port=5000)