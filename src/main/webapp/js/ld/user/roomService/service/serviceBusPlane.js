(function(){
	$("#serviceRoomNumber").focus(function(){
		$(this).removeClass("border-red");
		$("#roomIdWarning").css("display","none");
	});
})();

// 按房间号和日期查询接送机信息
var searchBusPlane = function(pageNum){
	var roomNum = $("#searchRoomNum").val();
	var date = formatDateForm(new Date($(".pack_maintain").val()));

	console.log("查询房间号：" + roomNum + " 日期：" + date + "的车费信息");

	$.ajax({
		url:'/LD/userRoom/searchFlightPickingByRoomNumber_Time.action',
		type:'post',
		dataType:'json',
		contentType:'application/json',
		data:'{"roomNum":"'+ roomNum +'","time":"'+ date +'","pageNum":'+ pageNum +'}',
		success:function(data){
			console.log(data);
			
			// 清空表格
			$("#busPlaneTbody").html("");
			$("#busPlaneBottom").html("");

			if (data.recordTotal == 0) {
				$("#busPlaneTbody").append("<tr><td colspan='11' style='color: #ff4d4d;'>没有相关信息！</td></tr>");
				return;
			} else {
				for (var i = 0; i < data.pageList.length; i++) {
					var perRecord = data.pageList[i];
					var eventType = perRecord.type == "welcome" ? "接机" : "送机";
					$("#busPlaneTbody").append("<tr>"
						+"<td>"+ perRecord.room_NUMBER +"</td><td>"+ perRecord.guest_NAME +"</td>"
						+"<td>"+ eventType +"</td><td>"+ perRecord.flight_NUMBER +"</td>"
						+"<td>"+ perRecord.plate_NUMBER +"</td><td>"+ perRecord.picker_NAME + "（"+ perRecord.picker_TELE +"）</td>"
						+"<td>"+ perRecord.contact_NAME + "（"+ perRecord.contact_TELE +"）</td>"
						+"<td>"+ formatDateForm(new Date(perRecord.time)) +"</td>"
						+"<td>"+ formatDate(new Date(perRecord.import_TIME)) +"</td>"
						+"<td>"+ formatDate(new Date(perRecord.edit_TIME)) +"</td>"
						+"<td><a id='editLink' href='serviceBusPlaneEdit.jsp?id="+ perRecord.id +"'>编辑</a><a id='deleteLink' onclick='serviceBusPlaneDelete("+ perRecord.id +")'>删除</a></td></tr>");
				}
				// 添加车费 底部页码
				$("#busPlaneBottom").append("<div class='bottom-page'>"+
		        	"<span class='page-before' onclick='requestBeforeBusPlane();'>上一页&nbsp;&nbsp;</span>"+
		        	"<span><input id='fare_nowpage' value='"+ data.pageNow +"' type='text' class='input_num'></span>"+
		        	"<span>&nbsp;/&nbsp;</span>"+
		        	"<span id='fare_totalpage'>"+ data.pageTotal +"</span>"+
		            "<span class='page-next' onclick='requestNextBusPlane();'>&nbsp;&nbsp;下一页</span>" +
		            "&nbsp;&nbsp;&nbsp;&nbsp;共<span class='recordTotal'>&nbsp;"+ data.recordTotal +"&nbsp;</span>条记录</div>");
			}
		}
	});
};
//拉取上一页 车费信息
var requestBeforeBusPlane = function(){
	var nowpage = parseInt($("#fare_nowpage").val());
	if(nowpage == 1) return;
	searchBusPlane(nowpage - 1);
};

// 拉取下一页 车费信息
var requestNextBusPlane = function(){
	var nowpage = parseInt($("#fare_nowpage").val());
	var totalpage = parseInt($("#fare_totalpage").text());
	if(nowpage == totalpage) return;
	searchBusPlane(nowpage + 1);
};

