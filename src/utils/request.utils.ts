// Call external api to get custom json list
export const getListFromHttp = (url): Promise<Record<string, any>[]> => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = (): void => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(xhr.status);
            }
        }
    };
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.send();
});
