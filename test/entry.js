var chai = require('chai')

chai.config.truncateThreshold = 0

require('./store.spec')
require('./controller.spec')
