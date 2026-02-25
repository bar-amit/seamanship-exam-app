import { cookies } from "next/headers";

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get("auth_session")?.value);

  return (
    <main>
      <section className="card">
        <h1>אפליקציית הכנה למבחן משיט</h1>
        <p className="muted">
          שלב 1 הושלם: תשתית Next.js, בסיס RTL, הגדרות Firebase ושומרי נתיבים.
        </p>
        <p>
          <a href="/practice">תרגול מבחן</a>
        </p>
        <p>
          <a href="/practice/tags">תרגול לפי תגית</a>
        </p>
        {hasSession ? (
          <>
            <p>
              <a href="/collections">האוספים שלי</a>
            </p>
            <p>
              <a href="/progress">התקדמות</a>
            </p>
          </>
        ) : (
          <p className="muted">יש להתחבר כדי לראות קישורים לאזור האישי.</p>
        )}
      </section>
    </main>
  );
}
