import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as WhatToWatch from '../lib/what-to-watch-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new WhatToWatch.WhatToWatchStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
