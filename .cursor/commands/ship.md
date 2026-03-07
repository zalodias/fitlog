# Ship

Branch, commit & push changes, open a PR.

## Steps

1. Run `git status` and `git diff` to understand all staged and unstaged changes, including untracked files.

2. Infer a branch name from the nature of the changes. Follow the branch naming conventions in @.cursor/rules/git.mdc. If a branch already exists (not `main`), skip creation and use it.

3. Create the branch with `git switch -c <branch-name>` (skip if already on a feature branch).

4. Group the changes into logical, atomic commits — each commit should represent one coherent unit of work (e.g. a new utility module, a refactored hook, a new component). Avoid bundling unrelated changes into one commit.

5. For each group, stage only the relevant files with `git add <files>` then commit following the conventions in @.cursor/rules/git.mdc:
   - Emoji prefix matching the type of change
   - Imperative mood subject line under 72 characters
   - Optional body only when extra context genuinely helps

6. After all commits, run `git log --oneline` and show the result so the user can verify the history looks right.

7. Push the branch to remote with `git push -u origin HEAD`.

8. Create a PR using `gh pr create` following the conventions in @.cursor/rules/git.mdc:
   - Title: derive from the branch name — map the branch prefix to its emoji, convert the description from kebab-case to Sentence case.
   - Body: summarise what changed and why. Use a HEREDOC to avoid quoting issues.
   - Target base branch: `main` unless the user specifies otherwise.

## Rules

- Never `git add .` — always stage files explicitly by name.
- Commit message bodies use the HEREDOC pattern to avoid quoting issues:
  `git commit -m "$(cat <<'EOF' ... EOF)"`
- Never amend, force-push, or skip hooks.
- If the user provided a branch name or description as a parameter, use that instead of inferring one.
