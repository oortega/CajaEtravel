jQuery(document).ready(function() {

    CambiaPestanas('.etWContainer .etWtabs a', 'active', '.etWContainer .etWforms .form');
    //Configuraciones generales para los calendarios

    if ($("#formahotel").length === 1) DefVar("#formahotel");
    else DefVar("#formapackage");
    // Se crea evento para ejecutar funciones despues que muestra el calendario
    $.datepicker._updateDatepicker_original = $.datepicker._updateDatepicker;
    $.datepicker._updateDatepicker = function(inst) {
        $.datepicker._updateDatepicker_original(inst);
        var afterShow = this._get(inst, 'afterShow');
        if (afterShow)
            afterShow.apply((inst.input ? inst.input[0] : null)); // trigger custom callback
    }

    jQuery(".EtDateFromGN").datepicker({
        dateFormat: FormatO,
        numberOfMonths: 2,
        showButtonPanel: true,
        minDate: 0,
        maxDate: "+1y",
        beforeShowDay: RangoDias,
        beforeShow: function(input, ins) {
            if ($(input).data("oldDate") == undefined) $(input).data("oldDate", input.value)
        },
        onClose: function(dateText, inst) {
            if ($(this).data("oldDate") != dateText) {
                $(this).data("oldDate", dateText);
                $(this).parents("form").find(".EtDateToGN").datepicker("show");
            }
        },
        onSelect: OnSelectDate
    });
    jQuery(".EtDateToGN").datepicker({
        dateFormat: FormatO,
        numberOfMonths: 2,
        showButtonPanel: true,
        minDate: +1,
        maxDate: "+1y +1d",
        beforeShowDay: RangoDias,
        beforeShow: function() {
            var form = $(this).parents("form");
            if (form[0].id == "formahotel" || form[0].id == "formapackage") {
                var fromDate = form.find(".EtDateFromGN").datepicker("getDate");
                var toMaxDate = addDate(fromDate, eTMaxDays, 'd');
                return {
                    "maxDate": toMaxDate
                };
            }
        },
        afterShow: NumeroNoches,
        onSelect: OnSelectDate
    });
    DefaultDate();
    jQuery("body").on("mouseenter", "#ui-datepicker-div td a", NumeroNochesHover);
    jQuery("body").on("mouseleave", "#ui-datepicker-div td a", function() {
        var idform = $.datepicker._curInst.input.parents("form").attr("id");
        if ((idform == "formahotel") || (idform == "formapackage")) //Validamos que solo se aplique al formulario de hotel y paquete
        {
            jQuery(".Noches").text(noches + " Noches");
        }

    });

    /*Termina Calendarios*/
    ResetAll();

    // Pasa el valor del select al span
    jQuery(".etWContainer").find(".etWSelect select").change(function() {
        jQuery(this).next("span").text(jQuery(this).find("option:selected").text());
    }).change(); // para que lo ejecute cuando se cargue la pagina


    // Config de form hoteles
    if ($("#formahotel").length === 1) {
        jQuery('#formahotel').submit(function() {
            var v1 = ValidateHotel('formahotel', 'EtDestinyHtl', MsjDestinO, AltMsjDestinO);
            if (v1) {
                cleanSubmit(this);
            } else {
                return false;
            };

        });
        changeFocus("#EtDestinyHtl", MsjDestinO);

        jQuery("#formahotel .rm select").change(function() {
            changeRoom('#formahotel', '')
        });
        jQuery("#Room1 select[name=ch1]").change(function() {
            setAgeC(1, '')
        });
        jQuery("#Age1 select").change(function() {
            setAgeCI('', 1)
        });
        jQuery("#Room2 select[name=ch2]").change(function() {
            setAgeC(2, '')
        });
        jQuery("#Age2 select").change(function() {
            setAgeCI('', 2)
        });
        jQuery("#Room3 select[name=ch3]").change(function() {
            setAgeC(3, '')
        });
        jQuery("#Age3 select").change(function() {
            setAgeCI('', 3)
        });
        //autocompletado Hotel
        jQuery("#EtDestinyHtl").autocomplete({
            minLength: 3,
            source: function(request, response) {
                if (request.term in cacheDH) {
                    response(cacheDH[request.term]);
                    return;
                }
                jQuery.ajax({
                    url: "http://ajax.e-tsw.com/searchservices/getSearchJson.aspx",
                    dataType: "jsonp",
                    jsonpCallback: "ETSHotel",
                    data: {
                        Lenguaje: IDioMA,
                        ItemTypes: "D:5,H:5",
                        Filters: "",
                        PalabraBuscada: request.term
                    },
                    success: function(data) {
                        if (data.totalResultsCount == 0) {
                            data.results = [{
                                Label: MsjNoResults,
                                Type: null
                            }]; // Cuando no hay resultados agrega este item para que muestre el mensaje en el autocomplete
                        }
                        cacheDH[request.term] = data.results;
                        response(data.results);
                    }
                });
            },
            select: function(event, ui) {
                if (!ui.item.Type) {
                    jQuery(this).val(""); // Cuando no hay resultados solo limpia la entrada
                    return false;
                }

                jQuery("#Etdt").val(ui.item.TypeID);
                if (ui.item.Type == "H") {
                    jQuery("#EtHt").val(ui.item.TypeID);
                    jQuery("#formahotel").attr('action', 'http://www.e-tsw.com.mx/Hoteles/Tarifas');
                } else {
                    jQuery("#EtHt").val("");
                    jQuery("#formahotel").attr('action', 'http://www.e-tsw.com.mx/Hoteles/Lista');
                }
                jQuery("#EtCt").val(ui.item.Country);
                jQuery("#formahotel .EtDateFromGN").focus();
                inputText = ui.item.Label;
                jQuery(this).val(ui.item.Label);
                return false;
            }
        }).data("ui-autocomplete")._renderMenu = function(ul, items) {
            var self = this,
                currentCategory = "";
            $.each(items, function(index, item) {
                var encabezado = "";
                if (item.Type == "D") {
                    encabezado = '<img src="http://www.e-tsw.com.mx/_lib/kvista/img/general/destinos_bg_' + IDioMA + '.png" alt="Destinos"/>';
                } else {
                    encabezado = '<img src="http://www.e-tsw.com.mx/_lib/kvista/img/general/hoteles_bg_' + IDioMA + '.png" alt="Hoteles"/>';
                }
                if (item.Type && item.Type != currentCategory) { // si hay resultados y si es otra categoía imprime los resultados
                    ul.append("<li class='ui-autocomplete-category'>" + encabezado + "</li>");
                    currentCategory = item.Type;
                }
                self._renderItemData(ul, item);
            });
        }
        jQuery("#EtDestinyHtl").data("ui-autocomplete")._renderItem = function(ul, item) {
            return jQuery("<li>")
                .data("item.autocomplete", item)
                .append(jQuery("<a>").text(item.Label))
                .appendTo(ul);
        }
    }
    // Config de form paquetes
    if ($("#formapackage").length === 1) {

        jQuery("#formapackage").submit(function() {
            var v1 = ValidateFLPK('formapackage', 'dn');
            var v2 = restrictPack8People();
            if (v1 && v2) {
                cleanSubmit(this);
            } else {
                return false;
            }

        });
        jQuery("#formapackage .rm select").change(function() {
            changeRoom('#formapackage', 'Pk')
        });
        jQuery("#RoomPk1 select[name=ch1]").change(function() {
            setAgeC(1, 'Pk')
        });
        jQuery("#AgePk1 select").change(function() {
            setAgeCI('Pk', 1)
        });
        jQuery("#RoomPk2 select[name=ch2]").change(function() {
            setAgeC(2, 'Pk')
        });
        jQuery("#AgePk2 select").change(function() {
            setAgeCI('Pk', 2)
        });
        jQuery("#RoomPk3 select[name=ch3]").change(function() {
            setAgeC(3, 'Pk')
        });
        jQuery("#AgePk3 select").change(function() {
            setAgeCI('Pk', 3)
        });
        changeFocus("#EtCityOrig,#EtDestinyPkl", MsjAirport);
        //autocompletado origen paquetes
        jQuery("#EtCityOrig").autocomplete({
            minLength: 3,
            source: function(request, response) {
                if (request.term in cachePQ) {
                    response(cachePQ[request.term]);
                    return;
                }
                jQuery.ajax({
                    url: "http://ajax.e-tsw.com/searchservices/getSearchJson.aspx",
                    dataType: "jsonp",
                    jsonpCallback: "ETSPaquetes",
                    data: {
                        Lenguaje: IDioMA,
                        ItemTypes: "A:10",
                        Filters: "",
                        PalabraBuscada: request.term
                    },
                    success: function(data) {
                        if (data.totalResultsCount == 0) {
                            data.results = [{
                                Label: MsjNoResults,
                                Type: null
                            }]; // Cuando no hay resultados agrega este item para que muestre el mensaje en el autocomplete
                        }
                        cachePQ[request.term] = data.results;
                        response(data.results);
                    }
                });
            },
            select: function(event, ui) {
                if (!ui.item.Type) {
                    jQuery(this).val(""); // Cuando no hay resultados solo limpia la entrada
                    return false;
                }
                jQuery("#EtCityOrig").val(ui.item.Label);
                jQuery("#EtIATAob").val(ui.item.TypeID);
                inputText = ui.item.Label;
                jQuery("#EtDestinyPkl").focus();
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function(ul, item) {
            return jQuery("<li>")
                .data("item.autocomplete", item)
                .append(jQuery("<a>").text(item.Label))
                .appendTo(ul);
        };
        //autocompletado destino paquetes
        jQuery("#EtDestinyPkl").autocomplete({
            minLength: 3,
            source: function(request, response) {
                if (request.term in cacheD) {
                    response(cacheD[request.term]);
                    return;
                }
                jQuery.ajax({
                    // Callback - JSONP
                    url: "http://ajax.e-tsw.com/searchservices/getSearchJson.aspx",
                    dataType: "jsonp",
                    jsonpCallback: "ETSPaquetes",
                    data: {
                        Lenguaje: IDioMA,
                        ItemTypes: "P:10",
                        Filters: "",
                        PalabraBuscada: request.term
                    },
                    success: function(data) {
                        if (data.totalResultsCount == 0) {
                            data.results = [{
                                Label: MsjNoResults,
                                Type: null
                            }]; // Cuando no hay resultados agrega este item para que muestre el mensaje en el autocomplete
                        }
                        cacheD[request.term] = data.results;
                        response(data.results);
                    }
                });
            },
            select: function(event, ui) {
                if (!ui.item.Type) {
                    jQuery(this).val(""); // Cuando no hay resultados solo limpia la entrada
                    return false;
                }
                jQuery("#EtDestinyPkl").val(ui.item.Label);
                jQuery("#EtdtPk").val(ui.item.TypeID.split("|")[1]);
                jQuery("#EtIATds").val(ui.item.TypeID.split("|")[0]);
                inputText = ui.item.Label;
                jQuery("#formapackage .EtDateFromGN").focus();
                return false;
            },
        }).data("ui-autocomplete")._renderItem = function(ul, item) {
            return jQuery("<li>")
                .data("item.autocomplete", item)
                .append(jQuery("<a>").text(item.Label))
                .appendTo(ul);
        };

    }
    // Config de form vuelos
    if ($("#formaflight").length === 1) {
        jQuery("#formaflight").submit(function() {
            var v1 = ValidateFLPK('formaflight', 'ni');
            if (!v1) {
                return false;
            };
        });
        changeFocus("#EtCityOrigFL,#EtDestinyFL", MsjAirport);
        jQuery("#EtFType").change(function() {
            if (jQuery(this).val() == "round") {
                jQuery("#formaflight .EtDateToGN").parent().show();
                jQuery("#formaflight .EtDateFromGN").datepick("option", {
                    onDate: RangoDias
                });
            } else {
                jQuery("#formaflight .EtDateToGN").parent().hide();
                jQuery("#formaflight .EtDateFromGN").datepick("option", {
                    onDate: null
                });
            }
        });
        jQuery("#RoomFL1 select[name=ch1]").change(function() {
            setAgeC(1, 'FL')
        });
        jQuery("#AgeFL1 select").change(function() {
            setAgeCI('FL', 1)
        });

        //autocompletado origen vuelos
        jQuery("#EtCityOrigFL").autocomplete({
            minLength: 3,
            source: function(request, response) {
                if (request.term in cachePQ) {
                    response(cachePQ[request.term]);
                    return;
                }
                jQuery.ajax({

                    url: "http://ajax.e-tsw.com/searchservices/getSearchJson.aspx",
                    dataType: "jsonp",
                    jsonpCallback: "ETSVuelos",
                    data: {
                        Lenguaje: IDioMA,
                        ItemTypes: "A:10",
                        Filters: "",
                        PalabraBuscada: request.term
                    },
                    success: function(data) {
                        if (data.totalResultsCount == 0) {
                            data.results = [{
                                Label: MsjNoResults,
                                Type: null
                            }]; // Cuando no hay resultados agrega este item para que muestre el mensaje en el autocomplete
                        }
                        cachePQ[request.term] = data.results;
                        response(data.results);
                    }
                });
            },
            select: function(event, ui) {
                if (!ui.item.Type) {
                    jQuery(this).val(""); // Cuando no hay resultados solo limpia la entrada
                    return false;
                }
                jQuery("#EtCityOrigFL").val(ui.item.Label);
                jQuery("#EtIATAobFl").val(ui.item.TypeID);
                inputText = ui.item.Label;
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function(ul, item) {
            return jQuery("<li></li>")
                .data("item.autocomplete", item)
                .append(jQuery("<a></a>, ").text(item.Label))
                .appendTo(ul);
        };
        //autocompletado destino vuelos
        jQuery("#EtDestinyFL").autocomplete({
            minLength: 3,
            source: function(request, response) {
                if (request.term in cachePQ) {
                    response(cachePQ[request.term]);
                    return;
                }
                jQuery.ajax({

                    url: "http://ajax.e-tsw.com/searchservices/getSearchJson.aspx",
                    dataType: "jsonp",
                    jsonpCallback: "ETSVuelos",
                    data: {
                        PalabraBuscada: request.term,
                        Lenguaje: IDioMA,
                        ItemTypes: "A:10",
                        Filters: "",

                    },
                    success: function(data) {
                        if (data.totalResultsCount == 0) {
                            data.results = [{
                                Label: MsjNoResults,
                                Type: null
                            }]; // Cuando no hay resultados agrega este item para que muestre el mensaje en el autocomplete
                        }
                        cachePQ[request.term] = data.results;
                        response(data.results);
                    }
                });
            },
            select: function(event, ui) {
                if (!ui.item.Type) {
                    jQuery(this).val(""); // Cuando no hay resultados solo limpia la entrada
                    return false;
                }
                jQuery("#EtDestinyFL").val(ui.item.Label);
                jQuery("#EtIATAibFl").val(ui.item.TypeID);
                inputText = ui.item.Label;
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function(ul, item) {
            return jQuery("<li></li>")
                .data("item.autocomplete", item)
                .append(jQuery("<a></a>, ").text(item.Label))
                .appendTo(ul);
        };
    }
    // Config de form autos

    if ($("#formacar").length === 1) {
        jQuery('#formacar').submit(function() {
            var v1 = ValidateHotel('formacar', 'cityco', MsjDestinO, AltMsjDestinO);
            var v2 = restrictCar30Days();
            var v3 = restrictCar24Hours();
            if (v1 == false || v2 == false || v3 == false) {
                return false;
            }

        });
        //autocompletado origen autos
        jQuery("#cityco").autocomplete({
            minLength: 3,
            source: function(request, response) {
                if (request.term in cacheA) {
                    response(cacheA[request.term]);
                    return;
                }
                jQuery.ajax({
                    url: "http://ajax.e-tsw.com/searchservices/getSearchJson.aspx",
                    dataType: "jsonp",
                    jsonpCallback: "ETSAutos",
                    data: {
                        Lenguaje: IDioMA,
                        ItemTypes: "R:10",
                        Filters: "",
                        PalabraBuscada: request.term
                    },
                    success: function(data) {
                        if (data.totalResultsCount == 0) {
                            data.results = [{
                                Label: MsjNoResults,
                                Type: null
                            }]; // Cuando no hay resultados agrega este item para que muestre el mensaje en el autocomplete
                        }
                        cacheA[request.term] = data.results;
                        response(data.results);
                    }
                });
            },
            select: function(event, ui) {
                if (!ui.item.Type) {
                    jQuery(this).val(""); // Cuando no hay resultados solo limpia la entrada
                    return false;
                }
                jQuery("#cityco").val(ui.item.Label);
                jQuery("#pu").val(ui.item.TypeID);
                jQuery("#cityib").val(ui.item.Label);
                jQuery("#do").val(ui.item.TypeID);
                inputText = ui.item.Label;
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function(ul, item) {
            return jQuery("<li></li>")
                .data("item.autocomplete", item)
                .append(jQuery("<a></a>, ").text(item.Label))
                .appendTo(ul);

        };


        //autocompletado destino autos
        jQuery("#cityib").autocomplete({
            minLength: 3,
            source: function(request, response) {
                if (request.term in cacheA) {
                    response(cacheA[request.term]);
                    return;
                }
                jQuery.ajax({
                    url: "http://ajax.e-tsw.com/searchservices/getSearchJson.aspx",
                    dataType: "jsonp",
                    jsonpCallback: "ETSAutos",
                    data: {
                        Lenguaje: IDioMA,
                        ItemTypes: "R:10",
                        Filters: "",
                        PalabraBuscada: request.term
                    },
                    success: function(data) {
                        if (data.totalResultsCount == 0) {
                            data.results = [{
                                Label: MsjNoResults,
                                Type: null
                            }]; // Cuando no hay resultados agrega este item para que muestre el mensaje en el autocomplete
                        }
                        cacheA[request.term] = data.results;
                        response(data.results);
                    }
                });
            },
            select: function(event, ui) {
                if (!ui.item.Type) {
                    jQuery(this).val(""); // Cuando no hay resultados solo limpia la entrada
                    return false;
                }
                jQuery("#cityib").val(ui.item.Label);
                jQuery("#do").val(ui.item.TypeID);
                inputText = ui.item.Label;
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function(ul, item) {
            return jQuery("<li></li>")
                .data("item.autocomplete", item)
                .append(jQuery("<a></a>, ").text(item.Label))
                .appendTo(ul);
        };
        //Calendarios
        jQuery("#formacar .EtDateFromGN").datepicker("option", {
            minDate: 1
        });
        jQuery("#formacar .EtDateToGN").datepicker("option", {
            minDate: +2
        });
    }
    // Config de form tours
    if ($("#formatour").length === 1) {
        jQuery('#formatour').submit(function() {
            return (ValidateDate('formatour'));
        });
        //Calendarios
        jQuery("#formatour .EtDateFromGN").datepicker("option", {
            beforeShowDay: null
        }); //,onDate:null
        changeFocus("#formacar input[name=nu],#formacar input[name=no]", MsjDestinO);
    }
    // Config de form traslados
    if ($("#formatransfer").length === 1) {
        jQuery('#formatransfer').submit(function() {
            return (ValidateHotel('formatransfer', 'EtHotel', FalseHotel, MsjHotel));
        });
        changeFocus("#EtHotel", FalseHotel);
        jQuery("#EtTypeId").change(function() {
            if (jQuery(this).val() == "R") {
                jQuery("#formatransfer .EtDateToGN").parent().show();
                jQuery("#formatransfer .EtDateFromGN").parent().show();
                jQuery("#formatransfer .EtDateFromGN,#formatransfer .EtDateToGN ").datepicker("option", {
                    beforeShowDay: RangoDias
                });
            }
            if (jQuery(this).val() == "L") {
                jQuery("#formatransfer .EtDateToGN").parent().hide();
                jQuery("#formatransfer .EtDateFromGN").parent().show();
                jQuery("#formatransfer .EtDateFromGN,#formatransfer .EtDateToGN ").datepicker("option", {
                    beforeShowDay: null
                });
            }
            if (jQuery(this).val() == "S") {
                jQuery("#formatransfer .EtDateToGN").parent().show();
                jQuery("#formatransfer .EtDateFromGN").parent().hide();
                jQuery("#formatransfer .EtDateFromGN,#formatransfer .EtDateToGN ").datepicker("option", {
                    beforeShowDay: null
                });
            }
        });
        //autocompletado traslado
        jQuery("#EtHotel").autocomplete({
            minLength: 3,
            source: function(request, response) {
                if (request.term in cacheT) {
                    response(cacheT[request.term]);
                    return;
                }
                jQuery.ajax({
                    url: "http://ajax.e-tsw.com/searchservices/getSearchJson.aspx",
                    dataType: "jsonp",
                    jsonpCallback: "ETSTraslados",
                    data: {

                        PalabraBuscada: request.term,
                        Lenguaje: IDioMA,
                        ItemTypes: "H:10",
                        Filters: "S|1"

                    },
                    success: function(data) {
                        if (data.totalResultsCount == 0) {
                            data.results = [{
                                Label: MsjNoResults,
                                Type: null
                            }]; // Cuando no hay resultados agrega este item para que muestre el mensaje en el autocomplete
                        }
                        cacheT[request.term] = data.results;
                        response(data.results);
                    }
                });
            },
            select: function(event, ui) {
                if (!ui.item.Type) {
                    jQuery(this).val(""); // Cuando no hay resultados solo limpia la entrada
                    return false;
                }
                jQuery("#EtHotel").val(ui.item.Label);
                jQuery("#EtHotelId").val(ui.item.TypeID);
                jQuery("#EtCountryId").val(ui.item.Country);
                inputText = ui.item.Label;
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function(ul, item) {
            return jQuery("<li></li>")
                .data("item.autocomplete", item)
                .append(jQuery("<a></a>, ").text(item.Label))
                .appendTo(ul);
        };

        jQuery("#EtTypeId").change(function() {
            jQuery("#EtType").val(jQuery(this).children("option:selected").html());

        }).change();
        //Calendarios
        jQuery("#formatransfer .EtDateFromGN").datepicker("option", {
            minDate: 2
        });
        jQuery("#formatransfer .EtDateToGN").datepicker("option", {
            minDate: 3
        });
    }

    jQuery(window).unload(function() {
        jQuery(".etWContainer").find("[name*=ad],[name*=ac],[name*=ch]").prop("disabled", false)
    });
    //Modificar el foco

});

/*VARIABLES*/
var eTMaxDays = 29;
var MsjAirport, altMsjAirport, altMsjAirportr, altMsjDate, NFOrigen, NFDestino, PosadaAllIclusive, FalseHotel, FormatO, MsjAllInclusive, MsjHotel, Msj45Days, MsjMinTimeCar, MsjMaxTimeCar, IDioMA, MsjDestinO = {}, inicionoches = 0,
    noches = 0,
    inputText = "";
var cachePQ = {};
var cacheDH = {};
var cacheD = {};
var cacheT = {};
var cacheA = {};

/*Funciones para los calendarios*/

function DefVar(obj) {
    if (jQuery(obj + " input[name=ln]").val().toUpperCase() == "ESP") {
        MsjDestinO = "Especifique una ciudad";
        AltMsjDestinO = "Por favor especifique una ciudad";
        MsjAirport = "Escriba el nombre de la ciudad";
        altMsjAirport = "Por favor seleccione un aeropuerto de origen.";
        altMsjAirportr = "Por favor seleccione un aeropuerto de llegada.";
        altMsjDate = "Debe Seleccionar una";
        NFOrigen = "Por favor seleccione un aeropuerto de origen.";
        NFDestino = "Por favor seleccione un aeropuerto de destino."
        PosadaAllIclusive = "Puede seleccionar como m\u00E1ximo 4 personas por habitaci\u00F3n.";
        FormatO = "dd/mm/yy";
        MsjAllInclusive = "M\u00E1ximo 4 personas por habitaci\u00F3n, incluyendo ni\u00F1os.";
        FalseHotel = "Nombre del hotel";
        MsjHotel = "Especifique un hotel por favor.";
        Msj45Days = "No se pueden reservar m\u00E1s de 45 d\u00edas.";
        MsjMinTimeCar = "La fecha y hora de devoluci\u00F3n no puede ser menor a 24 horas a partir de la fecha de reservaci\u00F3n.";
        MsjMaxTimeCar = "La fecha y hora de devoluci\u00F3n no puede ser mayor a 30 días a partir de la fecha de reservaci\u00F3n.";
        MsjMaxPeoplePack = "El n\u00famero m\u00e1ximo permitido por reservaci\u00f3n es de 8 personas, por favor corrija e intente nuevamente su b\u00fasqueda";
        MsjNoResults = "No se encontraron resultados";
        IDioMA = "esp";
    }
    if (jQuery(obj + " input[name=ln]").val().toUpperCase() == "POR") {
        MsjDestinO = "Introduza uma cidade";
        AltMsjDestinO = "Por favor introduza uma cidade";
        MsjAirport = "Cidade ou Aeroporto";
        altMsjAirport = "Por favor seleccione um aeroporto de partida.";
        altMsjAirportr = "Por favor seleccione um aeroporto de chegada.";
        altMsjDate = "Vocꡤeve selecionar uma data";
        NFOrigen = "Digite o aeroporto de partida.";
        NFDestino = "Especificar Retorno aeroporto";
        PosadaAllIclusive = "Voc\u00EA deve selecionar at\u00E9 quatro pessoas por quarto.";
        FormatO = "dd/mm/yy";
        MsjAllInclusive = "M\u00E1ximo de 4 pessoas por quarto, incluindo crian\u00E7as.";
        FalseHotel = "Por favor, seleccione um hotel";
        MsjHotel = "Please select a hotel.";
        Msj45Days = "Voc\u00ea n\u00e3o pode reservar mais de 45 dias";
        MsjMinTimeCar = "A data e hora de retorno n\u00e3o pode ser inferior a 24 horas ap\u00F3s a data da reserva.";
        MsjMaxTimeCar = "A data e hora de retorno n\u00e3o pode ser superior a 30 dias ap\u00F3s a data da reserva.";
        MsjMaxPeoplePack = "O n\u00famero m\u00e1ximo permitido por reserva \u00e9 de 8 pessoas, por favor, corrija e tente novamente a sua pesquisa";
        MsjNoResults = "Nenhum resultado foi encontrado";
        IDioMA = "por";
    }
    if (jQuery(obj + " input[name=ln]").val().toUpperCase() == "ING") {
        MsjDestinO = "Enter a city";
        AltMsjDestinO = "Please enter a city";
        MsjAirport = "Enter the name of the city";
        altMsjAirport = "Please enter the name of the city.";
        altMsjAirportr = "Please select an arrival airport.";
        altMsjDate = "Please select a date";
        NFOrigen = "Enter the departure airport.";
        NFDestino = "Specify airport Return";
        PosadaAllIclusive = "You must select up to four people per room.";
        FormatO = "mm/dd/yy";
        MsjAllInclusive = "Maximum 4 persons per room, including children.";
        FalseHotel = "Hotel name";
        MsjHotel = "Please enter a hotel name";
        Msj45Days = "You can not book more than 45 days";
        MsjMinTimeCar = "The date and time of return can not be less than 24 hours after the reservation date.";
        MsjMaxTimeCar = "The date and time of return can not be greater than 30 days from the reservation date.";
        MsjMaxPeoplePack = "The maximum number allowed per reservation is 8 people, please correct and try your search again";
        MsjNoResults = "No results were found";
        IDioMA = "ing";
    }
}

function _normaliseDate(date) {
    if (date) {
        date.setHours(12, 0, 0, 0);
    }
    return date;
}
// Funcion para sumar Fechas

function addDate(date, amount, period) {
    if (period == 'd' || period == 'w') {
        this._normaliseDate(date);
        date.setDate(date.getDate() + amount * (period == 'w' ? 7 : 1));
    } else {
        var year = date.getFullYear() + (period == 'y' ? amount : 0);
        var month = date.getMonth() + (period == 'm' ? amount : 0);
        date.setTime(plugin.newDate(year, month + 1,
            Math.min(date.getDate(), this.daysInMonth(year, month + 1))).getTime());
    }
    return date;
}

function DefaultDate() {

    //Fechas Default en Calendarios
    var defaultDate = new Date(); // Obtiene la fecha 
    defaultDate = addDate(defaultDate, '+7', 'd'); // Le suma 7 días
    jQuery(".EtDateFromGN").datepicker("setDate", defaultDate);
    defaultDate = addDate(defaultDate, '+2', 'd'); // Le suma 2 día
    jQuery(".EtDateToGN").datepicker("setDate", defaultDate);
}

//Suma o resta fechas segun al calendario que se le da click

function OnSelectDate(dateSel) {
    var formId = jQuery(this).parents("form").attr('id');
    var dtClass = jQuery(this).attr('class');
    var dateFromInput = jQuery("#" + formId + " .EtDateFromGN");
    var dateToInput = jQuery("#" + formId + " .EtDateToGN");
    var newdate, dateFrom, dateTo;

    //ESTA SECCIÓN IDENTIFICA A QUE CALENDARIO SE LE DA CLICK
    if (dtClass.indexOf('EtDateFromGN') >= 0) {
        dateFrom = jQuery(this).datepicker("getDate");
        dateTo = dateToInput.datepicker("getDate");
        var daysDiff = Math.ceil((dateTo - dateFrom) / 864e5);
        newdate = addDate(dateFrom, '+2', 'd'); //Nueva fecha para el input EtDateToGN
        if (dateFrom >= dateTo || daysDiff > eTMaxDays) {
            dateToInput.datepicker("setDate", newdate);
        } // Asignamos el nuevo valor al input EtDateToGN
    } else {
        dateFrom = dateFromInput.datepicker("getDate");
        dateTo = jQuery(this).datepicker("getDate");
        newdate = addDate(dateTo, '-1', 'd'); //Nueva fecha para el input EtDateFromGN
        if (dateTo <= dateFrom) {
            dateFromInput.datepicker("setDate", newdate);
        } // Asignamos el nuevo valor al input EtDateFromGN      
    }
}

// Asigna clases para el  sombreado del inicio y fin de una reservacion

function RangoDias(date) {
    var clase = "";
    var titulo = "";
    var forma = jQuery(this).parents("form").attr('id');
    var inicio = jQuery('#' + forma + ' .EtDateFromGN').datepicker("getDate");
    var fin = jQuery('#' + forma + ' .EtDateToGN').datepicker("getDate");
    //Se convierte todo a milisegundos
    date = date.getTime();
    inicio = inicio.getTime();
    if (fin == null) {
        fin = 0;
    } else {
        fin = fin.getTime();
    }
    //Se agregan las clases para la reservacion
    if (date > inicio && date < fin) {
        clase = "selectedDay";
        titulo = "Día de estancia";
    } else if (date == inicio) {
        clase = "selectedFrom";
        titulo = "Día de ida";
    } else if (date == fin) {
        clase = "selectedTo";
        titulo = "Día de regreso";
    }
    return [true, clase, titulo]
}
//Muestra numero de noches de las fechas seleccionadas

function NumeroNoches(date) {
    jQuery(".Noches").remove();

    var Formanoches = jQuery(this).parents("form").attr('id');
    if ((Formanoches == "formahotel") || (Formanoches == "formapackage")) {

        var fin = jQuery('#' + Formanoches + ' .EtDateToGN').datepicker("getDate").getTime();
        inicionoches = jQuery('#' + Formanoches + ' .EtDateFromGN').datepicker("getDate").getTime();

        noches = Math.ceil((fin - inicionoches) / 864e5);

        jQuery(".ui-datepicker-close").before("<span class='Noches' >" + noches + " Noches</span>");
    }
    /* Inicia Fix para la navegación de los meses */

    function fixMonthsNavigation() {
        if (!$.datepicker._lastInput)
            $.datepicker._lastInput = $.datepicker._curInst.input[0];
    }
    $(".ui-datepicker-next, .ui-datepicker-prev").off("mousedown", fixMonthsNavigation);
    $(".ui-datepicker-next, .ui-datepicker-prev").on("mousedown", fixMonthsNavigation);
    /* Termina Fix */
}
//Muestra numero de noches al pocisionar el mouse sobre un dia

function NumeroNochesHover() {

    var idform = $.datepicker._curInst.input.parents("form").attr("id");
    if ((idform == "formahotel") || (idform == "formapackage")) {
        var datehover = $(this).parent().data(), //Se obtiene mes y año del dia seleccionado
            diahover = parseInt($(this).html());
        var fechahover = new Date(datehover.year, datehover.month, diahover);
        fechahover = fechahover.getTime();
        fechahover = Math.ceil((fechahover - inicionoches) / 864e5);

        if (fechahover > 0) {
            $(".Noches").text(fechahover + " Noches");
        } else {
            jQuery(".Noches").text(noches + " Noches");
        }
    }



}

function ValidateDate(forma) {
    if (jQuery('#' + forma + ' .EtDateFromGN').val() == "" || jQuery('#' + forma + ' .EtDateToGN').val() == "") {
        alert(altMsjDate);
        return (false);
    }
}
/*Termina Calendarios*/

/*Funciones Generales */

//Función de cambio de pestaña

function CambiaPestanas(objeto, clase, contenedores) {
    jQuery(objeto).click(function() {
        jQuery(objeto).removeClass(clase);
        jQuery(this).addClass(clase);
        jQuery(contenedores).hide();
        var contenedor = jQuery(contenedores + ":nth-child(" + (jQuery(this).index() + 1) + ")");
        contenedor.show();
        /* Inicia Fix Bug IE  */
        contenedor.attr("class", contenedor.attr("class"));
        /* Termina Fix Bug IE */
    });
}

function ResetAll() {
    //Origen Destino
    $("#EtDestinyHtl, #cityco, #cityib").val(MsjDestinO);
    $("#EtCityOrig, #EtDestinyPkl, #EtCityOrigFL, #EtDestinyFL").val(MsjAirport);
    $("#EtHotel").val(FalseHotel);

    //Cuartos
    $("select[name='rm']").val(1).change();
    //Adultos
    $("select[name='ad1']").val(2).change();
    //Niños
    $("select[name='ch1']").val(0).change();
    //Formulario
    $("input[name='ct'],input[name='ds'],input[name='ht'],input[name='ob'],input[name='ib'],input[name='do'],input[name='pu'],input[name=ht],input[name=ctf],input[name=ac1],input[name=ac2],input[name=ac3]").val('');
}
//Modificar el foco

function changeFocus(obj, text) {
    jQuery(obj).focus(function() {


        inputText = $(this).val();
        jQuery(this).val("");

    });

    jQuery(obj).blur(function() {

        jQuery(this).val(inputText);
        jQuery(this).autocomplete("search", "");

    });


}

//reinicia edad de los niños

function restarAge(cuarto, suf) {
    jQuery("#Room" + suf + cuarto + ' select[name=ch' + cuarto + ']').val(0).change();
    jQuery("#Age" + suf + cuarto).hide();
    jQuery("#Age" + suf + cuarto + ' .age-select select').val(0).change();
    jQuery("#Et" + suf + "NumAges" + cuarto).val("");
    if (!(
        (jQuery("#Room" + suf + '1 select[name=ch1]').length != 0 && jQuery("#Room" + suf + '1 select[name=ch1]').val() != 0) ||
        (jQuery("#Room" + suf + '2 select[name=ch2]').length != 0 && jQuery("#Room" + suf + '2 select[name=ch2]').val() != 0) ||
        (jQuery("#Room" + suf + '3 select[name=ch3]').length != 0 && jQuery("#Room" + suf + '3 select[name=ch3]').val() != 0)
    )) {
        jQuery("#Age" + suf + "C").hide();
    }
}
//Reinicia configuración de cuartos

function restartRoom(forma, cuarto, suf) {
    jQuery("#Room" + suf + cuarto).hide();
    restarAge(cuarto, suf);
}
//muestra cuartos

function showRoom(forma, cuarto, suf) {
    jQuery("#Room" + suf + cuarto).show();
}
//Funcion cambio cuartos

function changeRoom(forma, suf) {
    if (jQuery(forma + ' .rm select').val() == 1) {
        showRoom(forma, 1, suf);
        restartRoom(forma, 2, suf);
        restartRoom(forma, 3, suf);
    }
    if (jQuery(forma + ' .rm select').val() == 2) {
        showRoom(forma, 1, suf);
        showRoom(forma, 2, suf);
        restartRoom(forma, 3, suf);
    }
    if (jQuery(forma + ' .rm select').val() == 3) {
        showRoom(forma, 1, suf);
        showRoom(forma, 2, suf);
        showRoom(forma, 3, suf);
    }
}
//funcion asigna edad ninos

function setAgeC(cuarto, suf) {
    if (
        (jQuery("#Room" + suf + '1 select[name=ch1]').length != 0 && jQuery("#Room" + suf + '1 select[name=ch1]').val() != 0) ||
        (jQuery("#Room" + suf + '2 select[name=ch2]').length != 0 && jQuery("#Room" + suf + '2 select[name=ch2]').val() != 0) ||
        (jQuery("#Room" + suf + '3 select[name=ch3]').length != 0 && jQuery("#Room" + suf + '3 select[name=ch3]').val() != 0)
    ) {
        jQuery("#Age" + suf + "C").show();
    } else {
        jQuery("#Age" + suf + "C").hide();
    }
    jQuery("#Age" + suf + cuarto).show();
    if (jQuery("#Room" + suf + cuarto + ' select[name=ch' + cuarto + ']').val() == 0) {
        jQuery("#Age" + suf + cuarto).hide();
        jQuery("#Et" + suf + "NumAges" + cuarto).val('');
    }
    if (jQuery("#Room" + suf + cuarto + ' select[name=ch' + cuarto + ']').val() == 1) {
        jQuery("#Age" + suf + cuarto + ' .age-select').hide();
        jQuery("#Age" + suf + cuarto + ' .age-select select').val(0).change();
        jQuery("#Age" + suf + cuarto + ' .ones').show();
        jQuery("#Et" + suf + "NumAges" + cuarto).val('0');
    }
    if (jQuery("#Room" + suf + cuarto + ' select[name=ch' + cuarto + ']').val() == 2) {
        jQuery("#Age" + suf + cuarto + ' .age-select').val(0).hide();
        jQuery("#Age" + suf + cuarto + ' .age-select select').val(0).change();
        jQuery("#Age" + suf + cuarto + ' .ones').show();
        jQuery("#Age" + suf + cuarto + ' .two').show();
        jQuery("#Et" + suf + "NumAges" + cuarto).val('0,0');
    }
    if (jQuery("#Room" + suf + cuarto + ' select[name=ch' + cuarto + ']').val() == 3) {
        jQuery("#Age" + suf + cuarto + ' .age-select').val(0).hide();
        jQuery("#Age" + suf + cuarto + ' .age-select select').val(0).change();
        jQuery("#Age" + suf + cuarto + ' .ones').show();
        jQuery("#Age" + suf + cuarto + ' .two').show();
        jQuery("#Age" + suf + cuarto + ' .three').show();
        jQuery("#Et" + suf + "NumAges" + cuarto).val('0,0,0');
    }
}

function setAgeCI(suf, cuarto) {
    if (jQuery("#Room" + suf + cuarto + ' select[name=ch' + cuarto + ']').val() == 1) {
        jQuery("#Et" + suf + "NumAges" + cuarto).val(jQuery('#Age' + suf + cuarto + ' .ones select').val());
    }
    if (jQuery("#Room" + suf + cuarto + ' select[name=ch' + cuarto + ']').val() == 2) {
        jQuery("#Et" + suf + "NumAges" + cuarto).val(jQuery('#Age' + suf + cuarto + ' .ones select').val() + ',' + jQuery('#Age' + suf + cuarto + ' .two select').val());
    }
    if (jQuery("#Room" + suf + cuarto + ' select[name=ch' + cuarto + ']').val() == 3) {
        jQuery("#Et" + suf + "NumAges" + cuarto).val(jQuery('#Age' + suf + cuarto + ' .ones select').val() + ',' + jQuery('#Age' + suf + cuarto + ' .two select').val() + ',' + jQuery('#Age' + suf + cuarto + ' .three select').val());
    }
}
//Validar Fechas

function restrict45Days(forma) {
    var dateTo = jQuery('#' + forma + ' .EtDateToGN').datepicker("getDate");
    var dateFrom = jQuery('#' + forma + ' .EtDateFromGN').datepicker("getDate");
    var daysDiff = Math.ceil((dateTo - dateFrom) / 864e5);

    if (daysDiff > eTMaxDays) {
        alert(Msj45Days);
        return (false);
    }
    return true;
}

function restrictCar30Days() {
    var dateTo = jQuery('#formacar .EtDateToGN').datepicker("getDate");
    var dateFrom = jQuery('#formacar .EtDateFromGN').datepicker("getDate");
    var daysDiff = Math.ceil((dateTo - dateFrom) / 864e5);

    if (daysDiff >= 30) {
        alert(MsjMaxTimeCar);
        return (false);
    }
    return true;
}

function restrictCar24Hours() {
    var dateFrom = jQuery('#formacar .EtDateFromGN').datepicker("getDate");
    var dateTo = jQuery('#formacar .EtDateToGN').datepicker("getDate");

    var horaEntrega = $("#Hora_Entrega").val().split(':')[0];
    var horaDevolucion = $("#Hora_Devolucion").val().split(':')[0];
    dateFrom.setHours(horaEntrega);
    dateTo.setHours(horaDevolucion);

    var hoursDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (3600 * 1000));

    if (hoursDiff < 24) {
        alert(MsjMinTimeCar);
        return (false);
    }
    return true;
}


function restrictPack8People() {
    var rooms = parseInt($("#formapackage .rm select").val());
    var ad1 = parseInt($("#formapackage select[name=ad1]").val());
    var ad2 = parseInt($("#formapackage select[name=ad2]").val());
    var ad3 = parseInt($("#formapackage select[name=ad3]").val());
    var ch1 = parseInt($("#formapackage select[name=ch1]").val());
    var ch2 = parseInt($("#formapackage select[name=ch2]").val());
    var ch3 = parseInt($("#formapackage select[name=ch3]").val());
    var sum = ad1 + ch1;
    if (rooms > 1) {
        sum += ad2 + ch2
    }
    if (rooms > 2) {
        sum += ad3 + ch3
    }
    if (sum > 8) {
        alert(MsjMaxPeoplePack);
        return false;
    }
    return true;
}
//Validar vuelos y paquetes

function ValidateFLPK(forma, objdestino) {
    if (jQuery("#" + forma + " input[name=no]").val() == "" || jQuery("#" + forma + " input[name=no]").val() == MsjAirport) {
        alert(altMsjAirport);
        return (false);
    }
    if (jQuery("#" + forma + " input[name=" + objdestino + "]").val() == "" || jQuery("#" + forma + " input[name=" + objdestino + "]").val() == MsjAirport) {
        alert(altMsjAirportr);
        return (false);
    }
    if (ValidateDate(forma) == false) {
        return (false);
    }
    return true;
}
//Valida hotel

function ValidateHotel(forma, objdest, msjobjdest, altmsjobjdest) {
    if (jQuery('#' + objdest).val() == '' || jQuery('#' + objdest).val() == msjobjdest) {
        alert(altmsjobjdest);
        return (false);
    }
    if (ValidateDate(forma) == false) {
        return (false);
    }
    return true;
}
//Selecciona el numero de personas de acuerdo al numero de habitaciones

function cleanSubmit(forma) {
    // Lee el número de habitaciones solicitadas
    var rm = parseInt(jQuery(forma).find("[name=rm]").val());

    // Deshabilita los adultos de las habitaciones que no se solicitaron
    jQuery(forma).find("[name*=ad]").each(function(index, element) {
        var room = parseInt(jQuery(this).attr("name").replace("ad", ""));
        if (rm < room) {
            jQuery(this).prop("disabled", true);
        }
    });
    // Deshabilita los niños de las habitaciones que no se solicitaron
    jQuery(forma).find("[name*=ch]").each(function(index, element) {
        var room = parseInt(jQuery(this).attr("name").replace("ch", ""));
        if (rm < room) {
            jQuery(this).prop("disabled", true);
        }
        // Lee la cantidad de niños para esta habitación y si es cero deshabilita sus edades
        var ch = parseInt(jQuery(forma).find("[name=ch" + room + "]").val())
        if (ch == 0) {
            jQuery(forma).find("[name=ac" + room + "]").prop("disabled", true)
        }
    });
    // Deshabilita las edades de los niños de las habitaciones que no se solicitaron
    jQuery(forma).find("[name*=ac]").each(function(index, element) {
        var room = parseInt(jQuery(this).attr("name").replace("ac", ""));
        if (rm < room) {
            jQuery(this).prop("disabled", true);
        }
    });
}
