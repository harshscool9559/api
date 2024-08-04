const admin = require('firebase-admin');
const db = admin.firestore();
const fetch_areacode = require("./fetch_areacode");


function verify_address( address , sellerid ){
    const point_detail = fetch_areacode(address.point);
    db
    
}