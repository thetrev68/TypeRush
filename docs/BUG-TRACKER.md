# TypeRush Bug Tracker

**Testing Date**: November 29, 2025
**Version**: Pre-refactor (main.js:827 lines)
**Test URL**: http://localhost:5175/

---

## How to Use This Document

1. Open http://localhost:5175/ in your browser
2. Follow the test scenarios below
3. Document any bugs you find in the "Bugs Found" section
4. Use severity ratings: CRITICAL, HIGH, MEDIUM, LOW

---

## Test Scenarios

### 1. Basic Gameplay Flow
**Goal**: Verify core game mechanics work

**Steps**:
1. [ ] Click "Play" button - game should start
2. [ ] Type a falling word completely - should disappear and add score
3. [ ] Let a word reach the bottom - should lose a life
4. [ ] Lose all 5 lives - should show "Game Over"
5. [ ] Click "Play" again - should restart from score 0

**Expected Behavior**:
- Words spawn regularly
- Typing matches words correctly
- Score increases when words typed
- Lives decrease when words missed
- Game over when lives = 0

**Bugs Found**:
```
[Record bugs here]
```

---

### 2. Active Word Tracking
**Goal**: Verify the correct word is active for typing

**Steps**:
1. [ ] Start game, wait for 2-3 words on screen
2. [ ] Start typing - only the LOWEST word should highlight
3. [ ] Finish typing it - next lowest should become active
4. [ ] Try typing a word that's NOT the lowest - should not work

**Expected Behavior**:
- Only one word has the "active-word" class (glowing border)
- Active word is always the one closest to bottom
- You can only type the active word
- When active word is typed, next lowest becomes active

**Bugs Found**:
```
[Record bugs here]
```

---

### 3. Word Highlighting & Progress
**Goal**: Verify typing progress shows correctly

**Steps**:
1. [ ] Start game
2. [ ] Type first letter of active word - should turn green
3. [ ] Type second letter - both letters green
4. [ ] Type wrong letter - should flash red, clear input
5. [ ] Finish word - should disappear

**Expected Behavior**:
- Typed portion turns green
- Wrong input flashes red
- Input clears on error
- Word disappears on completion

**Bugs Found**:
```
[Record bugs here]
```

---

### 4. Thumb Detection & Colors
**Goal**: Verify left/right thumb indicators work

**Steps**:
1. [ ] Start game
2. [ ] Look at first letter of each word - should have colored indicator
3. [ ] Words starting with q,w,e,r,t,a,s,d,f,g,z,x,c,v,b = LEFT (blue/purple)
4. [ ] Words starting with y,u,i,o,p,h,j,k,l,n,m = RIGHT (orange/pink)
5. [ ] Type words with correct thumb - should flash GREEN
6. [ ] Type words with wrong thumb - should flash RED

**Expected Behavior**:
- First letter has colored underline/indicator
- Correct thumb flash = green
- Wrong thumb flash = red
- Accuracy % tracks correctly

**Bugs Found**:
```
[Record bugs here]
```

---

### 5. Scoring System
**Goal**: Verify score, combo, WPM calculation

**Steps**:
1. [ ] Start game, type 3 words in a row correctly
2. [ ] Check combo multiplier increases (x1 → x2)
3. [ ] Miss a word - combo should reset to x1
4. [ ] Type 10+ words - WPM should show non-zero
5. [ ] Beat high score - confetti should appear
6. [ ] Refresh page - high score should persist

**Expected Behavior**:
- Combo increases every 5 correct words
- Missing a word resets combo
- WPM calculates from recent words (sliding window)
- High score saves to localStorage
- Confetti on new record

**Bugs Found**:
```
[Record bugs here]
```

---

### 6. Lives & Game Over
**Goal**: Verify life loss and game end

**Steps**:
1. [ ] Start game
2. [ ] Let 1 word fall - lives 5→4
3. [ ] Let 4 more fall - lives 4→3→2→1→0
4. [ ] On 0 lives - game should end
5. [ ] Check if accuracy was 80%+ or WPM 20+ - should unlock next lesson

**Expected Behavior**:
- Each missed word = -1 life
- Lives display updates immediately
- At 0 lives, game ends
- Unlock message shows if criteria met

**Bugs Found**:
```
[Record bugs here]
```

---

### 7. Level Progression
**Goal**: Verify level-up system

**Steps**:
1. [ ] Start game, wait ~50 seconds (RAMP_MS)
2. [ ] Level should increase (Lv 1 → Lv 2)
3. [ ] Should show "Level 2 Complete!" pause screen
4. [ ] Click "Continue" - game resumes
5. [ ] Words should spawn faster and fall faster

**Expected Behavior**:
- Every 50 seconds, level increases
- Pause screen appears
- "Continue" button resumes
- Spawn rate and fall speed increase with level

**Bugs Found**:
```
[Record bugs here]
```

---

### 8. Lesson Switching
**Goal**: Verify lesson picker works

