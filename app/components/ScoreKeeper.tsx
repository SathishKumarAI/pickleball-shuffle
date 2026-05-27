"use client";

export default function ScoreKeeper({
  score,
  onScore,
}: {
  score: { team1: number; team2: number };
  onScore: (team: 1 | 2) => void;
}) {
  return (
    <div className="flex items-center gap-6 bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
      <button
        onClick={() => onScore(1)}
        className="flex flex-col items-center gap-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all hover:scale-105 active:scale-95"
      >
        <span className="text-3xl font-black text-white">{score.team1}</span>
        <span className="text-xs text-blue-200">Team 1</span>
      </button>

      <div className="text-gray-500 font-bold text-lg">vs</div>

      <button
        onClick={() => onScore(2)}
        className="flex flex-col items-center gap-1 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl transition-all hover:scale-105 active:scale-95"
      >
        <span className="text-3xl font-black text-white">{score.team2}</span>
        <span className="text-xs text-red-200">Team 2</span>
      </button>
    </div>
  );
}
