export default function Rules() {
  return (
    <div className="rules-page">

      <div className="rules-box">

        <h1>
          🏆 VM Tips Regler
        </h1>

        <div className="rule-item">

          <h2>🥇 5 Point</h2>

          <p>
            Korrekt vinder/uafgjort OG korrekt målscore.
          </p>

          <span>
            Eksempel:
            Du tipper 2-1 og kampen ender 2-1.
          </span>

        </div>

        <div className="rule-item">

          <h2>⚽ 4 Point</h2>

          <p>
            Korrekt vinder OG korrekt samlet antal mål.
          </p>

          <span>
            Eksempel:
            Du tipper 4-0 og kampen ender 3-1.
          </span>

        </div>

        <div className="rule-item">

          <h2>✅ 3 Point</h2>

          <p>
            Korrekt vinder eller uafgjort.
          </p>

          <span>
            Eksempel:
            Du tipper 2-0 og kampen ender 1-0.
          </span>

        </div>

        <div className="rule-item">

          <h2>🎯 1 Point</h2>

          <p>
            Korrekt samlet antal mål, men forkert vinder/uafgjort.
          </p>

          <span>
            Eksempel:
            Du tipper 1-0 og kampen ender 0-1.
          </span>

        </div>

        <div className="rule-item">

          <h2>❌ 0 Point</h2>

          <p>
            Forkert resultat.
          </p>

        </div>
<div className="rule-card">

  <h2>
    🏅 Pointlighed
  </h2>

  <p>
    Hvis flere deltagere har samme antal point,
    afgøres placeringen efter følgende rækkefølge:
  </p>

  <span>
    1. Flest 5-point kampe
    <br />
    2. Flest 4-point kampe
    <br />
    3. Flest 3-point kampe
    <br />
    4. Flest 1-point kampe
  </span>

</div>
        <div className="rule-item prize-card">

          <h2>
            💰 Præmiefordeling
          </h2>

          <p>
            🥇 Nummer 1 får 50% af puljen
          </p>

          <p>
            🥈 Nummer 2 får 35% af puljen
          </p>

          <p>
            🥉 Nummer 3 får 15% af puljen
          </p>

        </div>

      </div>

    </div>
  );
}