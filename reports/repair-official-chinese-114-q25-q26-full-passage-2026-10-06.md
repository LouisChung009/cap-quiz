# Official Chinese Q25–Q26 source-material repair

- Compared OFF-0899 (114 Q25) and OFF-0900 (114 Q26) with the original shared passage on `assets/official-exams/114-chinese-p8.webp`.
- Found both records contained only a synthesized summary, not the article students need. Replaced those summaries with the source-aligned question prompts and added a focused crop containing the complete shared reading passage, not the page's unrelated questions.
- Rewrote both worked explanations with evidence from the original: the clam's water-squirting defense exposes its location; the grandmother–grandchild exchange frames contrasting interpretations of the clam and life.
- Added offline caching for the crop and source image, bumped the question-data and service-worker cache versions, and added regression checks for source mapping, required image, answer keys, steps, and caching.
- This is internal source-based QA, not independent teacher sign-off.
