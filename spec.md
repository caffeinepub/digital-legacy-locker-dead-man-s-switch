# Specification

## Summary
**Goal:** Fix three frontend issues: admin login visibility on the login page, post-login redirects for both admin and regular users, and admin-only navbar links being properly gated.

**Planned changes:**
- Update the LoginPage so that both "User Login" and "Admin Login" options are visible and accessible on initial page load, with clear visual distinction between the two modes
- Fix the post-login redirect logic so that admins are redirected to `/admin/dashboard` after successful login, new users are redirected to `/register`, and returning users are redirected to `/dashboard`
- Update the Navbar to show admin-specific navigation links only when the authenticated user is confirmed as an admin; guests and regular users must not see any admin links; visibility updates correctly on login and logout

**User-visible outcome:** Users can immediately see and switch between user and admin login modes on the login page, are redirected to the correct destination after login, and admin navigation links only appear for admin users in the navbar.
