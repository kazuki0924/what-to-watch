import * as appsync from "@aws-cdk/aws-appsync";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { Tracing } from "@aws-cdk/aws-lambda";
import * as lambda from "@aws-cdk/aws-lambda-nodejs";
import * as cdk from "@aws-cdk/core";

const APP_NAME = 'WhatToWatchApp';
const NODE_ENV = 'dev';
export const ENV_NAME = `${NODE_ENV}-${APP_NAME}`;

export class MainStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dynamoTable = new dynamodb.Table(this, `${ENV_NAME}-Table-Origin`, {
      tableName: `${ENV_NAME}-Origin`,
      partitionKey: {
        name: 'pk',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const setWatchingLambdaFn = new lambda.NodejsFunction(
      this,
      `setWatching-LambdaFn`,
      {
        entry: 'lambda/watchItem.ts',
        handler: `handler`,
        environment: { TABLE_NAME: dynamoTable.tableName },
        tracing: Tracing.ACTIVE,
      }
    );

    const listWatchingLambdaFn = new lambda.NodejsFunction(
      this,
      `listWatching-LambdaFn`,
      {
        entry: 'lambda/watchItem.ts',
        handler: `handler`,
        environment: { TABLE_NAME: dynamoTable.tableName },
        tracing: Tracing.ACTIVE,
      }
    );

    dynamoTable.grantReadWriteData(setWatchingLambdaFn);
    dynamoTable.grantReadWriteData(listWatchingLambdaFn);

    const appsyncAPI = new appsync.GraphqlApi(this, `${ENV_NAME}-GraphQL-API`, {
      name: `${ENV_NAME}-GraphQL-API`,
      schema: appsync.Schema.fromAsset('appsync/schema.graphql'),
      xrayEnabled: true,
    });

    const setWatchingFnDataSource = appsyncAPI.addLambdaDataSource(
      `setWatchingFnDataSource`,
      setWatchingLambdaFn
    );

    const listWatchingFnDataSource = appsyncAPI.addLambdaDataSource(
      `listWatchingFnDataSource`,
      listWatchingLambdaFn
    );

    setWatchingFnDataSource.createResolver({
      typeName: 'Mutation',
      fieldName: 'setWatching',
    });

    listWatchingFnDataSource.createResolver({
      typeName: 'Query',
      fieldName: 'listWatching',
    });
  }
}
