const geolib = require('geolib');

function area_code_search(point,list_of_polygon){
    let acode = null ;
    for (let i = 0; i < list_of_polygon.size; i++) {
        iswithinpolygon = geolib.isPointInPolygon(point,list_of_polygon.docs[i].data()["polygon"]);
        if (iswithinpolygon == true) {
            acode = list_of_polygon.docs[i].data()["areacode"] ;
            break;
        }
    };
    return  acode ;
}


module.exports = area_code_search;