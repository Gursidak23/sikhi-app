# ਸਿੱਖੀ ਵਿੱਦਿਆ | Sikhi Vidhya Platform

A sacred platform for Sikh learning, history documentation, and Gurbani study.

**ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ, ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਿਹ**

---

## Purpose

This platform serves as an educational resource for:
- **Gurbani Study**: Learning and reflection on Sri Guru Granth Sahib Ji
- **Sikh History**: Chronological, source-attributed documentation from 1469 to present

**Important**: This platform supports learning and reflection. It is NOT a replacement for the Prakash of Guru Granth Sahib Ji or religious practice.

---

## Core Principles

### 1. Source-First Architecture
Every historical claim and Gurbani interpretation is attributed to its source. No anonymous narration.

### 2. Multilingual with Hierarchy
- **Punjabi (Gurmukhi)**: Primary and authoritative
- **English**: Interpretive (never claimed as "translation")
- **Hindi**: Secondary access language

### 3. Preservation of Interpretations
Conflicting interpretations are presented side-by-side with attribution, never merged.

### 4. Contemporary History Transparency
Modern events are clearly marked as "evolving and not final."

### 5. Sacred Content Discipline
Gurbani section has no ads, comments, likes, infinite scrolling, or gamification.

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with authoritative sources
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sikhi_vidhya"
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── gurbani/           # Gurbani study section
│   └── itihaas/           # History section
├── components/
│   ├── common/            # Shared components
│   │   ├── Disclaimer.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   └── SourceCitation.tsx
│   └── layout/            # Layout components
│       └── Navigation.tsx
├── modules/
│   ├── gurbani/           # Gurbani module
│   │   ├── components/
│   │   └── data/
│   └── itihaas/           # History module
│       ├── components/
│       └── data/
├── lib/
│   ├── db/                # Database client
│   ├── utils.ts           # Utility functions
│   └── validation/        # Zod schemas
├── types/                 # TypeScript type definitions
└── styles/                # Global styles
```

---

## Key Features

### Gurbani Module
- Navigate by Ang (page) number
- Browse by Raag
- Multiple Teeka interpretations shown side-by-side
- Word-by-word meanings (Pad Arth)
- Clear disclaimer that English is interpretive, not translation

### History Module
- Chronological timeline structure
- Era → Period → Event hierarchy
- Source citations for every claim
- Multiple scholarly interpretations preserved
- Contemporary events marked as ongoing

---

## Authoritative Sources (Non-Negotiable)

### Sikh History
- Sri Guru Granth Sahib Ji (primary spiritual source)
- Sri Gur Panth Prakash — Rattan Singh Bhangu
- Suraj Prakash — Bhai Santokh Singh
- The Sikh Religion — Max Arthur Macauliffe (with caution)
- A History of the Sikhs — Khushwant Singh (contextual)

### Gurbani Interpretation (Teeka)
- Faridkot Teeka
- Prof. Sahib Singh Teeka
- Sant Singh Maskeen Katha
- Dr. Manmohan Singh — English interpretation
- Bhai Vir Singh (select works)

### Maryada & Ethics
- Sikh Rehat Maryada (SGPC)

---

## Content Governance

### Editorial Process
1. Content is drafted with source citations
2. Submitted for scholarly review
3. Verified by qualified reviewers
4. Published with full attribution

### Rules
- No user-submitted Gurbani meanings
- No AI-generated arth without human verification
- Editorial decisions are transparent
- Sources visible at all times

### Content Status
- `DRAFT`: Being prepared
- `SCHOLARLY_REVIEW`: Awaiting verification
- `PUBLISHED`: Verified and live
- `REQUIRES_UPDATE`: Flagged for revision
- `DISPUTED`: Multiple conflicting sources

---

## Ethical Disclaimers

These disclaimers are built into the platform and cannot be hidden:

1. **Gurbani Section**: "This platform supports learning and reflection, not religious practice replacement."

2. **Interpretation Note**: "Meanings are derived from named Teekas. English text represents interpretation, not literal translation."

3. **Contemporary History**: "This information is evolving and not final."

4. **Source Attribution**: "Every historical claim cites its source. Where sources conflict, interpretations are shown separately."

---

## Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Internationalization**: next-intl

---

## Contributing

### Guidelines
1. All content must have source attribution
2. Punjabi (Gurmukhi) is always required for multilingual content
3. Never claim English as "translation" — use "meaning/interpretation"
4. Mark contemporary content appropriately
5. Preserve conflicting interpretations

### Code Style
- Follow TypeScript strict mode
- Use meaningful variable names
- Comment complex logic
- Write accessible components

---

## License

This project is created for educational and religious learning purposes.

**ਭੁੱਲ ਚੁੱਕ ਮਾਫ਼ ਕਰਨਾ**
*Please forgive any errors or omissions*

---

## Contact

For scholarly contributions or corrections, please open an issue with:
1. The specific content in question
2. Source citations for proposed changes
3. Explanation of the correction

---

**ਵਾਹਿਗੁਰੂ**
