# NostrQuizAndVote MVP Testing Guide

## Manual Testing Scenarios

### Prerequisites
- Two browser windows/tabs (one for host, one for player)
- Nostr extension installed (e.g., Alby, nos2x) for NIP-07 login
- Development server running on http://localhost:12001

### Test Scenario 1: Complete Game Flow

#### Host Flow Testing

1. **Host Login & Quiz Creation**
   - Open browser window 1 → http://localhost:12001/host
   - Click "Login with Nostr" and approve in extension
   - Verify login success and user info display
   - Click "Create New Quiz"
   - Fill out quiz form:
     - Title: "Test Quiz"
     - Description: "Testing the MVP"
     - Time per question: 30 seconds
     - Enable deposit requirement: 1000 sats
   - Add questions:
     - Question 1: "What is 2+2?" Answers: ["3", "4", "5", "6"] Correct: 1 (4)
     - Question 2: "Capital of France?" Answers: ["London", "Paris", "Berlin", "Rome"] Correct: 1 (Paris)
   - Click "Create Quiz"
   - Verify quiz appears in quiz list

2. **Game Session Creation**
   - Select the created quiz
   - Click "Create Game Session"
   - Verify session creation and PIN display
   - Note the 6-digit PIN for player joining

3. **Lobby Management**
   - Verify lobby screen shows:
     - Game PIN prominently displayed
     - QR code for joining
     - "Waiting for players..." message
     - Player count: 0

#### Player Flow Testing

4. **Player Join**
   - Open browser window 2 → http://localhost:12001/join
   - Enter the PIN from host lobby
   - Click "Join Game"
   - Enter nickname: "TestPlayer"
   - Optionally login with Nostr (test both with/without)
   - Click "Join Game"
   - Verify successful join message

5. **Lobby Verification**
   - Switch to host window
   - Verify player appears in lobby:
     - Player count: 1
     - "TestPlayer" listed
     - Player avatar/info displayed

6. **Game Start**
   - In host window, click "Start Game"
   - Verify game transitions to question phase
   - Check timer starts counting down from 30 seconds

#### Game Play Testing

7. **Question 1 - Player Side**
   - Switch to player window
   - Verify question display:
     - "What is 2+2?" shown clearly
     - 4 answer options displayed
     - Timer counting down
     - Current score: 0
   - Select answer "4" (correct)
   - Click "Submit Answer"
   - Verify "Answer submitted" state

8. **Question 1 - Host Side**
   - Switch to host window
   - Verify question control interface:
     - Current question displayed
     - Timer visible
     - Answer submission tracking
   - Wait for timer to expire or manually advance
   - Verify results screen shows:
     - Correct answer highlighted
     - Player statistics
     - Answer distribution

9. **Score Verification**
   - Check host leaderboard shows updated scores
   - Switch to player window
   - Verify player score updated (should be > 0)
   - Check console logs for score update flow

10. **Question 2 - Repeat Process**
    - Host advances to next question
    - Player receives "Capital of France?"
    - Player selects "Paris" (correct)
    - Verify score increases again
    - Check final leaderboard

#### Game Completion

11. **Final Results**
    - Host window shows final leaderboard
    - Winner celebration for top player
    - Complete game statistics
    - Player window shows final ranking and score

### Test Scenario 2: Multiple Players

1. **Setup Multiple Players**
   - Open 3-4 additional browser tabs for players
   - Have each join with different nicknames
   - Test both Nostr-logged and anonymous players

2. **Concurrent Answer Submission**
   - Start game with multiple players
   - Have players submit answers at different times
   - Verify all scores update correctly
   - Check leaderboard ranking accuracy

### Test Scenario 3: Edge Cases

1. **Late Answers**
   - Player submits answer after time expires
   - Verify proper handling

2. **Duplicate Answers**
   - Player tries to submit multiple answers
   - Verify only first answer counts

3. **Network Issues**
   - Simulate connection drops
   - Verify graceful error handling

### Test Scenario 4: Nostr Integration

1. **Event Publishing Verification**
   - Monitor browser console for Nostr events
   - Verify event kinds 35000-35004 are published
   - Check event content format matches specification

2. **Relay Connection**
   - Verify connection to default relays
   - Test with different relay configurations

### Expected Results

#### Scoring System
- Correct answers: 100 base points + time bonus (up to 50 points)
- Incorrect answers: 0 points
- Time bonus: More points for faster answers
- Total score accumulates across questions

#### UI/UX
- Responsive design works on mobile and desktop
- Color scheme matches specification
- Smooth transitions between game phases
- Clear feedback for all user actions

#### Nostr Events
- Quiz Definition (35000) published on quiz creation
- Game Session (35001) published on session start
- Player Join (35002) published when players join
- Answer (35003) published on answer submission
- Score Update (35004) published after each question

### Bug Verification

#### Fixed: Score Stays at 0
- ✅ Player scores should update after each correct answer
- ✅ Leaderboard should show accurate rankings
- ✅ Final results should display correct totals

### Performance Testing

1. **Load Testing**
   - Test with 10+ concurrent players
   - Verify performance remains smooth
   - Check memory usage and event handling

2. **Mobile Testing**
   - Test on mobile devices
   - Verify touch interactions work
   - Check responsive layout

### Debugging Tools

- Browser console logs show detailed flow
- Network tab shows Nostr event publishing
- React DevTools for component state inspection

### Known Limitations in MVP

- No persistent storage (refresh loses state)
- Limited to single quiz per session
- No advanced quiz features (images, multimedia)
- Basic error handling for network issues

### Success Criteria

✅ Host can create quiz and start game session
✅ Players can join via PIN and participate
✅ Real-time score updates work correctly
✅ Leaderboard shows accurate rankings
✅ All Nostr events publish correctly
✅ Mobile-responsive design functions
✅ Score bug is fixed (scores update properly)