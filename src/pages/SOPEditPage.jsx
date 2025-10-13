import { useEffect, useState } from 'react';
import { Save, Trash2, Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AttachmentDisplay from '../components/attachments/AttachmentDisplay';
import AttachmentUploader from '../components/attachments/attachmentUploader';
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
                    <textarea
        value={step.stepHead.subtext || ''}
        onChange={(e) => updStepSub(si, e.target.value)}
        placeholder="Description"
        className="w-full px-3 py-2 border rounded text-sm mb-2 whitespace-pre-wrap"
        rows="2"
      />

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
                      <textarea value={sub.subHeadName.subtext || ''} onChange={(e) => updSubSub(si, shi, e.target.value)} placeholder="Description" className="w-full px-3 py-2 border rounded text-sm bg-white mb-2 whitespace-pre-wrap" rows="2" />
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
export default SOPEditPage;