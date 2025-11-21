const calculateUserStatus = (totalAttempts) => {
  return totalAttempts === 0 ? 'INACTIVE' : 'ACTIVE';
};

module.exports = {
  calculateUserStatus
};
