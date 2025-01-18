export async function kimaiClient(method, config ) {
    var req = new XMLHttpRequest();

    return new Promise((resolve, reject) => {                
        req.open("GET", config.kimaiAPI + method, true);
        req.responseType = "json";
        
        if (config.loginToken !== true) {
            req.setRequestHeader('X-AUTH-USER', config.username);
            req.setRequestHeader('X-AUTH-TOKEN', config.password);
        } else {
            req.setRequestHeader('Authorization', 'Bearer ' + config.token);
        }
        req.setRequestHeader('Cache-Control', 'no-cache, no-store, max-age=0');

        req.onload = () => resolve(req.response);
        req.onerror = () => reject(req.statusText);

        req.send();
    });
};