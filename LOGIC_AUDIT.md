# SecondSelf v26 Logic Audit

This build was checked across the main decision paths:

- Find: travel hotels, destinations, trip plans, food, shopping places, local services
- Compare: pasted options with prices and descriptive terms
- Check: quote/bill audit, booking/product/provider checks
- Budget: budget, balanced, premium, luxury
- Profile influence: priorities, avoid-list, must-have chips
- Maps: live Google Places results use real coordinates; fallback pins only appear for known cities to avoid misleading maps

## Fixes included

1. Budget now changes scoring more consistently by category.
2. Pasted compare options are parsed more safely and blank default options are ignored.
3. Quote Audit now produces an audit verdict first when quotes are expensive/incomplete.
4. Travel mode logic now separates hotels, destinations, trip plans, and flights.
5. Fallback map pins no longer use Austin coordinates for unknown locations.
6. Category-specific fit checks now penalize mismatched results, such as hotels appearing in destination/trip mode.
7. Date inputs prevent end dates before start dates and start dates are constrained to today or later.
8. Profile matching now looks for full phrases and meaningful words rather than only the first word.

## Important limitation

Live accuracy for hotels/restaurants/providers depends on `GOOGLE_PLACES_API_KEY`. Without that key, the app uses built-in fallback examples for demonstration.
