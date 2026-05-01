import React from 'react'
import {CalendarDays} from 'lucide-react'

const StepTwo = () => {
  return (
    <div>
      <div class="min-h-screen flex items-center justify-center bg-[#1f1f1f] text-white">
  <div class="w-full max-w-xl bg-[#2a2a2a] rounded-2xl border border-gray-600 p-6">

  
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-2">
        <span class="w-3 h-3 bg-green-400 rounded-full"></span>
        <span class="w-3 h-3 bg-green-500 rounded-full"></span>
      </div>
      <p class="text-sm text-gray-400">Step 2 of 2</p>
    </div>


    <h2 class="text-xl font-semibold">Status & timeline</h2>
    <p class="text-sm text-gray-400 mb-6">
      Set the current status and date
    </p>

    <div class="mb-6">
      <p class="text-xs text-gray-400 mb-2">APPLICATION STATUS</p>
      <div class="flex flex-wrap gap-2">
        <button class="bg-green-500 text-white px-4 py-1.5 rounded-full">
          Applied
        </button>
        <button class="border border-gray-500 px-4 py-1.5 rounded-full">
          Screening
        </button>
        <button class="border border-gray-500 px-4 py-1.5 rounded-full">
          Interview
        </button>
        <button class="border border-gray-500 px-4 py-1.5 rounded-full">
          Offer
        </button>
        <button class="border border-gray-500 px-4 py-1.5 rounded-full">
          Rejected
        </button>
      </div>
    </div>


    <div class="mb-6">
      <p class="text-xs text-gray-400 mb-2">DATE APPLIED</p>
      <div class="flex items-center border border-gray-600 rounded-lg px-3 py-2">
        <input
          type="text"
          placeholder='mm-dd-yyyy'
          class="bg-transparent outline-none w-full text-gray-200"
        />
        <span class="text-gray-400"><CalendarDays strokeWidth={1.5} /></span>
      </div>
    </div>


    <div class="mb-6">
      <p class="text-xs text-gray-400 mb-2">NOTES (OPTIONAL)</p>
      <textarea
        placeholder="Recruiter name, referral, job URL..."
        class="w-full bg-transparent border border-gray-600 rounded-lg px-3 py-2 h-24 outline-none resize-none text-gray-200 placeholder-gray-500"
      ></textarea>
    </div>

  
    <div class="flex justify-between items-center border-t border-gray-600 pt-4">
      <button class="border border-gray-500 px-4 py-2 rounded-lg text-gray-300">
        Back
      </button>

      <button class="bg-green-500 px-6 py-2 rounded-lg text-white">
        Continue
      </button>
    </div>

  </div>
</div>
    </div>
  )
}

export default StepTwo
