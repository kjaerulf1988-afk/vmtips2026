export default function Rules() {
  return (
    <div className="rules-page">

      <div className="rules-container">

        <h1>
          🏆 VM Tips Regler
        </h1>

        <div className="rule-card">
          <h2>🥇 5 Point</h2>

          <p>
            Korrekt vinder OG korrekt målscore.
          </p>

          <span>
            Eksempel:
            Du tipper 2-1 og kampen ender 2-1.
          </span>
        </div>

        <div className="rule-card">
          <h2>⚽ 4 Point</h2>

          <p>
            Korrekt vinder OG korrekt samlet antal mål.
          </p>

          <span>
            Eksempel:
            Du tipper 3-1 og kampen ender 2-2.
          </span>
        </div>

        <div className="rule-card">
          <h2>✅ 3 Point</h2>

          <p>
            Korrekt vinder.
          </p>

          <span>
            Eksempel:
            Du tipper 2-0 og kampen ender 1-0.
          </span>
        </div>

        <div className="rule-card">
          <h2>❌ 0 Point</h2>

          <p>
            Forkert resultat.
          </p>
        </div>

      </div>

    </div>
  );
}