# Build Rules & Development Guidelines

## Code Standards

### TypeScript
- Use TypeScript for all new code
- Enable strict mode
- Define proper types (avoid `any`)
- Use interfaces for object shapes

### Formatting
- Use Prettier for formatting
- 2 spaces indentation
- Single quotes for strings
- Semicolons required

### Naming Conventions
- **Files:** kebab-case (`user-profile.tsx`)
- **Components:** PascalCase (`UserProfile`)
- **Functions:** camelCase (`getUserProfile`)
- **Constants:** UPPER_SNAKE_CASE (`API_URL`)

---

## Git Workflow

### Branches
- `main` - Production ready code
- `develop` - Development branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Emergency fixes

### Commits
- Use conventional commits format
- Examples:
  - `feat: add QNS domain search`
  - `fix: resolve wallet connection issue`
  - `docs: update deployment guide`
  - `refactor: simplify contract interaction`

---

## Testing

### Required Tests
- Unit tests for utilities
- Integration tests for API endpoints
- Component tests for React components
- Contract tests for smart contracts

### Running Tests
```bash
# All tests
pnpm test

# Specific workspace
cd apps/api && pnpm test
cd apps/web && pnpm test
cd packages/contracts && pnpm test
```

---

## Smart Contracts

### Development
- Use Hardhat for development
- Write comprehensive tests
- Document all functions
- Follow Solidity style guide

### Deployment
- Test on testnet first
- Verify contracts on QuaiScan
- Document deployment addresses
- Keep deployment scripts updated

---

## API Development

### REST Endpoints
- Use RESTful conventions
- Proper HTTP methods
- Clear error messages
- Consistent response format

### GraphQL
- Schema-first approach
- Resolve efficiently (avoid N+1)
- Use DataLoader for batching
- Document queries/mutations

---

## Frontend Development

### Components
- Functional components only
- Use hooks for state
- Keep components small
- Reuse common patterns

### State Management
- React Context for global state
- Local state for component-specific
- Avoid prop drilling

### Styling
- Use Tailwind CSS
- Follow design system
- Mobile-first approach
- Dark mode support

---

## Performance

### General
- Minimize bundle size
- Lazy load components
- Optimize images
- Use caching where appropriate

### Database
- Use indexes
- Optimize queries
- Use connection pooling
- Monitor slow queries

---

## Security

### Never Commit
- Private keys
- API keys
- Passwords
- Sensitive data

### Best Practices
- Validate all inputs
- Sanitize user data
- Use environment variables
- Keep dependencies updated

---

## Documentation

### Code Documentation
- JSDoc for functions
- Comments for complex logic
- README for each package
- API documentation

### User Documentation
- Keep `/docs` updated
- Clear examples
- Troubleshooting guides
- Architecture diagrams

---

## Review Process

### Before PR
- [ ] Code compiles without errors
- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] No console.logs in production code

### PR Requirements
- Clear description
- Screenshots if UI changes
- Link to issue
- Self-review completed

---

## Deployment

### Pre-deployment
- [ ] All tests pass
- [ ] Code reviewed
- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] Backup created

### Post-deployment
- [ ] Smoke tests passed
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team notified

---

## Support

For questions or issues:
- Check documentation first
- Ask in team chat
- Create GitHub issue
- Contact maintainers
