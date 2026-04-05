# PsychotherapyConnect — API Reference for Web Client

> **Base URL:** `http://localhost:{DEVELOPMENT_WEB_PORT}`
>
> **Auth header:** All `api/*` routes require `token: <JWT>` obtained after login.  
> **Public routes** (`public_*`) require `deviceId` + `deviceType` headers but **no token**.  
> **Locale:** Send `locale: es` (or `en`) on every request.

---

## Authentication (`/api/user`)

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `POST` | `/api/user/login` | ❌ | Login. Returns `{ user, token, refreshToken }`. |
| `POST` | `/api/user/refreshToken` | ❌ | Exchange `refreshToken` for a new `token`. |
| `POST` | `/api/user/recoverPassword` | ❌ | Send password-recovery email. |
| `POST` | `/api/user/logout` | ✅ | Expire all device tokens for this user. |
| `GET`  | `/api/user` | ✅ | Get authenticated user object. |
| `PATCH`| `/api/user/password` | ✅ | Change password (`oldPassword` + `newPassword`). |

### Login — request body
```json
{ "email": "therapist1@psyconnect.dev", "password": "Test1234!", "push": null }
```

### Auth — response shape
```json
{
  "user": { "id": "hash", "name": "Ana García", "email": "...", "roles": ["ROLE_THERAPIST"] },
  "token": "<JWT>",
  "refreshToken": "<UUID>"
}
```

> **Tip for the web client:** store `token` in memory (not localStorage) and `refreshToken` in an
> HttpOnly cookie. Call `POST /api/user/refreshToken` on every page load or 401 response.

---

## Therapist profile (`/api/therapist`)

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `POST` | `/api/therapist/register` | ❌ | Register. Creates User + Person + Therapist + default Workspace. Returns `{ therapist, token }`. |
| `GET`  | `/api/therapist/profile` | ✅ | Get own profile. |
| `PATCH`| `/api/therapist/profile` | ✅ | Update profile. |

### Register — body
```json
{
  "firstName": "Ana",
  "lastName": "García",
  "email": "ana@example.com",
  "password": "Test1234!",
  "licenseNumber": "PS-12345",
  "specialty": "EMDR"
}
```

### Update profile — patchable fields
`firstName` · `lastName` · `phone` · `birthDate` (ISO date | null) · `licenseNumber` · `specialty` · `bio`

---

## Workspaces (`/api/workspace`)

Therapist's operational contexts (e.g. "Consulta Norte", "Online").  
Exactly one workspace per therapist has `isDefault = true`.

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET`    | `/api/workspace` | ✅ | List. `?activeOnly=true` (default). |
| `GET`    | `/api/workspace/{hash}` | ✅ | Single workspace. |
| `POST`   | `/api/workspace` | ✅ | Create. |
| `PATCH`  | `/api/workspace/{hash}` | ✅ | Update. |
| `DELETE` | `/api/workspace/{hash}` | ✅ | Deactivate. Cannot deactivate the default workspace. |

### Body fields
| Field | Type | POST | PATCH | Notes |
|-------|------|:----:|:-----:|-------|
| `name` | string | ✅ | — | Unique per therapist. Max 100 chars. |
| `description` | string \| null | — | — | |
| `color` | string \| null | — | — | Hex color, e.g. `#3B82F6`. |
| `isDefault` | bool | — | — | `true` clears the previous default. |
| `isActive` | bool | — | ✅ | |

---

## Tags (`/api/tag`)

Per-therapist labels for classifying consultation reasons.  
Used when creating/updating `TherapyProcess` records.

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET`    | `/api/tag` | ✅ | List. `?activeOnly=true` (default). |
| `GET`    | `/api/tag/{hash}` | ✅ | Single tag. |
| `POST`   | `/api/tag` | ✅ | Create. |
| `PATCH`  | `/api/tag/{hash}` | ✅ | Update. |
| `DELETE` | `/api/tag/{hash}` | ✅ | Deactivate (soft). Historical records keep the tag. |

### Body fields
| Field | Type | POST | Notes |
|-------|------|:----:|-------|
| `name` | string | ✅ | Unique per therapist. |
| `color` | string \| null | — | Hex color. |
| `isActive` | bool | — | PATCH only. |

---

## Patients (`/api/patient`)

Always belong to one therapist. May or may not have a `User` account.  
All IDs are opaque hashes — never raw integers.

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET`    | `/api/patient` | ✅ | Paginated, filterable list. |
| `GET`    | `/api/patient/{hash}` | ✅ | Full patient detail. |
| `POST`   | `/api/patient` | ✅ | Create patient. |
| `PATCH`  | `/api/patient/{hash}` | ✅ | Partial update. |
| `DELETE` | `/api/patient/{hash}` | ✅ | Soft-delete (clinical history is never erased). |

