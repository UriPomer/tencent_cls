const { AsyncClient, PutLogsRequest, LogGroup, LogItem, Content } = require("tencentcloud-cls-sdk-js");
const dotenv = require("dotenv");
dotenv.config();

const topicID = process.env.CLS_TOPIC_ID;

log = async (info, sourceIp, callback) => {
  const client = new AsyncClient({
    secretId: process.env.CLS_SECRET_ID,
    secretKey: process.env.CLS_SECRET_KEY,
    endpoint: "ap-guangzhou.cls.tencentcs.com",
    sourceIp: sourceIp,
    retry_times: 3,
    compress: true,
  });

  let logItem = new LogItem();
  logItem.pushBack(new Content("userNetworkLog", info));
  logItem.setTime(Math.floor(Date.now() / 1000));

  let logGroup = new LogGroup();
  logGroup.addLogs(logItem);

  const request = new PutLogsRequest(topicID, logGroup);
  await client
    .PutLogs(request)
    .then(() => {
      console.log("日志上传成功");
    })
    .catch((error) => {
      console.error("日志上传失败", error);
    });
  callback(null, true);
};

exports.main_handler = async (event, context) => {
  const response = {
    "api-auth": true, // 必须返回，表示认证结果
  };

  const userNetWorkLogInfo = {
    ip: event.requestContext.sourceIp,
    body: event.body,
    query: event.queryStringParameters ?? "no query",
    path: event.path,
  };

  const outputStr = JSON.stringify(userNetWorkLogInfo);
  await log(outputStr, userNetWorkLogInfo.ip, () => {});

  return response;
};
