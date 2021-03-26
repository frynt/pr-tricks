import { Trick } from "../entities/trick";
const logicalColor = 'white';
const typoColor = 'white';
const userInteractionsColor = 'white';
const migrationColor = 'white';
const typeColor = 'white';
const technicalWarning = 'white';

export const trickList: Trick[] = [{
	pattern: "if.*\\(",
	color: logicalColor,
	name: 'logic',
	emoji: '🔧'
},
{
	pattern: "else.*\\(",
	color: logicalColor,
	name: 'logic',
	emoji: '🔧'
},
{
	pattern: "switch",
	color: logicalColor,
	name: 'logic',
	emoji: '🔧'
},
{
	pattern: "[]",
	color: typoColor,
	name: 'logic',
	emoji: '🔧'
},
{
	pattern: "const (.*);",
	color: typoColor,
	name: 'logic',
	emoji: '🔧'
},
{
	pattern: "let (.*);",
	color: typoColor,
	name: 'naming',
	emoji: '📚' 
},
{
	pattern: "private (.*);",
	color: typoColor,
	name: 'naming',
	emoji: '📚' 
},
{
	pattern: "public (.*);",
	color: typoColor,
	name: 'naming',
	emoji: '📚' 
},
{
	pattern: "protected (.*);",
	color: typoColor,
	name: 'naming',
	emoji: '📚' 
},
{
	pattern: "any",
	color: typeColor,
	name: 'type',  
	emoji: '🔒',
},
{
	pattern: "instanceof",
	color: technicalWarning,
	name: 'type',  
	emoji: '🔒',
},
{
	pattern: "isObject",
	color: technicalWarning,
	name: 'type',  
	emoji: '🔒',
},
{
	pattern: "isString",
	color: technicalWarning,
	name: 'type',  
	emoji: '🔒',
},
{
	pattern: "Number\\(",
	color: technicalWarning,
	name: 'type',  
	emoji: '🔒',
},
{
	pattern: "\\[0\\]",
	color: technicalWarning,
	name: 'debt', 
	emoji: '💸',
},
{
	pattern: "app/module/form",
	color: technicalWarning,
	name: 'impact', 
	emoji: '☄️',
},
{
	pattern: "Promise.resolve",
	color: technicalWarning,
	name: 'hack',
	emoji: '⚠️',
},
{
	pattern: "setTimeout",
	color: technicalWarning,
	name: 'hack',
	emoji: '⚠️',
},
{
	pattern: "timeout",
	color: technicalWarning,
	name: 'hack',
	emoji: '⚠️',
},
{
	pattern: "\\.then",
	color: technicalWarning,
	name: 'debt', 
	emoji: '💸',
},
{
	pattern: ":.*boolean",
	color: technicalWarning,
	name: 'logic',
	emoji: '🔧'
},
{
	pattern: "click",
	color: userInteractionsColor,
	name: 'interaction',
	emoji: '🖱️',
},
{
	pattern: "submit",
	color: userInteractionsColor,
	name: 'interaction',
	emoji: '🖱️',
},
{
	pattern: "hover",
	color: userInteractionsColor,
	name: 'interaction',
	emoji: '🖱️',
},
{
	pattern: "focus",
	color: userInteractionsColor,
	name: 'interaction',
	emoji: '🖱️',
},
{
	pattern: "href",
	color: userInteractionsColor,
	name: 'interaction',
	emoji: '🖱️',
},
{
	pattern: "migration",
	color: migrationColor,
	name: 'migration' ,
	emoji: '📜',
},
{
	pattern: "Migration",
	color: migrationColor,
	name: 'migration' ,
	emoji: '📜',
}];