# SecondSelf v31 Clean Choose-First Flow

Changes made after user feedback:

- Removed Smart Intake from the primary first screen because the extracted details could be wrong and redundant.
- Removed the "We understood this" confirmation panel.
- Flow is now: Choose action → Choose category → Add essential fields.
- The detail step now shows only directly editable fields, chips, and optional notes.
- Kept validation for required travel dates and compare/quote details.
- Kept the latest scoring/audit logic from the prior build.

Reason: if natural-language parsing is imperfect, it should not create a confusing confirmation screen. User-controlled choices are clearer and more reliable.
