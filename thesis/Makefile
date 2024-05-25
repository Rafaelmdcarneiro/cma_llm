all: thesis.pdf abstract-cs.pdf abstract-en.pdf

%.pdf: force
	latexmk $*.tex

clean:
	rm -rf tmp
	rm -f thesis.pdf abstract.pdf abstract-cs.pdf abstract-en.pdf

.PHONY: force
