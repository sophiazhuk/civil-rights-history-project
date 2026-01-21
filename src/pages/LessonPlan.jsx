import React, { useEffect, useMemo, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  getActiveCollection,
  mapInterviewData,
  mapSubSummaryData,
  normalizeDocumentId
} from '../services/collectionMapper';

const lessonPlanConfig = {
  id: 'lesson-plan-fair-schools-v1',
  title: 'Lesson Plan',
  gradeBand: '3–5',
  timeEstimate: '45–60 minutes',
  topic: 'School Integration / Fair Schools',
  essentialQuestion: 'What makes a school fair?',
  learningObjectives: [
    'Describe why some school rules were unfair during segregation.',
    'Identify ways people worked to change unfair rules.',
    'Connect ideas of fairness to students’ own school experiences.'
  ],
  standardsTags: [],
  hook: {
    title: 'Hook / Warm-up',
    prompt: 'Think about a rule at school that helps everyone feel included. Why does it matter?'
  },
  vocabulary: [
    { termId: 'segregation', whyItMatters: 'Explains how unfair rules separated students.' },
    { termId: 'integration', whyItMatters: 'Shows how people worked to make schools open to everyone.' },
    { termId: 'civil rights', whyItMatters: 'Connects fairness in school to basic rights and laws.' }
  ],
  sources: [
    // Add interviewId/clipId pairs once selected in Firestore.
    // { interviewId: 'Little_Rock_Nine', clipId: 'segment_12', rationale: 'A student story about school integration.' }
  ],
  analyzeClips: [
    {
      title: 'Observe',
      prompts: [
        'What do you notice about the speaker’s experience at school?',
        'What words tell you how they felt?'
      ]
    },
    {
      title: 'Reflect',
      prompts: [
        'Why do you think this experience mattered?',
        'How would you feel if this happened at your school?'
      ]
    },
    {
      title: 'Question',
      prompts: [
        'What question would you ask the speaker?',
        'What else do you want to know about this moment?'
      ]
    }
  ],
  discussionQuestions: [
    'How did students and families show courage?',
    'What change do you think mattered the most in these stories?',
    'What is one way schools can stay fair today?'
  ],
  activity: {
    title: 'Activity',
    instructions: 'Create a short class pledge with three rules that make school fair for everyone.'
  },
  wrapUp: {
    title: 'Wrap-up / Exit Ticket',
    prompts: [
      'Write one unfair rule you learned about and how people tried to change it.',
      'Write one way you can make your school more fair.'
    ]
  },
  extensions: [
    'Draw a picture of a fair classroom and label what makes it fair.',
    'Share a short story about a time you helped make something more fair.'
  ],
  teacherNotes: {
    materials: [
      'Projector or shared screen',
      'Student notebooks or paper',
      'Access to interview clips'
    ],
    prepSteps: [
      'Preview clips and confirm they are appropriate for your class.',
      'Decide which supporting questions you want to emphasize.'
    ],
    backgroundContext: 'This lesson uses oral history interviews to explore fairness in schools during segregation and integration.',
    sensitiveContentNotes: 'Review clips for any language you want to preview or contextualize for students.',
    sources: [
      {
        label: 'LOC Lesson Plan Model',
        url: 'https://www.loc.gov/classroom-materials/lesson-plans/'
      },
      {
        label: 'NPS Teaching with Historic Places',
        url: 'https://www.nps.gov/subjects/teachingwithhistoricplaces/how-to-use-classic-lesson-plans.htm'
      },
      {
        label: 'DocsTeach Activity Model',
        url: 'https://docsteach.org/about'
      }
    ],
    evidenceLinks: [],
    notes: [
      'Replace placeholder glossary terms and clips with final selections.',
      'Add clip IDs to enable primary source cards.'
    ]
  }
};

/**
 * LessonPlan - Placeholder page for lesson plan prototype.
 *
 * @returns {React.ReactElement} The lesson plan page.
 */
