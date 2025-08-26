# Local Project Management Tool

A simple braindump-to-project-management tool that works with Claude Code.

## How This Works
1. **Braindump to Claude**: Paste unstructured project ideas into Claude Code
2. **Claude Structures It**: Claude reads/writes JSON files in the `data/` folder  
3. **You Visualize & Track**: Open the HTML tool to see Gantt charts and track time

## For Claude Code Users

### Quick Start
```bash
python app.py
# Then open http://localhost:5000
```

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