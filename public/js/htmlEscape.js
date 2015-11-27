function htmlEscape(text) {
    var pattern = /[<>"&]/g;
    return text.replace(pattern, function(match, pos, originalText) {
        switch(match) {
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case "&":
                return "&amp;";
            case "\"":
                return "&quot;";
        }
    });
}