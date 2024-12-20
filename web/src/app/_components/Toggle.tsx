type ToggleProps = {
  id: number;
  isChecked: boolean;
  handleToggle: (taskId: number, isChecked: boolean) => void;
};

export const Toggle = ({ id, isChecked, handleToggle }: ToggleProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      className={`relative flex h-5 w-10 cursor-pointer rounded-full transition-colors ${
        isChecked ? 'bg-green-500' : 'bg-gray-300'
      }`}
      onClick={() => handleToggle(id, !isChecked)}
    >
      <span
        className={`absolute left-0.5 top-0.5 size-4 rounded-full 
          bg-white shadow-md transition-transform duration-200 ${isChecked ? 'translate-x-5' : 'translate-x-0'}
        `}
      ></span>
    </button>
  );
};
