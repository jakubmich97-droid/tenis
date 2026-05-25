const STORAGE_KEY = "tennisMatches";

let matches = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const form = document.getElementById("matchForm");
const table = document.getElementById("matchesTable");
const statsGrid = document.getElementById("statsGrid");
const clearBtn = document.getElementById("clearBtn");

const players = ["Kuba", "Kamarád"];

function saveMatches() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}

function getSetWinner(kubaGames, friendGames) {
  if (kubaGames > friendGames) return "Kuba";
  if (friendGames > kubaGames) return "Kamarád";
  return null;
}

function calculateMatch(data) {
  const sets = [
    [data.kubaSet1, data.friendSet1],
    [data.kubaSet2, data.friendSet2],
    [data.kubaSet3, data.friendSet3]
  ].filter(set => set[0] !== null && set[1] !== null && !Number.isNaN(set[0]) && !Number.isNaN(set[1]));

  let kubaSets = 0;
  let friendSets = 0;
  let kubaGames = 0;
  let friendGames = 0;

  sets.forEach(([kuba, friend]) => {
    kubaGames += kuba;
    friendGames += friend;

    const winner = getSetWinner(kuba, friend);
    if (winner === "Kuba") kubaSets++;
    if (winner === "Kamarád") friendSets++;
  });

  const winner = kubaSets > friendSets ? "Kuba" : "Kamarád";
  const score = sets.map(([kuba, friend]) => `${kuba}:${friend}`).join(", ");

  return {
    ...data,
    sets,
    kubaSets,
    friendSets,
    kubaGames,
    friendGames,
    winner,
    score
  };
}

function getStats() {
  const stats = {
    Kuba: {
      wins: 0,
      losses: 0,
      setsWon: 0,
      setsLost: 0,
      gamesWon: 0,
      gamesLost: 0
    },
    Kamarád: {
      wins: 0,
      losses: 0,
      setsWon: 0,
      setsLost: 0,
      gamesWon: 0,
      gamesLost: 0
    }
  };

  matches.forEach(match => {
    if (match.winner === "Kuba") {
      stats.Kuba.wins++;
      stats.Kamarád.losses++;
    } else {
      stats.Kamarád.wins++;
      stats.Kuba.losses++;
    }

    stats.Kuba.setsWon += match.kubaSets;
    stats.Kuba.setsLost += match.friendSets;
    stats.Kuba.gamesWon += match.kubaGames;
    stats.Kuba.gamesLost += match.friendGames;

    stats.Kamarád.setsWon += match.friendSets;
    stats.Kamarád.setsLost += match.kubaSets;
    stats.Kamarád.gamesWon += match.friendGames;
    stats.Kamarád.gamesLost += match.kubaGames;
  });

  return stats;
}

function renderStats() {
  const stats = getStats();

  statsGrid.innerHTML = players.map(player => {
    const s = stats[player];
    const total = s.wins + s.losses;
    const winRate = total ? ((s.wins / total) * 100).toFixed(2) : "0.00";

    return `
      <article class="stat-card">
        <div class="player-name">${player}</div>
        <div class="stat-line">
          <div class="mini-stat">
            <strong>${s.wins}</strong>
            <span>Výhry</span>
          </div>
          <div class="mini-stat">
            <strong>${s.losses}</strong>
            <span>Prohry</span>
          </div>
          <div class="mini-stat">
            <strong>${winRate}%</strong>
            <span>Úspěšnost</span>
          </div>
          <div class="mini-stat">
            <strong>${s.setsWon}:${s.setsLost}</strong>
            <span>Sety</span>
          </div>
          <div class="mini-stat">
            <strong>${s.gamesWon}:${s.gamesLost}</strong>
            <span>Gemy</span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderTable() {
  table.innerHTML = matches.map(match => `
    <tr>
      <td>${match.date}</td>
      <td>${match.surface}</td>
      <td class="winner">${match.winner}</td>
      <td>${match.score}</td>
      <td>${match.kubaSets}</td>
      <td>${match.friendSets}</td>
      <td>${match.kubaGames}</td>
      <td>${match.friendGames}</td>
      <td>${match.note || "-"}</td>
    </tr>
  `).join("");
}

function render() {
  renderStats();
  renderTable();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const data = {
    id: crypto.randomUUID(),
    date: document.getElementById("date").value,
    surface: document.getElementById("surface").value || "Antuka",
    kubaSet1: Number(document.getElementById("kubaSet1").value),
    friendSet1: Number(document.getElementById("friendSet1").value),
    kubaSet2: Number(document.getElementById("kubaSet2").value),
    friendSet2: Number(document.getElementById("friendSet2").value),
    kubaSet3: document.getElementById("kubaSet3").value === "" ? null : Number(document.getElementById("kubaSet3").value),
    friendSet3: document.getElementById("friendSet3").value === "" ? null : Number(document.getElementById("friendSet3").value),
    note: document.getElementById("note").value
  };

  const match = calculateMatch(data);

  matches.unshift(match);
  saveMatches();
  render();
  form.reset();

  document.getElementById("surface").value = "Antuka";
});

clearBtn.addEventListener("click", () => {
  if (!confirm("Opravdu chceš smazat všechny zápasy?")) return;

  matches = [];
  saveMatches();
  render();
});

render();
