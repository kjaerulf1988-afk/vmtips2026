export default function Rules() {
  return (
    <div className="rules-page">
      <div className="rules-box">

        <h1>
          🏆 VM Tips Regler
        </h1>

        <div className="rule-item">
          <h2>5 point</h2>

          <p>
            Korrekt vinder OG korrekt målscore.
          </p>

          <span>
            Eksempel: Du tipper 2-1 og kampen ender 2-1.
          </span>
        </div>

        <div className="rule-item">
          <h2>4 point</h2>

          <p>
            Korrekt vinder OG korrekt samlet antal mål.
          </p>

          <span>
            Eksempel: Du tipper 4-0 og kampen ender 3-1.
          </span>
        </div>

        <div className="rule-item">
          <h2>3 point</h2>

          <p>
            Korrekt vinder eller korrekt uafgjort.
          </p>

          <span>
            Eksempel: Du tipper 2-0 og kampen ender 1-0.
          </span>
        </div>

        <div className="rule-item">
          <h2>0 point</h2>

          <p>
            Forkert resultat.
          </p>
        </div>

      </div>
    </div>
  );
}