interface ExperimentListProps {
  ids: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
}

export default function ExperimentList({
  ids,
  selected,
  onSelectionChange,
}: ExperimentListProps) {
  const handleCheckboxChange = (id: string) => {
    const newSelection = selected.includes(id)
      ? selected.filter((expId) => expId !== id)
      : [...selected, id];
    onSelectionChange(newSelection);
  };

  if (ids.length === 0) return <p>Upload a file to see experiments.</p>;

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h2 className="font-bold mb-2 text-center">
        <span
          className="
    bg-gradient-to-r from-fuchsia-500 to-purple-600 
    bg-clip-text text-transparent
  "
        >
          Experiments
        </span>
      </h2>
      <ul>
        {ids.map((id) => (
          <li key={id}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.includes(id)}
                onChange={() => handleCheckboxChange(id)}
              />
              <span
                className="
    bg-gradient-to-r from-fuchsia-500 to-purple-600 
    bg-clip-text text-transparent
  "
              >
                {id}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
