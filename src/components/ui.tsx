import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Button({variant="primary",loading=false,className="",children,disabled,...props}:ButtonHTMLAttributes<HTMLButtonElement> & {variant?:"primary"|"secondary"|"ghost";loading?:boolean}) {
 return <button type="button" {...props} disabled={disabled || loading} aria-busy={loading || undefined} className={`button button--${variant} ${className}`}>
  {loading && <span className="loading-mark" aria-hidden="true"/>}{children}
 </button>;
}
export function Card({className="",...props}:HTMLAttributes<HTMLDivElement>) {
 return <div {...props} className={`card ${className}`}/>;
}
export function SectionHeading({number,title,children}:{number:string;title:string;children?:ReactNode}) {
 return <div className="section-heading"><div><span className="eyebrow">{number} / EXPLORE SEU PERFIL</span><h2>{title}</h2></div>{children && <p className="note">{children}</p>}</div>;
}
export function Progress({value,max}:{value:number;max:number}) {
 return <div className="progress-block"><div className="progress-label"><span>Sua jornada</span><span>{value} de {max} respondidas</span></div>
  <div className="progress" role="progressbar" aria-label="Progresso do quiz" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}><span style={{width:`${value/max*100}%`}}/></div>
 </div>;
}
export function QuizOption({label,number,...props}:InputHTMLAttributes<HTMLInputElement> & {label:string;number:number}) {
 return <label className={`quiz-option ${props.checked ? "is-selected" : ""}`}>
  <input {...props} type="radio"/><span className="option-number" aria-hidden="true">0{number}</span><span className="option-label">{label}</span><span className="option-check" aria-hidden="true">{props.checked ? "✓" : ""}</span>
 </label>;
}
export function ResultStat({label,value,detail}:{label:string;value:string;detail?:string}) {
 return <div className="result-stat"><span className="note">{label}</span><span className="stat-value">{value}</span>{detail && <span className="note">{detail}</span>}</div>;
}
// Original typographic artwork; no remote image or character artwork is requested.
export function CharacterPortrait({name,compact=false}:{name:string;compact?:boolean}) {
 const initials=name.split(/[\s-]+/).filter(Boolean).slice(0,2).map(part=>part[0]).join("");
 return <div className={`character-portrait ${compact ? "is-compact" : ""}`} aria-hidden="true"><span className="portrait-cross">+</span><span className="portrait-initials">{initials}</span><span className="portrait-caption">PERFIL / 616</span></div>;
}
