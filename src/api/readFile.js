const readFile = file => {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {resolve(reader.result)};
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    })
}

export default readFile;