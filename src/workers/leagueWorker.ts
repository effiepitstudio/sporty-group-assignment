/// <reference lib="webworker" />

const API_BASE = "https://www.thesportsdb.com/api/v1/json/3";

interface WorkerIncoming {
  type: "FETCH_LEAGUES" | "FETCH_BADGE";
  payload?: { leagueId: string };
}

self.onmessage = async (event: MessageEvent<WorkerIncoming>) => {
  const { type, payload } = event.data;

  try {
    if (type === "FETCH_LEAGUES") {
      const response = await fetch(`${API_BASE}/all_leagues.php`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      self.postMessage({ type: "LEAGUES_RESULT", payload: data });
    }

    if (type === "FETCH_BADGE" && payload?.leagueId) {
      const url = `${API_BASE}/search_all_seasons.php?badge=1&id=${payload.leagueId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      self.postMessage({
        type: "BADGE_RESULT",
        payload: data,
        leagueId: payload.leagueId,
      });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown worker error";
    self.postMessage({
      type: "ERROR",
      error: errorMessage,
      leagueId: payload?.leagueId,
    });
  }
};
