const BaseWxWorkAPI = require('./base');
/**
 * 通讯录管理
 */
class User {
  constructor(internal) {
    this.internal = internal;
    this.client = this.internal.client;
  }
  // 获取部门成员
  async getSimpleList(departmentId, fetchChild = 0) {
    const { data } = await this.client.get('/user/simplelist', {
      params: {
        department_id: departmentId,
        fetch_child: fetchChild,
      },
    });
    // {
    //   errcode: 0,
    //   errmsg: 'ok',
    //   userlist: [
    //     { userid: 'ZhLaoShi', name: 'B老师', department: [Array] },
    //     { userid: 'MeiaoShi', name: 'A老师', department: [Array] },
    //     {
    //       userid: 'enXaaTinaoShi',
    //       name: 'D老师',
    //       department: [Array]
    //     },
    //     {
    //       userid: 'hnXaoyLaoShi',
    //       name: 'C老师',
    //       department: [Array]
    //     },
    //     { userid: 'ChnXnLiang', name: 'D师', department: [Array] },
    //   ]
    // }
    return data;
  }
  // 获取部门成员详情
  async getList(departmentId, fetchChild = 0) {
    const { data } = await this.client.get('/user/list', {
      params: {
        department_id: departmentId,
        fetch_child: fetchChild,
      },
    });
    // {
    //   errcode: 0,
    //   errmsg: 'ok',
    //   userlist: [
    //     {
    //       userid: 'heinang', name: '夏-师', department: [Array], position: '', mobile: '135002134564', gender: '1', email: '',
    //       avatar: 'https://wework.qpic.cnwwpic/92527TQSv-RSeKV_2_1650771197/0',
    //       status: 1, enable: 1, isleader: 0, extattr: [Object], hide_mobile: 0, telephone: '', order: [Array], main_department: 1,
    //       qr_code: 'https://open.work.weixin.q.comwopenuserRoevode=vc26b7538e6413d775',
    //       alias: '陈小亮', is_leader_in_dept: [Array],
    //       thumb_avatar: 'https://wework.qpic.cn/wwpic/925052_7TQSvLSeKVu_2_1650771197/0',
    //       direct_leader: [], biz_mail: 'enxwecom.work'
    //     },
    //     {
    //       userid: 'Zhnisem-Gaohi', name: '夏EM师', department: [Array], position: '', mobile: '', gender: '1', email: '',
    //       avatar: 'https://wework.qpic.cn/wwpic/966169__DgJp_xR-jx_1650562891/0',
    //       status: 1, enable: 1, isleader: 0, extattr: [Object], hide_mobile: 0, telephone: '', order: [Array],
    //       main_department: 1, qr_code: 'https://open.worken/userQRCodec097e16ac7c33bbd3',
    //       alias: '', is_leader_in_dept: [Array], thumb_avatar: 'https://w_DgbJ_xRF-ujwx_1650562891/0',
    //       direct_leader: [], biz_mail: 'zhsxgs2.wecom.work'
    //     },
    //   ]
    // }
    return data;
  }
  // 获取成员详情
  async get(id) {
    const { data } = await this.client.get('/user/get', {
      params: {
        userid: id,
      },
    });
    // {
    //   errcode: 0,
    //   errmsg: 'ok',
    //   userid: 'heLiang',
    //   name: '师',
    //   department: [ 1 ],
    //   position: '',
    //   mobile: '1765424',
    //   gender: '1',
    //   email: '',
    //   avatar: 'https://wework.q_7TQSvL-RSeKVu_2_1650771197/0',
    //   status: 1,
    //   isleader: 0,
    //   extattr: { attrs: [] },
    //   telephone: '',
    //   enable: 1,
    //   hide_mobile: 0,
    //   order: [ 0 ],
    //   main_department: 1,
    //   qr_code: 'https://open.work.weixin.Code?vcode=vc26b7538e6413d775',
    //   alias: '陈小亮',
    //   is_leader_in_dept: [ 0 ],
    //   thumb_avatar: 'https://wework.qpic.cn/wwpiSvL-RSeKVu_2_1650771197/0',
    //   direct_leader: [],
    //   biz_mail: 'chework'
    // }
    return data;
  }
}

/**
 *  内部管理: 通讯, 客服, 推送等等
 */
class Internal extends BaseWxWorkAPI {
  constructor(...config) {
    super(...config);

    this.user = new User(this);
  }
}

module.exports = Internal;
