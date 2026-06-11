import { useEffect, useState } from "react";

import "./App.css";

import kampeData from "./kampe_dansk.json";

import {
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

import { db } from "./firebase";

function App() {

  const [navn, setNavn] =
    useState("");

  const [arbejdsnummer, setArbejdsnummer] =
    useState("");

  const [loggedIn, setLoggedIn] =
    useState(false);

  const [fejl, setFejl] =
    useState("");

  const [tips, setTips] =
    useState({});

  const [tipsLocked, setTipsLocked] =
    useState(false);

  const [savedMessage, setSavedMessage] =
    useState(false);

  // SORTER KAMPE

  const alleKampe = kampeData
    .flatMap((gruppeObjekt) =>
      gruppeObjekt.kampe.map(
        (kamp, index) => ({
          ...kamp,

          gruppe:
            gruppeObjekt.gruppe,

          kampId: `${gruppeObjekt.gruppe}-${index}`,
        })
      )
    )

    .sort((a, b) => {

      const måneder = {
        JUN: 5,
        JUL: 6,
      };

      const parseDato = (datoStr) => {

        const [dag, måned, tid] =
          datoStr.split(" ");

        const [timer, minutter] =
          tid.split(":");

        return new Date(
          2026,
          måneder[måned],
          parseInt(dag),
          parseInt(timer),
          parseInt(minutter)
        );
      };

      return (
        parseDato(a.dato) -
        parseDato(b.dato)
      );
    });

  // LOGIN + LOAD TIPS

  const login = async () => {

    if (
      navn.trim() === "" ||
      arbejdsnummer.trim() === ""
    ) {

      setFejl(
        "Udfyld navn og arbejdsnummer"
      );

      return;
    }

    try {

      const docRef = doc(
        db,
        "tips",
        arbejdsnummer
      );

      const docSnap =
        await getDoc(docRef);

      if (docSnap.exists()) {

        const data =
          docSnap.data();

        setTips(data.tips || {});

        setTipsLocked(
          data.locked || false
        );
      }

      setLoggedIn(true);

    } catch (error) {

      console.error(error);

      setFejl(
        "Fejl ved login"
      );
    }
  };

  // ENTER

  const handleKeyPress = (e) => {

    if (e.key === "Enter") {
      login();
    }
  };

  // UPDATE TIP

  const updateTip = (
    kampId,
    team,
    value
  ) => {

    if (tipsLocked) return;

    setTips((prev) => ({
      ...prev,

      [kampId]: {
        ...prev[kampId],

        [team]: value,
      },
    }));
  };

  // GEM KLADDE

  const saveDraft = async () => {

    try {

      await setDoc(
        doc(db, "tips", arbejdsnummer),

        {
          navn,

          arbejdsnummer,

          tips,

          locked: false,

          updatedAt: new Date(),
        }
      );

      setSavedMessage(true);

      setTimeout(() => {
        setSavedMessage(false);
      }, 3000);

    } catch (error) {

      console.error(error);

      alert("Fejl ved gemning");
    }
  };

  // INDSEND ENDELIGE TIPS

  const submitFinalTips = async () => {

    const confirmed = window.confirm(
      "Er du sikker? Dine tips bliver låst."
    );

    if (!confirmed) return;

    try {

      await setDoc(
        doc(db, "tips", arbejdsnummer),

        {
          navn,

          arbejdsnummer,

          tips,

          locked: true,

          updatedAt: new Date(),
        }
      );

      setTipsLocked(true);

      alert(
        "🔥 Dine tips er nu låst"
      );

    } catch (error) {

      console.error(error);

      alert("Fejl ved indsendelse");
    }
  };

  return (
    <div className="app">

{!loggedIn ? (

  <div className="login-container">

    <div className="login-box">

      <h1>
        🏆 VM Tips 2026
      </h1>

      <h2
        style={{
          marginBottom: "25px",
          color: "#ffd966",
        }}
      >
        Tipsfristen er udløbet
      </h2>

      <p
        style={{
          marginBottom: "30px",
          fontSize: "18px",
          lineHeight: "1.5",
        }}
      >
        Alle tips er nu låst.
        <br />
        Følg stillingen på leaderboardet.
      </p>

      <div className="links-row">

        <a href="/leaderboard">
          🏆 Leaderboard
        </a>

        <a href="/regler">
          📖 Regler
        </a>

      </div>

    </div>

  </div>

) : (

        <>

          <header className="topbar">

            <h2>
              Velkommen {navn}
            </h2>

            {tipsLocked ? (
              <div className="locked-status">
                🔒 Tips er låst
              </div>
            ) : (
              <div className="locked-status open-status">
                ✏️ Tips kan stadig ændres
              </div>
            )}

          </header>

          <div className="kampe-container">

            {alleKampe.map(
              (kamp) => (

                <div
                  className="kamp-kort"
                  key={kamp.kampId}
                >

                  <h2 className="kamp-title">
                    {kamp.hjemmehold} - {kamp.udehold}
                  </h2>

                  <div className="kamp-info">

                    <span>
                      {kamp.dato}
                    </span>

                    <span className="gruppe">
                      Gruppe {kamp.gruppe}
                    </span>

                  </div>

                  <div className="hold-linje">

                    <div className="holdnavn">
                      {kamp.hjemmehold}
                    </div>

                    <select
                      disabled={tipsLocked}
                      value={
                        tips[kamp.kampId]?.home ?? ""
                      }
                      onChange={(e) =>
                        updateTip(
                          kamp.kampId,
                          "home",
                          Number(e.target.value)
                        )
                      }
                    >

                      <option value="">
                        Mål
                      </option>

                      {[...Array(16)].map(
                        (_, i) => (
                          <option
                            key={i}
                            value={i}
                          >
                            {i}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div className="vs">
                    VS
                  </div>

                  <div className="hold-linje">

                    <div className="holdnavn">
                      {kamp.udehold}
                    </div>

                    <select
                      disabled={tipsLocked}
                      value={
                        tips[kamp.kampId]?.away ?? ""
                      }
                      onChange={(e) =>
                        updateTip(
                          kamp.kampId,
                          "away",
                          Number(e.target.value)
                        )
                      }
                    >

                      <option value="">
                        Mål
                      </option>

                      {[...Array(16)].map(
                        (_, i) => (
                          <option
                            key={i}
                            value={i}
                          >
                            {i}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>
              )
            )}

          </div>

          {!tipsLocked && (

            <div className="save-buttons">

              <button
                className="draft-btn"
                onClick={saveDraft}
              >
                💾 Gem kladde
              </button>

              <button
                className="final-btn"
                onClick={submitFinalTips}
              >
                🔒 Indsend endelige tips
              </button>

            </div>
          )}

          {savedMessage && (
            <div className="saved-popup">
              ✅ Kladde gemt
            </div>
          )}

        </>
      )}

    </div>
  );
}

export default App;