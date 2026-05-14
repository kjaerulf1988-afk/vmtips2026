import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "./firebase";

export default function Leaderboard() {

  const [leaderboard, setLeaderboard] =
    useState([]);

  const [liveResults, setLiveResults] =
    useState({});

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
                #{index + 1}
              </div>

              <div className="leaderboard-name">
                {player.navn}
              </div>

              <div className="leaderboard-points">
                {player.points} pts
              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
}