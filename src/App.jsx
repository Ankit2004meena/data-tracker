import React, { useState, useEffect, createContext, useContext } from 'react';
import { Plus, Trash2, Edit2, Eye, ChevronDown, ChevronRight, Upload, X, FileText, Home, Settings, Download, Loader, Save } from 'lucide-react';

// Replace these with your actual Cloudinary credentials
const CLOUDINARY_CLOUD_NAME = 'dvgjzeg0l'; // e.g. 'mycloudname'
const CLOUDINARY_UPLOAD_PRESET = 'sop_uploads';
const API_BASE_URL = 'https://data-tracker-backend.vercel.app/api'; // Adjust if your backend is hosted elsewhere

// Helper to check if Cloudinary is configured
const isCloudinaryConfigured = () => CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here';

const api = {
  async getSOPs() {
    const res = await fetch(`${API_BASE_URL}/sops`);
    if (!res.ok) throw new Error('Failed to fetch SOPs');
    return res.json();
  },
  async createSOP(data) {
    const res = await fetch(`${API_BASE_URL}/sops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create SOP');
    }
    return res.json();
  },
  async updateSOP(id, data) {
    const res = await fetch(`${API_BASE_URL}/sops/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update SOP');
    return res.json();
  },
  async deleteSOP(id) {
    const res = await fetch(`${API_BASE_URL}/sops/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete SOP');
    return res.json();
  },
  async uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // For non-images, use raw resource type
    const isImage = file.type.startsWith('image/');
    const endpoint = isImage 
      ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
      : `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`;
    
    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload');
    return res.json();
  },
  async importData(data) {
    const res = await fetch(`${API_BASE_URL}/sops/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to import');
    return res.json();
  },
  async seedData() {
    const res = await fetch(`${API_BASE_URL}/seed`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to seed');
    return res.json();
  }
};

const DataContext = createContext();
const useData = () => useContext(DataContext);

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
    const result = await api.uploadToCloudinary(file);
    const isImage = file.type.startsWith('image/');
    
    // Build proper Cloudinary URL with fl_attachment for downloads
    let downloadUrl = result.secure_url;
    if (!isImage && result.public_id) {
    downloadUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/fl_attachment:${result.original_filename}.pdf`;

    }
    
    return {
      url: result.secure_url,
      downloadUrl: downloadUrl,
      filename: file.name,
      type: isImage ? 'image' : 'file',
      publicId: result.public_id,
      mimeType: file.type
    };
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
    <Loader className="w-12 h-12 text-indigo-600 animate-spin" />
  </div>
);

const Router = ({ children }) => {
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/');
  useEffect(() => {
    const h = () => setRoute(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  const navigate = (path) => { window.location.hash = path; };
  return children({ route, navigate });
};

const AttachmentUploader = ({ onUpload }) => {
  const { uploadFile } = useData();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!isCloudinaryConfigured()) {
      alert('Cloudinary is not configured! Please add your cloud name and upload preset at the top of the code.');
      return;
    }
    
    setUploading(true);
    try {
      const result = await uploadFile(file);
      if (result) {
        onUpload(result);
      }
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <label className={`inline-flex items-center gap-2 px-3 py-1 text-sm rounded cursor-pointer ${uploading ? 'bg-gray-300' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
      {uploading ? <><Loader className="w-4 h-4 animate-spin" />Uploading</> : <><Upload className="w-4 h-4" />Attach</>}
      <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx,.txt" disabled={uploading} />
    </label>
  );
};

const AttachmentDisplay = ({ attachments, onRemove, readonly = false }) => {
  if (!attachments || attachments.length === 0) return null;
  
  const handleDownload = async (att) => {
    try {
      // Use downloadUrl if available (has fl_attachment flag), otherwise regular url
      const downloadLink = att.downloadUrl || att.url;
      const a = document.createElement('a');
      a.href = downloadLink;
      a.download = att.filename || 'download';
      a.setAttribute('target', '_blank');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      window.open(att.downloadUrl || att.url, '_blank');
    }
  };

  const handleView = (att) => {
    // Open in new tab - browser will handle PDF viewing
    window.open(att.url, '_blank', 'noopener,noreferrer');
  };

  const getFileIcon = (att) => {
    const name = att.filename?.toLowerCase() || '';
    const mime = att.mimeType?.toLowerCase() || '';
    
    // Check mime type first, then extension
    if (mime.includes('pdf') || name.endsWith('.pdf')) return '📄';
    if (mime.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return '📝';
    if (mime.includes('sheet') || mime.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')) return '📊';
    if (mime.includes('text') || name.endsWith('.txt')) return '📃';
    if (mime.includes('zip') || mime.includes('rar') || name.endsWith('.zip') || name.endsWith('.rar')) return '🗜️';
    return '📎';
  };

  const isActuallyImage = (att) => {
    // Check mime type first
    if (att.mimeType && att.mimeType.startsWith('image/')) return true;
    // Then check type property
    if (att.type === 'image') {
      const name = att.filename?.toLowerCase() || '';
      // Make sure it's not a PDF or document pretending to be an image
      if (name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx')) return false;
      return true;
    }
    return false;
  };
  
  return (
    <div className="flex flex-wrap gap-3 mt-3">
      {attachments.map((att, idx) => (
        <div key={idx} className="relative group">
          {isActuallyImage(att) ? (
            <div className="relative">
              <img 
                src={att.url} 
                alt={att.filename} 
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-indigo-400 transition-all shadow-sm hover:shadow-md" 
                onClick={() => window.open(att.url, '_blank')}
                title="Click to view full size"
              />
              {!readonly && (
                <button 
                  onClick={() => onRemove(idx)} 
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  title="Remove attachment"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 transition-all shadow-sm hover:shadow-md min-w-[200px]">
              <span className="text-2xl">{getFileIcon(att)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate" title={att.filename}>
                  {att.filename}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => handleView(att)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                    title="Open in new tab"
                  >
                    View
                  </button>
                
                 
                </div>
              </div>
              {!readonly && (
                <button 
                  onClick={() => onRemove(idx)} 
                  className="text-red-500 hover:text-red-700 ml-2 p-1 hover:bg-red-50 rounded transition-colors"
                  title="Remove attachment"
                >
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
          <p className="text-xl text-gray-600">Standard Operating Procedures</p>
        </div>
        {data.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No SOPs Yet</h3>
            <div className="flex gap-4 justify-center mt-6">
              <button onClick={seedDatabase} className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">Seed Sample</button>
              <button onClick={() => navigate('/admin')} className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">Create New</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map(sop => (
              <div key={sop.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{sop.name}</h2>
                  <FileText className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="text-sm text-gray-600 mb-4">{sop.steps?.length || 0} steps</div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/sop/${sop.id}`)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg">View</button>
                  <button onClick={() => navigate(`/edit/${sop.id}`)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg">Edit</button>
                  <button onClick={() => { if (window.confirm('Delete?')) deleteSOP(sop.id); }} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
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
  const [expanded, setExpanded] = useState({});
  const sop = data.find(s => s.id === sopId);

  if (loading) return <LoadingSpinner />;
  if (!sop) return <div className="min-h-screen flex items-center justify-center"><button onClick={() => navigate('/')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg">Go Home</button></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <Home className="w-5 h-5 mr-2" />Back
          </button>
          <h1 className="text-4xl font-bold">{sop.name}</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        {sop.steps?.map(step => (
          <div key={step.id} className="bg-white rounded-lg shadow">
            <button onClick={() => setExpanded(p => ({ ...p, [step.id]: !p[step.id] }))} className="w-full px-6 py-4 flex items-center justify-between bg-indigo-600 text-white">
              <span className="text-xl font-semibold">{step.stepHead.text}</span>
              {expanded[step.id] ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </button>
            {expanded[step.id] && (
              <div className="p-6">
                {step.stepHead.subtext && <p className="text-gray-600 mb-3">{step.stepHead.subtext}</p>}
                {step.stepHead.link && <a href={step.stepHead.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm">🔗 {step.stepHead.link}</a>}
                <AttachmentDisplay attachments={step.stepHead.attachments} readonly />
                {step.subHeads?.map(sub => (
                  <div key={sub.id} className="mt-4 border-l-4 border-indigo-300 pl-4">
                    <h3 className="text-lg font-medium">{sub.subHeadName.text}</h3>
                    {sub.subHeadName.subtext && <p className="text-gray-600 text-sm">{sub.subHeadName.subtext}</p>}
                    <AttachmentDisplay attachments={sub.subHeadName.attachments} readonly />
                    <ul className="mt-2 space-y-2">
                      {sub.questions?.map(q => (
                        <li key={q.id} className="flex gap-2">
                          <span className="text-indigo-600">•</span>
                          <div>
                            <span>{q.text}</span>
                            {q.subtext && <p className="text-gray-600 text-sm">{q.subtext}</p>}
                            <AttachmentDisplay attachments={q.attachments} readonly />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const SOPEditPage = ({ sopId, navigate }) => {
  const { data, updateSOP, loading } = useData();
  const [sop, setSop] = useState(null);
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    const s = data.find(x => x.id === sopId);
    if (s) setSop(JSON.parse(JSON.stringify(s)));
  }, [data, sopId]);

  if (loading || !sop) return <LoadingSpinner />;

  const notify = (msg) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 2000);
  };

  const save = async () => {
    await updateSOP(sop.id, sop);
    notify('Saved!');
    setTimeout(() => navigate(`/sop/${sop.id}`), 1000);
  };

  const addStep = () => setSop({ ...sop, steps: [...(sop.steps || []), { id: `s${Date.now()}`, stepHead: { text: 'New Step', subtext: '', link: '', attachments: [] }, subHeads: [] }] });
  const delStep = (i) => setSop({ ...sop, steps: sop.steps.filter((_, x) => x !== i) });
  const updStepTxt = (i, t) => { const n = [...sop.steps]; n[i].stepHead.text = t; setSop({ ...sop, steps: n }); };
  const updStepSub = (i, t) => { const n = [...sop.steps]; n[i].stepHead.subtext = t; setSop({ ...sop, steps: n }); };
  const updStepLnk = (i, t) => { const n = [...sop.steps]; n[i].stepHead.link = t; setSop({ ...sop, steps: n }); };
  const addStepAtt = (i, a) => { const n = [...sop.steps]; if (!n[i].stepHead.attachments) n[i].stepHead.attachments = []; n[i].stepHead.attachments.push(a); setSop({ ...sop, steps: n }); notify('Attached!'); };
  const delStepAtt = (i, ai) => { const n = [...sop.steps]; n[i].stepHead.attachments.splice(ai, 1); setSop({ ...sop, steps: n }); };

  const addSub = (i) => { const n = [...sop.steps]; n[i].subHeads.push({ id: `sb${Date.now()}`, subHeadName: { text: 'New Sub', subtext: '', link: '', attachments: [] }, questions: [] }); setSop({ ...sop, steps: n }); };
  const delSub = (i, si) => { const n = [...sop.steps]; n[i].subHeads = n[i].subHeads.filter((_, x) => x !== si); setSop({ ...sop, steps: n }); };
  const updSubTxt = (i, si, t) => { const n = [...sop.steps]; n[i].subHeads[si].subHeadName.text = t; setSop({ ...sop, steps: n }); };
  const updSubSub = (i, si, t) => { const n = [...sop.steps]; n[i].subHeads[si].subHeadName.subtext = t; setSop({ ...sop, steps: n }); };
  const updSubLnk = (i, si, t) => { const n = [...sop.steps]; n[i].subHeads[si].subHeadName.link = t; setSop({ ...sop, steps: n }); };
  const addSubAtt = (i, si, a) => { const n = [...sop.steps]; if (!n[i].subHeads[si].subHeadName.attachments) n[i].subHeads[si].subHeadName.attachments = []; n[i].subHeads[si].subHeadName.attachments.push(a); setSop({ ...sop, steps: n }); notify('Attached!'); };
  const delSubAtt = (i, si, ai) => { const n = [...sop.steps]; n[i].subHeads[si].subHeadName.attachments.splice(ai, 1); setSop({ ...sop, steps: n }); };

  const addQ = (i, si) => { const n = [...sop.steps]; n[i].subHeads[si].questions.push({ id: `q${Date.now()}`, text: 'New Q', subtext: '', link: '', attachments: [] }); setSop({ ...sop, steps: n }); };
  const delQ = (i, si, qi) => { const n = [...sop.steps]; n[i].subHeads[si].questions = n[i].subHeads[si].questions.filter((_, x) => x !== qi); setSop({ ...sop, steps: n }); };
  const updQTxt = (i, si, qi, t) => { const n = [...sop.steps]; n[i].subHeads[si].questions[qi].text = t; setSop({ ...sop, steps: n }); };
  const updQSub = (i, si, qi, t) => { const n = [...sop.steps]; n[i].subHeads[si].questions[qi].subtext = t; setSop({ ...sop, steps: n }); };
  const updQLnk = (i, si, qi, t) => { const n = [...sop.steps]; n[i].subHeads[si].questions[qi].link = t; setSop({ ...sop, steps: n }); };
  const addQAtt = (i, si, qi, a) => { const n = [...sop.steps]; if (!n[i].subHeads[si].questions[qi].attachments) n[i].subHeads[si].questions[qi].attachments = []; n[i].subHeads[si].questions[qi].attachments.push(a); setSop({ ...sop, steps: n }); notify('Attached!'); };
  const delQAtt = (i, si, qi, ai) => { const n = [...sop.steps]; n[i].subHeads[si].questions[qi].attachments.splice(ai, 1); setSop({ ...sop, steps: n }); };

  return (
    <div className="min-h-screen bg-gray-50">
      {notif && <div className="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg bg-green-500 text-white">{notif}</div>}
      <div className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <input type="text" value={sop.name} onChange={(e) => setSop({ ...sop, name: e.target.value })} className="text-3xl font-bold border-b-2 focus:border-indigo-500 outline-none" />
          <div className="flex gap-2">
            <button onClick={() => navigate('/')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
            <button onClick={save} className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
              <Save className="w-4 h-4" />Save
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        {sop.steps?.map((step, si) => (
          <div key={step.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between mb-4">
              <div className="flex-1">
                <input type="text" value={step.stepHead.text} onChange={(e) => updStepTxt(si, e.target.value)} placeholder="Step title" className="text-xl font-semibold w-full border-b focus:border-indigo-500 outline-none pb-2 mb-2" />
                <textarea value={step.stepHead.subtext || ''} onChange={(e) => updStepSub(si, e.target.value)} placeholder="Description" className="w-full px-3 py-2 border rounded text-sm mb-2" rows="2" />
                <input type="url" value={step.stepHead.link || ''} onChange={(e) => updStepLnk(si, e.target.value)} placeholder="Link" className="w-full px-3 py-2 border rounded text-sm mb-2" />
                <AttachmentUploader onUpload={(a) => addStepAtt(si, a)} />
                <AttachmentDisplay attachments={step.stepHead.attachments} onRemove={(ai) => delStepAtt(si, ai)} />
              </div>
              <button onClick={() => delStep(si)} className="text-red-500 ml-4"><Trash2 className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 ml-6">
              {step.subHeads?.map((sub, shi) => (
                <div key={sub.id} className="bg-gray-50 rounded p-4">
                  <div className="flex justify-between mb-3">
                    <div className="flex-1">
                      <input type="text" value={sub.subHeadName.text} onChange={(e) => updSubTxt(si, shi, e.target.value)} placeholder="Sub head" className="text-lg font-medium w-full border-b focus:border-indigo-500 outline-none pb-1 bg-transparent mb-2" />
                      <textarea value={sub.subHeadName.subtext || ''} onChange={(e) => updSubSub(si, shi, e.target.value)} placeholder="Description" className="w-full px-3 py-2 border rounded text-sm bg-white mb-2" rows="2" />
                      <input type="url" value={sub.subHeadName.link || ''} onChange={(e) => updSubLnk(si, shi, e.target.value)} placeholder="Link" className="w-full px-3 py-2 border rounded text-sm bg-white mb-2" />
                      <AttachmentUploader onUpload={(a) => addSubAtt(si, shi, a)} />
                      <AttachmentDisplay attachments={sub.subHeadName.attachments} onRemove={(ai) => delSubAtt(si, shi, ai)} />
                    </div>
                    <button onClick={() => delSub(si, shi)} className="text-red-500 ml-4"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-2 ml-4">
                    {sub.questions?.map((q, qi) => (
                      <div key={q.id} className="flex gap-2">
                        <div className="flex-1">
                          <input type="text" value={q.text} onChange={(e) => updQTxt(si, shi, qi, e.target.value)} placeholder="Question" className="w-full px-3 py-2 border rounded mb-2" />
                          <textarea value={q.subtext || ''} onChange={(e) => updQSub(si, shi, qi, e.target.value)} placeholder="Details" className="w-full px-3 py-2 border rounded text-sm mb-2" rows="2" />
                          <input type="url" value={q.link || ''} onChange={(e) => updQLnk(si, shi, qi, e.target.value)} placeholder="Link" className="w-full px-3 py-2 border rounded text-sm mb-2" />
                          <AttachmentUploader onUpload={(a) => addQAtt(si, shi, qi, a)} />
                          <AttachmentDisplay attachments={q.attachments} onRemove={(ai) => delQAtt(si, shi, qi, ai)} />
                        </div>
                        <button onClick={() => delQ(si, shi, qi)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button onClick={() => addQ(si, shi)} className="text-indigo-600 text-sm flex items-center gap-1">
                      <Plus className="w-4 h-4" />Add Question
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={() => addSub(si)} className="text-indigo-600 flex items-center gap-1">
                <Plus className="w-4 h-4" />Add Sub Head
              </button>
            </div>
          </div>
        ))}
        <button onClick={addStep} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-500 flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />Add Step
        </button>
      </div>
    </div>
  );
};

const AdminPage = ({ navigate }) => {
  const { data, addSOP, deleteSOP, importData } = useData();
  const [name, setName] = useState('');
  const [notif, setNotif] = useState(null);

  const notify = (msg, type = 'success') => {
    setNotif({ message: msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      notify('Name required', 'error');
      return;
    }
    const res = await addSOP({ id: `sop-${Date.now()}`, name, steps: [] });
    if (res.success) {
      setName('');
      notify('Created!');
    } else {
      notify(res.error, 'error');
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sop-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    notify('Exported!');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (window.confirm('Replace all data?')) {
          await importData(imported);
          notify('Imported!');
        }
      } catch (err) {
        notify('Import failed', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {notif && <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg ${notif.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>{notif.message}</div>}
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
            <input type="text" placeholder="SOP name" value={name} onChange={(e) => setName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAdd()} className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={handleAdd} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
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
                  <button onClick={async () => { if (window.confirm(`Delete SOP "${sop.name}"?`)) { await deleteSOP(sop.id); notify('SOP deleted!'); }}} className="text-red-600 hover:text-red-700">
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