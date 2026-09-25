import TechIcon from "@/components/TechIcon";
import BackLink from "@/components/BackLink";
import { getSettings } from "@/lib/db";
import { ageFrom, bioParagraphs } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { profile, skills, interests, resumeUpdated } = getSettings();
  const age = ageFrom(profile.birthDate);
  const bio = bioParagraphs(profile.bio, age);

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <BackLink fallback={`/${lang}`} className="inline-block mb-6" />
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-terminal-text-light dark:text-terminal-text-dark mb-4">
            <span className="text-terminal-accent-red">$</span>{" "}
            <span className="text-terminal-accent-green">cat</span>{" "}
            <span className="text-terminal-accent-blue">about_me.md</span>
          </h1>
          <div className="h-px bg-terminal-text-light/20 dark:border-terminal-text-dark/20" />
        </div>

        {/* Profile Section */}
        <div className="mb-8 sm:mb-12 border border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <img
                src="/images/profile.jpg"
                alt={profile.name}
                className="w-full border-2 border-terminal-text-light dark:border-terminal-text-dark grayscale hover:grayscale-0 transition-all"
              />
            </div>
            <div className="md:col-span-2 space-y-3 text-sm">
              <div>
                <span className="text-terminal-accent-cyan">name:</span>{" "}
                <span className="text-terminal-accent-yellow">
                  {profile.name}
                </span>
              </div>
              <div>
                <span className="text-terminal-accent-cyan">alias:</span>{" "}
                <span className="text-terminal-accent-yellow">{profile.alias}</span>
              </div>
              <div>
                <span className="text-terminal-accent-cyan">age:</span>{" "}
                <span className="text-terminal-accent-yellow">{age}</span>
              </div>
              <div>
                <span className="text-terminal-accent-cyan">location:</span>{" "}
                <span className="text-terminal-accent-yellow">{profile.location}</span>
              </div>
              <div>
                <span className="text-terminal-accent-cyan">role:</span>{" "}
                <span className="text-terminal-accent-yellow">
                  {profile.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-bold text-terminal-text-light dark:text-terminal-text-dark mb-3 sm:mb-4">
            <span className="text-terminal-accent-red">#</span> Bio
          </h2>
          <div className="space-y-4 text-terminal-text-light/80 dark:text-terminal-text-dark/80 leading-relaxed">
            {bio.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-bold text-terminal-text-light dark:text-terminal-text-dark mb-3 sm:mb-4">
            <span className="text-terminal-accent-red">#</span> Technical Skills
          </h2>
          <div className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-4">
            <div className="space-y-4 text-sm">
              {skills.map(({ category, items }) => (
                <div key={category}>
                  <div className="text-terminal-accent-cyan mb-2">
                    {category.charAt(0).toUpperCase() + category.slice(1)}:
                  </div>
                  <div className="flex flex-wrap gap-2 pl-4">
                    {items.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 border border-terminal-text-light/20 dark:border-terminal-text-dark/20 text-terminal-text-light dark:text-terminal-text-dark flex items-center gap-1.5"
                      >
                        <TechIcon name={skill} size={14} />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-bold text-terminal-text-light dark:text-terminal-text-dark mb-3 sm:mb-4">
            <span className="text-terminal-accent-red">#</span> Interests &
            Focus Areas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {interests.map((interest, index) => (
              <div
                key={index}
                className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-3 text-sm"
              >
                <span className="text-terminal-accent-pink">→</span>{" "}
                <span className="text-terminal-text-light dark:text-terminal-text-dark">
                  {interest}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Resume Download */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-bold text-terminal-text-light dark:text-terminal-text-dark mb-3 sm:mb-4">
            <span className="text-terminal-accent-red">#</span> Resume
          </h2>
          <div className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 p-6 hover:border-terminal-accent-cyan dark:hover:border-terminal-accent-cyan transition-colors">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-terminal-text-light dark:text-terminal-text-dark mb-2">
                  Download my full resume in PDF format
                </p>
                <p className="text-xs text-terminal-text-light/60 dark:text-terminal-text-dark/60">
                  Last updated: {resumeUpdated}
                </p>
              </div>
              <a
                href="/resume.pdf"
                download="ALIREZA-GHOTBI-Resume.pdf"
                className="inline-flex items-center gap-2 px-4 py-2 border border-terminal-accent-cyan text-terminal-accent-cyan hover:bg-terminal-accent-cyan hover:text-terminal-bg-dark dark:hover:text-terminal-bg-dark transition-colors"
              >
                <span>↓</span>
                <span>Download Resume</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20 pt-6">
          <p className="text-xs text-terminal-text-light/60 dark:text-terminal-text-dark/60">
            <span className="text-terminal-accent-red">$</span> Always learning,
            always building.
          </p>
        </div>
      </div>
    </div>
  );
}
