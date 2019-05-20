function UploadData(options) {
    this.file          = options.file;
    this.packageSize   = 1024 * 1024;
    this.uploaded      = 0;
    this.errorCount    = 0;
    this.maxErrorCount = 10;
    
    this.onFinish = options.onFinish;
    this.onStart  = options.onStart;
    this.onLoop   = options.onLoop;
    this.onError  = options.onError;
    
    this.hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    this.uploadFile = function (from) {
        if (from === 0) {
            this.onStart();
        }
        
        if (this.uploaded >= this.file.size) {
            this.onFinish();
            return false;
        }
        
        let reader  = new FileReader();
        let thisObj = this;
        
        let blob = this.file.slice((
            from * this.packageSize
        ), (
            from * this.packageSize
        ) + this.packageSize, this.file.type);
        let data = {};
        
        reader.onloadend = function (e) {
            if (e.target.readyState == FileReader.DONE) {
                data.bin      = window.btoa(e.target.result);
                data.fileInfo = {
                    "hash": thisObj.hash,
                    "name": thisObj.file.name,
                    "size": thisObj.file.size,
                    "type": thisObj.file.type
                };
                
                $.ajax({
                    type    : "POST",
                    url     : "src/upload.php",
                    data    : data,
                    async   : false,
                    timeout : 2000,
                    dataType: "json",
                    success : function (data) {
                        if (data.success) {
                            thisObj.uploaded += thisObj.packageSize;
                            thisObj.onLoop(thisObj.uploaded, thisObj.file.size);
                            thisObj.uploadFile(from + 1);
                        } else {
                            alert("Something went wrong");
                        }
                    },
                    error   : function (request, status, err) {
                        let code = request.status;
                        thisObj.errorCount += 1;
                        
                        switch (code) {
                            case 413 || 504:
                                thisObj.errorCount  = 0;
                                thisObj.packageSize = thisObj.packageSize / 2;
                                break;
                        }
                        
                        if (thisObj.errorCount < thisObj.maxErrorCount) {
                            setTimeout(function () {
                                thisObj.uploadFile(from);
                            }, 1000);
                        } else {
                            thisObj.onError(from);
                        }
                    }
                });
            }
        };
        
        reader.readAsBinaryString(blob);
    };
}

$(document).ready(function () {
    let end    = 0;
    let upload = null;
    
    $('#upload-btn').on('click', function () {
        
        let file  = $('#file');
        let files = file.prop('files');
        
        if (!files.length) {
            alert('select file');
            return;
        }
        
        upload = new UploadData({
            onFinish: function () {
                $('form').trigger('reset').show();
                $('.upload').show();
                $('.re-upload').hide();
                $('.progress').hide();
                $('.progress-bar').css("width", "0%").html("0%");
            },
            onStart : function () {
                $('form').hide();
                $('.progress').show();
            },
            onLoop  : function (uploaded, total) {
                let progress = Math.round(uploaded / total * 100);
                $('.progress-bar').css("width", progress + "%").html(progress + "%").attr('aria-valuenow', progress);
            },
            onError : function (endLoop) {
                end = endLoop;
                $('form').show();
                $('.upload').hide();
                $('.re-upload').show();
                $('.progress').hide();
            }
        });
        
        upload.file = files[0];
        upload.uploadFile(0);
    });
    
    $('#re-upload-btn').on('click', function () {
        let file  = $('#file');
        let files = file.prop('files');
        
        if (!files.length) {
            alert('select file');
            return;
        }
        
        $('form').hide();
        $('.progress').show();
        
        upload.file = files[0];
        upload.uploadFile(end);
    });
});
