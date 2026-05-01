// import React from 'react'
// import Sidebar from './components/Sidebar'
// import Header from './components/Header'
// import StatsSection from './components/StatsSection'
// import JobSection from './components/JobSection'
// import FilterTabs from './components/FilterTabs'
// import StepOne from './components/StepOne'
// const App = () => {

//   const JobCard = [
    
// {
//       logo: "logo",
//       companyname: "meta",
//       post: "soft ware",
//       location: "no remote",
//       Date: "25-july-2026",
//       Salary: "50",
//       status: "Offer",
//     },
//   ]

//   const Nocard = JobCard.length;

//   const interview = JobCard.filter(job => job.status === "Interview").length;
//   const Applied = JobCard.filter(job => job.status === "Applied").length;
// const Offer = JobCard.filter(job => job.status === "Offer").length;
// const Rejected = JobCard.filter(job => job.status === "Rejected").length;
// const successRate = ((interview / Nocard) * 100).toFixed(1);
//   return (
//     <div className="flex h-[900px] bg-[#0a0d12] select-none">

//       <Sidebar />

//       <div className="flex-1 flex flex-col">
//         <Header />

//         <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//           <StatsSection interview={interview} Nocard = {Nocard}
//         Offer = {Offer} successRate ={successRate}/>
//         </div>

//         <FilterTabs Nocard={Nocard} interview={interview} Applied = {Applied}
//         Offer = {Offer}
//         Rejected = {Rejected} />

//         <div className="ml-7">
//           <JobSection JobCard={JobCard} />
//         </div>

//       </div>
      


//     </div>
//   )
// }

// export default App


import React from 'react'
import StepOne from "./components/StepOne"
import StepTwo from './components/StepTwo'
const App = () => {
  return (
    <div>
    <StepOne/>
    </div>
  )
}

export default App
