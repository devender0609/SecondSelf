# SecondSelf v29 latest smart upgrade

This version updates the uploaded v27 latest build, not the older v15 build.

Changes applied:
- Added Smart Intake on the first step. Users can type naturally and the app infers action/category/mode/location/budget/must-haves where possible.
- Added confidence level in results. Confidence increases when users provide dates, location, exact options, quote details, live data, and a stronger profile.
- Kept v27 thorough audit fixes for compare/check/travel/destination/quote logic.
- Kept Yarn Classic Vercel install strategy for more stable deployment.

Limitations:
- Natural-language parsing is rule-based, not a full LLM parser.
- Live place quality depends on GOOGLE_PLACES_API_KEY.
- Flight prices remain strategy/search links unless a flight API is added.
