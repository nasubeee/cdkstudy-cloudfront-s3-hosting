# S3 + CloudFront + WAFv2 をCDKで構築するサンプル

「CloudFront経由でS3にアクセスする + WAFv2でアクセス制限をかける」

リソース一式を構築するAWS CDKのサンプルです．

## Overview

### 01-waf stack

WAFv2 WebACLを管理するスタックです．

[CloudFormation - WAFv2 - Scope](https://docs.aws.amazon.com/ja_jp/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webacl.html#aws-resource-wafv2-webacl-properties)に書かれているように，WAFv2のACLをCloudFrontに関連付けたい場合，US East (N. Virginia) Region (us-east-1)へWAFv2リソースを作成する必要があります．
そこで，[app.ts](./bin/app.ts)で明示的にリージョンを指定しています．

```ts
const wafStack = new WafStack(app, '01-waf', {
  // (省略)
  env: {
    account: stackEnv.account,
    region: "us-east-1", // ここ
  },
  // (省略)
});
```

実装当初，この制限に気づかず，deployエラーでハマりました．(WAFv1の場合，リージョン制限は無いようです．)

後述のスタックで作成するCloudFrontとの関連付けには，作成したWebACLのARNが必要となります．

ここでは，SSM Parameter StoreにWebACL ARNを格納しました（これを参照する方法は後述）．


### 02-web-dist stack

- コンテンツを格納するS3バケット
- S3バケットを向き先としたCloudFront distribution

を管理するスタックです．今回はを東京リージョンに作成しました（技術検証のため，01-waf スタックと別リージョンにしています）．

S3バケット，CloudFront web distributionを定義し，先に作成したWAFv2 ACLと関連付けていくのですが，

ここで問題となるのは，US East (N. Virginia) RegionのParameter Storeに格納されているWebACL ARNを参照しなければならない点です．

cross-regionの参照は通常の方法では不可能なため，今回は，[こちら](https://stackoverflow.com/questions/59774627/cloudformation-cross-region-reference)を参考に，カスタムリソースを使った[参照クラス](./lib/ssm_parameter_reader.ts)を実装して解決しました．

## ハマったポイント

1. WAFv2 リソースのリージョン制限

   WAFv2のWebACLをCloudFrontに関連付ける場合，ACLをus-east-1に作成する必要がありました．

2. CDKで他リージョンのSSM Parameter Storeを参照する方法
  
  ```ts
  const param = ssm.StringParameter.valueForStringParameter(this, `param-name`);
  ```
  の方法で参照できるのは，そのスタックの同一リージョンのParameter Storeのみです．

  cross-region参照するため，カスタムリソースを使った方法の情報にたどり着くまで苦労しました...

3. CDKでCloudFrontへのWAF WebACLの関連付ける方法
   
   `@aws-cdl/aws-wafv2`モジュールに``という
## Reference

本スタック実装にあたり参考にさせていただいたサイトを，トピック別に掲載しました．
### WAFを使ったCloudFrontへのアクセス制限

- [CloudFront + S3 での IP アドレスベースのアクセス制限設定をする](https://ceblog.mediba.jp/post/156084994102/cloudfront-s3-%E3%81%A7%E3%81%AE-ip-%E3%82%A2%E3%83%89%E3%83%AC%E3%82%B9%E3%83%99%E3%83%BC%E3%82%B9%E3%81%AE%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E5%88%B6%E9%99%90%E8%A8%AD%E5%AE%9A%E3%82%92%E3%81%99%E3%82%8B)

### CDKを使ったWAFリソースのdeploy

- [AWS CDKでWAFv2を構築しIPアドレス制限を試してみた](https://dev.classmethod.jp/articles/aws-cdk-wafv2-block-ip-example/)

- [AWS WAFv2をCDKで構築してみた](https://dev.classmethod.jp/articles/aws-cdk-create-wafv2/)

- [TerraformでCloudFrontにACL(AWS WAF)を定義するときのエラー対処方法](https://qiita.com/yuu999/items/e5e233e02be0ed1d2365)

### AWS WAFの解説

- [AWS WAFを完全に理解する - WAFの基礎からv2の変更点まで -](https://dev.classmethod.jp/articles/fully-understood-aws-waf-v2/)

### WAF WebACL for CloudFrontの作成リージョンに関する注意

- [【小ネタ】AWS WAF v2 の WebACL （CloudFront用）を東京リージョンから CloudFormation で作成しようとしたら怒られた](https://dev.classmethod.jp/articles/cloudformation-webacl-cloudfront-error/)

- [AWS WAF v1 と v2 それぞれで WebACL を CloudFormation で作成したときにハマった話](https://michimani.net/post/aws-create-web-acl-at-waf-v1-v2/)

### AWS CDKで他のリージョンのssm parameter storeを参照する方法

- [CloudFormation Cross-Region Reference | stack overflow](https://stackoverflow.com/questions/59774627/cloudformation-cross-region-reference)