**Steps**:
1. [ ] Look at lesson dropdown - only lesson 1 should be unlocked
2. [ ] Play game, meet unlock criteria (80% acc OR 20 WPM OR 10 words)
3. [ ] Next lesson should unlock (🔒 removed)
4. [ ] Select different lesson, start game
5. [ ] Words should match lesson constraints (e.g., "Left Hand" = only left words)

**Expected Behavior**:
- Locked lessons show 🔒
- Unlock criteria: 80% accuracy OR 20 WPM OR 10 words typed
- Unlocks persist after refresh
- Lesson filters work correctly

**Bugs Found**:
```
[Record bugs here]
```

---

### 9. Theme Switching
**Goal**: Verify themes apply correctly

**Steps**:
1. [ ] Open theme dropdown
2. [ ] Select "Space" - background should change to dark purple
3. [ ] Select "Ocean" - background should change to blue
4. [ ] Select "Racing" - background should change to red/black
5. [ ] Refresh page - theme should persist

**Expected Behavior**:
- CSS variables update immediately
- Body class changes (theme-default, theme-space, etc.)
- Background gradients animate
- Theme persists in localStorage

**Bugs Found**:
```
[Record bugs here]
```

---

### 10. Input Focus & Mobile
**Goal**: Verify keyboard stays focused

**Steps**:
1. [ ] Click anywhere on screen - input should focus
2. [ ] Click on theme picker - should NOT steal focus from game
3. [ ] Click on lesson picker - should NOT steal focus from game
4. [ ] Type during game - words should still be typed

**Expected Behavior**:
- Hidden input always focused during game
- Select elements don't steal focus
- Click anywhere refocuses input

**Bugs Found**:
```
[Record bugs here]
```

---

### 11. Word Spawning & Positioning
**Goal**: Verify words spawn safely without overlap

**Steps**:
1. [ ] Start game
2. [ ] Watch first 5 words spawn
3. [ ] Check for overlapping words (should have 120px spacing)
4. [ ] Max 3 words on screen at once

**Expected Behavior**:
- Words spawn with safe horizontal spacing
- No overlaps (minimum 120px between words)
- Maximum 3 words on screen
- Words spawn at random X positions

**Bugs Found**:
```
[Record bugs here]
```

---

### 12. PWA & Offline Badges
**Goal**: Verify badges show correct status

**Steps**:
1. [ ] Check top-right badges
2. [ ] If running as PWA (standalone), "PWA" badge should be green
3. [ ] If offline, "Offline" badge should be green
4. [ ] Go offline (disable network in DevTools)
5. [ ] Offline badge should turn green
6. [ ] Game should still work (cached)

**Expected Behavior**:
- PWA badge = green when installed
- Offline badge = green when offline
- Badges update in real-time

**Bugs Found**:
```
[Record bugs here]
```

---

### 13. Edge Cases
**Goal**: Find weird behaviors

**Steps**:
1. [ ] Type really fast - does typing lag or break?
2. [ ] Type gibberish (random letters) - does it handle gracefully?
3. [ ] Type > 20 characters - should clear input
4. [ ] Pause/resume multiple times - does game state persist?
5. [ ] Switch lessons mid-game - what happens?
6. [ ] Spam the Play button - does it break?
7. [ ] Minimize window during game - does animation pause?
8. [ ] Resize window - do words stay in bounds?

**Bugs Found**:
```
[Record bugs here]
```

---

### 14. Data Loading
**Goal**: Verify word/lesson data loads

**Steps**:
1. [ ] Open DevTools Network tab
2. [ ] Refresh page
3. [ ] Check for /data/words.json and /data/lessons.json requests
4. [ ] If fetch fails, should fall back to defaultWords/defaultLessons

**Expected Behavior**:
- Fetches words.json and lessons.json
- Falls back to defaults if fetch fails
- Lesson picker populates
- No console errors

**Bugs Found**:
```
[Record bugs here]
```

---

### 15. Browser Console Errors
**Goal**: Check for JavaScript errors

**Steps**:
1. [ ] Open DevTools Console (F12)
2. [ ] Play through entire game session
3. [ ] Look for red errors or warnings
4. [ ] Document any errors found

**Expected Behavior**:
- No JavaScript errors
- Only warning should be Vite CJS deprecation (cosmetic)

**Bugs Found**:
```
[Record bugs here]
```

---

## Bugs Found During Testing

### Bug Template
```markdown
### Bug #X: [Short Description]
**Severity**: CRITICAL | HIGH | MEDIUM | LOW
**Found in**: [Scenario number]
**Steps to Reproduce**:
1.
2.
3.

**Expected**:
**Actual**:
**Screenshot/Video**: [if applicable]
**Code Location**: [file:line if known]
**Notes**:
```

---

## Bug #1: [Your bugs go here]

---

## Summary Statistics
- **Total Bugs Found**:
- **Critical**:
- **High**:
- **Medium**:
- **Low**:

---

## Refactoring Impact Analysis

After refactoring, re-run ALL test scenarios and compare:
- [ ] All bugs still present (expected - refactor shouldn't fix bugs)
- [ ] No new bugs introduced (CRITICAL - rollback if new bugs appear)
- [ ] Performance same or better

---

## Notes
- Add any general observations here
- Performance issues
- UX concerns
- Feature requests
