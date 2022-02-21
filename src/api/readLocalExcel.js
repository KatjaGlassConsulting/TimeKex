export async function readLocalExcel(url) {

    var req = new XMLHttpRequest();

    return new Promise((resolve, reject) => {  
        req.onload = () => resolve(req.response);
        req.onerror = () => reject(req.statusText);
        req.open('get', url, true);
        req.responseType = "arraybuffer";

        req.send();
    });    
}