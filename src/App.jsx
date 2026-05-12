import { useState, useEffect } from "react";
import "./App.css";

import kampeData from "./kampe_dansk.json";

import { db } from "./firebase";

import {
  collection,
  addDoc,
  onSnapshot,
} from "firebase/firestore";

function App() {
  const [navn, setNavn] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [fejl, setFejl] = useState("");

  const [tips, setTips] = useState({});

  const [leaderboard, setLeaderboard] = useState([]);

  // LIVE RESULTATER
  const [liveResults, setLiveResults] =
    useState({});

  // LOCK
  const [tipsLocked, setTipsLocked] =
    useState(false);

  // CONFIRM POPUP
  const [showConfirm, setShowConfirm] =
    useState(false);

  // ENTER LOGIN
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      login();
    }
  };

  // LOGIN
  const login = () => {
    if (navn.trim() === "") {
      setFejl("Indsæt navn");
      return;
    }

    setFejl("");
    setLoggedIn(true);
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

  // TJEK ALLE TIPS
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

      alert("Fejl ved gemning");
    }
  };

  // POINTSYSTEM
  const calculatePoints = (
    userTips,
    liveResults
  ) => {
    let totalPoints = 0;

    Object.keys(liveResults).forEach(
      (kampId) => {
        const result =
          liveResults[kampId];

        const tip =
          userTips[kampId];

        if (!tip) return;

        const actualHome =
          result.home;

        const actualAway =
          result.away;

        const tipHome = Number(
          tip.home
        );

        const tipAway = Number(
          tip.away
        );

        // 4 POINT
        if (
          tipHome === actualHome &&
          tipAway === actualAway
        ) {
          totalPoints += 4;
          return;
        }

        // 3 POINT
        const actualWinner =
          actualHome > actualAway
            ? "home"
            : actualAway >
              actualHome
            ? "away"
            : "draw";

        const tipWinner =
          tipHome > tipAway
            ? "home"
            : tipAway > tipHome
            ? "away"
            : "draw";

        if (
          actualWinner === tipWinner
        ) {
          totalPoints += 3;
          return;
        }

        // 1 POINT
        const actualGoals =
          actualHome + actualAway;

        const tipGoals =
          tipHome + tipAway;

        if (
          actualGoals === tipGoals
        ) {
          totalPoints += 1;
        }
      }
    );

    return totalPoints;
  };

  // LIVE LEADERBOARD
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "tips"),

      (snapshot) => {
        const players =
          snapshot.docs.map((doc) => {
            const data =
              doc.data();

            return {
              id: doc.id,

              navn: data.navn,

              points:
                calculatePoints(
                  data.tips,
                  liveResults
                ),
            };
          });

        players.sort(
          (a, b) =>
            b.points - a.points
        );

        setLeaderboard(players);
      }
    );

    return () => unsubscribe();
  }, [liveResults]);

  // LIVE RESULTATER
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "results"),

      (snapshot) => {
        const loadedResults =
          {};

        snapshot.forEach((doc) => {
          loadedResults[doc.id] =
            doc.data();
        });

        setLiveResults(
          loadedResults
        );
      }
    );

    return () => unsubscribe();
  }, []);

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
              onKeyDown={
                handleKeyPress
              }
            />

            {fejl && (
              <p className="fejl">
                {fejl}
              </p>
            )}

            <button onClick={login}>
              Start
            </button>
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
                  key={
                    kamp.kampId
                  }
                >
                  <h2 className="kamp-title">
                    {
                      kamp.hjemmehold
                    }{" "}
                    -{" "}
                    {
                      kamp.udehold
                    }
                  </h2>

                  <div className="kamp-info">
                    <span>
                      {kamp.dato}
                    </span>

                    <span className="gruppe">
                      Gruppe{" "}
                      {
                        kamp.gruppe
                      }
                    </span>
                  </div>

                  <div className="hold-linje">
                    <div className="holdnavn">
                      {
                        kamp.hjemmehold
                      }
                    </div>

                    <select
                      disabled={
                        tipsLocked
                      }
                      value={
                        tips[
                          kamp
                            .kampId
                        ]?.home ??
                        ""
                      }
                      onChange={(
                        e
                      ) =>
                        updateTip(
                          kamp.kampId,
                          "home",
                          Number(
                            e.target
                              .value
                          )
                        )
                      }
                    >
                      <option value="">
                        Mål
                      </option>

                      {[
                        ...Array(
                          16
                        ),
                      ].map(
                        (
                          _,
                          i
                        ) => (
                          <option
                            key={
                              i
                            }
                            value={
                              i
                            }
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
                      {
                        kamp.udehold
                      }
                    </div>

                    <select
                      disabled={
                        tipsLocked
                      }
                      value={
                        tips[
                          kamp
                            .kampId
                        ]?.away ??
                        ""
                      }
                      onChange={(
                        e
                      ) =>
                        updateTip(
                          kamp.kampId,
                          "away",
                          Number(
                            e.target
                              .value
                          )
                        )
                      }
                    >
                      <option value="">
                        Mål
                      </option>

                      {[
                        ...Array(
                          16
                        ),
                      ].map(
                        (
                          _,
                          i
                        ) => (
                          <option
                            key={
                              i
                            }
                            value={
                              i
                            }
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
                onClick={() =>
                  setShowConfirm(
                    true
                  )
                }
                disabled={
                  !alleTipsUdfyldt
                }
              >
                {alleTipsUdfyldt
                  ? "🔥 Gem alle tips"
                  : "Udfyld alle kampe"}
              </button>
            </div>
          )}

          {/* LEADERBOARD */}

          <div className="leaderboard">
            <h1>
              🏆 Leaderboard
            </h1>

            {leaderboard.map(
              (
                player,
                index
              ) => (
                <div
                  key={
                    player.id
                  }
                  className={`leaderboard-row ${
                    index === 0
                      ? "gold"
                      : index === 1
                      ? "silver"
                      : index === 2
                      ? "bronze"
                      : ""
                  }`}
                >
                  <div className="leaderboard-rank">
                    #
                    {index + 1}
                  </div>

                  <div className="leaderboard-name">
                    {
                      player.navn
                    }
                  </div>

                  <div className="leaderboard-points">
                    {
                      player.points
                    }{" "}
                    pts
                  </div>
                </div>
              )
            )}
          </div>

          {/* CONFIRM BOX */}

          {showConfirm && (
            <div className="confirm-overlay">
              <div className="confirm-box">
                <h2>
                  Er du sikker?
                </h2>

                <p>
                  Du kan IKKE
                  ændre dine
                  tips bagefter.
                </p>

                <div className="confirm-buttons">
                  <button
                    className="cancel-btn"
                    onClick={() =>
                      setShowConfirm(
                        false
                      )
                    }
                  >
                    Annuller
                  </button>

                  <button
                    className="confirm-btn"
                    onClick={
                      gemTips
                    }
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