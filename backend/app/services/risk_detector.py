"""
Scans vendor text for 14 risk keyword phrases.
Also selects the 5 longest sentences as candidates.
Caps candidates at 30 total.
One Gemini call per vendor returns:
    flags: [{flagged_text, risk_type, severity, page, impact}]
    tone_score: 0-100
    tone_summary: plain English sentence
    overall_risk: Low / Medium / High
Returns the full risk report dict.
"""