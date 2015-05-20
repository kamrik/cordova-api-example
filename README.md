# Cordova API Example
A sample app using [gulp](https://github.com/gulpjs/gulp) and the experimental Cordova API from [CordovaPlatformProject](https://github.com/kamrik/CordovaPlatformProject).

## Note! ##
 - CordovaPlatformProject is experimental and will change.
 - It does not yet expose full functionality of cordova.
 - Somewhat older [CordovaGulpTemplate](https://github.com/kamrik/CordovaGulpTemplate) is more stable.


## Usage ##

    git clone
    cd cordova-api-example
    npm install
    npm install gulp -g   # if you don't have it yet
    gulp create
    gulp build/run/emulate
    
 
 Basic iteration: change a file under `www`, run `gulp` - the default task will build and run the app.
 
 Adding or removing a plugin:
 
     gulp clean
     npm (un)install --save cordova-plugin-file
     gulp create
