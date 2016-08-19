publish:
	./node_modules/.bin/lerna publish \
		--force-publish=* \
		--skip-npm \
		--repo-version 3.0.0-beta.3
	cd ./packages/flatmarket-aws/; \
		rm -rf ./node_modules/ \
		npm install
	make aws-lambda
	make aws-upload

aws-stack:
	aws cloudformation validate-template \
	    --template-body file://packages//flatmarket-aws//template.json
	aws cloudformation delete-stack \
		--stack-name flatmarket
	aws cloudformation wait stack-delete-complete \
		--stack-name flatmarket
	aws cloudformation create-stack \
		--capabilities CAPABILITY_IAM \
		--parameters ParameterKey=SchemaUri,ParameterValue=https://foo.com/schema.json \
			ParameterKey=StripeSecretKey,ParameterValue=sk_test_foo \
		--stack-name flatmarket \
		--template-body file://packages//flatmarket-aws//template.json
	aws cloudformation wait stack-create-complete \
		--stack-name flatmarket
	aws apigateway get-rest-apis
	echo 'DONE!'

aws-lambda:
	cd ./packages/flatmarket-aws/; \
		rm ./lambda.zip; \
		zip ./lambda.zip ./lambda.js -r ./node_modules/

aws-upload:
	aws s3 cp ./packages/flatmarket-aws/lambda.zip s3://flatmarket/lambda.zip \
		--acl public-read
	aws s3 cp ./packages/flatmarket-aws/template.json s3://flatmarket/template.json \
		--acl public-read

example-dev:
	./packages/flatmarket-cli/bin/flatmarket ./packages/flatmarket-example/src/flatmarket.json \
		-s ./packages/flatmarket-example/src/ \
		-d ./build/ \
		-S {YOUR_TEST_SECRET_KEY} \
		-D

example-preview:
	./packages/flatmarket-cli/bin/flatmarket ./packages/flatmarket-example/src/flatmarket.json \
		-s ./packages/flatmarket-example/src/ \
		-d ./build/ \
		-p

example-prod:
	./packages/flatmarket-cli/bin/flatmarket ./packages/flatmarket-example/src/flatmarket.json \
		-s ./packages/flatmarket-example/src/ \
		-d ./build/

reset:
	./node_modules/.bin/lerna clean --yes
	./node_modules/.bin/lerna bootstrap --yes

