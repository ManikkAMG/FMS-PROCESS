# Google Apps Script Backend Setup

## Overview

This FMS (Flow Management System) uses Google Sheets as a database and Google Apps Script as the backend API. Follow these steps to set up your backend.

## Step 1: Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "FMS System Database"

## Step 2: Create Three Sheets

### Sheet 1: FMS_MASTER

Create a sheet named `FMS_MASTER` with these columns (Row 1):
- FMS_ID
- FMS_Name
- Step_No
- WHAT
- WHO
- HOW
- WHEN
- When_Unit (new)
- When_Days (new)
- When_Hours (new)
- Created_By
- Created_On
- Last_Updated_By
- Last_Updated_On

### Sheet 2: FMS_PROGRESS

Create a sheet named `FMS_PROGRESS` with these columns (Row 1):
- Project_ID
- FMS_ID
- Project_Name
- Step_No
- WHAT
- WHO
- HOW
- Planned_Due_Date
- Actual_Completed_On
- Status
- Completed_By (new)
- Is_First_Step (new)
- Created_By
- Created_On
- Last_Updated_By
- Last_Updated_On

### Sheet 3: Users

Create a sheet named `Users` with these columns (Row 1):
- Username
- Password
- Name
- Role
- Department
- Last_Login

## Step 3: Add Apps Script Code

1. In your Google Sheet, click **Extensions** > **Apps Script**
2. Delete any existing code
3. Copy and paste the following code:

