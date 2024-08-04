const admin=require("firebase-admin");
const db=admin.firestore();

let ref=db.collection("promocodes");
async function validate_promocode(promocode, trxammount) {

    const promoDoc=await ref.doc(promocode).get();
    
    if(!promoDoc.exists){

        return { error: "Invalid Promocode" };

    } 

    let minimum_amount=parseInt(promoDoc.data().min_amount);
    
    let maximum_offer=promoDoc.data().max_off;

    let percentoffer=promoDoc.data().off_percent*trxammount/100;

    let discount=Math.min(percentoffer,maximum_offer);
   
    let discountedprice=trxammount-discount;
    if(minimum_amount>trxammount){

        return { error: "Cost of order is less than minimum amount to use promocode" };

     }

    let response = {

        discountedprice: discountedprice,

        discount: discount
    };

      
    return response;
}


module.exports=validate_promocode;