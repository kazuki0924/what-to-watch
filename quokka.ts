import * as AWS from "aws-sdk";
import dayjs from "dayjs";
import { customAlphabet } from "nanoid";

AWS.config.update({ region: 'us-east-1' });

const dbc = new AWS.DynamoDB.DocumentClient();

const nanoid10 = customAlphabet(
  '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  10
);

const TableName = process.env.TABLE_NAME || 'dev-WhatToWatchApp-Origin';
const __typename = 'WatchItem';

const setWatching = async (args: any): Promise<any> => {
  const id = nanoid10();
  const createdAt = dayjs().toISOString();
  const updatedAt = dayjs().toISOString();
  const { userGroupId, title, contentType } = args;
  const watchStatus = 'Watching';
  const Item = {
    pk: `#userGroupId#${userGroupId}#watchStatus#${watchStatus}`,
    sk: `#updatedAt#${updatedAt}#itemId#${id}`,
    id,
    userGroupId,
    title,
    __typename,
    watchStatus,
    createdAt,
    updatedAt,
    contentType,
  };
  await dbc.put({ TableName, Item }).promise();
  return Item;
};

const listWatching = async () => {
  const userGroupId = '0000000001';
  const params = {
    TableName,
    KeyConditionExpression: `pk = :pk`,
    ExpressionAttributeValues: {
      ':pk': `#userGroupId#${userGroupId}#watchStatus#Watching`,
    },
  };

  console.log(params);
  const res = await dbc.query(params).promise();
  console.log(res);
  return { items: res };
};

const watchingHandler = (event: any) => {
  console.log(event);
  const { fieldName } = event.info;

  try {
    if (fieldName === 'setWatching') {
      return setWatching(event.arguments.input);
    }

    if (fieldName === 'listWatching') {
      return listWatching();
    }

    throw new Error('fieldName does not exist.');
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export const handler = watchingHandler;

console.log(
  watchingHandler({
    arguments: { title: 'test', userGroupId: '01' },
    info: { fieldName: 'listWatching' },
  })
);
