const BaseWxWorkAPI = require('./base');

/**
 *  客户联系 https://developer.work.weixin.qq.com/document/path/92109
 */
class External extends BaseWxWorkAPI {
  constructor(...config) {
    super(...config);
  }

  // 获取外部用户信息
  async getUser(id) {
    const { data } = await this.client.get('/externalcontact/get', {
      params: {
        external_userid: id,
      },
    });
    // {
    //   errcode: 0,
    //   errmsg: 'ok',
    //   external_contact: {
    //     external_userid: 'wmJQNaDwf3MnrCzL0wLXg',
    //     name: 'A老师',
    //     type: 1,
    //     avatar: 'http://wx.qlogo.cn/mead/Q3auHgzCMAyFcrMR033QhZTxRDtsQ/0',
    //     gender: 0
    //   },
    //   follow_user: [
    //     {
    //       userid: 'ZhengLaoShi',
    //       remark: 'A老师',
    //       description: '',
    //       createtime: 1650451755,
    //       tags: [],
    //       remark_mobiles: [],
    //       add_way: 201,
    //       oper_userid: 'Cg'
    //     },
    //   ]
    // }
    return data;
  }
  // 获取外部群聊信息
  async getGroupChat(id) {
    const { data } = await this.client.post('/externalcontact/groupchat/get', {
      chat_id: id,
      need_name: 1, // 是否需要返回群成员的名字group_chat.member_list.name。0-不返回；1-返回。默认不返回
    });
    // {
    //   errcode: 0,
    //   errmsg: 'ok',
    //   group_chat: {
    //     chat_id: 'wrJQNaDwAAsblAqT2hwALN58L7g',
    //     name: '测试',
    //     owner: 'henigLing',
    //     create_time: 1650967290,
    //     member_list: [
    //       {
    //         userid: 'ChgLing',
    //         type: 1,
    //         join_time: 1650967290,
    //         join_scene: 1,
    //         invitor: [Object],
    //         group_nickname: '',
    //         name: '测试A'
    //       },
    //       {
    //         userid: 'ZnahgLaohi',
    //         type: 1,
    //         join_time: 1650967290,
    //         join_scene: 1,
    //         invitor: [Object],
    //         group_nickname: '',
    //         name: '测试B'
    //       },
    //       {
    //         userid: 'wmJQNaDwAAYn30T322nWy4GCXGw',
    //         type: 2,
    //         join_time: 1650967290,
    //         join_scene: 1,
    //         invitor: [Object],
    //         group_nickname: '',
    //         name: '测试C'
    //       }
    //     ],
    //     admin_list: []
    //   }
    // }
    return data;
  }
  // 获取配置了客户联系功能的成员id列表
  async getFollowUserIdList() {
    const { data } = await this.client.get(
      '/externalcontact/get_follow_user_list'
    );
    return data;
  }
  // 通过配置了客户联系功能的企业成员id的客户id列表
  async getUserIdList(id) {
    const { data } = await this.client.get('/externalcontact/list', {
      params: {
        userid: id,
      },
    });
    return data;
  }
  // 获取指定企业成员添加的客户信息列表。
  async getUserList(idList, cursor) {
    const postdata = {
      userid_list: idList,
    };
    if (cursor) {
      postdata.cursor = cursor; //	否	用于分页查询的游标，字符串类型，由上一次调用返回，首次调用可不填
    }
    const { data } = await this.client.post(
      '/externalcontact/batch/get_by_user',
      postdata
    );
    // {
    //   errcode: 0,
    //   errmsg: 'ok',
    //   external_contact_list: [
    //     {
    //       follow_info: {
    //         userid: 'heXingng',
    //         remark: '三无梦',
    //         description: '',
    //         createtime: 1650967243,
    //         tag_id: [],
    //         remark_mobiles: [],
    //         add_way: 202,
    //         oper_userid: 'ChnXngLag'
    //       },
    //       external_contact: {
    //         external_userid: 'wmJQNaDwAAyYn302nWy4GCXGw',
    //         name: '三无生',
    //         type: 1,
    //         avatar: 'http://wx.qlogo.cn/mead/Q3auHgzM7WNacfQGt900B1cmsSlfd3Ph5LqjYcOl6koLFibw/0',
    //         gender: 0
    //       }
    //     },
    //     {
    //       follow_info: {
    //         userid: 'hnXang',
    //         remark: '三梦',
    //         description: '',
    //         createtime: 1650967243,
    //         tag_id: [],
    //         remark_mobiles: [],
    //         add_way: 202,
    //         oper_userid: 'CnXigLag'
    //       },
    //       external_contact: {
    //         external_userid: 'wmJQNaDwAy6iY30T32nWy4GCXGw',
    //         name: '余生',
    //         type: 1,
    //         avatar: 'http://wx.qlogo.cn/mmhead/Q3auHgzNacfdjuQGt908ib0B1cmsSlfd3Ph5LqjYcOl6koLFibw/0',
    //         gender: 0
    //       }
    //     },
      
    //   ],
    //   next_cursor: ''
    // }
    
    return data;
  }
}

module.exports = External;
