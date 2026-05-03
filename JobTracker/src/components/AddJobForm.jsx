import toast from "react-hot-toast";
import { useState } from "react";
import { X } from "lucide-react";

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
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let newErrors = {};
    if (!form.company.trim()) newErrors.company = "Company is required";
    if (!form.role.trim()) newErrors.role = "Role is required";
    if (!form.salary.trim()) newErrors.salary = "Salary is required";
    if (!form.date) newErrors.date = "Date is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      await onAddJob({
        companyname: form.company,
        post: form.role,
        location: form.location,
        Date: form.date,
        Salary: form.salary,
        status: form.status,
      });

      toast.success("Application saved 🚀");
      setForm(initialForm);
      onClose();
    } catch (err) {
      toast.error("Failed to save");
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900/60 via-black/70 to-indigo-900/60 backdrop-blur-sm flex items-center justify-center z-50">

      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-xl text-white w-[90%] max-w-lg rounded-3xl p-8 shadow-2xl border border-white/20 transition-all duration-300"
      >
    
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold tracking-wide">
            Add Job 🚀
          </h2>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>

      
        <div className="mb-5">
          <label className="text-sm text-gray-300 mb-1 block">Company</label>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="Google, Amazon..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-200"
          />
          {errors.company && <p className="text-red-400">{errors.company}</p>}
        </div>

        <div className="mb-5">
          <label className="text-sm text-gray-300 mb-1 block">Role</label>
          <input
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder="Full Stack Developer"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-200"
          />
          {errors.role && <p className="text-red-400">{errors.role}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Location</label>
            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-400 transition-all"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Salary</label>
            <input
              name="salary"
              value={form.salary}
              onChange={handleChange}
              placeholder="20 LPA"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-200"
            />
            {errors.salary && <p className="text-red-400">{errors.salary}</p>}
          </div>
        </div>

      
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Applied Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-400"
            />
            {errors.date && <p className="text-red-400">{errors.date}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-400"
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
            className="px-4 py-2 text-gray-300 hover:text-white transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 transition-all duration-200"
          >
            Save Job
          </button>
        </div>
      </form>
    </div>
  );
}