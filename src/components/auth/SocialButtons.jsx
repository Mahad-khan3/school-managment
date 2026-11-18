import { Globe } from 'lucide-react';

// Brand icons are inlined so no external icon dependency is required.
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.91 2.38 30.47 0 24 0 14.62 0 6.99 8.38 4.15 20.08l7.95 6.16C17.15 17.67 20.13 9.5 24 9.5z" />
    <path fill="#EA4335" d="M46.98 24.55c0-1.57-.15-3.09-.45-4.55H24v9.13h12.84c-.58 3.02-2.25 5.58-4.79 7.33l7.37 5.74C43.43 37.09 46.98 31.4 46.98 24.55z" />
    <path fill="#FBBC05" d="M10.61 29.09C9.2 24.72 9.2 19.92 10.61 15.55l-7.95-6.16C-.4 17.43 0 22.36 0 24c0 1.64.4 3.57 1.66 5.33l7.95-6.16z" />
    <path fill="#34A853" d="M24 48c6.12 0 11.29-2.02 15.17-5.49l-7.37-5.74c-2.02 1.35-4.59 2.15-7.8 2.15-7.43 0-13.72-4.98-15.96-11.68l-8.31 6.44C7.98 43.98 15.57 48 24 48z" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 23 23" aria-hidden="true">
    <path fill="#f35325" d="M1 1h10v10H1z" />
    <path fill="#81bc06" d="M12 1h10v10H12z" />
    <path fill="#05a6f0" d="M1 12h10v10H1z" />
    <path fill="#ffba08" d="M12 12h10v10H12z" />
  </svg>
);

const SOCIALS = [
  { name: 'Google', Icon: GoogleIcon },
  { name: 'Microsoft', Icon: MicrosoftIcon },
  { name: 'Globe', Icon: () => <Globe className="h-5 w-5 text-[#7c3aed]" strokeWidth={2} /> },
];

/**
 * Row of social sign-in buttons.
 * @param {(provider: string) => void} onSelect - called with the provider name
 */
const SocialButtons = ({ onSelect }) => {
  return (
    <div className="flex items-center justify-center gap-3">
      {SOCIALS.map(({ name, Icon }) => (
        <button
          key={name}
          type="button"
          onClick={() => onSelect?.(name)}
          aria-label={`Continue with ${name}`}
          className="flex h-11 w-14 items-center justify-center rounded-full border border-[#ddd6fe] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c4b5fd] hover:shadow-md hover:shadow-purple-500/20"
        >
          <Icon />
        </button>
      ))}
    </div>
  );
};

export default SocialButtons;
