# Specification

## Summary
**Goal:** Improve the LoginPage by making admin login clearly visible, switching currency display from $ to ₹, and ensuring authentication state is correctly persisted with proper post-login redirects.

**Planned changes:**
- Add a clearly labeled "Admin Login" button/tab on the LoginPage that is visible without any special URL parameters or hidden interactions
- Make admin login mode visually distinguishable from user login mode
- Replace any $ (USD) currency symbols on the LoginPage with ₹ (INR)
- Ensure authenticated state is persisted after login so page refreshes do not log the user out
- Implement correct post-login redirects: admin users → admin dashboard, registered users → user dashboard, unregistered users → registration page

**User-visible outcome:** Users can clearly see and switch to admin login mode directly on the login page, all currency references show ₹ instead of $, and after logging in users are reliably redirected to the correct page and remain logged in on refresh.
