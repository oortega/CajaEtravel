/* http://keith-wood.name/datepick.html
   Spanish localisation for jQuery Datepicker.
   Traducido por Vester (xvester@gmail.com). */
(function($) {
	$.datepick.regional['es'] = {
		monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
		'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
		monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun',
		'Jul','Ago','Sep','Oct','Nov','Dic'],
		dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
		dayNamesShort: ['Dom','Lun','Mar','Mié','Juv','Vie','Sáb'],
		dayNamesMin: ['Do','Lu','Ma','Mi','Ju','Vi','Sá'],
		dateFormat: 'dd/mm/yyyy', firstDay: 0,
		renderer: $.datepick.defaultRenderer,
		prevText: ' ', prevStatus: '',
		prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '',
		nextText: ' ', nextStatus: '',
		nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '',
		currentText: 'MM yyyy', currentStatus: '',
		todayText: 'MM yyyy', todayStatus: '',
		clearText: 'MM yyyy', clearStatus: '',
		closeText: 'Cerrar', closeStatus: '',
		yearStatus: '', monthStatus: '',
		weekText: 'Sm', weekStatus: '',
		dayStatus: 'DD, M d', defaultStatus: '',
		isRTL: false,
		commandsAsDateFormat: true
	};
	$.datepick.setDefaults($.datepick.regional['es']);
})(jQuery);
