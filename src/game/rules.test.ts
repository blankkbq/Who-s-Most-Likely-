import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRoomCode, sanitizeNickname, tallyVotes, generateCommentary, selectQuestions } from './rules.ts';
import { QUESTIONS_DATABASE } from './questions.ts';

test('generateRoomCode produces 4-character uppercase alphanumeric code', () => {
  const code = generateRoomCode();
  assert.equal(code.length, 4);
  assert.match(code, /^[A-Z0-9]{4}$/);
});

test('sanitizeNickname cleans up malicious characters and enforces length', () => {
  assert.equal(sanitizeNickname('  CoolPlayer  '), 'CoolPlayer');
  assert.equal(sanitizeNickname('<script>alert("hack")</script>'), 'scriptalerthacks');
  assert.equal(sanitizeNickname('SuperLongPlayerNameExceedingLimit'), 'SuperLongPlayerN');
  assert.equal(sanitizeNickname(''), 'PartyPlayer');
  assert.equal(sanitizeNickname('   '), 'PartyPlayer');
});

test('tallyVotes counts votes correctly and determines single winner', () => {
  const players = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
    { id: 'p3', name: 'Charlie' },
  ];
  const votes = {
    p1: 'p2',
    p2: 'p2',
    p3: 'p1',
  };

  const tally = tallyVotes(players, votes);
  assert.equal(tally.totalVotes, 3);
  assert.equal(tally.voteCounts['p2'], 2);
  assert.equal(tally.voteCounts['p1'], 1);
  assert.equal(tally.voteCounts['p3'], 0);
  assert.deepEqual(tally.winners, ['p2']);
  assert.equal(tally.isUnanimous, false);
  assert.equal(tally.isTie, false);
  assert.deepEqual(tally.selfVoters, ['p2']);
  assert.equal(tally.percentages['p2'], 67);
});

test('tallyVotes detects unanimous vote', () => {
  const players = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
    { id: 'p3', name: 'Charlie' },
  ];
  const votes = {
    p1: 'p3',
    p2: 'p3',
    p3: 'p3',
  };

  const tally = tallyVotes(players, votes);
  assert.equal(tally.isUnanimous, true);
  assert.deepEqual(tally.winners, ['p3']);
});

test('tallyVotes detects ties', () => {
  const players = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
  ];
  const votes = {
    p1: 'p2',
    p2: 'p1',
  };

  const tally = tallyVotes(players, votes);
  assert.equal(tally.isTie, true);
  assert.equal(tally.winners.length, 2);
});

test('selectQuestions returns desired count and respects category', () => {
  const partyQuestions = selectQuestions('party', 5);
  assert.equal(partyQuestions.length, 5);
  partyQuestions.forEach((q) => {
    assert.equal(q.category, 'party');
  });

  const randomQuestions = selectQuestions('random', 8);
  assert.equal(randomQuestions.length, 8);
});

test('questions database contains at least 100 questions across all categories', () => {
  assert.ok(QUESTIONS_DATABASE.length >= 100, `Expected >= 100 questions, got ${QUESTIONS_DATABASE.length}`);
  const categories = ['friends', 'couples', 'party', 'family', 'work', 'random'];
  for (const cat of categories) {
    const count = QUESTIONS_DATABASE.filter((q) => q.category === cat).length;
    assert.ok(count >= 15, `Category ${cat} should have at least 15 questions, found ${count}`);
  }
});

test('generateCommentary outputs non-empty humorous string', () => {
  const players = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
  ];
  const tally = tallyVotes(players, { p1: 'p1', p2: 'p1' });
  const commentary = generateCommentary(tally, players);
  assert.ok(commentary.length > 10);
  assert.ok(commentary.includes('Alice'));
});
