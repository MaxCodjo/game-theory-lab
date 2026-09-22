# ♟ The Strategic Mind

**Where game theory meets psychology.** A dynamic, interactive website about game theory and the psychology of decision-making — the companion site for a YouTube + TikTok channel that makes strategy entertaining and educational.

**Live site:** https://www.greatstrata.com/

## What's inside

- **Top 10 models** — each explained in 3 layers: a story you'll remember, an animated SVG diagram, and the formal equation (KaTeX-rendered): Nash equilibrium, Prisoner's Dilemma, repeated games, zero-sum, sequential, simultaneous, mixed strategies, cooperative games, bargaining, Stackelberg.
- **3 playable labs** — iterated Prisoner's Dilemma vs. Tit-for-Tat, a penalty-kick game with an *adaptive* goalie that punishes predictable play (mixed strategies), and a coffee-price war where you can feel the Nash equilibrium click.
- **20 flip flashcards** — all 20 frameworks with intuition + equation on the back.
- **Cheat sheet** — situation → model → memory hook.
- **Educators section** — reading order, pop-culture hooks, and an interactive pop quiz.
- **Channel roadmap** — Season 1 episode plan for the YouTube/TikTok channel.

## Stack

Vanilla HTML/CSS/JS — no build step, no framework. KaTeX (CDN) for math, Google Fonts for typography. Deployable anywhere static files are served.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
