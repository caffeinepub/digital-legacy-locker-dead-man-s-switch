# Specification

## Summary
**Goal:** Add a Death Verification Request feature to the Digital Legacy Locker, allowing heirs to submit verified access requests, with admin dashboard integration for review and approval.

**Planned changes:**
- Add a new frontend route `/death-verification-request` with a dark-themed form collecting deceased user info, heir details, and three file uploads (Government ID, Death Certificate, optional Relationship Proof), with file validation (PDF/JPG/PNG, max 10MB) and privacy/security callout labels
- Implement an in-app OTP verification step on the page (consistent with existing LoginPage/RegistrationPage pattern) that must be completed before the form can be submitted
- Show a confirmation card after successful submission with a checkmark icon, security badge, and message about 3–5 business day review
- Add `DeathVerificationRequest` type and stable storage in `backend/main.mo` with all required fields (including Blob uploads), status variant (`#PendingVerification | #Approved | #Rejected`), timestamp, and unique requestId
- Expose a `submitDeathVerificationRequest` update function that stores the record and logs a timestamped activity entry
- Expose admin-only `getDeathVerificationRequests` query and `updateDeathVerificationStatus` update functions with role-based access control
- Add a Death Verification Requests section to the Admin dashboard displaying a table with all request fields, SecurityBadge status indicators, and Approve/Reject action buttons
- Add a "Submit Heir Verification Request" navigation link in the public-facing Navbar or Landing page CTA, and register the route in App.tsx

**User-visible outcome:** Heirs can navigate to a public page, complete identity verification via OTP, submit a death verification request with supporting documents, and receive a confirmation. Admins can view all submissions in the dashboard and approve or reject them.
