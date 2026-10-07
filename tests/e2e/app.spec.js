import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

const subjects = ["chinese", "english", "math", "science", "social"];
const banks = await Promise.all(subjects.map(async subject => JSON.parse(await readFile(new URL(`../../data/${subject}.json`, import.meta.url), "utf8"))));
const official = JSON.parse(await readFile(new URL("../../data/mission-questions.json", import.meta.url), "utf8"));
const questionsById = new Map([...banks.flat(), ...official].map(question => [question.id, question]));

async function openLocalPreview(page) {
  await page.goto("/");
  await expect(page.locator(".app")).not.toHaveClass(/auth-pending/);
  await expect(page.locator("#mainButton")).toBeVisible();
  await expect(page.locator("#syncStatus")).toHaveAttribute("data-state", "local");
  await expect(page.locator("#startChallenge")).toHaveAttribute("data-action", "start");
  const profileModal = page.locator("#profileModal");
  await expect(profileModal).toBeVisible();
  await page.locator("#saveProfile").click();
  await expect(profileModal).toHaveClass(/hidden/);
  await expect(profileModal).toBeHidden();
  await page.waitForTimeout(600);
  await expect(profileModal).toBeHidden();
}

test("subject filters and all main panels render, and explorer settings persist locally", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  await openLocalPreview(page);

  for (const [subject, label] of [["國文", "國文"], ["英文", "英文"], ["數學", "數學"], ["自然", "自然"], ["社會", "社會"]]) {
    await page.locator(`#subjectTabs [data-subject="${subject}"]`).click();
    await expect(page.locator("#meta")).toContainText(label);
    const questionId = await page.locator("#quiz").getAttribute("data-question-id");
    const question = questionsById.get(questionId);
    expect(question, `question data must exist for ${questionId}`).toBeTruthy();
    if (question.responseParts?.length) await expect(page.locator("#options [data-response-part]")).toHaveCount(question.responseParts.length);
    else await expect(page.locator("#options button")).toHaveCount(4);
  }

  await page.locator("#difficultyFilter").selectOption({ label: "進階" });
  await expect(page.locator("#meta")).toContainText("進階");
  const unitFilter = page.locator("#unitFilter");
  await unitFilter.selectOption({ label: "公民" });
  await expect(page.locator("#meta")).toContainText("公民");
  await page.locator("#resetFilters").click();
  await expect(page.locator("#difficultyFilter")).toHaveValue("");
  await expect(unitFilter).toHaveValue("");

  for (const view of ["garden", "spirits", "expedition"]) {
    await page.locator(`[data-view-target="${view}"]`).click();
    await expect(page.locator(`[data-view="${view}"]`)).toBeVisible();
  }

  await page.locator("#openProfile").click();
  await expect(page.locator("#profileModal")).toBeVisible();
  await page.locator("#profileName").fill("E2E測試探索員");
  await page.locator("#profileRole").selectOption("ranger");
  await page.locator("#profileTheme").selectOption("forest");
  await page.locator("#profileGoal").selectOption("10");
  await page.locator("#profileAccent").selectOption("amber");
  await page.locator("#saveProfile").click();
  await expect(page.locator("#profileModal")).toHaveClass(/hidden/);
  const savedProfile = await page.evaluate(() => JSON.parse(localStorage.getItem("capQuizV2")).profile);
  expect(savedProfile).toMatchObject({ name: "E2E測試探索員", role: "ranger", theme: "forest", dailyGoal: 10, accent: "amber" });
  expect(pageErrors).toEqual([]);
});

