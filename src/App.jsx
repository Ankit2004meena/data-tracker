import React, { useState, useEffect, createContext, useContext } from 'react';
import { Plus, Trash2, Edit2, Eye, ChevronDown, ChevronRight, Upload, X, FileText, Home, Settings, Download, Loader, Save } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const api = {
  async getSOPs() {
    const response = await fetch(`${API_BASE_URL}/sops`);
    if (!response.ok) throw new Error('Failed to fetch SOPs');
    return response.json();
  },
  async createSOP(data) {
    const response = await fetch(`${API_BASE_URL}/sops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create SOP');
    }
    return response.json();
  },
  async updateSOP(id, data) {
    const response = await fetch(`${API_BASE_URL}/sops/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update SOP');
    return response.json();
  },
  async deleteSOP(id) {
    const response = await fetch(`${API_BASE_URL}/sops/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete SOP');
    return response.json();
  },
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload file');
    return response.json();
  },
  async importData(data) {
    const response = await fetch(`${API_BASE_URL}/sops/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to import data');
    return response.json();
  },
  async seedData() {
    const response = await fetch(`${API_BASE_URL}/seed`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to seed data');
    return response.json();
  }
};

const DataContext = createContext();
const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

const DataProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const sops = await api.getSOPs();
      setData(sops);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addSOP = async (sop) => {
    try {
      await api.createSOP(sop);
      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateSOP = async (sopId, updates) => {
    try {
      await api.updateSOP(sopId, updates);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteSOP = async (sopId) => {
    try {
      await api.deleteSOP(sopId);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const uploadFile = async (file) => {
    try {
      return await api.uploadFile(file);
    } catch (err) {
      return null;
    }
  };

  const importData = async (newData) => {
    try {
      await api.importData(newData);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const seedDatabase = async () => {
    try {
      await api.seedData();
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DataContext.Provider value={{ data, loading, error, fetchData, addSOP, updateSOP, deleteSOP, uploadFile, importData, seedDatabase }}>
      {children}
    </DataContext.Provider>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const Router = ({ children }) => {
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path) => { window.location.hash = path; };
  return children({ route, navigate });
};

const AttachmentUploader = ({ onUpload }) => {
  const { uploadFile } = useData();
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const result = await uploadFile(file);
      if (result) onUpload(result);
    }
  };
  return (
    <label className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded cursor-pointer hover:bg-indigo-100">
      <Upload className="w-4 h-4" />
      Attach
      <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx,.txt" />
    </label>
  );
};

const AttachmentDisplay = ({ attachments, onRemove, readonly = false }) => {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((att, idx) => (
        <div key={idx} className="relative group">
          {att.type === 'image' ? (
            <div className="relative">
              <img src={`http://localhost:5000${att.url}`} alt={att.filename} className="w-24 h-24 object-cover rounded border" />
              {!readonly && (
                <button onClick={() => onRemove(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded border">
              <FileText className="w-4 h-4 text-gray-600" />
              <a href={`http://localhost:5000${att.url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                {att.filename}
              </a>
              {!readonly && (
                <button onClick={() => onRemove(idx)} className="text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const HomePage = ({ navigate }) => {
  const { data, loading, seedDatabase, deleteSOP } = useData();
  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">SOP Builder</h1>
          <p className="text-xl text-gray-600">Create and Manage Standard Operating Procedures</p>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No SOPs Yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first SOP</p>
            <div className="flex gap-4 justify-center">
              <button onClick={seedDatabase} className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
                Seed Sample Data
              </button>
              <button onClick={() => navigate('/admin')} className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
                Create New SOP
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map(sop => (
              <div key={sop.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{sop.name}</h2>
                    <FileText className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">{sop.steps?.length || 0}</span> steps
                    </div>
                    {sop.steps?.slice(0, 3).map(step => (
                      <div key={step.id} className="flex items-center text-sm text-gray-600">
                        <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{step.stepHead.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/sop/${sop.id}`)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg">
                      <Eye className="w-4 h-4 inline mr-2" />View
                    </button>
                    <button onClick={() => navigate(`/edit/${sop.id}`)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg">
                      <Edit2 className="w-4 h-4 inline mr-2" />Edit
                    </button>
                    <button onClick={() => { if (window.confirm(`Delete SOP "${sop.name}"?`)) deleteSOP(sop.id); }} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SOPViewPage = ({ sopId, navigate }) => {
  const { data, loading } = useData();
  const [expandedSteps, setExpandedSteps] = useState({});
  const [expandedSubHeads, setExpandedSubHeads] = useState({});
  const sop = data.find(s => s.id === sopId);

  useEffect(() => {
    if (sop) {
      const stepsExpanded = {};
      const subHeadsExpanded = {};
      sop.steps?.forEach(step => {
        stepsExpanded[step.id] = true;
        step.subHeads?.forEach(subHead => {
          subHeadsExpanded[`${step.id}-${subHead.id}`] = true;
        });
      });
      setExpandedSteps(stepsExpanded);
      setExpandedSubHeads(subHeadsExpanded);
    }
  }, [sop]);

  if (loading) return <LoadingSpinner />;
  if (!sop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">SOP not found</h2>
          <button onClick={() => navigate('/')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <Home className="w-5 h-5 mr-2" />Back to Home
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-900">{sop.name}</h1>
            <button onClick={() => navigate(`/edit/${sop.id}`)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              <Edit2 className="w-4 h-4" />Edit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {sop.steps?.map(step => (
            <div key={step.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button onClick={() => setExpandedSteps(p => ({ ...p, [step.id]: !p[step.id] }))} className="w-full px-6 py-4 flex items-center justify-between bg-indigo-600 text-white hover:bg-indigo-700">
                <span className="text-xl font-semibold">{step.stepHead.text}</span>
                {expandedSteps[step.id] ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
              </button>
              {expandedSteps[step.id] && (
                <div className="p-6">
                  {step.stepHead.subtext && <p className="text-gray-600 mb-3">{step.stepHead.subtext}</p>}
                  {step.stepHead.link && (
                    <a href={step.stepHead.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm mb-3 inline-block">
                      🔗 {step.stepHead.link}
                    </a>
                  )}
                  <AttachmentDisplay attachments={step.stepHead.attachments} readonly={true} />
                  <div className="space-y-4 mt-4">
                    {step.subHeads?.map(subHead => (
                      <div key={subHead.id} className="border-l-4 border-indigo-300 pl-4">
                        <button onClick={() => setExpandedSubHeads(p => ({ ...p, [`${step.id}-${subHead.id}`]: !p[`${step.id}-${subHead.id}`] }))} className="w-full flex items-center justify-between text-left mb-2">
                          <span className="text-lg font-medium text-gray-800">{subHead.subHeadName.text}</span>
                          {expandedSubHeads[`${step.id}-${subHead.id}`] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                        {subHead.subHeadName.subtext && <p className="text-gray-600 text-sm mb-2">{subHead.subHeadName.subtext}</p>}
                        {subHead.subHeadName.link && (
                          <a href={subHead.subHeadName.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm mb-2 inline-block">
                            🔗 {subHead.subHeadName.link}
                          </a>
                        )}
                        <AttachmentDisplay attachments={subHead.subHeadName.attachments} readonly={true} />
                        {expandedSubHeads[`${step.id}-${subHead.id}`] && (
                          <ul className="space-y-3 mt-3 ml-4">
                            {subHead.questions?.map(question => (
                              <li key={question.id} className="text-gray-700">
                                <div className="flex items-start gap-2">
                                  <span className="text-indigo-600 mt-1">•</span>
                                  <div className="flex-1">
                                    <span className="font-medium">{question.text}</span>
                                    {question.subtext && <p className="text-gray-600 text-sm mt-1">{question.subtext}</p>}
                                    {question.link && (
                                      <a href={question.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm mt-1 inline-block">
                                        🔗 {question.link}
                                      </a>
                                    )}
                                    <AttachmentDisplay attachments={question.attachments} readonly={true} />
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SOPEditPage = ({ sopId, navigate }) => {
  const { data, updateSOP, loading } = useData();
  const [currentSOP, setCurrentSOP] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const sop = data.find(s => s.id === sopId);
    if (sop) setCurrentSOP(JSON.parse(JSON.stringify(sop)));
  }, [data, sopId]);

  if (loading || !currentSOP) return <LoadingSpinner />;

  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const saveSOP = async () => {
    await updateSOP(currentSOP.id, currentSOP);
    showNotification('SOP saved successfully!');
    navigate(`/sop/${currentSOP.id}`);
  };

  const addStep = () => {
    setCurrentSOP({ ...currentSOP, steps: [...(currentSOP.steps || []), { id: `step-${Date.now()}`, stepHead: { text: 'New Step', subtext: '', link: '', attachments: [] }, subHeads: [] }] });
  };

  const updateStepText = (si, text) => {
    const ns = [...currentSOP.steps];
    ns[si].stepHead.text = text;
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const updateStepSubtext = (si, subtext) => {
    const ns = [...currentSOP.steps];
    ns[si].stepHead.subtext = subtext;
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const updateStepLink = (si, link) => {
    const ns = [...currentSOP.steps];
    ns[si].stepHead.link = link;
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const addStepAttachment = (si, att) => {
    const ns = [...currentSOP.steps];
    ns[si].stepHead.attachments.push(att);
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const removeStepAttachment = (si, ai) => {
    const ns = [...currentSOP.steps];
    ns[si].stepHead.attachments.splice(ai, 1);
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const deleteStep = (si) => {
    setCurrentSOP({ ...currentSOP, steps: currentSOP.steps.filter((_, i) => i !== si) });
  };

  const addSubHead = (si) => {
    const ns = [...currentSOP.steps];
    ns[si].subHeads.push({ id: `sub-${Date.now()}`, subHeadName: { text: 'New Sub Head', subtext: '', link: '', attachments: [] }, questions: [] });
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const updateSubHeadText = (si, shi, text) => {
    const ns = [...currentSOP.steps];
    ns[si].subHeads[shi].subHeadName.text = text;
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const updateSubHeadSubtext = (si, shi, subtext) => {
    const ns = [...currentSOP.steps];
    ns[si].subHeads[shi].subHeadName.subtext = subtext;
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const updateSubHeadLink = (si, shi, link) => {
    const ns = [...currentSOP.steps];
    ns[si].subHeads[shi].subHeadName.link = link;
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const addSubHeadAttachment = (si, shi, att) => {
    const ns = [...currentSOP.steps];
    ns[si].subHeads[shi].subHeadName.attachments.push(att);
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const removeSubHeadAttachment = (si, shi, ai) => {
    const ns = [...currentSOP.steps];
    ns[si].subHeads[shi].subHeadName.attachments.splice(ai, 1);
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const deleteSubHead = (si, shi) => {
    const ns = [...currentSOP.steps];
    ns[si].subHeads = ns[si].subHeads.filter((_, i) => i !== shi);
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const addQuestion = (si, shi) => {
    const ns = [...currentSOP.steps];
    ns[si].subHeads[shi].questions.push({ id: `q-${Date.now()}`, text: 'New Question', subtext: '', link: '', attachments: [] });
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const updateQuestionText = (si, shi, qi, text) => {
    const ns = [...currentSOP.steps];
    ns[si].subHeads[shi].questions[qi].text = text;
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const updateQuestionSubtext = (si, shi, qi, subtext) => {
    const ns = [...currentSOP.steps];
    ns[si].subHeads[shi].questions[qi].subtext = subtext;
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const updateQuestionLink = (si, shi, qi, link) => {
    const ns = [...currentSOP.steps];
    ns[si].subHeads[shi].questions[qi].link = link;
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const addQuestionAttachment = (si, shi, qi, att) => {
    const ns = [...currentSOP.steps];
    ns[si].subHeads[shi].questions[qi].attachments.push(att);
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const removeQuestionAttachment = (si, shi, qi, ai) => {
    const ns = [...currentSOP.steps];
    ns[si].subHeads[shi].questions[qi].attachments.splice(ai, 1);
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  const deleteQuestion = (si, shi, qi) => {
    const ns = [...currentSOP.steps];
    ns[si].subHeads[shi].questions = ns[si].subHeads[shi].questions.filter((_, i) => i !== qi);
    setCurrentSOP({ ...currentSOP, steps: ns });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white font-medium`}>
          {notification.message}
        </div>
      )}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <input type="text" value={currentSOP.name} onChange={(e) => setCurrentSOP({ ...currentSOP, name: e.target.value })} className="text-3xl font-bold border-b-2 border-transparent focus:border-indigo-500 outline-none" />
            <div className="flex gap-2">
              <button onClick={() => navigate('/')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={saveSOP} className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                <Save className="w-4 h-4" />Save
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {currentSOP.steps?.map((step, si) => (
            <div key={step.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <input type="text" value={step.stepHead.text} onChange={(e) => updateStepText(si, e.target.value)} placeholder="Step title" className="text-xl font-semibold w-full border-b border-gray-300 focus:border-indigo-500 outline-none pb-2 mb-2" />
                  <textarea value={step.stepHead.subtext || ''} onChange={(e) => updateStepSubtext(si, e.target.value)} placeholder="Step description (optional)" className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-2" rows="2" />
                  <input type="url" value={step.stepHead.link || ''} onChange={(e) => updateStepLink(si, e.target.value)} placeholder="Link (optional)" className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-2" />
                  <div className="mt-2"><AttachmentUploader onUpload={(att) => addStepAttachment(si, att)} /></div>
                  <AttachmentDisplay attachments={step.stepHead.attachments} onRemove={(ai) => removeStepAttachment(si, ai)} />
                </div>
                <button onClick={() => deleteStep(si)} className="text-red-500 hover:text-red-700 ml-4"><Trash2 className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 ml-6">
                {step.subHeads?.map((subHead, shi) => (
                  <div key={subHead.id} className="bg-gray-50 rounded p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <input type="text" value={subHead.subHeadName.text} onChange={(e) => updateSubHeadText(si, shi, e.target.value)} placeholder="Sub head title" className="text-lg font-medium w-full border-b border-gray-300 focus:border-indigo-500 outline-none pb-1 bg-transparent mb-2" />
                        <textarea value={subHead.subHeadName.subtext || ''} onChange={(e) => updateSubHeadSubtext(si, shi, e.target.value)} placeholder="Sub head description (optional)" className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white mb-2" rows="2" />
                        <input type="url" value={subHead.subHeadName.link || ''} onChange={(e) => updateSubHeadLink(si, shi, e.target.value)} placeholder="Link (optional)" className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white mb-2" />
                        <div className="mt-2"><AttachmentUploader onUpload={(att) => addSubHeadAttachment(si, shi, att)} /></div>
                        <AttachmentDisplay attachments={subHead.subHeadName.attachments} onRemove={(ai) => removeSubHeadAttachment(si, shi, ai)} />
                      </div>
                      <button onClick={() => deleteSubHead(si, shi)} className="text-red-500 hover:text-red-700 ml-4"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-2 ml-4">
                      {subHead.questions?.map((question, qi) => (
                        <div key={question.id} className="flex items-start gap-2">
                          <div className="flex-1">
                            <input type="text" value={question.text} onChange={(e) => updateQuestionText(si, shi, qi, e.target.value)} placeholder="Question text" className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none mb-2" />
                            <textarea value={question.subtext || ''} onChange={(e) => updateQuestionSubtext(si, shi, qi, e.target.value)} placeholder="Additional details (optional)" className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-2" rows="2" />
                            <input type="url" value={question.link || ''} onChange={(e) => updateQuestionLink(si, shi, qi, e.target.value)} placeholder="Link (optional)" className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-2" />
                            <div className="mt-2"><AttachmentUploader onUpload={(att) => addQuestionAttachment(si, shi, qi, att)} /></div>
                            <AttachmentDisplay attachments={question.attachments} onRemove={(ai) => removeQuestionAttachment(si, shi, qi, ai)} />
                          </div>
                          <button onClick={() => deleteQuestion(si, shi, qi)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button onClick={() => addQuestion(si, shi)} className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1">
                        <Plus className="w-4 h-4" />Add Question
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={() => addSubHead(si)} className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  <Plus className="w-4 h-4" />Add Sub Head
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addStep} className="mt-6 w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-500 flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />Add Step
        </button>
      </div>
    </div>
  );
};

const AdminPage = ({ navigate }) => {
  const { data, addSOP, deleteSOP, importData } = useData();
  const [sopName, setSOPName] = useState('');
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddSOP = async () => {
    if (!sopName.trim()) {
      showNotification('SOP name is required', 'error');
      return;
    }
    const result = await addSOP({ id: `sop-${Date.now()}`, name: sopName, steps: [] });
    if (result.success) {
      setSOPName('');
      showNotification('SOP created successfully!');
    } else {
      showNotification(result.error, 'error');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sop-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully!');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (window.confirm('This will replace all current data. Continue?')) {
          await importData(imported);
          showNotification('Data imported successfully!');
        }
      } catch (error) {
        showNotification('Error importing file. Please check the format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white font-medium`}>
          {notification.message}
        </div>
      )}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <Home className="w-5 h-5 mr-2" />Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Admin Panel</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Create New SOP</h2>
          <div className="flex gap-2">
            <input type="text" placeholder="SOP name" value={sopName} onChange={(e) => setSOPName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddSOP()} className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={handleAddSOP} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
              <Plus className="w-5 h-5" />Add SOP
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Manage SOPs</h2>
          <div className="space-y-2">
            {data.map(sop => (
              <div key={sop.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{sop.name}</div>
                  <div className="text-sm text-gray-500">{sop.steps?.length || 0} steps</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/edit/${sop.id}`)} className="text-indigo-600 hover:text-indigo-700 px-3 py-1 rounded hover:bg-indigo-50">Edit</button>
                  <button onClick={async () => { if (window.confirm(`Delete SOP "${sop.name}"?`)) { await deleteSOP(sop.id); showNotification('SOP deleted successfully!'); }}} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">Import/Export Data</h2>
          <div className="space-y-4">
            <div>
              <button onClick={handleExport} className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />Export Data as JSON
              </button>
              <p className="text-sm text-gray-500 mt-2">Download all your data as a JSON file for backup</p>
            </div>
            <div>
              <label className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-5 h-5" />Import Data from JSON
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
              <p className="text-sm text-gray-500 mt-2">Upload a JSON file to replace current data</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800"><strong>Warning:</strong> Importing will replace all current data. Make sure to export first!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ navigate, currentRoute }) => {
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xl font-bold text-indigo-600">
            <FileText className="w-6 h-6" />SOP Builder
          </button>
          <div className="flex gap-4">
            <button onClick={() => navigate('/')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentRoute === '/' || currentRoute.startsWith('/sop') || currentRoute.startsWith('/edit') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Home className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/admin')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentRoute === '/admin' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default function App() {
  return (
    <DataProvider>
      <Router>
        {({ route, navigate }) => {
          const routeParts = route.split('/');
          return (
            <div className="min-h-screen bg-gray-50">
              <Navbar navigate={navigate} currentRoute={route} />
              {route === '/' && <HomePage navigate={navigate} />}
              {route.startsWith('/sop/') && <SOPViewPage sopId={routeParts[2]} navigate={navigate} />}
              {route.startsWith('/edit/') && <SOPEditPage sopId={routeParts[2]} navigate={navigate} />}
              {route === '/admin' && <AdminPage navigate={navigate} />}
            </div>
          );
        }}
      </Router>
    </DataProvider>
  );
}