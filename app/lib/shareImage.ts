// Render a match/game result to a shareable PNG and share or download it
// (backlog F092). Canvas-only, no backend.

export type ResultInfo = {
  winnerName: string;
  score: { team1: number; team2: number };
  matchOver: boolean;
  seriesWon?: { team1: number; team2: number };
};

const W = 1080;
const H = 1350;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function makeResultBlob(info: ResultInfo): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0e0e11");
  bg.addColorStop(1, "#15241d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Accent card
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  roundRect(ctx, 80, 120, W - 160, H - 240, 48);
  ctx.fill();

  ctx.textAlign = "center";

  ctx.fillStyle = "#34d399";
  ctx.font = "700 44px sans-serif";
  ctx.fillText(info.matchOver ? "MATCH WON" : "GAME WON", W / 2, 320);

  // Winner name (shrink to fit)
  ctx.fillStyle = "#ededee";
  let size = 110;
  ctx.font = `800 ${size}px sans-serif`;
  while (ctx.measureText(info.winnerName).width > W - 260 && size > 48) {
    size -= 6;
    ctx.font = `800 ${size}px sans-serif`;
  }
  ctx.fillText(info.winnerName, W / 2, 520);

  ctx.fillStyle = "#9a9aa1";
  ctx.font = "600 40px sans-serif";
  ctx.fillText("wins", W / 2, 590);

  // Score
  ctx.fillStyle = "#fbbf24";
  ctx.font = "900 200px sans-serif";
  ctx.fillText(`${info.score.team1} - ${info.score.team2}`, W / 2, 820);

  if (info.seriesWon) {
    ctx.fillStyle = "#9a9aa1";
    ctx.font = "600 46px sans-serif";
    ctx.fillText(`Match ${info.seriesWon.team1} - ${info.seriesWon.team2}`, W / 2, 920);
  }

  // Footer
  ctx.fillStyle = "#34d399";
  ctx.font = "700 40px sans-serif";
  ctx.fillText("Paddol", W / 2, H - 230);
  ctx.fillStyle = "#7e7e87";
  ctx.font = "500 34px sans-serif";
  ctx.fillText("pickleball-card-games.vercel.app", W / 2, H - 175);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

// Share via the Web Share API when available (with the file), else download.
export async function shareResult(info: ResultInfo): Promise<"shared" | "downloaded" | "failed"> {
  const blob = await makeResultBlob(info);
  if (!blob) return "failed";
  const file = new File([blob], "pickleball-result.png", { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Paddol" });
      return "shared";
    } catch {
      return "failed";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pickleball-result.png";
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
