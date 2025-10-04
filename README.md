# Advanced Flow Management System (FMS)

A comprehensive workflow management system that uses Google Sheets as a database backend and provides a modern React frontend for creating and managing workflow templates and projects.

## Features

- **FMS Template Creation**: Design reusable workflow templates with multiple steps
- **Visual Flowcharts**: Automatically generated Mermaid.js flowcharts for workflow visualization
- **Project Management**: Start projects based on FMS templates with automatic task progression
- **Smart Task Assignment**: Tasks appear on assigned user's dashboard only after previous step completion
- **Activity Logs**: Complete audit trail of all FMS and project activities
- **User Authentication**: Track who creates and updates workflows and tasks

## System Architecture

### Backend
- **Google Sheets** as database (no API key needed)
- **Google Apps Script** Web App as REST API connector
- Two sheets: `FMS_MASTER` (templates) and `FMS_PROGRESS` (project execution)

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Mermaid.js** for flowchart generation
- **React Router** for navigation
- **Lucide React** for icons

## Prerequisites

- Google Account (for Google Sheets)
- Node.js 16+ and npm

## Setup Instructions

### Part 1: Google Sheets Backend Setup

Follow the detailed instructions in **[GOOGLE_APPS_SCRIPT.md](./GOOGLE_APPS_SCRIPT.md)** to:

1. Create the Google Sheet with required columns
2. Set up the Apps Script backend
3. Deploy as a Web App
4. Get your Web App URL

### Part 2: Frontend Configuration

1. **Clone or download this project**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure the Apps Script URL**:

   Open the `.env` file and replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with your actual Web App URL:

   ```env
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## Default Login

- **Password**: `fms2024` (works with any username)
- The system tracks activities by username

## User Guide

### Creating an FMS Template

1. Navigate to **Create FMS** from the dashboard
2. Enter an FMS name
3. Add steps with:
   - **WHAT**: Task description
   - **WHO**: Person responsible
   - **HOW**: Method or process to follow
   - **WHEN**: Duration in days
4. Add multiple steps as needed
5. Click **Show Flowchart** to visualize the workflow
6. Save the template

### Starting a Project

1. Go to **Start Project**
2. Select an FMS template from the dropdown
3. Enter a project name
4. Set the project start date
5. Click **Start Project**

The first step will be created immediately and assigned to the responsible person. Subsequent steps will appear automatically after each previous step is completed.

### Managing Tasks

#### My Tasks Tab
- View all tasks assigned to you
- Mark tasks as "In Progress" or "Complete"
- See due dates and task details
- Tasks automatically progress to the next step when marked complete

#### All Projects Tab
- View all projects and their complete task lists
- See progress across all projects
- Monitor team members' tasks
- Track completion status and dates

### Viewing Logs

Navigate to **Logs** to see:
- FMS template creation history
- Project start activities
- Task updates and completions
- Who performed each action and when

## Database Schema

### FMS_MASTER Sheet
Stores workflow templates:
- `FMS_ID`: Auto-generated unique identifier
- `FMS_Name`: Name of the workflow template
- `Step_No`: Step number in sequence
- `WHAT`: Task description
- `WHO`: Responsible person
- `HOW`: Method/process
- `WHEN`: Duration in days
- `Created_By`: Username of creator
- `Created_On`: Timestamp
- `Last_Updated_By`: Last editor username
- `Last_Updated_On`: Last update timestamp

### FMS_PROGRESS Sheet
Stores project execution:
- `Project_ID`: Auto-generated unique identifier
- `FMS_ID`: Link to FMS template
- `Project_Name`: Name of the project
- `Step_No`: Current step number
- `WHAT`: Task description
- `WHO`: Assigned person
- `HOW`: Method/process
- `Planned_Due_Date`: Calculated due date
- `Actual_Completed_On`: Completion timestamp
- `Status`: Pending/In Progress/Done
- `Created_By`: Username of creator
- `Created_On`: Timestamp
- `Last_Updated_By`: Last editor username
- `Last_Updated_On`: Last update timestamp

## How Task Progression Works

1. When a project starts, **only the first step** is created in `FMS_PROGRESS`
2. The due date is calculated: `Project Start Date + Step Duration`
3. The task appears on the assigned person's dashboard
4. When marked as **Done**:
   - The completion timestamp is recorded
   - The **next step** is automatically created
   - Next step's due date = `Completion Date + Next Step Duration`
5. This continues until all steps are completed

## API Endpoints

The Google Apps Script backend supports these actions:

- `login`: Authenticate user
- `createFMS`: Save new FMS template
- `getAllFMS`: Get all FMS templates
- `getFMSById`: Get specific FMS details
- `createProject`: Start new project
- `getAllProjects`: Get all projects
- `getProjectsByUser`: Get user's assigned tasks
- `updateTaskStatus`: Update task status
- `getAllLogs`: Get activity logs

## Troubleshooting

### Connection Error
- Verify your Apps Script Web App URL in `.env`
- Ensure the Apps Script is deployed with "Anyone" access
- Check that the Google Sheet has the correct sheet names

### Tasks Not Appearing
- Ensure previous step is marked as "Done"
- Check that the username matches the "WHO" field
- Refresh the dashboard

### Flowchart Not Displaying
- Ensure all step fields are filled
- Check browser console for errors
- Verify Mermaid.js is loaded

## Development

### Project Structure
```
src/
├── components/         # Reusable components
│   ├── Layout.tsx     # Main layout with navigation
│   └── PrivateRoute.tsx # Protected route wrapper
├── context/           # React context providers
│   └── AuthContext.tsx # Authentication state
├── pages/             # Application pages
│   ├── Login.tsx      # Login page
│   ├── Dashboard.tsx  # Task dashboard
│   ├── CreateFMS.tsx  # FMS template creator
│   ├── StartProject.tsx # Project starter
│   └── Logs.tsx       # Activity logs
├── services/          # API services
│   └── api.ts         # Apps Script API calls
├── types/             # TypeScript types
│   └── index.ts       # Type definitions
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript types

## License

This project is provided as-is for educational and business use.

## Support

For issues or questions:
1. Check that Google Apps Script is properly deployed
2. Verify all environment variables are set
3. Ensure Google Sheet has correct structure
4. Check browser console for errors

---

**Built with React, TypeScript, Tailwind CSS, and Google Apps Script**
