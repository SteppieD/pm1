# 📊 Local Project Management Tool

A simple braindump-to-project-management tool that works with Claude Code.

## 🚀 How This Works
1. **Braindump to Claude**: Paste unstructured project ideas into Claude Code
2. **Claude Structures It**: Claude reads/writes JSON files in the `data/` folder  
3. **You Visualize & Track**: Open the HTML tool to see Gantt charts and track time

## 💻 Installation & Setup

### 🍎 **macOS Setup**

#### Prerequisites
```bash
# Check if Python 3 is installed
python3 --version

# If not installed, install via Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install python
```

#### Step-by-Step Installation
```bash
# 1. Clone the repository
git clone https://github.com/SteppieD/pm1.git
cd pm1

# 2. Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the application
python app.py

# 5. Open your browser and go to:
# http://localhost:5000
```

### 🪟 **Windows Setup**

#### Prerequisites
1. **Install Python 3.8+** from [python.org](https://www.python.org/downloads/)
   - ✅ Check "Add Python to PATH" during installation
2. **Install Git** from [git-scm.com](https://git-scm.com/download/win)

#### Step-by-Step Installation
```cmd
# 1. Open Command Prompt or PowerShell and clone the repository
git clone https://github.com/SteppieD/pm1.git
cd pm1

# 2. Create a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the application
python app.py

# 5. Open your browser and go to:
# http://localhost:5000
```

### 🐧 **Linux Setup**
```bash
# 1. Install Python 3 and pip (if not already installed)
sudo apt update
sudo apt install python3 python3-pip python3-venv git

# 2. Clone the repository
git clone https://github.com/SteppieD/pm1.git
cd pm1

# 3. Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the application
python app.py

# 6. Open your browser to: http://localhost:5000
```

## 🎯 Quick Test
After setup, you should see:
- ✅ A sample project with Gantt chart
- ✅ Clickable tasks with timer functionality  
- ✅ Time tracking and completion checkboxes

## For Claude Code Users

### File Structure Claude Should Know About
```
data/
├── projects.json          # Master project list
└── projects/
    ├── project-1/
    │   ├── info.json      # Project details & tasks
    │   └── time-log.json  # Time tracking data
    └── project-2/
        ├── info.json
        └── time-log.json
```

### JSON Schema for Projects

**projects.json** (master list):
```json
{
  "projects": [
    {
      "id": "project-1",
      "name": "Website Redesign",
      "created": "2025-01-01",
      "status": "active"
    }
  ]
}
```

**project info.json**:
```json
{
  "id": "project-1",
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "created": "2025-01-01",
  "tasks": [
    {
      "id": "task-1",
      "name": "Create wireframes",
      "start": "2025-01-01",
      "end": "2025-01-03", 
      "completed": false,
      "dependencies": [],
      "timeSpent": 0
    }
  ]
}
```

## Instructions for Claude

When a user gives you a braindump:

1. **Read existing projects**: Check `data/projects.json` to see what exists
2. **Create new project folder**: Make `data/projects/project-X/` 
3. **Write info.json**: Structure their braindump into tasks with realistic dates
4. **Update projects.json**: Add the new project to the master list
5. **Tell user**: "Project created! Run `python app.py` to see your Gantt chart"

### Example Braindump Processing

User says: *"I need to launch a new product. Need to research competitors, design the product, build a prototype, test with users, and launch marketing campaign. Want to be done in 3 months."*

Claude should:
1. Create `data/projects/product-launch/info.json` with 5 tasks
2. Set realistic date ranges over 3 months  
3. Add dependencies (research → design → prototype → testing → marketing)
4. Update `data/projects.json` with new project entry

## Tech Stack
- **Backend**: Python/Flask (simple local server)
- **Frontend**: HTML/JS with Frappe Gantt library
- **Data**: JSON files (easy for Claude to read/write)
- **No dependencies**: Works offline, no API keys needed

## Development

- `app.py` - Python Flask server
- `templates/index.html` - Main UI
- `static/js/main.js` - Frontend logic  
- `static/css/style.css` - Styling