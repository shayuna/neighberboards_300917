$(document).ready(function(){

    $("#bSearch").on("click",function(e){
        navigator.geolocation.getCurrentPosition(sendLocationDataForSearch);
    })
    $("#bAdd").on("click",function(e){
        navigator.geolocation.getCurrentPosition(sendLocationDataForAdd);
    })
})

function sendLocationDataForSearch(oPosition){
//    var oData={latitude:oPosition.coords.latitude,longitude:oPosition.coords.longitude};
    var sData="latitude="+oPosition.coords.latitude+"&longitude="+oPosition.coords.longitude;
    $.ajax({url:"../retrieveData",
          method:"get",
          data:sData,
           error:function(oErr,sErr){
              alert ("err in retrieve data.err = "+oErr.responseText)
           },
           success:function(sData){
               alert (sData);
           }
      })  
}
function sendLocationDataForAdd_test(oPosition){
    var sInfo=$("#eContent").val();
//    var oData={latitude:oPosition.coords.latitude,longitude:oPosition.coords.longitude,info:sInfo};
    $("#eLatitude").val(oPosition.coords.latitude);
    $("#eLongitude").val(oPosition.coords.longitude);
    $("#eForm").submit();
}
function sendLocationDataForAdd(oPosition){
    var sInfo=$("#eContent").val();
//    var oData={latitude:oPosition.coords.latitude,longitude:oPosition.coords.longitude,info:sInfo};
    var oData={latitude:oPosition.coords.latitude,longitude:oPosition.coords.longitude,info:sInfo};
    $.ajax({url:"../insertData",
          method:"post",
          data:oData,
           error:function(oErr,sErr){
              alert ("err in insert data.err = "+oErr.responseText)
           },
           success:function(sData){
               if ($("#eFile").val()){
                    $("#eForm").attr("action","./uploadImg?nm="+sData);
                    $("#eForm") .submit();
               }
           }
      })  
}
