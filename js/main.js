const SIZE = 10 * 1024; // 切片大小
let file = null;
let datas = [];

// 选择文件
const handleFileChange = (e) => {
    const [file] = e.target.flies;
    if (!file) {
        return;
    }
    file = file;
}

// 封装请求方法
const request = (url, method = 'POST', data, headers = {}, ) => {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key]);
        })
        xhr.send(data);
        xhr.onload = (e) => {
            resolve({
                data: e.target.response
            })
        }
    })
}

// 生成切片文件
const createFileChunk = (file, size = SIZE) => {
    const fileChunkList = [];
    let cur = 0;
    while (cur < file.size) {
        fileChunkList.push({ file: file.slice(cur, cur + size) });
        cur += size;
    }
    return fileChunkList;
}

// 上传切片
const uploadFileChunks = (file, datas) => {
    const requestList = datas.map(({ chunk, hash }) => {
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('hash', hash);
        formData.append('fileName', file.name);
        return formData;
    }).map(async formData => {
        request({
            url: 'http://localhost:3000',
            data: formData
        })
    })
    // 并发切片
    await Promise.all(requestList);
}

// 上传文件
const handleUpload = async (file) => {
    if (!file) {
        return;
    }
    const fileChunkList = createFileChunk(file);
    const datas = fileChunkList.map(({ file }, index) => ({
        chunk: file,
        hash: `${file.name}-${index}`
    }));
    console.log(datas);
    await uploadFileChunks(file, datas);
}