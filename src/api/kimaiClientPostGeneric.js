export async function kimaiClientPostGeneric(method, config, data, type = "POST") {
    var req = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
        req.open(type, config.kimaiAPI + method, true);
        req.responseType = "json";
        req.setRequestHeader('Content-Type', 'application/json');
        req.setRequestHeader('X-AUTH-USER', config.username);
        req.setRequestHeader('X-AUTH-TOKEN', config.password);
        req.setRequestHeader('Cache-Control', 'no-cache, no-store, max-age=0');

        req.onload = () => resolve(req.response);
        req.onerror = () => reject(req);

        req.send(JSON.stringify(data));
    });
};

export default kimaiClientPostGeneric;