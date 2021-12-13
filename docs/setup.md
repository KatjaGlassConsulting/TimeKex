# Setup

## Local Development and Compilation

TimeKex is a ReactJS Web Application. To run a local development version, you can use NPM to install all dependencies and start or build the app. 

1. Make sure to have [NPM installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
2. Download/clone this repository to a folder `<folder>`
3. Open the command line, go to that folder (cd `<folder>`)
4. Install packages using `npm install`
5. Start the development server with `npm start`
6. Build the app via `npm run build`

## Deployment

The TimeKex web application is a simple static HTML fileset which can run locally or on any Webserver. If you are not familar with NPM, you simply can copy the application from the GitHub branch `"gh-deploy"`. Copy all files from the "app" folder to any location (local PC or webserver) and start the app by open "index.html".

TODO: Image of folder structure and arrow to index.html

## Configuration

There are some configurations possible which are set through a `config.json` file in the root folder of the application. Possible settings are explained here.

TODO: clarify with Kimai to include exmaples from demo-stable

```json
var config = {
    "kimaiAPI" : "https://XXX/api/",
    "ignoreActivities" : ["Vacation","Public Holiday"],
    "adminUser" : ["anna_admin","susan_super"],    
    "username" : "john_user",
    "password" : "XXX"
}
```

Key | Required | Description
-- | -- | --
kimaiAPI | Yes | URL to the Kimai API - example above is from the demo instance from kimai.org
ignoreActivities | No | Activities which should be ignored (not copied to Kimai, not deleted when available) can be included as Array-List
adminUser | No | The `admin` tab of the app is only displayed when the logged in user is in this list. When this item is not available, the corresponding tab is visible for everyone.
username and password | No | When this is provided through the config, then there is no `Login` screen. This is only recommended for development purposes or when this application is run just locally by one person.

## Excel Structure

The Excel file is expected in a specific format. When the Excel file should contain a different structure, for example different column names, this can be changed by a source code updated and re-compiling the app. The file `src/features/excelImport/ExcelSchema` is responsible to read in and map the corresponding Excel file to the specific object required for the application. Feel free to update the column names from the Excel file.

The package [read-excel-file](https://gitlab.com/catamphetamine/read-excel-file) is used to read in the Excel file and use the corresponding schema for mapping. Please look into the package details to apply a different schema.