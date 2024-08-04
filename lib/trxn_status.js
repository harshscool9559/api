const functions = require("firebase-functions");
const https = require('https');
const { PaytmConfig } = require('./paytm/paytm_config');
const PaytmChecksum = require('paytmchecksum');





async function txnstatus(orderid) {
    let txnstatus = new Promise(function (resolve, reject) {
        var paytmParams = {};


        paytmParams.body = {

            "mid": PaytmConfig.mid,
            "orderId": orderid,
        };

        PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), PaytmConfig.testKey).then(function (checksum) {

            paytmParams.head = {
                "signature": checksum
            };
            var post_data = JSON.stringify(paytmParams);

            var options = {
                hostname: 'securegw-stage.paytm.in',
                port: 443,
                path: '/v3/order/status',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length
                }
            };

            var response = "";
            var post_req = https.request(options, function (post_res) {
                post_res.on('data', function (chunk) {
                    response += chunk;
                });

                post_res.on('end', function () {
                    console.log(response);
                    resolve(response);
                });
            });
            post_req.write(post_data);
            post_req.end();
        });

    });

    let txnstatus_result = await txnstatus;
    return txnstatus ;

}

module.exports = txnstatus ;