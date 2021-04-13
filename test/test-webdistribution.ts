import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { WebDistributionStack } from '../lib/webdistribution';
import { ResourceName } from '../lib/resource_name';

test('Empty Stack', () => {
  const app = new cdk.App();
  const systemName = app.node.tryGetContext("system_name");
  const systemEnv = 'unittest';
  const resourceName = new ResourceName(systemName, systemEnv);

  // WHEN
  const stack = new WebDistributionStack(app, 'TestWebDistributionStack', {
    resourceName: resourceName,
  });
  
  // THEN
  expectCDK(stack).to(matchTemplate({
    "Resources": {}
  }, MatchStyle.EXACT))
});
