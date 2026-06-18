import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "./firebase";

import kampeData from "./kampe_dansk.json";

export default function Leaderboard() {

  const [leaderboard, setLeaderboard] =
    useState([]);

  const [liveResults, setLiveResults] =
    useState({});

  const [selectedPlayer, setSelectedPlayer] =
    useState(null);

    const [lastUpdate, setLastUpdate] =
  useState(null);

  // ALLE KAMPE

  const alleKampe = kampeData
    .flatMap((gruppeObjekt) =>
      gruppeObjekt.kampe.map(
        (kamp, index) => ({
          ...kamp,
          gruppe: gruppeObjekt.gruppe,
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

  // POINTSYSTEM

  const calculateMatchPoints = (
    tip,
    result
  ) => {

    if (!tip || !result)
      return 0;

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

    const actualWinner =
      actualHome > actualAway
        ? "home"
        : actualAway > actualHome
          ? "away"
          : "draw";

    const tipWinner =
      tipHome > tipAway
        ? "home"
        : tipAway > tipHome
          ? "away"
          : "draw";

    const actualGoals =
      actualHome + actualAway;

    const tipGoals =
      tipHome + tipAway;

    // 5 POINT

    if (
      actualWinner === tipWinner &&
      tipHome === actualHome &&
      tipAway === actualAway
    ) {
      return 5;
    }

    // 4 POINT

    if (
      actualWinner === tipWinner &&
      actualGoals === tipGoals
    ) {
      return 4;
    }

    // 3 POINT

    if (
      actualWinner === tipWinner
    ) {
      return 3;
    }

    if (
      actualGoals === tipGoals
    ) {
      return 1;
    }

    return 0;
  };

  // TOTAL POINT

  const calculateStats = (
    userTips,
    liveResults
  ) => {

    let totalPoints = 0;

    let fivePointers = 0;
    let fourPointers = 0;
    let threePointers = 0;
    let onePointers = 0;

    Object.keys(liveResults).forEach(
      (kampId) => {

        const points =
          calculateMatchPoints(
            userTips?.[kampId],
            liveResults[kampId]
          );

        totalPoints += points;

        if (points === 5) fivePointers++;
        if (points === 4) fourPointers++;
        if (points === 3) threePointers++;
        if (points === 1) onePointers++;
      }
    );

    return {
      totalPoints,
      fivePointers,
      fourPointers,
      threePointers,
      onePointers,
    };
  };


// LIVE RESULTATER

useEffect(() => {

  const unsubscribe = onSnapshot(
    collection(db, "results"),

    (snapshot) => {

      const loadedResults = {};

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

// LAST UPDATE

useEffect(() => {

  const loadLastUpdate = async () => {

    const snap = await getDoc(
      doc(db, "system", "lastUpdate")
    );

    if (snap.exists()) {
      setLastUpdate(snap.data());
    }
  };

  loadLastUpdate();

}, []);

// LEADERBOARD

useEffect(() => {

  const unsubscribe = onSnapshot(
    collection(db, "tips"),

    (snapshot) => {

      const players =
        snapshot.docs

          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          .filter(
            (player) =>
              player.locked === true
          )

          .map((data) => {

            const stats =
              calculateStats(
                data.tips,
                liveResults
              );

            return {
              id: data.id,

              navn: `${data.navn} (${data.arbejdsnummer || "?"})`,

              tips: data.tips,

              points: stats.totalPoints,

              fivePointers:
                stats.fivePointers,

              fourPointers:
                stats.fourPointers,

              threePointers:
                stats.threePointers,

              onePointers:
                stats.onePointers,
            };
          });
      players.sort((a, b) => {

        if (b.points !== a.points)
          return b.points - a.points;

        if (
          b.fivePointers !==
          a.fivePointers
        )
          return (
            b.fivePointers -
            a.fivePointers
          );

        if (
          b.fourPointers !==
          a.fourPointers
        )
          return (
            b.fourPointers -
            a.fourPointers
          );

        if (
          b.threePointers !==
          a.threePointers
        )
          return (
            b.threePointers -
            a.threePointers
          );

        return (
          b.onePointers -
          a.onePointers
        );
      });
setLeaderboard(players);

}
);

return () => unsubscribe();

    }, [liveResults]);
const jumpToLastUpdatedMatch =
  () => {

    if (!lastUpdate?.kampId)
      return;

    const element =
      document.getElementById(
        `kamp-${lastUpdate.kampId}`
      );

    if (element) {

      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };
  return (
    <div className="leaderboard-page">

      <div className="leaderboard-box">

        <h1>
          🏆 Leaderboard
        </h1>

        {leaderboard.map(
          (player, index) => (

            <div
              key={player.id}

              onClick={() =>
                setSelectedPlayer(player)
              }

              className={`leaderboard-row clickable ${index === 0
                ? "gold"
                : index === 1
                  ? "silver"
                  : index === 2
                    ? "bronze"
                    : ""
                }`}
            >

              <div>
                #{index + 1}
              </div>

              <div>
                {player.navn}
              </div>

              <div>
                {player.points} pts
              </div>

            </div>
          )
        )}

      </div>

      {selectedPlayer && (

        <div className="details-overlay">

          <div className="details-box">

            <button
              className="close-btn"
              onClick={() =>
                setSelectedPlayer(null)
              }
            >
              ✕
            </button>

            <h2>
              {selectedPlayer.navn}
            </h2>
{lastUpdate && (

  <div
    className="latest-update-box"
    onClick={jumpToLastUpdatedMatch}
  >
    🕒 Senest opdateret

    <br />

    {lastUpdate.updatedAt?.toDate
      ? lastUpdate.updatedAt
          .toDate()
          .toLocaleString("da-DK")
      : "Ukendt tidspunkt"}

    <br /><br />

    👉 Tryk for at gå til kampen
  </div>

)}
            {alleKampe.map((kamp) => {

              const tip =
                selectedPlayer.tips?.[
                kamp.kampId
                ];

              const result =
                liveResults[
                kamp.kampId
                ];

              if (!tip)
                return null;

              const points =
                calculateMatchPoints(
                  tip,
                  result
                );
              let reason = "";

              if (result) {

                const actualGoals =
                  result.home + result.away;

                const tipGoals =
                  Number(tip.home) +
                  Number(tip.away);

                const actualWinner =
                  result.home > result.away
                    ? "home"
                    : result.away > result.home
                      ? "away"
                      : "draw";

                const tipWinner =
                  Number(tip.home) >
                    Number(tip.away)
                    ? "home"
                    : Number(tip.away) >
                      Number(tip.home)
                      ? "away"
                      : "draw";

                if (
                  Number(tip.home) === result.home &&
                  Number(tip.away) === result.away
                ) {
                  reason = "🏆 Korrekt resultat";
                } else if (
                  actualWinner === tipWinner &&
                  actualGoals === tipGoals
                ) {
                  reason =
                    "⚽ Korrekt vinder + korrekt antal mål";
                } else if (
                  actualWinner === tipWinner
                ) {
                  reason =
                    "✅ Korrekt vinder/uafgjort";
                } else if (
                  actualGoals === tipGoals
                ) {
                  reason =
                    "🎯 Korrekt antal mål";
                } else {
                  reason =
                    "❌ Intet ramt";
                }
              }

              return (
               <div
  id={`kamp-${kamp.kampId}`}
  key={kamp.kampId}
  className="match-detail"
>
                  <div className="match-date">
                    {kamp.dato}
                  </div>

                  <h3>
                    {kamp.hjemmehold} - {kamp.udehold}
                  </h3>

                  <p>
                    Dit tip: {tip.home}-{tip.away}
                  </p>

                  {result ? (
                    <>
                      <p>
                        Resultat: {result.home}-{result.away}
                      </p>

                      <div className="points-earned">
                        +{points} point
                      </div>

                      <div className="point-reason">
                        {reason}
                      </div>
                    </>
                  ) : (
                    <div className="points-pending">
                      ⏳ Kamp ikke spillet endnu
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}