coverage-aws:
	./node_modules/.bin/istanbul cover \
		--root ./packages/flatmarket-aws \
		--dir ./packages/flatmarket-aws/coverage \
		-x **/__test__/** \
		./node_modules/.bin/_mocha ./packages/flatmarket-aws/__test__/*.spec.js

coverage-cli:
	./node_modules/.bin/istanbul cover \
		--root ./packages/flatmarket-cli \
		--dir ./packages/flatmarket-cli/coverage \
		-x **/__test__/** \
		./node_modules/.bin/_mocha ./packages/flatmarket-cli/__test__/*.spec.js

coverage-client:
	./node_modules/.bin/karma start ./packages/flatmarket-client/karma.config.js --mode coverage

coverage-hapi:
	./node_modules/.bin/istanbul cover \
		--root ./packages/flatmarket-hapi \
		--dir ./packages/flatmarket-hapi/coverage \
		-x **/__test__/** \
		./node_modules/.bin/_mocha ./packages/flatmarket-hapi/__test__/*.spec.js

coverage-schema:
	./node_modules/.bin/istanbul cover \
		--root ./packages/flatmarket-schema \
		--dir ./packages/flatmarket-schema/coverage \
		-x **/__test__/** \
		./node_modules/.bin/_mocha ./packages/flatmarket-schema/__test__/*.spec.js

coverage-server:
	./node_modules/.bin/istanbul cover \
		--root ./packages/flatmarket-server \
		--dir ./packages/flatmarket-server/coverage \
		-x **/__test__/** \
		./node_modules/.bin/_mocha ./packages/flatmarket-server/__test__/*.spec.js

coverage-service:
	./node_modules/.bin/istanbul cover \
		--root ./packages/flatmarket-service \
		--dir ./packages/flatmarket-service/coverage \
		-x **/__test__/** \
		./node_modules/.bin/_mocha ./packages/flatmarket-service/__test__/*.spec.js

coverage-theme-bananas:
	./node_modules/.bin/karma start ./packages/flatmarket-theme-bananas/karma.config.js --mode coverage

coverage-ui:
	./node_modules/.bin/karma start ./packages/flatmarket-ui/karma.config.js --mode coverage

dev-client:
	./node_modules/.bin/karma start ./packages/flatmarket-client/karma.config.js --mode dev

dev-theme-bananas:
	./node_modules/.bin/karma start ./packages/flatmarket-theme-bananas/karma.config.js --mode dev

dev-ui:
	./node_modules/.bin/karma start ./packages/flatmarket-ui/karma.config.js --mode dev

style:
	make style-aws
	make style-cli
	make style-client
	make style-hapi
	make style-schema
	make style-server
	make style-service
	make style-theme-bananas
	make style-ui
	make style-validation

style-aws:
	./node_modules/crispy/node_modules/.bin/eslint ./packages/flatmarket-aws/ \
		-c ./node_modules/crispy/.eslintrc \
		--ext '.js,.jsx' \
		--ignore-pattern '**/+(coverage|fixtures|node_modules)/**'

style-cli:
	./node_modules/crispy/node_modules/.bin/eslint ./packages/flatmarket-cli/ \
		-c ./node_modules/crispy/.eslintrc \
		--ext '.js,.jsx' \
		--ignore-pattern '**/+(coverage|fixtures|node_modules)/**'

style-client:
	./node_modules/crispy/node_modules/.bin/eslint ./packages/flatmarket-client/ \
		-c ./node_modules/crispy/.eslintrc \
		--ext '.js,.jsx' \
		--ignore-pattern '**/+(coverage|fixtures|node_modules)/**'

style-hapi:
	./node_modules/crispy/node_modules/.bin/eslint ./packages/flatmarket-hapi/ \
		-c ./node_modules/crispy/.eslintrc \
		--ext '.js,.jsx' \
		--ignore-pattern '**/+(coverage|fixtures|node_modules)/**'

style-schema:
	./node_modules/crispy/node_modules/.bin/eslint ./packages/flatmarket-schema/ \
		-c ./node_modules/crispy/.eslintrc \
		--ext '.js,.jsx' \
		--ignore-pattern '**/+(coverage|fixtures|node_modules)/**'

style-server:
	./node_modules/crispy/node_modules/.bin/eslint ./packages/flatmarket-server/ \
		-c ./node_modules/crispy/.eslintrc \
		--ext '.js,.jsx' \
		--ignore-pattern '**/+(coverage|fixtures|node_modules)/**'

style-service:
	./node_modules/crispy/node_modules/.bin/eslint ./packages/flatmarket-service/ \
		-c ./node_modules/crispy/.eslintrc \
		--ext '.js,.jsx' \
		--ignore-pattern '**/+(coverage|fixtures|node_modules)/**'

style-ui:
	./node_modules/crispy/node_modules/.bin/eslint ./packages/flatmarket-ui/ \
		-c ./node_modules/crispy/.eslintrc \
		--ext '.js,.jsx' \
		--ignore-pattern '**/+(coverage|fixtures|node_modules)/**'

style-theme-bananas:
	./node_modules/crispy/node_modules/.bin/eslint ./packages/flatmarket-theme-bananas/ \
		-c ./node_modules/crispy/.eslintrc \
		--ext '.js,.jsx' \
		--ignore-pattern '**/+(coverage|fixtures|node_modules)/**'

style-validation:
	./node_modules/crispy/node_modules/.bin/eslint ./packages/flatmarket-validation/ \
		-c ./node_modules/crispy/.eslintrc \
		--ext '.js,.jsx' \
		--ignore-pattern '**/+(coverage|fixtures|node_modules)/**'

test:
	make test-aws
	make test-cli
	make test-client
	make test-hapi
	make test-schema
	make test-server
	make test-service
	make test-theme-bananas
	make test-ui

test-aws:
	./node_modules/.bin/mocha ./packages/flatmarket-aws/__test__/*.spec.js \
		--reporter spec

test-cli:
	./node_modules/.bin/mocha ./packages/flatmarket-cli/__test__/*.spec.js \
		--reporter spec

test-client:
	./node_modules/.bin/karma start ./packages/flatmarket-client/karma.config.js

test-hapi:
	./node_modules/.bin/mocha ./packages/flatmarket-hapi/__test__/*.spec.js \
		--reporter spec

test-schema:
	./node_modules/.bin/mocha ./packages/flatmarket-schema/__test__/*.spec.js \
		--reporter spec

test-server:
	./node_modules/.bin/mocha ./packages/flatmarket-server/__test__/*.spec.js \
		--reporter spec

test-service:
	./node_modules/.bin/mocha ./packages/flatmarket-service/__test__/*.spec.js \
		--reporter spec

test-theme-bananas:
	./node_modules/.bin/karma start ./packages/flatmarket-theme-bananas/karma.config.js

test-ui:
	./node_modules/.bin/karma start ./packages/flatmarket-ui/karma.config.js
