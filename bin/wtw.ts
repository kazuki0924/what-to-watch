#!/usr/bin/env node
import "source-map-support/register";

import * as cdk from "@aws-cdk/core";

import { ENV_NAME, MainStack } from "../lib/main-stack";

const app = new cdk.App();
new MainStack(app, `${ENV_NAME}`);
