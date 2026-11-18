/**
 * Reusable input field with a leading icon, optional trailing element
 * (e.g. password visibility toggle) and an inline error message.
 */
const InputField = ({ icon: Icon, error, rightElement, className = '', ...inputProps }) => {
  return (
    <div className="w-full">
      <div
        className={`relative flex h-12 items-center rounded-xl border bg-white transition-all duration-200 focus-within:border-[#7c3aed] focus-within:ring-2 focus-within:ring-purple-500/20 ${
          error ? 'border-red-400' : 'border-[#ddd6fe]'
        }`}
      >
        {Icon && (
          <Icon className="pointer-events-none absolute left-4 h-5 w-5 text-[#a78bfa]" strokeWidth={2} />
        )}
        <input
          {...inputProps}
          className={`h-full w-full rounded-xl bg-transparent pl-12 pr-12 text-sm font-medium text-[#1e1b4b] outline-none placeholder:font-normal placeholder:text-gray-400 ${className}`}
        />
        {rightElement && <div className="absolute right-2 flex items-center">{rightElement}</div>}
      </div>
      {error && <p className="mt-1.5 pl-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

export default InputField;
