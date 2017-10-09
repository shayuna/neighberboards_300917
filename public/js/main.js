$(document).ready(function(){

    $("#bSearch").on("click",function(e){
        navigator.geolocation.getCurrentPosition(sendLocationDataForSearch);
    })
    $("#bAdd").on("click",function(e){
        navigator.geolocation.getCurrentPosition(sendLocationDataForAdd);
    })
})

function sendLocationDataForSearch(oPosition){
    var oData={latitude:oPosition.coords.latitude,longitude:oPosition.coords.longitude};
    $.ajax({url:"../retrieveData",
          method:"post",
          data:oData,
           error:function(oErr,sErr){
              alert ("err in retrieve data.err = "+oErr.responseText)
           },
           success:function(sData){
               alert (sData);
           }
      })  
}
function sendLocationDataForAdd(oPosition){
    var sInfo=$("#eContent").val();
    var oData={latitude:oPosition.coords.latitude,longitude:oPosition.coords.longitude,info:sInfo};
    $.ajax({url:"../insertData",
          method:"post",
          data:oData,
           error:function(oErr,sErr){
              alert ("err in insert data.err = "+oErr.responseText)
           },
           success:function(sData){
               alert (sData);
           }
      })  
}
