
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


function amortize(loan_amount, rate, term, extra_payment) {
    var payment_schedule = [];
    var principal_amount = loan_amount * 100;
    var payment_amount = calculate_payment(loan_amount * 100, rate, term);
    console.log(payment_amount);
    var total_paid = 0;
    var total_principal_paid = 0;
    var total_interest_paid = 0;
    if (!extra_payment) {
        extra_payment = {'frequency': 0, 'amount': 0}
    }

    console.log("Payment Amount: " + payment_amount);
    for (var payment_number = 0; payment_number < term && principal_amount > 0; payment_number++) {
        var interest_paid = calculate_interest(principal_amount, rate, 1);
        var principal_paid = payment_amount - interest_paid;

        if (payment_number % extra_payment.frequency == 0) {
            principal_paid += extra_payment.amount * 100;
            total_paid += extra_payment.amount * 100;
        }

        if (principal_amount < principal_paid) {
            principal_paid = principal_amount;
            total_paid -= extra_payment.amount * 100;
        }

        principal_amount -= principal_paid;


        total_paid += payment_amount;
        total_principal_paid += principal_paid;
        total_interest_paid += interest_paid;

        payment_schedule.push({'interest_paid': interest_paid.toFixed(0) / 100,
                               'principal_paid': principal_paid.toFixed(0) / 100,
                               'payment_amount': (principal_paid + interest_paid).toFixed(0) / 100,
                               'principal_amount': principal_amount.toFixed(0) / 100,
                               'total_paid': total_paid.toFixed(0) / 100,
                               'total_principal_paid': total_principal_paid.toFixed(0) / 100,
                               'total_interest_paid': total_interest_paid.toFixed(0) / 100

        });

        console.log("Payment " + payment_number + ": " + principal_paid + " | " + interest_paid);
    }

    return payment_schedule
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
