const SUPABASE_URL = "https://nqvpxopsiiagemumfbmc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xdnB4b3BzaWlhZ2VtdW1mYm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2OTQwNTcsImV4cCI6MjA5NTI3MDA1N30.VQYWGLALTxD84EksKwwUuVh5zfoAkCgenhMRXm3xdMs";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let matches = [];

const form = document.getElementById("matchForm");
const table = document.getElementById("matchesTable");
const statsGrid = document.getElementById("statsGrid");

const players = ["Kuba", "Filip"];

function getSetWinner(kubaGames, filipGames) {
  if (kubaGames > filipGames) return "Kuba";
  if (filipGames > kubaGames) return "Filip";
  return null;
}

function calculateMatch(data) {
  const sets = [
    [data.kubaSet1, data.filipSet1],
    [data.kubaSet2, data.filipSet2],
    [data.kubaSet3, data.filipSet3]
  ].filter(set =>
    set[0] !== null &&
    set[1] !== null &&
    !Number.isNaN(set[0]) &&
    !Number.isNaN(set[1])
  );

  let kubaSets = 0;
  let filipSets = 0;
  let kubaGames = 0;
  let filipGames = 0;

  sets.forEach(([kuba, filip]) => {
    kubaGames += kuba;
    filipGames += filip;

    const winner = getSetWinner(kuba, filip);
    if (winner === "Kuba") kubaSets++;
    if (winner === "Filip") filipSets++;
  });

  const winner = kubaSets > filipSets ? "Kuba" : "Filip";
  const score = sets.map(([kuba, filip]) => `${kuba}:${filip}`).join(", ");

  return {
    ...data,
    sets,
    kubaSets,
    filipSets,
    kubaGames,
    filipGames,
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
    Filip: {
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
      stats.Filip.losses++;
    } else {
      stats.Filip.wins++;
      stats.Kuba.losses++;
    }

    stats.Kuba.setsWon += match.kubaSets;
    stats.Kuba.setsLost += match.filipSets;
    stats.Kuba.gamesWon += match.kubaGames;
    stats.Kuba.gamesLost += match.filipGames;

    stats.Filip.setsWon += match.filipSets;
    stats.Filip.setsLost += match.kubaSets;
    stats.Filip.gamesWon += match.filipGames;
    stats.Filip.gamesLost += match.kubaGames;
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
      <td>${match.filipSets}</td>
      <td>${match.kubaGames}</td>
      <td>${match.filipGames}</td>
      <td>${match.note || "-"}</td>
    </tr>
  `).join("");
}

function render() {
  renderStats();
  renderTable();
}

async function loadMatches() {
  const { data, error } = await supabaseClient
    .from("tennis_matches")
    .select("*")
    .order("match_date", { ascending: false });

  if (error) {
    console.error("Chyba při načítání:", error);
    alert("Nepodařilo se načíst zápasy ze Supabase.");
    return;
  }

  matches = data.map(match =>
    calculateMatch({
      id: match.id,
      date: match.match_date,
      surface: match.surface,
      kubaSet1: match.kuba_set1,
      filipSet1: match.filip_set1,
      kubaSet2: match.kuba_set2,
      filipSet2: match.filip_set2,
      kubaSet3: match.kuba_set3,
      filipSet3: match.filip_set3,
      note: match.note
    })
  );

  render();
}

async function saveMatchToSupabase(match) {
  const { error } = await supabaseClient
    .from("tennis_matches")
    .insert({
      match_date: match.date,
      surface: match.surface,
      kuba_set1: match.kubaSet1,
      filip_set1: match.filipSet1,
      kuba_set2: match.kubaSet2,
      filip_set2: match.filipSet2,
      kuba_set3: match.kubaSet3,
      filip_set3: match.filipSet3,
      winner: match.winner,
      note: match.note
    });

  if (error) {
    console.error("Chyba při ukládání:", error);
    alert("Zápas se nepodařilo uložit.");
    return;
  }

  await loadMatches();
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const data = {
    date: document.getElementById("date").value,
    surface: document.getElementById("surface").value || "Antuka",
    kubaSet1: Number(document.getElementById("kubaSet1").value),
    filipSet1: Number(document.getElementById("filipSet1").value),
    kubaSet2: Number(document.getElementById("kubaSet2").value),
    filipSet2: Number(document.getElementById("filipSet2").value),
    kubaSet3: document.getElementById("kubaSet3").value === "" ? null : Number(document.getElementById("kubaSet3").value),
    filipSet3: document.getElementById("filipSet3").value === "" ? null : Number(document.getElementById("filipSet3").value),
    note: document.getElementById("note").value
  };

  const match = calculateMatch(data);

  await saveMatchToSupabase(match);

  form.reset();
  document.getElementById("surface").value = "Antuka";
});



loadMatches();
