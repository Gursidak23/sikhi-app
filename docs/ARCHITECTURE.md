# ਸਿੱਖੀ ਵਿੱਦਿਆ | Platform Architecture

## Information Architecture

### Overview
The platform is organized into two clearly separated modules:
1. **Gurbani Module** (Sacred) - Sri Guru Granth Sahib Ji study
2. **Itihaas Module** (Historical) - Sikh history documentation

These are visually and structurally distinct to maintain appropriate reverence.

---

## Database Schema Design

### Source-First Principle
The schema is designed around the principle that **every claim must have attribution**. The `Source` and `Citation` tables are foundational, not supplementary.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CORE TABLES                               │
├─────────────────────────────────────────────────────────────────┤
│  Source           - Authoritative sources (books, teekas, etc.) │
│  Citation         - Specific references within sources          │
│  Disclaimer       - Mandatory platform disclaimers              │
│  ContentAudit     - Change tracking for governance              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     GURBANI TABLES                               │
├─────────────────────────────────────────────────────────────────┤
│  Raag             - 31 Raags of Sri Guru Granth Sahib Ji        │
│  BaniAuthor       - Guru Sahibaan and Bhagats                   │
│  Shabad           - Complete composition                         │
│  Pankti           - Individual line with Gurmukhi text          │
│  TeekaInterpretation - Meanings from named sources              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     HISTORY TABLES                               │
├─────────────────────────────────────────────────────────────────┤
│  Era              - Historical periods (Guru Period, etc.)      │
│  Period           - Sub-periods within eras                      │
│  HistoricalEvent  - Specific events with citations              │
│  HistoricalFigure - Key personalities                            │
│  EventInterpretation - Different scholarly views (not merged)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Content Models

### Multilingual Content
Every piece of textual content follows this model:

```typescript
interface MultilingualText {
  pa: string;        // Required - Punjabi (Gurmukhi) - AUTHORITATIVE
  paRoman?: string;  // Optional - Phonetic transliteration
  en?: string;       // Optional - English - INTERPRETIVE
  hi?: string;       // Optional - Hindi
}
```

### Source Attribution
```typescript
interface Citation {
  sourceId: string;   // Required - links to authoritative source
  volume?: string;
  chapter?: string;
  page?: string;
  originalQuote?: string;
}
```

### Historical Event
```typescript
interface HistoricalEvent {
  title: MultilingualText;
  date: {
    type: 'exact' | 'year' | 'approximate' | 'disputed';
    yearStart: number;
    // ...
  };
  description: MultilingualText;
  citations: Citation[];           // MANDATORY - at least one
  interpretations: EventInterpretation[];  // Multiple views preserved
  isContemporary: boolean;         // Requires special disclaimer
  status: ContentStatus;
}
```

### Gurbani Interpretation
```typescript
interface TeekaInterpretation {
  panktiId: string;
  source: Source;                  // MANDATORY - must be named teeka
  arthPunjabi?: string;            // Punjabi meaning
  meaningEnglish?: string;         // NEVER called "translation"
  status: 'PUBLISHED' | 'SCHOLARLY_REVIEW' | ...;
  verifiedBy?: string;
}
```

---

## UX Flow Design

