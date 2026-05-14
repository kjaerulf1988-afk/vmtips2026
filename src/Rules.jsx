function Rules() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b2a52",
        color: "white",
        padding: "50px"
      }}
    >
      <h1>VM Tips Regler</h1>

      <h2>5 point</h2>
      <p>Korrekt vinder + korrekt målscore</p>

      <h2>4 point</h2>
      <p>Korrekt vinder + korrekt antal samlede mål</p>

      <h2>3 point</h2>
      <p>Korrekt vinder</p>

      <h2>0 point</h2>
      <p>Forkert resultat</p>
    </div>
  );
}

export default Rules;