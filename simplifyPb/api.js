/* =============================================================================
#         Desc: 活动通用接口  
#       Format: api[方法名]，小驼峰
#      Version: 1.0.0
#   LastChange: 2019-07-17 14:58:17
============================================================================= */
import { REQUESTDOMAIN, KEY, getKey, isMock } from 'CONFIG/config';
import request, { setPBName } from 'UTILS/Axios.js';
import jsonName from '../pb/index.json'; // 目录下有对应的文档可查

let mockData = {};
// TODO 待处理mock路径
/* if(process.env.NODE_ENV !== 'production' && isMock){
  mockData = require('../mock'); 
}  */

// 传入数据启用模拟数据
setPBName(jsonName, { mockData });

// 服务名前缀
const prefixServer = 'mizos';

// 設置語言
let lang = 'zh-hant;q=0.9'; // 默認請求語言 繁體
let ua = navigator.userAgent.toLowerCase();
let isApp = /miya_app/i.test(ua);
if (isApp) {
  let reg = new RegExp('lang=([^;]*)(;|$)', 'i');
  let r = ua.match(reg);
  if (r != null && (r[1] === 'zh-hans' || r[1] === 'en')) { // 為簡體及英語時添加
    lang = r[1];
  }
}

const firstWordUpperCase = (string) => string[0].toUpperCase() + string.substring(1)
// 简化参数
const createApiOpt = (fileName, apiName, data = {}, opt = null) => {
  const params = {
    url: `${REQUESTDOMAIN}/proxymsg`,
    reqDesction: `${apiName}Req`,
    resDesction: `${apiName}Res`,
    funcName: `${apiName}`,
    token: KEY,
    serverName: `mizos.${fileName}.${firstWordUpperCase(fileName)}ExtObj`,
    data,
    lang
  }
  return opt !== null ? Object.assign(params, opt) : params
}

/**
 * 获取活动信息apiGetActivity
 * @param { Object } 
 */
export let apiGetActivity = async (data = {}, key) => {
    if (!KEY) {
        await getKey();
    };

    return request(createApiOpt('activity', 'GetActivity', data));

}

/**
 * 获取用户信息
 * @param { Object } { id: <用户id> }
 * @param { String } 会话标识
 */
export let apiGetPlayer = async(data = {}, key) => {
    if (!KEY) {
      await getKey();
    };
    return request(createApiOpt('user', 'GetPlayer', data, {
      reqDesction: 'PlayerReq',
      resDesction: 'PlayerRes',
    }));
}



/* ############# 合并的接口方法 ############# */

/**
 * 获取公用活动信息
 */
export let getCommonActivity = async() => {
    if (!KEY) {
        await getKey();
    }

    return Promise.all([apiGetPlayer(), apiGetActivity()]);
};

//获取个人资产(金币/钻石)
export function apiGetMoney(data) {
  return request(createApiOpt('assets', 'GetMoney', data, {
    reqDesction: 'AssetsMoneyReq',
    resDesction: 'AssetsMoneyRes',
  }));
};

// 开奖结果/开奖历史
export function apiNumLotteryResults(data = {}) {
  return request(createApiOpt('activity', 'NumLotteryResults', data));
}

//我已选择的注数
export function apiNumLotteryChosenNums(data = {}) {
  return request(createApiOpt('activity', 'NumLotteryChosenNums', data));
}

// 当前奖池状态
export function apiNumLotteryStatus(data = {}) {
  return request(createApiOpt('activity', 'NumLotteryStatus', data));
}

// 获取瓜分总额
export function apiPartitionTotal(data = {}) {
  return request(createApiOpt('activity', 'PartitionTotal', data));
}

// 下注
export function apiNumLotteryPlay(data = {}) {
  return request(createApiOpt('activity', 'NumLotteryPlay', data));
}

// 获取瓜分記錄----中奖榜单
export function apiPartitionRecords(data = {}) {
  return request(createApiOpt('activity', 'PartitionRecords', data));
}

// 呱呱乐奖池状态
export function apiScratchOffLotteryStatus(data = {}) {
  return request(createApiOpt('activity', 'ScratchOffLotteryStatus', data));
}

// 呱呱乐购买组数
export function apiBuyScratchOffLotteryTicks(data = {}) {
  return request(createApiOpt('activity', 'BuyScratchOffLotteryTicks', data));
}

// 呱呱乐开奖结果
export function apiScratchOffLotteryOpen(data = {}) {
  return request(createApiOpt('activity', 'ScratchOffLotteryOpen', data));
}

// 呱呱乐开奖结果
export function apiBuyAndOpenScrarchOffLotteryTicks(data = {}) {
  return request(createApiOpt('activity', 'BuyAndOpenScrarchOffLotteryTicks', data, {
    resDesction: 'ScratchOffLotteryOpenRes'
  }));
}