export default function LessonPlan() {
  const [loading, setLoading] = useState(true);
  const [termDetails, setTermDetails] = useState({});
  const [clipDetails, setClipDetails] = useState({});
  const [loadError, setLoadError] = useState(null);

  const activeCollection = useMemo(() => getActiveCollection(), []);

  useEffect(() => {
    let isMounted = true;

    const loadLessonPlanData = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const termResults = {};
        for (const term of lessonPlanConfig.vocabulary) {
          const termRef = doc(db, 'events_and_topics', term.termId);
          const termSnap = await getDoc(termRef);
          termResults[term.termId] = termSnap.exists() ? termSnap.data() : null;
        }

        const clipResults = {};
        for (const source of lessonPlanConfig.sources) {
          const normalizedInterviewId = normalizeDocumentId(source.interviewId, activeCollection);
          const interviewRef = doc(db, activeCollection, normalizedInterviewId);
          const interviewSnap = await getDoc(interviewRef);
          const interviewData = interviewSnap.exists()
            ? mapInterviewData({ id: interviewSnap.id, ...interviewSnap.data() }, activeCollection)
            : null;

          const clipRef = doc(db, activeCollection, normalizedInterviewId, 'subSummaries', source.clipId);
          const clipSnap = await getDoc(clipRef);
          const clipData = clipSnap.exists()
            ? mapSubSummaryData({ id: clipSnap.id, ...clipSnap.data() }, activeCollection)
            : null;

          clipResults[`${source.interviewId}::${source.clipId}`] = {
            interview: interviewData,
            clip: clipData
          };
        }

        if (isMounted) {
          setTermDetails(termResults);
          setClipDetails(clipResults);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError('Unable to load lesson plan data.');
        }
        console.error('Lesson plan load failed:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadLessonPlanData();

    return () => {
      isMounted = false;
    };
  }, [activeCollection]);

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: '#EBEAE9' }}>
      <div className="px-4 sm:px-8 lg:px-12 pt-4 pb-16">
        <div className="border-b border-black pb-4 mb-8">
          <h1 className="text-stone-900 text-6xl lg:text-8xl font-medium font-['Inter']">
            {lessonPlanConfig.title}
          </h1>
        </div>

        <div className="max-w-4xl space-y-10">
          <div className="flex flex-wrap gap-4 text-stone-900 text-base font-light font-['Chivo_Mono']">
            <span>Grade Band: {lessonPlanConfig.gradeBand}</span>
            <span>Time: {lessonPlanConfig.timeEstimate}</span>
            <span>Topic: {lessonPlanConfig.topic}</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-stone-900 text-3xl font-semibold font-['Inter']">Essential Question</h2>
            <p className="text-black text-2xl font-medium font-['Lora'] leading-relaxed">
              {lessonPlanConfig.essentialQuestion}
            </p>
          </div>

          {loadError && (
            <div className="text-red-600 text-base font-light font-['Chivo_Mono']">
              {loadError}
            </div>
          )}

          <section className="space-y-6">
            <h2 className="text-stone-900 text-4xl font-semibold font-['Inter'] border-b border-black pb-3">
              {lessonPlanConfig.hook.title}
            </h2>
            <p className="text-black text-2xl font-medium font-['Lora'] leading-relaxed">
              {lessonPlanConfig.hook.prompt}
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-stone-900 text-4xl font-semibold font-['Inter'] border-b border-black pb-3">
              Overview
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-stone-900 text-base font-light font-['Chivo_Mono']">Learning Objectives</p>
                <ul className="list-disc ml-6 mt-2 space-y-1 text-black text-xl font-medium font-['Lora'] leading-relaxed">
                  {lessonPlanConfig.learningObjectives.map((goal) => (
                    <li key={goal}>{goal}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-stone-900 text-4xl font-semibold font-['Inter'] border-b border-black pb-3">
              Vocabulary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lessonPlanConfig.vocabulary.map((term) => {
                const termData = termDetails[term.termId];
                return (
                  <div
                    key={term.termId}
                    className="bg-white/70 border border-black p-4 space-y-3"
                  >
                    <div className="text-stone-900 text-2xl font-bold font-['Source_Serif_4'] capitalize">
                      {termData?.eventTopic || term.termId}
                    </div>
                    <p className="text-black text-base font-normal font-['Lora'] leading-relaxed">
                      {termData?.description || 'Glossary entry not found yet.'}
                    </p>
                    <p className="text-stone-900 text-sm font-light font-['Chivo_Mono']">
                      Why it matters: {term.whyItMatters}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-stone-900 text-4xl font-semibold font-['Inter'] border-b border-black pb-3">
              Primary Sources
            </h2>
            {lessonPlanConfig.sources.length === 0 ? (
              <p className="text-stone-900 text-base font-light font-['Chivo_Mono']">
                Clip references will appear here once interview IDs and clip IDs are added.
              </p>
            ) : (
              <div className="space-y-6">
                {lessonPlanConfig.sources.map((source) => {
                  const key = `${source.interviewId}::${source.clipId}`;
                  const clipData = clipDetails[key];
                  return (
                    <div key={key} className="bg-white/70 border border-black p-4 space-y-3">
                      <div className="text-stone-900 text-2xl font-bold font-['Source_Serif_4']">
                        {clipData?.clip?.topic || 'Clip not available'}
                      </div>
                      <p className="text-stone-900 text-sm font-light font-['Chivo_Mono']">
                        {clipData?.interview?.documentName || source.interviewId}
                        {clipData?.interview?.roleSimplified ? ` • ${clipData.interview.roleSimplified}` : ''}
                      </p>
                      <p className="text-black text-base font-normal font-['Lora'] leading-relaxed">
                        {clipData?.clip?.summary || 'Clip summary missing.'}
                      </p>
                      <p className="text-stone-900 text-sm font-light font-['Chivo_Mono']">
                        Timestamp: {clipData?.clip?.timestamp || '—'}
                      </p>
                      <p className="text-stone-900 text-sm font-light font-['Chivo_Mono']">
                        Why this clip: {source.rationale}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-6">
            <h2 className="text-stone-900 text-4xl font-semibold font-['Inter'] border-b border-black pb-3">
              Analyze Clips
            </h2>
            <div className="space-y-4">
              {lessonPlanConfig.analyzeClips.map((block) => (
                <div key={block.title} className="space-y-2">
                  <h3 className="text-stone-900 text-2xl font-semibold font-['Inter']">{block.title}</h3>
                  <ul className="list-disc ml-6 space-y-1 text-black text-xl font-medium font-['Lora'] leading-relaxed">
                    {block.prompts.map((prompt) => (
                      <li key={prompt}>{prompt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-stone-900 text-4xl font-semibold font-['Inter'] border-b border-black pb-3">
              Discussion Questions
            </h2>
            <ul className="list-disc ml-6 space-y-1 text-black text-xl font-medium font-['Lora'] leading-relaxed">
              {lessonPlanConfig.discussionQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-stone-900 text-4xl font-semibold font-['Inter'] border-b border-black pb-3">
              {lessonPlanConfig.activity.title}
            </h2>
            <p className="text-black text-2xl font-medium font-['Lora'] leading-relaxed">
              {lessonPlanConfig.activity.instructions}
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-stone-900 text-4xl font-semibold font-['Inter'] border-b border-black pb-3">
              {lessonPlanConfig.wrapUp.title}
            </h2>
            <ul className="list-disc ml-6 space-y-1 text-black text-xl font-medium font-['Lora'] leading-relaxed">
              {lessonPlanConfig.wrapUp.prompts.map((prompt) => (
                <li key={prompt}>{prompt}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-stone-900 text-4xl font-semibold font-['Inter'] border-b border-black pb-3">
              Extensions
            </h2>
            <ul className="list-disc ml-6 space-y-1 text-black text-xl font-medium font-['Lora'] leading-relaxed">
              {lessonPlanConfig.extensions.map((extension) => (
                <li key={extension}>{extension}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-6">
            <details className="group border border-black bg-white/70 p-4">
              <summary className="cursor-pointer text-stone-900 text-2xl font-semibold font-['Inter']">
                Teacher Notes
              </summary>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-stone-900 text-base font-light font-['Chivo_Mono']">Materials</p>
                  <ul className="list-disc ml-6 mt-2 space-y-1 text-black text-base font-medium font-['Lora'] leading-relaxed">
                    {lessonPlanConfig.teacherNotes.materials.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-stone-900 text-base font-light font-['Chivo_Mono']">Prep Steps</p>
                  <ul className="list-disc ml-6 mt-2 space-y-1 text-black text-base font-medium font-['Lora'] leading-relaxed">
                    {lessonPlanConfig.teacherNotes.prepSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-stone-900 text-base font-light font-['Chivo_Mono']">Background Context</p>
                  <p className="text-black text-base font-medium font-['Lora'] leading-relaxed">
                    {lessonPlanConfig.teacherNotes.backgroundContext}
                  </p>
                </div>
                <div>
                  <p className="text-stone-900 text-base font-light font-['Chivo_Mono']">Sensitive Content Notes</p>
                  <p className="text-black text-base font-medium font-['Lora'] leading-relaxed">
                    {lessonPlanConfig.teacherNotes.sensitiveContentNotes}
                  </p>
                </div>
                <div>
                  <p className="text-stone-900 text-base font-light font-['Chivo_Mono']">Sources</p>
                  <ul className="list-disc ml-6 mt-2 space-y-1 text-black text-base font-medium font-['Lora'] leading-relaxed">
                    {lessonPlanConfig.teacherNotes.sources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:underline"
                        >
                          {source.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-stone-900 text-base font-light font-['Chivo_Mono']">Evidence Links</p>
                  {lessonPlanConfig.teacherNotes.evidenceLinks.length === 0 ? (
                    <p className="text-stone-900 text-base font-light font-['Chivo_Mono']">
                      Evidence links will appear after clip and glossary IDs are finalized.
                    </p>
                  ) : (
                    <ul className="list-disc ml-6 mt-2 space-y-1 text-black text-base font-medium font-['Lora'] leading-relaxed">
                      {lessonPlanConfig.teacherNotes.evidenceLinks.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <ul className="list-disc ml-6 space-y-1 text-black text-base font-medium font-['Lora'] leading-relaxed">
                  {lessonPlanConfig.teacherNotes.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </details>
          </section>

          {loading && (
            <p className="text-stone-900 text-base font-light font-['Chivo_Mono']">
              Loading lesson plan content...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
