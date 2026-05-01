import React from 'react'
import { Search, Plus } from 'lucide-react'

const Header = () => {
  return (
    <div className="h-[100px] border-b border-[#3f3f3f8d] flex justify-between bg-[#0f0f0f62]">
      <div className="p-4 text-[#fdfdfd]">
        <p className="text-2xl p-1 ml-2 font-bold">Applications</p>
        <p className="text-xs ml-3 text-[#9c9c9cd4]">
          6 total · 2 in interview · 1 offers
        </p>
      </div>

      <div className="p-7 flex gap-5">
        <div className="p-2 h-10 w-60 border border-[#d7d7d7a7] rounded-xl flex items-center gap-3 bg-[#2b2b2b5e]">
          <Search color="#cecece82" strokeWidth={1.5} size={18} />
          <input
            type="text"
            placeholder="Search company or role..."
            className="bg-transparent outline-none text-[#cecece82] placeholder:text-[#cecece82] w-full"
          />
        </div>

        <button className="h-10 w-28 rounded-xl flex items-center justify-center gap-1 text-white font-bold bg-gradient-to-r from-[#6D6AFD] to-[#A855F7]">
          <Plus size={20} strokeWidth={2} />
          Add job
        </button>
      </div>
    </div>
  )
}

export default Header