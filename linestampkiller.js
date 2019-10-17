

const checkUrl = url =>
{
    let aTag = $('<a href="' + url + '"></a>')[0];

    let pathArr = aTag.pathname.split('/').filter(_ => _ !== '');
    if (pathArr.length < 3)
        return false;

    let r = (aTag.protocol === 'https:' || aTag.protocol === 'http:') && 
        aTag.hostname === 'store.line.me' &&
        pathArr[0] === 'stickershop' &&
        pathArr[1] === 'product';
    
    aTag.remove();

    return r;
};

const getZip = () =>
{
    const line_url = document.form_0.line_url.value;
    alert(checkUrl(line_url) ? 'TRUE' : 'FALSE');
};
