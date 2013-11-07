var GLOBAL_charts_by_id = {}

function calculate_interest(principal, rate, period) {
    compound_rate = 12
    total_value = principal * Math.pow((1 + (rate / compound_rate)), compound_rate * (period/12));
    interest = total_value - principal;

    return interest;
}

function calculate_payment(loan_amount, rate, term) {
    monthly_rate = rate/12;
    term_length = term;
    payment = (loan_amount * monthly_rate) / (1 - (1 / Math.pow((1 + monthly_rate), term_length)));

    return payment
}


function amortize(loan_amount, rate, term, extra_payments, interest_no_more_than) {
    var payment_schedule = [];
    var principal_amount = loan_amount * 100; // The loan amount, in cents.
    var payment_amount = calculate_payment(loan_amount * 100, rate, term); // The payment amount ,in cents.
    var total_paid = 0;
    var total_principal_paid = 0;
    var total_interest_paid = 0;

    if (!extra_payments) {
        extra_payments = [{'frequency': 0, 'amount': 0}];
    }

    if (!interest_no_more_than) {
        interest_no_more_than = 1.1
    }

    for (var payment_number = 0; payment_number < term && principal_amount > 0; payment_number++) {
        var this_payment = payment_amount;
        var interest_paid = calculate_interest(principal_amount, rate, 1);
        var principal_paid = 0
        var percent_interest = null

        // If this a month in which an extra payment would be made,
        // increase this payments amount.
        $.each(extra_payments, function(index, extra_payment) {
            if (payment_number % extra_payment.frequency == 0) {
                this_payment += extra_payment.amount * 100
            }
        });


        principal_paid = this_payment - interest_paid;

        percent_interest = interest_paid / this_payment;
        if (percent_interest > interest_no_more_than) {
            var required_increase = (interest_paid / interest_no_more_than) - this_payment;
            principal_paid += required_increase;
            this_payment += required_increase;
        }

        // If the amount of principal being paid by this payment
        // would be greater than the principal amount left, modify
        // the payment amount and the principal paid amound.
        if (principal_amount < principal_paid) {
            principal_paid = principal_amount;
            this_payment = principal_amount + interest_paid
        }

        // Keep track of some overall statistics...
        principal_amount -= principal_paid;
        total_paid += this_payment;
        total_principal_paid += principal_paid;
        total_interest_paid += interest_paid;

        // Record information about this specific payment, converting back to
        // a dollar base instead of a cent base.
        payment_schedule.push({'interest_paid': interest_paid.toFixed(0) / 100,
                               'principal_paid': principal_paid.toFixed(0) / 100,
                               'payment_amount': this_payment.toFixed(0) / 100,
                               'principal_amount': principal_amount.toFixed(0) / 100,
                               'total_paid': total_paid.toFixed(0) / 100,
                               'total_principal_paid': total_principal_paid.toFixed(0) / 100,
                               'total_interest_paid': total_interest_paid.toFixed(0) / 100

        });
    }

    return {'base_payment': payment_amount.toFixed(0) / 100, 'schedule': payment_schedule}
}

function display_schedule(amortization_schedule) {
    $('#data-table-test').dataTable({
        "aaData": $.map(amortization_schedule, function(row, index) {
                        return [[index + 1, row.payment_amount, row.principal_paid, row.interest_paid,
                                 row.principal_amount, row.total_principal_paid, row.total_interest_paid,
                                 row.total_paid]];
                  }),
        "aoColumns": [{'sTitle': "Payment Number"},
                      {'sTitle': "Payment Amount"},
                      {'sTitle': "Principal Paid"},
                      {'sTitle': "Interest Paid"},
                      {'sTitle': "Principal Remaining"},
                      {'sTitle': "Total Principal Paid"},
                      {'sTitle': "Total Interest Paid"},
                      {'sTitle': "Total Paid"},

        ],
        "iDisplayLength": 24
    });
}

