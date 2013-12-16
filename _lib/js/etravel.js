jQuery(document).ready(function(){
    // Se crea evento para ejecutar funciones despues que muestra el calendario
    $.datepicker._updateDatepicker_original = $.datepicker._updateDatepicker;
    $.datepicker._updateDatepicker = function(inst) {
        $.datepicker._updateDatepicker_original(inst);
        var afterShow = this._get(inst, 'afterShow');
        if (afterShow)
            afterShow.apply((inst.input ? inst.input[0] : null));  // trigger custom callback
    }

    DefVar("#formahotel");   
    jQuery(".EtDateFromGN" ).datepicker({
        dateFormat: FormatO,
        showOn: "both",
        buttonImageOnly: true,
        buttonText: "",
        numberOfMonths: 2,
        showButtonPanel: true,     
        beforeShowDay: RangoDias,
        
        onSelect: OnSelectDate
        
	});
    jQuery(".EtDateToGN").datepicker({
        dateFormat: FormatO,
        showOn: "both",
        buttonImageOnly: true,
        buttonText: "",
        numberOfMonths: 2,
        showButtonPanel: true,     
        beforeShowDay: RangoDias,
        afterShow: NumeroNoches,
        onSelect: OnSelectDate
    });
    DefaultDate();
    jQuery("body").on("mouseenter","#ui-datepicker-div td a", NumeroNochesHover);
    jQuery("body").on("mouseleave","#ui-datepicker-div td a", function(){  jQuery(".Noches").text(noches+" Noches"); });

});

/*VARIABLES*/
var MsjAirport,altMsjAirport,altMsjAirportr,altMsjDate,NFOrigen,NFDestino,PosadaAllIclusive,FalseHotel,FormatO,MsjAllInclusive,MsjHotel,Msj45Days,MsjMinTimeCar,MsjMaxTimeCar,IDioMA,MsjDestinO = {},inicionoches=0,noches=0;
var cachePQ = {};
var cacheDH = {};
var cacheD = {};
var cacheT = {};


function DefVar(obj)
{
    if(jQuery(obj+" input[name=ln]").val().toUpperCase()=="ESP")
    {
        MsjDestinO="Especifique una ciudad";
        AltMsjDestinO="Por favor especifique una ciudad";
        MsjAirport="Escriba el nombre de la ciudad";
        altMsjAirport="Por favor seleccione un aeropuerto de origen.";
        altMsjAirportr="Por favor seleccione un aeropuerto de llegada.";
        altMsjDate="Debe Seleccionar una";
        NFOrigen="Por favor seleccione un aeropuerto de origen.";
        NFDestino="Por favor seleccione un aeropuerto de destino."
        PosadaAllIclusive="Puede seleccionar como m\u00E1ximo 4 personas por habitaci\u00F3n.";
        FormatO="dd/mm/yy";
        MsjAllInclusive="M\u00E1ximo 4 personas por habitaci\u00F3n, incluyendo ni\u00F1os.";
        FalseHotel="Nombre del hotel";
        MsjHotel="Especifique un hotel por favor.";
        Msj45Days="No se pueden reservar m\u00E1s de 45 d\u00edas.";
        MsjMinTimeCar="La fecha y hora de devoluci\u00F3n no puede ser menor a 24 horas a partir de la fecha de reservaci\u00F3n.";
        MsjMaxTimeCar="La fecha y hora de devoluci\u00F3n no puede ser mayor a 30 días a partir de la fecha de reservaci\u00F3n.";
        MsjMaxPeoplePack="El n\u00famero m\u00e1ximo permitido por reservaci\u00f3n es de 8 personas, por favor corrija e intente nuevamente su b\u00fasqueda";
        IDioMA="esp";
    }
    if(jQuery(obj+" input[name=ln]").val().toUpperCase()=="POR")
    {
        MsjDestinO="Introduza uma cidade";
        AltMsjDestinO="Por favor introduza uma cidade";
        MsjAirport="Cidade ou Aeroporto";
        altMsjAirport="Por favor seleccione um aeroporto de partida.";
        altMsjAirportr="Por favor seleccione um aeroporto de chegada.";
        altMsjDate="Vocꡤeve selecionar uma data";
        NFOrigen="Digite o aeroporto de partida.";
        NFDestino="Especificar Retorno aeroporto";
        PosadaAllIclusive="Voc\u00EA deve selecionar at\u00E9 quatro pessoas por quarto.";
        FormatO="dd/mm/yy";
        MsjAllInclusive="M\u00E1ximo de 4 pessoas por quarto, incluindo crian\u00E7as.";
        FalseHotel="Por favor, seleccione um hotel";
        MsjHotel="Please select a hotel.";
        Msj45Days="Voc\u00ea n\u00e3o pode reservar mais de 45 dias";
        MsjMinTimeCar="A data e hora de retorno n\u00e3o pode ser inferior a 24 horas ap\u00F3s a data da reserva.";
        MsjMaxTimeCar="A data e hora de retorno n\u00e3o pode ser superior a 30 dias ap\u00F3s a data da reserva.";
        MsjMaxPeoplePack="O n\u00famero m\u00e1ximo permitido por reserva \u00e9 de 8 pessoas, por favor, corrija e tente novamente a sua pesquisa";
        IDioMA="por";
    }
    if(jQuery(obj+" input[name=ln]").val().toUpperCase()=="ING")
    {
        MsjDestinO="Enter a city";
        AltMsjDestinO="Please enter a city";
        MsjAirport="Enter the name of the city";
        altMsjAirport="Please enter the name of the city.";
        altMsjAirportr="Please select an arrival airport.";
        altMsjDate="Please select a date";
        NFOrigen="Enter the departure airport.";
        NFDestino="Specify airport Return";
        PosadaAllIclusive="You must select up to four people per room.";
        FormatO="mm/dd/yy";
        MsjAllInclusive="Maximum 4 persons per room, including children.";
        FalseHotel="Hotel name";
        MsjHotel="Please enter a hotel name";
        Msj45Days="You can not book more than 45 days";
        MsjMinTimeCar="The date and time of return can not be less than 24 hours after the reservation date.";
        MsjMaxTimeCar="The date and time of return can not be greater than 30 days from the reservation date.";
        MsjMaxPeoplePack="The maximum number allowed per reservation is 8 people, please correct and try your search again";
        IDioMA="ing";
    }
}