### GET list — query params
| Param | Type | Description |
|-------|------|-------------|
| `status` | `active` \| `inactive` \| `archived` \| `discharged` | Filter by status. |
| `workspace` | hash | Filter by workspace. |
| `search` | string | Search by name. |
| `isMinor` | bool | Filter minor patients. |
| `page` | int | Default `1`. |
| `size` | int | Default `20`, max `100`. |

### List response shape
```json
{ "items": [...], "total": 30, "page": 1, "size": 20 }
```

### Body fields (POST / PATCH)
| Field | Type | POST | Notes |
|-------|------|:----:|-------|
| `firstName` | string | ✅ | |
| `lastName` | string | ✅ | |
| `birthDate` | ISO date \| null | — | |
| `phone` | string \| null | — | |
| `email` | string \| null | — | |
| `documentNumber` | string \| null | — | |
| `address` | string \| null | — | |
| `isMinor` | bool | — | Default `false`. |
| `workspaceId` | hash \| null | — | Must belong to the therapist. |
| `patientStatus` | enum | PATCH | `active` `inactive` `archived` `discharged` |
| `internalReference` | string \| null | — | |
| `notesAdministrative` | string \| null | — | Administrative only, not clinical. |
| `emergencyContactName` | string \| null | — | |
| `emergencyContactPhone` | string \| null | — | |
| `emergencyContactRelation` | string \| null | — | |
| `source` | string \| null | — | How the patient found the therapist. |

---

### Patient — Guardians sub-resource

Minor patients (`isMinor = true`) can have one or more guardians.

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET`    | `/api/patient/{hash}/guardian` | ✅ | List guardians. Returns `{ items: [...] }`. |
| `POST`   | `/api/patient/{hash}/guardian` | ✅ | Add guardian. |
| `DELETE` | `/api/patient/{patientHash}/guardian/{guardianHash}` | ✅ | Remove guardian. |

### Guardian body fields
| Field | Type | Required | Notes |
|-------|------|:--------:|-------|
| `fullName` | string | ✅ | |
| `relationshipType` | enum | ✅ | `mother` `father` `legal_guardian` `grandparent` `sibling` `step_parent` `other` |
| `phone` | string \| null | — | |
| `email` | string \| null | — | |
| `isLegalGuardian` | bool | — | |
| `isPrimaryContact` | bool | — | Only one guardian should be primary contact. |
| `canManageAppointments` | bool | — | |
| `canReceiveNotifications` | bool | — | |
| `canSignDocuments` | bool | — | |

---

## Appointments (`/api/appointment`)

Scheduling entity. Clinical content lives in `SessionNote`, not here.

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET`  | `/api/appointment` | ✅ | Paginated, filterable list. |
| `GET`  | `/api/appointment/{hash}` | ✅ | Full detail. |
| `POST` | `/api/appointment` | ✅ | Book appointment. |
| `PATCH`| `/api/appointment/{hash}` | ✅ | Update (only if `scheduled` or `confirmed`). |
| `DELETE` | `/api/appointment/{hash}` | ✅ | Soft-delete. |
| `POST` | `/api/appointment/{hash}/cancel` | ✅ | Cancel and record reason. |
| `POST` | `/api/appointment/{hash}/reactivate` | ✅ | Reactivate a cancelled appointment (back to `scheduled`). |

### GET list — query params
| Param | Description |
|-------|-------------|
| `status` | Filter by status value. |
| `patientId` | Patient hash. |
| `from` / `to` | ISO 8601 datetime range. |
| `upcoming` | `true` to return only future appointments. |
| `page` / `limit` | Pagination (default page `1`, limit `20`, max `100`). |