function graph_payment_breakdown(amortization_schedule) {
    $('#payment-breakdown').highcharts({
            chart: {
                type: 'area',
                // height: 500
                events: {
                    load: on_graph_load
                    }
            },
            title: {
                text: 'Payment Breakdown (Principal vs. Interest)'
            },
            xAxis: {
                tickmarkPlacement: 'on',
                title: {
                    text: 'Payment Breakdown (%)'
                }
            },
            yAxis: {
                title: {
                    text: 'Payment Amount (Dollars)'
                },
            },
            tooltip: {
                pointFormat: '<span style="color: {series.color}">{series.name}</span>: ' +
                             '{point.percentage:.1f}%</b> (${point.y:, .2f})<br/>',
                shared: true,
            },
            plotOptions: {
                area: {
                    stacking: 'percent',
                    lineColor: '#666666',
                    lineWidth: 1,
                    marker: {
                        lineWidth: 1,
                        lineColor: '#666666'
                    }
                }
            },
            series: [

                    {
                        name: "Principal",
                        color: '#36362A',
                        shadow: true,
                        marker: {
                            enabled: false
                        },
                        data: $.map(amortization_schedule, function(payment) {
                            return payment.principal_paid;
                        })
                    },

                    {
                        name: "Interest",
                        color: '#121212',
                        shadow: true,
                        marker: {
                            enabled: false
                        },
                        data: $.map(amortization_schedule, function(payment) {
                            return payment.interest_paid;
                        })
                    },


                     // {
                        // type: 'pie',
                        // name: 'Total Breakdown',
                        // data: [{
                            // name: 'Principal',
                            // y: amortization_schedule[amortization_schedule.length - 1].total_principal_paid,
                            // color: Highcharts.getOptions().colors[0] // John's color
                        // }, {
                            // name: 'Interest',
                            // y: amortization_schedule[amortization_schedule.length - 1].total_interest_paid,
                            // color: Highcharts.getOptions().colors[1]
                        // }],
                        // center: [100, -100],
                        // size: 100,
                        // showInLegend: false,
                        // dataLabels: {
                            // enabled: false
                        // }
                     // }

           ]
        });
}

function graph_payment_breakdown_pie(amortization_schedule) {
    $('#payment-breakdown-pie').highcharts({
        chart: {
            zoomType: 'xy',
            events: {
                load: on_graph_load
            }
        },
        title: {
            text: 'Grand Total Breakdown'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}% (${point.y:.2f})</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                colors: ['#36362A', '#121212'],
                // colors: ['#E3E320', '#CF8104'],
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    connectorColor: '#000000',
                    format: '{point.percentage:.2f}%'
                },
                showInLegend: true
            }
        },
        series: [{
                    type: 'pie',
                    name: 'Principal Paid vs. Interest Paid',
                    data: [['Total Principal Paid', amortization_schedule[amortization_schedule.length - 1].total_principal_paid],
                           ['Total Interest Paid', amortization_schedule[amortization_schedule.length - 1].total_interest_paid],

                    ],
                }]
    });
}

