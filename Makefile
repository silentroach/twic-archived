SRC_DIR = src
TOOLS_DIR = tools
NODEJS = `which node || which nodejs`

help:
	@@echo "Build targets:"
	@@echo
	@@echo "* extension   build the extension"
	@@echo
	@@echo "  todo        build todo list"
	@@echo
	@@echo "  all         make targets marked with asterisk"

todo:
	@@if test ! -z ${NODEJS}; then \
		${NODEJS} ${TOOLS_DIR}/todo.js \
	else \
		echo "You must have NodeJS installed."; \
	fi

extension:
	@@if test ! -z ${NODEJS}; then \
		${NODEJS} ${TOOLS_DIR}/builder/builder.js --manifest ${SRC_DIR}/manifest.json \
	else \
		echp "You must have NodeJS installed."; \
	fi

all: extension

