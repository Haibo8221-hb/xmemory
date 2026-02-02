#!/bin/bash
# xmemory E2E Test Runner
# Usage: ./run-tests.sh [options]
#
# Options:
#   --url URL        Test URL (default: https://xmemory.work)
#   --auth COOKIE    Session cookie for authenticated tests
#   --headed         Run in headed mode (show browser)
#   --debug          Enable debug mode
#   --spec FILE      Run specific test file
#   --report         Open HTML report after tests

set -e

# Default values
TEST_URL="${TEST_URL:-https://xmemory.work}"
HEADED=""
DEBUG=""
SPEC=""
OPEN_REPORT=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --url)
      TEST_URL="$2"
      shift 2
      ;;
    --auth)
      export TEST_SESSION_COOKIE="$2"
      shift 2
      ;;
    --headed)
      HEADED="--headed"
      shift
      ;;
    --debug)
      DEBUG="--debug"
      shift
      ;;
    --spec)
      SPEC="$2"
      shift 2
      ;;
    --report)
      OPEN_REPORT="1"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "=========================================="
echo "xmemory E2E Tests"
echo "=========================================="
echo "Target URL: $TEST_URL"
echo "Headed: ${HEADED:-no}"
echo "Debug: ${DEBUG:-no}"
echo "Auth: ${TEST_SESSION_COOKIE:+provided}"
echo "=========================================="

# Change to test directory
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Install Playwright browsers if needed
npx playwright install chromium --with-deps 2>/dev/null || true

# Run tests
export TEST_URL
echo ""
echo "Running tests..."
echo ""

if [ -n "$SPEC" ]; then
  npx playwright test "$SPEC" $HEADED $DEBUG --config=playwright.config.ts
else
  npx playwright test $HEADED $DEBUG --config=playwright.config.ts
fi

# Open report if requested
if [ -n "$OPEN_REPORT" ]; then
  npx playwright show-report
fi

echo ""
echo "=========================================="
echo "Tests completed!"
echo "=========================================="
