# Google Apps Script Backend Setup

## Step 1: Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "FMS System Database"

## Step 2: Create Two Sheets

### Sheet 1: FMS_MASTER
Create a sheet named `FMS_MASTER` with these columns (Row 1):
- FMS_ID
- FMS_Name
- Step_No
- WHAT
- WHO
- HOW
- WHEN
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
- Created_By
- Created_On
- Last_Updated_By
- Last_Updated_On

## Step 3: Add Apps Script Code

1. In your Google Sheet, click **Extensions** > **Apps Script**
2. Delete any existing code
3. Copy and paste the following code:

```javascript
// ============================================
// FMS Google Apps Script Web App Backend
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
  const username = params.username;
  const password = params.password;

  // Simple authentication - same credentials for everyone
  if (password === 'fms2024') {
    return {
      success: true,
      user: {
        username: username,
        loginTime: new Date().toISOString()
      }
    };
  }

  return { success: false, message: 'Invalid credentials' };
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
        createdBy: row[7],
        createdOn: row[8]
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
        when: row[6]
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

  // Get all steps from FMS_MASTER
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
        when: row[6]
      });
    }
  }

  steps.sort((a, b) => a.stepNo - b.stepNo);

  // Calculate due date for first step only
  let currentDate = new Date(projectStartDate);
  currentDate.setDate(currentDate.getDate() + parseInt(steps[0].when));

  // Create first step in FMS_PROGRESS
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
      status: row[9]
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
        status: row[9]
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

  // Update current task
  progressSheet.getRange(rowIndex, 9).setValue(status === 'Done' ? timestamp : '');
  progressSheet.getRange(rowIndex, 10).setValue(status);
  progressSheet.getRange(rowIndex, 13).setValue(username);
  progressSheet.getRange(rowIndex, 14).setValue(timestamp);

  // If status is 'Done', create next step
  if (status === 'Done') {
    const currentRow = progressSheet.getRange(rowIndex, 1, 1, 14).getValues()[0];
    const projectId = currentRow[0];
    const fmsId = currentRow[1];
    const projectName = currentRow[2];
    const currentStepNo = currentRow[3];

    // Get all steps from FMS_MASTER for this FMS
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
          when: row[6]
        });
      }
    }

    allSteps.sort((a, b) => a.stepNo - b.stepNo);

    // Find next step
    const nextStep = allSteps.find(s => s.stepNo === currentStepNo + 1);

    if (nextStep) {
      // Calculate due date based on current completion date
      const completionDate = new Date(timestamp);
      completionDate.setDate(completionDate.getDate() + parseInt(nextStep.when));

      // Create next step
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

  // Get FMS creation logs
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
        createdBy: row[7],
        createdOn: row[8]
      };
    }
  }

  logs.push(...Object.values(fmsCreations));

  // Get project creation logs
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
        createdBy: row[10],
        createdOn: row[11]
      };
    }

    // Task updates
    if (row[12] !== row[10]) {
      logs.push({
        type: 'TASK_UPDATED',
        projectId: projectId,
        projectName: row[2],
        stepNo: row[3],
        what: row[4],
        status: row[9],
        updatedBy: row[12],
        updatedOn: row[13]
      });
    }
  }

  logs.push(...Object.values(projectCreations));

  // Sort by date
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
   - Description: "FMS System API"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. **Copy the Web App URL** - you'll need this for the frontend
6. Click **Done**

## Step 5: Configure Frontend

1. Open your project's `.env` file
2. Add the following line with your Web App URL:
   ```
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```
3. Replace `YOUR_DEPLOYMENT_ID` with the actual deployment ID from your Web App URL

## Default Login Credentials

- Password: `fms2024` (works with any username)
- The system tracks who creates/edits based on the username entered

## Testing the API

You can test if the API is working by visiting your Web App URL in a browser. You should see:
```json
{
  "status": "success",
  "message": "FMS API is running"
}
```
