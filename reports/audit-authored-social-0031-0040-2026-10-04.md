# Social authored questions audit: SOC-0031–0040

Date: 2026-10-04

AI review only; not a qualified teacher's sign-off.

- Reviewed all ten questions' stems, answer options, indexed keys, worked explanations, and skill metadata.
- Corrected the copied, overly broad “權力分立” label on all ten records to topic-specific skills covering legislative oversight, central/local authority, legality and proportionality, election principles, political speech, and public participation.
- Reworked SOC-0040 to make it a distinct multi-constraint policy trade-off item rather than another generic public-hearing question resembling SOC-0039.
- Added regression checks for the reviewed knowledge-point labels. The answer-consistency validator also guards SOC-0027's repaired key and concept.
- Automated verification: `npm test` passed on all 6,108 records; 100,000 randomized picks had no within-round duplicates; official-key extraction reported zero mismatches; `git diff --check` passed.
- AI-assisted content review is not teacher sign-off. Further ranges, teacher validation, deployment, and live verification remain outstanding.
