var cachePY = {};

function categorias(cat, direccion) {
    if (cat) {
        if (cat == -1) {
            document.location.href = '/';
        } else {
            document.location.href = direccion + cat + '/';
        }
    }
}

var accentMap = {
    "á": "a",
    "ö": "o"
};
var normalize = function(term) {
    var ret = "";
    for (var i = 0; i < term.length; i++) {
        ret += accentMap[term.charAt(i)] || term.charAt(i);
    }
    return ret;
};

$(function() {
    $('#slideshow').before('<div id="nav" class="nav">').cycle({
        /*fx:     'scrollDown', 
        easing: 'easeOutBounce', 
        delay:  -2000 , turnDown*/
        fx: 'scrollHorz',
        speed: 1200,
        timeout: 6000,
        pager: '#nav',
        next: '.nexts',
        prev: '.prevs',
        rev: true
        //before: function() { if (window.console) console.log(this.src); }
    });

    jQuery("#slideshow .imagenes, .corredor .nexts,  .corredor .prevs").hover(function() {
        //alert("flechas");
        jQuery(".corredor .nexts, .corredor .prevs").addClass("despliega");

    }, function() {
        jQuery(".corredor .nexts, .corredor .prevs").removeClass("despliega");
    });
    $.widget("custom.pymoviecomplete", $.ui.autocomplete, {
        _renderMenu: function(ul, items) {
            var that = this,
                currentCategory = "";
            $.each(items, function(index, item) {
                if (item.category != currentCategory) {
                    ul.append("<li class='ui-autocomplete-category " + item.category + "'>" + item.category + "</li>");
                    currentCategory = item.category;
                }
                that._renderItemData(ul, item);
            });
        }
    });

    var video = {
        "Peliculas": "/pelicula/",
        "Series": "/VerSerie/",
        "Documentales": "/Documental/"
    }
    jQuery("#ffbuscar").keypress(function(e) {
        if (e.which == 13) e.preventDefault()
    });
    jQuery("#ffbuscar").focus(function() {
        jQuery(this).val("");
    });

    jQuery("#ffbuscar").pymoviecomplete({
        minLength: 3,
        source: function(request, response) {
            if (request.term in cachePY) {
                response(cachePY[request.term]);
                return;
            }
            jQuery.ajax({
                url: "/estatico/plantillas/js/json.js",
                //url: "/json",
                dataType: "json",


                success: function(data) {
                    var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
                    var array = $.grep(data, function(value) {
                        value = value.label || value.value || value;
                        return matcher.test(value) || matcher.test(normalize(value));
                    });
                    array.length > 0 ? array : array = {
                        "category": "",
                        "label": "No se encontraron resultados"
                    };
                    cachePY[request.term] = array;
                    response(array);
                }
            });
        },
        select: function(event, ui) {

            document.location.href = video[ui.item.category]!=undefined? video[ui.item.category] + ui.item.label + '/':"/";
            return false;
        }
    });



});
