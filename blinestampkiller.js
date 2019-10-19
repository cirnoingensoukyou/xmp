(() => {
    const setupAjax = $ => {
        $.ajaxTransport("+binary", function(options, originalOptions, jqXHR){
            // check for conditions and support for blob / arraybuffer response type
            if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob)))))
            {
                return {
                    // create new XMLHttpRequest
                    send: function(headers, callback){
                        // setup all variables
                        var xhr = new XMLHttpRequest(),
                            url = options.url,
                            type = options.type,
                            async = options.async || true,
                        // blob or arraybuffer. Default is blob
                            dataType = options.responseType || "blob",
                            data = options.data || null,
                            username = options.username || null,
                            password = options.password || null;
        
                        xhr.addEventListener('load', function(){
                            var data = {};
                            data[options.dataType] = xhr.response;
                            // make callback and send data
                            callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
                        });
        
                        xhr.open(type, url, async, username, password);
        
                        // Apply custom fields if provided
                        if ( options.xhrFields ) {
                            for ( i in options.xhrFields ) {
                                xhr[ i ] = options.xhrFields[ i ];
                            }
                        }
        
                        // Override mime type if needed
                        if ( options.mimeType && xhr.overrideMimeType ) {
                            xhr.overrideMimeType( options.mimeType );
                        }
        
                        // X-Requested-With header
                        // For cross-domain requests, seeing as conditions for a preflight are
                        // akin to a jigsaw puzzle, we simply never set it to be sure.
                        // (it can always be set on a per-request basis or even using ajaxSetup)
                        // For same-domain requests, won't change header if already provided.
                        if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
                            headers[ "X-Requested-With" ] = "XMLHttpRequest";
                        }
        
                        // setup custom headers
                        for (var i in headers ) {
                            xhr.setRequestHeader(i, headers[i] );
                        }
        
                        xhr.responseType = dataType;
                        xhr.send(data);
                    },
                    abort: function(){
                        jqXHR.abort();
                    }
                };
            }
        });
    };

    'use strict';
    (func => {
        const scr = document.createElement('script');
        scr.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js' + '?' + Date.now();
        scr.onload = () => func($.noConflict(true));
        document.body.appendChild(scr);
    })($ => $(() => {
        const scr = document.createElement('script');
        scr.src = 'https://cdn.jsdelivr.net/npm/zlibjs@0.3.1/bin/zip.min.js';
        scr.onload = () => {
            setupAjax($);
            console.log('Five Inch LineStampKiller with jQuery ' + $().jquery);

            const promises = [];
            $('li.mdCMN09Li.FnStickerPreviewItem').each((_, elem) => {
                const obj = $.parseJSON($(elem).attr('data-preview'));
                const stickerId = +obj.id;
                const urlArray = [ 'animationUrl', 'fallbackStaticUrl', 'popupUrl', 'soundUrl', 'staticUrl' ];

                urlArray.forEach(elem => {
                    if (!obj[elem])
                        return;

                    obj[elem] = obj[elem].replace(/;compress=(?:true|false)$/, '');

                    const [ , , ext ] = (() => {
                        const r = obj[elem].match(/(iPhone|android)\/+(.+)$/);
                        if (!r || r.length < 3)
                            return [ undefined, undefined, undefined ];
                        return r;
                    })();
    
                    if (!ext)
                        return;

                    promises.push((() => {
                        return new Promise((resolve, reject) => {
                            $.ajax({
                                url: obj[elem],
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
    
                promises.forEach(([ ext, id, res ]) => zip.addFile(new Uint8Array(res), { filename: (new TextEncoder('utf-8')).encode(`${id}_${ext}` )}));
    
                const blob = new Blob([ zip.compress() ], { 'type': 'application/zip' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${eventValue}.zip`;
                a.click();
            });

        };
        document.body.appendChild(scr);
    }));
})();
