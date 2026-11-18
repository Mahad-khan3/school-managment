import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

import useScrollReveal from '../hooks/useScrollReveal';

const LandingPage = () => {
  const navigate = useNavigate();
  const scrollRef = useScrollReveal();
  const { isDark, toggleTheme } = useTheme();
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [typedText, setTypedText] = useState('');
  const fullText = "School management made easy — automate everything with SchoolCRM";
  const [contactForm, setContactForm] = useState({ schoolName: '', issueDescription: '' });
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 300 && currentY < lastScrollY) {
        setShowWhatsApp(true);
      } else {
        setShowWhatsApp(false);
      }
      setLastScrollY(currentY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const announcements = [
    "3 Days Free Trial",
    "Complete School CRM",
    "Student Management",
    "Teacher Management",
    "Fee Management",
    "Easy to Use",
    "Stress-Free School Administration"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnnouncement(prev => (prev + 1) % announcements.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let i = 0;
    let timeoutId;
    let innerInterval;
    const typingInterval = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(typingInterval);
        timeoutId = setTimeout(() => {
          i = 0;
          setTypedText('');
          innerInterval = setInterval(() => {
            if (i <= fullText.length) {
              setTypedText(fullText.slice(0, i));
              i++;
            } else {
              clearInterval(innerInterval);
            }
          }, 50);
        }, 3000);
      }
    }, 50);
    return () => { clearInterval(typingInterval); clearTimeout(timeoutId); clearInterval(innerInterval); };
  }, []);


  const reviews = [
    { name: "Ahmed Ali", school: "The City School", text: "This portal made our fee management 10x easier! Highly recommend!" },
    { name: "Sarah Khan", school: "Beaconhouse", text: "Finally a CRM that understands school needs. Perfect!" },
    { name: "Imran Qureshi", school: "Fazaia School", text: "Student management has never been this simple!" },
    { name: "Ayesha Rafiq", school: "Roots Millennium", text: "The fee receipt generation saves us hours every month!" },
    { name: "Hassan Ahmed", school: "LGS", text: "Complete solution for all school needs. 5 stars!" },
    { name: "Fatima Hassan", school: "City School", text: "Easy to use, great support, and saves so much time!" }
  ];

  const faqs = [
    { q: "Is the 3-day trial really free?", a: "Yes! You get complete access to all features for 3 days without any charges or credit card required." },
    { q: "Can I manage multiple classes?", a: "Absolutely! You can manage all classes from Nursery to Class 10, with sections A, B, C, and D." },
    { q: "How does fee management work?", a: "It's automatic! You can record payments, generate receipts, track pending dues, and everything is saved permanently." },
    { q: "Is my data secure?", a: "100%! All data is encrypted, stored securely, and each school's data is completely isolated from others." }
  ];

  const [counts, setCounts] = useState({ schools: 0, students: 0, teachers: 0, receipts: 0 });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.schoolName || !contactForm.issueDescription) {
      alert('Please fill in all fields');
      return;
    }
    const message = `*New Contact Form Submission*\n\n*School Name:* ${contactForm.schoolName}\n*Issue:* ${contactForm.issueDescription}`;
    const whatsappUrl = `https://wa.me/923042582657?text=${encodeURIComponent(message)}`;
    setContactForm({ schoolName: '', issueDescription: '' });
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    const animateCount = (target, duration, setter) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };
    animateCount(150, 2000, (v) => setCounts(p => ({ ...p, schools: v })));
    animateCount(5000, 2000, (v) => setCounts(p => ({ ...p, students: v })));
    animateCount(200, 2000, (v) => setCounts(p => ({ ...p, teachers: v })));
    animateCount(15000, 2000, (v) => setCounts(p => ({ ...p, receipts: v })));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]" ref={scrollRef}>
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile hamburger - left */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[var(--text-primary)] p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop nav buttons */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => navigate('/about-us')}
                className="text-[var(--text-primary)] hover:text-[var(--accent)] transition font-medium"
              >
                About Us
              </button>
              <button
                className="text-[var(--text-primary)] hover:text-[var(--accent)] transition font-medium"
                onClick={() => navigate('/login')}
              >
                System Portal
              </button>
            </div>

            {/* Center Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:flex-1 md:flex md:justify-center">
              <div className="flex items-center gap-2">
                <div className="w-32 h-16 md:w-52 md:h-24">
                  <img src="/logo.png" alt="SchoolCRM Logo" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            {/* Login button */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-[var(--text-primary)] hover:text-[var(--accent)] transition"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--text-primary)] px-6 py-2 rounded-full font-semibold hover:opacity-90 transition"
              >
                Login
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-[var(--border-primary)] space-y-2">
              <button
                onClick={() => { navigate('/about-us'); setMobileMenuOpen(false); }}
                className="block w-full text-left text-[var(--text-primary)] hover:text-[var(--accent)] transition font-medium py-2"
              >
                About Us
              </button>
              <button
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                className="block w-full text-left text-[var(--text-primary)] hover:text-[var(--accent)] transition font-medium py-2"
              >
                System Portal
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Announcement Slider */}
      <div className="bg-[var(--bg-primary)] py-3 overflow-clip">
        <div className="whitespace-nowrap animate-scroll">
          {[...announcements, ...announcements].map((text, i) => (
            <span key={i} className="inline-block px-8 text-[var(--text-muted)] font-semibold text-sm md:text-base">
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="animated-bg py-16 md:py-24 px-6 md:px-4 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <p className="text-2xl md:text-6xl font-bold text-[var(--accent)] whitespace-nowrap">
            {typedText}
            <span className="animate-pulse">|</span>
          </p>
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="scroll-hidden-scale text-3xl sm:text-4xl md:text-7xl font-bold text-[var(--text-primary)] mb-4 md:mb-6 leading-tight">
            Stop Wasting Time on <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)]">Manual School Management</span>.
          </h1>
          <p className="scroll-hidden text-base sm:text-xl md:text-2xl text-[var(--text-secondary)] mb-8 md:mb-10 max-w-3xl mx-auto">
            Automate Admissions, Attendance, Fees & More — All in One Portal.
          </p>
          <div className="scroll-hidden flex gap-4 justify-center delay-200">
            <button
              onClick={() => navigate('/login')}
              className="ripple-btn bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--text-primary)] px-8 md:px-10 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:scale-105 transition-transform shadow-lg shadow-[var(--accent)]/40"
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* What you get instantly - horizontal boxes */}
      <section className="py-12 md:py-16 px-6 md:px-4 bg-[var(--bg-card)]">
        <div className="max-w-6xl mx-auto">
          <h3 className="scroll-hidden text-xl md:text-2xl font-bold text-center text-[var(--text-primary)] mb-2">What you get instantly</h3>
          <h2 className="scroll-hidden text-2xl md:text-4xl font-bold text-center text-[var(--text-primary)] mb-8 md:mb-12 delay-100">Three things, generated in 60 seconds.</h2>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="scroll-hidden delay-100 flex-1 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 text-center card-hover flex items-center gap-4 md:flex-col md:text-center">
              <div className="w-14 h-14 flex-shrink-0 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center animate-float">
                <svg className="w-7 h-7 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/></svg>
              </div>
              <div className="text-left md:text-center">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Student Data</h3>
                <p className="text-[var(--text-secondary)] text-sm">Enter and access student records in one click.</p>
              </div>
            </div>
            <div className="scroll-hidden delay-200 flex-1 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 text-center card-hover flex items-center gap-4 md:flex-col md:text-center">
              <div className="w-14 h-14 flex-shrink-0 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center animate-float" style={{animationDelay: '0.5s'}}>
                <svg className="w-7 h-7 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2m8-10a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              </div>
              <div className="text-left md:text-center">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Teacher Data</h3>
                <p className="text-[var(--text-secondary)] text-sm">Manage teacher information with one click.</p>
              </div>
            </div>
            <div className="scroll-hidden delay-300 flex-1 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 text-center card-hover flex items-center gap-4 md:flex-col md:text-center">
              <div className="w-14 h-14 flex-shrink-0 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
                <svg className="w-7 h-7 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <div className="text-left md:text-center">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Fee Slips</h3>
                <p className="text-[var(--text-secondary)] text-sm">Generate, download, and print fee slips instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[var(--border-primary)]" />

      {/* How It Works */}
      <section className="py-12 md:py-16 px-6 md:px-4 bg-[var(--bg-card)]/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="scroll-hidden text-base md:text-lg font-semibold text-center text-[var(--accent)] mb-2">How it works</h3>
          <h2 className="scroll-hidden text-2xl md:text-4xl font-bold text-center text-[var(--text-primary)] mb-8 md:mb-12 delay-100">Three simple steps. Your school goes digital in minutes.</h2>

          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="scroll-hidden-left delay-100 flex-1 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 card-hover flex items-center gap-4 md:flex-col md:text-center">
              <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] rounded-full flex items-center justify-center animate-glow-pulse">
                <svg className="w-6 h-6 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              </div>
              <div className="text-left md:text-center">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">1. Create Your School Account</h3>
                <p className="text-[var(--text-secondary)] text-sm">Sign up in seconds and set up your school profile with your school logo and basic details.</p>
              </div>
            </div>
            <div className="scroll-hidden delay-200 flex-1 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 card-hover flex items-center gap-4 md:flex-col md:text-center">
              <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] rounded-full flex items-center justify-center animate-glow-pulse" style={{animationDelay: '1s'}}>
                <svg className="w-6 h-6 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>
              </div>
              <div className="text-left md:text-center">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">2. Access Your Smart Dashboard</h3>
                <p className="text-[var(--text-secondary)] text-sm">Manage students, teachers, classes, attendance, and fee records from one powerful dashboard.</p>
              </div>
            </div>
            <div className="scroll-hidden-right delay-300 flex-1 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 card-hover flex items-center gap-4 md:flex-col md:text-center">
              <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] rounded-full flex items-center justify-center animate-glow-pulse" style={{animationDelay: '2s'}}>
                <svg className="w-6 h-6 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div className="text-left md:text-center">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">3. Start Managing Your School</h3>
                <p className="text-[var(--text-secondary)] text-sm">Generate fee slips, organize student records, and eliminate hours of manual paperwork with just a few clicks.</p>
              </div>
            </div>
          </div>

          <div className="scroll-hidden text-center">
            <p className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-6">Stop wasting time on manual records.</p>
            <p className="text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto text-sm md:text-base">
              Digitize your school, save valuable time, and manage everything from one secure platform.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="ripple-btn bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--text-primary)] px-8 md:px-10 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:scale-105 transition-transform mb-4"
            >
              Build My School Account
            </button>
            <p className="text-[var(--text-secondary)] font-medium text-sm md:text-base">Free to Sign Up</p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[var(--border-primary)]" />

      {/* Animated Banner */}
      <section className="py-12 md:py-16 px-6 md:px-4 animated-bg">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="scroll-hidden-scale text-xl sm:text-2xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            This would normally take 3-5 hours. You just did it in 60 seconds.
          </h2>
        </div>
      </section>

      {/* Counter Section */}
      <section className="py-12 md:py-16 px-6 md:px-4 bg-[var(--bg-card)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <div className="scroll-hidden delay-100">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] bg-clip-text text-transparent mb-2">
                {counts.schools}+
              </h3>
              <p className="text-[var(--text-secondary)] text-sm md:text-lg">Total Schools</p>
            </div>
            <div className="scroll-hidden delay-200">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] bg-clip-text text-transparent mb-2">
                {counts.students}+
              </h3>
              <p className="text-[var(--text-secondary)] text-sm md:text-lg">Students</p>
            </div>
            <div className="scroll-hidden delay-300">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] bg-clip-text text-transparent mb-2">
                {counts.teachers}+
              </h3>
              <p className="text-[var(--text-secondary)] text-sm md:text-lg">Teachers</p>
            </div>
            <div className="scroll-hidden delay-400">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] bg-clip-text text-transparent mb-2">
                {counts.receipts}+
              </h3>
              <p className="text-[var(--text-secondary)] text-sm md:text-lg">Fee Receipts Generated</p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[var(--border-primary)]" />

      {/* Reviews Section */}
      <section className="py-12 md:py-16 px-6 md:px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="scroll-hidden text-2xl md:text-3xl font-bold text-center text-[var(--text-primary)] mb-8 md:mb-12">What Schools Are Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {reviews.map((r, i) => (
              <div key={i} className={`scroll-hidden delay-${(i + 1) * 100} bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 card-hover`}>
                <div className="text-[var(--warning-text)] text-2xl mb-3">★★★★★</div>
                <p className="text-[var(--text-primary)] mb-4 italic">"{r.text}"</p>
                <p className="text-[var(--text-primary)] font-semibold">{r.name}</p>
                <p className="text-[var(--text-secondary)] text-sm">{r.school}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[var(--border-primary)]" />

      {/* Pricing Section */}
      <section className="py-12 md:py-16 px-6 md:px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="scroll-hidden text-2xl md:text-4xl font-bold text-center text-[var(--text-primary)] mb-8 md:mb-12">Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

            {/* Basic Plan */}
            <div className="scroll-hidden-left delay-100 bg-[var(--bg-card)] border-2 border-[var(--border-primary)] rounded-3xl overflow-hidden card-hover">
              <div className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mb-2">Basic Plan</h3>
                <div className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-1">
                  6,000 PKR
                </div>
                <p className="text-[var(--text-muted)] mb-6 text-sm md:text-base">/ month</p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Free Initial Guidance',
                    'limited students',
                    'Student Admission Setup',
                    'Teacher Management',
                    'Fee Management System',
                    'Fee Receipt Download',
                    'Reports & Analytics'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-[var(--text-secondary)]">
                      <svg className="w-5 h-5 text-[var(--success-text)] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--text-primary)] font-semibold py-3 px-6 rounded-xl transition-all hover:opacity-90"
                >
                  Start Free Trial
                </button>
              </div>
            </div>

            {/* Advanced Plan - Most Popular */}
            <div className="scroll-hidden-scale delay-200 bg-[var(--bg-card)] border-2 border-[var(--accent)] rounded-3xl overflow-hidden card-hover shadow-xl shadow-[var(--accent)]/20">
              <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] px-6 md:px-8 py-3 md:py-4 text-center">
                <span className="text-[var(--text-primary)] font-semibold text-xs md:text-sm uppercase tracking-wider">Most Popular</span>
              </div>
              <div className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mb-2">Advanced Plan</h3>
                <div className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-1">
                  30,000 PKR
                </div>
                <p className="text-[var(--text-muted)] mb-6 text-sm md:text-base">/ 6 months</p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Everything in Basic',
                    ' Up to 800 Students',
                    'Supports Up to 3000 Students',
                    'Complete Fee Structure Setup',
                    'Student Data Entry Assistance',
                    'Priority Technical Support',
                    'Custom School Branding',
                    'Advanced Reports & Analytics',
                    'Data Export (Excel / PDF)',
                    'Fast Issue Resolution',
                    'Regular System Updates',
                    'WhatsApp & Call Support'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-[var(--text-secondary)]">
                      <svg className="w-5 h-5 text-[var(--success-text)] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--text-primary)] font-semibold py-3 px-6 rounded-xl transition-all hover:opacity-90"
                >
                  Start Free Trial
                </button>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="scroll-hidden-right delay-300 bg-[var(--bg-card)] border-2 border-[var(--border-primary)] rounded-3xl overflow-hidden card-hover">
              <div className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mb-2">Premium Plan</h3>
                <div className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-1">
                  68,000 PKR
                </div>
                <p className="text-[var(--text-muted)] mb-6 text-sm md:text-base">/ year</p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Everything in Advanced',
                    'Unlimited Student Capacity',
                    'Lifetime Technical Support',
                    'No Hidden Charges',
                    'Fast Data Processing',
                    'Premium Dashboard Experience',
                    'Luxury Modern UI',
                    'Dedicated Account Manager',
                    'API Access',
                    'Custom Features on Request',
                    'Daily Backup & Security',
                    'Advanced Reports & Insights',
                    'Custom School Branding',
                    'High Priority Support',
                    'Free Future Improvements (Minor Updates)',
                    'Performance Optimization',
                    'Data Import & Migration',
                    'Staff Training Session',
                    '99.9% System Availability'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-[var(--text-secondary)]">
                      <svg className="w-5 h-5 text-[var(--success-text)] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--text-primary)] font-semibold py-3 px-6 rounded-xl transition-all hover:opacity-90"
                >
                  Start Free Trial
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[var(--border-primary)]" />

      {/* FAQ Section */}
      <section className="py-12 md:py-16 px-6 md:px-4 bg-[var(--bg-card)]/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="scroll-hidden text-2xl md:text-3xl font-bold text-center text-[var(--text-primary)] mb-8 md:mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className={`scroll-hidden delay-${(i + 1) * 100} bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-hidden`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between text-left hover:bg-[var(--border-primary)]/50 transition-all duration-300"
                >
                  <span className="text-[var(--text-primary)] font-semibold text-sm md:text-base">{faq.q}</span>
                  <span className={`text-[var(--accent)] text-xl md:text-2xl transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-4 md:px-6 pb-4 text-[var(--text-secondary)] text-sm md:text-base">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[var(--border-primary)]" />

      {/* Contact Section */}
      <section className="py-12 md:py-16 px-6 md:px-4">
        <div className="max-w-2xl mx-auto">
          <div className="scroll-hidden text-center mb-6 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">Need Help?</h2>
            <p className="text-[var(--text-secondary)] text-base md:text-lg">
              If you have difficulty entering your school data, don't worry.<br className="hidden sm:block"/>
              Our team will assist you with the complete setup.<br className="hidden sm:block"/>
              Don't feel shy—contact us.
            </p>
          </div>

          <div className="scroll-hidden-scale bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl p-6 md:p-8 animate-glow-pulse">
            <form className="space-y-6" onSubmit={handleContactSubmit}>
              <div>
                <label className="block text-[var(--text-primary)] mb-2">School Name</label>
                <input
                  type="text"
                  value={contactForm.schoolName}
                  onChange={(e) => setContactForm(p => ({ ...p, schoolName: e.target.value }))}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="Your school name"
                  required
                />
              </div>
              <div>
                <label className="block text-[var(--text-primary)] mb-2">Issue Description</label>
                <textarea
                  rows="5"
                  value={contactForm.issueDescription}
                  onChange={(e) => setContactForm(p => ({ ...p, issueDescription: e.target.value }))}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none resize-none"
                  placeholder="Describe your issue..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full ripple-btn bg-gradient-to-r from-[#25d366] to-[#128c7e] text-[var(--text-primary)] py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
              >
                Send on WhatsApp
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[var(--border-primary)]" />

      {/* Why Choose Us Section */}
      <section className="py-12 md:py-16 px-6 md:px-4 bg-[var(--bg-card)]/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="scroll-hidden text-2xl md:text-4xl font-bold text-center text-[var(--text-primary)] mb-8 md:mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { title: 'Easy to Use', desc: 'Simple interface designed for school staff with zero technical experience.',
                icon: <svg className="w-10 h-10 text-[var(--accent)] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> },
              { title: 'Secure Data', desc: 'Your school data is encrypted and stored securely with complete isolation.',
                icon: <svg className="w-10 h-10 text-[var(--accent)] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> },
              { title: 'Fast Support', desc: 'Our team responds quickly to help you with any issue anytime.',
                icon: <svg className="w-10 h-10 text-[var(--accent)] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> },
              { title: 'Mobile Friendly', desc: 'Access your school dashboard from any device, anywhere.',
                icon: <svg className="w-10 h-10 text-[var(--accent)] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg> },
              { title: 'Affordable Pricing', desc: 'Budget-friendly plans designed for schools of all sizes.',
                icon: <svg className="w-10 h-10 text-[var(--accent)] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
              { title: 'Cloud Based', desc: 'No installation needed. Everything runs on the cloud securely.',
                icon: <svg className="w-10 h-10 text-[var(--accent)] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg> }
            ].map((item, i) => (
              <div key={i} className={`scroll-hidden delay-${Math.min((i + 1) * 100, 600)} bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 text-center card-hover`}>
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[var(--border-primary)]" />

      {/* Included With Every School */}
      <section className="py-12 md:py-16 px-6 md:px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="scroll-hidden text-2xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">Included With Every School</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-10">
            {[
              { title: 'Quick Issue Resolution', icon: <svg className="w-10 h-10 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> },
              { title: 'Lifetime Customer Support', icon: <svg className="w-10 h-10 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg> },
              { title: 'Dedicated User Guidance', icon: <svg className="w-10 h-10 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg> },
              { title: 'Free Live Demo Session', icon: <svg className="w-10 h-10 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg> },
              { title: 'Continuous Software Updates', icon: <svg className="w-10 h-10 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> },
              { title: 'WhatsApp & Call Assistance', icon: <svg className="w-10 h-10 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg> }
            ].map((item, i) => (
              <div key={i} className={`scroll-hidden delay-${Math.min((i + 1) * 100, 600)} bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 card-hover`}>
                <div className="mb-4 flex justify-center">
                  <div className="animate-float" style={{animationDelay: `${i * 0.3}s`}}>
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{item.title}</h3>
              </div>
            ))}
          </div>
          <div className="scroll-hidden mt-8 md:mt-10 flex flex-wrap justify-center gap-2 md:gap-3">
            <span className="px-3 md:px-5 py-1.5 md:py-2 rounded-full border border-[var(--success-border)] text-[var(--success-text)] font-semibold text-xs md:text-sm bg-[var(--success-bg)]">No Hidden Charges</span>
            <span className="px-3 md:px-5 py-1.5 md:py-2 rounded-full border border-[var(--border-primary)] text-[var(--text-secondary)] font-semibold text-xs md:text-sm bg-[var(--bg-hover)]">No Installation Fee</span>
            <span className="px-3 md:px-5 py-1.5 md:py-2 rounded-full border border-[var(--border-primary)] text-[var(--text-secondary)] font-semibold text-xs md:text-sm bg-[var(--bg-hover)]">No Extra Setup Cost</span>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[var(--border-primary)]" />

      {/* Dedicated Support Section */}
      <section className="py-12 md:py-16 px-6 md:px-4 bg-[var(--bg-card)]/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
            <div className="scroll-hidden-left md:w-1/2 w-full">
              <img src="/portalimg.png" alt="Support" className="w-full h-auto object-cover rounded-2xl" />
            </div>
            <div className="scroll-hidden-right md:w-1/2 w-full">
              <h2 className="text-2xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">Need Help?</h2>
              <p className="text-[var(--text-secondary)] text-base md:text-lg mb-6">Our support team is always with you.</p>
              <div className="space-y-3 mb-8">
                {['WhatsApp Support', 'Call Support', 'Remote Desktop Help', 'Fast Response'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <svg className="w-5 h-5 text-[var(--success-text)] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4">Need Something More?</h3>
              <p className="text-[var(--text-secondary)] mb-4">Every school has different requirements.</p>
              <p className="text-[var(--text-secondary)] mb-6 text-sm md:text-base">If your school needs more functionality than the standard features, we can also develop custom modules for you.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                {[
                  'Student Portal', 'Teacher Portal', 'Parent Portal',
                  'Attendance App', 'Homework System', 'Online Exams',
                  'Calendar', 'Fee Reminder SMS', 'WhatsApp Notifications',
                  'Transport Management', 'Hostel Management', 'Library Management',
                  'Payroll System', 'Custom Reports'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 md:gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-[var(--success-text)] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-[var(--text-secondary)] mb-4 text-sm md:text-base">And if your school needs a completely new feature that's not even on this list... Just tell us. Our development team will develop custom features for you at a minimum budget.</p>
              <p className="text-[var(--text-secondary)] font-semibold mb-6 text-base md:text-lg">Exactly the way you want it.</p>

              <a
                href="https://wa.me/923042582657"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block ripple-btn bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--text-primary)] px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:scale-105 transition-transform"
              >
                Request Custom Feature
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${showWhatsApp ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <a
          href="https://wa.me/923042582657"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[var(--success-text)] text-[var(--text-primary)] px-5 py-3 rounded-full shadow-lg hover:bg-[var(--success-text)] transition-all hover:scale-110"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="font-semibold">Need Help?</span>
        </a>
      </div>

      {/* Footer */}
      <footer className="scroll-hidden py-8 md:py-10 px-6 md:px-4 border-t border-[var(--border-primary)] bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-40 h-16 md:w-56 md:h-24">
              <img src="/logo.png" alt="SchoolCRM Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <p className="text-[var(--text-secondary)] mb-2 text-sm md:text-base">Develop by Muhammad Faizan & Mahad Khan</p>
          <p className="text-[var(--text-secondary)] text-sm md:text-base">Email: schoolportal098@gmail.com</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;