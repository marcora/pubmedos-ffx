function pubmedos(doc) {

    // init some vars and constants
    var win = doc.defaultView; // window object associated with incoming document
    var wrp = new XPCNativeWrapper(win);
    var version = -1; // 0 for localhost
    const MYNCBI_CU = unescape(wrp.wrappedJSObject.myncbi_cu);
    if (version < 0) {
        var BASE_URL = 'http://pubmedos.appspot.com';
        var SBASE_URL = 'https://pubmedos.appspot.com';
    } else if (version > 0) {
        var BASE_URL = 'http://'+version+'.latest.pubmedos.appspot.com';
        var SBASE_URL = 'https://'+version+'.latest.pubmedos.appspot.com';
    } else {
        var BASE_URL = 'http://localhost:4000';
        var SBASE_URL = 'http://localhost:4000';
    }
    const PUBMED_URL = 'http://'+doc.location.host;
    const PAGE_URL = doc.location.href;
    const REALM = 'pubmedos';

    // ajax defaults
    $.ajaxSetup({
        cache: false,
        dataType: 'json',
        // error: XXX
    });

    // CAN'T CONTINUE W/O A LOGGED IN USER!
    if ($('#myncbi_on', doc).length == 0) return;

    // scrape username if logged in
    const USERNAME = $('#myncbi_on', doc).text().match(/Welcome (\w+)\./)[1];

    // init images
    var images = {
        avg00 : '<img class="average_rating_img" alt="[average rating 0]" src="chrome://pubmedos/skin/avg00.gif" />',
        avg10 : '<img class="average_rating_img" alt="[average rating 1]" src="chrome://pubmedos/skin/avg10.gif" />',
        avg15 : '<img class="average_rating_img" alt="[average rating 1.5]" src="chrome://pubmedos/skin/avg15.gif" />',
        avg20 : '<img class="average_rating_img" alt="[average rating 2]" src="chrome://pubmedos/skin/avg20.gif" />',
        avg25 : '<img class="average_rating_img" alt="[average rating 2.5]" src="chrome://pubmedos/skin/avg25.gif" />',
        avg30 : '<img class="average_rating_img" alt="[average rating 3]" src="chrome://pubmedos/skin/avg30.gif" />',
        avg35 : '<img class="average_rating_img" alt="[average rating 3.5]" src="chrome://pubmedos/skin/avg35.gif" />',
        avg40 : '<img class="average_rating_img" alt="[average rating 4]" src="chrome://pubmedos/skin/avg40.gif" />',
        avg45 : '<img class="average_rating_img" alt="[average rating 4.5]" src="chrome://pubmedos/skin/avg45.gif" />',
        avg50 : '<img class="average_rating_img" alt="[average rating 5]" src="chrome://pubmedos/skin/avg50.gif" />',
        rtg01 : '<img class="user_rating_img" alt="[user rating -1]" src="chrome://pubmedos/skin/rtg01.gif" />',
        rtg00 : '<img class="user_rating_img" alt="[user rating 0]" src="chrome://pubmedos/skin/rtg00.gif" />',
        rtg10 : '<img class="user_rating_img" alt="[user rating 1]" src="chrome://pubmedos/skin/rtg10.gif" />',
        rtg20 : '<img class="user_rating_img" alt="[user rating 2]" src="chrome://pubmedos/skin/rtg20.gif" />',
        rtg30 : '<img class="user_rating_img" alt="[user rating 3]" src="chrome://pubmedos/skin/rtg30.gif" />',
        rtg40 : '<img class="user_rating_img" alt="[user rating 4]" src="chrome://pubmedos/skin/rtg40.gif" />',
        rtg50 : '<img class="user_rating_img" alt="[user rating 5]" src="chrome://pubmedos/skin/rtg50.gif" />',
        rated : '<img class="rated_img" alt="[rated]" src="chrome://pubmedos/skin/rated.png" />',
        annotation : '<img class="annotation_img" alt="[annotation]" src="chrome://pubmedos/skin/pencil.png" />',
        favorite_articles_cmd: '<img class="favorite_articles_cmd" alt="[]" title="Click to see your favorite articles in this folder" src="chrome://pubmedos/skin/favorite.png" />',
        toprated_articles_cmd: '<img class="toprated_articles_cmd" alt="[]" title="Click to see the top rated articles in this folder" src="chrome://pubmedos/skin/toprated.png" />',
        work_articles_cmd: '<img class="work_articles_cmd" alt="[]" title="Click to see the articles on your desk that belong to this folder" src="chrome://pubmedos/skin/work.png" />',
        read_articles_cmd: '<img class="read_articles_cmd" alt="[]" title="Click to see the articles in your reading list that belongs to this folder" src="chrome://pubmedos/skin/read.png" />',
        add_to_folder : '<img class="add_to_folder" alt="[add to folder]" src="chrome://pubmedos/skin/add.png" />',
        remove_from_folder : '<img class="remove_from_folder" alt="[remove from folder]" src="chrome://pubmedos/skin/delete.png" />',
        cross : '<img class="cross_img" alt="[cross]" src="chrome://pubmedos/skin/cross.png" />',
        folder : '<img class="folder_img" alt="[folder]" src="chrome://pubmedos/skin/folder.png" />',
        folder_del : '<img class="folder_delete_img" alt="[delete folder]" src="chrome://pubmedos/skin/folder_delete.png" />',
        folder_add : '<img class="folder_add_img" alt="[add folder]" src="chrome://pubmedos/skin/folder_add.png" />',
        folder_go : '<img class="folder_go_img" alt="[goto folders]" src="chrome://pubmedos/skin/folder_go.png" />',
        folder_page : '<img class="folder_page_img" alt="[folder page]" src="chrome://pubmedos/skin/folder_page.png" />',
        related_article : '<img class="related_article_img" alt="[related article]" src="chrome://pubmedos/skin/related_article.png" />',
        related_article_del : '<img class="related_article_delete_img" alt="[remove related_article]" src="chrome://pubmedos/skin/related_article_delete.png" />',
        related_article_add : '<img class="related_article_add_img" alt="[add related article]" src="chrome://pubmedos/skin/related_article_add.png" />',
        toprated: '<img class="toprated_img" alt="[top rated]" src="chrome://pubmedos/skin/toprated.png" />',
        file : '<img class="file_img" alt="[file]" src="chrome://pubmedos/skin/file.png" />',
        not_file : '<img class="not_file_img" alt="[not file]" src="chrome://pubmedos/skin/not_file.png" />',
        favorite : '<img class="favorite_img" alt="[favorite]" src="chrome://pubmedos/skin/favorite.png" />',
        not_favorite : '<img class="not_favorite_img" alt="[not favorite]" src="chrome://pubmedos/skin/not_favorite.png" />',
        recommended : '<img class="recommended_img" alt="[recommended]" src="chrome://pubmedos/skin/recommended.png" />',
        work : '<img class="work_img" alt="[work]" src="chrome://pubmedos/skin/work.png" />',
        not_work : '<img class="not_work_img" alt="[not work]" src="chrome://pubmedos/skin/not_work.png" />',
        read : '<img class="read_img" alt="[read]" src="chrome://pubmedos/skin/read.png" />',
        not_read : '<img class="not_read_img" alt="[not read]" src="chrome://pubmedos/skin/not_read.png" />',
        author : '<img class="author_img" alt="[author]" src="chrome://pubmedos/skin/author.png" />',
        not_author : '<img class="not_author_img" alt="[not author]" src="chrome://pubmedos/skin/not_author.png" />',
        tag_blue   : '<img class="tag_blue_img" alt="[tag blue]" src="chrome://pubmedos/skin/tag_blue.png" />',
        loading_strip : '<img class="loading_strip_img" alt="[loading&hellip;]" src="chrome://pubmedos/skin/loading_strip.gif" />',
        loading_circle : '<img class="loading_circle_img" alt="[loading&hellip;]" src="chrome://pubmedos/skin/loading_circle.gif" />',
        find : '<img class="find_img" alt="[find]" src="chrome://pubmedos/skin/find.png" />',
        reprint : '<img class="reprint_img" alt="[reprint]" src="chrome://pubmedos/skin/reprint.png" />',
        not_reprint : '<img class="not_reprint_img" alt="[not reprint]" src="chrome://pubmedos/skin/not_reprint.png" />',
    };

    // url helpers
    function url_for() {
        arguments.join = Array.prototype.join;
        return BASE_URL + '/' + arguments.join('/');
    }

    function surl_for() {
        arguments.join = Array.prototype.join;
        return SBASE_URL + '/' + arguments.join('/');
    }

    // notification box helper
    var notify = {
        info: function(label) {
            var nbox = getBrowser().getNotificationBox();
            nbox.appendNotification(label, null, null, nbox.PRIORITY_INFO_LOW);
        },
        warning: function(label) {
            var nbox = getBrowser().getNotificationBox();
            nbox.appendNotification(label, null, null, nbox.PRIORITY_WARNING_LOW);
        },
        critical: function(label) {
            var nbox = getBrowser().getNotificationBox();
            nbox.appendNotification(label, null, null, nbox.PRIORITY_CRITICAL_LOW);
        },
    };

    // rating image generator
    // alt rating scale: spam (-1), poor, below average, average, above average, excellent ???
    function rating_img(article) {
        if (article.rating >= 1) {
            var img = eval('images.rtg' + article.rating + '0');
        } else if (article.rating == -1) {
            var img = eval('images.rtg01');
        } else {
            if (article.ratings_average_rating) {
                var rem = Math.round(article.ratings_average_rating) - article.ratings_average_rating;
                switch (true) {
                case (rem == 0):
                    var img = eval('images.avg' + Math.round(article.ratings_average_rating) + '0');
                case (rem <= -0.25):
                    var img = eval('images.avg' + Math.floor(article.ratings_average_rating) + '5');
                case (rem < 0):
                    var img = eval('images.avg' + Math.floor(article.ratings_average_rating) + '0');
                case (rem <= 0.25):
                    var img = eval('images.avg' + Math.ceil(article.ratings_average_rating) + '0');
                case (rem > 0):
                    var img = eval('images.avg' + Math.floor(article.ratings_average_rating) + '5');
                }
            } else {
                var img = images.avg00;
            }
        }
        return img; // + '&nbsp;[' + (article.ratings_average_rating ? article.ratings_average_rating.toFixed(1) + ' avg rating/' : '') + (article.ratings_count ? article.ratings_count + ' rating' + (article.ratings_count != 1 ? 's' : '') : 'unrated') + ']';
    }

    // file image generator
    function file_img(status) {
        if (status) {
            return eval('images.file');
        } else {
            return eval('images.not_file');
        }
    }

    // favorite image generator
    function favorite_img(status) {
        if (status) {
            return eval('images.favorite');
        } else {
            return eval('images.not_favorite');
        }
    }

    // work image generator
    function work_img(status) {
        if (status) {
            return eval('images.work');
        } else {
            return eval('images.not_work');
        }
    }

    // read image generator
    function read_img(status) {
        if (status) {
            return eval('images.read');
        } else {
            return eval('images.not_read');
        }
    }

    // author image generator
    function author_img(status) {
        if (status) {
            return eval('images.author');
        } else {
            return eval('images.not_author');
        }
    }

    // reprint image generator
    function reprint_img(status) {
        if (status) {
            return eval('images.reprint');
        } else {
            return eval('images.not_reprint');
        }
    }

    // discover the pdf reprint url for article with given pmid
    function discover_pdf_url(pmid) {
        return "http://www.pubmedcentral.nih.gov/picrender.fcgi?blobtype=pdf&pubmedid=" + pmid;
    }

    // fetch pdf reprint (and retrieve+store it if not found)
    function fetch(pmid) {

        // search for pdf
        var pdf_url = discover_pdf_url(pmid);
        if (!pdf_url) {
            notify.warning('fetch error'); return
        }
        var service = Components.classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);
        var channel = service.newChannel(pdf_url, 0, null);
        var stream = channel.open();
        // check if found
        if (channel instanceof Components.interfaces.nsIHttpChannel && channel.responseStatus != 200) {
            notify.warning('fetch error'); return
        }
        // download if found
        var pdf_stream = Components.classes["@mozilla.org/binaryinputstream;1"]
        .createInstance(Components.interfaces.nsIBinaryInputStream);
        pdf_stream.setInputStream(stream);
        var size = 0;
        var pdf = "";
        while(size = pdf_stream.available()) {
            pdf += pdf_stream.readBytes(size);
        }
        pdf_stream.close();
        // check if pdf
        if (!pdf.match(/^%PDF-1\.\d{1}/)) {
            notify.warning('fetch error'); return
        }
        // check size of pdf
        var max_filesize = 10*1048576; // 10 megabytes
        if (pdf.length > max_filesize) {
            notify.warning('fetch error'); return
        }

        // write pdf to a storage stream
        var binary_stream = Components.classes["@mozilla.org/binaryoutputstream;1"].createInstance(Components.interfaces.nsIBinaryOutputStream);
        var storage_stream = Components.classes["@mozilla.org/storagestream;1"].createInstance(Components.interfaces.nsIStorageStream);
        storage_stream.init(4096, pdf.length, null);
        binary_stream.setOutputStream(storage_stream.getOutputStream(0));
        binary_stream.writeBytes(pdf, pdf.length);
        binary_stream.close();

        // put to gae datastore
        var req_post = new XMLHttpRequest();
        req_post.open("POST", url_for('articles', pmid, 'reprint'), true);
        req_post.setRequestHeader("Content-type", "application/pdf");
        req_post.setRequestHeader("Content-length", pdf.length);
        req_post.onload = function(e) {
            if (e.target.status == 200) {
                doc.location.href= url_for('articles', pmid, 'reprint');
            } else {
                notify.warning('fetch error'); return
            }
        };
        req_post.send(storage_stream.newInputStream(0));
    }


    /* Base64 encode / decode <http://www.webtoolkit.info/> */

    var Base64 = {

        // private property
        _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // public method for encoding
        encode : function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = Base64._utf8_encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

            }

            return output;
        },

        // public method for decoding
        decode : function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {

                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

            }

            output = Base64._utf8_decode(output);

            return output;

        },

        // private method for UTF-8 encoding
        _utf8_encode : function (string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        },

        // private method for UTF-8 decoding
        _utf8_decode : function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;

            while ( i < utftext.length ) {

                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }

            }

            return string;
        }

    }


    /* encryption/decryption */

    function unique(a) { // eliminate duplicates in array while preserving order
        tmp = new Array(0);
        for(i=0;i<a.length;i++){
            if(!contains(tmp, a[i])){
                tmp.length+=1;
                tmp[tmp.length-1]=a[i];
            }
        }
        return tmp;
    }

    function contains(a, e) { // check if array contains element
        for(j=0;j<a.length;j++)if(a[j]==e)return true; // do NOT edit this line!!!
        return false;
    }

    function stoa(s){ // convert a string to an array
        var a = [];
        for (i=0;i<s.length;i++) {
            a.push(s.charAt(i));
        }
        return a;
    }

    function encrypt_password_hash(password_hash, username) {
        // password_hash is b64_sha1 hash of password
        var b64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var key_chars = unique(stoa(b64_sha1(username)+b64_chars)).join('');
        if (! key_chars.length == b64_chars.length) { throw null };
        var encrypted_password_hash = [];
        for (i=0;i<password_hash.length;i++) {
            encrypted_password_hash.push(key_chars.charAt(b64_chars.indexOf(password_hash.charAt(i))));
        }
        return encrypted_password_hash.join('');
    }

    function decrypt_password_hash(encrypted_password_hash, username) {
        // keyed Caesar cipher
        var b64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var key_chars = unique(stoa(b64_sha1(username)+b64_chars)).join('');
        if (! key_chars.length == b64_chars.length) { throw null };
        var password_hash = [];
        for (i=0;i<encrypted_password_hash.length;i++) {
            password_hash.push(b64_chars.charAt(key_chars.indexOf(encrypted_password_hash.charAt(i))));
        }
        return password_hash.join('');
    }


    /* authenticate user */

    function find_login(username){
        var login_manager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
        var logins = login_manager.findLogins({}, BASE_URL, null, REALM);
        var login = null;
        for (var i = 0; i < logins.length; i++) {
                if (logins[i].username == username) {
                    login = logins[i];
                    break;
                }
            }
        return login;
    }

    function create_login(username, password){
        var login = find_login(username);
        if (login) {
            return false;
        } else {
            var ns_login_info = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
                Components.interfaces.nsILoginInfo,
                "init");
            // password is stored as a base64-sha1 hash
            var password_hash = b64_sha1(password);
            var login_info = new ns_login_info(BASE_URL, null, REALM, username, password_hash, '', '');
            var login_manager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
            login_manager.addLogin(login_info);
            return true;
        }
    }

    function destroy_login(username, password_hash) {
        var login = find_login(username);
        if (login) {
            var ns_login_info = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
                Components.interfaces.nsILoginInfo,
                "init");
            var login_info = new ns_login_info(BASE_URL, null, REALM, username, password_hash, '', '');
            var login_manager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
            login_manager.removeLogin(login_info);
            return true;
        } else {
            return false;
        }
    }

    function update_login(username, password_hash, new_password) {
        var login = find_login(username);
        if (login) {
            return destroy_login(username, password_hash) && create_login(username, new_password);
        } else {
            return false;
        }
    }

    function find_or_create_login(username, password) {
        var login = find_login(username);
        if (login) {
            return login;
        } else {
            if (create_login(username, password)) {
                return find_login(username);
            } else {
                return null;
            }
        }
    }

    var login = find_or_create_login(USERNAME, 'password');
    if (login) {
        var PASSWORD_HASH = login.password;
    } else {
        return // CAN'T CONTINUE W/O LOGIN!
    }

    // logout from server when signing off PubMed
    $('#myncbi_on a', doc).click(function() {
        $.get(url_for('logout'));
        return destroy_login(USERNAME, PASSWORD_HASH);
    });

    // click user name to go to pmos account
    (function() {
        var $username = $('#myncbi_on td:contains("'+USERNAME+'")', doc)
        var username_html = $username.html().replace(USERNAME, '<a title="Click to go to your PubMed On Steroids account" href="'+url_for('users', USERNAME)+'">'+USERNAME+'</a>');
        $username.html(username_html);
    })();

    // add command tabs
    (function () {
        // add "Top Rated" command tab
        $('#command_tab ul', doc).append('<li title="Click to see your top rated articles"><a id="toprated_command_tab" href="' + url_for('articles','toprated','redirect') + '">'+images.toprated+'</a></li>');

        // add "Favorite" command tab
        $('#command_tab ul', doc).append('<li title="Click to see your favorite articles"><a id="favorite_command_tab" href="' + url_for('articles','favorite','redirect') + '">'+images.favorite+'</a></li>');

        // add "File" command tab
        $('#command_tab ul', doc).append('<li title="Click to see the articles in your archive"><a id="file_command_tab" href="' + url_for('articles','file','redirect') + '">'+images.file+'</a></li>');

        // add "Work" command tab
        $('#command_tab ul', doc).append('<li title="Click to see the articles on your desk"><a id="work_command_tab" href="' + url_for('articles','work','redirect') + '">'+images.work+'</a></li>');

        // add "Read" command tab
        $('#command_tab ul', doc).append('<li title="Click to see the articles in your reading list"><a id="read_command_tab" href="'+ url_for('articles','read','redirect') +'">'+images.read+'</a></li>');

        // add "Author" command tab
        $('#command_tab ul', doc).append('<li title="Click to see your publications"><a id="author_command_tab" href="'+ url_for('articles','author','redirect') +'">'+images.author+'</a></li>');

        // add "Folder" command tab
        $('#command_tab ul', doc).append('<li title="Click to see the articles in a specific folder"><a id="folder_command_tab" href="#">'+images.folder+'</a></li>');
        $('#folder_command_tab', doc).click(function(){
            win.showModalDialog(url_for('folders', 'dialog'), win, "dialogwidth: 800; dialogheight: 600; resizable: yes; scroll: yes;");
            return false;
        });

        // add "Recommendations" command tab
        //        $('#command_tab ul').append('<li><a id="recommendations_command_tab" href="'+ url_for('articles', 'recommended') +'">'+images.recommended+'&nbsp;Recommendations</a></li>');

        // activate current command tab and add cmdtab hidden field to EntrezForm to maintain state across requests
        if ( ! MYNCBI_CU.match(/(?:&|\?)TabCmd=(\w+)(?:&|$)/) ) {
            var cmd_tab = /(?:&|\?)CmdTab=([\w\/+=]+)(?:&|$)/.exec(MYNCBI_CU);
            if (cmd_tab && cmd_tab.length == 2 && $('#term', doc).val().match(/#1/)) {
                $('#command_tab li', doc).removeClass('sel');
                if (cmd_tab[1].match(/^Folder_(\S+)$/)) {
                    $('#folder_command_tab', doc).parent().addClass('sel');
                    $('#folder_command_tab', doc).html(images.folder+'&nbsp;<span style="vertical-align: top; font-weight: normal;">'+Base64.decode(/^Folder_(\S+)$/.exec(cmd_tab[1])[1])+'</span>');
                } else {
                    $('#'+cmd_tab[1].toLowerCase()+'_command_tab', doc).parent().addClass('sel');
                }
                $('#EntrezForm', doc).append('<input type="hidden" name="CmdTab" value="'+cmd_tab[1]+'"/>');
            }
        }
    })();

    // remove "Display Bar #2"
    $('#display_bar2', doc).remove();

    // set id of article wrapping element to pmid for ez access later on (only if display is set to "AbstractPlus")
    var IS_ABP = false;
    $('dl.AbstractPlusReport', doc).each(function() {
        // "AbstractPlus" format
        IS_ABP = true;
        var pmid = $(this).find('.pmid:not(.pmcid)').text().match(/PMID: (\d+)\s*/)[1];
        $(this).attr('id', 'pmid_'+pmid);
    });

    // scrape and collect pmids in an array
    var pmids = [];
    $('.pmid:not(.pmcid), .PMid', doc).each(function() {
        var pmid = $(this).text().match(/PMID: (\d+)\s*/)[1];
        pmids.push(pmid);
    });

    function preindex(pmids) {
        // can't operate with more than one pmid if display is set to "AbstractPlus"
        if (IS_ABP) return;

        $.each(pmids, function(index, pmid) {
            $('#pmid_' + pmid, doc).find('div.PMid').siblings('div.source').before('<div class="pmos index">'+ images.rtg00 + '&nbsp;' + images.not_favorite + '&nbsp;' + images.not_file + '&nbsp;' + images.not_work + '&nbsp;' + images.not_read + '&nbsp;' + images.not_author+'</div>');
        });
    }

    function preshow(pmid) {
        // if display is not set to "AbstractPlus" show index format
        if (!IS_ABP) { index([pmid]); return }

        $('#pmid_'+pmid, doc).find('div.abstitle').children('span.ti').append('<span class="pmos show">&nbsp;<span id="rating" class="rating">'+ images.rtg00 +'</span>&nbsp;<span class="favorite">'+images.not_favorite+'</span>&nbsp;<span class="file">'+images.not_file+'</span>&nbsp;<span class="work">'+images.not_work+'</span>&nbsp;<span class="read">'+images.not_read+'</span>&nbsp;<span class="author">'+images.not_author+'</span>&nbsp;<span class="reprint">'+images.not_reprint+'</span></span>');

        // Add "Sponsored Links"
        $('dd.links > h2:contains("Related Articles")', doc).parent().attr('id', 'related_articles');
        $('#related_articles', doc).after('<dd class="links rra" id="sponsored_links"><h2>Sponsored Links</h2><div id="google_adsense"><iframe scrolling="no" frameborder="0" marginwidth="0" marginheight="0" width="336" height="280" src="'+url_for('articles', pmid, 'sponsored_links')+'" /></div></dd>');

        // Add "Annotation"
        $('dd.abstract', doc).append('<div class="annotation" id="annotation" style="clear: both;">&nbsp;</div>');
    }

    if (pmids.length == 1) { preshow(pmids[0]) }; // Call prep show action if only one pmid
    if (pmids.length > 1) { preindex(pmids) }; // Call prep index action if more than one pmid

    // login current user
    $.post(surl_for('login'), {'username': USERNAME, 'password': PASSWORD_HASH }, function(response) {
        var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
        .getService(Components.interfaces.nsIPromptService);
        switch (response) {
        case 'authenticated':
            // call main if authenticated
            if (pmids.length == 1) { show(pmids[0]) }; // Call show action if only one pmid
            if (pmids.length > 1) { index(pmids) }; // Call index action if more than one pmid
            break;
        case 'activate':
            // do nothing until user is activated
            break;
        case 'authenticate':
            // ask for password
            var new_password = { 'value': '' };
            var result = prompts.promptPassword(win, "Login to PubMed On Steroids", "Please, enter the password for user "+USERNAME, new_password, null, { });
            if (result && new_password.value) {
                if (update_login(USERNAME, PASSWORD_HASH, new_password.value)) { win.location.reload(true) }
            }
            break;
        case 'register':
            var params = { 'inn': { 'username': USERNAME }, 'out': null };
            win.openDialog("chrome://pubmedos/content/registration_dialog.xul", "", "modal, centerscreen", params).focus();
            if (params.out) {
                var password = params.out.password;
                var password_hash = b64_sha1(password);
                $.post(surl_for('register'),
                       {'username': USERNAME, 'password': password_hash, 'lastname': params.out.lastname, 'forename': params.out.forename, 'email': params.out.email },
                       function() {
                           if (update_login(USERNAME, PASSWORD_HASH, password)) {
                               prompts.alert(win, 'PubMed On Steroids account activation', 'Your PubMed on Steroids account has been created!\n\nIn order to activate your account and verify your email address, please follow the very simple instructions that have been just sent to you via email.\n\nThank you for joining PubMed On Steroids!');
                           }
                       });
            } else { /* user pressed cancel */ }
            break;
        }
    }, 'json');


    function index(pmids) {
        // can't operate with more than one pmid if display is set to "AbstractPlus"
        if (IS_ABP) return;

        // fetch articles from OS using JSONP and add OS elements to page
        $.get(url_for('articles'), { 'id': pmids }, function(articles) {

            // can't operate unless all articles are returned by OS
            if (articles.length != pmids.length) return;

            // add OS elements to page
            $.each(articles, function(index, article) {
                $('#pmid_' + article.id, doc).find('div.pmos').html('<div class="pmos index">'+rating_img(article) + '&nbsp;' + (article.favorite ? images.favorite : images.not_favorite) + '&nbsp;' + (article.file ? images.file : images.not_file) + '&nbsp;' + (article.work ? images.work : images.not_work)  + '&nbsp;' + (article.read ? images.read : images.not_read) + '&nbsp;' + (article.author ? images.author : images.not_author)+'</div>');
            });
        }, 'json');
    }


    function show(pmid) {
        // if display is not set to "AbstractPlus" show index format
        if (!IS_ABP) { index([pmid]); return }

        // remove "Featured Linkouts"
        // $('span.featured_linkouts', doc).remove();

        // fetch article from OS using JSONP and add OS elements to page
        $.get(url_for('articles', pmid), {}, function(article) {

            // can't operate if requested article does not match article returned by OS
            if (pmid != article.id) return;

            // add "Rating"
            $('#pmid_'+pmid, doc).find('div.abstitle').find('span.pmos').html('<span class="pmos show">&nbsp;<span id="rating" class="rating" title="Click to rate this article">'+rating_img(article)+'</span>&nbsp;<span class="favorite" title="Click to add/remove this article to/from your favorites">'+favorite_img(article.favorite)+'</span>&nbsp;<span class="file" title="Click to add/remove this article to/from your archive">'+file_img(article.file)+'</span>&nbsp;<span class="work" title="Click to add/remove this article to/from your desk">'+work_img(article.work)+'</span>&nbsp;<span class="read" title="Click to add/remove this article to/from your reading list">'+read_img(article.read)+'</span>&nbsp;<span class="author" title="Click to add/remove this article to/from your publications">'+author_img(article.author)+'</span>&nbsp;<span class="reprint" title="Click to fetch the reprint of this article">'+reprint_img(article.reprint)+'</span></span>');
            $('#rating', doc).click(function() {
                var editor = '<span id="rating_editor"><select id="edit_rating">' +
                    '<option value="-1"' + (article.rating == -1 ? ' selected="selected"' : '') + '>(X) block</option>' +
                    '<option value="0"' + (!article.rating ? ' selected="selected"' : '') + '>(0) unrated</option>' +
                    '<option value="1"' + (article.rating == 1 ? ' selected="selected"' : '') + '>(1) mediocre</option>' +
                    '<option value="2"' + (article.rating == 2 ? ' selected="selected"' : '') + '>(2) average</option>' +
                    '<option value="3"' + (article.rating == 3 ? ' selected="selected"' : '') + '>(3) good</option>' +
                    '<option value="4"' + (article.rating == 4 ? ' selected="selected"' : '') + '>(4) excellent</option>' +
                    '<option value="5"' + (article.rating == 5 ? ' selected="selected"' : '') + '>(5) exceptional</option>' +
                    '</select>&nbsp;<input type="button" value="Save" id="save_rating" /><input type="button" value="Cancel" id="cancel_rating" /></span>';
                $(this).after(editor).hide();
                $('#edit_rating', doc).focus();
                function update_rating(rating) { article = $.merge(rating, article); $('#rating', doc).html(rating_img(article)).show(); $('#rating_editor', doc).remove() }
                $('#save_rating', doc).click(function() {
                    var rating = $('#edit_rating', doc).val();
                    $.post(url_for('articles', pmid, 'rating'), { 'value': rating }, function(rating) { update_rating(rating) }, 'json');
                    return false
                });
                $('#cancel_rating', doc).click(function() {
                    update_rating(article); // pass article to revert rating
                    return false
                });
                return false
            });


            // add "File"
            $('span.file', doc).click(function() {
                if (article.file && !confirm('Do you really want to remove this article from your file?')) {
                    return false;
                }
                $.post(url_for('articles', pmid, 'file'),
                       {},
                       function(status) {
                           article.file = status;
                           $("span.file", doc).html(file_img(status));
                           if (status){
                               $.get(url_for('articles', pmid, 'folders'), {}, function(folders) {
                                   update_folders(folders);
                               }, 'json');
                           } else {
                               $('#folders', doc).hide();
                           }
                       }, 'json');
                return false;
            });

            // add "Favorite"
            $('span.favorite', doc).click(function() {
                $.post(url_for('articles', pmid, 'favorite'), {}, function(status) { $("span.favorite", doc).html(favorite_img(status)) }, 'json');
                return false;
            });

            // add "Work"
            $('span.work', doc).click(function() {
                $.post(url_for('articles', pmid, 'work'), {}, function(status) { $("span.work", doc).html(work_img(status)) }, 'json');
                return false;
            });

            // add "Read"
            $('span.read', doc).click(function() {
                $.post(url_for('articles', pmid, 'read'), {}, function(status) { $("span.read", doc).html(read_img(status)) }, 'json');
                return false;
            });

            // add "Read"
            $('span.author', doc).click(function() {
                $.post(url_for('articles', pmid, 'author'), {}, function(status) { $("span.author", doc).html(author_img(status)) }, 'json');
                return false;
            });

            // add "Reprint"
            $('span.reprint', doc).click(function(){
                if (article.reprint) {
                    doc.location.href= url_for('articles', pmid, 'reprint');
                } else {
                    fetch(pmid);
                }
                return false;
            });

            // add "Annotation"
            function update_annotation_and_remove_annotation_editor(annotation) { article = $.merge(annotation, article); $('#annotation', doc).html(article.annotation_html).show(); $('#annotation_editor', doc).remove(); $('#annotation a', doc).click(function() { doc.location.href = $(this).attr('href'); return false }) }
            $('div.annotation', doc).html(article.annotation_html);
            $('#annotation a', doc).click(function() { doc.location.href = $(this).attr('href'); return false });
            $('#annotation', doc).click(function(event) {
                var editor = '<div class="annotation" id="annotation_editor"><div class="editor_help">Type the annotation content using the <a href="http://en.wikipedia.org/wiki/BBCode" target="_new">bbcode markup</a> to format it or to insert links and images.</div><form id="annotation_form"><textarea id="edit_annotation" style="background-color: #ffff99; border: none;">'+(article.annotation ? article.annotation : '')+'</textarea><br /><input  id="save_annotation" type="submit" value="Save" />&nbsp;<input type="button" id="cancel_annotation" value="Cancel" /></form></div>';
                $(this).after(editor).hide();
                // win.scroll(0, event.pageY); // scroll window down to annotation
                $('#edit_annotation', doc).focus().keyup(function(e) {
                    if (e.which == 27) {
                        update_annotation_and_remove_annotation_editor(article); // pass article to revert rating
                        return false;
                    }
                });
                $('#annotation_form', doc).submit(function() {
                    var annotation = $('#edit_annotation', doc).val();
                    $.post(url_for('articles', pmid, 'annotation'), { 'value': annotation }, function(annotation) { update_annotation_and_remove_annotation_editor(annotation) }, 'json');
                    return false;
                });
                $('#cancel_annotation', doc).click(function() {
                    update_annotation_and_remove_annotation_editor(article); // pass article to revert rating
                    return false;
                });
            });


            // add "Folders"
            function update_folders(folders){
                folders.sort(
                    function (x,y) {
                        return x.title > y.title;
                    }
                );
                $('#folders', doc).show();
                $('#folders_list', doc).empty();
                $.each(folders, function(index, folder){
                    $('#folders_list', doc).append('<li class="folder" title="Click to see all articles in this folder" id="folder_'+folder.id+'">'+images.folder+'&nbsp;<span><a href="'+url_for('folders', folder.id, 'articles', 'redirect')+'">'+folder.title+'</a>&nbsp;<span class="folder_cmds" id="folder_'+folder.id+'_cmds"/></span></li>');
                });

                $('li.folder > span', doc).hover(
                    function(){
                        $('span.folder_cmds', this).html(images.toprated_articles_cmd+'&nbsp;'+images.favorite_articles_cmd+'&nbsp;'+images.work_articles_cmd+'&nbsp;'+images.read_articles_cmd);
                    },
                    function(){
                        $('span.folder_cmds', this).empty();
                    }
                );

                $('span.folder_cmds', doc).click(function(event) {
                    var folder_id = $(this).parent().parent().attr('id').replace('folder_', '');
                    var $target = $(event.target);
                    switch($target.attr('class')) {
                    case 'toprated_articles_cmd':
                        doc.location.href = url_for('folders', folder_id, 'articles', 'redirect');
                        break;
                    case 'favorite_articles_cmd':
                        doc.location.href = url_for('folders', folder_id, 'articles', 'redirect');
                        break;
                    case 'work_articles_cmd':
                        doc.location.href = url_for('folders', folder_id, 'articles', 'redirect');
                        break;
                    case 'read_articles_cmd':
                        doc.location.href = url_for('folders', folder_id, 'articles', 'redirect');
                        break;
                    }
                    return false;
                });
            }

            $('dd.abstract', doc).append('<div id="folders"><h2>Folders</h2><div id="select_folders">'+images.folder_page+'&nbsp;Click here to file this article into one or more folders</div><ul id="folders_list"></ul></div>');
            $('#select_folders', doc).click(function(event) {
                // win.scroll(0, event.pageY); // scroll window down to folders
                win.showModalDialog(url_for('articles', pmid, 'folders', 'dialog'), win, "dialogwidth: 800; dialogheight: 600; resizable: yes; scroll: yes;");
                $.get(url_for('articles', pmid, 'folders'), {}, function(folders) {
                    update_folders(folders);
                    }, 'json');
                return false;
            });
            if (article.file){
                update_folders(article.folders);
                // update article folders in case folders and deleted or renamed
                $('#folder_command_tab', doc).unbind('click').click(function(){
                    win.showModalDialog(url_for('folders', 'dialog'), win, "dialogwidth: 800; dialogheight: 600; resizable: yes; scroll: yes;");
                    $.get(url_for('articles', pmid, 'folders'), {}, function(folders) {
                        update_folders(folders);
                    }, 'json');
                    return false;
                });
            } else {
                $('#folders', doc).hide();
            }

            // add "Forum"
            /*
                $('dd.abstract', doc).append('<div id="discussions"><h2>Discussions</h2><p id="add_discussion"></p><ul id="discussions_list"></ul></div>');
                function update_discussions(topics){
                    $('#discussions', doc).empty();
                    $.each(topics, function(index, topic){
                        $('#topics_list', doc).append('<li class="topic" id="topic_'+topic.id+'">' +
                                                 '<a title="'+topics.title+'" href="#">'+topic.title+'</a>' +
                                                 '</li>');
                   });
                }
               update_discussions(article.topics);
*/
        }, 'json');
    }
}
