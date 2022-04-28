const fs = require('fs');
const addon = require('wework-chat-node');
const path = require('path');
const os = require('os');
const L = require('lodash');
const NodeCache = require('node-cache');


const dayjs = require('dayjs');
const isLeapYear = require('dayjs/plugin/isLeapYear');
require('dayjs/locale/zh-cn');

dayjs.extend(isLeapYear);
dayjs.locale('zh-cn');


const { EnterpriseWxChatMessage, EnterpriseExternalWxUser, EnterpriseWxUser } = require('./entity/mysql');

const { Internal, External, MsgAudit } = require('./wxwork_sdk');

// 聊天文件存档
const chattextPath = path.join(__dirname, 'chat.txt');
// 私钥用来解密
const privateKey = fs.readFileSync('private.pem').toString();


const internal = new Internal(
  'test', // 改成企业id
  'secret1' // 改成通讯录 secret
);

const external = new External(
  'test', // 改成企业id
  'secret2' // 客户联系 ecret
);

const msgAudit = new MsgAudit(
  'test', // 改成企业id
  'secret3'// 会话存档 ecret
);

const wework = new addon.WeWorkChat({
  corpid: 'test', // 改成企业id
  secret: 'secret4',
  private_key: privateKey,
  seq: 520, // 数据拉取index,第一次从0开始
});

// 消息类型
const MSGTYPE = {
  text: 1, // 文本信息
  image: 2, // 图片信息
  revoke: 3, // 撤回消息
  agree: 4, // 同意
  disagree: 5, // 不同意
  voice: 6, // 语音
  card: 7, // 名片信息
  location: 8, // 位置消
  emotion: 9, // 表情信息
  file: 10, // 文件信息
  link: 11, // 链接信息
  weapp: 12, // 小程序
  chatrecord: 13, // 会话消息
  todo: 14, // 待办消息
  vote: 15, // 投票信息
  collect: 16, // 填表信息
  redpacket: 17, // 红包消息
  docmsg: 18, // 在线文档
  markdown: 19, // markdown
  news: 20, // 图文消息
  calendar: 21, // 日程消息
  mixed: 22, // 混合\消息
  meeting_voice_call: 23, // 音频存档消息类型
  voip_doc_share: 24, // 标识音频共享文档类型
  external_redpacket: 25, // 出现在本企业与外部企业群聊发送的红包、或者本企业与微信单聊、群聊发送的红包消息场景下。
  sphfeed: 26, // 标识视频号消息类型
};

// 消息动作
const ACTION = {
  send: 0, // 发送消息
  recall: 1, // 撤回消息
  switch: 2, // 切换企业日志
};


// 常用信息缓存, 成员信息, 用户信息, 群组信息
class MessageCache {

  constructor() {
    this.store = new NodeCache({
      stdTTL: 4 * 60 * 60, // 一个小时过期
      checkperiod: 100, //  每隔十秒检查是否过期
    });
  }


  async init() {
    const userList = await this.initUser();
    await this.initExternalUser(userList);
  }

  // 初始化内部成员
  async initUser() {

    let userlist = [];
    const userListObj = await EnterpriseWxUser.findAll({
      attributes: [ 'userid', 'name', 'avatar' ],
    });

    if (userListObj.length == 0) {
      const userListData = await internal.user.getList(1);
      userlist = userListData.userlist;
      await EnterpriseWxUser.bulkCreate(userlist);
    } else {
      userlist = userListObj.map(user => user.get({ plain: true })).map(({ userid, name, avatar }) => ({ userid, name, avatar }));
    }

    userlist.forEach(({ userid, name }) => this.store.set(userid, name));

    return userlist;
  }
  // 初始化外部成员
  async initExternalUser(userList) {

    let externalUserList;

    const userListObj = await EnterpriseExternalWxUser.findAll({
      attributes: [ 'userid', 'name', 'avatar' ],
    });

    if (userListObj.length == 0) {
      const externalUserListData = await external.getUserList(userList.map(user => user.userid));
      externalUserList = externalUserListData?.external_contact_list.map(user => user.external_contact).map(user => ({ ...user, userid: user.external_userid }));
      await EnterpriseExternalWxUser.bulkCreate(externalUserList);
    } else {
      externalUserList = userListObj.map(user => user.get({ plain: true })).map(({ userid, name, avatar }) => ({ userid, name, avatar }));
    }

    externalUserList.forEach(({ userid, name }) => this.store.set(userid, name));

  }

