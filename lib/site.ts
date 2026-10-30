/* Everything personal lives here. Facts are taken from github.com/hamze-seere —
   keep them true when you edit. */

export const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hamse-yo-xs.vercel.app'

export const site = {
  name: 'Hamze Seere',
  initials: 'HS',
  role: 'Senior Cybersecurity & Web Developer',
  // public/hamze-portrait.jpg, shown in the hero.
  portrait: '/hamze-portrait.jpg',
  headline: ['I break things', 'so I can build them better.'],
  intro:
    'Cyber Security Instructor at Telesom and web developer. I teach security, build security tools like SecureScan, and ship web apps hardened like production systems.',
  location: 'Las Anod, Somalia · Remote',
  available: true,
  email: 'xamzaseere@gmail.com',
  github: { handle: 'hamze-seere', href: 'https://github.com/hamze-seere' },
  socials: [
    { label: 'GitHub', href: 'https://github.com/hamze-seere' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hamze-ayuub-345a15440' },
  ],
  focus: ['Web security', 'Next.js', 'TypeScript', 'PowerShell', 'Networking'],
}

// One-line proof under the hero buttons: [project, what backs it up].
export const proof = [
  ['SecureScan', '36 tests · open source'],
  ['EduManage', '230 tests · live for a school'],
  ['Telesom', 'teaching cybersecurity'],
] as const

export const stats = [
  { value: '17', label: 'Public repositories' },
  { value: '9', label: 'Check categories in SecureScan' },
  { value: '36', label: 'Automated tests in SecureScan' },
  { value: '14', label: 'Security & networking labs' },
]

export const services = {
  security: {
    title: 'Break it',
    kicker: 'Security',
    blurb: 'Find the weak spots in a website or system and explain how to fix them in plain language.',
    items: [
      ['Website security reviews', 'TLS, security headers, cookies, exposed files, email spoofing protection.'],
      ['Threat & risk analysis', 'Asset inventories, threat mapping and CIA-based controls.'],
      ['System hardening', 'Windows and Linux baselines, least privilege, service reduction.'],
      ['Security documentation', 'Clear write-ups of what was found and what changed.'],
    ],
  },
  web: {
    title: 'Build it',
    kicker: 'Web development',
    blurb: 'Fast, accessible web apps with security designed in from the first commit.',
    items: [
      ['Next.js & React applications', 'App Router, server actions, TypeScript throughout.'],
      ['Secure-by-default sites', 'Strict nonce CSP, full header set, no third-party requests.'],
      ['Security tooling', 'Scanners, CI checks and GitHub Actions that gate deployments.'],
      ['Performance & accessibility', 'Semantic HTML, keyboard support, reduced-motion respect.'],
    ],
  },
}

export const method = [
  ['01', 'Recon', 'Map the system, the data and who can touch it.'],
  ['02', 'Threat model', 'Decide what matters most before writing code or tests.'],
  ['03', 'Build / Test', 'Ship the feature, or attack it — usually both.'],
  ['04', 'Verify', 'Retest, automate the check in CI, document what changed.'],
] as const

// track colours the timeline dot: now (green, pulsing) · security · web · both.
// Add a start date to the Telesom entry when you have it (e.g. 'Mar 2026 — now').
export const experience = [
  { period: 'Now', track: 'now', role: 'Cyber Security Instructor', org: 'Telesom', note: 'Teaching cybersecurity.' },
  { period: 'Oct 2026', track: 'both', role: 'Built EduManage for Gateway School', org: 'School management system', note: 'Bilingual school website and portal: attendance, exams, fees and homework, with two-step sign-in and 230 automated tests.' },
  { period: 'Oct 2026', track: 'both', role: 'Built and shipped SecureScan', org: 'Open-source project', note: 'Website security scanner with a written threat model, 36 tests and a GitHub Action.' },
  { period: 'Oct 2026', track: 'security', role: 'GNS3 networking labs', org: 'Self-directed', note: 'OSPF, Spanning Tree, CDP and Telnet labs on emulated Cisco routers and switches.' },
  { period: 'Oct 2026', track: 'both', role: 'Built a hardened portfolio', org: 'Personal project', note: 'Strict nonce CSP, full security headers and zero third-party requests on Next.js 16.' },
  { period: 'Sep 2026', track: 'security', role: 'Cybersecurity coursework', org: 'Somali National University', note: 'Labs in attack surface, incident impact, CIA controls, hardening and networking.' },
  { period: 'Sep 2026', track: 'security', role: 'Windows security exercises', org: 'Self-directed', note: 'PowerShell password checker, SHA-256 integrity checks, EICAR and recovery setup.' },
]

export const toolbox = [
  { group: 'Web security', track: 'security', items: ['CSP & security headers', 'TLS', 'SPF / DMARC / DKIM', 'SSRF defence', 'Threat modeling'] },
  { group: 'Systems & networks', track: 'security', items: ['GNS3', 'Cisco IOS', 'OSPF & STP', 'Cisco Packet Tracer', 'PowerShell', 'Windows hardening'] },
  { group: 'Frontend', track: 'web', items: ['TypeScript', 'React 19', 'Next.js 16', 'Tailwind CSS', 'MDX'] },
  { group: 'Backend & tooling', track: 'web', items: ['Node.js (http, tls, dns)', 'GitHub Actions', 'Vercel', 'Upstash Redis', 'node:test'] },
] as const
