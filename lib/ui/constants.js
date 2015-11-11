module.exports = {
    types: {
        checkoutBegin: {
            id: 'checkoutBegin',
        },
        checkoutCancel: {
            id: 'checkoutCancel',
        },
        createChargeBegin: {
            id: 'createChargeBegin',
        },
        createChargeFailure: {
            id: 'createChargeFailure',
        },
        createChargeSuccess: {
            id: 'createChargeSuccess',
        },
        reset: {
            id: 'reset',
        },
        updateStatusBegin: {
            id: 'updateStatusBegin',
        },
        updateStatusFailure: {
            id: 'updateStatusFailure',
        },
        updateStatusSuccess: {
            id: 'updateStatusSuccess',
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
