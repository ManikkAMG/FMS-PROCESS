import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, GitBranch } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FMSStep } from '../types';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'default' });

export default function CreateFMS() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fmsName, setFmsName] = useState('');
  const [steps, setSteps] = useState<FMSStep[]>([
    { stepNo: 1, what: '', who: '', how: '', when: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDiagram, setShowDiagram] = useState(false);
  const [diagramSvg, setDiagramSvg] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    if (showDiagram && steps.every(s => s.what)) {
      generateDiagram();
    }
    
    // Load departments for WHO dropdown
    loadDepartments();
  }, [showDiagram, steps]);
  
  const loadDepartments = async () => {
    try {
      const response = await api.getAllDepartments();
      if (response.success) {
        setDepartments(response.departments);
      }
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  const generateDiagram = async () => {
    const mermaidCode = `
graph LR
    Start([Start])
    ${steps.map((step, idx) => `
    Step${idx + 1}["Step ${step.stepNo}<br/>WHAT: ${step.what}<br/>WHO: ${step.who}<br/>HOW: ${step.how}<br/>WHEN: ${step.when} days"]
    `).join('\n')}
    End([End])

    Start --> Step1
    ${steps.map((_, idx) =>
      idx < steps.length - 1 ? `Step${idx + 1} --> Step${idx + 2}` : `Step${idx + 1} --> End`
    ).join('\n')}

    style Start fill:#10b981,stroke:#059669,color:#fff
    style End fill:#ef4444,stroke:#dc2626,color:#fff
    ${steps.map((_, idx) => `style Step${idx + 1} fill:#3b82f6,stroke:#2563eb,color:#fff`).join('\n')}
    `;

    try {
      const { svg } = await mermaid.render('fms-diagram', mermaidCode);
      setDiagramSvg(svg);
    } catch (err) {
      console.error('Mermaid rendering error:', err);
    }
  };

  const addStep = () => {
    setSteps([
      ...steps,
      { stepNo: steps.length + 1, what: '', who: '', how: '', when: 1 },
    ]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_, i) => i !== index);
      newSteps.forEach((step, idx) => {
        step.stepNo = idx + 1;
      });
      setSteps(newSteps);
    }
  };

  const updateStep = (index: number, field: keyof FMSStep, value: string | number) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fmsName.trim()) {
      setError('Please enter FMS name');
      return;
    }

    const hasEmptyFields = steps.some(
      step => !step.what.trim() || !step.who.trim() || !step.how.trim()
    );

    if (hasEmptyFields) {
      setError('Please fill in all step fields');
      return;
    }

    setLoading(true);

    try {
      const result = await api.createFMS(fmsName, steps, user!.username);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Failed to create FMS');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <GitBranch className="w-8 h-8" />
          Create FMS Template
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              FMS Name
            </label>
            <input
              type="text"
              value={fmsName}
              onChange={(e) => setFmsName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all outline-none"
              placeholder="Enter FMS template name"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Steps</h2>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>

            {steps.map((step, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-900">Step {step.stepNo}</h3>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      WHAT (Task Description)
                    </label>
                    <input
                      type="text"
                      value={step.what}
                      onChange={(e) => updateStep(index, 'what', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all outline-none"
                      placeholder="What needs to be done?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      WHO (Responsible Person)
                    </label>
                    <select
                      value={step.who}
                      onChange={(e) => updateStep(index, 'who', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all outline-none"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      HOW (Method/Process)
                    </label>
                    <input
                      type="text"
                      value={step.how}
                      onChange={(e) => updateStep(index, 'how', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all outline-none"
                      placeholder="How will it be done?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      WHEN (Duration in days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={step.when}
                      onChange={(e) => updateStep(index, 'when', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowDiagram(!showDiagram)}
              disabled={!steps.every(s => s.what)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GitBranch className="w-5 h-5" />
              {showDiagram ? 'Hide' : 'Show'} Flowchart
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save FMS Template'}
            </button>
          </div>
        </form>
      </div>

      {showDiagram && diagramSvg && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Flow Diagram</h2>
          <div
            className="flex justify-center overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: diagramSvg }}
          />
        </div>
      )}
    </div>
  );
}
