module.exports = {
  // ASYNC ERROR HANDLER
  asyncErrorHandler(fun) {
    return (req, res, next) => {
      Promise.resolve(fun(req, res, next)).catch(e => {
        console.log(e.message, req.app.get("env") === "development" ? e : {});
        res.redirect("/campgrounds");
      });
    };
  }
};
