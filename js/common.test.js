// common.test.js
// @author octopoulo <polluxyz@gmail.com>
// @version 2021-02-14
//
/*
globals
expect, require, test
*/
'use strict';

let {
    _, A, Attrs, Clamp, Clear, Contain, CreateNode, DefaultFloat, DefaultInt, Format, FormatFloat, FormatUnit, From,
    FromSeconds, FromTimestamp, HashText, Hex2RGB, HTML, Id, InvalidEmail, InvalidPhone, IsDigit, IsFloat, IsObject,
    IsString, Merge, Pad, ParseJSON, PI, QueryString, SetDefault, Split, TEXT, TextHTML, Title, Undefined,
    VisibleHeight, VisibleWidth,
} = require('./common.js');

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// _
[
    ['<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>', '', null],
    ['<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>', '#link', null],
    ['<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>', '#name', '<div id="name">N</div>'],
    ['<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>', 'a', '<a href="#">L1</a>'],
    ['<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>', '.link', '<a class="link">L2</a>'],
].forEach(([html, sel, answer], id) => {
    test(`_:${id}`, () => {
        let soup = CreateNode('div', html),
            node = _(sel, soup);
        expect(node? node.outerHTML: node).toEqual(answer);
    });
});

// A
[
    ['<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>', '', []],
    ['<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>', '#link', []],
    ['<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>', '#name', ['<div id="name">N</div>']],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>',
        'a',
        ['<a href="#">L1</a>', '<a class="link">L2</a>'],
    ],
    ['<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>', '.link', ['<a class="link">L2</a>']],
].forEach(([html, sel, answer], id) => {
    test(`A:${id}`, () => {
        let soup = CreateNode('div', html),
            nodes = A(sel, soup);
        expect(From(nodes).map(node => node.outerHTML)).toEqual(answer);
    });
});

