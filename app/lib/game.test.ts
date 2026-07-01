import { describe, it, expect } from "vitest";
import {
  createGame,
  addScore,
  adjustScore,
  sideOut,
  undoLast,
  resetScore,
  startNewGame,
  checkWin,
  gamesToWinMatch,
  seriesTally,
  matchWinner,
  pointStatus,
  newMatch,
  isPaused,
  pauseGame,
  resumePlay,
  elapsedMs,
  formatTime,
  serverLabel,
  recordTimeout,
  recordFault,
  logCount,
  DEFAULT_CONFIG,
  type GameConfig,
  type GameSession,
} from "./game";

const cfg = (over: Partial<GameConfig> = {}): GameConfig => ({ ...DEFAULT_CONFIG, ...over });

// Rally scoring: any team can score on any point (sideOutScoring off).
function rallyGame(over: Partial<GameConfig> = {}): GameSession {
  const g = createGame("test");
  g.config = cfg({ sideOutScoring: false, ...over });
  return g;
}

describe("checkWin", () => {
  it("needs pointsToWin and a 2-point lead by default", () => {
    expect(checkWin({ team1: 11, team2: 9 }, cfg())).toBe(1);
    expect(checkWin({ team1: 11, team2: 10 }, cfg())).toBeNull();
    expect(checkWin({ team1: 12, team2: 10 }, cfg())).toBe(1);
  });

  it("team2 can win", () => {
    expect(checkWin({ team1: 9, team2: 11 }, cfg())).toBe(2);
  });

  it("win-by-1 when winByTwo is off", () => {
    expect(checkWin({ team1: 11, team2: 10 }, cfg({ winByTwo: false }))).toBe(1);
  });

  it("honors custom pointsToWin", () => {
    expect(checkWin({ team1: 15, team2: 13 }, cfg({ pointsToWin: 15 }))).toBe(1);
    expect(checkWin({ team1: 11, team2: 0 }, cfg({ pointsToWin: 15 }))).toBeNull();
  });

  it("no winner at 0-0", () => {
    expect(checkWin({ team1: 0, team2: 0 }, cfg())).toBeNull();
  });
});

describe("addScore (rally scoring)", () => {
  it("increments the scoring team and logs history", () => {
    const g = addScore(rallyGame(), 1);
    expect(g.score).toEqual({ team1: 1, team2: 0 });
    expect(g.history).toHaveLength(1);
    expect(g.history[0]).toMatchObject({ team: 1, type: "score" });
  });

  it("does not mutate the input game", () => {
    const g0 = rallyGame();
    const g1 = addScore(g0, 1);
    expect(g0.score).toEqual({ team1: 0, team2: 0 });
    expect(g1).not.toBe(g0);
  });

  it("sets winner when the win condition is met", () => {
    let g = rallyGame();
    for (let i = 0; i < 11; i++) g = addScore(g, 1);
    expect(g.score.team1).toBe(11);
    expect(g.winner).toBe(1);
  });

  it("ignores scoring once there is a winner", () => {
    let g = rallyGame();
    for (let i = 0; i < 11; i++) g = addScore(g, 1);
    const after = addScore(g, 2);
    expect(after).toBe(g);
  });

  it("ignores scoring when locked", () => {
    const g = rallyGame({ scoreLocked: true });
    expect(addScore(g, 1)).toBe(g);
  });
});

describe("addScore (side-out scoring)", () => {
  it("only the serving team scores; the other team scoring triggers a side-out", () => {
    const g = createGame("test"); // serving team is 1
    const sameTeam = addScore(g, 1);
    expect(sameTeam.score.team1).toBe(1);

    const other = addScore(g, 2);
    expect(other.score).toEqual({ team1: 0, team2: 0 });
    expect(other.servingTeam).toBe(2);
  });
});

describe("sideOut", () => {
  it("flips the serving team", () => {
    const g = createGame("test");
    expect(g.servingTeam).toBe(1);
    expect(sideOut(g).servingTeam).toBe(2);
    expect(sideOut(sideOut(g)).servingTeam).toBe(1);
  });
});

