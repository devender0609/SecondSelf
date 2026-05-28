# SecondSelf v33 Full Logic QA

Manual code audit + scenario checks completed on top of v32.

## Fixed
1. Avoid-list false positives
   - Previous logic matched avoid terms against recommendation/checklist text.
   - Example: a hotel recommendation saying "verify cancellation fees" could trigger avoid-list penalties for "hidden fees" or "bad cancellation policy."
   - Fixed by matching profile priorities, avoid terms, and must-haves against option identity/tags/raw details only.

2. Category-specific next steps
   - Travel/food results were using provider language such as "written estimate, license/warranty."
   - Fixed so hotels, destinations, restaurants, providers, stores, products, style, and quote audit each use appropriate next-step language.

3. Compare validation
   - Previous UI required literal "Option A" and "Option B."
   - Fixed so two lines/semicolon-separated choices can also pass validation.

4. Quote Audit validation
   - Quote Audit now requires at least an amount or meaningful pasted/uploaded quote details.

5. Place-based validation
   - Food, local service, store/place shopping, and provider mode require a location.

## Rechecked scenarios
- Find hotel: hotel-specific results and hotel-specific next steps.
- Plan my trip: itinerary options, not hotel rankings.
- Destinations: area/destination options, not hotel rankings.
- Flights: strategy/search links only; no fake fares.
- Food: restaurant-oriented next steps.
- Shopping products: no map; product criteria + where-to-buy links.
- Shopping places: map/place logic.
- Style: outfit formula + where-to-buy links.
- Local service: provider verification checklist.
- Quote Audit: audit verdict first; no random providers unless Find Provider mode is selected.
- Compare: parses real pasted options without forcing Option A/B labels.
- Feedback: saves local learning signals.


## Additional fixes after scenario testing
6. Quote Audit wording
   - Quote audit results now use "Recommended action" rather than hotel-style "Best fit."

7. Quote Audit false positives
   - "No hidden fees" or "avoid overpaying" no longer triggers the user's avoid-list for hidden fees/overpriced.
   - Quote Audit must-have chips no longer create false positive "matches warranty/itemization" evidence when the pasted quote actually lacks those details.
