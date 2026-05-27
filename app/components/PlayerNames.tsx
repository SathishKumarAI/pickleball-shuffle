"use client";

import { useState } from "react";

export default function PlayerNames({
  names,
  onSave,
}: {
  names: { team1: string; team2: string };
  onSave: (names: { team1: string; team2: string }) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [team1, setTeam1] = useState(names.team1);
  const [team2, setTeam2] = useState(names.team2);

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
      >
        ✏️ Edit team names
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-gray-900/80 rounded-xl px-4 py-3 border border-gray-700/50">
      <input
        value={team1}
        onChange={(e) => setTeam1(e.target.value)}
        placeholder="Team 1"
        maxLength={20}
        className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg border border-gray-600 w-28 focus:outline-none focus:border-blue-500"
      />
      <span className="text-gray-500 text-sm">vs</span>
      <input
        value={team2}
        onChange={(e) => setTeam2(e.target.value)}
        placeholder="Team 2"
        maxLength={20}
        className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg border border-gray-600 w-28 focus:outline-none focus:border-red-500"
      />
      <button
        onClick={() => {
          onSave({ team1: team1.trim() || "Team 1", team2: team2.trim() || "Team 2" });
          setEditing(false);
        }}
        className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-full hover:bg-green-500"
      >
        Save
      </button>
    </div>
  );
}