function  _normaliseDate (date) {
    if (date) {
        date.setHours(12, 0, 0, 0);
    }
    return date;
}
// Funcion para sumar Fechas
function addDate (date, amount, period) {
    if (period == 'd' || period == 'w') {
        this._normaliseDate(date);
        date.setDate(date.getDate() + amount * (period == 'w' ? 7 : 1));
    }
    else {
        var year = date.getFullYear() + (period == 'y' ? amount : 0);
        var month = date.getMonth() + (period == 'm' ? amount : 0);
        date.setTime(plugin.newDate(year, month + 1,
            Math.min(date.getDate(), this.daysInMonth(year, month + 1))).getTime());
    }
    return date;
}

function DefaultDate(){

    //Fechas Default en Calendarios
    var defaultDate = new Date();       // Obtiene la fecha 
    defaultDate = addDate(defaultDate,'+7', 'd');       // Le suma 7 días
    jQuery(".EtDateFromGN").datepicker( "setDate",defaultDate);
    defaultDate = addDate(defaultDate,'+2', 'd');      // Le suma 2 día
    jQuery(".EtDateToGN").datepicker( "setDate",defaultDate);    
}

//Suma o resta fechas segun al calendario que se le da click
function OnSelectDate(dateSel) {
    var formId=jQuery(this).parents("form").attr('id');
    var dtClass=jQuery(this).attr('class');
    var dateFromInput=jQuery("#"+formId+" .EtDateFromGN");
    var dateToInput=jQuery("#"+formId+" .EtDateToGN");
    var newdate,dateFrom,dateTo;
     //ESTA SECCIÓN IDENTIFICA A QUE CALENDARIO SE LE DA CLICK
    if ( dtClass.indexOf('EtDateFromGN') >=0 ){
        dateFrom = jQuery(this).datepicker("getDate");
        dateTo = dateToInput.datepicker("getDate");  
        newdate=addDate(dateFrom,'+2', 'd'); //Nueva fecha para el input EtDateToGN
        if (dateFrom>=dateTo) {dateToInput.datepicker("setDate",newdate);} // Asignamos el nuevo valor al input EtDateToGN
    }
    else{
        dateFrom = dateFromInput.datepicker("getDate");
        dateTo = jQuery(this).datepicker("getDate");
        newdate=addDate(dateTo,'-2', 'd'); //Nueva fecha para el input EtDateFromGN
        if (dateTo<=dateFrom) {dateFromInput.datepicker("setDate",newdate); } // Asignamos el nuevo valor al input EtDateFromGN
       // NumeroNoches(dateFrom.getTime(), dateTo.getTime() );
    }
}

// Asigna clases para el  sombreado del inicio y fin de una reservacion
function RangoDias(date) {
    var clase="";
    var titulo="";
    var forma=jQuery(this).parents("form").attr('id');
    var inicio= jQuery('#'+forma+' .EtDateFromGN').datepicker("getDate");
    var fin= jQuery('#'+forma+' .EtDateToGN').datepicker("getDate"); 
    //Se convierte todo a milisegundos
    date=date.getTime();
    inicio=inicio.getTime();
    if(fin==null){fin=0; }
    else{fin=fin.getTime();}
    //Se agregan las clases para la reservacion
    if(date>inicio && date<fin) {clase="selectedDay";titulo="Día de estancia"; }
    else if(date ==inicio) {clase="selectedFrom";titulo="Día de ida"; }
    else if(date==fin){clase="selectedTo";titulo="Día de regreso";}
    return [true, clase, titulo]
}
//Muestra numero de noches de las fechas seleccionadas
function NumeroNoches(date){
    jQuery(".Noches").remove();
    
    var Formanoches=jQuery(this).parents("form").attr('id'),
        //inicio= jQuery('#'+Formanoches+' .EtDateFromGN').datepicker("getDate").getTime(),
        fin= jQuery('#'+Formanoches+' .EtDateToGN').datepicker("getDate").getTime();
        inicionoches= jQuery('#'+Formanoches+' .EtDateFromGN').datepicker("getDate").getTime();

        noches=(fin-inicionoches)/864e5;
    jQuery(".ui-datepicker-current").after("<span class='Noches' >"+noches+" Noches</span>");        
}
//Muestra numero de noches al pocisionar el mouse sobre un dia
function NumeroNochesHover(){
       var datehover=$(this).parent().data(),//Se obtiene mes y año del dia seleccionado
            diahover=parseInt( $(this).html());
        var fechahover= new Date ( datehover.year,datehover.month, diahover );
            fechahover=fechahover.getTime();
        fechahover=Math.round((fechahover-inicionoches)/864e5);

        if(fechahover>0){
            $(".Noches").text(fechahover+" Noches");    
        }else{
            jQuery(".Noches").text(noches+" Noches");  
        }   
}




