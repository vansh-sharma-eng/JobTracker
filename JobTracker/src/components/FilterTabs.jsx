import React from 'react'

const FilterTabs = (props) => {
  return (
    <div>
      <div className="flex gap-3 p-5 ml-2 -mt-6 text-[13px]">

  <div className='text-[#ffff] px-3 py-1 text-center bg-[#55547c76] border border-[#8763ffc8] rounded-2xl'>
    ALL({props.Nocard})
  </div>

  <div className='text-[#ffff] px-3 py-1 text-center bg-[#55547c76] border border-[#8763ffc8] rounded-2xl'>
    Applied({props.Applied})
  </div>

  <div className='text-[#ffff] px-3 py-1 text-center bg-[#55547c76] border border-[#8763ffc8] rounded-2xl'>
    Interview({props.interview})
  </div>

  <div className='text-[#ffff] px-3 py-1 text-center bg-[#55547c76] border border-[#8763ffc8] rounded-2xl'>
    Offer({props.Offer})
  </div>

  <div className='text-[#ffff] px-3 py-1 text-center bg-[#55547c76] border border-[#8763ffc8] rounded-2xl'>
    Rejected({props.Rejected})
  </div>

</div>
    </div>
  )
}

export default FilterTabs
