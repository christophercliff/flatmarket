/* global sinon */
var _ = require('lodash')
var createElement = require('react').createElement
var expect = require('chai').expect
var findDOMNode = require('react-dom').findDOMNode
var fromJS = require('immutable').fromJS
var reducer = require('flatmarket-ui').reducer
var render = require('react-dom').render
var renderIntoDocument = require('react-addons-test-utils').renderIntoDocument
var scryRenderedDOMComponentsWithTag = require('react-addons-test-utils').scryRenderedDOMComponentsWithTag
var Simulate = require('react-addons-test-utils').Simulate
var Theme = require('../index.jsx')
var unmountComponentAtNode = require('react-dom').unmountComponentAtNode

var ERRORS = require('flatmarket-ui').errors
var FIXTURES = {
    schema: {
        id: {
            info: {
                description: 'test description',
                name: 'test name',
            },
            products: {
                '001': {
                    amount: 123,
                },
                '002': {
                    amount: 123,
                    images: ['foo.png'],
                },
            },
            server: {
                host: 'foo.com',
            },
            stripe: {
                publishableKey: 'just_a_fake_key',
            },
        },
    },
}

describe('flatmarket-theme-bananas', function () {

    var component
    var options

    beforeEach(function () {
        options = _.extend(reducer().toObject(), {
            checkout: _.noop,
        })
    })

    afterEach(function () {
        var htmlElement = findDOMNode(component)
        if (htmlElement) unmountComponentAtNode(htmlElement.parentNode)
    })

    describe('render()', function () {

        it('should render empty', function () {
            component = renderIntoDocument(createElement(Theme, options))
        })

        it('should render content', function () {
            component = renderIntoDocument(createElement(Theme, _.extend(options, {
                schema: fromJS(FIXTURES.schema.id),
            })))
        })

        it('should render in progress', function () {
            component = renderIntoDocument(createElement(Theme, _.extend(options, {
                charge: fromJS({
                    sku: '001',
                }),
                schema: fromJS(FIXTURES.schema.id),
            })))
        })

        it('should render success', function () {
            component = renderIntoDocument(createElement(Theme, _.extend(options, {
                charge: fromJS({
                    sku: '001',
                    token: 'foo',
                }),
                schema: fromJS(FIXTURES.schema.id),
            })))
        })

        it('should render initial error', function () {
            component = renderIntoDocument(createElement(Theme, _.extend(options, {
                error: ERRORS.invalidSchema.id,
            })))
        })

        it('should render checkout error', function () {
            var htmlElement = document.createElement('div')
            component = render(createElement(Theme, _.extend(options, {
                schema: fromJS(FIXTURES.schema.id),
            })), htmlElement)
            component = render(createElement(Theme, _.extend(options, {
                charge: fromJS({
                    sku: '001',
                }),
                schema: fromJS(FIXTURES.schema.id),
            })), htmlElement)
            component = render(createElement(Theme, _.extend(options, {
                error: ERRORS.chargeFailed.id,
            })), htmlElement)
        })

    })

    describe('handleClick()', function () {

        it('should do', function () {
            var spy = sinon.spy()
            component = renderIntoDocument(createElement(Theme, _.extend(options, {
                checkout: spy,
                schema: fromJS(FIXTURES.schema.id),
            })))
            var sectionHtmlElement = scryRenderedDOMComponentsWithTag(component, 'section')[0]
            Simulate.click(sectionHtmlElement)
            expect(spy).to.have.been.calledOnce
            expect(spy).to.have.been.calledWith('001')
        })

    })

})
