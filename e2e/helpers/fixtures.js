export const PRACTICE_QUESTIONS_FIXTURE = [
  {
    id: "sq1-q001",
    type: "mcq",
    chapter: "seamanship",
    text: "מהי הפעולה הראשונה לפני יציאה לים?",
    tags: ["seamanship"],
    correct_choice_id: "a",
    model_answer: "בדיקת בטיחות וציוד היא הפעולה הראשונה.",
    choices: [
      { id: "a", label: "א", text: "בדיקת ציוד בטיחות" },
      { id: "b", label: "ב", text: "העלאת מהירות מנוע" },
      { id: "c", label: "ג", text: "פתיחת מפרשים מלאה" }
    ]
  },
  {
    id: "sq1-q002",
    type: "mcq",
    chapter: "navigation_a",
    text: "מה המשמעות של מצוף אדום בערוץ?",
    tags: ["navigation a"],
    correct_choice_id: "b",
    model_answer: "בכניסה לנמל בישראל נהוג לשמור את האדום משמאל.",
    choices: [
      { id: "a", label: "א", text: "מעיד על סכנה כללית" },
      { id: "b", label: "ב", text: "סימון צד ערוץ" },
      { id: "c", label: "ג", text: "איסור עגינה" }
    ]
  }
];

export const COLLECTIONS_FIXTURE = [
  {
    id: "col_1",
    owner_email: "tester@example.com",
    name: "אוסף ניווט",
    description: "אוסף בדיקה",
    question_ids: ["sq1-q001", "sq1-q002"],
    updated_at: "2026-02-19T10:00:00.000Z"
  }
];

export const TAG_PROGRESS_FIXTURE = {
  owner_email: "tester@example.com",
  mode: "tag_practice",
  questionCount: 30,
  reviewedCount: 18,
  averageReviewedScore: 76.5,
  perTag: [
    { tag: "seamanship", attempts: 10, averageScore: 80 },
    { tag: "navigation a", attempts: 8, averageScore: 72.5 }
  ],
  updated_at: "2026-02-19T10:00:00.000Z"
};
