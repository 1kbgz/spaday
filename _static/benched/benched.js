var ai=globalThis,li=ai.ShadowRoot&&(ai.ShadyCSS===void 0||ai.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,gs=Symbol(),Ro=new WeakMap,Te=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==gs)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(li&&t===void 0){let i=e!==void 0&&e.length===1;i&&(t=Ro.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&Ro.set(e,t))}return t}toString(){return this.cssText}},No=s=>new Te(typeof s=="string"?s:s+"",void 0,gs),F=(s,...t)=>{let e=s.length===1?s[0]:t.reduce((i,n,o)=>i+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+s[o+1],s[0]);return new Te(e,s,gs)},Oo=(s,t)=>{if(li)s.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let i=document.createElement("style"),n=ai.litNonce;n!==void 0&&i.setAttribute("nonce",n),i.textContent=e.cssText,s.appendChild(i)}},vs=li?s=>s:s=>s instanceof CSSStyleSheet?(t=>{let e="";for(let i of t.cssRules)e+=i.cssText;return No(e)})(s):s;var{is:Nl,defineProperty:Ol,getOwnPropertyDescriptor:Fl,getOwnPropertyNames:Il,getOwnPropertySymbols:Bl,getPrototypeOf:Vl}=Object,hi=globalThis,Fo=hi.trustedTypes,ql=Fo?Fo.emptyScript:"",Dl=hi.reactiveElementPolyfillSupport,Ae=(s,t)=>s,Pe={toAttribute(s,t){switch(t){case Boolean:s=s?ql:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,t){let e=s;switch(t){case Boolean:e=s!==null;break;case Number:e=s===null?null:Number(s);break;case Object:case Array:try{e=JSON.parse(s)}catch{e=null}}return e}},ci=(s,t)=>!Nl(s,t),Io={attribute:!0,type:String,converter:Pe,reflect:!1,useDefault:!1,hasChanged:ci};Symbol.metadata??=Symbol("metadata"),hi.litPropertyMetadata??=new WeakMap;var Ct=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=Io){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let i=Symbol(),n=this.getPropertyDescriptor(t,i,e);n!==void 0&&Ol(this.prototype,t,n)}}static getPropertyDescriptor(t,e,i){let{get:n,set:o}=Fl(this.prototype,t)??{get(){return this[e]},set(r){this[e]=r}};return{get:n,set(r){let a=n?.call(this);o?.call(this,r),this.requestUpdate(t,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Io}static _$Ei(){if(this.hasOwnProperty(Ae("elementProperties")))return;let t=Vl(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(Ae("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Ae("properties"))){let e=this.properties,i=[...Il(e),...Bl(e)];for(let n of i)this.createProperty(n,e[n])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[i,n]of e)this.elementProperties.set(i,n)}this._$Eh=new Map;for(let[e,i]of this.elementProperties){let n=this._$Eu(e,i);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let i=new Set(t.flat(1/0).reverse());for(let n of i)e.unshift(vs(n))}else t!==void 0&&e.push(vs(t));return e}static _$Eu(t,e){let i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Oo(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){let i=this.constructor.elementProperties.get(t),n=this.constructor._$Eu(t,i);if(n!==void 0&&i.reflect===!0){let o=(i.converter?.toAttribute!==void 0?i.converter:Pe).toAttribute(e,i.type);this._$Em=t,o==null?this.removeAttribute(n):this.setAttribute(n,o),this._$Em=null}}_$AK(t,e){let i=this.constructor,n=i._$Eh.get(t);if(n!==void 0&&this._$Em!==n){let o=i.getPropertyOptions(n),r=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:Pe;this._$Em=n;let a=r.fromAttribute(e,o.type);this[n]=a??this._$Ej?.get(n)??a,this._$Em=null}}requestUpdate(t,e,i,n=!1,o){if(t!==void 0){let r=this.constructor;if(n===!1&&(o=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??ci)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:n,wrapped:o},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),o!==!0||r!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),n===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[n,o]of this._$Ep)this[n]=o;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[n,o]of i){let{wrapped:r}=o,a=this[n];r!==!0||this._$AL.has(n)||a===void 0||this.C(n,void 0,o,a)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(e)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};Ct.elementStyles=[],Ct.shadowRootOptions={mode:"open"},Ct[Ae("elementProperties")]=new Map,Ct[Ae("finalized")]=new Map,Dl?.({ReactiveElement:Ct}),(hi.reactiveElementVersions??=[]).push("2.1.2");var ws=globalThis,Bo=s=>s,ui=ws.trustedTypes,Vo=ui?ui.createPolicy("lit-html",{createHTML:s=>s}):void 0,ys="$lit$",St=`lit$${Math.random().toFixed(9).slice(2)}$`,xs="?"+St,Wl=`<${xs}>`,Wt=document,Re=()=>Wt.createComment(""),Ne=s=>s===null||typeof s!="object"&&typeof s!="function",Cs=Array.isArray,jo=s=>Cs(s)||typeof s?.[Symbol.iterator]=="function",bs=`[ 	
\f\r]`,$e=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,qo=/-->/g,Do=/>/g,qt=RegExp(`>|${bs}(?:([^\\s"'>=/]+)(${bs}*=${bs}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Wo=/'/g,Uo=/"/g,Ko=/^(?:script|style|textarea|title)$/i,Ss=s=>(t,...e)=>({_$litType$:s,strings:t,values:e}),N=Ss(1),Yo=Ss(2),Qo=Ss(3),lt=Symbol.for("lit-noChange"),I=Symbol.for("lit-nothing"),Ho=new WeakMap,Dt=Wt.createTreeWalker(Wt,129);function Go(s,t){if(!Cs(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return Vo!==void 0?Vo.createHTML(t):t}var Xo=(s,t)=>{let e=s.length-1,i=[],n,o=t===2?"<svg>":t===3?"<math>":"",r=$e;for(let a=0;a<e;a++){let l=s[a],h,c,u=-1,d=0;for(;d<l.length&&(r.lastIndex=d,c=r.exec(l),c!==null);)d=r.lastIndex,r===$e?c[1]==="!--"?r=qo:c[1]!==void 0?r=Do:c[2]!==void 0?(Ko.test(c[2])&&(n=RegExp("</"+c[2],"g")),r=qt):c[3]!==void 0&&(r=qt):r===qt?c[0]===">"?(r=n??$e,u=-1):c[1]===void 0?u=-2:(u=r.lastIndex-c[2].length,h=c[1],r=c[3]===void 0?qt:c[3]==='"'?Uo:Wo):r===Uo||r===Wo?r=qt:r===qo||r===Do?r=$e:(r=qt,n=void 0);let m=r===qt&&s[a+1].startsWith("/>")?" ":"";o+=r===$e?l+Wl:u>=0?(i.push(h),l.slice(0,u)+ys+l.slice(u)+St+m):l+St+(u===-2?a:m)}return[Go(s,o+(s[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]},Oe=class s{constructor({strings:t,_$litType$:e},i){let n;this.parts=[];let o=0,r=0,a=t.length-1,l=this.parts,[h,c]=Xo(t,e);if(this.el=s.createElement(h,i),Dt.currentNode=this.el.content,e===2||e===3){let u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(n=Dt.nextNode())!==null&&l.length<a;){if(n.nodeType===1){if(n.hasAttributes())for(let u of n.getAttributeNames())if(u.endsWith(ys)){let d=c[r++],m=n.getAttribute(u).split(St),f=/([.?@])?(.*)/.exec(d);l.push({type:1,index:o,name:f[2],strings:m,ctor:f[1]==="."?mi:f[1]==="?"?fi:f[1]==="@"?pi:Ht}),n.removeAttribute(u)}else u.startsWith(St)&&(l.push({type:6,index:o}),n.removeAttribute(u));if(Ko.test(n.tagName)){let u=n.textContent.split(St),d=u.length-1;if(d>0){n.textContent=ui?ui.emptyScript:"";for(let m=0;m<d;m++)n.append(u[m],Re()),Dt.nextNode(),l.push({type:2,index:++o});n.append(u[d],Re())}}}else if(n.nodeType===8)if(n.data===xs)l.push({type:2,index:o});else{let u=-1;for(;(u=n.data.indexOf(St,u+1))!==-1;)l.push({type:7,index:o}),u+=St.length-1}o++}}static createElement(t,e){let i=Wt.createElement("template");return i.innerHTML=t,i}};function Ut(s,t,e=s,i){if(t===lt)return t;let n=i!==void 0?e._$Co?.[i]:e._$Cl,o=Ne(t)?void 0:t._$litDirective$;return n?.constructor!==o&&(n?._$AO?.(!1),o===void 0?n=void 0:(n=new o(s),n._$AT(s,e,i)),i!==void 0?(e._$Co??=[])[i]=n:e._$Cl=n),n!==void 0&&(t=Ut(s,n._$AS(s,t.values),n,i)),t}var di=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:i}=this._$AD,n=(t?.creationScope??Wt).importNode(e,!0);Dt.currentNode=n;let o=Dt.nextNode(),r=0,a=0,l=i[0];for(;l!==void 0;){if(r===l.index){let h;l.type===2?h=new ae(o,o.nextSibling,this,t):l.type===1?h=new l.ctor(o,l.name,l.strings,this,t):l.type===6&&(h=new gi(o,this,t)),this._$AV.push(h),l=i[++a]}r!==l?.index&&(o=Dt.nextNode(),r++)}return Dt.currentNode=Wt,n}p(t){let e=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}},ae=class s{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,n){this.type=2,this._$AH=I,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Ut(this,t,e),Ne(t)?t===I||t==null||t===""?(this._$AH!==I&&this._$AR(),this._$AH=I):t!==this._$AH&&t!==lt&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):jo(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==I&&Ne(this._$AH)?this._$AA.nextSibling.data=t:this.T(Wt.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:i}=t,n=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=Oe.createElement(Go(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(e);else{let o=new di(n,this),r=o.u(this.options);o.p(e),this.T(r),this._$AH=o}}_$AC(t){let e=Ho.get(t.strings);return e===void 0&&Ho.set(t.strings,e=new Oe(t)),e}k(t){Cs(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,i,n=0;for(let o of t)n===e.length?e.push(i=new s(this.O(Re()),this.O(Re()),this,this.options)):i=e[n],i._$AI(o),n++;n<e.length&&(this._$AR(i&&i._$AB.nextSibling,n),e.length=n)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let i=Bo(t).nextSibling;Bo(t).remove(),t=i}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},Ht=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,n,o){this.type=1,this._$AH=I,this._$AN=void 0,this.element=t,this.name=e,this._$AM=n,this.options=o,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=I}_$AI(t,e=this,i,n){let o=this.strings,r=!1;if(o===void 0)t=Ut(this,t,e,0),r=!Ne(t)||t!==this._$AH&&t!==lt,r&&(this._$AH=t);else{let a=t,l,h;for(t=o[0],l=0;l<o.length-1;l++)h=Ut(this,a[i+l],e,l),h===lt&&(h=this._$AH[l]),r||=!Ne(h)||h!==this._$AH[l],h===I?t=I:t!==I&&(t+=(h??"")+o[l+1]),this._$AH[l]=h}r&&!n&&this.j(t)}j(t){t===I?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},mi=class extends Ht{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===I?void 0:t}},fi=class extends Ht{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==I)}},pi=class extends Ht{constructor(t,e,i,n,o){super(t,e,i,n,o),this.type=5}_$AI(t,e=this){if((t=Ut(this,t,e,0)??I)===lt)return;let i=this._$AH,n=t===I&&i!==I||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==I&&(i===I||n);n&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},gi=class{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Ut(this,t)}},Jo={M:ys,P:St,A:xs,C:1,L:Xo,R:di,D:jo,V:Ut,I:ae,H:Ht,N:fi,U:pi,B:mi,F:gi},Ul=ws.litHtmlPolyfillSupport;Ul?.(Oe,ae),(ws.litHtmlVersions??=[]).push("3.3.3");var Zo=(s,t,e)=>{let i=e?.renderBefore??t,n=i._$litPart$;if(n===void 0){let o=e?.renderBefore??null;i._$litPart$=n=new ae(t.insertBefore(Re(),o),o,void 0,e??{})}return n._$AI(s),n};var Ms=globalThis,At=class extends Ct{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Zo(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return lt}};At._$litElement$=!0,At.finalized=!0,Ms.litElementHydrateSupport?.({LitElement:At});var Hl=Ms.litElementPolyfillSupport;Hl?.({LitElement:At});(Ms.litElementVersions??=[]).push("4.2.2");var tr=F`
  :host {
    display: flex;
    position: relative;
    align-items: stretch;
    border-radius: var(--wa-panel-border-radius);
    background-color: var(--wa-color-fill-quiet, var(--wa-color-brand-fill-quiet));
    border-color: var(--wa-color-border-quiet, var(--wa-color-brand-border-quiet));
    border-style: var(--wa-panel-border-style);
    border-width: var(--wa-panel-border-width);
    color: var(--wa-color-text-normal);
    padding: 1em;
  }

  /* Appearance modifiers */
  :host([appearance~='plain']) {
    background-color: transparent;
    border-color: transparent;
  }

  :host([appearance~='outlined']) {
    background-color: transparent;
    border-color: var(--wa-color-border-loud, var(--wa-color-brand-border-loud));
  }

  :host([appearance~='filled']) {
    background-color: var(--wa-color-fill-quiet, var(--wa-color-brand-fill-quiet));
    border-color: transparent;
  }

  :host([appearance~='filled-outlined']) {
    border-color: var(--wa-color-border-quiet, var(--wa-color-brand-border-quiet));
  }

  :host([appearance~='accent']) {
    color: var(--wa-color-on-loud, var(--wa-color-brand-on-loud));
    background-color: var(--wa-color-fill-loud, var(--wa-color-brand-fill-loud));
    border-color: transparent;

    [part~='icon'] {
      color: currentColor;
    }
  }

  [part~='icon'] {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    color: var(--wa-color-on-quiet);
    font-size: 1.25em;
  }

  ::slotted([slot='icon']) {
    margin-inline-end: var(--wa-form-control-padding-inline);
  }

  [part~='message'] {
    flex: 1 1 auto;
    display: block;
    overflow: hidden;
  }
`;var er={small:"s",medium:"m",large:"l"},ir=new Set;function Pt(s,t){t in er&&!ir.has(`${s}:${t}`)&&(ir.add(`${s}:${t}`),console.warn(`[${s}] size="${t}" is deprecated. Use size="${er[t]}" instead. The long-form value will be removed in the next major version.`))}var pt=F`
  :host([size='xs']) {
    font-size: var(--wa-font-size-xs);
  }

  :host([size='s']),
  :host([size='small']) {
    font-size: var(--wa-font-size-s);
  }

  :host([size='m']),
  :host([size='medium']) {
    font-size: var(--wa-font-size-m);
  }

  :host([size='l']),
  :host([size='large']) {
    font-size: var(--wa-font-size-l);
  }

  :host([size='xl']) {
    font-size: var(--wa-font-size-xl);
  }
`;var le=F`
  :where(:root),
  .wa-neutral,
  :host([variant='neutral']) {
    --wa-color-fill-loud: var(--wa-color-neutral-fill-loud);
    --wa-color-fill-normal: var(--wa-color-neutral-fill-normal);
    --wa-color-fill-quiet: var(--wa-color-neutral-fill-quiet);
    --wa-color-border-loud: var(--wa-color-neutral-border-loud);
    --wa-color-border-normal: var(--wa-color-neutral-border-normal);
    --wa-color-border-quiet: var(--wa-color-neutral-border-quiet);
    --wa-color-on-loud: var(--wa-color-neutral-on-loud);
    --wa-color-on-normal: var(--wa-color-neutral-on-normal);
    --wa-color-on-quiet: var(--wa-color-neutral-on-quiet);
  }

  .wa-brand,
  :host([variant='brand']) {
    --wa-color-fill-loud: var(--wa-color-brand-fill-loud);
    --wa-color-fill-normal: var(--wa-color-brand-fill-normal);
    --wa-color-fill-quiet: var(--wa-color-brand-fill-quiet);
    --wa-color-border-loud: var(--wa-color-brand-border-loud);
    --wa-color-border-normal: var(--wa-color-brand-border-normal);
    --wa-color-border-quiet: var(--wa-color-brand-border-quiet);
    --wa-color-on-loud: var(--wa-color-brand-on-loud);
    --wa-color-on-normal: var(--wa-color-brand-on-normal);
    --wa-color-on-quiet: var(--wa-color-brand-on-quiet);
  }

  .wa-success,
  :host([variant='success']) {
    --wa-color-fill-loud: var(--wa-color-success-fill-loud);
    --wa-color-fill-normal: var(--wa-color-success-fill-normal);
    --wa-color-fill-quiet: var(--wa-color-success-fill-quiet);
    --wa-color-border-loud: var(--wa-color-success-border-loud);
    --wa-color-border-normal: var(--wa-color-success-border-normal);
    --wa-color-border-quiet: var(--wa-color-success-border-quiet);
    --wa-color-on-loud: var(--wa-color-success-on-loud);
    --wa-color-on-normal: var(--wa-color-success-on-normal);
    --wa-color-on-quiet: var(--wa-color-success-on-quiet);
  }

  .wa-warning,
  :host([variant='warning']) {
    --wa-color-fill-loud: var(--wa-color-warning-fill-loud);
    --wa-color-fill-normal: var(--wa-color-warning-fill-normal);
    --wa-color-fill-quiet: var(--wa-color-warning-fill-quiet);
    --wa-color-border-loud: var(--wa-color-warning-border-loud);
    --wa-color-border-normal: var(--wa-color-warning-border-normal);
    --wa-color-border-quiet: var(--wa-color-warning-border-quiet);
    --wa-color-on-loud: var(--wa-color-warning-on-loud);
    --wa-color-on-normal: var(--wa-color-warning-on-normal);
    --wa-color-on-quiet: var(--wa-color-warning-on-quiet);
  }

  .wa-danger,
  :host([variant='danger']) {
    --wa-color-fill-loud: var(--wa-color-danger-fill-loud);
    --wa-color-fill-normal: var(--wa-color-danger-fill-normal);
    --wa-color-fill-quiet: var(--wa-color-danger-fill-quiet);
    --wa-color-border-loud: var(--wa-color-danger-border-loud);
    --wa-color-border-normal: var(--wa-color-danger-border-normal);
    --wa-color-border-quiet: var(--wa-color-danger-border-quiet);
    --wa-color-on-loud: var(--wa-color-danger-on-loud);
    --wa-color-on-normal: var(--wa-color-danger-on-normal);
    --wa-color-on-quiet: var(--wa-color-danger-on-quiet);
  }
`;function Q(s,t){let e={waitUntilFirstUpdate:!1,...t};return(i,n)=>{let{update:o}=i,r=Array.isArray(s)?s:[s];i.update=function(a){r.forEach(l=>{let h=l;if(a.has(h)){let c=a.get(h),u=this[h];c!==u&&(!e.waitUntilFirstUpdate||this.hasUpdated)&&this[n](c,u)}}),o.call(this,a)}}}var jl=Object.defineProperty,Kl=Object.getOwnPropertyDescriptor,sr=s=>{throw TypeError(s)},p=(s,t,e,i)=>{for(var n=i>1?void 0:i?Kl(t,e):t,o=s.length-1,r;o>=0;o--)(r=s[o])&&(n=(i?r(t,e,n):r(n))||n);return i&&n&&jl(t,e,n),n},nr=(s,t,e)=>t.has(s)||sr("Cannot "+e),or=(s,t,e)=>(nr(s,t,"read from private field"),e?e.call(s):t.get(s)),rr=(s,t,e)=>t.has(s)?sr("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(s):t.set(s,e),ar=(s,t,e,i)=>(nr(s,t,"write to private field"),i?i.call(s,e):t.set(s,e),e);var H=s=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(s,t)}):customElements.define(s,t)};var Yl={attribute:!0,type:String,converter:Pe,reflect:!1,hasChanged:ci},Ql=(s=Yl,t,e)=>{let{kind:i,metadata:n}=e,o=globalThis.litPropertyMetadata.get(n);if(o===void 0&&globalThis.litPropertyMetadata.set(n,o=new Map),i==="setter"&&((s=Object.create(s)).wrapped=!0),o.set(e.name,s),i==="accessor"){let{name:r}=e;return{set(a){let l=t.get.call(this);t.set.call(this,a),this.requestUpdate(r,l,s,!0,a)},init(a){return a!==void 0&&this.C(r,void 0,s,a),a}}}if(i==="setter"){let{name:r}=e;return function(a){let l=this[r];t.call(this,a),this.requestUpdate(r,l,s,!0,a)}}throw Error("Unsupported decorator location: "+i)};function y(s){return(t,e)=>typeof e=="object"?Ql(s,t,e):((i,n,o)=>{let r=n.hasOwnProperty(o);return n.constructor.createProperty(o,i),r?Object.getOwnPropertyDescriptor(n,o):void 0})(s,t,e)}function ht(s){return y({...s,state:!0,attribute:!1})}var jt=(s,t,e)=>(e.configurable=!0,e.enumerable=!0,Reflect.decorate&&typeof t!="object"&&Object.defineProperty(s,t,e),e);function Z(s,t){return(e,i,n)=>{let o=r=>r.renderRoot?.querySelector(s)??null;if(t){let{get:r,set:a}=typeof i=="object"?e:n??(()=>{let l=Symbol();return{get(){return this[l]},set(h){this[l]=h}}})();return jt(e,i,{get(){let l=r.call(this);return l===void 0&&(l=o(this),(l!==null||this.hasUpdated)&&a.call(this,l)),l}})}return jt(e,i,{get(){return o(this)}})}}var Gl=F`
  :host {
    box-sizing: border-box;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  [hidden],
  :host([hidden]) {
    display: none !important;
  }
`,Xl=/;\s+$/;function Jl(s){return s.replace(/[A-Z]/g,t=>`-${t.toLowerCase()}`)}function lr(s){let{property:t,value:e,element:i}=s;if(e){let n=i.getAttribute("style")||"";n&&(n.match(Xl)||(n+=";"),n+=" ");let o=`${t}: ${e}`;return n.includes(o)?void 0:`${n}${o};`}return null}var vi,U=class extends At{constructor(){super(),rr(this,vi,!1),this.initialReflectedProperties=new Map,this.didSSR=!!this.shadowRoot,this.customStates={set:(t,e)=>{if(this.internals?.states)try{e?this.internals.states.add(t):this.internals.states.delete(t)}catch(i){if(String(i).includes("must start with '--'"))console.error("Your browser implements an outdated version of CustomStateSet. Consider using a polyfill");else throw i}},has:t=>{if(!this.internals?.states)return!1;try{return this.internals.states.has(t)}catch{return!1}}};try{this.internals=this.attachInternals()}catch{console.error("Element internals are not supported in your browser. Consider using a polyfill")}this.customStates.set("wa-defined",!0);let s=this.constructor;for(let[t,e]of s.elementProperties)e.default==="inherit"&&e.initial!==void 0&&typeof t=="string"&&this.customStates.set(`initial-${t}-${e.initial}`,!0)}static get styles(){let s=Array.isArray(this.css)?this.css:this.css?[this.css]:[];return[Gl,...s]}connectedCallback(){super.connectedCallback(),this.didSSR||this.shadowRoot?.prepend(document.createComment(` Web Awesome: https://webawesome.com/docs/components/${this.localName.replace("wa-","")} `)),this.didSSR&&this.updateComplete.then(()=>{this.shadowRoot?.prepend(document.createComment(` Web Awesome: https://webawesome.com/docs/components/${this.localName.replace("wa-","")} `))})}attributeChangedCallback(s,t,e){or(this,vi)||(this.constructor.elementProperties.forEach((i,n)=>{i.reflect&&this[n]!=null&&this.initialReflectedProperties.set(n,this[n])}),ar(this,vi,!0)),super.attributeChangedCallback(s,t,e)}willUpdate(s){super.willUpdate(s),this.initialReflectedProperties.forEach((t,e)=>{s.has(e)&&this[e]==null&&(this[e]=t)})}firstUpdated(s){super.firstUpdated(s),this.didSSR&&this.shadowRoot?.querySelectorAll("slot").forEach(t=>{t.dispatchEvent(new Event("slotchange",{bubbles:!0,composed:!1,cancelable:!1}))})}update(s){try{super.update(s)}catch(t){if(this.didSSR&&!this.hasUpdated){let e=new Event("lit-hydration-error",{bubbles:!0,composed:!0,cancelable:!1});e.error=t,this.dispatchEvent(e)}throw t}}setStyle(s,t){if(!this.style){let e=lr({property:Jl(s),value:t,element:this});e&&this.setAttribute("style",e);return}this.style[s]=t}setStyleProperty(s,t){if(!this.style){let e=lr({property:s,value:t,element:this});e&&this.setAttribute("style",e);return}this.style.setProperty(s,t)}relayNativeEvent(s,t){s.stopImmediatePropagation(),this.dispatchEvent(new s.constructor(s.type,{...s,...t}))}};vi=new WeakMap;p([y()],U.prototype,"dir",2);p([y()],U.prototype,"lang",2);p([y({type:Boolean,reflect:!0,attribute:"did-ssr"})],U.prototype,"didSSR",2);var Rt=class extends U{constructor(){super(...arguments),this.variant="brand",this.size="m"}handleSizeChange(){Pt(this.localName,this.size)}render(){return N`
      <div part="icon">
        <slot name="icon"></slot>
      </div>

      <div part="message">
        <slot></slot>
      </div>
    `}};Rt.css=[tr,le,pt];p([y({reflect:!0})],Rt.prototype,"variant",2);p([y({reflect:!0})],Rt.prototype,"appearance",2);p([y({reflect:!0})],Rt.prototype,"size",2);p([Q("size")],Rt.prototype,"handleSizeChange",1);Rt=p([H("wa-callout")],Rt);var hr=()=>({checkValidity(s){let t=s.input,e={message:"",isValid:!0,invalidKeys:[]};if(!t)return e;let i=!0;if("checkValidity"in t&&(i=t.checkValidity()),i)return e;if(e.isValid=!1,"validationMessage"in t&&(e.message=t.validationMessage),!("validity"in t))return e.invalidKeys.push("customError"),e;for(let n in t.validity){if(n==="valid")continue;let o=n;t.validity[o]&&e.invalidKeys.push(o)}return e}});var bi=class extends Event{constructor(){super("wa-invalid",{bubbles:!0,cancelable:!1,composed:!0})}};var Zl=()=>({observedAttributes:["custom-error"],checkValidity(s){let t={message:"",isValid:!0,invalidKeys:[]};return s.customError&&(t.message=s.customError,t.isValid=!1,t.invalidKeys=["customError"]),t}}),ot=class extends U{constructor(){super(),this.name=null,this.disabled=!1,this.required=!1,this.assumeInteractionOn=["input"],this.validators=[],this.valueHasChanged=!1,this.hasInteracted=!1,this.customError=null,this.emittedEvents=[],this.emitInvalid=s=>{s.target===this&&(this.hasInteracted=!0,this.dispatchEvent(new bi))},this.handleInteraction=s=>{let t=this.emittedEvents;t.includes(s.type)||t.push(s.type),t.length===this.assumeInteractionOn?.length&&(this.hasInteracted=!0)},"addEventListener"in this&&this.addEventListener("invalid",this.emitInvalid)}static get validators(){return[Zl()]}static get observedAttributes(){let s=new Set(super.observedAttributes||[]);for(let t of this.validators)if(t.observedAttributes)for(let e of t.observedAttributes)s.add(e);return[...s]}connectedCallback(){super.connectedCallback(),this.didSSR&&!this.hasUpdated?this.updateComplete.then(()=>{this.updateValidity()}):this.updateValidity(),this.assumeInteractionOn.forEach(s=>{this.addEventListener?.(s,this.handleInteraction)})}firstUpdated(...s){super.firstUpdated(...s),this.updateValidity()}willUpdate(s){if(!!1&&s.has("customError")&&(this.customError||(this.customError=null),this.setCustomValidity(this.customError||"")),s.has("value")||s.has("disabled")||s.has("defaultValue")){let t=this.value;this.updateFormValue(t)}s.has("disabled")&&(this.customStates.set("disabled",this.disabled),(this.hasAttribute("disabled")||!!1&&!this.matches(":disabled"))&&this.toggleAttribute("disabled",this.disabled)),super.willUpdate(s),this.didSSR&&!this.hasUpdated?this.updateComplete.then(()=>this.updateValidity()):this.updateValidity()}updateFormValue(s){if(Array.isArray(s)){if(this.name){let t=new FormData;for(let e of s)t.append(this.name,e);this.setValue(t,t)}}else this.setValue(s,s)}get labels(){return this.internals.labels}getForm(){return this.internals.form}set form(s){s?this.setAttribute("form",s):this.removeAttribute("form")}get form(){return this.internals.form}get validity(){return this.internals.validity}get willValidate(){return this.internals.willValidate}get validationMessage(){return this.internals.validationMessage}checkValidity(){return this.updateValidity(),this.internals.checkValidity()}reportValidity(){return this.updateValidity(),this.hasInteracted=!0,this.internals.reportValidity()}get validationTarget(){return this.input||void 0}setValidity(...s){let t=s[0],e=s[1],i=s[2];i||(i=this.validationTarget),this.internals.setValidity(t,e,i||void 0),this.requestUpdate("validity"),this.setCustomStates()}setCustomStates(){let s=!!this.required,t=this.internals.validity.valid,e=this.hasInteracted;this.customStates.set("required",s),this.customStates.set("optional",!s),this.customStates.set("invalid",!t),this.customStates.set("valid",t),this.customStates.set("user-invalid",!t&&e),this.customStates.set("user-valid",t&&e)}setCustomValidity(s){if(!s){this.customError=null,this.setValidity({});return}this.customError=s,this.setValidity({customError:!0},s,this.validationTarget)}formResetCallback(){this.resetValidity(),this.hasInteracted=!1,this.valueHasChanged=!1,this.emittedEvents=[],this.updateValidity()}formDisabledCallback(s){this.disabled=s,this.updateValidity()}formStateRestoreCallback(s,t){this.didSSR&&!this.hasUpdated?this.updateComplete.then(()=>{this.value=s,t==="restore"&&this.resetValidity(),this.updateValidity()}):(this.value=s,t==="restore"&&this.resetValidity(),this.updateValidity())}setValue(...s){let[t,e]=s;this.internals.setFormValue(t,e)}get allValidators(){let s=this.constructor.validators||[],t=this.validators||[];return[...s,...t]}resetValidity(){this.setCustomValidity(""),this.setValidity({})}updateValidity(){if(this.disabled||this.hasAttribute("disabled")||!this.willValidate){this.resetValidity();return}let s=this.allValidators;if(!s?.length)return;let t={customError:!!this.customError},e=this.validationTarget||this.input||void 0,i="";for(let n of s){let{isValid:o,message:r,invalidKeys:a}=n.checkValidity(this);o||(i||(i=r),a?.length>=0&&a.forEach(l=>t[l]=!0))}i||(i=this.validationMessage),this.setValidity(t,i,e)}};ot.formAssociated=!0;p([y({reflect:!0})],ot.prototype,"name",2);p([y({type:Boolean})],ot.prototype,"disabled",2);p([y({state:!0,attribute:!1})],ot.prototype,"valueHasChanged",2);p([y({state:!0,attribute:!1})],ot.prototype,"hasInteracted",2);p([y({attribute:"custom-error",reflect:!0})],ot.prototype,"customError",2);p([y({attribute:!1,state:!0,type:Object})],ot.prototype,"validity",1);var he=class{constructor(s,...t){this.slotNames=[],this.handleSlotChange=e=>{let i=e.target;(this.slotNames.includes("[default]")&&!i.name||i.name&&this.slotNames.includes(i.name))&&this.host.requestUpdate()},(this.host=s).addController(this),this.slotNames=t}hasDefaultSlot(){return this.host.childNodes?[...this.host.childNodes].some(s=>{if(s.nodeType===Node.TEXT_NODE&&s.textContent.trim()!=="")return!0;if(s.nodeType===Node.ELEMENT_NODE){let t=s;if(t.tagName.toLowerCase()==="wa-visually-hidden")return!1;if(!t.hasAttribute("slot"))return!0}return!1}):!1}hasNamedSlot(s){return this.host.querySelector?.(`:scope > [slot="${s}"]`)!==null}test(s,t){return t&&this.host.didSSR&&!this.host.hasUpdated?!!this.host[t]:s==="[default]"?this.hasDefaultSlot():this.hasNamedSlot(s)}hostConnected(){let s=this.host.shadowRoot;s&&"addEventListener"in s&&s.addEventListener("slotchange",this.handleSlotChange)}hostDisconnected(){let s=this.host.shadowRoot;s&&"removeEventListener"in s&&s.removeEventListener("slotchange",this.handleSlotChange)}};var cr=F`
  @layer wa-component {
    :host {
      display: inline-block;

      /* Workaround because Chrome doesn't like :host(:has()) below
       * https://issues.chromium.org/issues/40062355
       * Firefox doesn't like this nested rule, so both are needed */
      &:has(wa-badge) {
        position: relative;
      }
    }

    /* Apply relative positioning only when needed to position wa-badge
     * This avoids creating a new stacking context for every button */
    :host(:has(wa-badge)) {
      position: relative;
    }
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    white-space: nowrap;
    vertical-align: middle;
    transition-property: background, border, box-shadow, color, opacity, transform;
    transition-duration: var(--wa-transition-fast);
    transition-timing-function: var(--wa-transition-easing);
    transform-origin: center;
    cursor: pointer;
    padding: 0 var(--wa-form-control-padding-inline);
    font-family: inherit;
    font-size: inherit;
    font-weight: var(--wa-font-weight-action);
    height: var(--wa-form-control-height);
    width: 100%;

    background-color: var(--wa-color-fill-loud, var(--wa-color-neutral-fill-loud));

    border-color: transparent;
    color: var(--wa-color-on-loud, var(--wa-color-neutral-on-loud));
    border-start-start-radius: var(--_button-start-start-radius, var(--wa-form-control-border-radius));
    border-start-end-radius: var(--_button-start-end-radius, var(--wa-form-control-border-radius));
    border-end-start-radius: var(--_button-end-start-radius, var(--wa-form-control-border-radius));
    border-end-end-radius: var(--_button-end-end-radius, var(--wa-form-control-border-radius));
    border-style: var(--wa-form-control-border-style);
    border-width: var(--wa-form-control-border-width);
  }

  /* Hover and active transforms */
  .button:not(.disabled):not(.loading) {
    @media (hover: hover) {
      &:hover {
        transform: var(--wa-button-transform-hover);
      }
    }
    &:active {
      transform: var(--wa-button-transform-active);
    }

    @media (prefers-reduced-motion: reduce) {
      &:hover,
      &:active {
        transform: none;
      }
    }
  }

  /* Appearance modifiers */
  :host([appearance='plain']) {
    /* Indentation overrides for grouping */
    margin-inline-start: var(--_button-horizontal-indent);
    margin-block-start: var(--_button-vertical-indent);

    .button {
      color: var(--wa-color-on-quiet, var(--wa-color-neutral-on-quiet));
      background-color: transparent;
      border-color: transparent;
    }
    @media (hover: hover) {
      .button:not(.disabled):not(.loading):hover {
        color: var(--wa-color-on-quiet, var(--wa-color-neutral-on-quiet));
        background-color: var(--wa-color-fill-quiet, var(--wa-color-neutral-fill-quiet));
      }
    }
    .button:not(.disabled):not(.loading):active {
      color: var(--wa-color-on-quiet, var(--wa-color-neutral-on-quiet));
      background-color: color-mix(
        in oklab,
        var(--wa-color-fill-quiet, var(--wa-color-neutral-fill-quiet)),
        var(--wa-color-mix-active)
      );
    }
  }

  :host([appearance='outlined']) {
    /* Indentation overrides for grouping outlined */
    margin-inline-start: var(--_button-horizontal-indent-outlined);
    margin-block-start: var(--_button-vertical-indent-outlined);

    .button {
      color: var(--wa-color-on-quiet, var(--wa-color-neutral-on-quiet));
      background-color: transparent;
      border-color: var(--wa-color-border-loud, var(--wa-color-neutral-border-loud));
    }
    @media (hover: hover) {
      .button:not(.disabled):not(.loading):hover {
        color: var(--wa-color-on-quiet, var(--wa-color-neutral-on-quiet));
        background-color: var(--wa-color-fill-quiet, var(--wa-color-neutral-fill-quiet));
      }
    }
    .button:not(.disabled):not(.loading):active {
      color: var(--wa-color-on-quiet, var(--wa-color-neutral-on-quiet));
      background-color: color-mix(
        in oklab,
        var(--wa-color-fill-quiet, var(--wa-color-neutral-fill-quiet)),
        var(--wa-color-mix-active)
      );
    }
  }

  :host([appearance='filled']) {
    /* Indentation overrides for grouping */
    margin-inline-start: var(--_button-horizontal-indent);
    margin-block-start: var(--_button-vertical-indent);

    .button {
      color: var(--wa-color-on-normal, var(--wa-color-neutral-on-normal));
      background-color: var(--wa-color-fill-normal, var(--wa-color-neutral-fill-normal));
      border-color: transparent;
    }
    @media (hover: hover) {
      .button:not(.disabled):not(.loading):hover {
        color: var(--wa-color-on-normal, var(--wa-color-neutral-on-normal));
        background-color: color-mix(
          in oklab,
          var(--wa-color-fill-normal, var(--wa-color-neutral-fill-normal)),
          var(--wa-color-mix-hover)
        );
      }
    }
    .button:not(.disabled):not(.loading):active {
      color: var(--wa-color-on-normal, var(--wa-color-neutral-on-normal));
      background-color: color-mix(
        in oklab,
        var(--wa-color-fill-normal, var(--wa-color-neutral-fill-normal)),
        var(--wa-color-mix-active)
      );
    }
  }

  :host([appearance='filled-outlined']) {
    /* Indentation overrides for grouping outlined */
    margin-inline-start: var(--_button-horizontal-indent-outlined);
    margin-block-start: var(--_button-vertical-indent-outlined);

    .button {
      color: var(--wa-color-on-normal, var(--wa-color-neutral-on-normal));
      background-color: var(--wa-color-fill-normal, var(--wa-color-neutral-fill-normal));
      border-color: var(--wa-color-border-normal, var(--wa-color-neutral-border-normal));
    }
    @media (hover: hover) {
      .button:not(.disabled):not(.loading):hover {
        color: var(--wa-color-on-normal, var(--wa-color-neutral-on-normal));
        background-color: color-mix(
          in oklab,
          var(--wa-color-fill-normal, var(--wa-color-neutral-fill-normal)),
          var(--wa-color-mix-hover)
        );
      }
    }
    .button:not(.disabled):not(.loading):active {
      color: var(--wa-color-on-normal, var(--wa-color-neutral-on-normal));
      background-color: color-mix(
        in oklab,
        var(--wa-color-fill-normal, var(--wa-color-neutral-fill-normal)),
        var(--wa-color-mix-active)
      );
    }
  }

  :host([appearance='accent']) {
    /* Indentation overrides for grouping */
    margin-inline-start: var(--_button-horizontal-indent);
    margin-block-start: var(--_button-vertical-indent);

    .button {
      color: var(--wa-color-on-loud, var(--wa-color-neutral-on-loud));
      background-color: var(--wa-color-fill-loud, var(--wa-color-neutral-fill-loud));
      border-color: transparent;
    }
    @media (hover: hover) {
      .button:not(.disabled):not(.loading):hover {
        background-color: color-mix(
          in oklab,
          var(--wa-color-fill-loud, var(--wa-color-neutral-fill-loud)),
          var(--wa-color-mix-hover)
        );
      }
    }
    .button:not(.disabled):not(.loading):active {
      background-color: color-mix(
        in oklab,
        var(--wa-color-fill-loud, var(--wa-color-neutral-fill-loud)),
        var(--wa-color-mix-active)
      );
    }
  }

  /* Focus states */
  .button:focus {
    outline: none;
  }

  .button:focus-visible {
    outline: var(--wa-focus-ring);
    outline-offset: var(--wa-focus-ring-offset);
  }

  /* Disabled state */
  :host([disabled]) {
    opacity: 0.5;
    cursor: not-allowed;

    /* When disabled, prevent mouse events from bubbling up from children */
    .button {
      pointer-events: none;
    }
  }

  /* Keep it last so Safari doesn't stop parsing this block */
  .button::-moz-focus-inner {
    border: 0;
  }

  /* Icon buttons */
  .button.is-icon-button {
    outline-offset: 2px;
    width: var(--wa-form-control-height);
    aspect-ratio: 1;
  }

  /* Icon buttons with a caret need to grow to fit both the icon and the caret */
  .button.is-icon-button.caret {
    width: auto;
    aspect-ratio: auto;
    min-width: var(--wa-form-control-height);
  }

  /* Pill modifier */
  :host([pill]) .button {
    border-start-start-radius: var(--_button-start-start-radius, var(--wa-border-radius-pill));
    border-start-end-radius: var(--_button-start-end-radius, var(--wa-border-radius-pill));
    border-end-start-radius: var(--_button-end-start-radius, var(--wa-border-radius-pill));
    border-end-end-radius: var(--_button-end-end-radius, var(--wa-border-radius-pill));
  }

  /*
   * Label
   */

  .start,
  .end {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .label {
    display: inline-block;
  }

  .is-icon-button .label {
    display: flex;
    justify-content: center;
  }

  .label::slotted(wa-icon) {
    align-self: center;
  }

  /*
   * Caret modifier
   */

  wa-icon[part='caret'] {
    display: flex;
    align-self: center;
    align-items: center;

    &::part(svg) {
      width: 0.875em;
      height: 0.875em;
    }

    .button:has(&) .end {
      display: none;
    }
  }

  /*
   * Loading modifier
   */

  .loading {
    position: relative;
    cursor: wait;

    .start,
    .label,
    .end,
    .caret {
      /* Hidden with opacity, not visibility, so the label stays in the accessibility tree */
      opacity: 0;

      /* Unlike visibility: hidden, opacity leaves the content clickable */
      pointer-events: none;
    }

    wa-spinner {
      --indicator-color: currentColor;
      --track-color: color-mix(in oklab, currentColor, transparent 90%);

      position: absolute;
      font-size: 1em;
      height: 1em;
      width: 1em;
      top: calc(50% - 0.5em);
      left: calc(50% - 0.5em);
    }
  }

  /*
   * Badges
   */

  .button ::slotted(wa-badge) {
    border-color: var(--wa-color-surface-default);
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 0;
    translate: 50% -50%;
    pointer-events: none;
  }

  :host(:dir(rtl)) ::slotted(wa-badge) {
    translate: -50% -50%;
  }

  /*
  * Button spacing
  */

  slot[name='start']::slotted(*) {
    margin-inline-end: 0.75em;
  }

  slot[name='end']::slotted(*),
  .button:not(.visually-hidden-label) [part='caret'] {
    margin-inline-start: 0.75em;
  }
`;var _s=new Set,ce=new Map,Mt,Ls="ltr",Es="en",ur=typeof MutationObserver<"u"&&typeof document<"u"&&typeof document.documentElement<"u";if(ur){let s=new MutationObserver(dr);Ls=document.documentElement.dir||"ltr",Es=document.documentElement.lang||navigator.language,s.observe(document.documentElement,{attributes:!0,attributeFilter:["dir","lang"]})}function Fe(...s){s.map(t=>{let e=t.$code.toLowerCase();ce.has(e)?ce.set(e,Object.assign(Object.assign({},ce.get(e)),t)):ce.set(e,t),Mt||(Mt=t)}),dr()}function dr(){ur&&(Ls=document.documentElement.dir||"ltr",Es=document.documentElement.lang||navigator.language),[..._s.keys()].map(s=>{typeof s.requestUpdate=="function"&&s.requestUpdate()})}var wi=class{constructor(t){this.host=t,this.host.addController(this)}hostConnected(){_s.add(this.host)}hostDisconnected(){_s.delete(this.host)}dir(){return`${this.host.dir||Ls}`.toLowerCase()}lang(){let t=`${this.host.lang||Es}`.toLowerCase().replace(/_/g,"-");try{return new Intl.Locale(t),t}catch{return Mt?Mt.$code.toLowerCase():"en"}}getTranslationData(t){var e,i;let n;try{n=new Intl.Locale(t.replace(/_/g,"-"))}catch{return{locale:void 0,language:"",region:"",primary:void 0,secondary:void 0}}let o=n.language.toLowerCase(),r=(i=(e=n.region)===null||e===void 0?void 0:e.toLowerCase())!==null&&i!==void 0?i:"",a=ce.get(`${o}-${r}`),l=ce.get(o);return{locale:n,language:o,region:r,primary:a,secondary:l}}exists(t,e){var i;let{primary:n,secondary:o}=this.getTranslationData((i=e.lang)!==null&&i!==void 0?i:this.lang());return e=Object.assign({includeFallback:!1},e),!!(n&&n[t]||o&&o[t]||e.includeFallback&&Mt&&Mt[t])}term(t,...e){let{primary:i,secondary:n}=this.getTranslationData(this.lang()),o;if(i&&i[t])o=i[t];else if(n&&n[t])o=n[t];else if(Mt&&Mt[t])o=Mt[t];else return console.error(`No translation found for: ${String(t)}`),String(t);return typeof o=="function"?o(...e):o}date(t,e){return t=new Date(t),new Intl.DateTimeFormat(this.lang(),e).format(t)}number(t,e){return t=Number(t),isNaN(t)?"":new Intl.NumberFormat(this.lang(),e).format(t)}relativeTime(t,e,i){return new Intl.RelativeTimeFormat(this.lang(),i).format(t,e)}};var mr={$code:"en",$name:"English",$dir:"ltr",allTagsRemoved:"All tags removed",am:"AM",autosizeColumn:"Autosize column",captions:"Captions",carousel:"Carousel",chooseDate:"Choose date",chooseDecade:"Choose decade",chooseMonth:"Choose month",chooseTime:"Choose time",chooseYear:"Choose year",clearEntry:"Clear entry",clearFilter:"Clear filter",clearSort:"Clear sort",close:"Close",closeCalendar:"Close calendar",closeTimeInput:"Close time picker",collapseRow:"Collapse row",columnMenu:"Column options",columnMovedToPosition:(s,t,e)=>`${s} moved to position ${t} of ${e}`,columns:"Columns",compactPageXOfY:(s,t)=>`${s} of ${t}`,completed:"Completed",copied:"Copied",copy:"Copy",createOption:s=>`Create "${s}"`,currentlyPlaying:"currently playing",currentValue:"Current value",date:"Date",datePickerKeyboardHelp:"Use arrow keys to change values; press Alt+Down Arrow to open the calendar.",day:"Day",dayPeriod:"AM/PM",decrement:"Decrement",deselectAllRows:"Deselect all rows",disabled:"Disabled",dropFileHere:"Drop file here or click to browse",dropFilesHere:"Drop files here or click to browse",empty:"Empty",endDate:"End date",enterFullscreen:"Enter fullscreen",error:"Error",exitFullscreen:"Exit fullscreen",expandRow:"Expand row",filterByColumn:s=>`Filter by ${s}`,filterFrom:"From",filterMax:"Max",filterMin:"Min",filterTo:"To",firstPage:"First page",goToSlide:(s,t)=>`Go to slide ${s} of ${t}`,hideColumn:"Hide column",hidePassword:"Hide password",hour:"Hour",incompleteDate:"Enter a valid date.",increment:"Increment",jumpBackwardX:s=>`Jump back ${s} pages`,jumpForwardX:s=>`Jump forward ${s} pages`,lastPage:"Last page",loading:"Loading",locked:"Locked",minute:"Minute",month:"Month",moreOptions:"More Options",mute:"Mute",nextDecade:"Next decade",nextMonth:"Next month",nextPage:"Next page",nextSlide:"Next slide",nextVideo:"Next Video",nextYear:"Next year",noData:"No data",noOptions:"No options",noResults:"No matching results",notCompleted:"Not completed",now:"Now",numCharacters:s=>s===1?"1 character":`${s} characters`,numCharactersRemaining:s=>s===1?"1 character remaining":`${s} characters remaining`,numOptionsAvailable:s=>s===0?"No options available":s===1?"1 option available":`${s} options available`,numOptionsSelected:s=>s===0?"No options selected":s===1?"1 option selected":`${s} options selected`,numRowsCopied:s=>s===1?"1 row copied":`${s} rows copied`,numRowsSelected:s=>s===1?"1 row selected":`${s} rows selected`,optionPosition:(s,t,e)=>`${s}, ${t} of ${e}`,optionsLoadError:"Options could not be loaded",pageXOfY:(s,t)=>`Page ${s} of ${t}`,pagination:"Pagination",pause:"Pause",pauseAnimation:"Pause animation",pictureInPicture:"Picture in picture",pinLeft:"Pin left",pinRight:"Pin right",play:"Play",playAnimation:"Play animation",playbackSpeed:"Playback speed",playlist:"Playlist",pm:"PM",previousDecade:"Previous decade",previousMonth:"Previous month",previousPage:"Previous page",previousSlide:"Previous slide",previousVideo:"Previous video",previousYear:"Previous year",progress:"Progress",rangeTooLong:s=>s===1?"Select a range no longer than 1 day":`Select a range no longer than ${s} days`,rangeTooShort:s=>s===1?"Select a range at least 1 day long":`Select a range at least ${s} days long`,readonly:"Read-only",remove:"Remove",resetColumns:"Reset columns",resize:"Resize",resizeColumn:"Resize column",rowsPerPage:"Rows per page",scrollableRegion:"Scrollable region",scrollToEnd:"Scroll to end",scrollToStart:"Scroll to start",search:"Search",second:"Second",seek:"Seek",seekProgress:(s,t)=>`${s} of ${t}`,selectAColorFromTheScreen:"Select a color from the screen",selectAllRows:"Select all rows",selected:"Selected",selectedDateLabel:s=>`Selected: ${s}`,selectedRangeLabel:s=>`Selected range: ${s}`,selectGroup:"Select group",selectionCleared:"Selection cleared",selectRow:"Select row",showingNofMRows:(s,t)=>`Showing ${s} of ${t} rows`,showingXtoYofZ:(s,t,e)=>`${s}\u2013${t} of ${e}`,showPassword:"Show password",slideNum:s=>`Slide ${s}`,sortAscending:"Sort ascending",sortColumn:"Sort column",sortDescending:"Sort descending",startDate:"Start date",steps:"Steps",stepXOfY:(s,t)=>`Step ${s} of ${t}`,tagAdded:s=>`${s} added`,tagAlreadyAdded:s=>`${s} is already added`,tagInputKeyboardHelp:"Press Backspace or Delete to remove this tag.",tagRemoved:s=>`${s} removed`,time:"Time",timeInputKeyboardHelp:"Use arrow keys to change values; press Alt+Down Arrow to open the time picker.",today:"Today",toggleColorFormat:"Toggle color format",tooFewTags:s=>s===1?"Add at least 1 tag":`Add at least ${s} tags`,tooManyTags:s=>s===1?"Add no more than 1 tag":`Add no more than ${s} tags`,unmute:"Unmute",unpin:"Unpin",unpinColumn:"Unpin column",videoPlayer:"Video player",volume:"Volume",year:"Year",zoomIn:"Zoom in",zoomOut:"Zoom out"};Fe(mr);var fr=mr;var rt=class extends wi{lang(){return this.host.didSSR&&!this.host.hasUpdated?this.host.lang||"en":super.lang()}};Fe(fr);var yi={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},xi=s=>(...t)=>({_$litDirective$:s,values:t}),ue=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};var et=xi(class extends ue{constructor(s){if(super(s),s.type!==yi.ATTRIBUTE||s.name!=="class"||s.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(s){return" "+Object.keys(s).filter(t=>s[t]).join(" ")+" "}update(s,[t]){if(this.st===void 0){this.st=new Set,s.strings!==void 0&&(this.nt=new Set(s.strings.join(" ").split(/\s/).filter(i=>i!=="")));for(let i in t)t[i]&&!this.nt?.has(i)&&this.st.add(i);return this.render(t)}let e=s.element.classList;for(let i of this.st)i in t||(e.remove(i),this.st.delete(i));for(let i in t){let n=!!t[i];n===this.st.has(i)||this.nt?.has(i)||(n?(e.add(i),this.st.add(i)):(e.remove(i),this.st.delete(i)))}return lt}});var ct=s=>s??I;var gr=Symbol.for(""),th=s=>{if(s?.r===gr)return s?._$litStatic$};var ks=(s,...t)=>({_$litStatic$:t.reduce((e,i,n)=>e+(o=>{if(o._$litStatic$!==void 0)return o._$litStatic$;throw Error(`Value passed to 'literal' function must be a 'literal' result: ${o}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`)})(i)+s[n+1],s[0]),r:gr}),pr=new Map,zs=s=>(t,...e)=>{let i=e.length,n,o,r=[],a=[],l,h=0,c=!1;for(;h<i;){for(l=t[h];h<i&&(o=e[h],(n=th(o))!==void 0);)l+=n+t[++h],c=!0;h!==i&&a.push(o),r.push(l),h++}if(h===i&&r.push(t[i]),c){let u=r.join("$$lit$$");(t=pr.get(u))===void 0&&(r.raw=r,pr.set(u,t=r)),e=a}return s(t,...e)},Ci=zs(N),nm=zs(Yo),om=zs(Qo);var T=class extends ot{constructor(){super(...arguments),this.assumeInteractionOn=["click"],this.hasSlotController=new he(this,"[default]","start","end"),this.localize=new rt(this),this.invalid=!1,this.isIconButton=!1,this.title="",this.variant="neutral",this.appearance="accent",this.size="m",this.withCaret=!1,this.withStart=!1,this.withEnd=!1,this.disabled=!1,this.loading=!1,this.pill=!1,this.type="button"}static get validators(){return[...super.validators,hr()]}handleSizeChange(){Pt(this.localName,this.size)}constructLightDOMButton(){let s=document.createElement("button");for(let t of this.attributes)t.name!=="style"&&s.setAttribute(t.name,t.value);return s.type=this.type,s.style.position="absolute !important",s.style.width="0 !important",s.style.height="0 !important",s.style.clipPath="inset(50%) !important",s.style.overflow="hidden !important",s.style.whiteSpace="nowrap !important",this.name&&(s.name=this.name),s.value=this.value||"",s}handleClick(s){if(this.disabled||this.loading){s.preventDefault(),s.stopImmediatePropagation();return}if(this.type!=="submit"&&this.type!=="reset"||!this.getForm())return;let e=this.constructLightDOMButton();this.parentElement?.append(e),e.click(),e.remove()}handleInvalid(){this.dispatchEvent(new bi)}handleLabelSlotChange(){let s=this.labelSlot.assignedNodes({flatten:!0}),t=!1,e=!1,i=!1,n=!1;[...s].forEach(o=>{if(o.nodeType===Node.ELEMENT_NODE){let r=o;r.localName==="wa-icon"?(e=!0,t||(t=r.label!==void 0)):n=!0}else o.nodeType===Node.TEXT_NODE&&(o.textContent?.trim()||"").length>0&&(i=!0)}),this.isIconButton=e&&!i&&!n,this.customStates.set("icon-button",this.isIconButton),this.isIconButton&&!t&&console.warn('Icon buttons must have a label for screen readers. Add <wa-icon label="..."> to remove this warning.',this)}isButton(){return!this.href}isLink(){return!!this.href}handleDisabledChange(){this.customStates.set("disabled",this.disabled),this.updateValidity()}handleHrefChange(){this.customStates.set("link",this.isLink())}handleLoadingChange(){this.customStates.set("loading",this.loading)}setValue(...s){}click(){this.button.click()}focus(s){this.button.focus(s)}blur(){this.button.blur()}render(){let s=this.isLink(),t=s?ks`a`:ks`button`;return Ci`
      <${t}
        part="base button"
        class=${et({button:!0,caret:this.withCaret,disabled:this.disabled,loading:this.loading,rtl:this.localize.dir()==="rtl","has-label":this.hasSlotController.test("[default]"),"has-start":this.hasSlotController.test("start","withStart"),"has-end":this.hasSlotController.test("end","withEnd"),"is-icon-button":this.isIconButton})}
        ?disabled=${ct(s?void 0:this.disabled)}
        type=${ct(s?void 0:this.type)}
        title=${this.title}
        name=${ct(s?void 0:this.name)}
        value=${ct(s?void 0:this.value)}
        href=${ct(s?this.href:void 0)}
        target=${ct(s?this.target:void 0)}
        download=${ct(s?this.download:void 0)}
        rel=${ct(s&&this.rel?this.rel:void 0)}
        role=${ct(s?void 0:"button")}
        aria-disabled=${ct(s&&this.disabled?"true":void 0)}
        aria-busy=${this.loading?"true":"false"}
        tabindex=${this.disabled?"-1":"0"}
        @invalid=${this.isButton()?this.handleInvalid:null}
        @click=${this.handleClick}
      >
        <slot name="start" part="start" class="start"></slot>
        <slot part="label" class="label" @slotchange=${this.handleLabelSlotChange}></slot>
        <slot name="end" part="end" class="end"></slot>
        ${this.withCaret?Ci`
                <wa-icon part="caret" class="caret" library="system" name="chevron-down" variant="solid"></wa-icon>
              `:""}
        ${this.loading?Ci`<wa-spinner part="spinner"></wa-spinner>`:""}
      </${t}>
    `}};T.shadowRootOptions={...ot.shadowRootOptions,delegatesFocus:!0};T.css=[cr,le,pt];p([Z(".button")],T.prototype,"button",2);p([Z("slot:not([name])")],T.prototype,"labelSlot",2);p([ht()],T.prototype,"invalid",2);p([ht()],T.prototype,"isIconButton",2);p([y()],T.prototype,"title",2);p([y({reflect:!0})],T.prototype,"variant",2);p([y({reflect:!0})],T.prototype,"appearance",2);p([y({reflect:!0})],T.prototype,"size",2);p([Q("size")],T.prototype,"handleSizeChange",1);p([y({attribute:"with-caret",type:Boolean,reflect:!0})],T.prototype,"withCaret",2);p([y({attribute:"with-start",type:Boolean})],T.prototype,"withStart",2);p([y({attribute:"with-end",type:Boolean})],T.prototype,"withEnd",2);p([y({type:Boolean})],T.prototype,"disabled",2);p([y({type:Boolean,reflect:!0})],T.prototype,"loading",2);p([y({type:Boolean,reflect:!0})],T.prototype,"pill",2);p([y()],T.prototype,"type",2);p([y({reflect:!0})],T.prototype,"name",2);p([y({reflect:!0})],T.prototype,"value",2);p([y({reflect:!0})],T.prototype,"href",2);p([y()],T.prototype,"target",2);p([y()],T.prototype,"rel",2);p([y()],T.prototype,"download",2);p([y({attribute:"formaction"})],T.prototype,"formAction",2);p([y({attribute:"formenctype"})],T.prototype,"formEnctype",2);p([y({attribute:"formmethod"})],T.prototype,"formMethod",2);p([y({attribute:"formnovalidate",type:Boolean})],T.prototype,"formNoValidate",2);p([y({attribute:"formtarget"})],T.prototype,"formTarget",2);p([Q("disabled",{waitUntilFirstUpdate:!0})],T.prototype,"handleDisabledChange",1);p([Q("href")],T.prototype,"handleHrefChange",1);p([Q("loading",{waitUntilFirstUpdate:!0})],T.prototype,"handleLoadingChange",1);T=p([H("wa-button")],T);T.disableWarning?.("change-in-update");var vr=F`
  :host {
    --track-width: 2px;
    --track-color: var(--wa-color-neutral-fill-normal);
    --indicator-color: var(--wa-color-brand-fill-loud);
    --speed: 2s;
    --size: 1em;

    /*
      Resizing a spinner element using anything but font-size will break the animation because the animation uses em
      units. Therefore, if a spinner is used in a flex container without \`flex: none\` applied, the spinner can
      grow/shrink and break the animation. The use of \`flex: none\` on the host element prevents this by always having
      the spinner sized according to its actual dimensions.
    */
    flex: none;
    display: inline-flex;
    width: var(--size);
    height: var(--size);
  }

  svg {
    width: 100%;
    height: 100%;
    aspect-ratio: 1;
    animation: spin var(--speed) linear infinite;
  }

  .track,
  .indicator {
    --radius: calc(var(--size) / 2 - var(--track-width) / 2);
    --circumference: calc(var(--radius) * 2 * 3.141592654);

    cx: calc(var(--size) / 2);
    cy: calc(var(--size) / 2);
    r: var(--radius);
    fill: none;
    stroke-width: var(--track-width);
  }

  .track {
    stroke: var(--track-color);
  }

  .indicator {
    stroke: var(--indicator-color);
    stroke-linecap: round;
    stroke-dasharray: calc(0.597 * var(--circumference)), calc(0.796 * var(--circumference));
    stroke-dashoffset: calc(-0.04 * var(--circumference));
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: calc(0.008 * var(--circumference)), calc(1.194 * var(--circumference));
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: calc(0.716 * var(--circumference)), calc(1.194 * var(--circumference));
      stroke-dashoffset: calc(-0.278 * var(--circumference));
    }
    100% {
      stroke-dasharray: calc(0.716 * var(--circumference)), calc(1.194 * var(--circumference));
      stroke-dashoffset: calc(-0.987 * var(--circumference));
    }
  }
`;var Ts=class extends U{constructor(){super(...arguments),this.localize=new rt(this)}render(){return N`
      <svg
        part="base spinner"
        role="progressbar"
        aria-label=${this.localize.term("loading")}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle class="track" />
        <circle class="indicator" />
      </svg>
    `}};Ts.css=vr;Ts=p([H("wa-spinner")],Ts);var br=class extends Event{constructor(){super("wa-error",{bubbles:!0,cancelable:!1,composed:!0})}};var wr=class extends Event{constructor(){super("wa-load",{bubbles:!0,cancelable:!1,composed:!0})}};var yr=F`
  :host {
    --primary-color: currentColor;
    --primary-opacity: 1;
    --secondary-color: currentColor;
    --secondary-opacity: 0.4;
    --rotate-angle: 0deg;

    box-sizing: content-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: -0.125em;
  }

  /* #region Canvas — the box the icon is centered within (mirrors Font Awesome's icon canvas). Orthogonal to font-size. */

  /* Fixed width (default): 1.25em × 1em (20 × 16px) */
  :host(:not([canvas])),
  :host([canvas='fixed']) {
    width: 1.25em;
    height: 1em;
    min-width: 1.25em; /* <-- this is what Safari respects for intrinsic */
    min-height: 1em;
  }

  /* Auto: hug the icon's width. \`auto-width\` is the deprecated alias for canvas="auto". */
  :host([canvas='auto']),
  :host([auto-width]:not([canvas])) {
    width: auto;
    height: 1em;
  }

  /* Square: 1.25em × 1.25em (20 × 20px) */
  :host([canvas='square']) {
    width: 1.25em;
    height: 1.25em;
    min-width: 1.25em;
    min-height: 1.25em;
  }

  /* Roomy: 1.5em × 1.5em (24 × 24px) */
  :host([canvas='roomy']) {
    width: 1.5em;
    height: 1.5em;
    min-width: 1.5em;
    min-height: 1.5em;
  }

  /* #endregion */

  svg {
    /* NOTE: Avoid setting fill here. A stylesheet rule beats SVG presentation attributes, breaking stroke-based
       libraries like Lucide (fill="none" stroke="currentColor") and attribute-based mutators (issue #1733). The default
       library applies fill="currentColor" in its mutator instead. */
    height: 1em;
    overflow: visible;
    width: auto;

    /* Duotone colors with path-specific opacity fallback */
    path[data-duotone-primary] {
      color: var(--primary-color);
      opacity: var(--path-opacity, var(--primary-opacity));
    }

    path[data-duotone-secondary] {
      color: var(--secondary-color);
      opacity: var(--path-opacity, var(--secondary-opacity));
    }
  }

  /* Rotation */
  :host([rotate]) {
    transform: rotate(var(--rotate-angle, 0deg));
  }

  /* Flipping */
  :host([flip='x']) {
    transform: scaleX(-1);
  }
  :host([flip='y']) {
    transform: scaleY(-1);
  }
  :host([flip='both']) {
    transform: scale(-1, -1);
  }

  /* Rotation and Flipping combined */
  :host([rotate][flip='x']) {
    transform: rotate(var(--rotate-angle, 0deg)) scaleX(-1);
  }
  :host([rotate][flip='y']) {
    transform: rotate(var(--rotate-angle, 0deg)) scaleY(-1);
  }
  :host([rotate][flip='both']) {
    transform: rotate(var(--rotate-angle, 0deg)) scale(-1, -1);
  }

  /* #region Animations — ported from Font Awesome 7.3 (--fa-* props mapped to wa-icon's --* names) */

  :host([animation='beat']) {
    animation-name: beat;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 1s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-in-out);
  }

  :host([animation='bounce']) {
    animation-name: bounce;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 1s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
  }

  :host([animation='fade']) {
    animation-name: fade;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 1s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-in-out);
  }

  :host([animation='beat-fade']) {
    animation-name: beat-fade;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 1s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-in-out);
  }

  :host([animation='flip']) {
    animation-name: flip;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 1.5s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-in-out);
  }

  :host([animation='flip-360']) {
    animation-name: flip-360;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 1s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-in-out);
  }

  :host([animation='shake']) {
    animation-name: shake;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 0.75s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-in-out);
  }

  :host([animation='spin']) {
    animation-name: spin;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 2s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, linear);
  }

  :host([animation='spin-pulse']) {
    animation-name: spin;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 1s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, steps(8));
  }

  /* spin-reverse is FA's reverse modifier expressed as a standalone value; reverse any spin via --animation-direction: reverse */
  :host([animation='spin-reverse']) {
    animation-name: spin;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, reverse);
    animation-duration: var(--animation-duration, 2s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, linear);
  }

  :host([animation='spin-snap']) {
    animation-name: spin-snap;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 3s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, linear);
  }

  :host([animation='spin-snap-4']) {
    animation-name: spin-snap-4;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 2.4s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, linear);
  }

  :host([animation='spin-snap-8']) {
    animation-name: spin-snap-8;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 4s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, linear);
  }

  :host([animation='buzz']) {
    animation-name: buzz;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 0.6s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, linear);
  }

  :host([animation='wag']) {
    animation-name: wag;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 0.9s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-out);
    transform-origin: bottom center;
  }

  :host([animation='float']) {
    animation-name: float;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 3s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-in-out);
    will-change: transform;
  }

  :host([animation='swing']) {
    animation-name: swing;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 1.2s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-out);
    transform-origin: top center;
  }

  :host([animation='jello']) {
    animation-name: jello;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 0.9s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-out);
  }

  @media (prefers-reduced-motion: reduce) {
    :host([animation='beat']),
    :host([animation='bounce']),
    :host([animation='fade']),
    :host([animation='beat-fade']),
    :host([animation='flip']),
    :host([animation='flip-360']),
    :host([animation='shake']),
    :host([animation='spin']),
    :host([animation='spin-pulse']),
    :host([animation='spin-reverse']),
    :host([animation='spin-snap']),
    :host([animation='spin-snap-4']),
    :host([animation='spin-snap-8']),
    :host([animation='buzz']),
    :host([animation='wag']),
    :host([animation='float']),
    :host([animation='swing']),
    :host([animation='jello']) {
      animation: none !important;
      transition: none !important;
    }
  }

  /* #endregion */

  /* #region Keyframes — ported verbatim from Font Awesome 7.3 */

  @keyframes beat {
    0% {
      transform: scale(1);
    }
    25% {
      transform: scale(calc(1.25 * var(--beat-scale, 1.25)));
    }
    45% {
      transform: scale(calc(1.22 * var(--beat-scale, 1.22)));
    }
    65% {
      transform: scale(calc(1.25 * var(--beat-scale, 1.25)));
    }
    90% {
      transform: scale(1);
    }
  }

  @keyframes bounce {
    0% {
      transform: scale(1, 1) translateY(0);
      /* No fallback by design (ported from FA 7.3): the first segment uses the user's --animation-timing or the CSS
         initial ease, while the explicit cubic-beziers on later stops drive the bounce physics. */
      animation-timing-function: var(--animation-timing);
    }
    14% {
      transform: scale(var(--bounce-start-scale-x, 1.06), var(--bounce-start-scale-y, 0.94))
        translateY(var(--bounce-anticipation, 3px));
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
    }
    32% {
      transform: scale(var(--bounce-jump-scale-x, 0.94), var(--bounce-jump-scale-y, 1.12))
        translateY(calc(-1 * var(--bounce-height, 0.5em)));
      animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
    }
    52% {
      transform: scale(1, 1) translateY(calc(-1 * var(--bounce-height, 0.5em) * 1.1));
      animation-timing-function: cubic-bezier(0.5, 0, 1, 0.5);
    }
    70% {
      transform: scale(var(--bounce-land-scale-x, 1.06), var(--bounce-land-scale-y, 0.92)) translateY(0);
      animation-timing-function: cubic-bezier(0.33, 0.33, 0.66, 1);
    }
    85% {
      transform: scale(0.98, 1.04) translateY(calc(-2px * var(--bounce-rebound, 1)));
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 1);
    }
    100% {
      transform: scale(1, 1) translateY(0);
    }
  }

  @keyframes fade {
    0% {
      opacity: 1;
      transform: scale(1);
      animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
    }
    40% {
      opacity: var(--fade-opacity, 0.4);
      transform: scale(0.98);
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes beat-fade {
    0% {
      opacity: var(--beat-fade-opacity, 0.4);
      transform: scale(1);
      animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
    }
    25% {
      opacity: calc(var(--beat-fade-opacity, 0.4) + 0.4);
      transform: scale(var(--beat-fade-scale, 1.28));
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    45% {
      opacity: 1;
      transform: scale(var(--beat-fade-scale, 1.25));
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    65% {
      opacity: calc(var(--beat-fade-opacity, 0.4) + 0.4);
      transform: scale(var(--beat-fade-scale, 1.28));
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    100% {
      opacity: var(--beat-fade-opacity, 0.4);
      transform: scale(1);
    }
  }

  @keyframes flip {
    0% {
      transform: perspective(2em) scale(1) rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), 0deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
    }
    8% {
      transform: perspective(2em) scale(var(--flip-anticipation-scale, 0.95))
        rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), 0deg);
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
    }
    35% {
      transform: perspective(2em) scale(1)
        rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), calc(var(--flip-angle, -360deg) * 0.6));
      animation-timing-function: linear;
    }
    65% {
      transform: perspective(2em) scale(1)
        rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), calc(var(--flip-angle, -360deg) * 0.5));
      animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
    }
    92% {
      transform: perspective(2em) scale(1)
        rotate3d(
          var(--flip-x, 0),
          var(--flip-y, 1),
          var(--flip-z, 0),
          calc(var(--flip-angle, -360deg) * var(--flip-overshoot, 1.04))
        );
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 1);
    }
    100% {
      transform: perspective(2em) scale(1)
        rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), var(--flip-angle, -360deg));
    }
  }

  @keyframes flip-360 {
    0% {
      transform: perspective(2em) scale(1) rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), 0deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
    }
    8% {
      transform: perspective(2em) scale(var(--flip-anticipation-scale, 0.95))
        rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), 0deg);
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
    }
    50% {
      transform: perspective(2em) scale(1)
        rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), calc(var(--flip-angle, -360deg) * 0.6));
      animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
    }
    80% {
      transform: perspective(2em) scale(1)
        rotate3d(
          var(--flip-x, 0),
          var(--flip-y, 1),
          var(--flip-z, 0),
          calc(var(--flip-angle, -360deg) * var(--flip-overshoot, 1.04))
        );
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 1);
    }
    100% {
      transform: perspective(2em) scale(1)
        rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), var(--flip-angle, -360deg));
    }
  }

  @keyframes shake {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.8, 1);
    }
    8% {
      transform: rotate(35deg) translateX(1px);
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    20% {
      transform: rotate(-22deg) translateX(-1px);
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    35% {
      transform: rotate(15deg) translateX(1px);
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    50% {
      transform: rotate(-9deg);
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    65% {
      transform: rotate(5deg);
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    78% {
      transform: rotate(-3deg);
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    90% {
      transform: rotate(1deg);
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes spin-snap {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    12% {
      transform: rotate(60deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    16.67% {
      transform: rotate(60deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    28.67% {
      transform: rotate(120deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    33.33% {
      transform: rotate(120deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    45.33% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    62% {
      transform: rotate(240deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    66.67% {
      transform: rotate(240deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    78.67% {
      transform: rotate(300deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    83.33% {
      transform: rotate(300deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    95.33% {
      transform: rotate(360deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes spin-snap-4 {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    15% {
      transform: rotate(90deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    25% {
      transform: rotate(90deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    40% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    65% {
      transform: rotate(270deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    75% {
      transform: rotate(270deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    90% {
      transform: rotate(360deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes spin-snap-8 {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    9% {
      transform: rotate(45deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    12.5% {
      transform: rotate(45deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    21.5% {
      transform: rotate(90deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    25% {
      transform: rotate(90deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    34% {
      transform: rotate(135deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    37.5% {
      transform: rotate(135deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    46.5% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    59% {
      transform: rotate(225deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    62.5% {
      transform: rotate(225deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    71.5% {
      transform: rotate(270deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    75% {
      transform: rotate(270deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    84% {
      transform: rotate(315deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    87.5% {
      transform: rotate(315deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    96.5% {
      transform: rotate(360deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes buzz {
    0% {
      transform: translateX(0) rotate(0deg);
      animation-timing-function: cubic-bezier(0.1, 0, 0.9, 1);
    }
    5% {
      transform: translateX(var(--buzz-distance, 4px)) rotate(0.5deg);
    }
    10% {
      transform: translateX(calc(-1 * var(--buzz-distance, 4px))) rotate(-0.5deg);
    }
    15% {
      transform: translateX(var(--buzz-distance, 4px)) rotate(0.3deg);
    }
    20% {
      transform: translateX(calc(-1 * var(--buzz-distance, 4px))) rotate(-0.3deg);
    }
    25% {
      transform: translateX(calc(var(--buzz-distance, 4px) * 0.7)) rotate(0.2deg);
    }
    30% {
      transform: translateX(calc(-1 * var(--buzz-distance, 4px) * 0.7)) rotate(-0.2deg);
    }
    35% {
      transform: translateX(calc(var(--buzz-distance, 4px) * 0.4)) rotate(0.1deg);
    }
    40% {
      transform: translateX(0) rotate(0deg);
    }
    100% {
      transform: translateX(0) rotate(0deg);
    }
  }

  @keyframes wag {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.6, 1);
    }
    12% {
      transform: rotate(var(--wag-angle, 12deg));
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    24% {
      transform: rotate(2deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.6, 1);
    }
    36% {
      transform: rotate(calc(var(--wag-angle, 12deg) * 0.85));
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    48% {
      transform: rotate(1deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.6, 1);
    }
    58% {
      transform: rotate(calc(var(--wag-angle, 12deg) * 0.6));
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    68% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes float {
    0% {
      transform: translateY(0) translateX(0) rotate(0deg)
        scale(var(--float-squash-x, 1.02), var(--float-squash-y, 0.98));
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
    }
    15% {
      transform: translateY(calc(-0.4 * var(--float-height, 6px))) translateX(var(--float-drift, 1px))
        rotate(var(--float-tilt, 1deg)) scale(1, 1);
      animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
    }
    35% {
      transform: translateY(calc(-1 * var(--float-height, 6px))) translateX(0) rotate(0deg)
        scale(var(--float-stretch-x, 0.98), var(--float-stretch-y, 1.03));
      animation-timing-function: cubic-bezier(0.5, 0, 0.5, 0);
    }
    50% {
      transform: translateY(calc(-0.92 * var(--float-height, 6px))) translateX(calc(-0.5 * var(--float-drift, 1px)))
        rotate(calc(-0.5 * var(--float-tilt, 1deg))) scale(0.995, 1.01);
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
    }
    70% {
      transform: translateY(calc(-0.3 * var(--float-height, 6px))) translateX(calc(-1 * var(--float-drift, 1px)))
        rotate(calc(-1 * var(--float-tilt, 1deg))) scale(1, 1);
      animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
    }
    90% {
      transform: translateY(calc(0.05 * var(--float-height, 6px))) translateX(0) rotate(0deg)
        scale(var(--float-squash-x, 1.02), var(--float-squash-y, 0.98));
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 1);
    }
    100% {
      transform: translateY(0) translateX(0) rotate(0deg)
        scale(var(--float-squash-x, 1.02), var(--float-squash-y, 0.98));
    }
  }

  @keyframes swing {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.8, 1);
    }
    8% {
      transform: rotate(var(--swing-angle, 22deg));
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    18% {
      transform: rotate(calc(-1 * var(--swing-angle, 22deg) * 0.85));
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    28% {
      transform: rotate(calc(var(--swing-angle, 22deg) * 0.65));
      animation-timing-function: cubic-bezier(0.35, 0, 0.65, 1);
    }
    38% {
      transform: rotate(calc(-1 * var(--swing-angle, 22deg) * 0.45));
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    48% {
      transform: rotate(calc(var(--swing-angle, 22deg) * 0.25));
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    56% {
      transform: rotate(calc(-1 * var(--swing-angle, 22deg) * 0.1));
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    64% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes jello {
    0% {
      transform: scale(1, 1);
      animation-timing-function: cubic-bezier(0.2, 0, 0.8, 1);
    }
    12% {
      transform: scale(var(--jello-scale-x, 1.15), calc(2 - var(--jello-scale-x, 1.15)));
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    24% {
      transform: scale(calc(2 - var(--jello-scale-y, 1.12)), var(--jello-scale-y, 1.12));
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    36% {
      transform: scale(
        calc(1 + (var(--jello-scale-x, 1.15) - 1) * 0.5),
        calc(2 - (1 + (var(--jello-scale-x, 1.15) - 1) * 0.5))
      );
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    48% {
      transform: scale(
        calc(2 - (1 + (var(--jello-scale-y, 1.12) - 1) * 0.3)),
        calc(1 + (var(--jello-scale-y, 1.12) - 1) * 0.3)
      );
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    58% {
      transform: scale(1.02, 0.98);
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    68% {
      transform: scale(1, 1);
    }
    100% {
      transform: scale(1, 1);
    }
  }

  /* #endregion */
`;var eh="",As="";function xr(){return eh.replace(/\/$/,"")}function ih(s){As=s}function Cr(){if(!As){let s=document.querySelector("[data-fa-kit-code]");s&&ih(s.getAttribute("data-fa-kit-code")||"")}return As}var Sr="7.3.0";function sh(s,t,e){let i="solid";return t==="chisel"&&(i="chisel-regular"),t==="etch"&&(i="etch-solid"),t==="graphite"&&(i="graphite-thin"),t==="jelly"&&(i="jelly-regular",e==="duo-regular"&&(i="jelly-duo-regular"),e==="fill-regular"&&(i="jelly-fill-regular")),t==="jelly-duo"&&(i="jelly-duo-regular"),t==="jelly-fill"&&(i="jelly-fill-regular"),t==="notdog"&&(e==="solid"&&(i="notdog-solid"),e==="duo-solid"&&(i="notdog-duo-solid")),t==="notdog-duo"&&(i="notdog-duo-solid"),t==="slab"&&((e==="solid"||e==="regular")&&(i="slab-regular"),e==="press-regular"&&(i="slab-press-regular")),t==="slab-press"&&(i="slab-press-regular"),t==="slab-duo"&&(i="slab-duo-regular"),t==="slab-press-duo"&&(i="slab-press-duo-regular"),t==="thumbprint"&&(i="thumbprint-light"),t==="utility"&&(i="utility-semibold"),t==="utility-duo"&&(i="utility-duo-semibold"),t==="utility-fill"&&(i="utility-fill-semibold"),t==="whiteboard"&&(i="whiteboard-semibold"),t==="mosaic"&&(i="mosaic-solid"),t==="pixel"&&(i="pixel-regular"),t==="vellum"&&(i="vellum-solid"),t==="classic"&&(e==="thin"&&(i="thin"),e==="light"&&(i="light"),e==="regular"&&(i="regular"),e==="solid"&&(i="solid")),t==="duotone"&&(e==="thin"&&(i="duotone-thin"),e==="light"&&(i="duotone-light"),e==="regular"&&(i="duotone-regular"),e==="solid"&&(i="duotone")),t==="sharp"&&(e==="thin"&&(i="sharp-thin"),e==="light"&&(i="sharp-light"),e==="regular"&&(i="sharp-regular"),e==="solid"&&(i="sharp-solid")),t==="sharp-duotone"&&(e==="thin"&&(i="sharp-duotone-thin"),e==="light"&&(i="sharp-duotone-light"),e==="regular"&&(i="sharp-duotone-regular"),e==="solid"&&(i="sharp-duotone-solid")),t==="brands"&&(i="brands"),i}function nh(s,t,e){let i=sh(s,t,e),n=xr();if(n)return`${n}/${i}/${s}.svg`;let o=Cr();return o.length>0?`https://ka-p.fontawesome.com/releases/v${Sr}/svgs/${i}/${s}.svg?token=${encodeURIComponent(o)}`:`https://ka-f.fontawesome.com/releases/v${Sr}/svgs/${i}/${s}.svg`}var oh={name:"default",resolver:(s,t="classic",e="solid")=>nh(s,t,e),mutator:(s,t)=>{if(s.hasAttribute("fill")||s.setAttribute("fill","currentColor"),t?.family&&!s.hasAttribute("data-duotone-initialized")){let{family:e,variant:i}=t;if(e==="duotone"||e==="sharp-duotone"||e==="notdog-duo"||e==="notdog"&&i==="duo-solid"||e==="jelly-duo"||e==="jelly"&&i==="duo-regular"||e==="utility-duo"||e==="slab-duo"||e==="slab-press-duo"||e==="thumbprint"){let n=[...s.querySelectorAll("path")],o=n.find(a=>!a.hasAttribute("opacity")),r=n.find(a=>a.hasAttribute("opacity"));if(!o||!r)return;if(o.setAttribute("data-duotone-primary",""),r.setAttribute("data-duotone-secondary",""),t.swapOpacity&&o&&r){let a=r.getAttribute("opacity")||"0.4";o.style.setProperty("--path-opacity",a),r.style.setProperty("--path-opacity","1")}s.setAttribute("data-duotone-initialized","")}}}},Mr=oh;function rh(s){return`data:image/svg+xml,${encodeURIComponent(s)}`}var Ps={solid:{"arrow-down":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M169.4 502.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 402.7 224 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 370.7-105.4-105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>',"arrow-up":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M214.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 109.3 160 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-370.7 105.4 105.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>',backward:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M236.3 107.1C247.9 96 265 92.9 279.7 99.2C294.4 105.5 304 120 304 136L304 272.3L476.3 107.2C487.9 96 505 92.9 519.7 99.2C534.4 105.5 544 120 544 136L544 504C544 520 534.4 534.5 519.7 540.8C505 547.1 487.9 544 476.3 532.9L304 367.7L304 504C304 520 294.4 534.5 279.7 540.8C265 547.1 247.9 544 236.3 532.9L44.3 348.9C36.5 341.3 32 330.9 32 320C32 309.1 36.5 298.7 44.3 291.1L236.3 107.1z"/></svg>',"backward-step":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M491 100.8C478.1 93.8 462.3 94.5 450 102.6L192 272.1L192 128C192 110.3 177.7 96 160 96C142.3 96 128 110.3 128 128L128 512C128 529.7 142.3 544 160 544C177.7 544 192 529.7 192 512L192 367.9L450 537.5C462.3 545.6 478 546.3 491 539.3C504 532.3 512 518.8 512 504.1L512 136.1C512 121.4 503.9 107.9 491 100.9z"/></svg>',bars:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/></svg>',"angles-left":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M77.3 256 214.7 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256zm192 0L406.7 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L269.3 256z"/></svg>',"angles-right":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M434.7 256 297.3 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L434.7 256zm-192 0L105.3 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256z"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"/></svg>',"chevron-down":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>',"chevron-left":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>',"chevron-right":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>',circle:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z"/></svg>',"closed-captioning":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M64 192C64 156.7 92.7 128 128 128L512 128C547.3 128 576 156.7 576 192L576 448C576 483.3 547.3 512 512 512L128 512C92.7 512 64 483.3 64 448L64 192zM216 272L248 272C252.4 272 256 275.6 256 280C256 293.3 266.7 304 280 304C293.3 304 304 293.3 304 280C304 249.1 278.9 224 248 224L216 224C185.1 224 160 249.1 160 280L160 360C160 390.9 185.1 416 216 416L248 416C278.9 416 304 390.9 304 360C304 346.7 293.3 336 280 336C266.7 336 256 346.7 256 360C256 364.4 252.4 368 248 368L216 368C211.6 368 208 364.4 208 360L208 280C208 275.6 211.6 272 216 272zM384 280C384 275.6 387.6 272 392 272L424 272C428.4 272 432 275.6 432 280C432 293.3 442.7 304 456 304C469.3 304 480 293.3 480 280C480 249.1 454.9 224 424 224L392 224C361.1 224 336 249.1 336 280L336 360C336 390.9 361.1 416 392 416L424 416C454.9 416 480 390.9 480 360C480 346.7 469.3 336 456 336C442.7 336 432 346.7 432 360C432 364.4 428.4 368 424 368L392 368C387.6 368 384 364.4 384 360L384 280z"/></svg>',"closed-captioning-slash":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M39 39.1C48.4 29.7 63.6 29.7 72.9 39.1L161.8 128L512 128C547.3 128 576 156.7 576 192L576 448C576 473.5 561.1 495.4 539.6 505.8L601 567.1C610.4 576.5 610.4 591.7 601 601C591.6 610.3 576.4 610.4 567.1 601L39 73.1C29.7 63.7 29.7 48.5 39 39.1zM384 350.1L384 279.9C384 275.5 387.6 271.9 392 271.9L424 271.9C428.4 271.9 432 275.5 432 279.9C432 293.2 442.7 303.9 456 303.9C469.3 303.9 480 293.2 480 279.9C480 249 454.9 223.9 424 223.9L392 223.9C361.1 223.9 336 249 336 279.9L336 302.1L384 350.1zM445.5 411.6C465.7 403.2 480 383.2 480 359.9C480 346.6 469.3 335.9 456 335.9C442.7 335.9 432 346.6 432 359.9C432 364.3 428.4 367.9 424 367.9L401.8 367.9L445.5 411.6zM162.3 264.1C160.8 269.1 160 274.5 160 280L160 360C160 390.9 185.1 416 216 416L248 416C266.1 416 282.1 407.5 292.4 394.2L410.2 512L128 512C92.7 512 64 483.3 64 448L64 192C64 184.2 65.4 176.7 68 169.8L162.3 264.1zM256.1 357.9C256 358.6 256 359.3 256 360C256 364.4 252.4 368 248 368L216 368C211.6 368 208 364.4 208 360L208 309.8L256.1 357.9z"/></svg>',compress:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M160 64c0-17.7-14.3-32-32-32S96 46.3 96 64l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 320c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0z"/></svg>',ellipsis:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M96 320C96 289.1 121.1 264 152 264C182.9 264 208 289.1 208 320C208 350.9 182.9 376 152 376C121.1 376 96 350.9 96 320zM264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320zM488 264C518.9 264 544 289.1 544 320C544 350.9 518.9 376 488 376C457.1 376 432 350.9 432 320C432 289.1 457.1 264 488 264z"/></svg>',"ellipsis-vertical":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M320 208C289.1 208 264 182.9 264 152C264 121.1 289.1 96 320 96C350.9 96 376 121.1 376 152C376 182.9 350.9 208 320 208zM320 432C350.9 432 376 457.1 376 488C376 518.9 350.9 544 320 544C289.1 544 264 518.9 264 488C264 457.1 289.1 432 320 432zM376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320z"/></svg>',expand:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 96C110.3 96 96 110.3 96 128L96 224C96 241.7 110.3 256 128 256C145.7 256 160 241.7 160 224L160 160L224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L128 96zM160 416C160 398.3 145.7 384 128 384C110.3 384 96 398.3 96 416L96 512C96 529.7 110.3 544 128 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480L160 416zM416 96C398.3 96 384 110.3 384 128C384 145.7 398.3 160 416 160L480 160L480 224C480 241.7 494.3 256 512 256C529.7 256 544 241.7 544 224L544 128C544 110.3 529.7 96 512 96L416 96zM544 416C544 398.3 529.7 384 512 384C494.3 384 480 398.3 480 416L480 480L416 480C398.3 480 384 494.3 384 512C384 529.7 398.3 544 416 544L512 544C529.7 544 544 529.7 544 512L544 416z"/></svg>',eyedropper:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M341.6 29.2l-101.6 101.6-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4 101.6-101.6c39-39 39-102.2 0-141.1s-102.2-39-141.1 0zM55.4 323.3c-15 15-23.4 35.4-23.4 56.6l0 42.4-26.6 39.9c-8.5 12.7-6.8 29.6 4 40.4s27.7 12.5 40.4 4l39.9-26.6 42.4 0c21.2 0 41.6-8.4 56.6-23.4l109.4-109.4-45.3-45.3-109.4 109.4c-3 3-7.1 4.7-11.3 4.7l-36.1 0 0-36.1c0-4.2 1.7-8.3 4.7-11.3l109.4-109.4-45.3-45.3-109.4 109.4z"/></svg>',filter:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M32 64C19.1 64 7.4 71.8 2.4 83.8S.2 109.5 9.4 118.6L192 301.3 192 416c0 8.5 3.4 16.6 9.4 22.6l64 64c9.2 9.2 22.9 11.9 34.9 6.9S320 492.9 320 480l0-178.7 182.6-182.6c9.2-9.2 11.9-22.9 6.9-34.9S492.9 64 480 64L32 64z"/></svg>',forward:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M403.7 107.1C392.1 96 375 92.9 360.3 99.2C345.6 105.5 336 120 336 136L336 272.3L163.7 107.2C152.1 96 135 92.9 120.3 99.2C105.6 105.5 96 120 96 136L96 504C96 520 105.6 534.5 120.3 540.8C135 547.1 152.1 544 163.7 532.9L336 367.7L336 504C336 520 345.6 534.5 360.3 540.8C375 547.1 392.1 544 403.7 532.9L595.7 348.9C603.6 341.4 608 330.9 608 320C608 309.1 603.5 298.7 595.7 291.1L403.7 107.1z"/></svg>',file:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M192 64C156.7 64 128 92.7 128 128L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 234.5C512 217.5 505.3 201.2 493.3 189.2L386.7 82.7C374.7 70.7 358.5 64 341.5 64L192 64zM453.5 240L360 240C346.7 240 336 229.3 336 216L336 122.5L453.5 240z"/></svg>',"file-audio":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM389.8 307.7C380.7 301.4 368.3 303.6 362 312.7C355.7 321.8 357.9 334.2 367 340.5C390.9 357.2 406.4 384.8 406.4 416C406.4 447.2 390.8 474.9 367 491.5C357.9 497.8 355.7 510.3 362 519.3C368.3 528.3 380.8 530.6 389.8 524.3C423.9 500.5 446.4 460.8 446.4 416C446.4 371.2 424 331.5 389.8 307.7zM208 376C199.2 376 192 383.2 192 392L192 440C192 448.8 199.2 456 208 456L232 456L259.2 490C262.2 493.8 266.8 496 271.7 496L272 496C280.8 496 288 488.8 288 480L288 352C288 343.2 280.8 336 272 336L271.7 336C266.8 336 262.2 338.2 259.2 342L232 376L208 376zM336 448.2C336 458.9 346.5 466.4 354.9 459.8C367.8 449.5 376 433.7 376 416C376 398.3 367.8 382.5 354.9 372.2C346.5 365.5 336 373.1 336 383.8L336 448.3z"/></svg>',"file-code":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM282.2 359.6C290.8 349.5 289.7 334.4 279.6 325.8C269.5 317.2 254.4 318.3 245.8 328.4L197.8 384.4C190.1 393.4 190.1 406.6 197.8 415.6L245.8 471.6C254.4 481.7 269.6 482.8 279.6 474.2C289.6 465.6 290.8 450.4 282.2 440.4L247.6 400L282.2 359.6zM394.2 328.4C385.6 318.3 370.4 317.2 360.4 325.8C350.4 334.4 349.2 349.6 357.8 359.6L392.4 400L357.8 440.4C349.2 450.5 350.3 465.6 360.4 474.2C370.5 482.8 385.6 481.7 394.2 471.6L442.2 415.6C449.9 406.6 449.9 393.4 442.2 384.4L394.2 328.4z"/></svg>',"file-excel":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM292 330.7C284.6 319.7 269.7 316.7 258.7 324C247.7 331.3 244.7 346.3 252 357.3L291.2 416L252 474.7C244.6 485.7 247.6 500.6 258.7 508C269.8 515.4 284.6 512.4 292 501.3L320 459.3L348 501.3C355.4 512.3 370.3 515.3 381.3 508C392.3 500.7 395.3 485.7 388 474.7L348.8 416L388 357.3C395.4 346.3 392.4 331.4 381.3 324C370.2 316.6 355.4 319.6 348 330.7L320 372.7L292 330.7z"/></svg>',"file-image":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM256 320C256 302.3 241.7 288 224 288C206.3 288 192 302.3 192 320C192 337.7 206.3 352 224 352C241.7 352 256 337.7 256 320zM220.6 512L419.4 512C435.2 512 448 499.2 448 483.4C448 476.1 445.2 469 440.1 463.7L343.3 361.9C337.3 355.6 328.9 352 320.1 352L319.8 352C311 352 302.7 355.6 296.6 361.9L199.9 463.7C194.8 469 192 476.1 192 483.4C192 499.2 204.8 512 220.6 512z"/></svg>',"file-pdf":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 64C92.7 64 64 92.7 64 128L64 512C64 547.3 92.7 576 128 576L208 576L208 464C208 428.7 236.7 400 272 400L448 400L448 234.5C448 217.5 441.3 201.2 429.3 189.2L322.7 82.7C310.7 70.7 294.5 64 277.5 64L128 64zM389.5 240L296 240C282.7 240 272 229.3 272 216L272 122.5L389.5 240zM272 444C261 444 252 453 252 464L252 592C252 603 261 612 272 612C283 612 292 603 292 592L292 564L304 564C337.1 564 364 537.1 364 504C364 470.9 337.1 444 304 444L272 444zM304 524L292 524L292 484L304 484C315 484 324 493 324 504C324 515 315 524 304 524zM400 444C389 444 380 453 380 464L380 592C380 603 389 612 400 612L432 612C460.7 612 484 588.7 484 560L484 496C484 467.3 460.7 444 432 444L400 444zM420 572L420 484L432 484C438.6 484 444 489.4 444 496L444 560C444 566.6 438.6 572 432 572L420 572zM508 464L508 592C508 603 517 612 528 612C539 612 548 603 548 592L548 548L576 548C587 548 596 539 596 528C596 517 587 508 576 508L548 508L548 484L576 484C587 484 596 475 596 464C596 453 587 444 576 444L528 444C517 444 508 453 508 464z"/></svg>',"file-powerpoint":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM280 320C266.7 320 256 330.7 256 344L256 488C256 501.3 266.7 512 280 512C293.3 512 304 501.3 304 488L304 464L328 464C367.8 464 400 431.8 400 392C400 352.2 367.8 320 328 320L280 320zM328 416L304 416L304 368L328 368C341.3 368 352 378.7 352 392C352 405.3 341.3 416 328 416z"/></svg>',"file-video":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM208 368L208 464C208 481.7 222.3 496 240 496L336 496C353.7 496 368 481.7 368 464L368 440L403 475C406.2 478.2 410.5 480 415 480C424.4 480 432 472.4 432 463L432 368.9C432 359.5 424.4 351.9 415 351.9C410.5 351.9 406.2 353.7 403 356.9L368 391.9L368 367.9C368 350.2 353.7 335.9 336 335.9L240 335.9C222.3 335.9 208 350.2 208 367.9z"/></svg>',"file-word":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM263.4 338.8C260.5 325.9 247.7 317.7 234.8 320.6C221.9 323.5 213.7 336.3 216.6 349.2L248.6 493.2C250.9 503.7 260 511.4 270.8 512C281.6 512.6 291.4 505.9 294.8 495.6L320 419.9L345.2 495.6C348.6 505.8 358.4 512.5 369.2 512C380 511.5 389.1 503.8 391.4 493.2L423.4 349.2C426.3 336.3 418.1 323.4 405.2 320.6C392.3 317.8 379.4 325.9 376.6 338.8L363.4 398.2L342.8 336.4C339.5 326.6 330.4 320 320 320C309.6 320 300.5 326.6 297.2 336.4L276.6 398.2L263.4 338.8z"/></svg>',"file-zipper":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM192 136C192 149.3 202.7 160 216 160L264 160C277.3 160 288 149.3 288 136C288 122.7 277.3 112 264 112L216 112C202.7 112 192 122.7 192 136zM192 232C192 245.3 202.7 256 216 256L264 256C277.3 256 288 245.3 288 232C288 218.7 277.3 208 264 208L216 208C202.7 208 192 218.7 192 232zM256 304L224 304C206.3 304 192 318.3 192 336L192 384C192 410.5 213.5 432 240 432C266.5 432 288 410.5 288 384L288 336C288 318.3 273.7 304 256 304zM240 368C248.8 368 256 375.2 256 384C256 392.8 248.8 400 240 400C231.2 400 224 392.8 224 384C224 375.2 231.2 368 240 368z"/></svg>',"forward-step":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M21 36.8c12.9-7 28.7-6.3 41 1.8L320 208.1 320 64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 384c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-144.1-258 169.6c-12.3 8.1-28 8.8-41 1.8S0 454.7 0 440L0 72C0 57.3 8.1 43.8 21 36.8z"/></svg>',gauge:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm320 96c0-26.9-16.5-49.9-40-59.3L280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 172.7c-23.5 9.5-40 32.5-40 59.3 0 35.3 28.7 64 64 64s64-28.7 64-64zM144 176a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm-16 80a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm288 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM400 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>',gear:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M259.1 73.5C262.1 58.7 275.2 48 290.4 48L350.2 48C365.4 48 378.5 58.7 381.5 73.5L396 143.5C410.1 149.5 423.3 157.2 435.3 166.3L503.1 143.8C517.5 139 533.3 145 540.9 158.2L570.8 210C578.4 223.2 575.7 239.8 564.3 249.9L511 297.3C511.9 304.7 512.3 312.3 512.3 320C512.3 327.7 511.8 335.3 511 342.7L564.4 390.2C575.8 400.3 578.4 417 570.9 430.1L541 481.9C533.4 495 517.6 501.1 503.2 496.3L435.4 473.8C423.3 482.9 410.1 490.5 396.1 496.6L381.7 566.5C378.6 581.4 365.5 592 350.4 592L290.6 592C275.4 592 262.3 581.3 259.3 566.5L244.9 496.6C230.8 490.6 217.7 482.9 205.6 473.8L137.5 496.3C123.1 501.1 107.3 495.1 99.7 481.9L69.8 430.1C62.2 416.9 64.9 400.3 76.3 390.2L129.7 342.7C128.8 335.3 128.4 327.7 128.4 320C128.4 312.3 128.9 304.7 129.7 297.3L76.3 249.8C64.9 239.7 62.3 223 69.8 209.9L99.7 158.1C107.3 144.9 123.1 138.9 137.5 143.7L205.3 166.2C217.4 157.1 230.6 149.5 244.6 143.4L259.1 73.5zM320.3 400C364.5 399.8 400.2 363.9 400 319.7C399.8 275.5 363.9 239.8 319.7 240C275.5 240.2 239.8 276.1 240 320.3C240.2 364.5 276.1 400.2 320.3 400z"/></svg>',"grip-vertical":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M128 40c0-22.1-17.9-40-40-40L40 0C17.9 0 0 17.9 0 40L0 88c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zM0 424l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM320 40c0-22.1-17.9-40-40-40L232 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zM192 232l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM320 424c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48z"/></svg>',indeterminate:'<svg part="indeterminate-icon" class="icon" viewBox="0 0 16 16"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round"><g stroke="currentColor" stroke-width="2"><g transform="translate(2.285714 6.857143)"><path d="M10.2857143,1.14285714 L1.14285714,1.14285714"/></g></g></g></svg>',"magnifying-glass":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376C296.3 401.1 253.9 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0 416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>',minus:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32z"/></svg>',pause:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M48 32C21.5 32 0 53.5 0 80L0 432c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48L48 32zm224 0c-26.5 0-48 21.5-48 48l0 352c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48l-64 0z"/></svg>',"picture-in-picture":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M448 32c35.3 0 64 28.7 64 64l0 112-64 0 0-112-384 0 0 320 144 0 0 64-144 0-6.5-.3c-30.1-3.1-54.1-27-57.1-57.1L0 416 0 96C0 62.9 25.2 35.6 57.5 32.3L64 32 448 32zm16 224c26.5 0 48 21.5 48 48l0 128c0 26.5-21.5 48-48 48l-160 0c-26.5 0-48-21.5-48-48l0-128c0-26.5 21.5-48 48-48l160 0z"/></svg>',play:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z"/></svg>',"play-circle":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9l0 176c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z"/></svg>',"table-columns":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zm64 64l0 256 128 0 0-256-128 0zm320 0l-128 0 0 256 128 0 0-256z"/></svg>',thumbtack:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M32 32C32 14.3 46.3 0 64 0L320 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-29.5 0 10.3 134.1c37.1 21.2 65.8 56.4 78.2 99.7l3.8 13.4c2.8 9.7 .8 20-5.2 28.1S362 352 352 352L32 352c-10 0-19.5-4.7-25.5-12.7s-8-18.4-5.2-28.1L5 297.8c12.4-43.3 41-78.5 78.2-99.7L93.5 64 64 64C46.3 64 32 49.7 32 32zM160 400l64 0 0 112c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-112z"/></svg>',"up-down":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M406.6 502.6l96-96c9.2-9.2 11.9-22.9 6.9-34.9S492.9 352 480 352l-64 0 0-320c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 320-64 0c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l96 96c12.5 12.5 32.8 12.5 45.3 0zM150.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-9.2 9.2-11.9 22.9-6.9 34.9S19.1 160 32 160l64 0 0 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-320 64 0c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-96-96z"/></svg>',upload:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M352 173.3L352 384C352 401.7 337.7 416 320 416C302.3 416 288 401.7 288 384L288 173.3L246.6 214.7C234.1 227.2 213.8 227.2 201.3 214.7C188.8 202.2 188.8 181.9 201.3 169.4L297.3 73.4C309.8 60.9 330.1 60.9 342.6 73.4L438.6 169.4C451.1 181.9 451.1 202.2 438.6 214.7C426.1 227.2 405.8 227.2 393.3 214.7L352 173.3zM320 464C364.2 464 400 428.2 400 384L480 384C515.3 384 544 412.7 544 448L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 448C96 412.7 124.7 384 160 384L240 384C240 428.2 275.8 464 320 464zM464 488C477.3 488 488 477.3 488 464C488 450.7 477.3 440 464 440C450.7 440 440 450.7 440 464C440 477.3 450.7 488 464 488z"/></svg>',user:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M224 248a120 120 0 1 0 0-240 120 120 0 1 0 0 240zm-29.7 56C95.8 304 16 383.8 16 482.3 16 498.7 29.3 512 45.7 512l356.6 0c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3l-59.4 0z"/></svg>',volume:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M48 352l48 0 134.1 119.2c6.4 5.7 14.6 8.8 23.1 8.8 19.2 0 34.8-15.6 34.8-34.8l0-378.4c0-19.2-15.6-34.8-34.8-34.8-8.5 0-16.7 3.1-23.1 8.8L96 160 48 160c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48zM441.1 107c-10.3-8.4-25.4-6.8-33.8 3.5s-6.8 25.4 3.5 33.8C443.3 170.7 464 210.9 464 256s-20.7 85.3-53.2 111.8c-10.3 8.4-11.8 23.5-3.5 33.8s23.5 11.8 33.8 3.5c43.2-35.2 70.9-88.9 70.9-149s-27.7-113.8-70.9-149zm-60.5 74.5c-10.3-8.4-25.4-6.8-33.8 3.5s-6.8 25.4 3.5 33.8C361.1 227.6 368 241 368 256s-6.9 28.4-17.7 37.3c-10.3 8.4-11.8 23.5-3.5 33.8s23.5 11.8 33.8 3.5C402.1 312.9 416 286.1 416 256s-13.9-56.9-35.5-74.5z"/></svg>',"volume-low":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M48 352l48 0 134.1 119.2c6.4 5.7 14.6 8.8 23.1 8.8 19.2 0 34.8-15.6 34.8-34.8l0-378.4c0-19.2-15.6-34.8-34.8-34.8-8.5 0-16.7 3.1-23.1 8.8L96 160 48 160c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48zM380.6 181.5c-10.3-8.4-25.4-6.8-33.8 3.5s-6.8 25.4 3.5 33.8C361.1 227.6 368 241 368 256s-6.9 28.4-17.7 37.3c-10.3 8.4-11.8 23.5-3.5 33.8s23.5 11.8 33.8 3.5C402.1 312.9 416 286.1 416 256s-13.9-56.9-35.5-74.5z"/></svg>',"volume-xmark":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M48 352l48 0 134.1 119.2c6.4 5.7 14.6 8.8 23.1 8.8 19.2 0 34.8-15.6 34.8-34.8l0-378.4c0-19.2-15.6-34.8-34.8-34.8-8.5 0-16.7 3.1-23.1 8.8L96 160 48 160c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48zM367 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/></svg>',xmark:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"/></svg>'},regular:{calendar:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176zM144 288L144 480C144 488.8 151.2 496 160 496L480 496C488.8 496 496 488.8 496 480L496 288L144 288z"/></svg>',"circle-question":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M464 256a208 208 0 1 0 -416 0 208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm256-80c-17.7 0-32 14.3-32 32 0 13.3-10.7 24-24 24s-24-10.7-24-24c0-44.2 35.8-80 80-80s80 35.8 80 80c0 47.2-36 67.2-56 74.5l0 3.8c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-8.1c0-20.5 14.8-35.2 30.1-40.2 6.4-2.1 13.2-5.5 18.2-10.3 4.3-4.2 7.7-10 7.7-19.6 0-17.7-14.3-32-32-32zM224 368a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>',"circle-xmark":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM167 167c-9.4 9.4-9.4 24.6 0 33.9l55 55-55 55c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l55-55 55 55c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-55-55 55-55c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-55 55-55-55c-9.4-9.4-24.6-9.4-33.9 0z"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M384 336l-192 0c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l133.5 0c4.2 0 8.3 1.7 11.3 4.7l58.5 58.5c3 3 4.7 7.1 4.7 11.3L400 320c0 8.8-7.2 16-16 16zM192 384l192 0c35.3 0 64-28.7 64-64l0-197.5c0-17-6.7-33.3-18.7-45.3L370.7 18.7C358.7 6.7 342.5 0 325.5 0L192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-16-48 0 0 16c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l16 0 0-48-16 0z"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M288 80C222.8 80 169.2 109.6 128.1 147.7 89.6 183.5 63 226 49.4 256 63 286 89.6 328.5 128.1 364.3 169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256 513 226 486.4 183.5 447.9 147.7 406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1 3.3 7.9 3.3 16.7 0 24.6-14.9 35.7-46.2 87.7-93 131.1-47.1 43.7-111.8 80.6-192.6 80.6S142.5 443.2 95.4 399.4c-46.8-43.5-78.1-95.4-93-131.1-3.3-7.9-3.3-16.7 0-24.6 14.9-35.7 46.2-87.7 93-131.1zM288 336c44.2 0 80-35.8 80-80 0-29.6-16.1-55.5-40-69.3-1.4 59.7-49.6 107.9-109.3 109.3 13.8 23.9 39.7 40 69.3 40zm-79.6-88.4c2.5 .3 5 .4 7.6 .4 35.3 0 64-28.7 64-64 0-2.6-.2-5.1-.4-7.6-37.4 3.9-67.2 33.7-71.1 71.1zm45.6-115c10.8-3 22.2-4.5 33.9-4.5 8.8 0 17.5 .9 25.8 2.6 .3 .1 .5 .1 .8 .2 57.9 12.2 101.4 63.7 101.4 125.2 0 70.7-57.3 128-128 128-61.6 0-113-43.5-125.2-101.4-1.8-8.6-2.8-17.5-2.8-26.6 0-11 1.4-21.8 4-32 .2-.7 .3-1.3 .5-1.9 11.9-43.4 46.1-77.6 89.5-89.5z"/></svg>',"eye-slash":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M41-24.9c-9.4-9.4-24.6-9.4-33.9 0S-2.3-.3 7 9.1l528 528c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-96.4-96.4c2.7-2.4 5.4-4.8 8-7.2 46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6-56.8 0-105.6 18.2-146 44.2L41-24.9zM176.9 111.1c32.1-18.9 69.2-31.1 111.1-31.1 65.2 0 118.8 29.6 159.9 67.7 38.5 35.7 65.1 78.3 78.6 108.3-13.6 30-40.2 72.5-78.6 108.3-3.1 2.8-6.2 5.6-9.4 8.4L393.8 328c14-20.5 22.2-45.3 22.2-72 0-70.7-57.3-128-128-128-26.7 0-51.5 8.2-72 22.2l-39.1-39.1zm182 182l-108-108c11.1-5.8 23.7-9.1 37.1-9.1 44.2 0 80 35.8 80 80 0 13.4-3.3 26-9.1 37.1zM103.4 173.2l-34-34c-32.6 36.8-55 75.8-66.9 104.5-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6 37.3 0 71.2-7.9 101.5-20.6L352.2 422c-20 6.4-41.4 10-64.2 10-65.2 0-118.8-29.6-159.9-67.7-38.5-35.7-65.1-78.3-78.6-108.3 10.4-23.1 28.6-53.6 54-82.8z"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M288.1-32c9 0 17.3 5.1 21.4 13.1L383 125.3 542.9 150.7c8.9 1.4 16.3 7.7 19.1 16.3s.5 18-5.8 24.4L441.7 305.9 467 465.8c1.4 8.9-2.3 17.9-9.6 23.2s-17 6.1-25 2L288.1 417.6 143.8 491c-8 4.1-17.7 3.3-25-2s-11-14.2-9.6-23.2L134.4 305.9 20 191.4c-6.4-6.4-8.6-15.8-5.8-24.4s10.1-14.9 19.1-16.3l159.9-25.4 73.6-144.2c4.1-8 12.4-13.1 21.4-13.1zm0 76.8L230.3 158c-3.5 6.8-10 11.6-17.6 12.8l-125.5 20 89.8 89.9c5.4 5.4 7.9 13.1 6.7 20.7l-19.8 125.5 113.3-57.6c6.8-3.5 14.9-3.5 21.8 0l113.3 57.6-19.8-125.5c-1.2-7.6 1.3-15.3 6.7-20.7l89.8-89.9-125.5-20c-7.6-1.2-14.1-6-17.6-12.8L288.1 44.8z"/></svg>'}},ah={name:"system",resolver:(s,t="classic",e="solid")=>{let n=Ps[e][s]??Ps.regular[s]??Ps.regular["circle-question"];return n?rh(n):""},mutator:s=>{s.hasAttribute("fill")||s.setAttribute("fill","currentColor")}},_r=ah;var lh="classic",hh=[Mr,_r],Lr=new Set;function Er(s){Lr.add(s)}function kr(s){Lr.delete(s)}function Si(s){return hh.find(t=>t.name===s)}function zr(){return lh}var{I:Gm}=Jo;var Tr=(s,t)=>t===void 0?s?._$litType$!==void 0:s?._$litType$===t;var Ie=Symbol(),Mi=Symbol(),$s,Rs=new Map,j=class extends U{constructor(){super(...arguments),this.svg=null,this.autoWidth=!1,this.swapOpacity=!1,this.label="",this.library="default",this.rotate=0,this.resolveIcon=async(s,t)=>{let e;if(t?.spriteSheet){this.hasUpdated||await this.updateComplete,this.svg=N`<svg part="svg">
        <use part="use" href="${s}"></use>
      </svg>`,await this.updateComplete;let i=this.shadowRoot.querySelector("[part='svg']");return typeof t.mutator=="function"&&t.mutator(i,this),this.svg}try{if(e=await fetch(s,{mode:"cors"}),!e.ok)return e.status===410?Ie:Mi}catch{return Mi}try{let i=document.createElement("div");i.innerHTML=await e.text();let n=i.firstElementChild;if(n?.tagName?.toLowerCase()!=="svg")return Ie;$s||($s=new DOMParser);let r=$s.parseFromString(n.outerHTML,"text/html").body.querySelector("svg");return r?(r.part.add("svg"),document.adoptNode(r)):Ie}catch{return Ie}}}connectedCallback(){super.connectedCallback(),Er(this)}firstUpdated(s){super.firstUpdated(s),this.hasAttribute("rotate")&&this.style.setProperty("--rotate-angle",`${this.rotate}deg`),this.setIcon()}disconnectedCallback(){super.disconnectedCallback(),kr(this)}async getIconSource(){let s=Si(this.library),t=this.family||zr();if(this.name&&s){let e=this.canvas==="auto"||this.autoWidth,i;try{i=await s.resolver(this.name,t,this.variant,e)}catch{i=void 0}return{url:i,fromLibrary:!0}}return{url:this.src,fromLibrary:!1}}handleLabelChange(){typeof this.label=="string"&&this.label.length>0?(this.setAttribute("role","img"),this.setAttribute("aria-label",this.label),this.removeAttribute("aria-hidden")):(this.removeAttribute("role"),this.removeAttribute("aria-label"),this.setAttribute("aria-hidden","true"))}async setIcon(){let{url:s,fromLibrary:t}=await this.getIconSource(),e=t?Si(this.library):void 0;if(!s){this.svg=null;return}let i=Rs.get(s);i||(i=this.resolveIcon(s,e),Rs.set(s,i));let n=await i;n===Mi&&Rs.delete(s);let o=await this.getIconSource();if(s===o.url){if(Tr(n)){this.svg=n;return}switch(n){case Mi:case Ie:this.svg=null,this.dispatchEvent(new br);break;default:this.svg=n.cloneNode(!0),e?.mutator?.(this.svg,this),this.dispatchEvent(new wr)}}}willUpdate(s){return this.style||this.setStyleProperty("--rotate-angle",`${this.rotate}deg`),super.willUpdate(s)}updated(s){super.updated(s);let t=Si(this.library);this.hasAttribute("rotate")&&this.style.setProperty("--rotate-angle",`${this.rotate}deg`);let e=this.shadowRoot?.querySelector("svg");e&&t?.mutator?.(e,this)}render(){return this.hasUpdated?this.svg:N`<svg part="svg" width="16" height="16" viewBox="0 0 16 16"></svg>`}};j.css=yr;p([ht()],j.prototype,"svg",2);p([y({reflect:!0})],j.prototype,"name",2);p([y({reflect:!0})],j.prototype,"family",2);p([y({reflect:!0})],j.prototype,"variant",2);p([y({reflect:!0})],j.prototype,"canvas",2);p([y({attribute:"auto-width",type:Boolean,reflect:!0})],j.prototype,"autoWidth",2);p([y({attribute:"swap-opacity",type:Boolean,reflect:!0})],j.prototype,"swapOpacity",2);p([y()],j.prototype,"src",2);p([y()],j.prototype,"label",2);p([y({reflect:!0})],j.prototype,"library",2);p([y({type:Number,reflect:!0})],j.prototype,"rotate",2);p([y({type:String,reflect:!0})],j.prototype,"flip",2);p([y({type:String,reflect:!0})],j.prototype,"animation",2);p([Q("label")],j.prototype,"handleLabelChange",1);p([Q(["family","name","library","variant","src","autoWidth","canvas","swapOpacity"],{waitUntilFirstUpdate:!0})],j.prototype,"setIcon",1);j=p([H("wa-icon")],j);var Ar=F`
  :host {
    --spacing: var(--wa-space-l);

    /* Internal calculated properties */
    --inner-border-radius: calc(var(--wa-panel-border-radius) - var(--wa-panel-border-width));

    display: flex;
    flex-direction: column;
    background-color: var(--wa-color-surface-default);
    border-color: var(--wa-color-surface-border);
    border-radius: var(--wa-panel-border-radius);
    border-style: var(--wa-panel-border-style);
    box-shadow: var(--wa-shadow-s);
    border-width: var(--wa-panel-border-width);
    color: var(--wa-color-text-normal);
  }

  /* Appearance modifiers */
  :host([appearance='plain']) {
    background-color: transparent;
    border-color: transparent;
    box-shadow: none;
  }

  :host([appearance='outlined']) {
    background-color: var(--wa-color-surface-default);
    border-color: var(--wa-color-surface-border);
  }

  :host([appearance='filled']) {
    background-color: var(--wa-color-neutral-fill-quiet);
    border-color: transparent;
  }

  :host([appearance='filled-outlined']) {
    background-color: var(--wa-color-neutral-fill-quiet);
    border-color: var(--wa-color-surface-border);
  }

  :host([appearance='accent']) {
    color: var(--wa-color-neutral-on-loud);
    background-color: var(--wa-color-neutral-fill-loud);
    border-color: transparent;
  }

  /* Take care of top and bottom radii */
  .media,
  :host(:not([with-media])) .header,
  :host(:not([with-media], [with-header])) .body {
    border-start-start-radius: var(--inner-border-radius);
    border-start-end-radius: var(--inner-border-radius);
  }

  :host(:not([with-footer])) .body,
  .footer {
    border-end-start-radius: var(--inner-border-radius);
    border-end-end-radius: var(--inner-border-radius);
  }

  .media {
    display: flex;
    overflow: hidden;

    &::slotted(*) {
      display: block;
      width: 100%;
      border-radius: 0 !important;
    }
  }

  /* Round all corners for plain appearance */
  :host([appearance='plain']) .media {
    border-radius: var(--inner-border-radius);

    &::slotted(*) {
      border-radius: inherit !important;
    }
  }

  .header {
    display: block;
    border-block-end-style: inherit;
    border-block-end-color: var(--wa-color-surface-border);
    border-block-end-width: var(--wa-panel-border-width);
    padding: calc(var(--spacing) / 2) var(--spacing);
  }

  .body {
    display: block;
    padding: var(--spacing);
  }

  .footer {
    display: block;
    border-block-start-style: inherit;
    border-block-start-color: var(--wa-color-surface-border);
    border-block-start-width: var(--wa-panel-border-width);
    padding: var(--spacing);
  }

  /* Push slots to sides when the action slots renders */
  .has-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  :host(:not([with-header])) .header,
  :host(:not([with-footer])) .footer,
  :host(:not([with-media])) .media {
    display: none;
  }

  /* Orientation Styles */
  :host([orientation='horizontal']) {
    flex-direction: row;

    .media {
      border-start-start-radius: var(--inner-border-radius);
      border-end-start-radius: var(--inner-border-radius);
      border-start-end-radius: 0;

      &::slotted(*) {
        block-size: 100%;
        inline-size: 100%;
        object-fit: cover;
      }
    }
  }

  :host([orientation='horizontal']) .body slot::slotted(*) {
    display: block;
    height: 100%;
    margin: 0;
  }

  :host([orientation='horizontal']) slot[name='actions']::slotted(*) {
    display: flex;
    align-items: center;
    padding: var(--spacing);
  }
`;var at=class extends U{constructor(){super(...arguments),this.hasSlotController=new he(this,"footer","header","media","header-actions","footer-actions","actions"),this.appearance="outlined",this.withHeader=!1,this.withMedia=!1,this.withFooter=!1,this.withHeaderActions=!1,this.withFooterActions=!1,this.orientation="vertical"}willUpdate(s){this.withHeader=this.hasSlotController.test("header","withHeader"),this.withMedia=this.hasSlotController.test("media","withMedia"),this.withFooter=this.hasSlotController.test("footer","withFooter"),super.willUpdate(s)}render(){if(this.orientation==="horizontal")return N`
        <slot name="media" part="media" class="media"></slot>
        <div part="body" class="body"><slot></slot></div>
        <slot name="actions" part="actions" class="actions"></slot>
      `;let s=this.hasSlotController.test("header-actions","withHeaderActions"),t=this.hasSlotController.test("footer-actions","withFooterActions");return N`
      <slot name="media" part="media" class="media"></slot>

      <div
        part="header"
        class=${et({header:!0,"has-actions":s})}
      >
        <slot name="header"></slot>
        <slot name="header-actions"></slot>
      </div>

      <div part="body" class="body"><slot></slot></div>

      <div
        part="footer"
        class=${et({footer:!0,"has-actions":t})}
      >
        <slot name="footer"></slot>
        <slot name="footer-actions"></slot>
      </div>
    `}};at.css=[pt,Ar];p([y({reflect:!0})],at.prototype,"appearance",2);p([y({attribute:"with-header",type:Boolean,reflect:!0})],at.prototype,"withHeader",2);p([y({attribute:"with-media",type:Boolean,reflect:!0})],at.prototype,"withMedia",2);p([y({attribute:"with-footer",type:Boolean,reflect:!0})],at.prototype,"withFooter",2);p([y({attribute:"with-header-actions",type:Boolean,reflect:!0})],at.prototype,"withHeaderActions",2);p([y({attribute:"with-footer-actions",type:Boolean,reflect:!0})],at.prototype,"withFooterActions",2);p([y({reflect:!0})],at.prototype,"orientation",2);at=p([H("wa-card")],at);at.disableWarning?.("change-in-update");var Pr=F`
  :host {
    --current-text-color: var(--wa-color-brand-on-loud);

    display: block;
    color: var(--wa-color-text-normal);
    -webkit-user-select: none;
    user-select: none;

    position: relative;
    display: flex;
    align-items: center;
    font: inherit;
    padding: 0.5em 1em 0.5em 0.25em;
    border-radius: var(--wa-border-radius-s);
    line-height: var(--wa-line-height-condensed);
    transition: var(--wa-transition-fast) background-color var(--wa-transition-easing);
    cursor: pointer;
  }

  :host(:focus) {
    outline: none;
  }

  @media (hover: hover) {
    :host(:not(:state(disabled), :state(current)):is(:state(hover), :hover)) {
      background-color: var(--wa-color-neutral-fill-normal);
      color: var(--wa-color-neutral-on-normal);
    }
  }

  :host(:state(current)),
  :host(:state(disabled):state(current)) {
    background-color: var(--wa-form-control-activated-color);
    color: var(--current-text-color);
    opacity: 1;
  }

  :host(:state(disabled)) {
    outline: none;
    opacity: 0.5;
    cursor: not-allowed;
  }

  .label {
    flex: 1 1 auto;
    display: inline-block;
  }

  .check {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--wa-font-size-smaller);
    visibility: hidden;
    width: 2em;
  }

  :host(:state(selected)) .check {
    visibility: visible;
  }

  .start,
  .end {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }

  .start::slotted(*) {
    margin-inline-end: 0.5em;
  }

  .end::slotted(*) {
    margin-inline-start: 0.5em;
  }

  @media (forced-colors: active) {
    :host(:hover:not([aria-disabled='true'])) {
      outline: dashed 1px SelectedItem;
      outline-offset: -1px;
    }
  }
`;function Be(s,t=0){if(!s||!globalThis.Node)return"";if(typeof s[Symbol.iterator]=="function")return(Array.isArray(s)?s:[...s]).map(n=>Be(n,--t)).join("");let e=s;if(e.nodeType===Node.TEXT_NODE)return e.textContent??"";if(e.nodeType===Node.ELEMENT_NODE){let i=e;if(i.hasAttribute("slot")||i.matches("style, script"))return"";if(i instanceof HTMLSlotElement){let n=i.assignedNodes({flatten:!0});if(n.length>0)return Be(n,--t)}return t>-1?Be(i,--t):i.textContent??""}return e.hasChildNodes()?Be(e.childNodes,--t):""}var ut=class extends U{constructor(){super(...arguments),this.localize=new rt(this),this.cachedDefaultLabel="",this.isInitialized=!1,this.isDefaultLabelDirty=!0,this.current=!1,this.value="",this.disabled=!1,this.selected=!1,this.defaultSelected=!1,this._label="",this.handleHover=s=>{s.type==="mouseenter"?this.customStates.set("hover",!0):s.type==="mouseleave"&&this.customStates.set("hover",!1)}}set label(s){let t=this._label;this._label=s||"",this._label!==t&&this.requestUpdate("label",t)}get label(){return this._label?this._label:this.defaultLabel}get defaultLabel(){return(this.isDefaultLabelDirty||!this.cachedDefaultLabel)&&this.updateDefaultLabel(),this.cachedDefaultLabel}connectedCallback(){super.connectedCallback(),this.setAttribute("role","option"),this.setAttribute("aria-selected","false"),this.addEventListener("mouseenter",this.handleHover),this.addEventListener("mouseleave",this.handleHover)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("mouseenter",this.handleHover),this.removeEventListener("mouseleave",this.handleHover)}handleDefaultSlotChange(){if(this.isDefaultLabelDirty=!0,!this.isInitialized){this.isInitialized=!0;return}let s=this.closest("wa-select, wa-combobox");s&&customElements.whenDefined(s.localName).then(()=>s.handleDefaultSlotChange?.())}willUpdate(s){s.has("defaultSelected")&&(this.didSSR&&this.hasUpdated||!this.didSSR)&&this.syncDefaultSelected(),super.willUpdate(s)}syncDefaultSelected(){if("closest"in this&&!this.closest("wa-combobox, wa-select")?.hasInteracted&&this.defaultSelected){let s=this.selected;this.selected=this.defaultSelected,this.requestUpdate("selected",s)}}updated(s){s.has("disabled")&&(this.setAttribute("aria-disabled",this.disabled?"true":"false"),this.customStates.set("disabled",this.disabled)),s.has("selected")&&(this.setAttribute("aria-selected",this.selected?"true":"false"),this.customStates.set("selected",this.selected)),s.has("value")&&(typeof this.value!="string"&&(this.value=String(this.value)),this.handleDefaultSlotChange()),s.has("current")&&this.customStates.set("current",this.current),super.updated(s)}async firstUpdated(s){if(super.firstUpdated(s),this.didSSR&&!this.hasUpdated?(await this.updateComplete,this.syncDefaultSelected()):this.syncDefaultSelected(),this.selected&&!this.defaultSelected){let t=this.closest("wa-select, wa-combobox");t&&!t.hasInteracted&&(await customElements.whenDefined(t?.localName),await t.updateComplete,t.selectionChanged?.())}}updateDefaultLabel(){let s=this.cachedDefaultLabel;this.cachedDefaultLabel=Be(this).trim(),this.isDefaultLabelDirty=!1;let t=this.cachedDefaultLabel!==s;return!this._label&&t&&this.requestUpdate("label",s),t}render(){let s=this.selected;return this.didSSR&&!this.hasUpdated?(this.updateComplete.then(()=>{this.requestUpdate()}),I):N`
      ${s?N`<wa-icon
            part="checked-icon"
            class="check"
            name="check"
            library="system"
            variant="solid"
            aria-hidden="true"
          ></wa-icon>`:N`<span part="checked-icon" class="check" aria-hidden="true"></span>`}
      <slot part="start" name="start" class="start"></slot>
      <slot part="label" class="label" @slotchange=${this.handleDefaultSlotChange}></slot>
      <slot part="end" name="end" class="end"></slot>
    `}};ut.css=Pr;p([Z(".label")],ut.prototype,"defaultSlot",2);p([ht()],ut.prototype,"current",2);p([y({reflect:!0})],ut.prototype,"value",2);p([y({type:Boolean})],ut.prototype,"disabled",2);p([y({type:Boolean,attribute:!1})],ut.prototype,"selected",2);p([y({type:Boolean,attribute:"selected"})],ut.prototype,"defaultSelected",2);p([y()],ut.prototype,"label",1);ut=p([H("wa-option")],ut);var $r=F`
  :host {
    --tag-max-size: 10ch;
    --show-duration: var(--wa-transition-fast);
    --hide-duration: var(--wa-transition-fast);
  }

  /* Add ellipses to multi select options */
  :host wa-tag::part(content) {
    display: initial;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: var(--tag-max-size);
  }

  :host .disabled [part~='combobox'] {
    opacity: 0.5;
    cursor: not-allowed;
    outline: none;
  }

  :host .enabled:is(.open, :focus-within) [part~='combobox'] {
    outline-color: var(--wa-color-focus);
  }

  /** The popup */
  .select {
    flex: 1 1 auto;
    display: inline-flex;
    width: 100%;
    position: relative;
    vertical-align: middle;

    /* Pass through from select to the popup */
    --show-duration: inherit;
    --hide-duration: inherit;

    &::part(popup) {
      z-index: 900;
    }

    &[data-current-placement^='top']::part(popup) {
      transform-origin: bottom;
    }

    &[data-current-placement^='bottom']::part(popup) {
      transform-origin: top;
    }
  }

  /* Combobox */
  .combobox {
    flex: 1;
    display: flex;
    width: 100%;
    min-width: 0;
    align-items: center;
    justify-content: start;

    min-height: var(--wa-form-control-height);

    background-color: var(--wa-form-control-background-color);
    border-color: var(--wa-form-control-border-color);
    border-radius: var(--wa-form-control-border-radius);
    border-style: var(--wa-form-control-border-style);
    border-width: var(--wa-form-control-border-width);
    color: var(--wa-form-control-value-color);
    cursor: pointer;
    font-family: inherit;
    font-weight: var(--wa-form-control-value-font-weight);
    line-height: var(--wa-form-control-value-line-height);
    overflow: hidden;
    padding: 0 var(--wa-form-control-padding-inline);
    position: relative;
    vertical-align: middle;
    transition:
      background-color var(--wa-transition-normal),
      border-color var(--wa-transition-normal),
      outline-color var(--wa-transition-fast);
    transition-timing-function: var(--wa-transition-easing);
    outline: var(--wa-focus-ring-style) var(--wa-focus-ring-width) transparent;
    outline-offset: var(--wa-focus-ring-offset);

    /* Pills */
    :host([pill]) & {
      border-radius: var(--wa-border-radius-pill);
    }
  }

  /* Appearance modifiers */
  :host([appearance='outlined']) .combobox {
    background-color: var(--wa-form-control-background-color);
    border-color: var(--wa-form-control-border-color);
  }

  :host([appearance='filled']) .combobox {
    background-color: var(--wa-color-neutral-fill-quiet);
    border-color: var(--wa-color-neutral-fill-quiet);
  }

  :host([appearance='filled-outlined']) .combobox {
    background-color: var(--wa-color-neutral-fill-quiet);
    border-color: var(--wa-form-control-border-color);
  }

  .display-input {
    position: relative;
    width: 100%;
    font: inherit;
    border: none;
    background: none;
    line-height: var(--wa-form-control-value-line-height);
    color: var(--wa-form-control-value-color);
    cursor: inherit;
    overflow: hidden;
    padding: 0;
    margin: 0;
    -webkit-appearance: none;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: var(--wa-form-control-placeholder-color);
    }
  }

  /* Manage spacing when tags are present */
  :host([multiple]) {
    --_padding-with-tags: calc(var(--wa-form-control-height) * 0.1 - var(--wa-form-control-border-width));

    & .combobox:has(.tags wa-tag) {
      padding-block: var(--_padding-with-tags);
      padding-inline-start: var(--_padding-with-tags);
    }
  }

  /* Visually hide the display input when multiple is enabled */
  :host([multiple]) .combobox:has(.tags wa-tag) .display-input {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }

  .value-input {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    padding: 0;
    margin: 0;
  }

  .tags {
    display: flex;
    flex: 1;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.25em;

    /* Nested inside the box, so a step down from the box's radius */
    & wa-tag:not([pill]) {
      border-radius: var(--wa-border-radius-s);
    }

    .disabled & {
      cursor: not-allowed !important;
    }
  }

  /* Start and End */

  .start,
  .end {
    flex: 0;
    display: inline-flex;
    align-items: center;
    color: var(--wa-color-neutral-on-quiet);
  }

  .end::slotted(*) {
    margin-inline-start: var(--wa-form-control-padding-inline);
  }

  .start::slotted(*) {
    margin-inline-end: var(--wa-form-control-padding-inline);
  }

  :host([multiple]) .combobox:has(.tags wa-tag) .start::slotted(*) {
    margin-inline-start: calc(var(--wa-form-control-padding-inline) - var(--_padding-with-tags));
  }

  /* Clear button */
  [part~='clear-button'] {
    flex: 0 0 auto;
    display: inline-flex;
    align-self: stretch;
    align-items: center;
    justify-content: center;
    inline-size: 1.5em;
    font-size: inherit;
    color: var(--wa-color-neutral-on-quiet);
    border: none;
    background: none;
    padding: 0;
    transition: color var(--wa-transition-normal);
    cursor: pointer;
    /* The box is wider than the glyph, so overhang half that growth on each side. Keeps the glyph
       on the same trailing axis as the segmented-field pickers' clear buttons. */
    margin-inline-start: calc(var(--wa-form-control-padding-inline) - 0.125em);
    margin-inline-end: -0.125em;

    &:focus {
      outline: none;
    }

    @media (hover: hover) {
      &:hover {
        color: color-mix(in oklab, currentColor, var(--wa-color-mix-hover));
      }
    }

    &:active {
      color: color-mix(in oklab, currentColor, var(--wa-color-mix-active));
    }
  }

  /* Expand icon */
  .expand-icon {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    color: var(--wa-color-neutral-on-quiet);
    transition: rotate var(--wa-transition-slow) var(--wa-transition-easing);
    rotate: 0deg;
    margin-inline-start: var(--wa-form-control-padding-inline);

    .open & {
      rotate: -180deg;
    }
  }

  /* Listbox */
  .listbox {
    display: block;
    position: relative;
    font: inherit;
    box-shadow: var(--wa-shadow-m);
    background: var(--wa-color-surface-raised);
    border-color: var(--wa-color-surface-border);
    border-radius: var(--wa-border-radius-m);
    border-style: var(--wa-border-style);
    border-width: var(--wa-border-width-s);
    padding: 0.25em;
    overflow: auto;
    overscroll-behavior: none;

    /* Make sure it adheres to the popup's auto size */
    max-width: var(--auto-size-available-width);
    max-height: var(--auto-size-available-height);

    &::slotted(wa-divider) {
      --spacing: 0.5em;
    }
  }

  /* Space options with half the listbox's padding */
  .listbox slot:not([name]) {
    display: flex;
    flex-direction: column;
    gap: 0.125em;
  }

  slot:not([name])::slotted(small) {
    display: block;
    font-size: var(--wa-font-size-smaller);
    font-weight: var(--wa-font-weight-semibold);
    color: var(--wa-color-text-quiet);
    padding-block: 0.5em;
    padding-inline: 2.25em;
  }
`;function ch(s,t){return{top:Math.round(s.getBoundingClientRect().top-t.getBoundingClientRect().top),left:Math.round(s.getBoundingClientRect().left-t.getBoundingClientRect().left)}}function Ns(s,t,e="vertical",i="smooth"){let n=ch(s,t),o=n.top+t.scrollTop,r=n.left+t.scrollLeft,a=t.scrollLeft,l=t.scrollLeft+t.offsetWidth,h=t.scrollTop,c=t.scrollTop+t.offsetHeight;(e==="horizontal"||e==="both")&&(r<a?t.scrollTo({left:r,behavior:i}):r+s.clientWidth>l&&t.scrollTo({left:r-t.offsetWidth+s.clientWidth,behavior:i})),(e==="vertical"||e==="both")&&(o<h?t.scrollTo({top:o,behavior:i}):o+s.clientHeight>c&&t.scrollTo({top:o-t.offsetHeight+s.clientHeight,behavior:i}))}var Rr=class extends Event{constructor(){super("wa-show",{bubbles:!0,cancelable:!0,composed:!0})}};var Nr=class extends Event{constructor(s){super("wa-hide",{bubbles:!0,cancelable:!0,composed:!0}),this.detail=s}};var Or=class extends Event{constructor(){super("wa-after-hide",{bubbles:!0,cancelable:!1,composed:!0})}};var Fr=class extends Event{constructor(){super("wa-after-show",{bubbles:!0,cancelable:!1,composed:!0})}};var Ir=class extends Event{constructor(){super("wa-clear",{bubbles:!0,cancelable:!1,composed:!0})}};var Kt=[];function Br(s){Os(s),Kt.push(s)}function Os(s){for(let t=Kt.length-1;t>=0;t--)if(Kt[t]===s){Kt.splice(t,1);break}}function Vr(s){return Kt.length>0&&Kt[Kt.length-1]===s}var qr=(s={})=>{let{validationElement:t,validationProperty:e}=s;t||typeof document<"u"&&"createElement"in document&&(t=Object.assign(document.createElement("input"),{required:!0})),e||(e="value");let i={observedAttributes:["required"],message:t?.validationMessage,checkValidity(n){let o={message:"",isValid:!0,invalidKeys:[]};return(n.required??n.hasAttribute("required"))&&!n[e]&&(o.message=typeof i.message=="function"?i.message(n):i.message||"",o.isValid=!1,o.invalidKeys.push("valueMissing")),o}};return i};var Dr=F`
  :host {
    display: flex;
    flex-direction: column;
  }

  /* Treat wrapped labels, inputs, and hints as direct children of the host element */
  [part~='form-control'] {
    display: contents;
  }

  /* Label */
  :is([part~='form-control-label'], [part~='label']):has(*:not(:empty)),
  :is([part~='form-control-label'], [part~='label']).has-label {
    display: inline-flex;
    color: var(--wa-form-control-label-color);
    font-weight: var(--wa-form-control-label-font-weight);
    line-height: var(--wa-form-control-label-line-height);
    margin-block-end: 0.5em;
  }

  :host([required]) :is([part~='form-control-label'], [part~='label'])::after {
    content: var(--wa-form-control-required-content);
    margin-inline-start: var(--wa-form-control-required-content-offset);
    color: var(--wa-form-control-required-content-color);
  }

  /* Help text */
  [part~='hint'] {
    display: block;
    color: var(--wa-form-control-hint-color);
    font-weight: var(--wa-form-control-hint-font-weight);
    line-height: var(--wa-form-control-hint-line-height);
    margin-block-start: 0.5em;
    font-size: var(--wa-font-size-smaller);

    &:not(.has-slotted, .has-hint, .has-count) {
      display: none;
    }
  }
`;function Fs(s,t){return new Promise(e=>{function i(n){n.target===s&&(s.removeEventListener(t,i),e())}s.addEventListener(t,i)})}function Is(s,t){return new Promise(e=>{let i=new AbortController,{signal:n}=i;if(s.classList.contains(t))return;s.classList.add(t);let o=!1,r=()=>{o||(o=!0,s.classList.remove(t),e(),i.abort())};s.addEventListener("animationend",r,{once:!0,signal:n}),s.addEventListener("animationcancel",r,{once:!0,signal:n}),requestAnimationFrame(()=>{!o&&s.getAnimations().length===0&&r()})})}var Ve=class extends ue{constructor(t){if(super(t),this.it=I,t.type!==yi.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===I||t==null)return this._t=void 0,this.it=t;if(t===lt)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;let e=[t];return e.raw=e,this._t={_$litType$:this.constructor.resultType,strings:e,values:[]}}};Ve.directiveName="unsafeHTML",Ve.resultType=1;var Wr=xi(Ve);var A=class extends ot{constructor(){super(...arguments),this.assumeInteractionOn=["blur","input"],this.cachedOptions=null,this.hasSlotController=new he(this,"hint","label"),this.localize=new rt(this),this.selectionOrder=new Map,this.typeToSelectString="",this.slotChangePending=!1,this.displayLabel="",this.selectedOptions=[],this.name="",this._defaultValue=null,this.size="m",this.placeholder="",this.multiple=!1,this.maxOptionsVisible=3,this.disabled=!1,this.withClear=!1,this.open=!1,this.appearance="outlined",this.pill=!1,this.label="",this.placement="bottom",this.hint="",this.withLabel=!1,this.withHint=!1,this.required=!1,this.getTag=s=>N`
        <wa-tag
          part="tag"
          exportparts="
            base:tag__base,
            content:tag__content,
            remove-button:tag__remove-button,
            remove-button__base:tag__remove-button__base
          "
          ?pill=${this.pill}
          size=${this.size}
          with-remove
          data-value=${s.value}
          @wa-remove=${t=>this.handleTagRemove(t,s)}
        >
          ${s.label}
        </wa-tag>
      `,this.handleDocumentFocusIn=s=>{let t=s.composedPath();this&&!t.includes(this)&&this.hide()},this.handleDocumentKeyDown=s=>{let t=s.target,e=t.closest('[part~="clear-button"]')!==null,i=t.closest("wa-button")!==null;if(!(e||i)){if(s.key==="Escape"&&this.open&&Vr(this)&&(s.preventDefault(),s.stopPropagation(),this.hide(),this.displayInput.focus({preventScroll:!0})),s.key==="Enter"||s.key===" "&&this.typeToSelectString===""){if(s.preventDefault(),s.stopImmediatePropagation(),!this.open){this.show();return}this.currentOption&&!this.currentOption.disabled&&(this.valueHasChanged=!0,this.hasInteracted=!0,this.multiple?this.toggleOptionSelection(this.currentOption):this.setSelectedOptions(this.currentOption),this.updateComplete.then(()=>{this.dispatchEvent(new InputEvent("input",{bubbles:!0,composed:!0})),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))}),this.multiple||(this.hide(),this.displayInput.focus({preventScroll:!0})));return}if(["ArrowUp","ArrowDown","Home","End"].includes(s.key)){let n=this.getAllOptions(),o=n.indexOf(this.currentOption),r=Math.max(0,o);if(s.preventDefault(),!this.open&&(this.show(),this.currentOption))return;s.key==="ArrowDown"?(r=o+1,r>n.length-1&&(r=0)):s.key==="ArrowUp"?(r=o-1,r<0&&(r=n.length-1)):s.key==="Home"?r=0:s.key==="End"&&(r=n.length-1),this.setCurrentOption(n[r])}if(s.key?.length===1||s.key==="Backspace"){let n=this.getAllOptions();if(s.metaKey||s.ctrlKey||s.altKey)return;if(!this.open){if(s.key==="Backspace")return;this.show()}s.stopPropagation(),s.preventDefault(),clearTimeout(this.typeToSelectTimeout),this.typeToSelectTimeout=window.setTimeout(()=>this.typeToSelectString="",1e3),s.key==="Backspace"?this.typeToSelectString=this.typeToSelectString.slice(0,-1):this.typeToSelectString+=s.key.toLowerCase();for(let o of n)if(o.label.toLowerCase().startsWith(this.typeToSelectString)){this.setCurrentOption(o);break}}}},this.handleDocumentMouseDown=s=>{let t=s.composedPath();this&&!t.includes(this)&&this.hide()}}static get validators(){let s=[qr({validationElement:Object.assign(document.createElement("select"),{required:!0})})];return[...super.validators,...s]}get validationTarget(){return this.valueInput}set defaultValue(s){this._defaultValue=this.convertDefaultValue(s)}get defaultValue(){return this.convertDefaultValue(this._defaultValue)}rawValuesEqual(s,t){return s==null&&t==null?!0:s==null||t==null||s.length!==t.length?!1:s.every((e,i)=>e===t[i])}convertDefaultValue(s){return!(this.multiple||this.hasAttribute("multiple"))&&Array.isArray(s)&&(s=s[0]),s}set value(s){let t=this.value;s instanceof FormData&&(s=s.getAll(this.name)),s!=null&&!Array.isArray(s)&&(s=[s]);let e=this._value;this._value=s??null,this.rawValuesEqual(e,this._value)||(this.valueHasChanged=!0,this.requestUpdate("value",t))}get value(){let s=this._value??this.defaultValue??null;s!=null&&(s=Array.isArray(s)?s:[s]),this.optionValues=new Set(this.getAllOptions().filter(e=>!e.disabled).map(e=>e.value));let t=s;return s!=null&&(t=s.filter(e=>this.optionValues.has(e)),t=this.multiple?t:t[0],t=t??null),t}handleSizeChange(){Pt(this.localName,this.size)}connectedCallback(){super.connectedCallback(),this.processSlotChange(),this.open=!1}disconnectedCallback(){super.disconnectedCallback(),this.removeOpenListeners(),this.cachedOptions=null}updateDefaultValue(){let t=this.getAllOptions().filter(e=>e.hasAttribute("selected")||e.defaultSelected);if(t.length>0){let e=t.map(i=>i.value);this._defaultValue=this.multiple?e:e[0]}this.hasAttribute("value")&&(this._defaultValue=this.getAttribute("value")||null)}addOpenListeners(){document.addEventListener("focusin",this.handleDocumentFocusIn),document.addEventListener("keydown",this.handleDocumentKeyDown),document.addEventListener("mousedown",this.handleDocumentMouseDown),Br(this),this.getRootNode()!==document&&this.getRootNode().addEventListener("focusin",this.handleDocumentFocusIn)}removeOpenListeners(){document.removeEventListener("focusin",this.handleDocumentFocusIn),document.removeEventListener("keydown",this.handleDocumentKeyDown),document.removeEventListener("mousedown",this.handleDocumentMouseDown),Os(this),this.getRootNode()!==document&&this.getRootNode().removeEventListener("focusin",this.handleDocumentFocusIn)}handleFocus(){this.displayInput.setSelectionRange(0,0)}handleLabelClick(){this.displayInput.focus()}handleComboboxClick(s){s.preventDefault()}handleComboboxMouseDown(s){let e=s.composedPath().some(i=>i instanceof Element&&i.tagName.toLowerCase()==="wa-button");this.disabled||e||(s.preventDefault(),this.displayInput.focus({preventScroll:!0}),this.open=!this.open)}handleComboboxKeyDown(s){s.stopPropagation(),this.handleDocumentKeyDown(s)}handleClearClick(s){s.stopPropagation(),this.hasInteracted=!0,this.valueHasChanged=!0,this.value!==null&&(this.displayLabel="",this.selectionOrder.clear(),this.setSelectedOptions([]),this.displayInput.focus({preventScroll:!0}),this.updateComplete.then(()=>{this.dispatchEvent(new Ir),this.dispatchEvent(new InputEvent("input",{bubbles:!0,composed:!0})),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))}))}handleClearMouseDown(s){s.stopPropagation(),s.preventDefault()}handleOptionClick(s){let e=s.target.closest("wa-option");e&&!e.disabled&&(this.hasInteracted=!0,this.valueHasChanged=!0,this.multiple?this.toggleOptionSelection(e):this.setSelectedOptions(e),this.updateComplete.then(()=>this.displayInput.focus({preventScroll:!0})),this.requestUpdate("value"),this.updateComplete.then(()=>{this.dispatchEvent(new InputEvent("input",{bubbles:!0,composed:!0})),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))}),this.multiple||(this.hide(),this.displayInput.focus({preventScroll:!0})))}handleDefaultSlotChange(){this.slotChangePending||(this.slotChangePending=!0,queueMicrotask(()=>{this.slotChangePending=!1,this.processSlotChange()}))}processSlotChange(){if(customElements.get("wa-option")||customElements.whenDefined("wa-option").then(()=>this.handleDefaultSlotChange()),this.didSSR&&!this.hasUpdated){this.updateComplete.then(()=>{this.handleDefaultSlotChange()});return}this.cachedOptions=null;let s=this.getAllOptions();this.updateDefaultValue();let t=this.value;if(t==null||!this.valueHasChanged&&!this.hasInteracted){this.selectionChanged();return}Array.isArray(t)||(t=[t]);let e=s.filter(i=>t.includes(i.value));this.setSelectedOptions(e)}handleTagRemove(s,t){if(s.stopPropagation(),this.disabled)return;this.hasInteracted=!0,this.valueHasChanged=!0;let e=t;if(!e){let i=s.target.closest("wa-tag[data-value]");if(i){let n=i.dataset.value;e=this.selectedOptions.find(o=>o.value===n)}}e&&(this.toggleOptionSelection(e,!1),this.updateComplete.then(()=>{this.dispatchEvent(new InputEvent("input",{bubbles:!0,composed:!0})),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))}))}getAllOptions(){return this.cachedOptions?this.cachedOptions:this?.querySelectorAll?(this.cachedOptions=[...this.querySelectorAll("wa-option")],this.cachedOptions):[]}getFirstOption(){return this.querySelector("wa-option")}setCurrentOption(s){this.getAllOptions().forEach(e=>{e.current=!1,e.tabIndex=-1}),s&&(this.currentOption=s,s.current=!0,s.tabIndex=0,s.focus({preventScroll:!0}),this.open&&!this.listbox.hidden&&Ns(s,this.listbox,"vertical","auto"))}setSelectedOptions(s){let t=this.getAllOptions(),e=Array.isArray(s)?s:[s];t.forEach(i=>{e.includes(i)||(i.selected=!1)}),e.length&&e.forEach(i=>i.selected=!0),this.selectionChanged()}toggleOptionSelection(s,t){t===!0||t===!1?s.selected=t:s.selected=!s.selected,this.selectionChanged()}selectionChanged(){let t=this.getAllOptions().filter(r=>{if(!this.hasInteracted&&!this.valueHasChanged){let a=this.defaultValue,l=Array.isArray(a)?a:[a];return r.hasAttribute("selected")||r.defaultSelected||r.selected||l?.includes(r.value)}return r.selected}),e=new Set(t.map(r=>r.value));for(let r of this.selectionOrder.keys())e.has(r)||this.selectionOrder.delete(r);let n=(this.selectionOrder.size>0?Math.max(...this.selectionOrder.values()):-1)+1;for(let r of t)this.selectionOrder.has(r.value)||this.selectionOrder.set(r.value,n++);this.selectedOptions=t.sort((r,a)=>{let l=this.selectionOrder.get(r.value)??0,h=this.selectionOrder.get(a.value)??0;return l-h});let o=new Set(this.selectedOptions.map(r=>r.value));if(o.size>0||this._value){let r=this._value;if(this._value==null){let a=this.defaultValue??[];this._value=Array.isArray(a)?a:[a]}this._value=this._value?.filter(a=>!this.optionValues?.has(a))??null,this._value?.unshift(...o),this.requestUpdate("value",r)}if(this.multiple)this.placeholder&&!this.value?.length?this.displayLabel="":this.displayLabel=this.localize.term("numOptionsSelected",this.selectedOptions.length);else{let r=this.selectedOptions[0];this.displayLabel=r?.label??""}this.updateComplete.then(()=>{this.updateValidity()})}get tags(){return this.selectedOptions.map((s,t)=>{if(t<this.maxOptionsVisible||this.maxOptionsVisible<=0){let e=this.getTag(s,t);return e?typeof e=="string"?Wr(e):e:null}else if(t===this.maxOptionsVisible)return N`
          <wa-tag
            part="tag"
            exportparts="
              base:tag__base,
              content:tag__content,
              remove-button:tag__remove-button,
              remove-button__base:tag__remove-button__base
            "
            ?pill=${this.pill}
            size=${this.size}
            >+${this.selectedOptions.length-t}</wa-tag
          >
        `;return null})}updated(s){super.updated(s),(s.has("value")||s.has("displayLabel"))&&this.customStates.set("blank",!this.value&&!this.displayLabel)}handleDisabledChange(){this.disabled&&this.open&&(this.open=!1)}handleValueChange(){let s=this.getAllOptions(),t=Array.isArray(this.value)?this.value:[this.value],e=s.filter(i=>t.includes(i.value));this.setSelectedOptions(e),this.updateValidity()}async handleOpenChange(){if(this.open&&!this.disabled){this.setCurrentOption(this.selectedOptions[0]||this.getFirstOption());let s=new Rr;if(this.dispatchEvent(s),s.defaultPrevented){this.open=!1;return}this.addOpenListeners(),this.listbox.hidden=!1,this.popup.active=!0,requestAnimationFrame(()=>{this.setCurrentOption(this.currentOption)}),await Is(this.popup.popup,"show"),this.currentOption&&Ns(this.currentOption,this.listbox,"vertical","auto"),this.dispatchEvent(new Fr)}else{let s=new Nr;if(this.dispatchEvent(s),s.defaultPrevented){this.open=!1;return}this.removeOpenListeners(),await Is(this.popup.popup,"hide"),this.listbox.hidden=!0,this.popup.active=!1,this.dispatchEvent(new Or)}}async show(){if(this.open||this.disabled){this.open=!1;return}return this.open=!0,Fs(this,"wa-after-show")}async hide(){if(!this.open||this.disabled){this.open=!1;return}return this.open=!1,Fs(this,"wa-after-hide")}focus(s){this.displayInput.focus(s)}blur(){this.displayInput.blur()}formResetCallback(){this.selectionOrder.clear(),this.value=this.defaultValue,super.formResetCallback(),this.handleValueChange(),this.updateComplete.then(()=>{this.dispatchEvent(new InputEvent("input",{bubbles:!0,composed:!0})),this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))})}render(){let s=this.hasSlotController.test("label","withLabel"),t=this.hasSlotController.test("hint","withHint"),e=this.label?!0:!!s,i=this.hint?!0:!!t,n=(this.hasUpdated||!1)&&this.withClear&&!this.disabled&&(this.displayLabel||this.value&&this.value.length>0);return N`
      <div
        part="form-control"
        class=${et({"form-control":!0,"form-control-has-label":e})}
      >
        <label
          id="label"
          part="form-control-label label"
          class=${et({label:!0,"has-label":e})}
          aria-hidden=${e?"false":"true"}
          @click=${this.handleLabelClick}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <wa-popup
            class=${et({select:!0,open:this.open,disabled:this.disabled,enabled:!this.disabled,multiple:this.multiple})}
            placement=${this.placement}
            flip
            shift
            sync="width"
            auto-size="vertical"
            auto-size-padding="10"
          >
            <div
              part="combobox"
              class="combobox"
              slot="anchor"
              @keydown=${this.handleComboboxKeyDown}
              @mousedown=${this.handleComboboxMouseDown}
              @click=${this.handleComboboxClick}
            >
              <slot part="start" name="start" class="start"></slot>

              <input
                part="display-input"
                class="display-input"
                type="text"
                placeholder=${this.placeholder}
                .disabled=${this.disabled}
                .value=${this.displayLabel}
                ?required=${this.required}
                autocomplete="off"
                spellcheck="false"
                autocapitalize="off"
                readonly
                aria-invalid=${!this.validity.valid}
                aria-controls="listbox"
                aria-expanded=${this.open?"true":"false"}
                aria-haspopup="listbox"
                aria-labelledby="label"
                aria-disabled=${this.disabled?"true":"false"}
                aria-describedby="hint"
                role="combobox"
                tabindex="0"
                @focus=${this.handleFocus}
              />

              <!-- Tags need to wait for first hydration before populating otherwise it will create a hydration mismatch. -->
              ${this.multiple&&this.hasUpdated?N`<div part="tags" class="tags" @wa-remove=${this.handleTagRemove}>${this.tags}</div>`:""}

              <input
                class="value-input"
                type="text"
                ?disabled=${this.disabled}
                ?required=${this.required}
                .value=${Array.isArray(this.value)?this.value.join(", "):this.value}
                tabindex="-1"
                aria-hidden="true"
                @focus=${()=>this.focus()}
              />

              ${n?N`
                    <button
                      part="clear-button"
                      type="button"
                      aria-label=${this.localize.term("clearEntry")}
                      @mousedown=${this.handleClearMouseDown}
                      @click=${this.handleClearClick}
                      tabindex="-1"
                    >
                      <slot name="clear-icon">
                        <wa-icon name="circle-xmark" library="system" variant="regular"></wa-icon>
                      </slot>
                    </button>
                  `:""}

              <slot name="end" part="end" class="end"></slot>

              <slot name="expand-icon" part="expand-icon" class="expand-icon">
                <wa-icon library="system" name="chevron-down" variant="solid"></wa-icon>
              </slot>
            </div>

            <div
              id="listbox"
              role="listbox"
              aria-expanded=${this.open?"true":"false"}
              aria-multiselectable=${this.multiple?"true":"false"}
              aria-labelledby="label"
              part="listbox"
              class="listbox"
              tabindex="-1"
              @mouseup=${this.handleOptionClick}
            >
              <slot @slotchange=${this.handleDefaultSlotChange}></slot>
            </div>
          </wa-popup>
        </div>

        <slot
          id="hint"
          name="hint"
          part="hint"
          class=${et({"has-slotted":i})}
          aria-hidden=${i?"false":"true"}
          >${this.hint}</slot
        >
      </div>
    `}};A.css=[$r,Dr,pt];p([Z(".select")],A.prototype,"popup",2);p([Z(".combobox")],A.prototype,"combobox",2);p([Z(".display-input")],A.prototype,"displayInput",2);p([Z(".value-input")],A.prototype,"valueInput",2);p([Z(".listbox")],A.prototype,"listbox",2);p([ht()],A.prototype,"displayLabel",2);p([ht()],A.prototype,"currentOption",2);p([ht()],A.prototype,"selectedOptions",2);p([y({reflect:!0})],A.prototype,"name",2);p([y({attribute:!1})],A.prototype,"defaultValue",1);p([y({attribute:"value",reflect:!1})],A.prototype,"value",1);p([y({reflect:!0})],A.prototype,"size",2);p([Q("size")],A.prototype,"handleSizeChange",1);p([y()],A.prototype,"placeholder",2);p([y({type:Boolean,reflect:!0})],A.prototype,"multiple",2);p([y({attribute:"max-options-visible",type:Number})],A.prototype,"maxOptionsVisible",2);p([y({type:Boolean})],A.prototype,"disabled",2);p([y({attribute:"with-clear",type:Boolean})],A.prototype,"withClear",2);p([y({type:Boolean,reflect:!0})],A.prototype,"open",2);p([y({reflect:!0})],A.prototype,"appearance",2);p([y({type:Boolean,reflect:!0})],A.prototype,"pill",2);p([y()],A.prototype,"label",2);p([y({reflect:!0})],A.prototype,"placement",2);p([y({attribute:"hint"})],A.prototype,"hint",2);p([y({attribute:"with-label",type:Boolean})],A.prototype,"withLabel",2);p([y({attribute:"with-hint",type:Boolean})],A.prototype,"withHint",2);p([y({type:Boolean,reflect:!0})],A.prototype,"required",2);p([y({attribute:!1})],A.prototype,"getTag",2);p([Q("disabled",{waitUntilFirstUpdate:!0})],A.prototype,"handleDisabledChange",1);p([Q("value",{waitUntilFirstUpdate:!0})],A.prototype,"handleValueChange",1);p([Q("open",{waitUntilFirstUpdate:!0})],A.prototype,"handleOpenChange",1);A=p([H("wa-select")],A);A.disableWarning?.("change-in-update");var Ur=class extends Event{constructor(){super("wa-remove",{bubbles:!0,cancelable:!1,composed:!0})}};var Hr=F`
  @layer wa-component {
    :host {
      display: inline-flex;
      gap: 0.5em;
      border-radius: var(--wa-border-radius-m);
      align-items: center;
      background-color: var(--wa-color-fill-quiet, var(--wa-color-neutral-fill-quiet));
      border-color: var(--wa-color-border-normal, var(--wa-color-neutral-border-normal));
      border-style: var(--wa-border-style);
      border-width: var(--wa-border-width-s);
      color: var(--wa-color-on-quiet, var(--wa-color-neutral-on-quiet));
      font-size: inherit;
      line-height: 1;
      white-space: nowrap;
      user-select: none;
      -webkit-user-select: none;
      height: calc(var(--wa-form-control-height) * 0.8);
      line-height: calc(var(--wa-form-control-height) - var(--wa-form-control-border-width) * 2);
      padding: 0 0.75em;
    }

    /* Appearance modifiers */
    :host([appearance='outlined']) {
      color: var(--wa-color-on-quiet, var(--wa-color-neutral-on-quiet));
      background-color: transparent;
      border-color: var(--wa-color-border-loud, var(--wa-color-neutral-border-loud));
    }

    :host([appearance='filled']) {
      color: var(--wa-color-on-quiet, var(--wa-color-neutral-on-quiet));
      background-color: var(--wa-color-fill-quiet, var(--wa-color-neutral-fill-quiet));
      border-color: transparent;
    }

    :host([appearance='filled-outlined']) {
      color: var(--wa-color-on-quiet, var(--wa-color-neutral-on-quiet));
      background-color: var(--wa-color-fill-quiet, var(--wa-color-neutral-fill-quiet));
      border-color: var(--wa-color-border-normal, var(--wa-color-neutral-border-normal));
    }

    :host([appearance='accent']) {
      color: var(--wa-color-on-loud, var(--wa-color-neutral-on-loud));
      background-color: var(--wa-color-fill-loud, var(--wa-color-neutral-fill-loud));
      border-color: transparent;
    }
  }

  .content {
    font-size: var(--wa-font-size-smaller);
  }

  [part='remove-button'] {
    line-height: 1;
  }

  [part='remove-button']::part(base) {
    padding: 0;
    height: 1em;
    width: 1em;
    color: currentColor;
  }

  @media (hover: hover) {
    :host(:hover) > [part='remove-button']::part(base) {
      background-color: transparent;
      color: color-mix(in oklab, currentColor, var(--wa-color-mix-hover));
    }
  }

  :host(:active) > [part='remove-button']::part(base) {
    background-color: transparent;
    color: color-mix(in oklab, currentColor, var(--wa-color-mix-active));
  }

  /*
   * Pill modifier
   */
  :host([pill]) {
    border-radius: var(--wa-border-radius-pill);
  }
`;var _t=class extends U{constructor(){super(...arguments),this.localize=new rt(this),this.variant="neutral",this.appearance="filled-outlined",this.size="m",this.pill=!1,this.withRemove=!1}handleSizeChange(){Pt(this.localName,this.size)}handleRemoveClick(){this.dispatchEvent(new Ur)}render(){return N`
      <slot part="content" class="content"></slot>

      ${this.withRemove?N`
            <wa-button
              part="remove-button"
              exportparts="base:remove-button__base"
              class="remove"
              appearance="plain"
              size=${this.size}
              @click=${this.handleRemoveClick}
              tabindex="-1"
            >
              <wa-icon name="xmark" library="system" variant="solid" label=${this.localize.term("remove")}></wa-icon>
            </wa-button>
          `:""}
    `}};_t.css=[Hr,le,pt];p([y({reflect:!0})],_t.prototype,"variant",2);p([y({reflect:!0})],_t.prototype,"appearance",2);p([y({reflect:!0})],_t.prototype,"size",2);p([Q("size")],_t.prototype,"handleSizeChange",1);p([y({type:Boolean,reflect:!0})],_t.prototype,"pill",2);p([y({attribute:"with-remove",type:Boolean})],_t.prototype,"withRemove",2);_t=p([H("wa-tag")],_t);var jr=class extends Event{constructor(){super("wa-reposition",{bubbles:!0,cancelable:!1,composed:!0})}};var Kr=F`
  :host {
    --arrow-color: black;
    --arrow-size: var(--wa-tooltip-arrow-size);
    --popup-border-width: 0px;
    --show-duration: var(--wa-transition-fast);
    --hide-duration: var(--wa-transition-fast);

    /*
     * These properties are computed to account for the arrow's dimensions after being rotated 45º. The constant
     * 0.7071 is derived from sin(45) to calculate the length of the arrow after rotation.
     *
     * The diamond will be translated inward by --arrow-base-offset, the border thickness, to centralise it on
     * the inner edge of the popup border. This also means we need to increase the size of the arrow by the
     * same amount to compensate.
     *
     * A diamond shaped clipping mask is used to avoid overlap of popup content. This extends slightly inward so
     * the popup border is covered with no sub-pixel rounding artifacts. The diamond corners are mitred at 22.5º
     * to properly merge any arrow border with the popup border. The constant 1.4142 is derived from 1 + tan(22.5).
     *
     */
    --arrow-base-offset: var(--popup-border-width);
    --arrow-size-diagonal: calc((var(--arrow-size) + var(--arrow-base-offset)) * 0.7071);
    --arrow-padding-offset: calc(var(--arrow-size-diagonal) - var(--arrow-size));
    --arrow-size-div: calc(var(--arrow-size-diagonal) * 2);
    --arrow-clipping-corner: calc(var(--arrow-base-offset) * 1.4142);

    display: contents;
  }

  .popup {
    position: absolute;
    isolation: isolate;
    max-width: var(--auto-size-available-width, none);
    max-height: var(--auto-size-available-height, none);

    /* Clear UA styles for [popover] */
    :where(&) {
      inset: unset;
      padding: unset;
      margin: unset;
      width: unset;
      height: unset;
      color: unset;
      background: unset;
      border: unset;
      overflow: unset;
    }
  }

  .popup-fixed {
    position: fixed;
  }

  .popup:not(.popup-active) {
    display: none;
  }

  .arrow {
    position: absolute;
    width: var(--arrow-size-div);
    height: var(--arrow-size-div);
    background: var(--arrow-color);
    z-index: 3;
    clip-path: polygon(
      var(--arrow-clipping-corner) 100%,
      var(--arrow-base-offset) calc(100% - var(--arrow-base-offset)),
      calc(var(--arrow-base-offset) - 2px) calc(100% - var(--arrow-base-offset)),
      calc(100% - var(--arrow-base-offset)) calc(var(--arrow-base-offset) - 2px),
      calc(100% - var(--arrow-base-offset)) var(--arrow-base-offset),
      100% var(--arrow-clipping-corner),
      100% 100%
    );
    rotate: 45deg;
  }

  :host([data-current-placement|='left']) .arrow {
    rotate: -45deg;
  }

  :host([data-current-placement|='right']) .arrow {
    rotate: 135deg;
  }

  :host([data-current-placement|='bottom']) .arrow {
    rotate: 225deg;
  }

  /* Hover bridge */
  .popup-hover-bridge:not(.popup-hover-bridge-visible) {
    display: none;
  }

  .popup-hover-bridge {
    position: fixed;
    z-index: 899;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    clip-path: polygon(
      var(--hover-bridge-top-left-x, 0) var(--hover-bridge-top-left-y, 0),
      var(--hover-bridge-top-right-x, 0) var(--hover-bridge-top-right-y, 0),
      var(--hover-bridge-bottom-right-x, 0) var(--hover-bridge-bottom-right-y, 0),
      var(--hover-bridge-bottom-left-x, 0) var(--hover-bridge-bottom-left-y, 0)
    );
  }

  /* Built-in animations */
  .show {
    animation: show var(--show-duration) ease;
  }

  .hide {
    animation: show var(--hide-duration) ease reverse;
  }

  @keyframes show {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .show-with-scale {
    animation: show-with-scale var(--show-duration) ease;
  }

  .hide-with-scale {
    animation: show-with-scale var(--hide-duration) ease reverse;
  }

  @keyframes show-with-scale {
    from {
      opacity: 0;
      scale: 0.8;
    }
    to {
      opacity: 1;
      scale: 1;
    }
  }
`;var gt=Math.min,dt=Math.max,De=Math.round,We=Math.floor,vt=s=>({x:s,y:s}),uh={left:"right",right:"left",bottom:"top",top:"bottom"};function Bs(s,t,e){return dt(s,gt(t,e))}function Yt(s,t){return typeof s=="function"?s(t):s}function Nt(s){return s.split("-")[0]}function Qt(s){return s.split("-")[1]}function Vs(s){return s==="x"?"y":"x"}function Li(s){return s==="y"?"height":"width"}function bt(s){let t=s[0];return t==="t"||t==="b"?"y":"x"}function Ei(s){return Vs(bt(s))}function Gr(s,t,e){e===void 0&&(e=!1);let i=Qt(s),n=Ei(s),o=Li(n),r=n==="x"?i===(e?"end":"start")?"right":"left":i==="start"?"bottom":"top";return t.reference[o]>t.floating[o]&&(r=qe(r)),[r,qe(r)]}function Xr(s){let t=qe(s);return[_i(s),t,_i(t)]}function _i(s){return s.includes("start")?s.replace("start","end"):s.replace("end","start")}var Yr=["left","right"],Qr=["right","left"],dh=["top","bottom"],mh=["bottom","top"];function fh(s,t,e){switch(s){case"top":case"bottom":return e?t?Qr:Yr:t?Yr:Qr;case"left":case"right":return t?dh:mh;default:return[]}}function Jr(s,t,e,i){let n=Qt(s),o=fh(Nt(s),e==="start",i);return n&&(o=o.map(r=>r+"-"+n),t&&(o=o.concat(o.map(_i)))),o}function qe(s){let t=Nt(s);return uh[t]+s.slice(t.length)}function ph(s){var t,e,i,n;return{top:(t=s.top)!=null?t:0,right:(e=s.right)!=null?e:0,bottom:(i=s.bottom)!=null?i:0,left:(n=s.left)!=null?n:0}}function qs(s){return typeof s!="number"?ph(s):{top:s,right:s,bottom:s,left:s}}function Gt(s){let{x:t,y:e,width:i,height:n}=s;return{width:i,height:n,top:e,left:t,right:t+i,bottom:e+n,x:t,y:e}}function Zr(s,t,e){let{reference:i,floating:n}=s,o=bt(t),r=Ei(t),a=Li(r),l=Nt(t),h=o==="y",c=i.x+i.width/2-n.width/2,u=i.y+i.height/2-n.height/2,d=i[a]/2-n[a]/2,m;switch(l){case"top":m={x:c,y:i.y-n.height};break;case"bottom":m={x:c,y:i.y+i.height};break;case"right":m={x:i.x+i.width,y:u};break;case"left":m={x:i.x-n.width,y:u};break;default:m={x:i.x,y:i.y}}let f=Qt(t);return f&&(m[r]+=d*(f==="end"?1:-1)*(e&&h?-1:1)),m}async function ta(s,t){var e;t===void 0&&(t={});let{x:i,y:n,platform:o,rects:r,elements:a,strategy:l}=s,{boundary:h="clippingAncestors",rootBoundary:c="viewport",elementContext:u="floating",altBoundary:d=!1,padding:m=0}=Yt(t,s),f=qs(m),w=a[d?u==="floating"?"reference":"floating":u],v=Gt(await o.getClippingRect({element:(e=await(o.isElement==null?void 0:o.isElement(w)))==null||e?w:w.contextElement||await(o.getDocumentElement==null?void 0:o.getDocumentElement(a.floating)),boundary:h,rootBoundary:c,strategy:l})),x=u==="floating"?{x:i,y:n,width:r.floating.width,height:r.floating.height}:r.reference,M=await(o.getOffsetParent==null?void 0:o.getOffsetParent(a.floating)),C=await(o.isElement==null?void 0:o.isElement(M))&&await(o.getScale==null?void 0:o.getScale(M))||{x:1,y:1},k=Gt(o.convertOffsetParentRelativeRectToViewportRelativeRect?await o.convertOffsetParentRelativeRectToViewportRelativeRect({elements:a,rect:x,offsetParent:M,strategy:l}):x);return{top:(v.top-k.top+f.top)/C.y,bottom:(k.bottom-v.bottom+f.bottom)/C.y,left:(v.left-k.left+f.left)/C.x,right:(k.right-v.right+f.right)/C.x}}var gh=50,ea=async(s,t,e)=>{let{placement:i="bottom",strategy:n="absolute",middleware:o=[],platform:r}=e,a=r.detectOverflow?r:{...r,detectOverflow:ta},l=await(r.isRTL==null?void 0:r.isRTL(t)),h=await r.getElementRects({reference:s,floating:t,strategy:n}),{x:c,y:u}=Zr(h,i,l),d=i,m=0,f={};for(let g=0;g<o.length;g++){let w=o[g];if(!w)continue;let{name:v,fn:x}=w,{x:M,y:C,data:k,reset:E}=await x({x:c,y:u,initialPlacement:i,placement:d,strategy:n,middlewareData:f,rects:h,platform:a,elements:{reference:s,floating:t}});c=M??c,u=C??u,f[v]={...f[v],...k},E&&m<gh&&(m++,typeof E=="object"&&(E.placement&&(d=E.placement),E.rects&&(h=E.rects===!0?await r.getElementRects({reference:s,floating:t,strategy:n}):E.rects),{x:c,y:u}=Zr(h,d,l)),g=-1)}return{x:c,y:u,placement:d,strategy:n,middlewareData:f}},ia=s=>({name:"arrow",options:s,async fn(t){let{x:e,y:i,placement:n,rects:o,platform:r,elements:a,middlewareData:l}=t,{element:h,padding:c=0}=Yt(s,t)||{};if(h==null)return{};let u=qs(c),d={x:e,y:i},m=Ei(n),f=Li(m),g=await r.getDimensions(h),w=m==="y",v=w?"top":"left",x=w?"bottom":"right",M=w?"clientHeight":"clientWidth",C=o.reference[f]+o.reference[m]-d[m]-o.floating[f],k=d[m]-o.reference[m],E=await(r.getOffsetParent==null?void 0:r.getOffsetParent(h)),z=E?E[M]:0;(!z||!await(r.isElement==null?void 0:r.isElement(E)))&&(z=a.floating[M]||o.floating[f]);let _=C/2-k/2,b=z/2-g[f]/2-1,L=gt(u[v],b),P=gt(u[x],b),R=z-g[f]-P,V=z/2-g[f]/2+_,q=Bs(L,V,R),K=!l.arrow&&Qt(n)!=null&&V!==q&&o.reference[f]/2-(V<L?L:P)-g[f]/2<0,Y=K?V<L?V-L:V-R:0;return{[m]:d[m]+Y,data:{[m]:q,centerOffset:V-q-Y,...K&&{alignmentOffset:Y}},reset:K}}});var sa=function(s){return s===void 0&&(s={}),{name:"flip",options:s,async fn(t){var e,i;let{placement:n,middlewareData:o,rects:r,initialPlacement:a,platform:l,elements:h}=t,{mainAxis:c=!0,crossAxis:u=!0,fallbackPlacements:d,fallbackStrategy:m="bestFit",fallbackAxisSideDirection:f="none",flipAlignment:g=!0,...w}=Yt(s,t);if((e=o.arrow)!=null&&e.alignmentOffset)return{};let v=Nt(n),x=bt(a),M=Nt(a)===a,C=await(l.isRTL==null?void 0:l.isRTL(h.floating)),k=d||(M||!g?[qe(a)]:Xr(a)),E=f!=="none";!d&&E&&k.push(...Jr(a,g,f,C));let z=[a,...k],_=await l.detectOverflow(t,w),b=[],L=((i=o.flip)==null?void 0:i.overflows)||[];if(c&&b.push(_[v]),u){let q=Gr(n,r,C);b.push(_[q[0]],_[q[1]])}if(L=[...L,{placement:n,overflows:b}],!b.every(q=>q<=0)){var P,R;let q=(((P=o.flip)==null?void 0:P.index)||0)+1,K=z[q];if(K&&(!(u==="alignment"?x!==bt(K):!1)||L.every(W=>bt(W.placement)===x?W.overflows[0]>0:!0)))return{data:{index:q,overflows:L},reset:{placement:K}};let Y=(R=L.filter(D=>D.overflows[0]<=0).sort((D,W)=>D.overflows[1]-W.overflows[1])[0])==null?void 0:R.placement;if(!Y)switch(m){case"bestFit":{var V;let D=(V=L.filter(W=>{if(E){let nt=bt(W.placement);return nt===x||nt==="y"}return!0}).map(W=>[W.placement,W.overflows.filter(nt=>nt>0).reduce((nt,ze)=>nt+ze,0)]).sort((W,nt)=>W[1]-nt[1])[0])==null?void 0:V[0];D&&(Y=D);break}case"initialPlacement":Y=a;break}if(n!==Y)return{reset:{placement:Y}}}return{}}}};var vh=new Set(["left","top"]);async function bh(s,t){let{placement:e,platform:i,elements:n}=s,o=await(i.isRTL==null?void 0:i.isRTL(n.floating)),r=Nt(e),a=Qt(e),l=bt(e)==="y",h=vh.has(r)?-1:1,c=o&&l?-1:1,u=Yt(t,s),{mainAxis:d,crossAxis:m,alignmentAxis:f}=typeof u=="number"?{mainAxis:u,crossAxis:0,alignmentAxis:null}:{mainAxis:u.mainAxis||0,crossAxis:u.crossAxis||0,alignmentAxis:u.alignmentAxis};return a&&typeof f=="number"&&(m=a==="end"?f*-1:f),l?{x:m*c,y:d*h}:{x:d*h,y:m*c}}var na=function(s){return s===void 0&&(s=0),{name:"offset",options:s,async fn(t){var e,i;let{x:n,y:o,placement:r,middlewareData:a}=t,l=await bh(t,s);return r===((e=a.offset)==null?void 0:e.placement)&&(i=a.arrow)!=null&&i.alignmentOffset?{}:{x:n+l.x,y:o+l.y,data:{...l,placement:r}}}}},oa=function(s){return s===void 0&&(s={}),{name:"shift",options:s,async fn(t){let{x:e,y:i,placement:n,platform:o}=t,{mainAxis:r=!0,crossAxis:a=!1,limiter:l={fn:x=>{let{x:M,y:C}=x;return{x:M,y:C}}},...h}=Yt(s,t),c={x:e,y:i},u=await o.detectOverflow(t,h),d=bt(n),m=Vs(d),f=c[m],g=c[d],w=(x,M)=>Bs(M+u[x==="y"?"top":"left"],M,M-u[x==="y"?"bottom":"right"]);r&&(f=w(m,f)),a&&(g=w(d,g));let v=l.fn({...t,[m]:f,[d]:g});return{...v,data:{x:v.x-e,y:v.y-i,enabled:{[m]:r,[d]:a}}}}}};var ra=function(s){return s===void 0&&(s={}),{name:"size",options:s,async fn(t){let{placement:e,rects:i,platform:n,elements:o}=t,{apply:r=()=>{},...a}=Yt(s,t),l=await n.detectOverflow(t,a),h=Nt(e),c=Qt(e),u=bt(e)==="y",{width:d,height:m}=i.floating,f,g;h==="top"||h==="bottom"?(f=h,g=c===(await(n.isRTL==null?void 0:n.isRTL(o.floating))?"start":"end")?"left":"right"):(g=h,f=c==="end"?"top":"bottom");let w=m-l.top-l.bottom,v=d-l.left-l.right,x=gt(m-l[f],w),M=gt(d-l[g],v),C=t.middlewareData.shift,k=!C,E=x,z=M;C!=null&&C.enabled.x&&(z=v),C!=null&&C.enabled.y&&(E=w),k&&!c&&(u?z=d-2*dt(l.left,l.right):E=m-2*dt(l.top,l.bottom)),await r({...t,availableWidth:z,availableHeight:E});let _=await n.getDimensions(o.floating);return d!==_.width||m!==_.height?{reset:{rects:!0}}:{}}}};function ki(){return typeof window<"u"}function Jt(s){return la(s)?(s.nodeName||"").toLowerCase():"#document"}function J(s){var t;return(s==null||(t=s.ownerDocument)==null?void 0:t.defaultView)||window}function wt(s){var t;return(t=(la(s)?s.ownerDocument:s.document)||window.document)==null?void 0:t.documentElement}function la(s){return ki()?s instanceof Node||s instanceof J(s).Node:!1}function mt(s){return ki()?s instanceof Element||s instanceof J(s).Element:!1}function Et(s){return ki()?s instanceof HTMLElement||s instanceof J(s).HTMLElement:!1}function aa(s){return!ki()||typeof ShadowRoot>"u"?!1:s instanceof ShadowRoot||s instanceof J(s).ShadowRoot}function Ue(s){let{overflow:t,overflowX:e,overflowY:i,display:n}=ft(s);return/auto|scroll|overlay|hidden|clip/.test(t+i+e)&&n!=="inline"&&n!=="contents"}function ha(s){return/^(table|td|th)$/.test(Jt(s))}function He(s){try{if(s.matches(":popover-open"))return!0}catch{}try{return s.matches(":modal")}catch{return!1}}var wh=/transform|translate|scale|rotate|perspective|filter/,yh=/paint|layout|strict|content/,Xt=s=>!!s&&s!=="none",Ds;function de(s){let t=mt(s)?ft(s):s;return Xt(t.transform)||Xt(t.translate)||Xt(t.scale)||Xt(t.rotate)||Xt(t.perspective)||!zi()&&(Xt(t.backdropFilter)||Xt(t.filter))||wh.test(t.willChange||"")||yh.test(t.contain||"")}function ca(s){let t=Ot(s);for(;Et(t)&&!me(t);){if(de(t))return t;if(He(t))return null;t=Ot(t)}return null}function zi(){return Ds==null&&(Ds=typeof CSS<"u"&&CSS.supports&&CSS.supports("-webkit-backdrop-filter","none")),Ds}function me(s){return/^(html|body|#document)$/.test(Jt(s))}function ft(s){return J(s).getComputedStyle(s)}function je(s){return mt(s)?{scrollLeft:s.scrollLeft,scrollTop:s.scrollTop}:{scrollLeft:s.scrollX,scrollTop:s.scrollY}}function Ot(s){if(Jt(s)==="html")return s;let t=s.assignedSlot||s.parentNode||aa(s)&&s.host||wt(s);return aa(t)?t.host:t}function ua(s){let t=Ot(s);return me(t)?(s.ownerDocument||s).body:Et(t)&&Ue(t)?t:ua(t)}function Lt(s,t,e){var i;t===void 0&&(t=[]),e===void 0&&(e=!0);let n=ua(s),o=n===((i=s.ownerDocument)==null?void 0:i.body),r=J(n);if(o){let a=Ti(r);return t.concat(r,r.visualViewport||[],Ue(n)?n:[],a&&e?Lt(a):[])}else return t.concat(n,Lt(n,[],e))}function Ti(s){return s.parent&&Object.getPrototypeOf(s.parent)?s.frameElement:null}function fa(s){let t=ft(s),e=parseFloat(t.width)||0,i=parseFloat(t.height)||0,n=Et(s),o=n?s.offsetWidth:e,r=n?s.offsetHeight:i,a=De(e)!==o||De(i)!==r;return a&&(e=o,i=r),{width:e,height:i,$:a}}function Us(s){return mt(s)?s:s.contextElement}function fe(s){let t=Us(s);if(!Et(t))return vt(1);let e=t.getBoundingClientRect(),{width:i,height:n,$:o}=fa(t),r=(o?De(e.width):e.width)/i,a=(o?De(e.height):e.height)/n;return(!r||!Number.isFinite(r))&&(r=1),(!a||!Number.isFinite(a))&&(a=1),{x:r,y:a}}var xh=vt(0);function pa(s){let t=J(s);return!zi()||!t.visualViewport?xh:{x:t.visualViewport.offsetLeft,y:t.visualViewport.offsetTop}}function Ch(s,t,e){return t===void 0&&(t=!1),!!e&&t&&e===J(s)}function Zt(s,t,e,i){t===void 0&&(t=!1),e===void 0&&(e=!1);let n=s.getBoundingClientRect(),o=Us(s),r=vt(1);t&&(i?mt(i)&&(r=fe(i)):r=fe(s));let a=Ch(o,e,i)?pa(o):vt(0),l=(n.left+a.x)/r.x,h=(n.top+a.y)/r.y,c=n.width/r.x,u=n.height/r.y;if(o&&i){let d=J(o),m=mt(i)?J(i):i,f=d,g=Ti(f);for(;g&&m!==f;){let w=fe(g),v=g.getBoundingClientRect(),x=ft(g),M=v.left+(g.clientLeft+parseFloat(x.paddingLeft))*w.x,C=v.top+(g.clientTop+parseFloat(x.paddingTop))*w.y;l*=w.x,h*=w.y,c*=w.x,u*=w.y,l+=M,h+=C,f=J(g),g=Ti(f)}}return Gt({width:c,height:u,x:l,y:h})}function Ai(s,t){let e=je(s).scrollLeft;return t?t.left+e:Zt(wt(s)).left+e}function ga(s,t){let e=s.getBoundingClientRect(),i=e.left+t.scrollLeft-Ai(s,e),n=e.top+t.scrollTop;return{x:i,y:n}}function Sh(s){let{elements:t,rect:e,offsetParent:i,strategy:n}=s,o=n==="fixed",r=wt(i),a=t?He(t.floating):!1;if(i===r||a&&o)return e;let l={scrollLeft:0,scrollTop:0},h=vt(1),c=vt(0),u=Et(i);if((u||!o)&&((Jt(i)!=="body"||Ue(r))&&(l=je(i)),u)){let m=Zt(i);h=fe(i),c.x=m.x+i.clientLeft,c.y=m.y+i.clientTop}let d=r&&!u&&!o?ga(r,l):vt(0);return{width:e.width*h.x,height:e.height*h.y,x:e.x*h.x-l.scrollLeft*h.x+c.x+d.x,y:e.y*h.y-l.scrollTop*h.y+c.y+d.y}}function Mh(s){return s.getClientRects?Array.from(s.getClientRects()):[]}function _h(s){let t=je(s),e=s.ownerDocument.body,i=dt(s.scrollWidth,s.clientWidth,e.scrollWidth,e.clientWidth),n=dt(s.scrollHeight,s.clientHeight,e.scrollHeight,e.clientHeight),o=-t.scrollLeft+Ai(s),r=-t.scrollTop;return ft(e).direction==="rtl"&&(o+=dt(s.clientWidth,e.clientWidth)-i),{width:i,height:n,x:o,y:r}}var Lh=25;function Eh(s,t,e){e===void 0&&(e="viewport");let i=e==="layoutViewport",n=J(s),o=wt(s),r=n.visualViewport,a=o.clientWidth,l=o.clientHeight,h=0,c=0;if(r){let d=!zi()||t==="fixed";i?d||(h=-r.offsetLeft,c=-r.offsetTop):(a=r.width,l=r.height,d&&(h=r.offsetLeft,c=r.offsetTop))}if(Ai(o)<=0){let d=o.ownerDocument,m=d.body,f=getComputedStyle(m),g=d.compatMode==="CSS1Compat"&&parseFloat(f.marginLeft)+parseFloat(f.marginRight)||0,w=Math.abs(o.clientWidth-m.clientWidth-g),v=getComputedStyle(o).scrollbarGutter==="stable both-edges"?w/2:w;v<=Lh&&(a-=v)}return{width:a,height:l,x:h,y:c}}function kh(s,t){let e=Zt(s,!0,t==="fixed"),i=e.top+s.clientTop,n=e.left+s.clientLeft,o=fe(s),r=s.clientWidth*o.x,a=s.clientHeight*o.y,l=n*o.x,h=i*o.y;return{width:r,height:a,x:l,y:h}}function da(s,t,e){let i;if(t==="viewport"||t==="layoutViewport")i=Eh(s,e,t);else if(t==="document")i=_h(wt(s));else if(mt(t))i=kh(t,e);else{let n=pa(s);i={x:t.x-n.x,y:t.y-n.y,width:t.width,height:t.height}}return Gt(i)}function zh(s,t){let e=t.get(s);if(e)return e;let i=Lt(s,[],!1).filter(a=>mt(a)&&Jt(a)!=="body"),n=null,o=ft(s).position==="fixed",r=o?Ot(s):s;for(;mt(r)&&!me(r);){let a=ft(r),l=de(r),h=n?n.position:o?"fixed":"";!l&&(h==="fixed"||h==="absolute"&&a.position==="static")?i=i.filter(u=>u!==r):n=a,r=Ot(r)}return t.set(s,i),i}function Th(s){let{element:t,boundary:e,rootBoundary:i,strategy:n}=s,r=[...e==="clippingAncestors"?He(t)?[]:zh(t,this._c):[].concat(e),i],a=da(t,r[0],n),l=a.top,h=a.right,c=a.bottom,u=a.left;for(let d=1;d<r.length;d++){let m=da(t,r[d],n);l=dt(m.top,l),h=gt(m.right,h),c=gt(m.bottom,c),u=dt(m.left,u)}return{width:h-u,height:c-l,x:u,y:l}}function Ah(s){let{width:t,height:e}=fa(s);return{width:t,height:e}}function Ph(s,t,e){let i=Et(t),n=wt(t),o=e==="fixed",r=Zt(s,!0,o,t),a={scrollLeft:0,scrollTop:0},l=vt(0);if((i||!o)&&((Jt(t)!=="body"||Ue(n))&&(a=je(t)),i)){let d=Zt(t,!0,o,t);l.x=d.x+t.clientLeft,l.y=d.y+t.clientTop}!i&&n&&(l.x=Ai(n));let h=n&&!i&&!o?ga(n,a):vt(0),c=r.left+a.scrollLeft-l.x-h.x,u=r.top+a.scrollTop-l.y-h.y;return{x:c,y:u,width:r.width,height:r.height}}function Ws(s){return ft(s).position==="static"}function ma(s,t){if(!Et(s)||ft(s).position==="fixed")return null;if(t)return t(s);let e=s.offsetParent;return wt(s)===e&&(e=e.ownerDocument.body),e}function va(s,t){let e=J(s);if(He(s))return e;if(!Et(s)){let n=Ot(s);for(;n&&!me(n);){if(mt(n)&&!Ws(n))return n;n=Ot(n)}return e}let i=ma(s,t);for(;i&&ha(i)&&Ws(i);)i=ma(i,t);return i&&me(i)&&Ws(i)&&!de(i)?e:i||ca(s)||e}var $h=async function(s){let t=this.getOffsetParent||va,e=this.getDimensions,i=await e(s.floating);return{reference:Ph(s.reference,await t(s.floating),s.strategy),floating:{x:0,y:0,width:i.width,height:i.height}}};function Rh(s){return ft(s).direction==="rtl"}var Ke={convertOffsetParentRelativeRectToViewportRelativeRect:Sh,getDocumentElement:wt,getClippingRect:Th,getOffsetParent:va,getElementRects:$h,getClientRects:Mh,getDimensions:Ah,getScale:fe,isElement:mt,isRTL:Rh};function ba(s,t){return s.x===t.x&&s.y===t.y&&s.width===t.width&&s.height===t.height}function Nh(s,t,e){let i=null,n,o=wt(s);function r(){var c;clearTimeout(n),(c=i)==null||c.disconnect(),i=null}function a(c,u){c===void 0&&(c=!1),u===void 0&&(u=1),r();let d=s.getBoundingClientRect(),{left:m,top:f,width:g,height:w}=d;if(c||t(),!g||!w)return;let v=We(f),x=We(o.clientWidth-(m+g)),M=We(o.clientHeight-(f+w)),C=We(m),E={rootMargin:-v+"px "+-x+"px "+-M+"px "+-C+"px",threshold:dt(0,gt(1,u))||1},z=!0;function _(b){let L=b[0].intersectionRatio;if(!ba(d,s.getBoundingClientRect()))return a();if(L!==u){if(!z)return a();L?a(!1,L):n=setTimeout(()=>{a(!1,1e-7)},1e3)}z=!1}try{i=new IntersectionObserver(_,{...E,root:o.ownerDocument})}catch{i=new IntersectionObserver(_,E)}i.observe(s)}let l=J(s),h=()=>a(e);return l.addEventListener("resize",h),a(!0),()=>{l.removeEventListener("resize",h),r()}}function wa(s,t,e,i){i===void 0&&(i={});let{ancestorScroll:n=!0,ancestorResize:o=!0,elementResize:r=typeof ResizeObserver=="function",layoutShift:a=typeof IntersectionObserver=="function",animationFrame:l=!1}=i,h=Us(s),c=n||o?[...h?Lt(h):[],...t?Lt(t):[]]:[];c.forEach(v=>{n&&v.addEventListener("scroll",e),o&&v.addEventListener("resize",e)});let u=h&&a?Nh(h,e,o):null,d=-1,m=null;r&&(m=new ResizeObserver(v=>{let[x]=v;x&&x.target===h&&m&&t&&(m.unobserve(t),cancelAnimationFrame(d),d=requestAnimationFrame(()=>{var M;(M=m)==null||M.observe(t)})),e()}),h&&!l&&m.observe(h),t&&m.observe(t));let f,g=l?Zt(s):null;l&&w();function w(){let v=Zt(s);g&&!ba(g,v)&&e(),g=v,f=requestAnimationFrame(w)}return e(),()=>{var v;c.forEach(x=>{n&&x.removeEventListener("scroll",e),o&&x.removeEventListener("resize",e)}),u?.(),(v=m)==null||v.disconnect(),m=null,l&&cancelAnimationFrame(f)}}var ya=na;var xa=oa,Ca=sa,Hs=ra;var Sa=ia;var Ma=(s,t,e)=>{let i=new Map,n=e??{},o={...Ke,...n.platform,_c:i};return ea(s,t,{...n,platform:o})};function _a(s){return Oh(s)}function js(s){return s.assignedSlot?s.assignedSlot:s.parentNode instanceof ShadowRoot?s.parentNode.host:s.parentNode}function Oh(s){for(let t=s;t;t=js(t))if(t instanceof Element&&getComputedStyle(t).display==="none")return null;for(let t=js(s);t;t=js(t)){if(!(t instanceof Element))continue;let e=getComputedStyle(t);if(e.display!=="contents"&&(e.position!=="static"||de(e)||t.tagName==="BODY"))return t}return null}function La(s){return s!==null&&typeof s=="object"&&"getBoundingClientRect"in s&&("contextElement"in s?s instanceof Element:!0)}var Fh=!!globalThis?.HTMLElement?.prototype.hasOwnProperty("popover"),O=class extends U{constructor(){super(...arguments),this.localize=new rt(this),this.SUPPORTS_POPOVER=!1,this.active=!1,this.placement="top",this.boundary="viewport",this.distance=0,this.skidding=0,this.arrow=!1,this.arrowPlacement="anchor",this.arrowPadding=10,this.flip=!1,this.flipFallbackPlacements="",this.flipFallbackStrategy="best-fit",this.flipPadding=0,this.shift=!1,this.shiftPadding=0,this.autoSizePadding=0,this.hoverBridge=!1,this.updateHoverBridge=()=>{if(this.hoverBridge&&this.anchorEl&&this.popup){let s=this.anchorEl.getBoundingClientRect(),t=this.popup.getBoundingClientRect(),e=this.placement.includes("top")||this.placement.includes("bottom"),i=0,n=0,o=0,r=0,a=0,l=0,h=0,c=0;e?s.top<t.top?(i=s.left,n=s.bottom,o=s.right,r=s.bottom,a=t.left,l=t.top,h=t.right,c=t.top):(i=t.left,n=t.bottom,o=t.right,r=t.bottom,a=s.left,l=s.top,h=s.right,c=s.top):s.left<t.left?(i=s.right,n=s.top,o=t.left,r=t.top,a=s.right,l=s.bottom,h=t.left,c=t.bottom):(i=t.right,n=t.top,o=s.left,r=s.top,a=t.right,l=t.bottom,h=s.left,c=s.bottom),this.style.setProperty("--hover-bridge-top-left-x",`${i}px`),this.style.setProperty("--hover-bridge-top-left-y",`${n}px`),this.style.setProperty("--hover-bridge-top-right-x",`${o}px`),this.style.setProperty("--hover-bridge-top-right-y",`${r}px`),this.style.setProperty("--hover-bridge-bottom-left-x",`${a}px`),this.style.setProperty("--hover-bridge-bottom-left-y",`${l}px`),this.style.setProperty("--hover-bridge-bottom-right-x",`${h}px`),this.style.setProperty("--hover-bridge-bottom-right-y",`${c}px`)}}}async connectedCallback(){super.connectedCallback(),await this.updateComplete,this.SUPPORTS_POPOVER=Fh,this.start()}disconnectedCallback(){super.disconnectedCallback(),this.stop()}async updated(s){super.updated(s),s.has("active")&&(this.active?this.start():this.stop()),s.has("anchor")&&this.handleAnchorChange(),this.active&&(await this.updateComplete,this.reposition())}async handleAnchorChange(){if(await this.stop(),this.anchor&&typeof this.anchor=="string"){let s=this.getRootNode();this.anchorEl=s.getElementById(this.anchor)}else this.anchor instanceof Element||La(this.anchor)?this.anchorEl=this.anchor:this.anchorEl=this.querySelector('[slot="anchor"]');this.anchorEl instanceof HTMLSlotElement&&(this.anchorEl=this.anchorEl.assignedElements({flatten:!0})[0]),this.anchorEl&&this.start()}start(){!this.anchorEl||!this.active||!this.isConnected||(this.popup?.showPopover?.(),this.cleanup=wa(this.anchorEl,this.popup,()=>{this.reposition()}))}async stop(){return new Promise(s=>{this.popup?.hidePopover?.(),this.cleanup?(this.cleanup(),this.cleanup=void 0,this.removeAttribute("data-current-placement"),this.style.removeProperty("--auto-size-available-width"),this.style.removeProperty("--auto-size-available-height"),requestAnimationFrame(()=>s())):s()})}reposition(){if(!this.active||!this.anchorEl||!this.popup)return;let s=[ya({mainAxis:this.distance,crossAxis:this.skidding})];this.sync?s.push(Hs({apply:({rects:i})=>{let n=this.sync==="width"||this.sync==="both",o=this.sync==="height"||this.sync==="both";this.popup.style.width=n?`${i.reference.width}px`:"",this.popup.style.height=o?`${i.reference.height}px`:""}})):(this.popup.style.width="",this.popup.style.height="");let t;this.SUPPORTS_POPOVER&&!La(this.anchor)&&this.boundary==="scroll"&&(t=Lt(this.anchorEl).filter(i=>i instanceof Element)),this.flip&&s.push(Ca({boundary:this.flipBoundary||t,fallbackPlacements:this.flipFallbackPlacements,fallbackStrategy:this.flipFallbackStrategy==="best-fit"?"bestFit":"initialPlacement",padding:this.flipPadding})),this.shift&&s.push(xa({boundary:this.shiftBoundary||t,padding:this.shiftPadding})),this.autoSize?s.push(Hs({boundary:this.autoSizeBoundary||t,padding:this.autoSizePadding,apply:({availableWidth:i,availableHeight:n})=>{this.autoSize==="vertical"||this.autoSize==="both"?this.style.setProperty("--auto-size-available-height",`${n}px`):this.style.removeProperty("--auto-size-available-height"),this.autoSize==="horizontal"||this.autoSize==="both"?this.style.setProperty("--auto-size-available-width",`${i}px`):this.style.removeProperty("--auto-size-available-width")}})):(this.style.removeProperty("--auto-size-available-width"),this.style.removeProperty("--auto-size-available-height")),this.arrow&&s.push(Sa({element:this.arrowEl,padding:this.arrowPadding}));let e=this.SUPPORTS_POPOVER?i=>Ke.getOffsetParent(i,_a):Ke.getOffsetParent;Ma(this.anchorEl,this.popup,{placement:this.placement,middleware:s,strategy:this.SUPPORTS_POPOVER?"absolute":"fixed",platform:{...Ke,getOffsetParent:e}}).then(({x:i,y:n,middlewareData:o,placement:r})=>{let a=this.localize.dir()==="rtl",l={top:"bottom",right:"left",bottom:"top",left:"right"}[r.split("-")[0]];if(this.setAttribute("data-current-placement",r),Object.assign(this.popup.style,{left:`${i}px`,top:`${n}px`}),this.arrow){let h=o.arrow.x,c=o.arrow.y,u="",d="",m="",f="";if(this.arrowPlacement==="start"){let g=typeof h=="number"?`calc(${this.arrowPadding}px - var(--arrow-padding-offset))`:"";u=typeof c=="number"?`calc(${this.arrowPadding}px - var(--arrow-padding-offset))`:"",d=a?g:"",f=a?"":g}else if(this.arrowPlacement==="end"){let g=typeof h=="number"?`calc(${this.arrowPadding}px - var(--arrow-padding-offset))`:"";d=a?"":g,f=a?g:"",m=typeof c=="number"?`calc(${this.arrowPadding}px - var(--arrow-padding-offset))`:""}else this.arrowPlacement==="center"?(f=typeof h=="number"?"calc(50% - var(--arrow-size-diagonal))":"",u=typeof c=="number"?"calc(50% - var(--arrow-size-diagonal))":""):(f=typeof h=="number"?`${h}px`:"",u=typeof c=="number"?`${c}px`:"");Object.assign(this.arrowEl.style,{top:u,right:d,bottom:m,left:f,[l]:"calc(var(--arrow-base-offset) - var(--arrow-size-diagonal))"})}}),requestAnimationFrame(()=>this.updateHoverBridge()),this.dispatchEvent(new jr)}render(){return N`
      <slot name="anchor" @slotchange=${this.handleAnchorChange}></slot>

      <span
        part="hover-bridge"
        class=${et({"popup-hover-bridge":!0,"popup-hover-bridge-visible":this.hoverBridge&&this.active})}
      ></span>

      <div
        popover="manual"
        part="popup"
        class=${et({popup:!0,"popup-active":this.active,"popup-fixed":!this.SUPPORTS_POPOVER,"popup-has-arrow":this.arrow})}
      >
        <slot></slot>
        ${this.arrow?N`<div part="arrow" class="arrow" role="presentation"></div>`:""}
      </div>
    `}};O.css=Kr;p([Z(".popup")],O.prototype,"popup",2);p([Z(".arrow")],O.prototype,"arrowEl",2);p([y({attribute:!1,type:Boolean})],O.prototype,"SUPPORTS_POPOVER",2);p([y()],O.prototype,"anchor",2);p([y({type:Boolean,reflect:!0})],O.prototype,"active",2);p([y({reflect:!0})],O.prototype,"placement",2);p([y()],O.prototype,"boundary",2);p([y({type:Number})],O.prototype,"distance",2);p([y({type:Number})],O.prototype,"skidding",2);p([y({type:Boolean})],O.prototype,"arrow",2);p([y({attribute:"arrow-placement"})],O.prototype,"arrowPlacement",2);p([y({attribute:"arrow-padding",type:Number})],O.prototype,"arrowPadding",2);p([y({type:Boolean})],O.prototype,"flip",2);p([y({attribute:"flip-fallback-placements",converter:{fromAttribute:s=>s.split(" ").map(t=>t.trim()).filter(t=>t!==""),toAttribute:s=>s.join(" ")}})],O.prototype,"flipFallbackPlacements",2);p([y({attribute:"flip-fallback-strategy"})],O.prototype,"flipFallbackStrategy",2);p([y({type:Object})],O.prototype,"flipBoundary",2);p([y({attribute:"flip-padding",type:Number})],O.prototype,"flipPadding",2);p([y({type:Boolean})],O.prototype,"shift",2);p([y({type:Object})],O.prototype,"shiftBoundary",2);p([y({attribute:"shift-padding",type:Number})],O.prototype,"shiftPadding",2);p([y({attribute:"auto-size"})],O.prototype,"autoSize",2);p([y()],O.prototype,"sync",2);p([y({type:Object})],O.prototype,"autoSizeBoundary",2);p([y({attribute:"auto-size-padding",type:Number})],O.prototype,"autoSizePadding",2);p([y({attribute:"hover-bridge",type:Boolean})],O.prototype,"hoverBridge",2);O=p([H("wa-popup")],O);function $(s){var t=s.width,e=s.height;if(t<0)throw new Error("Negative width is not allowed for Size");if(e<0)throw new Error("Negative height is not allowed for Size");return{width:t,height:e}}function yt(s,t){return s.width===t.width&&s.height===t.height}var Ih=(function(){function s(t){var e=this;this._resolutionListener=function(){return e._onResolutionChanged()},this._resolutionMediaQueryList=null,this._observers=[],this._window=t,this._installResolutionListener()}return s.prototype.dispose=function(){this._uninstallResolutionListener(),this._window=null},Object.defineProperty(s.prototype,"value",{get:function(){return this._window.devicePixelRatio},enumerable:!1,configurable:!0}),s.prototype.subscribe=function(t){var e=this,i={next:t};return this._observers.push(i),{unsubscribe:function(){e._observers=e._observers.filter(function(n){return n!==i})}}},s.prototype._installResolutionListener=function(){if(this._resolutionMediaQueryList!==null)throw new Error("Resolution listener is already installed");var t=this._window.devicePixelRatio;this._resolutionMediaQueryList=this._window.matchMedia("all and (resolution: ".concat(t,"dppx)")),this._resolutionMediaQueryList.addListener(this._resolutionListener)},s.prototype._uninstallResolutionListener=function(){this._resolutionMediaQueryList!==null&&(this._resolutionMediaQueryList.removeListener(this._resolutionListener),this._resolutionMediaQueryList=null)},s.prototype._reinstallResolutionListener=function(){this._uninstallResolutionListener(),this._installResolutionListener()},s.prototype._onResolutionChanged=function(){var t=this;this._observers.forEach(function(e){return e.next(t._window.devicePixelRatio)}),this._reinstallResolutionListener()},s})();function Ea(s){return new Ih(s)}var Bh=(function(){function s(t,e,i){var n;this._canvasElement=null,this._bitmapSizeChangedListeners=[],this._suggestedBitmapSize=null,this._suggestedBitmapSizeChangedListeners=[],this._devicePixelRatioObservable=null,this._canvasElementResizeObserver=null,this._canvasElement=t,this._canvasElementClientSize=$({width:this._canvasElement.clientWidth,height:this._canvasElement.clientHeight}),this._transformBitmapSize=e??(function(o){return o}),this._allowResizeObserver=(n=i?.allowResizeObserver)!==null&&n!==void 0?n:!0,this._chooseAndInitObserver()}return s.prototype.dispose=function(){var t,e;if(this._canvasElement===null)throw new Error("Object is disposed");(t=this._canvasElementResizeObserver)===null||t===void 0||t.disconnect(),this._canvasElementResizeObserver=null,(e=this._devicePixelRatioObservable)===null||e===void 0||e.dispose(),this._devicePixelRatioObservable=null,this._suggestedBitmapSizeChangedListeners.length=0,this._bitmapSizeChangedListeners.length=0,this._canvasElement=null},Object.defineProperty(s.prototype,"canvasElement",{get:function(){if(this._canvasElement===null)throw new Error("Object is disposed");return this._canvasElement},enumerable:!1,configurable:!0}),Object.defineProperty(s.prototype,"canvasElementClientSize",{get:function(){return this._canvasElementClientSize},enumerable:!1,configurable:!0}),Object.defineProperty(s.prototype,"bitmapSize",{get:function(){return $({width:this.canvasElement.width,height:this.canvasElement.height})},enumerable:!1,configurable:!0}),s.prototype.resizeCanvasElement=function(t){this._canvasElementClientSize=$(t),this.canvasElement.style.width="".concat(this._canvasElementClientSize.width,"px"),this.canvasElement.style.height="".concat(this._canvasElementClientSize.height,"px"),this._invalidateBitmapSize()},s.prototype.subscribeBitmapSizeChanged=function(t){this._bitmapSizeChangedListeners.push(t)},s.prototype.unsubscribeBitmapSizeChanged=function(t){this._bitmapSizeChangedListeners=this._bitmapSizeChangedListeners.filter(function(e){return e!==t})},Object.defineProperty(s.prototype,"suggestedBitmapSize",{get:function(){return this._suggestedBitmapSize},enumerable:!1,configurable:!0}),s.prototype.subscribeSuggestedBitmapSizeChanged=function(t){this._suggestedBitmapSizeChangedListeners.push(t)},s.prototype.unsubscribeSuggestedBitmapSizeChanged=function(t){this._suggestedBitmapSizeChangedListeners=this._suggestedBitmapSizeChangedListeners.filter(function(e){return e!==t})},s.prototype.applySuggestedBitmapSize=function(){if(this._suggestedBitmapSize!==null){var t=this._suggestedBitmapSize;this._suggestedBitmapSize=null,this._resizeBitmap(t),this._emitSuggestedBitmapSizeChanged(t,this._suggestedBitmapSize)}},s.prototype._resizeBitmap=function(t){var e=this.bitmapSize;yt(e,t)||(this.canvasElement.width=t.width,this.canvasElement.height=t.height,this._emitBitmapSizeChanged(e,t))},s.prototype._emitBitmapSizeChanged=function(t,e){var i=this;this._bitmapSizeChangedListeners.forEach(function(n){return n.call(i,t,e)})},s.prototype._suggestNewBitmapSize=function(t){var e=this._suggestedBitmapSize,i=$(this._transformBitmapSize(t,this._canvasElementClientSize)),n=yt(this.bitmapSize,i)?null:i;e===null&&n===null||e!==null&&n!==null&&yt(e,n)||(this._suggestedBitmapSize=n,this._emitSuggestedBitmapSizeChanged(e,n))},s.prototype._emitSuggestedBitmapSizeChanged=function(t,e){var i=this;this._suggestedBitmapSizeChangedListeners.forEach(function(n){return n.call(i,t,e)})},s.prototype._chooseAndInitObserver=function(){var t=this;if(!this._allowResizeObserver){this._initDevicePixelRatioObservable();return}Vh().then(function(e){return e?t._initResizeObserver():t._initDevicePixelRatioObservable()})},s.prototype._initDevicePixelRatioObservable=function(){var t=this;if(this._canvasElement!==null){var e=ka(this._canvasElement);if(e===null)throw new Error("No window is associated with the canvas");this._devicePixelRatioObservable=Ea(e),this._devicePixelRatioObservable.subscribe(function(){return t._invalidateBitmapSize()}),this._invalidateBitmapSize()}},s.prototype._invalidateBitmapSize=function(){var t,e;if(this._canvasElement!==null){var i=ka(this._canvasElement);if(i!==null){var n=(e=(t=this._devicePixelRatioObservable)===null||t===void 0?void 0:t.value)!==null&&e!==void 0?e:i.devicePixelRatio,o=this._canvasElement.getClientRects(),r=o[0]!==void 0?qh(o[0],n):$({width:this._canvasElementClientSize.width*n,height:this._canvasElementClientSize.height*n});this._suggestNewBitmapSize(r)}}},s.prototype._initResizeObserver=function(){var t=this;this._canvasElement!==null&&(this._canvasElementResizeObserver=new ResizeObserver(function(e){var i=e.find(function(r){return r.target===t._canvasElement});if(!(!i||!i.devicePixelContentBoxSize||!i.devicePixelContentBoxSize[0])){var n=i.devicePixelContentBoxSize[0],o=$({width:n.inlineSize,height:n.blockSize});t._suggestNewBitmapSize(o)}}),this._canvasElementResizeObserver.observe(this._canvasElement,{box:"device-pixel-content-box"}))},s})();function Ks(s,t){if(t.type==="device-pixel-content-box")return new Bh(s,t.transform,t.options);throw new Error("Unsupported binding target")}function ka(s){return s.ownerDocument.defaultView}function Vh(){return new Promise(function(s){var t=new ResizeObserver(function(e){s(e.every(function(i){return"devicePixelContentBoxSize"in i})),t.disconnect()});t.observe(document.body,{box:"device-pixel-content-box"})}).catch(function(){return!1})}function qh(s,t){return $({width:Math.round(s.left*t+s.width*t)-Math.round(s.left*t),height:Math.round(s.top*t+s.height*t)-Math.round(s.top*t)})}var za=(function(){function s(t,e,i){if(e.width===0||e.height===0)throw new TypeError("Rendering target could only be created on a media with positive width and height");if(this._mediaSize=e,i.width===0||i.height===0)throw new TypeError("Rendering target could only be created using a bitmap with positive integer width and height");this._bitmapSize=i,this._context=t}return s.prototype.useMediaCoordinateSpace=function(t){try{return this._context.save(),this._context.setTransform(1,0,0,1,0,0),this._context.scale(this._horizontalPixelRatio,this._verticalPixelRatio),t({context:this._context,mediaSize:this._mediaSize})}finally{this._context.restore()}},s.prototype.useBitmapCoordinateSpace=function(t){try{return this._context.save(),this._context.setTransform(1,0,0,1,0,0),t({context:this._context,mediaSize:this._mediaSize,bitmapSize:this._bitmapSize,horizontalPixelRatio:this._horizontalPixelRatio,verticalPixelRatio:this._verticalPixelRatio})}finally{this._context.restore()}},Object.defineProperty(s.prototype,"_horizontalPixelRatio",{get:function(){return this._bitmapSize.width/this._mediaSize.width},enumerable:!1,configurable:!0}),Object.defineProperty(s.prototype,"_verticalPixelRatio",{get:function(){return this._bitmapSize.height/this._mediaSize.height},enumerable:!1,configurable:!0}),s})();function kt(s,t){var e=s.canvasElementClientSize;if(e.width===0||e.height===0)return null;var i=s.bitmapSize;if(i.width===0||i.height===0)return null;var n=s.canvasElement.getContext("2d",t);return n===null?null:new za(n,e,i)}var vl={title:"",visible:!0,hitTestTolerance:3,lastValueVisible:!0,priceLineVisible:!0,priceLineSource:0,priceLineWidth:1,priceLineColor:"",priceLineStyle:2,baseLineVisible:!0,baseLineWidth:1,baseLineColor:"#B2B5BE",baseLineStyle:0,priceFormat:{type:"price",precision:2,minMove:.01}},Ta,Aa;function ie(s,t){let e=(function(i,n){switch(i){case 0:default:return[];case 1:return[n,n];case 2:return[2*n,2*n];case 3:return[6*n,6*n];case 4:return[n,4*n]}})(t,s.lineWidth);return s.setLineDash(e),e}function bl(s,t,e,i){s.beginPath();let n=s.lineWidth%2?.5:0;s.moveTo(e,t+n),s.lineTo(i,t+n),s.stroke()}function G(s,t){if(!s)throw new Error("Assertion failed"+(t?": "+t:""))}function tt(s){if(s===void 0)throw new Error("Value is undefined");return s}function S(s){if(s===null)throw new Error("Value is null");return s}function It(s){return S(tt(s))}(function(s){s[s.Simple=0]="Simple",s[s.WithSteps=1]="WithSteps",s[s.Curved=2]="Curved"})(Ta||(Ta={})),(function(s){s[s.Solid=0]="Solid",s[s.Dotted=1]="Dotted",s[s.Dashed=2]="Dashed",s[s.LargeDashed=3]="LargeDashed",s[s.SparseDotted=4]="SparseDotted"})(Aa||(Aa={}));var B=class{constructor(){this.t=[]}i(t,e,i){let n={h:t,l:e,o:i===!0};this.t.push(n)}_(t){let e=this.t.findIndex((i=>t===i.h));e>-1&&this.t.splice(e,1)}u(t){this.t=this.t.filter((e=>e.l!==t))}p(t,e,i){let n=[...this.t];this.t=this.t.filter((o=>!o.o)),n.forEach((o=>o.h(t,e,i)))}v(){return this.t.length>0}m(){this.t=[]}};function it(s,...t){for(let e of t)for(let i in e)e[i]!==void 0&&Object.prototype.hasOwnProperty.call(e,i)&&!["__proto__","constructor","prototype"].includes(i)&&(typeof e[i]!="object"||s[i]===void 0||Array.isArray(e[i])?s[i]=e[i]:it(s[i],e[i]));return s}function ye(s){return typeof s=="number"&&isFinite(s)}function ii(s){return typeof s=="number"&&s%1==0}function ri(s){return typeof s=="string"}function Pi(s){return typeof s=="boolean"}function zt(s){let t=s;if(!t||typeof t!="object")return t;let e,i,n;for(i in e=Array.isArray(t)?[]:{},t)t.hasOwnProperty(i)&&(n=t[i],e[i]=n&&typeof n=="object"?zt(n):n);return e}function Pa(s){return s!==null}function un(s){return s===null?void 0:s}var wl="-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif";function Hi(s,t,e){return t===void 0&&(t=wl),`${e=e!==void 0?`${e} `:""}${s}px ${t}`}var dn=class{constructor(t){this.M={S:1,C:5,P:NaN,k:"",T:"",R:"",D:"",I:0,V:0,B:0,A:0,L:0},this.O=t}N(){let t=this.M,e=this.F(),i=this.W();return t.P===e&&t.T===i||(t.P=e,t.T=i,t.k=Hi(e,i),t.A=2.5/12*e,t.I=t.A,t.V=e/12*t.C,t.B=e/12*t.C,t.L=0),t.R=this.H(),t.D=this.U(),this.M}H(){return this.O.N().layout.textColor}U(){return this.O.$()}F(){return this.O.N().layout.fontSize}W(){return this.O.N().layout.fontFamily}};function Ys(s){return s<0?0:s>255?255:Math.round(s)||0}function $a(s){return .199*s[0]+.687*s[1]+.114*s[2]}var mn=class{constructor(t,e){this.j=new Map,this.q=t,e&&(this.j=e)}Y(t,e){if(t==="transparent")return t;let i=this.K(t),n=i[3];return`rgba(${i[0]}, ${i[1]}, ${i[2]}, ${e*n})`}G(t){let e=this.K(t);return{Z:`rgb(${e[0]}, ${e[1]}, ${e[2]})`,X:$a(e)>160?"black":"white"}}J(t){return $a(this.K(t))}tt(t,e,i){let[n,o,r,a]=this.K(t),[l,h,c,u]=this.K(e),d=[Ys(n+i*(l-n)),Ys(o+i*(h-o)),Ys(r+i*(c-r)),(m=a+i*(u-a),m<=0||m>1?Math.min(Math.max(m,0),1):Math.round(1e4*m)/1e4)];var m;return`rgba(${d[0]}, ${d[1]}, ${d[2]}, ${d[3]})`}K(t){let e=this.j.get(t);if(e)return e;let i=(function(r){let a=document.createElement("div");a.style.display="none",document.body.appendChild(a),a.style.color=r;let l=window.getComputedStyle(a).color;return document.body.removeChild(a),l})(t),n=i.match(/^rgba?\s*\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)$/);if(!n){if(this.q.length)for(let r of this.q){let a=r(t);if(a)return this.j.set(t,a),a}throw new Error(`Failed to parse color: ${t}`)}let o=[parseInt(n[1],10),parseInt(n[2],10),parseInt(n[3],10),n[4]?parseFloat(n[4]):1];return this.j.set(t,o),o}},fn=class{constructor(){this.it=[]}nt(t){this.it=t}st(t,e,i){this.it.forEach((n=>{n.st(t,e,i)}))}},Bt=class{st(t,e,i){t.useBitmapCoordinateSpace((n=>this.et(n,e,i)))}},pn=class extends Bt{constructor(){super(...arguments),this.rt=null}ht(t){this.rt=t}et({context:t,horizontalPixelRatio:e,verticalPixelRatio:i}){if(this.rt===null||this.rt.lt===null)return;let n=this.rt.lt,o=this.rt,r=Math.max(1,Math.floor(e))%2/2,a=l=>{t.beginPath();for(let h=n.to-1;h>=n.from;--h){let c=o.ot[h],u=Math.round(c._t*e)+r,d=c.ut*i,m=l*i+r;t.moveTo(u,d),t.arc(u,d,m,0,2*Math.PI)}t.fill()};o.ct>0&&(t.fillStyle=o.dt,a(o.ft+o.ct)),t.fillStyle=o.vt,a(o.ft)}};function Dh(){return{ot:[{_t:0,ut:0,wt:0,Mt:0}],vt:"",dt:"",ft:0,ct:0,lt:null}}var Wh={from:0,to:1},gn=class{constructor(t,e,i){this.gt=new fn,this.bt=[],this.St=[],this.xt=!0,this.O=t,this.Ct=e,this.yt=i,this.gt.nt(this.bt)}Pt(t){this.kt(),this.xt=!0}Tt(){return this.xt&&(this.Rt(),this.xt=!1),this.gt}kt(){let t=this.yt.Dt();t.length!==this.bt.length&&(this.St=t.map(Dh),this.bt=this.St.map((e=>{let i=new pn;return i.ht(e),i})),this.gt.nt(this.bt))}Rt(){let t=this.Ct.N().mode===2||!this.Ct.It(),e=this.yt.Vt(),i=this.Ct.Bt(),n=this.O.Et();this.kt(),e.forEach(((o,r)=>{let a=this.St[r],l=o.At(i),h=o.Lt();!t&&l!==null&&o.It()&&h!==null?(a.vt=l.zt,a.ft=l.ft,a.ct=l.Ot,a.ot[0].Mt=l.Mt,a.ot[0].ut=o.Ft().Nt(l.Mt,h.Wt),a.dt=l.Ht??this.O.Ut(a.ot[0].ut/o.Ft().$t()),a.ot[0].wt=i,a.ot[0]._t=n.jt(i),a.lt=Wh):a.lt=null}))}},vn=class extends Bt{constructor(t){super(),this.qt=t}et({context:t,bitmapSize:e,horizontalPixelRatio:i,verticalPixelRatio:n}){if(this.qt===null)return;let o=this.qt.Yt.It,r=this.qt.Kt.It;if(!o&&!r)return;let a=Math.round(this.qt._t*i),l=Math.round(this.qt.ut*n);t.lineCap="butt",o&&a>=0&&(t.lineWidth=Math.floor(this.qt.Yt.ct*i),t.strokeStyle=this.qt.Yt.R,t.fillStyle=this.qt.Yt.R,ie(t,this.qt.Yt.Gt),(function(h,c,u,d){h.beginPath();let m=h.lineWidth%2?.5:0;h.moveTo(c+m,u),h.lineTo(c+m,d),h.stroke()})(t,a,0,e.height)),r&&l>=0&&(t.lineWidth=Math.floor(this.qt.Kt.ct*n),t.strokeStyle=this.qt.Kt.R,t.fillStyle=this.qt.Kt.R,ie(t,this.qt.Kt.Gt),bl(t,l,0,e.width))}},bn=class{constructor(t,e){this.xt=!0,this.Zt={Yt:{ct:1,Gt:0,R:"",It:!1},Kt:{ct:1,Gt:0,R:"",It:!1},_t:0,ut:0},this.Xt=new vn(this.Zt),this.Jt=t,this.yt=e}Pt(){this.xt=!0}Tt(t){return this.xt&&(this.Rt(),this.xt=!1),this.Xt}Rt(){let t=this.Jt.It(),e=this.yt.Qt().N().crosshair,i=this.Zt;if(e.mode===2)return i.Kt.It=!1,void(i.Yt.It=!1);i.Kt.It=t&&this.Jt.ti(this.yt),i.Yt.It=t&&this.Jt.ii(),i.Kt.ct=e.horzLine.width,i.Kt.Gt=e.horzLine.style,i.Kt.R=e.horzLine.color,i.Yt.ct=e.vertLine.width,i.Yt.Gt=e.vertLine.style,i.Yt.R=e.vertLine.color,i._t=this.Jt.ni(),i.ut=this.Jt.si()}};function us(s,t,e,i,n,o){s.save(),s.globalCompositeOperation="copy",s.fillStyle=o,s.fillRect(t,e,i,n),s.restore()}function Ra(s,t,e,i,n,o){s.beginPath(),s.roundRect?s.roundRect(t,e,i,n,o):(s.lineTo(t+i-o[1],e),o[1]!==0&&s.arcTo(t+i,e,t+i,e+o[1],o[1]),s.lineTo(t+i,e+n-o[2]),o[2]!==0&&s.arcTo(t+i,e+n,t+i-o[2],e+n,o[2]),s.lineTo(t+o[3],e+n),o[3]!==0&&s.arcTo(t,e+n,t,e+n-o[3],o[3]),s.lineTo(t,e+o[0]),o[0]!==0&&s.arcTo(t,e,t+o[0],e,o[0]))}function Na(s,t,e,i,n,o,r=0,a=[0,0,0,0],l=""){if(s.save(),!r||!l||l===o)return Ra(s,t,e,i,n,a),s.fillStyle=o,s.fill(),void s.restore();let h=r/2;var c;Ra(s,t+h,e+h,i-r,n-r,(c=-h,a.map((u=>u===0?u:u+c)))),o!=="transparent"&&(s.fillStyle=o,s.fill()),l!=="transparent"&&(s.lineWidth=r,s.strokeStyle=l,s.closePath(),s.stroke()),s.restore()}function yl(s,t,e,i,n,o,r){s.save(),s.globalCompositeOperation="copy";let a=s.createLinearGradient(0,0,0,n);a.addColorStop(0,o),a.addColorStop(1,r),s.fillStyle=a,s.fillRect(t,e,i,n),s.restore()}var ji=class{constructor(t,e){this.ht(t,e)}ht(t,e){this.qt=t,this.ei=e}$t(t,e){return this.qt.It?t.P+t.A+t.I:0}st(t,e,i,n){if(!this.qt.It||this.qt.ri.length===0)return;let o=this.qt.R,r=this.ei.Z,a=t.useBitmapCoordinateSpace((l=>{let h=l.context;h.font=e.k;let c=this.hi(l,e,i,n),u=c.ai;return c.li?Na(h,u.oi,u._i,u.ui,u.ci,r,u.di,[u.ft,0,0,u.ft],r):Na(h,u.fi,u._i,u.ui,u.ci,r,u.di,[0,u.ft,u.ft,0],r),this.qt.pi&&(h.fillStyle=o,h.fillRect(u.fi,u.mi,u.wi-u.fi,u.Mi)),this.qt.gi&&(h.fillStyle=e.D,h.fillRect(c.li?u.bi-u.di:0,u._i,u.di,u.Si-u._i)),c}));t.useMediaCoordinateSpace((({context:l})=>{let h=a.xi;l.font=e.k,l.textAlign=a.li?"right":"left",l.textBaseline="middle",l.fillStyle=o,l.fillText(this.qt.ri,h.Ci,(h._i+h.Si)/2+h.yi)}))}hi(t,e,i,n){let{context:o,bitmapSize:r,mediaSize:a,horizontalPixelRatio:l,verticalPixelRatio:h}=t,c=this.qt.pi||!this.qt.Pi?e.C:0,u=this.qt.ki?e.S:0,d=e.A+this.ei.Ti,m=e.I+this.ei.Ri,f=e.V,g=e.B,w=this.qt.ri,v=e.P,x=i.Di(o,w),M=Math.ceil(i.Ii(o,w)),C=v+d+m,k=e.S+f+g+M+c,E=Math.max(1,Math.floor(h)),z=Math.round(C*h);z%2!=E%2&&(z+=1);let _=u>0?Math.max(1,Math.floor(u*l)):0,b=Math.round(k*l),L=Math.round(c*l),P=this.ei.Vi??this.ei.Bi??this.ei.Ei,R=Math.round(P*h)-Math.floor(.5*h),V=Math.floor(R+E/2-z/2),q=V+z,K=n==="right",Y=K?a.width-u:u,D=K?r.width-_:_,W,nt,ze;return K?(W=D-b,nt=D-L,ze=Y-c-f-u):(W=D+b,nt=D+L,ze=Y+c+f),{li:K,ai:{_i:V,mi:R,Si:q,ui:b,ci:z,ft:2*l,di:_,oi:W,fi:D,wi:nt,Mi:E,bi:r.width},xi:{_i:V/h,Si:q/h,Ci:ze,yi:x}}}},xe=class{constructor(t){this.Ai={Ei:0,Z:"#000",Ri:0,Ti:0},this.Li={ri:"",It:!1,pi:!0,Pi:!1,Ht:"",R:"#FFF",gi:!1,ki:!1},this.zi={ri:"",It:!1,pi:!1,Pi:!0,Ht:"",R:"#FFF",gi:!0,ki:!0},this.xt=!0,this.Oi=new(t||ji)(this.Li,this.Ai),this.Ni=new(t||ji)(this.zi,this.Ai)}ri(){return this.Fi(),this.Li.ri}Ei(){return this.Fi(),this.Ai.Ei}Pt(){this.xt=!0}$t(t,e=!1){return Math.max(this.Oi.$t(t,e),this.Ni.$t(t,e))}Wi(){return this.Ai.Vi??null}Hi(){return this.Ai.Vi??this.Ai.Bi??this.Ei()}Ui(t){this.Ai.Bi=t??void 0}$i(){return this.Fi(),this.Li.It||this.zi.It}ji(){return this.Fi(),this.Li.It}Tt(t){return this.Fi(),this.Li.pi=this.Li.pi&&t.N().ticksVisible,this.zi.pi=this.zi.pi&&t.N().ticksVisible,this.Oi.ht(this.Li,this.Ai),this.Ni.ht(this.zi,this.Ai),this.Oi}qi(){return this.Fi(),this.Oi.ht(this.Li,this.Ai),this.Ni.ht(this.zi,this.Ai),this.Ni}Fi(){this.xt&&(this.Li.pi=!0,this.zi.pi=!1,this.Yi(this.Li,this.zi,this.Ai))}},wn=class extends xe{constructor(t,e,i){super(),this.Jt=t,this.Ki=e,this.Gi=i}Yi(t,e,i){if(t.It=!1,this.Jt.N().mode===2)return;let n=this.Jt.N().horzLine;if(!n.labelVisible)return;let o=this.Ki.Lt();if(!this.Jt.It()||this.Ki.Zi()||o===null)return;let r=this.Ki.Xi().G(n.labelBackgroundColor);i.Z=r.Z,t.R=r.X;let a=2/12*this.Ki.P();i.Ti=a,i.Ri=a;let l=this.Gi(this.Ki);i.Ei=l.Ei,t.ri=this.Ki.Ji(l.Mt,o),t.It=!0}},Uh=/[1-9]/g,Ki=class{constructor(){this.qt=null}ht(t){this.qt=t}st(t,e){if(this.qt===null||this.qt.It===!1||this.qt.ri.length===0)return;let i=t.useMediaCoordinateSpace((({context:d})=>(d.font=e.k,Math.round(e.Qi.Ii(d,S(this.qt).ri,Uh)))));if(i<=0)return;let n=e.tn,o=i+2*n,r=o/2,a=this.qt.nn,l=this.qt.Ei,h=Math.floor(l-r)+.5;h<0?(l+=Math.abs(0-h),h=Math.floor(l-r)+.5):h+o>a&&(l-=Math.abs(a-(h+o)),h=Math.floor(l-r)+.5);let c=h+o,u=Math.ceil(0+e.S+e.C+e.A+e.P+e.I);t.useBitmapCoordinateSpace((({context:d,horizontalPixelRatio:m,verticalPixelRatio:f})=>{let g=S(this.qt);d.fillStyle=g.Z;let w=Math.round(h*m),v=Math.round(0*f),x=Math.round(c*m),M=Math.round(u*f),C=Math.round(2*m);if(d.beginPath(),d.moveTo(w,v),d.lineTo(w,M-C),d.arcTo(w,M,w+C,M,C),d.lineTo(x-C,M),d.arcTo(x,M,x,M-C,C),d.lineTo(x,v),d.fill(),g.pi){let k=Math.round(g.Ei*m),E=v,z=Math.round((E+e.C)*f);d.fillStyle=g.R;let _=Math.max(1,Math.floor(m)),b=Math.floor(.5*m);d.fillRect(k-b,E,_,z-E)}})),t.useMediaCoordinateSpace((({context:d})=>{let m=S(this.qt),f=0+e.S+e.C+e.A+e.P/2;d.font=e.k,d.textAlign="left",d.textBaseline="middle",d.fillStyle=m.R;let g=e.Qi.Di(d,"Apr0");d.translate(h+n,f+g),d.fillText(m.ri,0,0)}))}},yn=class{constructor(t,e,i){this.xt=!0,this.Xt=new Ki,this.Zt={It:!1,Z:"#4c525e",R:"white",ri:"",nn:0,Ei:NaN,pi:!0},this.Ct=t,this.sn=e,this.Gi=i}Pt(){this.xt=!0}Tt(){return this.xt&&(this.Rt(),this.xt=!1),this.Xt.ht(this.Zt),this.Xt}Rt(){let t=this.Zt;if(t.It=!1,this.Ct.N().mode===2)return;let e=this.Ct.N().vertLine;if(!e.labelVisible)return;let i=this.sn.Et();if(i.Zi())return;t.nn=i.nn();let n=this.Gi();if(n===null)return;t.Ei=n.Ei;let o=i.en(this.Ct.Bt());t.ri=i.rn(S(o)),t.It=!0;let r=this.sn.Xi().G(e.labelBackgroundColor);t.Z=r.Z,t.R=r.X,t.pi=i.N().ticksVisible}},Yi=class{constructor(){this.hn=null,this.an=0}ln(){return this.an}_n(t){this.an=t}Ft(){return this.hn}un(t){this.hn=t}cn(t){return[]}dn(){return[]}It(){return!0}},Oa;(function(s){s[s.Normal=0]="Normal",s[s.Magnet=1]="Magnet",s[s.Hidden=2]="Hidden",s[s.MagnetOHLC=3]="MagnetOHLC"})(Oa||(Oa={}));var xn=class extends Yi{constructor(t,e){super(),this.yt=null,this.fn=NaN,this.pn=0,this.vn=!1,this.mn=new Map,this.wn=!1,this.Mn=new WeakMap,this.gn=new WeakMap,this.bn=NaN,this.Sn=NaN,this.xn=NaN,this.Cn=NaN,this.sn=t,this.yn=e,this.Pn=((n,o)=>r=>{let a=o(),l=n();if(r===S(this.yt).kn())return{Mt:l,Ei:a};{let h=S(r.Lt());return{Mt:r.Tn(a,h),Ei:a}}})((()=>this.fn),(()=>this.Sn));let i=((n,o)=>()=>{let r=this.sn.Et().Rn(n()),a=o();return r&&Number.isFinite(a)?{wt:r,Ei:a}:null})((()=>this.pn),(()=>this.ni()));this.Dn=new yn(this,t,i)}N(){return this.yn}In(t,e){this.xn=t,this.Cn=e}Vn(){this.xn=NaN,this.Cn=NaN}Bn(){return this.xn}En(){return this.Cn}An(t,e,i){this.wn||(this.wn=!0),this.vn=!0,this.Ln(t,e,i)}Bt(){return this.pn}ni(){return this.bn}si(){return this.Sn}It(){return this.vn}zn(){this.vn=!1,this.On(),this.fn=NaN,this.bn=NaN,this.Sn=NaN,this.yt=null,this.Vn(),this.Nn()}Fn(t){if(!this.yn.doNotSnapToHiddenSeriesIndices)return t;let e=this.sn,i=e.Et(),n=null,o=null;for(let h of e.Wn()){let c=h.Un().Hn(t,-1);if(c){if(c.$n===t)return t;(n===null||c.$n>n)&&(n=c.$n)}let u=h.Un().Hn(t,1);if(u){if(u.$n===t)return t;(o===null||u.$n<o)&&(o=u.$n)}}let r=[n,o].filter(Pa);if(r.length===0)return t;let a=i.jt(t),l=r.map((h=>Math.abs(a-i.jt(h))));return r[l.indexOf(Math.min(...l))]}jn(t){let e=this.Mn.get(t);e||(e=new bn(this,t),this.Mn.set(t,e));let i=this.gn.get(t);return i||(i=new gn(this.sn,this,t),this.gn.set(t,i)),[e,i]}ti(t){return t===this.yt&&this.yn.horzLine.visible}ii(){return this.yn.vertLine.visible}qn(t,e){this.vn&&this.yt===t||this.mn.clear();let i=[];return this.yt===t&&i.push(this.Yn(this.mn,e,this.Pn)),i}dn(){return this.vn?[this.Dn]:[]}Kn(){return this.yt}Nn(){this.sn.Gn().forEach((t=>{this.Mn.get(t)?.Pt(),this.gn.get(t)?.Pt()})),this.mn.forEach((t=>t.Pt())),this.Dn.Pt()}Zn(t){return t&&!t.kn().Zi()?t.kn():null}Ln(t,e,i){this.Xn(t,e,i)&&this.Nn()}Xn(t,e,i){let n=this.bn,o=this.Sn,r=this.fn,a=this.pn,l=this.yt,h=this.Zn(i);this.pn=t,this.bn=isNaN(t)?NaN:this.sn.Et().jt(t),this.yt=i;let c=h!==null?h.Lt():null;return h!==null&&c!==null?(this.fn=e,this.Sn=h.Nt(e,c)):(this.fn=NaN,this.Sn=NaN),n!==this.bn||o!==this.Sn||a!==this.pn||r!==this.fn||l!==this.yt}On(){let t=this.sn.Jn().map((i=>i.Un().Qn())).filter(Pa),e=t.length===0?null:Math.max(...t);this.pn=e!==null?e:NaN}Yn(t,e,i){let n=t.get(e);return n===void 0&&(n=new wn(this,e,i),t.set(e,n)),n}};function ds(s){return s==="left"||s==="right"}var X=class s{constructor(t){this.ts=new Map,this.ns=[],this.ss=t}es(t,e){let i=(function(n,o){return n===void 0?o:{rs:Math.max(n.rs,o.rs),hs:n.hs||o.hs}})(this.ts.get(t),e);this.ts.set(t,i)}ls(){return this.ss}_s(t){let e=this.ts.get(t);return e===void 0?{rs:this.ss}:{rs:Math.max(this.ss,e.rs),hs:e.hs}}us(){this.cs(),this.ns=[{ds:0}]}fs(t){this.cs(),this.ns=[{ds:1,Wt:t}]}ps(t){this.vs(),this.ns.push({ds:5,Wt:t})}cs(){this.vs(),this.ns.push({ds:6})}ws(){this.cs(),this.ns=[{ds:4}]}Ms(t){this.cs(),this.ns.push({ds:2,Wt:t})}gs(t){this.cs(),this.ns.push({ds:3,Wt:t})}bs(){return this.ns}Ss(t){for(let e of t.ns)this.xs(e);this.ss=Math.max(this.ss,t.ss),t.ts.forEach(((e,i)=>{this.es(i,e)}))}static Cs(){return new s(2)}static ys(){return new s(3)}xs(t){switch(t.ds){case 0:this.us();break;case 1:this.fs(t.Wt);break;case 2:this.Ms(t.Wt);break;case 3:this.gs(t.Wt);break;case 4:this.ws();break;case 5:this.ps(t.Wt);break;case 6:this.vs()}}vs(){let t=this.ns.findIndex((e=>e.ds===5));t!==-1&&this.ns.splice(t,1)}},Qi=class{formatTickmarks(t){return t.map((e=>this.format(e)))}},Fa=".";function Tt(s,t){if(!ye(s))return"n/a";if(!ii(t))throw new TypeError("invalid length");if(t<0||t>16)throw new TypeError("invalid length");return t===0?s.toString():("0000000000000000"+s.toString()).slice(-t)}var Ce=class extends Qi{constructor(t,e){if(super(),e||(e=1),ye(t)&&ii(t)||(t=100),t<0)throw new TypeError("invalid base");this.Ki=t,this.Ps=e,this.ks()}format(t){let e=t<0?"\u2212":"";return t=Math.abs(t),e+this.Ts(t)}ks(){if(this.Rs=0,this.Ki>0&&this.Ps>0){let t=this.Ki;for(;t>1;)t/=10,this.Rs++}}Ts(t){let e=this.Ki/this.Ps,i=Math.floor(t),n="",o=this.Rs!==void 0?this.Rs:NaN;if(e>1){let r=+(Math.round(t*e)-i*e).toFixed(this.Rs);r>=e&&(r-=e,i+=1),n=Fa+Tt(+r.toFixed(this.Rs)*this.Ps,o)}else i=Math.round(i*e)/e,o>0&&(n=Fa+Tt(0,o));return i.toFixed(0)+n}},Gi=class extends Ce{constructor(t=100){super(t)}format(t){return`${super.format(t)}%`}},Cn=class extends Qi{constructor(t){super(),this.Ds=t}format(t){let e="";return t<0&&(e="-",t=-t),t<995?e+this.Is(t):t<999995?e+this.Is(t/1e3)+"K":t<999999995?(t=1e3*Math.round(t/1e3),e+this.Is(t/1e6)+"M"):(t=1e6*Math.round(t/1e6),e+this.Is(t/1e9)+"B")}Is(t){let e,i=Math.pow(10,this.Ds);return e=(t=Math.round(t*i)/i)>=1e-15&&t<1?t.toFixed(this.Ds).replace(/\.?0+$/,""):String(t),e.replace(/(\.[1-9]*)0+$/,((n,o)=>o))}},Hh=/[2-9]/g,Se=class{constructor(t=50){this.Vs=0,this.Bs=1,this.Es=1,this.As={},this.Ls=new Map,this.zs=t}Os(){this.Vs=0,this.Ls.clear(),this.Bs=1,this.Es=1,this.As={}}Ii(t,e,i){return this.Ns(t,e,i).width}Di(t,e,i){let n=this.Ns(t,e,i);return((n.actualBoundingBoxAscent||0)-(n.actualBoundingBoxDescent||0))/2}Ns(t,e,i){let n=i||Hh,o=String(e).replace(n,"0");if(this.Ls.has(o))return tt(this.Ls.get(o)).Fs;if(this.Vs===this.zs){let a=this.As[this.Es];delete this.As[this.Es],this.Ls.delete(a),this.Es++,this.Vs--}t.save(),t.textBaseline="middle";let r=t.measureText(o);return t.restore(),r.width===0&&e.length||(this.Ls.set(o,{Fs:r,Ws:this.Bs}),this.As[this.Bs]=o,this.Vs++,this.Bs++),r}},Sn=class{constructor(t){this.Hs=null,this.M=null,this.Us="right",this.$s=t}js(t,e,i){this.Hs=t,this.M=e,this.Us=i}st(t){this.M!==null&&this.Hs!==null&&this.Hs.st(t,this.M,this.$s,this.Us)}},Xi=class{constructor(t,e,i){this.qs=t,this.$s=new Se(50),this.Ys=e,this.O=i,this.F=-1,this.Xt=new Sn(this.$s)}Tt(){let t=this.O.Ks(this.Ys);if(t===null)return null;let e=t.Gs(this.Ys)?t.Zs():this.Ys.Ft();if(e===null)return null;let i=t.Xs(e);if(i==="overlay")return null;let n=this.O.Js();return n.P!==this.F&&(this.F=n.P,this.$s.Os()),this.Xt.js(this.qs.qi(),n,i),this.Xt}},Mn=class extends Bt{constructor(){super(...arguments),this.qt=null}ht(t){this.qt=t}Qs(t,e){if(!this.qt?.It)return null;let{ut:i,ct:n,te:o}=this.qt;return e>=i-n-7&&e<=i+n+7?{ie:this.qt,ne:Math.abs(e-i),se:2,ee:"price-line",te:o}:null}et({context:t,bitmapSize:e,horizontalPixelRatio:i,verticalPixelRatio:n}){if(this.qt===null||this.qt.It===!1)return;let o=Math.round(this.qt.ut*n);o<0||o>e.height||(t.lineCap="butt",t.strokeStyle=this.qt.R,t.lineWidth=Math.floor(this.qt.ct*i),ie(t,this.qt.Gt),bl(t,o,0,e.width))}},si=class{constructor(t){this.re={ut:0,R:"rgba(0, 0, 0, 0)",ct:1,Gt:0,It:!1},this.he=new Mn,this.xt=!0,this.ae=t,this.le=t.Qt(),this.he.ht(this.re)}Pt(){this.xt=!0}Tt(){return this.ae.It()?(this.xt&&(this.oe(),this.xt=!1),this.he):null}},_n=class extends si{constructor(t){super(t)}oe(){this.re.It=!1;let t=this.ae.Ft(),e=t._e()._e;if(e!==2&&e!==3)return;let i=this.ae.N();if(!i.baseLineVisible||!this.ae.It())return;let n=this.ae.Lt();n!==null&&(this.re.It=!0,this.re.ut=t.Nt(n.Wt,n.Wt),this.re.R=i.baseLineColor,this.re.ct=i.baseLineWidth,this.re.Gt=i.baseLineStyle)}},Ln=class extends Bt{constructor(){super(...arguments),this.qt=null}ht(t){this.qt=t}ue(){return this.qt}et({context:t,horizontalPixelRatio:e,verticalPixelRatio:i}){let n=this.qt;if(n===null)return;let o=Math.max(1,Math.floor(e)),r=o%2/2,a=Math.round(n.ce.x*e)+r,l=n.ce.y*i;t.fillStyle=n.de,t.beginPath();let h=Math.max(2,1.5*n.fe)*e;t.arc(a,l,h,0,2*Math.PI,!1),t.fill(),t.fillStyle=n.pe,t.beginPath(),t.arc(a,l,n.ft*e,0,2*Math.PI,!1),t.fill(),t.lineWidth=o,t.strokeStyle=n.ve,t.beginPath(),t.arc(a,l,n.ft*e+o/2,0,2*Math.PI,!1),t.stroke()}},jh=[{me:0,we:.25,Me:4,ge:10,be:.25,Se:0,xe:.4,Ce:.8},{me:.25,we:.525,Me:10,ge:14,be:0,Se:0,xe:.8,Ce:0},{me:.525,we:1,Me:14,ge:14,be:0,Se:0,xe:0,Ce:0}],En=class{constructor(t){this.Xt=new Ln,this.xt=!0,this.ye=!0,this.Pe=performance.now(),this.ke=this.Pe-1,this.Te=t}Re(){this.ke=this.Pe-1,this.Pt()}De(){if(this.Pt(),this.Te.N().lastPriceAnimation===2){let t=performance.now(),e=this.ke-t;if(e>0)return void(e<650&&(this.ke+=2600));this.Pe=t,this.ke=t+2600}}Pt(){this.xt=!0}Ie(){this.ye=!0}It(){return this.Te.N().lastPriceAnimation!==0}Ve(){switch(this.Te.N().lastPriceAnimation){case 0:return!1;case 1:return!0;case 2:return performance.now()<=this.ke}}Tt(){return this.xt?(this.Rt(),this.xt=!1,this.ye=!1):this.ye&&(this.Be(),this.ye=!1),this.Xt}Rt(){this.Xt.ht(null);let t=this.Te.Qt().Et(),e=t.Ee(),i=this.Te.Lt();if(e===null||i===null)return;let n=this.Te.Ae(!0);if(n.Le||!e.ze(n.$n))return;let o={x:t.jt(n.$n),y:this.Te.Ft().Nt(n.Mt,i.Wt)},r=n.R,a=this.Te.N().lineWidth,l=this.Oe(this.Ne(),r);this.Xt.ht({de:r,fe:a,pe:l.pe,ve:l.ve,ft:l.ft,ce:o})}Be(){let t=this.Xt.ue();if(t!==null){let e=this.Oe(this.Ne(),t.de);t.pe=e.pe,t.ve=e.ve,t.ft=e.ft}}Ne(){return this.Ve()?performance.now()-this.Pe:2599}Fe(t,e,i,n){let o=i+(n-i)*e;return this.Te.Qt().Xi().Y(t,o)}Oe(t,e){let i=t%2600/2600,n;for(let h of jh)if(i>=h.me&&i<=h.we){n=h;break}G(n!==void 0,"Last price animation internal logic error");let o=(i-n.me)/(n.we-n.me);return{pe:this.Fe(e,o,n.be,n.Se),ve:this.Fe(e,o,n.xe,n.Ce),ft:(r=o,a=n.Me,l=n.ge,a+(l-a)*r)};var r,a,l}},kn=class extends si{constructor(t){super(t)}oe(){let t=this.re;t.It=!1;let e=this.ae.N();if(!e.priceLineVisible||!this.ae.It())return;let i=this.ae.Ae(e.priceLineSource===0);i.Le||(t.It=!0,t.ut=i.Ei,t.R=this.ae.We(i.R),t.ct=e.priceLineWidth,t.Gt=e.priceLineStyle)}},zn=class extends xe{constructor(t){super(),this.Jt=t}Yi(t,e,i){t.It=!1,e.It=!1;let n=this.Jt;if(!n.It())return;let o=n.N(),r=o.lastValueVisible,a=n.He()!=="",l=o.seriesLastValueMode===0,h=n.Ae(!1);if(h.Le)return;r&&(t.ri=this.Ue(h,r,l),t.It=t.ri.length!==0),(a||l)&&(e.ri=this.$e(h,r,a,l),e.It=e.ri.length>0);let c=n.We(h.R),u=this.Jt.Qt().Xi().G(c);i.Z=u.Z,i.Ei=h.Ei,e.Ht=n.Qt().Ut(h.Ei/n.Ft().$t()),t.Ht=c,t.R=u.X,e.R=u.X}$e(t,e,i,n){let o="",r=this.Jt.He();return i&&r.length!==0&&(o+=`${r} `),e&&n&&(o+=this.Jt.Ft().je()?t.qe:t.Ye),o.trim()}Ue(t,e,i){return e?i?this.Jt.Ft().je()?t.Ye:t.qe:t.ri:""}};function Ia(s,t,e,i){let n=Number.isFinite(t),o=Number.isFinite(e);return n&&o?s(t,e):n||o?n?t:e:i}var st=class s{constructor(t,e){this.Ke=t,this.Ge=e}Ze(t){return t!==null&&this.Ke===t.Ke&&this.Ge===t.Ge}Xe(){return new s(this.Ke,this.Ge)}Je(){return this.Ke}Qe(){return this.Ge}tr(){return this.Ge-this.Ke}Zi(){return this.Ge===this.Ke||Number.isNaN(this.Ge)||Number.isNaN(this.Ke)}Ss(t){return t===null?this:new s(Ia(Math.min,this.Je(),t.Je(),-1/0),Ia(Math.max,this.Qe(),t.Qe(),1/0))}ir(t){if(!ye(t)||this.Ge-this.Ke===0)return;let e=.5*(this.Ge+this.Ke),i=this.Ge-e,n=this.Ke-e;i*=t,n*=t,this.Ge=e+i,this.Ke=e+n}nr(t){ye(t)&&(this.Ge+=t,this.Ke+=t)}sr(){return{minValue:this.Ke,maxValue:this.Ge}}static er(t){return t===null?null:new s(t.minValue,t.maxValue)}},Ji=class s{constructor(t,e){this.rr=t,this.hr=e||null}ar(){return this.rr}lr(){return this.hr}sr(){return{priceRange:this.rr===null?null:this.rr.sr(),margins:this.hr||void 0}}static er(t){return t===null?null:new s(st.er(t.priceRange),t.margins)}},Kh=[2,4,8,16,32,64,128,256,512],Yh="Custom series with conflation reducer must have a priceValueBuilder method",Tn=class extends si{constructor(t,e){super(t),this._r=e}oe(){let t=this.re;t.It=!1;let e=this._r.N();if(!this.ae.It()||!e.lineVisible)return;let i=this._r.ur();i!==null&&(t.It=!0,t.ut=i,t.R=e.color,t.ct=e.lineWidth,t.Gt=e.lineStyle,t.te=this._r.N().id)}},An=class extends xe{constructor(t,e){super(),this.Te=t,this._r=e}Yi(t,e,i){t.It=!1,e.It=!1;let n=this._r.N(),o=n.axisLabelVisible,r=n.title!=="",a=this.Te;if(!o||!a.It())return;let l=this._r.ur();if(l===null)return;r&&(e.ri=n.title,e.It=!0),e.Ht=a.Qt().Ut(l/a.Ft().$t()),t.ri=this.cr(n.price),t.It=!0;let h=this.Te.Qt().Xi().G(n.axisLabelColor||n.color);i.Z=h.Z;let c=n.axisLabelTextColor||h.X;t.R=c,e.R=c,i.Ei=l}cr(t){let e=this.Te.Lt();return e===null?"":this.Te.Ft().Ji(t,e.Wt)}},Pn=class{constructor(t,e){this.Te=t,this.yn=e,this.dr=new Tn(t,this),this.qs=new An(t,this),this.pr=new Xi(this.qs,t,t.Qt())}vr(t){it(this.yn,t),this.Pt(),this.Te.Qt().mr()}N(){return this.yn}wr(){return this.dr}Mr(){return this.pr}gr(){return this.qs}Pt(){this.dr.Pt(),this.qs.Pt()}ur(){let t=this.Te,e=t.Ft();if(t.Qt().Et().Zi()||e.Zi())return null;let i=t.Lt();return i===null?null:e.Nt(this.yn.price,i.Wt)}},$n=class{constructor(){this.br=new WeakMap}Sr(t,e,i){let n=1/e*i;if(t>=n)return 1;let o=n/t,r=Math.pow(2,Math.floor(Math.log2(o)));return Math.min(r,512)}Cr(t,e,i,n=!1,o){if(t.length===0||e<=1)return t;let r=this.yr(e);if(r<=1)return t;let a=this.Pr(t),l=a.kr.get(r);return l!==void 0||(l=this.Tr(t,r,i,n,o,a.kr),a.kr.set(r,l)),l}Rr(t,e,i,n,o=!1,r){if(i<1||t.length===0)return t;let a=this.Pr(t),l=a.kr.get(i);if(!l)return this.Cr(t,i,n,o,r);let h=this.Dr(t,e,i,l,o,n,r);return a.kr.set(i,h),h}yr(t){if(t<=2)return 2;for(let e of Kh)if(t<=e)return e;return 512}Ir(t){if(t.length===0)return 0;let e=t[0],i=t[t.length-1];return 31*t.length+17*e.$n+13*i.$n}Tr(t,e,i,n=!1,o,r=new Map){if(e===2)return this.Vr(t,2,i,n,o);let a=e/2,l=r.get(a);return l||(l=this.Tr(t,a,i,n,o,r),r.set(a,l)),this.Br(l,i,n,o)}Vr(t,e,i,n=!1,o){let r=this.Er(t,e,i,n,o);return this.Ar(r,n)}Br(t,e,i=!1,n){let o=this.Er(t,2,e,i,n);return this.Ar(o,i)}Er(t,e,i,n=!1,o){let r=[];for(let a=0;a<t.length;a+=e)if(t.length-a>=e){let l=this.Lr(t[a],t[a+1],i,n,o);l.zr=!1,r.push(l)}else if(r.length===0)r.push(this.Or(t[a],!0));else{let l=r[r.length-1];r[r.length-1]=this.Nr(l,t[a],i,n,o)}return r}Fr(t,e){return(t??1)+(e??1)}Lr(t,e,i,n=!1,o){if(!n||!i||!o){let h=t.Wt[1]>e.Wt[1]?t.Wt[1]:e.Wt[1],c=t.Wt[2]<e.Wt[2]?t.Wt[2]:e.Wt[2];return{Wr:t.$n,Hr:e.$n,Ur:t.wt,$r:e.wt,jr:t.Wt[0],qr:h,Yr:c,Kr:e.Wt[3],Gr:this.Fr(t.Gr,e.Gr),Zr:void 0,zr:!1}}let r=i(this.Xr(t,o),this.Xr(e,o)),a=o(r),l=a.length?a[a.length-1]:0;return{Wr:t.$n,Hr:e.$n,Ur:t.wt,$r:e.wt,jr:t.Wt[0],qr:Math.max(t.Wt[1],l),Yr:Math.min(t.Wt[2],l),Kr:l,Gr:this.Fr(t.Gr,e.Gr),Zr:r,zr:!1}}Nr(t,e,i,n=!1,o){if(!n||!i||!o)return{Wr:t.Wr,Hr:e.$n,Ur:t.Ur,$r:e.wt,jr:t.jr,qr:t.qr>e.Wt[1]?t.qr:e.Wt[1],Yr:t.Yr<e.Wt[2]?t.Yr:e.Wt[2],Kr:e.Wt[3],Gr:t.Gr+(e.Gr??1),Zr:t.Zr,zr:!1};let r=t.Zr,a=this.Xr(e,o),l=r?{data:r,index:t.Wr,originalTime:t.Ur,time:t.Ur,priceValues:o(r)}:null,h=l?i(l,a):a.data,c=l?o(h):a.priceValues,u=c.length?c[c.length-1]:0;return{Wr:t.Wr,Hr:e.$n,Ur:t.Ur,$r:e.wt,jr:t.jr,qr:Math.max(t.qr,u),Yr:Math.min(t.Yr,u),Kr:u,Gr:t.Gr+(e.Gr??1),Zr:h,zr:!1}}Jr(t,e,i,n,o,r,a=!1,l){let h=e===n?o:t[e];if(i-e==1)return this.Or(h,!0);let c=e+1===n?o:t[e+1],u=this.Lr(h,c,r,a,l);for(let d=e+2;d<i;d++){let m=d===n?o:t[d];u=this.Nr(u,m,r,a,l)}return u}Xr(t,e){let i=t.ue??{};return{data:t.ue,index:t.$n,originalTime:t.Qr,time:t.wt,priceValues:e(i)}}th(t,e=!1){let i=e===!0,n=!!t.Zr;return{$n:t.Wr,wt:t.Ur,Qr:t.Ur,Wt:[i?t.Kr:t.jr,t.qr,t.Yr,t.Kr],Gr:t.Gr,ue:i?n?t.Zr:{wt:t.Ur}:void 0}}Ar(t,e=!1){return t.map((i=>this.th(i,e)))}Dr(t,e,i,n,o=!1,r,a){if(n.length===0)return n;let l=t.length-1,h=Math.floor(l/i)*i;if(Math.min(h+i,t.length)-h<i&&t.length>i){let c=t.slice();return c[c.length-1]=e,this.Cr(c,i,r,o,a)}if(Math.floor((l-1)/i)===Math.floor(l/i)||n.length===1){let c=Math.min(h+i,t.length),u=c-h;if(u<=0)return n;let d=u===1?this.Or(h===l?e:t[h],!0):this.Jr(t,h,c,l,e,r,o,a);return n[n.length-1]=this.th(d,o),n}{let c=t.slice();return c[c.length-1]=e,this.Cr(c,i,r,o,a)}}Or(t,e=!1){return{Wr:t.$n,Hr:t.$n,Ur:t.wt,$r:t.wt,jr:t.Wt[0],qr:t.Wt[1],Yr:t.Wt[2],Kr:t.Wt[3],Gr:t.Gr??1,Zr:t.ue,zr:e}}Pr(t){let e=this.ih(t),i=this.Ir(t);return e.nh!==i&&(e.kr.clear(),e.nh=i),e}ih(t){let e=this.br.get(t);return e===void 0&&(e={nh:this.Ir(t),kr:new Map},this.br.set(t,e)),e}},Rn=class extends Yi{constructor(t){super(),this.sn=t}Qt(){return this.sn}},Qh={Bar:(s,t,e,i)=>{let n=t.upColor,o=t.downColor,r=S(s(e,i)),a=It(r.Wt[0])<=It(r.Wt[3]);return{sh:r.R??(a?n:o)}},Candlestick:(s,t,e,i)=>{let n=t.upColor,o=t.downColor,r=t.borderUpColor,a=t.borderDownColor,l=t.wickUpColor,h=t.wickDownColor,c=S(s(e,i)),u=It(c.Wt[0])<=It(c.Wt[3]);return{sh:c.R??(u?n:o),eh:c.Ht??(u?r:a),rh:c.hh??(u?l:h)}},Custom:(s,t,e,i)=>({sh:S(s(e,i)).R??t.color}),Area:(s,t,e,i)=>{let n=S(s(e,i));return{sh:n.vt??t.lineColor,vt:n.vt??t.lineColor,ah:n.ah??t.topColor,oh:n.oh??t.bottomColor}},Baseline:(s,t,e,i)=>{let n=S(s(e,i));return{sh:n.Wt[3]>=t.baseValue.price?t.topLineColor:t.bottomLineColor,_h:n._h??t.topLineColor,uh:n.uh??t.bottomLineColor,dh:n.dh??t.topFillColor1,fh:n.fh??t.topFillColor2,ph:n.ph??t.bottomFillColor1,mh:n.mh??t.bottomFillColor2}},Line:(s,t,e,i)=>{let n=S(s(e,i));return{sh:n.R??t.color,vt:n.R??t.color}},Histogram:(s,t,e,i)=>({sh:S(s(e,i)).R??t.color})},Nn=class{constructor(t){this.wh=(e,i)=>i!==void 0?i.Wt:this.Te.Un().Mh(e),this.Te=t,this.gh=Qh[t.bh()]}Sh(t,e){return this.gh(this.wh,this.Te.N(),t,e)}};function xl(s,t,e,i,n=0,o=t.length){let r=o-n;for(;0<r;){let a=r>>1,l=n+a;i(t[l],e)===s?(n=l+1,r-=a+1):r=a}return n}var se=xl.bind(null,!0),_o=xl.bind(null,!1),Ba;(function(s){s[s.NearestLeft=-1]="NearestLeft",s[s.None=0]="None",s[s.NearestRight=1]="NearestRight"})(Ba||(Ba={}));var Ft=30,On=class{constructor(){this.xh=[],this.Ch=new Map,this.yh=new Map,this.Ph=[]}kh(){return this.Th()>0?this.xh[this.xh.length-1]:null}Rh(){return this.Th()>0?this.Dh(0):null}Qn(){return this.Th()>0?this.Dh(this.xh.length-1):null}Th(){return this.xh.length}Zi(){return this.Th()===0}ze(t){return this.Ih(t,0)!==null}Mh(t){return this.Hn(t)}Hn(t,e=0){let i=this.Ih(t,e);return i===null?null:{...this.Vh(i),$n:this.Dh(i)}}Bh(){return this.xh}Eh(t,e,i){if(this.Zi())return null;let n=null;for(let o of i)n=$i(n,this.Ah(t,e,o));return n}ht(t){this.yh.clear(),this.Ch.clear(),this.xh=t,this.Ph=t.map((e=>e.$n))}Lh(){return this.Ph}Dh(t){return this.xh[t].$n}Vh(t){return this.xh[t]}Ih(t,e){let i=this.zh(t);if(i===null&&e!==0)switch(e){case-1:return this.Oh(t);case 1:return this.Nh(t);default:throw new TypeError("Unknown search mode")}return i}Oh(t){let e=this.Fh(t);return e>0&&(e-=1),e!==this.xh.length&&this.Dh(e)<t?e:null}Nh(t){let e=this.Wh(t);return e!==this.xh.length&&t<this.Dh(e)?e:null}zh(t){let e=this.Fh(t);return e===this.xh.length||t<this.xh[e].$n?null:e}Fh(t){return se(this.xh,t,((e,i)=>e.$n<i))}Wh(t){return _o(this.xh,t,((e,i)=>e.$n>i))}Hh(t,e,i){let n=null;for(let o=t;o<e;o++){let r=this.xh[o].Wt[i];Number.isNaN(r)||(n===null?n={Uh:r,$h:r}:(r<n.Uh&&(n.Uh=r),r>n.$h&&(n.$h=r)))}return n}Ah(t,e,i){if(this.Zi())return null;let n=null,o=S(this.Rh()),r=S(this.Qn()),a=Math.max(t,o),l=Math.min(e,r),h=Math.ceil(a/Ft)*Ft,c=Math.max(h,Math.floor(l/Ft)*Ft);{let d=this.Fh(a),m=this.Wh(Math.min(l,h,e));n=$i(n,this.Hh(d,m,i))}let u=this.Ch.get(i);u===void 0&&(u=new Map,this.Ch.set(i,u));for(let d=Math.max(h+1,a);d<c;d+=Ft){let m=Math.floor(d/Ft),f=u.get(m);if(f===void 0){let g=this.Fh(m*Ft),w=this.Wh((m+1)*Ft-1);f=this.Hh(g,w,i),u.set(m,f)}n=$i(n,f)}{let d=this.Fh(c),m=this.Wh(l);n=$i(n,this.Hh(d,m,i))}return n}};function $i(s,t){return s===null?t:t===null?s:{Uh:Math.min(s.Uh,t.Uh),$h:Math.max(s.$h,t.$h)}}function Qs(){return new On}var Zi={setLineStyle:ie},Fn=class{constructor(t){this.jh=t}st(t,e,i){this.jh.draw(t,Zi)}qh(t,e,i){this.jh.drawBackground?.(t,Zi)}},In=class{constructor(t){this.Ls=null,this.Yh=t}Tt(){let t=this.Yh.renderer();if(t===null)return null;if(this.Ls?.Kh===t)return this.Ls.Gh;let e=new Fn(t);return this.Ls={Kh:t,Gh:e},e}Zh(){return this.Yh.zOrder?.()??"normal"}},ts=class{constructor(t){this.Xh=null,this.Jh=t}Qh(){return this.Jh}Nn(){this.Jh.updateAllViews?.()}jn(){let t=this.Jh.paneViews?.()??[];if(this.Xh?.Kh===t)return this.Xh.Gh;let e=t.map((i=>new In(i)));return this.Xh={Kh:t,Gh:e},e}Qs(t,e){return this.Jh.hitTest?.(t,e)??null}},Gh=class extends ts{cn(){return[]}},Bn=class{constructor(t){this.jh=t}st(t,e,i){this.jh.draw(t,Zi)}qh(t,e,i){this.jh.drawBackground?.(t,Zi)}},es=class{constructor(t){this.Ls=null,this.Yh=t}Tt(){let t=this.Yh.renderer();if(t===null)return null;if(this.Ls?.Kh===t)return this.Ls.Gh;let e=new Bn(t);return this.Ls={Kh:t,Gh:e},e}Zh(){return this.Yh.zOrder?.()??"normal"}};function Cl(s){return{ri:s.text(),Ei:s.coordinate(),Vi:s.fixedCoordinate?.(),R:s.textColor(),Z:s.backColor(),It:s.visible?.()??!0,pi:s.tickVisible?.()??!0}}var Vn=class{constructor(t,e){this.Xt=new Ki,this.ta=t,this.ia=e}Tt(){return this.Xt.ht({nn:this.ia.nn(),...Cl(this.ta)}),this.Xt}},qn=class extends xe{constructor(t,e){super(),this.ta=t,this.Ki=e}Yi(t,e,i){let n=Cl(this.ta);i.Z=n.Z,t.R=n.R;let o=2/12*this.Ki.P();i.Ti=o,i.Ri=o,i.Ei=n.Ei,i.Vi=n.Vi,t.ri=n.ri,t.It=n.It,t.pi=n.pi}},Dn=class extends ts{constructor(t,e){super(t),this.na=null,this.sa=null,this.ea=null,this.ra=null,this.Te=e}dn(){let t=this.Jh.timeAxisViews?.()??[];if(this.na?.Kh===t)return this.na.Gh;let e=this.Te.Qt().Et(),i=t.map((n=>new Vn(n,e)));return this.na={Kh:t,Gh:i},i}qn(){let t=this.Jh.priceAxisViews?.()??[];if(this.sa?.Kh===t)return this.sa.Gh;let e=this.Te.Ft(),i=t.map((n=>new qn(n,e)));return this.sa={Kh:t,Gh:i},i}ha(){let t=this.Jh.priceAxisPaneViews?.()??[];if(this.ea?.Kh===t)return this.ea.Gh;let e=t.map((i=>new es(i)));return this.ea={Kh:t,Gh:e},e}aa(){let t=this.Jh.timeAxisPaneViews?.()??[];if(this.ra?.Kh===t)return this.ra.Gh;let e=t.map((i=>new es(i)));return this.ra={Kh:t,Gh:e},e}la(t,e){return this.Jh.autoscaleInfo?.(t,e)??null}};function Ri(s,t,e,i){s.forEach((n=>{t(n).forEach((o=>{o.Zh()===e&&i.push(o)}))}))}function Ni(s){return s.jn()}function Xh(s){return s.ha()}function Jh(s){return s.aa()}var Zh=["Area","Line","Baseline"],Me=class extends Rn{constructor(t,e,i,n,o){super(t),this.qt=Qs(),this.dr=new kn(this),this.oa=[],this._a=new _n(this),this.ua=null,this.ca=null,this.da=null,this.fa=[],this.pa=new $n,this.va=new Map,this.ma=null,this.yn=i,this.wa=e;let r=new zn(this);if(this.mn=[r],this.pr=new Xi(r,this,t),Zh.includes(this.wa)&&(this.ua=new En(this)),this.Ma(),this.Yh=n(this,this.Qt(),o),this.wa==="Custom"){let a=this.Yh;a.ga&&this.ba(a.ga)}}m(){this.da!==null&&clearTimeout(this.da)}We(t){return this.yn.priceLineColor||t}Ae(t){let e={Le:!0},i=this.Ft();if(this.Qt().Et().Zi()||i.Zi()||this.qt.Zi())return e;let n=this.Qt().Et().Ee(),o=this.Lt();if(n===null||o===null)return e;let r,a;if(t){let u=this.qt.kh();if(u===null)return e;r=u,a=u.$n}else{let u=this.qt.Hn(n.bi(),-1);if(u===null||(r=this.qt.Mh(u.$n),r===null))return e;a=u.$n}let l=r.Wt[3],h=this.Sa().Sh(a,{Wt:r}),c=i.Nt(l,o.Wt);return{Le:!1,Mt:l,ri:i.Ji(l,o.Wt),qe:i.xa(l),Ye:i.Ca(l,o.Wt),R:h.sh,Ei:c,$n:a}}Sa(){return this.ca!==null||(this.ca=new Nn(this)),this.ca}N(){return this.yn}vr(t){let e=this.Qt(),{priceScaleId:i,visible:n,priceFormat:o}=t;i!==void 0&&i!==this.yn.priceScaleId&&e.ya(this,i),n!==void 0&&n!==this.yn.visible&&e.Pa();let r=t.conflationThresholdFactor!==void 0;it(this.yn,t),Object.prototype.hasOwnProperty.call(t,"autoscaleInfoProvider")&&t.autoscaleInfoProvider===void 0&&(this.yn.autoscaleInfoProvider=void 0),r&&(this.va.clear(),this.Qt().mr()),o!==void 0&&(this.Ma(),e.ka()),e.Ta(this),e.Ra(),this.Yh.Pt("options")}ht(t,e){this.qt.ht(t),this.va.clear();let i=this.Qt().Et().N();i.enableConflation&&i.precomputeConflationOnInit&&this.Da(i.precomputeConflationPriority),this.Ia(),this.ua!==null&&(e&&e.Va?this.ua.De():t.length===0&&this.ua.Re());let n=this.Qt().Ks(this);this.Qt().Ba(n),this.Qt().Ta(this),this.Qt().Ra(),this.Qt().mr()}Ia(){this.Yh.Pt("data")}Ea(t){let e=new Pn(this,t);return this.oa.push(e),this.Qt().Ta(this),e}Aa(t){let e=this.oa.indexOf(t);e!==-1&&this.oa.splice(e,1),this.Qt().Ta(this)}La(){return this.oa}bh(){return this.wa}Lt(){let t=this.za();return t===null?null:{Wt:t.Wt[3],Oa:t.wt}}za(){let t=this.Qt().Et().Ee();if(t===null)return null;let e=t.Na();return this.qt.Hn(e,1)}Un(){return this.qt}ba(t){this.ma=t,this.va.clear()}Fa(){return!!this.Qt().Et().N().enableConflation&&this.Wa()>1}Rr(t){if(!this.Fa())return;let e=this.Wa();if(!this.va.has(e))return;let i=this.wa==="Custom",n=i&&this.ma||void 0,o=i&&this.Yh.Ha?l=>{let h=l,c=this.Yh.Ha(h);return Array.isArray(c)?c:[typeof c=="number"?c:0]}:void 0,r=this.pa.Rr(this.qt.Bh(),t,e,n,i,o),a=Qs();a.ht(r),this.va.set(e,a)}Ua(){let t=this.Qt().Et().N().enableConflation;if(this.wa==="Custom"&&this.ma===null)return this.qt;if(!t)return this.qt;let e=this.Wa(),i=this.va.get(e);return i||(this.$a(e),this.va.get(e)??this.qt)}ja(t){let e=this.qt.Mh(t);return e===null?null:this.wa==="Bar"||this.wa==="Candlestick"||this.wa==="Custom"?{jr:e.Wt[0],qr:e.Wt[1],Yr:e.Wt[2],Kr:e.Wt[3]}:e.Wt[3]}qa(t){let e=[];Ri(this.fa,Ni,"top",e);let i=this.ua;return i!==null&&i.It()&&(this.da===null&&i.Ve()&&(this.da=setTimeout((()=>{this.da=null,this.Qt().Ya()}),0)),i.Ie(),e.unshift(i)),e}jn(){let t=[];this.Ka()||t.push(this._a),t.push(this.Yh,this.dr);let e=this.oa.map((i=>i.wr()));return t.push(...e),Ri(this.fa,Ni,"normal",t),t}Ga(){let t=this.Yh.Ga?.()??null;if(t===null)return null;let e=[];this.Ka()||e.push(this._a),e.push(...t.Za),Ri(this.fa,Ni,"normal",e);let i=[];i.push(...t.qa,this.dr);let n=this.oa.map((o=>o.wr()));return i.push(...n),{Za:e,qa:i}}Xa(){return this.Ja(Ni,"bottom")}Qa(t){return this.Ja(Xh,t)}tl(t){return this.Ja(Jh,t)}il(t,e){return this.fa.map((i=>i.Qs(t,e))).filter((i=>i!==null))}cn(){return[this.pr,...this.oa.map((t=>t.Mr()))]}qn(t,e){if(e!==this.hn&&!this.Ka())return[];let i=[...this.mn];for(let n of this.oa)i.push(n.gr());return this.fa.forEach((n=>{i.push(...n.qn())})),i}dn(){let t=[];return this.fa.forEach((e=>{t.push(...e.dn())})),t}la(t,e){if(this.yn.autoscaleInfoProvider!==void 0){let i=this.yn.autoscaleInfoProvider((()=>{let n=this.nl(t,e);return n===null?null:n.sr()}));return Ji.er(i)}return this.nl(t,e)}Kh(){let t=this.yn.priceFormat;return t.base??1/t.minMove}sl(){return this.el}Nn(){this.Yh.Pt();for(let t of this.mn)t.Pt();for(let t of this.oa)t.Pt();this.dr.Pt(),this._a.Pt(),this.ua?.Pt(),this.fa.forEach((t=>t.Nn()))}Ft(){return S(super.Ft())}At(t){if(!((this.wa==="Line"||this.wa==="Area"||this.wa==="Baseline")&&this.yn.crosshairMarkerVisible))return null;let e=this.qt.Mh(t);return e===null?null:{Mt:e.Wt[3],ft:this.rl(),Ht:this.hl(),Ot:this.al(),zt:this.ll(t)}}He(){return this.yn.title}It(){return this.yn.visible}ol(t){this.fa.push(new Dn(t,this))}_l(t){this.fa=this.fa.filter((e=>e.Qh()!==t))}ul(){if(this.wa==="Custom")return t=>this.Yh.Ha(t)}cl(){if(this.wa==="Custom")return t=>this.Yh.dl(t)}fl(){return this.qt.Lh()}Ka(){return!ds(this.Ft().pl())}nl(t,e){if(!ii(t)||!ii(e)||this.qt.Zi())return null;let i=this.wa==="Line"||this.wa==="Area"||this.wa==="Baseline"||this.wa==="Histogram"?[3]:[2,1],n=this.qt.Eh(t,e,i),o=n!==null?new st(n.Uh,n.$h):null,r=null;if(this.bh()==="Histogram"){let a=this.yn.base,l=new st(a,a);o=o!==null?o.Ss(l):l}return this.fa.forEach((a=>{let l=a.la(t,e);if(l?.priceRange){let h=new st(l.priceRange.minValue,l.priceRange.maxValue);o=o!==null?o.Ss(h):h}l?.margins&&(r=l.margins)})),new Ji(o,r)}rl(){switch(this.wa){case"Line":case"Area":case"Baseline":return this.yn.crosshairMarkerRadius}return 0}hl(){switch(this.wa){case"Line":case"Area":case"Baseline":{let t=this.yn.crosshairMarkerBorderColor;if(t.length!==0)return t}}return null}al(){switch(this.wa){case"Line":case"Area":case"Baseline":return this.yn.crosshairMarkerBorderWidth}return 0}ll(t){switch(this.wa){case"Line":case"Area":case"Baseline":{let e=this.yn.crosshairMarkerBackgroundColor;if(e.length!==0)return e}}return this.Sa().Sh(t).sh}Ma(){switch(this.yn.priceFormat.type){case"custom":{let t=this.yn.priceFormat.formatter;this.el={format:t,formatTickmarks:this.yn.priceFormat.tickmarksFormatter??(e=>e.map(t))};break}case"volume":this.el=new Cn(this.yn.priceFormat.precision);break;case"percent":this.el=new Gi(this.yn.priceFormat.precision);break;default:{let t=Math.pow(10,this.yn.priceFormat.precision);this.el=new Ce(t,this.yn.priceFormat.minMove*t)}}this.hn!==null&&this.hn.vl()}Ja(t,e){let i=[];return Ri(this.fa,t,e,i),i}Wa(){let{ml:t,wl:e,Ml:i}=this.gl();return this.pa.Sr(t,e,i)}gl(){let t=this.Qt().Et(),e=t.ml(),i=window.devicePixelRatio||1,n=t.N().conflationThresholdFactor;return{ml:e,wl:i,Ml:this.yn.conflationThresholdFactor??n??1}}bl(t){let e=this.qt.Bh(),i;if(this.wa==="Custom"&&this.ma!==null){let o=this.ul();if(!o)throw new Error(Yh);i=this.pa.Cr(e,t,this.ma,!0,(r=>o(r)))}else i=this.pa.Cr(e,t);let n=Qs();return n.ht(i),n}$a(t){let e=this.bl(t);this.va.set(t,e)}Da(t){if(this.wa==="Custom"&&(this.ma===null||!this.ul()))return;this.va.clear();let e=this.Qt().Et().Sl();for(let i of e){let n=()=>{this.xl(i)},o=typeof window=="object"&&window||typeof self=="object"&&self;o?.yl?.Cl?o.yl.Cl((()=>{n()}),{se:t}):Promise.resolve().then((()=>n()))}}xl(t){if(this.va.has(t)||this.qt.Bh().length===0)return;let e=this.bl(t);this.va.set(t,e)}},tc=[3],ec=[0,1,2,3],Wn=class{constructor(t){this.yn=t}Pl(t,e,i){let n=t;if(this.yn.mode===0)return n;let o=i.kn(),r=o.Lt();if(r===null)return n;let a=o.Nt(t,r),l=i.kl().filter((c=>c instanceof Me)).reduce(((c,u)=>{if(i.Gs(u)||!u.It())return c;let d=u.Ft(),m=u.Un();if(d.Zi()||!m.ze(e))return c;let f=m.Mh(e);if(f===null)return c;let g=It(u.Lt()),w=this.yn.mode===3?ec:tc;return c.concat(w.map((v=>d.Nt(f.Wt[v],g.Wt))))}),[]);if(l.length===0)return n;l.sort(((c,u)=>Math.abs(c-a)-Math.abs(u-a)));let h=l[0];return n=o.Tn(h,r),n}};function Je(s,t,e){return Math.min(Math.max(s,t),e)}function Oi(s,t,e){return t-s<=e}var Un=class extends Bt{constructor(){super(...arguments),this.qt=null}ht(t){this.qt=t}et({context:t,bitmapSize:e,horizontalPixelRatio:i,verticalPixelRatio:n}){if(this.qt===null)return;let o=Math.max(1,Math.floor(i));t.lineWidth=o,(function(r,a){r.save(),r.lineWidth%2&&r.translate(.5,.5),a(),r.restore()})(t,(()=>{let r=S(this.qt);if(r.Tl){t.strokeStyle=r.Rl,ie(t,r.Dl),t.beginPath();for(let a of r.Il){let l=Math.round(a.Vl*i);t.moveTo(l,-o),t.lineTo(l,e.height+o)}t.stroke()}if(r.Bl){t.strokeStyle=r.El,ie(t,r.Al),t.beginPath();for(let a of r.Ll){let l=Math.round(a.Vl*n);t.moveTo(-o,l),t.lineTo(e.width+o,l)}t.stroke()}}))}},Hn=class{constructor(t){this.Xt=new Un,this.xt=!0,this.yt=t}Pt(){this.xt=!0}Tt(){if(this.xt){let t=this.yt.Qt().N().grid,e={Bl:t.horzLines.visible,Tl:t.vertLines.visible,El:t.horzLines.color,Rl:t.vertLines.color,Al:t.horzLines.style,Dl:t.vertLines.style,Ll:this.yt.kn().zl(),Il:(this.yt.Qt().Et().zl()||[]).map((i=>({Vl:i.coord})))};this.Xt.ht(e),this.xt=!1}return this.Xt}},jn=class{constructor(t){this.Yh=new Hn(t)}wr(){return this.Yh}},Gs={Ol:4,Nl:1e-4};function ve(s,t){let e=100*(s-t)/t;return t<0?-e:e}function ic(s,t){let e=ve(s.Je(),t),i=ve(s.Qe(),t);return new st(e,i)}function Ze(s,t){let e=100*(s-t)/t+100;return t<0?-e:e}function sc(s,t){let e=Ze(s.Je(),t),i=Ze(s.Qe(),t);return new st(e,i)}function is(s,t){let e=Math.abs(s);if(e<1e-15)return 0;let i=Math.log10(e+t.Nl)+t.Ol;return s<0?-i:i}function ti(s,t){let e=Math.abs(s);if(e<1e-15)return 0;let i=Math.pow(10,e-t.Ol)-t.Nl;return s<0?-i:i}function Ye(s,t){if(s===null)return null;let e=is(s.Je(),t),i=is(s.Qe(),t);return new st(e,i)}function be(s,t){if(s===null)return null;let e=ti(s.Je(),t),i=ti(s.Qe(),t);return new st(e,i)}function Xs(s){if(s===null)return Gs;let t=Math.abs(s.Qe()-s.Je());if(t>=1||t<1e-15)return Gs;let e=Math.ceil(Math.abs(Math.log10(t))),i=Gs.Ol+e;return{Ol:i,Nl:1/Math.pow(10,i)}}var ei=class{constructor(t,e){if(this.Fl=t,this.Wl=e,(function(i){if(i<0)return!1;if(i>1e18)return!0;for(let n=i;n>1;n/=10)if(n%10!=0)return!1;return!0})(this.Fl))this.Hl=[2,2.5,2];else{this.Hl=[];for(let i=this.Fl;i!==1;){if(i%2==0)this.Hl.push(2),i/=2;else{if(i%5!=0)throw new Error("unexpected base");this.Hl.push(2,2.5),i/=5}if(this.Hl.length>100)throw new Error("something wrong with base")}}}Ul(t,e,i){let n=this.Fl===0?0:1/this.Fl,o=Math.pow(10,Math.max(0,Math.ceil(Math.log10(t-e)))),r=0,a=this.Wl[0];for(;;){let u=Oi(o,n,1e-14)&&o>n+1e-14,d=Oi(o,i*a,1e-14),m=Oi(o,1,1e-14);if(!(u&&d&&m))break;o/=a,a=this.Wl[++r%this.Wl.length]}if(o<=n+1e-14&&(o=n),o=Math.max(1,o),this.Hl.length>0&&(l=o,h=1,c=1e-14,Math.abs(l-h)<c))for(r=0,a=this.Hl[0];Oi(o,i*a,1e-14)&&o>n+1e-14;)o/=a,a=this.Hl[++r%this.Hl.length];var l,h,c;return o}},ss=class{constructor(t,e,i,n){this.$l=[],this.Ki=t,this.Fl=e,this.jl=i,this.ql=n}Ul(t,e){if(t<e)throw new Error("high < low");let i=this.Ki.$t(),n=(t-e)*this.Yl()/i,o=new ei(this.Fl,[2,2.5,2]),r=new ei(this.Fl,[2,2,2.5]),a=new ei(this.Fl,[2.5,2,2]),l=[];return l.push(o.Ul(t,e,n),r.Ul(t,e,n),a.Ul(t,e,n)),(function(h){if(h.length<1)throw Error("array is empty");let c=h[0];for(let u=1;u<h.length;++u)h[u]<c&&(c=h[u]);return c})(l)}Kl(){let t=this.Ki,e=t.Lt();if(e===null)return void(this.$l=[]);let i=t.$t(),n=this.jl(i-1,e),o=this.jl(0,e),r=this.Ki.N().entireTextOnly?this.Gl()/2:0,a=r,l=i-1-r,h=Math.max(n,o),c=Math.min(n,o);if(h===c)return void(this.$l=[]);let u=this.Ul(h,c);if(this.Zl(e,u,h,c,a,l),t.Xl()&&this.Jl(u,c,h)){let f=this.Ki.Ql();this.io(e,u,a,l,f,2*f)}let d=this.$l.map((f=>f.no)),m=this.Ki.so(d);for(let f=0;f<this.$l.length;f++)this.$l[f].eo=m[f]}zl(){return this.$l}Gl(){return this.Ki.P()}Yl(){return Math.ceil(this.Gl()*this.Ki.N().tickMarkDensity)}Zl(t,e,i,n,o,r){let a=this.$l,l=this.Ki,h=i%e;h+=h<0?e:0;let c=i>=n?1:-1,u=null,d=0;for(let m=i-h;m>n;m-=e){let f=this.ql(m,t,!0);u!==null&&Math.abs(f-u)<this.Yl()||f<o||f>r||(d<a.length?(a[d].Vl=f,a[d].eo=l.ro(m),a[d].no=m):a.push({Vl:f,eo:l.ro(m),no:m}),d++,u=f,l.ho()&&(e=this.Ul(m*c,n)))}a.length=d}io(t,e,i,n,o,r){let a=this.$l,l=this.ao(t,i,o,r),h=this.ao(t,n,-r,-o),c=this.ql(0,t,!0)-this.ql(e,t,!0);a.length>0&&a[0].Vl-l.Vl<c/2&&a.shift(),a.length>0&&h.Vl-a[a.length-1].Vl<c/2&&a.pop(),a.unshift(l),a.push(h)}ao(t,e,i,n){let o=(i+n)/2,r=this.jl(e+i,t),a=this.jl(e+n,t),l=Math.min(r,a),h=Math.max(r,a),c=Math.max(.1,this.Ul(h,l)),u=this.jl(e+o,t),d=u-u%c,m=this.ql(d,t,!0);return{eo:this.Ki.ro(d),Vl:m,no:d}}Jl(t,e,i){let n=It(this.Ki.ar());return this.Ki.ho()&&(n=be(n,this.Ki.lo())),n.Je()-e<t&&i-n.Qe()<t}};function Sl(s){return s.slice().sort(((t,e)=>S(t.ln())-S(e.ln())))}var Va;(function(s){s[s.Normal=0]="Normal",s[s.Logarithmic=1]="Logarithmic",s[s.Percentage=2]="Percentage",s[s.IndexedTo100=3]="IndexedTo100"})(Va||(Va={}));var qa=new Gi,Da=new Ce(100,1),Kn=class{constructor(t,e,i,n,o){this.oo=0,this._o=null,this.rr=null,this.uo=null,this.co={do:!1,fo:null},this.po=!1,this.vo=0,this.mo=0,this.wo=new B,this.Mo=new B,this.bo=[],this.So=null,this.xo=null,this.Co=null,this.yo=null,this.Po=null,this.el=Da,this.ko=Xs(null),this.To=t,this.yn=e,this.Ro=i,this.Do=n,this.Io=o,this.Vo=new ss(this,100,this.Bo.bind(this),this.Eo.bind(this))}pl(){return this.To}N(){return this.yn}vr(t){if(it(this.yn,t),this.vl(),t.mode!==void 0&&this.Ao({_e:t.mode}),t.scaleMargins!==void 0){let e=tt(t.scaleMargins.top),i=tt(t.scaleMargins.bottom);if(e<0||e>1)throw new Error(`Invalid top margin - expect value between 0 and 1, given=${e}`);if(i<0||i>1)throw new Error(`Invalid bottom margin - expect value between 0 and 1, given=${i}`);if(e+i>1)throw new Error(`Invalid margins - sum of margins must be less than 1, given=${e+i}`);this.Lo(),this.Co=null}}zo(){return this.yn.autoScale}Oo(){return this.po}ho(){return this.yn.mode===1}je(){return this.yn.mode===2}No(){return this.yn.mode===3}lo(){return this.ko}_e(){return{hs:this.yn.autoScale,Fo:this.yn.invertScale,_e:this.yn.mode}}Ao(t){let e=this._e(),i=null;t.hs!==void 0&&(this.yn.autoScale=t.hs),t._e!==void 0&&(this.yn.mode=t._e,t._e!==2&&t._e!==3||(this.yn.autoScale=!0),this.co.do=!1),e._e===1&&t._e!==e._e&&((function(o,r){if(o===null)return!1;let a=ti(o.Je(),r),l=ti(o.Qe(),r);return isFinite(a)&&isFinite(l)})(this.rr,this.ko)?(i=be(this.rr,this.ko),i!==null&&this.Wo(i)):this.yn.autoScale=!0),t._e===1&&t._e!==e._e&&(i=Ye(this.rr,this.ko),i!==null&&this.Wo(i));let n=e._e!==this.yn.mode;n&&(e._e===2||this.je())&&this.vl(),n&&(e._e===3||this.No())&&this.vl(),t.Fo!==void 0&&e.Fo!==t.Fo&&(this.yn.invertScale=t.Fo,this.Ho()),this.Mo.p(e,this._e())}Uo(){return this.Mo}P(){return this.Ro.fontSize}$t(){return this.oo}$o(t){this.oo!==t&&(this.oo=t,this.Lo(),this.Co=null)}jo(){if(this._o)return this._o;let t=this.$t()-this.qo()-this.Yo();return this._o=t,t}ar(){return this.Ko(),this.rr}Wo(t,e){let i=this.rr;(e||i===null&&t!==null||i!==null&&!i.Ze(t))&&(this.Co=null,this.rr=t)}Go(t){this.Wo(t),this.Zo(t!==null)}Zi(){return this.Ko(),this.oo===0||!this.rr||this.rr.Zi()}Xo(t){return this.Fo()?t:this.$t()-1-t}Nt(t,e){return this.je()?t=ve(t,e):this.No()&&(t=Ze(t,e)),this.Eo(t,e)}Jo(t,e,i){this.Ko();let n=this.Yo(),o=S(this.ar()),r=o.Je(),a=o.Qe(),l=this.jo()-1,h=this.Fo(),c=l/(a-r),u=i===void 0?0:i.from,d=i===void 0?t.length:i.to,m=this.Qo();for(let f=u;f<d;f++){let g=t[f],w=g.Mt;if(isNaN(w))continue;let v=w;m!==null&&(v=m(g.Mt,e));let x=n+c*(v-r),M=h?x:this.oo-1-x;g.ut=M}}t_(t,e,i){this.Ko();let n=this.Yo(),o=S(this.ar()),r=o.Je(),a=o.Qe(),l=this.jo()-1,h=this.Fo(),c=l/(a-r),u=i===void 0?0:i.from,d=i===void 0?t.length:i.to,m=this.Qo();for(let f=u;f<d;f++){let g=t[f],w=g.jr,v=g.qr,x=g.Yr,M=g.Kr;m!==null&&(w=m(g.jr,e),v=m(g.qr,e),x=m(g.Yr,e),M=m(g.Kr,e));let C=n+c*(w-r),k=h?C:this.oo-1-C;g.i_=k,C=n+c*(v-r),k=h?C:this.oo-1-C,g.n_=k,C=n+c*(x-r),k=h?C:this.oo-1-C,g.s_=k,C=n+c*(M-r),k=h?C:this.oo-1-C,g.e_=k}}Tn(t,e){let i=this.Bo(t,e);return this.r_(i,e)}r_(t,e){let i=t;return this.je()?i=(function(n,o){return o<0&&(n=-n),n/100*o+o})(i,e):this.No()&&(i=(function(n,o){return n-=100,o<0&&(n=-n),n/100*o+o})(i,e)),i}kl(){return this.bo}Dt(){return this.xo||(this.xo=Sl(this.bo)),this.xo}h_(t){this.bo.indexOf(t)===-1&&(this.bo.push(t),this.vl(),this.a_())}l_(t){let e=this.bo.indexOf(t);if(e===-1)throw new Error("source is not attached to scale");this.bo.splice(e,1),this.bo.length===0&&(this.Ao({hs:!0}),this.Wo(null)),this.vl(),this.a_()}Lt(){let t=null;for(let e of this.bo){let i=e.Lt();i!==null&&(t===null||i.Oa<t.Oa)&&(t=i)}return t===null?null:t.Wt}Fo(){return this.yn.invertScale}zl(){let t=this.Lt()===null;if(this.Co!==null&&(t||this.Co.o_===t))return this.Co.zl;this.Vo.Kl();let e=this.Vo.zl();return this.Co={zl:e,o_:t},this.wo.p(),e}__(){return this.wo}u_(t){this.je()||this.No()||this.yo===null&&this.uo===null&&(this.Zi()||(this.yo=this.oo-t,this.uo=S(this.ar()).Xe()))}c_(t){if(this.je()||this.No()||this.yo===null)return;this.Ao({hs:!1}),(t=this.oo-t)<0&&(t=0);let e=(this.yo+.2*(this.oo-1))/(t+.2*(this.oo-1)),i=S(this.uo).Xe();e=Math.max(e,.1),i.ir(e),this.Wo(i)}d_(){this.je()||this.No()||(this.yo=null,this.uo=null)}f_(t){this.zo()||this.Po===null&&this.uo===null&&(this.Zi()||(this.Po=t,this.uo=S(this.ar()).Xe()))}p_(t){if(this.zo()||this.Po===null)return;let e=S(this.ar()).tr()/(this.jo()-1),i=t-this.Po;this.Fo()&&(i*=-1);let n=i*e,o=S(this.uo).Xe();o.nr(n),this.Wo(o,!0),this.Co=null}v_(){this.zo()||this.Po!==null&&(this.Po=null,this.uo=null)}sl(){return this.el||this.vl(),this.el}Ji(t,e){switch(this.yn.mode){case 2:return this.m_(ve(t,e));case 3:return this.sl().format(Ze(t,e));default:return this.cr(t)}}ro(t){switch(this.yn.mode){case 2:return this.m_(t);case 3:return this.sl().format(t);default:return this.cr(t)}}so(t){switch(this.yn.mode){case 2:return this.w_(t);case 3:return this.sl().formatTickmarks(t);default:return this.M_(t)}}xa(t){return this.cr(t,S(this.So).sl())}Ca(t,e){return t=ve(t,e),this.m_(t,qa)}g_(){return this.bo}b_(t){this.co={fo:t,do:!1}}Nn(){this.bo.forEach((t=>t.Nn()))}Xl(){return this.yn.ensureEdgeTickMarksVisible&&this.zo()}Ql(){return this.P()/2}vl(){this.Co=null;let t=1/0;this.So=null;for(let i of this.bo)i.ln()<t&&(t=i.ln(),this.So=i);let e=100;this.So!==null&&(e=Math.round(this.So.Kh())),this.el=Da,this.je()?(this.el=qa,e=100):this.No()?(this.el=new Ce(100,1),e=100):this.So!==null&&(this.el=this.So.sl()),this.Vo=new ss(this,e,this.Bo.bind(this),this.Eo.bind(this)),this.Vo.Kl()}a_(){this.xo=null}S_(){return this.So===null||this.je()||this.No()?1:1/this.So.Kh()}Xi(){return this.Io}Zo(t){this.po=t}qo(){return this.Fo()?this.yn.scaleMargins.bottom*this.$t()+this.mo:this.yn.scaleMargins.top*this.$t()+this.vo}Yo(){return this.Fo()?this.yn.scaleMargins.top*this.$t()+this.vo:this.yn.scaleMargins.bottom*this.$t()+this.mo}Ko(){this.co.do||(this.co.do=!0,this.x_())}Lo(){this._o=null}Eo(t,e){if(this.Ko(),this.Zi())return 0;t=this.ho()&&t?is(t,this.ko):t;let i=S(this.ar()),n=this.Yo()+(this.jo()-1)*(t-i.Je())/i.tr();return this.Xo(n)}Bo(t,e){if(this.Ko(),this.Zi())return 0;let i=this.Xo(t),n=S(this.ar()),o=n.Je()+n.tr()*((i-this.Yo())/(this.jo()-1));return this.ho()?ti(o,this.ko):o}Ho(){this.Co=null,this.Vo.Kl()}x_(){if(this.Oo()&&!this.zo())return;let t=this.co.fo;if(t===null)return;let e=null,i=this.g_(),n=0,o=0;for(let l of i){if(!l.It())continue;let h=l.Lt();if(h===null)continue;let c=l.la(t.Na(),t.bi()),u=c&&c.ar();if(u!==null){switch(this.yn.mode){case 1:u=Ye(u,this.ko);break;case 2:u=ic(u,h.Wt);break;case 3:u=sc(u,h.Wt)}if(e=e===null?u:e.Ss(S(u)),c!==null){let d=c.lr();d!==null&&(n=Math.max(n,d.above),o=Math.max(o,d.below))}}}if(this.Xl()&&(n=Math.max(n,this.Ql()),o=Math.max(o,this.Ql())),n===this.vo&&o===this.mo||(this.vo=n,this.mo=o,this.Co=null,this.Lo()),e!==null){if(e.Je()===e.Qe()){let l=5*this.S_();this.ho()&&(e=be(e,this.ko)),e=new st(e.Je()-l,e.Qe()+l),this.ho()&&(e=Ye(e,this.ko))}if(this.ho()){let l=be(e,this.ko),h=Xs(l);if(r=h,a=this.ko,r.Ol!==a.Ol||r.Nl!==a.Nl){let c=this.uo!==null?be(this.uo,this.ko):null;this.ko=h,e=Ye(l,h),c!==null&&(this.uo=Ye(c,h))}}this.Wo(e)}else this.rr===null&&(this.Wo(new st(-.5,.5)),this.ko=Xs(null));var r,a}Qo(){return this.je()?ve:this.No()?Ze:this.ho()?t=>is(t,this.ko):null}C_(t,e,i){return e===void 0?(i===void 0&&(i=this.sl()),i.format(t)):e(t)}y_(t,e,i){return e===void 0?(i===void 0&&(i=this.sl()),i.formatTickmarks(t)):e(t)}cr(t,e){return this.C_(t,this.Do.priceFormatter,e)}M_(t,e){let i=this.Do.priceFormatter;return this.y_(t,this.Do.tickmarksPriceFormatter??(i?n=>n.map(i):void 0),e)}m_(t,e){return this.C_(t,this.Do.percentageFormatter,e)}w_(t,e){let i=this.Do.percentageFormatter;return this.y_(t,this.Do.tickmarksPercentageFormatter??(i?n=>n.map(i):void 0),e)}};function Wa(s){return s instanceof Me}var ni=class{constructor(t,e){this.bo=[],this.P_=new Map,this.oo=0,this.k_=0,this.T_=1,this.xo=null,this.R_=null,this.D_=!1,this.I_=new B,this.fa=[],this.ia=t,this.sn=e,this.V_=new jn(this);let i=e.N();this.B_=this.E_("left",i.leftPriceScale),this.A_=this.E_("right",i.rightPriceScale),this.B_.Uo().i(this.L_.bind(this,this.B_),this),this.A_.Uo().i(this.L_.bind(this,this.A_),this),this.z_(i)}z_(t){if(t.leftPriceScale&&this.B_.vr(t.leftPriceScale),t.rightPriceScale&&this.A_.vr(t.rightPriceScale),t.localization&&(this.B_.vl(),this.A_.vl()),t.overlayPriceScales){let e=Array.from(this.P_.values());for(let i of e){let n=S(i[0].Ft());n.vr(t.overlayPriceScales),t.localization&&n.vl()}}}O_(t){switch(t){case"left":return this.B_;case"right":return this.A_}return this.P_.has(t)?tt(this.P_.get(t))[0].Ft():null}m(){this.Qt().N_().u(this),this.B_.Uo().u(this),this.A_.Uo().u(this),this.bo.forEach((t=>{t.m&&t.m()})),this.fa=this.fa.filter((t=>{let e=t.Qh();return e.detached&&e.detached(),!1})),this.I_.p()}F_(){return this.T_}W_(t){this.T_=t}Qt(){return this.sn}nn(){return this.k_}$t(){return this.oo}H_(t){this.k_=t,this.U_()}$o(t){this.oo=t,this.B_.$o(t),this.A_.$o(t),this.bo.forEach((e=>{if(this.Gs(e)){let i=e.Ft();i!==null&&i.$o(t)}})),this.U_()}j_(t){this.D_=t}q_(){return this.D_}Y_(){return this.bo.filter(Wa)}kl(){return this.bo}Gs(t){let e=t.Ft();return e===null||this.B_!==e&&this.A_!==e}h_(t,e,i){this.K_(t,e,i?t.ln():this.bo.length)}l_(t,e){let i=this.bo.indexOf(t);G(i!==-1,"removeDataSource: invalid data source"),this.bo.splice(i,1),e||this.bo.forEach(((r,a)=>r._n(a)));let n=S(t.Ft()).pl();if(this.P_.has(n)){let r=tt(this.P_.get(n)),a=r.indexOf(t);a!==-1&&(r.splice(a,1),r.length===0&&this.P_.delete(n))}let o=t.Ft();o&&o.kl().indexOf(t)>=0&&(o.l_(t),this.G_(o)),this.Z_()}Xs(t){return t===this.B_?"left":t===this.A_?"right":"overlay"}X_(){return this.B_}J_(){return this.A_}Q_(t,e){t.u_(e)}tu(t,e){t.c_(e),this.U_()}iu(t){t.d_()}nu(t,e){t.f_(e)}su(t,e){t.p_(e),this.U_()}eu(t){t.v_()}U_(){this.bo.forEach((t=>{t.Nn()}))}kn(){let[t,e]=this.ru(),i=null;return t.N().visible&&t.kl().length!==0?i=t:e.N().visible&&e.kl().length!==0?i=e:this.bo.length!==0&&(i=this.bo[0].Ft()),i===null&&(i=this.Zs()??t),i}Zs(){let[t,e]=this.ru();return t.N().visible?t:e.N().visible?e:null}G_(t){t!==null&&t.zo()&&this.hu(t)}au(t){let e=this.ia.Ee();t.Ao({hs:!0}),e!==null&&t.b_(e),this.U_()}lu(){this.hu(this.B_),this.hu(this.A_)}ou(){this.G_(this.B_),this.G_(this.A_),this.bo.forEach((t=>{this.Gs(t)&&this.G_(t.Ft())})),this.U_(),this.sn.mr()}Dt(){return this.xo===null&&(this.xo=Sl(this.bo)),this.xo}_u(){let t=this.Dt(),e=this.sn.cu()?.uu,i=this.sn.N().hoveredSeriesOnTop,n=this.R_;if(n!==null&&n.Kh===t&&n.du===e&&n.fu===i)return n.pu;let o=(function(r,a,l){if(!l)return r;let h=r.indexOf(a);if(h===-1||h===r.length-1)return r;let c=[];for(let u=0;u<r.length;u++)u!==h&&c.push(r[u]);return c.push(r[h]),c})(t,e,i);return this.R_={Kh:t,du:e,fu:i,pu:o},o}vu(t,e){e=Je(e,0,this.bo.length-1);let i=this.bo.indexOf(t);G(i!==-1,"setSeriesOrder: invalid data source"),this.bo.splice(i,1),this.bo.splice(e,0,t),this.bo.forEach(((n,o)=>n._n(o))),this.Z_();for(let n of[this.B_,this.A_])n.a_(),n.vl();this.sn.mr()}Vt(){return this.Dt().filter(Wa)}mu(){return this.I_}wu(){return this.V_}ol(t){this.fa.push(new Gh(t))}_l(t){this.fa=this.fa.filter((e=>e.Qh()!==t)),t.detached&&t.detached(),this.sn.mr()}Mu(){return this.fa}il(t,e){return this.fa.map((i=>i.Qs(t,e))).filter((i=>i!==null))}hu(t){let e=t.g_();if(e&&e.length>0&&!this.ia.Zi()){let i=this.ia.Ee();i!==null&&t.b_(i)}t.Nn()}K_(t,e,i){let n=this.O_(e);if(n===null&&(n=this.E_(e,this.sn.N().overlayPriceScales)),this.bo.splice(i,0,t),!ds(e)){let o=this.P_.get(e)||[];o.push(t),this.P_.set(e,o)}t._n(i),n.h_(t),t.un(n),this.G_(n),this.Z_()}Z_(){this.xo=null,this.R_=null}ru(){return this.sn.N().defaultVisiblePriceScaleId==="left"?[this.B_,this.A_]:[this.A_,this.B_]}L_(t,e,i){e._e!==i._e&&this.hu(t)}E_(t,e){let i={visible:!0,autoScale:!0,...zt(e)},n=new Kn(t,i,this.sn.N().layout,this.sn.N().localization,this.sn.Xi());return n.$o(this.$t()),n}};function Yn(s,t){return t===null||s.se===2&&t.se!==2||(t.se!==2||s.se===2)&&s.ne!==t.ne&&s.ne<t.ne}function Ml(s){return{te:s.te,ie:s.ie}}function nc(s){return{ne:s.distance??0,se:s.hitTestPriority??(s.itemType==="marker"?2:0),ee:s.itemType??"primitive",gu:s.cursorStyle,te:s.externalId}}function Fi(s){return{uu:s.uu,bu:Ml(s.Su),gu:s.Su.gu,ee:s.Su.ee??"primitive"}}function oc(s,t,e,i){let n=null;for(let o of s){let r=o.Qs?.(t,e,i)??null;if(r===null){let a=o.Tt(i);r=a!==null&&a.Qs?a.Qs(t,e):null}if(r!==null){let a={xu:o,Su:r};(n===null||Yn(a.Su,n.Su))&&(n=a)}}return n}function rc(s){return s.jn!==void 0}function _l(s,t,e){let i=[s,...s.Dt()].reverse(),n=(function(a,l,h){let c,u,d;for(let g of a){let w=g.il?.(l,h)??[];for(let v of w){let x=nc(v);m=v.zOrder,f=c?.zOrder,(!f||m==="top"&&f!=="top"||m==="normal"&&f==="bottom"||v.zOrder===c?.zOrder&&u!==void 0&&Yn(x,u)||v.zOrder===c?.zOrder&&u===void 0)&&(c=v,u=x,d=g)}}var m,f;return c&&d&&u?{Su:u,Cu:c,uu:d}:null})(i,t,e);if(n?.Cu.zOrder==="top")return Fi(n);let o=null,r=null;for(let a of i){if(n&&n.uu===a&&n.Cu.zOrder!=="bottom"&&!n.Cu.isBackground)return o??Fi(n);if(rc(a)){let l=oc(a.jn(s),t,e,s);if(l!==null){let h={uu:a,xu:l.xu,bu:Ml(l.Su),gu:l.Su.gu,ee:l.Su.ee??"primitive"};(o===null||Yn(l.Su,r))&&(o=h,r=l.Su)}}if(n&&n.uu===a&&n.Cu.zOrder!=="bottom"&&n.Cu.isBackground)return o??Fi(n)}return o!==null?o:n?.Cu?Fi(n):null}var Qn=class{constructor(t,e,i=50){this.Vs=0,this.Bs=1,this.Es=1,this.Ls=new Map,this.As=new Map,this.yu=t,this.Pu=e,this.zs=i}ku(t){let e=t.time,i=this.Pu.cacheKey(e),n=this.Ls.get(i);if(n!==void 0)return n.Tu;if(this.Vs===this.zs){let r=this.As.get(this.Es);this.As.delete(this.Es),this.Ls.delete(tt(r)),this.Es++,this.Vs--}let o=this.yu(t);return this.Ls.set(i,{Tu:o,Ws:this.Bs}),this.As.set(this.Bs,i),this.Vs++,this.Bs++,o}},ee=class{constructor(t,e){G(t<=e,"right should be >= left"),this.Ru=t,this.Du=e}Na(){return this.Ru}bi(){return this.Du}Iu(){return this.Du-this.Ru+1}ze(t){return this.Ru<=t&&t<=this.Du}Ze(t){return this.Ru===t.Na()&&this.Du===t.bi()}};function Ua(s,t){return s===null||t===null?s===t:s.Ze(t)}var Gn=class{constructor(){this.Vu=new Map,this.Ls=null,this.Bu=!1}Eu(t){this.Bu=t,this.Ls=null}Au(t,e){this.Lu(e),this.Ls=null;for(let i=e;i<t.length;++i){let n=t[i],o=this.Vu.get(n.timeWeight);o===void 0&&(o=[],this.Vu.set(n.timeWeight,o)),o.push({index:i,time:n.time,weight:n.timeWeight,originalTime:n.originalTime})}}zu(t,e,i,n,o){let r=Math.ceil(e/t);return this.Ls!==null&&this.Ls.Ou===r&&o===this.Ls.Nu&&i===this.Ls.Fu||(this.Ls={Nu:o,Fu:i,zl:this.Wu(r,i,n),Ou:r}),this.Ls.zl}Lu(t){if(t===0)return void this.Vu.clear();let e=[];this.Vu.forEach(((i,n)=>{t<=i[0].index?e.push(n):i.splice(se(i,t,(o=>o.index<t)),1/0)}));for(let i of e)this.Vu.delete(i)}Wu(t,e,i){let n=[],o=r=>!e||i.has(r.index);for(let r of Array.from(this.Vu.keys()).sort(((a,l)=>l-a))){if(!this.Vu.get(r))continue;let a=n;n=[];let l=a.length,h=0,c=tt(this.Vu.get(r)),u=c.length,d=1/0,m=-1/0;for(let f=0;f<u;f++){let g=c[f],w=g.index;for(;h<l;){let v=a[h],x=v.index;if(!(x<w&&o(v))){d=x;break}h++,n.push(v),m=x,d=1/0}if(d-w>=t&&w-m>=t&&o(g))n.push(g),m=w;else if(this.Bu)return a}for(;h<l;h++)o(a[h])&&n.push(a[h])}return n}},we=class s{constructor(t){this.Hu=t}Uu(){return this.Hu===null?null:new ee(Math.floor(this.Hu.Na()),Math.ceil(this.Hu.bi()))}$u(){return this.Hu}static ju(){return new s(null)}};function ac(s,t){return s.weight>t.weight?s:t}var Xn=class{constructor(t,e,i,n){this.k_=0,this.qu=null,this.Yu=[],this.Po=null,this.yo=null,this.Ku=new Gn,this.Gu=new Map,this.Zu=we.ju(),this.Xu=!0,this.Ju=new B,this.Qu=new B,this.tc=new B,this.nc=null,this.sc=null,this.ec=new Map,this.rc=-1,this.hc=[],this.ac=1,this.yn=e,this.Do=i,this.lc=e.rightOffset,this.oc=e.barSpacing,this.sn=t,this._c(e),this.Pu=n,this.uc(),this.Ku.Eu(e.uniformDistribution),this.cc(),this.dc()}N(){return this.yn}fc(t){it(this.Do,t),this.vc(),this.uc()}vr(t,e){it(this.yn,t),this.yn.fixLeftEdge&&this.mc(),this.yn.fixRightEdge&&this.wc(),t.barSpacing!==void 0&&this.sn.Ms(t.barSpacing),t.rightOffset!==void 0&&this.sn.gs(t.rightOffset),this._c(t),t.minBarSpacing===void 0&&t.maxBarSpacing===void 0||this.sn.Ms(t.barSpacing??this.oc),t.ignoreWhitespaceIndices!==void 0&&t.ignoreWhitespaceIndices!==this.yn.ignoreWhitespaceIndices&&this.dc(),this.vc(),this.uc(),t.enableConflation===void 0&&t.conflationThresholdFactor===void 0||this.cc(),this.tc.p()}Rn(t){return this.Yu[t]?.time??null}en(t){return this.Yu[t]??null}Mc(t,e){if(this.Yu.length<1)return null;if(this.Pu.key(t)>this.Pu.key(this.Yu[this.Yu.length-1].time))return e?this.Yu.length-1:null;let i=se(this.Yu,this.Pu.key(t),((n,o)=>this.Pu.key(n.time)<o));return this.Pu.key(t)<this.Pu.key(this.Yu[i].time)?e?i:null:i}Zi(){return this.k_===0||this.Yu.length===0||this.qu===null}gc(){return this.Yu.length>0}Ee(){return this.bc(),this.Zu.Uu()}Sc(){return this.bc(),this.Zu.$u()}xc(){let t=this.Ee();if(t===null)return null;let e={from:t.Na(),to:t.bi()};return this.Cc(e)}Cc(t){let e=Math.round(t.from),i=Math.round(t.to),n=S(this.yc()),o=S(this.Pc());return{from:S(this.en(Math.max(n,e))),to:S(this.en(Math.min(o,i)))}}kc(t){return{from:S(this.Mc(t.from,!0)),to:S(this.Mc(t.to,!0))}}nn(){return this.k_}H_(t){if(!isFinite(t)||t<=0||this.k_===t)return;let e=this.Sc(),i=this.k_;if(this.k_=t,this.Xu=!0,this.yn.lockVisibleTimeRangeOnResize&&i!==0){let n=this.oc*t/i;this.oc=n}if(this.yn.fixLeftEdge&&e!==null&&e.Na()<=0){let n=i-t;this.lc-=Math.round(n/this.oc)+1,this.Xu=!0}this.Tc(),this.Rc()}jt(t){if(this.Zi()||!ii(t))return 0;let e=this.Dc()+this.lc-t;return this.k_-(e+.5)*this.oc-1}Ic(t,e){let i=this.Dc(),n=e===void 0?0:e.from,o=e===void 0?t.length:e.to;for(let r=n;r<o;r++){let a=t[r].wt,l=i+this.lc-a,h=this.k_-(l+.5)*this.oc-1;t[r]._t=h}}Vc(t,e){let i=Math.ceil(this.Bc(t));return e&&this.yn.ignoreWhitespaceIndices&&!this.Ec(i)?this.Ac(i):i}gs(t){this.Xu=!0,this.lc=t,this.Rc(),this.sn.Lc(),this.sn.mr()}ml(){return this.oc}Ms(t){let e=this.oc;if(this.zc(t),this.yn.rightOffsetPixels!==void 0&&e!==0){let i=this.lc*e/this.oc;this.lc=i}this.Rc(),this.sn.Lc(),this.sn.mr()}Oc(){return this.lc}zl(){if(this.Zi())return null;if(this.sc!==null)return this.sc;let t=this.oc,e=5*(this.sn.N().layout.fontSize+4)/8*(this.yn.tickMarkMaxCharacterLength||8),i=Math.round(e/t),n=S(this.Ee()),o=Math.max(n.Na(),n.Na()-i),r=Math.max(n.bi(),n.bi()-i),a=this.Ku.zu(t,e,this.yn.ignoreWhitespaceIndices,this.ec,this.rc),l=this.yc()+i,h=this.Pc()-i,c=this.Nc(),u=this.yn.fixLeftEdge||c,d=this.yn.fixRightEdge||c,m=0;for(let f of a){if(!(o<=f.index&&f.index<=r))continue;let g;m<this.hc.length?(g=this.hc[m],g.coord=this.jt(f.index),g.label=this.Fc(f),g.weight=f.weight):(g={needAlignCoordinate:!1,coord:this.jt(f.index),label:this.Fc(f),weight:f.weight},this.hc.push(g)),this.oc>e/2&&!c?g.needAlignCoordinate=!1:g.needAlignCoordinate=u&&f.index<=l||d&&f.index>=h,m++}return this.hc.length=m,this.sc=this.hc,this.hc}Wc(){let t;this.Xu=!0,this.Ms(this.yn.barSpacing),t=this.yn.rightOffsetPixels!==void 0?this.yn.rightOffsetPixels/this.ml():this.yn.rightOffset,this.gs(t)}Hc(t){this.Xu=!0,this.qu=t,this.Rc(),this.mc()}Uc(t,e){let i=this.Bc(t),n=this.ml(),o=n+e*(n/10);this.Ms(o),this.yn.rightBarStaysOnScroll||this.gs(this.Oc()+(i-this.Bc(t)))}u_(t){this.Po&&this.v_(),this.yo===null&&this.nc===null&&(this.Zi()||(this.yo=t,this.$c()))}c_(t){if(this.nc===null)return;let e=Je(this.k_-t,0,this.k_),i=Je(this.k_-S(this.yo),0,this.k_);e!==0&&i!==0&&this.Ms(this.nc.ml*e/i)}d_(){this.yo!==null&&(this.yo=null,this.jc())}f_(t){this.Po===null&&this.nc===null&&(this.Zi()||(this.Po=t,this.$c()))}p_(t){if(this.Po===null)return;let e=(this.Po-t)/this.ml();this.lc=S(this.nc).Oc+e,this.Xu=!0,this.Rc()}v_(){this.Po!==null&&(this.Po=null,this.jc())}qc(){this.Yc(this.yn.rightOffset)}Yc(t,e=400){if(!isFinite(t))throw new RangeError("offset is required and must be finite number");if(!isFinite(e)||e<=0)throw new RangeError("animationDuration (optional) must be finite positive number");let i=this.lc,n=performance.now();this.sn.ps({Kc:o=>(o-n)/e>=1,Gc:o=>{let r=(o-n)/e;return r>=1?t:i+(t-i)*r}})}Pt(t,e){this.Xu=!0,this.Yu=t,this.Ku.Au(t,e),this.Rc()}Zc(){return this.Ju}Xc(){return this.Qu}Jc(){return this.tc}Dc(){return this.qu||0}Qc(t,e){let i=t.Iu(),n=e&&this.yn.rightOffsetPixels||0;this.zc((this.k_-n)/i),this.lc=t.bi()-this.Dc(),e&&(this.lc=n?n/this.ml():this.yn.rightOffset),this.Rc(),this.Xu=!0,this.sn.Lc(),this.sn.mr()}td(){let t=this.yc(),e=this.Pc();if(t===null||e===null)return;let i=!this.yn.rightOffsetPixels&&this.yn.rightOffset||0;this.Qc(new ee(t,e+i),!0)}nd(t){let e=new ee(t.from,t.to);this.Qc(e)}rn(t){return this.Do.timeFormatter!==void 0?this.Do.timeFormatter(t.originalTime):this.Pu.formatHorzItem(t.time)}dc(){if(!this.yn.ignoreWhitespaceIndices)return;this.ec.clear();let t=this.sn.Jn();for(let e of t)for(let i of e.fl())this.ec.set(i,!0);this.rc++}sd(){return this.ac}Sl(){let t=1/(window.devicePixelRatio||1),e=this.yn.minBarSpacing;if(e>=t)return[1];let i=[1],n=2;for(;n<=512;)e<t/n&&i.push(n),n*=2;return i}Nc(){let t=this.sn.N().handleScroll,e=this.sn.N().handleScale;return!(t.horzTouchDrag||t.mouseWheel||t.pressedMouseMove||t.vertTouchDrag||e.axisDoubleClickReset.time||e.axisPressedMouseMove.time||e.mouseWheel||e.pinch)}yc(){return this.Yu.length===0?null:0}Pc(){return this.Yu.length===0?null:this.Yu.length-1}ed(t){return(this.k_-1-t)/this.oc}Bc(t){let e=this.ed(t),i=this.Dc()+this.lc-e;return Math.round(1e6*i)/1e6}zc(t){let e=this.oc;this.oc=t,this.Tc(),e!==this.oc&&(this.Xu=!0,this.rd(),this.cc())}bc(){if(!this.Xu)return;if(this.Xu=!1,this.Zi())return void this.hd(we.ju());let t=this.Dc(),e=this.k_/this.oc,i=this.lc+t,n=new ee(i-e+1,i);this.hd(new we(n))}Tc(){let t=Je(this.oc,this.ad(),this.ld());this.oc!==t&&(this.oc=t,this.Xu=!0)}ld(){return this.yn.maxBarSpacing>0?this.yn.maxBarSpacing:.5*this.k_}ad(){return this.yn.fixLeftEdge&&this.yn.fixRightEdge&&this.Yu.length!==0?this.k_/this.Yu.length:this.yn.minBarSpacing}cc(){if(!this.yn.enableConflation)return void(this.ac=1);let t=1/(window.devicePixelRatio||1)*(this.yn.conflationThresholdFactor??1);if(this.oc>=t)return void(this.ac=1);let e=t/this.oc,i=Math.pow(2,Math.floor(Math.log2(e)));this.ac=Math.min(i,512)}Rc(){let t=this.od();t!==null&&this.lc<t&&(this.lc=t,this.Xu=!0);let e=this._d();this.lc>e&&(this.lc=e,this.Xu=!0)}od(){let t=this.yc(),e=this.qu;return t===null||e===null?null:t-e-1+(this.yn.fixLeftEdge?this.k_/this.oc:Math.min(2,this.Yu.length))}_d(){return this.yn.fixRightEdge?0:this.k_/this.oc-Math.min(2,this.Yu.length)}$c(){this.nc={ml:this.ml(),Oc:this.Oc()}}jc(){this.nc=null}Fc(t){let e=this.Gu.get(t.weight);return e===void 0&&(e=new Qn((i=>this.ud(i)),this.Pu),this.Gu.set(t.weight,e)),e.ku(t)}ud(t){return this.Pu.formatTickmark(t,this.Do)}hd(t){let e=this.Zu;this.Zu=t,Ua(e.Uu(),this.Zu.Uu())||this.Ju.p(),Ua(e.$u(),this.Zu.$u())||this.Qu.p(),this.rd()}rd(){this.sc=null}vc(){this.rd(),this.Gu.clear()}uc(){this.Pu.updateFormatter(this.Do)}mc(){if(!this.yn.fixLeftEdge)return;let t=this.yc();if(t===null)return;let e=this.Ee();if(e===null)return;let i=e.Na()-t;if(i<0){let n=this.lc-i-1;this.gs(n)}this.Tc()}wc(){this.Rc(),this.Tc()}Ec(t){return!this.yn.ignoreWhitespaceIndices||this.ec.get(t)||!1}Ac(t){let e=(function*(n){let o=Math.round(n),r=o<n,a=1;for(;;)r?(yield o+a,yield o-a):(yield o-a,yield o+a),a++})(t),i=this.Pc();for(;i;){let n=e.next().value;if(this.ec.get(n))return n;if(n<0||n>i)break}return t}_c(t){if(t.rightOffsetPixels!==void 0){let e=t.rightOffsetPixels/(t.barSpacing||this.oc);this.sn.gs(e)}}},Ha,ja,Ka,oi,Ya;(function(s){s[s.OnTouchEnd=0]="OnTouchEnd",s[s.OnNextTap=1]="OnNextTap"})(Ha||(Ha={}));var Jn=class{constructor(t,e,i){this.dd=[],this.fd=[],this.pd=null,this.k_=0,this.vd=null,this.md=new B,this.wd=new B,this.Md=null,this.gd=t,this.yn=e,this.Pu=i,this.Io=new mn(this.yn.layout.colorParsers),this.bd=new dn(this),this.ia=new Xn(this,e.timeScale,this.yn.localization,i),this.Ct=new xn(this,e.crosshair),this.Sd=new Wn(e.crosshair),e.addDefaultPane&&(this.xd(0),this.dd[0].W_(2)),this.Cd=this.yd(0),this.Pd=this.yd(1)}ka(){this.kd(X.ys())}mr(){this.kd(X.Cs())}Ya(){this.kd(new X(1))}Ta(t){let e=this.Td(t);this.kd(e)}cu(){return this.vd}Rd(t){if(this.vd?.uu===t?.uu&&this.vd?.bu?.te===t?.bu?.te&&this.vd?.bu?.ie===t?.bu?.ie&&this.vd?.gu===t?.gu&&this.vd?.ee===t?.ee)return;let e=this.vd;this.vd=t,e!==null&&this.Ta(e.uu),t!==null&&t.uu!==e?.uu&&this.Ta(t.uu)}N(){return this.yn}vr(t){it(this.yn,t),this.dd.forEach((e=>e.z_(t))),t.timeScale!==void 0&&this.ia.vr(t.timeScale),t.localization!==void 0&&this.ia.fc(t.localization),(t.leftPriceScale||t.rightPriceScale)&&this.md.p(),this.Cd=this.yd(0),this.Pd=this.yd(1),this.ka()}Dd(t,e,i=0){let n=this.dd[i];if(n===void 0)return;if(t==="left")return it(this.yn,{leftPriceScale:e}),n.z_({leftPriceScale:e}),this.md.p(),void this.ka();if(t==="right")return it(this.yn,{rightPriceScale:e}),n.z_({rightPriceScale:e}),this.md.p(),void this.ka();let o=this.Id(t,i);o!==null&&(o.Ft.vr(e),this.md.p())}Id(t,e){let i=this.dd[e];if(i===void 0)return null;let n=i.O_(t);return n!==null?{Kn:i,Ft:n}:null}Et(){return this.ia}Gn(){return this.dd}Vd(){return this.Ct}Bd(){return this.wd}Ed(t,e){t.$o(e),this.Lc()}H_(t){this.k_=t,this.ia.H_(this.k_),this.dd.forEach((e=>e.H_(t))),this.Lc()}Ad(t){this.dd.length!==1&&(G(t>=0&&t<this.dd.length,"Invalid pane index"),this.dd.splice(t,1),this.ka())}Ld(t,e){if(this.dd.length<2)return;G(t>=0&&t<this.dd.length,"Invalid pane index");let i=this.dd[t],n=this.dd.reduce(((u,d)=>u+d.F_()),0),o=this.dd.reduce(((u,d)=>u+d.$t()),0),r=o-30*(this.dd.length-1);e=Math.min(r,Math.max(30,e));let a=n/o,l=i.$t();i.W_(e*a);let h=e-l,c=this.dd.length-1;for(let u of this.dd)if(u!==i){let d=Math.min(r,Math.max(30,u.$t()-h/c));h-=u.$t()-d,c-=1;let m=d*a;u.W_(m)}this.ka()}zd(t,e){G(t>=0&&t<this.dd.length&&e>=0&&e<this.dd.length,"Invalid pane index");let i=this.dd[t],n=this.dd[e];this.dd[t]=n,this.dd[e]=i,this.ka()}Od(t,e){if(G(t>=0&&t<this.dd.length&&e>=0&&e<this.dd.length,"Invalid pane index"),t===e)return;let[i]=this.dd.splice(t,1);this.dd.splice(e,0,i),this.ka()}Q_(t,e,i){t.Q_(e,i)}tu(t,e,i){t.tu(e,i),this.Ra(),this.kd(this.Nd(t,2))}iu(t,e){t.iu(e),this.kd(this.Nd(t,2))}nu(t,e,i){e.zo()||t.nu(e,i)}su(t,e,i){e.zo()||(t.su(e,i),this.Ra(),this.kd(this.Nd(t,2)))}eu(t,e){e.zo()||(t.eu(e),this.kd(this.Nd(t,2)))}au(t,e){t.au(e),this.kd(this.Nd(t,2))}Fd(t){this.ia.u_(t)}Wd(t,e){let i=this.Et();if(i.Zi()||e===0)return;let n=i.nn();t=Math.max(1,Math.min(t,n)),i.Uc(t,e),this.Lc()}Hd(t){this.Ud(0),this.$d(t),this.jd()}qd(t){this.ia.c_(t),this.Lc()}Yd(){this.ia.d_(),this.mr()}Ud(t){this.ia.f_(t)}$d(t){this.ia.p_(t),this.Lc()}jd(){this.ia.v_(),this.mr()}Jn(){return this.fd}Wn(){return this.pd===null&&(this.pd=this.fd.filter((t=>t.It()))),this.pd}Pa(){this.pd=null}Kd(t,e,i,n,o){this.Ct.In(t,e);let r=NaN,a=this.ia.Vc(t,!0),l=this.ia.Ee();l!==null&&(a=Math.min(Math.max(l.Na(),a),l.bi())),a=this.Ct.Fn(a);let h=n.kn(),c=h.Lt();if(c!==null&&(r=h.Tn(e,c)),r=this.Sd.Pl(r,a,n),this.Ct.An(a,r,n),this.Ya(),!o){let u=_l(n,t,e);this.Rd(u&&{uu:u.uu,bu:u.bu,gu:u.gu||null,ee:u.ee}),this.wd.p(this.Ct.Bt(),{x:t,y:e},i)}}Gd(t,e,i){let n=i.kn(),o=n.Lt(),r=n.Nt(t,S(o)),a=this.ia.Mc(e,!0),l=this.ia.jt(S(a));this.Kd(l,r,null,i,!0)}Zd(t){this.Vd().zn(),this.Ya(),t||this.wd.p(null,null,null)}Ra(){let t=this.Ct.Kn();if(t!==null){let e=this.Ct.Bn(),i=this.Ct.En();this.Kd(e,i,null,t)}this.Ct.Nn()}Xd(t,e,i){let n=this.ia.Rn(0);e!==void 0&&i!==void 0&&this.ia.Pt(e,i);let o=this.ia.Rn(0),r=this.ia.Dc(),a=this.ia.Ee();if(a!==null&&n!==null&&o!==null){let l=a.ze(r),h=this.Pu.key(n)>this.Pu.key(o),c=t!==null&&t>r&&!h,u=this.ia.N().allowShiftVisibleRangeOnWhitespaceReplacement,d=l&&(i!==void 0||u)&&this.ia.N().shiftVisibleRangeOnNewBar;if(c&&!d){let m=t-r;this.ia.gs(this.ia.Oc()-m)}}this.ia.Hc(t)}Ba(t){t!==null&&t.ou()}Ks(t){if((function(i){return i instanceof ni})(t))return t;let e=this.dd.find((i=>i.Dt().includes(t)));return e===void 0?null:e}Lc(){this.dd.forEach((t=>t.ou())),this.Ra()}m(){this.dd.forEach((t=>t.m())),this.dd.length=0,this.yn.localization.priceFormatter=void 0,this.yn.localization.percentageFormatter=void 0,this.yn.localization.timeFormatter=void 0}Jd(){return this.bd}Js(){return this.bd.N()}N_(){return this.md}Qd(t,e){let i=this.xd(e);this.tf(t,i),this.fd.push(t),this.Pa(),this.fd.length===1?this.ka():this.mr()}if(t){let e=this.Ks(t),i=this.fd.indexOf(t);G(i!==-1,"Series not found");let n=S(e);this.fd.splice(i,1),n.l_(t),t.m&&t.m(),this.Pa(),this.ia.dc(),this.nf(n)}ya(t,e){let i=S(this.Ks(t));i.l_(t,!0),i.h_(t,e,!0)}td(){let t=X.Cs();t.us(),this.kd(t)}sf(t){let e=X.Cs();e.fs(t),this.kd(e)}ws(){let t=X.Cs();t.ws(),this.kd(t)}Ms(t){let e=X.Cs();e.Ms(t),this.kd(e)}gs(t){let e=X.Cs();e.gs(t),this.kd(e)}ps(t){let e=X.Cs();e.ps(t),this.kd(e)}cs(){let t=X.Cs();t.cs(),this.kd(t)}ef(){let t=this.yn.defaultVisiblePriceScaleId,e=this.yn.leftPriceScale.visible;return e!==this.yn.rightPriceScale.visible?e?"left":"right":t}rf(t,e){if(G(e>=0,"Index should be greater or equal to 0"),e===this.hf(t))return;let i=S(this.Ks(t));i.l_(t);let n=this.xd(e);this.tf(t,n);let o=!1;i.kl().length===0&&(o=this.nf(i)),o||this.ka()}af(){return this.Pd}$(){return this.Cd}Ut(t){let e=this.Pd,i=this.Cd;if(e===i)return e;if(t=Math.max(0,Math.min(100,Math.round(100*t))),this.Md===null||this.Md.ah!==i||this.Md.oh!==e)this.Md={ah:i,oh:e,lf:new Map};else{let o=this.Md.lf.get(t);if(o!==void 0)return o}let n=this.Io.tt(i,e,t/100);return this.Md.lf.set(t,n),n}_f(t){return this.dd.indexOf(t)}Xi(){return this.Io}uf(){return this.cf()}cf(t){let e=new ni(this.ia,this);this.dd.push(e);let i=t??this.dd.length-1,n=X.ys();return n.es(i,{rs:0,hs:!0}),this.kd(n),e}xd(t){return G(t>=0,"Index should be greater or equal to 0"),(t=Math.min(this.dd.length,t))<this.dd.length?this.dd[t]:this.cf(t)}hf(t){return this.dd.findIndex((e=>e.Y_().includes(t)))}Nd(t,e){let i=new X(e);if(t!==null){let n=this.dd.indexOf(t);i.es(n,{rs:e})}return i}Td(t,e){return e===void 0&&(e=2),this.Nd(this.Ks(t),e)}kd(t){this.gd&&this.gd(t),this.dd.forEach((e=>e.wu().wr().Pt()))}tf(t,e){let i=t.N().priceScaleId,n=i!==void 0?i:this.ef();e.h_(t,n),ds(n)||t.vr(t.N())}yd(t){let e=this.yn.layout;return e.background.type==="gradient"?t===0?e.background.topColor:e.background.bottomColor:e.background.color}nf(t){return!t.q_()&&t.kl().length===0&&this.dd.length>1&&(this.dd.splice(this._f(t),1),this.ka(),!0)}};function Ll(s){if(s>=1)return 0;let t=0;for(;t<8;t++){let e=Math.round(s);if(Math.abs(e-s)<1e-8)return t;s*=10}return t}function Zn(s){return!ye(s)&&!ri(s)}function El(s){return ye(s)}(function(s){s[s.Disabled=0]="Disabled",s[s.Continuous=1]="Continuous",s[s.OnDataUpdate=2]="OnDataUpdate"})(ja||(ja={})),(function(s){s[s.LastBar=0]="LastBar",s[s.LastVisible=1]="LastVisible"})(Ka||(Ka={})),(function(s){s.Solid="solid",s.VerticalGradient="gradient"})(oi||(oi={})),(function(s){s[s.Year=0]="Year",s[s.Month=1]="Month",s[s.DayOfMonth=2]="DayOfMonth",s[s.Time=3]="Time",s[s.TimeWithSeconds=4]="TimeWithSeconds"})(Ya||(Ya={}));var Qa=s=>s.getUTCFullYear();function lc(s,t,e){return t.replace(/yyyy/g,(i=>Tt(Qa(i),4))(s)).replace(/yy/g,(i=>Tt(Qa(i)%100,2))(s)).replace(/MMMM/g,((i,n)=>new Date(i.getUTCFullYear(),i.getUTCMonth(),1).toLocaleString(n,{month:"long"}))(s,e)).replace(/MMM/g,((i,n)=>new Date(i.getUTCFullYear(),i.getUTCMonth(),1).toLocaleString(n,{month:"short"}))(s,e)).replace(/MM/g,(i=>Tt((n=>n.getUTCMonth()+1)(i),2))(s)).replace(/dd/g,(i=>Tt((n=>n.getUTCDate())(i),2))(s))}var ns=class{constructor(t="yyyy-MM-dd",e="default"){this.df=t,this.ff=e}ku(t){return lc(t,this.df,this.ff)}},to=class{constructor(t){this.pf=t||"%h:%m:%s"}ku(t){return this.pf.replace("%h",Tt(t.getUTCHours(),2)).replace("%m",Tt(t.getUTCMinutes(),2)).replace("%s",Tt(t.getUTCSeconds(),2))}},hc={vf:"yyyy-MM-dd",mf:"%h:%m:%s",wf:" ",Mf:"default"},eo=class{constructor(t={}){let e={...hc,...t};this.gf=new ns(e.vf,e.Mf),this.bf=new to(e.mf),this.Sf=e.wf}ku(t){return`${this.gf.ku(t)}${this.Sf}${this.bf.ku(t)}`}};function Ii(s){return 60*s*60*1e3}function Js(s){return 60*s*1e3}var Bi=[{xf:(Ga=1,1e3*Ga),Cf:10},{xf:Js(1),Cf:20},{xf:Js(5),Cf:21},{xf:Js(30),Cf:22},{xf:Ii(1),Cf:30},{xf:Ii(3),Cf:31},{xf:Ii(6),Cf:32},{xf:Ii(12),Cf:33}],Ga;function Xa(s,t){if(s.getUTCFullYear()!==t.getUTCFullYear())return 70;if(s.getUTCMonth()!==t.getUTCMonth())return 60;if(s.getUTCDate()!==t.getUTCDate())return 50;for(let e=Bi.length-1;e>=0;--e)if(Math.floor(t.getTime()/Bi[e].xf)!==Math.floor(s.getTime()/Bi[e].xf))return Bi[e].Cf;return 0}function Zs(s){let t=s;if(ri(s)&&(t=Lo(s)),!Zn(t))throw new Error("time must be of type BusinessDay");let e=new Date(Date.UTC(t.year,t.month-1,t.day,0,0,0,0));return{yf:Math.round(e.getTime()/1e3),Pf:t}}function Ja(s){if(!El(s))throw new Error("time must be of type isUTCTimestamp");return{yf:s}}function Lo(s){let t=new Date(s);if(isNaN(t.getTime()))throw new Error(`Invalid date string=${s}, expected format=yyyy-mm-dd`);return{day:t.getUTCDate(),month:t.getUTCMonth()+1,year:t.getUTCFullYear()}}function Za(s){ri(s.time)&&(s.time=Lo(s.time))}var os=class{options(){return this.yn}setOptions(t){this.yn=t,this.updateFormatter(t.localization)}preprocessData(t){Array.isArray(t)?(function(e){e.forEach(Za)})(t):Za(t)}createConverterToInternalObj(t){return S((function(e){return e.length===0?null:Zn(e[0].time)||ri(e[0].time)?Zs:Ja})(t))}key(t){return typeof t=="object"&&"yf"in t?t.yf:this.key(this.convertHorzItemToInternal(t))}cacheKey(t){let e=t;return e.Pf===void 0?new Date(1e3*e.yf).getTime():new Date(Date.UTC(e.Pf.year,e.Pf.month-1,e.Pf.day)).getTime()}convertHorzItemToInternal(t){return El(e=t)?Ja(e):Zn(e)?Zs(e):Zs(Lo(e));var e}updateFormatter(t){if(!this.yn)return;let e=t.dateFormat;this.yn.timeScale.timeVisible?this.kf=new eo({vf:e,mf:this.yn.timeScale.secondsVisible?"%h:%m:%s":"%h:%m",wf:"   ",Mf:t.locale}):this.kf=new ns(e,t.locale)}formatHorzItem(t){let e=t;return this.kf.ku(new Date(1e3*e.yf))}formatTickmark(t,e){let i=(function(o,r,a){switch(o){case 0:case 10:return r?a?4:3:2;case 20:case 21:case 22:case 30:case 31:case 32:case 33:return r?3:2;case 50:return 2;case 60:return 1;case 70:return 0}})(t.weight,this.yn.timeScale.timeVisible,this.yn.timeScale.secondsVisible),n=this.yn.timeScale;if(n.tickMarkFormatter!==void 0){let o=n.tickMarkFormatter(t.originalTime,i,e.locale);if(o!==null)return o}return(function(o,r,a){let l={};switch(r){case 0:l.year="numeric";break;case 1:l.month="short";break;case 2:l.day="numeric";break;case 3:l.hour12=!1,l.hour="2-digit",l.minute="2-digit";break;case 4:l.hour12=!1,l.hour="2-digit",l.minute="2-digit",l.second="2-digit"}let h=o.Pf===void 0?new Date(1e3*o.yf):new Date(Date.UTC(o.Pf.year,o.Pf.month-1,o.Pf.day));return new Date(h.getUTCFullYear(),h.getUTCMonth(),h.getUTCDate(),h.getUTCHours(),h.getUTCMinutes(),h.getUTCSeconds(),h.getUTCMilliseconds()).toLocaleString(a,l)})(t.time,i,e.locale)}maxTickMarkWeight(t){let e=t.reduce(ac,t[0]).weight;return e>30&&e<50&&(e=30),e}fillWeightsForPoints(t,e){(function(i,n=0){if(i.length===0)return;let o=n===0?null:i[n-1].time.yf,r=o!==null?new Date(1e3*o):null,a=0;for(let l=n;l<i.length;++l){let h=i[l],c=new Date(1e3*h.time.yf);r!==null&&(h.timeWeight=Xa(c,r)),a+=h.time.yf-(o||h.time.yf),o=h.time.yf,r=c}if(n===0&&i.length>1){let l=Math.ceil(a/(i.length-1)),h=new Date(1e3*(i[0].time.yf-l));i[0].timeWeight=Xa(new Date(1e3*i[0].time.yf),h)}})(t,e)}static Tf(t){return it({localization:{dateFormat:"dd MMM 'yy"}},t??{})}},_e=typeof window<"u";function tl(){return!!_e&&window.navigator.userAgent.toLowerCase().indexOf("firefox")>-1}function tn(){return!!_e&&/iPhone|iPad|iPod/.test(window.navigator.platform)}function cc(s,t){switch(s){case"custom":return t!==void 0?"custom-object":"series";case"price-line":return"custom-price-line";case"marker":return"series-marker";case"primitive":return"primitive";default:return"series"}}function io(s){return s+s%2}function uc(s){_e&&window.chrome!==void 0&&s.addEventListener("mousedown",(t=>{if(t.button===1)return t.preventDefault(),!1}))}var Le=class{constructor(t,e,i){this.Rf=0,this.Df=null,this.If={_t:Number.NEGATIVE_INFINITY,ut:Number.POSITIVE_INFINITY},this.Vf=0,this.Bf=null,this.Ef={_t:Number.NEGATIVE_INFINITY,ut:Number.POSITIVE_INFINITY},this.Af=null,this.Lf=!1,this.zf=null,this.Of=null,this.Nf=!1,this.Ff=!1,this.Wf=!1,this.Hf=null,this.Uf=null,this.$f=null,this.jf=null,this.qf=null,this.Yf=null,this.Kf=null,this.Gf=0,this.Zf=!1,this.Xf=!1,this.Jf=!1,this.Qf=0,this.tp=null,this.ip=!tn(),this.np=n=>{this.sp(n)},this.ep=n=>{if(this.rp(n)){let o=this.hp(n);if(++this.Vf,this.Bf&&this.Vf>1){let{ap:r}=this.lp(xt(n),this.Ef);r<30&&!this.Wf&&this.op(o,this.up._p),this.cp()}}else{let o=this.hp(n);if(++this.Rf,this.Df&&this.Rf>1){let{ap:r}=this.lp(xt(n),this.If);r<5&&!this.Ff&&this.dp(o,this.up.fp),this.pp()}}},this.vp=t,this.up=e,this.yn=i,this.mp()}m(){this.Hf!==null&&(this.Hf(),this.Hf=null),this.Uf!==null&&(this.Uf(),this.Uf=null),this.jf!==null&&(this.jf(),this.jf=null),this.qf!==null&&(this.qf(),this.qf=null),this.Yf!==null&&(this.Yf(),this.Yf=null),this.$f!==null&&(this.$f(),this.$f=null),this.wp(),this.pp()}Mp(t){this.jf&&this.jf();let e=this.gp.bind(this);if(this.jf=()=>{this.vp.removeEventListener("mousemove",e)},this.vp.addEventListener("mousemove",e),this.rp(t))return;let i=this.hp(t);this.dp(i,this.up.bp),this.ip=!0}pp(){this.Df!==null&&clearTimeout(this.Df),this.Rf=0,this.Df=null,this.If={_t:Number.NEGATIVE_INFINITY,ut:Number.POSITIVE_INFINITY}}cp(){this.Bf!==null&&clearTimeout(this.Bf),this.Vf=0,this.Bf=null,this.Ef={_t:Number.NEGATIVE_INFINITY,ut:Number.POSITIVE_INFINITY}}gp(t){if(this.Jf||this.Of!==null||this.rp(t))return;let e=this.hp(t);this.dp(e,this.up.Sp),this.ip=!0}xp(t){let e=en(t.changedTouches,S(this.tp));if(e===null||(this.Qf=Vi(t),this.Kf!==null)||this.Xf)return;this.Zf=!0;let i=this.lp(xt(e),S(this.Of)),{Cp:n,yp:o,ap:r}=i;if(this.Nf||!(r<5)){if(!this.Nf){let a=.5*n,l=o>=a&&!this.yn.Pp(),h=a>o&&!this.yn.kp();l||h||(this.Xf=!0),this.Nf=!0,this.Wf=!0,this.wp(),this.cp()}if(!this.Xf){let a=this.hp(t,e);this.op(a,this.up.Tp),pe(t)}}}Rp(t){if(t.button!==0)return;let e=this.lp(xt(t),S(this.zf)),{ap:i}=e;if(i>=5&&(this.Ff=!0,this.pp()),this.Ff){let n=this.hp(t);this.dp(n,this.up.Dp)}}lp(t,e){let i=Math.abs(e._t-t._t),n=Math.abs(e.ut-t.ut);return{Cp:i,yp:n,ap:i+n}}Ip(t){let e=en(t.changedTouches,S(this.tp));if(e===null&&t.touches.length===0&&(e=t.changedTouches[0]),e===null)return;this.tp=null,this.Qf=Vi(t),this.wp(),this.Of=null,this.Yf&&(this.Yf(),this.Yf=null);let i=this.hp(t,e);if(this.op(i,this.up.Vp),++this.Vf,this.Bf&&this.Vf>1){let{ap:n}=this.lp(xt(e),this.Ef);n<30&&!this.Wf&&this.op(i,this.up._p),this.cp()}else this.Wf||(this.op(i,this.up.Bp),this.up.Bp&&pe(t));this.Vf===0&&pe(t),t.touches.length===0&&this.Lf&&(this.Lf=!1,pe(t))}sp(t){if(t.button!==0)return;let e=this.hp(t);if(this.zf=null,this.Jf=!1,this.qf&&(this.qf(),this.qf=null),tl()&&this.vp.ownerDocument.documentElement.removeEventListener("mouseleave",this.np),!this.rp(t))if(this.dp(e,this.up.Ep),++this.Rf,this.Df&&this.Rf>1){let{ap:i}=this.lp(xt(t),this.If);i<5&&!this.Ff&&this.dp(e,this.up.fp),this.pp()}else this.Ff||this.dp(e,this.up.Ap)}wp(){this.Af!==null&&(clearTimeout(this.Af),this.Af=null)}Lp(t){if(this.tp!==null)return;let e=t.changedTouches[0];this.tp=e.identifier,this.Qf=Vi(t);let i=this.vp.ownerDocument.documentElement;this.Wf=!1,this.Nf=!1,this.Xf=!1,this.Of=xt(e),this.Yf&&(this.Yf(),this.Yf=null);{let o=this.xp.bind(this),r=this.Ip.bind(this);this.Yf=()=>{i.removeEventListener("touchmove",o),i.removeEventListener("touchend",r)},i.addEventListener("touchmove",o,{passive:!1}),i.addEventListener("touchend",r,{passive:!1}),this.wp(),this.Af=setTimeout(this.zp.bind(this,t),240)}let n=this.hp(t,e);this.op(n,this.up.Op),this.Bf||(this.Vf=0,this.Bf=setTimeout(this.cp.bind(this),500),this.Ef=xt(e))}Np(t){if(t.button!==0)return;let e=this.vp.ownerDocument.documentElement;tl()&&e.addEventListener("mouseleave",this.np),this.Ff=!1,this.zf=xt(t),this.qf&&(this.qf(),this.qf=null);{let n=this.Rp.bind(this),o=this.sp.bind(this);this.qf=()=>{e.removeEventListener("mousemove",n),e.removeEventListener("mouseup",o)},e.addEventListener("mousemove",n),e.addEventListener("mouseup",o)}if(this.Jf=!0,this.rp(t))return;let i=this.hp(t);this.dp(i,this.up.Fp),this.Df||(this.Rf=0,this.Df=setTimeout(this.pp.bind(this),500),this.If=xt(t))}mp(){this.vp.addEventListener("mouseenter",this.Mp.bind(this)),this.vp.addEventListener("touchcancel",this.wp.bind(this));{let t=this.vp.ownerDocument,e=i=>{this.up.Wp&&(i.composed&&this.vp.contains(i.composedPath()[0])||i.target&&this.vp.contains(i.target)||this.up.Wp())};this.Uf=()=>{t.removeEventListener("touchstart",e)},this.Hf=()=>{t.removeEventListener("mousedown",e)},t.addEventListener("mousedown",e),t.addEventListener("touchstart",e,{passive:!0})}tn()&&(this.$f=()=>{this.vp.removeEventListener("dblclick",this.ep)},this.vp.addEventListener("dblclick",this.ep)),this.vp.addEventListener("mouseleave",this.Hp.bind(this)),this.vp.addEventListener("touchstart",this.Lp.bind(this),{passive:!0}),uc(this.vp),this.vp.addEventListener("mousedown",this.Np.bind(this)),this.Up(),this.vp.addEventListener("touchmove",(()=>{}),{passive:!1})}Up(){this.up.$p===void 0&&this.up.jp===void 0&&this.up.qp===void 0||(this.vp.addEventListener("touchstart",(t=>this.Yp(t.touches)),{passive:!0}),this.vp.addEventListener("touchmove",(t=>{if(t.touches.length===2&&this.Kf!==null&&this.up.jp!==void 0){let e=el(t.touches[0],t.touches[1])/this.Gf;this.up.jp(this.Kf,e),pe(t)}}),{passive:!1}),this.vp.addEventListener("touchend",(t=>{this.Yp(t.touches)})))}Yp(t){t.length===1&&(this.Zf=!1),t.length!==2||this.Zf||this.Lf?this.Kp():this.Gp(t)}Gp(t){let e=this.vp.getBoundingClientRect()||{left:0,top:0};this.Kf={_t:(t[0].clientX-e.left+(t[1].clientX-e.left))/2,ut:(t[0].clientY-e.top+(t[1].clientY-e.top))/2},this.Gf=el(t[0],t[1]),this.up.$p!==void 0&&this.up.$p(),this.wp()}Kp(){this.Kf!==null&&(this.Kf=null,this.up.qp!==void 0&&this.up.qp())}Hp(t){if(this.jf&&this.jf(),this.rp(t)||!this.ip)return;let e=this.hp(t);this.dp(e,this.up.Zp),this.ip=!tn()}zp(t){let e=en(t.touches,S(this.tp));if(e===null)return;let i=this.hp(t,e);this.op(i,this.up.Xp),this.Wf=!0,this.Lf=!0}rp(t){return t.sourceCapabilities&&t.sourceCapabilities.firesTouchEvents!==void 0?t.sourceCapabilities.firesTouchEvents:Vi(t)<this.Qf+500}op(t,e){e&&e.call(this.up,t)}dp(t,e){e&&e.call(this.up,t)}hp(t,e){let i=e||t,n=this.vp.getBoundingClientRect()||{left:0,top:0};return{clientX:i.clientX,clientY:i.clientY,pageX:i.pageX,pageY:i.pageY,screenX:i.screenX,screenY:i.screenY,localX:i.clientX-n.left,localY:i.clientY-n.top,ctrlKey:t.ctrlKey,altKey:t.altKey,shiftKey:t.shiftKey,metaKey:t.metaKey,Jp:!t.type.startsWith("mouse")&&t.type!=="contextmenu"&&t.type!=="click",Qp:t.type,tv:i.target,xu:t.view,iv:()=>{t.type!=="touchstart"&&pe(t)}}}};function el(s,t){let e=s.clientX-t.clientX,i=s.clientY-t.clientY;return Math.sqrt(e*e+i*i)}function pe(s){s.cancelable&&s.preventDefault()}function xt(s){return{_t:s.pageX,ut:s.pageY}}function Vi(s){return s.timeStamp||performance.now()}function en(s,t){for(let e=0;e<s.length;++e)if(s[e].identifier===t)return s[e];return null}var so=class{constructor(t,e,i){this.nv=null,this.sv=null,this.ev=!0,this.rv=null,this.hv=t,this.av=t.lv()[e],this.ov=t.lv()[i],this._v=document.createElement("tr"),this._v.style.height="1px",this.uv=document.createElement("td"),this.uv.style.position="relative",this.uv.style.padding="0",this.uv.style.margin="0",this.uv.setAttribute("colspan","3"),this.cv(),this._v.appendChild(this.uv),this.ev=this.hv.N().layout.panes.enableResize,this.ev?this.dv():(this.nv=null,this.sv=null)}m(){this.sv!==null&&this.sv.m()}fv(){return this._v}pv(){return $({width:this.av.pv().width,height:1})}vv(){return $({width:this.av.vv().width,height:1*window.devicePixelRatio})}mv(t,e,i){let n=this.vv();t.fillStyle=this.hv.N().layout.panes.separatorColor,t.fillRect(e,i,n.width,n.height)}Pt(){this.cv(),this.hv.N().layout.panes.enableResize!==this.ev&&(this.ev=this.hv.N().layout.panes.enableResize,this.ev?this.dv():(this.nv!==null&&(this.uv.removeChild(this.nv.wv),this.uv.removeChild(this.nv.Mv),this.nv=null),this.sv!==null&&(this.sv.m(),this.sv=null)))}dv(){let t=document.createElement("div"),e=t.style;e.position="fixed",e.display="none",e.zIndex="49",e.top="0",e.left="0",e.width="100%",e.height="100%",e.cursor="row-resize",this.uv.appendChild(t);let i=document.createElement("div"),n=i.style;n.position="absolute",n.zIndex="50",n.top="-4px",n.height="9px",n.width="100%",n.backgroundColor="",n.cursor="row-resize",this.uv.appendChild(i);let o={bp:this.gv.bind(this),Zp:this.bv.bind(this),Fp:this.Sv.bind(this),Op:this.Sv.bind(this),Dp:this.xv.bind(this),Tp:this.xv.bind(this),Ep:this.Cv.bind(this),Vp:this.Cv.bind(this)};this.sv=new Le(i,o,{Pp:()=>!1,kp:()=>!0}),this.nv={Mv:i,wv:t}}cv(){this.uv.style.background=this.hv.N().layout.panes.separatorColor}gv(t){this.nv!==null&&(this.nv.Mv.style.backgroundColor=this.hv.N().layout.panes.separatorHoverColor)}bv(t){this.nv!==null&&this.rv===null&&(this.nv.Mv.style.backgroundColor="")}Sv(t){if(this.nv===null)return;let e=this.av.yv().F_()+this.ov.yv().F_(),i=e/(this.av.pv().height+this.ov.pv().height),n=30*i;e<=2*n||(this.rv={Pv:t.pageY,kv:this.av.yv().F_(),Tv:e-n,Rv:e,Dv:i,Iv:n},this.nv.wv.style.display="block")}xv(t){let e=this.rv;if(e===null)return;let i=(t.pageY-e.Pv)*e.Dv,n=Je(e.kv+i,e.Iv,e.Tv);this.av.yv().W_(n),this.ov.yv().W_(e.Rv-n),this.hv.Qt().ka()}Cv(t){this.rv!==null&&this.nv!==null&&(this.rv=null,this.nv.wv.style.display="none")}};function sn(s,t){return s.Vv-t.Vv}function nn(s,t,e){let i=(s.Vv-t.Vv)/(s.wt-t.wt);return Math.sign(i)*Math.min(Math.abs(i),e)}var no=class{constructor(t,e,i,n){this.Bv=null,this.Ev=null,this.Av=null,this.Lv=null,this.zv=null,this.Ov=0,this.Nv=0,this.Fv=t,this.Wv=e,this.Hv=i,this.Ps=n}Uv(t,e){if(this.Bv!==null){if(this.Bv.wt===e)return void(this.Bv.Vv=t);if(Math.abs(this.Bv.Vv-t)<this.Ps)return}this.Lv=this.Av,this.Av=this.Ev,this.Ev=this.Bv,this.Bv={wt:e,Vv:t}}me(t,e){if(this.Bv===null||this.Ev===null||e-this.Bv.wt>50)return;let i=0,n=nn(this.Bv,this.Ev,this.Wv),o=sn(this.Bv,this.Ev),r=[n],a=[o];if(i+=o,this.Av!==null){let h=nn(this.Ev,this.Av,this.Wv);if(Math.sign(h)===Math.sign(n)){let c=sn(this.Ev,this.Av);if(r.push(h),a.push(c),i+=c,this.Lv!==null){let u=nn(this.Av,this.Lv,this.Wv);if(Math.sign(u)===Math.sign(n)){let d=sn(this.Av,this.Lv);r.push(u),a.push(d),i+=d}}}}let l=0;for(let h=0;h<r.length;++h)l+=a[h]/i*r[h];Math.abs(l)<this.Fv||(this.zv={Vv:t,wt:e},this.Nv=l,this.Ov=(function(h,c){let u=Math.log(c);return Math.log(1*u/-h)/u})(Math.abs(l),this.Hv))}Gc(t){let e=S(this.zv),i=t-e.wt;return e.Vv+this.Nv*(Math.pow(this.Hv,i)-1)/Math.log(this.Hv)}Kc(t){return this.zv===null||this.$v(t)===this.Ov}$v(t){let e=t-S(this.zv).wt;return Math.min(e,this.Ov)}},oo=class{constructor(t,e){this.jv=void 0,this.qv=void 0,this.Yv=void 0,this.vn=!1,this.Kv=t,this.Gv=e,this.Zv()}Pt(){this.Zv()}Xv(){this.jv&&this.Kv.removeChild(this.jv),this.qv&&this.Kv.removeChild(this.qv),this.jv=void 0,this.qv=void 0}Jv(){return this.vn!==this.Qv()||this.Yv!==this.tm()}tm(){return this.Gv.Qt().Xi().J(this.Gv.N().layout.textColor)>160?"dark":"light"}Qv(){return this.Gv.N().layout.attributionLogo}im(){let t=new URL(location.href);return t.hostname?"&utm_source="+t.hostname+t.pathname:""}Zv(){this.Jv()&&(this.Xv(),this.vn=this.Qv(),this.vn&&(this.Yv=this.tm(),this.qv=document.createElement("style"),this.qv.innerText="a#tv-attr-logo{--fill:#131722;--stroke:#fff;position:absolute;left:10px;bottom:10px;height:19px;width:35px;margin:0;padding:0;border:0;z-index:3;}a#tv-attr-logo[data-dark]{--fill:#D1D4DC;--stroke:#131722;}",this.jv=document.createElement("a"),this.jv.href=`https://www.tradingview.com/?utm_medium=lwc-link&utm_campaign=lwc-chart${this.im()}`,this.jv.title="Charting by TradingView",this.jv.id="tv-attr-logo",this.jv.target="_blank",this.jv.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="35" height="19" fill="none"><g fill-rule="evenodd" clip-path="url(#a)" clip-rule="evenodd"><path fill="var(--stroke)" d="M2 0H0v10h6v9h21.4l.5-1.3 6-15 1-2.7H23.7l-.5 1.3-.2.6a5 5 0 0 0-7-.9V0H2Zm20 17h4l5.2-13 .8-2h-7l-1 2.5-.2.5-1.5 3.8-.3.7V17Zm-.8-10a3 3 0 0 0 .7-2.7A3 3 0 1 0 16.8 7h4.4ZM14 7V2H2v6h6v9h4V7h2Z"/><path fill="var(--fill)" d="M14 2H2v6h6v9h6V2Zm12 15h-7l6-15h7l-6 15Zm-7-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></g><defs><clipPath id="a"><path fill="var(--stroke)" d="M0 0h35v19H0z"/></clipPath></defs></svg>',this.jv.toggleAttribute("data-dark",this.Yv==="dark"),this.Kv.appendChild(this.qv),this.Kv.appendChild(this.jv)))}};function ne(s,t){let e=S(s.ownerDocument).createElement("canvas");s.appendChild(e);let i=Ks(e,{type:"device-pixel-content-box",options:{allowResizeObserver:!0},transform:(n,o)=>({width:Math.max(n.width,o.width),height:Math.max(n.height,o.height)})});return i.resizeCanvasElement(t),i}function oe(s){s.width=1,s.height=1,s.getContext("2d")?.clearRect(0,0,1,1)}function Di(s,t,e,i){s.qh&&s.qh(t,e,i)}function Ge(s,t,e,i){s.st(t,e,i)}function ro(s,t,e,i){kl(s(e,i),t,i)}function kl(s,t,e){for(let i of s){let n=i.Tt(e);n!==null&&t(n)}}function on(s,t){return e=>(function(i){return i.Ft!==void 0})(e)?(e.Ft()?.pl()??"")!==t?[]:e.Qa?.(s)??[]:[]}function il(s,t,e,i){if(!s.length)return;let n=0,o=s[0].$t(i,!0),r=t===1?e/2-(s[0].Hi()-o/2):s[0].Hi()-o/2-e/2;r=Math.max(0,r);for(let a=1;a<s.length;a++){let l=s[a],h=s[a-1],c=h.$t(i,!1),u=l.Hi(),d=h.Hi();if(t===1?u>d-c:u<d+c){let m=d-c*t;l.Ui(m);let f=m-t*c/2;if((t===1?f<0:f>e)&&r>0){let g=t===1?-1-f:f-e,w=Math.min(g,r);for(let v=n;v<s.length;v++)s[v].Ui(s[v].Hi()+t*w);r-=w}}else n=a,r=t===1?d-c-u:u-(d+c)}}var rs=class{constructor(t,e,i,n){this.Ki=null,this.nm=null,this.sm=!1,this.rm=new Se(200),this.hm=null,this.am=0,this.lm=!1,this.om=()=>{this.lm||this.yt._m().Qt().mr()},this.um=()=>{this.lm||this.yt._m().Qt().mr()},this.yt=t,this.yn=e,this.Ro=e.layout,this.bd=i,this.dm=n==="left",this.fm=on("normal",n),this.pm=on("top",n),this.vm=on("bottom",n),this.uv=document.createElement("div"),this.uv.style.height="100%",this.uv.style.overflow="hidden",this.uv.style.width="25px",this.uv.style.left="0",this.uv.style.position="relative",this.wm=ne(this.uv,$({width:16,height:16})),this.wm.subscribeSuggestedBitmapSizeChanged(this.om);let o=this.wm.canvasElement;o.style.position="absolute",o.style.zIndex="1",o.style.left="0",o.style.top="0",this.Mm=ne(this.uv,$({width:16,height:16})),this.Mm.subscribeSuggestedBitmapSizeChanged(this.um);let r=this.Mm.canvasElement;r.style.position="absolute",r.style.zIndex="2",r.style.left="0",r.style.top="0";let a={Fp:this.Sv.bind(this),Op:this.Sv.bind(this),Dp:this.xv.bind(this),Tp:this.xv.bind(this),Wp:this.gm.bind(this),Ep:this.Cv.bind(this),Vp:this.Cv.bind(this),fp:this.bm.bind(this),_p:this.bm.bind(this),bp:this.Sm.bind(this),Zp:this.bv.bind(this)};this.sv=new Le(this.Mm.canvasElement,a,{Pp:()=>!this.yn.handleScroll.vertTouchDrag,kp:()=>!0})}m(){this.sv.m(),this.Mm.unsubscribeSuggestedBitmapSizeChanged(this.um),oe(this.Mm.canvasElement),this.Mm.dispose(),this.wm.unsubscribeSuggestedBitmapSizeChanged(this.om),oe(this.wm.canvasElement),this.wm.dispose(),this.Ki!==null&&this.Ki.__().u(this),this.Ki=null}fv(){return this.uv}P(){return this.Ro.fontSize}xm(){let t=this.bd.N();return this.hm!==t.k&&(this.rm.Os(),this.hm=t.k),t}Cm(){if(this.Ki===null)return 0;let t=0,e=this.xm(),i=S(this.wm.canvasElement.getContext("2d",{colorSpace:this.yt._m().N().layout.colorSpace}));i.save();let n=this.Ki.zl();i.font=this.ym(),n.length>0&&(t=Math.max(this.rm.Ii(i,n[0].eo),this.rm.Ii(i,n[n.length-1].eo)));let o=this.Pm();for(let h=o.length;h--;){let c=this.rm.Ii(i,o[h].ri());c>t&&(t=c)}let r=this.Ki.Lt();if(r!==null&&this.nm!==null&&(a=this.yn.crosshair).mode!==2&&a.horzLine.visible&&a.horzLine.labelVisible){let h=this.Ki.Tn(1,r),c=this.Ki.Tn(this.nm.height-2,r);t=Math.max(t,this.rm.Ii(i,this.Ki.Ji(Math.floor(Math.min(h,c))+.11111111111111,r)),this.rm.Ii(i,this.Ki.Ji(Math.ceil(Math.max(h,c))-.11111111111111,r)))}var a;i.restore();let l=t||34;return io(Math.ceil(e.S+e.C+e.V+e.B+5+l))}km(t){this.nm!==null&&yt(this.nm,t)||(this.nm=t,this.lm=!0,this.wm.resizeCanvasElement(t),this.Mm.resizeCanvasElement(t),this.lm=!1,this.uv.style.width=`${t.width}px`,this.uv.style.height=`${t.height}px`)}Tm(){return S(this.nm).width}un(t){this.Ki!==t&&(this.Ki!==null&&this.Ki.__().u(this),this.Ki=t,t.__().i(this.wo.bind(this),this))}Ft(){return this.Ki}Os(){let t=this.yt.yv();this.yt._m().Qt().au(t,S(this.Ft()))}Rm(t){if(this.nm===null)return;let e={colorSpace:this.yt._m().N().layout.colorSpace};if(t!==1){this.Dm(),this.wm.applySuggestedBitmapSize();let n=kt(this.wm,e);n!==null&&(n.useBitmapCoordinateSpace((o=>{this.Im(o),this.Vm(o)})),this.yt.Bm(n,this.vm),this.Em(n),this.yt.Bm(n,this.fm),this.Am(n))}this.Mm.applySuggestedBitmapSize();let i=kt(this.Mm,e);i!==null&&(i.useBitmapCoordinateSpace((({context:n,bitmapSize:o})=>{n.clearRect(0,0,o.width,o.height)})),this.Lm(i),this.yt.Bm(i,this.pm))}vv(){return this.wm.bitmapSize}mv(t,e,i,n){let o=this.vv();if(o.width>0&&o.height>0&&(t.drawImage(this.wm.canvasElement,e,i),n)){let r=this.Mm.canvasElement;t.drawImage(r,e,i)}}Pt(){this.Ki?.zl()}Sv(t){if(this.Ki===null||this.Ki.Zi()||!this.yn.handleScale.axisPressedMouseMove.price)return;let e=this.yt._m().Qt(),i=this.yt.yv();this.sm=!0,e.Q_(i,this.Ki,t.localY)}xv(t){if(this.Ki===null||!this.yn.handleScale.axisPressedMouseMove.price)return;let e=this.yt._m().Qt(),i=this.yt.yv(),n=this.Ki;e.tu(i,n,t.localY)}gm(){if(this.Ki===null||!this.yn.handleScale.axisPressedMouseMove.price)return;let t=this.yt._m().Qt(),e=this.yt.yv(),i=this.Ki;this.sm&&(this.sm=!1,t.iu(e,i))}Cv(t){if(this.Ki===null||!this.yn.handleScale.axisPressedMouseMove.price)return;let e=this.yt._m().Qt(),i=this.yt.yv();this.sm=!1,e.iu(i,this.Ki)}bm(t){this.yn.handleScale.axisDoubleClickReset.price&&this.Os()}Sm(t){this.Ki!==null&&(!this.yt._m().Qt().N().handleScale.axisPressedMouseMove.price||this.Ki.je()||this.Ki.No()||this.zm(1))}bv(t){this.zm(0)}Pm(){let t=[],e=this.Ki===null?void 0:this.Ki;return(i=>{for(let n=0;n<i.length;++n){let o=i[n].qn(this.yt.yv(),e);for(let r=0;r<o.length;r++)t.push(o[r])}})(this.yt.yv().Dt()),t}Im({context:t,bitmapSize:e}){let{width:i,height:n}=e,o=this.yt.yv().Qt(),r=o.$(),a=o.af();r===a?us(t,0,0,i,n,r):yl(t,0,0,i,n,r,a)}Vm({context:t,bitmapSize:e,horizontalPixelRatio:i}){if(this.nm===null||this.Ki===null||!this.Ki.N().borderVisible)return;t.fillStyle=this.Ki.N().borderColor;let n=Math.max(1,Math.floor(this.xm().S*i)),o;o=this.dm?e.width-n:0,t.fillRect(o,0,n,e.height)}Em(t){if(this.nm===null||this.Ki===null)return;let e=this.Ki.zl(),i=this.Ki.N(),n=this.xm(),o=this.dm?this.nm.width-n.C:0;i.borderVisible&&i.ticksVisible&&t.useBitmapCoordinateSpace((({context:r,horizontalPixelRatio:a,verticalPixelRatio:l})=>{r.fillStyle=i.borderColor;let h=Math.max(1,Math.floor(l)),c=Math.floor(.5*l),u=Math.round(n.C*a);r.beginPath();for(let d of e)r.rect(Math.floor(o*a),Math.round(d.Vl*l)-c,u,h);r.fill()})),t.useMediaCoordinateSpace((({context:r})=>{r.font=this.ym(),r.fillStyle=i.textColor??this.Ro.textColor,r.textAlign=this.dm?"right":"left",r.textBaseline="middle";let a=this.dm?Math.round(o-n.V):Math.round(o+n.C+n.V),l=e.map((h=>this.rm.Di(r,h.eo)));for(let h=e.length;h--;){let c=e[h];r.fillText(c.eo,a,c.Vl+l[h])}}))}Dm(){if(this.nm===null||this.Ki===null)return;let t=this.nm.height/2,e=[],i=this.Ki.Dt().slice(),n=this.yt.yv(),o=this.xm();this.Ki===n.Zs()&&this.yt.yv().Dt().forEach((l=>{n.Gs(l)&&i.push(l)}));let r=this.Ki.kl()[0],a=this.Ki;i.forEach((l=>{let h=l.qn(n,a);h.forEach((c=>{c.$i()&&c.Wi()===null&&(c.Ui(null),e.push(c))})),r===l&&h.length>0&&(t=h[0].Ei())})),this.Ki.N().alignLabels&&this.Om(e,o,t)}Om(t,e,i){if(this.nm===null)return;let n=t.filter((r=>r.Ei()<=i)),o=t.filter((r=>r.Ei()>i));n.sort(((r,a)=>a.Ei()-r.Ei())),n.length&&o.length&&o.push(n[0]),o.sort(((r,a)=>r.Ei()-a.Ei()));for(let r of t){let a=Math.floor(r.$t(e)/2),l=r.Ei();l>-a&&l<a&&r.Ui(a),l>this.nm.height-a&&l<this.nm.height+a&&r.Ui(this.nm.height-a)}il(n,1,this.nm.height,e),il(o,-1,this.nm.height,e)}Am(t){if(this.nm===null)return;let e=this.Pm(),i=this.xm(),n=this.dm?"right":"left";e.forEach((o=>{o.ji()&&o.Tt(S(this.Ki)).st(t,i,this.rm,n)}))}Lm(t){if(this.nm===null||this.Ki===null)return;let e=this.yt._m().Qt(),i=[],n=this.yt.yv(),o=e.Vd().qn(n,this.Ki);o.length&&i.push(o);let r=this.xm(),a=this.dm?"right":"left";i.forEach((l=>{l.forEach((h=>{h.Tt(S(this.Ki)).st(t,r,this.rm,a)}))}))}zm(t){this.uv.style.cursor=t===1?"ns-resize":"default"}wo(){let t=this.Cm();this.am<t&&this.yt._m().Qt().ka(),this.am=t}ym(){return Hi(this.Ro.fontSize,this.Ro.fontFamily)}};function dc(s,t){return s.Xa?.(t)??[]}function rn(s,t){return s.jn?.(t)??[]}function sl(s,t){return s.cn?.(t)??[]}function mc(s,t){return s.qa?.(t)??[]}var ao=class s{constructor(t,e){this.nm=$({width:0,height:0}),this.Nm=null,this.Fm=null,this.Wm=null,this.Hm=null,this.Um=!1,this.$m=new B,this.jm=new B,this.qm=0,this.Ym=!1,this.Km=null,this.Gm=!1,this.Zm=null,this.Xm=null,this.lm=!1,this.om=()=>{this.lm||this.Jm===null||this.sn().mr()},this.um=()=>{this.lm||this.Jm===null||this.sn().mr()},this.Gv=t,this.Jm=e,this.Jm.mu().i(this.Qm.bind(this),this,!0),this.tw=document.createElement("td"),this.tw.style.padding="0",this.tw.style.position="relative";let i=document.createElement("div");i.style.width="100%",i.style.height="100%",i.style.position="relative",i.style.overflow="hidden",this.iw=document.createElement("td"),this.iw.style.padding="0",this.nw=document.createElement("td"),this.nw.style.padding="0",this.tw.appendChild(i),this.wm=ne(i,$({width:16,height:16})),this.wm.subscribeSuggestedBitmapSizeChanged(this.om);let n=this.wm.canvasElement;n.style.position="absolute",n.style.zIndex="1",n.style.left="0",n.style.top="0",this.Mm=ne(i,$({width:16,height:16})),this.Mm.subscribeSuggestedBitmapSizeChanged(this.um);let o=this.Mm.canvasElement;o.style.position="absolute",o.style.zIndex="2",o.style.left="0",o.style.top="0",this._v=document.createElement("tr"),this._v.appendChild(this.iw),this._v.appendChild(this.tw),this._v.appendChild(this.nw),this.sw(),this.sv=new Le(this.Mm.canvasElement,this,{Pp:()=>this.Km===null&&!this.Gv.N().handleScroll.vertTouchDrag,kp:()=>this.Km===null&&!this.Gv.N().handleScroll.horzTouchDrag})}m(){this.Nm!==null&&this.Nm.m(),this.Fm!==null&&this.Fm.m(),this.Wm=null,this.Mm.unsubscribeSuggestedBitmapSizeChanged(this.um),oe(this.Mm.canvasElement),this.Mm.dispose(),this.wm.unsubscribeSuggestedBitmapSizeChanged(this.om),oe(this.wm.canvasElement),this.wm.dispose(),this.Jm!==null&&(this.Jm.mu().u(this),this.Jm.m()),this.sv.m()}yv(){return S(this.Jm)}ew(t){this.Jm!==null&&this.Jm.mu().u(this),this.Jm=t,this.Jm!==null&&this.Jm.mu().i(s.prototype.Qm.bind(this),this,!0),this.sw(),this.Gv.lv().indexOf(this)===this.Gv.lv().length-1?(this.Wm=this.Wm??new oo(this.tw,this.Gv),this.Wm.Pt()):(this.Wm?.Xv(),this.Wm=null)}_m(){return this.Gv}fv(){return this._v}sw(){if(this.Jm!==null&&(this.rw(),this.sn().Jn().length!==0)){if(this.Nm!==null){let t=this.Jm.X_();this.Nm.un(S(t))}if(this.Fm!==null){let t=this.Jm.J_();this.Fm.un(S(t))}}}hw(){this.Nm!==null&&this.Nm.Pt(),this.Fm!==null&&this.Fm.Pt()}F_(){return this.Jm!==null?this.Jm.F_():0}W_(t){this.Jm&&this.Jm.W_(t)}bp(t){if(!this.Jm)return;this.aw();let e=t.localX,i=t.localY;this.lw(e,i,t)}Fp(t){this.aw(),this.ow(),this.lw(t.localX,t.localY,t)}Sp(t){if(!this.Jm)return;this.aw();let e=t.localX,i=t.localY;this.lw(e,i,t)}Ap(t){this.Jm!==null&&(this.aw(),this.lw(t.localX,t.localY,t),this._w(t))}fp(t){this.Jm!==null&&this.uw(this.jm,t)}_p(t){this.fp(t)}Dp(t){this.aw(),this.cw(t),this.lw(t.localX,t.localY,t)}Ep(t){this.Jm!==null&&(this.aw(),this.Ym=!1,this.dw(t))}Bp(t){this.Jm!==null&&this._w(t)}Xp(t){if(this.Ym=!0,this.Km===null){let e={x:t.localX,y:t.localY};this.fw(e,e,t)}}Zp(t){this.Jm!==null&&(this.aw(),this.Jm.Qt().Rd(null),this.pw())}mw(){return this.$m}ww(){return this.jm}$p(){this.qm=1,this.sn().cs()}jp(t,e){if(!this.Gv.N().handleScale.pinch)return;let i=5*(e-this.qm);this.qm=e,this.sn().Wd(t._t,i)}Op(t){this.Ym=!1,this.Gm=this.Km!==null,this.ow();let e=this.sn().Vd();this.Km!==null&&e.It()&&(this.Zm={x:e.ni(),y:e.si()},this.Km={x:t.localX,y:t.localY})}Tp(t){if(this.Jm===null)return;let e=t.localX,i=t.localY;if(this.Km===null)this.cw(t);else{this.Gm=!1;let n=S(this.Zm),o=n.x+(e-this.Km.x),r=n.y+(i-this.Km.y);this.lw(o,r,t)}}Vp(t){this._m().N().trackingMode.exitMode===0&&(this.Gm=!0),this.Mw(),this.dw(t)}Qs(t,e){let i=this.Jm;return i===null?null:_l(i,t,e)}gw(t,e){S(e==="left"?this.Nm:this.Fm).km($({width:t,height:this.nm.height}))}pv(){return this.nm}km(t){yt(this.nm,t)||(this.nm=t,this.lm=!0,this.wm.resizeCanvasElement(t),this.Mm.resizeCanvasElement(t),this.lm=!1,this.tw.style.width=t.width+"px",this.tw.style.height=t.height+"px")}bw(){let t=S(this.Jm);t.G_(t.X_()),t.G_(t.J_());for(let e of t.kl())if(t.Gs(e)){let i=e.Ft();i!==null&&t.G_(i),e.Nn()}for(let e of t.Mu())e.Nn()}vv(){return this.wm.bitmapSize}mv(t,e,i,n){let o=this.vv();if(o.width>0&&o.height>0&&(t.drawImage(this.wm.canvasElement,e,i),n)){let r=this.Mm.canvasElement;t!==null&&t.drawImage(r,e,i)}}Rm(t){if(t===0||this.Jm===null)return;t>1&&this.bw(),this.Nm!==null&&this.Nm.Rm(t),this.Fm!==null&&this.Fm.Rm(t);let e={colorSpace:this.Gv.N().layout.colorSpace};if(t!==1){this.wm.applySuggestedBitmapSize();let n=kt(this.wm,e);n!==null&&(n.useBitmapCoordinateSpace((o=>{this.Im(o)})),this.Jm&&(this.Sw(n,dc),this.xw(n),this.Sw(n,rn),this.Sw(n,sl)))}this.Mm.applySuggestedBitmapSize();let i=kt(this.Mm,e);i!==null&&(i.useBitmapCoordinateSpace((({context:n,bitmapSize:o})=>{n.clearRect(0,0,o.width,o.height)})),this.Cw(i),this.Sw(i,mc),this.Sw(i,sl))}yw(){return this.Nm}Pw(){return this.Fm}Bm(t,e){this.Sw(t,e)}Qm(){this.Jm!==null&&this.Jm.mu().u(this),this.Jm=null}_w(t){this.uw(this.$m,t)}uw(t,e){let i=e.localX,n=e.localY;t.v()&&t.p(this.sn().Et().Vc(i),{x:i,y:n},e)}Im({context:t,bitmapSize:e}){let{width:i,height:n}=e,o=this.sn(),r=o.$(),a=o.af();r===a?us(t,0,0,i,n,a):yl(t,0,0,i,n,r,a)}xw(t){let e=S(this.Jm),i=e.wu().wr().Tt(e);i!==null&&i.st(t,!1)}Cw(t){this.kw(t,rn,Ge,this.sn().Vd())}Sw(t,e){let i=S(this.Jm),n=e===rn?this.Tw():null,o=n===null?null:this.Rw(n,i),r=i.Mu();if(o===null||n===null){let h=i._u();return this.Dw(t,e,Di,r,h),void this.Dw(t,e,Ge,r,h)}let a=i.Dt(),l=h=>h===n?o.Za:void 0;this.Dw(t,e,Di,r,a,l),this.Dw(t,e,Ge,r,a,l),this.kw(t,e,Di,n,o.qa),this.kw(t,e,Ge,n,o.qa)}Dw(t,e,i,n,o,r){for(let a of n)this.kw(t,e,i,a);if(r!==void 0)for(let a of o)this.kw(t,e,i,a,r(a));else for(let a of o)this.kw(t,e,i,a)}Tw(){let t=S(this.Jm),e=t.Qt().cu()?.uu;if(!t.Qt().N().hoveredSeriesOnTop||e===void 0)return null;for(let i of t.Dt())if(i===e)return i;return null}Rw(t,e){let i=t.Ga?.(e)??null;return i===null||i.qa.length===0?null:i}kw(t,e,i,n,o){let r=S(this.Jm),a=r.Qt().cu(),l=a!==null&&a.uu===n,h=a!==null&&l&&a.bu!==void 0?a.bu.ie:void 0,c=u=>i(u,t,l,h);o===void 0?ro(e,c,n,r):kl(o,c,r)}rw(){if(this.Jm===null)return;let t=this.Gv,e=this.Jm.X_().N().visible,i=this.Jm.J_().N().visible;e||this.Nm===null||(this.iw.removeChild(this.Nm.fv()),this.Nm.m(),this.Nm=null),i||this.Fm===null||(this.nw.removeChild(this.Fm.fv()),this.Fm.m(),this.Fm=null);let n=t.Qt().Jd();e&&this.Nm===null&&(this.Nm=new rs(this,t.N(),n,"left"),this.iw.appendChild(this.Nm.fv())),i&&this.Fm===null&&(this.Fm=new rs(this,t.N(),n,"right"),this.nw.appendChild(this.Fm.fv()))}Iw(t){return t.Jp&&this.Ym||this.Km!==null}lw(t,e,i){t=Math.max(0,Math.min(t,this.nm.width-1)),e=Math.max(0,Math.min(e,this.nm.height-1)),this.sn().Kd(t,e,i,S(this.Jm))}pw(){this.sn().Zd()}Mw(){this.Gm&&(this.Km=null,this.pw())}fw(t,e,i){this.Km=t,this.Gm=!1,this.lw(e.x,e.y,i);let n=this.sn().Vd();this.Zm={x:n.ni(),y:n.si()}}sn(){return this.Gv.Qt()}dw(t){if(!this.Um)return;let e=this.sn(),i=this.yv();if(e.eu(i,i.kn()),this.Hm=null,this.Um=!1,e.jd(),this.Xm!==null){let n=performance.now(),o=e.Et();this.Xm.me(o.Oc(),n),this.Xm.Kc(n)||e.ps(this.Xm)}}aw(){this.Km=null}ow(){if(this.Jm){if(this.sn().cs(),document.activeElement!==document.body&&document.activeElement!==document.documentElement)S(document.activeElement).blur();else{let t=document.getSelection();t!==null&&t.removeAllRanges()}!this.Jm.kn().Zi()&&this.sn().Et().Zi()}}cw(t){if(this.Jm===null)return;let e=this.sn(),i=e.Et();if(i.Zi())return;let n=this.Gv.N(),o=n.handleScroll,r=n.kineticScroll;if((!o.pressedMouseMove||t.Jp)&&(!o.horzTouchDrag&&!o.vertTouchDrag||!t.Jp))return;let a=this.Jm.kn(),l=performance.now();if(this.Hm!==null||this.Iw(t)||(this.Hm={x:t.clientX,y:t.clientY,yf:l,Vw:t.localX,Bw:t.localY}),this.Hm!==null&&!this.Um&&(this.Hm.x!==t.clientX||this.Hm.y!==t.clientY)){if(t.Jp&&r.touch||!t.Jp&&r.mouse){let h=i.ml();this.Xm=new no(.2/h,7/h,.997,15/h),this.Xm.Uv(i.Oc(),this.Hm.yf)}else this.Xm=null;a.Zi()||e.nu(this.Jm,a,t.localY),e.Ud(t.localX),this.Um=!0}this.Um&&(a.Zi()||e.su(this.Jm,a,t.localY),e.$d(t.localX),this.Xm!==null&&this.Xm.Uv(i.Oc(),l))}},as=class{constructor(t,e,i,n,o){this.xt=!0,this.nm=$({width:0,height:0}),this.om=()=>this.Rm(3),this.dm=t==="left",this.bd=i.Jd,this.yn=e,this.Ew=n,this.Aw=o,this.uv=document.createElement("div"),this.uv.style.width="25px",this.uv.style.height="100%",this.uv.style.overflow="hidden",this.wm=ne(this.uv,$({width:16,height:16})),this.wm.subscribeSuggestedBitmapSizeChanged(this.om)}m(){this.wm.unsubscribeSuggestedBitmapSizeChanged(this.om),oe(this.wm.canvasElement),this.wm.dispose()}fv(){return this.uv}pv(){return this.nm}km(t){yt(this.nm,t)||(this.nm=t,this.wm.resizeCanvasElement(t),this.uv.style.width=`${t.width}px`,this.uv.style.height=`${t.height}px`,this.xt=!0)}Rm(t){if(t<3&&!this.xt||this.nm.width===0||this.nm.height===0)return;this.xt=!1,this.wm.applySuggestedBitmapSize();let e=kt(this.wm,{colorSpace:this.yn.layout.colorSpace});e!==null&&e.useBitmapCoordinateSpace((i=>{this.Im(i),this.Vm(i)}))}vv(){return this.wm.bitmapSize}mv(t,e,i){let n=this.vv();n.width>0&&n.height>0&&t.drawImage(this.wm.canvasElement,e,i)}Vm({context:t,bitmapSize:e,horizontalPixelRatio:i,verticalPixelRatio:n}){if(!this.Ew())return;t.fillStyle=this.yn.timeScale.borderColor;let o=Math.floor(this.bd.N().S*i),r=Math.floor(this.bd.N().S*n),a=this.dm?e.width-o:0;t.fillRect(a,0,o,r)}Im({context:t,bitmapSize:e}){us(t,0,0,e.width,e.height,this.Aw())}};function Eo(s){return t=>t.tl?.(s)??[]}var fc=Eo("normal"),pc=Eo("top"),gc=Eo("bottom"),lo=class{constructor(t,e){this.Lw=null,this.zw=null,this.M=null,this.Ow=!1,this.nm=$({width:0,height:0}),this.Nw=new B,this.rm=new Se(5),this.lm=!1,this.om=()=>{this.lm||this.Gv.Qt().mr()},this.um=()=>{this.lm||this.Gv.Qt().mr()},this.Gv=t,this.Pu=e,this.yn=t.N().layout,this.jv=document.createElement("tr"),this.Fw=document.createElement("td"),this.Fw.style.padding="0",this.Ww=document.createElement("td"),this.Ww.style.padding="0",this.uv=document.createElement("td"),this.uv.style.height="25px",this.uv.style.padding="0",this.Hw=document.createElement("div"),this.Hw.style.width="100%",this.Hw.style.height="100%",this.Hw.style.position="relative",this.Hw.style.overflow="hidden",this.uv.appendChild(this.Hw),this.wm=ne(this.Hw,$({width:16,height:16})),this.wm.subscribeSuggestedBitmapSizeChanged(this.om);let i=this.wm.canvasElement;i.style.position="absolute",i.style.zIndex="1",i.style.left="0",i.style.top="0",this.Mm=ne(this.Hw,$({width:16,height:16})),this.Mm.subscribeSuggestedBitmapSizeChanged(this.um);let n=this.Mm.canvasElement;n.style.position="absolute",n.style.zIndex="2",n.style.left="0",n.style.top="0",this.jv.appendChild(this.Fw),this.jv.appendChild(this.uv),this.jv.appendChild(this.Ww),this.Uw(),this.Gv.Qt().N_().i(this.Uw.bind(this),this),this.sv=new Le(this.Mm.canvasElement,this,{Pp:()=>!0,kp:()=>!this.Gv.N().handleScroll.horzTouchDrag})}m(){this.sv.m(),this.Lw!==null&&this.Lw.m(),this.zw!==null&&this.zw.m(),this.Mm.unsubscribeSuggestedBitmapSizeChanged(this.um),oe(this.Mm.canvasElement),this.Mm.dispose(),this.wm.unsubscribeSuggestedBitmapSizeChanged(this.om),oe(this.wm.canvasElement),this.wm.dispose()}fv(){return this.jv}$w(){return this.Lw}jw(){return this.zw}Fp(t){if(this.Ow)return;this.Ow=!0;let e=this.Gv.Qt();!e.Et().Zi()&&this.Gv.N().handleScale.axisPressedMouseMove.time&&e.Fd(t.localX)}Op(t){this.Fp(t)}Wp(){let t=this.Gv.Qt();!t.Et().Zi()&&this.Ow&&(this.Ow=!1,this.Gv.N().handleScale.axisPressedMouseMove.time&&t.Yd())}Dp(t){let e=this.Gv.Qt();!e.Et().Zi()&&this.Gv.N().handleScale.axisPressedMouseMove.time&&e.qd(t.localX)}Tp(t){this.Dp(t)}Ep(){this.Ow=!1;let t=this.Gv.Qt();t.Et().Zi()&&!this.Gv.N().handleScale.axisPressedMouseMove.time||t.Yd()}Vp(){this.Ep()}fp(){this.Gv.N().handleScale.axisDoubleClickReset.time&&this.Gv.Qt().ws()}_p(){this.fp()}bp(){this.Gv.Qt().N().handleScale.axisPressedMouseMove.time&&this.zm(1)}Zp(){this.zm(0)}pv(){return this.nm}qw(){return this.Nw}Yw(t,e,i){yt(this.nm,t)||(this.nm=t,this.lm=!0,this.wm.resizeCanvasElement(t),this.Mm.resizeCanvasElement(t),this.lm=!1,this.uv.style.width=`${t.width}px`,this.uv.style.height=`${t.height}px`,this.Nw.p(t)),this.Lw!==null&&this.Lw.km($({width:e,height:t.height})),this.zw!==null&&this.zw.km($({width:i,height:t.height}))}Kw(){let t=this.Gw();return Math.ceil(t.S+t.C+t.P+t.A+t.I+t.Zw)}Pt(){this.Gv.Qt().Et().zl()}vv(){return this.wm.bitmapSize}mv(t,e,i,n){let o=this.vv();if(o.width>0&&o.height>0&&(t.drawImage(this.wm.canvasElement,e,i),n)){let r=this.Mm.canvasElement;t.drawImage(r,e,i)}}Rm(t){if(t===0)return;let e={colorSpace:this.yn.colorSpace};if(t!==1){this.wm.applySuggestedBitmapSize();let n=kt(this.wm,e);n!==null&&(n.useBitmapCoordinateSpace((o=>{this.Im(o),this.Vm(o),this.Xw(n,gc)})),this.Em(n),this.Xw(n,fc)),this.Lw!==null&&this.Lw.Rm(t),this.zw!==null&&this.zw.Rm(t)}this.Mm.applySuggestedBitmapSize();let i=kt(this.Mm,e);i!==null&&(i.useBitmapCoordinateSpace((({context:n,bitmapSize:o})=>{n.clearRect(0,0,o.width,o.height)})),this.Jw([...this.Gv.Qt().Jn(),this.Gv.Qt().Vd()],i),this.Xw(i,pc))}Xw(t,e){let i=this.Gv.Qt().Jn();for(let n of i)ro(e,(o=>Di(o,t,!1,void 0)),n,void 0);for(let n of i)ro(e,(o=>Ge(o,t,!1,void 0)),n,void 0)}Im({context:t,bitmapSize:e}){us(t,0,0,e.width,e.height,this.Gv.Qt().af())}Vm({context:t,bitmapSize:e,verticalPixelRatio:i}){if(this.Gv.N().timeScale.borderVisible){t.fillStyle=this.Qw();let n=Math.max(1,Math.floor(this.Gw().S*i));t.fillRect(0,0,e.width,n)}}Em(t){let e=this.Gv.Qt().Et(),i=e.zl();if(!i||i.length===0)return;let n=this.Pu.maxTickMarkWeight(i),o=this.Gw(),r=e.N();r.borderVisible&&r.ticksVisible&&t.useBitmapCoordinateSpace((({context:a,horizontalPixelRatio:l,verticalPixelRatio:h})=>{a.strokeStyle=this.Qw(),a.fillStyle=this.Qw();let c=Math.max(1,Math.floor(l)),u=Math.floor(.5*l);a.beginPath();let d=Math.round(o.C*h);for(let m=i.length;m--;){let f=Math.round(i[m].coord*l);a.rect(f-u,0,c,d)}a.fill()})),t.useMediaCoordinateSpace((({context:a})=>{let l=o.S+o.C+o.A+o.P/2;a.textAlign="center",a.textBaseline="middle",a.fillStyle=this.H(),a.font=this.ym();for(let h of i)if(h.weight<n){let c=h.needAlignCoordinate?this.tM(a,h.coord,h.label):h.coord;a.fillText(h.label,c,l)}this.Gv.N().timeScale.allowBoldLabels&&(a.font=this.iM());for(let h of i)if(h.weight>=n){let c=h.needAlignCoordinate?this.tM(a,h.coord,h.label):h.coord;a.fillText(h.label,c,l)}}))}tM(t,e,i){let n=this.rm.Ii(t,i),o=n/2,r=Math.floor(e-o)+.5;return r<0?e+=Math.abs(0-r):r+n>this.nm.width&&(e-=Math.abs(this.nm.width-(r+n))),e}Jw(t,e){let i=this.Gw();for(let n of t)for(let o of n.dn())o.Tt().st(e,i)}Qw(){return this.Gv.N().timeScale.borderColor}H(){return this.yn.textColor}F(){return this.yn.fontSize}ym(){return Hi(this.F(),this.yn.fontFamily)}iM(){return Hi(this.F(),this.yn.fontFamily,"bold")}Gw(){this.M===null&&(this.M={S:1,L:NaN,A:NaN,I:NaN,tn:NaN,C:5,P:NaN,k:"",Qi:new Se,Zw:0});let t=this.M,e=this.ym();if(t.k!==e){let i=this.F();t.P=i,t.k=e,t.A=3*i/12,t.I=3*i/12,t.tn=9*i/12,t.L=0,t.Zw=4*i/12,t.Qi.Os()}return this.M}zm(t){this.uv.style.cursor=t===1?"ew-resize":"default"}Uw(){let t=this.Gv.Qt(),e=t.N();e.leftPriceScale.visible||this.Lw===null||(this.Fw.removeChild(this.Lw.fv()),this.Lw.m(),this.Lw=null),e.rightPriceScale.visible||this.zw===null||(this.Ww.removeChild(this.zw.fv()),this.zw.m(),this.zw=null);let i={Jd:this.Gv.Qt().Jd()},n=()=>e.leftPriceScale.borderVisible&&t.Et().N().borderVisible,o=()=>t.af();e.leftPriceScale.visible&&this.Lw===null&&(this.Lw=new as("left",e,i,n,o),this.Fw.appendChild(this.Lw.fv())),e.rightPriceScale.visible&&this.zw===null&&(this.zw=new as("right",e,i,n,o),this.Ww.appendChild(this.zw.fv()))}},vc=!!_e&&!!navigator.userAgentData&&navigator.userAgentData.brands.some((s=>s.brand.includes("Chromium")))&&!!_e&&(navigator?.userAgentData?.platform?navigator.userAgentData.platform==="Windows":navigator.userAgent.toLowerCase().indexOf("win")>=0),ho=class{constructor(t,e,i){var n;this.nM=[],this.sM=[],this.eM=0,this.oo=0,this.k_=0,this.rM=0,this.hM=0,this.aM=null,this.lM=!1,this.$m=new B,this.jm=new B,this.wd=new B,this.oM=null,this._M=null,this.Kv=t,this.yn=e,this.Pu=i,this.jv=document.createElement("div"),this.jv.classList.add("tv-lightweight-charts"),this.jv.style.overflow="hidden",this.jv.style.direction="ltr",this.jv.style.width="100%",this.jv.style.height="100%",(n=this.jv).style.userSelect="none",n.style.webkitUserSelect="none",n.style.msUserSelect="none",n.style.MozUserSelect="none",n.style.webkitTapHighlightColor="transparent",this.uM=document.createElement("table"),this.uM.setAttribute("cellspacing","0"),this.jv.appendChild(this.uM),this.cM=this.dM.bind(this),an(this.yn)&&this.fM(!0),this.sn=new Jn(this.gd.bind(this),this.yn,i),this.Qt().Bd().i(this.pM.bind(this),this),this.vM=new lo(this,this.Pu),this.uM.appendChild(this.vM.fv());let o=e.autoSize&&this.mM(),r=this.yn.width,a=this.yn.height;if(o||r===0||a===0){let l=t.getBoundingClientRect();r=r||l.width,a=a||l.height}this.wM(r,a),this.MM(),t.appendChild(this.jv),this.gM(),this.sn.Et().Jc().i(this.sn.ka.bind(this.sn),this),this.sn.N_().i(this.sn.ka.bind(this.sn),this)}Qt(){return this.sn}N(){return this.yn}lv(){return this.nM}bM(){return this.vM}m(){this.fM(!1),this.eM!==0&&window.cancelAnimationFrame(this.eM),this.sn.Bd().u(this),this.sn.Et().Jc().u(this),this.sn.N_().u(this),this.sn.m();for(let t of this.nM)this.uM.removeChild(t.fv()),t.mw().u(this),t.ww().u(this),t.m();this.nM=[];for(let t of this.sM)this.SM(t);this.sM=[],S(this.vM).m(),this.jv.parentElement!==null&&this.jv.parentElement.removeChild(this.jv),this.wd.m(),this.$m.m(),this.jm.m(),this.xM()}wM(t,e,i=!1){if(this.oo===e&&this.k_===t)return;let n=(function(a){let l=Math.floor(a.width),h=Math.floor(a.height);return $({width:l-l%2,height:h-h%2})})($({width:t,height:e}));this.oo=n.height,this.k_=n.width;let o=this.oo+"px",r=this.k_+"px";if(this.CM()||(S(this.jv).style.height=o,S(this.jv).style.width=r),this.uM.style.height=o,this.uM.style.width=r,i){this.eM!==0&&(window.cancelAnimationFrame(this.eM),this.eM=0),this.lM=!1;let a=X.ys();this.aM!==null&&(a.Ss(this.aM),this.aM=null),this.yM(a,performance.now())}else this.sn.ka()}Rm(t){t===void 0&&(t=X.ys());for(let e=0;e<this.nM.length;e++)this.nM[e].Rm(t._s(e).rs);this.yn.timeScale.visible&&this.vM.Rm(t.ls())}vr(t){let e=an(this.yn);this.sn.vr(t);let i=an(this.yn);i!==e&&this.fM(i),t.layout?.panes&&this.PM(),this.gM(),this.kM(t)}mw(){return this.$m}ww(){return this.jm}Bd(){return this.wd}TM(t=!1){this.aM!==null&&(this.yM(this.aM,performance.now()),this.aM=null);let e=this.RM(null),i=document.createElement("canvas");i.width=e.width,i.height=e.height;let n=S(i.getContext("2d"));return this.RM(n,t),i}DM(t){return t==="left"&&!this.IM()||t==="right"&&!this.VM()||this.nM.length===0?0:S(t==="left"?this.nM[0].yw():this.nM[0].Pw()).Tm()}CM(){return this.yn.autoSize&&this.oM!==null}Mv(){return this.jv}BM(t){this._M=t,this._M?this.Mv().style.setProperty("cursor",t):this.Mv().style.removeProperty("cursor")}EM(){return this._M}AM(t){return tt(this.nM[t]).pv()}PM(){this.sM.forEach((t=>{t.Pt()}))}kM(t){(t.autoSize!==void 0||!this.oM||t.width===void 0&&t.height===void 0)&&(t.autoSize&&!this.oM&&this.mM(),t.autoSize===!1&&this.oM!==null&&this.xM(),t.autoSize||t.width===void 0&&t.height===void 0||this.wM(t.width||this.k_,t.height||this.oo))}RM(t,e){let i=0,n=0,o=this.nM[0],r=(l,h)=>{let c=0;for(let u=0;u<this.nM.length;u++){let d=this.nM[u],m=S(l==="left"?d.yw():d.Pw()),f=m.vv();if(t!==null&&m.mv(t,h,c,e),c+=f.height,u<this.nM.length-1){let g=this.sM[u],w=g.vv();t!==null&&g.mv(t,h,c),c+=w.height}}};this.IM()&&(r("left",0),i+=S(o.yw()).vv().width);for(let l=0;l<this.nM.length;l++){let h=this.nM[l],c=h.vv();if(t!==null&&h.mv(t,i,n,e),n+=c.height,l<this.nM.length-1){let u=this.sM[l],d=u.vv();t!==null&&u.mv(t,i,n),n+=d.height}}i+=o.vv().width,this.VM()&&(r("right",i),i+=S(o.Pw()).vv().width);let a=(l,h,c)=>{S(l==="left"?this.vM.$w():this.vM.jw()).mv(S(t),h,c)};if(this.yn.timeScale.visible){let l=this.vM.vv();if(t!==null){let h=0;this.IM()&&(a("left",h,n),h=S(o.yw()).vv().width),this.vM.mv(t,h,n,e),h+=l.width,this.VM()&&a("right",h,n)}n+=l.height}return $({width:i,height:n})}LM(){let t=0,e=0,i=0;for(let w of this.nM)this.IM()&&(e=Math.max(e,S(w.yw()).Cm(),this.yn.leftPriceScale.minimumWidth)),this.VM()&&(i=Math.max(i,S(w.Pw()).Cm(),this.yn.rightPriceScale.minimumWidth)),t+=w.F_();e=io(e),i=io(i);let n=this.k_,o=this.oo,r=Math.max(n-e-i,0),a=1*this.sM.length,l=this.yn.timeScale.visible,h=l?Math.max(this.vM.Kw(),this.yn.timeScale.minimumHeight):0;var c;h=(c=h)+c%2;let u=a+h,d=o<u?0:o-u,m=d/t,f=0,g=window.devicePixelRatio||1;for(let w=0;w<this.nM.length;++w){let v=this.nM[w];v.ew(this.sn.Gn()[w]);let x=0,M=0;M=w===this.nM.length-1?Math.ceil((d-f)*g)/g:Math.round(v.F_()*m*g)/g,x=Math.max(M,2),f+=x,v.km($({width:r,height:x})),this.IM()&&v.gw(e,"left"),this.VM()&&v.gw(i,"right"),v.yv()&&this.sn.Ed(v.yv(),x)}this.vM.Yw($({width:l?r:0,height:h}),l?e:0,l?i:0),this.sn.H_(r),this.rM!==e&&(this.rM=e),this.hM!==i&&(this.hM=i)}fM(t){t?this.jv.addEventListener("wheel",this.cM,{passive:!1}):this.jv.removeEventListener("wheel",this.cM)}zM(t){switch(t.deltaMode){case t.DOM_DELTA_PAGE:return 120;case t.DOM_DELTA_LINE:return 32}return vc?1/window.devicePixelRatio:1}dM(t){if(!(t.deltaX!==0&&this.yn.handleScroll.mouseWheel||t.deltaY!==0&&this.yn.handleScale.mouseWheel))return;let e=this.zM(t),i=e*t.deltaX/100,n=-e*t.deltaY/100;if(t.cancelable&&t.preventDefault(),n!==0&&this.yn.handleScale.mouseWheel){let o=Math.sign(n)*Math.min(1,Math.abs(n)),r=t.clientX-this.jv.getBoundingClientRect().left;this.Qt().Wd(r,o)}i!==0&&this.yn.handleScroll.mouseWheel&&this.Qt().Hd(-80*i)}yM(t,e){let i=t.ls();i===3&&this.OM(),i!==3&&i!==2||(this.NM(t),this.FM(t,e),this.vM.Pt(),this.nM.forEach((n=>{n.hw()})),this.aM?.ls()===3&&(this.aM.Ss(t),this.OM(),this.NM(this.aM),this.FM(this.aM,e),t=this.aM,this.aM=null)),this.Rm(t)}FM(t,e){for(let i of t.bs())this.xs(i,e)}NM(t){let e=this.sn.Gn();for(let i=0;i<e.length;i++)t._s(i).hs&&e[i].lu()}xs(t,e){let i=this.sn.Et();switch(t.ds){case 0:i.td();break;case 1:i.nd(t.Wt);break;case 2:i.Ms(t.Wt);break;case 3:i.gs(t.Wt);break;case 4:i.Wc();break;case 5:t.Wt.Kc(e)||i.gs(t.Wt.Gc(e))}}gd(t){this.aM!==null?this.aM.Ss(t):this.aM=t,this.lM||(this.lM=!0,this.eM=window.requestAnimationFrame((e=>{if(this.lM=!1,this.eM=0,this.aM!==null){let i=this.aM;this.aM=null,this.yM(i,e);for(let n of i.bs())if(n.ds===5&&!n.Wt.Kc(e)){this.Qt().ps(n.Wt);break}}})))}OM(){this.MM()}SM(t){this.uM.removeChild(t.fv()),t.m()}MM(){let t=this.sn.Gn(),e=t.length,i=this.nM.length;for(let n=e;n<i;n++){let o=tt(this.nM.pop());this.uM.removeChild(o.fv()),o.mw().u(this),o.ww().u(this),o.m();let r=this.sM.pop();r!==void 0&&this.SM(r)}for(let n=i;n<e;n++){let o=new ao(this,t[n]);if(o.mw().i(this.WM.bind(this,o),this),o.ww().i(this.HM.bind(this,o),this),this.nM.push(o),n>0){let r=new so(this,n-1,n);this.sM.push(r),this.uM.insertBefore(r.fv(),this.vM.fv())}this.uM.insertBefore(o.fv(),this.vM.fv())}for(let n=0;n<e;n++){let o=t[n],r=this.nM[n];r.yv()!==o?r.ew(o):r.sw()}this.gM(),this.LM()}UM(t,e,i,n){let o=new Map;t!==null&&this.sn.Jn().forEach((c=>{let u=c.Un().Hn(t);u!==null&&o.set(c,u)}));let r;if(t!==null){let c=this.sn.Et().en(t)?.originalTime;c!==void 0&&(r=c)}let a=this.Qt().cu(),l=this.$M(n),h=(function(c,u){let d=c!==null&&c.uu instanceof Me?c.uu:void 0,m=c?.bu?.te,f=u!==void 0&&u!==-1?u:void 0;return c===null||c.ee===void 0?{jM:d,qM:m}:{jM:d,qM:m,YM:{ds:c.ee,KM:(g=c.uu,w=c.ee,g instanceof ni?"pane-primitive":w==="marker"||w==="primitive"?"series-primitive":"series"),GM:cc(c.ee,m),Y_:d,ZM:m,XM:f}};var g,w})(a,l);return{Qr:r,$n:t??void 0,JM:e??void 0,XM:l!==-1?l:void 0,jM:h.jM,QM:o,qM:h.qM,YM:h.YM,tg:i??void 0}}$M(t){let e=-1;if(t)e=this.nM.indexOf(t);else{let i=this.Qt().Vd().Kn();i!==null&&(e=this.Qt().Gn().indexOf(i))}return e}WM(t,e,i,n){this.$m.p((()=>this.UM(e,i,n,t)))}HM(t,e,i,n){this.jm.p((()=>this.UM(e,i,n,t)))}pM(t,e,i){this.BM(this.Qt().cu()?.gu??null),this.wd.p((()=>this.UM(t,e,i)))}gM(){let t=this.yn.timeScale.visible?"":"none";this.vM.fv().style.display=t}IM(){return this.nM[0].yv().X_().N().visible}VM(){return this.nM[0].yv().J_().N().visible}mM(){return"ResizeObserver"in window&&(this.oM=new ResizeObserver((t=>{let e=t[t.length-1];if(!e)return;let i=e.contentRect.width,n=e.contentRect.height;this.wM(i,n,!0)})),this.oM.observe(this.Kv,{box:"border-box"}),!0)}xM(){this.oM!==null&&this.oM.disconnect(),this.oM=null}};function an(s){return!!(s.handleScroll.mouseWheel||s.handleScale.mouseWheel)}function bc(s){return s.open===void 0&&s.value===void 0}function wc(s){return(function(t){return t.open!==void 0})(s)||(function(t){return t.value!==void 0})(s)}function nl(s,t,e,i){let n=e.value,o={$n:t,wt:s,Wt:[n,n,n,n],Qr:i};return e.color!==void 0&&(o.R=e.color),o}function yc(s,t,e,i){let n=e.value,o={$n:t,wt:s,Wt:[n,n,n,n],Qr:i};return e.lineColor!==void 0&&(o.vt=e.lineColor),e.topColor!==void 0&&(o.ah=e.topColor),e.bottomColor!==void 0&&(o.oh=e.bottomColor),o}function xc(s,t,e,i){let n=e.value,o={$n:t,wt:s,Wt:[n,n,n,n],Qr:i};return e.topLineColor!==void 0&&(o._h=e.topLineColor),e.bottomLineColor!==void 0&&(o.uh=e.bottomLineColor),e.topFillColor1!==void 0&&(o.dh=e.topFillColor1),e.topFillColor2!==void 0&&(o.fh=e.topFillColor2),e.bottomFillColor1!==void 0&&(o.ph=e.bottomFillColor1),e.bottomFillColor2!==void 0&&(o.mh=e.bottomFillColor2),o}function Cc(s,t,e,i){let n={$n:t,wt:s,Wt:[e.open,e.high,e.low,e.close],Qr:i};return e.color!==void 0&&(n.R=e.color),n}function Sc(s,t,e,i){let n={$n:t,wt:s,Wt:[e.open,e.high,e.low,e.close],Qr:i};return e.color!==void 0&&(n.R=e.color),e.borderColor!==void 0&&(n.Ht=e.borderColor),e.wickColor!==void 0&&(n.hh=e.wickColor),n}function Mc(s,t,e,i,n){let o=tt(n)(e),r=Math.max(...o),a=Math.min(...o),l=o[o.length-1],h=[l,r,a,l],{time:c,color:u,...d}=e;return{$n:t,wt:s,Wt:h,Qr:i,ue:d,R:u}}function ge(s){return s.Wt!==void 0}function ol(s,t){return t.customValues!==void 0&&(s.ig=t.customValues),s}function te(s){return(t,e,i,n,o,r)=>(function(a,l){return l?l(a):bc(a)})(i,r)?ol({wt:t,$n:e,Qr:n},i):ol(s(t,e,i,n,o),i)}function rl(s){return{Candlestick:te(Sc),Bar:te(Cc),Area:te(yc),Baseline:te(xc),Histogram:te(nl),Line:te(nl),Custom:te(Mc)}[s]}function al(s){return{$n:0,ng:new Map,Oa:s}}function ll(s,t){if(s!==void 0&&s.length!==0)return{sg:t.key(s[0].wt),eg:t.key(s[s.length-1].wt)}}function hl(s){let t;return s.forEach((e=>{t===void 0&&(t=e.Qr)})),tt(t)}var co=class{constructor(t){this.rg=new Map,this.hg=new Map,this.ag=new Map,this.lg=[],this.Pu=t}m(){this.rg.clear(),this.hg.clear(),this.ag.clear(),this.lg=[]}og(t,e){let i=this.rg.size!==0,n=!1,o=this.hg.get(t);if(o!==void 0)if(this.hg.size===1)i=!1,n=!0,this.rg.clear();else for(let l of this.lg)l.pointData.ng.delete(t)&&(n=!0);let r=[];if(e.length!==0){let l=e.map((m=>m.time)),h=this.Pu.createConverterToInternalObj(e),c=rl(t.bh()),u=t.ul(),d=t.cl();r=e.map(((m,f)=>{let g=h(m.time),w=this.Pu.key(g),v=this.rg.get(w);v===void 0&&(v=al(g),this.rg.set(w,v),n=!0);let x=c(g,v.$n,m,l[f],u,d);return v.ng.set(t,x),x}))}i&&this._g(),this.ug(t,r);let a=-1;if(n){let l=[];this.rg.forEach((h=>{l.push({timeWeight:0,time:h.Oa,pointData:h,originalTime:hl(h.ng)})})),l.sort(((h,c)=>this.Pu.key(h.time)-this.Pu.key(c.time))),a=this.cg(l)}return this.dg(t,a,(function(l,h,c){let u=ll(l,c),d=ll(h,c);if(u!==void 0&&d!==void 0)return{fg:!1,Va:u.eg>=d.eg&&u.sg>=d.sg}})(this.hg.get(t),o,this.Pu))}if(t){return this.og(t,[])}pg(t,e,i){if(i&&t.Fa())throw new Error("Historical updates are not supported when conflation is enabled. Conflation requires data to be processed in order.");let n=e;(function(v){v.Qr===void 0&&(v.Qr=v.time)})(n),this.Pu.preprocessData(e);let o=this.Pu.createConverterToInternalObj([e])(e.time),r=this.ag.get(t);if(!i&&r!==void 0&&this.Pu.key(o)<this.Pu.key(r))throw new Error(`Cannot update oldest data, last time=${r}, new time=${o}`);let a=this.rg.get(this.Pu.key(o));if(i&&a===void 0)throw new Error("Cannot update non-existing data point when historicalUpdate is true");let l=a===void 0;a===void 0&&(a=al(o),this.rg.set(this.Pu.key(o),a));let h=rl(t.bh()),c=t.ul(),u=t.cl(),d=h(o,a.$n,e,n.Qr,c,u),m=!i&&!l&&r!==void 0&&this.Pu.key(o)===this.Pu.key(r);a.ng.set(t,d),i?this.vg(t,d,a.$n):m&&t.Fa()&&ge(d)?(t.Rr(d),this.mg(t,d)):this.mg(t,d);let f={Va:ge(d),fg:i};if(!l)return this.dg(t,-1,f);let g={timeWeight:0,time:a.Oa,pointData:a,originalTime:hl(a.ng)},w=se(this.lg,this.Pu.key(g.time),((v,x)=>this.Pu.key(v.time)<x));this.lg.splice(w,0,g);for(let v=w;v<this.lg.length;++v)qi(this.lg[v].pointData,v);return this.Pu.fillWeightsForPoints(this.lg,w),this.dg(t,w,f)}wg(t,e){let i=this.hg.get(t);if(i===void 0||e<=0)return[[],this.Mg()];e=Math.min(e,i.length);let n=i.splice(-e).reverse();i.length===0?this.ag.delete(t):this.ag.set(t,i[i.length-1].wt);for(let o of n){let r=this.rg.get(this.Pu.key(o.wt));if(r&&(r.ng.delete(t),r.ng.size===0)){this.rg.delete(this.Pu.key(r.Oa)),this.lg.splice(r.$n,1);for(let a=r.$n;a<this.lg.length;++a)qi(this.lg[a].pointData,a)}}return[n,this.dg(t,this.lg.length-1,{fg:!1,Va:!1})]}mg(t,e){let i=this.hg.get(t);i===void 0&&(i=[],this.hg.set(t,i));let n=i.length!==0?i[i.length-1]:null;n===null||this.Pu.key(e.wt)>this.Pu.key(n.wt)?ge(e)&&i.push(e):ge(e)?i[i.length-1]=e:i.splice(-1,1),this.ag.set(t,e.wt)}vg(t,e,i){let n=this.hg.get(t);if(n===void 0)return;let o=se(n,i,((r,a)=>r.$n<a));ge(e)?n[o]=e:n.splice(o,1)}ug(t,e){e.length!==0?(this.hg.set(t,e.filter(ge)),this.ag.set(t,e[e.length-1].wt)):(this.hg.delete(t),this.ag.delete(t))}_g(){for(let t of this.lg)t.pointData.ng.size===0&&this.rg.delete(this.Pu.key(t.time))}cg(t){let e=-1;for(let i=0;i<this.lg.length&&i<t.length;++i){let n=this.lg[i],o=t[i];if(this.Pu.key(n.time)!==this.Pu.key(o.time)){e=i;break}o.timeWeight=n.timeWeight,qi(o.pointData,i)}if(e===-1&&this.lg.length!==t.length&&(e=Math.min(this.lg.length,t.length)),e===-1)return-1;for(let i=e;i<t.length;++i)qi(t[i].pointData,i);return this.Pu.fillWeightsForPoints(t,e),this.lg=t,e}gg(){if(this.hg.size===0)return null;let t=0;return this.hg.forEach((e=>{e.length!==0&&(t=Math.max(t,e[e.length-1].$n))})),t}dg(t,e,i){let n=this.Mg();if(e!==-1)this.hg.forEach(((o,r)=>{n.Y_.set(r,{ue:o,bg:r===t?i:void 0})})),this.hg.has(t)||n.Y_.set(t,{ue:[],bg:i}),n.Et.Sg=this.lg,n.Et.xg=e;else{let o=this.hg.get(t);n.Y_.set(t,{ue:o||[],bg:i})}return n}Mg(){return{Y_:new Map,Et:{Dc:this.gg()}}}};function qi(s,t){s.$n=t,s.ng.forEach((e=>{e.$n=t}))}function _c(s,t){return s._t<t}function Lc(s,t){return t<s._t}function uo(s,t,e,i){return se(s,t,_c,e,i)}function mo(s,t,e,i){return _o(s,t,Lc,e,i)}function Wi(s,t,e){return{ne:s,se:t,ee:e}}function cl(s,t,e,i){return s>=t-i&&s<=e+i}function Xe(s,t,e,i,n,o){let r=n-e,a=o-i;if(r===0&&a===0)return Math.hypot(s-e,t-i);let l=((s-e)*r+(t-i)*a)/(r*r+a*a),h=Math.max(0,Math.min(1,l)),c=e+r*h,u=i+a*h;return Math.hypot(s-c,t-u)}var ln=[0,0];function Ec(s,t,e){return t===void 0||t.wt!==s.wt-1?s._t-e/2:(t._t+s._t)/2}function kc(s,t,e){return t===void 0||t.wt!==s.wt+1?s._t+e/2:(s._t+t._t)/2}function zc(s,t,e,i,n,o,r){if(t===null||t.from>=t.to||s.length===0)return null;let a=n/2+o,l=uo(s,e-a,t.from,t.to),h=mo(s,e+a,l,t.to);if(l>=h)return null;let c=Number.POSITIVE_INFINITY;for(let u=l;u<h;u++){let d=s[u],m=u>t.from?s[u-1]:void 0,f=u<t.to-1?s[u+1]:void 0,g=Ec(d,m,n)-o,w=kc(d,f,n)+o;if(e<g||e>w)continue;r(d,ln);let v=ln[0],x=ln[1],M=Math.min(v,x),C=Math.max(v,x),k=M-o,E=C+o;if(i>=M&&i<=C)c=Math.min(c,0);else if(i>=k&&i<=E){let z=Math.min(Math.abs(i-M),Math.abs(C-i));c=Math.min(c,z)}}return Number.isFinite(c)?Wi(c,0,"series-range"):null}function Tc(s,t){return s.wt<t}function Ac(s,t){return t<s.wt}function Pc(s,t,e){let i=t.Na(),n=t.bi(),o=se(s,i,Tc),r=_o(s,n,Ac);if(!e)return{from:o,to:r};let a=o,l=r;return o>0&&o<s.length&&s[o].wt>=i&&(a=o-1),r>0&&r<s.length&&s[r-1].wt<=n&&(l=r+1),{from:a,to:l}}var ls=class{constructor(t,e,i){this.Cg=!0,this.yg=!0,this.Pg=!0,this.kg=[],this.Tg=null,this.Rg=-1,this.ae=t,this.le=e,this.Dg=i}Pt(t){this.Cg=!0,t==="data"&&(this.yg=!0),t==="options"&&(this.Pg=!0)}Tt(){return this.ae.It()?(this.Ig(),this.Tg===null?null:this.Vg):null}Qs(t,e){return this.ae.It()?(this.Ig(),this.Tg===null?null:this.Bg(t,e)):null}Bg(t,e){return null}Eg(){this.kg=this.kg.map((t=>({...t,...this.ae.Sa().Sh(t.wt)})))}Ag(){this.Tg=null}Ig(){let t=this.le.Et(),e=t.N().enableConflation?t.sd():0;e!==this.Rg&&(this.yg=!0,this.Rg=e),this.yg&&(this.Lg(),this.yg=!1),this.Pg&&(this.Eg(),this.Pg=!1),this.Cg&&(this.zg(),this.Cg=!1)}zg(){let t=this.ae.Ft(),e=this.le.Et();if(this.Ag(),e.Zi()||t.Zi())return;let i=e.Ee();if(i===null||this.ae.Un().Th()===0)return;let n=this.ae.Lt();n!==null&&(this.Tg=Pc(this.kg,i,this.Dg),this.Og(t,e,n.Wt),this.Ng())}},fo=class{constructor(t,e){this.Fg=t,this.Ki=e}st(t,e,i){this.Fg.draw(t,this.Ki,e,i)}};function $c(s){switch(s){case"point":return 2;case"range":return 0;default:return 1}}var po=class extends ls{constructor(t,e,i){super(t,e,!1),this.Yh=i,this.Fg=this.Yh.renderer(),this.Vg=new fo(this.Fg,(n=>this.Wg(n)))}get ga(){return this.Yh.conflationReducer}Ha(t){return this.Yh.priceValueBuilder(t)}dl(t){return this.Yh.isWhitespace(t)}Bg(t,e){let i=this.Fg.hitTest?.(t,e,(r=>this.Wg(r)));if(i!=null)return{ne:(n=i).distance,se:$c(n.type),ee:"custom",gu:n.cursorStyle,te:n.objectId,ie:n.hitTestData};var n;let o=zc(this.kg,this.Tg,t,e,this.le.Et().ml(),this.ae.N().hitTestTolerance,((r,a)=>{let l=r.Hg,h=NaN,c=NaN;if(l!==void 0&&!this.Yh.isWhitespace(l))for(let u of this.Yh.priceValueBuilder(l)){let d=this.Wg(u);d!==null&&(h=Number.isNaN(h)?d:Math.min(h,d),c=Number.isNaN(c)?d:Math.max(c,d))}a[0]=h,a[1]=c}));return o===null?null:{...o,ee:"custom"}}Lg(){let t=this.ae.Sa();this.kg=this.ae.Ua().Bh().map((e=>({wt:e.$n,_t:NaN,...t.Sh(e.$n),Hg:e.ue})))}Og(t,e){e.Ic(this.kg,un(this.Tg))}Ng(){this.Yh.update({bars:this.kg.map(Rc),barSpacing:this.le.Et().ml(),visibleRange:this.Tg,conflationFactor:this.le.Et().sd()},this.ae.N())}Wg(t){let e=this.ae.Lt();return e===null?null:this.ae.Ft().Nt(t,e.Wt)}};function Rc(s){return{x:s._t,time:s.wt,originalData:s.Hg,barColor:s.sh}}var Nc={color:"#2196f3"},Oc=(s,t,e)=>{let i=It(e);return new po(s,t,i)};function ko(s){let t={value:s.Wt[3],time:s.Qr};return s.ig!==void 0&&(t.customValues=s.ig),t}function ul(s){let t=ko(s);return s.R!==void 0&&(t.color=s.R),t}function Fc(s){let t=ko(s);return s.vt!==void 0&&(t.lineColor=s.vt),s.ah!==void 0&&(t.topColor=s.ah),s.oh!==void 0&&(t.bottomColor=s.oh),t}function Ic(s){let t=ko(s);return s._h!==void 0&&(t.topLineColor=s._h),s.uh!==void 0&&(t.bottomLineColor=s.uh),s.dh!==void 0&&(t.topFillColor1=s.dh),s.fh!==void 0&&(t.topFillColor2=s.fh),s.ph!==void 0&&(t.bottomFillColor1=s.ph),s.mh!==void 0&&(t.bottomFillColor2=s.mh),t}function zl(s){let t={open:s.Wt[0],high:s.Wt[1],low:s.Wt[2],close:s.Wt[3],time:s.Qr};return s.ig!==void 0&&(t.customValues=s.ig),t}function Bc(s){let t=zl(s);return s.R!==void 0&&(t.color=s.R),t}function Vc(s){let t=zl(s),{R:e,Ht:i,hh:n}=s;return e!==void 0&&(t.color=e),i!==void 0&&(t.borderColor=i),n!==void 0&&(t.wickColor=n),t}function Ui(s){return{Area:Fc,Line:ul,Baseline:Ic,Histogram:ul,Bar:Bc,Candlestick:Vc,Custom:qc}[s]}function qc(s){let t=s.Qr;return{...s.ue,time:t}}var Dc={vertLine:{color:"#9598A1",width:1,style:3,visible:!0,labelVisible:!0,labelBackgroundColor:"#131722"},horzLine:{color:"#9598A1",width:1,style:3,visible:!0,labelVisible:!0,labelBackgroundColor:"#131722"},mode:1,doNotSnapToHiddenSeriesIndices:!1},Wc={vertLines:{color:"#D6DCDE",style:0,visible:!0},horzLines:{color:"#D6DCDE",style:0,visible:!0}},Uc={background:{type:"solid",color:"#FFFFFF"},textColor:"#191919",fontSize:12,fontFamily:wl,panes:{enableResize:!0,separatorColor:"#E0E3EB",separatorHoverColor:"rgba(178, 181, 189, 0.2)"},attributionLogo:!0,colorSpace:"srgb",colorParsers:[]},hn={autoScale:!0,mode:0,invertScale:!1,alignLabels:!0,borderVisible:!0,borderColor:"#2B2B43",entireTextOnly:!1,visible:!1,ticksVisible:!1,scaleMargins:{bottom:.1,top:.2},minimumWidth:0,ensureEdgeTickMarksVisible:!1,tickMarkDensity:2.5},Hc={rightOffset:0,barSpacing:6,minBarSpacing:.5,maxBarSpacing:0,fixLeftEdge:!1,fixRightEdge:!1,lockVisibleTimeRangeOnResize:!1,rightBarStaysOnScroll:!1,borderVisible:!0,borderColor:"#2B2B43",visible:!0,timeVisible:!1,secondsVisible:!0,shiftVisibleRangeOnNewBar:!0,allowShiftVisibleRangeOnWhitespaceReplacement:!1,ticksVisible:!1,uniformDistribution:!1,minimumHeight:0,allowBoldLabels:!0,ignoreWhitespaceIndices:!1,enableConflation:!1,conflationThresholdFactor:1,precomputeConflationOnInit:!1,precomputeConflationPriority:"background"};function dl(){return{addDefaultPane:!0,hoveredSeriesOnTop:!0,width:0,height:0,autoSize:!1,layout:Uc,crosshair:Dc,grid:Wc,overlayPriceScales:{...hn},leftPriceScale:{...hn,visible:!1},rightPriceScale:{...hn,visible:!0},defaultVisiblePriceScaleId:"right",timeScale:Hc,localization:{locale:_e?navigator.language:"",dateFormat:"dd MMM 'yy"},handleScroll:{mouseWheel:!0,pressedMouseMove:!0,horzTouchDrag:!0,vertTouchDrag:!0},handleScale:{axisPressedMouseMove:{time:!0,price:!0},axisDoubleClickReset:{time:!0,price:!0},mouseWheel:!0,pinch:!0},kineticScroll:{mouse:!1,touch:!0},trackingMode:{exitMode:1}}}var hs=class{constructor(t,e,i){this.hv=t,this.Ug=e,this.$g=i??0}applyOptions(t){this.hv.Qt().Dd(this.Ug,t,this.$g)}options(){return this.Ki().N()}width(){return ds(this.Ug)?this.hv.DM(this.Ug):0}setVisibleRange(t){this.setAutoScale(!1),this.Ki().Go(new st(t.from,t.to))}getVisibleRange(){let t,e,i=this.Ki().ar();if(i===null)return null;if(this.Ki().ho()){let n=this.Ki().S_(),o=Ll(n);i=be(i,this.Ki().lo()),t=Number((Math.round(i.Je()/n)*n).toFixed(o)),e=Number((Math.round(i.Qe()/n)*n).toFixed(o))}else t=i.Je(),e=i.Qe();return{from:t,to:e}}setAutoScale(t){this.applyOptions({autoScale:t})}Ki(){return S(this.hv.Qt().Id(this.Ug,this.$g)).Ft}},go=class{constructor(t,e,i,n){this.hv=t,this.yt=i,this.jg=e,this.qg=n}getHeight(){return this.yt.$t()}setHeight(t){let e=this.hv.Qt(),i=e._f(this.yt);e.Ld(i,t)}getStretchFactor(){return this.yt.F_()}setStretchFactor(t){this.yt.W_(t),this.hv.Qt().ka()}paneIndex(){return this.hv.Qt()._f(this.yt)}moveTo(t){let e=this.paneIndex();e!==t&&(G(t>=0&&t<this.hv.lv().length,"Invalid pane index"),this.hv.Qt().Od(e,t))}getSeries(){return this.yt.Y_().map((t=>this.jg(t)))??[]}getHTMLElement(){let t=this.hv.lv();return t&&t.length!==0&&t[this.paneIndex()]?t[this.paneIndex()].fv():null}attachPrimitive(t){this.yt.ol(t),t.attached&&t.attached({chart:this.qg,requestUpdate:()=>this.yt.Qt().ka()})}detachPrimitive(t){this.yt._l(t)}priceScale(t){if(this.yt.O_(t)===null)throw new Error(`Cannot find price scale with id: ${t}`);return new hs(this.hv,t,this.paneIndex())}setPreserveEmptyPane(t){this.yt.j_(t)}preserveEmptyPane(){return this.yt.q_()}addCustomSeries(t,e={},i=0){return this.qg.addCustomSeries(t,e,i)}addSeries(t,e={}){return this.qg.addSeries(t,e,this.paneIndex())}},jc={color:"#FF0000",price:0,lineStyle:2,lineWidth:1,lineVisible:!0,axisLabelVisible:!0,title:"",axisLabelColor:"",axisLabelTextColor:""},cs=class{constructor(t){this._r=t}applyOptions(t){this._r.vr(t)}options(){return this._r.N()}Yg(){return this._r}},vo=class{constructor(t,e,i,n,o,r){this.Kg=new B,this.ae=t,this.Gg=e,this.Zg=i,this.Pu=o,this.qg=n,this.Xg=r}m(){this.Kg.m()}priceFormatter(){return this.ae.sl()}priceToCoordinate(t){let e=this.ae.Lt();return e===null?null:this.ae.Ft().Nt(t,e.Wt)}coordinateToPrice(t){let e=this.ae.Lt();return e===null?null:this.ae.Ft().Tn(t,e.Wt)}barsInLogicalRange(t){if(t===null)return null;let e=new we(new ee(t.from,t.to)).Uu(),i=this.ae.Un();if(i.Zi())return null;let n=i.Hn(e.Na(),1),o=i.Hn(e.bi(),-1),r=S(i.Rh()),a=S(i.Qn());if(n!==null&&o!==null&&n.$n>o.$n)return{barsBefore:t.from-r,barsAfter:a-t.to};let l={barsBefore:n===null||n.$n===r?t.from-r:n.$n-r,barsAfter:o===null||o.$n===a?a-t.to:a-o.$n};return n!==null&&o!==null&&(l.from=n.Qr,l.to=o.Qr),l}setData(t){this.Pu,this.ae.bh(),this.Gg.Jg(this.ae,t),this.Qg("full")}update(t,e=!1){this.ae.bh(),this.Gg.tb(this.ae,t,e),this.Qg("update")}pop(t=1){let e=this.Gg.ib(this.ae,t);e.length!==0&&this.Qg("update");let i=Ui(this.seriesType());return e.map((n=>i(n)))}dataByIndex(t,e){let i=this.ae.Un().Hn(t,e);return i===null?null:Ui(this.seriesType())(i)}data(){let t=Ui(this.seriesType());return this.ae.Un().Bh().map((e=>t(e)))}subscribeDataChanged(t){this.Kg.i(t)}unsubscribeDataChanged(t){this.Kg._(t)}applyOptions(t){this.ae.vr(t)}options(){return zt(this.ae.N())}priceScale(){return this.Zg.priceScale(this.ae.Ft().pl(),this.getPane().paneIndex())}createPriceLine(t){let e=it(zt(jc),t),i=this.ae.Ea(e);return new cs(i)}removePriceLine(t){this.ae.Aa(t.Yg())}priceLines(){return this.ae.La().map((t=>new cs(t)))}seriesType(){return this.ae.bh()}lastValueData(t){let e=this.ae.Ae(t);return e.Le?{noData:!0}:{noData:!1,price:e.Mt,color:e.R}}attachPrimitive(t){this.ae.ol(t),t.attached&&t.attached({chart:this.qg,series:this,requestUpdate:()=>this.ae.Qt().ka(),horzScaleBehavior:this.Pu})}detachPrimitive(t){this.ae._l(t),t.detached&&t.detached(),this.ae.Qt().ka()}getPane(){let t=this.ae,e=S(this.ae.Qt().Ks(t));return this.Xg(e)}moveToPane(t){this.ae.Qt().rf(this.ae,t)}seriesOrder(){let t=this.ae.Qt().Ks(this.ae);return t===null?-1:t.Y_().indexOf(this.ae)}setSeriesOrder(t){let e=this.ae.Qt().Ks(this.ae);e!==null&&e.vu(this.ae,t)}Qg(t){this.Kg.v()&&this.Kg.p(t)}},bo=class{constructor(t,e,i){this.nb=new B,this.Qu=new B,this.Nw=new B,this.sn=t,this.ia=t.Et(),this.vM=e,this.ia.Zc().i(this.sb.bind(this)),this.ia.Xc().i(this.eb.bind(this)),this.vM.qw().i(this.rb.bind(this)),this.Pu=i}m(){this.ia.Zc().u(this),this.ia.Xc().u(this),this.vM.qw().u(this),this.nb.m(),this.Qu.m(),this.Nw.m()}scrollPosition(){return this.ia.Oc()}scrollToPosition(t,e){e?this.ia.Yc(t,1e3):this.sn.gs(t)}scrollToRealTime(){this.ia.qc()}getVisibleRange(){let t=this.ia.xc();return t===null?null:{from:t.from.originalTime,to:t.to.originalTime}}setVisibleRange(t){let e={from:this.Pu.convertHorzItemToInternal(t.from),to:this.Pu.convertHorzItemToInternal(t.to)},i=this.ia.kc(e);this.sn.sf(i)}getVisibleLogicalRange(){let t=this.ia.Sc();return t===null?null:{from:t.Na(),to:t.bi()}}setVisibleLogicalRange(t){G(t.from<=t.to,"The from index cannot be after the to index."),this.sn.sf(t)}resetTimeScale(){this.sn.ws()}fitContent(){this.sn.td()}logicalToCoordinate(t){let e=this.sn.Et();return e.Zi()?null:e.jt(t)}coordinateToLogical(t){return this.ia.Zi()?null:this.ia.Vc(t)}timeToIndex(t,e){let i=this.Pu.convertHorzItemToInternal(t);return this.ia.Mc(i,e)}timeToCoordinate(t){let e=this.timeToIndex(t,!1);return e===null?null:this.ia.jt(e)}coordinateToTime(t){let e=this.sn.Et(),i=e.Vc(t),n=e.en(i);return n===null?null:n.originalTime}width(){return this.vM.pv().width}height(){return this.vM.pv().height}subscribeVisibleTimeRangeChange(t){this.nb.i(t)}unsubscribeVisibleTimeRangeChange(t){this.nb._(t)}subscribeVisibleLogicalRangeChange(t){this.Qu.i(t)}unsubscribeVisibleLogicalRangeChange(t){this.Qu._(t)}subscribeSizeChange(t){this.Nw.i(t)}unsubscribeSizeChange(t){this.Nw._(t)}applyOptions(t){this.ia.vr(t)}options(){return{...zt(this.ia.N()),barSpacing:this.ia.ml()}}sb(){this.nb.v()&&this.nb.p(this.getVisibleRange())}eb(){this.Qu.v()&&this.Qu.p(this.getVisibleLogicalRange())}rb(t){this.Nw.p(t.width,t.height)}};function ml(s){return(function(t){if(Pi(t.handleScale)){let i=t.handleScale;t.handleScale={axisDoubleClickReset:{time:i,price:i},axisPressedMouseMove:{time:i,price:i},mouseWheel:i,pinch:i}}else if(t.handleScale!==void 0){let{axisPressedMouseMove:i,axisDoubleClickReset:n}=t.handleScale;Pi(i)&&(t.handleScale.axisPressedMouseMove={time:i,price:i}),Pi(n)&&(t.handleScale.axisDoubleClickReset={time:n,price:n})}let e=t.handleScroll;Pi(e)&&(t.handleScroll={horzTouchDrag:e,vertTouchDrag:e,mouseWheel:e,pressedMouseMove:e})})(s),s}var wo=class{constructor(t,e,i){this.hb=new Map,this.ab=new Map,this.lb=new B,this.ob=new B,this._b=new B,this.dd=new WeakMap,this.ub=new co(e);let n=i===void 0?zt(dl()):it(zt(dl()),ml(i));this.cb=e,this.hv=new ho(t,n,e),this.hv.mw().i((r=>{this.lb.v()&&this.lb.p(this.fb(r()))}),this),this.hv.ww().i((r=>{this.ob.v()&&this.ob.p(this.fb(r()))}),this),this.hv.Bd().i((r=>{this._b.v()&&this._b.p(this.fb(r()))}),this);let o=this.hv.Qt();this.pb=new bo(o,this.hv.bM(),this.cb)}remove(){this.hv.mw().u(this),this.hv.ww().u(this),this.hv.Bd().u(this),this.pb.m(),this.hv.m(),this.hb.clear(),this.ab.clear(),this.lb.m(),this.ob.m(),this._b.m(),this.ub.m()}resize(t,e,i){this.autoSizeActive()||this.hv.wM(t,e,i)}addCustomSeries(t,e={},i=0){let n=(o=>({type:"Custom",isBuiltIn:!1,defaultOptions:{...Nc,...o.defaultOptions()},mb:Oc,wb:o}))(It(t));return this.Mb(n,e,i)}addSeries(t,e={},i=0){return this.Mb(t,e,i)}removeSeries(t){let e=tt(this.hb.get(t)),i=this.ub.if(e);this.hv.Qt().if(e),this.gb(i),this.hb.delete(t),this.ab.delete(e)}Jg(t,e){this.gb(this.ub.og(t,e))}tb(t,e,i){this.gb(this.ub.pg(t,e,i))}ib(t,e){let[i,n]=this.ub.wg(t,e);return i.length!==0&&this.gb(n),i}subscribeClick(t){this.lb.i(t)}unsubscribeClick(t){this.lb._(t)}subscribeCrosshairMove(t){this._b.i(t)}unsubscribeCrosshairMove(t){this._b._(t)}subscribeDblClick(t){this.ob.i(t)}unsubscribeDblClick(t){this.ob._(t)}priceScale(t,e=0){return new hs(this.hv,t,e)}timeScale(){return this.pb}applyOptions(t){this.hv.vr(ml(t))}options(){return this.hv.N()}takeScreenshot(t=!1,e=!1){let i,n;try{e||(i=this.hv.Qt().N().crosshair.mode,this.hv.vr({crosshair:{mode:2}})),n=this.hv.TM(t)}finally{e||i===void 0||this.hv.Qt().vr({crosshair:{mode:i}})}return n}addPane(t=!1){let e=this.hv.Qt().uf();return e.j_(t),this.bb(e)}removePane(t){this.hv.Qt().Ad(t)}swapPanes(t,e){this.hv.Qt().zd(t,e)}autoSizeActive(){return this.hv.CM()}chartElement(){return this.hv.Mv()}panes(){return this.hv.Qt().Gn().map((t=>this.bb(t)))}paneSize(t=0){let e=this.hv.AM(t);return{height:e.height,width:e.width}}setCrosshairPosition(t,e,i){let n=this.hb.get(i);if(n===void 0)return;let o=this.hv.Qt().Ks(n);o!==null&&this.hv.Qt().Gd(t,e,o)}clearCrosshairPosition(){this.hv.Qt().Zd(!0)}horzBehaviour(){return this.cb}Mb(t,e={},i=0){G(t.mb!==void 0),(function(l){if(l===void 0||l.type==="custom")return;let h=l;h.minMove!==void 0&&h.precision===void 0&&(h.precision=Ll(h.minMove))})(e.priceFormat),t.type==="Candlestick"&&(function(l){l.borderColor!==void 0&&(l.borderUpColor=l.borderColor,l.borderDownColor=l.borderColor),l.wickColor!==void 0&&(l.wickUpColor=l.wickColor,l.wickDownColor=l.wickColor)})(e);let n=it(zt(vl),zt(t.defaultOptions),e),o=t.mb,r=new Me(this.hv.Qt(),t.type,n,o,t.wb);this.hv.Qt().Qd(r,i);let a=new vo(r,this,this,this,this.cb,(l=>this.bb(l)));return this.hb.set(a,r),this.ab.set(r,a),a}gb(t){let e=this.hv.Qt();for(let i of t.Y_.keys())i.Ia();e.Xd(t.Et.Dc,t.Et.Sg,t.Et.xg),t.Y_.forEach(((i,n)=>n.ht(i.ue,i.bg))),e.Et().dc(),e.Lc()}Sb(t){return tt(this.ab.get(t))}xb(t){return t!==void 0&&this.ab.has(t)?this.Sb(t):void 0}fb(t){let e=new Map;t.QM.forEach(((o,r)=>{let a=r.bh(),l=Ui(a)(o);if(a!=="Custom")G(wc(l));else{let h=r.cl();G(!h||h(l)===!1)}e.set(this.Sb(r),l)}));let i=this.xb(t.jM),n=t.YM===void 0?void 0:{type:t.YM.ds,sourceKind:t.YM.KM,objectKind:t.YM.GM,series:this.xb(t.YM.Y_),objectId:t.YM.ZM,paneIndex:t.YM.XM};return{time:t.Qr,logical:t.$n,point:t.JM,paneIndex:t.XM,hoveredInfo:n,hoveredSeries:i,hoveredObjectId:t.qM,seriesData:e,sourceEvent:t.tg}}bb(t){let e=this.dd.get(t);return e||(e=new go(this.hv,(i=>this.Sb(i)),t,this),this.dd.set(t,e)),e}};function Kc(s){if(ri(s)){let t=document.getElementById(s);return G(t!==null,`Cannot find element in DOM with id=${s}`),t}return s}function Yc(s,t,e){let i=Kc(s),n=new wo(i,t,e);return t.setOptions(n.options()),n}function zo(s,t){return Yc(s,new os,os.Tf(t))}function Qe(s,t,e,i){return Math.hypot(e-s,i-t)}function Qc(s,t,e,i,n,o,r,a=0){if(t.length===0||i.from>=t.length||i.to<=0)return;let{context:l,horizontalPixelRatio:h,verticalPixelRatio:c}=s,u=t[i.from],d=o(s,u),m=u;if(i.to-i.from<2){let f=n/2;l.beginPath();let g={_t:u._t-f,ut:u.ut},w={_t:u._t+f,ut:u.ut};l.moveTo(g._t*h,g.ut*c),l.lineTo(w._t*h,w.ut*c),r(s,d,g,w)}else{let f=a>0,g=0,w=(x,M)=>{if(r(s,d,m,M),l.beginPath(),d=x,m=M,f){let C=g%a;l.lineDashOffset=C,g=C}},v=m;l.beginPath(),l.moveTo(u._t*h,u.ut*c);for(let x=i.from+1;x<i.to;++x){v=t[x];let M=v._t*h,C=v.ut*c,k=o(s,v);switch(e){case 0:if(l.lineTo(M,C),f){let E=t[x-1],z=E._t*h,_=E.ut*c;g+=Qe(z,_,M,C)}break;case 1:{let E=t[x-1],z=E.ut*c;l.lineTo(M,z),f&&(g+=Math.abs(v._t-E._t)*h),k!==d&&(w(k,v),l.lineTo(M,z)),l.lineTo(M,C),f&&(g+=Math.abs(v.ut-E.ut)*c);break}case 2:{let[E,z]=To(t,x-1,x),_=E._t*h,b=E.ut*c,L=z._t*h,P=z.ut*c;if(l.bezierCurveTo(_,b,L,P,M,C),f){let R=t[x-1],V=R._t*h,q=R.ut*c,K=Qe(V,q,M,C),Y=Qe(V,q,_,b)+Qe(_,b,L,P)+Qe(L,P,M,C);g+=(K+Y)/2}break}}e!==1&&k!==d&&(w(k,v),l.moveTo(M,C))}(m!==v||m===v&&e===1)&&r(s,d,m,v),f&&(l.lineDashOffset=0)}}var fl=6;function cn(s,t){return{_t:s._t-t._t,ut:s.ut-t.ut}}function pl(s,t){return{_t:s._t/t,ut:s.ut/t}}function To(s,t,e){let i=Math.max(0,t-1),n=Math.min(s.length-1,e+1);var o,r;return[(o=s[t],r=pl(cn(s[e],s[i]),fl),{_t:o._t+r._t,ut:o.ut+r.ut}),cn(s[e],pl(cn(s[n],s[t]),fl))]}function Gc(s,t){let e=s.context;e.strokeStyle=t,e.stroke()}var yo=class extends Bt{constructor(){super(...arguments),this.rt=null}ht(t){this.rt=t}et(t){if(this.rt===null)return;let{ot:e,lt:i,Cb:n,yb:o,ct:r,Gt:a,Pb:l}=this.rt;if(i===null)return;let h=t.context;h.lineCap="butt",h.lineWidth=r*t.verticalPixelRatio;let c=ie(h,a);h.lineJoin="round";let u=this.kb.bind(this),d=(function(m){return m.reduce(((f,g)=>f+g),0)})(c);o!==void 0&&Qc(t,e,o,i,n,u,Gc,d),l&&(function(m,f,g,w,v){if(w.to-w.from<=0)return;let{horizontalPixelRatio:x,verticalPixelRatio:M,context:C}=m,k=null,E=Math.max(1,Math.floor(x))%2/2,z=g*M+E;for(let _=w.to-1;_>=w.from;--_){let b=f[_];if(b){let L=v(m,b);L!==k&&(k!==null&&C.fill(),C.beginPath(),C.fillStyle=L,k=L);let P=Math.round(b._t*x)+E,R=b.ut*M;C.moveTo(P,R),C.arc(P,R,z,0,2*Math.PI)}}C.fill()})(t,e,l,i,u)}},xo=class extends yo{kb(t,e){return e.vt}};function gl(s,t,e,i,n){let o=1-n;return o*o*o*s+3*o*o*n*t+3*o*n*n*e+n*n*n*i}function Xc(s,t,e,i,n){if(e===2){let[o,r]=To(i,n-1,n);return[Math.min(s._t,t._t,o._t,r._t),Math.max(s._t,t._t,o._t,r._t)]}return[Math.min(s._t,t._t),Math.max(s._t,t._t)]}function Jc(s,t,e,i,n,o,r,a){switch(n){case 1:{let l=Xe(s,t,e._t,e.ut,i._t,e.ut),h=Xe(s,t,i._t,e.ut,i._t,i.ut),c=Math.min(l,h);return c<=a?c:null}case 2:{let[l,h]=To(o,r-1,r),c=(function(u,d,m){let f=Number.POSITIVE_INFINITY,g=m[0];for(let w=1;w<=12;w++){let v=w/12,x={_t:gl(m[0]._t,m[1]._t,m[2]._t,m[3]._t,v),ut:gl(m[0].ut,m[1].ut,m[2].ut,m[3].ut,v)};f=Math.min(f,Xe(u,d,g._t,g.ut,x._t,x.ut)),g=x}return f})(s,t,[e,l,h,i]);return c<=a?c:null}default:{let l=Xe(s,t,e._t,e.ut,i._t,i.ut);return l<=a?l:null}}}var Co=class extends ls{constructor(t,e){super(t,e,!0)}Og(t,e,i){e.Ic(this.kg,un(this.Tg)),t.Jo(this.kg,i,un(this.Tg))}Tb(t,e){return{wt:t,Mt:e,_t:NaN,ut:NaN}}Lg(){let t=this.ae.Sa();this.kg=this.ae.Ua().Bh().map((e=>{let i;if((e.Gr??1)>1){let n=e.Wt[1],o=e.Wt[2],r=e.Wt[3];i=Math.abs(n-r)>Math.abs(o-r)?n:o}else i=e.Wt[3];return this.Rb(e.$n,i,t)}))}},So=class extends Co{Bg(t,e){let i=this.ae.N();return(function(n,o,r,a,l,h,c,u=0,d=0){if(o===null||o.from>=o.to||n.length===0)return null;let m=Math.max(h/2,c??0)+d,f=Number.POSITIVE_INFINITY;if(c!==void 0){let C=c+d,k=uo(n,r-C,o.from,o.to),E=mo(n,r+C,k,o.to);for(let z=k;z<E;z++){let _=n[z];if(!cl(r,_._t,_._t,c+d))continue;let b=Math.hypot(r-_._t,a-_.ut);b<=c+d&&(f=Math.min(f,b))}}if(o.to-o.from<2){let C=n[o.from],k=Math.max(u/2,m),E=Xe(r,a,C._t-k,C.ut,C._t+k,C.ut);return E<=m&&(f=Math.min(f,E)),Number.isFinite(f)?Wi(f,2,"series-point"):null}let g=Number.POSITIVE_INFINITY,w=uo(n,r-m,o.from,o.to),v=mo(n,r+m,w,o.to),x=Math.max(o.from+1,w),M=Math.min(o.to,v+1);for(let C=x;C<M;C++){let k=n[C-1],E=n[C],[z,_]=Xc(k,E,l,n,C);if(!cl(r,z,_,m))continue;let b=Jc(r,a,k,E,l,n,C,m);b!==null&&(g=Math.min(g,b))}return Number.isFinite(f)?Wi(f,2,"series-point"):Number.isFinite(g)?Wi(g,1,"series-line"):null})(this.kg,this.Tg,t,e,i.lineType,i.lineVisible?i.lineWidth:1,i.pointMarkersVisible?i.pointMarkersRadius||i.lineWidth/2+2:void 0,this.le.Et().ml(),i.hitTestTolerance)}},Mo=class extends So{constructor(){super(...arguments),this.Vg=new xo}Rb(t,e,i){return{...this.Tb(t,e),...i.Sh(t)}}Ng(){let t=this.ae.N(),e={ot:this.kg,Gt:t.lineStyle,yb:t.lineVisible?t.lineType:void 0,ct:t.lineWidth,Pb:t.pointMarkersVisible?t.pointMarkersRadius||t.lineWidth/2+2:void 0,lt:this.Tg,Cb:this.le.Et().ml()};this.Vg.ht(e)}},Ao={type:"Line",isBuiltIn:!0,defaultOptions:{color:"#2196f3",lineStyle:0,lineWidth:3,lineType:0,lineVisible:!0,crosshairMarkerVisible:!0,crosshairMarkerRadius:4,crosshairMarkerBorderColor:"",crosshairMarkerBorderWidth:2,crosshairMarkerBackgroundColor:"",lastPriceAnimation:0,pointMarkersVisible:!1},mb:(s,t)=>new Mo(s,t)};var _v={...vl,color:"#2196f3"};var Tl=["median","mean","min","max","ops","peak_memory"],Al=["overview","trend","comparison"],Zc=["view","metric","x-axis","benchmark","machine","python","memory","theme"],ms=[["--_benched-accent-color","#3e96ff"],["--wa-color-orange-60","#f46a45"],["--wa-color-green-60","#00ac49"],["--wa-color-purple-60","#b678f5"],["--wa-color-pink-60","#e66ba3"],["--wa-color-cyan-60","#00a3c0"],["--wa-color-indigo-60","#808aff"],["--wa-color-yellow-60","#da7e00"],["--wa-color-red-60","#f3676c"]];function fs(s){let t=s.currentTarget.value;return typeof t=="string"?t:""}function Ee(s){return s==null?"\u2014":s.toLocaleString(void 0,{maximumSignificantDigits:6})}function Vt(s){let t=s?.match(/^(\d+)\.(\d+)/);return t?`${t[1]}.${t[2]}`:s??"unknown"}function ps(s){let t=s?.machine.metadata?.memory_gib;return typeof t=="number"&&Number.isFinite(t)?String(t):"unknown"}function Po(s){return s==="unknown"?"Unknown":`${s} GiB`}function ke(s,t){return s===null?new Set(t):new Set(s.split(",").filter(e=>t.includes(e)))}function re(s,t){let e=document.createElement("canvas");e.width=e.height=1,e.hidden=!0,e.style.color=t,s.append(e);let i=e.getContext("2d",{willReadFrequently:!0});i.fillStyle=getComputedStyle(e).color,i.fillRect(0,0,1,1);let[n,o,r,a]=i.getImageData(0,0,1,1).data;return e.remove(),`rgba(${n}, ${o}, ${r}, ${a/255})`}function Pl(s){let t=Math.max(0,...s.filter(Number.isFinite).map(i=>Math.abs(i))),e=t===0?2:Math.min(12,Math.max(0,2-Math.floor(Math.log10(t))));return{type:"price",precision:e,minMove:10**-e}}function $l(s){if(typeof s!="object"||s===null)throw new Error("report must be an object");let t=s;if(t.schema_version!==1)throw new Error(`unsupported report schema version ${String(t.schema_version)}`);if(!Array.isArray(t.runs)||!Array.isArray(t.benchmarks)||!Array.isArray(t.warnings))throw new Error("report is missing runs, benchmarks, or warnings");return t}function Rl(s,t,e){let i=document.createElement("table");i.className="benched-table",i.setAttribute("aria-label",e);let n=i.createTHead().insertRow();for(let r of s){let a=document.createElement("th");a.scope="col",a.textContent=r,n.append(a)}let o=i.createTBody();for(let r of t){let a=o.insertRow();for(let l of r){let h=a.insertCell();h.textContent=l}}return i}var $o=class extends HTMLElement{static get observedAttributes(){return["src","view","metric","benchmark","machine","python","memory","x-axis","hide-controls","data-theme"]}report;charts=new Map;chartResizeObserver;chartVisibilityObserver;chartRenderers=new Map;request;media;themeObserver;inheritedChartStyle;theme="light";handleMediaChange=t=>{this.inheritsTheme()?this.updateInheritedTheme():!this.savedTheme()&&!this.getAttribute("data-theme")&&this.setTheme(t.matches?"dark":"light")};handleThemeChange=t=>{this.inheritsTheme()||this.setTheme(t.detail)};connectedCallback(){this.media=matchMedia("(prefers-color-scheme: dark)"),this.theme=this.preferredTheme(),this.applyTheme(),this.media.addEventListener("change",this.handleMediaChange),window.addEventListener("benched-theme-change",this.handleThemeChange),this.observeInheritedTheme(),this.load()}disconnectedCallback(){this.request?.abort(),this.removeChart(),this.media?.removeEventListener("change",this.handleMediaChange),window.removeEventListener("benched-theme-change",this.handleThemeChange),this.themeObserver?.disconnect()}attributeChangedCallback(t,e,i){if(!(!this.isConnected||e===i))if(t==="src")this.load();else if(t==="data-theme"){let n=this.preferredTheme(),o=n!==this.theme;this.setTheme(n),!o&&this.report&&this.render()}else this.report&&this.render()}set data(t){this.request?.abort(),this.report=$l(t),this.isConnected&&this.render()}get data(){return this.report}get view(){let t=this.getAttribute("view");return t&&Al.includes(t)?t:"overview"}get metric(){let t=this.getAttribute("metric");return t&&Tl.includes(t)?t:"median"}get xAxis(){return this.getAttribute("x-axis")==="time"?"time":"version"}get hiddenControls(){let t=this.getAttribute("hide-controls")?.split(",")??[];return new Set(t.map(e=>e.trim()).filter(e=>Zc.includes(e)))}savedTheme(){try{let t=localStorage.getItem("benched-theme");return t==="light"||t==="dark"?t:null}catch{return null}}preferredTheme(){let t=this.getAttribute("data-theme");return t==="light"||t==="dark"?t:t==="inherit"?this.inheritedTheme():this.savedTheme()??(this.media?.matches?"dark":"light")}inheritsTheme(){return this.getAttribute("data-theme")==="inherit"}inheritedTheme(){let t=this.parentElement??document.documentElement;for(let i=t;i;i=i.parentElement){let n=i.getAttribute("data-theme");if(n==="light"||n==="dark")return n;if(i.classList.contains("dark"))return"dark";if(i.classList.contains("light"))return"light";if(n==="auto"||i.getAttribute("data-mode")==="auto")return this.media?.matches?"dark":"light"}for(let i=t;i;i=i.parentElement){let n=re(i,getComputedStyle(i).backgroundColor).match(/^rgba?\(\s*([\d.]+)[, ]+\s*([\d.]+)[, ]+\s*([\d.]+)(?:[, /]+\s*([\d.]+))?\s*\)$/);if(!n||n[4]!==void 0&&Number(n[4])===0)continue;return Number(n[1])*.2126+Number(n[2])*.7152+Number(n[3])*.0722<128?"dark":"light"}let e=getComputedStyle(t).colorScheme.split(/\s+/);return e[0]==="dark"||e[0]==="light"?e[0]:this.media?.matches?"dark":"light"}observeInheritedTheme(){this.themeObserver?.disconnect(),this.inheritedChartStyle=this.chartStyleSignature(),this.themeObserver=new MutationObserver(()=>{this.inheritsTheme()&&this.updateInheritedTheme()});for(let t=this.parentElement;t;t=t.parentElement)this.themeObserver.observe(t,{attributes:!0,attributeFilter:["class","style","data-theme","data-mode"]})}updateInheritedTheme(){let t=this.inheritedTheme();if(t!==this.theme){this.setTheme(t),this.inheritedChartStyle=this.chartStyleSignature();return}let e=this.chartStyleSignature();e!==this.inheritedChartStyle&&(this.inheritedChartStyle=e,this.report&&this.render())}chartStyleSignature(){let t=getComputedStyle(this);return[t.color,t.getPropertyValue("--benched-text-color"),t.getPropertyValue("--_benched-text-color"),t.getPropertyValue("--_benched-grid-color"),...ms.map(([e])=>t.getPropertyValue(e))].join("\0")}applyTheme(){this.classList.toggle("wa-dark",this.theme==="dark"),this.classList.toggle("wa-light",this.theme==="light"),this.dataset.resolvedTheme=this.theme}setTheme(t){if(!(t!=="light"&&t!=="dark")){if(this.theme===t){this.applyTheme();return}this.theme=t,this.applyTheme(),this.report&&this.render()}}toggleTheme(){let t=this.theme==="dark"?"light":"dark";try{localStorage.setItem("benched-theme",t)}catch{}window.dispatchEvent(new CustomEvent("benched-theme-change",{detail:t}))}async load(){this.request?.abort();let t=this.getAttribute("src");if(!t){this.report=void 0,this.renderMessage("No report data source.");return}this.renderMessage("Loading report\u2026","status");let e=new AbortController;this.request=e;try{let i=await fetch(t,{signal:e.signal});if(!i.ok)throw new Error(`${i.status} ${i.statusText}`);this.report=$l(await i.json()),this.render()}catch(i){if(e.signal.aborted)return;let n=i instanceof Error?i.message:String(i);this.report=void 0,this.renderMessage(`Unable to load report: ${n}`,"alert")}}renderMessage(t,e="status"){this.removeChart();let i=document.createElement("wa-callout");i.className="benched-message",i.setAttribute("appearance",e==="alert"?"accent":"outlined"),i.setAttribute("role",e),i.textContent=t,this.replaceChildren(i)}renderViewMessage(t,e){let i=document.createElement("wa-callout");i.className="benched-message benched-view-message",i.setAttribute("appearance","outlined"),i.setAttribute("role","status"),i.textContent=e,t.replaceChildren(i)}render(){this.removeChart();let t=this.report;if(!t)return;if(t.benchmarks.length===0){this.renderMessage("No benchmark data matches this report.");return}this.innerHTML=`
      <wa-card class="benched-card" appearance="outlined" with-header>
        <div slot="header" class="benched-header">
          <div><strong>Benched report</strong><small></small></div>
          <div class="benched-controls" aria-label="Report controls"></div>
        </div>
        <div class="benched-warnings"></div>
        <section class="benched-view" aria-live="polite"></section>
      </wa-card>
    `;let e=this.querySelector(".benched-header small");e&&(e.textContent=`${t.runs.length} runs \xB7 ${t.benchmarks.length} benchmarks`),this.renderControls(),this.renderWarnings();let i=this.querySelector(".benched-view");i&&(this.view==="overview"&&this.renderOverview(i),this.view==="trend"&&this.renderTrend(i),this.view==="comparison"&&this.renderComparison(i))}select(t,e,i,n){let o=document.createElement("wa-select");o.className=e,o.setAttribute("label",t),o.setAttribute("size","small");for(let[r,a]of i){let l=document.createElement("wa-option");l.setAttribute("value",r),l.textContent=a,o.append(l)}return o.value=n,o}filterPanel(t,e,i,n,o){let r=document.createElement("fieldset");r.className=`benched-filter-panel ${e}`;let a=document.createElement("legend");a.textContent=t;let l=document.createElement("div");for(let[h,c]of i){let u=document.createElement("wa-button"),d=n.has(h);u.setAttribute("size","small"),u.setAttribute("appearance",d?"filled":"outlined"),u.setAttribute("variant",d?"brand":"neutral"),u.setAttribute("aria-pressed",String(d)),u.textContent=c,u.addEventListener("click",()=>{let m=new Set(n);if(m.has(h)){if(m.size===1)return;m.delete(h)}else m.add(h);o(m)}),l.append(u)}return r.append(a,l),r}updateSelectionAttribute(t,e,i){e.size===i.length?this.removeAttribute(t):this.setAttribute(t,i.filter(n=>e.has(n)).join(","))}renderControls(){let t=this.report,e=this.hiddenControls,i=this.querySelector(".benched-controls"),n=[...new Set(t.runs.map(b=>b.machine.id).filter(b=>!!b))].sort(),o=ke(this.getAttribute("machine"),n),r=[...new Set(t.runs.map(b=>Vt(b.environment.python_version)).filter(b=>!!b))].sort(),a=this.getAttribute("python"),l=ke(a?.split(",").map(b=>Vt(b)).join(",")??null,r),h=[...new Set(t.runs.map(b=>ps(b)).filter(b=>b!=="unknown"))].sort((b,L)=>Number(b)-Number(L)),c=ke(this.getAttribute("memory"),h),u=this.visibleBenchmarks(),d=this.getAttribute("benchmark")??"",m=t.benchmarks.find(b=>b.benchmark_id===d&&!u.includes(b)),f=m?[m,...u]:u,g=f.findIndex(b=>b.benchmark_id===d),w=this.select("View","benched-view-select",Al.map(b=>[b,b[0].toUpperCase()+b.slice(1)]),this.view),v=this.select("Metric","benched-metric-select",Tl.map(b=>[b,b]),this.metric),x=this.select("X axis","benched-x-axis-select",[["version","Package version"],["time","Time"]],this.xAxis),M=this.filterPanel("Machine","benched-machine-select",n.map(b=>[b,b]),o,b=>this.updateSelectionAttribute("machine",b,n)),C=this.filterPanel("Python","benched-python-select",r.map(b=>[b,b]),l,b=>this.updateSelectionAttribute("python",b,r)),k=this.filterPanel("Memory","benched-memory-select",h.map(b=>[b,Po(b)]),c,b=>this.updateSelectionAttribute("memory",b,h)),E=this.select("Benchmark","benched-benchmark-select",[["all","All benchmarks"],...f.map((b,L)=>[`benchmark-${L}`,b.name])],g<0?"all":`benchmark-${g}`),z=document.createElement("wa-button");z.className="benched-theme-toggle",z.setAttribute("appearance","plain"),z.setAttribute("size","small"),z.setAttribute("aria-label",`Switch to ${this.theme==="dark"?"light":"dark"} mode`),z.setAttribute("title",`Switch to ${this.theme==="dark"?"light":"dark"} mode`),z.innerHTML=this.theme==="dark"?`<svg data-icon="sun" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"></path>
          </svg>`:`<svg data-icon="moon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"></path>
          </svg>`,E.toggleAttribute("disabled",f.length===0),w.addEventListener("change",b=>this.setAttribute("view",fs(b))),v.addEventListener("change",b=>this.setAttribute("metric",fs(b))),x.addEventListener("change",b=>this.setAttribute("x-axis",fs(b))),E.addEventListener("change",b=>{let L=fs(b),P=f[Number(L.replace("benchmark-",""))];P?this.setAttribute("benchmark",P.benchmark_id):this.removeAttribute("benchmark")}),z.addEventListener("click",()=>this.toggleTheme()),e.has("view")||i.append(w),this.view!=="overview"&&!e.has("metric")&&i.append(v),this.view==="trend"&&!e.has("x-axis")&&i.append(x),e.has("benchmark")||i.append(E),!e.has("theme")&&!this.inheritsTheme()&&i.append(z);let _=document.createElement("div");_.className="benched-filter-panels",e.has("machine")||_.append(M),e.has("python")||_.append(C),h.length>0&&!e.has("memory")&&_.append(k),_.childElementCount>0&&i.append(_),i.childElementCount===0&&i.remove()}renderWarnings(){let t=this.report,e=this.querySelector(".benched-warnings");for(let i of t.warnings){let n=document.createElement("wa-callout");n.setAttribute("appearance","outlined"),n.textContent=i,e.append(n)}}activeMachines(){let t=this.report,e=[...new Set(t.runs.map(i=>i.machine.id).filter(Boolean))];return ke(this.getAttribute("machine"),e)}activePythonVersions(){let t=this.report,e=[...new Set(t.runs.map(o=>Vt(o.environment.python_version)))],n=this.getAttribute("python")?.split(",").map(o=>Vt(o)).join(",");return ke(n??null,e)}activeMemory(){let t=this.report,e=[...new Set(t.runs.map(i=>ps(i)).filter(i=>i!=="unknown"))];return ke(this.getAttribute("memory"),e)}activeRuns(){let t=this.report,e=this.activeMachines(),i=this.activePythonVersions(),n=this.activeMemory(),o=this.hasAttribute("machine"),r=this.hasAttribute("python"),a=this.hasAttribute("memory");return t.runs.filter(l=>(!o||e.has(l.machine.id??""))&&(!r||i.has(Vt(l.environment.python_version)))&&(!a||n.has(ps(l))))}visibleBenchmarks(){let t=this.report;if(!this.hasAttribute("machine")&&!this.hasAttribute("python")&&!this.hasAttribute("memory"))return t.benchmarks;let e=new Set(this.activeRuns().map(i=>i.run_id));return t.benchmarks.filter(i=>i.series.some(n=>e.has(n.run_id)))}activeBenchmark(){let t=this.visibleBenchmarks(),e=this.getAttribute("benchmark");return t.find(i=>i.benchmark_id===e)}displayedBenchmarks(){let t=this.visibleBenchmarks(),e=this.getAttribute("benchmark");if(!e)return t;let i=t.find(n=>n.benchmark_id===e);return i?[i]:[]}points(t){let e=new Set(this.activeRuns().map(i=>i.run_id));return t.series.filter(i=>e.has(i.run_id))}pointsBySeries(t){let e=this.report,i=new Map(e.runs.map(o=>[o.run_id,o])),n=new Map;for(let o of this.points(t)){let r=i.get(o.run_id),a=r?.machine.id??"unknown",l=Vt(r?.environment.python_version),h=ps(r),c=`${a}\0${l}\0${h}`,u=`${a} \xB7 Python ${l}${h==="unknown"?"":` \xB7 ${Po(h)}`}`,d=n.get(c)??{label:u,machine:a,python:l,memory:h,points:[]};d.points.push(o),n.set(c,d)}return[...n.values()].sort((o,r)=>o.label.localeCompare(r.label))}renderOverview(t){let e=this.activeRuns(),i=this.visibleBenchmarks();if(e.length===0||i.length===0){this.renderViewMessage(t,"No benchmark data matches the selected filters.");return}let n=new Set(e.map(u=>u.machine.id).filter(Boolean)),o=new Set(e.map(u=>Vt(u.environment.python_version))),r=[["Runs",String(e.length)],["Benchmarks",String(i.length)],["Machines",String(n.size)],["Python Versions",String(o.size)]],a=document.createElement("div");a.className="benched-summary-grid";for(let[u,d]of r){let m=document.createElement("wa-card"),f=document.createElement("strong"),g=document.createElement("span");f.textContent=d,g.textContent=u,m.append(f,g),a.append(m)}let l=document.createElement("h2");l.textContent="Benchmarks";let h=document.createElement("ul");h.className="benched-benchmark-list";let c=new Map(e.map(u=>[u.run_id,u]));for(let u of i){let d=this.points(u),m=d.map(M=>c.get(M.run_id)).filter(M=>!!M),f=new Set(m.map(M=>M.machine.id)),g=new Set(m.map(M=>Vt(M.environment.python_version))),w=document.createElement("li"),v=document.createElement("a"),x=document.createElement("span");v.href=`#${encodeURIComponent(u.benchmark_id)}`,v.textContent=u.name,v.addEventListener("click",M=>{M.preventDefault(),this.setAttribute("benchmark",u.benchmark_id),this.setAttribute("view","trend")}),x.textContent=`${d.length} points \xB7 ${f.size} machines \xB7 ${g.size} Python versions`,w.append(v,x),h.append(w)}t.append(a,l,h)}renderTrend(t){if(!this.hasAttribute("benchmark")){this.renderTrendMatrix(t);return}let e=this.activeBenchmark();if(!e){this.renderViewMessage(t,"No benchmark data matches the selected filters.");return}let i=this.report,n=new Map(i.runs.map(_=>[_.run_id,_])),o=this.pointsBySeries(e).map(_=>({..._,points:_.points.filter(b=>b.metrics[this.metric]!=null)})).filter(_=>_.points.length>0),r=o.flatMap(_=>_.points);if(r.length===0){this.renderViewMessage(t,`No ${this.metric} data matches the selected filters.`);return}let a=document.createElement("h2");a.textContent=e.name;let l=document.createElement("output");l.className="benched-chart-value",l.setAttribute("aria-live","polite"),l.textContent=o.length===1?`${o[0].label} \xB7 ${this.metric}: ${Ee(o[0].points[o[0].points.length-1]?.metrics[this.metric])} ${e.unit}`:`${o.length} series \xB7 ${this.metric}`;let h=document.createElement("div");h.className="benched-chart-legend",h.setAttribute("aria-label","Chart series");let c=document.createElement("div");c.className="benched-chart",c.setAttribute("aria-label",`${e.name} ${this.metric} by ${this.xAxis==="version"?"package version":"time"}`),t.append(a,l,h,c);let u=getComputedStyle(this),d=re(this,u.getPropertyValue("--_benched-text-color").trim()||u.getPropertyValue("--benched-text-color").trim()||u.color),m=re(this,u.getPropertyValue("--_benched-grid-color").trim()||"#d8dee9"),f=new Map,g=new Map;if(this.xAxis==="version"){let _=r.map(b=>n.get(b.run_id)).filter(b=>!!b).sort((b,L)=>b.started_at.localeCompare(L.started_at));for(let b of _){let L=b.subject.version??b.subject.revision??b.run_id;if(g.has(L))continue;let P=g.size+1;g.set(L,P),f.set(P,L)}}let w=_=>{let b=n.get(_.run_id);if(this.xAxis==="version"){let L=b?.subject.version??b?.subject.revision??_.run_id;return g.get(L)}return Math.floor(Date.parse(b?.started_at??"")/1e3)},v=zo(c,{autoSize:!0,height:480,handleScale:!1,handleScroll:!1,layout:{attributionLogo:!1,background:{type:oi.Solid,color:"transparent"},textColor:d},grid:{vertLines:{color:m},horzLines:{color:m}},localization:this.xAxis==="version"?{timeFormatter:_=>f.get(Number(_))??"unknown"}:void 0,timeScale:this.xAxis==="version"?{tickMarkFormatter:_=>f.get(Number(_))??""}:void 0}),x=Pl(r.map(_=>_.metrics[this.metric])),M=o.map((_,b)=>{let[L,P]=ms[b%ms.length],R=re(this,u.getPropertyValue(L).trim()||P),V=v.addSeries(Ao,{color:R,priceFormat:x,title:_.label}),q=new Map;for(let D of _.points)q.set(w(D),D.metrics[this.metric]);V?.setData([...q].sort(([D],[W])=>Number(D)-Number(W)).map(([D,W])=>({time:D,value:W})));let K=document.createElement("span"),Y=document.createElement("i");return Y.style.backgroundColor=R,K.append(Y,_.label),h.append(K),{line:V,label:_.label}});v.subscribeCrosshairMove(_=>{for(let b of M){if(!b.line)continue;let L=_.seriesData.get(b.line);if(L&&"value"in L){l.textContent=`${b.label} \xB7 ${this.metric}: ${Ee(L.value)} ${e.unit}`;break}}}),this.trackChart(c,v);let C=o.flatMap(_=>_.points.map(b=>{let L=n.get(b.run_id);return{group:_,point:b,run:L}})).sort((_,b)=>(b.run?.started_at??"").localeCompare(_.run?.started_at??"")),k=C.slice(0,100).map(({group:_,point:b,run:L})=>[L?.started_at??b.run_id,L?.subject.version??"\u2014",_.machine,L?.environment.python_version??_.python,Po(_.memory),Ee(b.metrics[this.metric])]),E=document.createElement("details");E.className="benched-exact-values",E.open=C.length<=100;let z=document.createElement("summary");z.textContent=`Recent values (${k.length} of ${C.length})`,E.append(z,Rl(["Run","Package","Machine","Python","Memory",this.metric],k,`${e.name} recent trend values`)),t.append(E)}renderTrendMatrix(t){let e=this.visibleBenchmarks(),i=this.activeRuns();if(i.length===0||e.length===0){this.renderViewMessage(t,"No benchmark data matches the selected filters.");return}let n=document.createElement("h2");n.textContent="Benchmark trends";let o=document.createElement("p");o.className="benched-trend-description",o.textContent=`Each line averages ${this.metric} across selected results at each ${this.xAxis==="version"?"package version":"day"}.`;let r=document.createElement("div");r.className="benched-trend-grid",t.append(n,o,r);let a=new Map(i.map(v=>[v.run_id,v])),l=new Map,h=new Map;if(this.xAxis==="version")for(let v of[...i].sort((x,M)=>x.started_at.localeCompare(M.started_at))){let x=v.subject.version??v.subject.revision??v.run_id;if(h.has(x))continue;let M=h.size+1;h.set(x,M),l.set(M,x)}let c=v=>{let x=a.get(v.run_id);if(this.xAxis==="version"){let C=x?.subject.version??x?.subject.revision??v.run_id;return h.get(C)}let M=Date.parse(x?.started_at??"");return Math.floor(M/864e5)*86400},u=getComputedStyle(this),d=re(this,u.getPropertyValue("--_benched-text-color").trim()||u.getPropertyValue("--benched-text-color").trim()||u.color),m=re(this,u.getPropertyValue("--_benched-grid-color").trim()||"#d8dee9"),[f,g]=ms[0],w=re(this,u.getPropertyValue(f).trim()||g);for(let v of e){let x=new Map,M=this.points(v).filter(L=>L.metrics[this.metric]!=null);if(M.length===0)continue;for(let L of M){let P=c(L),R=x.get(P)??[];R.push(L.metrics[this.metric]),x.set(P,R)}let C=[...x].sort(([L],[P])=>Number(L)-Number(P)).map(([L,P])=>({time:L,value:P.reduce((R,V)=>R+V,0)/P.length})),k=document.createElement("wa-card");k.className="benched-trend-card",k.setAttribute("appearance","outlined"),k.setAttribute("with-header","");let E=document.createElement("div");E.className="benched-trend-card-header",E.setAttribute("slot","header");let z=document.createElement("a");z.href=`#${encodeURIComponent(v.benchmark_id)}`,z.textContent=v.name,z.addEventListener("click",L=>{L.preventDefault(),this.setAttribute("benchmark",v.benchmark_id)});let _=document.createElement("span");_.textContent=`${Ee(C[C.length-1].value)} ${v.unit}`,E.append(z,_);let b=document.createElement("div");b.className="benched-mini-chart",b.setAttribute("aria-label",`${v.name} aggregate ${this.metric} by ${this.xAxis==="version"?"package version":"time"}`),k.append(E,b),r.append(k),this.renderChartWhenVisible(b,()=>{let L=zo(b,{autoSize:!0,height:240,handleScale:!1,handleScroll:!1,layout:{attributionLogo:!1,background:{type:oi.Solid,color:"transparent"},textColor:d},grid:{vertLines:{color:m},horzLines:{color:m}},localization:this.xAxis==="version"?{timeFormatter:R=>l.get(Number(R))??"unknown"}:void 0,timeScale:this.xAxis==="version"?{tickMarkFormatter:R=>l.get(Number(R))??""}:void 0});L.addSeries(Ao,{color:w,priceFormat:Pl(C.map(R=>R.value))}).setData(C),this.trackChart(b,L)})}r.childElementCount===0&&this.renderViewMessage(t,`No ${this.metric} data matches the selected filters.`)}renderComparison(t){let e=this.displayedBenchmarks().flatMap(i=>this.pointsBySeries(i).map(n=>{let o=n.points.map(h=>h.metrics[this.metric]).filter(h=>h!=null),r=o[o.length-2],a=o[o.length-1],l=r==null||a==null||r===0?null:(a-r)/r*100;return[i.name,n.label,Ee(r),Ee(a),l==null?"\u2014":`${l>=0?"+":""}${l.toFixed(2)}%`]}));if(e.length===0){this.renderViewMessage(t,"No benchmark data matches the selected filters.");return}t.append(Rl(["Benchmark","Context",`Previous ${this.metric}`,`Latest ${this.metric}`,"Change"],e,"Latest benchmark comparison"))}trackChart(t,e){this.charts.set(t,e),this.chartResizeObserver??=new ResizeObserver(i=>{for(let n of i)this.charts.get(n.target)?.timeScale().fitContent()}),this.chartResizeObserver.observe(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{this.charts.get(t)===e&&e.timeScale().fitContent()})})}renderChartWhenVisible(t,e){if(!("IntersectionObserver"in window)){e();return}this.chartRenderers.set(t,e),this.chartVisibilityObserver??=new IntersectionObserver(i=>{for(let n of i){let o=n.target;n.isIntersecting?this.charts.has(o)||this.chartRenderers.get(o)?.():this.removeTrackedChart(o)}},{rootMargin:"480px 0px"}),this.chartVisibilityObserver.observe(t)}removeTrackedChart(t){let e=this.charts.get(t);e&&(this.chartResizeObserver?.unobserve(t),e.remove(),this.charts.delete(t))}removeChart(){this.chartVisibilityObserver?.disconnect(),this.chartVisibilityObserver=void 0,this.chartRenderers.clear(),this.chartResizeObserver?.disconnect(),this.chartResizeObserver=void 0;for(let t of this.charts.values())t.remove();this.charts.clear()}};customElements.get("benched-report")||customElements.define("benched-report",$o);export{$o as BenchedReport,Pl as chartPriceFormat};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
lit-html/directive.js:
lit-html/directives/unsafe-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@awesome.me/webawesome/dist/chunks/chunk.LCEGCF5S.js:
@awesome.me/webawesome/dist/chunks/chunk.RPQJAXXR.js:
@awesome.me/webawesome/dist/chunks/chunk.G5ZZIGWB.js:
@awesome.me/webawesome/dist/chunks/chunk.XNTP7DEQ.js:
@awesome.me/webawesome/dist/chunks/chunk.PZAN6FPN.js:
@awesome.me/webawesome/dist/chunks/chunk.7VGCIHDG.js:
@awesome.me/webawesome/dist/chunks/chunk.AOKMSJXD.js:
@awesome.me/webawesome/dist/chunks/chunk.C6MKRB3S.js:
@awesome.me/webawesome/dist/components/callout/callout.js:
@awesome.me/webawesome/dist/chunks/chunk.R7QX4M6R.js:
@awesome.me/webawesome/dist/chunks/chunk.VC3BPUZJ.js:
@awesome.me/webawesome/dist/chunks/chunk.KBXNFZQL.js:
@awesome.me/webawesome/dist/chunks/chunk.RWNXKUCF.js:
@awesome.me/webawesome/dist/chunks/chunk.S35PLDPD.js:
@awesome.me/webawesome/dist/chunks/chunk.M45NRQFW.js:
@awesome.me/webawesome/dist/chunks/chunk.S67PIWQL.js:
@awesome.me/webawesome/dist/chunks/chunk.LXLE4T4D.js:
@awesome.me/webawesome/dist/chunks/chunk.W7A2VLCT.js:
@awesome.me/webawesome/dist/chunks/chunk.EGBUT3HG.js:
@awesome.me/webawesome/dist/chunks/chunk.YDQCS2HK.js:
@awesome.me/webawesome/dist/chunks/chunk.WDIIGUNP.js:
@awesome.me/webawesome/dist/chunks/chunk.O74G5RVH.js:
@awesome.me/webawesome/dist/chunks/chunk.HGBRCPUS.js:
@awesome.me/webawesome/dist/chunks/chunk.KKI7M5DP.js:
@awesome.me/webawesome/dist/chunks/chunk.YPRC5XZF.js:
@awesome.me/webawesome/dist/chunks/chunk.UDRJMWVZ.js:
@awesome.me/webawesome/dist/chunks/chunk.JAAVYFGY.js:
@awesome.me/webawesome/dist/components/button/button.js:
@awesome.me/webawesome/dist/chunks/chunk.ATI2KDM5.js:
@awesome.me/webawesome/dist/chunks/chunk.YKC4SGGJ.js:
@awesome.me/webawesome/dist/components/card/card.js:
@awesome.me/webawesome/dist/chunks/chunk.C3KOHXUM.js:
@awesome.me/webawesome/dist/chunks/chunk.5WATURH2.js:
@awesome.me/webawesome/dist/components/option/option.js:
@awesome.me/webawesome/dist/chunks/chunk.UZWY5NQM.js:
@awesome.me/webawesome/dist/chunks/chunk.DITA2S5A.js:
@awesome.me/webawesome/dist/chunks/chunk.4ZAKP7NY.js:
@awesome.me/webawesome/dist/chunks/chunk.MQODJ75V.js:
@awesome.me/webawesome/dist/chunks/chunk.3NKIHICW.js:
@awesome.me/webawesome/dist/chunks/chunk.PX3HMKF7.js:
@awesome.me/webawesome/dist/chunks/chunk.JTOY5KP3.js:
@awesome.me/webawesome/dist/chunks/chunk.3H2FQERJ.js:
@awesome.me/webawesome/dist/chunks/chunk.GWSUX3V5.js:
@awesome.me/webawesome/dist/chunks/chunk.JPBXG7RE.js:
@awesome.me/webawesome/dist/chunks/chunk.F25QOBDY.js:
@awesome.me/webawesome/dist/chunks/chunk.L6CIKOFQ.js:
@awesome.me/webawesome/dist/chunks/chunk.ZAVDMBWV.js:
@awesome.me/webawesome/dist/chunks/chunk.HPULLNVR.js:
@awesome.me/webawesome/dist/chunks/chunk.4AHPL3WP.js:
@awesome.me/webawesome/dist/chunks/chunk.JS5OA4M6.js:
@awesome.me/webawesome/dist/chunks/chunk.ZWQCGLB5.js:
@awesome.me/webawesome/dist/chunks/chunk.HS5AYC6E.js:
@awesome.me/webawesome/dist/chunks/chunk.UEBQI7VV.js:
@awesome.me/webawesome/dist/components/select/select.js:
  (*! Copyright 2026 Fonticons, Inc. - https://webawesome.com/license *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/class-map.js:
lit-html/directives/if-defined.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/static.js:
lit-html/directive-helpers.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lightweight-charts/dist/lightweight-charts.production.mjs:
  (*!
   * @license
   * TradingView Lightweight Charts™ v5.2.1
   * Copyright (c) 2026 TradingView, Inc.
   * Licensed under Apache License 2.0 https://www.apache.org/licenses/LICENSE-2.0
   *)
*/
//# sourceMappingURL=index.js.map
