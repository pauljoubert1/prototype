$(function () {
    var StfSelected = { ID: 1, STF: "STF D/R", IdStfRm: 2, OsmStf: "SLD", CodeSecteur: "CLD" };
    var STFs = [];
    var lstCauses = [{ label: 'P2 et +', title: 'Restriction Priorité 2 et +', value: 0 }, { label: 'Rlt 0', title: 'Roulement 0', value: 1 }, { label: 'P0', title: 'Restriction Priorité 0', value: 2 }, { label: 'P1', title: 'Restriction Priorité 1', value: 3 }];
    var lstRamesEnt = []; tabBuild = []; _tblData = []; _sitesSort = []; 
    var _user = "";
    var RolesUser = [];
    var StfsUser = [];

    // Mise en forme CSS des SelectPicker
    $('.single-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%' });
    $('.multi-select').selectpicker({ "data-style": 'btn-sm', size: 'auto', width: '100%', selectedTextFormat: 'count>3', liveSearch: false, actionsBox: true, noneSelectedText: 'Aucune sélection' });

    // Init
    $('#EntProcessing').css('display', 'block');
    $.when(InitAsp()).then(function (_init) {
        STFs        = _init.AllStfs;
        RolesUser   = _init.RolesUser;
        StfsUser    = _init.StfsSET;

        var iStfPref = parseInt(_init.STFpref);
        _user = _init.UserInfo.username;
        $.each(STFs, function (i, item) { $('#stfsList').append('<option value ="' + item.ID + '">' + item.STF + '</option>'); }); $('#stfsList').selectpicker('refresh');
        $.each(lstCauses, function (i, item) { $('#causesList').append('<option value ="' + item.value + '">' + item.label + '</option>'); }); $('#causesList').selectpicker('refresh');

        if (iStfPref == 0) { $('#stfsList').selectpicker('val', "1"); }
        else {
            GetFilterTable(STFs, 'ID', iStfPref).then(function (stfFilter) {
                StfSelected = { ID: stfFilter[0].ID, STF: stfFilter[0].STF, IdStfRm: stfFilter[0].IdStfRm, OsmStf: stfFilter[0].OsmStf, CodeSecteur: stfFilter[0].CodeSecteur };
                $('#stfsList').selectpicker('val', stfFilter[0].ID);
            })
        }
        $('#stfsList').selectpicker('refresh');
        _tblData = []; BuildDispoSelect();
        $.getJSON("http://localhost:3000/getRameReformebyStf", { idStf: StfSelected.ID, date: moment().format('YYYY-MM-DD 00:00:00') })
            .done(function (json) {
                if (json.NbRows == 1) {
                    var _tblTmp = json.data[0].Immob.split('|');
                    $.each(_tblTmp, function (i, item) { lstRamesEnt.push({ Rame: item.split('/')[0], Site: item.split('/')[1], Code: item.split('/')[2] }); });
                    GetEntSites();
                }
                else GetEntSites();
            });

        TraceUser("V3. Rame Entretien", _init.UserInfo.username, moment().format('YYYY-MM-DD HH:mm:ss'));
    })

    function BuildDispoSelect() {
        tabBuild.push("<select id=''");
        tabBuild.push(" name='selectDispo' class='single-select' ");
        tabBuild.push(" data-style='btn-primary'>");
        tabBuild.push(" <option value='0'>Non Réformée</option>");
        tabBuild.push(" <optgroup label='Réformée pour...'>");
        tabBuild.push(" <option value='1'>Dispo. sur Site</option>");
        tabBuild.push(" <option value='2'>Fiabilité</option>");
        tabBuild.push(" <option value='3'>Niv. 2</option>");
        tabBuild.push(" <option value='4'>Niv.3/4 - RA</option>");
        tabBuild.push("</select>");
    }
    // Fin Init

    /* onChange stf */
    $('#stfsList').change(function () {
        _tblData = []; lstRamesEnt = [];
        GetFilterTable(STFs, 'ID', parseInt($('#stfsList').val())).then(function (stfFilter) {
            StfSelected = { ID: stfFilter[0].ID, STF: stfFilter[0].STF, IdStfRm: stfFilter[0].IdStfRm, OsmStf: stfFilter[0].OsmStf, CodeSecteur: stfFilter[0].CodeSecteur };
            $('.selectpicker').selectpicker('deselectAll');
            _entTable.search('').draw();
            $.getJSON("http://localhost:3000/getRameReformebyStf", { idStf: StfSelected.ID, date: moment().format('YYYY-MM-DD 00:00:00') })
           .done(function (json) {
               if (json.NbRows == 1) {
                   var _tblTmp = json.data[0].Immob.split('|');
                   $.each(_tblTmp, function (i, item) { lstRamesEnt.push({ Rame: item.split('/')[0], Site: item.split('/')[1], Code: item.split('/')[2] }); });
                   _entTable.ajax.reload();
               }
               else _entTable.ajax.reload();
           });

        })
    });
    $('#btnSynt').on('click', function () { $('#modalSynt').modal({ keyboard: true, backdrop: 'static', show: true }); });

    $('#modalSynt').on('show.bs.modal', function (event) {
        if (RolesUser.indexOf('S.E.T.') == -1 || StfsUser.indexOf(StfSelected.ID) == -1)  $('#btnValidImmo"]').prop('disabled', true);
        

        // Remplissage du dataTable tblSyntTable
        $('#tblSyntProcessing').css('display', 'block');
        var _data = []; var _total = 0;
        $.each(_sitesSort, function (i, _site) {
            GetFilterTable(_tblData, 'site', _site).then(function (_datafilter) {
                var _tmp0 = Enumerable.From(_datafilter).Where(function (x) { return x.codeModifie == 1 }).Select(function (p) { return p.rame }).ToArray();  // Dispo sur Site
                var _tmp1 = Enumerable.From(_datafilter).Where(function (x) { return x.codeModifie == 2 }).Select(function (p) { return p.rame }).ToArray();  // Fiab
                var _tmp2 = Enumerable.From(_datafilter).Where(function (x) { return x.codeModifie == 3 }).Select(function (p) { return p.rame }).ToArray();  // Niv 2
                var _tmp3 = Enumerable.From(_datafilter).Where(function (x) { return x.codeModifie == 4 }).Select(function (p) { return p.rame }).ToArray();  // Niv 3/4/RA
                var _totalSite = _tmp0.length + _tmp1.length + _tmp2.length + _tmp3.length;
                _total += _totalSite;
                _data.push({
                    site: _site,
                    ds: '<div><span class="label label-info">' + _tmp0.length + ' Immob : </span></br></br><span>' + _tmp0.join('-') + '</span></div>',
                    fb: '<div><span class="label label-info">' + _tmp1.length + ' Immob : </span></br></br><span>' + _tmp1.join('-') + '</span></div>',
                    n2: '<div><span class="label label-info">' + _tmp2.length + ' Immob : </span></br></br><span>' + _tmp2.join('-') + '</span></div>',
                    ra: '<div><span class="label label-info">' + _tmp3.length + ' Immob : </span></br></br><span>' + _tmp3.join('-') + '</span></div>',
                    Total: '<div><span class="label label-warning">' + _totalSite + ' Rame(s) Immobilisée(s)</span></div>'
                });
            });
        });

        $('.modal-title').text('Synthèse des ' + _total + ' rames immobilisées ...')

        var optSynt = {
            dom: '<t>', processing: true, jQueryUI: true, paging: false, language: languageOptions, data: _data,
            columns: [{ data: "site", width: '5%' }, { data: "ds", width: '20%' }, { data: "fb", width: '20%' }, { data: "n2", width: '20%' }, { data: "ra", width: '20%' }, { data: "Total", width: '15%' }]
        };

        if (typeof _tblSyntTable != 'undefined') { _tblSyntTable.destroy(); } // destroy table if exist

        _tblSyntTable = $('#tblSyntTable').on('processing.dt', function (e, settings, processing) {
            $('#tblSyntProcessing').css('display', processing ? 'block' : 'none');
        }).DataTable(optSynt);
    });
    $('#btnValidImmo').on('click', function () {
        var tmpdata = [];
        $.when(_tblData.filter(function (x) { return x.codeModifie > 0 })).then(function (_dataForSave) {
            $.each(_dataForSave, function (i, item) { tmpdata.push(item.rame + '/' + item.site + '/' + item.codeModifie); });

            $.getJSON("http://localhost:3000/setReformeRame", { IdStf: StfSelected.ID, User: _user, ListImmo: tmpdata.join('|') })
                .done(function (json) { $('#modalSynt').modal('hide'); })
                .fail(function (jqxhr, textStatus, error) {
                    if (error) { var err = textStatus + ", " + error; alert("Error On setReformeRame: " + err); }
                    else { $('#modalSynt').modal('hide'); }
                });
        });

    });

    $('#entTable').on('processing.dt', function (e, settings, processing) { $('#EntProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsEntSite = {
        dom: 'irf<t>', processing: true, deferRender: true, jQueryUI: true, order: [[0, "asc"]], paging: false, language: languageOptions,
        ajax: { url: "GetEntInSite", data: function (d) { d.codesecteur = StfSelected.CodeSecteur; d.stfid = StfSelected.ID } },
        columns: [
            { data: "rame", searchable: true, width: 'auto' },
            { data: "site", searchable: true, width: 'auto' },
            { data: "dateDepuis", width: 'auto', className: "clsWrap", type: 'date-euro', render: function (data, type, full, meta) { return moment(data, "x").format('DD/MM/YYYY HH:mm'); } },
            { data: "cause", searchable: true, width: 'auto' },
            { data: "pgh", searchable: true, width: 'auto' },
            {
                data: null, width: 'auto', render: function (data, type, full, meta) {
                    var tabBuildFinal = tabBuild.slice();
                    tabBuildFinal[0] = "<select id='" + full.rame.trim() + "'";

                    var _indImmo = _.findIndex(lstRamesEnt, ['Rame', data.rame.trim()]);
                    var _indData = _.findIndex(_tblData, ['rame', data.rame.trim()]);

                    _tblData[_indData].codeModifie = _indImmo == -1 ? full.codeImmo : parseInt(lstRamesEnt[_indImmo].Code);

                    var _value = _tblData[_indData].codeModifie
                    switch (_value) {
                        case 0: tabBuildFinal[3] = tabBuildFinal[3].replace("'>", "' selected >"); tabBuildFinal[2] = _value == full.codeImmo ? " data-style='btn-success'>" : " data-style='btn-primary'>"; break;
                        case 1: tabBuildFinal[5] = tabBuildFinal[5].replace("'>", "' selected >"); tabBuildFinal[2] = _value == full.codeImmo ? " data-style='btn-warning'>" : " data-style='btn-primary'>"; break;
                        case 2: tabBuildFinal[6] = tabBuildFinal[6].replace("'>", "' selected >"); tabBuildFinal[2] = _value == full.codeImmo ? " data-style='btn-warning'>" : " data-style='btn-primary'>"; break;
                        case 3: tabBuildFinal[7] = tabBuildFinal[7].replace("'>", "' selected >"); tabBuildFinal[2] = _value == full.codeImmo ? " data-style='btn-warning'>" : " data-style='btn-primary'>"; break;
                        case 4: tabBuildFinal[8] = tabBuildFinal[8].replace("'>", "' selected >"); tabBuildFinal[2] = _value == full.codeImmo ? " data-style='btn-danger'>" : " data-style='btn-primary'>"; break;
                    }

                    return tabBuildFinal.join('');
                }
            },
            { data: "codeCause", searchable: true, visible: false }
        ],
        createdRow: function (row, data, index) {
            switch (data.codeCause) {
                case 0: $('td', row).addClass("VertClos"); break;
                case 1: $('td', row).addClass("GrisAnnule"); break;
                case 2: $('td', row).addClass("red" + "txt"); break;
                case 3: $('td', row).addClass("OrangeDiCree"); break;
            }
        },
        initComplete: function (settings, json) {
            $('select[name="selectDispo"][data-style="btn-success"]').selectpicker({ style: 'btn-success btn-xs', size: 'auto', width: '100%', hearder: true });
            $('select[name="selectDispo"][data-style="btn-danger"]').selectpicker({ style: 'btn-danger btn-xs', size: 'auto', width: '100%', hearder: true });
            $('select[name="selectDispo"][data-style="btn-warning"]').selectpicker({ style: 'btn-warning btn-xs', size: 'auto', width: '100%', hearder: true });
            $('select[name="selectDispo"][data-style="btn-primary"]').selectpicker({ style: 'btn-primary btn-xs', size: 'auto', width: '100%', hearder: true });

            $('.single-select[name="selectDispo"]').change(function () {
                var _ind = _.findIndex(_tblData, ['rame', this.id.trim()]);
                var _style = this.dataset.style;
                if (_ind > -1) {
                    $('#' + this.id).selectpicker('setStyle', 'btn-primary', 'remove');
                    $('#' + this.id).selectpicker('setStyle', 'btn-warning', 'remove');
                    $('#' + this.id).selectpicker('setStyle', 'btn-success', 'remove');
                    $('#' + this.id).selectpicker('setStyle', 'btn-danger', 'remove');

                    _tblData[_ind].codeModifie = parseInt(this.value.trim());
                    if (_tblData[_ind].codeStf != parseInt(this.value.trim())) $('#' + this.id).selectpicker('setStyle', 'btn-primary', 'add');
                    else  $('#' + this.id).selectpicker('setStyle', _style, 'add');
                }
            });
            $('select[name="selectDispo"]').selectpicker('refresh');
        },
        drawCallback: function (settings) { }
    };

    var GetEntSites = function () {
        if (typeof _entTable != 'undefined') { _entTable.destroy(); } // destroy table if exist

        _entTable = $('#entTable')
        .on('xhr.dt', function (e, settings, json, xhr) {
            _tblData = json.data;
            $('#sitesList').get(0).options.length = 0;
            GetUniqOfTable(json.data, 'site').done(function (_sites) {
                _sitesSort = _sites.sort();
                $.each(_sitesSort, function (i, item) { $('#sitesList').append('<option value ="' + item + '">' + item + '</option>'); }); $('#sitesList').selectpicker('refresh');
            })
        }) .DataTable(optionsEntSite);

        $('#sitesList').change(function () {
            var selectedOptSites = $(this).val();
            if (selectedOptSites) _entTable.columns(1).search(selectedOptSites.join("|"), true, false).draw();
            else _entTable.columns(1).search('').draw();
            _entTable.column(6).visible(false);
        });
        $('#causesList').change(function () {
            var selectedOptSites = $(this).val();
            if (selectedOptSites) _entTable.columns(6).search(selectedOptSites.join("|"), true, false).draw();
            else _entTable.columns(6).search('').draw();
            _entTable.column(6).visible(false);
        });

    }



})