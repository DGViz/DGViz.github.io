/**
* @Description data processing
* @Author: Rui Li
* @Date: 9/24/19
*/

//global dataset
var globalData = new Object();
//patient summary data
var ptSumData = new Object();
//patient information, test dataset
var ptTestData = new Object();
//selected patient prediction
var gPtPredData = new Object();
//selected patient info
var gSinPtData = new Object();
//select patient id
var gPID = 0;

/**
 * compute the demographics statistics within the dataset
 * @param data
 */
function demoSummary(data) {

    var demoSum = new Object();
    var raceSum = new Object();  //race

    demoSum.ageArr = [];
    demoSum.maleCount = 0;
    demoSum.femaleCount = 0;
    demoSum.meanAge = 0;

    raceSum.white = 0;
    raceSum.black = 0;
    raceSum.hispanic = 0;
    raceSum.asian = 0;
    raceSum.mixed = 0;
    raceSum.other = 0;

    data.forEach(function (item, index) {
        demoSum.ageArr.push(item.AGE);
        if(item.GENDER == 'M')
            demoSum.maleCount++;
        else if(item.GENDER == 'F')
            demoSum.femaleCount++;
        //check ETHNICITY
        if(item.ETHNICITY.includes('WHITE'))
            raceSum.white++;
        else if(item.ETHNICITY.includes('ASIAN'))
            raceSum.asian++;
        else if(item.ETHNICITY.includes('BLACK'))
            raceSum.black++;
        else if(item.ETHNICITY.includes('HISPANIC'))
            raceSum.hispanic++;
        else if(item.ETHNICITY.includes('OTHER') || item.data[0].ETHNICITY.includes('UNKNOWN'))
            raceSum.other++;
        else
            raceSum.mixed++;
    });
    demoSum.meanAge = average(demoSum.ageArr);
    demoSum.raceSum = raceSum;
    return demoSum;

}

/**
 * find patient information (admission) based on p_id or p_id list
 * @param sub_id
 * note: should use d.toUTCString() to change the time zone
 * @return a list of patient information
 * admission: {adm_id : code array}
 * date: {adm_id : date}
 * sort_keys : [sorted adm_id]
 *
 */
function findPatientData(pid_arr){

    pt_data = new Object();
    for(var i = 0; i < pid_arr.length; i++){
        single_pt = {};
        var admission = ptTestData[0][pid_arr[0]]; //admission information
        var adm_date_dic = new Object();   //visit: date dic
        var keys = Object.keys(admission);
        for (const key of keys) {
            d = ptTestData[1][key];
            var date = new Date(d[0]+'-'+d[1]+'-'+d[2]+'z');
            adm_date_dic[key] = date;

        }
        single_pt.admission = admission;
        single_pt.date = adm_date_dic;
        single_pt.sort_keys = sortObjectByValue(adm_date_dic);
        pt_data[pid_arr[i]] = single_pt;
    }

    return pt_data;

}

/**
 * compute the visit contribution of patient
 * sum up all code for each visit together
 * @param pred_data
 * @returns {*}
 */
function computeVisitContri(pred_data){
    code_ct_obj = pred_data[0];
    var visit_ct_obj = new Object();
    for(var patient in code_ct_obj){
        var pt_ct = code_ct_obj[patient];
        var pt_visit_cr_obj = new Object();
        for(var visit in pt_ct){
            var pt_visit_ct = pt_ct[visit];
            var visit_ct_val = 0;
            for(var code in pt_visit_ct){
                var code_ct_val = pt_visit_ct[code][0];
                visit_ct_val += parseFloat(code_ct_val);
            }
            pt_visit_cr_obj[visit] = visit_ct_val;
        }
        visit_ct_obj[patient] = pt_visit_cr_obj;
    }
    pred_data.push(visit_ct_obj);
    return pred_data;
}