### Book — body fields
| Field | Type | Required | Notes |
|-------|------|:--------:|-------|
| `patientId` | hash | ✅ | Must belong to therapist. |
| `appointmentType` | enum | ✅ | `in_person` `online` `phone` `home_visit` |
| `startAt` | ISO 8601 datetime | ✅ | e.g. `2026-04-01T10:00:00` |
| `endAt` | ISO 8601 datetime | ✅ | |
| `locationText` | string \| null | — | For `in_person` / `home_visit`. |
| `meetingUrl` | string \| null | — | For `online`. |
| `notes` | string \| null | — | Scheduling notes (not clinical). |
| `processId` | hash \| null | — | Link to an existing TherapyProcess. |
| `workspaceId` | hash \| null | — | Override workspace for this appointment. |
| `rescheduledFromId` | hash \| null | — | Original appointment this one replaces. |

### Cancel — body
```json
{ "cancelReason": "Patient did not attend", "cancelledBy": "therapist" }
```
`cancelledBy` values: `therapist` | `patient` | `guardian` | `system`

### Status lifecycle
| Status | Editable | Final |
|--------|:--------:|:-----:|
| `scheduled` | ✅ | ❌ |
| `confirmed` | ✅ | ❌ |
| `completed` | ❌ | ✅ |
| `cancelled` | ❌ | ✅ |
| `no_show` | ❌ | ✅ |

---

## Therapy Processes (`/api/process`)

Groups all appointments and session notes for a patient's clinical journey.  
A patient can have multiple processes (e.g. after re-engagement).

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET`    | `/api/process` | ✅ | Paginated list of **all** processes for the authenticated therapist. |
| `GET`    | `/api/process/patient/{patientHash}` | ✅ | List all processes for a specific patient. |
| `GET`    | `/api/process/{hash}` | ✅ | Full detail (tags + appointments ordered most recent first). |
| `POST`   | `/api/process` | ✅ | Open a new process. |
| `PATCH`  | `/api/process/{hash}` | ✅ | Update status, notes, observations. |
| `DELETE` | `/api/process/{hash}` | ✅ | Soft-delete (removes from all listings permanently). |
| `POST`   | `/api/process/{hash}/disable` | ✅ | Set status to `disabled` (temporarily inactive, still visible). |
| `POST`   | `/api/process/{hash}/archive` | ✅ | Set status to `archived` (read-only record, no further activity). |
| `POST`   | `/api/process/{hash}/tag` | ✅ | Add tag. Body: `{ "tagId": "hash" }`. |
| `DELETE` | `/api/process/{hash}/tag/{tagHash}` | ✅ | Remove tag. |

### GET `/api/process` — query params

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `processStatus` | `draft`\|`active`\|`paused`\|`closed`\|`disabled`\|`archived` | — | Filter by status. Repeat param for multiple: `?processStatus=active&processStatus=paused`. |
| `sortBy` | `openedAt`\|`closedAt`\|`nextAppointmentAt` | `openedAt` | Sort field. |
| `order` | `asc`\|`desc` | `desc` | Sort direction. |
| `page` | int | `1` | Page number. |
| `size` | int | `20` | Page size (max `100`). |

### GET `/api/process` — response shape

```json
{
  "items": [
    {
      "id": "hash",
      "patientId": "hash",
      "patientName": "María López",
      "reasonForConsultation": "Ansiedad generalizada",
      "processStatus": "active",
      "openedAt": "2025-09-01T00:00:00+00:00",
      "closedAt": null,
      "tags": [
        { "id": "hash", "name": "Ansiedad", "color": "#5B2A86" }
      ],
      "nextAppointmentAt": "2026-03-28T10:00:00+00:00"
    }
  ],
  "total": 42,
  "page": 1,
  "size": 20
}
```

### Body fields (POST / PATCH)

| Field | Type | POST | PATCH | Notes |
|-------|------|:----:|:-----:|-------|
| `patientId` | hash | ✅ | — | Must belong to therapist. |
| `reasonForConsultation` | string | ✅ | ✅ | Main reason patient sought therapy. |
| `initialObservations` | string \| null | — | — | |
| `openedAt` | ISO 8601 \| null | — | — | Defaults to now. |
| `tagIds` | hash[] | — | — | Tags to attach on creation. |
| `processStatus` | enum | — | ✅ | `draft` `active` `paused` `closed` `disabled` `archived` |
| `privateNotes` | string \| null | — | ✅ | Never exposed to patient. |
| `closedAt` | ISO 8601 \| null | — | ✅ | Set when closing the process. |

### Status reference

| Status | Meaning | `isOpen()` |
|--------|---------|:----------:|
| `draft` | Created, not yet started | ✅ |
| `active` | Ongoing treatment | ✅ |
| `paused` | Temporarily on hold | ✅ |
| `closed` | Treatment completed | ❌ |
| `disabled` | Temporarily inactive, still visible | ❌ |
| `archived` | Read-only historical record | ❌ |

---

## Session Notes (`/api/session-note`)

Clinical record tied to a `TherapyProcess` and optionally an `Appointment`.  
**Rule:** never create a note for a cancelled appointment.

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET`    | `/api/session-note/{hash}` | ✅ | Get detail. |
| `POST`   | `/api/session-note` | ✅ | Create note. |
| `PATCH`  | `/api/session-note/{hash}` | ✅ | Update. |
| `DELETE` | `/api/session-note/{hash}` | ✅ | Soft-delete. |

