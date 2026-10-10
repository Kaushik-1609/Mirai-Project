# MSOT LEARN (未来工科大学 • Mirai School of Technology)
A high-performance gamified academy web platform featuring an anime Torii gate 3D opening sequence, role-based academy authentication, interactive coding trials, guild wars, and matchmaking micro-leagues.

## Unified Technology Stack
- **HTML5**: Semantic web architecture, interactive canvas containers, responsive modal overlays.
- **CSS3 / Vanilla CSS**: Custom cyberpunk & neo-Tokyo aesthetics, dark glassmorphism, 3D gate transitions (`css/main.css`, `css/hero-gate.css`, `css/games.css`, `css/auth.css`).
- **JavaScript (ES6+)**: Core client engines for physics, Three.js 3D viewport, audio synthesizer, RBAC permissions, and gamification state.
- **React.js (v18)**: Component-driven micro-league arena and stateful incognito controls.
- **Tailwind CSS**: Utility styling with non-destructive preflight configuration preserving custom CSS integrity.
- **Framer Motion**: Fluid spring physics animations for tier switching, zone highlights, and identity masking.

---

## Clean Directory Architecture
```
MSOT-LEARN-with-login/
├── index.html                     # Primary entry point (HTML, CSS, JS, React, Tailwind, Motion)
├── package.json                   # Project dependency manifest
├── tsconfig.json                  # TypeScript compiler settings for src/
├── tailwind.config.js             # Tailwind CSS configuration with isolated preflight
├── .env                           # Environment keys
├── README.md                      # Architecture documentation
├── assets/                        # Static media assets
│   └── images/                    # Anime gates, Torii doors & celestial backgrounds
├── css/                           # Core styles
│   ├── main.css                   # Global styles, variables & dark theme
│   ├── hero-gate.css              # 3D Torii gate opening animation & perspective styles
│   ├── games.css                  # Arcade runtime & minigame styling
│   └── auth.css                   # Role portal & gateway authentication styles
├── js/                            # Client-side JavaScript engines
│   ├── app.js                     # Main application bootstrap & router
│   ├── platform.js                # Academy dashboard, daily quiz, trails & stats
│   ├── auth.js                    # Student, Faculty, Admin role gateway & sessions
│   ├── guild.js                   # Guild creation, rosters, rankings & tab routing
│   ├── battle.js                  # Real-time guild vs guild arena battles
│   ├── react-league-module.js     # React + Framer Motion + Tailwind 20-Cadet Arena Module
│   ├── game-engine.js             # Minigame canvas runner
│   ├── games-data.js              # Trial questions & game catalogs
│   ├── three-viewport.js          # Three.js 3D celestial canvas
│   ├── gate-canvas.js             # Torii gate visualizer
│   ├── pixel-grid-trail.js        # Interactive neon cursor trail
│   ├── scroll-animations.js       # Dynamic scroll-reveal observer
│   ├── audio.js                   # Synthesized audio effects & temple bell
│   ├── rbac.js                    # Role-based access control engine
│   └── state.js                   # LocalStorage persistence & cadet XP wallet
├── src/                           # Component Source & TypeScript Definitions
│   ├── components/                # React.js Components
│   │   ├── arena/                 # Mobile-first Arena layout (Framer Motion)
│   │   ├── league/                # Weekly Leagues, Incognito toggle & League table
│   │   ├── gamification/          # Quests & Badges holographic module
│   │   └── react-league-module.js # Compiled browser React module
│   ├── types/                     # TypeScript Interfaces
│   │   ├── gamification.ts        # Badges & Quest typings
│   │   └── league.ts              # Micro-league & Cadet entry typings
│   └── lib/                       # Backward-compatible library references
└── database/                      # Schemas & Database Migrations
    ├── prisma/                    # Prisma ORM schemas (Battle, Guild, League, RBAC)
    └── supabase/                  # Supabase SQL migrations & PostgreSQL RLS policies
```

---

## Role-Based Access Control (RBAC) & Academic Governance Architecture

The platform provides a strict, three-tier role-based governance system enforced at both the application level and the Supabase database / PostgreSQL RLS level:

### 1. 🛡️ Admin — Master Platform Command
- **Faculty Management**: View all registered faculty members, view full profiles, activate/deactivate accounts, monitor authored assignments and student interactions.
- **Student Ecosystem**: Complete student roster with multi-parameter filtering, individual profile dossiers (academic stats, League standings, Guild membership, Battle records, XP history), and account management.
- **Assignments Oversight**: Platform-wide coursework management, draft/publish controls, submission logs.
- **Leagues, Guilds & Battles**: Central health radar for competitive systems and matchmaking.
- **Student Inactivity Ledger**: Platform-wide log of student absence reasons with full response history.
- **XP Economy & Audit Logs**: Configurable rules engine (`xp_rules`) and immutable security audit logging.

### 2. 🎓 Faculty — Student Management & Connection
- **My Students**: Manage enrolled students in assigned course sections, inspect student progress dossiers without exposure of private administrative credentials.
- **Student Activity & Attendance Radar**: Real-time status badges (`Active` <24h, `Recently Active` 1–3d, `Inactive` 4–7d, `Long Inactive` 8+d) with exact days inactive calculated from authentic authentication timestamps.
- **Assignment Authoring & Publishing**: Create, edit, publish, and delete coursework assignments with custom titles, instructions, topics, deadlines, points, and attachments.
- **Submissions & Grading**: Review submitted student solutions and code attachments; assign grades, marks, and written feedback.
- **Student Inactivity Reasons**: Review student-filed absence reasons (Health, Personal, Academic Workload, Technical, Leave, Other) and provide direct pedagogical responses.
- **2-Way Communication**: Send messages, announcements, and direct correspondence to students.

### 3. ⚔️ Student — Connected Academic Experience
- **Faculty Coursework**: View published coursework assignments, due dates, instructions, and marks directly in the assignments hub.
- **Solution Submission**: Submit solutions (text, code, repository links) and track evaluation status.
- **Grades & Feedback**: Receive instructor grades, feedback comments, and verified XP rewards.
- **Absence & Leave Notices**: File formal inactivity reasons with category and date ranges; receive faculty responses.
- **Faculty Inbox**: Receive correspondence from professors directly on the student dashboard.

### 🔒 Backend & Database Security
- **Supabase PostgreSQL Schema (`database/supabase/supabase_rbac.sql`)**: Tables for `assignments`, `assignment_submissions`, `student_inactivity_reasons`, and `student_messages` with strict Row Level Security (RLS) policies.
- **Prisma Models (`src/lib/rbac_schema.prisma`)**: Strongly typed data definitions matching the Supabase schema.
- **Client Route Guards (`js/app.js` & `js/rbac.js`)**: Dynamic navigation visibility and strict role barriers preventing unauthorized elevation or URL tampering.

---

## How to Run
Open `index.html` directly in any web browser, or serve locally:
```bash
# Python 3
python3 -m http.server 3000
```
Then navigate to `http://localhost:3000` in your browser.
