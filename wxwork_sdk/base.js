const axios = require('axios');

const retry = (handler, times = 3) => {
  return new Promise((resolve, reject) => {
    handler()
      .then(resolve)
      .catch(e => {
        times > 0 ? retry(handler, --times) : reject(e);
      });
  });
};

class BaseWxWorkAPI {
  constructor(corpId, corpSecret, getToken) {
    this.config = {
      // 企业微信corpid
      corpId,
      // 企业微信应用corpsecret
      // 比如会话存档的 secret, 通讯率 的 secret, 学员的 secret, 这些应用的权限不同
      corpSecret,
    };
    this.client = axios.default.create({
      // 企业微信服务器地址
      baseURL: 'https://qyapi.weixin.qq.com/cgi-bin/',
    });
    this.token = null;
    // 拦截器添加access_token
    this.client.interceptors.request.use(async config => {
      if (config.url !== '/gettoken') {
        if (!this.token) {
          await this.getToken();
        }
        if (!config.params) {
          config.params = {};
        }
        config.params.access_token = this.token;
      }
      return config;
    }, Promise.reject);
    // 如果认证失败的话 尝试重新获取token然后重试
    this.client.interceptors.response.use(
      async response => {
        if (
          response.data.errcode === 40014 // 认证失败
        ) {
          this.token = null;
          // @ts-ignore
          throw new axios.Cancel('TOKENERROR');
        } else {
          return response;
        }
      },
      async error => {
        if (
          error.response &&
          // 认证失败
          error.response.status === 401
        ) {
          this.token = null;
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );

    this.createdAt = Number(new Date());

    this.getToken = getToken || this.getToken;
  }

  async getToken() {
    const lastDate = this.createdAt;
    this.createdAt = Number(new Date());
    // 检查 date 和 lastDate 是否间隔两小时
    if (this.createdAt - lastDate > 7000000) {
      if (!this.token) {
        const { data } = await this.client.get('/gettoken', {
          params: {
            ...this.config,
          },
        });
        this.token = data.access_token;
        console.log('过期请求了token');
      }
    } else {
      if (!this.token) {
        const { data } = await this.client.get('/gettoken', {
          params: {
            ...this.config,
          },
        });
        this.token = data.access_token;
        console.log('初次请求了token');
      }
    }
    return this.token;
  }
}

module.exports = BaseWxWorkAPI;
