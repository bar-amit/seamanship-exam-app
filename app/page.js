import { cookies } from "next/headers";
import { uiText } from "../src/content/strings.js";
import { AUTH_SESSION_COOKIE } from "../src/features/auth/session.js";

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get(AUTH_SESSION_COOKIE)?.value);

  return (
    <main>
      <section className="card">
        <h1>{uiText.home.title}</h1>
        <p className="muted">{uiText.home.subtitle}</p>
        <p>
          <a href="/practice">{uiText.home.links.practice}</a>
        </p>
        <p>
          <a href="/practice/tags">{uiText.home.links.tagPractice}</a>
        </p>
        {hasSession ? (
          <>
            <p>
              <a href="/collections">{uiText.home.links.collections}</a>
            </p>
            <p>
              <a href="/dashboard">{uiText.home.links.dashboard}</a>
            </p>
          </>
        ) : (
          <p className="muted">{uiText.home.loginHint}</p>
        )}
      </section>
    </main>
  );
}
