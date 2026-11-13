import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import ts from "typescript";

// Test-only TSX loader using the project's existing compiler and Node >=24.
// Kept in JS because the installed Node 20 types do not expose registerHooks.
export function registerUiTestLoader() {
 return registerHooks({
  resolve(specifier,context,next) {
   const base=specifier.startsWith("@/") ? new URL("../src/"+specifier.slice(2),import.meta.url) :
    specifier.startsWith(".") && context.parentURL ? new URL(specifier,context.parentURL) : null;
   if(base && !/\.[a-z]+$/i.test(base.pathname)) {
    for(const extension of [".tsx",".ts"]) {
     const url=new URL(base.href+extension);
     if(existsSync(url))return next(url.href,context);
    }
   }
   return next(specifier,context);
  },
  load(url,context,next) {
   if(url.endsWith(".tsx"))return {format:"module",shortCircuit:true,source:ts.transpileModule(readFileSync(new URL(url),"utf8"),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText};
   return next(url,context);
  },
 });
}
