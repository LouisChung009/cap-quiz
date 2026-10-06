# Official Chinese visual-material repair: 113 Q1 and Q5

- Compared OFF-0661 and OFF-0665 against `assets/official-exams/113-chinese-p2.webp` and `p3.webp`.
- Restored the original question prompts instead of paraphrasing the ads in a way that disclosed their content.
- Added focused SVG crops for the fish social post (Q1) and bookstore advertisement (Q5), marked both as required images, and supplied descriptive alt text. The front end receives the relevant figure crops, not a full-page paper screenshot.
- Updated `validate-data-v2.mjs` to allow only those necessary Q1/Q5 visuals among the 113 Chinese Q1–10 checks, and added source, crop, and accessibility assertions in `validate-chinese-official-113-01-05-materials.mjs`.
- Verified the generated `public/assets` contains both SVG crops and their source WebP pages. Full automated suite and PWA build pass. Internal review only; independent teacher sign-off remains pending.
