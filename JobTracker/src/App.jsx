import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatsSection from './components/StatsSection'
import JobSection from './components/JobSection'
import FilterTabs from './components/FilterTabs'
import AddJobModal from './components/AddJobForm'

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
    <div className="flex h-full bg-[#0a0d12] select-none">

      <Sidebar />

      <div className="flex-1 flex flex-col">
        
     
        <Header onAddClick={() => setOpenModal(true)}
        Nocard={Nocard} interview={interview} Offer={Offer} />

      
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

     
        <div className="ml-7">
          <JobSection JobCard={jobs} />
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