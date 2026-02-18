export async function writeQuestionsToFirestore({ db, collectionName, questions, batchSize = 400 }) {
  let committed = 0;

  for (let index = 0; index < questions.length; index += batchSize) {
    const chunk = questions.slice(index, index + batchSize);
    const batch = db.batch();

    for (const question of chunk) {
      const ref = db.collection(collectionName).doc(question.id);
      batch.set(ref, question, { merge: true });
    }

    await batch.commit();
    committed += chunk.length;
  }

  return committed;
}
