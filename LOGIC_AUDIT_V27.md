# SecondSelf v27 Thorough Logic Audit

This audit reviewed the app logic across actions, categories, scoring, maps, dates, compare/check modes, quote audit, profile, and feedback.

## Issues found and fixed

1. Runtime date bug
- Problem: date fields referenced `todayISO` outside its component scope.
- Fix: moved date constant to module scope as `TODAY_ISO`.

2. Compare/check modes were still allowed to trigger live place search
- Problem: compare/check flows could return Google place results instead of comparing/checking the user's pasted options.
- Fix: API now uses structured compare/check fallback logic for `action === compare` and `action === check`.

3. Compare/check flows showed map behavior when they should not
- Problem: travel compare/check could show map/pinned-count behavior even when comparing pasted options or checking a booking.
- Fix: `usesPrimaryMap()` now returns false unless the action is `find`.

4. Destination default was incorrect
- Problem: Travel destination mode could keep the need as `hotel`.
- Fix: `defaultNeedFor('travel','destination')` now returns `destination or area`.

5. Unknown fallback locations used Austin coordinates
- Problem: some non-Miami fallback trip/destination options used Austin coordinates even when the user typed another city.
- Fix: fallback coordinates now use known city coordinates only; otherwise map pins are hidden with a caution instead of fake coordinates.

6. Quote audit was too permissive
- Problem: text like “No warranty listed” was incorrectly counted as warranty being present, and loose fee language was counted as itemization.
- Fix: warranty detection now handles negation, and itemization requires explicit itemized wording or both parts and labor.

7. Budget logic still did not dominate enough for luxury travel
- Problem: profile/value signals could outrank luxury intent.
- Fix: luxury now strongly favors true premium/high-end options and penalizes mid/basic options more clearly.

8. Feedback section claimed learning but did not affect future scoring
- Problem: feedback saved locally but was not used by score logic.
- Fix: feedback now updates lightweight `learnedLikes` / `learnedAvoid` profile signals, and scoring uses those signals.

## Tested scenarios

- Find → Travel → Plan my trip returns trip plans, not hotels.
- Find → Travel → Destination returns destinations/areas, not hotels.
- Compare → Travel parses Option A / Option B and does not show map mode.
- Budget comparison favors lower-cost option when budget is selected.
- Check → Travel returns check/audit outputs, not hotel search outputs.
- Check → Quote Audit flags incomplete expensive quotes first.
- Shopping product mode does not show map mode.
- Budget shopping does not rank premium first.
- Luxury hotel search favors premium/luxury options.
- Budget hotel search avoids higher-price hotel options.

## Build check

`npm run build` completed successfully.
