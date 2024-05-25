# A template for typesetting thesis at MFF UK in LaTeX

## Overview

This is a LaTeX template for typesetting of bachelor, master, dissertation
(Ph.D.), and rigorosum theses at MFF UK.

Requirements on formatting of theses are given by Dean's directives 26/2023
and 27/2023 and by the Rector's directive 72/2017. Other guidelines can be
found in [example layout](https://www.mff.cuni.cz/en/students/student-theses-templates).
This LaTeX template follows the directives; it also tries to emphasize
important points in comments. Still, we advise you to read the complete rules.

## How to use this template

First of all, fill in basic information on your thesis in the `metadata.tex`
file. From there, they are automatically propagated to other places.

The main TeX file is `thesis.tex`. Here you find basic settings of LaTeX
(packages etc.), but also commands inserting individual parts of the thesis
which live in other files.

In addition to that, you can compile `abstract-en.tex` and `abstract-cs.tex`
to get a stand-alone abstract of the thesis in English and Czech. The
abstract is also submitted in SIS together with the thesis.

If you are not familiar with LaTeX yet, you can find numerous tutorials on
the Web. We like [the Wikibook on LaTeX](http://en.wikibooks.org/wiki/LaTeX).

The [Czech version of the template](https://www.mff.cuni.cz/en/students/student-theses-templates)
contains example chapters with a description of the recommended layout
and various hints on typesetting in TeX. It will be hopefully translated
to English soon.

## Which version of TeX to choose

We recommend TeXlive in version 2020 or newer. Older versions of TeXlive
and all versions of MikTeX are known to be problematic. You also need to
install the `biber` utility for processing bibliography. We recommend to
install `latexmk`, too. Both are delivered as a part of TeXlive.

The preferred way of compiling the thesis is using `latexmk`.
On UNIX systems, you can use the attached `Makefile`.
If your TeX installation lacks LuaTeX, please follow the comment in `.latexmkrc`.

The electronic version of your thesis must be submitted to SIS. It must
conform to the PDF/A-1a or -2u standard. This template produces PDF/A-2u
using the [pdfx](https://www.ctan.org/tex-archive/macros/latex/contrib/pdfx)
LaTeX package. If the version of pdfx in your TeX distribution is too old
or broken, please download it independently and extract it to `tex/pdfx/`.

### Overleaf

MFF UK provides a professional license for Overleaf, which is a TeX editor
running in your web browser. If you consider this appealing, we invite you
to read the [faculty-wide instructions](https://www.mff.cuni.cz/en/internal-affairs/it-and-services/cloud-services/overleaf-at-cuni-mff).

You can use this template in Overleaf. You only need to change the project
settings in Overleaf and set the main document to `thesis.tex` and the compiler
to `LuaLaTeX`.

## Authors

Primary authors of the template are:

- [Martin Mareš](https://mj.ucw.cz/) (<mj@ucw.cz>) -- the current maintainer
- Arnošt Komárek (<komarek@karlin.mff.cuni.cz>)
- Michal Kulich (<kulich@karlin.mff.cuni.cz>)

We also took inspiration from the alternative template [better-thesis](https://github.com/exaexa/better-mff-thesis),
whose contributors include:

- Vít Kabele
- Mirek Kratochvíl
- Jan Joneš
- Gabriela Suchopárová
- Evžen Wybitul

## License

This package can be freely distributed, used, and modified according to
the [Creative Commons CC-0](https://creativecommons.org/public-domain/cc0/)
license.

The only exception are the faculty logos in the `img` directory, whose use
is governed by the Dean's directive 5/2016 and related regulations.

## References

The current version of this template is maintained in the
[thesis-en](https://gitlab.mff.cuni.cz/teaching/thesis-templates/thesis-en)
project at MFF GitLab.

If you have any bug reports or suggestions, please tell us.
The preferred way is to create an issue in the GitLab project.

Further instructions on PDF/A creation can be found in the
[PDF/A FAQ](https://mj.ucw.cz/vyuka/bc/pdfaq.html),
which is currently available in Czech only. In case of any trouble,
please contact Martin Mareš directly or create an issue.

We also maintain [other material](https://mj.ucw.cz/vyuka/bc/)
on writing of theses and scientific writing in general.
Again, this still waits for translation to English.