### Body fields
| Field | Type | POST | Notes |
|-------|------|:----:|-------|
| `processId` | hash | ✅ | TherapyProcess this note belongs to. |
| `appointmentId` | hash \| null | — | Omit for free-standing notes. Cannot be a cancelled appointment. |
| `summary` | string | ✅ | Brief clinical summary. |
| `observations` | string \| null | — | Detailed clinical observations. |
| `interventions` | string \| null | — | Techniques / interventions applied. |
| `homework` | string \| null | — | Tasks assigned to patient. |
| `nextSteps` | string \| null | — | Topics planned for next session. |
| `privateNotes` | string \| null | — | Never exposed to patient. |

---

## Session Plan Templates (`/api/session-plan-template`)

Prompt templates used to instruct OpenAI when generating a session plan via Telegram.

**Visibility rules:**
- **System templates** (`isSystem = true`) are created by the platform and are visible to all therapists but cannot be modified or deleted.
- **Own templates** (`isSystem = false`) are private to each therapist and fully manageable.

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET`    | `/api/session-plan-template` | ✅ | List all templates visible to the authenticated therapist (own + system). |
| `GET`    | `/api/session-plan-template/{hash}` | ✅ | Get full detail of a visible template. |
| `POST`   | `/api/session-plan-template` | ✅ | Create a new template owned by the authenticated therapist. |
| `PATCH`  | `/api/session-plan-template/{hash}` | ✅ | Update own template. Returns `403` for system templates. |
| `DELETE` | `/api/session-plan-template/{hash}` | ✅ | Soft-delete own template. Returns `403` for system templates. |

### Body fields (POST / PATCH)
| Field | Type | POST | PATCH | Notes |
|-------|------|:----:|:-----:|-------|
| `name` | string | ✅ | ✅ | |
| `description` | string \| null | — | ✅ | |
| `systemPrompt` | string | ✅ | ✅ | OpenAI system-role instruction. |
| `userPromptTemplate` | string | ✅ | ✅ | User-role prompt. Use `{{placeholder}}` tokens (see below). |
| `isDefault` | bool | — | ✅ | Sets this template as the therapist's preferred default. Clears the previous default. |
| `sessionsToAnalyze` | int (1–10) | — | ✅ | Number of past session summaries to include as context. Default `3`. |
 
### Placeholder tokens for `userPromptTemplate`
| Token | Replaced with |
|-------|---------------|
| `{{patient_name}}` | Patient's full name |
| `{{reason_for_consultation}}` | Main reason the patient sought therapy |
| `{{session_count}}` | Number of completed session notes for this therapy process |
| `{{previous_sessions}}` | Last N session summaries (oldest → newest), where N = `sessionsToAnalyze` |
| `{{next_appointment_date}}` | Date and time of the upcoming appointment (`d/m/Y H:i`) |
| `{{next_appointment_type}}` | Appointment type label (`Presencial`, `Online`, `Teléfono`, `Visita domiciliaria`) |

### List / GET — response shape
```json
[
  {
    "id": "hash",
    "name": "Plantilla estándar de sesión",
    "description": "Plantilla general para sesiones individuales.",
    "isDefault": true,
    "isSystem": true,
    "sessionsToAnalyze": 3
  }
]
```

### GET `/{hash}` — full item shape
```json
{
  "id": "hash",
  "name": "Plantilla estándar de sesión",
  "description": "Plantilla general para sesiones individuales.",
  "systemPrompt": "Eres un asistente de planificación clínica...",
  "userPromptTemplate": "Paciente: {{patient_name}}\n...",
  "isDefault": true,
  "isSystem": true,
  "sessionsToAnalyze": 3,
  "createdAt": "2026-04-02T12:00:00+00:00",
  "updatedAt": null
}
```

---

## Session Plans (`/api/session-plan`)

AI-generated clinical session plans, linked to an appointment and optionally to a `SessionPlanTemplate`.

> Plans are also accessible via `SessionNote`: the note's `planId` and `plan` (content string) fields
> are populated automatically after a plan is generated.

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET`    | `/api/session-plan/{appointmentHash}` | ✅ | Get the existing plan for an appointment (or empty `{}` if none). |
| `POST`   | `/api/session-plan/{appointmentHash}` | ✅ | Generate (or regenerate) a plan. |
| `DELETE` | `/api/session-plan/{appointmentHash}` | ✅ | Remove the plan (sets `session_note.session_plan_id = null`). |

