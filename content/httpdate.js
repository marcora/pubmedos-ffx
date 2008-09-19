function http_date(date) {
    // return a date formatted appropriately for HTTP Date header
    // adapted from <http://code.google.com/p/s3js>

    // use now as default date/time
    if (!date) date = new Date();

    // date abbreviations
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    function year(date) {
        var x = date.getYear();
        var y = x % 100;
        y += (y < 38) ? 2000 : 1900;
        return y;
    }

    // number padding function
    function zeropad(num, sz) {
        return ( (sz - (""+num).length) > 0 ) ? arguments.callee("0"+num, sz) : num;
    }

    function gmt_tz(date) {
        // Difference to Greenwich time (GMT) in hours
        var os = Math.abs(date.getTimezoneOffset());
        var h = ""+Math.floor(os/60);
        var m = ""+(os%60);
        h.length == 1? h = "0"+h:1;
        m.length == 1? m = "0"+m:1;
        return date.getTimezoneOffset() < 0 ? "+"+h+m : "-"+h+m;
    }

    var s;
    s  = days[date.getDay()] + ", ";
    s += date.getDate() + " ";
    s += months[date.getMonth()] + " ";
    s += year(date) + " ";
    s += zeropad(date.getHours(), 2) + ":";
    s += zeropad(date.getMinutes(), 2) + ":";
    s += zeropad(date.getSeconds(), 2) + " ";
    s += gmt_tz(date);

    return s;
}
