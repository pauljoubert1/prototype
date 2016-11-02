$(function () {
    var StfSelected     = { ID: 1, STF: "STF D/R", IdStfRm: 2, OsmStf: "SLD", CodeSecteur: "CLD" };
    var NbJourAdd       = 0;
    var User            = { USER: {}, ROLES: [], STFpref: 1, StfsSET: [], AllStfs: [] };
    var stfS            = [];
    var vac             = 0;

    // Init
    $('#InSiteProcessing').css('display', 'block');

    $.when(InitAsp()).then(function (_init) {
        stfS = _init.AllStfs;
        var iStfPref = parseInt(_init.STFpref);
        $.each(stfS, function (i, item) { $('#stfsList').append('<option value ="' + item.ID + '">' + item.STF + '</option>'); }); $('#stfsList').selectpicker('refresh');
        if (iStfPref > 0) $('#stfLayout').selectpicker('val', iStfPref);

        if (iStfPref == 0) { $('#stfsList').selectpicker('val', "1"); }
        else {
            GetFilterTable(stfS, 'ID', iStfPref).then(function (stfFilter) {
                StfSelected = { ID: stfFilter[0].ID, STF: stfFilter[0].STF, IdStfRm: stfFilter[0].IdStfRm, OsmStf: stfFilter[0].OsmStf, CodeSecteur: stfFilter[0].CodeSecteur };
                $('#stfsList').selectpicker('val', stfFilter[0].ID);
            })
        }
        GetSites();
        GetSeriesByStf();
        TraceUser("V3. Site-In", _init.UserInfo.username, moment().format('YYYY-MM-DD HH:mm:ss'));
        $('#InSiteProcessing').css('display', 'none');
    })
    // Fin Init 

    // Activation des tooltips
    var originalLeave = $.fn.tooltip.Constructor.prototype.leave;
    $.fn.tooltip.Constructor.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)
        var container, timeout;

        originalLeave.call(this, obj);

        if (obj.currentTarget) {
            container = $(obj.currentTarget).siblings('.tooltip')
            timeout = self.timeout;
            container.one('mouseenter', function () {
                //We entered the actual popover – call off the dogs
                clearTimeout(timeout);
                //Let's monitor popover content instead
                container.one('mouseleave', function () {
                    $.fn.tooltip.Constructor.prototype.leave.call(self, self);
                });
            })
        }
    };

    $('[data-toggle="tooltip"]').tooltip({ selector: '[data-toggle]', container: 'body', delay: { "show": 50, "hide": 100 } });//, trigger: 'click hover'
    $('._xlsExport').css("display", "none");
    // Mise en forme CSS des SelectPicker
    $('.single-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%' });
    for (var d = 1; d <= 5; d++) $('#txtJ' + d).val('Entrées du ' + moment().add(d, 'day').format('DD/MM/YYYY'));
    $('#txtJ0M').val(moment().format('DD/MM/YYYY') + ' jour');
    $('#txtJ0S').val(moment().format('DD/MM/YYYY') + ' soir');
    $('[aria-valuetext="currentDay"]').removeClass('valid-input');
    vac = new Date().getHours() < 12 ? 1 : 2; //Jour >> vac 1 - Soir >> vac 2 
    $('[aria-valuenow="' + vac + '"]').addClass('valid-input'); 

    function GetSites() {
        $.getJSON("http://localhost:3000/getSites", { IdStf: $('#stfsList').val(), TypeSite: '' })
        .done(function (json) {
            $('#sitesList').get(0).options.length = 0;
            $('#sitesList').append('<option value ="0">Site...</option>');
            $.each(json.data, function (i, item) { $('#sitesList').append('<option value ="' + item.CodeGrf + '">' + item.Site + '</option>'); });
            $('#sitesList').selectpicker('refresh');
            if (typeof _insiteTable != 'undefined') { _insiteTable.clear().draw(); }
        })
        .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; $('#InSiteProcessing').css('display', 'none'); alert("Récupérations des sites de maintenances impossibles...: " + "\r\n" + err); });
    }
    function GetSeriesByStf() {
        $.when(util_GetSeriesByStf(parseInt($('#stfsList').val()))).done(function (_series) {
            $('#seriesList').get(0).options.length = 0;
            $('#seriesList').append('<option value ="0">Série...</option>');
            $.each(_series.data, function (i, item) { $('#seriesList').append('<option value ="' + item.ID + '">' + item.Serie + '</option>'); });
            $('#seriesList').selectpicker('refresh');
        })
    }


    $('[aria-valuetext="currentDay"]').click(function () {
        $('[aria-valuetext="currentDay"]').removeClass('valid-input');
        $(this).addClass('valid-input');
        NbJourAdd = parseInt(this.value);
        if (NbJourAdd == 0) { vac = this.getAttribute("aria-valuenow"); }
        if (typeof _insiteTable == 'undefined') GetEntrees();
        else                                    _insiteTable.ajax.reload();
    }); 
    $('#stfsList').change(function () {
        $('#InSiteProcessing').css('display', 'block');
        NbJourAdd = 0;
        GetFilterTable(stfS, 'ID', parseInt($('#stfsList').val())).then(function (stfFilter) {
            StfSelected = { ID: stfFilter[0].ID, STF: stfFilter[0].STF, IdStfRm: stfFilter[0].IdStfRm, OsmStf: stfFilter[0].OsmStf, CodeSecteur: stfFilter[0].CodeSecteur };
            GetSites(); GetSeriesByStf(); $('#InSiteProcessing').css('display', 'none');
        })
    });

    $('#sitesList, #seriesList').change(function () {
        if ($('#sitesList').val() != "0") {
            if (this.id != 'sitesList') NbJourAdd = 0; // Garde la valeur de NbAddJour si on modifie le site. Si ce sont les VAC qui sont modifiées >> RéInit de NbAddJour à 0
            //$('[aria-valuetext="currentDay"]').prop('disabled', false);
            if (typeof _insiteTable == 'undefined') GetEntrees();
            else                                    _insiteTable.ajax.reload();
            $('[data-toggle="tooltip"]').tooltip('hide');
            $('._xlsExport').css("display", "block");
        }
    }); // Lancemenent de la moulinette de récupération des données dès qu'un des 3 objects sont modifiés

    $('#InSiteToXls-Total, #InSiteToXls-Correc, #InSiteToXls-Light').on('click', function () {
        var url = "EnterToXLS";
        var data = {
            mode: this.id == "InSiteToXls-Total" ? 2 : this.id == "InSiteToXls-Correc" ? 1 : 0,
            mini: $('#txtMin').val() == "" || !$.isNumeric($('#txtMin').val()) ? 0 : parseInt($('#txtMin').val(), 10),
            maxi: $('#txtMax').val() == "" || !$.isNumeric($('#txtMax').val()) ? 0 : parseInt($('#txtMax').val(), 10),
            filter: _insiteTable.settings().search()
        };
        url += '?' + decodeURIComponent($.param(data));
        window.location = url;
    });

    $('#insiteTable').on('processing.dt', function (e, settings, processing) { $('#InSiteProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsInSite = {
        "dom": 'irf<t>',
        "processing": true,
        "deferRender": true,
        "jQueryUI": true,
        "order": [[6, "asc"]],
        "paging": false,
        "language": languageOptions,
        "ajax": {
            "url": "GetEnterSite",
            "data": function (d) {
                d.IdStf         = $('#stfsList').val(),
                d.IdSerie       = $('#seriesList').val(),
                d.Site          = $('#sitesList').val(),
                d.CodeSecteur   = StfSelected.CodeSecteur,
                d.Vacation      = vac, //1; //$('#chkVac0')[0].checked ? 1 : 2;
                d.nbAddDate     = NbJourAdd
            }
        },
        "columns": [
            { data: "NbRest", className: 'dtTables-details', orderable: false, render: function (data, type, full, meta) { return '<a href="#"><span class="bdgOrange">' + data + '</span></a>' + ' ' + '<a href="#"><span class="bdgBlue">' + full.NbDI + '</span></a>'; } },
            { data: "Pos_NbElem", searchable: true, sWidth: 'auto' },
            { data: "NumRame", searchable: true, sWidth: 'auto' },
            { data: "NumTrain", searchable: true, sWidth: 'auto' },
            { data: "NumRoulement", searchable: true, sWidth: 'auto' },
            { data: "Nature", searchable: true, sWidth: 'auto' },
            { data: "HeureArrivee", className: "clsWrap", type: 'date-euro', render: function (data, type, full, meta) { return moment(data, "x").format('DD/MM/YYYY HH:mm'); } },
            { data: "HeureDepart", className: "clsWrap", type: 'date-euro', render: function (data, type, full, meta) { return data == null ? "Rame non baptisée" : moment(data, "x").format('DD/MM/YYYY HH:mm'); } },
            { data: "TpsMinute", sWidth: 'auto' },
            { data: "ImmobRame" },
            { data: "NumRameOsm", visible: false }
        ]
    };

    $.fn.dataTable.ext.search.push(
        function (settings, data, dataIndex) {
            var min = parseInt($('#txtMin').val(), 10);
            var max = parseInt($('#txtMax').val(), 10);
            var age = parseFloat(data[8]) || 0; // use data for the age column

            if ((isNaN(min) && isNaN(max)) ||
                 (isNaN(min) && age <= max) ||
                 (min <= age && isNaN(max)) ||
                 (min <= age && age <= max)) {
                return true;
            }
            return false;
        }
    );
    var GetEntrees = function () {
        if (typeof _insiteTable != 'undefined') { _insiteTable.destroy(); } // destroy table if exist
        _insiteTable = $('#insiteTable').DataTable(optionsInSite);

        $('#insiteTable tbody').on('click', 'td.dtTables-details', function () {
            var tr = $(this).closest('tr');
            var row = _insiteTable.row(tr);
            var rowData = row.data();

            $.confirm({
                title:              '<strong>' + rowData.NumRame + '</strong>' + ' : Liste des Restrictions et DI ...',
                icon:               'glyphicon glyphicon-hand-right btn-danger',
                content:            'url:DetailInSite?rame=' + rowData.NumRame + '&numEf=' + rowData.NumRameOsm,
                animation:          'top',
                columnClass:        'col-md-12  col-lg-12',
                closeAnimation:     'bottom',
                backgroundDismiss:  false,
                confirmButton:      false,
                cancelButton:       'Fermer',
                cancelButtonClass:  'btn-info',
                closeIcon:          true
            });
        });

        // Event listener to the two range filtering inputs to redraw on input
        $('#txtMin, #txtMax').keyup(function () { _insiteTable.draw(); });
    }
});