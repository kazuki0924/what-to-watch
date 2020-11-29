import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { Tracing } from "@aws-cdk/aws-lambda";
import * as lambda from "@aws-cdk/aws-lambda-nodejs";
import * as cdk from "@aws-cdk/core";

export class WhatToWatchStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dynamoTable = new dynamodb.Table(
      this,
      'WhatToWatchApp-Table-Origin',
      {
        tableName: 'WhatToWatchApp-Origin',
        partitionKey: {
          name: 'pk',
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: {
          name: 'sk',
          type: dynamodb.AttributeType.STRING,
        },
        removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
      }
    );

    const watchingFn = new lambda.NodejsFunction(this, 'watchingFn', {
      entry: 'lambda/watchItem.ts',
      handler: 'handler',
      environment: { TABLE_NAME: dynamoTable.tableName },
      tracing: Tracing.ACTIVE,
    });

    dynamoTable.grantReadWriteData(watchingFn);
  }
}
