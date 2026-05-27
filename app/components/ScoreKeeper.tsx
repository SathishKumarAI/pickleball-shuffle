"use client";

import { useState } from "react";

export default function ScoreKeeper({
  score,
  onScore,
  onUndo,
  onReset,
}: {
  score: { team1: number; team2: number };
  onScore: (team: 1 | 2) => void;
  onUndo: (team: 1 | 2) => void;
  onReset: () => void;
}) {
  const [showReset, setShowReset] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-4 bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
        {/* Team 1 */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => onUndo(1)}
            disabled={score.team1 === 0}
            className="text-xs text-blue-300/60 hover:text-blue-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors px-2"
          >
            −1
          </button>
          <button
            onClick={() => onScore(1)}
            className="flex flex-col items-center gap-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <span className="text-3xl font-black text-white">{score.team1}</span>
            <span className="text-xs text-blue-200">Team 1</span>
          </button>
        </div>

        <div className="text-gray-500 font-bold text-lg">vs</div>

        {/* Team 2 */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => onUndo(2)}
            disabled={score.team2 === 0}
            className="text-xs text-red-300/60 hover:text-red-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors px-2"
          >
            −1
          </button>
          <button
            onClick={() => onScore(2)}
            className="flex flex-col items-center gap-1 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <span className="text-3xl font-black text-white">{score.team2}</span>
            <span className="text-xs text-red-200">Team 2</span>
          </button>
        </div>
      </div>

      {/* Reset */}
      {!showReset ? (
        <button
          onClick={() => setShowReset(true)}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Reset Score
        </button>
      ) : (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Reset to 0-0?</span>
          <button
            onClick={() => { onReset(); setShowReset(false); }}
            className="px-3 py-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full transition-colors"
          >
            Yes
          </button>
          <button
            onClick={() => setShowReset(false)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition-colors"
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}
