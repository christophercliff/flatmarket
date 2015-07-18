module.exports = {
    types: {
        checkoutBegin: {
            id: 'checkout_begin',
        },
        checkoutCancel: {
            id: 'checkout_cancel',
        },
        createChargeBegin: {
            id: 'create_charge_begin',
        },
        createChargeFailure: {
            id: 'create_charge_failure',
        },
        createChargeSuccess: {
            id: 'create_charge_success',
        },
        reset: {
            id: 'reset',
        },
        updateStatusBegin: {
            id: 'update_status_begin',
        },
        updateStatusFailure: {
            id: 'update_status_failure',
        },
        updateStatusSuccess: {
            id: 'update_status_success',
        },
    },
    statuses: {
        begin: {
            id: 'begin',
        },
        failure: {
            id: 'failure',
        },
        success: {
            id: 'success',
        },
    },
}
