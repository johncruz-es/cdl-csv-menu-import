const fs = require('fs');

/**
 * Creates the Canteen Model -- schema below:
 {
    OperationNo : "",
    Market : {
        MarketID : "",
        AccountName : "",
        LocationName : "",
        MarketName : "",
        Menu : null,
        ConnectURL : "",
        Kiosk : [
            { Kiosk : "" }
        ],
        ProductCatalog : [
            {
                ProductPackageID : "",
                ProductName : "",
                ProductCategory : "",
                Price: 0,
                TaxRate : 0,
                FeeAmount : 0,
                SubMenu : null,
                HealthyIndicator : 0
            }
        ]
    },
    Message : {
        Name : "",
        Vendor : "0",
        Created : "2021-08-03T15:47:00",
        Version : "1.0.0",
        Mode : "FULL"
    }
 }
 */

 /**
  * 
  * @param {*} itemlist -- the row array 
  * @param {*} columndefinition -- the custom column definition
  * @param {*} marketData -- content for the Market node
  * @returns Canteen JSON
  */
exports.CreateCanteenModel = function(itemlist, columndefinition, marketData) {
    let rows = 0;

    try {
        // Create the model from a template
        let template = fs.readFileSync('./models/canteen.model.json');
        let model = JSON.parse(template);

        if(itemlist) {
            if(Array.isArray(itemlist)) {
                if(!columndefinition) {
                    columndefinition = null;
                }

                itemlist.forEach(item => {
                    let newItem = prepareItem(item, columndefinition);
                    // console.log(newItem);
                    if(newItem) {
                        rows++;
                        model.Market.ProductCatalog.push(newItem);
                    }
                });
            } else {
                throw new Error("Error -- invalid list of records provided");
            }
        } else {
            // There were no items to put into the JSON list -- just return the JSON
        }
        console.log(`Processed ${rows} records`);

        // Add market data, if available
        if(marketData.MarketID) model.Market.MarketID = marketData.MarketID;
        if(marketData.AccountName) model.Market.AccountName = marketData.AccountName;
        if(marketData.LocationName) model.Market.LocationName = marketData.LocationName;
        if(marketData.MarketName) model.Market.MarketName = marketData.MarketName;
        if(marketData.Menu) model.Market.Menu = marketData.Menu;
        if(marketData.ConnectURL) model.Market.ConnectURL = marketData.ConnectURL;
        if(marketData.Kiosk) model.Market.Kiosks.push({ Kiosk : marketData.Kiosk });

        return model;
    } catch(e) {
        if(e instanceof SyntaxError) {
            console.log(`Error parsing model JSON : ${e.message}`);
        } else {
            console.log(e.message);
        }
    }
};

/**
 * Prepares a `ProductCatalog` -- structure below:
 * 
    {
        ProductPackageID : "",
        ProductName : "",
        ProductCategory : "",
        Price: 0,
        TaxRate : 0,
        FeeAmount : 0,
        SubMenu : null,
        HealthyIndicator : 0
    }
 *
 * @param {*} item
 * @param {*} columndefinition 
 * @returns {ProductCatalog} a ProductCatalog object
 */
var prepareItem = function(item, columndefinition) {
    try {
        // console.log('prepareItem', item);
        if(item) {
            let newItem = {
                ProductPackageID : "",
                ProductName : "",
                ProductCategory : "",
                Price: 0,
                TaxRate : 0,
                FeeAmount : 0,
                SubMenu : null,
                HealthyIndicator : 0,
                Barcodes : []
            }

            if(columndefinition) {
                let keys = Object.keys(item);
                keys.forEach(key => {
                    let target = resolveColumn(key, columndefinition);
                    // console.log(key, target, item[key]);
                    if(target) {
                        if(target == "Barcode") {
                            newItem.Barcodes.push({ BarCode : item[key] });
                        } else {
                            newItem[target] = item[key];
                        }
                    }
                })
            }

            // console.log(newItem);
            return newItem;
        } else {
            return null;
        }
    } catch(e) {
        console.log(e);
        return null;
    }
};

/**
 * 
 * @param {*} name 
 * @param {*} columndefinition 
 * @returns {string} name of the column it maps to; null if not found
 */
var resolveColumn = function(name, columndefinition) {
    try {
        if(Array.isArray(columndefinition)) {
            let rst = columndefinition.find(col => {
                if(col.source) {
                    return col.source == name;
                }
                return false;
            });

            if(rst) {
                return rst.target;
            }

            return null;
        } else {
            return null;
        }
    } catch(e) {

    }
}