test("ten-question challenge is unique, explains answers, and increments daily progress", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  await openLocalPreview(page);
  const dailyCount = page.locator("#todayCount");
  const beforeCount = Number(await dailyCount.textContent());
  const startButton = page.locator("#startChallenge");
  await expect(startButton).toHaveAttribute("data-action", "start");
  await startButton.click();
  await expect(page.locator("#lessonProgress")).toBeVisible();

  const seen = new Set();
  for (let index = 0; index < 10; index++) {
    await expect(page.locator("#meta")).toContainText(`第 ${index + 1} / 10 題`);
    const questionId = await page.locator("#quiz").getAttribute("data-question-id");
    expect(questionId).toBeTruthy();
    expect(seen.has(questionId)).toBe(false);
    seen.add(questionId);
    const question = questionsById.get(questionId);
    expect(question, `question data must exist for ${questionId}`).toBeTruthy();
    if (question.requiresImage) {
      const figure = page.locator("#questionFigure");
      await expect(figure).toBeVisible();
      const images = figure.locator("img");
      await expect(images).toHaveCount(question.questionImages?.length || 1);
      for (const image of await images.all()) {
        await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0 && element.naturalHeight > 0)).toBe(true);
      }
    }
    if (question.requiresContext) {
      await expect(page.locator("#questionCaption")).toContainText("閱讀材料");
      const hasEmbeddedContext = /(?:【(?:閱讀材料(?:摘要|改寫(?:自)?|自)?[^】]*|資料(?:[甲乙])?)】|閱讀材料(?:（|\(|:)|對話(?:（|\(|:)|Katie 的日記|Reading material(?::|】)|大將軍仇鸞，始為曾銑所劾)/i.test(question.question);
      expect(hasEmbeddedContext || question.questionImages?.length || question.questionImage, `${question.id} must render its shared context`).toBeTruthy();
    }
    if (question.responseParts?.length) {
      await expect(page.locator("#options [data-response-part]")).toHaveCount(question.responseParts.length);
      for (const [partIndex, part] of question.responseParts.entries()) {
        await page.locator(`#options [data-response-part="${partIndex}"]`).fill(part.acceptableAnswers[0]);
      }
    } else {
      expect(question.options).toHaveLength(4);
      await page.locator(`#options [data-index="${question.answer}"]`).click();
    }
    await page.locator("#mainButton").click();
    await expect(page.locator("#feedback .solution-guide h3")).toHaveText("完整解題過程");
    await expect(page.locator("#feedback .teacher-tip")).toBeVisible();
    await expect(dailyCount).toHaveText(String(beforeCount + index + 1));

    if (index < 9) {
      await expect(page.locator("#mainButton")).toHaveText("下一題");
      await page.locator("#mainButton").click();
    } else {
      await expect(page.locator("#mainButton")).toHaveText("查看結果");
      await page.locator("#mainButton").click();
      await expect(page.locator("#resultModal")).toBeVisible();
      await expect(page.locator("#resultSummary")).toContainText("已完成 10 / 10 題");
    }
  }

  expect(seen.size).toBe(10);
  const savedHistory = await page.evaluate(() => JSON.parse(localStorage.getItem("capQuizV2")).history);
  expect(savedHistory).toHaveLength(beforeCount + 10);
  expect(savedHistory.slice(-10).map(item => item.id)).toEqual([...seen]);
  expect(pageErrors).toEqual([]);
});

test("constructed math response matcher requires the stated reasoning in browser", async ({ page }) => {
  const question = questionsById.get("OFF-0961");
  await openLocalPreview(page);
  const result = await page.evaluate(async part => {
    const { matchesResponse } = await import("./question-validation.js");
    return {
      conclusionOnly: matchesResponse(part, "不能"),
      fullReason: matchesResponse(part, "不能；27(n+1)=32(n−1)，n=59/5，非整數")
    };
  }, question.responseParts[1]);
  expect(result).toEqual({ conclusionOnly: false, fullReason: true });
});

test("mobile layout keeps the challenge action visible without covering its text", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLocalPreview(page);
  const layout = await page.evaluate(() => {
    const action = document.querySelector("#startChallenge").getBoundingClientRect();
    const title = document.querySelector(".quest-copy h1").getBoundingClientRect();
    const message = document.querySelector("#questMessage").getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      actionLeft: action.left,
      actionRight: action.right,
      actionTop: action.top,
      actionBottom: action.bottom,
      titleBottom: title.bottom,
      messageBottom: message.bottom,
      actionHeight: action.height,
      actionVisible: action.width > 0 && action.height > 0 && getComputedStyle(document.querySelector("#startChallenge")).visibility === "visible"
    };
  });
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.actionLeft).toBeGreaterThanOrEqual(0);
  expect(layout.actionRight).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.actionTop).toBeGreaterThanOrEqual(layout.messageBottom);
  expect(layout.actionHeight).toBeGreaterThanOrEqual(44);
  expect(layout.actionVisible).toBe(true);
});

test("admin roster pagination reaches every student and searches across pages", async ({ page }) => {
  await page.addInitScript(() => { window.CapQuizAdminPreviewAuth = true; });
  await page.goto("/admin/index.html");
  await expect(page.locator("#demoBanner")).toContainText("隔離測試資料");
  await page.locator('[data-view="students"]').click();
  await expect(page.locator("#studentRows tr[data-id]")).toHaveCount(100);
  await expect(page.locator("#studentPageSummary")).toContainText("顯示 1–100 位，共 235 位");

  await page.locator("#nextStudents").click();
  await expect(page.locator("#studentRows tr[data-id]")).toHaveCount(100);
  await expect(page.locator("#studentPageSummary")).toContainText("顯示 101–200 位，共 235 位");

  await page.locator("#nextStudents").click();
  await expect(page.locator("#studentRows tr[data-id]")).toHaveCount(35);
  await expect(page.locator("#studentPageSummary")).toContainText("顯示 201–235 位，共 235 位");
  await expect(page.locator("#nextStudents")).toBeDisabled();

  await page.locator("#searchInput").fill("測試學生 220");
  await expect(page.locator("#studentRows tr[data-id]")).toHaveCount(1);
  await expect(page.locator("#studentRows")).toContainText("測試學生 220");
  await expect(page.locator("#studentPageSummary")).toContainText("共 1 位");
});
