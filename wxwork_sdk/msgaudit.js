const BaseWxWorkAPI = require('./base');

/**
 *  会话存档 https://developer.work.weixin.qq.com/document/path/91614
 */
class Msgaudit extends BaseWxWorkAPI {
  constructor(...config) {
    super(...config);
  }

  // 获取内部群聊信息
  async getGroupChat(id) {
    const { data } = await this.client.post('/msgaudit/groupchat/get', {
      roomid: id,
    });
    // {
    //   roomname: '交流群',
    //   creator: 'yungz',
    //   room_create_time: 1650595704,
    //   notice: '',
    //   members: [
    //     { memberid: 'haoShi', jointime: 1650595699 },
    //     { memberid: 'heLuLaoShi', jointime: 1650595703 },
    //     { memberid: 'haoShi', jointime: 1650595704 },
    //     { memberid: 'heoLaoShi', jointime: 1650595705 },
    //   ],
    //   errcode: 0,
    //   errmsg: 'ok'
    // }
    return data;
  }

  // 获取机器人信息
  async getRobotInfo(id) {
    const { data } = await this.client.get('/msgaudit/get_robot_info', {
      params: {
        robot_id: id,
      },
    });
    // {
    //   errcode: 0,
    //   errmsg: 'ok',
    //   data: {
    //     robot_id: 'wbJQNaVpCWUGF5a5X2JhHkbkmA',
    //     name: '机器人',
    //     creator_userid: 'ynuz'
    //   }
    // }
    return data;
  }

}

module.exports = Msgaudit;