```javascript
// ============================================
// FMS Google Apps Script Web App Backend
// Enhanced Version with Time Tracking
// ============================================

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'FMS API is running'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;

    let result;

    switch(action) {
      case 'login':
        result = handleLogin(params);
        break;
      case 'getUsers':
        result = getUsers();
        break;
      case 'createFMS':
        result = createFMS(params);
        break;
      case 'getAllFMS':
        result = getAllFMS();
        break;
      case 'getFMSById':
        result = getFMSById(params.fmsId);
        break;
      case 'createProject':
        result = createProject(params);
        break;
      case 'getAllProjects':
        result = getAllProjects();
        break;
      case 'getProjectsByUser':
        result = getProjectsByUser(params.username);
        break;
      case 'updateTaskStatus':
        result = updateTaskStatus(params);
        break;
      case 'getAllLogs':
        result = getAllLogs();
        break;
      default:
        result = { success: false, message: 'Invalid action' };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleLogin(params) {
  const username = (params.username || '').toString();
  const password = (params.password || '').toString();

  if (!username || !password) {
    return { success: false, message: 'Missing username or password' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName('Users');
  if (!usersSheet) {
    return { success: false, message: 'Users sheet not found' };
  }

  const data = usersSheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { success: false, message: 'No users configured' };
  }

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowUsername = String(row[0]);
    const rowPassword = String(row[1]);

    if (rowUsername === username) {
      if (rowPassword === password) {
        const name = row[2] || '';
        const role = row[3] || '';
        const department = row[4] || '';
        const timestamp = new Date().toISOString();

        usersSheet.getRange(i + 1, 6).setValue(timestamp);

        return {
          success: true,
          user: {
            username: username,
            name: name,
            role: role,
            department: department,
            lastLogin: timestamp
          }
        };
      } else {
        return { success: false, message: 'Invalid credentials' };
      }
    }
  }

  return { success: false, message: 'User not found' };
}

function getUsers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName('Users');
  if (!usersSheet) {
    return { success: false, message: 'Users sheet not found' };
  }

  const data = usersSheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { success: true, users: [] };
  }

  const users = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    users.push({
      username: row[0],
      name: row[2],
      role: row[3],
      department: row[4],
      lastLogin: row[5] || ''
    });
  }

  return { success: true, users: users };
}

function createFMS(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName('FMS_MASTER');

  const fmsId = 'FMS' + Date.now();
  const fmsName = params.fmsName;
  const steps = params.steps;
  const username = params.username;
  const timestamp = new Date().toISOString();

  steps.forEach((step, index) => {
    masterSheet.appendRow([
      fmsId,
      fmsName,
      index + 1,
      step.what,
      step.who,
      step.how,
      step.when,
      step.whenUnit || 'days',
      step.whenDays || 0,
      step.whenHours || 0,
      username,
      timestamp,
      username,
      timestamp
    ]);
  });

  return {
    success: true,
    fmsId: fmsId,
    message: 'FMS created successfully'
  };
}

function getAllFMS() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName('FMS_MASTER');
  const data = masterSheet.getDataRange().getValues();

  if (data.length <= 1) {
    return { success: true, fmsList: [] };
  }

  const fmsMap = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const fmsId = row[0];
    const fmsName = row[1];
    const stepNo = row[2];

    if (!fmsMap[fmsId]) {
      fmsMap[fmsId] = {
        fmsId: fmsId,
        fmsName: fmsName,
        stepCount: 0,
        createdBy: row[10],
        createdOn: row[11]
      };
    }

    fmsMap[fmsId].stepCount = Math.max(fmsMap[fmsId].stepCount, stepNo);
  }

  return {
    success: true,
    fmsList: Object.values(fmsMap)
  };
}

function getFMSById(fmsId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName('FMS_MASTER');
  const data = masterSheet.getDataRange().getValues();

  const steps = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === fmsId) {
      steps.push({
        stepNo: row[2],
        what: row[3],
        who: row[4],
        how: row[5],
        when: row[6],
        whenUnit: row[7] || 'days',
        whenDays: row[8] || 0,
        whenHours: row[9] || 0
      });
    }
  }

  steps.sort((a, b) => a.stepNo - b.stepNo);

  return {
    success: true,
    steps: steps,
    fmsName: steps.length > 0 ? data.find(row => row[0] === fmsId)[1] : ''
  };
}

function createProject(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const progressSheet = ss.getSheetByName('FMS_PROGRESS');
  const masterSheet = ss.getSheetByName('FMS_MASTER');

  const projectId = 'PRJ' + Date.now();
  const fmsId = params.fmsId;
  const projectName = params.projectName;
  const projectStartDate = new Date(params.projectStartDate);
  const username = params.username;
  const timestamp = new Date().toISOString();

  const masterData = masterSheet.getDataRange().getValues();
  const steps = [];

  for (let i = 1; i < masterData.length; i++) {
    const row = masterData[i];
    if (row[0] === fmsId) {
      steps.push({
        stepNo: row[2],
        what: row[3],
        who: row[4],
        how: row[5],
        when: row[6],
        whenUnit: row[7] || 'days',
        whenDays: row[8] || 0,
        whenHours: row[9] || 0
      });
    }
  }

  steps.sort((a, b) => a.stepNo - b.stepNo);

  let currentDate = new Date(projectStartDate);
  const whenDays = steps[0].whenDays || Math.floor(steps[0].when);
  const whenHours = steps[0].whenHours || Math.round((steps[0].when % 1) * 24);

  currentDate.setDate(currentDate.getDate() + parseInt(whenDays));
  currentDate.setHours(currentDate.getHours() + parseInt(whenHours));

  progressSheet.appendRow([
    projectId,
    fmsId,
    projectName,
    steps[0].stepNo,
    steps[0].what,
    steps[0].who,
    steps[0].how,
    currentDate.toISOString(),
    '',
    'Pending',
    '',
    'true',
    username,
    timestamp,
    username,
    timestamp
  ]);

  return {
    success: true,
    projectId: projectId,
    message: 'Project created successfully'
  };
}

function getAllProjects() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const progressSheet = ss.getSheetByName('FMS_PROGRESS');
  const data = progressSheet.getDataRange().getValues();

  if (data.length <= 1) {
    return { success: true, projects: [] };
  }

  const projectMap = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const projectId = row[0];
    const projectName = row[2];

    if (!projectMap[projectId]) {
      projectMap[projectId] = {
        projectId: projectId,
        fmsId: row[1],
        projectName: projectName,
        tasks: []
      };
    }

    projectMap[projectId].tasks.push({
      stepNo: row[3],
      what: row[4],
      who: row[5],
      how: row[6],
      plannedDueDate: row[7],
      actualCompletedOn: row[8],
      status: row[9],
      completedBy: row[10] || '',
      isFirstStep: row[11] === 'true' || row[11] === true
    });
  }

  return {
    success: true,
    projects: Object.values(projectMap)
  };
}

function getProjectsByUser(username) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const progressSheet = ss.getSheetByName('FMS_PROGRESS');
  const data = progressSheet.getDataRange().getValues();

  if (data.length <= 1) {
    return { success: true, tasks: [] };
  }

  const tasks = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[5] === username) {
      tasks.push({
        rowIndex: i + 1,
        projectId: row[0],
        projectName: row[2],
        stepNo: row[3],
        what: row[4],
        who: row[5],
        how: row[6],
        plannedDueDate: row[7],
        actualCompletedOn: row[8],
        status: row[9],
        completedBy: row[10] || '',
        isFirstStep: row[11] === 'true' || row[11] === true
      });
    }
  }

  return {
    success: true,
    tasks: tasks
  };
}

function updateTaskStatus(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const progressSheet = ss.getSheetByName('FMS_PROGRESS');
  const masterSheet = ss.getSheetByName('FMS_MASTER');

  const rowIndex = params.rowIndex;
  const status = params.status;
  const username = params.username;
  const timestamp = new Date().toISOString();

  progressSheet.getRange(rowIndex, 9).setValue(status === 'Done' ? timestamp : '');
  progressSheet.getRange(rowIndex, 10).setValue(status);
  progressSheet.getRange(rowIndex, 11).setValue(status === 'Done' ? username : '');
  progressSheet.getRange(rowIndex, 15).setValue(username);
  progressSheet.getRange(rowIndex, 16).setValue(timestamp);

  if (status === 'Done') {
    const currentRow = progressSheet.getRange(rowIndex, 1, 1, 16).getValues()[0];
    const projectId = currentRow[0];
    const fmsId = currentRow[1];
    const projectName = currentRow[2];
    const currentStepNo = currentRow[3];

    const masterData = masterSheet.getDataRange().getValues();
    const allSteps = [];

    for (let i = 1; i < masterData.length; i++) {
      const row = masterData[i];
      if (row[0] === fmsId) {
        allSteps.push({
          stepNo: row[2],
          what: row[3],
          who: row[4],
          how: row[5],
          when: row[6],
          whenDays: row[8] || Math.floor(row[6]),
          whenHours: row[9] || Math.round((row[6] % 1) * 24)
        });
      }
    }

    allSteps.sort((a, b) => a.stepNo - b.stepNo);

    const nextStep = allSteps.find(s => s.stepNo === currentStepNo + 1);

    if (nextStep) {
      const completionDate = new Date(timestamp);
      completionDate.setDate(completionDate.getDate() + parseInt(nextStep.whenDays));
      completionDate.setHours(completionDate.getHours() + parseInt(nextStep.whenHours));

      progressSheet.appendRow([
        projectId,
        fmsId,
        projectName,
        nextStep.stepNo,
        nextStep.what,
        nextStep.who,
        nextStep.how,
        completionDate.toISOString(),
        '',
        'Pending',
        '',
        'false',
        username,
        timestamp,
        username,
        timestamp
      ]);
    }
  }

  return {
    success: true,
    message: 'Task updated successfully'
  };
}

function getAllLogs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName('FMS_MASTER');
  const progressSheet = ss.getSheetByName('FMS_PROGRESS');

  const logs = [];

  const masterData = masterSheet.getDataRange().getValues();
  const fmsCreations = {};

  for (let i = 1; i < masterData.length; i++) {
    const row = masterData[i];
    const fmsId = row[0];
    if (!fmsCreations[fmsId]) {
      fmsCreations[fmsId] = {
        type: 'FMS_CREATED',
        fmsId: fmsId,
        fmsName: row[1],
        createdBy: row[10],
        createdOn: row[11]
      };
    }
  }

  logs.push(...Object.values(fmsCreations));

  const progressData = progressSheet.getDataRange().getValues();
  const projectCreations = {};

  for (let i = 1; i < progressData.length; i++) {
    const row = progressData[i];
    const projectId = row[0];
    if (!projectCreations[projectId]) {
      projectCreations[projectId] = {
        type: 'PROJECT_CREATED',
        projectId: projectId,
        projectName: row[2],
        createdBy: row[12],
        createdOn: row[13]
      };
    }

    if (row[14] !== row[12]) {
      logs.push({
        type: 'TASK_UPDATED',
        projectId: projectId,
        projectName: row[2],
        stepNo: row[3],
        what: row[4],
        status: row[9],
        updatedBy: row[14],
        updatedOn: row[15]
      });
    }
  }

  logs.push(...Object.values(projectCreations));

  logs.sort((a, b) => {
    const dateA = new Date(a.createdOn || a.updatedOn);
    const dateB = new Date(b.createdOn || b.updatedOn);
    return dateB - dateA;
  });

  return {
    success: true,
    logs: logs
  };
}
```

