const axios = require('axios')  
const {
    sleep, 
} = require("./utils");


var hasYm=''
var hasTime=''


var  corpCode =  80;   // 80是科兴中维
var date = '2021-06-01'   // 时间  自己定义
var areaCode = '440309'  //区域  抓包获取最近区域
var reusId = ''   //最后提交用的，是个人的信息



var reservation_headers = {   
    'selfappid': '抓包',
    'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36 QBCore/4.0.1320.400 QQBrowser/9.0.2524.400 Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2875.116 Safari/537.36 NetType/WIFI MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x63010200)',
    'content-type': 'application/x-www-form-urlencoded',
    'accept': 'application/json, text/plain, */*',
    'appid': '抓包',
    'token': '抓包',
    'reservationtoken': '抓包',
    'referer': 'https://xgsz.szcdc.net/crmobile/?appId=抓包数据',
    'accept-encoding': 'gzip, deflate',
    'accept-language': 'zh-CN,zh;q=0.8,en-US;q=0.6,en;q=0.5;q=0.4'
    

}
 main()

async function  main() {
    await start()
    console.log('getDetail')
    if(hasYm.length) {
        await getDetail()
    }
    console.log(hasTime)
    if(hasTime.length) {
        await saveAppoint()
    }
}


async function  start() {
    hasYm = []
    var result = await axios.create({
        baseURL: 'https://xgsz.szcdc.net',
        headers: reservation_headers,
    }).post('/crmobile/outpatient/nearby','pageNum=1&numPerPage=10&areaCode='+areaCode+'&bactCode=5601&outpName=&outpMapLongitude=&outpMapLatitude=&corpCode='+corpCode).then
    (function (response) {
    //    console.log(response.data) 

        return response.data
    }).catch(function (error) { 
        console.log(error);
        return 1
    });

    // 处理数据
     hasYm=result.data.list.filter((i)=> {return i.status == 1&& i.nums > 0})
    console.log(hasYm)

    if(hasYm.length == 0) {
        await sleep(1000)
        console.log('1s后寻找厂家')
        main();
    }else {
        return hasYm
    }
}

 

async function  getDetail() {
    hasTime = [];
    var result = await axios.create({
        baseURL: 'https://xgsz.szcdc.net',
        headers: reservation_headers,
    }).get('/crmobile/reservationStock/timeNumber?depaId='+hasYm[0].depaId+'&date='+date+'&vaccCode=5601').then
    (function (response) {
      //  console.log(response.data) 
        //获取有苗的
        return response.data
    }).catch(function (error) { 
        console.log(error);
        return 1
    });

        hasTime=result.data.filter((i)=> {return i.restSurplus  > 0})
       

        if(hasTime.length == 0) {
            await sleep(1000)
            console.log('getDetail失败，1s后重新寻找')
            main(); 

        }else {
            return hasTime
        }
    


}

//提交订单
async function  saveAppoint() {
    var result = await axios.create({
        baseURL: 'https://xgsz.szcdc.net',
        headers: Object.assign(reservation_headers,{'content-type': 'application/json;charset=UTF-8'}),
    }).post('/crmobile/reservation/saveAppointment', {
        corpCode: corpCode,
        date: date,
        depaId: hasTime[0].depaId,
        ouatId: hasTime[0].ouatId,
        reusId: reusId,
        vaccCodes: "5601",
    }).then
    (function (response) {
        console.log(response.data) 
    
        return response.data
    }).catch(function (error) { 
        console.log(error);
        return 1
    });

    if(result.ecode != 1000 ) {   //1000是成功预约
        await sleep(1000)
        console.log('提交失败1s后重新寻找')
        main();
    } 
}