/**
 * @type { import('@/index').Config }
 **/
// @ts-ignore
const config = require('config');
const { Sequelize, Model, DataTypes } = require('sequelize');
const L = require('lodash');

const mysqlConfig = config.mysql;

const sequelize = new Sequelize(
  mysqlConfig.database,
  mysqlConfig.user,
  mysqlConfig.password,
  {
    host: mysqlConfig.host,
    port: 3306,
    dialect: 'mysql',
    pool: {
      // 连接池设置
      max: 5, // 最大连接数
      min: 0, // 最小连接数
      idle: 10000,
    },
    timezone: '+08:00',
    define: {
      // `timestamps` 字段指定是否将创建 `createdAt` 和 `updatedAt` 字段.
      // 该值默认为 true, 但是当前设定为 false
      timestamps: true,
      // 字段以下划线（_）来分割（默认是驼峰命名风格）
      underscored: false,
      // 取消复数命名
      freezeTableName: true,
      // 软删除
      paranoid: true,
    },
    // logging: false, // 禁用日志
    logging: msg => console.info(msg), // 开发环境使用
    // logging: msg => sqlLogger.info(msg), // 生产环境使用
  }
);

// sequelize.options.logging = msg => consola.info(msg);

/**
 * @typeparam {T} the type parameter
 * @function Object() { [native code] } {BaseModel.<T>}
 */
class BaseModel extends Model {

  // hook init 方法, 添加一个 __inner_db__ 属性
  static init(attributes, options) {
    Model.init.call(this, attributes, options);

    if (!this.__inner_db__[this.name]) {
      this.__inner_db__[this.name] = this;
    }
  }

  //  通过上面的  init 方法, 添加所有模型关系
  static associateAll() {
    const db = this.__inner_db__;
    Object.keys(db).forEach(modelName => {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    });
  }


  // 分页处理
  static paginate(query = {}) {
    let {
      limit = 10,
      page = 1,
      sort = 'id',
      order = 'desc',
      where,
      include,
      ...args
    } = query;

    // include 不能是空对象, 所以要判断一下

    if (L.isObject(include) && L.keys(include).length > 0) {
      // @ts-ignore
      args.include = include;
    }

    limit = L.parseInt(limit, 10);
    page = L.parseInt(page, 10);

    return this.findAndCountAll({
      where,
      offset: (page - 1) * limit,
      limit,
      order: [[ sort, order ]],
      ...args,
    });
  }

  // 更新或者新增
  static updateOrCreate(values, condition) {
    return this.findOne({ where: condition }).then(obj =>
      (obj ? obj.update(values) : this.create(values))
    );
  }
}


BaseModel.__inner_db__ = {};

//  企业微信内部成员用户表
class EnterpriseWxUser extends BaseModel {}
//  企业微信成员用户表
class EnterpriseExternalWxUser extends BaseModel {}
//  企业微信聊天存档表
class EnterpriseWxChatMessage extends BaseModel {}

//  企业微信成员用户表
EnterpriseWxUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userid: { type: DataTypes.STRING, comment: '用户id' },
    name: { type: DataTypes.STRING, comment: '名称' },
    alias: { type: DataTypes.STRING, comment: '别名' },
    mobile: { type: DataTypes.STRING, comment: '电话' },
    avatar: { type: DataTypes.STRING, comment: '头像url' },
  },
  {
    hooks: {},
    sequelize,
    tableName: 'enterprise_wx_user',
    comment: '企业微信内部用户表',
  }
);
//  企业微信成员用户表
EnterpriseExternalWxUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userid: { type: DataTypes.STRING, comment: '用户id' },
    name: { type: DataTypes.STRING, comment: '名称' },
    alias: { type: DataTypes.STRING, comment: '别名' },
    avatar: { type: DataTypes.STRING, comment: '头像url' },
  },
  {
    hooks: {},
    sequelize,
    tableName: 'enterprise_wx_external_user',
    comment: '企业微信外部用户表',
  }
);
//  企业微信聊天存档表
EnterpriseWxChatMessage.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  seq: {
    type: DataTypes.INTEGER,
    comment: '消息的seq值，标识消息的序号',
  },
  msgid: {
    type: DataTypes.STRING,
    comment: '消息唯一标识 外部群聊会包括external',
  },
  action: {
    type: DataTypes.TINYINT,
    comment: '消息动作，0.send(发送消息) 1.recall(撤回消息) 2.switch(切换企业日志)',
  },
  from: {
    type: DataTypes.STRING,
    comment: '发送方',
  },
  fromId: {
    type: DataTypes.STRING,
    field: 'from_id',
    comment: '发送方userid',
  },
  tolist: {
    type: DataTypes.STRING,
    comment: '消息接收方列表',
  },
  tolistId: {
    type: DataTypes.STRING,
    field: 'tolist_id',
    comment: '消息接收方列表id',
  },
  tolistType: {
    type: DataTypes.TINYINT,
    field: 'tolist_type',
    comment: '接收方类型 0通讯录 1外部联系人 2群',
  },
  msgType: {
    type: DataTypes.TINYINT,
    field: 'msg_type',
    comment: '文本消息类型，包括text、image、...',
  },
  content: {
    type: DataTypes.STRING,
    comment: '附加说明',
  },
  msgTime: {
    type: DataTypes.INTEGER,
    field: 'msg_time',
    comment: '消息发送时间戳，utc时间，ms单位',
  },
  roomId: {
    type: DataTypes.STRING,
    field: 'room_Id',
    comment: '微信群id。如果是单聊则为空',
  },
  roomName: {
    type: DataTypes.STRING,
    field: 'room_name',
    comment: '微信群名',
  },
},
{
  hooks: {},
  sequelize,
  tableName: 'enterprise_wx_chatmessage',
  comment: '会话内容存档表',
});


BaseModel.associateAll();


module.exports = {
  EnterpriseWxChatMessage,
  EnterpriseWxUser,
  EnterpriseExternalWxUser,
};
