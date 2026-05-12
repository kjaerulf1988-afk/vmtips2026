import { useEffect, useState } from "react";

import {
  collection,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";

import { db } from "./firebase";

import kampeData from "./kampe_dansk.json";

const ADMIN_PASSWORD = "vm2026";

export default function AdminPanel() {

  const [password, setPassword] =
    useState("");

  const [loggedIn, setLoggedIn] =
    useState(false);

  const [results, setResults] =
    useState({});

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

  // LOGIN
  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setLoggedIn(true);
    } else {
      alert("Forkert password");
    }
  };

  // HENT RESULTATER
  useEffect(() => {

    const fetchResults = async () => {

      const snapshot = await getDocs(
        collection(db, "results")
      );

      const loadedResults = {};

      snapshot.forEach((doc) => {
        loadedResults[doc.id] =
          doc.data();
      });

      setResults(loadedResults);
    };

    fetchResults();

  }, []);

  // OPDATER RESULTAT
  const updateResult = (
    kampId,
    team,
    value
  ) => {

    setResults((prev) => ({
      ...prev,

      [kampId]: {
        ...prev[kampId],

        [team]:
          value === ""
            ? ""
            : Number(value),
      },
    }));
  };

  // GEM RESULTATER
  const saveResults = async () => {

    try {

      for (const kampId in results) {

        const kamp =
          results[kampId];

        // SKIP TOMME
        if (
          kamp.home === "" ||
          kamp.away === "" ||
          kamp.home === undefined ||
          kamp.away === undefined
        ) {
          continue;
        }

        await setDoc(
          doc(
            db,
            "results",
            kampId
          ),

          {
            home: Number(
              kamp.home
            ),

            away: Number(
              kamp.away
            ),
          }
        );
      }

      alert(
        "🔥 Resultater gemt!"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Fejl ved gemning"
      );
    }
  };

  // LOGIN SCREEN
  if (!loggedIn) {

    return (
      <div className="login-container">
        <div className="login-box">

          <h1>
            🔒 Admin Login
          </h1>

          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }

            onKeyDown={(e) => {
              if (
                e.key === "Enter"
              ) {
                login();
              }
            }}
          />

          <button onClick={login}>
            Login
          </button>

        </div>
      </div>
    );
  }

  // ADMIN PANEL
  return (
    <div className="app">

      <header className="topbar">
        <h2>
          ⚽ Admin Panel
        </h2>
      </header>

      <div className="kampe-container">

        {alleKampe.map((kamp) => (

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

              <input
  className="result-input"
  type="text"
  value={
    results[kamp.kampId]?.home ?? ""
  }
  onChange={(e) =>
    updateResult(
      kamp.kampId,
      "home",
      e.target.value
    )
  }
/>

            </div>

            <div className="vs">
              VS
            </div>

            <div className="hold-linje">

              <div className="holdnavn">
                {kamp.udehold}
              </div>

              <input
                className="result-input"

                type="number"

                min="0"

                value={
                  results[kamp.kampId]
                    ?.away ?? ""
                }

                onChange={(e) =>
                  updateResult(
                    kamp.kampId,
                    "away",
                    e.target.value
                  )
                }
              />

            </div>

          </div>
        ))}

      </div>

      <div className="gem-wrapper">

        <button
          className="gem-btn"
          onClick={saveResults}
        >
          🔥 Gem resultater
        </button>

      </div>

    </div>
  );
}