# API Documentation

## Overview

The ਸਿੱਖੀ ਵਿੱਦਿਆ API provides access to Gurbani (Sri Guru Granth Sahib Ji) and Sikh History (Itihaas) data.

**Base URL**: `/api`

**Rate Limiting**: 60 requests per minute per IP address

---

## Gurbani Endpoints

### Get Ang (Page)

Fetch content for a specific Ang (page) of Sri Guru Granth Sahib Ji.

```
GET /api/gurbani/ang/{angNumber}
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| angNumber | number | Ang number (1-1430) |

**Response**:
```json
{
  "page": {
    "pageNo": 1,
    "totalPages": 1430
  },
  "source": {
    "sourceId": "G",
    "gurmukhi": "ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ",
    "english": "Sri Guru Granth Sahib Ji"
  },
  "count": 19,
  "verses": [...]
}
```

---

### Search Gurbani

Search across Gurbani by Gurmukhi text or transliteration.

```
GET /api/gurbani/search?q={query}
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| q | string | Search query (min 3 characters) |

**Response**:
```json
{
  "query": "ਵਾਹਿਗੁਰੂ",
  "resultCount": 42,
  "results": [...],
  "disclaimer": "Search results show first line of Shabads. View full Shabad for complete context."
}
```

**Rate Limit**: 30 requests per minute

---

### Get Shabad

Fetch a complete Shabad (composition) by ID.

```
GET /api/gurbani/shabad/{shabadId}
```

**Response**:
```json
{
  "shabad": {
    "shabadInfo": {...},
    "verses": [...]
  },
  "disclaimer": "Meanings are interpretations from named sources, not literal translations."
}
```

---

### Get Raags

Fetch all 31 Raags of Sri Guru Granth Sahib Ji.

```
GET /api/gurbani/raag
```

**Response**:
```json
{
  "raags": [
    {
      "raagId": 1,
      "gurmukhi": "ਸਿਰੀ ਰਾਗੁ",
      "english": "Siree Raag",
      "startAng": 14,
      "endAng": 93
    },
    ...
  ]
}
```

---

## History (Itihaas) Endpoints

### Get Timeline

Fetch the complete historical timeline structure.

```
GET /api/itihaas/timeline
```

**Response**:
```json
{
  "eras": [
    {
      "id": "guru-period",
      "name": {
        "pa": "ਗੁਰੂ ਕਾਲ",
        "en": "The Guru Period"
      },
      "yearStart": 1469,
      "yearEnd": 1708,
      "periods": [...]
    },
    ...
  ],
  "sourceNote": "Every historical claim in this timeline is attributed to its source."
}
```

---

### Get Era

Fetch a specific historical era with all its events.

```
GET /api/itihaas/era/{eraId}
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| eraId | string | Era identifier |

---

### Get Event

Fetch a specific historical event with interpretations.

```
GET /api/itihaas/event/{eventId}
```

---

### Get Historical Figure

Fetch information about a historical figure.

```
GET /api/itihaas/figure?id={figureId}
GET /api/itihaas/figure?guru-sahibaan
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| id | string | Figure identifier |
| guru-sahibaan | flag | Return all 10 Guru Sahibaan |

---

### Search History

Search across historical events and figures.

```
GET /api/itihaas/search?q={query}
```

---

### Get Contemporary Events

Fetch recent/contemporary historical events (includes mandatory disclaimer).

```
GET /api/itihaas/contemporary
```

**Response**:
```json
{
  "events": [...],
  "isContemporary": true,
  "warningNote": "Content in this section represents contemporary, evolving history..."
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Human-readable error message"
}
```

**HTTP Status Codes**:
| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 404 | Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

---

## Rate Limit Headers

All responses include rate limit headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 55
X-RateLimit-Reset: 1706745600000
```

When rate limited (429), response includes:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please wait before searching again.",
  "retryAfter": 45
}
```

---

## Content Guidelines

1. **Source Attribution**: Every historical claim is attributed to its source
2. **Multiple Interpretations**: Where sources conflict, interpretations are presented separately
3. **No Literal Translations**: Gurbani meanings are "interpretations" from named teekas, never "translations"
4. **Contemporary Disclaimers**: Recent events include mandatory disclaimers about evolving information