describe("undoLast", () => {
  it("restores the score before the last event and clears winner", () => {
    let g = addScore(rallyGame(), 1);
    g = addScore(g, 1);
    const undone = undoLast(g);
    expect(undone.score).toEqual({ team1: 1, team2: 0 });
    expect(undone.history).toHaveLength(1);
    expect(undone.winner).toBeNull();
  });

  it("is a no-op on empty history", () => {
    const g = rallyGame();
    expect(undoLast(g)).toBe(g);
  });
});

describe("adjustScore (manual correction)", () => {
  it("clamps at zero and is a no-op below", () => {
    const g = rallyGame();
    expect(adjustScore(g, 1, -1)).toBe(g); // already 0
  });

  it("decrements and logs an undoable event", () => {
    let g = addScore(rallyGame(), 1);
    g = addScore(g, 1); // 2-0
    const fixed = adjustScore(g, 1, -1);
    expect(fixed.score.team1).toBe(1);
    expect(fixed.history.length).toBe(g.history.length + 1);
    expect(undoLast(fixed).score.team1).toBe(2);
  });

  it("clears the winner when correcting below the win line", () => {
    let g = rallyGame();
    for (let i = 0; i < 11; i++) g = addScore(g, 1);
    expect(g.winner).toBe(1);
    const fixed = adjustScore(g, 1, -1);
    expect(fixed.winner).toBeNull();
    expect(fixed.score.team1).toBe(10);
  });
});

describe("resetScore", () => {
  it("zeros score, serving, and history", () => {
    let g = addScore(rallyGame(), 1);
    g = sideOut(g);
    const r = resetScore(g);
    expect(r.score).toEqual({ team1: 0, team2: 0 });
    expect(r.servingTeam).toBe(1);
    expect(r.history).toHaveLength(0);
  });
});

describe("best-of-N match flow", () => {
  it("gamesToWinMatch = ceil(N/2)", () => {
    expect(gamesToWinMatch(cfg({ bestOf: 1 }))).toBe(1);
    expect(gamesToWinMatch(cfg({ bestOf: 3 }))).toBe(2);
    expect(gamesToWinMatch(cfg({ bestOf: 5 }))).toBe(3);
  });

  it("startNewGame banks the finished game and bumps gameNumber", () => {
    let g = rallyGame();
    for (let i = 0; i < 11; i++) g = addScore(g, 1); // team1 wins game 1
    const next = startNewGame(g);
    expect(next.gameNumber).toBe(2);
    expect(next.gamesWon.team1).toBe(1);
    expect(next.gameResults).toHaveLength(1);
    expect(next.score).toEqual({ team1: 0, team2: 0 });
    expect(next.winner).toBeNull();
  });

  it("seriesTally includes the just-won game", () => {
    let g = rallyGame();
    for (let i = 0; i < 11; i++) g = addScore(g, 2);
    expect(g.winner).toBe(2);
    expect(seriesTally(g)).toEqual({ team1: 0, team2: 1 });
  });

  it("matchWinner null until a team reaches the needed games", () => {
    let g = rallyGame({ bestOf: 3 });
    for (let i = 0; i < 11; i++) g = addScore(g, 1); // 1-0, not enough
    expect(matchWinner(g)).toBeNull();
    g = startNewGame(g);
    for (let i = 0; i < 11; i++) g = addScore(g, 1); // 2-0, takes it
    expect(matchWinner(g)).toBe(1);
  });
});

describe("pointStatus (game/match point)", () => {
  it("is null when nobody is one point away", () => {
    expect(pointStatus(rallyGame())).toBeNull();
  });

  it("flags game point at 10-5 (win by 2 satisfied)", () => {
    let g = rallyGame();
    for (let i = 0; i < 10; i++) g = addScore(g, 1);
    for (let i = 0; i < 5; i++) g = addScore(g, 2);
    const p = pointStatus(g);
    expect(p).toEqual({ team: 1, match: false });
  });

  it("flags match point when winning the game takes the series", () => {
    let g = rallyGame({ bestOf: 3 });
    g = { ...g, gamesWon: { team1: 1, team2: 0 } }; // already up a game
    for (let i = 0; i < 10; i++) g = addScore(g, 1); // 10-0, one from the game = match
    expect(pointStatus(g)).toEqual({ team: 1, match: true });
  });

  it("is null once the game is won", () => {
    let g = rallyGame();
    for (let i = 0; i < 11; i++) g = addScore(g, 1);
    expect(pointStatus(g)).toBeNull();
  });
});

