export const uiText = {
  common: {
    loading: "בטעינה...",
    notAvailable: "-"
  },
  home: {
    title: "אפליקציית הכנה למבחן משיט",
    subtitle: "תרגול שאלות למבחני ימאות, מכונאות וניווט.",
    links: {
      practice: "תרגול מבחן",
      tagPractice: "תרגול חופשי",
      collections: "האוספים שלי",
      dashboard: "אזור אישי",
      progress: "אזור אישי"
    },
    loginHint: "יש להתחבר כדי ללהכנס לאזור האישי."
  },
  auth: {
    signedInPrefix: "מחובר:",
    loginBusy: "מתחבר...",
    login: "התחברות עם גוגל",
    logoutBusy: "מתנתק...",
    logout: "התנתק",
    errors: {
      sessionCreateFailed: "Failed to create session",
      sessionSyncFailed: "Auth session sync failed.",
      loginFailed: "Login failed.",
      logoutFailed: "Logout failed."
    }
  },
  collections: {
    title: "האוספים שלי",
    subtitle: "ניהול אוספי שאלות.",
    createTitle: "יצירת אוסף חדש",
    listTitle: "רשימת אוספים",
    emptyState: "אין אוספים עדיין.",
    noDescription: "ללא תיאור",
    fields: {
      name: "שם האוסף",
      descriptionOptional: "תיאור (אופציונלי)",
      description: "תיאור",
      questionIdsCsv: "מזהי שאלות (פסיק מפריד)"
    },
    questionCountPrefix: "מספר שאלות:",
    questionIdsPlaceholder: "לדוגמה: sq1-q001, sq3-q084",
    buttons: {
      create: "צור אוסף",
      save: "שמור",
      saveBusy: "שומר...",
      delete: "מחק אוסף"
    },
    errors: {
      fetchFailed: "Failed to fetch collections",
      createFailed: "Failed to create collection",
      updateFailed: "Failed to update collection",
      deleteFailed: "Failed to delete collection"
    },
    addModal: {
      trigger: "הוסף לאוסף",
      title: "הוספת שאלה לאוסף",
      close: "סגור",
      loading: "טוען אוספים...",
      empty: "אין אוספים עדיין. אפשר ליצור אוסף חדש כאן.",
      addToCollection: "הוסף",
      alreadyInCollection: "כבר קיים באוסף",
      createTitle: "יצירת אוסף חדש והוספת שאלה",
      createNameLabel: "שם האוסף",
      createDescriptionLabel: "תיאור (אופציונלי)",
      createAction: "צור והוסף",
      createActionBusy: "יוצר...",
      addActionBusy: "מוסיף...",
      addedSuccess: "השאלה נוספה לאוסף.",
      createdSuccess: "האוסף נוצר והשאלה נוספה.",
      errors: {
        fetchFailed: "Failed to load collections",
        addFailed: "Failed to add question to collection",
        createFailed: "Failed to create collection"
      }
    }
  },
  dashboard: {
    title: "לוח משתמש",
    subtitle: "תקציר מהיר של האוספים והתקדמות לפי תגיות.",
    cards: {
      collectionsTitle: "אוספים",
      collectionsCountLabel: "סה״כ אוספים:",
      collectionsLink: "מעבר לאוספים",
      progressTitle: "התקדמות לפי תגיות",
      noProgress: "אין נתונים עדיין.",
      lastPracticeCountLabel: "שאלות בתרגול האחרון:",
      reviewedLabel: "שאלות שנסקרו:",
      reviewedAverageLabel: "ממוצע:",
      updatedAtLabel: "עודכן לאחרונה:",
      updatedAtUnavailable: "לא זמין",
      attemptsLabel: "ניסיונות:",
      averageScoreLabel: "ציון ממוצע:"
    },
    errors: {
      collectionsSummaryFailed: "Failed to load collections summary",
      progressSummaryFailed: "Failed to load progress summary"
    }
  },
  progress: {
    title: "התקדמות לפי תגיות",
    subtitle: "נתונים על שאלות שתרגלת",
    emptyState: "אין נתוני התקדמות שמורים עדיין. בצע תרגול לפי תגיות כדי ליצור נתונים.",
    lastPracticeCountLabel: "שאלות בתרגול האחרון:",
    reviewedCountLabel: "שאלות שנסקרו:",
    averageReviewedScoreLabel: "ציון ממוצע:",
    updatedAtLabel: "עודכן לאחרונה:",
    updatedAtUnavailable: "לא זמין",
    attemptsLabel: "ניסיונות:",
    averageScoreLabel: "ציון ממוצע:",
    errors: {
      loadFailed: "Failed to load progress"
    }
  },
  practice: {
    title: "תרגול מבחן",
    switchToTagPractice: "מעבר לתרגול חופשי",
    setupTitle: "הגדרות מבחן",
    questionCountLabel: "מספר השאלות",
    minutesPerQuestionLabel: "תרגל עם זמן",
    minutesRangeHint: "זמן לשאלה צריך להיות בטווח של 1-20 דקות.",
    minutesInputHint: "זמן לשאלה חייב להיות בין 1 ל-20 דקות.",
    minutesText: (min)=>`${min} דקות לשאלה`,
    start: "התחל",
    startLoading: "טוען שאלות...",
    questionProgressPrefix: "שאלה",
    questionProgressOutOf: "מתוך",
    timeLeftLabel: "זמן נותר:",
    openTextPlaceholder: "הקלד תשובה...",
    buttons: {
      skip: "דלג",
      skipAndFinish: "דלג וסיים",
      saveAndNext: "שמור והמשך",
      finishAndReview: "סיים ועבור לבדיקה",
      newTest: "מבחן חדש"
    },
    navigationTitle: "ניווט מהיר",
    reviewTitle: "בדיקה וסיכום",
    finalScoreLabel: "ציון סופי:",
    tagsLabel: "תגיות:",
    questionScoreLabel: "ציון לשאלה:",
    yourAnswerLabel: "התשובה שלך:",
    yourAnswerMcqLabel: "התשובות שלך:",
    correctAnswerLabel: "התשובה הנכונה:",
    unanswered: "לא נענה",
    subGradesLabel: "סמן אם ענית נכון:",
    explanationLabel: "הסברים/פתרון:",
    ariaQuestion: (index) => `שאלה ${index}`,
    altQuestionImage: (id) => `תמונה לשאלה ${id}`,
    altChoiceImage: (label) => `תמונה לאפשרות ${label}`,
    errors: {
      loadQuestionsFailed: "Failed to load practice questions"
    }
  },
  practiceTags: {
    title: "תרגול חופשי",
    setupTitle: "הגדרות תרגול",
    countLabel: "מספר שאלות",
    selectTagsLabel: "בחר תגיות",
    allTags: "כל התגיות",
    showStudyAids: "הצג עזרי לימוד",
    hideStudyAids: "הסתר עזרי לימוד",
    start: "התחל תרגול תגיות",
    startLoading: "בטעינה...",
    questionProgressPrefix: "שאלה",
    questionProgressOutOf: "מתוך",
    reviewedPrefix: "נסקרו",
    openTextPlaceholder: "כתוב תשובה חופשית",
    subGradeInstruction: "סמן אם ענית נכון",
    buttons: {
      markReviewed: "בדוק שאלה",
      skip: "דלג",
      next: "הבא",
      resetToSetup: "חזרה להגדרות"
    },
    correctAnswerLabel: "תשובה נכונה:",
    openTextCorrectAnswerFallback: "בדיקה עצמית לפי הסעיפים",
    explanationLabel: "הסברים:",
    tagsLabel: "תגיות:",
    questionScoreLabel: "ניקוד לשאלה:",
    quickNavTitle: "ניווט מהיר",
    averageScoreLabel: "ניקוד ממוצע:",
    altQuestionImage: (id) => `תמונה לשאלה ${id}`,
    altChoiceImage: (label) => `תמונה לאפשרות ${label}`,
    errors: {
      loadQuestionsFailed: "Failed to load tag practice questions"
    },
    tagOptions: [
      { id: "seamanship", label: "ימאות" },
      { id: "navigation a", label: "ניווט חופי" },
      { id: "navigation b", label: "ניווט מכשירים" },
      { id: "mechanics", label: "מכונאות" }
    ]
  },
  admin: {
    title: "ניהול תוכן",
    subtitle: "עורך אדמין עם חיפוש מדורג, תצוגה מקדימה, עריכת אפשרויות/תשובות וחשיפת JSON.",
    searchTitle: "איתור שאלות",
    searchPlaceholder: "חיפוש לפי מזהה או טקסט",
    search: "חפש",
    pageSizeLabel: "תוצאות בעמוד",
    pageCounter: (page, totalPages, total) => `עמוד ${page} מתוך ${totalPages} | סה״כ ${total}`,
    previous: "הקודם",
    next: "הבא",
    emptyResults: "לא נמצאו תוצאות.",
    editorTitle: "עורך שאלה",
    noQuestionSelected: "לא נבחרה שאלה.",
    loadingQuestion: "טוען שאלה...",
    idLabel: "מזהה:",
    typeLabel: "סוג:",
    chapterLabel: "פרק:",
    questionTextLabel: "טקסט שאלה",
    modelAnswerLabel: "הסבר/תשובת מודל",
    tagsLabel: "תגיות (מופרדות בפסיק)",
    mcqTitle: "אפשרויות ותשובה נכונה",
    correctChoiceIdLabel: "מזהה תשובה נכונה",
    correctChoiceIdPlaceholder: "לדוגמה: a",
    choiceIdLabel: "מזהה",
    choiceLabelLabel: "תווית",
    choiceImageRefLabel: "קובץ תמונה (image_ref)",
    choiceTextLabel: "טקסט אפשרות",
    removeChoice: "מחק אפשרות",
    addChoice: "הוסף אפשרות",
    subQuestionsTitle: "סעיפים",
    subQuestionIdLabel: "מזהה",
    subQuestionLabelLabel: "תווית",
    subQuestionOrderLabel: "סדר",
    subQuestionTextLabel: "טקסט סעיף",
    removeSubQuestion: "מחק סעיף",
    addSubQuestion: "הוסף סעיף",
    saveChanges: "שמור שינויים",
    saveChangesBusy: "שומר...",
    reload: "טען מחדש",
    showQuestionJson: "הצג JSON שאלה",
    hideQuestionJson: "הסתר JSON שאלה",
    showPayloadJson: "הצג JSON שמירה",
    hidePayloadJson: "הסתר JSON שמירה",
    saveSuccess: "השאלה נשמרה בהצלחה.",
    errors: {
      loadQuestionsFailed: "Failed to load questions",
      loadQuestionFailed: "Failed to load question",
      saveQuestionFailed: "Failed to save question"
    }
  },
  review: {
    controls: {
      filterLabel: "סינון",
      options: {
        all: "הכל",
        mistakes: "טעויות ותשובות חלקיות",
        skipped: "מדולגות",
        correct: "נכונות"
      },
      showExplanations: "הצג הסברים"
    },
    status: {
      prefix: "סטטוס:",
      labels: {
        correct: "נכונה",
        partial: "חלקית",
        incorrect: "שגויה",
        skipped: "מדולגת",
        unanswered: "ללא מענה",
        current: "נוכחית"
      }
    },
    summary: {
      labels: {
        correct: "נכונות",
        partial: "חלקיות",
        incorrect: "שגויות",
        skipped: "מדולגות",
        unanswered: "ללא מענה"
      }
    }
  },
  image: {
    unavailable: "התמונה לא זמינה כרגע."
  }
};
