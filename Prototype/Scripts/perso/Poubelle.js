function GetLibRest() {
    $('#LibRestList').multiselect({
        maxHeight: 200,
        includeSelectAllOption: true,
        enableFiltering: true,
        enableClickableOptGroups: true,
        filterPlaceholder: 'Libellé...',
        selectAllText: 'Sélectionner tout',
        nonSelectedText: 'Libellé Restriction',
        numberDisplayed: 10,
        buttonWidth: '100%',
        enableCaseInsensitiveFiltering: true,
        onDropdownHidden: function () {
            if (!filterActifRest.dp && !filterActifRest.da && filterActifRest.li) ActualiseData();
            var selectedOptions = $('#LibRestList').val();
            if (selectedOptions) {
                var arrTostr = selectedOptions.join("|");    // convert array to str(regEx) for searching
                restrictionTable1.columns(8).search(arrTostr, true, false).draw();
            }
            else { restrictionTable1.columns(8).search('').draw(); }
        }
    });


    //cs: CodeSerieRame 
    //$.getJSON("Set/GetLibelleRestByRame", { IdStf: StfSelected.ID, Cs: RameSelected.CodeSerie })
    //.done(function (json) { $('#LibRestList').multiselect('dataprovider', json); })
    //.fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Request Failed: " + err); });

    $.getJSON("http://localhost:3000/getLibellesRestriction", { IdStf: StfSelected.ID, IdSerie: parseInt($('#seriesList').val()), IdSousSerie: parseInt($('#sousseriesList').val()), IdRame: RameSelected.ID })
.done(function (json) {

    //var t = Enumerable.From(json.data)
    //    .GroupBy('$.Famille', function (key, group) { return { label: key, value: group.ToString(',') } });


    var _tblLib = Enumerable.From(json.data).GroupBy('$.Famille').Select("x => {label: x.Key(), children : Enumerable.From(x.source).Select('p=>{label: p.Libelle,value: p.Libelle,disabled: false,selected: false}').ToArray() } ").ToArray();
    $('#LibRestList').multiselect('dataprovider', _tblLib);

    //var dataLibGrf=[];
    //GetUniqOfTable(json.data, 'Famille').then(function (_UniqFamille) {
    //    $.each(_UniqFamille, function (i, item) {
    //    });
    //});
})
.fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur Recup SousSéries : " + err); });
}

function getRamesold() {
    $.getJSON("Set/GetRames", { IDstf: StfSelected.ID, IDserie: $('#seriesList').val(), IDsousserie: $('#sousseriesList').val() })
    .done(function (json) {
        tabAllRame = json.data;
        $('#RameInput').val('');
        RameSelected = { ID: 0, EAB: "0", NumEF: "0", IdRexM: 0, IdSerie: 0, IdSousSerie: 0, Serie: "0", SousSerie: "0", CodeSerie: "0", IdFlotteOsm: 0 };
        $('#_stfHidden').val(StfSelected.ID);
        $('#_rameHidden').val(RameSelected.ID);

        $('#rame-AllPanne')[0].classList.add("disabled"); $('#rame-AllPanne').prop("disabled", true);
        $('#rame-AllPanne').css("cursor", "not-allowed");

        $('.typeahead-hint, .typeahead-result, .typeahead-filter-button, .typeahead-filter').remove();

        // Récup des Différents IdFlotte pour les requettes Osmose
        //tabFlotteId = _.chain(json.data).pluck('IdFlotteOsm').unique().value();
        tabFlotteId = _.uniq(_.map(json.data, 'IdFlotteOsm'));
        for (var i = 0; i <= tabFlotteId.length - 1; i++) { tabFlotteId[i] = "'" + tabFlotteId[i] + "'"; }

        var tabFilter = new Array();
        //var tabSousSerie = _.chain(json.data).pluck('SousSerie').unique().value();
        var tabSousSerie = _.uniq(_.map(json.data, 'SousSerie'));
        if (tabSousSerie.length == 1 && tabSousSerie[0] == "Sans Nom") tabSousSerie = [];
        //var tabSerie = _.chain(json.data).pluck('Serie').unique().value();
        var tabSerie = _.uniq(_.map(json.data, 'Serie'));
        for (var i = 0; i <= tabSousSerie.length - 1; i++) { tabFilter.push({ key: "SousSerie", value: tabSousSerie[i], display: '<strong>SousSerie </strong>' + tabSousSerie[i] }); }
        for (var i = 0; i <= tabSerie.length - 1; i++) { tabFilter.push({ key: "Serie", value: tabSerie[i], display: '<strong>Serie </strong>' + tabSerie[i] }); }
        tabFilter.push({ value: "*", display: 'Toutes' });
        $.typeahead({
            input: "#RameInput",
            offset: true,
            searchOnFocus: true,
            highlight: true,
            minLength: 1,
            maxItem: 8,
            maxItemPerGroup: 6,
            order: "asc",
            hint: true,
            emptyTemplate: "Aucune rame n'existe avec {{query}}",
            group: ["SousSerie", "Sous-Série : {{group}} "],
            display: ["EAB", "NumEF"],
            template: "{{EAB}}",
            source: json.data,
            dropdownFilter: tabFilter,
            callback: {
                onClickAfter: function (node, a, item, event) {
                    RameSelected = item;
                    $('#spRameText').removeClass('error-input');
                    //$('a[href="#pgh"]')[0].parentElement.classList.remove("disabled"); $('a[href="#pgh"]').attr("data-toggle", "tab");
                    //$('a[href="#semelles"]')[0].parentElement.classList.remove("disabled"); $('a[href="#semelles"]').attr("data-toggle", "tab");
                    //$('a[href="#km"]')[0].parentElement.classList.remove("disabled"); $('a[href="#km"]').attr("data-toggle", "tab");
                    //$('a[href="#prev"]')[0].parentElement.classList.remove("disabled"); $('a[href="#prev"]').attr("data-toggle", "tab");

                    $('#_stfHidden').val(StfSelected.ID);
                    $('#_rameHidden').val(RameSelected.ID);

                    ActualiseData();
                    GetLibRest();

                    $('#rame-AllPanne')[0].classList.remove("disabled"); $('#rame-AllPanne').prop("disabled", false);
                    $('#rame-AllPanne').css("cursor", "pointer");
                },
                onResult: function (node, query, result, resultCount) { RameSelected = result[0]; },
                onNavigate: function (node, query, event) {
                    if (event.keyCode == 13) {
                        $("#RameInput").val(RameSelected.EAB);
                        $('#spRameText').removeClass('error-input');
                        //$('a[href="#pgh"]')[0].parentElement.classList.remove("disabled"); $('a[href="#pgh"]').attr("data-toggle", "tab");
                        //$('a[href="#semelles"]')[0].parentElement.classList.remove("disabled"); $('a[href="#semelles"]').attr("data-toggle", "tab");
                        //$('a[href="#km"]')[0].parentElement.classList.remove("disabled"); $('a[href="#km"]').attr("data-toggle", "tab");
                        //$('a[href="#prev"]')[0].parentElement.classList.remove("disabled"); $('a[href="#prev"]').attr("data-toggle", "tab");

                        $('#_stfHidden').val(StfSelected.ID);
                        $('#_rameHidden').val(RameSelected.ID);

                        ActualiseData();
                        GetLibRest();

                        $('#rame-AllPanne')[0].classList.remove("disabled"); $('#rame-AllPanne').prop("disabled", false);
                        $('#rame-AllPanne').css("cursor", "pointer");
                    }
                }
            }
        });
        //ActualiseData();
    })
    .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Request Failed: " + err); });
}
