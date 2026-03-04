## Retro Math Arcade

Retro Math Arcade is a small web app game platform for practicing math facts with a playful, early-arcade look and feel. It is designed for ages **6–9** and focuses on light, fast fluency practice rather than high-stress speed.

### Games Included

- **Memory Match**: Flip cards to match each math fact with its answer.
- **Math Go Fish**: Tap a fact in your hand to “ask the pond” for cards with the same answer.
- **Hide & Seek**: Click around a classroom-style grid to uncover hidden flashcards.
- **Math War**: See two math facts and choose the one with the larger answer.
- **Fact Bingo**: A 5×5 bingo board of answers; solve the called problem and mark the right square.
- **Flashcard Blocks (Jenga)**: Pull a block, solve the fact, and see whether the tower “wobbles” or stays steady.

All games share the same **operation** and **number range** settings, so you can switch quickly between them while staying on the same skill level.

### Running the App

This project is deliberately lightweight and does not require a build step.

- **Option 1 (simplest)**: Open `index.html` directly in your browser.
- **Option 2 (local server)**:
  - Install Node.js (if you don’t already have it).
  - From this folder, run:

    ```bash
    npm install serve --save-dev
    npm run start
    ```

  - Then open the URL printed in the terminal (usually `http://localhost:3000` or `http://localhost:5000`).

### Teacher / Adult Ideas

- **Small groups**: Let students rotate between games while staying on the same operation (e.g., addition to 20).
- **Partner play**: One student controls the screen, the other calls out answers, then switch.
- **Whole‑group**: Use `Fact Bingo` or `Math War` projected at the front while students solve on whiteboards.

The UI aims for a **retro low‑fi arcade** aesthetic—pixel font, soft CRT overlay, and bright “neon” borders—while staying clean and readable for young learners.

