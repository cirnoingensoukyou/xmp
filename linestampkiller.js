
const checkUrl = url =>
{
    const aTag = $('<a href="' + url + '"></a>')[0];

    const pathArr = aTag.pathname.split('/').filter(_ => _ !== '');
    if (pathArr.length < 3)
        return false;

    const r = (aTag.protocol === 'https:' || aTag.protocol === 'http:') && 
        aTag.hostname === 'store.line.me' &&
        pathArr[0] === 'stickershop' &&
        pathArr[1] === 'product';
    
    aTag.remove();

    return r;
};

const getProductId = url => 
{
    const r = url.match(/[0-9]+/);
    return r ? r[0] : undefined;
}

const disHtml = res =>
{
    console.log(res);
}

const getZip = () =>
{
    const line_url = document.form_0.line_url.value;
    if (!checkUrl(line_url))
    {
        alert('URL おかしい');
        return;
    }
    
    const productId = getProductId(line_url);
    if (!productId)
    {
        alert('URL おかしい');
        return;
    }

    $.ajax({
        url: 'https://vps.issm.xyz:8443/?m=h&id=' + productId,
        type: 'GET',
        success: disHtml,
        error: () => alert('HTML 取得できなかった')
    });
};
