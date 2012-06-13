SRC_DIR = src
TOOLS_DIR = tools
NODEJS = `which node || which nodejs`

help:
	@@echo "Build targets:"
	@@echo
	@@echo "* extension   build the extension"
	@@echo "  hint        test the code with jshint"
	@@echo "  todo        build todo list"
	@@echo
	@@echo "  all         make targets marked with asterisk"

todo:
	${NODEJS} ${TOOLS_DIR}/todo.js

hint:
	@@for File in `find . -name '*.js' | grep -v "/tools/" | grep -v "3rdparty"`; do \
	    jshint $${File} --config jshint.json; \
	done

extension:
	${NODEJS} ${TOOLS_DIR}/builder/builder.js --manifest ${SRC_DIR}/manifest.json

all: extension

