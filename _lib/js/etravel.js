(function ($) {
    $(document).ready(function () {
        CambiaPestanas('.etWContainer .etWtabs a', 'active', '.etWContainer .etWforms .form');

        if ($("#formahotel").length === 1) DefVar("#formahotel");
        else DefVar("#formapackage");

        //Configuraciones generales para los calendarios
        // Se crea evento para ejecutar funciones despues que muestra el calendario
        $.datepicker._updateDatepicker_original = $.datepicker._updateDatepicker;
        $.datepicker._updateDatepicker = function (inst) {
            $.datepicker._updateDatepicker_original(inst);
            var afterShow = this._get(inst, 'afterShow');
            if (afterShow) afterShow.apply((inst.input ? inst.input[0] : null)); // trigger custom callback
        }

        $(".EtDateFromGN").datepicker({
            dateFormat: FormatO,
            numberOfMonths: 2,
            showButtonPanel: true,
            minDate: 0,
            maxDate: "+1y",
            beforeShowDay: RangoDias,
            beforeShow: function (input, ins) { if ($(input).data("oldDate") == undefined) $(input).data("oldDate", input.value) },
            onClose: showNextCalendar,
            onSelect: OnSelectDate
        });
        $(".EtDateToGN").datepicker({
            dateFormat: FormatO,
            numberOfMonths: 2,
            showButtonPanel: true,
            minDate: +1,
            maxDate: "+1y +1d",
            beforeShowDay: RangoDias,
            afterShow: NumeroNoches,
            onSelect: OnSelectDate
        });
        DefaultDate();

        /*Se establece un maximo de 30 noches a partir de la fecha seleccionada*/
        $("#formahotel .EtDateToGN, #formapackage .EtDateToGN,#formacar .EtDateToGN").datepicker("option", {
            beforeShow: function () {
                var form = $(this).parents("form");
                var fromDate = form.find(".EtDateFromGN").datepicker("getDate");
                return { "maxDate": addDate(fromDate, eTMaxDays, 'd') };
            }
        });

        //Muestra numero de noches
        $("body").on("mouseenter", "#ui-datepicker-div td a", NumeroNochesHover);
        $("body").on("mouseleave", "#ui-datepicker-div td a", function () {
            var idform = $.datepicker._curInst.input.parents("form").attr("id");
            if ((idform == "formahotel") || (idform == "formapackage")) //Validamos que solo se aplique al formulario de hotel y paquete
            {
                $(".Noches").text(noches + " " + Nighttext);
            }
        });
        /*Termina Calendarios*/

        ResetAll();

        // Pasa el valor del select al span
        $(".etWContainer").find(".etWSelect select").change(function () {
            $(this).next("span").text($(this).find("option:selected").text());
        }).change(); // para que lo ejecute cuando se cargue la pagina


        // Config de form hoteles
        if ($("#formahotel").length === 1) {
            $('#formahotel').submit(function (e) {
                var v1 = ValidateHotel('formahotel', 'EtDestinyHtl', MsjDestinO, AltMsjDestinO);
                if (v1) {
                    cleanSubmit(this);
                    return true;
                }
                return false;
            });
            $("#formahotel .EtDateFromGN").datepicker("option", "maxDate", "+18m");

            changeFocus("#EtDestinyHtl");

            $("#formahotel .rm select").change(function () { changeRoom('#formahotel', '') });
            $("#Room1 select[name=ch1]").change(function () { setAgeC(1, '') });
            $("#Age1 select").change(function () { setAgeCI('', 1) });
            $("#Room2 select[name=ch2]").change(function () { setAgeC(2, '') });
            $("#Age2 select").change(function () { setAgeCI('', 2) });
            $("#Room3 select[name=ch3]").change(function () { setAgeC(3, '') });
            $("#Age3 select").change(function () { setAgeCI('', 3) });
            
            //Evitar que se realize el submit en este campo de origen
            $("#EtDestinyHtl").keypress(function (e) { if (e.which == 13) e.preventDefault() });

            //autocompletado Hotel
            $("#EtDestinyHtl").autocomplete({
                minLength: 3,
                source: function (request, response) {
                    if (request.term in cacheDH) {
                        response(cacheDH[request.term]);
                        return;
                    }
                    $.ajax({
                        url: "http://ajax.e-tsw.com/searchservices/getSearchJson.aspx",
                        dataType: "jsonp",
                        jsonpCallback: "ETSHotel",
                        data: {
                            Lenguaje: IDioMA,
                            ItemTypes: "D:5,H:5",
                            Filters: "",
                            PalabraBuscada: request.term
                        },
                        success: function (data) {
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
                select: function (event, ui) {
                    if (!ui.item.Type) {
                        $(this).val(""); // Cuando no hay resultados solo limpia la entrada
                        return false;
                    }

                    $("#Etdt").val(ui.item.TypeID);
                    if (ui.item.Type == "H") {
                        $("#formahotel").attr('action', 'http://www.e-tsw.com.mx/Hoteles/Tarifas');
                        $("#Etdt").attr("name", "ht");
                    } else {
                        $("#formahotel").attr('action', 'http://www.e-tsw.com.mx/Hoteles/Lista');
                        $("#Etdt").attr("name", "ds");
                    }
                    $("#EtCt").val(ui.item.Country);
                    $("#formahotel .EtDateFromGN").focus();
                    inputText = ui.item.Label;
                    $(this).val(ui.item.Label);

                    $("#EtDestinyHtl").blur(); //Para que se limpie el input cuando se le de click
                    return false;
                }
            }).data("ui-autocomplete")._renderMenu = function (ul, items) {
                var self = this,
                    currentCategory = "";
                $.each(items, function (index, item) {
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
            $("#EtDestinyHtl").data("ui-autocomplete")._renderItem = function (ul, item) {
                return $("<li>")
                    .data("item.autocomplete", item)
                    .append($("<a>").text(item.Label))
                    .appendTo(ul);
            }
        }
        // Config de form paquetes
        if ($("#formapackage").length === 1) {
            $("#formapackage .EtDateFromGN").datepicker("option", "maxDate", "+319d");
            $("#formapackage").submit(function (e) {
                var v1 = ValidateFLPK('formapackage', 'ni');
                var v2 = restrictPack6People();
                if (v1 && v2) {
                    cleanSubmit(this);

                    return true;
                }
                return false;
            });

            $("#formapackage .rm select").change(function () { changeRoom('#formapackage', 'Pk') });
            $("#RoomPk1 select[name=ch1]").change(function () { setAgeC(1, 'Pk') });
            $("#AgePk1 select").change(function () { setAgeCI('Pk', 1) });
            $("#RoomPk2 select[name=ch2]").change(function () { setAgeC(2, 'Pk') });
            $("#AgePk2 select").change(function () { setAgeCI('Pk', 2) });
            $("#RoomPk3 select[name=ch3]").change(function () { setAgeC(3, 'Pk') });
            $("#AgePk3 select").change(function () { setAgeCI('Pk', 3) });

            changeFocus("#EtCityOrig,#EtDestinyPkl");

            //Evitar que se realize el submit en este campo de origen
            $("#EtCityOrig").keypress(function (e) { if (e.which == 13) e.preventDefault() });

            //autocompletado origen paquetes
            $("#EtCityOrig").autocomplete({
                minLength: 3,
                source: function (request, response) {
                    if (request.term in cachePQ) {
                        response(cachePQ[request.term]);
                        return;
                    }
                    $.ajax({
                        url: "http://ajax.e-tsw.com/searchservices/getSearchJson.aspx",
                        dataType: "jsonp",
                        jsonpCallback: "ETSPaquetes",
                        data: {
                            Lenguaje: IDioMA,
                            ItemTypes: "A:10",
                            Filters: "",
                            PalabraBuscada: request.term
                        },
                        success: function (data) {
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
                select: function (event, ui) {
                    if (!ui.item.Type) {
                        $(this).val(""); // Cuando no hay resultados solo limpia la entrada
                        return false;
                    }
                    $("#EtCityOrig").val(ui.item.Label);
                    $("#EtIATAob").val(ui.item.TypeID);
                    inputText = ui.item.Label;
                    $("#EtCityOrig").blur(); //Para que se limpie el input cuando se le de click
                    $("#EtDestinyPkl").focus();
                    return false;
                }
            }).data("ui-autocomplete")._renderItem = function (ul, item) {
                return $("<li>")
                    .data("item.autocomplete", item)
                    .append($("<a>").text(item.Label))
                    .appendTo(ul);
            };
            //Evitar que se realize el submit en este campo 
            $("#EtDestinyPkl").keypress(function (e) { if (e.which == 13) e.preventDefault() });

            //autocompletado destino paquetes
            $("#EtDestinyPkl").autocomplete({
                minLength: 3,
                source: function (request, response) {
                    if (request.term in cacheD) {
                        response(cacheD[request.term]);
                        return;
                    }
                    $.ajax({
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
                        success: function (data) {
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
                select: function (event, ui) {
                    if (!ui.item.Type) {
                        $(this).val(""); // Cuando no hay resultados solo limpia la entrada
                        return false;
                    }
                    $("#EtDestinyPkl").val(ui.item.Label);
                    $("#EtdtPk").val(ui.item.TypeID.split("|")[1]);
                    $("#EtIATds").val(ui.item.TypeID.split("|")[0]);
                    inputText = ui.item.Label;

                    $("#EtDestinyPkl").blur(); //Para que se limpie el input cuando se le de click

                    $("#formapackage .EtDateFromGN").focus();
                    return false;
                }
            }).data("ui-autocomplete")._renderItem = function (ul, item) {
                return $("<li>")
                    .data("item.autocomplete", item)
                    .append($("<a>").text(item.Label))
                    .appendTo(ul);
            };

        }
        // Config de form vuelos
        if ($("#formaflight").length === 1) {

            $("#formaflight").submit(function (e) {
                var v1 = ValidateFLPK('formaflight', 'ni');
                var v2 = restrictFlight6People();
                if (v1 && v2) {
                    cleanSubmit(this);
                    /*TagManager
                    //Se retrasa el submit para que se registre el evento en tagmanager
                    e.preventDefault();
                    var that=this;
                    setTimeout(function(){ that.submit() },250);                
                    */
                    return true;
                }
                return false;
            });
            changeFocus("#EtCityOrigFL,#EtDestinyFL");
            $("#formaflight .EtDateFromGN").datepicker("option", {
                "maxDate": "+319d",
                "minDate": 3
            });
            $("#formaflight .EtDateToGN").datepicker("option", {
                "minDate": 3,
                "maxDate": "+319d"
            });

            $("#EtFType").change(function () {
                if ($(this).val() == "round") {
                    $("#formaflight .EtDateFromGN").datepicker("option", {
                        beforeShowDay: RangoDias,
                        onClose: showNextCalendar
                    });
                    $("#formaflight .EtDateToGN").parent().show();
                } else {
                    $("#formaflight .EtDateFromGN").datepicker("option", {
                        beforeShowDay: null,
                        onClose: null
                    });
                    $("#formaflight .EtDateToGN").parent().hide();
                }
            });

            $("#RoomFL1 select[name=ch1]").change(function () { setAgeC(1, 'FL') });
            $("#AgeFL1 select").change(function () { setAgeCI('FL', 1) });

            //Evitar que se realize el submit en este campo 
            $("#EtCityOrigFL,#EtDestinyFL").keypress(function (e) { if (e.which == 13) e.preventDefault() });

            //autocompletado origen vuelos
            $("#EtCityOrigFL").autocomplete({
                minLength: 3,
                source: function (request, response) {
                    if (request.term in cachePQ) {
                        response(cachePQ[request.term]);
                        return;
                    }
                    $.ajax({
                        url: "http://ajax.e-tsw.com/searchservices/getSearchJson.aspx",
                        dataType: "jsonp",
                        jsonpCallback: "ETSVuelos",
                        data: {
                            Lenguaje: IDioMA,
                            ItemTypes: "A:10",
                            Filters: "",
                            PalabraBuscada: request.term
                        },
                        success: function (data) {
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
                select: function (event, ui) {
                    if (!ui.item.Type) {
                        $(this).val(""); // Cuando no hay resultados solo limpia la entrada
                        return false;
                    }
                    $("#EtCityOrigFL").val(ui.item.Label);
                    $("#EtIATAobFl").val(ui.item.TypeID);
                    inputText = ui.item.Label;
                    $("#EtCityOrigFL").blur(); //Para que se limpie el input cuando se le de click
                    return false;
                }
            }).data("ui-autocomplete")._renderItem = function (ul, item) {
                return $("<li></li>")
                    .data("item.autocomplete", item)
                    .append($("<a></a>, ").text(item.Label))
                    .appendTo(ul);
            };
            //autocompletado destino vuelos
            $("#EtDestinyFL").autocomplete({
                minLength: 3,
                source: function (request, response) {
                    if (request.term in cachePQ) {
                        response(cachePQ[request.term]);
                        return;
                    }
                    $.ajax({
                        url: "http://ajax.e-tsw.com/searchservices/getSearchJson.aspx",
                        dataType: "jsonp",
                        jsonpCallback: "ETSVuelos",
                        data: {
                            PalabraBuscada: request.term,
                            Lenguaje: IDioMA,
                            ItemTypes: "A:10",
                            Filters: ""
                        },
                        success: function (data) {
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
                select: function (event, ui) {
                    if (!ui.item.Type) {
                        $(this).val(""); // Cuando no hay resultados solo limpia la entrada
                        return false;
                    }
                    $("#EtDestinyFL").val(ui.item.Label);
                    $("#EtIATAibFl").val(ui.item.TypeID);
                    inputText = ui.item.Label;
                    $("#EtDestinyFL").blur(); //Para que se limpie el input cuando se le de click
                    return false;
                }
            }).data("ui-autocomplete")._renderItem = function (ul, item) {
                return $("<li></li>")
                    .data("item.autocomplete", item)
                    .append($("<a></a>, ").text(item.Label))
                    .appendTo(ul);
            };
        }

        // Config de form autos
        if ($("#formacar").length === 1) {
            $('#formacar').submit(function (e) {
                var v1 = ValidateHotel('formacar', 'cityco', MsjDestinO, AltMsjDestinO);
                var v2 = restrictCar24Hours();
                if (v1 == false || v2 == false) {
                    return false;
                }
            });

            $("#cityco,#cityib").keypress(function (e) { if (e.which == 13) e.preventDefault() });
            //autocompletado origen autos
            $("#cityco").autocomplete({
                minLength: 3,
                source: function (request, response) {
                    if (request.term in cacheA) {
                        response(cacheA[request.term]);
                        return;
                    }
                    $.ajax({
                        url: "http://ajax.e-tsw.com/searchservices/getSearchJson.aspx",
                        dataType: "jsonp",
                        jsonpCallback: "ETSAutos",
                        data: {
                            Lenguaje: IDioMA,
                            ItemTypes: "R:10",
                            Filters: "",
                            PalabraBuscada: request.term
                        },
                        success: function (data) {
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
                select: function (event, ui) {
                    if (!ui.item.Type) {
                        $(this).val(""); // Cuando no hay resultados solo limpia la entrada
                        return false;
                    }
                    inputText = ui.item.Label;
                    $("#cityco").val(ui.item.Label);
                    $("#pu").val(ui.item.TypeID);
                    $("#cityib").val(ui.item.Label);
                    $("#do").val(ui.item.TypeID);
                    $("#cityco").blur();

                    return false;
                }
            }).data("ui-autocomplete")._renderItem = function (ul, item) {
                return $("<li></li>")
                    .data("item.autocomplete", item)
                    .append($("<a></a>, ").text(item.Label))
                    .appendTo(ul);
            };

            //autocompletado destino autos
            $("#cityib").autocomplete({
                minLength: 3,
                source: function (request, response) {
                    if (request.term in cacheA) {
                        response(cacheA[request.term]);
                        return;
                    }
                    $.ajax({
                        url: "http://ajax.e-tsw.com/searchservices/getSearchJson.aspx",
                        dataType: "jsonp",
                        jsonpCallback: "ETSAutos",
                        data: {
                            Lenguaje: IDioMA,
                            ItemTypes: "R:10",
                            Filters: "",
                            PalabraBuscada: request.term
                        },
                        success: function (data) {
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
                select: function (event, ui) {
                    if (!ui.item.Type) {
                        $(this).val(""); // Cuando no hay resultados solo limpia la entrada
                        return false;
                    }
                    $("#cityib").val(ui.item.Label);
                    $("#do").val(ui.item.TypeID);
                    inputText = ui.item.Label;
                    $("#cityib").blur();
                    return false;
                }
            }).data("ui-autocomplete")._renderItem = function (ul, item) {
                return $("<li></li>")
                    .data("item.autocomplete", item)
                    .append($("<a></a>, ").text(item.Label))
                    .appendTo(ul);
            };

            //Calendarios
            $("#formacar .EtDateFromGN").datepicker("option", { minDate: 1 });
            $("#formacar .EtDateToGN").datepicker("option", { minDate: +2 });

            changeFocus("#formacar input[name=nu],#formacar input[name=no]");
        }

        // Config de form tours
        if ($("#formatour").length === 1) {
            $('#formatour').submit(function (e) { 
                return (ValidateHotel('formatour', 'EtDestinyNameTour', MsjDestinO, AltMsjDestinO)); 
            });

            $("#formatour .EtDateFromGN, #formatour .EtDateToGN").datepicker("option", {
                beforeShowDay: null,
                beforeShow: null,
                onClose: null
            });

            $("#formatour .EtDateToGN").datepicker("option", { "maxDate": "+1y+1d" });

            changeFocus("#EtDestinyNameTour");
            $("#EtDestinyNameTour").autocomplete({
                minLength: 3,
                source: function (request, response) {
                    $.ajax({
                        url: "http://ajax.e-tsw.com/searchservices/getSearchJson.aspx",
                        dataType: "jsonp",
                        data: {
                            Lenguaje: IDioMA,
                            ItemTypes: "D:10,T:5",
                            Filters: "",
                            PalabraBuscada: request.term
                        },
                        success: function (data) {
                            if (data.totalResultsCount == 0) {
                                data.results = [{
                                    Label: MsjNoResults,
                                    Type: null
                                }]; // Cuando no hay resultados agrega este item para que muestre el mensaje en el autocomplete
                            }
                            response(data.results);
                        }
                    });
                },
                select: function (event, ui) {
                    if (!ui.item.Type) {
                        $(this).val(""); // Cuando no hay resultados solo limpia la entrada
                        return false;
                    }

                    if (ui.item.Type == "D") {
                        $("#EtDestinyId").val(ui.item.TypeID);
                        $("#EtIdTour").val(0);
                        $("#EtIdsTour").val(0);
                    } else {
                        $("#EtDestinyId").val(0);
                        $("#EtIdTour").val(ui.item.TypeID);
                        $("#EtIdsTour").val(ui.item.TypeID);
                    }
                    inputText = ui.item.Label;
                    $(this).val(ui.item.Label);

                    $(this).blur(); //Para que se limpie el input cuando se le de click
                    return false;
                }
            }).data("ui-autocomplete")._renderMenu = function (ul, items) {
                var self = this, currentCategory = "";
                $.each(items, function (index, item) {
                    var encabezado = "";
                    if (item.Type == "D") {
                        encabezado = '<span>Destinos</span>';
                    } else {
                        encabezado = '<span>Tours</span>';
                    }
                    if (item.Type && item.Type != currentCategory) { // si hay resultados y si es otra categoía imprime los resultados
                        ul.append("<li class='ui-autocomplete-category'>" + encabezado + "</li>");
                        currentCategory = item.Type;
                    }
                    self._renderItemData(ul, item);
                });
            }
            $("#EtDestinyNameTour").data("ui-autocomplete")._renderItem = function (ul, item) {
                return $("<li>")
                    .data("item.autocomplete", item)
                    .append($("<a>").text(item.Label))
                    .appendTo(ul);
            }

        }
        // Config de form traslados
        if ($("#formatransfer").length === 1) {
            $('#formatransfer').submit(function (e) {
                return (ValidateHotel('formatransfer', 'EtHotel', FalseHotel, MsjHotel));
            });

            changeFocus("#EtHotel");

            //Calendarios
            $("#formatransfer .EtDateFromGN").datepicker("option", "minDate", 1); //minDate se indica el dia minimo para reservar, en este caso un dia mas a la fecha actual
            $("#formatransfer .EtDateToGN").datepicker("option", {
                "minDate": 2,
                "maxDate": "+1y+1d"
            });

            $("#EtTypeId").change(function () {

                if ($(this).val() == "R") {
                    $("#formatransfer .EtDateFromGN").datepicker("option", {
                        beforeShowDay: RangoDias,
                        onClose: showNextCalendar
                    });
                    $("#formatransfer .EtDateToGN").datepicker("option", {
                        beforeShowDay: RangoDias,
                        minDate: 2
                    });
                    $("#formatransfer .EtDateToGN").parent().show();
                    $("#formatransfer .EtDateFromGN").parent().show();
                }
                if ($(this).val() == "L") {
                    $("#formatransfer .EtDateFromGN").datepicker("option", {
                        beforeShowDay: null,
                        onClose: null
                    });
                    $("#formatransfer .EtDateToGN").datepicker("option", {
                        beforeShowDay: null
                    });
                    $("#formatransfer .EtDateToGN").parent().hide();
                    $("#formatransfer .EtDateFromGN").parent().show();
                }
                if ($(this).val() == "S") {
                    $("#formatransfer .EtDateFromGN").datepicker("option", {
                        beforeShowDay: null,
                        onClose: null
                    });
                    $("#formatransfer .EtDateToGN").datepicker("option", {
                        beforeShowDay: null,
                        minDate: 1
                    });
                    $("#formatransfer .EtDateToGN").parent().show();
                    $("#formatransfer .EtDateFromGN").parent().hide();
                }
            });

            $("#EtHotel").keypress(function (e) { if (e.which == 13) e.preventDefault() });
            //autocompletado traslado
            $("#EtHotel").autocomplete({
                minLength: 3,
                source: function (request, response) {
                    if (request.term in cacheT) {
                        response(cacheT[request.term]);
                        return;
                    }
                    $.ajax({
                        url: "http://ajax.e-tsw.com/searchservices/getSearchJson.aspx",
                        dataType: "jsonp",
                        jsonpCallback: "ETSTraslados",
                        data: {
                            PalabraBuscada: request.term,
                            Lenguaje: IDioMA,
                            ItemTypes: "H:10",
                            Filters: ""
                        },
                        success: function (data) {
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
                select: function (event, ui) {
                    if (!ui.item.Type) {
                        $(this).val(""); // Cuando no hay resultados solo limpia la entrada
                        return false;
                    }
                    $("#EtHotel").val(ui.item.Label);
                    $("#EtHotelId").val(ui.item.TypeID);
                    $("#EtCountryId").val(ui.item.Country);
                    inputText = ui.item.Label;
                    $("#EtHotel").blur();
                    return false;
                }
            }).data("ui-autocomplete")._renderItem = function (ul, item) {
                return $("<li></li>")
                    .data("item.autocomplete", item)
                    .append($("<a></a>, ").text(item.Label))
                    .appendTo(ul);
            };

            $("#EtTypeId").change(function () {
                $("#EtType").val($(this).children("option:selected").html());
            }).change();

        }

        //Se activan estos inputs al salir de la pagina
        $(window).unload(function () {
            $(".etWContainer").find("[name*=ad],[name*=ac],[name*=ch]").prop("disabled", false)
        });

    });

    /*VARIABLES*/
    var MsjAirport, altMsjAirport, altMsjAirportr, altMsjDate, NFOrigen, NFDestino, PosadaAllIclusive, FalseHotel, FormatO, MsjAllInclusive, MsjHotel, Msj45Days, MsjMinTimeCar, MsjMaxTimeCar, IDioMA, MsjDestinO = {}, inicionoches = 0,
        noches = 0,
        inputText = "",
        eTMaxDays = 30;
    var cachePQ = {}, cacheDH = {}, cacheD = {}, cacheT = {}, cacheA = {};

    function DefVar(obj) {
        if ($(obj + " input[name=ln]").val().toUpperCase() == "ESP") {
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
            MsjMaxPeoplePack = "El n\u00famero m\u00e1ximo permitido por reservaci\u00f3n es de 6 personas, por favor corrija e intente nuevamente su b\u00fasqueda";
            MsjNoResults = "No se encontraron resultados";
            IDioMA = "esp";
            Nighttext = "Noches";
            msgSelectedDay = "Día de estancia";
            msgSelectedFrom = "Día de ida";
            msgSelectedTo = "Día de regreso";
        }
        if ($(obj + " input[name=ln]").val().toUpperCase() == "POR") {
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
            MsjMaxPeoplePack = "O n\u00famero m\u00e1ximo permitido por reserva \u00e9 de 6 pessoas, por favor, corrija e tente novamente a sua pesquisa";
            MsjNoResults = "Nenhum resultado foi encontrado";
            IDioMA = "por";
            Nighttext = "Noites";
            msgSelectedDay = "Dia de estadia";
            msgSelectedFrom = "Partida";
            msgSelectedTo = "Volta";

        }
        if ($(obj + " input[name=ln]").val().toUpperCase() == "ING") {
            MsjDestinO = "Enter a city";
            AltMsjDestinO = "Please enter a city";
            MsjAirport = "Enter the name of the city";
            altMsjAirport = "Please enter the name of the city.";
            altMsjAirportr = "Please enter the name of the city.";
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
            MsjMaxPeoplePack = "The maximum number allowed per reservation is 6 people, please correct and try your search again";
            MsjNoResults = "No results were found";
            IDioMA = "ing";
            Nighttext = "Nights";
            msgSelectedDay = "Day stay";
            msgSelectedFrom = "Departure";
            msgSelectedTo = "Return";
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
        date = new Date(date);
        if (period == 'd' || period == 'w') {
            _normaliseDate(date);
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
        $(".EtDateFromGN").datepicker("setDate", defaultDate);
        defaultDate = addDate(defaultDate, '+4', 'd'); // Le suma 4 días
        $(".EtDateToGN").datepicker("setDate", defaultDate);
    }

    //Suma o resta fechas segun al calendario que se le da click
    function OnSelectDate(dateSel) {
        var formId = $(this).parents("form").attr('id');
        var dtClass = $(this).attr('class');
        var dateFromInput = $("#" + formId + " .EtDateFromGN");
        var dateToInput = $("#" + formId + " .EtDateToGN");
        var newdate, dateFrom, dateTo;

        //ESTA SECCIÓN IDENTIFICA A QUE CALENDARIO SE LE DA CLICK
        if (dtClass.indexOf('EtDateFromGN') >= 0) {
            dateFrom = $(this).datepicker("getDate");
            dateTo = dateToInput.datepicker("getDate");
            var daysDiff = Math.round((dateTo - dateFrom) / 864e5);
            newdate = addDate(dateFrom, '+1', 'd'); //Nueva fecha para el input EtDateToGN

            if ((formId != "formaflight" && (dateFrom >= dateTo || daysDiff > eTMaxDays)) || (formId == "formaflight" && dateFrom > dateTo)) {
                if (formId == "formapackage" || formId == "formahotel" || formId == "formacar") {
                    dateToInput.datepicker("option", "maxDate", null); // Se establece en null para habilitar todos los dias y poder poner la nueva fecha
                }
                dateToInput.datepicker("setDate", newdate);
            } // Asignamos el nuevo valor al input EtDateToGN

        } else {
            dateFrom = dateFromInput.datepicker("getDate");
            dateTo = $(this).datepicker("getDate");
            newdate = addDate(dateTo, '-1', 'd'); //Nueva fecha para el input EtDateFromGN
            if ((formId != "formaflight" && dateTo <= dateFrom) || (formId == "formaflight" && dateTo < dateFrom)) {
                dateFromInput.datepicker("setDate", newdate);
            } // Asignamos el nuevo valor al input EtDateFromGN      
        }
    }

    function showNextCalendar(dateText, inst) {
        if ($(this).data("oldDate") != dateText) {
            $(this).data("oldDate", dateText);
            $(this).parents("form").find(".EtDateToGN").datepicker("show");
        }
    }

    // Asigna clases para el  sombreado del inicio y fin de una reservacion
    function RangoDias(date) {
        var clase = "";
        var titulo = "";
        var forma = $(this).parents("form").attr('id');
        var inicio = $('#' + forma + ' .EtDateFromGN').datepicker("getDate");
        var fin = $('#' + forma + ' .EtDateToGN').datepicker("getDate");
        //Se convierte todo a milisegundos
        date = date.getTime();
        inicio = inicio.getTime();
        if (fin == null) {
            fin = 0;
        } else {
            fin = fin.getTime();
        }
        //Se agregan las clases para la reservacion
        if (date > inicio && date < fin && (forma == "formahotel" || forma == "formapackage")) {
            clase = "selectedDay";
            titulo = msgSelectedDay;
        } else if (date == inicio) {
            clase = "selectedFrom";
            titulo = msgSelectedFrom;
        } else if (date == fin) {
            clase = "selectedTo";
            titulo = msgSelectedTo;
        }
        return [true, clase, titulo]
    }

    //Muestra numero de noches de las fechas seleccionadas
    function NumeroNoches(date) {
        $(".Noches").remove();

        var Formanoches = $(this).parents("form").attr('id');
        if ((Formanoches == "formahotel") || (Formanoches == "formapackage")) {

            var fin = $('#' + Formanoches + ' .EtDateToGN').datepicker("getDate").getTime();
            inicionoches = $('#' + Formanoches + ' .EtDateFromGN').datepicker("getDate").getTime();

            noches = Math.round((fin - inicionoches) / 864e5);

            $(".ui-datepicker-close").before("<span class='Noches' >" + noches + " " + Nighttext + "</span>");
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

        var idform = $.datepicker._curInst ? $.datepicker._curInst.input.parents("form").attr("id") : $($.datepicker._lastInput).parents("form").attr("id"); // Se obtine el ID del Form de acuerdo a la version de jquery UI 10.3 o 10.4
        if ((idform == "formahotel") || (idform == "formapackage")) {
            var datehover = $(this).parent().data(), //Se obtiene mes y año del dia seleccionado
                diahover = parseInt($(this).html());
            var fechahover = new Date(datehover.year, datehover.month, diahover);
            fechahover = fechahover.getTime();
            fechahover = Math.round((fechahover - inicionoches) / 864e5);

            if (fechahover > 0) {
                $(".Noches").text(fechahover + " " + Nighttext);
            } else {
                $(".Noches").text(noches + " " + Nighttext);
            }
        }
    }

    function ValidateDate(forma) {
        if ($('#' + forma + ' .EtDateFromGN').val() == "" || $('#' + forma + ' .EtDateToGN').val() == "") {
            alert(altMsjDate);
            return (false);
        }
    }

    //Función de cambio de pestaña
    function CambiaPestanas(objeto, clase, contenedores) {
        $(objeto).click(function () {
            $(objeto).removeClass(clase);
            $(this).addClass(clase);
            $(contenedores).hide();
            var contenedor = $(contenedores + ":nth-child(" + ($(this).index() + 1) + ")");
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
        $("select[name*='ad']").val(2).change();
        //Niños
        $("select[name*='ch']").val(0).change();
        //Formulario
        $("input[name='ds'],input[name='ht'],input[name='ob'],input[name='ib'],input[name='do'],input[name='pu'],input[name=ctf]").val('');
        // Tipo de Vuelo
        $("#EtFType").val("round").change();
        // Horarios de autos
        $("#Hora_Entrega, #Hora_Devolucion").val("14:00").change();
        // Tipo de auto
        $("#Tipo_Carro").val("").change();
        // Destino tour
        $("#EtSelectDest").val("2").change();
        // Tipo de traslado
        $("#EtTypeId").val("R").change();
    }

    //Modificar el foco
    function changeFocus(obj) {
        $(obj).focus(function () {
            inputText = $(this).val();
            $(this).val("");
            $(this).autocomplete("search", "");
        });
        $(obj).blur(function () {
            $(this).val(inputText);
        });
    }

    //reinicia edad de los niños
    function restarAge(cuarto, suf) {
        $("#Room" + suf + cuarto + ' select[name=ch' + cuarto + ']').val(0).change();
        $("#Age" + suf + cuarto).hide();
        $("#Age" + suf + cuarto + ' .age-select select').val(0).change();
        $("#Et" + suf + "NumAges" + cuarto).val("");
        if (!(
            ($("#Room" + suf + '1 select[name=ch1]').length != 0 && $("#Room" + suf + '1 select[name=ch1]').val() != 0) ||
            ($("#Room" + suf + '2 select[name=ch2]').length != 0 && $("#Room" + suf + '2 select[name=ch2]').val() != 0) ||
            ($("#Room" + suf + '3 select[name=ch3]').length != 0 && $("#Room" + suf + '3 select[name=ch3]').val() != 0)
        )) {
            $("#Age" + suf + "C").hide();
        }
    }

    //Reinicia configuración de cuartos
    function restartRoom(forma, cuarto, suf) {
        $("#Room" + suf + cuarto).hide();
        restarAge(cuarto, suf);
    }

    //muestra cuartos
    function showRoom(forma, cuarto, suf) {
        $("#Room" + suf + cuarto).show();
    }

    //Funcion cambio cuartos
    function changeRoom(forma, suf) {
        if ($(forma + ' .rm select').val() == 1) {
            showRoom(forma, 1, suf);
            restartRoom(forma, 2, suf);
            restartRoom(forma, 3, suf);
        }
        if ($(forma + ' .rm select').val() == 2) {
            showRoom(forma, 1, suf);
            showRoom(forma, 2, suf);
            restartRoom(forma, 3, suf);
        }
        if ($(forma + ' .rm select').val() == 3) {
            showRoom(forma, 1, suf);
            showRoom(forma, 2, suf);
            showRoom(forma, 3, suf);
        }
    }

    //funcion asigna edad ninos
    function setAgeC(cuarto, suf) {
        if (
            ($("#Room" + suf + '1 select[name=ch1]').length != 0 && $("#Room" + suf + '1 select[name=ch1]').val() != 0) ||
            ($("#Room" + suf + '2 select[name=ch2]').length != 0 && $("#Room" + suf + '2 select[name=ch2]').val() != 0) ||
            ($("#Room" + suf + '3 select[name=ch3]').length != 0 && $("#Room" + suf + '3 select[name=ch3]').val() != 0)
        ) {
            $("#Age" + suf + "C").show();
        } else {
            $("#Age" + suf + "C").hide();
        }
        $("#Age" + suf + cuarto).show();
        if ($("#Room" + suf + cuarto + ' select[name=ch' + cuarto + ']').val() == 0) {
            $("#Age" + suf + cuarto).hide();
            $("#Et" + suf + "NumAges" + cuarto).val('');
        }
        if ($("#Room" + suf + cuarto + ' select[name=ch' + cuarto + ']').val() == 1) {
            $("#Age" + suf + cuarto + ' .age-select').hide();
            $("#Age" + suf + cuarto + ' .age-select select').val(0).change();
            $("#Age" + suf + cuarto + ' .ones').show();
            $("#Et" + suf + "NumAges" + cuarto).val('0');
        }
        if ($("#Room" + suf + cuarto + ' select[name=ch' + cuarto + ']').val() == 2) {
            $("#Age" + suf + cuarto + ' .age-select').val(0).hide();
            $("#Age" + suf + cuarto + ' .age-select select').val(0).change();
            $("#Age" + suf + cuarto + ' .ones').show();
            $("#Age" + suf + cuarto + ' .two').show();
            $("#Et" + suf + "NumAges" + cuarto).val('0,0');
        }
        if ($("#Room" + suf + cuarto + ' select[name=ch' + cuarto + ']').val() == 3) {
            $("#Age" + suf + cuarto + ' .age-select').val(0).hide();
            $("#Age" + suf + cuarto + ' .age-select select').val(0).change();
            $("#Age" + suf + cuarto + ' .ones').show();
            $("#Age" + suf + cuarto + ' .two').show();
            $("#Age" + suf + cuarto + ' .three').show();
            $("#Et" + suf + "NumAges" + cuarto).val('0,0,0');
        }
    }

    function setAgeCI(suf, cuarto) {
        if ($("#Room" + suf + cuarto + ' select[name=ch' + cuarto + ']').val() == 1) {
            $("#Et" + suf + "NumAges" + cuarto).val($('#Age' + suf + cuarto + ' .ones select').val());
        }
        if ($("#Room" + suf + cuarto + ' select[name=ch' + cuarto + ']').val() == 2) {
            $("#Et" + suf + "NumAges" + cuarto).val($('#Age' + suf + cuarto + ' .ones select').val() + ',' + $('#Age' + suf + cuarto + ' .two select').val());
        }
        if ($("#Room" + suf + cuarto + ' select[name=ch' + cuarto + ']').val() == 3) {
            $("#Et" + suf + "NumAges" + cuarto).val($('#Age' + suf + cuarto + ' .ones select').val() + ',' + $('#Age' + suf + cuarto + ' .two select').val() + ',' + $('#Age' + suf + cuarto + ' .three select').val());
        }
    }

    //Validar Fechas
    function restrict45Days(forma) {
        var dateTo = $('#' + forma + ' .EtDateToGN').datepicker("getDate");
        var dateFrom = $('#' + forma + ' .EtDateFromGN').datepicker("getDate");
        var daysDiff = Math.round((dateTo - dateFrom) / 864e5);

        if (daysDiff > eTMaxDays) {
            alert(Msj45Days);
            return (false);
        }
        return true;
    }

    function restrictCar24Hours() {
        var dateFrom = $('#formacar .EtDateFromGN').datepicker("getDate");
        var dateTo = $('#formacar .EtDateToGN').datepicker("getDate");

        var horaEntrega = $("#Hora_Entrega").val().split(':')[0];
        var horaDevolucion = $("#Hora_Devolucion").val().split(':')[0];
        dateFrom.setHours(horaEntrega);
        dateTo.setHours(horaDevolucion);

        var hoursDiff = Math.round((dateTo.getTime() - dateFrom.getTime()) / (3600 * 1000));

        if (hoursDiff < 24) {
            alert(MsjMinTimeCar);
            return (false);
        }
        return true;
    }

    function restrictFlight6People() {
        var ad1 = parseInt($("#formaflight select[name=ad1]").val());
        var ch1 = parseInt($("#formaflight select[name=ch1]").val());
        var sum = ad1 + ch1;
        if (sum > 6) {
            alert(MsjMaxPeoplePack);
            return false;
        }
        return true;
    }

    function restrictPack6People() {
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
        if (sum > 6) {
            alert(MsjMaxPeoplePack);
            return false;
        }
        return true;
    }

    //Validar vuelos y paquetes
    function ValidateFLPK(forma, objdestino) {
        if ($("#" + forma + " input[name=no]").val() == "" || $("#" + forma + " input[name=no]").val() == MsjAirport) {
            alert(altMsjAirport);
            return (false);
        }
        if ($("#" + forma + " input[name=" + objdestino + "]").val() == "" || $("#" + forma + " input[name=" + objdestino + "]").val() == MsjAirport) {
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
        if ($('#' + objdest).val() == '' || $('#' + objdest).val() == msjobjdest) {
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
        var rm = parseInt($(forma).find("[name=rm]").val());

        // Deshabilita los adultos de las habitaciones que no se solicitaron
        $(forma).find("[name*=ad]").each(function (index, element) {
            var room = parseInt($(this).attr("name").replace("ad", ""));
            if (rm < room) {
                $(this).prop("disabled", true);
            }
        });
        // Deshabilita los niños de las habitaciones que no se solicitaron
        $(forma).find("[name*=ch]").each(function (index, element) {
            var room = parseInt($(this).attr("name").replace("ch", ""));
            if (rm < room) {
                $(this).prop("disabled", true);
            }
            // Lee la cantidad de niños para esta habitación y si es cero deshabilita sus edades
            var ch = parseInt($(forma).find("[name=ch" + room + "]").val())
            if (ch == 0) {
                $(forma).find("[name=ac" + room + "]").prop("disabled", true)
            }
        });
        // Deshabilita las edades de los niños de las habitaciones que no se solicitaron
        $(forma).find("[name*=ac]").each(function (index, element) {
            var room = parseInt($(this).attr("name").replace("ac", ""));
            if (rm < room) {
                $(this).prop("disabled", true);
            }
        });
    }
})(jQuery);