/////////////////////////////////////////////////////// 添加接送机车费记录
var addBusPlane = function(){
	// 判断房间号是否为空
	if($("#serviceRoomNumber").val() == ""){
		$("#roomIdWarning").css("display","block");
		$("#serviceRoomNumber").addClass("border-red");
		console.log("房间号为空！");
		return;
	}
	requestAddBusPlane();
};
// 请求添加接送机记录
var requestAddBusPlane = function(){
	console.log("添加接送机车费记录");
	
	// 接送机输入结果（接机为 welcome，送机为 farewell）
	var type = $("#eventType").attr("checked") ? "welcome" : "farewell";
	console.log(type);

	// 其他字段输入结果
	var roomNum = $(".body-content input").eq(2).val();
	var guestName = $(".body-content input").eq(3).val();
	var time = formatDateForm(new Date($(".body-content input").eq(4).val()));
	var flight = $(".body-content input").eq(5).val();
	var platNum = $(".body-content input").eq(6).val();
	var pick = $(".body-content input").eq(7).val();
	var pickTele = $(".body-content input").eq(8).val();
	var contact = $(".body-content input").eq(9).val();
	var contactNum = $(".body-content input").eq(10).val();

	console.log(roomNum);

	$.ajax({
		url:'/LD/userRoom/addFlightPicking.action',
		type:'post',
		contentType:'application/json',
		dataType:'json',
		data:'{"time":"'+ time +'","roomNum":"'+ roomNum +'","guestName":"'+ guestName +'","type":"'+ type +'",'
			+'"flight":"' + flight +'","platNum":"'+ platNum +'","pick":"'+ pick +'","pickTele":"'+ pickTele +'",'
			+'"contact":"'+ contact +'","contactNum":"'+ contactNum +'"}',
		success:function(data){
			console.log(data);
			if(data == 1){
				showModalBox("success","添加成功！");
			}else if(data == 0){
				showModalBox("error","添加失败！");
			}
		}
	});
};

//根据id号查询接送机记录
var searchBusPlaneEdit = function(id){
	console.log("查询"+ id +"号接送机记录");
	$.ajax({
		url:'/LD/userRoom/searchFlightPickingById.action',
		type:'post',
		contentType:'application/json',
		dataType:'json',
		data:JSON.stringify({"id":id}),
		success:function(data){
			console.log(data);
			if(data.record != null){
				
				//界面显示
				if(data.record.type == "welcome") $("#eventType").prop("checked",true);
				else $("#eventType2").prop("checked",true);
				
				$(".body-content input").eq(2).val(data.record.room_NUMBER);
				$(".body-content input").eq(3).val(data.record.guest_NAME);
				$(".body-content input").eq(4).val(formatDateForm(new Date(data.record.time)));
				$(".body-content input").eq(5).val(data.record.flight_NUMBER);
				$(".body-content input").eq(6).val(data.record.plate_NUMBER);
				$(".body-content input").eq(7).val(data.record.picker_NAME);
				$(".body-content input").eq(8).val(data.record.picker_TELE);
				$(".body-content input").eq(9).val(data.record.contact_NAME);
				$(".body-content input").eq(10).val(data.record.contact_TELE);
				
			}
		}
	});
}

//根据id删除通勤车记录
var serviceBusPlaneDelete = function(id){
	console.log("删除"+ id +"号接送机记录");
	$.ajax({
		url:'/LD/userRoom/deleteFlightPickingById.action',
		type:'post',
		contentType:'application/json',
		dataType:'json',
		data:JSON.stringify({"id":id}),
		success:function(data){
			console.log(data);
			if(data == 1){
				showModalBox("success","删除成功");
				searchBusPlane(1); //重新查一遍
			}else if(data == 0){
				showModalBox("error","删除失败");
			}
		}
	});
};

var updateBusPlane = function(id){
	
	console.log("请求更新"+id+"号接送机记录");
	
	// 接送机输入结果（接机为 welcome，送机为 farewell）
	var type = $("#eventType").attr("checked") ? "welcome" : "farewell";

	// 其他字段输入结果
	var roomNum = $(".body-content input").eq(2).val();
	var guestName = $(".body-content input").eq(3).val();
	var time = formatDateForm(new Date($(".body-content input").eq(4).val()));
	var flight = $(".body-content input").eq(5).val();
	var platNum = $(".body-content input").eq(6).val();
	var pick = $(".body-content input").eq(7).val();
	var pickTele = $(".body-content input").eq(8).val();
	var contact = $(".body-content input").eq(9).val();
	var contactNum = $(".body-content input").eq(10).val();

	console.log(roomNum);

	$.ajax({
		url:'/LD/userRoom/updateFlightPickingById.action',
		type:'post',
		contentType:'application/json',
		dataType:'json',
		data:'{"time":"'+ time +'","roomNum":"'+ roomNum +'","guestName":"'+ guestName +'","type":"'+ type +'",'
			+'"flight":"' + flight +'","platNum":"'+ platNum +'","pick":"'+ pick +'","pickTele":"'+ pickTele +'",'
			+'"contact":"'+ contact +'","contactNum":"'+ contactNum +'", "id":'+ id +'}',
		success:function(data){
			console.log(data);
			if(data == 1){
				showModalBox("success","更新成功！");
			}else if(data == 0){
				showModalBox("error","更新失败！");
			}
		}
	});
};