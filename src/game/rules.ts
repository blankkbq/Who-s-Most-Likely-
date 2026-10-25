import { CategoryId, QUESTIONS_DATABASE, Question } from './questions';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  score: number;
  connected: boolean;
}

export interface VoteTally {
  voteCounts: Record<string, number>;
  totalVotes: number;
  maxVotes: number;
  winners: string[]; // player IDs
  percentages: Record<string, number>;
  isUnanimous: boolean;
  isTie: boolean;
  selfVoters: string[]; // players who voted for themselves
}

const CLEAN_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a friendly 4-character room code without confusing glyphs
 */
export function generateRoomCode(): string {
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += CLEAN_CODE_CHARS.charAt(Math.floor(Math.random() * CLEAN_CODE_CHARS.length));
  }
  return result;
}

/**
 * Sanitize player nickname
 */
export function sanitizeNickname(raw: string): string {
  if (!raw) return 'PartyPlayer';
  const cleaned = raw.replace(/[^\w\s-]/g, '').trim();
  if (cleaned.length === 0) return 'PartyPlayer';
  return cleaned.slice(0, 16);
}

/**
 * Calculate tally and winner from round votes
 */
export function tallyVotes(
  players: { id: string; name: string }[],
  votes: Record<string, string> // voterId -> targetPlayerId
): VoteTally {
  const voteCounts: Record<string, number> = {};
  const selfVoters: string[] = [];

  // Initialize all players with 0 votes
  players.forEach((p) => {
    voteCounts[p.id] = 0;
  });

  let totalVotes = 0;
  for (const [voterId, targetId] of Object.entries(votes)) {
    if (voteCounts[targetId] !== undefined) {
      voteCounts[targetId]++;
      totalVotes++;
      if (voterId === targetId) {
        selfVoters.push(voterId);
      }
    }
  }

  let maxVotes = 0;
  for (const count of Object.values(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
    }
  }

  const winners: string[] = [];
  if (maxVotes > 0) {
    for (const [id, count] of Object.entries(voteCounts)) {
      if (count === maxVotes) {
        winners.push(id);
      }
    }
  }

  const percentages: Record<string, number> = {};
  players.forEach((p) => {
    const count = voteCounts[p.id] || 0;
    percentages[p.id] = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
  });

  const isUnanimous = totalVotes > 1 && maxVotes === totalVotes && winners.length === 1;
  const isTie = winners.length > 1;

  return {
    voteCounts,
    totalVotes,
    maxVotes,
    winners,
    percentages,
    isUnanimous,
    isTie,
    selfVoters,
  };
}

/**
 * Generate humorous, friendly commentary based on vote results
 */
export function generateCommentary(
  tally: VoteTally,
  players: { id: string; name: string }[]
): string {
  if (tally.totalVotes === 0 || tally.winners.length === 0) {
    return 'The jury stayed silent on this one!';
  }

  const winnerNames = tally.winners
    .map((id) => players.find((p) => p.id === id)?.name || 'Someone')
    .join(' and ');

  if (tally.isUnanimous) {
    const quotes = [
      `Unanimous conviction for ${winnerNames}! Not a single person in the room doubted it for a second.`,
      `100% agreement on ${winnerNames}! Even their lawyer would have advised taking a plea deal.`,
      `Every single vote went to ${winnerNames}. Zero hesitation, absolute consensus!`,
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  if (tally.isTie) {
    const quotes = [
      `A dead tie between ${winnerNames}! Looks like you're both equally guilty.`,
      `Split decision! The room couldn't pick between ${winnerNames}.`,
      `It's a standoff between ${winnerNames}! You might need to settle this with rock-paper-scissors.`,
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  const primaryWinnerId = tally.winners[0];
  const isSelfVoter = tally.selfVoters.includes(primaryWinnerId);

  if (isSelfVoter && tally.maxVotes >= 2) {
    return `Peak self-awareness! ${winnerNames} took the crown AND voted for themselves.`;
  }

  const quotes = [
    `The people have spoken: ${winnerNames} takes the crown with ${tally.percentages[primaryWinnerId]}% of the vote!`,
    `No surprise here — ${winnerNames} was the clear favorite for this one.`,
    `Guilty as charged! ${winnerNames} ran away with the top spot.`,
    `Statistically proven: everyone in this room has witnessed ${winnerNames} do this before.`,
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Pick randomized questions for a game round
 */
export function selectQuestions(
  category: CategoryId | 'random',
  count: number = 10,
  excludeIds: string[] = []
): Question[] {
  let pool = QUESTIONS_DATABASE.filter((q) => !excludeIds.includes(q.id));

  if (category !== 'random') {
    pool = pool.filter((q) => q.category === category);
  }

  // Shuffle pool (Fisher-Yates)
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  if (shuffled.length < count && category !== 'random') {
    // If not enough questions in category after exclusions, reload category without exclusions
    const fullCategory = QUESTIONS_DATABASE.filter((q) => q.category === category);
    return fullCategory.slice(0, count);
  }

  return shuffled.slice(0, count);
}
