#!/bin/bash
cd /home/kavia/workspace/code-generation/task-management-system-206918-206928/task_manager_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