function graph_payments(amortization_schedule, base_payment) {
    $('#payments-graph').highcharts({
            chart: {
                zoomType: 'xy',
                events: {
                    load: on_graph_load
                }
            },
            title: {
                text: 'Amortization Details'
            },
            xAxis: {
                tickmarkPlacement: 'on',
                offset: 1,
                title: {
                    text: 'Payment Number'
                }
            },
            yAxis: [
                {
                    title: {
                        text: 'Payment Amount (Dollars)'
                    },
                    min: 0,
                    minorTickInterval: 'auto',
                    minorTickLength: 2,
                    minorTickWidth: 1,
                    labels: {
                                format: '${value:.2f}'
                    },
                    plotLines: [
                        {
                            value: base_payment,
                            dashStyle: 'longDash',
                            width: 2,
                            color: 'red',
                            label: {text: 'Base Payment: ($' + base_payment + ')',
                                    align: 'right',
                                    verticalAlign: 'bottom',
                                    style: {color: 'white'},
                                    y: 15, x: -20
                            },
                            zIndex: 5


                        }
                    ]
                },
                {
                    // Secondary yAxis
                    min: 0,
                    max: amortization_schedule[amortization_schedule.length - 1].total_paid,
                    opposite: true,
                    gridLineWidth: 0,
                    title: {
                        text: 'Overall Statistics (Dollars)',
                    },
                    labels: {
                        format: '${value:.2f}',
                        style: {
                            color: 'black'
                        }
                    }
                }
            ],
            plotOptions: {
                area: {
                    stacking: 'normal',
                    lineColor: '#666666',
                    lineWidth: 1,
                    marker: {
                        lineWidth: 1,
                        lineColor: '#666666'
                    }
                },
            },
            tooltip: {
                headerFormat: '<small><b>Payment #:</b> {point.key}</small><br/><br/>',
                pointFormat: '<span style="color: {series.color}">{series.name}</span>: ' +
                             '<b>${point.y:.2f} (Total: ${point.total:.2f})</b><br/>',
                shared: true,
            },
            series: [
                    {
                        type: 'area',
                        name: "Principal",
                        color: '#36362A',
                        shadow: true,
                        marker: {
                            enabled: false
                        },
                        data: $.map(amortization_schedule, function(payment) {
                                    return payment.principal_paid;
                        })
                    },
                    {
                        type: 'area',
                        name: "Interest",
                        color: '#121212',
                        shadow: true,
                        marker: {
                            enabled: false
                        },
                        data: $.map(amortization_schedule, function(payment) {
                            return payment.interest_paid;
                        }),
                    },

                    {
                        type: 'spline',
                        yAxis: 1,
                        name: 'Principal Remaining',
                        color: '#057EF7',
                        shadow: true,
                        marker: {
                            enabled: false
                        },
                        data: $.map(amortization_schedule, function(payment) {
                            return payment.principal_amount;
                        }),
                        tooltip: {
                            pointFormat: '<span style="color: {series.color}">{series.name}</span>: ' +
                                        '<b>${point.y:.2f}</b><br/>',
                        },
                    },

                    {
                        type: 'spline',
                        yAxis: 1,
                        name: 'Principal Paid',
                        color: '#E3E320',
                        shadow: true,
                        marker: {
                            enabled: false
                        },
                        data: $.map(amortization_schedule, function(payment) {
                            return payment.total_principal_paid;
                        }),
                        tooltip: {
                            pointFormat: '<span style="color: {series.color}">{series.name}</span>: ' +
                                        '<b>${point.y:.2f}</b><br/>',
                        },
                    },

                    {
                        type: 'spline',
                        dashStyle: 'shortdotdash',
                        shadow: true,
                        yAxis: 1,
                        name: 'Interest Paid',
                        color: '#CF8104',
                        marker: {
                            enabled: false
                        },
                        data: $.map(amortization_schedule, function(payment) {
                            return payment.total_interest_paid;
                        }),
                        tooltip: {
                            pointFormat: '<span style="color: {series.color}">{series.name}</span>: ' +
                                        '<b>${point.y:.2f}</b><br/>',
                        },
                    },

                    {
                        type: 'spline',
                        dashStyle: 'shortdot',
                        shadow: true,
                        yAxis: 1,
                        name: 'Total Paid',
                        color: '#3AD406',
                        marker: {
                            enabled: false
                        },
                        data: $.map(amortization_schedule, function(payment) {
                            return payment.total_paid;
                        }),
                        tooltip: {
                            pointFormat: '<span style="color: {series.color}">{series.name}</span>: ' +
                                        '<b>${point.y:.2f}</b><br/>',
                        },
                    },

           ]
        });
}

function on_graph_load(event) {
    var chart_parent = this.container.parentElement;
    GLOBAL_charts_by_id[chart_parent.id] = this;
    $(chart_parent).resizable({
                               grid: 25,
                               stop: (function (chart) {
                                        return function(event, uiObj) {
                                            chart.reflow();
                                        };
                                     })(this)

    });
    // This doesn't really look very good...
    $(chart_parent).children().removeClass('ui-icon ui-icon-gripsmall-diagonal-se');
}

function submit_amortization(event) {
    // Gather the information...
    var loan_amount = parseFloat($('#loan_amount').val());
    var interest_rate = parseFloat($('#interest_rate').val()) / 100;
    var term = parseInt($('#term').val());
    var interest_no_more_than = parseInt($('#interest_no_more_than').val()) / 100;

    extra_payments = [];
    $('#extra-payments').find('.extra_payment').each(function(index, extra_pay_inputs) {
        extra_payments.push({frequency: $(extra_pay_inputs).find('.frequency').val(),
                             amount: $(extra_pay_inputs).find('.amount').val()
                            });
    });

    var amortization = amortize(loan_amount, interest_rate, term, extra_payments, interest_no_more_than);
    graph_payments(amortization.schedule, amortization.base_payment);
    graph_payment_breakdown_pie(amortization.schedule);
    graph_payment_breakdown(amortization.schedule);
    display_schedule(amortization.schedule);
}

function add_extra_pay_input(event) {
    var parent = $(event.target).parent();
    parent.append("<div class='extra_payment'> \
                    <label> Frequency: <input class='frequency' type='text' /> </label> \
                    <label> Amount: <input class='amount' type='text' /> </label \
                  </div>");
}

function attach_events() {
    click_events();
}

function click_events() {
    $('#submit_amortization').on('click', submit_amortization);
    $('#add_extra_pay').on('click', add_extra_pay_input);
}

$(document).ready(function () {
    attach_events();
});
