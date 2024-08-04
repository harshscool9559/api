const geolib = require('geolib');
const admin=require("firebase-admin");
const db=admin.firestore();
function getDistance(p1, p2) {
    return geolib.getDistance(p1, p2);
}

async function get_orders(newOrder) {
    try {
        const closestSlot = await findClosestSlot(newOrder);
        console.log(closestSlot);
        if (closestSlot) {
            await assignOrderToSlot(newOrder, closestSlot);
        } else {
            console.log("No available slot found.");
        }
        return closestSlot;
    } catch (error) {
        console.error("Error in main function:", error);
    }
}

async function findClosestSlot(newOrder) {
    try {
        const activeSlotsSnapshot = await db.collection('slots').where('active', '==', true).get();

        let closestSlot = null;
        let closestDistance = Infinity;
        let time = 60;
        
        activeSlotsSnapshot.forEach(slotDoc => {
            const slotData = slotDoc.data();
            let orders = slotData.orders || [];
            let cnt = orders.length;
            
            if (cnt > 0) {
                orders.forEach(order => {
                    const distance = getDistance(order.location, newOrder.location);
                    let time1 = (3 * distance / 1000) + (5 * cnt);
                    if (distance < closestDistance && time1 <= time) {
                        time = time1;
                        closestDistance = distance;
                        closestSlot = slotDoc.id;
                    }
                });
            } else {
                // If there are no orders in the slot, assign the new order directly
                closestSlot = slotDoc.id;
            }
        });

        console.log(`Closest Distance: ${closestDistance}`);
        return closestSlot;

    } catch (error) {
        console.error("Error in findClosestSlot function:", error);
    }
}

async function assignOrderToSlot(order, slot) {
    try {
        const slotRef = db.collection('slots').doc(slot);
        await slotRef.update({
            orders: admin.firestore.FieldValue.arrayUnion(order)
        });

        const orderRef = db.collection('orders').doc(order.product_id);
        await orderRef.set(order);

    } catch (error) {
        console.error("Error in assignOrderToSlot function:", error);
    }
}
module.exports=get_orders;