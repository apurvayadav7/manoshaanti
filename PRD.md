# ManoShaanti Product Requirements Document (PRD)

## 1. Product Overview
ManoShaanti is an AI mental wellness platform designed for calm, supportive, and privacy-first emotional support.

Core value:
- empathetic chatbot support.
- lightweight daily wellness activities.
- optional long-term personalization via freemium upgrade.
- accessible interactions, including voice and ASL support.

## 2. Product Goals
- provide immediate emotional support with minimal friction.
- preserve access to essential safety and wellness features for all users.
- personalize AI responses through safe, summarized context.
- maintain user trust through minimal data collection and clear controls.

## 3. Non-Goals
- clinical diagnosis or treatment.
- emergency replacement services.
- regulated medical workflows.
- collection of high-risk personal identifiers.

## 4. Ethical Rule (Critical)
The following must never be paywalled:
- AI chatbot access
- crisis support behavior
- breathing exercises
- basic mental health assessment
- emotion detection
- ASL accessibility

Premium enhances personalization and tracking only.

## 5. User Segments
- Anonymous user: quick support without signup.
- Free authenticated user: basic tracking and core tools.
- Premium user: advanced memory, trends, and personalization.
- Student plan user: premium-equivalent access at discounted pricing.

## 6. Plans and Pricing
- Free
- Premium: 149 INR
- Student Plan: 79 INR

## 7. Feature Access Model

### 7.1 Free Tier
- AI chatbot (basic)
- emotion detection
- ASL recognition
- mental health assessment
- breathing activity
- sleep hygiene content (music, white noise, ASMR, relaxation videos)
- mini games (matching card game, wordle)
- habit builder (single plant)
- limited journal entries

### 7.2 Premium and Student Tier
- full chat memory and deeper context continuity
- advanced mood reports and trends
- assessment history tracking
- unlimited journal entries
- journal insights
- expanded habit garden
- extra relaxation content
- extended mini game progression and bonuses
- advanced reward badges/themes

## 8. Core Functional Requirements

### FR-1: Context-aware chatbot generation
For every chat request, backend shall build a context object from:
- latest assessment level
- current detected emotion
- recent chat summary
- journal themes (if allowed)
- profile context

### FR-2: Context priority order
Response behavior priority:
1. crisis detection
2. assessment level
3. detected emotion
4. chat summary
5. journal themes
6. profile context

### FR-3: Crisis override safety
Crisis phrase detection shall intercept risky messages and return crisis-safe guidance instead of standard AI generation.

### FR-4: Journal privacy control
Journal text shall remain private by default and only summarized themes may be used when user explicitly enables chatbot access.

### FR-5: Voice interaction
Frontend shall support optional browser-based:
- speech-to-text for input
- text-to-speech for assistant replies
- optional auto-read assistant responses

### FR-6: Freemium UX communication
UI shall clearly indicate free vs premium features using subtle lock and badge indicators, with non-aggressive upgrade prompts.

### FR-7: Settings plan visibility
Settings page shall show current plan and provide upgrade/manage path.

## 9. Data and Privacy Requirements
- collect minimal account fields: username, email, password.
- never send sensitive PII (phone, trusted contacts, raw journals) to AI model.
- only summarized wellness context should be sent to AI provider.
- enforce route-level auth and ownership checks for personal data.

## 10. UX and Accessibility Requirements
- calm, minimal visual style.
- non-pushy premium messaging.
- voice interaction optional and non-blocking.
- graceful fallback for unsupported speech APIs.

## 11. Key User Flows

### Flow A: Anonymous support
1. Open app.
2. Use chatbot, breathing, sleep, and mini games without login.
3. Access immediate support tools with no paywall on essentials.

### Flow B: Personalized support
1. User logs in.
2. User records journals, assessments, emotions, and chat sessions.
3. Context builder summarizes data per request.
4. AI response uses personalized context.

### Flow C: Premium upgrade
1. Free user taps premium-locked feature.
2. Calm upgrade modal appears with plan benefits.
3. User may upgrade or defer.

## 12. Success Metrics
- chatbot response reliability and latency.
- crisis interception correctness.
- retention in free essential features.
- premium conversion without accessibility regression.
- journal and mood engagement over time.

## 13. Risks and Mitigations
- Risk: over-personalized or incorrect emotional inference.
  - Mitigation: summary-based context, non-diagnostic tone, fallback defaults.
- Risk: privacy leakage in prompts.
  - Mitigation: strict context sanitization and exclusion list.
- Risk: aggressive monetization harming trust.
  - Mitigation: ethical no-paywall list and gentle premium UI.

## 14. Current Scope Status
Implemented:
- freemium UI layer (free/premium/student plan states)
- premium indicators, upgrade modal, upgrade page
- context builder module in backend
- structured context/prompt handoff to AI service
- voice input/output integration in chatbot frontend
- crisis-safe chat interception and core wellness flows
