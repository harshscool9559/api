const functions = require("firebase-functions");
const admin = require('firebase-admin');
const id_generate = require("./idgenerator");
const db = admin.firestore();
const https = require('https');
const PaytmChecksum = require('paytmchecksum');
const { firestore } = require("firebase-admin");
const intitate_transaction = require("./initiate_transaction");
const { PaytmConfig } = require("./paytm/paytm_config");

exports.plorder = functions.https.onRequest(
    async (request, response) => {
        const uid = "AGbhKkqPdbM1xQ266ZhSvgPtRch1";
        const cart = await db.collection('users').doc(uid).collection("privatedata").doc("cart").get();
        let trxammount = 0;
        let delivery = 0;
        let cartitem = cart.data()["cartitem"];
        let sellerid = cart.data()["sellerid"];
        let address_index = cart.data()["address_index"];
        let itemtotal_mrp = 0;
        let itemtotal_selling_price = 0;
        const order_detail = {

        };
        order_detail["cartitem"] = [];


        let errors = [];
        const cart_keys = Object.keys(cartitem);
        const cart_length = cart_keys.length;
        for (let i = 0; i < cart_length; i++) {
            const product_data_snapshot = await db.collection('products').doc(cart_keys[i]).get();
            let productdata = product_data_snapshot.data();

            if (productdata["stocks"] >= cartitem[cart_keys[i]] && productdata["isinstock"] == true && sellerid == productdata["sellerid"]) {
                let productdata_fu = productdata;
                delete productdata_fu["stocks"];
                delete productdata_fu["seller_search_id"];
                delete productdata_fu["isinstock"];
                delete productdata_fu["keywords"];
                productdata_fu["quantity"] = cartitem[cart_keys[i]];

                order_detail["cartitem"].push(productdata_fu);

                itemtotal_mrp = itemtotal_mrp +
                    productdata["mrp"] *
                    cartitem[cart_keys[i]];
                itemtotal_selling_price = itemtotal_selling_price +
                    productdata["discountedprice"] *
                    cartitem[cart_keys[i]];

                if (i == cart_length - 1) {
                    order_detail["totalprice"] = itemtotal_mrp;
                    order_detail["discounted_price"] = itemtotal_selling_price;
                    to_trxninit(order_detail);
                }

            }
            else {
                errors.push("Some product in your cart is out of stock.");
                response.send("error")

            }



        }





        async function to_trxninit(final_response) {
            order_id = id_generate(17) + Date.now();
            order_detail["order_id"] = order_id;
            order_detail["time"] = Date.now();
            const orderscollection = db.collection('orders').doc(order_id);
            await orderscollection.set({
                "order_id": order_id,
                "totalprice": order_detail["totalprice"],
                "discounted_price": order_detail["discounted_price"],
                "prepaid": true,
                "Customer_id":uid,
                "seller_id": sellerid,
                "timestamp":firestore.FieldValue.serverTimestamp(),
                "order_status": "pending",
                "payment_status": "pending"
            }).then( async function(value){
                await orderscollection.collection('details').doc('cartitem').set({
                    "cartitem": order_detail["cartitem"],
                })
            });

         
            send_response({ "trxn_detail": await intitate_transaction(final_response["discounted_price"], order_id, uid), "order_detail": order_detail })

            
        };


        function send_response(respo) {
            response.send({
                
                "mid": PaytmConfig.mid,
                "txnToken":respo["trxn_detail"]["body"]["txnToken"],
                "orderid":respo["order_detail"]["order_id"]
            });
            

        }



    }
);
