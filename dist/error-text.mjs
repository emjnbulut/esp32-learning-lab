// UI diagnostics: keep compiler messages and line/column data unchanged.
const EXACT=new Set([
 "Comment /* is never closed with */",
 "Macros with parameters are not supported; use a function instead",
 "A char literal holds one character: use double quotes for text",
 "Expected \";\" at the end of this line",
 "Pointers are not supported in this simulator",
 "Expected a type",
 "A {…} list can only be used to fill an array when it is declared",
 "The code ends too early: is a \"}\" or \")\" missing?",
 "Only functions can be called",
 "Expected a name after \".\"",
 "\"::\" is not supported in this simulator",
 "Pointers and addresses (& and *) are not supported in this simulator",
 "Only variables can be assigned",
 "Arrays with more than one dimension are not supported yet",
 "Expected a variable name",
 "Expected \"while\" after the do { } block",
 "Expected \"case\" inside switch",
 "\"else\" without a matching \"if\" (check the braces before it)",
 "A \"{\" is never closed: add a \"}\"",
 "struct and class are not supported yet",
 "Expected a name",
 "Reference parameters (&) are not supported yet",
 "Expected a parameter name",
 "Two text literals cannot be compared; use String",
 "Text in quotes cannot be joined with \"+\" here. Print the parts one after another, or start with String(\"…\") + value.",
 "A {…} list can only fill an array when it is declared",
 "Only arrays can be indexed with [ ]",
 "Use a member with a call, for example Serial.println()",
 "Unsupported expression",
 "A whole array cannot be assigned; assign one element: name[i] = …",
 "Only variables can be changed",
 "Pass the name of one of your functions here",
 "A variable cannot be void",
 "\"break\" can only be used inside a loop or switch",
 "\"continue\" can only be used inside a loop",
 "Every sketch needs a \"void setup() { }\" function",
 "Every sketch needs a \"void loop() { }\" function",
 "Fill an array with a {…} list",
 "Change a String with its functions, not with [ ]",
 "Division by zero: the ESP32 would crash here",
 "Division by zero (% 0): the ESP32 would crash here",
 "attachInterrupt() is not supported in the simulator yet. Read the pin in loop() instead."
]);
const RULES=[
 {
  "pattern": "^Unknown preprocessor line: ([\\s\\S]*)$",
  "key": "Unknown preprocessor line: {line}",
  "names": [
   "line"
  ]
 },
 {
  "pattern": "^Text is not closed with ([\"\\'])$",
  "key": "Text is not closed with {quote}",
  "names": [
   "quote"
  ]
 },
 {
  "pattern": "^Unexpected character \"([\\s\\S]*)\"$",
  "key": "Unexpected character \"{token}\"",
  "names": [
   "token"
  ]
 },
 {
  "pattern": "^Expected \"([\\s\\S]*)\" before \"([\\s\\S]*)\"$",
  "key": "Expected \"{expected}\" before \"{token}\"",
  "names": [
   "expected",
   "token"
  ]
 },
 {
  "pattern": "^Unknown type \"([^\"]*)\"$",
  "key": "Unknown type \"{type}\"",
  "names": [
   "type"
  ]
 },
 {
  "pattern": "^Unexpected \"([\\s\\S]*)\"$",
  "key": "Unexpected \"{token}\"",
  "names": [
   "token"
  ]
 },
 {
  "pattern": "^\"([^\"]*)\\(\\)\" starts inside another function\\. Is a \"}\" missing above it\\?$",
  "key": "\"{name}()\" starts inside another function. Is a \"}\" missing above it?",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^Expected a declaration or a function here, not \"([\\s\\S]*)\"$",
  "key": "Expected a declaration or a function here, not \"{token}\"",
  "names": [
   "token"
  ]
 },
 {
  "pattern": "^The function \"([^\"]*)\" is defined twice$",
  "key": "The function \"{name}\" is defined twice",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^\"([^\"]*)\" is declared twice in the same place$",
  "key": "\"{name}\" is declared twice in the same place",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^\"([^\"]*)\" is a function: call it with \\( \\)$",
  "key": "\"{name}\" is a function: call it with ( )",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^Use (\\w+) with a function, for example \\1\\.println\\(\\.\\.\\.\\)$",
  "key": "Use {name} with a function, for example {name}.println(...)",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^\"([^\"]*)\" was not declared\\. Check the spelling \\(upper/lower case matters\\) or declare it first\\.$",
  "key": "\"{name}\" was not declared. Check the spelling (upper/lower case matters) or declare it first.",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^\"([^\"]*)\" needs a number$",
  "key": "\"{operator}\" needs a number",
  "names": [
   "operator"
  ]
 },
 {
  "pattern": "^\"([^\"]*)\" needs a number variable$",
  "key": "\"{operator}\" needs a number variable",
  "names": [
   "operator"
  ]
 },
 {
  "pattern": "^\"([^\"]*)\" does not work with text$",
  "key": "\"{operator}\" does not work with text",
  "names": [
   "operator"
  ]
 },
 {
  "pattern": "^\"([^\"]*)\" does not work with String$",
  "key": "\"{operator}\" does not work with String",
  "names": [
   "operator"
  ]
 },
 {
  "pattern": "^\"([^\"]*)\" needs whole numbers, not float$",
  "key": "\"{operator}\" needs whole numbers, not float",
  "names": [
   "operator"
  ]
 },
 {
  "pattern": "^\"([^\"]*)\" is const and cannot be changed$",
  "key": "\"{name}\" is const and cannot be changed",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^Text cannot be stored in the number variable \"([^\"]*)\"$",
  "key": "Text cannot be stored in the number variable \"{name}\"",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^([\\w.]+)\\(\\) takes ([\\d–]+) arguments?, not (\\d+)$",
  "key": "{name}() expects {expected} argument(s), received {actual}",
  "names": [
   "name",
   "expected",
   "actual"
  ]
 },
 {
  "pattern": "^([\\w.]+)\\(\\) does not exist$",
  "key": "{name}() does not exist",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^\"([^\"]*)\" can only be used on a String$",
  "key": "\"{name}\" can only be used on a String",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^String has no function \"([^\"]*)\"$",
  "key": "String has no function \"{name}\"",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^\"([^\"]*)\" is a variable, not a function$",
  "key": "\"{name}\" is a variable, not a function",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^\"([^\"]*)\" was not declared\\. Check the spelling, or write the function first\\.$",
  "key": "\"{name}\" was not declared. Check the spelling, or write the function first.",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^Add \\[ \\] after \"([^\"]*)\" to make it an array$",
  "key": "Add [ ] after \"{name}\" to make it an array",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^The array \"([^\"]*)\" needs a size or a \\{…\\} list$",
  "key": "The array \"{name}\" needs a size or a {…} list",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^(\\w+)\\(\\) is void and cannot return a value$",
  "key": "{name}() is void and cannot return a value",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^\"([^\"]*)\" is used for a variable and a function$",
  "key": "\"{name}\" is used for a variable and a function",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^Too many nested calls of (\\w+)\\(\\) \\(endless recursion\\?\\)$",
  "key": "Too many nested calls of {name}() (endless recursion?)",
  "names": [
   "name"
  ]
 },
 {
  "pattern": "^The array size must be between 1 and 10000, not (.*)$",
  "key": "The array size must be between 1 and 10000, not {size}",
  "names": [
   "size"
  ]
 },
 {
  "pattern": "^Too many values for \"([^\"]*)\\[(\\d+)\\]\"$",
  "key": "Too many values for \"{name}[{size}]\"",
  "names": [
   "name",
   "size"
  ]
 },
 {
  "pattern": "^Index ([-\\d]+) is outside the array \"([^\"]*)\" \\(valid: 0 to ([-\\d]+)\\)$",
  "key": "Index {index} is outside the array \"{name}\" (valid: 0 to {last})",
  "names": [
   "index",
   "name",
   "last"
  ]
 },
 {
  "pattern": "^Unknown operator (.*)$",
  "key": "Unknown operator {operator}",
  "names": [
   "operator"
  ]
 }
].map(r=>({...r,re:new RegExp(r.pattern)}));
const FALLBACK="The simulator could not run this code. Check the highlighted line and the technical details.";
export const DIAGNOSTIC_KEYS=[...EXACT,...RULES.map(r=>r.key),FALLBACK];
const fill=(s,v)=>s.replace(/\{(\w+)\}/g,(match,key)=>Object.hasOwn(v,key)?v[key]:match);
export function explainError(message,t=s=>s){
 message=String(message);
 if(EXACT.has(message))return {text:t(message),details:null};
 for(const r of RULES){const match=message.match(r.re);if(!match)continue;
  const translated=t(r.key);const vars=Object.fromEntries(r.names.map((name,i)=>[name,match[i+1]]));
  return {text:translated===r.key?message:fill(translated,vars),details:null};
 }
 const text=t(FALLBACK);return text===FALLBACK?{text:message,details:null}:{text,details:message};
}
