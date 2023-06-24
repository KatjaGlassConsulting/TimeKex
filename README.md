# TimeKex - TimeTracking, Kimai meets Excel

This WebApplication is designed to allow the tracking of working hours in Excel which can then be uploaded to the Kimai Timetracking application.

![Screenshot of login screen](./docs/img/timesheet_to_kimai_01.gif)

[Kimai](https://www.kimai.org/) is an open-source free time-tracking application which comes with a lot of functionality and capabilities. There might be situations where the times should be tracked in Excel and finally be uploaded to Kimai. TimeKex is designed to support this process.

The documentation of TimeKex as well as a running demonstration instance is accessible [here](https://katjaglassconsulting.github.io/TimeKex/).

## Status

TimeKex is available in the current version which does not contain tests. The source code is available under the MIT license which allows a flexible and generic usage and modifications without warrenty.

The demonstration is running on the stable Kimai demo instance. Be aware that this demo instances is regularily rebuild.

## Version 1.0.18

The current released version of TimeKex is 1.0.18 and is running under Kimai2 Version 1 and Version 2. TimeKex does contain many undocumented features which can be controlled via the config.js file. You could activate different features when you change from "false" to "true". The following options are available:

  - approval - in case the ApprovalBundle is used, additional related functionality will be available
  - overtime - in case the ApprovalBundle is used and working with overtime, additional related functionality will be available
  - summary15mins - a new tab is visible which indicates time-frames which are no 15 minute blocks
  - breakChecks - an option to check for German Break Rules

Remark: The Kimai ApprovalBundle Plugin is currenty (summer 2023) not supporting Kimai2 Version 2. An update is expected in Q3/Q4 2023.

### CORS

It is meant to run TimeKex on the same server as Kimai, then you will not have issues with CORS. You could for example put the build folder in a folder "timeKex" under your kimai public folder. If you run it on different servers, make sure to enable CORS from what ever URL you have.

## License

### Code & Scripts

This project is using the [MIT](http://www.opensource.org/licenses/MIT "The MIT License | Open Source Initiative") license (see [`LICENSE`](LICENSE)) for code and scripts.

### Content

The content files like documentation are released under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). This does not include trademark permissions.

## Contribution

Contributions are very welcome. Be aware that your contribution is under the above licenses. If you would like to contribute for tests, I would recommend Cypress which is my personal preference. 

## Re-use

When you re-use the source, keep or copy the license information also in the source code files. When you re-use the source in proprietary software or distribute binaries (derived or underived), copy additionally the license text to a third-party-licenses file or similar.

When you want to re-use and refer to the content, please do so like the following:

> Content based on [TimeKex Project (GitHub)](https://github.com/KatjaGlassConsulting/TimeKex) used under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) license.


