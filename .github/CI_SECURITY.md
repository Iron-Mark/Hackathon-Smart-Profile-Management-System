# CI Security Policy

## Trust boundary

- Pull-request CI runs with `contents: read` and no repository secrets.
- The trusted lifecycle controller runs only after `CI` succeeds and never checks out pull-request code or downloads pull-request artifacts.
- The controller refuses a stale result unless the successful run SHA still matches the pull request head SHA.
- A scheduled controller may approve a pending public-fork run only for the same trusted actors and current head SHA; it never checks out pull-request content.
- Automatic ready/merge handling is limited to repository owners, members, collaborators, heads owned by `Iron-Mark`, `MarkSiazon`, or `MarkS-Trampettimg`, `dependabot[bot]`, and `imgbot[bot]`.
- Every other fork or bot remains manual, even when its tests pass.

## Required merge gate

Active `dev` and `main` rulesets require pull requests and resolved review threads, block force pushes and branch deletion, and have no administrator bypass. Both require `build (24.x)`, `analyze`, and `route-policy` with strict up-to-date checks. Ordinary development PRs use squash merges; `dev` promotions into `main` use merge commits. The route policy also permits Dependabot security branches into `main`.

Protected history synchronization uses a same-repository `sync/main-to-dev-*` branch based on current `dev`, with current `main` merged into it. Open its PR against `dev` and select **merge commit**, preserving both histories. Direct `main`-to-`dev` PRs remain rejected: strict up-to-date requirements would make that route circular. The lifecycle selects merge commits for the same-repository synchronization prefix only; forks using that name receive ordinary squash handling after the existing trust checks.

Before publishing a synchronization PR, allow both `squash` and `merge` in the `dev` ruleset's pull-request merge methods. Keep every other rule, required check, strictness setting, and bypass restriction intact. For the first synchronization, explicitly queue `gh pr merge <number> --auto --merge` before CI completes because the lifecycle on default `main` does not yet contain this selection logic. The subsequent `dev`-to-`main` promotion activates the updated controller. Future synchronizations use the same branch convention.

## Workflow supply chain

All `uses:` references are pinned to verified full commit SHAs. Dependabot checks the `github-actions` ecosystem weekly and proposes grouped pin updates through the same required gate.

## Fork policy

Public-fork workflow approval is set to every external contributor. GitHub keeps their token read-only and withholds secrets; the controller supplies approval only for trusted actors. GitHub Pages deployment runs on `main` pushes and explicit workflow dispatch with narrow deployment permissions; the trusted lifecycle dispatches it after a promotion merges.
