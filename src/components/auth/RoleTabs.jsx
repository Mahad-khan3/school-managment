import { ShieldCheck, Users, GraduationCap } from 'lucide-react';

// The four selectable roles shown at the top of the login card.
const ROLES = [
  { key: 'Admin', label: 'Admin', icon: ShieldCheck },
  { key: 'Teacher', label: 'Teacher', icon: Users },
  { key: 'Student', label: 'Student', icon: GraduationCap },
  { key: 'Parent', label: 'Parent', icon: Users },
];

/**
 * Reusable pill-style role switcher.
 * @param {string} value - currently selected role key
 * @param {(role: string) => void} onChange - called with the new role key
 */
const RoleTabs = ({ value, onChange }) => {
  return (
    <div className="flex items-stretch gap-1 rounded-2xl bg-[#f5f3ff] p-1.5">
      {ROLES.map(({ key, label, icon: Icon }) => {
        const isActive = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={isActive}
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2.5 text-[11px] font-semibold leading-none transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white shadow-md shadow-purple-500/40'
                : 'text-gray-500 hover:bg-white/70 hover:text-[#7c3aed]'
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={2.2} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RoleTabs;
