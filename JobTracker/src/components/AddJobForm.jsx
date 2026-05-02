import { useState } from "react";
import {X} from 'lucide-react'
export default function AddJobModal({ onClose, onAddJob }) {

  const initialForm = {
    company: "",
    role: "",
    location: "remote",
    salary: "",
    date: "",
    status: "Applied",
  };

  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    onAddJob({
      companyname: form.company,
      post: form.role,
      location: form.location,
      Date: form.date,
      Salary: form.salary,
      status: form.status,
    });

    setForm(initialForm); 
    onClose(); 
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-0 flex items-center justify-center">
 
     
      <form 
        onSubmit={handleSubmit}
        className="bg-[#1c1f2e] text-white w-[520px] rounded-2xl p-6 shadow-xl relative"
      >
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add new job</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X color="#fff" strokeWidth={1.25} />
          </button>
        </div>

        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block uppercase">
            Company
          </label>
          <input
            name="company"
            autoComplete="off"
            placeholder="e.g.Google"
            value={form.company}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-[#111827] outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block uppercase">
            Role
          </label>
          <input
            name="role"
            autoComplete="off"
            placeholder="Frontend Engineer"
            value={form.role}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-[#111827] outline-none"
          />
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex flex-col w-1/2">
            <label className="text-xs text-gray-400 mb-1 uppercase">
              Location
            </label>
            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-[#111827]"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>

          <div className="flex flex-col w-1/2">
            <label className="text-xs text-gray-400 mb-1 uppercase">
              Salary
            </label>
            <input
              name="salary"
              placeholder="e.g.12Lpa"
              value={form.salary}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-[#111827] outline-none"
            />
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex flex-col w-1/2">
            <label className="text-xs text-gray-400 mb-1 uppercase">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-[#111827]"
            />
          </div>

          <div className="flex flex-col w-1/2">
            <label className="text-xs text-gray-400 mb-1 uppercase">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-[#111827]"
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </button>

          <button 
            type="submit"
            className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600"
          >
            Save
          </button>
        </div>

      </form>
    </div>
  );
}