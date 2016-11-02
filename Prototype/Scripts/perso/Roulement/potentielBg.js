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
                GetPotentiel();
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

    /* onChange stf */
    $('#stfsList').change(function () { GetPotentiel(); });

    // DatePicker
    //$('input[name="dtDatePdt"]').daterangepicker({ locale: localType, startDate: dtHier, showDropdowns: true, showWeekNumbers: true, singleDatePicker: true });
    //$('#dtDatePdt').on('apply.daterangepicker', function (ev, picker) {
    //    dtHier = picker.startDate.format('L');
    //    GetPdt();
    //});

    $('#ptclTable').on('processing.dt', function (e, settings, processing) { $('#PtclProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsPtclBg = {
        "dom":          'irf<t>',
        "processing":   true,
        "deferRender":  true,
        "jQueryUI":     true,
        "order":        [[4, "desc"]],
        "paging":       false,
        "language": languageOptions,
        "ajax": {
            "url": "GetPotentielBg",
            "data": function (d) {
                d.IdStf = $('#stfsList').val();
            }
        },
        "columns": [
            { "data": "Rame", "searchable": true },
            { "data": "Motrice", "searchable": true },
            { "data": "PremTrain", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return moment(data, "x").format('DD/MM/YYYY'); } },
            { "data": "DernRetrait", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return moment(data, "x").format('DD/MM/YYYY'); } },
            { "data": "Potentiel", "searchable": true },
            { "data": "ProcSite", "searchable": true }
        ],
        "createdRow": function (row, data, index) { if (data.Potentiel > 9) $('td', row).addClass("red" + "txt"); }
    };

    var GetPotentiel = function () {
        $('[data-toggle="tooltip"]').tooltip('hide');
        if (typeof _ptclTable != 'undefined') { _ptclTable.destroy(); } 
        _ptclTable = $('#ptclTable')
            .on('xhr.dt', function (e, settings, json, xhr) { })
            .DataTable(optionsPtclBg);
    }
    GetNavigator("V3. Potentiel-Bg");
});