describe("newMatch", () => {
  it("keeps teams/config but resets the series", () => {
    let g = createGame("chaos", { team1: "A", team2: "B" });
    g.config = cfg({ pointsToWin: 15 });
    for (let i = 0; i < 11; i++) g = addScore(g, 1);
    const m = newMatch(g);
    expect(m.playerNames).toEqual({ team1: "A", team2: "B" });
    expect(m.config.pointsToWin).toBe(15);
    expect(m.gamesWon).toEqual({ team1: 0, team2: 0 });
    expect(m.winner).toBeNull();
  });
});

describe("pause / elapsed clock", () => {
  it("pause then resume subtracts paused time from elapsed", () => {
    const g = createGame("test");
    const start = g.startTime;
    const paused = pauseGame(g, start + 1000);
    expect(isPaused(paused)).toBe(true);
    const resumed = resumePlay(paused, start + 4000); // paused for 3s
    expect(isPaused(resumed)).toBe(false);
    expect(elapsedMs(resumed, start + 10000)).toBe(7000); // 10s - 3s paused
  });

  it("pause is idempotent; resume is a no-op when running", () => {
    const g = createGame("test");
    const p = pauseGame(g, g.startTime + 100);
    expect(pauseGame(p, g.startTime + 200)).toBe(p);
    expect(resumePlay(g, g.startTime + 100)).toBe(g);
  });
});

describe("formatTime", () => {
  it("formats m:ss", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(65_000)).toBe("1:05");
    expect(formatTime(600_000)).toBe("10:00");
  });
});

describe("official mode: doubles server rotation", () => {
  const officialDoubles = () =>
    createGame("track", { team1: "A", team2: "B" }, { officialMode: true, gameType: "doubles" });

  it("first server fault advances to server 2 on the same team", () => {
    const g = officialDoubles(); // servingTeam 1, serverNumber 1
    const after = sideOut(g);
    expect(after.servingTeam).toBe(1);
    expect(after.serverNumber).toBe(2);
  });

  it("second server fault passes serve to the other team, server 1", () => {
    const g = { ...officialDoubles(), serverNumber: 2 as const };
    const after = sideOut(g);
    expect(after.servingTeam).toBe(2);
    expect(after.serverNumber).toBe(1);
  });

  it("singles official mode passes serve straight over", () => {
    const g = createGame("track", undefined, { officialMode: true, gameType: "singles" });
    const after = sideOut(g);
    expect(after.servingTeam).toBe(2);
    expect(after.serverNumber).toBe(1);
  });

  it("casual mode (no officialMode) always passes the serve, server stays 1", () => {
    const g = createGame("family"); // doubles by default, but not official
    const after = sideOut(g);
    expect(after.servingTeam).toBe(2);
    expect(after.serverNumber).toBe(1);
  });

  it("serverLabel reflects doubles vs singles", () => {
    expect(serverLabel(officialDoubles())).toBe("Server 1");
    expect(serverLabel(createGame("track", undefined, { gameType: "singles" }))).toBe("");
  });
});

describe("official mode: match log", () => {
  it("records timeouts and faults per team", () => {
    let g = createGame("track", undefined, { officialMode: true });
    g = recordTimeout(g, 1);
    g = recordFault(g, 2);
    g = recordTimeout(g, 1);
    expect(logCount(g, "timeout")).toBe(2);
    expect(logCount(g, "timeout", 1)).toBe(2);
    expect(logCount(g, "fault", 2)).toBe(1);
    expect(logCount(g, "fault", 1)).toBe(0);
    expect(g.matchLog?.[0]).toMatchObject({ type: "timeout", team: 1 });
  });

  it("log entries capture the score and game number", () => {
    let g = createGame("track", undefined, { officialMode: true });
    g = { ...g, score: { team1: 3, team2: 2 }, gameNumber: 2 };
    g = recordTimeout(g, 2);
    expect(g.matchLog?.[0]).toMatchObject({ score: { team1: 3, team2: 2 }, gameNumber: 2 });
  });
});
