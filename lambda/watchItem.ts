import * as AWS from "aws-sdk";
import dayjs from "dayjs";
import { customAlphabet } from "nanoid";

const dbc = new AWS.DynamoDB.DocumentClient();
const nanoid10 = customAlphabet('1234567890', 10);

AWS.config.update({ region: 'us-east-1' });

const TableName = process.env.TABLE_NAME || '';

const setWatching = async (event: any = {}): Promise<any> => {
  const { title, contentType, userGroupId } = event.arguments;
  const __typename = 'WatchItem';
  const watchStatus = 'Watching';
  const createdAt = dayjs().toISOString();
  const updatedAt = dayjs().toISOString();
  const id = nanoid10();
  const pk = `#userGroupId#${userGroupId}#itemId#${id}`;
  const sk = `#watchStatus#${watchStatus}#updatedAt#${updatedAt}`;

  const Item = {
    pk,
    sk,
    id,
    userGroupId,
    title,
    __typename,
    status: watchStatus,
    createdAt,
    updatedAt,
    contentType,
  };

  try {
    await dbc.put({ TableName, Item }).promise();
    console.log('Completed.');
    return Item;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export const handler = setWatching;
