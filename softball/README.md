# Softball Strategy

A web app that helps youth softball players learn and practice where to throw the ball on defense by drilling “innies” (where the infield throws) and “outties” (where the outfield throws) across many game situations.

---

## The Problem

On a 12U softball team, most players didn’t know the correct next play in the moment. In the field, someone has to call out where the infield should throw and where the outfield should throw. The girls were reluctant to yell anything because they weren’t confident in all the different situations—runners on base, number of outs, and score all change the right answer.

Without a clear, low-stakes way to practice, they either stayed quiet or guessed, which slowed down play and made it harder to build good habits.

---

## What This App Does

The app gives players lots of repetitions of different scenarios in a short time, in a simple, game-like format:

- A random situation is shown (runners on base, outs, score, inning).
- The player chooses the correct **Innies GO** (where the infield throws) and **Outties CUT** (where the outfield throws) using number and text options (e.g. 1, 2, 3, 4, “Any base,” “1 or 2”).
- They get immediate feedback and can move to the next scenario with one tap.

Scenarios are driven by a CSV so the situations and “right answers” can be updated without changing code. The field view uses a diagram so players can see the bases and runners while they decide.

---

## Design Decisions

**Cartoon-like look**  
The UI is meant to feel a bit like a cartoon: thick black outlines, bold type, and a clear field diagram. The goal is to make the app feel less like a test and more like a light, approachable drill so players are more willing to use it and call out in real games.

**Clarity over realism**  
The field is simplified (top-down, clear bases and runners) so attention stays on “where does the ball go?” rather than on a realistic game view.

---

## Next Steps

**Visual and tone**  
- Push the UI further toward a bold, cartoon style so it feels even more playful and distinct.
- Try several color palettes to see how color can make the app feel more fun and fresh without hurting readability.

**Customization for coaches and teams**  
- Let coaches customize which scenarios their team sees (e.g. more or less aggressive plays in certain situations).
- Support team-specific or coach-specific scenario sets so the app matches how each team is taught.

**Beyond “next play” calls**  
- Add practice for **base coach signs**: bunt, steal, and other team signs so players can drill recognition.
- Explore **situation + batted ball**: show where the ball is hit and drill what each fielder should do (cover, backup, throw to whom).

**Metrics and learning**  
- **Per session:** total time in the app and average number of rounds per session.
- **By scenario:** correct-answer rate per situation (e.g. “runner on 1st, 0 outs”) to see which situations players get wrong most often.
- Use that data to surface harder scenarios more often or to add short explanations for those plays.

---

## How to Run

Open `softball-strategy.html` in a browser. Scenarios are loaded from `softball-scenarios.csv` in the same folder; if the file can’t be loaded (e.g. when opening the file directly), the app falls back to scenarios embedded in the page.
