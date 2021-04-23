// Call external api to get custom json list
export const getListFromHttp = async (): Promise<any> => {
    const xhr = new XMLHttpRequest();
    try {
        xhr.onreadystatechange = (): void => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log(xhr.response);
            }
        };
        xhr.open('GET', 'https://mocki.io/v1/f2cc018a-2692-4c00-9314-a947d38ae3ee', true);
        xhr.responseType = 'json';
        xhr.send();
    } catch (error) {
        console.log(error);
    }
    return xhr.response;
};
