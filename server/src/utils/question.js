const updateStreak = async (tx, user, submissionDate) => {
    let newStreak = user.currentStreak;
    let longestStreak = user.longestStreak;
  
    const previousSubmission = await tx.submission.findFirst({
      where: {
        userId: user.id,
        attemptDate: {
          lt: submissionDate
        }
      },
      orderBy: {
        attemptDate: 'desc'
      }
    });
  
    if (!previousSubmission) {
      newStreak = 1;
      longestStreak = 1;
    } else {
      const previousDate = new Date(previousSubmission.attemptDate);
      previousDate.setUTCHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor(
        (submissionDate - previousDate) / (1000 * 60 * 60 * 24)
      );
  
      if (daysDiff === 1) {
        newStreak = user.currentStreak + 1;
        longestStreak = Math.max(newStreak, user.longestStreak);
      } else if (daysDiff > 1) {
        newStreak = 1;
      } else {
        newStreak = user.currentStreak;
      }
    }
  
    await tx.user.update({
      where: { id: user.id },
      data: {
        currentStreak: newStreak,
        longestStreak: longestStreak
      }
    });
  
    return {
      currentStreak: newStreak,
      longestStreak: longestStreak
    };
  };
  

const checkAndAwardBadges = async (tx, user, streakUpdate) => {
    const newBadges = [];
  
    const allBadges = await tx.badge.findMany();
    const userBadgeIds = user.userBadges.map(ub => ub.badgeId);
    const availableBadges = allBadges.filter(b => !userBadgeIds.includes(b.id));
  
    for (const badge of availableBadges) {
      let eligible = false;
  
      if (badge.criteriaType === 'STREAK') {
        eligible = streakUpdate.currentStreak >= badge.threshold;
      } else if (badge.criteriaType === 'CORRECT_ANSWERS') {
        eligible = user.totalCorrectAnswers >= badge.threshold;
      } else if (badge.criteriaType === 'TOTAL_ATTEMPTS') {
        eligible = user.totalQuestionsAttempted >= badge.threshold;
      }
  
      if (eligible) {
        await tx.userBadge.create({
          data: {
            userId: user.id,
            badgeId: badge.id
          }
        });
  
        if (badge.points > 0) {
          await tx.user.update({
            where: { id: user.id },
            data: {
              totalPoints: { increment: badge.points }
            }
          });
        }
  
        newBadges.push({
          badgeId: badge.badgeId,
          name: badge.name,
          points: badge.points
        });
      }
    }
  
    return newBadges;
  };

module.exports = {
  updateStreak,
  checkAndAwardBadges
};