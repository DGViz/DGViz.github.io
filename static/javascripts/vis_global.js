/**
 * @Description The global control of the system
 * @Author: Rui Li
 * @Date: 9/10/19
 */

//global variables

var drug_dic = {"60320":"MINERALOCORTICOIDS",
"60314":"LOOP DIURETICS",
"60157":"ANTIHYPERTENSIVES, ANGIOTENSIN RECEPTOR ANTAGONIST",
"60394":"THYROID HORMONES",
"60392":"THIAZIDE AND RELATED DIURETICS",
"60111":"ANGIOTENSIN RECEPTOR ANTGNST & CALC.CHANNEL BLOCKR",
"60110":"NGIOTENSIN RECEPTOR ANTAG./THIAZIDE DIURETIC COMB",
"60362":"POTASSIUM SPARING DIURETICS IN COMBINATION",
"60361":"POTASSIUM SPARING DIURETICS"};

$(document).ready(function () {

    $(document).bind('keydown', (e) => {
        if (e.keyCode == 65) {
            ifSelMode = true;
        } else if (e.keyCode == 83)
            ifTempMode = true;
    });
    $(document).bind('keyup', (e) => {
        if (e.keyCode == 65) {
            ifSelMode = false;
        } else if (e.keyCode == 83)
            ifTempMode = false;
    });

    $('#kg-switch').change(function () {
        var text = $(this).find("option:selected").val();
        if (text == 2) {
            // console.log(ds);
            if (ds == 1) {
                //show detail
                $('#kg-vis').css({'display': 'none'});
                $('#sel-kg-vis').css({'display': 'block'});
            } else {
                alert("Please select the code to view!");
            }
        } else {
            //show whole knowledge graph
            $('#kg-vis').css({'display': 'block'});
            s.refresh();
            $('#sel-kg-vis').css({'display': 'none'});
        }

    });


    visStart();

});


/**
 * init dataset
 * @returns {Promise<void>}
 */
async function initData() {
    await findAllPatients();  //load all patient data
    await get_test_data();    //loal test data information
    ptSumData = demoSummary(globalData);  //compute patient summary information
    plotOverview(globalData);
    renderKG();
    renderDemo(ptSumData);
}


/**
 * start the vis system
 */
function visStart() {

    initData();


}












