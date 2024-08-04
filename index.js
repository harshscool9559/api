const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const fetch_areacode = require("./lib/fetch_areacode");
const plorder = require("./lib/create_order");
const txnstatus = require("./lib/trxn_status");
const intitate_transaction = require('./lib/initiate_transaction');
const https = require('https');
const PaytmChecksum = require('paytmchecksum');
const { response, request } = require("express");
const { send } = require("process");
const geolib = require('geolib');
const validate_promocode = require('./lib/promocode_validate'); // Assuming validate_promocode.js is in the same directory
const get_orders = require("./lib/get_orders");






  

exports.orderdelivery=functions.https.onRequest(async(req,res)=>{
    // const neworder=req.query.order;
    try{
    const latitude=parseFloat(req.query.latitude);
    const longitude=parseFloat(req.query.longitude);
    const product_id=req.query.product_id;
    const neworder={
      location: {
          latitude: latitude,
          longitude: longitude
      },
      product_id: product_id
  };
     const result=await get_orders(neworder);
     res.status(200).send(result);
  }catch (error) {
      console.error('Error processing order:', error);
      res.status(500).send('Internal Server Error');
    }
  })
  exports.promocodevalidate = functions.https.onRequest(async (request, response) => {
        const promocode=request.query.promocode;
        const trxammount=request.query.trxammount;
        const respo= await validate_promocode(promocode,trxammount);
        response.status(200).json(respo);
  });
  
  exports.areacode = functions.https.onRequest(async (request, response) => {
      const areacode_info = await fetch_areacode(request.body.latlng);
      response.send(areacode_info);
  });
  exports.listFruit = functions.https.onCall((data, context) => {
      return ["Apple", "Banana", "Cherry", "Date", "Fig", "Grapes"]
  });
  
  exports.placeorder = plorder.plorder;
  
  exports.txnstatus = functions.https.onRequest(
      async (request, response) => {
          response.send(await txnstatus(request.body.orderid));
      }
  );
  
  exports.init_trx = functions.https.onRequest(
      async (request, response) => {
          const txnamount = request.body.txnamount;
          const customer_id = request.body.customer_id;
          const order_id = request.body.order_id;
          const respo = await intitate_transaction(txnamount, order_id, customer_id);
          response.send(respo);
      }
  );
  
  
  
  
  exports.approve_application = functions.https.onCall((data, context) => {
      const request_uid = context.auth.uid;    
      const uid = data.uid;
      const status = data.status;
      const db = admin.firestore();
      return db.collection('users').doc(uid).update({status: status});
    });
  
    exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
      const email = user.email; // The email of the user.
      const displayName = user.displayName; // The display name of the user.
  
    });
  
    