  get(key) {
    return this.store.get(key);
  }

  set(key, value) {
    this.store.set(key, value);
  }

}

const cache = new MessageCache();

async function callData(msg) {
  // 需要去重一下，后续再排查原因
  try {

    const data = JSON.parse(msg);

    const { msgid, from: fromId, tolist: tolistId, msgtype, roomid, action, msgtime } = data;

    const chattext = await fs.promises.readFile(chattextPath, 'utf8');

    if (chattext.includes(`"msgid":"${msgid}"`)) {
      console.log('重复了', msgid);
    }

    let roomname;
    let from;
    let tolist;
    // 接收方类型 0通讯录 1外部联系人 2群
    let tolistType = 0;

    // 如果群存在, 则查找群信息
    if (roomid) {
      // 内部联系群聊
      if (!msgid.includes('external')) {
        if (cache.get(roomid)) {
          roomname = cache.get(roomid);
        } else {
          const groupchat = await msgAudit.getGroupChat(roomid);
          roomname = groupchat.roomname + groupchat.creator;
        }
        if (cache.get(fromId)) {
          from = cache.get(fromId);
        } else {
          const user = await internal.user.get(fromId);
          await EnterpriseWxUser.create({
            ...user,
          });
          from = user.name;
        }
        tolistType = 2;
      // 外部群聊
      } else {
        if (cache.get(roomid)) {
          roomname = cache.get(roomid);
        } else {
          const { group_chat } = await external.getGroupChat(roomid);
          roomname = group_chat.name + group_chat.owner;
        }
        if (cache.get(fromId)) {
          from = cache.get(fromId);
        } else {
          const user = await external.getUser(fromId);
          await EnterpriseExternalWxUser.create({
            ...user?.external_contact,
          });
          from = user?.external_contact.name;
        }
        tolistType = 3;
      }


    // 私聊
    } else {
      // 内部私聊
      if (!msgid.includes('external')) {
        if (cache.get(tolistId[0])) {
          tolist = cache.get(tolistId[0]);
        } else {
          const groupchat = await msgAudit.getGroupChat(roomid);
          roomname = groupchat.roomname + groupchat.creator;
        }
        if (cache.get(fromId)) {
          from = cache.get(fromId);
        } else {
          const user = await internal.user.get(fromId);
          await EnterpriseWxUser.create({
            ...user,
          });
          from = user.name;
        }
        tolistType = 0;
      // 外部群聊
      } else {
        if (cache.get(tolistId[0])) {
          tolist = cache.get(tolistId[0]);
        } else {
          const user = await external.getUser(tolistId[0]);
          tolist = user?.external_contact.name;
          await EnterpriseExternalWxUser.create({
            ...user?.external_contact,
          });
        }
        if (cache.get(fromId)) {
          from = cache.get(fromId);
        } else {
          const user = await internal.user.get(fromId);
          from = user.name;
        }
        tolistType = 1;
      }
    }


    // EnterpriseWxChatMessage find by msgid if not exist then create
    const chatMessage = await EnterpriseWxChatMessage.count({
      where: {
        msgid,
      },
    });

    if (chatMessage == 0 && msgtype === 'text') {
      await EnterpriseWxChatMessage.create({
        msgid,
        action: ACTION[action],
        from,
        fromId,
        tolist,
        tolistId: tolistId.join(','),
        roomName: roomname,
        roomId: roomid,
        msgtype: MSGTYPE[msgtype],
        content: data.text.content,
        msgTime: msgtime,
      });
    }

    const s = `响应时间:${dayjs().format('YYYY-MM-DD HH:mm:ss')},消息:${JSON.stringify(data)}` + os.EOL;

    await fs.promises.appendFile(chattextPath, s);
  } catch (error) {
    console.log('parse data error:', error);
  }
}


async function init() {
  await cache.init();
  try {
    await wework.fetchData(callData);
  } catch (e) {
    console.log(e);
  }
}

init();