// Attrs
[
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>',
        '*',
        {id: 'new'},
        ['<div id="new">N</div>', '<a href="#" id="new">L1</a>', '<a class="link" id="new">L2</a>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>',
        'a',
        {href: 'www'},
        ['<a href="www">L1</a>', '<a class="link" href="www">L2</a>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>',
        '#name',
        {'data-t': 'Welcome!', href: 'www'},
        ['<div id="name" data-t="Welcome!" href="www">N</div>'],
    ],
].forEach(([html, sel, attrs, answer], id) => {
    test(`Attrs:${id}`, () => {
        let soup = CreateNode('div', html);
        Attrs(sel, attrs, soup);
        let nodes = A(sel, soup);
        expect(From(nodes).map(node => node.outerHTML)).toEqual(answer);
    });
});

// Clamp
[
    [-1, 1, undefined, undefined, 1],
    [-1, 1, null, null, 1],
    [-1, 1, undefined, 10, 10],
    [20, 1, undefined, undefined, 20],
    [20, 1, 10, undefined, 10],
].forEach(([number, min, max, min_set, answer], id) => {
    test(`Clamp:${id}`, () => {
        expect(Clamp(number, min, max, min_set)).toEqual(answer);
    });
});

// Clear
[
    {},
    {session: 'xxx', x: 'home'},
].forEach((dico, id) => {
    test(`Clear:${id}`, () => {
        expect(Clear(dico)).toEqual({});
    });
});

// Contain
[
    [['dn', 'mode'], 'mode', true],
    [['dn', 'mode'], 'mod', false],
    [['dn', 'mode'], '^mod', true],
    [['dn', 'mode'], '*od', true],
    [['dn', 'mode'], '$de', true],
].forEach(([list, pattern, answer], id) => {
    test(`Contain:${id}`, () => {
        expect(Contain(list, pattern)).toEqual(answer);
    });
});

// CreateNode
[
    ['i', null, {}, '<i></i>'],
    ['i', 'hello', {}, '<i>hello</i>'],
    ['a', 'Bxc3', {class: 'real dn', 'data-i': 46}, '<a class="real dn" data-i="46">Bxc3</a>'],
].forEach(([tag, html, attrs, answer], id) => {
    test(`CreateNode:${id}`, () => {
        let node = CreateNode(tag, html, attrs);
        expect(node.outerHTML).toEqual(answer);
    });
});

// DefaultFloat
[
    [undefined, undefined, undefined],
    [undefined, 0, 0],
    [0, 1, 0],
    ['-0.5', 1, -0.5],
    ['5 or 1', 1, 5],
    ['5', 1, 5],
    ['text 9', null, null],
].forEach(([value, def, answer], id) => {
    test(`DefaultFloat:${id}`, () => {
        expect(DefaultFloat(value, def)).toEqual(answer);
    });
});

// DefaultInt
[
    [undefined, undefined, undefined],
    [undefined, 0, 0],
    [0, 1, 0],
    ['-0.5', 1, -0],
    ['5 or 1', 1, 5],
    ['5', 1, 5],
    ['text 9', null, null],
].forEach(([value, def, answer], id) => {
    test(`DefaultInt:${id}`, () => {
        expect(DefaultInt(value, def)).toEqual(answer);
    });
});

// Format
[
    [[-1, 1, PI], undefined, undefined, '-1, 1, 3.142'],
    [[-1, 1, PI], ' : ', undefined, '-1 : 1 : 3.142'],
    [PI, undefined, undefined, '3.142'],
    [{x: 1, y: 9, z: 2, w: -0.0004}, undefined, undefined, '1, 9, 2, 0'],
].forEach(([vector, sep, align, answer], id) => {
    test(`Format:${id}`, () => {
        expect(Format(vector, sep, align)).toEqual(answer);
    });
});

// FormatFloat
[
    [-0.0001, undefined, '0'],
    [PI, undefined, '3.142'],
].forEach(([text, align, answer], id) => {
    test(`FormatFloat:${id}`, () => {
        expect(FormatFloat(text, align)).toEqual(answer);
    });
});

// FormatUnit
[
    [1000000000, undefined, undefined, undefined, '1G'],
    [1000000000, undefined, undefined, false, '1B'],
    [1000000000, undefined, true, false, '1.0B'],
    [1000000, undefined, undefined, undefined, '1M'],
    [10000, undefined, undefined, undefined, '10k'],
    [1000, undefined, undefined, undefined, '1000'],
    [100, undefined, undefined, undefined, '100'],
    [100, undefined, true, undefined, '100.0'],
    [7841319402, undefined, undefined, true, '7.8G'],
    [7841319402, undefined, undefined, false, '7.8B'],
    [58335971.81109362, undefined, undefined, undefined, '58.3M'],
    [58335971, undefined, undefined, undefined, '58.3M'],
    ['58335971', undefined, undefined, undefined, '58.3M'],
    [318315, undefined, undefined, undefined, '318.3k'],
    [1259, undefined, undefined, undefined, '1.2k'],
    [1000, undefined, undefined, undefined, '1000'],
    [1000, undefined, true, undefined, '1000.0'],
    [725.019, undefined, undefined, undefined, '725'],
    [NaN, undefined, undefined, undefined, 'N/A'],
    [NaN, undefined, true, undefined, 'N/A'],
    [Infinity, undefined, undefined, undefined, 'Infinity'],
    [Infinity, undefined, true, undefined, 'Infinity'],
    [undefined, undefined, undefined, undefined, 'undefined'],
    [undefined, '-', undefined, undefined, '-'],
    // check if we can feed the result back => stability
    ['7.8B', undefined, undefined, false, '7.8B'],
    ['58.3M', undefined, undefined, undefined, '58.3M'],
    ['725', undefined, undefined, undefined, '725'],
    ['N/A', undefined, undefined, undefined, 'N/A'],
    ['Infinity', undefined, undefined, undefined, 'Infinity'],
    ['null', undefined, undefined, undefined, 'null'],
    ['null', '-', undefined, undefined, '-'],
    ['null', null, undefined, undefined, null],
    ['-', undefined, undefined, undefined, '-'],
].forEach(([number, def, keep_decimal, is_si, answer], id) => {
    test(`FormatUnit:${id}`, () => {
        expect(FormatUnit(number, def, keep_decimal, is_si)).toEqual(answer);
    });
});

// FromSeconds
[
    ['0', [0, 0, 0, '00']],
    ['32.36', [0, 0, 32, '36']],
    ['4892.737', [1, 21, 32, '73']],
    [208.963, [0, 3, 28, '96']],
].forEach(([time, answer], id) => {
    test(`FromSeconds:${id}`, () => {
        expect(FromSeconds(time)).toEqual(answer);
    });
});

// FromTimestamp
[
    [1576574884, [['2019-12-17'], ['09:28:04', '10:28:04']]],
].forEach(([stamp, answer], id) => {
    test(`FromTimestamp:${id}`, () => {
        let [date, time] = FromTimestamp(stamp);
        expect(answer[0]).toContain(date);
        expect(answer[1]).toContain(time);
    });
});

// HashText
[
    ['apple', 2240512858],
    ['orange', 1138632238],
].forEach(([text, answer], id) => {
    test(`HashText:${id}`, () => {
        expect(HashText(text)).toEqual(answer);
    });
});

// Hex2RGB
[
    ['000000', undefined, undefined, [0, 0, 0]],
    ['#000000', undefined, undefined, [0, 0, 0]],
    ['#87ceeb', undefined, undefined, [135, 206, 235]],
    ['#87ceeb', true, undefined, 'rgb(135,206,235)'],
    ['#87ceeb', undefined, 1, [135, 206, 235]],
    ['#87ceeb', true, 1, 'rgba(135,206,235,1)'],
    ['#87ceeb', true, 0.5, 'rgba(135,206,235,0.5)'],
].forEach(([color, get_string, alpha, answer], id) => {
    test(`Hex2RGB:${id}`, () => {
        expect(Hex2RGB(color, get_string, alpha)).toEqual(answer);
    });
});

// HTML
[
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        '*',
        undefined,
        'N',
        ['<div id="name">N</div>', '<a href="#">L1</a>', '<a class="link"><i>L2</i></a>', '<i>L2</i>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        'a.link',
        undefined,
        '<i>L2</i>',
        ['<a class="link"><i>L2</i></a>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        '*',
        '',
        '',
        ['<div id="name"></div>', '<a href="#"></a>', '<a class="link"></a>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        'a',
        'text',
        'text',
        ['<a href="#">text</a>', '<a class="link">text</a>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        'a',
        '<span>link</span>',
        '<span>link</span>',
        ['<a href="#"><span>link</span></a>', '<a class="link"><span>link</span></a>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        '#name',
        '<svg>SVG</svg><div><i data-t="complex">complex</i></div>',
        '<svg>SVG</svg><div><i data-t="complex">complex</i></div>',
        ['<div id="name"><svg>SVG</svg><div><i data-t="complex">complex</i></div></div>'],
    ],
].forEach(([shtml, sel, html, answer, answer_nodes], id) => {
    test(`HTML:${id}`, () => {
        let soup = CreateNode('div', shtml);
        expect(HTML(sel, html, soup)).toEqual(answer);
        let nodes = A(sel, soup);
        expect(From(nodes).map(node => node.outerHTML)).toEqual(answer_nodes);
    });
});

// Id
[
    ['<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>', '', null],
    ['<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>', 'link', null],
    ['<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>', 'name', '<div id="name">N</div>'],
    ['<div id="name">N</div><a href="#">L1</a><a class="link">L2</a>', 'a', null],
].forEach(([html, sel, answer], id) => {
    test(`Id:${id}`, () => {
        let soup = CreateNode('div', html),
            node = Id(sel, soup);
        expect(node? node.outerHTML: node).toEqual(answer);
    });
});

// InvalidEmail
[
    ['hello@mail.com', false],
    ['hello@mail', true],
    ['hello', true],
].forEach(([email, answer], id) => {
    test(`InvalidEmail:${id}`, () => {
        expect(InvalidEmail(email)).toEqual(answer);
    });
});

// InvalidPhone
[
    ['911', true],
    ['+32 460-885 567', false],
    ['380(632345599', true],
    ['380(63)2345599', false],
].forEach(([phone, answer], id) => {
    test(`InvalidPhone:${id}`, () => {
        expect(InvalidPhone(phone)).toEqual(answer);
    });
});

// IsDigit
[
    [undefined, false],
    [0, true],
    ['0', true],
    ['', false],
    [NaN, false],
    [{x: 5}, false],
    [5.5, false],
    ['5', true],
].forEach(([text, answer], id) => {
    test(`IsDigit:${id}`, () => {
        expect(IsDigit(text)).toEqual(answer);
    });
});

// IsFloat
[
    [undefined, false],
    [0, false],
    ['', false],
    [NaN, false],
    [{x: 5}, false],
    [5.5, true],
    ['5', false],
    ['5.5', false],
    [Infinity, false],
    [PI, true],
].forEach(([text, answer], id) => {
    test(`IsFloat:${id}`, () => {
        expect(IsFloat(text)).toEqual(answer);
    });
});

// IsObject
[
    [undefined, false],
    [null, false],
    [0, false],
    ['', false],
    [{}, true],
    [[1, 2], true],
].forEach(([text, answer], id) => {
    test(`IsObject:${id}`, () => {
        expect(IsObject(text)).toEqual(answer);
    });
});

// IsString
[
    [undefined, false],
    [0, false],
    [NaN, false],
    ['', true],
    ['hello', true],
    [{x: 5}, false],
].forEach(([text, answer], id) => {
    test(`IsString:${id}`, () => {
        expect(IsString(text)).toEqual(answer);
    });
});

// Merge
[
    [{x: {y: 5}}, {x: {y: 6}}, undefined, {x: {y: 6}}],
    [{x: {y: 5}}, {x: {y: 6}}, 1, {x: {y: 6}}],
    [{x: {y: 5}}, {x: {y: 6}}, 5, {x: {y: 6}}],
    [{x: {y: 5}}, {x: {y: 6}}, 0, {x: {y: 5}}],
    [{x: {y: 5}}, {x: {z: 6}}, 1, {x: {y: 5, z: 6}}],
    [{x: {y: 5}}, {x: {y: {hello: 'there'}, z: 6}}, 1, {x: {y: {hello: 'there'}, z: 6}}],
    [{x: {y: 5}}, {x: {y: {hello: 'there'}, z: 6}}, 0, {x: {y: 5, z: 6}}],
    [{x: {y: 5}}, {x: 0}, 0, {x: {y: 5}}],
    [{x: {y: 5}}, {x: 0}, 1, {x: 0}],
    [{x: {y: 5}}, {x: undefined}, 0, {x: {y: 5}}],
    [{x: {y: 5}}, {x: undefined}, 1, {x: {y: 5}}],
    [{x: {y: 5}}, {x: undefined}, 2, {}],
    [{x: {y: 5}}, {y: undefined}, 2, {x: {y: 5}}],
    [{x: {y: 5}}, {x: {y: undefined}}, 2, {x: {}}],
    [{x: {y: 5, z: 6}}, {x: {y: undefined}}, 2, {x: {z: 6}}],
].forEach(([dico, extras, replace, answer], id) => {
    test(`Merge:${id}`, () => {
        expect(Merge(dico, extras, replace)).toEqual(answer);
        expect(dico).toEqual(answer);
    });
});

// Pad
[
    [1, undefined, undefined, '01'],
    [1, 3, undefined, '001'],
    [1, 4, undefined, '001'],
    [1, 4, '000', '0001'],
    ['', undefined, undefined, '00'],
    ['hello', undefined, undefined, 'lo'],
    ['hello', 10, undefined, '00hello'],
    ['hello', 10, '  ', '  hello'],
    ['hello', 10, '               ', '     hello'],
].forEach(([value, size, pad, answer], id) => {
    test(`Pad:${id}`, () => {
        expect(Pad(value, size, pad)).toEqual(answer);
    });
});

// ParseJSON
[
    ['', undefined, undefined],
    ['', 0, 0],
    ['[]', undefined, []],
    ['{"key":"record_get"}', undefined, {key: 'record_get'}],
].forEach(([text, def, answer], id) => {
    test(`ParseJSON:${id}`, () => {
        expect(ParseJSON(text, def)).toEqual(answer);
    });
});

// QueryString
[
    [{query: 'q=query&lan=eng'}, {lan: 'eng', q: 'query'}],
    [{query: 'q=query&lan=eng', string: true}, 'lan=eng&q=query'],
    [{keep: {lan: 1}, query: 'q=query&lan=eng'}, {lan: 'eng'}],
    [{discard: {lan: 1}, query: 'q=query&lan=eng'}, {q: 'query'}],
    [{query: 'q=query&lan=eng', replace: {lan: 'fra'}}, {lan: 'fra', q: 'query'}],
    [
        {key: null, replace: {class: "phantom", mode: "speed lap", game: "wipeout x"}, string: true},
        'class=phantom&game=wipeout%20x&mode=speed%20lap',
    ],
    [{query: 'season=18&div=l3&game=1', string: true}, 'div=l3&game=1&season=18'],
    [
        {
            key: null,
            replace: {
                class: 'flash', game: 'wipeout x', mode: 'speed lap', name: 'Connavar', physics: '2197',
                section: 'play', session: '85994ad8-a86d-408d-aeea-df1975ef2e34', time: 5265, track: 'korodera',
                user: 'Connavar',
            },
            string: true,
        },
        'class=flash&game=wipeout%20x&mode=speed%20lap&name=Connavar&physics=2197&section=play'
        + '&session=85994ad8-a86d-408d-aeea-df1975ef2e34&time=5265&track=korodera&user=Connavar',
    ],
].forEach(([dico, answer], id) => {
    test(`QueryString:${id}`, () => {
        expect(QueryString(dico)).toEqual(answer);
    });
});

// SetDefault
[
    [{}, 'new', ['a', 'b'], {new: ['a', 'b']}],
    [{lan: 'fra'}, 'new', ['a', 'b'], {lan: 'fra', new: ['a', 'b']}],
    [{}, 'areas', {}, {areas: {}}],
    [{areas: [1, 2, 3]}, 'areas', {}, {areas: [1, 2, 3]}],
    [[1, 2, 3], 3, 'FOUR', [1, 2, 3, 'FOUR']],
    [[1, 2, 3], 3, [5, 6], [1, 2, 3, [5, 6]]],
    [[1, 2, 3], 3, {lan: 'fra', options: {x: 1}}, [1, 2, 3, {lan: 'fra', options: {x: 1}}]],
].forEach(([dico, key, def, answer], id) => {
    test(`SetDefault:${id}`, () => {
        SetDefault(dico, key, def);
        expect(dico).toEqual(answer);
    });
});

// Split
[
    [null, undefined, []],
    ['', undefined, []],
    ['abcd', '', ['a', 'b', 'c', 'd']],
    ['Rank|Engine|Points', undefined, ['Rank', 'Engine', 'Points']],
    ['Rank Engine Points', undefined, ['Rank', 'Engine', 'Points']],
    ['Rank|Engine Points', undefined, ['Rank', 'Engine Points']],
].forEach(([text, char, answer], id) => {
    test(`Split:${id}`, () => {
        expect(Split(text, char)).toEqual(answer);
    });
});

// TEXT
[
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        '*',
        undefined,
        'N',
        ['<div id="name">N</div>', '<a href="#">L1</a>', '<a class="link"><i>L2</i></a>', '<i>L2</i>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        'a.link',
        undefined,
        'L2',
        ['<a class="link"><i>L2</i></a>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        '*',
        '',
        '',
        ['<div id="name"></div>', '<a href="#"></a>', '<a class="link"></a>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        'a',
        'text',
        'text',
        ['<a href="#">text</a>', '<a class="link">text</a>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        'a.link',
        '<span>test</span>',
        '<span>test</span>',
        ['<a class="link">&lt;span&gt;test&lt;/span&gt;</a>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        'a',
        '<span>link</span>',
        '<span>link</span>',
        ['<a href="#">&lt;span&gt;link&lt;/span&gt;</a>', '<a class="link">&lt;span&gt;link&lt;/span&gt;</a>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        '#name',
        'engine<br>version',
        'engine<br>version',
        ['<div id="name">engine&lt;br&gt;version</div>'],
    ],
].forEach(([shtml, sel, html, answer, answer_nodes], id) => {
    test(`TEXT:${id}`, () => {
        let soup = CreateNode('div', shtml);
        expect(TEXT(sel, html, soup)).toEqual(answer);
        let nodes = A(sel, soup);
        expect(From(nodes).map(node => node.outerHTML)).toEqual(answer_nodes);
    });
});

// TextHTML
[
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        '*',
        undefined,
        'N',
        ['<div id="name">N</div>', '<a href="#">L1</a>', '<a class="link"><i>L2</i></a>', '<i>L2</i>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        'a.link',
        undefined,
        'L2',
        ['<a class="link"><i>L2</i></a>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        '*',
        '',
        '',
        ['<div id="name"></div>', '<a href="#"></a>', '<a class="link"></a>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        'a',
        'text',
        'text',
        ['<a href="#">text</a>', '<a class="link">text</a>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        'a',
        '<span>link</span>',
        '<span>link</span>',
        ['<a href="#"><span>link</span></a>', '<a class="link"><span>link</span></a>'],
    ],
    [
        '<div id="name">N</div><a href="#">L1</a><a class="link"><i>L2</i></a>',
        '#name',
        'engine<br>version',
        'engine<br>version',
        ['<div id="name">engine<br>version</div>'],
    ],
].forEach(([shtml, sel, html, answer, answer_nodes], id) => {
    test(`TextHTML:${id}`, () => {
        let soup = CreateNode('div', shtml);
        expect(TextHTML(sel, html, soup)).toEqual(answer);
        let nodes = A(sel, soup);
        expect(From(nodes).map(node => node.outerHTML)).toEqual(answer_nodes);
    });
});

// Title
[
    ['', ''],
    ['white', 'White'],
    [123, '123'],
    [null, 'Null'],
    ['forEach', 'ForEach'],
].forEach(([text, answer], id) => {
    test(`Title:${id}`, () => {
        expect(Title(text)).toEqual(answer);
    });
});

// Undefined
[
    [undefined, undefined, undefined],
    [undefined, null, null],
    [undefined, 0, 0],
    [undefined, 5, 5],
    [undefined, 'ok', 'ok'],
    [null, 'ok', null],
    ['', 'ok', ''],
    [0, 'ok', 0],
    [NaN, undefined, undefined],
    [NaN, 1, 1],
    [NaN, 1.5, 1.5],
    [NaN, 'ok', 'ok'],
].forEach(([value, def, answer], id) => {
    test(`Undefined:${id}`, () => {
        expect(Undefined(value, def)).toEqual(answer);
    });
});

// VisibleHeight
[
    0,
].forEach((answer, id) => {
    test(`VisibleHeight:${id}`, () => {
        expect(VisibleHeight()).toBeGreaterThan(answer);
    });
});

// VisibleWidth
[
    0,
].forEach((answer, id) => {
    test(`VisibleWidth:${id}`, () => {
        expect(VisibleWidth()).toBeGreaterThan(answer);
    });
});
