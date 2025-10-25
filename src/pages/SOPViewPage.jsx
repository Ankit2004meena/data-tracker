import { useState } from 'react';
import { ChevronDown, ChevronRight, Home } from 'lucide-react';
import { useData } from '../context/DataContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AttachmentDisplay from '../components/attachments/AttachmentDisplay';
import ReactMarkdown from 'react-markdown';


const SOPViewPage = ({ sopId, navigate }) => {
  const { data, loading } = useData();
  const [expanded, setExpanded] = useState({});
  const [subDescExpanded, setSubDescExpanded] = useState({});
  const sop = data.find((s) => s.id === sopId);


  if (loading) return <LoadingSpinner />;
  if (!sop)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
        >
          Go Home
        </button>
      </div>
    );


  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <Home className="w-5 h-5 mr-2" />Back
          </button>
          <h1 className="text-4xl font-bold break-words">{sop.name}</h1>
        </div>
      </div>


      {/* Steps */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        {sop.steps?.map((step) => (
          <div key={step.id} className="bg-white rounded-lg shadow">
            <button
              onClick={() =>
                setExpanded((p) => ({ ...p, [step.id]: !p[step.id] }))
              }
              className="w-full px-6 py-4 flex items-center justify-between bg-indigo-600 text-white"
            >
              <span className="text-xl font-semibold break-words pr-2">
                {step.stepHead.text}
              </span>
              {expanded[step.id] ? (
                <ChevronDown className="w-6 h-6 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-6 h-6 flex-shrink-0" />
              )}
            </button>


            {expanded[step.id] && (
              <div className="p-6 space-y-4">
                {/* Step Markdown with horizontal scroll */}
                <div className="overflow-x-auto">
                  <div className="text-gray-600 prose prose-indigo max-w-none min-w-0">
                    <ReactMarkdown>{step.stepHead.subtext}</ReactMarkdown>
                  </div>
                </div>


                {/* Step link - normal wrap */}
                {step.stepHead.link && (
                  <a
                    href={step.stepHead.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline text-sm break-all inline-block max-w-full"
                  >
                    🔗 {step.stepHead.link}
                  </a>
                )}


                {/* Step attachments */}
                <AttachmentDisplay
                  attachments={step.stepHead.attachments}
                  readonly
                />


                {/* Sub-heads */}
                {step.subHeads?.map((sub) => (
                  <div
                    key={sub.id}
                    className="mt-4 border-l-4 border-indigo-300 pl-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-medium text-gray-900 break-words flex-1 min-w-0">
                        {sub.subHeadName.text}
                      </h3>
                      {/* Only show toggle icon if description exists */}
                      {sub.subHeadName.subtext && (
                        <button
                          onClick={() =>
                            setSubDescExpanded((p) => ({
                              ...p,
                              [sub.id]: !p[sub.id],
                            }))
                          }
                          className="text-indigo-600 hover:text-indigo-800 flex-shrink-0"
                        >
                          {subDescExpanded[sub.id] ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>


                    {/* Sub-head description toggle with horizontal scroll */}
                    {subDescExpanded[sub.id] && sub.subHeadName.subtext && (
                      <div className="overflow-x-auto">
                        <div className="text-gray-600 text-sm prose prose-indigo max-w-none min-w-0">
                          <ReactMarkdown>{sub.subHeadName.subtext}</ReactMarkdown>
                        </div>
                      </div>
                    )}


                    {/* Sub-head link - normal wrap */}
                    {sub.subHeadName.link && (
                      <a
                        href={sub.subHeadName.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline text-sm break-all inline-block max-w-full"
                      >
                        🔗 {sub.subHeadName.link}
                      </a>
                    )}


                    {/* Sub-head attachments */}
                    <AttachmentDisplay
                      attachments={sub.subHeadName.attachments}
                      readonly
                    />


                    {/* Questions */}
                    <ul className="mt-3 space-y-3">
                      {sub.questions?.map((q) => (
                        <li key={q.id} className="flex gap-2">
                          <span className="text-indigo-600 mt-1 flex-shrink-0">•</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-gray-900 font-medium break-words">
                              {q.text}
                            </span>
                            {/* Question description with horizontal scroll */}
                            <div className="overflow-x-auto mt-1">
                              <div className="text-gray-600 text-sm prose prose-indigo max-w-none min-w-0">
                                <ReactMarkdown>{q.subtext}</ReactMarkdown>
                              </div>
                            </div>


                            {/* Question link - normal wrap */}
                            {q.link && (
                              <a
                                href={q.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline text-sm break-all inline-block max-w-full mt-1"
                              >
                                🔗 {q.link}
                              </a>
                            )}
                            <AttachmentDisplay
                              attachments={q.attachments}
                              readonly
                            />
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
