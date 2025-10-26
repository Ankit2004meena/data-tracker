import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Home, Tag, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AttachmentDisplay from '../components/attachments/AttachmentDisplay';
import ReactMarkdown from 'react-markdown';


// ---------- Helpers for attachments ----------
const isImageAttachment = (att) => {
  if (!att) return false;
  const mime = att?.mimeType || att?.type;
  const url = att?.url || att?.src || att?.path || att?.previewUrl;
  if (typeof mime === 'string' && mime.startsWith('image/')) return true;
  if (typeof url === 'string') {
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url);
  }
  return false;
};

const getImageAttachments = (arr) => (Array.isArray(arr) ? arr.filter(isImageAttachment) : []);
const getNonImageAttachments = (arr) => (Array.isArray(arr) ? arr.filter((a) => !isImageAttachment(a)) : []);

// Flatten a sub-head's question images into ordered slides
const buildSubSlides = (sub) => {
  const slides = [];
  (sub?.questions || []).forEach((q, qIndex) => {
    const imgs = getImageAttachments(q?.attachments);
    imgs.forEach((img, imgIndex) => {
      const url = img?.url || img?.src || img?.path || img?.previewUrl;
      if (url) {
        slides.push({
          url,
          alt: img?.name || img?.fileName || `Question ${qIndex + 1} Image ${imgIndex + 1}`,
          qId: q?.id,
          qTitle: q?.text,
          qIndex,
          imgIndex,
        });
      }
    });
  });
  return slides;
};

// ---------- Color palette (static Tailwind classes) ----------
const COLOR_STYLES = [
  {
    border: 'border-indigo-400',
    bg: 'bg-indigo-50',
    text: 'text-indigo-900',
    icon: 'text-indigo-600',
    ring: 'ring-indigo-100',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    dot: 'bg-indigo-500',
    link: 'text-indigo-600',
  },
  {
    border: 'border-emerald-400',
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    icon: 'text-emerald-600',
    ring: 'ring-emerald-100',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    dot: 'bg-emerald-500',
    link: 'text-emerald-600',
  },
  {
    border: 'border-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    icon: 'text-amber-600',
    ring: 'ring-amber-100',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    dot: 'bg-amber-500',
    link: 'text-amber-600',
  },
  {
    border: 'border-rose-400',
    bg: 'bg-rose-50',
    text: 'text-rose-900',
    icon: 'text-rose-600',
    ring: 'ring-rose-100',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    dot: 'bg-rose-500',
    link: 'text-rose-600',
  },
  {
    border: 'border-violet-400',
    bg: 'bg-violet-50',
    text: 'text-violet-900',
    icon: 'text-violet-600',
    ring: 'ring-violet-100',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-800',
    dot: 'bg-violet-500',
    link: 'text-violet-600',
  },
  {
    border: 'border-cyan-400',
    bg: 'bg-cyan-50',
    text: 'text-cyan-900',
    icon: 'text-cyan-600',
    ring: 'ring-cyan-100',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-800',
    dot: 'bg-cyan-500',
    link: 'text-cyan-600',
  },
];

