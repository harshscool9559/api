const admin = require('firebase-admin');
const area_code_search = require('./area_code_search');
const db = admin.firestore();
async function fetch_areacode(point) {
    const areasnapshot = await db.collection('servicearea').get();
    serivcearea = area_code_search(point, areasnapshot);
    if (serivcearea != null) {
        const sub_division_snapshot = await db.collection('servicearea').doc(serivcearea).collection("sub_division").get();
        sub_division = await area_code_search(point, sub_division_snapshot);
        return { "sevicearea": serivcearea, "sub_division": sub_division ,"latlng":point};
    } else {
        return null ;
    }
}
module.exports = fetch_areacode;