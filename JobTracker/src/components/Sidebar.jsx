import React from 'react'
import { Calendar, FileText, Kanban, ChartLine } from 'lucide-react'

const Sidebar = (props) => {
  return (
    <div className="w-[250px] border-r border-[#51515163] bg-[#0d1116] flex flex-col justify-between">
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
  )
}

export default Sidebar