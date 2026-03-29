# Invitations API — Spec for Copilot Agent

> This document describes the **Invitations** feature that must be implemented on the backend API.  
> The web client (`therapy-web`) is already built and calling these endpoints — they just don't exist yet.

---

## Context

A therapist can invite patients via email. The system generates a unique token, sends an email with a magic link (`{WEB_URL}/invitation/{token}`), and the patient completes registration via that link.

The web client calls:
- `POST /api/therapist/patients/invitations` — send invitation
- `GET  /api/therapist/patients/invitations` — list therapist's invitations
- `POST /api/therapist/patients/invitations/{id}/resend` — resend email
- `POST /api/therapist/patients/invitations/{id}/cancel` — cancel invitation
- `GET  /api/public/invitations/{token}` — fetch invitation by token (public)
- `POST /api/public/invitations/{token}/accept` — accept invitation and register (public)

---

## Entity: `PatientInvitation`

| Field | Type | Notes |
|-------|------|-------|
| `id` | hash/UUID | Opaque, same format as other entity IDs in this project |
| `therapistId` | hash | FK → Therapist |
| `patientId` | hash \| null | FK → Patient; `null` until accepted |
| `firstName` | string | Provided by therapist at invite time |
| `lastName` | string | Provided by therapist at invite time |
| `email` | string | Email address to send the invitation to |
| `phone` | string \| null | Optional |
| `internalNotes` | string \| null | Therapist-only notes, never exposed in public endpoints |
| `token` | UUID | Unique random token used in the magic link — **never returned in list/detail for therapist, only in the public endpoint** |
| `status` | enum | `PENDING` \| `ACCEPTED` \| `EXPIRED` \| `CANCELLED` |
| `expiresAt` | datetime | `createdAt + 7 days` (configurable) |
| `acceptedAt` | datetime \| null | Set on accept |
| `cancelledAt` | datetime \| null | Set on cancel |
| `createdAt` | datetime | |
| `updatedAt` | datetime | |

---

## Endpoints

### 1. `POST /api/therapist/patients/invitations`

**Auth:** therapist JWT required (`token` header).

**Request body:**
```json
{
  "firstName": "María",
  "lastName": "López",
  "email": "maria@example.com",
  "phone": "+34 600 000 000",
  "internalNotes": "Derivada por médico de cabecera"
}
```

| Field | Required | Rules |
|-------|:--------:|-------|
| `firstName` | ✅ | max 100 chars |
| `lastName` | ✅ | max 100 chars |
| `email` | ✅ | valid email; must not already be an active user in this therapist's patient list |
| `phone` | — | |
| `internalNotes` | — | |

**Business logic:**
1. Create `PatientInvitation` with `status = PENDING`, `expiresAt = now + 7 days`, `token = UUID v4`.
2. Send email to `email` with a link: `{WEB_URL}/invitation/{token}`.
   - Email subject (es): `"Invitación de tu terapeuta"`
   - Email body should include therapist's name, and the magic link.
3. Return the created invitation.

**Response `201`:**
```json
{
  "data": {
    "id": "hash",
    "therapistId": "hash",
    "patientId": null,
    "firstName": "María",
    "lastName": "López",
    "email": "maria@example.com",
    "phone": "+34 600 000 000",
    "internalNotes": "Derivada por médico de cabecera",
    "status": "PENDING",
    "expiresAt": "2026-04-06T12:00:00+00:00",
    "acceptedAt": null,
    "cancelledAt": null,
    "createdAt": "2026-03-30T12:00:00+00:00",
    "updatedAt": "2026-03-30T12:00:00+00:00"
  },
  "requestId": "uuid"
}
```

> `token` is **NOT** returned here — it is only accessible via the public endpoint.

**Error cases:**
- `400` — missing required fields or invalid email format
- `409` — a PENDING invitation for this email already exists for this therapist

---

### 2. `GET /api/therapist/patients/invitations`

**Auth:** therapist JWT required.

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `PENDING`\|`ACCEPTED`\|`EXPIRED`\|`CANCELLED` | Filter by status |
| `page` | int | Default `1` |
| `size` | int | Default `20`, max `100` |

**Business logic:** Return all invitations for the authenticated therapist, ordered by `createdAt DESC`.

**Response `200`:**
```json
{
  "data": {
    "items": [
      {
        "id": "hash",
        "therapistId": "hash",
        "patientId": null,
        "firstName": "María",
        "lastName": "López",
        "email": "maria@example.com",
        "phone": null,
        "status": "PENDING",
        "expiresAt": "2026-04-06T12:00:00+00:00",
        "acceptedAt": null,
        "cancelledAt": null,
        "createdAt": "2026-03-30T12:00:00+00:00",
        "updatedAt": "2026-03-30T12:00:00+00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 20
  },
  "requestId": "uuid"
}
```

> `internalNotes` and `token` are **NOT** returned in list responses.

---

### 3. `POST /api/therapist/patients/invitations/{id}/resend`

**Auth:** therapist JWT required.

