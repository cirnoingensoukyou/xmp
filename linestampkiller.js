
$(() => {
    const writeLog = (() => {
        const logTextarea = $('#log_text');
        return str => {
            logTextarea.val(logTextarea.val() + str);
            logTextarea.scrollTop(logTextarea[0].scrollHeight - logTextarea.height());
        };
    })();

    const writeLogln = str => writeLog(str + '\n');

    const parseHtml = (pId, res) =>
    {
        writeLogln('HTML取得成功');
        const promises = [];

        $(res).find('li.mdCMN09Li.FnStickerPreviewItem').each((_, elem) => {
            obj = $.parseJSON($(elem).attr('data-preview'));
            const stickerId = +obj.id;
            const urlArray = [ 'animationUrl', 'fallbackStaticUrl', 'popupUrl', 'soundUrl', 'staticUrl' ];

            urlArray.forEach(elem => {
                if (!obj[elem])
                    return;

                obj[elem] = obj[elem].replace(/;compress=(?:true|false)$/, '');

                const [ , type, ext ] = (() => {
                    const r = obj[elem].match(/(iPhone|android)\/+(.+)$/);
                    if (!r || r.length < 3)
                        return [ undefined, undefined, undefined ];
                    return r;
                })();

                if (!type || !ext)
                    return;

                typeNo = type == 'iPhone' ? 1 : 2;

                extNum = (() => {
                    switch (ext)
                    {
                        case 'sticker.png':
                            return 1;
                        case 'sticker@2x.png':
                            return 2;
                        case 'sticker_animation@2x.png':
                            return 3;
                        case 'sticker_sound.m4a':
                            return 4;
                    }
                    return undefined;
                })();

                if (!extNum)
                    return;

                promises.push((() => {
                    return new Promise((resolve, reject) => {
                        $.ajax({
                            url: `https://vps.issm.xyz:8443/?m=i&id=${stickerId}&type=${typeNo}&ext=${extNum}`,
                            type: 'GET',
                            dataType: 'binary',
                            responseType:'arraybuffer'
                        }).done(res => resolve([ ext, stickerId, res ])).fail((a, b, c) => reject([a, b, c]));
                    });
                })());
            });
        });

        Promise.all(promises).then(promises => {
            const zip = new Zlib.Zip();
            const toU8Arr = s => {
                var array = new Uint8Array(s.length);
                for (i = 0; i < s.length; i++)
                    array[i] = s.charCodeAt(i) & 0xff;
                return array;
            };

            promises.forEach(([ ext, id, res ]) => zip.addFile(new Uint8Array(res), { filename: (new TextEncoder('utf-8')).encode(`${id}_${ext}` )}));

            const blob = new Blob([ zip.compress() ], { 'type': 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${pId}.zip`;
            a.click();
        });
    }

    const onClick = (() => {
        const lineurl_text = $('#lineurl_text');
        return () => {
            const lineUrl = lineurl_text.val();
            
            const productId = (() => {
                let r = lineUrl.match(/https:\/\/store\.line\.me\/+stickershop\/+product\/+([0-9]+)/);
                return r ? +r[1] : undefined;
            })();

            if (!productId)
            {
                writeLogln('URL不正');
                return;
            }
    
            writeLogln(`URL: ${lineUrl}\nProductId: ${productId}`);
    
            $.ajax({
                url: `https://vps.issm.xyz:8443/?m=h&id=${productId}`,
                type: 'GET',
                dataType: 'html'
            }).done(res => parseHtml(productId, res)).fail(() => writeLogln('HTML 取得できなかった'));
        };
    })();

    $('#getZip_button').on('click', onClick);
});
