# CSI-ProjectManage

A modern project management system for Computer Science students and administrators, built with React, Ant Design, and Vite.

## Overview

CSI-ProjectManage is a comprehensive project management platform that supports dual roles:

- **Student Role**: Upload projects, view personal analytics, and manage submitted work
- **Admin Role**: Review and approve projects, manage users, and monitor system analytics

## Features

### Student Features
- 📁 **Project Upload**: Easy-to-use project submission system
- 📊 **Personal Analytics**: View project statistics and performance metrics
- 📈 **Project Tracking**: Monitor approval status and feedback
- 🎯 **Dashboard**: Personalized dashboard with project overview

### Admin Features
- ✅ **Project Review**: Approve or reject student submissions
- 👥 **User Management**: Manage student and admin accounts
- 📊 **System Analytics**: Comprehensive system statistics and reports
- 🔍 **Advanced Filtering**: Filter and search projects by various criteria
- 📝 **Activity Logs**: Monitor system activity and user actions

## 🔐 Enhanced Security Features

### Authentication & Authorization
- 🛡️ **Enhanced JWT Security**: Token structure validation with 5-minute expiry buffer
- 🔐 **AES Encryption**: All sensitive data encrypted using AES-256
- 🍪 **Secure Cookies**: HttpOnly, Secure, SameSite=Strict cookie configuration
- 🔑 **CSRF Protection**: Cross-Site Request Forgery token validation
- 🎯 **Rate Limiting**: Brute force protection with configurable attempt limits
- ⏱️ **Session Management**: Automatic session timeout and activity monitoring
- 🧬 **Browser Fingerprinting**: Additional security layer for session validation

### Data Protection
- 📦 **Secure Storage**: Encrypted localStorage with TTL and version control
- 🔍 **Token Validation**: Multi-layer JWT validation with role verification
- 🧹 **Automatic Cleanup**: Invalid cookie and session cleanup
- 📝 **Audit Trail**: Comprehensive login history and security event logging
- 🚫 **Account Lockout**: Temporary account lockout after failed attempts

## Technology Stack

- **Frontend Framework**: React 19
- **UI Library**: Ant Design 5.24.4
- **Build Tool**: Vite 6.2.0
- **Routing**: React Router DOM 7.3.0
- **Charts**: Recharts 2.15.1
- **Date Handling**: dayjs 1.11.10
- **HTTP Client**: Axios 1.8.4
- **State Management**: Context API with custom hooks
- **Styling**: Tailwind CSS 3.4.17
- **Security**: crypto-js 4.x, uuid 9.x for encryption and secure ID generation
- **Cookie Management**: js-cookie 3.0.5 with enhanced security
- **JWT Processing**: jwt-decode 4.0.0 with structure validation

## Performance Optimizations

- ⚡ **Caching System**: Intelligent caching to reduce duplicate API calls
- 🔄 **Request Deduplication**: Prevents multiple identical requests
- 📱 **Responsive Design**: Mobile-first approach with Ant Design Grid
- ⏱️ **Debounced Search**: Optimized search with 300ms debounce
- 🧹 **Memory Management**: Proper cleanup of resources and subscriptions
- 🚀 **Code Splitting**: Dynamic imports for better performance

## Project Structure

```
CSI-ProjectManage/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   ├── common/         # Common UI components
│   │   ├── projects/       # Project-related components
│   │   └── users/          # User management components
│   ├── pages/              # Page components
│   │   ├── student/        # Student-specific pages
│   │   ├── projects/       # Project management pages
│   │   ├── users/          # User management pages
│   │   └── log/            # System logs pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── context/            # React Context providers
│   ├── utils/              # Utility functions
│   ├── constants/          # Application constants
│   └── layouts/            # Layout components
├── public/                 # Static assets
└── dist/                   # Build output
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd CSI-ProjectManage
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:4000/csie/backend2
   VITE_API_URL_PROD=https://sitspu.com/csie/backend2
   
   # Security Configuration
   VITE_APP_SECRET_KEY=your-secure-secret-key-here
   VITE_ENCRYPTION_ENABLED=true
   VITE_RATE_LIMITING_ENABLED=true
   VITE_SESSION_TIMEOUT=1800000
   VITE_MAX_LOGIN_ATTEMPTS=5
   VITE_LOCKOUT_DURATION=900000
   
   # Application Configuration
   VITE_APP_NAME=CSI ProjectManage
   VITE_APP_VERSION=1.0.0
   VITE_BASE_PATH=/csif
   
   # Enhanced Cookie Security
   VITE_COOKIE_SECURE=false
   VITE_COOKIE_SAME_SITE=Strict
   VITE_AUTH_TOKEN_EXPIRY=7
   VITE_COOKIE_PREFIX_SECURE=true
   
   # Security Headers
   VITE_CSP_ENABLED=true
   VITE_XSS_PROTECTION=true
   VITE_FRAME_OPTIONS=DENY
   ```

