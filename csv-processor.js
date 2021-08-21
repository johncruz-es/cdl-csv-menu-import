const fs = require('fs');
const neatcsv = require('neat-csv');
const cmb = require('./canteen-model-builder');

exports.ProcessCSV = function(req, res, next) {
    let type = "";
    let csv = null;

    if(req.body) {
        if(req.body.type) type = req.body.type;
        type = type.toLowerCase();
    }

    if(req.file) {
        console.log('file detected : ', req.file.originalname);

        loadCSV(req.file.buffer).then(
            rst => {
                console.log(`${rst.length} records detected`);
                
                // Market node
                let marketData = {
                    MarketID : null,
                    AccountName : null,
                    LocationName : null,
                    MarketName : null,
                    Menu : null,
                    ConnectURL : null,
                    Kiosk : null
                }

                if(req.body.MarketID) marketData.MarketID = req.body.MarketID;
                if(req.body.AccountName) marketData.AccountName = req.body.AccountName;
                if(req.body.LocationName) marketData.LocationName = req.body.LocationName;
                if(req.body.MarketName) marketData.MarketName = req.body.MarketName;
                if(req.body.Menu) marketData.Menu = req.body.Menu;
                if(req.body.ConnectURL) marketData.ConnectURL = req.body.ConnectURL;
                if(req.body.Kiosk) marketData.Kiosk = req.body.Kiosk;

                res.locals.data = Process(rst, type, marketData);

                next();
            }, err => {
                console.log("Error processing CSV");
                res.statusCode = 400;
                next(err);
            }
        );
    } else {
        console.log('No file provided -- no file generated');
        res.locals.data = null;
        res.statusCode = 400;

        next();
    }

}

/**
 * Generates the Canteen model -- how it's processed is based on the `type`
 * Supported values below:
 * 
 * - SJSU
 * - UH
 * 
 * @param {object} csv      The csv file
 * @param {string} type     The type of csv menu
 */
Process = function(csv, type, marketData) {
    let columndefinition = null;
    let template = null;
    let rst = null;

    switch(type) {
        case undefined : 
            console.log("Don't know what type was provided");
            reject(null);
        case 'sjsu' : // SJSU 
            console.log('Processing SJSU file');
            template = fs.readFileSync('./columndefinitions/sjsu.cdf.json');
            columndefinition = JSON.parse(template);
            rst = cmb.CreateCanteenModel(csv, columndefinition, marketData);
            break;
        case 'uh' : // UHouston
        console.log('Processing UHouston file');
            template = fs.readFileSync('./columndefinitions/uh.cdf.json');
            columndefinition = JSON.parse(template);
            rst = cmb.CreateCanteenModel(csv, columndefinition, marketData);
            break;
        default :
            console.log("Unsupported format provided");
            reject(null);
    }

    return rst;
}

loadCSV = function(csv) {
    return neatcsv(csv);
}