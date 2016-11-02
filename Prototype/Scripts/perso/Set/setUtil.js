$(function () {
    window.onload = onLoad;
    var RameSelected    = { ID: 0, EAB: "0", NumEF: "0", IdRexM: 0, IdSerie: 0, IdSousSerie: 0, Serie: "0", SousSerie: "0", CodeSerie: "0", IdFlotteOsm: 0 };
    var StfSelected     = { ID: 1, STF: "STF D/R", IdStfRm: 2, OsmStf: "SLD" };
    var filterActifIntv = { dc: true, dd: false, df: false, db: false, ti: false, td: false, st: false, sr: false };
    var filterActifRlt  = { sg: false };
    var tabFlotteId     = []
    var STFs            = [];

    var tabActive       = "Restrictions";
    var valPeriode      = "";
    var dtFinInt1       = moment().subtract(1, 'days')._d;
    var dtFinInt2       = moment()._d;
    var NavOrigine      = "";
    //var dtDebIncident   = moment().subtract(3, 'month').format('MM/DD/YYYY');
    //var dtFinIncident   = moment().add(1, 'day').format('MM/DD/YYYY');
    var dtDebIncident = moment().subtract(3, 'month').format('DD/MM/YYYY');
    var dtFinIncident = moment().add(1, 'day').format('DD/MM/YYYY');
    var dtDebRoulement = moment()._d;
    var dtFinRoulement  = moment()._d;

    var RolesUser       = [];
    var StfsUser        = [];
    var STfPrefUser     = "0";
    var STfIdPrefUser   = 0;
    var datasetSemelle  = new Array();

    var tabAllRame      = [];
    var tabRestGrf      = [];
    var tabBuild        = [];
    var tabEtatM_Osm    = [];
    var tabEtatM_Grf    = [];

    var _username       = "";
    var _htmlSelectEM   = "";
    var _ToCtrlStf      = { ID: 0, sourceId: 0, sourceNum: 0, source: '', libelleId: 0, sslibelleId: 0, rameId: 0, stfId: 0, dtCreate: '', dtSource: '', userName: '', mode: '' };

    var totalFilterRgf = { status: 0, priority: 0, specificite: 0, libelle: 0 };
    var objFiltersRestGrf = {
        statuts: [{ statut: 'Amortie', value: 'O', selected: false, loaded: true }, { statut: 'Non Amortie', value: 'N', selected: false, loaded: true }],
        priority: [{ prio: 'P0', value: 0, selected: false, loaded: true }, { prio: 'P1', value: 1, selected: false, loaded: true }, { prio: 'P2', value: 2, selected: false, loaded: true }, { prio: 'P3', value: 3, selected: false, loaded: true }, { prio: 'P4', value: 4, selected: false, loaded: true }, { prio: 'P5', value: 5, selected: false, loaded: true }, { prio: 'P6', value: 6, selected: false, loaded: true }, { prio: 'P7', value: 7, selected: false, loaded: true }, { prio: 'P8', value: 8, selected: false, loaded: true }, { prio: 'P9', value: 9, selected: false, loaded: true }, { prio: 'P10', value: 10, selected: false, loaded: true }],
        specificite: [{ specif: 'DU', value: 'DU', selected: false, loaded: true }, { specif: 'CRI', value: 'CRI', selected: false, loaded: true }, { specif: 'COT', value: 'COT', selected: false, loaded: true }, { specif: 'CLD', value: 'CLD', selected: false, loaded: true }, { specif: 'BTX', value: 'BTX', selected: false, loaded: true }, { specif: 'PNO', value: 'PNO', selected: false, loaded: true }, { specif: 'OCB', value: 'OCB', selected: false, loaded: true }],
        libelle: []
    };
    var filterRgfLoaded = { status: [], priority: [], specificite: [], librest: [], datepose: { selected: true, ddp: moment().subtract(1, 'days'), dfp: moment() }, dateamort: { selected: false, ddp: moment(), dfp: moment() } };
    
    $.when(InitAsp()).then(function (_init) {
        STFs            = _init.AllStfs;
        RolesUser       = _init.RolesUser;
        StfsUser        = _init.StfsSET;
        STfPrefUser     = _init.STFpref;
        STfIdPrefUser   = parseInt(_init.STFpref);
        _username       = _init.UserInfo.username;

        $.each(STFs, function (i, item) { $('#stfsList').append('<option value ="' + item.ID + '">' + item.STF + '</option>'); }); $('#stfsList').selectpicker('refresh');

        if (STfIdPrefUser == 0) { $('#stfsList').selectpicker('val', "1"); }
        else {
            GetFilterTable(STFs, 'ID', STfIdPrefUser).then(function (stfFilter) {
                StfSelected = { ID: stfFilter[0].ID, STF: stfFilter[0].STF, IdStfRm: stfFilter[0].IdStfRm, OsmStf: stfFilter[0].OsmStf, CodeSecteur: stfFilter[0].CodeSecteur };
                $('#stfsList').selectpicker('val', stfFilter[0].ID);
            })
        }
        $('#stfsList').selectpicker('refresh');
        
        $('#_stfHidden').val(StfSelected.ID); $('#_rameHidden').val(0);// Pour le Upload
        InitCtrl();
        BuidFiltersListsRestGrf();
        BuildHtmlSelect();
        GetSeriesByStf();
    })

    function InitCtrl() {    // Activation des tooltips
        $('[data-toggle="tooltip"]').tooltip({ 'container': 'body', delay: { "show": 500, "hide": 100 } });

        /* bootstrap multi-select */
        $('.multi-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%', selectedTextFormat: 'count>3', liveSearch: true });
        $('.single-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%' });
        $('.selectpicker').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%' });
        $('.btn-group, .bootstrap-select, .show-tick').css('width', '100%');

        // change collapse icon on click
        // Osmose
        $('#di-collapse-interv').on('hide.bs.collapse', function () { $('#di-filtres-icone-interv').toggleClass('fa-angle-down fa-angle-up'); });
        $('#di-collapse-interv').on('show.bs.collapse', function () { $('#di-filtres-icone-interv').toggleClass('fa-angle-down fa-angle-up'); });
        $('#di-collapse-crt').on('hide.bs.collapse', function () { $('#di-filtres-icone-crt').toggleClass('fa-angle-down fa-angle-up'); });
        $('#di-collapse-crt').on('show.bs.collapse', function () { $('#di-filtres-icone-crt').toggleClass('fa-angle-down fa-angle-up'); });
        $('#di-collapse-ft').on('hide.bs.collapse', function () { $('#di-filtres-icone-ft').toggleClass('fa-angle-down fa-angle-up'); });
        $('#di-collapse-ft').on('show.bs.collapse', function () { $('#di-filtres-icone-ft').toggleClass('fa-angle-down fa-angle-up'); });
        $('#di-collapse-prev').on('hide.bs.collapse', function () { $('#di-filtres-icone-prev').toggleClass('fa-angle-down fa-angle-up'); });
        $('#di-collapse-prev').on('show.bs.collapse', function () { $('#di-filtres-icone-prev').toggleClass('fa-angle-down fa-angle-up'); });
        // Griffe
        $('#di-collapse-rest').on('hide.bs.collapse', function () { $('#di-filtres-icone-rest').toggleClass('fa-angle-down fa-angle-up'); });
        $('#di-collapse-rest').on('show.bs.collapse', function () { $('#di-filtres-icone-rest').toggleClass('fa-angle-down fa-angle-up'); });
        $('#di-collapse-rlt').on('hide.bs.collapse', function () { $('#di-filtres-icone-rlt').toggleClass('fa-angle-down fa-angle-up'); });
        $('#di-collapse-rlt').on('show.bs.collapse', function () { $('#di-filtres-icone-rlt').toggleClass('fa-angle-down fa-angle-up'); });
        // Incident
        $('#di-collapse-inc').on('hide.bs.collapse', function () { $('#di-filtres-icone-inc').toggleClass('fa-angle-down fa-angle-up'); });
        $('#di-collapse-inc').on('show.bs.collapse', function () { $('#di-filtres-icone-inc').toggleClass('fa-angle-down fa-angle-up'); });
        // Semelle
        $('#di-collapse-sem').on('hide.bs.collapse', function () { $('#di-filtres-icone-sem').toggleClass('fa-angle-down fa-angle-up'); });
        $('#di-collapse-sem').on('show.bs.collapse', function () { $('#di-filtres-icone-sem').toggleClass('fa-angle-down fa-angle-up'); });
        // Km
        $('#di-collapse-km').on('hide.bs.collapse', function () { $('#di-filtres-icone-km').toggleClass('fa-angle-down fa-angle-up'); });
        $('#di-collapse-km').on('show.bs.collapse', function () { $('#di-filtres-icone-km').toggleClass('fa-angle-down fa-angle-up'); });
    }
    function GetSeriesByStf() {
        $.when(util_GetSeriesByStf(StfSelected.ID)).done(function (_series) {
            $('#seriesList').get(0).options.length = 0;
            $('#seriesList').append('<option value ="0">Série...</option>');
            $.each(_series.data, function (i, item) { $('#seriesList').append('<option value ="' + item.ID + '">' + item.Serie + '</option>'); });
            $('#seriesList').selectpicker('refresh');
            GetSousSeriesByStf();
        })
    }
    function GetSousSeriesByStf() {
        $.when(util_GetSousSeriesByStf(StfSelected.ID, parseInt($('#seriesList').val()))).done(function (_sousseries) {
            $('#sousseriesList').get(0).options.length = 0;
            $('#sousseriesList').append('<option value ="0">Sous-Série...</option>');
            $.each(_sousseries.data, function (i, item) { $('#sousseriesList').append('<option value ="' + item.ID + '">' + item.SousSerie + '</option>'); });
            $('#sousseriesList').selectpicker('refresh');
            getRames();
        })
    }
    function BuidFiltersListsRestGrf() {
        $.each(objFiltersRestGrf.statuts, function (i, item) { $('#statesList').append('<option value ="' + item.value + '">' + item.statut + '</option>'); }); $('#statesList').selectpicker('refresh');
        $.each(objFiltersRestGrf.specificite, function (i, item) { $('#specifsList').append('<option value ="' + item.value + '">' + item.specif + '</option>'); }); $('#specifsList').selectpicker('refresh');
        $.each(objFiltersRestGrf.priority, function (i, item) { $('#prioritysList').append('<option value ="' + item.value + '">' + item.prio + '</option>'); }); $('#prioritysList').selectpicker('refresh');

        // Libellés GRIFFE
        var _tmplib = "";
        $.getJSON("http://localhost:3000/getLibellesRestriction", { IdStf: StfSelected.ID, IdSerie: parseInt($('#seriesList').val()), IdSousSerie: parseInt($('#sousseriesList').val()), IdRame: RameSelected.ID })
        .done(function (json) {
            $.when(Enumerable.From(json.data).GroupBy('$.Famille').Select("x => {group: x.Key(), children : Enumerable.From(x.source).Select('p => {libelle: p.Libelle, value: p.Libelle}').ToArray() } ").ToArray())
                .done(function (_tblLib) {
                    _tmplib = "<select id='libsList' class='selectpicker' data-live-search='true' title='Libellés' multiple>";
                    $.each(_tblLib, function (i, item) {
                        _tmplib += '<optgroup label="' + item.group + '">';
                        $.each(_tblLib[i].children, function (j, item) {
                            _tmplib +='<option value ="' + item.value + '">' + item.libelle + '</option>';
                            objFiltersRestGrf.libelle.push({ libelle: item.libelle, value: item.value, selected: false, loaded: true });
                        });
                        _tmplib +='</optgroup>';
                    });
                    _tmplib += '</select>';
                    $('#idLibGrf').append(_tmplib);
                    $('#libsList').selectpicker('refresh');
                    totalFilterRgf = { status: $('#statesList').get(0).options.length, priority: $('#prioritysList').get(0).options.length, specificite: $('#specifsList').get(0).options.length, libelle: $('#libsList').get(0).options.length };
                    $('.btn-group, .bootstrap-select, .show-tick').css('width', '100%');
                })
        }).fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur Recup Libellés GRIFFE : " + err); });

    }
    function BuildHtmlSelect() {
        tabBuild.push("<select id=''");
        tabBuild.push(" name='selectCtrlStfOsm' class='single-select' ");
        tabBuild.push(" data-style='btn-primary'>");
        tabBuild.push(" <option value='0.0'>Veille</option>");
        $.getJSON("http://localhost:3000/getLibEtatMbyStf", { idStf: StfSelected.ID })
        .done(function (libEm) {
            $.getJSON("http://localhost:3000/getDetailLibEtatMbyLibId", { idStf: StfSelected.ID, idLib: 0 })
            .done(function (DetailLibEm) {
                $.each(libEm, function (i, _lib) {
                    tabBuild.push("<optgroup label='" + _lib.LibCourt + "'>");
                    GetFilterTable(DetailLibEm,'IdLibState',_lib.ID).then(function(_filter){
                        $.each(_filter, function (j, _detail) { tabBuild.push("<option value='" + _lib.ID + "." + _detail.ID + "'>" + _lib.LibCourt + " - " + _detail.DetailState.toLowerCase() + "</option>"); })
                    });
                });
                tabBuild.push("</select>");
            })
            .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Request Failed: " + err); });
        })
        .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Request Failed: " + err); });
    }
    function getRames() {
        // Reset RameSelect
        $('#RameInput').val('');$('#_stfHidden').val(StfSelected.ID); $('#_rameHidden').val(RameSelected.ID);
        RameSelected = { ID: 0, EAB: "0", NumEF: "0", IdRexM: 0, IdSerie: 0, IdSousSerie: 0, Serie: "0", SousSerie: "0", CodeSerie: "0", IdFlotteOsm: 0 };
        $('#rame-AllPanne')[0].classList.add("disabled"); $('#rame-AllPanne').prop("disabled", true); $('#rame-AllPanne').css("cursor", "not-allowed");
        // Retire les classes propes au typehead
        $('.typeahead-hint, .typeahead-result, .typeahead-filter-button, .typeahead-filter').remove();

        var _tblFilterTypeHead = [];
        $.when(util_GetRames(0, StfSelected.ID, parseInt($('#seriesList').val()), parseInt($('#sousseriesList').val()), '', '')).then(function (_rames) {
            tabAllRame = _rames.data;
            $.when(GetUniqOfTable(_rames.data, 'FlotteOsmId')).then(function (_tblIdFlotteOsmUnique) {
                tabFlotteId = _tblIdFlotteOsmUnique;
                $.each(tabFlotteId, function (i, _flotte) { _flotte = "'" + _flotte + "'"; })
            });
            $.when(GetUniqOfTable(_rames.data, 'Serie_Ss')).then(function (_tblSousSerieUnique) {
                $.each(_tblSousSerieUnique, function (i, item_ss) { _tblFilterTypeHead.push({ key: "Serie_Ss", value: item_ss, display: '<strong>Serie - (sous.Série)</strong> : ' + item_ss }); });
                _tblFilterTypeHead.push({ value: "*", display: 'Toutes' });

                // Alimentation du TypeHead
                $.typeahead({
                    input: "#RameInput", offset: true, searchOnFocus: true, highlight: true, minLength: 1, maxItem: 8, maxItemPerGroup: 6, order: "asc", hint: true, loadingAnimation: true,
                    emptyTemplate: "Aucune rame n'existe avec {{query}}", group: ["Serie_Ss", "Série - (SousSérie) : {{group}} "], display: ["EAB", "NumEF"], template: "{{EAB}}",  source: _rames.data, dropdownFilter: _tblFilterTypeHead,
                    callback: {
                        onClickAfter: function (node, a, item, event) {
                            RameSelected = item;
                            $('#spRameText').removeClass('error-input'); $('#_stfHidden').val(StfSelected.ID); $('#_rameHidden').val(RameSelected.ID);
                            ActualiseData();
                            $('#rame-AllPanne')[0].classList.remove("disabled"); $('#rame-AllPanne').prop("disabled", false);
                            $('#rame-AllPanne').css("cursor", "pointer");
                        },
                        onResult: function (node, query, result, resultCount) { RameSelected = result[0]; },
                        onNavigate: function (node, query, event) {
                            if (event.keyCode == 13) {
                                $("#RameInput").val(RameSelected.EAB);
                                $('#spRameText').removeClass('error-input'); $('#_stfHidden').val(StfSelected.ID); $('#_rameHidden').val(RameSelected.ID);
                                ActualiseData();
                                $('#rame-AllPanne')[0].classList.remove("disabled"); $('#rame-AllPanne').prop("disabled", false); $('#rame-AllPanne').css("cursor", "pointer");
                            }
                        }
                    }
                });
                ActualiseData();
            });
        });
    }

    function ActualiseData() {
        $('#spRameText').removeClass('error-input');
        $('#rame-input-empty').css("cursor", (tabActive == "Roulement / PGH" || tabActive == "Km") ? "not-allowed" : "pointer");

        if (tabActive != "") TraceUser("V3. " + tabActive, _username, moment().format('YYYY-MM-DD HH:mm:ss')); 
        $('[data-toggle="tooltip"]').tooltip('hide');

        switch (tabActive) {
            case "Restrictions":
                $('#InterventionProcessing').css('display', 'block');
                filterRgfLoaded.status      = ($('#statesList').val()       == null || totalFilterRgf.status == $('#statesList').val().length) ?        [] : $('#statesList').val();
                filterRgfLoaded.priority    = ($('#prioritysList').val()    == null || totalFilterRgf.priority == $('#prioritysList').val().length) ?   [] : $('#prioritysList').val();
                filterRgfLoaded.specificite = ($('#specifsList').val()      == null || totalFilterRgf.specificite == $('#specifsList').val().length) ?  [] : $('#specifsList').val();
                filterRgfLoaded.librest     = ($('#libsList').val()         == null || totalFilterRgf.libelle == $('#libsList').val().length) ?         [] : $('#libsList').val();

                $.getJSON("http://localhost:3000/getEtatMbyStf", { idStf: StfSelected.ID, clos: 0, source: 'GRF' })
                   .done(function (json) {
                       tabEtatM_Grf = json.Grf;
                       if (typeof restrictionTable1 == 'undefined') GetRestrictionsGriffe();
                       else {
                           restrictionTable1.ajax.reload();
                           restrictionTable1.column(13).visible(false);
                       }
                   })
                   .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Request Failed: " + err); $('#InterventionProcessing').css('display', 'none'); });
                break;
            case "Interventions":
                $('#InterventionProcessing').css('display', 'block');
                if (!filterActifIntv.dc && !filterActifIntv.dd && !filterActifIntv.df && !filterActifIntv.db) {
                    filterActifIntv.sr = $('#sitesList').val() != null && $('#sitesList').val().length > 0;
                    filterActifIntv.st = $('#statutsList').val() != null && $('#statutsList').val().length > 0;
                    filterActifIntv.ti = $('#typesIntList').val() != null && $('#typesIntList').val().length > 0;
                    filterActifIntv.td = $('#typesDiList').val() != null && $('#typesDiList').val().length > 0;
                }
                $.getJSON("http://localhost:3000/getEtatMbyStf", { idStf: StfSelected.ID, clos: 0, source: 'OSM' })
                   .done(function (json) {
                       tabEtatM_Osm = json.Osm;
                       if (typeof intervTable1 == 'undefined') GetInterventionsOsm();
                       else intervTable1.ajax.reload();
                   })
                   .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Request Failed: " + err); $('#InterventionProcessing').css('display', 'none'); });
                break;
            case "CRT":
                if (typeof crtTable1 == 'undefined')    GetCrtOsm();
                else                                    crtTable1.ajax.reload();
                break;
            case "Fait Technique":
                if (typeof ftTable1 == 'undefined') GetFaitTechOsm();
                else                                ftTable1.ajax.reload();
                break;
            case "Roulement / PGH":
                filterActifRlt.sg = $('#sitesGriffe').val() != null && $('#sitesGriffe').val().length > 0;
                if (RameSelected.ID == 0) $('#spRameText').addClass('error-input');
                else {
                    if (typeof roulementTable1 == 'undefined')  GetRoulementGriffe();
                    else                                        roulementTable1.ajax.reload();
                }
                break;
            case "Incidents":
                if (typeof incidentTable1 == 'undefined')   GetIncidRexmat();
                else                                        incidentTable1.ajax.reload();
                break;
            case "Semelles":
                if (typeof semelleTable1 == 'undefined')    getCtrlsSemelles();
                else                                        semelleTable1.ajax.reload();
                break;
            case "Km":
                if (RameSelected.ID == 0) $('#spRameText').addClass('error-input');
                else {
                    if (typeof kmTable1 == 'undefined') GetKM();
                    else                                kmTable1.ajax.reload();
                }
                break;
            case "Fichiers":
                if (typeof uploadTable1 == 'undefined') getFilesPj();
                else uploadTable1.ajax.reload();
                break;
            case "Préventif":
                if (RameSelected.ID == 0) $('#spRameText').addClass('error-input');
                else {
                    if (typeof prevTable1 == 'undefined') loadPrev();
                    else prevTable1.ajax.reload();
                }
                break;
        }
        // Remise en état du bouton Clear InputRame
        $('#rame-input-empty').css('color', '#FFF');  $('#rame-input-empty').css('background', '#009AA6');
    }
    function SetCtrlStf() {
        $.getJSON("http://localhost:3000/SetEtatMbyRame", {
            sourceId:       _ToCtrlStf.sourceId,
            sourceNum:      _ToCtrlStf.sourceNum,
            source:         _ToCtrlStf.source,
            libelleId:      _ToCtrlStf.libelleId,
            sslibelleId:    _ToCtrlStf.sslibelleId,
            rameId:         _ToCtrlStf.rameId,
            stfId:          _ToCtrlStf.stfId,
            dtCreate:       _ToCtrlStf.dtCreate,
            dtSource:       _ToCtrlStf.dtSource,
            userName:       _ToCtrlStf.userName,
            mode:           _ToCtrlStf.mode
        })
        .done(function (ctrl) { })
        .fail(function (jqxhr, textStatus, error) { var err = textStatus + "," + error; alert("SetCtrlStf >> Erreur Mise sous Ctrl : " + err); })
    }
    function UpdCtrlStf() {
        $.getJSON("http://localhost:3000/UpdEtatMbyId", {
            sourceId:       _ToCtrlStf.sourceId,
            sourceNum:      _ToCtrlStf.sourceNum,
            source:         _ToCtrlStf.source,
            libelleId:      _ToCtrlStf.libelleId,
            sslibelleId:    _ToCtrlStf.sslibelleId,
            rameId:         _ToCtrlStf.rameId,
            stfId:          _ToCtrlStf.stfId,
            dtCreate:       _ToCtrlStf.dtCreate,
            dtSource:       _ToCtrlStf.dtSource,
            userName:       _ToCtrlStf.userName,
            mode:           _ToCtrlStf.mode,
            id:             _ToCtrlStf.ID
        })
        .done(function (ctrl) { })
        .fail(function (jqxhr, textStatus, error) { var err = textStatus + "," + error; alert("UpdCtrlStf >> Erreur Mise sous Ctrl : " + err); })
    }
    function SetColorCtrlStf(_idSelect, _lib1Id) {
        $('#' + _idSelect).selectpicker('setStyle', 'btn-primary', 'remove');
        $('#' + _idSelect).selectpicker('setStyle', 'btn-danger', 'remove');
        $('#' + _idSelect).selectpicker('setStyle', 'btn-warning', 'remove');
        if (_lib1Id != 11 && _lib1Id != 0) { $('#' + _idSelect).selectpicker('setStyle', 'btn-danger', 'add'); }
        else {
            if (_lib1Id == 0) { $('#' + _idSelect).selectpicker('setStyle', 'btn-primary', 'add'); }
            if (_lib1Id == 11) { $('#' + _idSelect).selectpicker('setStyle', 'btn-warning', 'add'); }
        }
        $('#' + _idSelect).selectpicker('refresh');
    }

    // change active tab
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        tabActive = e.target.textContent.trim(); // newly activated tab
        switch (tabActive) {
            case "Restrictions":
                $('#FilterDtPoseRest').prop("checked", true);
                filterRgfLoaded.datepose.selected = true;
                var checkInput = $('#FilterDtPoseRest').data('input-name');    // InputDate lié à ce checkbox
                var checkButton = $('#FilterDtPoseRest').data('button-name');  // ButtonCalandar lié à ce checkbox
                $('#' + checkInput).prop("disabled", false);
                $('#' + checkButton).prop("disabled", false);
                break;
            case "Interventions":
                $('#FilterDtCreInt').prop("checked", true);
                var checkInput = $('#FilterDtCreInt').data('input-name');    // InputDate lié à ce checkbox
                var checkButton = $('#FilterDtCreInt').data('button-name');  // ButtonCalandar lié à ce checkbox
                $('#' + checkInput).prop("disabled", false);
                $('#' + checkButton).prop("disabled", false);
                filterActifIntv.dc = true;
                break;
            case "Fait Technique":
                $('#FilterDtFaitTech').prop("checked", true);
                var checkInput = $('#FilterDtFaitTech').data('input-name');    // InputDate lié à ce checkbox
                var checkButton = $('#FilterDtFaitTech').data('button-name');  // ButtonCalandar lié à ce checkbox
                $('#' + checkInput).prop("disabled", false);
                $('#' + checkButton).prop("disabled", false);
                break;
            case "Km":
                break;
            case "CRT":
                break;
            case "Roulement / PGH":
                break;
            case "Incidents":
                break;
            case "Semelles":
                if(RameSelected.ID != 0)    $('input[name="dtSemelle"]').daterangepicker({ locale: localType, startDate: moment().subtract(1, 'month'), endDate: moment(), "showDropdowns": true, "showWeekNumbers": true });
                else                        $('input[name="dtSemelle"]').daterangepicker({ locale: localType, startDate: moment(), endDate: moment(), "showDropdowns": true, "showWeekNumbers": true });
                break;
            case "Fichiers":
                break;
            case "Préventif":
                break;
        }
        ActualiseData();
    });
    // click LoadCumulKM
    $('#_LoadCumul').on('click', function () { loadCumulKm(); })
    // click RefreshButton
    $('#_refresh').on('click', function () { $('#_i_refresh').addClass("fa-spin"); ActualiseData() });
    // onClick Clear rame btn
    $('#rame-input-empty').on('click', function () {
            $('#RameInput').val('');
            RameSelected = { ID: 0, EAB: "0", NumEF: "0", IdRexM: 0, IdSerie: 0, IdSousSerie: 0, Serie: "0", SousSerie: "0", CodeSerie: "0" };
            $('#_stfHidden').val(StfSelected.ID); $('#_rameHidden').val(RameSelected.ID);
            $('#rame-AllPanne')[0].classList.add("disabled"); $('#rame-AllPanne').prop("disabled", true); $('#rame-AllPanne').css("cursor", "not-allowed");
            ActualiseData();
    });
    /* onClick Reste à faire rame */
    $('#rame-AllPanne').on('click', function () {
        var url     = "Set/GetAnomaliesRame";
        var data    = { eab: RameSelected.EAB, numef: RameSelected.NumEF };
        url         += '?' + decodeURIComponent($.param(data));
        if (RameSelected.ID > 0) window.location = url;
        TraceUser("V3. Anomalie Rame (" + RameSelected.EAB + ")", _username, moment().format('YYYY-MM-DD HH:mm:ss'));
    });
    /* onChange stf, série, soussérie */
    $('#stfsList').change(function () {
        GetFilterTable(STFs, 'ID', parseInt($('#stfsList').val())).then(function (stfFilter) {
            StfSelected = { ID: stfFilter[0].ID, STF: stfFilter[0].STF, IdStfRm: stfFilter[0].IdStfRm, OsmStf: stfFilter[0].OsmStf, CodeSecteur: stfFilter[0].CodeSecteur };
            GetSeriesByStf();
        })
    });
    $('#seriesList').change(function () { GetSousSeriesByStf(); });
    $('#sousseriesList').change(function () { getRames(); });

    /* date range picker icone clickable */
    $('.date-picker-icon').on('click', function () {
        var data = $(this).data('input-name');
        $('input[name="' + data + '"]').focus();
    })


    /* Region FT Osmose     ------------------------------------------------------------------------------- */
    $('input[name="dtFaitTech"]').daterangepicker({ locale: localType, startDate: moment().subtract(1, 'days'), endDate: moment(), "showDropdowns": true, "showWeekNumbers": true });
    $('#dtFaitTech').on('apply.daterangepicker', function (ev, picker) { ActualiseData(); });
    $('#FilterDtFaitTech').change(function () {
        var checkInput = $(this).data('input-name');    // InputDate lié à ce checkbox
        var checkButton = $(this).data('button-name');  // ButtonCalandar lié à ce checkbox
        $('#' + checkInput).prop("disabled", !$(this).prop('checked'));
        $('#' + checkButton).prop("disabled", !$(this).prop('checked'));

        ActualiseData();
    });
    /* datatables */
    $('#ftTable').on('processing.dt', function (e, settings, processing) { $('#FtProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsFtOsm = {
        "dom":              domOptions,
        "processing":       true,
        "deferRender":      true,
        "jQueryUI":         true,
        "order":            [[0, "desc"]],
        "filter":           true,
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
        "iDisplayLength": 25,
        "language": languageOptions,
        "ajax": {
            "url": "http://localhost:3000/getFaitTechOsmose",
            "data": function (d) {
                d.stf       = StfSelected.OsmStf;
                d.rame      = RameSelected.NumEF;
                d.flotte    = $('#seriesList').val() == "0" || RameSelected.NumEF != "0" ? "" : "(" + tabFlotteId.join(',') + ")";
                if ($('#FilterDtFaitTech').prop('checked')) { d.dtCrea = $('input[name="dtFaitTech"]').val(); }
            }
        },
        "columns": [
            { "data": "DateCreate", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return moment(data).format('DD/MM/YYYY HH:mm'); } },
            { "data": "NumEF", "className": "clsWrap" },
            { "data": "Statut", "className": "clsWrap", "searchable": true },
            { "data": "Emeteur", "className": "clsWrap", "searchable": true },
            { "data": "DescFt", "searchable": true },
            { "data": "CmtFt", "searchable": true },
            { "data": "Gravite", "searchable": true },
            { "data": "DateSignalement", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return data == null ? null : moment(data).format('DD/MM/YYYY HH:mm'); } },
            { "data": "FctPanne", "className": "clsWrap", "searchable": true },
            { "data": "Recidive" }
        ],
        "drawCallback": function (settings) { },
        "createdRow": function (row, data, index) {
            switch (data.Statut.trim()) {
                case "CREE":
                    $('td', row).addClass("red" + "txt");
                    break;
                case "PRISCOMPTE":
                    $('td', row).addClass("OrangeDiCree");
                    break;
                case "RESOLU":
                    $('td', row).addClass("VertClos");
                    break;
            }
        }
    };

    var GetFaitTechOsm = function () {
        if (typeof ftTable1 != 'undefined') { ftTable1.destroy(); } // destroy table if exist
        ftTable1 = $('#ftTable')
            .on('error.dt', function (e, settings, techNote, message) { console.log('An error has been reported by DataTables: ', message); })
            .on('xhr.dt', function (e, settings, json, xhr) { $('#_i_refresh').removeClass("fa-spin"); })
            .DataTable(optionsFtOsm);
    }
    /* Fin Region FT Osmose ------------------------------------------------------------------------------- */

    /* Region Intervention Osmose ----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    $('input[name="dtCreInt"], input[name="dtDebInt"], input[name="dtFinInt"], input[name="dtButee"]').daterangepicker({ locale: localType, "showDropdowns": true, "showWeekNumbers": true });
    $('#dtCreInt,#dtFinInt,#dtDebInt,#dtButee').on('apply.daterangepicker', function (ev, picker) { ActualiseData(); });
    $('#FilterDtCreInt,#FilterDtDebInt,#FilterDtFinInt,#FilterDtButee').change(function () {
        var checkInput = $(this).data('input-name');    // InputDate lié à ce checkbox
        var checkButton = $(this).data('button-name');  // ButtonCalandar lié à ce checkbox
        $('#' + checkInput).prop("disabled", !$(this).prop('checked'));
        $('#' + checkButton).prop("disabled", !$(this).prop('checked'));
        filterActifIntv.dc = $('#FilterDtCreInt').prop('checked');
        filterActifIntv.dd = $('#FilterDtDebInt').prop('checked');
        filterActifIntv.df = $('#FilterDtFinInt').prop('checked');
        filterActifIntv.db = $('#FilterDtButee').prop('checked');
        ActualiseData();

    });
   /* datatables */
    $('#intervTable').on('processing.dt', function (e, settings, processing) { $('#InterventionProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsIntOsm = {
        "dom": domOptions,
        "processing": true,
        "deferRender": true,
        "jQueryUI": true,
        "order": [[2, "desc"]],
        "filter":true,
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
        "iDisplayLength": 25,
        "language": languageOptions,
        "ajax": {
            "url": "http://localhost:3000/getInterventionsOsmose",
            "data": function (d) {
                d.stf       = StfSelected.OsmStf;
                d.rame      = RameSelected.NumEF;
                d.flotte    = $('#seriesList').val() == "0" || RameSelected.NumEF != "0" ? "" : "(" + tabFlotteId.join(',') + ")";
                if ($('#FilterDtCreInt').prop('checked')) { d.dtCrea = $('input[name="dtCreInt"]').val(); }
                if ($('#FilterDtDebInt').prop('checked')) { d.dtDebInt = $('input[name="dtDebInt"]').val(); }
                if ($('#FilterDtFinInt').prop('checked')) { d.dtFinInt = $('input[name="dtFinInt"]').val(); }
                if ($('#FilterDtButee').prop('checked')) { d.dtButee = $('input[name="dtButee"]').val(); }
                d.status    = filterActifIntv.st ? $('#statutsList').val().join("|") : null;
                d.sr        = filterActifIntv.sr ? $('#sitesList').val().join("|") : null;
                d.typeDI    = filterActifIntv.td ? $('#typesDiList').val().join("|") : null;
                d.typeINT   = filterActifIntv.ti ? $('#typesIntList').val().join("|") : null;
            }
        },
        "columns": [
            { "data": null, "className": 'dtTables-details', "orderable": false, "defaultContent": '<i class="fa fa-lg"></i>' },
            {
                data: null, render: function (data, type, full, meta) {
                    var tabBuildFinal = tabBuild.slice();
                    if (data.Statut != 'PROPOSE') tabBuildFinal[0] = "<select disabled id='" + full.IDintervention + "'";
                    else tabBuildFinal[0] = "<select id='" + full.IDintervention + "'";

                    //var _ind = tabEtatM_Osm.findIndex(function (_item) { return (_item.SourceId == full.IDintervention && _item.Source.trim() == 'OSM'); });
                    var _ind = _.findIndex(tabEtatM_Osm, function (o) { return (o.SourceId == full.IDintervention && o.Source.trim() == 'OSM'); });
                    if (_ind > -1) {
                        var _value = tabEtatM_Osm[_ind].LibelleId + "." + tabEtatM_Osm[_ind].SsLibelleId;
                        var _index = _.findIndex(tabBuild, function (o) { return o.split('>')[0] == "<option value='" + _value + "'"; });
                        if (_index > -1) {
                            tabBuildFinal[_index] = tabBuild[_index].replace("'>", "' selected>");
                            tabBuildFinal[2] = tabEtatM_Osm[_ind].LibelleId == 11 ? " data-style='btn-warning'>" : " data-style='btn-danger'>";
                        }
                    }

                    return tabBuildFinal.join('');
                }
            },
            { "data": "DateCreate", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return moment(data).format('DD/MM/YYYY HH:mm'); } },
            { "data": "NumEF", "className": "clsWrap" },
            { "data": "Motrice", "className": "clsWrap" },
            { "data": "Statut", "className": "clsWrap", "searchable": true },
            { "data": "SitePoseur", "className": "clsWrap", "searchable": true },
            { "data": "Operation", "className": "clsWrap", "searchable": true },
            { "data": "DescIntervention", "searchable": true },
            { "data": "CmtIntervention", "searchable": true },
            { "data": "DateFin", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return data == null ? null : moment(data).format('DD/MM/YYYY HH:mm'); } },
            { "data": "SiteReal", "className": "clsWrap", "searchable": true },
            { "data": "FctPanne", "className": "clsWrap", "searchable": true },
            { "data": "TypeInterv", "visible": false },
            { "data": "TypeDi", "visible": false },
            { "data": "DateDebut", "visible": false },
            { "data": "DateButee", "visible": false }
        ],
        "drawCallback": function (settings) {
            if (settings.aoData.length > 0) {

                $('.single-select[name="selectCtrlStfOsm"][data-style="btn-primary"]').selectpicker({ style: 'btn-primary btn-xs', size: '10', width: '100%', hearder: true, title: 'Veille' });
                $('.single-select[name="selectCtrlStfOsm"][data-style="btn-danger"]').selectpicker({ style: 'btn-danger btn-xs', size: '10', width: '100%', hearder: true, title: 'Veille' });
                $('.single-select[name="selectCtrlStfOsm"][data-style="btn-warning"]').selectpicker({ style: 'btn-warning btn-xs', size: '10', width: '100%', hearder: true, title: 'Veille' });
                if (RolesUser.indexOf('S.E.T.') == -1 || StfsUser.indexOf(StfSelected.ID) == -1) {
                    $('.single-select[name="selectCtrlStfOsm"]').prop('disabled', true);
                    $('.single-select[name="selectCtrlStfOsm"]').selectpicker('refresh');
                }

                $('select[name="selectCtrlStfOsm"]').change(function (e) {
                    var _lib1Id = parseInt($('#' + this.id).val().split('.')[0]);
                    var _lib2Id = parseInt($('#' + this.id).val().split('.')[1]);
                    var _idDI = parseInt(this.id);

                    if (_lib1Id == 0) { SetCtrlStf(); SetColorCtrlStf(_idDI, _lib1Id); }
                    else {
                        $.getJSON("http://localhost:3000/getInterventionById", { IntervId: _idDI }) // Récupère la DI concernée pour récupérer le RameId Concerné
                        .done(function (_interv) {
                            $.when(tabAllRame.filter(function (item) { return item.NumEF.trim() == _interv.numEF.trim() })[0].ID)
                            .done(function (_idrame) {
                                $.getJSON("http://localhost:3000/getEtatMbyRame", { idStf: StfSelected.ID, clos: 0, rameid: _idrame, libId: _lib1Id, sslibId: 0 }) // Vérifie la présence ou pas d'un CtrlStf déjà présent pour cette config
                                .done(function (retour) {
                                    _ToCtrlStf = {
                                        ID: 0, sourceId: _idDI, sourceNum: _interv.IntervID, source: 'OSM', libelleId: _lib1Id, sslibelleId: _lib2Id, rameId: _idrame, stfId: StfSelected.ID,
                                        dtCreate: moment().format('DD/MM/YYYY HH:mm:00'), dtSource: moment(_interv.DateCreateINT).format('DD/MM/YYYY HH:mm:00'), userName: _username, mode: 'Manu'
                                    };

                                    if (retour.length > 0) { // Au moins un CtrlStf existe pour cette paire Rame/Libellé
                                        _ToCtrlStf = {
                                            ID: retour[0].ID, sourceId: _idDI, sourceNum: _interv.IntervID, source: 'OSM', libelleId: _lib1Id, sslibelleId: _lib2Id, rameId: _idrame, stfId: StfSelected.ID,
                                            dtCreate: moment().format('DD/MM/YYYY HH:mm:00'), dtSource: moment(_interv.DateCreateINT).format('DD/MM/YYYY HH:mm:00'), userName: _username, mode: 'Manu'
                                        };

                                        $.confirm({
                                            title: 'Confirmation',
                                            content: 'Cette rame est déjà en Etat-Matériel pour ce même libellé <br/> Souhaitez vous le remplacer ?',
                                            confirmButton: 'Remplacer',
                                            cancelButton: 'Annuler',
                                            confirmButtonClass: 'btn-success',
                                            cancelButtonClass: 'btn-info',
                                            icon: 'fa fa-warning',
                                            confirm: function () { UpdCtrlStf(); SetColorCtrlStf(_idDI, _lib1Id); },
                                            cancel: function () {
                                                $('#' + _idDI).selectpicker('val', '0.0'); $('#' + _ToCtrlStf.sourceId).selectpicker('setStyle', 'btn-primary', 'remove');
                                                $('#' + _ToCtrlStf.sourceId).selectpicker('setStyle', 'btn-danger', 'remove');
                                                $('#' + _ToCtrlStf.sourceId).selectpicker('setStyle', 'btn-warning', 'remove');
                                                $('#' + _idDI).selectpicker('setStyle', 'btn-primary', 'add');
                                                $('#' + _idDI).selectpicker('refresh');
                                            }
                                        });
                                    }
                                        // Nouveau CtrlStf
                                    else { SetCtrlStf(); SetColorCtrlStf(_idDI, _lib1Id); }
                                })
                                .fail(function (jqxhr, textStatus, error) { var err = textStatus + "," + error; alert("Erreur Mise sous Ctrl : " + err); })
                            })

                        })
                        .fail(function (jqxhr, textStatus, error) { var err = textStatus + "," + error; alert("Erreur Mise sous Ctrl : " + err); })
                    }
                });
            }
        },
        "createdRow": function (row, data, index) {
            switch (data.Statut.trim()) {
                case "PROPOSE":         $('td', row).addClass("red" + "txt"); break;
                case "NOTIFIE":         $('td', row).addClass("BleuNotifie"); break;
                case "ENCOURSREAL":     $('td', row).addClass("BleuEnCoursReal"); break;
                case "AFFECTE":         $('td', row).addClass("BleuAffecte"); break;
                case "ANNULE":          $('td', row).addClass("GrisAnnule"); break;
                case "NONAFFECTE":      $('td', row).addClass("MagNonAffecte"); break;
                case "DICREEE":         $('td', row).addClass("OrangeDiCree"); break;
                case "VALIDE":          $('td', row).addClass("VertValide"); break;
                case "CLOTURE":         $('td', row).addClass("VertClos"); break;
            }
        }
    };

    var GetInterventionsOsm = function () {
        if (typeof intervTable1 != 'undefined') { intervTable1.destroy(); } // destroy table if exist

        intervTable1 = $('#intervTable')
            .on('error.dt', function (e, settings, techNote, message) { console.log('An error has been reported by DataTables: ', message); })
            .on('xhr.dt', function (e, settings, json, xhr) { $('#_i_refresh').removeClass("fa-spin"); })
            .DataTable(optionsIntOsm);
        // Add event listener for opening and closing details
        $('#intervTable tbody').on('click', 'td.dtTables-details', function () {
            var tr      = $(this).closest('tr');
            var row     = intervTable1.row(tr);
            var rowData = row.data();

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                $('#InterventionProcessing').css('display', 'block');
                $.ajax({
                    // Récup L'interv By Nodejs
                    url: "http://localhost:3000/getInterventionById", 
                    data: { IntervId: rowData.IDintervention },
                    success: function (interv) {
                        // Recup des OTs
                        $.ajax({
                            url: "http://localhost:3000/getOtsByInterventionId", data: { IntervId: rowData.IDintervention },
                            success: function (ots) {
                                // Passe le résultat au controler C#
                                $.ajax({
                                    type: "POST", contentType: "application/json", url: "Set/DetailIntervention",
                                    data: JSON.stringify({ IntervObj: interv, OtsObj: ots }),
                                    success: function (intervention) {
                                        $('#InterventionProcessing').css('display', 'none');
                                        row.child(intervention).show();
                                        tr.addClass('shown'); 
                                    },
                                    error:function (e) { alert("Erreur Affichage Détail" + "\r\n" + e.error); $('#InterventionProcessing').css('display', 'none'); }
                                });
                            },
                            error: function (e) { alert("Erreur lors de la récupération des OTs" + "\r\n" + e.error); $('#InterventionProcessing').css('display', 'none'); }
                        });
                    },                        
                    error: function (e) { alert("Erreur GetInterventionById (NodeJS) " + "\r\n" + e.error); $('#InterventionProcessing').css('display', 'none'); }
                });
            }
        });

        //---------- Filters -----------
        // filter sites Réalisateurs
        $('#sitesList').change(function () {
            if (!filterActifIntv.dc && !filterActifIntv.dd && !filterActifIntv.df && !filterActifIntv.db && filterActifIntv.sr) ActualiseData();
            var siteListR = $(this).val();
            if (siteListR) {
                var arrTostr = siteListR.join("|");    // convert array to str(regEx) for searching
                intervTable1.columns(11).search(arrTostr, true, false).draw();
            }
            else { intervTable1.columns(11).search('').draw(); }
        });
        // filter status
        $('#statutsList').change(function () {
            if (!filterActifIntv.dc && !filterActifIntv.dd && !filterActifIntv.df && !filterActifIntv.db && filterActifIntv.st) ActualiseData();
            var statusList = $(this).val();
            if (statusList) {
                var arrTostr = statusList.join("|");    // convert array to str(regEx) for searching
                intervTable1.columns(5).search(arrTostr, true, false).draw();
            }
            else { intervTable1.columns(5).search('').draw(); }
        });
        // filter typesInt
        $('#typesIntList').change(function () {
            if (!filterActifIntv.dc && !filterActifIntv.dd && !filterActifIntv.df && !filterActifIntv.db && filterActifIntv.ti) ActualiseData();
            var IntsList = $(this).val();
            if (IntsList) {
                var arrTostr = IntsList.join("|");    // convert array to str(regEx) for searching
                intervTable1.columns(13).search(arrTostr, true, false).draw();
            }
            else { intervTable1.columns(13).search('').draw(); }
        });
        // filter typesDi
        $('#typesDiList').change(function () {
            if (!filterActifIntv.dc && !filterActifIntv.dd && !filterActifIntv.df && !filterActifIntv.db && filterActifIntv.td) ActualiseData();
            var DiList = $(this).val();
            if (DiList) {
                var arrTostr = DiList.join("|");    // convert array to str(regEx) for searching
                intervTable1.columns(14).search(arrTostr, true, false).draw();
            }
            else { intervTable1.columns(14).search('').draw(); }
        });
    }
    

    /* Region CRT Osmose ----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    $('input[name="dtCrt"]').daterangepicker({ locale: localType, startDate: moment().subtract(1, 'days'), endDate: moment(), "showDropdowns": true, "showWeekNumbers": true });
    $('#dtCrt').on('apply.daterangepicker', function (ev, picker) { ActualiseData(); });
    $('#crtTable').on('processing.dt', function (e, settings, processing) { $('#CrtProcessing').css('display', processing ? 'block' : 'none'); });
    $('#CrtToXls').on('click', function () {
        $('#CrtProcessing').css('display', 'block' );
        var tabData = crtTable1.rows({ filter: 'applied' }).data();
        var tab = [];

        for (var i = 0; i < tabData.length; i++)
        {
            tab = [];
            tab.push(tabData[i]);
            $.ajax({
                type: 'POST',
                url: 'Set/SaveCrt',
                data: JSON.stringify({ crts: tab }),
                contentType: 'application/json',
                async: false,
                success: function () {  },
                error: function (xhr, ajaxOptions, thrownError) { alert("Echec du XLS...") }
            });
        }
        window.location = "Set/CrtToXls";
        $('#CrtProcessing').css('display', 'none');
    });

    var optionsCrtOsm = {
        "dom": domOptions,
        "processing": true,
        "deferRender": true,
        "jQueryUI": true,
        "order": [[1, "desc"]],
        "filter": true,
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
        "iDisplayLength": 25,
        "language": languageOptions,
        "ajax": {
            "url": "http://localhost:3000/getCrtOsmose",
            "data": function (d) {
                d.stf       = StfSelected.OsmStf;
                d.rame      = RameSelected.NumEF;
                d.flotte    = $('#seriesList').val() == "0" || RameSelected.NumEF != "0" ? "" : "(" + tabFlotteId.join(',') + ")";
                d.dtFinInt  = $('input[name="dtCrt"]').val();
            }
        },
        "columns": [
            { "data": null, "className": 'dtTables-details', "orderable": false, "defaultContent": '<i class="fa fa-lg"></i>' },
            { "data": "DateFin", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return moment(data).format('DD/MM/YYYY HH:mm'); } },
            { "data": "NumEF", "className": "clsWrap" },
            { "data": "Motrice", "className": "clsWrap" },
            { "data": "SiteReal", "className": "clsWrap", "searchable": true },
            { "data": "TypeDi", "className": "clsWrap", "searchable": true },
            { "data": "DescIntervention", "searchable": true },
            { "data": "CmtIntervention", "searchable": true },
            { "data": "FctPanne", "className": "clsWrap", "searchable": true },
            { "data": "CRT" }
        ],
        "createdRow": function (row, data, index) {
            switch (data.Statut.trim()) {
                case "CLOTURE": $('td', row).css('color', '#696969'); break;
                case "VALIDE": $('td', row).css('color', '#008080'); break;
            }
        }
    };

    var GetCrtOsm = function () {
        if (typeof crtTable1 != 'undefined') { crtTable1.destroy(); } // destroy table if exist
        crtTable1 = $('#crtTable')
            .on('error.dt', function (e, settings, techNote, message) { console.log('An error has been reported by DataTables: ', message); })
            .on('xhr.dt', function (e, settings, json, xhr) { $('#_i_refresh').removeClass("fa-spin"); })
            .DataTable(optionsCrtOsm);

        // Add event listener for opening and closing details
        $('#crtTable tbody').on('click', 'td.dtTables-details', function () {
            var tr = $(this).closest('tr');
            var row = crtTable1.row(tr);
            var rowData = row.data();

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                $('#CrtProcessing').css('display', 'block');
                // Recup des OTs
                $.ajax({
                    url: "http://localhost:3000/getOtsByInterventionId", data: { IntervId: rowData.IDintervention },
                    success: function (ots) {
                        // Passe le résultat au controler C#
                        $.ajax({
                            type: "POST", contentType: "application/json", url: "Set/DetailCrt",
                            data: JSON.stringify({ OtsObj: ots }),
                            success: function (intervention) {
                                $('#CrtProcessing').css('display', 'none');
                                row.child(intervention).show();
                                tr.addClass('shown');
                            },
                            error: function (e) { alert("Erreur Affichage Détail" + "\r\n" + e.error); $('#CrtProcessing').css('display', 'none'); }
                        });
                    },
                    error: function (e) { alert("Erreur lors de la récupération des OTs" + "\r\n" + e.error); $('#CrtProcessing').css('display', 'none'); }
                });
            }
        });

        // filter sites Réalisateurs
        $('#sitesCrt').change(function () {
            var sitecrt = $(this).val();
            if (sitecrt) {
                var arrTostr = sitecrt.join("|");    // convert array to str(regEx) for searching
                crtTable1.columns(4).search(arrTostr, true, false).draw();
            }
            else { crtTable1.columns(4).search('').draw(); }
        });
        // filter typesDi
        $('#typesDiCrt').change(function () {
            var Dicrt = $(this).val();
            if (Dicrt) {
                var arrTostr = Dicrt.join("|");    // convert array to str(regEx) for searching
                crtTable1.columns(5).search(arrTostr, true, false).draw();
            }
            else { crtTable1.columns(5).search('').draw(); }
        });
    }


    /* Région Restrictions GRIFFE*/
    // Init des DataPickers DatePose DateAmortie
    $('input[name="dtPoseRest"]').daterangepicker({ locale: localType, startDate: filterRgfLoaded.datepose.ddp, endDate: filterRgfLoaded.datepose.dfp, "showDropdowns": true, "showWeekNumbers": true });
    $('input[name="dtAmortRest"]').daterangepicker({ locale: localType, startDate: filterRgfLoaded.dateamort.ddp, endDate: filterRgfLoaded.dateamort.dfp, "showDropdowns": true, "showWeekNumbers": true });
    // Abonnement à l'évent Change du dataPicker DatePose
    $('#dtPoseRest').on('apply.daterangepicker', function (ev, picker) {
        filterRgfLoaded.datepose.ddp = picker.startDate.format('L');//dtDebAnalyse 
        filterRgfLoaded.datepose.dfp = picker.endDate.format('L');// dtFinAnalyse
        ActualiseData();
    });
    // Abonnement à l'évent Change du dataPicker DateAmortie
    $('#dtAmortRest').on('apply.daterangepicker', function (ev, picker) {
        filterRgfLoaded.dateamort.ddp = picker.startDate.format('L');//dtDebAnalyse 
        filterRgfLoaded.dateamort.dfp = picker.endDate.format('L');// dtFinAnalyse
        ActualiseData();
    });
    // Event de l'activation/désactivation de la date de pose
    $('#FilterDtPoseRest').change(function () {
        var checkInput = $(this).data('input-name');    // InputDate lié à ce checkbox
        var checkButton = $(this).data('button-name');  // ButtonCalandar lié à ce checkbox
        $('#' + checkInput).prop("disabled", !$(this).prop('checked'));
        $('#' + checkButton).prop("disabled", !$(this).prop('checked'));
        filterRgfLoaded.datepose.selected = $(this).prop('checked');
        ActualiseData();
    });
    // Event de l'activation/désactivation de la date d'amortissement
    $('#FilterDtAmortRest').change(function () {
        var checkInput = $(this).data('input-name');    // InputDate lié à ce checkbox
        var checkButton = $(this).data('button-name');  // ButtonCalandar lié à ce checkbox
        $('#' + checkInput).prop("disabled", !$(this).prop('checked'));
        $('#' + checkButton).prop("disabled", !$(this).prop('checked'));
        filterRgfLoaded.dateamort.selected = $(this).prop('checked');
        ActualiseData();
    });

    $('#RestToXls').on('click', function () {
        var url = "Set/RestToExcel";
        var data = {
            state:      $('#satesList').val() == null ? null :      $('#satesList').val().join("|"),
            priorite:   $('#prioritysList').val() == null ? null :  $('#prioritysList').val().join("|"),
            specif:     $('#specifsList').val() == null ? null :    $('#specifsList').val().join("|"),
            libelle:    $('#libsList').val() == null ? null :       $('#libsList').val().join("|"),
            search:     restrictionTable1.search()
        };
        url += '?' + decodeURIComponent($.param(data));
        window.location = url;
    });

    $('#restrictionTable').on('processing.dt', function (e, settings, processing) { $('#RestrictionProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsRestGrf = {
        dom: domOptions,
        processing:       true,
        deferRender:      true,
        jQueryUI: true,
        filter:true,
        order:            [[7, "desc"]],
        lengthMenu:       [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
        iDisplayLength:   25,
        language:         languageOptions,
        ajax: {
            "url": "Set/GetRestrictionsByRame",
            "data": function (d) {
                d.IDstf         = StfSelected.ID,
                d.IDserie       = $('#seriesList').val(),
                d.IDsousserie   = $('#sousseriesList').val(),
                d.rame          = RameSelected.EAB,
                d.b_dpose       = filterRgfLoaded.datepose.selected, 
                d.dposeDebut    = moment(filterRgfLoaded.datepose.ddp).format("DD/MM/YYYY"),
                d.dposeFin      = moment(filterRgfLoaded.datepose.dfp).format("DD/MM/YYYY"),
                d.b_damort      = filterRgfLoaded.dateamort.selected,  
                d.damortDebut   = moment(filterRgfLoaded.dateamort.ddp).format("DD/MM/YYYY"),
                d.damortFin     = moment(filterRgfLoaded.dateamort.dfp).format("DD/MM/YYYY"),
                d.Etat          = filterRgfLoaded.status.length == 0 ?      null : $('#statesList').val().join("|"),
                d.Priorite      = filterRgfLoaded.priority.length == 0 ?    null : $('#prioritysList').val().join("|"),
                d.Specif        = filterRgfLoaded.specificite.length == 0 ? null : $('#specifsList').val().join("|"),
                d.Libelle       = filterRgfLoaded.librest.length == 0 ?     null : $('#libsList').val().join("|"),
                d.IdrestsInEM   = _.uniq(_.map(tabEtatM_Grf, 'SourceId')).join(',')
            }
        },
        "columns": [
            { data: null, width: '3%', className: 'dtTables-details', searchable: false, orderable: false, defaultContent: '<i class="fa fa-lg"></i>' },
            {
                data: null, width: '6%', render: function (data, type, full, meta) {
                    var tabBuildFinal = tabBuild.slice();
                    tabBuildFinal[1] = " name='selectCtrlStfGrf' class='single-select' ";
                    if (data.Amorti)    tabBuildFinal[0] = "<select disabled id='" + full.IdRest + "'";
                    else                tabBuildFinal[0] = "<select id='" + full.IdRest + "'";

                    var _ind = _.findIndex(tabEtatM_Grf, function (o) { return (o.SourceId == full.IdRest && o.Source.trim() == 'GRF' && !o.Deleted) });
                    if (_ind > -1) {
                        var _value = tabEtatM_Grf[_ind].LibelleId + "." + tabEtatM_Grf[_ind].SsLibelleId;
                        var _index = _.findIndex(tabBuild, function (o) { return o.split('>')[0] == "<option value='" + _value + "'"; });
                        if (_index > -1) {
                            tabBuildFinal[_index] = tabBuild[_index].replace("'>", "' selected>");
                            tabBuildFinal[2] = tabEtatM_Grf[_ind].LibelleId == 11 ? " data-style='btn-warning'>" : " data-style='btn-danger'>";
                        }
                    }
                    return tabBuildFinal.join('');
                }
            },
            { data: "Specificite", searchable: true },
            { data: "SitePoseur", searchable: true },
            { data: "Priorite", searchable: true },
            { data: "NumRame", searchable: true },
            { data: "Vehicule", searchable: true },
            { data: "DatePose", searchable: false, className: "clsWrap", type: 'date-euro', "render": function (data, type, full, meta) { return moment(data, "x").format('DD/MM/YYYY HH:mm'); } },
            { data: "LibReduit", className: "clsWrap", searchable: true },
            { data: "Localisation", className: "clsWrap", searchable: true },
            { data: "CommentaireTotal", searchable: true },
            { data: "DateAmortissement", searchable: false, className: "clsWrap", type: 'date-euro', "render": function (data, type, full, meta) { return data != null ? moment(data, "x").format('DD/MM/YYYY HH:mm') : ""; } },
            { data: "LogPoseur", "render": function (data, type, full, meta) { return full.LogPoseur + "/" + full.LogAmortissement; } },
            { data: "sAmorti", searchable: true, visible: false }
        ],
        "drawCallback": function (settings) {
            if (settings.aoData.length > 0) {
                $('.single-select[name="selectCtrlStfGrf"][data-style="btn-primary"]').selectpicker({ style: 'btn-primary btn-xs', size: '10', width: '100%', hearder: true, title: 'Veille' });
                $('.single-select[name="selectCtrlStfGrf"][data-style="btn-danger"]').selectpicker({ style: 'btn-danger btn-xs', size: '10', width: '100%', hearder: true, title: 'Veille' });
                $('.single-select[name="selectCtrlStfGrf"][data-style="btn-warning"]').selectpicker({ style: 'btn-warning btn-xs', size: '10', width: '100%', hearder: true, title: 'Veille' });
                if (RolesUser.indexOf('S.E.T.') == -1 || StfsUser.indexOf(StfSelected.ID) == -1) {
                    $('.single-select[name="selectCtrlStfGrf"]').prop('disabled', true);
                    $('.single-select[name="selectCtrlStfGrf"]').selectpicker('refresh');
                }
                $('select[name="selectCtrlStfGrf"]').change(function (e) {
                    var _idSelect = parseInt(this.id);
                    var _lib1Id = $('#' + this.id).val().split('.')[0];
                    var _lib2Id = $('#' + this.id).val().split('.')[1];
                    //var _idrest = parseInt(this.id);

                    $.when(tabRestGrf.filter(function (item) { return item.IdRest == _idSelect }))
                    .done(function (_rest) {
                        $.when(tabAllRame.filter(function (item) { return item.EAB.trim() == _rest[0].NumRame.trim() })[0].ID)
                        .done(function (_idrame) {
                            _ToCtrlStf = {
                                sourceId: _idSelect, sourceNum: _rest[0].NumRest, source: 'GRF', libelleId: _lib1Id, sslibelleId: _lib2Id, rameId: _idrame, stfId: StfSelected.ID,
                                dtCreate: moment().format('DD/MM/YYYY HH:mm:00'), dtSource: moment(_rest[0].DatePose, "x").format('DD/MM/YYYY HH:mm:00'), userName: _username, mode: 'Manu'
                            };
                            SetCtrlStf();
                            SetColorCtrlStf(_idSelect, _lib1Id);
                        })
                    })
                });
            }
        },
        "createdRow": function (row, data, index) {
            if (!data.Amorti)       { $('td', row).addClass("red" + "txt"); }
            if (data.Journalisee)   { $('td', row).addClass("blue" + "txt"); }
        }
    };

    var GetRestrictionsGriffe = function () {
        if (typeof restrictionTable1 != 'undefined') { restrictionTable1.destroy(); } // destroy table if exist
        restrictionTable1 = $('#restrictionTable')
            .on('draw.dt', function (e, settings) { })
            .on('error.dt', function (e, settings, techNote, message) { alert('DataTables error : ', message + '/n' + techNote); $('#RestrictionProcessing').css('display', 'none'); })
            .on('xhr.dt', function (e, settings, json, xhr) {
                $('#_i_refresh').removeClass("fa-spin");
                if (json.FlagError) { alert(json.MessError); $('#RestrictionProcessing').css('display', 'none'); }
                else tabRestGrf = json.data;

                var _tblForEtatM = tabRestGrf.filter(function (item) { return item.LibEtatM1 > 0 });
                var _tblSend = []
                if (_tblForEtatM.length > 0) {
                    $.each(_tblForEtatM, function (i, el) {
                        _tblSend.push("(" + StfSelected.ID + "," + el.IdRame + "," + el.LibEtatM1 + "," + el.LibEtatM2 + ", CONVERT(DATETIME, '" + moment().format('DD/MM/YYYY HH:mm:00') + "', 104)," + el.IdRest + "," + el.NumRest + ",'GRF', CONVERT(DATETIME, '" + moment(el.DatePose, "x").format('DD/MM/YYYY HH:mm:00') + "', 104), NULL,'',0,0,0,'Auto','" + _username + "',0,'')");
                        tabEtatM_Grf.push({ LibelleId: el.LibEtatM1, SsLibelleId: el.LibEtatM2, SourceId: el.IdRest, SourceNum: el.NumRest, Source: 'GRF', });
                    })

                    $.post('http://localhost:3000/AddEtatMbyLot', { ctrl: _tblSend })
                        .done(function (retour) { //alert(retour.rows.length + " CtrlStf ajouté(s) ...");
                        }).fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur Maj EtatM... : " + err); });
                }
            }).DataTable(optionsRestGrf);

        // Add event listener for opening and closing details
        $('#restrictionTable tbody').on('click', 'td.dtTables-details', function () {
                var tr      = $(this).closest('tr');
                var row     = restrictionTable1.row(tr);
                var rowData = row.data();

                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                    tr.removeClass('shown');
                }
                else {
                    $('#RestrictionProcessing').css('display', 'block');
                    $.ajax({
                        type: "POST",
                        url: 'Set/DetailRest',
                        data: { restID: rowData.IdRest },
                        success: function (data) {
                            $('#RestrictionProcessing').css('display', 'none');
                            row.child(data).show();
                            tr.addClass('shown'); // Modifie l'icone de l'oeil
                        },
                        error: function (e) { alert("Erreur Ouverture Détail" + "\r\n" + e.error); $('#RestrictionProcessing').css('display', 'none'); }
                    });
                }

        });

        //---------- Filters -----------
        $('#statesList').on('changed.bs.select', function (e) {
            var _all = false;
            var etatList = $(this).val();
            if (etatList == null) { etatList = Enumerable.From(objFiltersRestGrf.statuts).Select(function (p) { return p.value }).ToArray(); _all = true;}
            if (filterRgfLoaded.status.length == 0 || Enumerable.From(etatList).All(function (el) { return Enumerable.From(filterRgfLoaded.status).Contains(el) })) {
                if (!_all)
                    restrictionTable1.columns(13).search(etatList.join("|"), true, false).draw();
                else
                    restrictionTable1.columns(13).search('').draw();
            }
            else { ActualiseData(); restrictionTable1.columns(13).search('').draw(); }

            // Array.prototype.every() ?????
        });
        $('#prioritysList').change(function () {
            var _all = false;
            var prioList = $(this).val();
            if (prioList == null) { prioList = Enumerable.From(objFiltersRestGrf.priority).Select(function (p) { return p.value }).ToArray(); _all = true; }
            if (filterRgfLoaded.priority.length == 0 || Enumerable.From(prioList).All(function (el) { return Enumerable.From(filterRgfLoaded.priority).Contains(el) })) {
                if (!_all)
                    restrictionTable1.columns(4).search(prioList.join("|"), true, false).draw();
                else
                    restrictionTable1.columns(4).search('').draw();
            }
            else { ActualiseData(); restrictionTable1.columns(4).search('').draw(); }
        });
        $('#specifsList').change(function () {
            var _all = false;
            var specifList = $(this).val();
            if (specifList == null) { specifList = Enumerable.From(objFiltersRestGrf.specificite).Select(function (p) { return p.value }).ToArray(); _all = true; }
            if (filterRgfLoaded.specificite.length == 0 || Enumerable.From(specifList).All(function (el) { return Enumerable.From(filterRgfLoaded.specificite).Contains(el) })) {
                if (!_all)
                    restrictionTable1.columns(2).search(specifList.join("|"), true, false).draw();
                else
                    restrictionTable1.columns(2).search('').draw();
            }
            else { ActualiseData(); restrictionTable1.columns(2).search('').draw(); }
        });
        $('#libsList').change(function () {
            var _all = false;
            var libList = $(this).val();
            if (libList == null) { libList = Enumerable.From(objFiltersRestGrf.libelle).Select(function (p) { return p.value }).ToArray(); _all = true; }
            if (filterRgfLoaded.librest.length == 0 || Enumerable.From(libList).All(function (el) { return Enumerable.From(filterRgfLoaded.librest).Contains(el) })) {
                if (!_all)
                    restrictionTable1.columns(8).search(libList.join("|"), true, false).draw();
                else
                    restrictionTable1.columns(8).search('').draw();
            }
            else { ActualiseData(); restrictionTable1.columns(8).search('').draw(); }
        });
    }


    /* Région Roulement Rame */
    $('input[name="dtRlt"]').daterangepicker({ locale: localType, startDate: moment(), endDate: moment().add(1, 'day'), "showDropdowns": true, "showWeekNumbers": true });
    $('#dtRlt').on('apply.daterangepicker', function (ev, picker) {
        dtDebRoulement = picker.startDate.format('L');
        dtFinRoulement = picker.endDate.format('L');
        ActualiseData();
    });

    $('#roulementTable').on('processing.dt', function (e, settings, processing) { $('#RoulementProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsRltGrf = {
        "dom":              domOptions,
        "processing":       true,
        "deferRender":      true,
        "jQueryUI":         true,
        "order":            [[3, "asc"]],
        "lengthMenu":       [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
        "iDisplayLength":   -1,
        "language":         languageOptions,
        "ajax": {
            "url": "Set/GetRoulementRame",
            "data": function (d) {
                d.IDstf         = StfSelected.ID;
                d.rame          = RameSelected.EAB;
                d.siteGriffe    = filterActifRlt.sg ? $('#sitesGriffe').val().join('|') : null;
                d.dperiodeDebut = moment(dtDebRoulement).format("DD/MM/YYYY"); dtFinRoulement
                d.dperiodeFin   = moment(dtFinRoulement).format("DD/MM/YYYY");
            }
        },
        "columns": [
            { "data": "NumTrain", "searchable": true },
            { "data": "Nature", "searchable": true },
            { "data": "Depart" },
            { "data": "DateDepart", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return moment(data, "x").format('DD/MM/YYYY HH:mm'); } },
            { "data": "Arrivee" },
            { "data": "DateArrivee", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return moment(data, "x").format('DD/MM/YYYY HH:mm'); } },
            { "data": "Duree" },
            { "data": "Position" },
            { "data": "NbElements" },
            { "data": "UM", "searchable": true }
        ],
        "drawCallback": function (settings) {
            if (settings.json) {
                $('#_MessPgh').text("PGH : " + settings.json.Pgh);
                $('#_MessGrf').text("Message Griffe : " + settings.json.MessGriffe);
            }
        },
        "createdRow": function (row, data, index) { if (data.rowSelected) { $('td', row).addClass("RltSelect"); } }
    };

    var GetRoulementGriffe = function () {
        if (typeof roulementTable1 != 'undefined') { roulementTable1.destroy(); } // destroy table if exist
        roulementTable1 = $('#roulementTable')
            .on('error.dt', function (e, settings, techNote, message) { console.log('An error has been reported by DataTables: ', message); })
            .on('xhr.dt', function (e, settings, json, xhr) { $('#_i_refresh').removeClass("fa-spin"); if (json.FlagError) alert(json.MessError); })
            .DataTable(optionsRltGrf);

        $('#sitesGriffe').change(function () {
            if (filterActifRlt.sg) ActualiseData();
            var siteGrf = $(this).val();
            if (siteGrf) {
                var arrTostr = siteGrf.join("|");    // convert array to str(regEx) for searching
                roulementTable1.columns(4).search(arrTostr, true, false).draw();
            }
            else roulementTable1.columns(4).search('').draw();
            $('[data-toggle="tooltip"]').tooltip('hide');
        });
    }

    /* Région Fichiers Joint */
    Dropzone.autoDiscover = false;
    var DROPZONE_OPTIONS = {
        url:                    "Set/FileUpload",
        paramName:              'file', // The name that will be used to transfer the file
        maxFiles:               1,
        maxFilesize:            100,  // MB
        dictDefaultMessage:     '',
        createImageThumbnails:  false,
        previewsContainer:      '#dropzone__hidden',
    }

    function onLoad() {
        var rotatingBar = initProgressBar('#file-picker__progress');
        initDropzone(rotatingBar);
    }
    function initProgressBar(container) {
        var Shape = ProgressBar.Circle;

        var rotatingBar = new RotatingProgressBar(Shape, container, {
            color: '#333',
            trailColor: '#eee',
            strokeWidth: 1,
            duration: 500
        });
        rotatingBar.bar.set(1);

        return rotatingBar;
    }
    function initDropzone(rotatingBar) {
        Dropzone.options.dropzone = DROPZONE_OPTIONS;
        var dropzone = new Dropzone('#dropzone');
        var picker = document.querySelector('.file-picker');
        var overlay = document.querySelector('.file-picker__overlay');
        overlay.onclick = function () { dropzone.removeAllFiles(true); }

        var animateThrottled = _.throttle(
            _.bind(rotatingBar.bar.animate, rotatingBar.bar),
            500
        );
        dropzone.on('sending', function (file) {
            //setLink('');
            addClass(picker, 'uploading');
            rotatingBar.bar.set(0.05);
            rotatingBar.rotate();
        });
        dropzone.on('uploadprogress', function (file, percent) { animateThrottled(percent / 100); });
        dropzone.on('success', function (file, response) {
            if (response.name === undefined) {
                window.alert('Unknown error while uploading');
                return;
            }

            var url = response.name + 'Uploaded Succefully !';
            var info = '';
            uploadFinally(false, url, info);
        });
        dropzone.on('error', function (file, errorMessage) { uploadFinally(true); });
        function uploadFinally(err, url) {
            animateThrottled.cancel();

            if (err) {
                rotatingBar.bar.set(1);
                activateFilePicker();
            } else {
                rotatingBar.bar.animate(1, function () {
                    dropzone.removeAllFiles();
                    activateFilePicker();
                    uploadTable1.ajax.reload();
                    //setLink(url);
                });
            }
        }
        function activateFilePicker() {
            removeClass(picker, 'uploading');
            rotatingBar.stopRotating();
        }
    }

    // Small wrapper for ProgressBar
    var RotatingProgressBar = function RotatingProgressBar(Shape, container, opts) {
        this._container = document.querySelector(container);
        this.bar = new Shape(container, opts);
    };
    RotatingProgressBar.prototype.rotate = function rotate() { addClass(this._container, 'rotating'); };
    RotatingProgressBar.prototype.stopRotating = function stopRotating() { removeClass(this._container, 'rotating'); };


    $('#uploadTable').on('processing.dt', function (e, settings, processing) { $('#UploadProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsFiles = {
        "dom": domOptions,
        "processing": true,
        "deferRender": true,
        "jQueryUI": true,
        "order": [[2, "Desc"]],
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
        "iDisplayLength": -1,
        "language": languageOptions,
        "ajax": {
            "url": "Set/getFiles",
            "data": function (d) { d.stfId = StfSelected.ID; d.rameId = RameSelected.ID; }
        },
        "columns": [
            { "data": "Rame", "className": "clsWrap", "searchable": true },
            { "data": "FileName", "className": "clsWrap", "searchable": true },
            { "data": "DateUpload", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return moment(data, "x").format('DD/MM/YYYY HH:mm'); } },
            { "data": "ContentType", "className": "clsWrap", "searchable": true },
            { "data": "Size" },
            { "data": "ID", render: function (data, type, full, meta) { return '<a target="_blank" href="Set/FileDownload?fileId=' + data + '">Télécharger</a>' } },
            { "data": "ID", render: function (data, type, full, meta) { return '<input type="button" name="DeletePj" class="btn btn-warning btn-xs" value="Supprimer" id="' + data + '">' } }
        ],
        "drawCallback": function (settings) {
            if (settings.aoData.length > 0) {
                $('input[name*="DeletePj"]').on('click', function (e) {
                    if (RolesUser.indexOf('S.E.T.') > -1 && StfsUser.indexOf(StfSelected.ID) > -1) {
                        if (confirm('Supprimer cette PJ ?')) {
                            $.ajax({
                                url: "Set/DeletePj", data: { id: $('#' + this.id)[0].id },
                                success: function (role) { uploadTable1.ajax.reload(); },
                                error: function (xhr, ajaxOptions, thrownError) { alert("Echec de la suppression PJ..." + xhr.status + " : " + thrownError); }
                            });
                        }
                    }
                    else 
                        alert("Désolé, Vous n'avez pas les autorisations nécessaires pour la supression des Pièces Jointes...");
                });
            }
        },
        "createdRow": function (row, data, index) {  }
    };
    var getFilesPj = function () {
        if (typeof uploadTable1 != 'undefined') { uploadTable1.destroy(); } // destroy table if exist
        uploadTable1 = $('#uploadTable')
            .on('error.dt', function (e, settings, techNote, message) { console.log('An error has been reported by DataTables: ', message); })
            .on('xhr.dt', function (e, settings, json, xhr) { $('#_i_refresh').removeClass("fa-spin"); })
            .DataTable(optionsFiles);
    };

    /* Région Incidents Rexmat */
    $('input[name="dtIncident"]').daterangepicker({ locale: localType, startDate: moment().subtract(3, 'month'), endDate: moment(), "showDropdowns": true, "showWeekNumbers": true });
    $('#dtIncident').on('apply.daterangepicker', function (ev, picker) {
        dtDebIncident = picker.startDate.format('DD/MM/YYYY');
        dtFinIncident = picker.endDate.add(1, 'days').format('DD/MM/YYYY');
        ActualiseData();
    });
    $('#FilterDtIncident').change(function () {
        var checkInput = $(this).data('input-name');    // InputDate lié à ce checkbox
        var checkButton = $(this).data('button-name');  // ButtonCalandar lié à ce checkbox
        $('#' + checkInput).prop("disabled", !$(this).prop('checked'));
        $('#' + checkButton).prop("disabled", !$(this).prop('checked'));

        ActualiseData();
    });

    $('#incidentTable').on('processing.dt', function (e, settings, processing) { $('#IncidentProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsRexmat = {
        "dom": domOptions,
        "processing":       true,
        "deferRender":      true,
        "jQueryUI":         true,
        "order":            [[1, "desc"]],
        "lengthMenu":       [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
        "iDisplayLength":   25,
        "language":         languageOptions,
        "ajax": {
            "url": "http://localhost:3000/getIncidentsPg",
            "data": function (d) {
                d.stf           = StfSelected.IdStfRm;
                d.rame          = RameSelected.IdRexM;
                d.numef         = RameSelected.NumEF;
                d.bPeriode      = $('#FilterDtIncident').prop('checked');
                d.dperiodeDebut = dtDebIncident;
                d.dperiodeFin   = dtFinIncident;
            }
        },
        "columns": [
            { data: null, "className": 'dtTables-details', "orderable": false, "defaultContent": '<i class="fa fa-lg"></i>' },
            {
                "data": "dateincident", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) {
                    var dtDateInc = new Date(data);
                    return moment(dtDateInc).format('DD/MM/YYYY HH:mm');
                }
            },
            { data: "enginimpact", "searchable": true }, // Rame
            { data: "idelement", "searchable": true }, // Motrice
            { data: "libelle", "searchable": true },
            { data: "lieuincident", "searchable": true }, 
            { data: "numtrain", "searchable": true },
            { data: "sens", "searchable": true },
            { data: "tpsperdu", "searchable": true },
            { data: "lcn", "searchable": true },
            { data: "fonction", "searchable": true },
            { data: "panne", "searchable": true },
        ],
        "drawCallback": function (settings) { },
        "createdRow": function (row, data, index) {  }
    };

    var GetIncidRexmat = function () {
        if (typeof incidentTable1 != 'undefined') { incidentTable1.destroy(); } // destroy table if exist
        incidentTable1 = $('#incidentTable')
            .on('error.dt', function (e, settings, techNote, message) { console.log('An error has been reported by DataTables: ', message); })
            .on('xhr.dt', function (e, settings, json, xhr) { $('#_i_refresh').removeClass("fa-spin"); })
            .DataTable(optionsRexmat);
    }

    /* Région KmRame */
    $('input[name="dtKm"]').daterangepicker({ locale: localType, startDate: moment(), endDate: moment(), "showDropdowns": true, "showWeekNumbers": true });
    $('#dtKm').on('apply.daterangepicker', function (ev, picker) { ActualiseData(); });
    $('#kmTable').on('processing.dt', function (e, settings, processing) { $('#KmProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsKM = {
        "dom": domOptions,
        "processing": true,
        "deferRender": true,
        "jQueryUI": true,
        "order": [[1, "desc"]],
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
        "iDisplayLength": 25,
        "language": languageOptions,
        "ajax": { "url": "Set/GetKmRame", "data": function (d) { d.rame = RameSelected.EAB; d.periode = $('#dtKm').val(); } },
        "columns": [
            { "data": "Rame", "searchable": true }, // Rame
            { "data": "DateKm", "searchable": true, "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return moment(data, "x").format('DD/MM/YYYY'); } }, 
            { "data": "Km", "searchable": true },
        ],
        "drawCallback": function (settings) { },
        "createdRow": function (row, data, index) { }
    };
    var GetKM = function () {
        if (typeof kmTable1 != 'undefined') { kmTable1.destroy(); } // destroy table if exist
        kmTable1 = $('#kmTable')
            .on('error.dt', function (e, settings, techNote, message) { console.log('An error has been reported by DataTables: ', message); })
            .on('xhr.dt', function (e, settings, json, xhr) {
                var cumul = 0;
                $('#_i_refresh').removeClass("fa-spin"); if (json.FlagError) alert(json.MessError);
                for (var i = 0 ; i < json.data.length; i++) { cumul += json.data[i].Km; $('#cumulkm').text(cumul + " km.");}
            })
            .DataTable(optionsKM);
    }

    var loadCumulKm = function () {
        //$('#_pulse').css('display', 'block');
        $('#_LoadCumul').addClass("fa-spin");
        $.getJSON("Set/GetCumulKm", { stf: StfSelected.ID })
        .done(function (data) {
            var tableCumulKm = document.getElementById("tableCumul");
            // Supp Tableau
            while (tableCumulKm.rows.length > 0) { tableCumulKm.deleteRow(0); }
            // Création première ligne
            var header = tableCumulKm.createTHead();
            var row = header.insertRow(0);
            var cell0 = row.insertCell(0);
            cell0.style.backgroundColor = "Grey";
            cell0.style.width = "20%";
            cell0.style.textAlign = "center";
            cell0.innerHTML = "<b>Série</b>";
            var cell1 = row.insertCell(1);
            cell1.style.backgroundColor = "Grey";
            cell1.style.width = "20%";
            cell1.style.textAlign = "center";
            cell1.innerHTML = "<b>Sous Série</b>";
            var cell2 = row.insertCell(2);
            cell2.style.backgroundColor = "Grey";
            cell2.style.width = "20%";
            cell2.style.textAlign = "center";
            cell2.innerHTML = "<b>Cumul KM</b>";
            // Création des autres lignes
            for (var iter = 0; iter < data.result.length; iter++) {
                row = tableCumulKm.insertRow(iter + 1);
                cell0 = row.insertCell(0);
                cell0.style.textAlign = "center";
                cell0.innerHTML = data.result[iter].Serie;

                cell1 = row.insertCell(1);
                cell1.style.textAlign = "center";
                cell1.innerHTML = data.result[iter].SousSerie;

                cell2 = row.insertCell(2);
                cell2.style.textAlign = "center";
                cell2.innerHTML = data.result[iter].CumulKm;
            }
            //$('#_pulse').css('display', 'none');
            $('#_LoadCumul').removeClass("fa-spin");
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Erreur de récupération des Cumul Km : " + err);
        });
    }


    /* Région Semelles */
    //var retourCtrlVisuel = '<i class="fa fa-eye fa-lg" style="color:#2E8B57"></i>';
    //var retourCtrlVisuel_Rpl = '<i class="fa fa-eye fa-lg" style="color:#2E8B57" style="border:1px solid blue;"></i>';

    /* DatePicker */
    $('#dtSemelle').on('apply.daterangepicker', function (ev, picker) { ActualiseData(); });


    $('#semelleTable').on('processing.dt', function (e, settings, processing) { $('#SemelleProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsCtrlsSemelles = {
        "dom": domOptions,
        "processing": true,
        "deferRender": true,
        "jQueryUI": true,
        "order": [[1, "desc"]],
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
        "iDisplayLength": 25,
        "language": languageOptions,
        "ajax": {
            "url": "http://localhost:3000/getCtrlsSemelles",
            "data": function (d) {
                d.stf       = StfSelected.ID;
                d.Idame     = RameSelected.ID;
                d.periode   = $('input[name="dtSemelle"]').val();
                d.date      = '';
            }
        },
        "columns": [
            {
                "data": null, "orderable": false, "render": function (data, type, full, meta) {
                    var txtrender = full.NonConf ? '<i class="fa fa-exclamation text-danger"></i>' : "";
                    return txtrender + '<i class="fa fa-info-circle btn" data-toggle="tooltip" data-placement="right" title="' +
                        "Saisi par : " + full.UserCtrl + '\n' + "Intervention : " + full.Intervention + '\n' + "Commentaire : " + full.Comment + '\n' + "Saisie le : " + moment(full.DateSaisi).format('DD/MM/YYYY HH:mm') + '"></i>'
                }
            },
            //{ "data": "ID" },
            {
                "data": "DateCtrl", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) {
                    var dtDate = new Date(data);
                    return moment(dtDate).format('DD/MM/YYYY');
                }
            },
            { "data": "NumRame", "searchable": true },
            { "data": "Site", "searchable": true },
            {
                "data": "ZIB1_R1_MESURE", "render": function (data, type, full, meta) {
                return (full.ZIB1_R1_VISUEL ?
                 (full.ZIB1_R1_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                 :
                 (data == '0' ? ('') :
                 (full.ZIB1_R1_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZIB1_R1_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZIB1_R1_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZIB1_R2_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZIB1_R2_VISUEL ?
                     (full.ZIB1_R2_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZIB1_R2_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZIB1_R2_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZIB1_R2_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZIB1_R3_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZIB1_R3_VISUEL ?
                     (full.ZIB1_R3_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZIB1_R3_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZIB1_R3_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZIB1_R3_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZIB1_R4_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZIB1_R4_VISUEL ?
                     (full.ZIB1_R4_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZIB1_R4_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZIB1_R4_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZIB1_R4_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZIB2_R1_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZIB2_R1_VISUEL ?
                     (full.ZIB2_R1_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZIB2_R1_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZIB2_R1_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZIB2_R1_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZIB2_R2_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZIB2_R2_VISUEL ?
                     (full.ZIB2_R2_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZIB2_R2_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZIB2_R2_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZIB2_R2_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZIB2_R3_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZIB2_R3_VISUEL ?
                     (full.ZIB2_R3_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZIB2_R3_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZIB2_R3_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZIB2_R3_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZIB2_R4_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZIB2_R4_VISUEL ?
                     (full.ZIB2_R4_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZIB2_R4_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZIB2_R4_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZIB2_R4_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZPB1_R1_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZPB1_R1_VISUEL ?
                     (full.ZPB1_R1_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZPB1_R1_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZPB1_R1_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZPB1_R1_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZPB1_R2_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZPB1_R2_VISUEL ?
                     (full.ZPB1_R2_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZPB1_R2_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZPB1_R2_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZPB1_R2_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZPB1_R3_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZPB1_R3_VISUEL ?
                     (full.ZPB1_R3_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZPB1_R3_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZPB1_R3_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZPB1_R3_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZPB1_R4_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZPB1_R4_VISUEL ?
                     (full.ZPB1_R4_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZPB1_R4_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZPB1_R4_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZPB1_R4_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZPB2_R1_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZPB2_R1_VISUEL ?
                     (full.ZPB2_R1_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZPB2_R1_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZPB2_R1_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZPB2_R1_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZPB2_R2_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZPB2_R2_VISUEL ?
                     (full.ZPB2_R2_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZPB2_R2_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZPB2_R2_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZPB2_R2_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZPB2_R3_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZPB2_R3_VISUEL ?
                     (full.ZPB2_R3_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZPB2_R3_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZPB2_R3_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZPB2_R3_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZPB2_R4_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZPB2_R4_VISUEL ?
                     (full.ZPB2_R4_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZPB2_R4_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZPB2_R4_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZPB2_R4_CONSO + '</span>'))));
                }
            }
        ],
        "drawCallback": function (settings) { },
        "createdRow": function (row, data, index) {
            if (data.ZIB1_BM_Iso) { for (var i = 4; i <= 7; i++) { row.cells[i].className = "bmIso"; } }
            if (data.ZIB2_BM_Iso) { for (var i = 8; i <= 11; i++) { row.cells[i].className = "bmIso"; } }
            if (data.ZPB1_BM_Iso) { for (var i = 12; i <= 15; i++) { row.cells[i].className = "bmIso"; } }
            if (data.ZPB2_BM_Iso) { for (var i = 16; i <= 19; i++) { row.cells[i].className = "bmIso"; } }
        }
    };
    var getCtrlsSemelles = function () {
        if (typeof semelleTable1 != 'undefined') { semelleTable1.destroy(); } // destroy table if exist
        semelleTable1 = $('#semelleTable')
            .on('error.dt', function (e, settings, techNote, message) { console.log('An error has been reported by DataTables: ', message); })
            .on('xhr.dt', function (e, settings, json, xhr) { $('#_i_refresh').removeClass("fa-spin"); if (json.FlagError) alert(json.MessError); })
            .DataTable(optionsCtrlsSemelles);

        // Add event listener for opening and closing details
        $('#semelleTable tbody').on('click', 'td.dtTables-details', function () {
            var tr = $(this).closest('tr');
            var row = semelleTable1.row(tr);
            var rowData = row.data();

            if (row.child.isShown()) {
                // This row is already open - close it
                IdCrtl = 0;
                currentCtrl = {};
                currentTracaId = 0;
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                $('#SemelleProcessing').css('display', 'block');
                $.ajax({
                    type: "POST",
                    url: 'SET/DetailCtrl',
                    data: { ID: rowData.ID },
                    success: function (data) {
                        row.child(data).show();
                        tr.addClass('shown'); // Modifie l'icone de l'oeil

                        IdCrtl = rowData.ID; currentCtrl = rowData;
                        currentTracaId = rowData.TracaId;
                        $('#_lblName').text("Saisi par " + rowData.UserCtrl.trim());
                        $('#_lblComment').text("Commentaire " + rowData.Comment.trim());

                        // Edition
                        $('#btn-editCtrl').on('click', function (e) {
                            _Controle = { ZP: "", ZI: "", LastDateZIB1: "", LastDateZIB2: "", LastDateZPB1: "", LastDateZPB2: "", kmzib1: 0, kmzib2: 0, kmzpb1: 0, kmzpb2: 0, MessBM: "" };
                            _LastDate = { LastDateZIB1: "", LastDateZIB2: "", LastDateZPB1: "", LastDateZPB2: "", LastIdZIB1: "", LastIdZIB2: "", LastIdZPB1: "", LastIdZPB2: "" };
                            _LastZIB1 = { BmIso: false, cvR1: false, cvR2: false, cvR3: false, cvR4: false, rplR1: false, rplR2: false, rplR3: false, rplR4: false, mesuR1: 0, mesuR2: 0, mesuR3: 0, mesuR4: 0 };
                            _LastZIB2 = { BmIso: false, cvR1: false, cvR2: false, cvR3: false, cvR4: false, rplR1: false, rplR2: false, rplR3: false, rplR4: false, mesuR1: 0, mesuR2: 0, mesuR3: 0, mesuR4: 0 };
                            _LastZPB1 = { BmIso: false, cvR1: false, cvR2: false, cvR3: false, cvR4: false, rplR1: false, rplR2: false, rplR3: false, rplR4: false, mesuR1: 0, mesuR2: 0, mesuR3: 0, mesuR4: 0 };
                            _LastZPB2 = { BmIso: false, cvR1: false, cvR2: false, cvR3: false, cvR4: false, rplR1: false, rplR2: false, rplR3: false, rplR4: false, mesuR1: 0, mesuR2: 0, mesuR3: 0, mesuR4: 0 };
                            _zib1Ok = false; _zib2Ok = false; _zpb1Ok = false; _zpb2Ok = false;
                            _RecupZIB1 = false; _RecupZIB2 = false; _RecupZPB1 = false; _RecupZPB2 = false;
                            zImpaire = "";
                            zPaire = "";
                            _SaisieValide = false;

                            CtrlBuild.rame = rowData.RameId + '/' + rowData.SerieId + '/' + rowData.SousSerieId + '/' + rowData.NumRame;
                            RameSelected = { ID: rowData.RameId, EAB: rowData.NumRame, NumEF: "0", IdRexM: 0, IdSerie: rowData.SerieId, IdSousSerie: rowData.SousSerieId, Serie: "0", SousSerie: "0", CodeSerie: "0", IdFlotteOsm: 0 };
                            $('#modal-Ctrl').modal({ keyboard: true, show: true });

                        });

                        // Delete
                        $('#btn-delCtrl').on('click', function (e) {
                            $.confirm({
                                theme: 'bootstrap',
                                icon: 'fa fa-exclamation-triangle btn-danger',
                                confirmButton: 'Confirmer',
                                cancelButton: 'Annuler',
                                confirmButtonClass: 'btn-primary',
                                cancelButtonClass: 'btn-warning',
                                title: 'Suppression Contrôle',
                                content: '<strong>Attention</strong>, vous êtes sur le point de supprimer un Contrôle semelle. <br> Veuillez Confirmer ou Annuler SVP...',
                                animation: 'zoom',
                                closeAnimation: 'scale',
                                animationSpeed: 500,
                                animationBounce: 1.2,
                                confirm: function () {
                                    $.get('http://localhost:3000/deleteCtrlByID', { id: rowData.ID })
                                        .done(function (retour) { semelleTable1.ajax.reload(); })
                                        .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur de la suppression du Ctrl : " + err); });
                                },
                                cancel: function () { }
                            });
                        });
                        $("#sites_detail").on('change', function () {
                            $.confirm({
                                theme: 'bootstrap',
                                icon: 'fa fa-question-circle btn-primary',
                                confirmButton: 'Confirmer',
                                cancelButton: 'Annuler',
                                confirmButtonClass: 'btn-primary',
                                cancelButtonClass: 'btn-warning',
                                title: 'Mofification du site',
                                content: 'Confirmez-vous le changement du site ?',
                                animation: 'zoom',
                                closeAnimation: 'scale',
                                animationSpeed: 500,
                                animationBounce: 1.2,
                                confirm: function () {
                                    $.get('http://localhost:3000/updtValueCtrlByID', { id: rowData.ID, field: 'SiteId', value: $("#sites_detail").val() })
                                        .done(function (retour) { semelleTable1.ajax.reload(); })
                                        .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur dans la mise à jour du Ctrl : " + err); });
                                },
                                cancel: function () { $('#sites_detail').selectpicker('val', rowData.SiteId); }
                            });
                        });
                        $("#inters_detail").on('change', function () {
                            $.confirm({
                                theme: 'bootstrap',
                                icon: 'fa fa-question-circle btn-primary',
                                confirmButton: 'Confirmer',
                                cancelButton: 'Annuler',
                                confirmButtonClass: 'btn-primary',
                                cancelButtonClass: 'btn-warning',
                                title: "Mofification de l'intervention",
                                content: "Confirmez-vous le changement de l'intervention ?",
                                animation: 'zoom',
                                closeAnimation: 'scale',
                                animationSpeed: 500,
                                animationBounce: 1.2,
                                confirm: function () {
                                    $.get('http://localhost:3000/updtValueCtrlByID', { id: rowData.ID, field: 'InterventionId', value: $("#inters_detail").val() })
                                        .done(function (retour) { semelleTable1.ajax.reload(); })
                                        .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur dans la mise à jour du Ctrl : " + err); });
                                },
                                cancel: function () { $('#inters_detail').selectpicker('val', rowData.InterventionId); }
                            });
                        });
                    },
                    error: function (e) { alert("Erreur Ouverture Détail" + "\r\n" + e.error); $('#SemelleProcessing').css('display', 'none'); }
                });
            }

        });

    }
    $('#calcConso').on('click', function (e) {
        _NumRameId = $('#txtRame').val();
        _MAXNumRame = $('#txtMax').val();
        SetConso(_NumRameId);
    });
    
    function SetConso(_idrame_) {
        $.getJSON("http://localhost:3000/getAllCtrlsSemelles", { Idame: _idrame_ })
            .done(function (ctrl) {
                var cnsZIB1R1 = 'NULL'; var cnsZIB1R2 = 'NULL'; var cnsZIB1R3 = 'NULL'; var cnsZIB1R4 = 'NULL';
                var cnsZIB2R1 = 'NULL'; var cnsZIB2R2 = 'NULL'; var cnsZIB2R3 = 'NULL'; var cnsZIB2R4 = 'NULL';
                var cnsZPB1R1 = 'NULL'; var cnsZPB1R2 = 'NULL'; var cnsZPB1R3 = 'NULL'; var cnsZPB1R4 = 'NULL';
                var cnsZPB2R1 = 'NULL'; var cnsZPB2R2 = 'NULL'; var cnsZPB2R3 = 'NULL'; var cnsZPB2R4 = 'NULL';
                var _tabResult = [];
                var _id = 0;

                var _tab = ctrl;
                var _result = "";

                if (_tab.length == 0 && _NumRameId < _MAXNumRame) {
                    _NumRameId++;
                    $('.progress-bar').css('width', _NumRameId + '%').attr('aria-valuenow', _NumRameId);
                    SetConso(_NumRameId);
                }

                for (var i = 0; i < _tab.length; i++) {
                    _id = 0;
                    // ZIB1
                    if (_tab[i].ZIB1_R1_MESURE != 0) {
                        for (var j = i + 1; j < _tab.length; j++) {
                            if (_tab[j].ZIB1_R1_MESURE != 0) {
                                cnsZIB1R1 = _tab[i].ZIB1_R1_MESURE - (_tab[j].ZIB1_R1_RPL ? 60 : _tab[j].ZIB1_R1_MESURE);
                                _id = _tab[i].ID;
                                break;
                            }
                        }
                    }
                    if (_tab[i].ZIB1_R2_MESURE != 0) {
                        for (var j = i + 1; j < _tab.length; j++) {
                            if (_tab[j].ZIB1_R2_MESURE != 0) {
                                cnsZIB1R2 = _tab[i].ZIB1_R2_MESURE - (_tab[j].ZIB1_R2_RPL ? 60 : _tab[j].ZIB1_R2_MESURE);
                                _id = _tab[i].ID;
                                break;
                            }
                        }
                    }
                    if (_tab[i].ZIB1_R3_MESURE != 0) {
                        for (var j = i + 1; j < _tab.length; j++) {
                            if (_tab[j].ZIB1_R3_MESURE != 0) {
                                cnsZIB1R3 = _tab[i].ZIB1_R3_MESURE - (_tab[j].ZIB1_R3_RPL ? 60 : _tab[j].ZIB1_R3_MESURE);
                                _id = _tab[i].ID;
                                break;
                            }
                        }
                    }
                    if (_tab[i].ZIB1_R4_MESURE != 0) {
                        for (var j = i + 1; j < _tab.length; j++) {
                            if (_tab[j].ZIB1_R4_MESURE != 0) {
                                cnsZIB1R4 = _tab[i].ZIB1_R4_MESURE - (_tab[j].ZIB1_R4_RPL ? 60 : _tab[j].ZIB1_R4_MESURE);
                                _id = _tab[i].ID;
                                break;
                            }
                        }
                    }
                    // ZIB2
                    if (_tab[i].ZIB2_R1_MESURE != 0) {
                        for (var j = i + 1; j < _tab.length; j++) {
                            if (_tab[j].ZIB2_R1_MESURE != 0) {
                                cnsZIB2R1 = _tab[i].ZIB2_R1_MESURE - (_tab[j].ZIB2_R1_RPL ? 60 : _tab[j].ZIB2_R1_MESURE);
                                _id = _tab[i].ID;
                                break;
                            }
                        }
                    }
                    if (_tab[i].ZIB2_R2_MESURE != 0) {
                        for (var j = i + 1; j < _tab.length; j++) {
                            if (_tab[j].ZIB2_R2_MESURE != 0) {
                                cnsZIB2R2 = _tab[i].ZIB2_R2_MESURE - (_tab[j].ZIB2_R2_RPL ? 60 : _tab[j].ZIB2_R2_MESURE);
                                _id = _tab[i].ID;
                                break;
                            }
                        }
                    }
                    if (_tab[i].ZIB2_R3_MESURE != 0) {
                        for (var j = i + 1; j < _tab.length; j++) {
                            if (_tab[j].ZIB2_R3_MESURE != 0) {
                                cnsZIB2R3 = _tab[i].ZIB2_R3_MESURE - (_tab[j].ZIB2_R3_RPL ? 60 : _tab[j].ZIB2_R3_MESURE);
                                _id = _tab[i].ID;
                                break;
                            }
                        }
                    }
                    if (_tab[i].ZIB2_R4_MESURE != 0) {
                        for (var j = i + 1; j < _tab.length; j++) {
                            if (_tab[j].ZIB2_R4_MESURE != 0) {
                                cnsZIB2R4 = _tab[i].ZIB2_R4_MESURE - (_tab[j].ZIB2_R4_RPL ? 60 : _tab[j].ZIB2_R4_MESURE);
                                _id = _tab[i].ID;
                                break;
                            }
                        }
                    }
                    // ZPB1
                    if (_tab[i].ZPB1_R1_MESURE != 0) {
                        for (var j = i + 1; j < _tab.length; j++) {
                            if (_tab[j].ZPB1_R1_MESURE != 0) {
                                cnsZPB1R1 = _tab[i].ZPB1_R1_MESURE - (_tab[j].ZPB1_R1_RPL ? 60 : _tab[j].ZPB1_R1_MESURE);
                                _id = _tab[i].ID;
                                break;
                            }
                        }
                    }
                    if (_tab[i].ZPB1_R2_MESURE != 0) {
                        for (var j = i + 1; j < _tab.length; j++) {
                            if (_tab[j].ZPB1_R2_MESURE != 0) {
                                cnsZPB1R2 = _tab[i].ZPB1_R2_MESURE - (_tab[j].ZPB1_R2_RPL ? 60 : _tab[j].ZPB1_R2_MESURE);
                                _id = _tab[i].ID;
                                break;
                            }
                        }
                    }
                    if (_tab[i].ZPB1_R3_MESURE != 0) {
                        for (var j = i + 1; j < _tab.length; j++) {
                            if (_tab[j].ZPB1_R3_MESURE != 0) {
                                cnsZPB1R3 = _tab[i].ZPB1_R3_MESURE - (_tab[j].ZPB1_R3_RPL ? 60 : _tab[j].ZPB1_R3_MESURE);
                                _id = _tab[i].ID;
                                break;
                            }
                        }
                    }
                    if (_tab[i].ZPB1_R4_MESURE != 0) {
                        for (var j = i + 1; j < _tab.length; j++) {
                            if (_tab[j].ZPB1_R4_MESURE != 0) {
                                cnsZPB1R4 = _tab[i].ZPB1_R4_MESURE - (_tab[j].ZPB1_R4_RPL ? 60 : _tab[j].ZPB1_R4_MESURE);
                                _id = _tab[i].ID;
                                break;
                            }
                        }
                    }
                    // ZPB2
                    if (_tab[i].ZPB2_R1_MESURE != 0) {
                        for (var j = i + 1; j < _tab.length; j++) {
                            if (_tab[j].ZPB2_R1_MESURE != 0) {
                                cnsZPB2R1 = _tab[i].ZPB2_R1_MESURE - (_tab[j].ZPB2_R1_RPL ? 60 : _tab[j].ZPB2_R1_MESURE);
                                _id = _tab[i].ID;
                                break;
                            }
                        }
                    }
                    if (_tab[i].ZPB2_R2_MESURE != 0) {
                        for (var j = i + 1; j < _tab.length; j++) {
                            if (_tab[j].ZPB2_R2_MESURE != 0) {
                                cnsZPB2R2 = _tab[i].ZPB2_R2_MESURE - (_tab[j].ZPB2_R2_RPL ? 60 : _tab[j].ZPB2_R2_MESURE);
                                _id = _tab[i].ID;
                                break;
                            }
                        }
                    }
                    if (_tab[i].ZPB2_R3_MESURE != 0) {
                        for (var j = i + 1; j < _tab.length; j++) {
                            if (_tab[j].ZPB2_R3_MESURE != 0) {
                                cnsZPB2R3 = _tab[i].ZPB2_R3_MESURE - (_tab[j].ZPB2_R3_RPL ? 60 : _tab[j].ZPB2_R3_MESURE);
                                _id = _tab[i].ID;
                                break;
                            }
                        }
                    }
                    if (_tab[i].ZPB2_R4_MESURE != 0) {
                        for (var j = i + 1; j < _tab.length; j++) {
                            if (_tab[j].ZPB2_R4_MESURE != 0) {
                                cnsZPB2R4 = _tab[i].ZPB2_R4_MESURE - (_tab[j].ZPB2_R4_RPL ? 60 : _tab[j].ZPB2_R4_MESURE);
                                _id = _tab[i].ID;
                                break;
                            }
                        }
                    }

                    if (_id != 0) {
                        _result = "(" + _id + "," + cnsZIB1R1 + "," + cnsZIB1R2 + "," + cnsZIB1R3 + "," + cnsZIB1R4
                        + "," + cnsZIB2R1 + "," + cnsZIB2R2 + "," + cnsZIB2R3 + "," + cnsZIB2R4
                        + "," + cnsZPB1R1 + "," + cnsZPB1R2 + "," + cnsZPB1R3 + "," + cnsZPB1R4
                        + "," + cnsZPB2R1 + "," + cnsZPB2R2 + "," + cnsZPB2R3 + "," + cnsZPB2R4 + ")"
                        _tabResult.push(_result);
                    }

                    if (i == _tab.length - 1) {

                        $.post('http://localhost:3000/SetConso', { ctrl: _tabResult })
                            .done(function (retour) {
                                if (retour == "OK") {
                                    if (_NumRameId < _MAXNumRame) {

                                        $('.progress-bar').css('width', _NumRameId + '%').attr('aria-valuenow', _NumRameId);
                                        _NumRameId++;

                                       

                                        SetConso(_NumRameId);
                                    }
                                    else { alert("Terminée");}
                                }
                            })
                            .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur dans la mise à jour Conso : " + err); });
                    }
                }
                
            })
            .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur data... : " + err); });
    }

    /* */

    /* Région Préventif */
    $('#prevTable').on('processing.dt', function (e, settings, processing) { $('#PrevProcessing').css('display', processing ? 'block' : 'none'); });
    var OptionsPrev = {
        "processing": true,
        "deferRender": true,
        "jQueryUI": true,
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
        "iDisplayLength": -1,
        "order": [[8, "asc"], [4, "desc"]],
        "language": languageOptions,
        "ajax": {
            "url": "http://localhost:3000/getPreventif",
            "data": function (d) {
                d.rame      = RameSelected.NumEF;
                d.stf       = StfSelected.ID;
            }
        },
        "columns": [
            { "data": "Libelle", "visible": false },
            { "data": "SiteReal" },
            { "data": "Statut" },
            { "data": "DateDebIntv", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return data == null ? null : moment(data).format('DD/MM/YYYY HH:mm'); } },
            { "data": "DateFinIntv", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return data == null ? null : moment(data).format('DD/MM/YYYY HH:mm'); } },
            { "data": "DateRdvPrev", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return data == null ? null : moment(data).format('DD/MM/YYYY HH:mm'); } },
            { "data": "DateRdvReel", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return data == null ? null : moment(data).format('DD/MM/YYYY HH:mm'); } },
            { "data": "DateButee", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return data == null ? null : moment(data).format('DD/MM/YYYY HH:mm'); } },
            { "data": "Priorite", "visible": false },
        ],
        "drawCallback": function ( settings ) {
            var api     = this.api();
            var rows    = api.rows( {page:'current'} ).nodes();
            var last    = null;
 
            api.column(0, { page: 'current' }).data().each(function (group, i) {
                if (last !== group) {
                    $(rows).eq(i).before('<tr class="group"><td colspan="7">' + group + '</td></tr>');
                    last = group;
                }
            });
        },
        "createdRow": function (row, data, index) { }
    }

    var loadPrev = function () {
        if (typeof prevTable1 != 'undefined') { prevTable1.destroy(); } // destroy table if exist
        prevTable1 = $('#prevTable')
            .on('error.dt', function (e, settings, techNote, message) { $('#_i_refresh').removeClass("fa-spin"); console.log('An error has been reported by DataTables: ', message); })
            .on('xhr.dt', function (e, settings, json, xhr) { $('#_i_refresh').removeClass("fa-spin");  })
            .DataTable(OptionsPrev);

        $('#prevTable tbody').on('click', 'tr.group', function () {
        });
    }
});
