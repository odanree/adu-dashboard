# ADU Dashboard Test Suite

Comprehensive test coverage for ADU Dashboard functionality, including API authorization, budget display, user sign-in flows, and feature gating.

## Test Structure

### Unit Tests (Jest)
- `tests/api.test.js` - Tests for `/api/sheets-link` endpoint
  - Whitelist authorization logic
  - Email case-insensitivity
  - CORS headers
  - Error handling

### End-to-End Tests (Playwright)
- `tests/e2e.spec.ts` - Full user flow testing
  - **Unsigned user behavior**
    - Budget display ($214k)
    - Feature gating (buttons disabled, categories disabled)
    - Link access blocked
  - **Signed-in user behavior**
    - Budget display ($225k)
    - Features enabled (buttons, category clicks)
    - Phase popup functionality
    - Link access working
  - **Feature Toggle Tests** (NEW)
    - Expand mode toggle works when signed in
    - Cumulative mode toggle works, shows total
    - Category clicks open phase popup
    - Cumulative total hidden/visible correctly
  - **Sign-out flow**
    - Returns all features to disabled state
  - **Cross-browser testing** (Chrome, Firefox, Safari)

## Setup

```bash
# Install dependencies
npm install

# From tests directory
cd tests && npm install
```

## Running Tests

### Unit Tests Only
```bash
npm test
```

### End-to-End Tests Only
```bash
npm run test:e2e
```

### All Tests
```bash
npm run test:all
```

### Watch Mode (Development)
```bash
npm test -- --watch
```

### E2E with UI (Headed Mode)
```bash
HEADED=1 npm run test:e2e
```

## Test Coverage

### Current Coverage
- ✅ API whitelist authorization (8 tests)
- ✅ Budget display logic (unsigned vs signed-in)
- ✅ Link access control
- ✅ Sign-in/sign-out flows
- ✅ Financial details visibility
- ✅ Progress calculation
- ✅ **Feature gating: expand/cumulative buttons** (NEW)
- ✅ **Feature gating: category interactions** (NEW)
- ✅ **Phase popup functionality** (NEW)
- ✅ **Cumulative total display** (NEW)

### Total Test Count
- **8 unit tests** (Jest)
- **20+ E2E tests** (Playwright)
- **~28+ total tests**

### Critical Paths Tested

#### 1. Unsigned User Path ✅
- Views $214k budget
- Sees "Sign in to view financial details"
- Cannot access Google Sheets link
- Progress calculated from $214k base
- **Expand/cumulative buttons disabled** ✅
- **Category boxes have "disabled" class** ✅
- **Cumulative total hidden** ✅

#### 2. Signed-in User Path (Whitelisted) ✅
- Views $225k budget
- Sees financial details: "Phases Total: $214,476.00"
- Can access Google Sheets link
- Progress calculated from $225k base
- **Expand/cumulative buttons enabled** ✅
- **Can click categories to open phase popup** ✅
- **Cumulative total visible in cumulative mode** ✅
- **Category boxes do NOT have "disabled" class** ✅

#### 3. Signed-in User Path (Unauthorized) ✅
- Views $214k budget
- Sees financial details when signed in
- Cannot access Google Sheets link
- Shows "Access denied" alert

#### 4. Sign-out Flow ✅
- All buttons re-disabled
- Categories re-disabled
- Cumulative total hidden
- Financial details return to "Sign in" message

## Before Refactoring

**Always run the full test suite before making changes:**

```bash
npm run test:all
```

This ensures:
- ✅ All tests pass before refactoring
- ✅ Regression detection if tests fail after changes
- ✅ Confidence that functionality is preserved
- ✅ Feature gating still works correctly
- ✅ All UI interactions preserved

## CI/CD Integration

The tests are configured for GitHub Actions (CI environment detection via `process.env.CI`):

```yaml
- name: Run Tests
  run: npm run test:all
```

## Notes for Future Refactoring

1. **Budget Logic**: The budget value determines progress percentage. Ensure test coverage when refactoring.
   - Unsigned users: `totalSpent / 214476`
   - Signed users: `totalSpent / 225200`

2. **Feature Gating**: Critical functionality is locked behind sign-in:
   - Expand/cumulative mode buttons
   - Category clicks (phase popup)
   - Cumulative total display
   - Tests ensure these don't break

3. **API Endpoint**: The `/api/sheets-link` whitelist is critical. Unit tests provide safety here.

4. **UI State**: Sign-in/sign-out triggers UI re-renders. E2E tests catch regressions.

5. **Cross-browser**: E2E tests run on 3 browsers to catch rendering/compatibility issues.

## Troubleshooting

### Tests fail with "Cannot find module"
```bash
cd tests && npm install
cd ..
```

### E2E tests timeout
- Ensure test server is running on port 3000
- Check `BASE_URL` environment variable
- Increase timeout: `test.setTimeout(30000)`

### Playwright headless mode
```bash
HEADED=1 npm run test:e2e  # Run with visible browser
```

### E2E tests can't find elements
- Verify selectors in HTML match test expectations:
  - `.toggle-buttons button` - Expand/Cumulative buttons
  - `.category` - Category boxes
  - `#detailsTotals` - Financial details
  - `#cumulativeTotal` - Cumulative total box
  - `#signOffLink` - Google Sheets link

## Adding New Tests

When adding new features, follow this checklist:

1. ✅ Write unit tests first (Jest) for backend logic
2. ✅ Write E2E tests (Playwright) for user flows
3. ✅ Test both signed-in and signed-out states
4. ✅ Run `npm run test:all` - should pass
5. ✅ Commit with test code
6. ✅ Document the test in this README

Example test template:

```javascript
test('new feature works when signed in', async ({ page }) => {
  // Mock sign-in
  await page.evaluate(() => {
    localStorage.setItem('aduDashboardSession', JSON.stringify({
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/pic.jpg',
      signedInAt: new Date().toISOString()
    }));
  });
  
  await page.reload();
  await page.waitForTimeout(1000);
  
  // Test implementation
  const element = await page.$('.new-feature');
  expect(element).toBeTruthy();
});

test('new feature is disabled when signed out', async ({ page }) => {
  // Don't sign in - use default unsigned state
  
  const element = await page.$('.new-feature');
  const isDisabled = await element?.isDisabled();
  expect(isDisabled).toBe(true);
});
```

## Test Maintenance Schedule

- **Weekly**: Review test output in CI/CD, update selectors if HTML changes
- **Per Feature**: Add tests before refactoring feature
- **Per Bug**: Add regression test when fixing bugs
- **Quarterly**: Review and remove obsolete tests, increase coverage

