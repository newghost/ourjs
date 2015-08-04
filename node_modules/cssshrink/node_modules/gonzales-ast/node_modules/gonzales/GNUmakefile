.PHONY: cssp

cssp:
	@cat src/gonzales.cssp.header.js > lib/.gonzales.cssp.js
	@cat src/tokenizer.shared.js >> lib/.gonzales.cssp.js
	@cat src/cssp.ast.shared.js >> lib/.gonzales.cssp.js
	@cat src/gonzales.cssp.footer.js >> lib/.gonzales.cssp.js
	@cp lib/.gonzales.cssp.js lib/gonzales.cssp.node.js
	@cat src/gonzales.cssp.node.js >> lib/gonzales.cssp.node.js
	@cp lib/.gonzales.cssp.js web/gonzales.cssp.web.js
	@rm lib/.gonzales.cssp.js
	@cat src/cssp.translator.shared.js > web/cssp.translator.js
	@cat src/cssp.translator.shared.js > lib/cssp.translator.node.js
	@cat src/cssp.translator.node.js >> lib/cssp.translator.node.js

cssptest:
	@node test/cssp/test.js
