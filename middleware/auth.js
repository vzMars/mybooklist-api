module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.status(401).json({ user: null });
    }
  },
};
