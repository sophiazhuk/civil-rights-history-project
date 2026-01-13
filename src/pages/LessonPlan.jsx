import React from 'react';

/**
 * LessonPlan - Placeholder page for lesson plan prototype.
 *
 * @returns {React.ReactElement} The lesson plan page.
 */
export default function LessonPlan() {
  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: '#EBEAE9' }}>
      <div className="px-4 sm:px-8 lg:px-12 pt-4 pb-16">
        <div className="border-b border-black pb-4 mb-8">
          <h1 className="text-stone-900 text-6xl lg:text-8xl font-medium font-['Inter']">
            Lesson Plan
          </h1>
        </div>

        <div className="max-w-3xl space-y-6">
          <p className="text-black text-2xl font-medium font-['Lora'] leading-relaxed">
            This page will host an elementary lesson plan prototype built from the
            Civil Rights History Project interviews and glossary.
          </p>
          <p className="text-stone-900 text-base font-light font-['Chivo_Mono']">
            Coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
