export async function kimaiClient(method, config ) {
    var req = new XMLHttpRequest();

    return new Promise((resolve, reject) => {        
        req.open("GET", config.kimaiAPI + method, true);
        req.responseType = "json";
        
        req.setRequestHeader('X-AUTH-USER', config.username);
        req.setRequestHeader('X-AUTH-TOKEN', config.password);

        req.onload = () => resolve(req.response);
        req.onerror = () => reject(req.statusText);

        req.send();
    });
};