4. **Development**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

6. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Role-Based Access Control

The application implements comprehensive role-based routing:

### Student Access
- `/student/dashboard` - Student dashboard
- `/student/analytics` - Personal project analytics
- `/projects/upload` - Project upload form
- `/projects/my-projects` - Personal project list
- `/projects/:id` - Project details (own projects only)

### Admin Access
- `/dashboard` - Admin dashboard
- `/projects` - All projects management
- `/projects/pending` - Pending approvals
- `/projects/stats` - Project statistics
- `/users` - User management
- `/logs/*` - System logs and monitoring

## API Integration

The application integrates with a backend API that provides:

- **Authentication**: JWT-based authentication for both roles
- **Project Management**: CRUD operations for projects
- **User Management**: User account management
- **File Upload**: Support for project files and media
- **Analytics**: Statistical data and reporting
- **Logging**: System activity tracking

## Key Components

### Custom Hooks
- `useProject`: Optimized project management with caching
- `useUser`: User management and authentication
- `useLog`: System logging and analytics
- `useDebounce`: Performance optimization for search

### Context Providers
- `AuthContext`: Authentication state management
- `AdminStateContext`: Application state management

### Security Features
- **Token Encryption**: All authentication tokens encrypted before storage
- **Rate Limiting**: Configurable login attempt limits (default: 5 attempts)
- **Session Security**: Automatic session timeout (default: 30 minutes)
- **CSRF Protection**: Cross-site request forgery token validation
- **Browser Fingerprinting**: Additional security layer for session validation
- **Secure Cookies**: Production-ready cookie security with proper flags
- **Data Encryption**: AES-256 encryption for sensitive data storage
- **Audit Logging**: Comprehensive security event logging
- **Token Validation**: Multi-layer JWT token structure and content validation
- **Account Lockout**: Temporary lockout after failed login attempts

### Performance Features
- Request cancellation to prevent memory leaks
- Intelligent caching with TTL (5 minutes default)
- Debounced search and filtering
- Optimistic updates for better UX
- Proper cleanup on component unmount
- Encrypted secure storage with automatic cleanup

## Development Guidelines

1. **Code Style**: Follow React best practices and ESLint rules
2. **Performance**: Always consider caching and request optimization
3. **Accessibility**: Use Ant Design components for better accessibility
4. **Responsiveness**: Mobile-first design approach
5. **Error Handling**: Comprehensive error handling and user feedback

## Security Configuration

### Production Security
```javascript
// Automatic security features in production:
- __Secure- prefixed cookies
- Strict SameSite policy
- Domain-restricted cookies
- Enhanced CSRF protection
- Automatic session cleanup
```

### Development Security
```javascript
// Development-friendly security:
- Relaxed cookie settings for localhost
- Enhanced logging for debugging
- Security warnings and validations
- Rate limiting with lower thresholds
```

## Build Output

The production build includes:
- Optimized JavaScript bundles (2.4MB minified, 722KB gzipped)
- CSS optimization and minification (18.67KB)
- Font files for Thai language support
- Static assets optimization
- Security libraries and encryption modules

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code structure and naming conventions
2. Ensure all new features include proper error handling
3. Add appropriate TypeScript types where applicable
4. Test thoroughly on both student and admin roles
5. Update documentation for new features

## License

This project is licensed under the MIT License.

---

**Transformed from**: CSI-Showcase-Admin_FrontEnd  
**Current Version**: 1.0.0  
**Build System**: Vite 6.2.1  
**Node.js**: Compatible with Node.js 16+
