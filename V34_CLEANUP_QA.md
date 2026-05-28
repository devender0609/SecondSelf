# V34 Cleanup QA

Changes made:
- Removed Flight as a travel option from UI and search flow.
- Removed flight API/note behavior from API response.
- Kept Travel modes: Hotels / stays, Plan my trip, Destinations.
- Aligned Continue buttons on the three action cards.
- Simplified action-card language and result-card headings to avoid jargon.
- Result cards now use practical labels: Best next step, Why this works, Check carefully, Before you choose.

Logic retained from prior QA:
- Travel dates required for hotel, trip plan, and destination modes.
- Compare mode requires at least two real options.
- Quote Audit requires amount or pasted/uploaded quote details.
- Place searches require location where map results matter.
- Budget scoring and profile influence remain active.
