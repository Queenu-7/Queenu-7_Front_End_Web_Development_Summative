Welcome!!!
This is the Campus Life Planner, its a simple accessible web app to help everyday students manage  their tasks like assignments, club meetings, study preps etc. 

##Features

**Task Management**: Add, edit, delete tasks with titles, due dates, duration and tags.
**Advanced Search**: Regex-powered search with match highlighting
**Dashboard**: Statistics and progress tracking with weekly targets
**Responsive Design**: Mobile first layout that works on all devices
**Data Persistance**: Automatically saves to localStorage with import/export
**Accesibity**: Full Keyboard navigation and Aria labels

##Regex patterns used include;

**Title**: `/^\S(?:.*\S)?$/`
**Duration**: `/^(0|[1-9]\d*)$/`
**Tag**: Letters, space, pyphens only.
YYYY-MM-DD format

##Advanced pattern 
**Duplicate words**: `/\b(\w+)\s+\1\b/i` - Detects repeated consecutive words

** Search patterns
-Use any valid regex pattern in the search box

##Keyboard Navigation
-`Tab` - Navigate between interactive elements
-`Enter`- Activate buttons and form submission
-`space` - Toggle sort direction
-`Escape` - Close modals (If implemented)

##Accessibilty Features
-Aria landmarks and labels
-Semantic HTML structure
-Keyboard-only navgation
-Visibl focus indicators
-Screen reader announcements

