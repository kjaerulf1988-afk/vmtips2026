import { useState } from "react";

import "./App.css";

import kampeData from "./kampe_dansk.json";

import {
  collection,
  addDoc,
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

  const [showConfirm, setShowConfirm] =
    useState(false);

  // LOGIN

  const login = () => {

    if (
      navn.trim() === "" ||
      arbejdsnummer.trim() === ""
    ) {

      setFejl(
        "Udfyld navn og arbejdsnummer"
      );

      return;
    }

    setFejl("");

    setLoggedIn(true);
  };

  // ENTER

  const handleKeyPress = (e) => {

    if (e.key === "Enter") {
      login();
    }
  };

  // UPDATE TIPS

  const updateTip = (
    kampId,
    team,
    value
  ) => {

    setTips((prev) => ({
      ...prev,

      [kampId]: {
        ...prev[kampId],

        [team]: value,
      },
    }));
  };

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

  // CHECK TIPS

  const alleTipsUdfyldt =
    alleKampe.every(
      (kamp) =>
        tips[kamp.kampId]?.home !==
          undefined &&
        tips[kamp.kampId]?.away !==
          undefined
    );

  // GEM TIPS

  const gemTips = async () => {

    try {

      await addDoc(
        collection(db, "tips"),

        {
          navn,

          arbejdsnummer,

          tips,

          tidspunkt: new Date(),
        }
      );

      setTipsLocked(true);

      setShowConfirm(false);

      alert(
        "🔥 Tips er nu låst!"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Fejl ved gemning"
      );
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

            <input
              type="text"
              placeholder="Indtast navn"
              value={navn}
              onChange={(e) =>
                setNavn(
                  e.target.value
                )
              }
              onKeyDown={handleKeyPress}
            />

            <input
              type="text"
              placeholder="Arbejdsnummer"
              value={arbejdsnummer}
              onChange={(e) =>
                setArbejdsnummer(
                  e.target.value
                )
              }
              onKeyDown={handleKeyPress}
            />

            {fejl && (
              <p className="fejl">
                {fejl}
              </p>
            )}

            <button onClick={login}>
              Start
            </button>

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

            {tipsLocked && (
              <div className="locked-status">
                ✅ Tips er låst
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

            <div className="gem-wrapper">

              <button
                className={`gem-btn ${
                  !alleTipsUdfyldt
                    ? "disabled"
                    : ""
                }`}
                disabled={!alleTipsUdfyldt}
                onClick={() =>
                  setShowConfirm(true)
                }
              >
                💾
              </button>

            </div>
          )}

          {showConfirm && (

            <div className="confirm-overlay">

              <div className="confirm-box">

                <h2>
                  Er du sikker?
                </h2>

                <p>
                  Du kan IKKE ændre dine tips bagefter.
                </p>

                <div className="confirm-buttons">

                  <button
                    className="cancel-btn"
                    onClick={() =>
                      setShowConfirm(false)
                    }
                  >
                    Annuller
                  </button>

                  <button
                    className="confirm-btn"
                    onClick={gemTips}
                  >
                    Ja, gem tips
                  </button>

                </div>

              </div>

            </div>
          )}

        </>
      )}

    </div>
  );
}

export default App;