**Path param:** `id` — invitation ID (hash).

**Business logic:**
1. Verify invitation belongs to the authenticated therapist.
2. Allowed if `status = PENDING` OR `status = EXPIRED`.
3. Reset `expiresAt = now + 7 days`.
4. If `EXPIRED`, set `status = PENDING`.
5. Resend the email (same template as creation).

**Response `200`:** Returns the updated invitation object (same shape as creation response).

**Error cases:**
- `404` — invitation not found or does not belong to therapist
- `422` — invitation is `ACCEPTED` or `CANCELLED` (cannot resend)

---

### 4. `POST /api/therapist/patients/invitations/{id}/cancel`

**Auth:** therapist JWT required.

**Path param:** `id` — invitation ID (hash).

**Business logic:**
1. Verify invitation belongs to the authenticated therapist.
2. Only allowed if `status = PENDING`.
3. Set `status = CANCELLED`, `cancelledAt = now`.

**Response `200`:** Returns the updated invitation object.

**Error cases:**
- `404` — not found or not owned by therapist
- `422` — invitation is already `ACCEPTED`, `EXPIRED`, or `CANCELLED`

---

### 5. `GET /api/public/invitations/{token}`

**Auth:** None required. This is a public endpoint.  
Include standard public headers (`deviceId`, `deviceType`, `locale`) if the project enforces them on public routes.

**Path param:** `token` — the UUID token from the magic link.

**Business logic:** Look up invitation by `token`. Return it regardless of status — the web client checks `status` to decide what to show.

**Response `200`:**
```json
{
  "data": {
    "id": "hash",
    "firstName": "María",
    "lastName": "López",
    "email": "maria@example.com",
    "status": "PENDING",
    "expiresAt": "2026-04-06T12:00:00+00:00",
    "acceptedAt": null,
    "cancelledAt": null,
    "createdAt": "2026-03-30T12:00:00+00:00"
  },
  "requestId": "uuid"
}
```

> Do **NOT** expose: `internalNotes`, `therapistId`, `patientId`, `token`, `updatedAt`.

**Error cases:**
- `404` — token not found

---

### 6. `POST /api/public/invitations/{token}/accept`

**Auth:** None required. Public endpoint.

**Path param:** `token` — invitation UUID token.

**Request body:**
```json
{ "password": "NewSecurePass1!" }
```

| Field | Required | Rules |
|-------|:--------:|-------|
| `password` | ✅ | Min 8 chars, at least 1 uppercase, 1 number |

**Business logic:**
1. Find invitation by `token`.
2. Validate: `status = PENDING` AND `expiresAt > now`. If expired → `422 INVITATION_EXPIRED`. If not pending → `422 INVITATION_NOT_PENDING`.
3. Create a `User` with:
   - `email` from invitation
   - `firstName`, `lastName` from invitation
   - `password` hashed with the project's standard hasher
   - `role = ROLE_PATIENT`
4. Create a `Patient` linked to the therapist (`therapistId` from invitation):
   - `firstName`, `lastName`, `email`, `phone` from invitation
   - `patientStatus = active`
5. Update invitation: `status = ACCEPTED`, `acceptedAt = now`, `patientId = patient.id`.
6. Return a JWT token so the patient is immediately logged in.

**Response `201`:**
```json
{
  "data": {
    "user": {
      "id": "hash",
      "name": "María López",
      "email": "maria@example.com",
      "roles": ["ROLE_PATIENT"]
    },
    "token": "<JWT>",
    "refreshToken": "<UUID>"
  },
  "requestId": "uuid"
}
```

**Error cases:**
- `404` — token not found
- `422` with code `INVITATION_EXPIRED` — token found but past `expiresAt`
- `422` with code `INVITATION_NOT_PENDING` — status is not `PENDING`
- `409` — email already registered as a user

---

## Response envelope

All responses follow the project's standard envelope:
```json
{ "data": { ... }, "requestId": "uuid" }
```
The web client's Axios interceptor automatically unwraps `response.data.data` → `response.data`.

---

## Email template variables

| Variable | Value |
|----------|-------|
| `{{patientFirstName}}` | `invitation.firstName` |
| `{{therapistName}}` | Therapist's full name |
| `{{magicLink}}` | `{WEB_URL}/invitation/{token}` |
| `{{expiresAt}}` | Human-readable date, locale `es` |

---

## Database migration notes

- New table `patient_invitation` (or equivalent name per project conventions).
- Index on `token` (unique).
- Index on `(therapistId, status)` for list queries.
- Index on `email` for duplicate-check on creation.
- Soft-delete is NOT needed — use `status` field instead.

---

## Security notes

- `token` must be a cryptographically random UUID v4 — never sequential or guessable.
- Never return `token` in any authenticated therapist endpoint — only via the public `/public/invitations/{token}` lookup.
- Rate-limit the public `GET` and `POST` endpoints to prevent token enumeration.
- The `accept` endpoint must be idempotent against double-submit (return `409` if user already exists).