### POST — body
| Field | Type | Required | Notes |
|-------|------|:--------:|-------|
| `templateId` | hash \| null | — | Template to use. Omit to use the therapist's default, or the platform default. |
| `regenerate` | bool | — | `true` forces a new generation even if a plan already exists. Default `false`. |

### Response shape (GET / POST)
```json
{
  "id": "hash",
  "appointmentId": "hash",
  "templateId": "hash",
  "templateName": "Plantilla estándar de sesión",
  "content": "**Objetivos de la sesión**\n...",
  "createdAt": "2026-04-03T10:00:00+00:00",
  "updatedAt": null
}
```

---

## Multimedia (`/api/multimedia`)

Upload files to object storage (MinIO/S3-compatible).  
Files are stored as **unlinked** until their hash is referenced in another entity.

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `POST` | `/api/multimedia` | ✅ | Upload one file. `multipart/form-data` field key: `file`. Returns hash string. |
| `POST` | `/api/multimedia/multiple` | ✅ | Upload multiple files. Returns `[{ "id": "hash", "key": "fieldKey" }]`. |

---

## Typical web-client flows

### 1 — Therapist onboarding
```
POST /api/therapist/register         → receive token, store it
POST /api/workspace                  → create extra workspaces (optional)
POST /api/tag  (×N)                  → create classification tags
```

### 2 — Add a patient and start a process
```
POST /api/patient                    → { firstName, lastName, ... }
POST /api/patient/{hash}/guardian    → (if isMinor = true)
POST /api/process                    → { patientId, reasonForConsultation, tagIds }
```

### 3 — Schedule → confirm → complete a session
```
POST  /api/appointment               → { patientId, processId, appointmentType, startAt, endAt }
PATCH /api/appointment/{hash}        → { appointmentStatus: "confirmed" }
PATCH /api/appointment/{hash}        → { appointmentStatus: "completed" }
POST  /api/session-note              → { processId, appointmentId, summary, ... }
```

### 4 — Cancel and reschedule
```
POST /api/appointment/{hash}/cancel  → { cancelReason, cancelledBy: "therapist" }
POST /api/appointment                → { ..., rescheduledFromId: "{original hash}" }
```

### 5 — Close / disable / archive a therapy process
```
PATCH /api/process/{hash}              → { processStatus: "closed", closedAt: "2026-04-01T00:00:00" }
POST  /api/process/{hash}/disable      → temporarily inactive (status: disabled)
POST  /api/process/{hash}/archive      → read-only record (status: archived)
DELETE /api/process/{hash}             → soft-delete (removed from all listings permanently)
```

### 6 — Refresh JWT on page load
```
POST /api/user/refreshToken          → { refreshToken: "..." }
```

---

## Error conventions

| Code | Meaning | Body shape |
|------|---------|------------|
| `200` | OK | varies |
| `201` | Created | resource object |
| `400` | Validation error | `{ "field": ["error message"] }` |
| `401` | Invalid / expired token | `{ "message": "..." }` |
| `403` | Resource does not belong to the authenticated therapist | `{ "message": "..." }` |
| `404` | Resource not found | — |
| `418` | Business rule violation | `{ "message": "..." }` |

---

## Required request headers

| Header | Routes | Example value |
|--------|--------|---------------|
| `token` | All `api/*` | `eyJ0eXAiOiJKV1Q...` |
| `deviceId` | All routes | `web-client-v1` (fixed string per client) |
| `deviceType` | All routes | `2` (fixed integer for web) |
| `locale` | All routes | `es` or `en` |
| `Content-Type` | Requests with body | `application/json` |
