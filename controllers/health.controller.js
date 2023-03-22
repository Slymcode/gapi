exports.check = (req, res) => {
  res.status(200).json({
    message: "Health check"
  });
}