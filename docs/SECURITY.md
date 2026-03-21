# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in the ADU Dashboard, please email security concerns to the project maintainer instead of using the issue tracker.

### What to Include

Please provide:
- Description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Suggested fix (if you have one)

### Response Timeline

- **Initial response**: Within 48 hours
- **Fix and patch**: Within 7-14 days depending on severity
- **Public disclosure**: After patch is released

## Supported Versions

| Version | Status | Security Updates |
|---------|--------|------------------|
| 2.x | Current | ✅ Yes |
| 1.x | Legacy | ❌ No |

## Best Practices

- Keep dependencies updated: `npm audit fix`
- Review `.env` configuration for sensitive data
- Use HTTPS in production
- Implement proper authentication/authorization
- Keep API endpoints secured

## Security Features

- Email-based authentication with whitelist
- Backend-enforced access control
- Environment variable configuration for secrets
- CORS headers on API endpoints
- HTTP method validation
