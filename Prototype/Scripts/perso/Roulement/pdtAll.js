$(function () {
    var dtToday = moment()._d;

    // Config STF par défaut
    function Root() {
        $.getJSON("/Home/GetStfPreference")
            .done(function (json) {
                if (json.iStfSelect == "0") $('#stfsList').selectpicker('val', "1");
                else {
                    var tabFilter = json.Stfs.filter(function (item) { return item.ID == json.iStfSelect });
                    $('#stfsList').selectpicker('val', tabFilter[0].ID);
                }
                GetPdtAll();
            })
            .fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                alert("Ereur Recup Stf Default: " + err);
            });
    }
    Root();

    // Mise en forme CSS des SelectPicker
    $('.single-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%' });

    /* date range picker icone clickable */
    $('.date-picker-icon').on('click', function () {
        var data = $(this).data('input-name');
        $('input[name="' + data + '"]').focus();
    })

    // Activation des tooltips
    $('[data-toggle="tooltip"]').tooltip({ 'container': 'body', delay: { "show": 500, "hide": 100 } });

    /* onChange stf *///new Date(moment($('input[name="dtDatePdt"]').data('startDate')));
    $('#stfsList').change(function () { GetPdt(); });

    // DatePicker
    $('input[name="dtDatePdt"]').daterangepicker({ locale: localType, startDate: dtToday, showDropdowns: true, showWeekNumbers: true, singleDatePicker: true });
    $('#dtDatePdt').on('apply.daterangepicker', function (ev, picker) {
        dtToday = picker.startDate.format('L');
        GetPdt();
    });

    $('#pdtTableAll').on('processing.dt', function (e, settings, processing) { $('#PdtAllProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsPDTall = {
        "dom": 'irf<t>',
        "processing": true,
        "deferRender": true,
        "jQueryUI": true,
        "order": [[4, "asc"]],
        "paging": false,
        "language": languageOptions,
        "ajax": {
            "url": "GetCouverturePdtAll",
            "data": function (d) {
                d.IdStf = $('#stfsList').val();
                //d.dtPdt = new Date(dtToday).toLocaleString("fr-FR");
                d.dtPdt = moment(dtToday).format('DD/MM/YYYY HH:mm');
            }
        },
        "columns": [
            { "data": "NumRoulement", "searchable": true },
            { "data": "NumLigne", "searchable": true },
            { "data": "NumTrain", "searchable": true },
            { "data": "GareDep", "searchable": true },
            { "data": "HeureDepart", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return moment(data, "x").format('DD/MM/YYYY HH:mm'); } },
            { "data": "Nature", "searchable": true },
            { "data": "NbElements", "searchable": true },
            { "data": "NumRame", "searchable": true },
            { "data": "Position", "searchable": true },
            { "data": "TrainSupp", "render": function (data, type, full, meta) { return data ? '<i class="fa fa-exclamation-triangle" style="color: #FF0000;"></i>' : ""; } }
        ],
        "createdRow": function (row, data, index) { if (data.TrainSupp) $('td', row).addClass("red" + "txt"); }
    };

    var GetPdtAll = function () {
        $('[data-toggle="tooltip"]').tooltip('hide');
        if (typeof _pdtTableAll != 'undefined') { _pdtTableAll.destroy(); } // destroy table if exist
        _pdtTableAll = $('#pdtTableAll')
            .on('xhr.dt', function (e, settings, json, xhr) { })
            .DataTable(optionsPDTall);
    }
    GetNavigator("V3. PdtAll");
    
});