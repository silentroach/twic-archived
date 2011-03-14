TOOLS_DIR = tools
NODEJS = `which node`

@@if test ! -z ${NODEJS} ]; then \
 	NODEJS = `which nodejs`; \
fi

help:
	@@echo "targets:"
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

all: lint

