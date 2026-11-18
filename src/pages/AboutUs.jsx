import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const navigate = useNavigate();

  const profiles = [
    {
      name: "Muhammad Mahad Khan",
      roll: "Full Stack Developer",
      skills: ["MERN Stack", "React.js", "Node.js", "MongoDB", "Express.js", "Tailwind CSS"],
      linkedin: "https://www.linkedin.com/in/mahad-khan-1a26a637b?",
      email: "muhammadmahadkhan098gmail.com",
      phone: "+92 311 2808014"
    },
    {
      name: "Muhammad Faizan",
      roll: "Full Stack Developer",
      skills: ["MERN Stack", "React.js", "Node.js", "MongoDB", "Express.js", "Tailwind CSS"],
      linkedin: "https://www.linkedin.com/in/faizan-bashir-a79274350/",
      email: "fb240951gmail.com",
      phone: "+92 304 2582657"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <nav className="sticky top-0 z-50 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-[var(--text-primary)] hover:text-[var(--accent)] transition font-medium"
            >
              Back to Home
            </button>
            <div className="w-36 h-14">
              <img src="/logo.png" alt="SchoolCRM Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--text-primary)] px-6 py-2 rounded-full font-semibold hover:opacity-90 transition"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-6">About Us</h1>
            <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
              SchoolCRM is a comprehensive school management portal designed to digitize and simplify school administration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl p-8">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">About the Portal</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                SchoolCRM is a powerful, all-in-one school management solution that automates admissions, attendance tracking, fee management, teacher management, and student record keeping. Our platform eliminates hours of manual paperwork and provides schools with a centralized digital hub for all administrative tasks.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Built with modern web technologies, our portal ensures data security, real-time updates, and a seamless user experience for school administrators, teachers, and parents alike.
              </p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl p-8">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">About the Developer</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                SchoolCRM was developed by a passionate team of developers committed to revolutionizing school management in Pakistan. With years of experience in web development and education technology, we understood the challenges schools face with manual record-keeping and built a solution that truly works.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Our mission is to make school administration stress-free, efficient, and accessible to educational institutions of all sizes.
              </p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-center text-[var(--text-primary)] mb-12">Meet Our Team</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {profiles.map((profile, i) => (
              <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl p-8 hover:border-[var(--accent)] transition">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center text-3xl font-bold text-[var(--text-primary)] mx-auto mb-6">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-2">{profile.name}</h3>
                <p className="text-[var(--accent)] text-center font-semibold mb-4">{profile.roll}</p>

                <div className="mb-4">
                  <h4 className="text-[var(--text-primary)] font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, j) => (
                      <span key={j} className="bg-[var(--border-primary)] text-[var(--text-secondary)] px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-[var(--text-secondary)]">
                  <p>
                    <span className="text-[var(--text-primary)] font-semibold">Email:</span>{' '}
                    <a href={`mailto:${profile.email}`} className="hover:text-[var(--accent)] transition">{profile.email}</a>
                  </p>
                  <p>
                    <span className="text-[var(--text-primary)] font-semibold">Phone:</span> {profile.phone}
                  </p>
                  <p>
                    <span className="text-[var(--text-primary)] font-semibold">LinkedIn:</span>{' '}
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition">{profile.linkedin}</a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-[var(--border-primary)] bg-[var(--bg-card)]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-52 h-20 mx-auto mb-2">
            <img src="/logo.png" alt="SchoolCRM Logo" className="w-full h-full object-contain" />
          </div>
          <p className="text-[var(--text-secondary)]">Develop by Muhammad Faizan & Mahad Khan</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
