# Changes

## 1.0.21

- new configuration to adjust layout for sponsors (logoMenuSmall, logoMenuLarge, logoURL, colorHeader)
- provide additional configuration examples including all options (TimeKex_configOptions.js)
- update package to get rid of vulnerability in prod dependency

## 1.0.20

- support of login tokens instead of username / password
- new configuration "loginToken" : false - set it to true in case of using login tokens instead of username and password

## 1.0.19

- support for API changes on ApprovalBundle (Version 2.2 and up) for Kimai 2
- new configuration "bundleApiUpdates" : false - set it to true in case of using the ApprovalBundle 2.2 and up

## 1.0.18

- enhance documentation and test data

## 0.1.0 to 1.0.18

- many programming updates
- config update to activate additional functionality (see public\config.js)
  - approval - in case the ApprovalBundle is used, additional related functionality will be available
  - overtime - in case the ApprovalBundle is used and working with overtime, additional related functionality will be available
  - summary15mins - a new tab is visible which indicates time-frames which are no 15 minute blocks
  - breakChecks - an option to check for German Break Rules
- This version works with Kimai2 V1 and Kimai2 V1