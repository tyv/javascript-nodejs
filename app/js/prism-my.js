!function () {
    document.removeEventListener('DOMContentLoaded', Prism.highlightAll);


    function addLineNumbers(pre) {

        var linesNum = (1 + pre.innerHTML.split('\n').length);
        var lineNumbersWrapper;

        lines = new Array(linesNum);
        lines = lines.join('<span></span>');

        lineNumbersWrapper = document.createElement('span');
        lineNumbersWrapper.className = 'line-numbers-rows';
        lineNumbersWrapper.innerHTML = lines;

        if (pre.hasAttribute('data-start')) {
            pre.style.counterReset = 'linenumber ' + (parseInt(pre.getAttribute('data-start'), 10) - 1);
        }

        pre.appendChild(lineNumbersWrapper);
    }


    function addBlockHighlight(pre) {

        var lines = $(pre).data('highlightBlock');

        if (!lines) {
            return;
        }

        var ranges = lines.replace(/\s+/g, '').split(',');

        for (var i = 0, range; range = ranges[i++];) {
            range = range.split('-');

            var start = +range[0],
                end = +range[1] || start;


            var mask = $('<div class="block-highlight" data-start="'+start+'" data-end="'+end+'">' +
                new Array(start + 1).join('\n') +
                '<div class="mask">' + new Array(end - start + 2).join('\n') + '</div></div>');

            $(pre).prepend(mask);
        }

    }

    function esc(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function unesc(str) {
        return str
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
    }

    function addInlineHighlight(pre) {
        var ranges = $(pre).data('highlightInline');
        var codeElem = $('code', pre);

        ranges = ranges ? ranges.split(",") : [];

        for (var i = 0; i < ranges.length; i++) {
            var piece = ranges[i].split(':');
            var lineNum = +piece[0], strRange = piece[1].split('-');
            var start = +strRange[0], end = +strRange[1];
            var mask = $('<div class="inline-highlight">' +
                new Array(lineNum + 1).join('\n') +
                new Array(start + 1).join(' ') +
                '<span class="mask">' + new Array(end - start + 1).join(' ') + '</span></div>');

            codeElem.prepend(mask);
        }
    }


    $(function() {

        // highlight inline
        var codePre = $('pre[class*="language-"]');

        codePre.each(function () {
            this.code = unesc(this.innerHTML);
            $(this).wrapInner("<code></code>");

            Prism.highlightElement(this.firstChild);

            addLineNumbers(this);
            addBlockHighlight(this);
            addInlineHighlight(this);
            new CodeBox(this);
        });


    });

    $(function() {
        $('iframe.result__iframe').each(function() {
            new IframeBox(this);
        })
    });

}();
