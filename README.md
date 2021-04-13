# S3 + CloudFront + WAF 

## Overview

## 01-waf stack

## 02-web-dist stack


## Reference

本スタック実装にあたり参考にさせていただいたサイトを，トピック別に掲載しました．
### WAFを使ったCloudFrontへのアクセス制限

- [CloudFront + S3 での IP アドレスベースのアクセス制限設定をする](https://ceblog.mediba.jp/post/156084994102/cloudfront-s3-%E3%81%A7%E3%81%AE-ip-%E3%82%A2%E3%83%89%E3%83%AC%E3%82%B9%E3%83%99%E3%83%BC%E3%82%B9%E3%81%AE%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E5%88%B6%E9%99%90%E8%A8%AD%E5%AE%9A%E3%82%92%E3%81%99%E3%82%8B)

### CDKを使ったWAFリソースのdeploy

- [AWS CDKでWAFv2を構築しIPアドレス制限を試してみた](https://dev.classmethod.jp/articles/aws-cdk-wafv2-block-ip-example/)

- [AWS WAFv2をCDKで構築してみた](https://dev.classmethod.jp/articles/aws-cdk-create-wafv2/)

### AWS WAFの解説

- [AWS WAFを完全に理解する - WAFの基礎からv2の変更点まで -](https://dev.classmethod.jp/articles/fully-understood-aws-waf-v2/)

### WAF WebACL for CloudFrontの作成リージョンに関する注意

- [【小ネタ】AWS WAF v2 の WebACL （CloudFront用）を東京リージョンから CloudFormation で作成しようとしたら怒られた](https://dev.classmethod.jp/articles/cloudformation-webacl-cloudfront-error/)

- [AWS WAF v1 と v2 それぞれで WebACL を CloudFormation で作成したときにハマった話](https://michimani.net/post/aws-create-web-acl-at-waf-v1-v2/)

- [TerraformでCloudFrontにACL(AWS WAF)を定義するときのエラー対処方法](https://qiita.com/yuu999/items/e5e233e02be0ed1d2365)

### AWS CDKで他のリージョンのssm parameter storeを参照する方法

- [CloudFormation Cross-Region Reference | stack overflow](https://stackoverflow.com/questions/59774627/cloudformation-cross-region-reference)
