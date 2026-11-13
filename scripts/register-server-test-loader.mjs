import {registerHooks} from "node:module";
// Next enforces server-only at compile time; node:test has no such compiler.
export function registerServerTestLoader(){
 return registerHooks({resolve(specifier,context,next){
  if(specifier==="server-only")return {url:"data:text/javascript,export%20%7B%7D",shortCircuit:true};
  return next(specifier,context);
 }});
}
