
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
    var payment_schedule = []
    var principal_amount = loan_amount
    var payment_amount = calculate_payment(loan_amount, rate, term);
    var total_paid = 0
    var total_interest_paid = 0
    console.log("Payment Amount: " + payment_amount);
    for (var payment_number = 0; payment_number < term && principal_amount >= 0; payment_number++) {
        var interest_paid = calculate_interest(principal_amount, rate, 1);
        var principal_paid = payment_amount - interest_paid;

        if (extra_payment && payment_number % extra_payment.frequency == 0) {
            principal_paid += extra_payment.amount;
            total_paid += extra_payment.amount
        }
        principal_amount -= principal_paid;


        total_paid += payment_amount;
        total_interest_paid += interest_paid;

        payment_schedule.push({'interest_paid': interest_paid,
                               'principal_paid': principal_paid,
                               'payment_amount': payment_amount,
                               'principal_amount': principal_amount,
                               'total_paid': total_paid,
                               'total_interest_paid': total_interest_paid

        });

        console.log("Payment " + payment_number + ": " + principal_paid + " | " + interest_paid);
    }

    return payment_schedule
}
