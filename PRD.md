# ManoShaanti Product Requirements Document (PRD)

## 1. Product Summary
ManoShaanti is an AI-powered mental wellness platform focused on calm, compassionate, and privacy-first emotional support.

Primary value:
- empathetic chatbot assistance.
- simple daily wellness activities.
- optional deeper personalization through a freemium upgrade.
- inclusive access features, including voice and ASL support.

## 2. Product Objectives
- deliver fast emotional support with as little friction as possible.
- keep essential safety and wellness capabilities available to everyone.
- improve AI replies using safe, summarized personal context.
- build trust through minimal data collection and transparent controls.

## 3. Out of Scope
- clinical diagnosis or medical treatment.
- acting as an emergency response replacement.
- regulated healthcare workflow handling.
- collection of high-risk personal identifiers.

## 4. Ethical Rule (Mandatory)
The following features must never be locked behind payment:
- AI chatbot access
- crisis-support behavior
- breathing exercises
- basic mental health assessment
- emotion detection
- ASL accessibility

Paid plans may improve personalization and tracking only.

## 5. User Groups
- Anonymous user: receives quick support without account creation.
- Free signed-in user: gets core tools with basic tracking.
- Premium user: receives richer memory, trend insights, and personalization.
- Student plan user: gets premium-level access at reduced pricing.

## 6. Plans and Pricing
- Free
- Premium: 149 INR
- Student Plan: 79 INR

## 7. Feature Access Framework

### 7.1 Free Plan
- AI chatbot (basic)
- emotion detection
- ASL recognition
- mental health assessment
- breathing activity
- sleep wellness content (music, white noise, ASMR, relaxation videos)
- mini games (matching card game, wordle)
- habit builder (single plant)
- limited journal entries

### 7.2 Premium and Student Plans
- complete chat memory with stronger context continuity
- advanced mood analytics and trends
- assessment history tracking
- unlimited journal entries
- journal insights
- expanded habit garden
- additional relaxation content
- extended mini game progression and bonuses
- advanced reward badges/themes

## 8. Core Functional Requirements

### FR-1: Context-aware chatbot generation
For each chat request, the backend must assemble a context object using:
- most recent assessment level
- currently detected emotion
- recent chat summary
- journal themes (when permitted)
- profile context

### FR-2: Context priority order
Response logic must follow this order of priority:
1. crisis detection
2. assessment level
3. detected emotion
4. chat summary
5. journal themes
6. profile context

### FR-3: Crisis safety override
When crisis phrases are detected, the system must intercept risky messages and return crisis-safe guidance instead of normal AI generation.

### FR-4: Journal privacy control
Journal content must remain private by default. Only summarized themes may be used, and only when the user explicitly enables chatbot access.

### FR-5: Voice interaction
The frontend must support optional browser-based:
- speech-to-text for user input
- text-to-speech for assistant responses
- optional auto-read for assistant responses

### FR-6: Freemium UX communication
The UI must clearly differentiate free and premium capabilities using subtle lock/badge indicators, with gentle (non-aggressive) upgrade prompts.

### FR-7: Plan visibility in settings
The settings page must display the active plan and provide a path to upgrade/manage.

## 9. Data and Privacy Requirements
- collect only minimal account fields: username, email, password.
- do not send sensitive PII (phone, trusted contacts, raw journal text) to the AI model.
- send only summarized wellness context to the AI provider.
- enforce route-level authentication and ownership checks for personal data.

## 10. UX and Accessibility Requirements
- calm, minimal interface style.
- non-pushy premium messaging.
- optional, non-blocking voice interaction.
- graceful fallback when speech APIs are unavailable.

## 11. Primary User Flows

### Flow A: Anonymous support
1. User opens the app.
2. User accesses chatbot, breathing, sleep, and mini games without signing in.
3. User gets immediate support tools with no paywall on essentials.

### Flow B: Personalized support
1. User logs in.
2. User records journals, assessments, emotions, and chat sessions.
3. Context builder summarizes relevant data per request.
4. AI reply uses personalized context.

### Flow C: Premium upgrade
1. Free user selects a premium-locked feature.
2. A calm upgrade modal appears with plan benefits.
3. User can upgrade now or defer.

## 12. Success Metrics
- chatbot reliability and response latency.
- correctness of crisis interception.
- retention in free essential features.
- premium conversion without reducing accessibility.
- ongoing engagement with journal and mood tracking.

## 13. Risks and Mitigations
- Risk: over-personalized or inaccurate emotional inference.
  - Mitigation: summary-based context, non-diagnostic language, fallback defaults.
- Risk: privacy leakage through prompts.
  - Mitigation: strict context sanitization and exclusion lists.
- Risk: trust erosion from aggressive monetization.
  - Mitigation: ethical no-paywall policy and gentle premium UX.

## 14. Current Scope Status
Implemented:
- freemium UI layer (free/premium/student plan states)
- premium indicators, upgrade modal, and upgrade page
- backend context builder module
- structured context/prompt handoff to AI service
- chatbot frontend voice input/output integration
- crisis-safe chat interception and core wellness flows
