import { Trick } from '../interfaces/trick.interface';

const logicalColor = 'white';
const typoColor = 'white';
const userInteractionsColor = 'white';
const migrationColor = 'white';
const typeColor = 'white';
const technicalWarning = 'white';

export const TrickList: Trick[] = [{
    pattern: 'if.*\\(',
    color: logicalColor,
    name: 'logic',
    emoji: '🔧',
    details: 'Conditionnal expressions (if)',
},
{
    pattern: 'else.*\\(',
    color: logicalColor,
    name: 'logic',
    emoji: '🔧',
    details: 'Conditionnal expressions (else)',
},
{
    pattern: 'switch',
    color: logicalColor,
    name: 'logic',
    emoji: '🔧',
    details: 'Conditionnal expressions (switch)',
},
{
    pattern: '[]',
    color: typoColor,
    name: 'logic',
    emoji: '🔧',
    details: 'Arrays',
},
{
    pattern: 'const (.*);',
    color: typoColor,
    name: 'logic',
    emoji: '🔧',
    details: 'Variable declarations',
},
{
    pattern: 'let (.*);',
    color: typoColor,
    name: 'naming',
    emoji: '📚',
    details: 'Variable declarations',
},
{
    pattern: 'private (.*);',
    color: typoColor,
    name: 'naming',
    emoji: '📚',
    details: 'Property variable declarations',
},
{
    pattern: 'public (.*);',
    color: typoColor,
    name: 'naming',
    emoji: '📚',
    details: 'Property variable declarations',
},
{
    pattern: 'protected (.*);',
    color: typoColor,
    name: 'naming',
    emoji: '📚',
    details: 'Property variable declarations',
},
{
    pattern: 'any',
    color: typeColor,
    name: 'type',
    emoji: '🔒',
    details: 'Dangerous type.',
},
{
    pattern: 'instanceof',
    color: technicalWarning,
    name: 'type',
    emoji: '🔒',
    details: 'Test of type',
},
{
    pattern: 'isObject',
    color: technicalWarning,
    name: 'type',
    emoji: '🔒',
    details: 'Test of type',
},
{
    pattern: 'isString',
    color: technicalWarning,
    name: 'type',
    emoji: '🔒',
    details: 'Test of type',
},
{
    pattern: 'Number\\(',
    color: technicalWarning,
    name: 'type',
    emoji: '🔒',
    details: 'Conversion of type',
},
{
    pattern: '\\[0\\]',
    color: technicalWarning,
    name: 'debt',
    emoji: '💸',
    details: '"[0]" is generally suspiscious',
},
{
    pattern: 'Promise.resolve',
    color: technicalWarning,
    name: 'hack',
    emoji: '⚠️',
    details: '"Promise.resolve" can be suspicious',
},
{
    pattern: 'setTimeout',
    color: technicalWarning,
    name: 'hack',
    emoji: '⚠️',
    details: '"setTimeout" is generally suspicious',
},
{
    pattern: 'timeout',
    color: technicalWarning,
    name: 'hack',
    emoji: '⚠️',
    details: '"timeout" is generally suspicious',
},
{
    pattern: '\\.then',
    color: technicalWarning,
    name: 'debt',
    emoji: '💸',
    details: 'We often can use Promises instead of ".then"',
},
{
    pattern: ':.*boolean',
    color: technicalWarning,
    name: 'logic',
    emoji: '🔧',
    details: 'Boolean can hide booleanTrap problems',
},
{
    pattern: 'click',
    color: userInteractionsColor,
    name: 'interaction',
    emoji: '🖱️',
    details: 'Human interaction (click) is a good point to inspect',
},
{
    pattern: 'submit',
    color: userInteractionsColor,
    name: 'interaction',
    emoji: '🖱️',
    details: 'Human interaction (submit) is a good point to inspect',
},
{
    pattern: 'hover',
    color: userInteractionsColor,
    name: 'interaction',
    emoji: '🖱️',
    details: 'Human interaction (hover) is a good point to inspect',
},
{
    pattern: 'focus',
    color: userInteractionsColor,
    name: 'interaction',
    emoji: '🖱️',
    details: 'Human interaction (focus) is a good point to inspect',
},
{
    pattern: 'href',
    color: userInteractionsColor,
    name: 'interaction',
    emoji: '🖱️',
    details: 'Human interaction (link href) is a good point to inspect',
},
{
    pattern: 'migration',
    color: migrationColor,
    name: 'migration',
    emoji: '📜',
    details: 'Migrations of databases for exemple',
},
{
    pattern: 'Migration',
    color: migrationColor,
    name: 'migration',
    emoji: '📜',
    details: 'Migrations of databases for exemple',
}];

if (true) {
    console.log(3);
}
