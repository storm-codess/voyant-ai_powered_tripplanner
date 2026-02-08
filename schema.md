# Voyant — Schema (v1)

This file defines the canonical schema for the Voyant trip-planning app. Types assume PostgreSQL (UUID, timestamptz, JSONB); adapt as needed.

## Enums
- `Trip.status`: `collecting_preferences` | `recommending` | `voting` | `decided`
- `Participant.role`: `creator` | `member`
- `Survey.vibe`: `relaxed` | `adventurous` | `cultural` | `party` | `family` | `romantic` | `other`

## Notes
- All `id` fields are `UUID` (PK) unless otherwise noted.
- Timestamps use `timestamptz` (store UTC).
- `email` is PII — restrict access and consider hashing/consent fields.

---

## Entities

### User
- Purpose: represents a person using the app
- Fields:
	- `id: UUID` (PK)
	- `email: varchar` (unique, indexed)
	- `email_verified: boolean` (default `false`)
	- `created_at: timestamptz`
	- `updated_at: timestamptz`
	- `deleted_at: timestamptz NULL` (soft delete)

### Trip
- Purpose: central object representing a group trip
- Fields:
	- `id: UUID` (PK)
	- `title: varchar`
	- `description: text NULL`
	- `creator_id: UUID` → `User(id)` (FK, `ON DELETE RESTRICT`)
	- `status: enum Trip.status` (default `collecting_preferences`)
	- `created_at: timestamptz`
	- `updated_at: timestamptz`
	- `deleted_at: timestamptz NULL`
- Notes:
	- Ensure `creator_id` is also a `Participant` for the trip (app-level or DB trigger).
	- Indexes: `(creator_id)`, `(status)`.

### Participant
- Purpose: links users to trips
- Fields:
	- `id: UUID` (PK)
	- `trip_id: UUID` → `Trip(id)` (FK, `ON DELETE CASCADE`)
	- `user_id: UUID` → `User(id)` (FK, `ON DELETE CASCADE`)
	- `role: enum Participant.role` (default `member`)
	- `joined_at: timestamptz`
	- `updated_at: timestamptz`
- Constraints / Indexes:
	- `UNIQUE(trip_id, user_id)`
	- index on `(trip_id)`, `(user_id)`

### SurveyResponse
- Purpose: stores structured travel preferences
- Fields:
	- `id: UUID` (PK)
	- `trip_id: UUID` → `Trip(id)` (FK, `ON DELETE CASCADE`)
	- `user_id: UUID` → `User(id)` (FK, `ON DELETE CASCADE`)
	- `budget_min: numeric NULL`
	- `budget_max: numeric NULL`
	- `available_dates: JSONB` — array of date ranges or ISO dates (`[{from: date, to: date}]`)
	- `vibe: enum Survey.vibe NULL`
	- `exclusions: JSONB NULL` — array of strings or structured objects
	- `free_text_notes: text NULL`
	- `submitted_at: timestamptz`
	- `created_at: timestamptz`
	- `updated_at: timestamptz`
- Constraints / Indexes:
	- `UNIQUE(trip_id, user_id)` — one response per user per trip
	- index on `(trip_id)`

### Location
- Purpose: structured place metadata for recommendations
- Fields:
	- `id: UUID` (PK)
	- `name: varchar`
	- `country: varchar NULL`
	- `region: varchar NULL`
	- `lat: numeric NULL`
	- `lng: numeric NULL`
	- `canonical_id: varchar NULL` — external provider id
	- `metadata: JSONB NULL` — raw provider payload
	- `created_at: timestamptz`

### Recommendation
- Purpose: AI-generated destination suggestions
- Fields:
	- `id: UUID` (PK)
	- `trip_id: UUID` → `Trip(id)` (FK, `ON DELETE CASCADE`)
	- `location_id: UUID` → `Location(id)` NULL
	- `destination_text: varchar` — fallback free-text
	- `reasoning: text NULL`
	- `model_provider: varchar NULL`
	- `model_name: varchar NULL`
	- `prompt_version: varchar NULL`
	- `prompt_snapshot: text NULL` — store prompt for reproducibility
	- `score: numeric NULL`
	- `created_at: timestamptz`
	- `created_by: varchar NULL` — e.g., `'ai'` or user id
- Indexes: `(trip_id)`

### Vote
- Purpose: ranked-choice voting (normalized)
- Vote table:
	- `id: UUID` (PK)
	- `trip_id: UUID` → `Trip(id)` (FK, `ON DELETE CASCADE`)
	- `user_id: UUID` → `User(id)` (FK, `ON DELETE CASCADE`)
	- `submitted_at: timestamptz`
	- `created_at: timestamptz`
	- Constraint: `UNIQUE(trip_id, user_id)` — one vote per user per trip

### VoteRank
- Purpose: normalize ranked choices
- Fields:
	- `id: UUID` (PK)
	- `vote_id: UUID` → `Vote(id)` (FK, `ON DELETE CASCADE`)
	- `rank: integer` — 1 = top choice
	- `recommendation_id: UUID` → `Recommendation(id)`
- Constraints / Indexes:
	- `UNIQUE(vote_id, rank)`
	- index on `(recommendation_id)`

### AuditLog
- Purpose: record system and AI actions for auditability
- Fields:
	- `id: UUID` (PK)
	- `entity_type: varchar` — e.g., `Recommendation`, `Trip`
	- `entity_id: UUID NULL`
	- `action: varchar` — e.g., `create`, `update`, `ai_generate`
	- `actor_user_id: UUID NULL`
	- `metadata: JSONB NULL` — prompt, model response, etc.
	- `created_at: timestamptz`

