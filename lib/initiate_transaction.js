const { fstat } = require('fs');
const https = require('https');
const PaytmChecksum = require('paytmchecksum');
const { PaytmConfig } = require('./paytm/paytm_config');

async function intitate_transaction(txnamount, order_id, customer_id) {

    let intipromise = new Promise(function (resolve, reject) {

        var paytmParams = {};
        paytmParams.body = {
            "requestType": "Payment",
            "mid": "OaKGkE51472182865159",
            "websiteName": "WEBSTAGING",
            "orderId": order_id,
            "callbackUrl": "https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=" + order_id,
            "txnAmount": {
                "value": txnamount,
                "currency": "INR",
            },
            "enablePaymentMode": [{ "mode": "UPI", "channels": ["UPIPUSH"] }],
            "userInfo": {
                "custId": customer_id,
            },
        };

        PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), "LnRM&t20aoC_Oauc").then(function (checksum) {

            paytmParams.head = {
                "signature": checksum
            };

            var post_data = JSON.stringify(paytmParams);

            var options = {
                /* for Staging */
                hostname: 'securegw-stage.paytm.in',
                /* for Production */
                // hostname: 'securegw.paytm.in',
                port: 443,
                path: '/theia/api/v1/initiateTransaction?mid=OaKGkE51472182865159' + '&orderId=' + order_id,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length
                }
            };
            var responsee = "";
            var post_req = https.request(options, function (post_res) {
                post_res.on('data', function (chunk) {
                    responsee += chunk;

                });
                post_res.on('end', function () {
                  
                    console.log(responsee);
                    resolve(responsee);

                });
            });
            post_req.write(post_data);
            post_req.end();
        });
    });

    let result = await intipromise ;
    const resultobj = JSON.parse(result);
    
    return resultobj ;
}


module.exports = intitate_transaction;