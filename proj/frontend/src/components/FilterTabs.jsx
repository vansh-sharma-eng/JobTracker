const TABS = [
  { key: null, label: "All" },
  { key: "SAVED", label: "Saved" },
  { key: "APPLIED", label: "Applied" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "OFFER", label: "Offer" },
  { key: "REJECTED", label: "Rejected" },
];

const FilterTabs = ({ counts = {}, activeStatus, onSelect }) => {
  const countFor = (key) => (key === null ? counts.total ?? 0 : counts[key] ?? 0);
  return (
    <div className="seg" role="tablist" aria-label="Filter by status">
      {TABS.map((tab) => (
        <button
          key={tab.label}
          role="tab"
          aria-selected={activeStatus === tab.key}
          onClick={() => onSelect(tab.key)}
        >
          {tab.label} <span className="count">{countFor(tab.key)}</span>
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