## Step 4: Deploy as Web App

1. Click the **Deploy** button (top right) > **New deployment**
2. Click the gear icon next to "Select type" > Choose **Web app**
3. Fill in the details:
   - Description: "FMS System API - Enhanced Version"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. **Copy the Web App URL** - you'll need this for the frontend
6. Click **Done**

## Step 5: Configure Frontend

1. Open your project's `.env` file
2. Add or update the following line with your Web App URL:
   ```
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```
3. Replace `YOUR_DEPLOYMENT_ID` with the actual deployment ID from your Web App URL

## New Features in This Version

### Enhanced Time Tracking
- Support for Days, Hours, and Days+Hours duration units
- No minimum time restriction (can be 0)
- More granular scheduling

### Improved Task Management
- First-level task indicators
- Completion tracking (who completed what)
- On-time/Late status tracking
- Overdue indicators

### Better Project Visibility
- User-filtered project views
- Card-based project displays
- Progress bars showing completion percentage
- Expandable project details

## Default Login Credentials

Add test users to your Users sheet:
- Username: `admin`
- Password: `fms2024`
- Name: `Administrator`
- Role: `Admin`
- Department: `Management`

## Testing the API

Visit your Web App URL in a browser. You should see:
```json
{
  "status": "success",
  "message": "FMS API is running"
}
```

## Troubleshooting

### Configuration Error
If you see "API URL not configured" on login:
1. Check your `.env` file has the correct `VITE_APPS_SCRIPT_URL`
2. Restart your dev server after updating `.env`

### Login Issues
1. Verify Users sheet has the correct column headers
2. Check that username and password match exactly
3. Ensure the Google Apps Script is deployed and accessible

### Task Updates Not Working
1. Verify FMS_PROGRESS sheet has all required columns
2. Check that the Google Apps Script has the latest code
3. Ensure project was created after updating to the enhanced version

## Support

For issues or questions, check:
1. Browser console for error messages
2. Google Apps Script execution logs (View > Logs)
3. Sheet data for consistency
