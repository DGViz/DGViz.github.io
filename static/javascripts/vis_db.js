/**
 * @Description database CRUD
 * @Author: Rui Li
 * @Date: 9/10/19
 */

/**
 * find all patient records (visit time > 2)
 */
function findAllPatients() {

    return new Promise(function (resolve, reject) {
        $.ajax({
            url: '/find_all_patient',
            type: 'GET',
            datatype: 'JSON',
            success: function (response) {
                globalData = JSON.parse(response);
                resolve("finish");
            },
            error: function (error) {
                reject(error);
            }
        });
    });

}



/**
 * ajax template for flask project
 * https://www.bogotobogo.com/python/Flask/Python_Flask_with_AJAX_JQuery.php
 */
function ajaxTemplate(){

    $.ajax({
        url: '/find_all_countlg2',
        type: 'GET',
        datatype: 'JSON',
        success: function (response) {
            console.log(JSON.parse(response));
        },
        error: function (error) {
            console.log(error);
        }
    });

}

