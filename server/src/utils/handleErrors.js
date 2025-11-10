const handleError = (res, error, message, status = 500) => {
  console.error(message, error);
  res.status(status).json({
    success: false,
    error: {
      message: error.message || message,
    },
  });
};

module.exports = {
  handleError,
};

