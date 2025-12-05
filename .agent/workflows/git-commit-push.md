---
description: Git Commit and Push Workflow
---

1. Check git status
   - Run `git status` to see what has changed.

2. Check for what have been changed by read the changed files.

3. Stage changes
   - Run `git add .` to stage all changes.

4. Commit changes
   - Run `git commit -m "<type>(<optional scope>): <description>"`
   - **Format**: `<type>(<optional scope>): <description>`
   - **Types**:
     - `feat`: New feature for the user, not a new feature for build script
     - `fix`: Bug fix for the user, not a fix to a build script
     - `refactor`: Refactoring production code, e.g. renaming a variable
     - `perf`: Code change that improves performance
     - `style`: Formatting, missing semi colons, etc; no production code change
     - `test`: Adding missing tests, refactoring tests; no production code change
     - `docs`: Documentation only changes
     - `build`: Build related changes (e.g. npm, gradle, etc)
     - `ops`: Infrastructure, deployment, backup, recovery, etc
     - `chore`: Other changes that don't modify src or test files
   - **Scope**: Optional, e.g. `(api)`, `(ui)`, `(auth)`.
   - **Description**: Concise description in imperative, present tense (e.g. "change" not "changed"). No period at the end.
   - **Breaking Changes**: Add `!` before the colon, e.g. `feat!: remove status endpoint`.

5. Push to remote
   - Run `git push` to push the changes to the remote repository.
