/**
 * @Description draw patient demographics info.
 * @Author: Rui Li
 * @Date: 9/25/19
 */

/**
 * render demographic information
 * @param data
 */
function renderDemo(data) {


    var width = 290,
        height = 390,
        margin = 10;

    var colorDomain = d3.keys(data.raceSum);
    var colorRange = ["#2dba9d", "#3d576c", "#359ad7", "#985fb2", "#3fc977", "#f1c40f"];

    var color = d3.scaleOrdinal()
        .domain(colorDomain)
        .range(colorRange);

    var radius = 50;

    const ageGroup = data.ageArr.reduce((total, value) => {
        total[value] = (total[value] || 0) + 1;
        return total;
    }, {});

    var ageX = d3.keys(ageGroup);
    var ageY = Object.values(ageGroup);


    var raceChart = echarts.init(document.getElementById('race-chart'), {width: 280});

    //render box chart
    var genderChart = echarts.init(document.getElementById('gender-chart'), {width: 250});

    //age
    var ageChart = echarts.init(document.getElementById('age-chart'), {width: 240, height: 46});

    raceOption = {
        title: {
            //text: 'Race distribution',
            subtext: 'Race distribution',
            x: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            y: '30',
            data: ['White', 'Black', 'Asian', 'Hispanic', 'Multirace', 'Other']
        },
        toolbox: {
            show: false,
            feature: {
                mark: {show: true},
                dataView: {show: true, readOnly: false},
                magicType: {
                    show: true,
                    type: ['pie', 'funnel']
                },
                restore: {show: true},
                saveAsImage: {show: true}
            }
        },
        calculable: true,
        series: [
            {
                name: 'Population',
                type: 'pie',
                radius: [10, 40],
                center: ['65%', '70%'],
                roseType: 'radius',
                label: {
                    normal: {
                        show: true
                    },
                    emphasis: {
                        show: true
                    }
                },
                lableLine: {
                    normal: {
                        show: true
                    },
                    emphasis: {
                        show: true
                    }
                },
                data: [
                    {value: data.raceSum.white, name: 'White'},
                    {value: data.raceSum.black, name: 'Black'},
                    {value: data.raceSum.asian, name: 'Asian'},
                    {value: data.raceSum.hispanic, name: 'Hispanic'},
                    {value: data.raceSum.mixed, name: 'Multirace'},
                    {value: data.raceSum.other, name: 'Other'}
                ]
            }
        ]
    };

    sexOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            x: 'center',
            y: 28,
            data: ['Male', 'Female']
        },
        grid: {
            left: '0%',
            right: '4%',
            bottom: '0%',
            borderWidth: 0,
            containLabel: true
        },
        xAxis: {
            type: 'value'
        },
        yAxis: {
            type: 'category',
            data: ['Gender']
        },
        series: [
            {
                name: 'Male',
                type: 'bar',
                stack: 'total',
                label: {
                    normal: {
                        show: true,
                        position: 'insideRight'
                    }
                },
                data: [data.maleCount]
            },
            {
                name: 'Female',
                type: 'bar',
                stack: 'total',
                label: {
                    normal: {
                        show: true,
                        position: 'insideRight'
                    }
                },
                data: [data.femaleCount]
            }
        ]
    };

    ageOption = {
        xAxis: {
            data: ageX,
            silent: false,
            splitLine: {
                show: false
            }
        },
        tooltip: {},
        grid: {
            top: 30,
            bottom: 20
        },
        yAxis: {},
        series: [{
            name: 'age',
            type: 'bar',
            data: ageY,
            animationDelay: function (idx) {
                return idx * 10;
            }
        }]
    };

    genderChart.setOption(sexOption);
    raceChart.setOption(raceOption);
    ageChart.setOption(ageOption);
    //render histogram


}