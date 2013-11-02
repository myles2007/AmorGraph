
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
    var principal_amount = loan_amount * 100; // The loan amount, in cents.
    var payment_amount = calculate_payment(loan_amount * 100, rate, term); // The payment amount ,in cents.
    var total_paid = 0;
    var total_principal_paid = 0;
    var total_interest_paid = 0;

    if (!extra_payment) {
        extra_payment = {'frequency': 0, 'amount': 0}
    }

    for (var payment_number = 0; payment_number < term && principal_amount > 0; payment_number++) {
        var this_payment = payment_amount;
        var interest_paid = calculate_interest(principal_amount, rate, 1);
        var principal_paid = 0

        // If this a month in which an extra payment would be made,
        // increase this payments amount.
        if (payment_number % extra_payment.frequency == 0) {
            this_payment += extra_payment.amount * 100
        }

        principal_paid = this_payment - interest_paid;

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
