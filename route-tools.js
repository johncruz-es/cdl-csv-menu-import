exports.DisplayRouteData = function(req, res, next) {
    if(process.env.NODE_ENV != "production") {
        console.log("[-->] ", req.method, req.url, " | body : ", req.body, " | params : ", req.params, " | query : ", req.query, " | file : ", req.files);
    } else {
        console.log(req.url);
    }

    next();
}

exports.DisplayReturnData = function(req, res, next) {
    if(process.env.NODE_ENV != "production") {
        console.log("[<--]", req.method, req.url, res.statusCode, res.locals.data);
    } else {
        console.log("[<--] ", res.statusCode, req.method, req.url);
    }

    next();
}

exports.HandleError = function(err, req, res, next) {
    console.log(err);
    if(!res.statusCode) res.statusCode = 500;

    res.send(`Error : ${err.message}`);
}