import React from 'react'

const StepOne = () => {
  return (
    <div>
      <div class="min-h-screen flex items-center justify-center bg-[#1f1f1f] text-white">
  <div class="w-full max-w-xl bg-[#2a2a2a] border border-gray-600 rounded-2xl p-6">

  
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-2">
        <span class="w-3 h-3 bg-green-500 rounded-full"></span>
        <span class="w-3 h-3 bg-gray-500 rounded-full"></span>
      </div>
      <p class="text-sm text-gray-400">Step 1 of 2</p>
    </div>


    <h2 class="text-2xl font-semibold mb-1">
      Where are you applying?
    </h2>
    <p class="text-gray-400 mb-6">
      Enter the company and role details
    </p>

    
    <div class="mb-4">
      <label class="text-xs text-gray-400 mb-1 block">COMPANY NAME</label>
      <input 
        type="text" 
        placeholder="e.g. Stripe"
        class="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-2 outline-none placeholder-gray-500"
      />
    </div>

    <div class="mb-4">
      <label class="text-xs text-gray-400 mb-1 block">ROLE / POSITION</label>
      <input 
        type="text" 
        placeholder="e.g. Product Designer"
        class="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-2 outline-none placeholder-gray-500"
      />
    </div>

    
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div>
        <label class="text-xs text-gray-400 mb-1 block">LOCATION</label>
        <input 
          type="text" 
          placeholder="City or Remote"
          class="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-2 outline-none placeholder-gray-500"
        />
      </div>

      <div>
        <label class="text-xs text-gray-400 mb-1 block">SALARY</label>
        <input 
          type="text" 
          placeholder="$120,000"
          class="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-2 outline-none placeholder-gray-500"
        />
      </div>
    </div>

  
    <div class="flex justify-end border-t border-gray-600 pt-4">

      <button class="bg-green-500 px-6 py-2 rounded-lg text-white">
        Continue
      </button>
    </div>

  </div>
</div>
    </div>
  )
}

export default StepOne
