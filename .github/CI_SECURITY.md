# CI Security Policy

## Trust boundary

- Pull-request CI runs with `contents: read` and no repository secrets.
- The trusted lifecycle controller runs only after `CI` succeeds and never checks out pull-request code or downloads pull-request artifacts.
- The controller refuses a stale result unless the successful run SHA still matches the pull request head SHA.
- A scheduled controller may approve a pending public-fork run only for the same trusted actors and current head SHA; it never checks out pull-request content.
- Automatic ready/merge handling is limited to repository owners, members, collaborators, heads owned by `Iron-Mark`, `MarkSiazon`, or `MarkS-Trampettimg`, `dependabot[bot]`, and `imgbot[bot]`.
- Every other fork or bot remains manual, even when its tests pass.

## Required merge gate

Active `dev` and `main` rulesets require pull requests, squash-only merges, and resolved review threads; block force pushes and branch deletion; and have no administrator bypass. Existing classic protection requires `build (24.x)`, `analyze`, and `route-policy` on `dev`; mirror the required checks to the rulesets after the hardened workflows are published. The route policy still limits `main` pull requests to `dev`.

## Workflow supply chain

All `uses:` references are pinned to verified full commit SHAs. Dependabot checks the `github-actions` ecosystem weekly and proposes grouped pin updates through the same required gate.

## Fork policy

After the scheduled controller reaches the default branch, switch public-fork workflow approval from first-time contributors to every external contributor. GitHub keeps their token read-only and withholds secrets; the controller supplies approval only for trusted actors. GitHub Pages deployment remains push-only on `main` with its existing narrow deployment permissions.