// ---------- Lightbox (edge-to-edge, with reliable close) ----------
const PhotoLightbox = ({ open, slides = [], startIndex = 0, onClose }) => {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    setCurrent(startIndex);
  }, [startIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowRight') setCurrent((i) => (i + 1) % slides.length);
      if (e.key === 'ArrowLeft') setCurrent((i) => (i - 1 + slides.length) % slides.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, slides.length, onClose]);

  if (!open || slides.length === 0) return null;

  const s = slides[current];

  const handleCloseClick = () => {
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/90"
      onClick={handleCloseClick}
    >
      <button
        type="button"
        onPointerDown={(e) => { e.stopPropagation(); }}
        onClick={handleCloseClick}
        className="absolute top-4 right-4 text-white/90 hover:text-white z-[1011]"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="absolute inset-0 flex items-center justify-center z-[1000]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={s.url}
          alt={s.alt}
          className="max-w-[100vw] max-h-[100dvh] object-contain"
        />
      </div>

      <button
        type="button"
        onPointerDown={(e) => { e.stopPropagation(); }}
        onClick={(e) => { e.stopPropagation(); setCurrent((i) => (i - 1 + slides.length) % slides.length); }}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/90 hover:text-white bg-black/30 hover:bg-black/40 rounded-full p-2 z-[1011]"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        type="button"
        onPointerDown={(e) => { e.stopPropagation(); }}
        onClick={(e) => { e.stopPropagation(); setCurrent((i) => (i + 1) % slides.length); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/90 hover:text-white bg-black/30 hover:bg-black/40 rounded-full p-2 z-[1011]"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded bg-black/40 text-white text-xs">
        {current + 1} / {slides.length} — Q{s.qIndex + 1}: {s.qTitle || 'Untitled'}
      </div>
    </div>
  );
};

// ---------- Main Page ----------
const SOPViewPage = ({ sopId, navigate }) => {
  const { data, loading } = useData();
  const [expanded, setExpanded] = useState({});

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSlides, setLightboxSlides] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Global gate for question visibility (top toggle)
  const [questionsViewEnabled, setQuestionsViewEnabled] = useState(false); // OFF by default
  // Per–sub-head: questions expansion
  const [subQuestionsExpanded, setSubQuestionsExpanded] = useState({}); // { [sub.id]: boolean }
  // Per–sub-head: description expansion (independent)
  const [subDescExpanded, setSubDescExpanded] = useState({}); // { [sub.id]: boolean }

  // Guard to prevent immediate reopen from the same tap/click after closing
  const justClosedAtRef = useRef(0);

  const sop = data.find((s) => s.id === sopId);

  const toggleSubQuestions = (subId) => {
    setSubQuestionsExpanded((prev) => ({ ...prev, [subId]: !prev[subId] }));
  };

  const toggleSubDesc = (subId) => {
    setSubDescExpanded((prev) => ({ ...prev, [subId]: !prev[subId] }));
  };

  const openLightboxForSub = (sub, q, localImgIndex) => {
    if (Date.now() - justClosedAtRef.current < 250) return;
    const slides = buildSubSlides(sub);
    const start = slides.findIndex(
      (s) => s.qId === q.id && s.imgIndex === localImgIndex
    );
    setLightboxSlides(slides);
    setLightboxIndex(start >= 0 ? start : 0);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    justClosedAtRef.current = Date.now();
    setLightboxOpen(false);
  };

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
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <Home className="w-5 h-5 mr-2" />
              Back
            </button>

            {/* Global Question View Toggle */}
            <button
              type="button"
              onClick={() => setQuestionsViewEnabled((v) => !v)}
              className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm text-white ${questionsViewEnabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-500 hover:bg-gray-600'}`}
              aria-pressed={questionsViewEnabled}
            >
              {questionsViewEnabled ? 'Question view: ON' : 'Question view: OFF'}
            </button>
          </div>

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
                  <div className="text-gray-600 whitespace-pre-wrap prose prose-indigo max-w-none">
                    <ReactMarkdown>{step.stepHead.subtext}</ReactMarkdown>
                  </div>
                </div>

                {/* Step link */}
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
                {step.subHeads?.map((sub, idx) => {
                  const style = COLOR_STYLES[idx % COLOR_STYLES.length];
                  const hasDesc = !!sub.subHeadName?.subtext;
                  const hasQuestions = Array.isArray(sub.questions) && sub.questions.length > 0;

                  return (
                    <div
                      key={sub.id}
                      className={`mt-4 pl-4 space-y-4 border-l-4 ${style.border} ${style.bg} ring-1 ${style.ring} rounded-md`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        {/* Left: if there ARE questions, show a chevron button to toggle questions; otherwise show static header */}
                        {hasQuestions ? (
                          <button
                            type="button"
                            onClick={() =>
                              setSubQuestionsExpanded((prev) => ({
                                ...prev,
                                [sub.id]: !prev[sub.id],
                              }))
                            }
                            className="flex items-center gap-2 min-w-0 text-left"
                            aria-expanded={!!subQuestionsExpanded[sub.id]}
                            aria-controls={`subq-${sub.id}`}
                          >
                            {subQuestionsExpanded[sub.id] ? (
                              <ChevronDown className={`w-5 h-5 flex-shrink-0 ${style.icon}`} />
                            ) : (
                              <ChevronRight className={`w-5 h-5 flex-shrink-0 ${style.icon}`} />
                            )}
                            <Tag className={`w-4 h-4 flex-shrink-0 ${style.icon}`} />
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${style.badgeBg} ${style.badgeText}`}
                            >
                              Sub {idx + 1}
                            </span>
                            <h3
                              className={`text-lg font-medium break-words flex-1 min-w-0 ${style.text}`}
                            >
                              {sub.subHeadName.text}
                            </h3>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 min-w-0">
                            <Tag className={`w-4 h-4 flex-shrink-0 ${style.icon}`} />
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${style.badgeBg} ${style.badgeText}`}
                            >
                              Sub {idx + 1}
                            </span>
                            <h3
                              className={`text-lg font-medium break-words flex-1 min-w-0 ${style.text}`}
                            >
                              {sub.subHeadName.text}
                            </h3>
                          </div>
                        )}

                        {/* Right: description arrow appears ONLY if there is description */}
                        {hasDesc && (
                          <button
                            type="button"
                            onClick={() =>
                              setSubDescExpanded((prev) => ({
                                ...prev,
                                [sub.id]: !prev[sub.id],
                              }))
                            }
                            className={`${style.text} hover:opacity-80 flex-shrink-0`}
                            aria-expanded={!!subDescExpanded[sub.id]}
                            aria-controls={`subdesc-${sub.id}`}
                            title="Toggle description"
                          >
                            {subDescExpanded[sub.id] ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Sub-head description: collapsible and independent */}
                      {hasDesc && subDescExpanded[sub.id] && (
                        <div id={`subdesc-${sub.id}`} className="overflow-x-auto">
                          <div className="text-gray-600 text-sm whitespace-pre-wrap prose prose-indigo max-w-none">
                            <ReactMarkdown>{sub.subHeadName.subtext}</ReactMarkdown>
                          </div>
                        </div>
                      )}

                      {/* Sub-head link: always visible */}
                      {sub.subHeadName.link && (
                        <a
                          href={sub.subHeadName.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${style.link} hover:underline text-sm break-all inline-block max-w-full`}
                        >
                          🔗 {sub.subHeadName.link}
                        </a>
                      )}

                      {/* Sub-head attachments: always visible */}
                      <AttachmentDisplay
                        attachments={sub.subHeadName.attachments}
                        readonly
                      />

                      {/* Questions: only if sub actually HAS questions, global gate ON, and this sub-head expanded */}
                      {hasQuestions && questionsViewEnabled && subQuestionsExpanded[sub.id] && (
                        <ul id={`subq-${sub.id}`} className="mt-3 space-y-4">
                          {sub.questions?.map((q) => {
                            const images = getImageAttachments(q.attachments);
                            const nonImage = getNonImageAttachments(q.attachments);

                            return (
                              <li key={q.id} className="flex flex-col gap-2">
                                <div className="flex items-start gap-2">
                                  <span className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-gray-900 font-medium break-words">
                                      {q.text}
                                    </span>

                                    {/* Question description with horizontal scroll */}
                                    <div className="overflow-x-auto mt-1">
                                      <div className="text-gray-600 text-sm whitespace-pre-wrap prose prose-indigo max-w-none">
                                        <ReactMarkdown>{q.subtext}</ReactMarkdown>
                                      </div>
                                    </div>

                                    {/* Question link */}
                                    {q.link && (
                                      <a
                                        href={q.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`${style.link} hover:underline text-sm break-all inline-block max-w-full mt-1`}
                                      >
                                        🔗 {q.link}
                                      </a>
                                    )}
                                  </div>
                                </div>

                                {/* Image thumbnails (click to open lightbox) */}
                                {images.length > 0 && (
                                  <div className="pl-4 flex flex-wrap gap-2">
                                    {images.map((img, imgIndex) => {
                                      const url = img?.url || img?.src || img?.path || img?.previewUrl;
                                      return (
                                        <button
                                          type="button"
                                          key={`${q.id}-${imgIndex}`}
                                          onClick={() => openLightboxForSub(sub, q, imgIndex)}
                                          className="group relative w-24 h-24 overflow-hidden rounded-md ring-1 ring-gray-200 bg-white"
                                          aria-label="Open image"
                                        >
                                          <img
                                            src={url}
                                            alt={img?.name || img?.fileName || 'Attachment image'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            loading="lazy"
                                          />
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Non-image attachments */}
                                {nonImage.length > 0 && (
                                  <div className="pl-4">
                                    <AttachmentDisplay attachments={nonImage} readonly />
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Shared lightbox for the current sub-head */}
      <PhotoLightbox
        open={lightboxOpen}
        slides={lightboxSlides}
        startIndex={lightboxIndex}
        onClose={closeLightbox}
      />
    </div>
  );
};

export default SOPViewPage;
