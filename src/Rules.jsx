function Rules() {
  return (
    <div
      style={{
        background: "#0b2a52",
        minHeight: "100vh",
        color: "white",
        padding: "40px"
      }}
    >
      <h1>VM Tips Regler</h1>

      <p>5 point = korrekt resultat</p>

      <p>
        4 point = korrekt vinder +
        korrekt samlet antal mål
      </p>

      <p>3 point = korrekt vinder</p>

      <p>0 point = forkert resultat</p>
    </div>
  );
}

export default Rules;