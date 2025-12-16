# GoStartHub Login Credentials

## Admin Access

**Admin Login Page:** http://localhost:3000/admin/login

**Credentials:**
- Email: `admin@gostarthub.com`
- Password: `admin123`
- Role: admin

## Mentor Access

**Mentor Login Page:** http://localhost:3000/mentor/login

**Credentials:**
- Email: `mentor@gostarthub.com`
- Password: `mentor123`
- Role: mentor

## Regular User Access

**User Login Page:** http://localhost:3000/login

**Available Users:**
1. John
   - Email: `John@gmail.com`
   - Role: user

2. May
   - Email: `May@gmail.com`
   - Role: user

3. Caleb
   - Email: `Caleb@gmail.com`
   - Role: user

4. TC
   - Email: `tc@gmail.com`
   - Role: user

**Note:** Since these are existing users, you'll need to know their passwords or reset them using the `reset_user_password.js` script.

## Password Reset Scripts

If you need to reset passwords:

**Admin Password:**
```bash
node reset_admin_password.js
```

**User Password:**
```bash
node reset_user_password.js
```

## Quick Start Testing

1. **Test Mentor System:**
   - Login at http://localhost:3000/mentor/login with `mentor@test.com` / `mentor123`
   - Access mentor dashboard
   - Browse startups and apply to mentor

2. **Test Admin Panel:**
   - Login at http://localhost:3000/admin/login with `test@example.com` / `password123`
   - View and manage startups
   - Approve mentors
   - View mentorship requests

3. **Test Regular User:**
   - Login at http://localhost:3000/login
   - Submit a startup
   - Request mentorship
