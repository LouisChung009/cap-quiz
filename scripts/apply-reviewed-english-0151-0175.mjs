import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/english.json", import.meta.url);
const bank = JSON.parse(await readFile(path, "utf8"));
const updates = {
  "ENG-0152": {
    question: "While the volunteers ___ boxes into the van, the driver suddenly called out, “Watch your step!”",
    options: ["were loading", "had loaded", "are loading", "have loaded"], answer: 0,
    explanation: "The volunteers were in the middle of loading boxes when the driver called out. Use the past continuous, were loading, for the ongoing action and the simple past, called out, for the event that occurred during it. Had loaded describes loading completed before another past event; are loading and have loaded do not fit this past-time context.",
    solutionSteps: ["Locate the two past actions: the volunteers loading boxes and the driver calling out.", "The word suddenly marks the call as an event that happened during the loading, so the loading was still in progress.", "Choose were loading: volunteers is plural, so the past continuous form is were + loading."],
    relatedWords: ["load boxes", "pack", "unload"]
  },
  "ENG-0153": {
    question: "We ___ the final scene when the lights suddenly went out.",
    options: ["had rehearsed", "were rehearsing", "rehearse", "have rehearsed"], answer: 1,
    explanation: "The rehearsal was in progress at the moment the lights went out. Were rehearsing is the past continuous form for an ongoing past action; went out marks the event that occurred during it. Had rehearsed would place the rehearsal before the lights went out, while rehearse and have rehearsed do not fit the past-time sentence.",
    solutionSteps: ["Use went out to identify the sudden event in the past.", "The sentence presents the rehearsal as continuing at that moment, rather than as already completed.", "The subject we takes were, so the ongoing action is were rehearsing."],
    relatedWords: ["rehearse", "practice", "run through a scene"]
  },
  "ENG-0155": {
    options: ["were you doing", "did you do", "are you doing", "have you done"], answer: 0,
    explanation: "The teacher asks about an action that was in progress at the past moment when the alarm sounded. The past continuous question form is What + were + subject + verb-ing, so were you doing is correct. Did you do asks about a completed past action rather than emphasizing what was happening at that moment.",
    solutionSteps: ["The alarm sounded gives a specific moment in the past.", "The question asks what the students were doing at that moment, not simply what they did earlier.", "Form the past continuous question with were before you and doing after it: What were you doing?"],
    relatedWords: ["do", "work on", "take part in"]
  },
  "ENG-0156": {
    explanation: "The sentence says the report was saved before the computer shut down, which explains why only a few notes were lost. Saved describes the completed past action. Was saving would suggest that saving was still in progress when the computer shut down, and save and have saved do not fit the past-time context.",
    solutionSteps: ["Identify the order of events: the report was saved, and then the computer shut down.", "The phrase only lost a few notes supports the idea that the report had finished saving before the shutdown.", "Use the simple past saved for the completed action; before already makes the order clear."],
    relatedWords: ["save", "store", "back up"]
  },
  "ENG-0157": {
    explanation: "Nora began studying at the school in 2022 and the sentence presents this as continuing now. Use the present perfect, has studied, with since to connect a past starting point to the present. Studied would normally present the period as finished.",
    solutionSteps: ["The clause since she moved to the city in 2022 gives a starting point in the past.", "The sentence does not say Nora stopped studying at this school; the situation continues to the present.", "Use the present perfect with the singular subject Nora: has studied."],
    relatedWords: ["study at", "attend", "be a student at"]
  },
  "ENG-0169": {
    explanation: "The hikers had no drinking water left, so they needed to stop. After had, use the past participle run: had run out of. Run out of means to use all of a supply; the other phrasal verbs do not express that meaning.",
    solutionSteps: ["The need to stop and the distant fountain show that the hikers no longer had enough water.", "The phrase describing a supply that is completely gone is run out of.", "Because the sentence has had before the blank, use the past participle run: had run out of drinking water."],
    relatedWords: ["use up", "have no more", "have none left"]
  },
  "ENG-0171": {
    question: "Read the message: “Please bring a reusable cup. The drink stand will give a $5 discount to anyone who uses one.” What should a customer bring to get the discount?",
    explanation: "The message offers the discount to anyone who uses a reusable cup. The word one refers to the reusable cup named in the previous sentence, so that is what the customer should bring.",
    solutionSteps: ["Find the condition attached to the discount: the customer must use one.", "Look at the preceding sentence to identify what one refers to: a reusable cup.", "Choose A reusable cup; the other options are not mentioned as discount conditions."],
    relatedWords: ["reusable mug", "refillable cup", "discount"]
  },
  "ENG-0173": {
    explanation: "The offer means the customer pays for two bags and receives the third bag free. Two bags cost 2 × $3 = $6, so all three bags cost $6.",
    solutionSteps: ["The price is $3 for each paid bag.", "Under the offer, pay for 2 bags: 2 × $3 = $6.", "The third bag is free, so the total for 3 bags remains $6."],
    relatedWords: ["free", "complimentary", "at no cost"]
  },
  "ENG-0174": {
    question: "Although the museum was crowded, we ___ see every room because we had arrived before the tour groups.",
    explanation: "Could means the visitors were able to see every room. Arriving before the tour groups explains how they managed to do so despite the crowds. Must and had to express obligation, while should have see is grammatically incorrect because should have must be followed by a past participle.",
    solutionSteps: ["The contrast introduced by although shows that the crowd might have made the visit difficult.", "The because clause gives a reason they still managed to visit every room: they arrived before the tour groups.", "Choose could to express past ability or opportunity; the other options express obligation or are grammatically unsuitable."],
    relatedWords: ["was able to", "managed to", "had the opportunity to"]
  }
};

for (const [id, update] of Object.entries(updates)) {
  const row = bank.find(item => item.id === id);
  if (!row) throw new Error("Missing " + id);
  Object.assign(row, update);
}
await writeFile(path, JSON.stringify(bank, null, 2) + "\n", "utf8");
console.log("Applied 9 teacher-reviewed English corrections.");
