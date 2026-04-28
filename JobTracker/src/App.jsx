import React from 'react'
import {Calendar} from 'lucide-react'
import {FileText} from 'lucide-react'
import { Kanban } from 'lucide-react'
import {ChartLine} from 'lucide-react'
import {Search} from 'lucide-react'
import {Plus} from 'lucide-react'
const App = () => {
  return (
 <div className="flex h-screen bg-[#11151c] select-none">


  <div className="w-[250px] border-r border-[#515151] bg-[#11161c] flex flex-col justify-between">

    <div>
      <div className="p-5 flex gap-3">
        <div className="h-8 w-8 rounded-xl bg-[#8b2fc9] flex justify-center items-center">
          <Calendar size={19} color="#ffffff" strokeWidth={2} />
        </div>
        <h6 className="text-white text-md mt-1 font-bold">JobTracker</h6>
      </div>

      <div className="p-4">
        <div className="flex cursor-pointer gap-3 mt-2 px-4 py-2 bg-[#55547cb5] border border-[#8763ff] rounded-xl">
          <FileText className="mt-1.5 ml-2" size={15} color="#ffffff" />
          <h3 className="text-[#e5e5ef] font-medium text-md">Applications</h3>
        </div>

        <div className="flex cursor-pointer gap-3 mt-3 px-4 py-2 bg-[#7473c563] border border-[#754bff] rounded-xl">
          <Kanban className="mt-1.5 ml-2" size={15} color="#ffffff" />
          <h3 className="text-white text-md">Kanban Board</h3>
        </div>

        <div className="flex cursor-pointer gap-3 mt-3 px-4 py-2 bg-[#7473c563] border border-[#754bff] rounded-xl">
          <ChartLine className="mt-1.5 ml-2" size={15} color="#ffffff" />
          <h3 className="text-white text-md">Analytics</h3>
        </div>
      </div>
    </div>

    {/* Profile */}
    <div className="border-t border-[#515151] p-3 flex items-center">
      <div className="h-12 w-12 bg-violet-500 rounded-full flex items-center justify-center">
        <span className="text-white text-md font-bold">YS</span>
      </div>

      <div className="ml-4">
        <h4 className="text-white text-sm font-semibold">You</h4>
        <p className="text-gray-400 text-xs">2026 batch</p>
      </div>
    </div>
  </div>

  
  <div className="flex-1 flex flex-col">

      <div className="h-[100px] border-b border-[#3f3f3f] flex justify-between bg-[#0f0f0fc5]">

      <div className="p-4 text-[#fdfdfd]">
        <p className="text-2xl p-1 ml-2 font-bold">Applications</p>
        <p className="text-xs ml-3 text-[#9c9c9cd4]">
          6 total · 2 in interview · 1 offers
        </p>
      </div>

      <div className="p-7 flex gap-5">
        <div className="p-2 h-10 w-60 border border-[#d7d7d7a7] rounded-xl flex items-center gap-3 bg-[#2b2b2b5e] active:scale-99">
          <Search color="#cecece82" strokeWidth={1.5} size={18} />
          <input
            type="text"
            placeholder="Search company or role..."
            className="bg-transparent outline-none text-[#cecece82] placeholder:text-[#cecece82] w-full"
          />
        </div>

        <button className="h-10 w-28 rounded-xl active:scale-95 flex items-center justify-center gap-1 text-white font-bold bg-gradient-to-r from-[#6D6AFD] to-[#A855F7]">
          <Plus size={20} strokeWidth={2} />
          Add job
        </button>
      </div>
    </div>

  


    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">


     
   <div className="relative bg-[#1a1a1a] p-5 rounded-xl text-white overflow-hidden">

 
  <div className="absolute -top-7 -right-7 w-22 h-22 bg-indigo-400 opacity-20 rounded-full"></div>

  <p className="text-sm text-gray-400">TOTAL APPLIED</p>
  <h2 className="text-3xl font-bold mt-2">6</h2>
  <p className="text-xs text-gray-500 mt-1">All time</p>

</div>



   <div className="relative bg-[#1a1a1a] p-5 rounded-xl text-white overflow-hidden">

 
  <div className="absolute -top-7 -right-7 w-22 h-22 bg-orange-400 opacity-20 rounded-full"></div>

  <p className="text-sm text-gray-400">INTERVIEWS</p>
  <h2 className="text-3xl font-bold mt-2">2</h2>
  <p className="text-xs text-gray-500 mt-1">Active Pipeline</p>

</div>




   <div className="relative bg-[#1a1a1a] p-5 rounded-xl text-white overflow-hidden">

 
  <div className="absolute -top-7 -right-7 w-22 h-22 bg-green-400 opacity-20 rounded-full"></div>

  <p className="text-sm text-gray-400">OFFERS</p>
  <h2 className="text-3xl font-bold mt-2">1</h2>
  <p className="text-xs text-gray-500 mt-1">In hand</p>

</div>

   <div className="relative bg-[#1a1a1a] p-5 rounded-xl text-white overflow-hidden">

 
  <div className="absolute -top-7 -right-7 w-22 h-22 bg-fuchsia-400 opacity-20 rounded-full"></div>

  <p className="text-sm text-gray-400">SUCCESS RATE</p>
  <h2 className="text-3xl font-bold mt-2">17%</h2>
  <p className="text-xs text-gray-500 mt-1">Offer / applied</p>

</div>
    </div>

  </div>
</div>
      
  )
}

export default App



 