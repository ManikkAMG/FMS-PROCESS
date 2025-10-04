import { FMSStep, FMSTemplate, FMSDetail, Project, ProjectTask, Log, User } from '../types';

const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

async function callAPI(action: string, params: Record<string, unknown> = {}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      ...params,
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}

export const api = {
  login: async (username: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    return callAPI('login', { username, password });
  },

  createFMS: async (fmsName: string, steps: FMSStep[], username: string): Promise<{ success: boolean; fmsId?: string; message?: string }> => {
    return callAPI('createFMS', { fmsName, steps, username });
  },

  getAllFMS: async (): Promise<{ success: boolean; fmsList: FMSTemplate[] }> => {
    return callAPI('getAllFMS');
  },

  getFMSById: async (fmsId: string): Promise<{ success: boolean; steps: FMSStep[]; fmsName: string }> => {
    return callAPI('getFMSById', { fmsId });
  },

  createProject: async (fmsId: string, projectName: string, projectStartDate: string, username: string): Promise<{ success: boolean; projectId?: string; message?: string }> => {
    return callAPI('createProject', { fmsId, projectName, projectStartDate, username });
  },

  getAllProjects: async (): Promise<{ success: boolean; projects: Project[] }> => {
    return callAPI('getAllProjects');
  },

  getProjectsByUser: async (username: string): Promise<{ success: boolean; tasks: ProjectTask[] }> => {
    return callAPI('getProjectsByUser', { username });
  },

  updateTaskStatus: async (rowIndex: number, status: string, username: string): Promise<{ success: boolean; message?: string }> => {
    return callAPI('updateTaskStatus', { rowIndex, status, username });
  },

  getAllLogs: async (): Promise<{ success: boolean; logs: Log[] }> => {
    return callAPI('getAllLogs');
  },
};
