export default function Rules() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0b2a52",
        color: "white",
        padding: "40px",
        fontSize: "24px"
      }}
    >
      <h1>VM Tips Regler</h1>

      <br />

      <h2>🏆 5 point</h2>
      <p>
        Korrekt vinder + korrekt målscore
      </p>

      <br />

      <h2>⚽ 4 point</h2>
      <p>
        Korrekt vinder + korrekt samlet antal mål
      </p>

      <br />

      <h2>✅ 3 point</h2>
      <p>
        Korrekt vinder
      </p>

      <br />

      <h2>❌ 0 point</h2>
      <p>
        Forkert resultat
      </p>
    </div>
  );
}