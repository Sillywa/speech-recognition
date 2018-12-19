
var recorder;
var btn = document.getElementById('btn');
// 用于判断下一步是开始录音还是结束录音
var btn_flag = 0
var map = new AMap.Map('container', {
    resizeEnable: true, //是否监控地图容器尺寸变化
    zoom:5,//级别
    center: [116.4074, 39.9042],//中心点坐标
    viewMode:'3D'//使用3D视图
});
// 初始化点的数据
var soundData = initSoundData(geoCood)
console.log(soundData)
// 将点在地图上显示
map.add(initPoint(soundData));

function startRecording() {
    HZRecorder.get(function (rec) {
        recorder = rec;
        recorder.start();
        btn.setAttribute("value","结束录音")
        btn.style.background = "#ed4014"
        
        btn_flag = 1
    });
}
function stopRecording() {
    recorder.stop();
    btn.setAttribute("value","开始录音")
    btn.style.background = "#215798"
    
    btn_flag = 0
    uploadAudio();
}
function uploadAudio() {
    layer.open({
        type: 3
    })
    recorder.upload("http://localhost:8888", function (state, e) {
        switch (state) {
            case 'uploading':
                var percentComplete = Math.round(e.loaded * 100 / e.total) + '%';
                console.log(percentComplete)
                break;
            case 'ok':                    
                console.log(JSON.parse(e.target.responseText))
                layer.closeAll()
                if (e.target.status != 200) {
                    var result = JSON.parse(e.target.responseText).result
                    layer.msg(result)
                } else {
                    // 识别成功改变地图中心的坐标
                    var result = JSON.parse(e.target.responseText).result[0]
                    console.log("识别结果:"+result)
                    regSeachAndMoveTo(soundData,result)
                }                        
                break;
            case 'error':
                layer.msg("上传失败");
                break;
            case 'cancel':
                layer.msg("上传被取消");
                break;
        }
     });
}
// 添加点击事件
btn.onclick = function() {
    if(btn_flag == 1) {
        stopRecording()
    } else {
        startRecording()
    }
}
// 初始化可用点坐标
function initPoint(data) {
    var markers = []
    for(var i = 0;i<data.length;i++) {
        markers.push(new AMap.Marker({
            position: new AMap.LngLat(data[i].latitude, data[i].longitude),   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
            title: data[i].title             
        }))
    }
    return markers
}
// 初始化动作 “去”,和所有功能
function initSoundData(data) {
    var soundData = []
    for(var i = 0;i < data.length;i++) {
        soundData.push({
            message: '去' + data[i].name,
            latitude: data[i].geoCoord[0],
            longitude: data[i].geoCoord[1],
            title: data[i].name
        })
    }
    return soundData
}
// 移动地图中心位置
function moveCenter(latitude,longitude) {
    map.setCenter(new AMap.LngLat(latitude,longitude))
    map.setZoom(8)
    var currentCenter = map.getCenter(); 
    console.log(currentCenter)
}
// 正则匹配说话与功能 soundData
function regSeachAndMoveTo(soundData,result) {
    // result为识别结果
    var flag = 0
    for(var i = 0;i<soundData.length;i++){
        var reg = new RegExp(soundData[i].message)
        if(reg.test(result)) {
            flag = 1
            layer.msg("功能匹配成功：" + soundData[i].message,{icon: 1})
            moveCenter(soundData[i].latitude,soundData[i].longitude)
            break
        }
    }
    if(!flag) {
        layer.msg("未找到匹配功能："+result,{icon: 2})
    }
}
        