### Home Page
```
┌─────────────────────────────────────────────────────────────────┐
│  ੴ ਸਤਿ ਨਾਮੁ                                                    │
│  ਸਿੱਖੀ ਵਿੱਦਿਆ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐     ┌─────────────────────┐           │
│  │     ਗੁਰਬਾਣੀ        │     │     ਇਤਿਹਾਸ          │           │
│  │   (Blue themed)     │     │   (Kesri themed)    │           │
│  │                     │     │                     │           │
│  │  Sacred study of    │     │  Source-attributed  │           │
│  │  Guru Granth Sahib  │     │  history timeline   │           │
│  │                     │     │                     │           │
│  │  ℹ️ For learning,   │     │  📚 Every claim     │           │
│  │  not ritual         │     │  has attribution    │           │
│  └─────────────────────┘     └─────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Gurbani Section Flow
```
┌─────────────────────────────────────────────────────────────────┐
│  [Maryada Disclaimer Modal - Must Acknowledge]                  │
│                                                                  │
│  "This platform is for learning and reflection..."             │
│  [I Understand] button                                          │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Gurbani Study Interface                                        │
├──────────────┬──────────────────────────────────────────────────┤
│  Raag Nav    │  Ang Navigator:  ◀ [੧੪੩] ▶  / ੧੪੩੦              │
│              │                                                   │
│  ਸ੍ਰੀ ਰਾਗੁ    ├──────────────────────────────────────────────────┤
│  ਰਾਗੁ ਮਾਝ   │  ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ...                        │
│  ਰਾਗੁ ਗਉੜੀ  │                                                   │
│  ...         │  [View Meanings ▼]                                │
│              │                                                   │
│  Quick Jump: │  ┌─ Interpretation (Prof. Sahib Singh) ─────────┐│
│  ਜਪੁ ਜੀ      │  │ ਅਕਾਲ ਪੁਰਖ ਇੱਕ ਹੈ...                          ││
│  ਸੁਖਮਨੀ     │  │                                               ││
│              │  │ — Sri Guru Granth Sahib Darpan               ││
│              │  └───────────────────────────────────────────────┘│
│              │  ┌─ Interpretation (Faridkot Teeka) ─────────────┐│
│              │  │ ...                                           ││
│              │  └───────────────────────────────────────────────┘│
└──────────────┴──────────────────────────────────────────────────┘
```

### History Section Flow
```
┌─────────────────────────────────────────────────────────────────┐
│  ਸਿੱਖ ਇਤਿਹਾਸ / Sikh History                                    │
│  Source-attributed historical documentation                     │
├─────────────────────────────────────────────────────────────────┤
│  [Timeline] [Guru Sahibaan] [Sources]                           │
├─────────────────────────────────────────────────────────────────┤
│  │                                                              │
│  ├── ● ਗੁਰੂ ਸਾਹਿਬਾਨ ਦਾ ਕਾਲ (1469-1708) ▶                       │
│  │   │                                                          │
│  │   ├── Sri Guru Nanak Dev Ji Period (1469-1539)              │
│  │   │   └── [Event Card: Prakash Diwas]                       │
│  │   │       Sources: ✓ Suraj Prakash, ✓ Gur Panth Prakash    │
│  │   │                                                          │
│  │   └── Sri Guru Angad Dev Ji Period (1539-1552)              │
│  │                                                              │
│  ├── ● ਖਾਲਸਾ ਦੀ ਸਿਰਜਣਾ (1699-1716) ▶                           │
│  │                                                              │
│  ├── ● ਸਿੱਖ ਰਾਜ (1799-1849) ▶                                  │
│  │                                                              │
│  ├── ● ਆਧੁਨਿਕ ਕਾਲ (1984-Present) [Ongoing] ▶                   │
│  │   ⚠️ Contemporary, evolving history                         │
│  │                                                              │
│  └── ● ਸਮਕਾਲੀ ਘਟਨਾਵਾਂ (2020-Present) [Contemporary] ▶         │
│       ⚠️ This information is evolving and not final            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App
├── RootLayout
│   ├── MainNavigation
│   │   ├── Logo
│   │   ├── NavLinks (Gurbani | History | About)
│   │   └── LanguageSwitcher
│   │
│   ├── [Main Content Area]
│   │   │
│   │   ├── /gurbani
│   │   │   ├── GurbaniDisclaimer (modal, requires ack)
│   │   │   ├── AngNavigator
│   │   │   ├── RaagNavigator (sidebar)
│   │   │   └── ShabadDisplay
│   │   │       └── PanktiDisplay
│   │   │           └── InterpretationBlock (with source)
│   │   │
│   │   └── /itihaas
│   │       ├── SourceAttributionNotice
│   │       ├── Timeline
│   │       │   ├── EraNode
│   │       │   │   └── PeriodNode
│   │       │   │       └── EventCard
│   │       │   │           ├── SourceCitation
│   │       │   │           └── EventInterpretation[]
│   │       │   └── ContemporaryMarker (for ongoing events)
│   │       └── GuruSahibaanList
│   │           └── FigureProfile
│   │
│   └── Footer
│       └── EthicalDisclaimers
```

---

## Visual Design Tokens

### Colors
- **Kesri (Saffron)**: `#f97316` - History section accent, used sparingly
- **Neela (Blue)**: `#1e3a8a` - Gurbani section, sacred content
- **Neutral**: Grays for text and backgrounds

### Typography
- **Gurmukhi**: Noto Sans Gurmukhi - primary for Punjabi
- **Gurbani Display**: Larger, more spaced for sacred text
- **Body**: Inter - for English/Hindi text

### Spacing
- Generous line height for Gurmukhi readability
- Clear visual separation between sections

---

## API Design

### Gurbani Endpoints
```
GET /api/gurbani/ang/:angNumber     - Get content for specific Ang
GET /api/gurbani/shabad/:id         - Get specific Shabad
GET /api/gurbani/raag/:id           - Get Shabads by Raag
GET /api/gurbani/author/:id         - Get Shabads by Author
GET /api/gurbani/search?q=          - Search Gurbani
```

### History Endpoints
```
GET /api/itihaas/timeline           - Get full timeline structure
GET /api/itihaas/era/:id            - Get era with events
GET /api/itihaas/event/:id          - Get event with interpretations
GET /api/itihaas/figure/:id         - Get historical figure
GET /api/itihaas/contemporary       - Get contemporary events
GET /api/itihaas/search?q=          - Search history
```

---

## Security Considerations

1. **No User Content for Gurbani**: Interpretations must come from verified sources only
2. **Audit Trail**: All content changes are logged
3. **Scholarly Review**: Content goes through verification before publishing
4. **No Caching for Sacred Content**: Gurbani pages have `Cache-Control: no-store`

---

## Accessibility

- Keyboard navigation throughout
- ARIA labels for interactive elements
- High contrast mode support
- Screen reader friendly structure
- Focus management for modals

---

## Performance

- Server-side rendering for SEO
- Lazy loading of interpretation content
- Optimized Gurmukhi font loading
- No infinite scroll (intentional)

---

**ਭੁੱਲ ਚੁੱਕ ਮਾਫ਼**
