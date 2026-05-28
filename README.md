# SecondSelf v24 Yarn Clean

This build keeps the v22/v23 polished UI but switches Vercel install from pnpm/npm to Yarn Classic to avoid the npm `Exit handler never called` and pnpm `ERR_INVALID_THIS` install failures.

## Deploy

Push the source files to GitHub, then redeploy on Vercel without build cache.

Vercel uses:
- Node: 20.x
- Install: Yarn Classic 1.22.22
- Build: `yarn build`

Optional env var for live map/place search:
`GOOGLE_PLACES_API_KEY=your_key_here`


## v25 budget logic fix
Budget selection now materially affects ranking. Budget favors value/lower-cost options, balanced favors mid-range, premium favors comfort/quality, and luxury favors higher-end choices. The score is a fit score, not a star rating.
