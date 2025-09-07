
#!/bin/bash

echo "Running tests with coverage..."
npm run test:coverage

echo ""
echo "Coverage report generated in ./coverage directory"
echo "Open ./coverage/lcov-report/index.html in your browser to view detailed coverage"
