const parseYMDDate = (dateString) => {
  if (!dateString) return null;

  const parts = dateString.split('-');
  if (parts.length !== 3) return null;

  const [yearStr, monthStr, dayStr] = parts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if ([year, month, day].some(Number.isNaN)) return null;

  const parsedDate = new Date(year, month - 1, day);

  const isValidDate =
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day;

  return isValidDate ? parsedDate : null;
};

const isValidYMDDate = (dateString) => !!parseYMDDate(dateString);

module.exports = {
  parseYMDDate,
  isValidYMDDate,
};

