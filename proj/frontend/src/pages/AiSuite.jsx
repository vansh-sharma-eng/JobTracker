import { useState } from "react";
import { Sparkles, FileText, HelpCircle, Wand2 } from "lucide-react";
import Header from "../components/Header";
import ResumeMatcherTab from "../components/ai/ResumeMatcherTab";
import CoverLetterTab from "../components/ai/CoverLetterTab";
import InterviewPrepTab from "../components/ai/InterviewPrepTab";
import SmartParserTab from "../components/ai/SmartParserTab";

export default function AiSuite() {
  const [activeTab, setActiveTab] = useState("resume"); // resume | cover | interview | parser

  return (
    <>
      <Header
        title="AI Career Copilot"
        subtitle="Resume match score, ATS keyword gap analysis, customized cover letters, and interview prep"
      />

      <main className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl mx-auto w-full">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-4">
          <button
            onClick={() => setActiveTab("resume")}
            className={`btn btn-sm ${activeTab === "resume" ? "btn-primary" : "btn-ghost"}`}
          >
            <Sparkles size={15} /> Resume Match & ATS Gap
          </button>
          <button
            onClick={() => setActiveTab("cover")}
            className={`btn btn-sm ${activeTab === "cover" ? "btn-primary" : "btn-ghost"}`}
          >
            <FileText size={15} /> Tailored Cover Letter
          </button>
          <button
            onClick={() => setActiveTab("interview")}
            className={`btn btn-sm ${activeTab === "interview" ? "btn-primary" : "btn-ghost"}`}
          >
            <HelpCircle size={15} /> Interview Prep & Questions
          </button>
          <button
            onClick={() => setActiveTab("parser")}
            className={`btn btn-sm ${activeTab === "parser" ? "btn-primary" : "btn-ghost"}`}
          >
            <Wand2 size={15} /> Smart 1-Click Job Parser
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "resume" && <ResumeMatcherTab />}
        {activeTab === "cover" && <CoverLetterTab />}
        {activeTab === "interview" && <InterviewPrepTab />}
        {activeTab === "parser" && <SmartParserTab />}
      </main>
    </>
  );
}
