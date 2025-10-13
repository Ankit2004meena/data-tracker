import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Home } from 'lucide-react';
import { useData } from '../context/DataContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AttachmentDisplay from '../components/attachments/AttachmentDisplay';
import AttachmentUploader from '../components/attachments/attachmentUploader';
import ReactMarkdown from "react-markdown";

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
              <div className="text-gray-600 mb-3 whitespace-pre-wrap">
  <ReactMarkdown>
    {step.stepHead.subtext}
  </ReactMarkdown>
</div>



                {step.stepHead.link && (
                  <a href={step.stepHead.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm inline-block mb-3">
                    🔗 {step.stepHead.link}
                  </a>
                )}
                <AttachmentDisplay attachments={step.stepHead.attachments} readonly />
                {step.subHeads?.map(sub => (
                  <div key={sub.id} className="mt-4 border-l-4 border-indigo-300 pl-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{sub.subHeadName.text}</h3>
                  <div className="text-gray-600 text-sm mb-2 whitespace-pre-wrap">
  <ReactMarkdown>{sub.subHeadName.subtext}</ReactMarkdown>
</div>




                    {sub.subHeadName.link && (
                      <a href={sub.subHeadName.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm inline-block mb-2">
                        🔗 {sub.subHeadName.link}
                      </a>
                    )}
                    <AttachmentDisplay attachments={sub.subHeadName.attachments} readonly />
                    <ul className="mt-3 space-y-3">
                      {sub.questions?.map(q => (
                        <li key={q.id} className="flex gap-2">
                          <span className="text-indigo-600 mt-1">•</span>
                          <div className="flex-1">
                            <span className="text-gray-900 font-medium">{q.text}</span>
                         <div className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">
  <ReactMarkdown>{q.subtext}</ReactMarkdown>
</div>


                            {q.link && (
                              <a href={q.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm inline-block mt-1">
                                🔗 {q.link}
                              </a>
                            )}
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
export default SOPViewPage;