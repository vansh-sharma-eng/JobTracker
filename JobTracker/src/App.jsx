import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatsSection from './components/StatsSection'
import JobSection from './components/JobSection'
import FilterTabs from './components/FilterTabs'
import AddJobModal from './components/AddJobForm'
import { Toaster } from "react-hot-toast";


const App = () => {
  const [openModal, setOpenModal] = useState(false);
    const [jobs, setJobs] = useState([]);
  const addJob = (newJob) => {
    setJobs([...jobs, newJob]);
  };
  const Nocard = jobs.length;
  const interview = jobs.filter(job => job.status === "Interview").length;
  const Applied = jobs.filter(job => job.status === "Applied").length;
  const Offer = jobs.filter(job => job.status === "Offer").length;
  const Rejected = jobs.filter(job => job.status === "Rejected").length;
  const successRate = Nocard === 0 ? 0 : ((interview / Nocard) * 100).toFixed(1);

  return (
    <div className="flex select-none  bg-[#0a0d12] text-white">
    <Sidebar />
    <div className="ml-[250px] w-full">
      <Header onAddClick={() => setOpenModal(true)} />
      <Toaster position="bottom-right"/>
      <div className="mt-[100px] h-[calc(100vh-100px)] overflow-y-auto p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsSection 
            interview={interview} 
            Nocard={Nocard}
            Offer={Offer} 
            successRate={successRate}
          />
        </div>
        <FilterTabs 
          Nocard={Nocard} 
          interview={interview} 
          Applied={Applied}
          Offer={Offer}
          Rejected={Rejected} 
        />
        <div className="mt-4">
          <JobSection JobCard={jobs} />
        </div>
      </div>
    </div>
    {openModal && (
      <AddJobModal 
        onClose={() => setOpenModal(false)} 
        onAddJob={addJob}
      />
    )}
  </div> 
  )
}
export default App