/**
* @Description interact with model
* @Author: Rui Li
* @Date: 11/2/19
*/

/**
 * from the DG-RNN model to load the test data
 * return:
 * pid_aid_did_dict:
     pid: patient id
     aid: admission id
     did: diagnosis id
   aid_date_dict:
     aid: admission id
     date: int, admission's time
   vocab_list:
     diagnosis id
     diagnosis name
 * @returns {Promise<unknown>}
 */
function get_test_data(){

    return new Promise(function (resolve, reject) {
        $.ajax({
            url: '/get_test_data',
            type: 'GET',
            datatype: 'JSON',
            success: function (response) {
                ptTestData = response;
                resolve("finish");
            },
            error: function (error) {
                reject(error);
            }
        });
    });
}

/**
 * retrive the predict results, contribution and knowledge graph from model
 * @param pid_aid_did_dict
 * @return  pid_aid_did_cr_dict: code contribution, knowledge graph contribution
            pid_aid_risk_dict: the risk factor until time t.
            pid_aid_did_att_dict: knowledge graph weight
 */
function get_pred_data(pid_aid_did_dict){
    return new Promise(function (resolve, reject) {
        $.ajax({
                url: '/get_pred_data',
                type: 'POST',
                datatype: 'JSON',
                data: {data:JSON.stringify(pid_aid_did_dict)},
                success: function (response) {
                    let PtPredData = computeVisitContri(response);
                    resolve(PtPredData);
                },
                error: function (error) {
                    reject(error);
                }
        });
    });
}