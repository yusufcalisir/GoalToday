export const calculateStreak = (completedDates: string[]): number => {
  if (!completedDates || completedDates.length === 0) return 0;

  // Sort dates descending
  const sortedDates = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  // If the last completion was not today and not yesterday, the streak is broken (0)
  // Unless we want to show the streak that *was* active? Usually streak resets to 0.
  const lastCompletion = sortedDates[0];
  if (lastCompletion !== today && lastCompletion !== yesterday) {
    return 0;
  }

  let streak = 1;
  let currentDateString = lastCompletion;

  // Iterate to check consecutive days
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(currentDateString);
    prevDate.setDate(prevDate.getDate() - 1);
    const expectedPrevDate = prevDate.toISOString().split('T')[0];

    if (sortedDates[i] === expectedPrevDate) {
      streak++;
      currentDateString = expectedPrevDate;
    } else {
      break;
    }
  }

  return streak;
};
