import json
import random
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="Pickleball Shuffle", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CARDS_PATH = Path(__file__).parent.parent / "data" / "cards.json"

with open(CARDS_PATH) as f:
    ALL_CARDS = json.load(f)

CATEGORIES = sorted(set(c["category"] for c in ALL_CARDS))

DECK_MODES = {
    "family": ["Shot Restriction", "Body & Movement", "Bonus / Reward", "Strategy / Skill"],
    "party": ["Social & Party", "Wacky / Chaos", "Wild Card / Swap", "Penalty", "Bonus / Reward"],
    "drill": ["Shot Restriction", "Strategy / Skill", "Body & Movement"],
    "tournament": ["Shot Restriction", "Strategy / Skill", "Meta & Game-Flow"],
    "chaos": CATEGORIES,
}

games: dict = {}


class GameState(BaseModel):
    game_id: str
    deck: list
    drawn: list
    score_team1: int
    score_team2: int
    serving_team: int
    server_number: int
    mode: str


class ScoreUpdate(BaseModel):
    team: int


@app.get("/api/cards")
def get_all_cards():
    return {"cards": ALL_CARDS, "categories": CATEGORIES, "total": len(ALL_CARDS)}


@app.get("/api/cards/random")
def random_card(mode: str = "chaos"):
    pool = get_deck_pool(mode)
    return {"card": random.choice(pool)}


@app.get("/api/modes")
def get_modes():
    return {
        "modes": {
            name: {
                "categories": cats,
                "card_count": len([c for c in ALL_CARDS if c["category"] in cats]),
            }
            for name, cats in DECK_MODES.items()
        }
    }


@app.post("/api/game/new")
def new_game(mode: str = "chaos"):
    pool = get_deck_pool(mode)
    random.shuffle(pool)
    game_id = f"{random.randint(1000, 9999)}"
    games[game_id] = GameState(
        game_id=game_id,
        deck=[c["id"] for c in pool],
        drawn=[],
        score_team1=0,
        score_team2=0,
        serving_team=1,
        server_number=1,
        mode=mode,
    )
    return {"game_id": game_id, "mode": mode, "deck_size": len(pool)}


@app.get("/api/game/{game_id}")
def get_game(game_id: str):
    if game_id not in games:
        raise HTTPException(404, "Game not found")
    g = games[game_id]
    return {
        "game_id": g.game_id,
        "mode": g.mode,
        "deck_remaining": len(g.deck),
        "drawn_count": len(g.drawn),
        "score": {"team1": g.score_team1, "team2": g.score_team2},
        "serving_team": g.serving_team,
        "server_number": g.server_number,
    }


@app.post("/api/game/{game_id}/draw")
def draw_card(game_id: str):
    if game_id not in games:
        raise HTTPException(404, "Game not found")
    g = games[game_id]
    if not g.deck:
        g.deck = list(g.drawn)
        random.shuffle(g.deck)
        g.drawn = []
    card_id = g.deck.pop(0)
    g.drawn.append(card_id)
    card = next((c for c in ALL_CARDS if c["id"] == card_id), None)
    return {"card": card, "deck_remaining": len(g.deck)}


@app.post("/api/game/{game_id}/score")
def update_score(game_id: str, update: ScoreUpdate):
    if game_id not in games:
        raise HTTPException(404, "Game not found")
    g = games[game_id]
    if update.team == 1:
        g.score_team1 += 1
    else:
        g.score_team2 += 1
    return {
        "score": {"team1": g.score_team1, "team2": g.score_team2},
        "serving_team": g.serving_team,
    }


@app.get("/api/game/{game_id}/history")
def card_history(game_id: str):
    if game_id not in games:
        raise HTTPException(404, "Game not found")
    g = games[game_id]
    last_10 = g.drawn[-10:]
    cards = [next((c for c in ALL_CARDS if c["id"] == cid), None) for cid in reversed(last_10)]
    return {"history": [c for c in cards if c]}


def get_deck_pool(mode: str) -> list:
    cats = DECK_MODES.get(mode, CATEGORIES)
    return [c for c in ALL_CARDS if c["category"] in cats]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
