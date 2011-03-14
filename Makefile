SRC_DIR = src
TOOLS_DIR = tools
NODEJS = `which node || which nodejs`

help:
	@@echo "targets:"
	@@echo "  build - build the extension"
	@@echo "  lint - check js files"
	@@echo "  todo - build todo list"

lint:
	@@if test ! -z ${NODEJS}; then \
		${NODEJS} ${TOOLS_DIR}/lint.js \
	else \
		echo "You must have NodeJS installed."; \
	fi

todo:
	@@if test ! -z ${NODEJS}; then \
		${NODEJS} ${TOOLS_DIR}/todo.js \
	else \
		echo "You must have NodeJS installed."; \
	fi

build:
	@@if test ! -z ${NODEJS}; then \
		${NODEJS} ${TOOLS_DIR}/builder/builder.js --manifest ${SRC_DIR}/manifest.json \
	else \
		echp "You must have NodeJS installed."; \
	fi

all: lint build

