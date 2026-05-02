import React from 'react'

const StatsSection = (props) => {
  return (
<>
      <div className="relative bg-[#1a1a1a] p-5 rounded-xl text-white overflow-hidden transition-transform duration-200 hover:scale-105">
        <div className="absolute -top-7 -right-7 w-22 h-22 bg-indigo-400 opacity-20 rounded-full"></div>
        <p className="text-sm text-gray-400">TOTAL APPLIED</p>
        <h2 className="text-3xl font-bold mt-2">{props.Nocard}</h2>
        <p className="text-xs text-gray-500 mt-1">All time</p>
      </div>

      <div className="relative bg-[#1a1a1a] p-5 rounded-xl text-white overflow-hidden transition-transform duration-200 hover:scale-105">
        <div className="absolute -top-7 -right-7 w-22 h-22 bg-orange-400 opacity-20 rounded-full"></div>
        <p className="text-sm text-gray-400">INTERVIEWS</p>
        <h2 className="text-3xl font-bold mt-2">{props.interview}</h2>
        <p className="text-xs text-gray-500 mt-1">Active Pipeline</p>
      </div>

      <div className="relative bg-[#1a1a1a] p-5 rounded-xl text-white overflow-hidden transition-transform duration-200 hover:scale-105">
        <div className="absolute -top-7 -right-7 w-22 h-22 bg-green-400 opacity-20 rounded-full"></div>
        <p className="text-sm text-gray-400">OFFERS</p>
        <h2 className="text-3xl font-bold mt-2">{props.Offer}</h2>
        <p className="text-xs text-gray-500 mt-1">In hand</p>
      </div>

      <div className="relative bg-[#1a1a1a] p-5 rounded-xl text-white overflow-hidden transition-transform duration-200 hover:scale-105">
        <div className="absolute -top-7 -right-7 w-22 h-22 bg-fuchsia-400 opacity-20 rounded-full"></div>
        <p className="text-sm text-gray-400">SUCCESS RATE</p>
        <h2 className="text-3xl font-bold mt-2">{props.successRate}%</h2>
        <p className="text-xs text-gray-500 mt-1">Offer / applied</p>
      </div>
    </>
  )
}

export default StatsSection