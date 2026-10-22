import { Send, Users, Trophy, Percent } from "lucide-react";

const StatsSection = ({ Nocard, interview, Offer, successRate, loading }) => {
  const items = [
    { label: "Total applied", value: Nocard, hint: "All time", icon: Send },
    { label: "Interviews", value: interview, hint: "Active pipeline", icon: Users },
    { label: "Offers", value: Offer, hint: "In hand", icon: Trophy, tone: "var(--success)" },
    { label: "Success rate", value: `${successRate}%`, hint: "Offers / applied", icon: Percent },
  ];
  return (
    <>
      {items.map(({ label, value, hint, icon: Icon, tone }) => (
        <div key={label} className="card card-hover p-5">
          <Icon size={16} style={{ color: "var(--text-2)" }} aria-hidden="true" />
          <p className="text-[13px] mt-3" style={{ color: "var(--text-2)" }}>{label}</p>
          {loading ? (
            <div className="skeleton h-8 w-16 mt-1" />
          ) : (
            <p className="text-[28px] font-semibold leading-tight mt-1" style={{ color: tone }}>{value}</p>
          )}
          <p className="caption mt-1">{hint}</p>
        </div>
      ))}
    </>
  );
};

export default StatsSection;
