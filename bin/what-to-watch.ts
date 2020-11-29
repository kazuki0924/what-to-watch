#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { WhatToWatchStack } from '../lib/what-to-watch-stack';

const app = new cdk.App();
new WhatToWatchStack(app, 'WhatToWatchStack');
