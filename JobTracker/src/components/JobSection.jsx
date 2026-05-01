import { IndianRupee, MapPin, CalendarDays } from 'lucide-react'

const JobSection = (props) => {
  return (
    <div className='flex flex-wrap gap-5'>

      {props.JobCard.map((job, index) => (
        <div
          key={index}
          className="bg-[#0f131a] border border-[#2a2f3a] rounded-2xl p-5 w-[470px] text-white flex flex-col justify-between"
        >
          <div className="flex justify-between">
            <div className="flex gap-4">
              
              <div className="h-12 w-12 rounded-xl bg-[#1c2330] flex items-center justify-center font-bold">
                {job.logo}
              </div>

              <div>
                <h2 className="text-lg font-semibold">{job.companyname}</h2>
                <p className="text-sm text-gray-400">{job.post}</p>

                <div className="flex gap-1 mt-2 text-xs text-gray-500">
                  <MapPin size={17} />
                  <span>{job.location}</span>

                  <CalendarDays size={17} />
                  <span>{job.Date}</span>

                  <IndianRupee size={17} />
                  <span>{job.Salary}K</span>
                </div>
              </div>
            </div>

            <span className="px-3 py-1 h-fit rounded-full text-xs bg-yellow-500/20 text-yellow-400">
              {job.status}
            </span>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button className="px-4 py-1.5 rounded-lg bg-[#2a2f3a] text-sm">
              Edit
            </button>
            <button className="px-4 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm">
              Remove
            </button>
          </div>
        </div>
      ))}

    </div>
  )
}

export default JobSection