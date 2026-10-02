// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.RPQJAXXR.js
var DEPRECATION_MAP = {
  small: "s",
  medium: "m",
  large: "l"
};
var warned = /* @__PURE__ */ new Set();
function warnDeprecatedSize(tagName, value) {
  if (value in DEPRECATION_MAP && !warned.has(`${tagName}:${value}`)) {
    warned.add(`${tagName}:${value}`);
    console.warn(
      `[${tagName}] size="${value}" is deprecated. Use size="${DEPRECATION_MAP[value]}" instead. The long-form value will be removed in the next major version.`
    );
  }
}

// node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t6, e11, o11) {
    if (this._$cssResult$ = true, o11 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t6, this.t = e11;
  }
  get styleSheet() {
    let t6 = this.o;
    const s4 = this.t;
    if (e && void 0 === t6) {
      const e11 = void 0 !== s4 && 1 === s4.length;
      e11 && (t6 = o.get(s4)), void 0 === t6 && ((this.o = t6 = new CSSStyleSheet()).replaceSync(this.cssText), e11 && o.set(s4, t6));
    }
    return t6;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t6) => new n("string" == typeof t6 ? t6 : t6 + "", void 0, s);
var i = (t6, ...e11) => {
  const o11 = 1 === t6.length ? t6[0] : e11.reduce((e12, s4, o12) => e12 + ((t7) => {
    if (true === t7._$cssResult$) return t7.cssText;
    if ("number" == typeof t7) return t7;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t7 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t6[o12 + 1], t6[0]);
  return new n(o11, t6, s);
};
var S = (s4, o11) => {
  if (e) s4.adoptedStyleSheets = o11.map((t6) => t6 instanceof CSSStyleSheet ? t6 : t6.styleSheet);
  else for (const e11 of o11) {
    const o12 = document.createElement("style"), n6 = t.litNonce;
    void 0 !== n6 && o12.setAttribute("nonce", n6), o12.textContent = e11.cssText, s4.appendChild(o12);
  }
};
var c = e ? (t6) => t6 : (t6) => t6 instanceof CSSStyleSheet ? ((t7) => {
  let e11 = "";
  for (const s4 of t7.cssRules) e11 += s4.cssText;
  return r(e11);
})(t6) : t6;

// node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t6, s4) => t6;
var u = { toAttribute(t6, s4) {
  switch (s4) {
    case Boolean:
      t6 = t6 ? l : null;
      break;
    case Object:
    case Array:
      t6 = null == t6 ? t6 : JSON.stringify(t6);
  }
  return t6;
}, fromAttribute(t6, s4) {
  let i8 = t6;
  switch (s4) {
    case Boolean:
      i8 = null !== t6;
      break;
    case Number:
      i8 = null === t6 ? null : Number(t6);
      break;
    case Object:
    case Array:
      try {
        i8 = JSON.parse(t6);
      } catch (t7) {
        i8 = null;
      }
  }
  return i8;
} };
var f = (t6, s4) => !i2(t6, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
  static addInitializer(t6) {
    this._$Ei(), (this.l ??= []).push(t6);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t6, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t6) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t6, s4), !s4.noAccessor) {
      const i8 = /* @__PURE__ */ Symbol(), h4 = this.getPropertyDescriptor(t6, i8, s4);
      void 0 !== h4 && e2(this.prototype, t6, h4);
    }
  }
  static getPropertyDescriptor(t6, s4, i8) {
    const { get: e11, set: r8 } = h(this.prototype, t6) ?? { get() {
      return this[s4];
    }, set(t7) {
      this[s4] = t7;
    } };
    return { get: e11, set(s5) {
      const h4 = e11?.call(this);
      r8?.call(this, s5), this.requestUpdate(t6, h4, i8);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t6) {
    return this.elementProperties.get(t6) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t6 = n2(this);
    t6.finalize(), void 0 !== t6.l && (this.l = [...t6.l]), this.elementProperties = new Map(t6.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t7 = this.properties, s4 = [...r2(t7), ...o2(t7)];
      for (const i8 of s4) this.createProperty(i8, t7[i8]);
    }
    const t6 = this[Symbol.metadata];
    if (null !== t6) {
      const s4 = litPropertyMetadata.get(t6);
      if (void 0 !== s4) for (const [t7, i8] of s4) this.elementProperties.set(t7, i8);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t7, s4] of this.elementProperties) {
      const i8 = this._$Eu(t7, s4);
      void 0 !== i8 && this._$Eh.set(i8, t7);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i8 = [];
    if (Array.isArray(s4)) {
      const e11 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e11) i8.unshift(c(s5));
    } else void 0 !== s4 && i8.push(c(s4));
    return i8;
  }
  static _$Eu(t6, s4) {
    const i8 = s4.attribute;
    return false === i8 ? void 0 : "string" == typeof i8 ? i8 : "string" == typeof t6 ? t6.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t6) => this.enableUpdating = t6), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t6) => t6(this));
  }
  addController(t6) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t6), void 0 !== this.renderRoot && this.isConnected && t6.hostConnected?.();
  }
  removeController(t6) {
    this._$EO?.delete(t6);
  }
  _$E_() {
    const t6 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i8 of s4.keys()) this.hasOwnProperty(i8) && (t6.set(i8, this[i8]), delete this[i8]);
    t6.size > 0 && (this._$Ep = t6);
  }
  createRenderRoot() {
    const t6 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t6, this.constructor.elementStyles), t6;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t6) => t6.hostConnected?.());
  }
  enableUpdating(t6) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t6) => t6.hostDisconnected?.());
  }
  attributeChangedCallback(t6, s4, i8) {
    this._$AK(t6, i8);
  }
  _$ET(t6, s4) {
    const i8 = this.constructor.elementProperties.get(t6), e11 = this.constructor._$Eu(t6, i8);
    if (void 0 !== e11 && true === i8.reflect) {
      const h4 = (void 0 !== i8.converter?.toAttribute ? i8.converter : u).toAttribute(s4, i8.type);
      this._$Em = t6, null == h4 ? this.removeAttribute(e11) : this.setAttribute(e11, h4), this._$Em = null;
    }
  }
  _$AK(t6, s4) {
    const i8 = this.constructor, e11 = i8._$Eh.get(t6);
    if (void 0 !== e11 && this._$Em !== e11) {
      const t7 = i8.getPropertyOptions(e11), h4 = "function" == typeof t7.converter ? { fromAttribute: t7.converter } : void 0 !== t7.converter?.fromAttribute ? t7.converter : u;
      this._$Em = e11;
      const r8 = h4.fromAttribute(s4, t7.type);
      this[e11] = r8 ?? this._$Ej?.get(e11) ?? r8, this._$Em = null;
    }
  }
  requestUpdate(t6, s4, i8, e11 = false, h4) {
    if (void 0 !== t6) {
      const r8 = this.constructor;
      if (false === e11 && (h4 = this[t6]), i8 ??= r8.getPropertyOptions(t6), !((i8.hasChanged ?? f)(h4, s4) || i8.useDefault && i8.reflect && h4 === this._$Ej?.get(t6) && !this.hasAttribute(r8._$Eu(t6, i8)))) return;
      this.C(t6, s4, i8);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t6, s4, { useDefault: i8, reflect: e11, wrapped: h4 }, r8) {
    i8 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t6) && (this._$Ej.set(t6, r8 ?? s4 ?? this[t6]), true !== h4 || void 0 !== r8) || (this._$AL.has(t6) || (this.hasUpdated || i8 || (s4 = void 0), this._$AL.set(t6, s4)), true === e11 && this._$Em !== t6 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t6));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t7) {
      Promise.reject(t7);
    }
    const t6 = this.scheduleUpdate();
    return null != t6 && await t6, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t8, s5] of this._$Ep) this[t8] = s5;
        this._$Ep = void 0;
      }
      const t7 = this.constructor.elementProperties;
      if (t7.size > 0) for (const [s5, i8] of t7) {
        const { wrapped: t8 } = i8, e11 = this[s5];
        true !== t8 || this._$AL.has(s5) || void 0 === e11 || this.C(s5, void 0, i8, e11);
      }
    }
    let t6 = false;
    const s4 = this._$AL;
    try {
      t6 = this.shouldUpdate(s4), t6 ? (this.willUpdate(s4), this._$EO?.forEach((t7) => t7.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t6 = false, this._$EM(), s5;
    }
    t6 && this._$AE(s4);
  }
  willUpdate(t6) {
  }
  _$AE(t6) {
    this._$EO?.forEach((t7) => t7.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t6)), this.updated(t6);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t6) {
    return true;
  }
  update(t6) {
    this._$Eq &&= this._$Eq.forEach((t7) => this._$ET(t7, this[t7])), this._$EM();
  }
  updated(t6) {
  }
  firstUpdated(t6) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ??= []).push("2.1.2");

// node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t6) => t6;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t6) => t6 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t6) => null === t6 || "object" != typeof t6 && "function" != typeof t6;
var u2 = Array.isArray;
var d2 = (t6) => u2(t6) || "function" == typeof t6?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t6) => (i8, ...s4) => ({ _$litType$: t6, strings: i8, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t6, i8) {
  if (!u2(t6) || !t6.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i8) : i8;
}
var N = (t6, i8) => {
  const s4 = t6.length - 1, e11 = [];
  let n6, l6 = 2 === i8 ? "<svg>" : 3 === i8 ? "<math>" : "", c6 = v;
  for (let i9 = 0; i9 < s4; i9++) {
    const s5 = t6[i9];
    let a5, u5, d4 = -1, f4 = 0;
    for (; f4 < s5.length && (c6.lastIndex = f4, u5 = c6.exec(s5), null !== u5); ) f4 = c6.lastIndex, c6 === v ? "!--" === u5[1] ? c6 = _ : void 0 !== u5[1] ? c6 = m : void 0 !== u5[2] ? (y2.test(u5[2]) && (n6 = RegExp("</" + u5[2], "g")), c6 = p2) : void 0 !== u5[3] && (c6 = p2) : c6 === p2 ? ">" === u5[0] ? (c6 = n6 ?? v, d4 = -1) : void 0 === u5[1] ? d4 = -2 : (d4 = c6.lastIndex - u5[2].length, a5 = u5[1], c6 = void 0 === u5[3] ? p2 : '"' === u5[3] ? $ : g) : c6 === $ || c6 === g ? c6 = p2 : c6 === _ || c6 === m ? c6 = v : (c6 = p2, n6 = void 0);
    const x3 = c6 === p2 && t6[i9 + 1].startsWith("/>") ? " " : "";
    l6 += c6 === v ? s5 + r3 : d4 >= 0 ? (e11.push(a5), s5.slice(0, d4) + h2 + s5.slice(d4) + o3 + x3) : s5 + o3 + (-2 === d4 ? i9 : x3);
  }
  return [V(t6, l6 + (t6[s4] || "<?>") + (2 === i8 ? "</svg>" : 3 === i8 ? "</math>" : "")), e11];
};
var S2 = class _S {
  constructor({ strings: t6, _$litType$: i8 }, e11) {
    let r8;
    this.parts = [];
    let l6 = 0, a5 = 0;
    const u5 = t6.length - 1, d4 = this.parts, [f4, v3] = N(t6, i8);
    if (this.el = _S.createElement(f4, e11), P.currentNode = this.el.content, 2 === i8 || 3 === i8) {
      const t7 = this.el.content.firstChild;
      t7.replaceWith(...t7.childNodes);
    }
    for (; null !== (r8 = P.nextNode()) && d4.length < u5; ) {
      if (1 === r8.nodeType) {
        if (r8.hasAttributes()) for (const t7 of r8.getAttributeNames()) if (t7.endsWith(h2)) {
          const i9 = v3[a5++], s4 = r8.getAttribute(t7).split(o3), e12 = /([.?@])?(.*)/.exec(i9);
          d4.push({ type: 1, index: l6, name: e12[2], strings: s4, ctor: "." === e12[1] ? I : "?" === e12[1] ? L : "@" === e12[1] ? z : H }), r8.removeAttribute(t7);
        } else t7.startsWith(o3) && (d4.push({ type: 6, index: l6 }), r8.removeAttribute(t7));
        if (y2.test(r8.tagName)) {
          const t7 = r8.textContent.split(o3), i9 = t7.length - 1;
          if (i9 > 0) {
            r8.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i9; s4++) r8.append(t7[s4], c3()), P.nextNode(), d4.push({ type: 2, index: ++l6 });
            r8.append(t7[i9], c3());
          }
        }
      } else if (8 === r8.nodeType) if (r8.data === n3) d4.push({ type: 2, index: l6 });
      else {
        let t7 = -1;
        for (; -1 !== (t7 = r8.data.indexOf(o3, t7 + 1)); ) d4.push({ type: 7, index: l6 }), t7 += o3.length - 1;
      }
      l6++;
    }
  }
  static createElement(t6, i8) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t6, s4;
  }
};
function M(t6, i8, s4 = t6, e11) {
  if (i8 === E) return i8;
  let h4 = void 0 !== e11 ? s4._$Co?.[e11] : s4._$Cl;
  const o11 = a2(i8) ? void 0 : i8._$litDirective$;
  return h4?.constructor !== o11 && (h4?._$AO?.(false), void 0 === o11 ? h4 = void 0 : (h4 = new o11(t6), h4._$AT(t6, s4, e11)), void 0 !== e11 ? (s4._$Co ??= [])[e11] = h4 : s4._$Cl = h4), void 0 !== h4 && (i8 = M(t6, h4._$AS(t6, i8.values), h4, e11)), i8;
}
var R = class {
  constructor(t6, i8) {
    this._$AV = [], this._$AN = void 0, this._$AD = t6, this._$AM = i8;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t6) {
    const { el: { content: i8 }, parts: s4 } = this._$AD, e11 = (t6?.creationScope ?? l2).importNode(i8, true);
    P.currentNode = e11;
    let h4 = P.nextNode(), o11 = 0, n6 = 0, r8 = s4[0];
    for (; void 0 !== r8; ) {
      if (o11 === r8.index) {
        let i9;
        2 === r8.type ? i9 = new k(h4, h4.nextSibling, this, t6) : 1 === r8.type ? i9 = new r8.ctor(h4, r8.name, r8.strings, this, t6) : 6 === r8.type && (i9 = new Z(h4, this, t6)), this._$AV.push(i9), r8 = s4[++n6];
      }
      o11 !== r8?.index && (h4 = P.nextNode(), o11++);
    }
    return P.currentNode = l2, e11;
  }
  p(t6) {
    let i8 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t6, s4, i8), i8 += s4.strings.length - 2) : s4._$AI(t6[i8])), i8++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t6, i8, s4, e11) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t6, this._$AB = i8, this._$AM = s4, this.options = e11, this._$Cv = e11?.isConnected ?? true;
  }
  get parentNode() {
    let t6 = this._$AA.parentNode;
    const i8 = this._$AM;
    return void 0 !== i8 && 11 === t6?.nodeType && (t6 = i8.parentNode), t6;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t6, i8 = this) {
    t6 = M(this, t6, i8), a2(t6) ? t6 === A || null == t6 || "" === t6 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t6 !== this._$AH && t6 !== E && this._(t6) : void 0 !== t6._$litType$ ? this.$(t6) : void 0 !== t6.nodeType ? this.T(t6) : d2(t6) ? this.k(t6) : this._(t6);
  }
  O(t6) {
    return this._$AA.parentNode.insertBefore(t6, this._$AB);
  }
  T(t6) {
    this._$AH !== t6 && (this._$AR(), this._$AH = this.O(t6));
  }
  _(t6) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t6 : this.T(l2.createTextNode(t6)), this._$AH = t6;
  }
  $(t6) {
    const { values: i8, _$litType$: s4 } = t6, e11 = "number" == typeof s4 ? this._$AC(t6) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e11) this._$AH.p(i8);
    else {
      const t7 = new R(e11, this), s5 = t7.u(this.options);
      t7.p(i8), this.T(s5), this._$AH = t7;
    }
  }
  _$AC(t6) {
    let i8 = C.get(t6.strings);
    return void 0 === i8 && C.set(t6.strings, i8 = new S2(t6)), i8;
  }
  k(t6) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i8 = this._$AH;
    let s4, e11 = 0;
    for (const h4 of t6) e11 === i8.length ? i8.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i8[e11], s4._$AI(h4), e11++;
    e11 < i8.length && (this._$AR(s4 && s4._$AB.nextSibling, e11), i8.length = e11);
  }
  _$AR(t6 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t6 !== this._$AB; ) {
      const s5 = i3(t6).nextSibling;
      i3(t6).remove(), t6 = s5;
    }
  }
  setConnected(t6) {
    void 0 === this._$AM && (this._$Cv = t6, this._$AP?.(t6));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t6, i8, s4, e11, h4) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t6, this.name = i8, this._$AM = e11, this.options = h4, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t6, i8 = this, s4, e11) {
    const h4 = this.strings;
    let o11 = false;
    if (void 0 === h4) t6 = M(this, t6, i8, 0), o11 = !a2(t6) || t6 !== this._$AH && t6 !== E, o11 && (this._$AH = t6);
    else {
      const e12 = t6;
      let n6, r8;
      for (t6 = h4[0], n6 = 0; n6 < h4.length - 1; n6++) r8 = M(this, e12[s4 + n6], i8, n6), r8 === E && (r8 = this._$AH[n6]), o11 ||= !a2(r8) || r8 !== this._$AH[n6], r8 === A ? t6 = A : t6 !== A && (t6 += (r8 ?? "") + h4[n6 + 1]), this._$AH[n6] = r8;
    }
    o11 && !e11 && this.j(t6);
  }
  j(t6) {
    t6 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t6 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t6) {
    this.element[this.name] = t6 === A ? void 0 : t6;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t6) {
    this.element.toggleAttribute(this.name, !!t6 && t6 !== A);
  }
};
var z = class extends H {
  constructor(t6, i8, s4, e11, h4) {
    super(t6, i8, s4, e11, h4), this.type = 5;
  }
  _$AI(t6, i8 = this) {
    if ((t6 = M(this, t6, i8, 0) ?? A) === E) return;
    const s4 = this._$AH, e11 = t6 === A && s4 !== A || t6.capture !== s4.capture || t6.once !== s4.once || t6.passive !== s4.passive, h4 = t6 !== A && (s4 === A || e11);
    e11 && this.element.removeEventListener(this.name, this, s4), h4 && this.element.addEventListener(this.name, this, t6), this._$AH = t6;
  }
  handleEvent(t6) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t6) : this._$AH.handleEvent(t6);
  }
};
var Z = class {
  constructor(t6, i8, s4) {
    this.element = t6, this.type = 6, this._$AN = void 0, this._$AM = i8, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t6) {
    M(this, t6);
  }
};
var j = { M: h2, P: o3, A: n3, C: 1, L: N, R, D: d2, V: M, I: k, H, N: L, U: z, B: I, F: Z };
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.3");
var D = (t6, i8, s4) => {
  const e11 = s4?.renderBefore ?? i8;
  let h4 = e11._$litPart$;
  if (void 0 === h4) {
    const t7 = s4?.renderBefore ?? null;
    e11._$litPart$ = h4 = new k(i8.insertBefore(c3(), t7), t7, void 0, s4 ?? {});
  }
  return h4._$AI(t6), h4;
};

// node_modules/.pnpm/lit-element@4.2.2/node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t6 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t6.firstChild, t6;
  }
  update(t6) {
    const r8 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t6), this._$Do = D(r8, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ??= []).push("4.2.2");

// node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/is-server.js
var o5 = false;

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.G5ZZIGWB.js
var size_styles_default = i`
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
`;

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.LCEGCF5S.js
var callout_styles_default = i`
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
`;

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.XNTP7DEQ.js
var variants_styles_default = i`
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
`;

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.PZAN6FPN.js
function watch(propertyName, options) {
  const resolvedOptions = {
    waitUntilFirstUpdate: false,
    ...options
  };
  return (proto, decoratedFnName) => {
    const { update: update2 } = proto;
    const watchedProperties = Array.isArray(propertyName) ? propertyName : [propertyName];
    proto.update = function(changedProps) {
      watchedProperties.forEach((property) => {
        const key = property;
        if (changedProps.has(key)) {
          const oldValue = changedProps.get(key);
          const newValue = this[key];
          if (oldValue !== newValue) {
            if (!resolvedOptions.waitUntilFirstUpdate || this.hasUpdated) {
              this[decoratedFnName](oldValue, newValue);
            }
          }
        }
      });
      update2.call(this, changedProps);
    };
  };
}

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.7VGCIHDG.js
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i8 = decorators.length - 1, decorator; i8 >= 0; i8--)
    if (decorator = decorators[i8])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);

// node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/custom-element.js
var t3 = (t6) => (e11, o11) => {
  void 0 !== o11 ? o11.addInitializer(() => {
    customElements.define(t6, e11);
  }) : customElements.define(t6, e11);
};

// node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/property.js
var o6 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t6 = o6, e11, r8) => {
  const { kind: n6, metadata: i8 } = r8;
  let s4 = globalThis.litPropertyMetadata.get(i8);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i8, s4 = /* @__PURE__ */ new Map()), "setter" === n6 && ((t6 = Object.create(t6)).wrapped = true), s4.set(r8.name, t6), "accessor" === n6) {
    const { name: o11 } = r8;
    return { set(r9) {
      const n7 = e11.get.call(this);
      e11.set.call(this, r9), this.requestUpdate(o11, n7, t6, true, r9);
    }, init(e12) {
      return void 0 !== e12 && this.C(o11, void 0, t6, e12), e12;
    } };
  }
  if ("setter" === n6) {
    const { name: o11 } = r8;
    return function(r9) {
      const n7 = this[o11];
      e11.call(this, r9), this.requestUpdate(o11, n7, t6, true, r9);
    };
  }
  throw Error("Unsupported decorator location: " + n6);
};
function n4(t6) {
  return (e11, o11) => "object" == typeof o11 ? r4(t6, e11, o11) : ((t7, e12, o12) => {
    const r8 = e12.hasOwnProperty(o12);
    return e12.constructor.createProperty(o12, t7), r8 ? Object.getOwnPropertyDescriptor(e12, o12) : void 0;
  })(t6, e11, o11);
}

// node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/state.js
function r5(r8) {
  return n4({ ...r8, state: true, attribute: false });
}

// node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/base.js
var e4 = (e11, t6, c6) => (c6.configurable = true, c6.enumerable = true, Reflect.decorate && "object" != typeof t6 && Object.defineProperty(e11, t6, c6), c6);

// node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/query.js
function e5(e11, r8) {
  return (n6, s4, i8) => {
    const o11 = (t6) => t6.renderRoot?.querySelector(e11) ?? null;
    if (r8) {
      const { get: e12, set: r9 } = "object" == typeof s4 ? n6 : i8 ?? /* @__PURE__ */ (() => {
        const t6 = /* @__PURE__ */ Symbol();
        return { get() {
          return this[t6];
        }, set(e13) {
          this[t6] = e13;
        } };
      })();
      return e4(n6, s4, { get() {
        let t6 = e12.call(this);
        return void 0 === t6 && (t6 = o11(this), (null !== t6 || this.hasUpdated) && r9.call(this, t6)), t6;
      } });
    }
    return e4(n6, s4, { get() {
      return o11(this);
    } });
  };
}

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.AOKMSJXD.js
var host_styles_default = i`
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
`;
var HAS_ENDING_COLON = /;\s+$/;
function camelToKebab(str) {
  return str.replace(/[A-Z]/g, (c6) => `-${c6.toLowerCase()}`);
}
function buildStyleAttribute(options) {
  const { property: property2, value, element } = options;
  if (value) {
    let style = element.getAttribute("style") || "";
    if (style) {
      if (!style.match(HAS_ENDING_COLON)) {
        style += ";";
      }
      style += " ";
    }
    const str = `${property2}: ${value}`;
    if (style.includes(str)) {
      return;
    }
    return `${style}${str};`;
  }
  return null;
}
var _hasRecordedInitialProperties;
var WebAwesomeElement = class extends i4 {
  constructor() {
    super();
    __privateAdd(this, _hasRecordedInitialProperties, false);
    this.initialReflectedProperties = /* @__PURE__ */ new Map();
    this.didSSR = o5 || Boolean(this.shadowRoot);
    this.customStates = {
      /** Adds or removes the specified custom state. */
      set: (customState, active) => {
        if (!Boolean(this.internals?.states)) return;
        try {
          if (active) {
            this.internals.states.add(customState);
          } else {
            this.internals.states.delete(customState);
          }
        } catch (e11) {
          if (String(e11).includes("must start with '--'")) {
            console.error("Your browser implements an outdated version of CustomStateSet. Consider using a polyfill");
          } else {
            throw e11;
          }
        }
      },
      /** Determines whether or not the element currently has the specified state. */
      has: (customState) => {
        if (!Boolean(this.internals?.states)) return false;
        try {
          return this.internals.states.has(customState);
        } catch {
          return false;
        }
      }
    };
    try {
      this.internals = this.attachInternals();
    } catch {
      console.error("Element internals are not supported in your browser. Consider using a polyfill");
    }
    this.customStates.set("wa-defined", true);
    let Self = this.constructor;
    for (let [property2, spec] of Self.elementProperties) {
      if (spec.default === "inherit" && spec.initial !== void 0 && typeof property2 === "string") {
        this.customStates.set(`initial-${property2}-${spec.initial}`, true);
      }
    }
  }
  /** Prepends host styles to the component's styles. */
  static get styles() {
    const styles = Array.isArray(this.css) ? this.css : this.css ? [this.css] : [];
    return [host_styles_default, ...styles];
  }
  connectedCallback() {
    super.connectedCallback();
    if (!this.didSSR) {
      this.shadowRoot?.prepend(
        document.createComment(
          ` Web Awesome: https://webawesome.com/docs/components/${this.localName.replace("wa-", "")} `
        )
      );
    }
    if (this.didSSR) {
      this.updateComplete.then(() => {
        this.shadowRoot?.prepend(
          document.createComment(
            ` Web Awesome: https://webawesome.com/docs/components/${this.localName.replace("wa-", "")} `
          )
        );
      });
    }
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (!__privateGet(this, _hasRecordedInitialProperties)) {
      this.constructor.elementProperties.forEach(
        (obj, prop) => {
          if (obj.reflect && this[prop] != null) {
            this.initialReflectedProperties.set(prop, this[prop]);
          }
        }
      );
      __privateSet(this, _hasRecordedInitialProperties, true);
    }
    super.attributeChangedCallback(name, oldValue, newValue);
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    this.initialReflectedProperties.forEach((value, prop) => {
      if (changedProperties.has(prop) && this[prop] == null) {
        this[prop] = value;
      }
    });
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    if (this.didSSR) {
      this.shadowRoot?.querySelectorAll("slot").forEach((slotElement) => {
        slotElement.dispatchEvent(new Event("slotchange", { bubbles: true, composed: false, cancelable: false }));
      });
    }
  }
  update(changedProperties) {
    try {
      super.update(changedProperties);
    } catch (e11) {
      if (this.didSSR && !this.hasUpdated) {
        const event = new Event("lit-hydration-error", { bubbles: true, composed: true, cancelable: false });
        event.error = e11;
        this.dispatchEvent(event);
      }
      throw e11;
    }
  }
  /**
   * @internal
   * Internal way to set styles across both client and server
   */
  setStyle(property2, value) {
    if (!this.style) {
      const str = buildStyleAttribute({
        // because this is going to be serialized to an HTML style attribute, need to transform the casing.
        property: camelToKebab(property2),
        value,
        element: this
      });
      if (str) {
        this.setAttribute("style", str);
      }
      return;
    }
    this.style[property2] = value;
  }
  /**
   * @internal
   * Internal way to set a CSS custom property across both client and server.
   */
  setStyleProperty(property2, value) {
    if (!this.style) {
      const str = buildStyleAttribute({
        // because this is going to be serialized to an HTML style attribute, need to transform the casing.
        property: property2,
        value,
        element: this
      });
      if (str) {
        this.setAttribute("style", str);
      }
      return;
    }
    this.style.setProperty(property2, value);
  }
  /**
   * @internal Given a native event, this function cancels it and dispatches it again from the host element using the desired
   * event options.
   */
  relayNativeEvent(event, eventOptions) {
    event.stopImmediatePropagation();
    this.dispatchEvent(
      new event.constructor(event.type, {
        ...event,
        ...eventOptions
      })
    );
  }
};
_hasRecordedInitialProperties = /* @__PURE__ */ new WeakMap();
__decorateClass([
  n4()
], WebAwesomeElement.prototype, "dir", 2);
__decorateClass([
  n4()
], WebAwesomeElement.prototype, "lang", 2);
__decorateClass([
  n4({ type: Boolean, reflect: true, attribute: "did-ssr" })
], WebAwesomeElement.prototype, "didSSR", 2);

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.4DBVVTNI.js
var WaCallout = class extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.variant = "brand";
    this.size = "m";
  }
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  render() {
    return b2`
      <div part="icon">
        <slot name="icon"></slot>
      </div>

      <div part="message">
        <slot></slot>
      </div>
    `;
  }
};
WaCallout.css = [callout_styles_default, variants_styles_default, size_styles_default];
__decorateClass([
  n4({ reflect: true })
], WaCallout.prototype, "variant", 2);
__decorateClass([
  n4({ reflect: true })
], WaCallout.prototype, "appearance", 2);
__decorateClass([
  n4({ reflect: true })
], WaCallout.prototype, "size", 2);
__decorateClass([
  watch("size")
], WaCallout.prototype, "handleSizeChange", 1);
WaCallout = __decorateClass([
  t3("wa-callout")
], WaCallout);

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.R7QX4M6R.js
var MirrorValidator = () => {
  return {
    checkValidity(element) {
      const formControl = element.input;
      const validity = {
        message: "",
        isValid: true,
        invalidKeys: []
      };
      if (!formControl) {
        return validity;
      }
      let isValid = true;
      if ("checkValidity" in formControl) {
        isValid = formControl.checkValidity();
      }
      if (isValid) {
        return validity;
      }
      validity.isValid = false;
      if ("validationMessage" in formControl) {
        validity.message = formControl.validationMessage;
      }
      if (!("validity" in formControl)) {
        validity.invalidKeys.push("customError");
        return validity;
      }
      for (const key in formControl.validity) {
        if (key === "valid") {
          continue;
        }
        const checkedKey = key;
        if (formControl.validity[checkedKey]) {
          validity.invalidKeys.push(checkedKey);
        }
      }
      return validity;
    }
  };
};

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.VC3BPUZJ.js
var WaInvalidEvent = class extends Event {
  constructor() {
    super("wa-invalid", { bubbles: true, cancelable: false, composed: true });
  }
};

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.KBXNFZQL.js
var CustomErrorValidator = () => {
  return {
    observedAttributes: ["custom-error"],
    checkValidity(element) {
      const validity = {
        message: "",
        isValid: true,
        invalidKeys: []
      };
      if (element.customError) {
        validity.message = element.customError;
        validity.isValid = false;
        validity.invalidKeys = ["customError"];
      }
      return validity;
    }
  };
};
var WebAwesomeFormAssociatedElement = class extends WebAwesomeElement {
  constructor() {
    super();
    this.name = null;
    this.disabled = false;
    this.required = false;
    this.assumeInteractionOn = ["input"];
    this.validators = [];
    this.valueHasChanged = false;
    this.hasInteracted = false;
    this.customError = null;
    this.emittedEvents = [];
    this.emitInvalid = (e11) => {
      if (e11.target !== this) return;
      this.hasInteracted = true;
      this.dispatchEvent(new WaInvalidEvent());
    };
    this.handleInteraction = (event) => {
      const emittedEvents = this.emittedEvents;
      if (!emittedEvents.includes(event.type)) {
        emittedEvents.push(event.type);
      }
      if (emittedEvents.length === this.assumeInteractionOn?.length) {
        this.hasInteracted = true;
      }
    };
    if ("addEventListener" in this) {
      this.addEventListener("invalid", this.emitInvalid);
    }
  }
  /**
   * Validators are static because they have `observedAttributes`, essentially attributes to "watch"
   * for changes. Whenever these attributes change, we want to be notified and update the validator.
   */
  static get validators() {
    return o5 ? [] : [CustomErrorValidator()];
  }
  // Append all Validator "observedAttributes" into the "observedAttributes" so they can run.
  static get observedAttributes() {
    const parentAttrs = new Set(super.observedAttributes || []);
    for (const validator of this.validators) {
      if (!validator.observedAttributes) {
        continue;
      }
      for (const attr of validator.observedAttributes) {
        parentAttrs.add(attr);
      }
    }
    return [...parentAttrs];
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.didSSR && !this.hasUpdated) {
      this.updateComplete.then(() => {
        this.updateValidity();
      });
    } else {
      this.updateValidity();
    }
    this.assumeInteractionOn.forEach((event) => {
      this.addEventListener?.(event, this.handleInteraction);
    });
  }
  firstUpdated(...args) {
    super.firstUpdated(...args);
    this.updateValidity();
  }
  willUpdate(changedProperties) {
    if (!o5 && changedProperties.has("customError")) {
      if (!this.customError) {
        this.customError = null;
      }
      this.setCustomValidity(this.customError || "");
    }
    if (changedProperties.has("value") || changedProperties.has("disabled") || changedProperties.has("defaultValue")) {
      const value = this.value;
      this.updateFormValue(value);
    }
    if (changedProperties.has("disabled")) {
      this.customStates.set("disabled", this.disabled);
      if (this.hasAttribute("disabled") || !o5 && !this.matches(":disabled")) {
        this.toggleAttribute("disabled", this.disabled);
      }
    }
    super.willUpdate(changedProperties);
    if (this.didSSR && !this.hasUpdated) {
      this.updateComplete.then(() => this.updateValidity());
    } else {
      this.updateValidity();
    }
  }
  /**
   * @internal
   */
  updateFormValue(value) {
    if (Array.isArray(value)) {
      if (this.name) {
        const formData = new FormData();
        for (const val of value) {
          formData.append(this.name, val);
        }
        this.setValue(formData, formData);
      }
    } else {
      this.setValue(value, value);
    }
  }
  get labels() {
    return this.internals.labels;
  }
  getForm() {
    return this.internals.form;
  }
  /**
   * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
   * to place the form control outside of a form and associate it with the form that has this `id`. The form must be in
   * the same document or shadow root for this to work.
   */
  set form(val) {
    if (val) {
      this.setAttribute("form", val);
    } else {
      this.removeAttribute("form");
    }
  }
  get form() {
    return this.internals.form;
  }
  get validity() {
    return this.internals.validity;
  }
  // Not sure if this supports `novalidate`. Will need to test.
  get willValidate() {
    return this.internals.willValidate;
  }
  get validationMessage() {
    return this.internals.validationMessage;
  }
  checkValidity() {
    this.updateValidity();
    return this.internals.checkValidity();
  }
  reportValidity() {
    this.updateValidity();
    this.hasInteracted = true;
    return this.internals.reportValidity();
  }
  /**
   * Override this to change where constraint validation popups are anchored.
   */
  get validationTarget() {
    return this.input || void 0;
  }
  setValidity(...args) {
    const flags = args[0];
    const message = args[1];
    let anchor = args[2];
    if (!anchor) {
      anchor = this.validationTarget;
    }
    this.internals.setValidity(flags, message, anchor || void 0);
    this.requestUpdate("validity");
    this.setCustomStates();
  }
  setCustomStates() {
    const required = Boolean(this.required);
    const isValid = this.internals.validity.valid;
    const hasInteracted = this.hasInteracted;
    this.customStates.set("required", required);
    this.customStates.set("optional", !required);
    this.customStates.set("invalid", !isValid);
    this.customStates.set("valid", isValid);
    this.customStates.set("user-invalid", !isValid && hasInteracted);
    this.customStates.set("user-valid", isValid && hasInteracted);
  }
  /**
   * Do not use this when creating a "Validator". This is intended for end users of components.
   * We track manually defined custom errors so we don't clear them on accident in our validators.
   *
   */
  setCustomValidity(message) {
    if (!message) {
      this.customError = null;
      this.setValidity({});
      return;
    }
    this.customError = message;
    this.setValidity({ customError: true }, message, this.validationTarget);
  }
  formResetCallback() {
    this.resetValidity();
    this.hasInteracted = false;
    this.valueHasChanged = false;
    this.emittedEvents = [];
    this.updateValidity();
  }
  formDisabledCallback(isDisabled) {
    this.disabled = isDisabled;
    this.updateValidity();
  }
  /**
   * Called when the browser is trying to restore element’s state to state in which case reason is "restore", or when
   * the browser is trying to fulfill autofill on behalf of user in which case reason is "autocomplete". In the case of
   * "restore", state is a string, File, or FormData object previously set as the second argument to setFormValue.
   */
  formStateRestoreCallback(state, reason) {
    if (this.didSSR && !this.hasUpdated) {
      this.updateComplete.then(() => {
        this.value = state;
        if (reason === "restore") {
          this.resetValidity();
        }
        this.updateValidity();
      });
    } else {
      this.value = state;
      if (reason === "restore") {
        this.resetValidity();
      }
      this.updateValidity();
    }
  }
  setValue(...args) {
    const [value, state] = args;
    this.internals.setFormValue(value, state);
  }
  get allValidators() {
    const staticValidators = this.constructor.validators || [];
    const validators = this.validators || [];
    return [...staticValidators, ...validators];
  }
  /**
   * Reset validity is a way of removing manual custom errors and native validation.
   */
  resetValidity() {
    this.setCustomValidity("");
    this.setValidity({});
  }
  updateValidity() {
    if (this.disabled || this.hasAttribute("disabled") || !this.willValidate) {
      this.resetValidity();
      return;
    }
    const validators = this.allValidators;
    if (!validators?.length) {
      return;
    }
    const flags = {
      // Don't trust custom errors from the Browser. Safari breaks the spec.
      customError: Boolean(this.customError)
    };
    const formControl = this.validationTarget || this.input || void 0;
    let finalMessage = "";
    for (const validator of validators) {
      const { isValid, message, invalidKeys } = validator.checkValidity(this);
      if (isValid) {
        continue;
      }
      if (!finalMessage) {
        finalMessage = message;
      }
      if (invalidKeys?.length >= 0) {
        invalidKeys.forEach((str) => flags[str] = true);
      }
    }
    if (!finalMessage) {
      finalMessage = this.validationMessage;
    }
    this.setValidity(flags, finalMessage, formControl);
  }
};
WebAwesomeFormAssociatedElement.formAssociated = true;
__decorateClass([
  n4({ reflect: true })
], WebAwesomeFormAssociatedElement.prototype, "name", 2);
__decorateClass([
  n4({ type: Boolean })
], WebAwesomeFormAssociatedElement.prototype, "disabled", 2);
__decorateClass([
  n4({ state: true, attribute: false })
], WebAwesomeFormAssociatedElement.prototype, "valueHasChanged", 2);
__decorateClass([
  n4({ state: true, attribute: false })
], WebAwesomeFormAssociatedElement.prototype, "hasInteracted", 2);
__decorateClass([
  n4({ attribute: "custom-error", reflect: true })
], WebAwesomeFormAssociatedElement.prototype, "customError", 2);
__decorateClass([
  n4({ attribute: false, state: true, type: Object })
], WebAwesomeFormAssociatedElement.prototype, "validity", 1);

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.RWNXKUCF.js
var HasSlotController = class {
  constructor(host, ...slotNames) {
    this.slotNames = [];
    this.handleSlotChange = (event) => {
      const slot = event.target;
      if (this.slotNames.includes("[default]") && !slot.name || slot.name && this.slotNames.includes(slot.name)) {
        this.host.requestUpdate();
      }
    };
    (this.host = host).addController(this);
    this.slotNames = slotNames;
  }
  hasDefaultSlot() {
    if (!this.host.childNodes) {
      return false;
    }
    return [...this.host.childNodes].some((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
        return true;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node;
        const tagName = el.tagName.toLowerCase();
        if (tagName === "wa-visually-hidden") {
          return false;
        }
        if (!el.hasAttribute("slot")) {
          return true;
        }
      }
      return false;
    });
  }
  hasNamedSlot(name) {
    return this.host.querySelector?.(`:scope > [slot="${name}"]`) !== null;
  }
  /**
   * @param slotName     - Name of the slot to look for
   * @param propertyName - Generally we infer via `withHeader` property on the host, but in cases where its different, you can specify a manual property name.
   */
  test(slotName, propertyName) {
    if (propertyName && this.host.didSSR && !this.host.hasUpdated) {
      return Boolean(this.host[propertyName]);
    }
    return slotName === "[default]" ? this.hasDefaultSlot() : this.hasNamedSlot(slotName);
  }
  hostConnected() {
    const shadowRoot = this.host.shadowRoot;
    if (shadowRoot && "addEventListener" in shadowRoot) {
      shadowRoot.addEventListener("slotchange", this.handleSlotChange);
    }
  }
  hostDisconnected() {
    const shadowRoot = this.host.shadowRoot;
    if (shadowRoot && "removeEventListener" in shadowRoot) {
      shadowRoot.removeEventListener("slotchange", this.handleSlotChange);
    }
  }
};

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.3CFUTVFX.js
var button_styles_default = i`
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
      visibility: hidden;
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
`;

// node_modules/.pnpm/@shoelace-style+localize@3.2.3/node_modules/@shoelace-style/localize/dist/index.js
var connectedElements = /* @__PURE__ */ new Set();
var translations = /* @__PURE__ */ new Map();
var fallback;
var documentDirection = "ltr";
var documentLanguage = "en";
var isClient = typeof MutationObserver !== "undefined" && typeof document !== "undefined" && typeof document.documentElement !== "undefined";
if (isClient) {
  const documentElementObserver = new MutationObserver(update);
  documentDirection = document.documentElement.dir || "ltr";
  documentLanguage = document.documentElement.lang || navigator.language;
  documentElementObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["dir", "lang"]
  });
}
function registerTranslation(...translation2) {
  translation2.map((t6) => {
    const code = t6.$code.toLowerCase();
    if (translations.has(code)) {
      translations.set(code, Object.assign(Object.assign({}, translations.get(code)), t6));
    } else {
      translations.set(code, t6);
    }
    if (!fallback) {
      fallback = t6;
    }
  });
  update();
}
function update() {
  if (isClient) {
    documentDirection = document.documentElement.dir || "ltr";
    documentLanguage = document.documentElement.lang || navigator.language;
  }
  [...connectedElements.keys()].map((el) => {
    if (typeof el.requestUpdate === "function") {
      el.requestUpdate();
    }
  });
}
var LocalizeController = class {
  constructor(host) {
    this.host = host;
    this.host.addController(this);
  }
  hostConnected() {
    connectedElements.add(this.host);
  }
  hostDisconnected() {
    connectedElements.delete(this.host);
  }
  dir() {
    return `${this.host.dir || documentDirection}`.toLowerCase();
  }
  lang() {
    const lang = `${this.host.lang || documentLanguage}`.toLowerCase().replace(/_/g, "-");
    try {
      new Intl.Locale(lang);
      return lang;
    } catch (_a) {
      return fallback ? fallback.$code.toLowerCase() : "en";
    }
  }
  getTranslationData(lang) {
    var _a, _b;
    let locale;
    try {
      locale = new Intl.Locale(lang.replace(/_/g, "-"));
    } catch (_c) {
      return { locale: void 0, language: "", region: "", primary: void 0, secondary: void 0 };
    }
    const language = locale.language.toLowerCase();
    const region = (_b = (_a = locale.region) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : "";
    const primary = translations.get(`${language}-${region}`);
    const secondary = translations.get(language);
    return { locale, language, region, primary, secondary };
  }
  exists(key, options) {
    var _a;
    const { primary, secondary } = this.getTranslationData((_a = options.lang) !== null && _a !== void 0 ? _a : this.lang());
    options = Object.assign({ includeFallback: false }, options);
    if (primary && primary[key] || secondary && secondary[key] || options.includeFallback && fallback && fallback[key]) {
      return true;
    }
    return false;
  }
  term(key, ...args) {
    const { primary, secondary } = this.getTranslationData(this.lang());
    let term;
    if (primary && primary[key]) {
      term = primary[key];
    } else if (secondary && secondary[key]) {
      term = secondary[key];
    } else if (fallback && fallback[key]) {
      term = fallback[key];
    } else {
      console.error(`No translation found for: ${String(key)}`);
      return String(key);
    }
    if (typeof term === "function") {
      return term(...args);
    }
    return term;
  }
  date(dateToFormat, options) {
    dateToFormat = new Date(dateToFormat);
    return new Intl.DateTimeFormat(this.lang(), options).format(dateToFormat);
  }
  number(numberToFormat, options) {
    numberToFormat = Number(numberToFormat);
    return isNaN(numberToFormat) ? "" : new Intl.NumberFormat(this.lang(), options).format(numberToFormat);
  }
  relativeTime(value, unit, options) {
    return new Intl.RelativeTimeFormat(this.lang(), options).format(value, unit);
  }
};

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.KQHZRDPB.js
var translation = {
  $code: "en",
  $name: "English",
  $dir: "ltr",
  am: "AM",
  autosizeColumn: "Autosize column",
  captions: "Captions",
  carousel: "Carousel",
  chooseDate: "Choose date",
  chooseDecade: "Choose decade",
  chooseMonth: "Choose month",
  chooseTime: "Choose time",
  chooseYear: "Choose year",
  clearEntry: "Clear entry",
  clearFilter: "Clear filter",
  clearSort: "Clear sort",
  close: "Close",
  closeCalendar: "Close calendar",
  closeTimeInput: "Close time picker",
  collapseRow: "Collapse row",
  columnMenu: "Column options",
  columnMovedToPosition: (label, position, total) => `${label} moved to position ${position} of ${total}`,
  columns: "Columns",
  compactPageXOfY: (page, total) => `${page} of ${total}`,
  copied: "Copied",
  copy: "Copy",
  createOption: (value) => `Create "${value}"`,
  currentlyPlaying: "currently playing",
  currentValue: "Current value",
  date: "Date",
  datePickerKeyboardHelp: "Use arrow keys to change values; press Alt+Down Arrow to open the calendar.",
  day: "Day",
  dayPeriod: "AM/PM",
  decrement: "Decrement",
  deselectAllRows: "Deselect all rows",
  dropFileHere: "Drop file here or click to browse",
  dropFilesHere: "Drop files here or click to browse",
  empty: "Empty",
  endDate: "End date",
  enterFullscreen: "Enter fullscreen",
  error: "Error",
  exitFullscreen: "Exit fullscreen",
  expandRow: "Expand row",
  filterByColumn: (label) => `Filter by ${label}`,
  filterFrom: "From",
  filterMax: "Max",
  filterMin: "Min",
  filterTo: "To",
  firstPage: "First page",
  goToSlide: (slide, count) => `Go to slide ${slide} of ${count}`,
  hideColumn: "Hide column",
  hidePassword: "Hide password",
  hour: "Hour",
  incompleteDate: "Enter a valid date.",
  increment: "Increment",
  jumpBackwardX: (count) => `Jump back ${count} pages`,
  jumpForwardX: (count) => `Jump forward ${count} pages`,
  lastPage: "Last page",
  loading: "Loading",
  minute: "Minute",
  month: "Month",
  moreOptions: "More Options",
  mute: "Mute",
  nextDecade: "Next decade",
  nextMonth: "Next month",
  nextPage: "Next page",
  nextSlide: "Next slide",
  nextVideo: "Next Video",
  nextYear: "Next year",
  noData: "No data",
  noResults: "No matching results",
  now: "Now",
  numCharacters: (num) => {
    if (num === 1) return "1 character";
    return `${num} characters`;
  },
  numCharactersRemaining: (num) => {
    if (num === 1) return "1 character remaining";
    return `${num} characters remaining`;
  },
  numOptionsSelected: (num) => {
    if (num === 0) return "No options selected";
    if (num === 1) return "1 option selected";
    return `${num} options selected`;
  },
  numRowsCopied: (num) => num === 1 ? "1 row copied" : `${num} rows copied`,
  numRowsSelected: (num) => num === 1 ? "1 row selected" : `${num} rows selected`,
  pageXOfY: (page, total) => `Page ${page} of ${total}`,
  pagination: "Pagination",
  pause: "Pause",
  pauseAnimation: "Pause animation",
  pictureInPicture: "Picture in picture",
  pinLeft: "Pin left",
  pinRight: "Pin right",
  play: "Play",
  playAnimation: "Play animation",
  playbackSpeed: "Playback speed",
  playlist: "Playlist",
  pm: "PM",
  previousDecade: "Previous decade",
  previousMonth: "Previous month",
  previousPage: "Previous page",
  previousSlide: "Previous slide",
  previousVideo: "Previous video",
  previousYear: "Previous year",
  progress: "Progress",
  rangeTooLong: (max2) => {
    if (max2 === 1) return "Select a range no longer than 1 day";
    return `Select a range no longer than ${max2} days`;
  },
  rangeTooShort: (min2) => {
    if (min2 === 1) return "Select a range at least 1 day long";
    return `Select a range at least ${min2} days long`;
  },
  readonly: "Read-only",
  remove: "Remove",
  resetColumns: "Reset columns",
  resize: "Resize",
  resizeColumn: "Resize column",
  rowsPerPage: "Rows per page",
  scrollableRegion: "Scrollable region",
  scrollToEnd: "Scroll to end",
  scrollToStart: "Scroll to start",
  search: "Search",
  second: "Second",
  seek: "Seek",
  seekProgress: (current, duration) => `${current} of ${duration}`,
  selectAColorFromTheScreen: "Select a color from the screen",
  selectAllRows: "Select all rows",
  selected: "Selected",
  selectedDateLabel: (date) => `Selected: ${date}`,
  selectedRangeLabel: (range) => `Selected range: ${range}`,
  selectGroup: "Select group",
  selectionCleared: "Selection cleared",
  selectRow: "Select row",
  showingNofMRows: (shown, total) => `Showing ${shown} of ${total} rows`,
  showingXtoYofZ: (start, end, total) => `${start}\u2013${end} of ${total}`,
  showPassword: "Show password",
  slideNum: (slide) => `Slide ${slide}`,
  sortAscending: "Sort ascending",
  sortColumn: "Sort column",
  sortDescending: "Sort descending",
  startDate: "Start date",
  time: "Time",
  timeInputKeyboardHelp: "Use arrow keys to change values; press Alt+Down Arrow to open the time picker.",
  today: "Today",
  toggleColorFormat: "Toggle color format",
  unmute: "Unmute",
  unpin: "Unpin",
  unpinColumn: "Unpin column",
  videoPlayer: "Video player",
  volume: "Volume",
  year: "Year",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out"
};
registerTranslation(translation);
var en_default = translation;

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.56IHH3HP.js
var LocalizeController2 = class extends LocalizeController {
  lang() {
    if (this.host.didSSR && !this.host.hasUpdated) {
      return this.host.lang || "en";
    }
    return super.lang();
  }
};
registerTranslation(en_default);

// node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directive.js
var t4 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
var e6 = (t6) => (...e11) => ({ _$litDirective$: t6, values: e11 });
var i5 = class {
  constructor(t6) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t6, e11, i8) {
    this._$Ct = t6, this._$AM = e11, this._$Ci = i8;
  }
  _$AS(t6, e11) {
    return this.update(t6, e11);
  }
  update(t6, e11) {
    return this.render(...e11);
  }
};

// node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directives/class-map.js
var e7 = e6(class extends i5 {
  constructor(t6) {
    if (super(t6), t6.type !== t4.ATTRIBUTE || "class" !== t6.name || t6.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(t6) {
    return " " + Object.keys(t6).filter((s4) => t6[s4]).join(" ") + " ";
  }
  update(s4, [i8]) {
    if (void 0 === this.st) {
      this.st = /* @__PURE__ */ new Set(), void 0 !== s4.strings && (this.nt = new Set(s4.strings.join(" ").split(/\s/).filter((t6) => "" !== t6)));
      for (const t6 in i8) i8[t6] && !this.nt?.has(t6) && this.st.add(t6);
      return this.render(i8);
    }
    const r8 = s4.element.classList;
    for (const t6 of this.st) t6 in i8 || (r8.remove(t6), this.st.delete(t6));
    for (const t6 in i8) {
      const s5 = !!i8[t6];
      s5 === this.st.has(t6) || this.nt?.has(t6) || (s5 ? (r8.add(t6), this.st.add(t6)) : (r8.remove(t6), this.st.delete(t6)));
    }
    return E;
  }
});

// node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directives/if-defined.js
var o7 = (o11) => o11 ?? A;

// node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/static.js
var a3 = /* @__PURE__ */ Symbol.for("");
var o8 = (t6) => {
  if (t6?.r === a3) return t6?._$litStatic$;
};
var i6 = (t6, ...r8) => ({ _$litStatic$: r8.reduce((r9, e11, a5) => r9 + ((t7) => {
  if (void 0 !== t7._$litStatic$) return t7._$litStatic$;
  throw Error(`Value passed to 'literal' function must be a 'literal' result: ${t7}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`);
})(e11) + t6[a5 + 1], t6[0]), r: a3 });
var l3 = /* @__PURE__ */ new Map();
var n5 = (t6) => (r8, ...e11) => {
  const a5 = e11.length;
  let s4, i8;
  const n6 = [], u5 = [];
  let c6, $4 = 0, f4 = false;
  for (; $4 < a5; ) {
    for (c6 = r8[$4]; $4 < a5 && void 0 !== (i8 = e11[$4], s4 = o8(i8)); ) c6 += s4 + r8[++$4], f4 = true;
    $4 !== a5 && u5.push(i8), n6.push(c6), $4++;
  }
  if ($4 === a5 && n6.push(r8[a5]), f4) {
    const t7 = n6.join("$$lit$$");
    void 0 === (r8 = l3.get(t7)) && (n6.raw = n6, l3.set(t7, r8 = n6)), e11 = u5;
  }
  return t6(r8, ...e11);
};
var u3 = n5(b2);
var c4 = n5(w);
var $2 = n5(T);

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.AFPI375Q.js
var WaButton = class extends WebAwesomeFormAssociatedElement {
  constructor() {
    super(...arguments);
    this.assumeInteractionOn = ["click"];
    this.hasSlotController = new HasSlotController(this, "[default]", "start", "end");
    this.localize = new LocalizeController2(this);
    this.invalid = false;
    this.isIconButton = false;
    this.title = "";
    this.variant = "neutral";
    this.appearance = "accent";
    this.size = "m";
    this.withCaret = false;
    this.withStart = false;
    this.withEnd = false;
    this.disabled = false;
    this.loading = false;
    this.pill = false;
    this.type = "button";
  }
  static get validators() {
    return [...super.validators, MirrorValidator()];
  }
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  constructLightDOMButton() {
    const button = document.createElement("button");
    for (const attribute of this.attributes) {
      if (attribute.name === "style") {
        continue;
      }
      button.setAttribute(attribute.name, attribute.value);
    }
    button.type = this.type;
    button.style.position = "absolute !important";
    button.style.width = "0 !important";
    button.style.height = "0 !important";
    button.style.clipPath = "inset(50%) !important";
    button.style.overflow = "hidden !important";
    button.style.whiteSpace = "nowrap !important";
    if (this.name) {
      button.name = this.name;
    }
    button.value = this.value || "";
    return button;
  }
  handleClick(event) {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (this.type !== "submit" && this.type !== "reset") {
      return;
    }
    const form = this.getForm();
    if (!form) return;
    const lightDOMButton = this.constructLightDOMButton();
    this.parentElement?.append(lightDOMButton);
    lightDOMButton.click();
    lightDOMButton.remove();
  }
  handleInvalid() {
    this.dispatchEvent(new WaInvalidEvent());
  }
  handleLabelSlotChange() {
    const nodes = this.labelSlot.assignedNodes({ flatten: true });
    let hasIconLabel = false;
    let hasIcon = false;
    let hasText = false;
    let hasOtherElements = false;
    [...nodes].forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node;
        if (element.localName === "wa-icon") {
          hasIcon = true;
          if (!hasIconLabel) hasIconLabel = element.label !== void 0;
        } else {
          hasOtherElements = true;
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim() || "";
        if (text.length > 0) {
          hasText = true;
        }
      }
    });
    this.isIconButton = hasIcon && !hasText && !hasOtherElements;
    this.customStates.set("icon-button", this.isIconButton);
    if (this.isIconButton && !hasIconLabel) {
      console.warn(
        'Icon buttons must have a label for screen readers. Add <wa-icon label="..."> to remove this warning.',
        this
      );
    }
  }
  isButton() {
    return this.href ? false : true;
  }
  isLink() {
    return this.href ? true : false;
  }
  handleDisabledChange() {
    this.customStates.set("disabled", this.disabled);
    this.updateValidity();
  }
  handleHrefChange() {
    this.customStates.set("link", this.isLink());
  }
  handleLoadingChange() {
    this.customStates.set("loading", this.loading);
  }
  // eslint-disable-next-line
  setValue(..._args) {
  }
  /** Simulates a click on the button. */
  click() {
    this.button.click();
  }
  /** Sets focus on the button. */
  focus(options) {
    this.button.focus(options);
  }
  /** Removes focus from the button. */
  blur() {
    this.button.blur();
  }
  render() {
    const isLink = this.isLink();
    const tag = isLink ? i6`a` : i6`button`;
    return u3`
      <${tag}
        part="base button"
        class=${e7({
      button: true,
      caret: this.withCaret,
      disabled: this.disabled,
      loading: this.loading,
      rtl: this.localize.dir() === "rtl",
      "has-label": this.hasSlotController.test("[default]"),
      "has-start": this.hasSlotController.test("start", "withStart"),
      "has-end": this.hasSlotController.test("end", "withEnd"),
      "is-icon-button": this.isIconButton
    })}
        ?disabled=${o7(isLink ? void 0 : this.disabled)}
        type=${o7(isLink ? void 0 : this.type)}
        title=${this.title}
        name=${o7(isLink ? void 0 : this.name)}
        value=${o7(isLink ? void 0 : this.value)}
        href=${o7(isLink ? this.href : void 0)}
        target=${o7(isLink ? this.target : void 0)}
        download=${o7(isLink ? this.download : void 0)}
        rel=${o7(isLink && this.rel ? this.rel : void 0)}
        role=${o7(isLink ? void 0 : "button")}
        aria-disabled=${o7(isLink && this.disabled ? "true" : void 0)}
        tabindex=${this.disabled ? "-1" : "0"}
        @invalid=${this.isButton() ? this.handleInvalid : null}
        @click=${this.handleClick}
      >
        <slot name="start" part="start" class="start"></slot>
        <slot part="label" class="label" @slotchange=${this.handleLabelSlotChange}></slot>
        <slot name="end" part="end" class="end"></slot>
        ${this.withCaret ? u3`
                <wa-icon part="caret" class="caret" library="system" name="chevron-down" variant="solid"></wa-icon>
              ` : ""}
        ${this.loading ? u3`<wa-spinner part="spinner"></wa-spinner>` : ""}
      </${tag}>
    `;
  }
};
WaButton.shadowRootOptions = { ...WebAwesomeFormAssociatedElement.shadowRootOptions, delegatesFocus: true };
WaButton.css = [button_styles_default, variants_styles_default, size_styles_default];
__decorateClass([
  e5(".button")
], WaButton.prototype, "button", 2);
__decorateClass([
  e5("slot:not([name])")
], WaButton.prototype, "labelSlot", 2);
__decorateClass([
  r5()
], WaButton.prototype, "invalid", 2);
__decorateClass([
  r5()
], WaButton.prototype, "isIconButton", 2);
__decorateClass([
  n4()
], WaButton.prototype, "title", 2);
__decorateClass([
  n4({ reflect: true })
], WaButton.prototype, "variant", 2);
__decorateClass([
  n4({ reflect: true })
], WaButton.prototype, "appearance", 2);
__decorateClass([
  n4({ reflect: true })
], WaButton.prototype, "size", 2);
__decorateClass([
  watch("size")
], WaButton.prototype, "handleSizeChange", 1);
__decorateClass([
  n4({ attribute: "with-caret", type: Boolean, reflect: true })
], WaButton.prototype, "withCaret", 2);
__decorateClass([
  n4({ attribute: "with-start", type: Boolean })
], WaButton.prototype, "withStart", 2);
__decorateClass([
  n4({ attribute: "with-end", type: Boolean })
], WaButton.prototype, "withEnd", 2);
__decorateClass([
  n4({ type: Boolean })
], WaButton.prototype, "disabled", 2);
__decorateClass([
  n4({ type: Boolean, reflect: true })
], WaButton.prototype, "loading", 2);
__decorateClass([
  n4({ type: Boolean, reflect: true })
], WaButton.prototype, "pill", 2);
__decorateClass([
  n4()
], WaButton.prototype, "type", 2);
__decorateClass([
  n4({ reflect: true })
], WaButton.prototype, "name", 2);
__decorateClass([
  n4({ reflect: true })
], WaButton.prototype, "value", 2);
__decorateClass([
  n4({ reflect: true })
], WaButton.prototype, "href", 2);
__decorateClass([
  n4()
], WaButton.prototype, "target", 2);
__decorateClass([
  n4()
], WaButton.prototype, "rel", 2);
__decorateClass([
  n4()
], WaButton.prototype, "download", 2);
__decorateClass([
  n4({ attribute: "formaction" })
], WaButton.prototype, "formAction", 2);
__decorateClass([
  n4({ attribute: "formenctype" })
], WaButton.prototype, "formEnctype", 2);
__decorateClass([
  n4({ attribute: "formmethod" })
], WaButton.prototype, "formMethod", 2);
__decorateClass([
  n4({ attribute: "formnovalidate", type: Boolean })
], WaButton.prototype, "formNoValidate", 2);
__decorateClass([
  n4({ attribute: "formtarget" })
], WaButton.prototype, "formTarget", 2);
__decorateClass([
  watch("disabled", { waitUntilFirstUpdate: true })
], WaButton.prototype, "handleDisabledChange", 1);
__decorateClass([
  watch("href")
], WaButton.prototype, "handleHrefChange", 1);
__decorateClass([
  watch("loading", { waitUntilFirstUpdate: true })
], WaButton.prototype, "handleLoadingChange", 1);
WaButton = __decorateClass([
  t3("wa-button")
], WaButton);
WaButton.disableWarning?.("change-in-update");

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.W7A2VLCT.js
var spinner_styles_default = i`
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
`;

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.DVA7QY5T.js
var WaSpinner = class extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController2(this);
  }
  render() {
    return b2`
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
    `;
  }
};
WaSpinner.css = spinner_styles_default;
WaSpinner = __decorateClass([
  t3("wa-spinner")
], WaSpinner);

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.YDQCS2HK.js
var WaErrorEvent = class extends Event {
  constructor() {
    super("wa-error", { bubbles: true, cancelable: false, composed: true });
  }
};

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.WDIIGUNP.js
var WaLoadEvent = class extends Event {
  constructor() {
    super("wa-load", { bubbles: true, cancelable: false, composed: true });
  }
};

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.O74G5RVH.js
var icon_styles_default = i`
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
`;

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.HGBRCPUS.js
var iconPath = "";
var kitCode = "";
function getIconPath() {
  return iconPath.replace(/\/$/, "");
}
function setKitCode(code) {
  kitCode = code;
}
function getKitCode() {
  if (!kitCode) {
    const el = document.querySelector("[data-fa-kit-code]");
    if (el) {
      setKitCode(el.getAttribute("data-fa-kit-code") || "");
    }
  }
  return kitCode;
}

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.KKI7M5DP.js
var FA_VERSION = "7.3.0";
function getIconFolder(_name, family, variant) {
  let folder = "solid";
  if (family === "chisel") {
    folder = "chisel-regular";
  }
  if (family === "etch") {
    folder = "etch-solid";
  }
  if (family === "graphite") {
    folder = "graphite-thin";
  }
  if (family === "jelly") {
    folder = "jelly-regular";
    if (variant === "duo-regular") folder = "jelly-duo-regular";
    if (variant === "fill-regular") folder = "jelly-fill-regular";
  }
  if (family === "jelly-duo") {
    folder = "jelly-duo-regular";
  }
  if (family === "jelly-fill") {
    folder = "jelly-fill-regular";
  }
  if (family === "notdog") {
    if (variant === "solid") folder = "notdog-solid";
    if (variant === "duo-solid") folder = "notdog-duo-solid";
  }
  if (family === "notdog-duo") {
    folder = "notdog-duo-solid";
  }
  if (family === "slab") {
    if (variant === "solid" || variant === "regular") folder = "slab-regular";
    if (variant === "press-regular") folder = "slab-press-regular";
  }
  if (family === "slab-press") {
    folder = "slab-press-regular";
  }
  if (family === "slab-duo") {
    folder = "slab-duo-regular";
  }
  if (family === "slab-press-duo") {
    folder = "slab-press-duo-regular";
  }
  if (family === "thumbprint") {
    folder = "thumbprint-light";
  }
  if (family === "utility") {
    folder = "utility-semibold";
  }
  if (family === "utility-duo") {
    folder = "utility-duo-semibold";
  }
  if (family === "utility-fill") {
    folder = "utility-fill-semibold";
  }
  if (family === "whiteboard") {
    folder = "whiteboard-semibold";
  }
  if (family === "mosaic") {
    folder = "mosaic-solid";
  }
  if (family === "pixel") {
    folder = "pixel-regular";
  }
  if (family === "vellum") {
    folder = "vellum-solid";
  }
  if (family === "classic") {
    if (variant === "thin") folder = "thin";
    if (variant === "light") folder = "light";
    if (variant === "regular") folder = "regular";
    if (variant === "solid") folder = "solid";
  }
  if (family === "duotone") {
    if (variant === "thin") folder = "duotone-thin";
    if (variant === "light") folder = "duotone-light";
    if (variant === "regular") folder = "duotone-regular";
    if (variant === "solid") folder = "duotone";
  }
  if (family === "sharp") {
    if (variant === "thin") folder = "sharp-thin";
    if (variant === "light") folder = "sharp-light";
    if (variant === "regular") folder = "sharp-regular";
    if (variant === "solid") folder = "sharp-solid";
  }
  if (family === "sharp-duotone") {
    if (variant === "thin") folder = "sharp-duotone-thin";
    if (variant === "light") folder = "sharp-duotone-light";
    if (variant === "regular") folder = "sharp-duotone-regular";
    if (variant === "solid") folder = "sharp-duotone-solid";
  }
  if (family === "brands") {
    folder = "brands";
  }
  return folder;
}
function getIconUrl(name, family, variant) {
  const folder = getIconFolder(name, family, variant);
  const iconBase = getIconPath();
  if (iconBase) {
    return `${iconBase}/${folder}/${name}.svg`;
  }
  const kitCode2 = getKitCode();
  const isPro = kitCode2.length > 0;
  return isPro ? `https://ka-p.fontawesome.com/releases/v${FA_VERSION}/svgs/${folder}/${name}.svg?token=${encodeURIComponent(kitCode2)}` : `https://ka-f.fontawesome.com/releases/v${FA_VERSION}/svgs/${folder}/${name}.svg`;
}
var library = {
  name: "default",
  resolver: (name, family = "classic", variant = "solid") => {
    return getIconUrl(name, family, variant);
  },
  mutator: (svg, hostEl) => {
    if (!svg.hasAttribute("fill")) {
      svg.setAttribute("fill", "currentColor");
    }
    if (hostEl?.family && !svg.hasAttribute("data-duotone-initialized")) {
      const { family, variant } = hostEl;
      if (
        // Duotone
        family === "duotone" || // Sharp duotone
        family === "sharp-duotone" || // Notdog duo (correct usage: family="notdog-duo")
        family === "notdog-duo" || // NOTE: family="notdog" variant="duo-solid" is deprecated
        family === "notdog" && variant === "duo-solid" || // Jelly duo (correct usage: family="jelly-duo")
        family === "jelly-duo" || // NOTE: family="jelly" variant="duo-regular" is deprecated
        family === "jelly" && variant === "duo-regular" || // Utility duo (correct usage: family="utility-duo")
        family === "utility-duo" || // Slab duo (new in 7.3)
        family === "slab-duo" || family === "slab-press-duo" || // Thumbprint
        family === "thumbprint"
      ) {
        const paths = [...svg.querySelectorAll("path")];
        const primaryPath = paths.find((p4) => !p4.hasAttribute("opacity"));
        const secondaryPath = paths.find((p4) => p4.hasAttribute("opacity"));
        if (!primaryPath || !secondaryPath) return;
        primaryPath.setAttribute("data-duotone-primary", "");
        secondaryPath.setAttribute("data-duotone-secondary", "");
        if (hostEl.swapOpacity && primaryPath && secondaryPath) {
          const originalOpacity = secondaryPath.getAttribute("opacity") || "0.4";
          primaryPath.style.setProperty("--path-opacity", originalOpacity);
          secondaryPath.style.setProperty("--path-opacity", "1");
        }
        svg.setAttribute("data-duotone-initialized", "");
      }
    }
  }
};
var library_default_default = library;

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.LDM2MW63.js
function dataUri(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
var icons = {
  //
  // Solid variant
  //
  solid: {
    backward: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M236.3 107.1C247.9 96 265 92.9 279.7 99.2C294.4 105.5 304 120 304 136L304 272.3L476.3 107.2C487.9 96 505 92.9 519.7 99.2C534.4 105.5 544 120 544 136L544 504C544 520 534.4 534.5 519.7 540.8C505 547.1 487.9 544 476.3 532.9L304 367.7L304 504C304 520 294.4 534.5 279.7 540.8C265 547.1 247.9 544 236.3 532.9L44.3 348.9C36.5 341.3 32 330.9 32 320C32 309.1 36.5 298.7 44.3 291.1L236.3 107.1z"/></svg>`,
    "backward-step": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M491 100.8C478.1 93.8 462.3 94.5 450 102.6L192 272.1L192 128C192 110.3 177.7 96 160 96C142.3 96 128 110.3 128 128L128 512C128 529.7 142.3 544 160 544C177.7 544 192 529.7 192 512L192 367.9L450 537.5C462.3 545.6 478 546.3 491 539.3C504 532.3 512 518.8 512 504.1L512 136.1C512 121.4 503.9 107.9 491 100.9z"/></svg>`,
    "angles-left": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M77.3 256 214.7 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256zm192 0L406.7 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L269.3 256z"/></svg>`,
    "angles-right": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M434.7 256 297.3 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L434.7 256zm-192 0L105.3 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256z"/></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"/></svg>`,
    "chevron-down": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>`,
    "chevron-left": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>`,
    "chevron-right": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>`,
    circle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z"/></svg>`,
    "closed-captioning": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M64 192C64 156.7 92.7 128 128 128L512 128C547.3 128 576 156.7 576 192L576 448C576 483.3 547.3 512 512 512L128 512C92.7 512 64 483.3 64 448L64 192zM216 272L248 272C252.4 272 256 275.6 256 280C256 293.3 266.7 304 280 304C293.3 304 304 293.3 304 280C304 249.1 278.9 224 248 224L216 224C185.1 224 160 249.1 160 280L160 360C160 390.9 185.1 416 216 416L248 416C278.9 416 304 390.9 304 360C304 346.7 293.3 336 280 336C266.7 336 256 346.7 256 360C256 364.4 252.4 368 248 368L216 368C211.6 368 208 364.4 208 360L208 280C208 275.6 211.6 272 216 272zM384 280C384 275.6 387.6 272 392 272L424 272C428.4 272 432 275.6 432 280C432 293.3 442.7 304 456 304C469.3 304 480 293.3 480 280C480 249.1 454.9 224 424 224L392 224C361.1 224 336 249.1 336 280L336 360C336 390.9 361.1 416 392 416L424 416C454.9 416 480 390.9 480 360C480 346.7 469.3 336 456 336C442.7 336 432 346.7 432 360C432 364.4 428.4 368 424 368L392 368C387.6 368 384 364.4 384 360L384 280z"/></svg>`,
    "closed-captioning-slash": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M39 39.1C48.4 29.7 63.6 29.7 72.9 39.1L161.8 128L512 128C547.3 128 576 156.7 576 192L576 448C576 473.5 561.1 495.4 539.6 505.8L601 567.1C610.4 576.5 610.4 591.7 601 601C591.6 610.3 576.4 610.4 567.1 601L39 73.1C29.7 63.7 29.7 48.5 39 39.1zM384 350.1L384 279.9C384 275.5 387.6 271.9 392 271.9L424 271.9C428.4 271.9 432 275.5 432 279.9C432 293.2 442.7 303.9 456 303.9C469.3 303.9 480 293.2 480 279.9C480 249 454.9 223.9 424 223.9L392 223.9C361.1 223.9 336 249 336 279.9L336 302.1L384 350.1zM445.5 411.6C465.7 403.2 480 383.2 480 359.9C480 346.6 469.3 335.9 456 335.9C442.7 335.9 432 346.6 432 359.9C432 364.3 428.4 367.9 424 367.9L401.8 367.9L445.5 411.6zM162.3 264.1C160.8 269.1 160 274.5 160 280L160 360C160 390.9 185.1 416 216 416L248 416C266.1 416 282.1 407.5 292.4 394.2L410.2 512L128 512C92.7 512 64 483.3 64 448L64 192C64 184.2 65.4 176.7 68 169.8L162.3 264.1zM256.1 357.9C256 358.6 256 359.3 256 360C256 364.4 252.4 368 248 368L216 368C211.6 368 208 364.4 208 360L208 309.8L256.1 357.9z"/></svg>`,
    compress: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M160 64c0-17.7-14.3-32-32-32S96 46.3 96 64l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 320c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0z"/></svg>`,
    ellipsis: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M96 320C96 289.1 121.1 264 152 264C182.9 264 208 289.1 208 320C208 350.9 182.9 376 152 376C121.1 376 96 350.9 96 320zM264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320zM488 264C518.9 264 544 289.1 544 320C544 350.9 518.9 376 488 376C457.1 376 432 350.9 432 320C432 289.1 457.1 264 488 264z"/></svg>`,
    "ellipsis-vertical": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M320 208C289.1 208 264 182.9 264 152C264 121.1 289.1 96 320 96C350.9 96 376 121.1 376 152C376 182.9 350.9 208 320 208zM320 432C350.9 432 376 457.1 376 488C376 518.9 350.9 544 320 544C289.1 544 264 518.9 264 488C264 457.1 289.1 432 320 432zM376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320z"/></svg>`,
    expand: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M128 96C110.3 96 96 110.3 96 128L96 224C96 241.7 110.3 256 128 256C145.7 256 160 241.7 160 224L160 160L224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L128 96zM160 416C160 398.3 145.7 384 128 384C110.3 384 96 398.3 96 416L96 512C96 529.7 110.3 544 128 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480L160 416zM416 96C398.3 96 384 110.3 384 128C384 145.7 398.3 160 416 160L480 160L480 224C480 241.7 494.3 256 512 256C529.7 256 544 241.7 544 224L544 128C544 110.3 529.7 96 512 96L416 96zM544 416C544 398.3 529.7 384 512 384C494.3 384 480 398.3 480 416L480 480L416 480C398.3 480 384 494.3 384 512C384 529.7 398.3 544 416 544L512 544C529.7 544 544 529.7 544 512L544 416z"/></svg>`,
    eyedropper: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M341.6 29.2l-101.6 101.6-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4 101.6-101.6c39-39 39-102.2 0-141.1s-102.2-39-141.1 0zM55.4 323.3c-15 15-23.4 35.4-23.4 56.6l0 42.4-26.6 39.9c-8.5 12.7-6.8 29.6 4 40.4s27.7 12.5 40.4 4l39.9-26.6 42.4 0c21.2 0 41.6-8.4 56.6-23.4l109.4-109.4-45.3-45.3-109.4 109.4c-3 3-7.1 4.7-11.3 4.7l-36.1 0 0-36.1c0-4.2 1.7-8.3 4.7-11.3l109.4-109.4-45.3-45.3-109.4 109.4z"/></svg>`,
    forward: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M403.7 107.1C392.1 96 375 92.9 360.3 99.2C345.6 105.5 336 120 336 136L336 272.3L163.7 107.2C152.1 96 135 92.9 120.3 99.2C105.6 105.5 96 120 96 136L96 504C96 520 105.6 534.5 120.3 540.8C135 547.1 152.1 544 163.7 532.9L336 367.7L336 504C336 520 345.6 534.5 360.3 540.8C375 547.1 392.1 544 403.7 532.9L595.7 348.9C603.6 341.4 608 330.9 608 320C608 309.1 603.5 298.7 595.7 291.1L403.7 107.1z"/></svg>`,
    file: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M192 64C156.7 64 128 92.7 128 128L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 234.5C512 217.5 505.3 201.2 493.3 189.2L386.7 82.7C374.7 70.7 358.5 64 341.5 64L192 64zM453.5 240L360 240C346.7 240 336 229.3 336 216L336 122.5L453.5 240z"/></svg>`,
    "file-audio": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM389.8 307.7C380.7 301.4 368.3 303.6 362 312.7C355.7 321.8 357.9 334.2 367 340.5C390.9 357.2 406.4 384.8 406.4 416C406.4 447.2 390.8 474.9 367 491.5C357.9 497.8 355.7 510.3 362 519.3C368.3 528.3 380.8 530.6 389.8 524.3C423.9 500.5 446.4 460.8 446.4 416C446.4 371.2 424 331.5 389.8 307.7zM208 376C199.2 376 192 383.2 192 392L192 440C192 448.8 199.2 456 208 456L232 456L259.2 490C262.2 493.8 266.8 496 271.7 496L272 496C280.8 496 288 488.8 288 480L288 352C288 343.2 280.8 336 272 336L271.7 336C266.8 336 262.2 338.2 259.2 342L232 376L208 376zM336 448.2C336 458.9 346.5 466.4 354.9 459.8C367.8 449.5 376 433.7 376 416C376 398.3 367.8 382.5 354.9 372.2C346.5 365.5 336 373.1 336 383.8L336 448.3z"/></svg>`,
    "file-code": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM282.2 359.6C290.8 349.5 289.7 334.4 279.6 325.8C269.5 317.2 254.4 318.3 245.8 328.4L197.8 384.4C190.1 393.4 190.1 406.6 197.8 415.6L245.8 471.6C254.4 481.7 269.6 482.8 279.6 474.2C289.6 465.6 290.8 450.4 282.2 440.4L247.6 400L282.2 359.6zM394.2 328.4C385.6 318.3 370.4 317.2 360.4 325.8C350.4 334.4 349.2 349.6 357.8 359.6L392.4 400L357.8 440.4C349.2 450.5 350.3 465.6 360.4 474.2C370.5 482.8 385.6 481.7 394.2 471.6L442.2 415.6C449.9 406.6 449.9 393.4 442.2 384.4L394.2 328.4z"/></svg>`,
    "file-excel": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM292 330.7C284.6 319.7 269.7 316.7 258.7 324C247.7 331.3 244.7 346.3 252 357.3L291.2 416L252 474.7C244.6 485.7 247.6 500.6 258.7 508C269.8 515.4 284.6 512.4 292 501.3L320 459.3L348 501.3C355.4 512.3 370.3 515.3 381.3 508C392.3 500.7 395.3 485.7 388 474.7L348.8 416L388 357.3C395.4 346.3 392.4 331.4 381.3 324C370.2 316.6 355.4 319.6 348 330.7L320 372.7L292 330.7z"/></svg>`,
    "file-image": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM256 320C256 302.3 241.7 288 224 288C206.3 288 192 302.3 192 320C192 337.7 206.3 352 224 352C241.7 352 256 337.7 256 320zM220.6 512L419.4 512C435.2 512 448 499.2 448 483.4C448 476.1 445.2 469 440.1 463.7L343.3 361.9C337.3 355.6 328.9 352 320.1 352L319.8 352C311 352 302.7 355.6 296.6 361.9L199.9 463.7C194.8 469 192 476.1 192 483.4C192 499.2 204.8 512 220.6 512z"/></svg>`,
    "file-pdf": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M128 64C92.7 64 64 92.7 64 128L64 512C64 547.3 92.7 576 128 576L208 576L208 464C208 428.7 236.7 400 272 400L448 400L448 234.5C448 217.5 441.3 201.2 429.3 189.2L322.7 82.7C310.7 70.7 294.5 64 277.5 64L128 64zM389.5 240L296 240C282.7 240 272 229.3 272 216L272 122.5L389.5 240zM272 444C261 444 252 453 252 464L252 592C252 603 261 612 272 612C283 612 292 603 292 592L292 564L304 564C337.1 564 364 537.1 364 504C364 470.9 337.1 444 304 444L272 444zM304 524L292 524L292 484L304 484C315 484 324 493 324 504C324 515 315 524 304 524zM400 444C389 444 380 453 380 464L380 592C380 603 389 612 400 612L432 612C460.7 612 484 588.7 484 560L484 496C484 467.3 460.7 444 432 444L400 444zM420 572L420 484L432 484C438.6 484 444 489.4 444 496L444 560C444 566.6 438.6 572 432 572L420 572zM508 464L508 592C508 603 517 612 528 612C539 612 548 603 548 592L548 548L576 548C587 548 596 539 596 528C596 517 587 508 576 508L548 508L548 484L576 484C587 484 596 475 596 464C596 453 587 444 576 444L528 444C517 444 508 453 508 464z"/></svg>`,
    "file-powerpoint": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM280 320C266.7 320 256 330.7 256 344L256 488C256 501.3 266.7 512 280 512C293.3 512 304 501.3 304 488L304 464L328 464C367.8 464 400 431.8 400 392C400 352.2 367.8 320 328 320L280 320zM328 416L304 416L304 368L328 368C341.3 368 352 378.7 352 392C352 405.3 341.3 416 328 416z"/></svg>`,
    "file-video": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM208 368L208 464C208 481.7 222.3 496 240 496L336 496C353.7 496 368 481.7 368 464L368 440L403 475C406.2 478.2 410.5 480 415 480C424.4 480 432 472.4 432 463L432 368.9C432 359.5 424.4 351.9 415 351.9C410.5 351.9 406.2 353.7 403 356.9L368 391.9L368 367.9C368 350.2 353.7 335.9 336 335.9L240 335.9C222.3 335.9 208 350.2 208 367.9z"/></svg>`,
    "file-word": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM263.4 338.8C260.5 325.9 247.7 317.7 234.8 320.6C221.9 323.5 213.7 336.3 216.6 349.2L248.6 493.2C250.9 503.7 260 511.4 270.8 512C281.6 512.6 291.4 505.9 294.8 495.6L320 419.9L345.2 495.6C348.6 505.8 358.4 512.5 369.2 512C380 511.5 389.1 503.8 391.4 493.2L423.4 349.2C426.3 336.3 418.1 323.4 405.2 320.6C392.3 317.8 379.4 325.9 376.6 338.8L363.4 398.2L342.8 336.4C339.5 326.6 330.4 320 320 320C309.6 320 300.5 326.6 297.2 336.4L276.6 398.2L263.4 338.8z"/></svg>`,
    "file-zipper": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM192 136C192 149.3 202.7 160 216 160L264 160C277.3 160 288 149.3 288 136C288 122.7 277.3 112 264 112L216 112C202.7 112 192 122.7 192 136zM192 232C192 245.3 202.7 256 216 256L264 256C277.3 256 288 245.3 288 232C288 218.7 277.3 208 264 208L216 208C202.7 208 192 218.7 192 232zM256 304L224 304C206.3 304 192 318.3 192 336L192 384C192 410.5 213.5 432 240 432C266.5 432 288 410.5 288 384L288 336C288 318.3 273.7 304 256 304zM240 368C248.8 368 256 375.2 256 384C256 392.8 248.8 400 240 400C231.2 400 224 392.8 224 384C224 375.2 231.2 368 240 368z"/></svg>`,
    "forward-step": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M21 36.8c12.9-7 28.7-6.3 41 1.8L320 208.1 320 64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 384c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-144.1-258 169.6c-12.3 8.1-28 8.8-41 1.8S0 454.7 0 440L0 72C0 57.3 8.1 43.8 21 36.8z"/></svg>`,
    gauge: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm320 96c0-26.9-16.5-49.9-40-59.3L280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 172.7c-23.5 9.5-40 32.5-40 59.3 0 35.3 28.7 64 64 64s64-28.7 64-64zM144 176a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm-16 80a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm288 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM400 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>`,
    gear: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M259.1 73.5C262.1 58.7 275.2 48 290.4 48L350.2 48C365.4 48 378.5 58.7 381.5 73.5L396 143.5C410.1 149.5 423.3 157.2 435.3 166.3L503.1 143.8C517.5 139 533.3 145 540.9 158.2L570.8 210C578.4 223.2 575.7 239.8 564.3 249.9L511 297.3C511.9 304.7 512.3 312.3 512.3 320C512.3 327.7 511.8 335.3 511 342.7L564.4 390.2C575.8 400.3 578.4 417 570.9 430.1L541 481.9C533.4 495 517.6 501.1 503.2 496.3L435.4 473.8C423.3 482.9 410.1 490.5 396.1 496.6L381.7 566.5C378.6 581.4 365.5 592 350.4 592L290.6 592C275.4 592 262.3 581.3 259.3 566.5L244.9 496.6C230.8 490.6 217.7 482.9 205.6 473.8L137.5 496.3C123.1 501.1 107.3 495.1 99.7 481.9L69.8 430.1C62.2 416.9 64.9 400.3 76.3 390.2L129.7 342.7C128.8 335.3 128.4 327.7 128.4 320C128.4 312.3 128.9 304.7 129.7 297.3L76.3 249.8C64.9 239.7 62.3 223 69.8 209.9L99.7 158.1C107.3 144.9 123.1 138.9 137.5 143.7L205.3 166.2C217.4 157.1 230.6 149.5 244.6 143.4L259.1 73.5zM320.3 400C364.5 399.8 400.2 363.9 400 319.7C399.8 275.5 363.9 239.8 319.7 240C275.5 240.2 239.8 276.1 240 320.3C240.2 364.5 276.1 400.2 320.3 400z"/></svg>`,
    "grip-vertical": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M128 40c0-22.1-17.9-40-40-40L40 0C17.9 0 0 17.9 0 40L0 88c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zM0 424l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM320 40c0-22.1-17.9-40-40-40L232 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zM192 232l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM320 424c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48z"/></svg>`,
    indeterminate: `<svg part="indeterminate-icon" class="icon" viewBox="0 0 16 16"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round"><g stroke="currentColor" stroke-width="2"><g transform="translate(2.285714 6.857143)"><path d="M10.2857143,1.14285714 L1.14285714,1.14285714"/></g></g></g></svg>`,
    minus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32z"/></svg>`,
    pause: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M48 32C21.5 32 0 53.5 0 80L0 432c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48L48 32zm224 0c-26.5 0-48 21.5-48 48l0 352c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48l-64 0z"/></svg>`,
    "picture-in-picture": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M448 32c35.3 0 64 28.7 64 64l0 112-64 0 0-112-384 0 0 320 144 0 0 64-144 0-6.5-.3c-30.1-3.1-54.1-27-57.1-57.1L0 416 0 96C0 62.9 25.2 35.6 57.5 32.3L64 32 448 32zm16 224c26.5 0 48 21.5 48 48l0 128c0 26.5-21.5 48-48 48l-160 0c-26.5 0-48-21.5-48-48l0-128c0-26.5 21.5-48 48-48l160 0z"/></svg>`,
    play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z"/></svg>`,
    "play-circle": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9l0 176c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"/></svg>`,
    plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"/></svg>`,
    star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z"/></svg>`,
    upload: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M352 173.3L352 384C352 401.7 337.7 416 320 416C302.3 416 288 401.7 288 384L288 173.3L246.6 214.7C234.1 227.2 213.8 227.2 201.3 214.7C188.8 202.2 188.8 181.9 201.3 169.4L297.3 73.4C309.8 60.9 330.1 60.9 342.6 73.4L438.6 169.4C451.1 181.9 451.1 202.2 438.6 214.7C426.1 227.2 405.8 227.2 393.3 214.7L352 173.3zM320 464C364.2 464 400 428.2 400 384L480 384C515.3 384 544 412.7 544 448L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 448C96 412.7 124.7 384 160 384L240 384C240 428.2 275.8 464 320 464zM464 488C477.3 488 488 477.3 488 464C488 450.7 477.3 440 464 440C450.7 440 440 450.7 440 464C440 477.3 450.7 488 464 488z"/></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M224 248a120 120 0 1 0 0-240 120 120 0 1 0 0 240zm-29.7 56C95.8 304 16 383.8 16 482.3 16 498.7 29.3 512 45.7 512l356.6 0c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3l-59.4 0z"/></svg>`,
    volume: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M48 352l48 0 134.1 119.2c6.4 5.7 14.6 8.8 23.1 8.8 19.2 0 34.8-15.6 34.8-34.8l0-378.4c0-19.2-15.6-34.8-34.8-34.8-8.5 0-16.7 3.1-23.1 8.8L96 160 48 160c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48zM441.1 107c-10.3-8.4-25.4-6.8-33.8 3.5s-6.8 25.4 3.5 33.8C443.3 170.7 464 210.9 464 256s-20.7 85.3-53.2 111.8c-10.3 8.4-11.8 23.5-3.5 33.8s23.5 11.8 33.8 3.5c43.2-35.2 70.9-88.9 70.9-149s-27.7-113.8-70.9-149zm-60.5 74.5c-10.3-8.4-25.4-6.8-33.8 3.5s-6.8 25.4 3.5 33.8C361.1 227.6 368 241 368 256s-6.9 28.4-17.7 37.3c-10.3 8.4-11.8 23.5-3.5 33.8s23.5 11.8 33.8 3.5C402.1 312.9 416 286.1 416 256s-13.9-56.9-35.5-74.5z"/></svg>`,
    "volume-low": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M48 352l48 0 134.1 119.2c6.4 5.7 14.6 8.8 23.1 8.8 19.2 0 34.8-15.6 34.8-34.8l0-378.4c0-19.2-15.6-34.8-34.8-34.8-8.5 0-16.7 3.1-23.1 8.8L96 160 48 160c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48zM380.6 181.5c-10.3-8.4-25.4-6.8-33.8 3.5s-6.8 25.4 3.5 33.8C361.1 227.6 368 241 368 256s-6.9 28.4-17.7 37.3c-10.3 8.4-11.8 23.5-3.5 33.8s23.5 11.8 33.8 3.5C402.1 312.9 416 286.1 416 256s-13.9-56.9-35.5-74.5z"/></svg>`,
    "volume-xmark": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="currentColor" d="M48 352l48 0 134.1 119.2c6.4 5.7 14.6 8.8 23.1 8.8 19.2 0 34.8-15.6 34.8-34.8l0-378.4c0-19.2-15.6-34.8-34.8-34.8-8.5 0-16.7 3.1-23.1 8.8L96 160 48 160c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48zM367 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/></svg>`,
    xmark: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"/></svg>`
  },
  //
  // Regular variant
  //
  regular: {
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176zM144 288L144 480C144 488.8 151.2 496 160 496L480 496C488.8 496 496 488.8 496 480L496 288L144 288z"/></svg>`,
    "circle-question": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M464 256a208 208 0 1 0 -416 0 208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm256-80c-17.7 0-32 14.3-32 32 0 13.3-10.7 24-24 24s-24-10.7-24-24c0-44.2 35.8-80 80-80s80 35.8 80 80c0 47.2-36 67.2-56 74.5l0 3.8c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-8.1c0-20.5 14.8-35.2 30.1-40.2 6.4-2.1 13.2-5.5 18.2-10.3 4.3-4.2 7.7-10 7.7-19.6 0-17.7-14.3-32-32-32zM224 368a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>`,
    "circle-xmark": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM167 167c-9.4 9.4-9.4 24.6 0 33.9l55 55-55 55c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l55-55 55 55c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-55-55 55-55c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-55 55-55-55c-9.4-9.4-24.6-9.4-33.9 0z"/></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"/></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M384 336l-192 0c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l133.5 0c4.2 0 8.3 1.7 11.3 4.7l58.5 58.5c3 3 4.7 7.1 4.7 11.3L400 320c0 8.8-7.2 16-16 16zM192 384l192 0c35.3 0 64-28.7 64-64l0-197.5c0-17-6.7-33.3-18.7-45.3L370.7 18.7C358.7 6.7 342.5 0 325.5 0L192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-16-48 0 0 16c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l16 0 0-48-16 0z"/></svg>`,
    eye: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M288 80C222.8 80 169.2 109.6 128.1 147.7 89.6 183.5 63 226 49.4 256 63 286 89.6 328.5 128.1 364.3 169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256 513 226 486.4 183.5 447.9 147.7 406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1 3.3 7.9 3.3 16.7 0 24.6-14.9 35.7-46.2 87.7-93 131.1-47.1 43.7-111.8 80.6-192.6 80.6S142.5 443.2 95.4 399.4c-46.8-43.5-78.1-95.4-93-131.1-3.3-7.9-3.3-16.7 0-24.6 14.9-35.7 46.2-87.7 93-131.1zM288 336c44.2 0 80-35.8 80-80 0-29.6-16.1-55.5-40-69.3-1.4 59.7-49.6 107.9-109.3 109.3 13.8 23.9 39.7 40 69.3 40zm-79.6-88.4c2.5 .3 5 .4 7.6 .4 35.3 0 64-28.7 64-64 0-2.6-.2-5.1-.4-7.6-37.4 3.9-67.2 33.7-71.1 71.1zm45.6-115c10.8-3 22.2-4.5 33.9-4.5 8.8 0 17.5 .9 25.8 2.6 .3 .1 .5 .1 .8 .2 57.9 12.2 101.4 63.7 101.4 125.2 0 70.7-57.3 128-128 128-61.6 0-113-43.5-125.2-101.4-1.8-8.6-2.8-17.5-2.8-26.6 0-11 1.4-21.8 4-32 .2-.7 .3-1.3 .5-1.9 11.9-43.4 46.1-77.6 89.5-89.5z"/></svg>`,
    "eye-slash": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M41-24.9c-9.4-9.4-24.6-9.4-33.9 0S-2.3-.3 7 9.1l528 528c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-96.4-96.4c2.7-2.4 5.4-4.8 8-7.2 46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6-56.8 0-105.6 18.2-146 44.2L41-24.9zM176.9 111.1c32.1-18.9 69.2-31.1 111.1-31.1 65.2 0 118.8 29.6 159.9 67.7 38.5 35.7 65.1 78.3 78.6 108.3-13.6 30-40.2 72.5-78.6 108.3-3.1 2.8-6.2 5.6-9.4 8.4L393.8 328c14-20.5 22.2-45.3 22.2-72 0-70.7-57.3-128-128-128-26.7 0-51.5 8.2-72 22.2l-39.1-39.1zm182 182l-108-108c11.1-5.8 23.7-9.1 37.1-9.1 44.2 0 80 35.8 80 80 0 13.4-3.3 26-9.1 37.1zM103.4 173.2l-34-34c-32.6 36.8-55 75.8-66.9 104.5-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6 37.3 0 71.2-7.9 101.5-20.6L352.2 422c-20 6.4-41.4 10-64.2 10-65.2 0-118.8-29.6-159.9-67.7-38.5-35.7-65.1-78.3-78.6-108.3 10.4-23.1 28.6-53.6 54-82.8z"/></svg>`,
    star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M288.1-32c9 0 17.3 5.1 21.4 13.1L383 125.3 542.9 150.7c8.9 1.4 16.3 7.7 19.1 16.3s.5 18-5.8 24.4L441.7 305.9 467 465.8c1.4 8.9-2.3 17.9-9.6 23.2s-17 6.1-25 2L288.1 417.6 143.8 491c-8 4.1-17.7 3.3-25-2s-11-14.2-9.6-23.2L134.4 305.9 20 191.4c-6.4-6.4-8.6-15.8-5.8-24.4s10.1-14.9 19.1-16.3l159.9-25.4 73.6-144.2c4.1-8 12.4-13.1 21.4-13.1zm0 76.8L230.3 158c-3.5 6.8-10 11.6-17.6 12.8l-125.5 20 89.8 89.9c5.4 5.4 7.9 13.1 6.7 20.7l-19.8 125.5 113.3-57.6c6.8-3.5 14.9-3.5 21.8 0l113.3 57.6-19.8-125.5c-1.2-7.6 1.3-15.3 6.7-20.7l89.8-89.9-125.5-20c-7.6-1.2-14.1-6-17.6-12.8L288.1 44.8z"/></svg>`
  }
};
var systemLibrary = {
  name: "system",
  resolver: (name, _family = "classic", variant = "solid") => {
    let collection = icons[variant];
    let svg = collection[name] ?? icons.regular[name] ?? icons.regular["circle-question"];
    if (svg) {
      return dataUri(svg);
    }
    return "";
  }
};
var library_system_default = systemLibrary;

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.W7QZX2CB.js
var defaultIconFamily = "classic";
var registry = [library_default_default, library_system_default];
var watchedIcons = /* @__PURE__ */ new Set();
function watchIcon(icon) {
  watchedIcons.add(icon);
}
function unwatchIcon(icon) {
  watchedIcons.delete(icon);
}
function getIconLibrary(name) {
  return registry.find((lib) => lib.name === name);
}
function getDefaultIconFamily() {
  return defaultIconFamily;
}

// node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directive-helpers.js
var { I: t5 } = j;
var l4 = (o11, t6) => void 0 === t6 ? void 0 !== o11?._$litType$ : o11?._$litType$ === t6;

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.ZCZ2WKQR.js
var CACHEABLE_ERROR = /* @__PURE__ */ Symbol();
var RETRYABLE_ERROR = /* @__PURE__ */ Symbol();
var parser;
var iconCache = /* @__PURE__ */ new Map();
var WaIcon = class extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.svg = null;
    this.autoWidth = false;
    this.swapOpacity = false;
    this.label = "";
    this.library = "default";
    this.rotate = 0;
    this.resolveIcon = async (url, library2) => {
      let fileData;
      if (library2?.spriteSheet) {
        if (!this.hasUpdated) {
          await this.updateComplete;
        }
        this.svg = b2`<svg part="svg">
        <use part="use" href="${url}"></use>
      </svg>`;
        await this.updateComplete;
        const svg = this.shadowRoot.querySelector("[part='svg']");
        if (typeof library2.mutator === "function") {
          library2.mutator(svg, this);
        }
        return this.svg;
      }
      try {
        fileData = await fetch(url, { mode: "cors" });
        if (!fileData.ok) return fileData.status === 410 ? CACHEABLE_ERROR : RETRYABLE_ERROR;
      } catch {
        return RETRYABLE_ERROR;
      }
      try {
        const div = document.createElement("div");
        div.innerHTML = await fileData.text();
        const svg = div.firstElementChild;
        if (svg?.tagName?.toLowerCase() !== "svg") return CACHEABLE_ERROR;
        if (!parser) parser = new DOMParser();
        const doc = parser.parseFromString(svg.outerHTML, "text/html");
        const svgEl = doc.body.querySelector("svg");
        if (!svgEl) return CACHEABLE_ERROR;
        svgEl.part.add("svg");
        return document.adoptNode(svgEl);
      } catch {
        return CACHEABLE_ERROR;
      }
    };
  }
  connectedCallback() {
    super.connectedCallback();
    watchIcon(this);
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    if (this.hasAttribute("rotate")) {
      this.style.setProperty("--rotate-angle", `${this.rotate}deg`);
    }
    this.setIcon();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    unwatchIcon(this);
  }
  async getIconSource() {
    const library2 = getIconLibrary(this.library);
    const family = this.family || getDefaultIconFamily();
    if (this.name && library2) {
      const autoWidth = this.canvas === "auto" || this.autoWidth;
      let url;
      try {
        url = await library2.resolver(this.name, family, this.variant, autoWidth);
      } catch {
        url = void 0;
      }
      return { url, fromLibrary: true };
    }
    return {
      url: this.src,
      fromLibrary: false
    };
  }
  handleLabelChange() {
    const hasLabel = typeof this.label === "string" && this.label.length > 0;
    if (hasLabel) {
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", this.label);
      this.removeAttribute("aria-hidden");
    } else {
      this.removeAttribute("role");
      this.removeAttribute("aria-label");
      this.setAttribute("aria-hidden", "true");
    }
  }
  async setIcon() {
    const { url, fromLibrary } = await this.getIconSource();
    const library2 = fromLibrary ? getIconLibrary(this.library) : void 0;
    if (!url) {
      this.svg = null;
      return;
    }
    let iconResolver = iconCache.get(url);
    if (!iconResolver) {
      iconResolver = this.resolveIcon(url, library2);
      iconCache.set(url, iconResolver);
    }
    const svg = await iconResolver;
    if (svg === RETRYABLE_ERROR) {
      iconCache.delete(url);
    }
    const sourceAfterFetch = await this.getIconSource();
    if (url !== sourceAfterFetch.url) {
      return;
    }
    if (l4(svg)) {
      this.svg = svg;
      return;
    }
    switch (svg) {
      case RETRYABLE_ERROR:
      case CACHEABLE_ERROR:
        this.svg = null;
        this.dispatchEvent(new WaErrorEvent());
        break;
      default:
        this.svg = svg.cloneNode(true);
        library2?.mutator?.(this.svg, this);
        this.dispatchEvent(new WaLoadEvent());
    }
  }
  willUpdate(changedProperties) {
    if (!this.style) {
      this.setStyleProperty("--rotate-angle", `${this.rotate}deg`);
    }
    return super.willUpdate(changedProperties);
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    const library2 = getIconLibrary(this.library);
    if (this.hasAttribute("rotate")) {
      this.style.setProperty("--rotate-angle", `${this.rotate}deg`);
    }
    const svg = this.shadowRoot?.querySelector("svg");
    if (svg) {
      library2?.mutator?.(svg, this);
    }
  }
  render() {
    if (this.hasUpdated) {
      return this.svg;
    }
    return b2`<svg part="svg" width="16" height="16" viewBox="0 0 16 16"></svg>`;
  }
};
WaIcon.css = icon_styles_default;
__decorateClass([
  r5()
], WaIcon.prototype, "svg", 2);
__decorateClass([
  n4({ reflect: true })
], WaIcon.prototype, "name", 2);
__decorateClass([
  n4({ reflect: true })
], WaIcon.prototype, "family", 2);
__decorateClass([
  n4({ reflect: true })
], WaIcon.prototype, "variant", 2);
__decorateClass([
  n4({ reflect: true })
], WaIcon.prototype, "canvas", 2);
__decorateClass([
  n4({ attribute: "auto-width", type: Boolean, reflect: true })
], WaIcon.prototype, "autoWidth", 2);
__decorateClass([
  n4({ attribute: "swap-opacity", type: Boolean, reflect: true })
], WaIcon.prototype, "swapOpacity", 2);
__decorateClass([
  n4()
], WaIcon.prototype, "src", 2);
__decorateClass([
  n4()
], WaIcon.prototype, "label", 2);
__decorateClass([
  n4({ reflect: true })
], WaIcon.prototype, "library", 2);
__decorateClass([
  n4({ type: Number, reflect: true })
], WaIcon.prototype, "rotate", 2);
__decorateClass([
  n4({ type: String, reflect: true })
], WaIcon.prototype, "flip", 2);
__decorateClass([
  n4({ type: String, reflect: true })
], WaIcon.prototype, "animation", 2);
__decorateClass([
  watch("label")
], WaIcon.prototype, "handleLabelChange", 1);
__decorateClass([
  watch(["family", "name", "library", "variant", "src", "autoWidth", "canvas", "swapOpacity"], {
    waitUntilFirstUpdate: true
  })
], WaIcon.prototype, "setIcon", 1);
WaIcon = __decorateClass([
  t3("wa-icon")
], WaIcon);

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.ATI2KDM5.js
var card_styles_default = i`
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
`;

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.S37D42WK.js
var WaCard = class extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.hasSlotController = new HasSlotController(
      this,
      "footer",
      "header",
      "media",
      "header-actions",
      "footer-actions",
      "actions"
    );
    this.appearance = "outlined";
    this.withHeader = false;
    this.withMedia = false;
    this.withFooter = false;
    this.withHeaderActions = false;
    this.withFooterActions = false;
    this.orientation = "vertical";
  }
  willUpdate(changedProperties) {
    this.withHeader = this.hasSlotController.test("header", "withHeader");
    this.withMedia = this.hasSlotController.test("media", "withMedia");
    this.withFooter = this.hasSlotController.test("footer", "withFooter");
    super.willUpdate(changedProperties);
  }
  render() {
    if (this.orientation === "horizontal") {
      return b2`
        <slot name="media" part="media" class="media"></slot>
        <div part="body" class="body"><slot></slot></div>
        <slot name="actions" part="actions" class="actions"></slot>
      `;
    }
    const hasHeaderActions = this.hasSlotController.test("header-actions", "withHeaderActions");
    const hasFooterActions = this.hasSlotController.test("footer-actions", "withFooterActions");
    return b2`
      <slot name="media" part="media" class="media"></slot>

      <header
        part="header"
        class=${e7({
      header: true,
      "has-actions": hasHeaderActions
    })}
      >
        <slot name="header"></slot>
        <slot name="header-actions"></slot>
      </header>

      <div part="body" class="body"><slot></slot></div>

      <footer
        part="footer"
        class=${e7({
      footer: true,
      "has-actions": hasFooterActions
    })}
      >
        <slot name="footer"></slot>
        <slot name="footer-actions"></slot>
      </footer>
    `;
  }
};
WaCard.css = [size_styles_default, card_styles_default];
__decorateClass([
  n4({ reflect: true })
], WaCard.prototype, "appearance", 2);
__decorateClass([
  n4({ attribute: "with-header", type: Boolean, reflect: true })
], WaCard.prototype, "withHeader", 2);
__decorateClass([
  n4({ attribute: "with-media", type: Boolean, reflect: true })
], WaCard.prototype, "withMedia", 2);
__decorateClass([
  n4({ attribute: "with-footer", type: Boolean, reflect: true })
], WaCard.prototype, "withFooter", 2);
__decorateClass([
  n4({ attribute: "with-header-actions", type: Boolean, reflect: true })
], WaCard.prototype, "withHeaderActions", 2);
__decorateClass([
  n4({ attribute: "with-footer-actions", type: Boolean, reflect: true })
], WaCard.prototype, "withFooterActions", 2);
__decorateClass([
  n4({ reflect: true })
], WaCard.prototype, "orientation", 2);
WaCard = __decorateClass([
  t3("wa-card")
], WaCard);
WaCard.disableWarning?.("change-in-update");

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.C3KOHXUM.js
var option_styles_default = i`
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
`;

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.B632VLM3.js
function getText(root, depth = 0) {
  if (!root || !globalThis.Node) {
    return "";
  }
  if (typeof root[Symbol.iterator] === "function") {
    let nodes = Array.isArray(root) ? root : [...root];
    return nodes.map((node2) => getText(node2, --depth)).join("");
  }
  let node = root;
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    let element = node;
    if (element.hasAttribute("slot") || element.matches("style, script")) {
      return "";
    }
    if (element instanceof HTMLSlotElement) {
      let assignedNodes = element.assignedNodes({ flatten: true });
      if (assignedNodes.length > 0) {
        return getText(assignedNodes, --depth);
      }
    }
    return depth > -1 ? getText(element, --depth) : element.textContent ?? "";
  }
  return node.hasChildNodes() ? getText(node.childNodes, --depth) : "";
}
var WaOption = class extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController2(this);
    this.cachedDefaultLabel = "";
    this.isInitialized = false;
    this.isDefaultLabelDirty = true;
    this.current = false;
    this.value = "";
    this.disabled = false;
    this.selected = false;
    this.defaultSelected = false;
    this._label = "";
    this.handleHover = (event) => {
      if (event.type === "mouseenter") {
        this.customStates.set("hover", true);
      } else if (event.type === "mouseleave") {
        this.customStates.set("hover", false);
      }
    };
  }
  set label(value) {
    const oldValue = this._label;
    this._label = value || "";
    if (this._label !== oldValue) {
      this.requestUpdate("label", oldValue);
    }
  }
  get label() {
    if (this._label) {
      return this._label;
    }
    return this.defaultLabel;
  }
  /** The default label, generated from the element contents. Will be equal to `label` in most cases. */
  get defaultLabel() {
    if (this.isDefaultLabelDirty || !this.cachedDefaultLabel) {
      this.updateDefaultLabel();
    }
    return this.cachedDefaultLabel;
  }
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "option");
    this.setAttribute("aria-selected", "false");
    this.addEventListener("mouseenter", this.handleHover);
    this.addEventListener("mouseleave", this.handleHover);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("mouseenter", this.handleHover);
    this.removeEventListener("mouseleave", this.handleHover);
  }
  handleDefaultSlotChange() {
    this.isDefaultLabelDirty = true;
    if (this.isInitialized) {
      customElements.whenDefined("wa-select").then(() => {
        const controller = this.closest("wa-select");
        if (controller) {
          controller.handleDefaultSlotChange?.();
        }
      });
      customElements.whenDefined("wa-combobox").then(() => {
        const controller = this.closest("wa-combobox");
        if (controller) {
          controller.handleDefaultSlotChange?.();
        }
      });
    } else {
      this.isInitialized = true;
    }
  }
  willUpdate(changedProperties) {
    if (changedProperties.has("defaultSelected")) {
      if (this.didSSR && this.hasUpdated || !this.didSSR) {
        this.syncDefaultSelected();
      }
    }
    super.willUpdate(changedProperties);
  }
  syncDefaultSelected() {
    if ("closest" in this) {
      if (!this.closest("wa-combobox, wa-select")?.hasInteracted) {
        if (this.defaultSelected) {
          const oldVal = this.selected;
          this.selected = this.defaultSelected;
          this.requestUpdate("selected", oldVal);
        }
      }
    }
  }
  updated(changedProperties) {
    if (changedProperties.has("disabled")) {
      this.setAttribute("aria-disabled", this.disabled ? "true" : "false");
      this.customStates.set("disabled", this.disabled);
    }
    if (changedProperties.has("selected")) {
      this.setAttribute("aria-selected", this.selected ? "true" : "false");
      this.customStates.set("selected", this.selected);
    }
    if (changedProperties.has("value")) {
      if (typeof this.value !== "string") {
        this.value = String(this.value);
      }
      this.handleDefaultSlotChange();
    }
    if (changedProperties.has("current")) {
      this.customStates.set("current", this.current);
    }
    super.updated(changedProperties);
  }
  async firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    if (this.didSSR && !this.hasUpdated) {
      await this.updateComplete;
      this.syncDefaultSelected();
    } else {
      this.syncDefaultSelected();
    }
    if (this.selected && !this.defaultSelected) {
      const parent = this.closest("wa-select, wa-combobox");
      if (parent && !parent.hasInteracted) {
        await customElements.whenDefined(parent?.localName);
        await parent.updateComplete;
        parent.selectionChanged?.();
      }
    }
  }
  updateDefaultLabel() {
    let oldValue = this.cachedDefaultLabel;
    this.cachedDefaultLabel = getText(this).trim();
    this.isDefaultLabelDirty = false;
    let changed = this.cachedDefaultLabel !== oldValue;
    if (!this._label && changed) {
      this.requestUpdate("label", oldValue);
    }
    return changed;
  }
  render() {
    let selected = this.selected;
    if (this.didSSR && !this.hasUpdated) {
      this.updateComplete.then(() => {
        this.requestUpdate();
      });
      return A;
    }
    return b2`
      ${selected ? b2`<wa-icon
            part="checked-icon"
            class="check"
            name="check"
            library="system"
            variant="solid"
            aria-hidden="true"
          ></wa-icon>` : b2`<span part="checked-icon" class="check" aria-hidden="true"></span>`}
      <slot part="start" name="start" class="start"></slot>
      <slot part="label" class="label" @slotchange=${this.handleDefaultSlotChange}></slot>
      <slot part="end" name="end" class="end"></slot>
    `;
  }
};
WaOption.css = option_styles_default;
__decorateClass([
  e5(".label")
], WaOption.prototype, "defaultSlot", 2);
__decorateClass([
  r5()
], WaOption.prototype, "current", 2);
__decorateClass([
  n4({ reflect: true })
], WaOption.prototype, "value", 2);
__decorateClass([
  n4({ type: Boolean })
], WaOption.prototype, "disabled", 2);
__decorateClass([
  n4({ type: Boolean, attribute: false })
], WaOption.prototype, "selected", 2);
__decorateClass([
  n4({ type: Boolean, attribute: "selected" })
], WaOption.prototype, "defaultSelected", 2);
__decorateClass([
  n4()
], WaOption.prototype, "label", 1);
WaOption = __decorateClass([
  t3("wa-option")
], WaOption);

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.ZCRHF4FU.js
var select_styles_default = i`
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

    &::slotted(wa-tag) {
      cursor: pointer !important;
    }

    .disabled &,
    .disabled &::slotted(wa-tag) {
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: inherit;
    color: var(--wa-color-neutral-on-quiet);
    border: none;
    background: none;
    padding: 0;
    transition: color var(--wa-transition-normal);
    cursor: pointer;
    margin-inline-start: var(--wa-form-control-padding-inline);

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
`;

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.VQZ46MYI.js
function getOffset(element, parent) {
  return {
    top: Math.round(element.getBoundingClientRect().top - parent.getBoundingClientRect().top),
    left: Math.round(element.getBoundingClientRect().left - parent.getBoundingClientRect().left)
  };
}
function scrollIntoView(element, container, direction = "vertical", behavior = "smooth") {
  const offset3 = getOffset(element, container);
  const offsetTop = offset3.top + container.scrollTop;
  const offsetLeft = offset3.left + container.scrollLeft;
  const minX = container.scrollLeft;
  const maxX = container.scrollLeft + container.offsetWidth;
  const minY = container.scrollTop;
  const maxY = container.scrollTop + container.offsetHeight;
  if (direction === "horizontal" || direction === "both") {
    if (offsetLeft < minX) {
      container.scrollTo({ left: offsetLeft, behavior });
    } else if (offsetLeft + element.clientWidth > maxX) {
      container.scrollTo({ left: offsetLeft - container.offsetWidth + element.clientWidth, behavior });
    }
  }
  if (direction === "vertical" || direction === "both") {
    if (offsetTop < minY) {
      container.scrollTo({ top: offsetTop, behavior });
    } else if (offsetTop + element.clientHeight > maxY) {
      container.scrollTo({ top: offsetTop - container.offsetHeight + element.clientHeight, behavior });
    }
  }
}

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.4ZAKP7NY.js
var WaShowEvent = class extends Event {
  constructor() {
    super("wa-show", { bubbles: true, cancelable: true, composed: true });
  }
};

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.MQODJ75V.js
var WaHideEvent = class extends Event {
  constructor(detail) {
    super("wa-hide", { bubbles: true, cancelable: true, composed: true });
    this.detail = detail;
  }
};

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.PX3HMKF7.js
var WaAfterShowEvent = class extends Event {
  constructor() {
    super("wa-after-show", { bubbles: true, cancelable: false, composed: true });
  }
};

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.3NKIHICW.js
var WaAfterHideEvent = class extends Event {
  constructor() {
    super("wa-after-hide", { bubbles: true, cancelable: false, composed: true });
  }
};

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.JTOY5KP3.js
var WaClearEvent = class extends Event {
  constructor() {
    super("wa-clear", { bubbles: true, cancelable: false, composed: true });
  }
};

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.52WA2DJO.js
var dismissibleStack = [];
function registerDismissible(key) {
  dismissibleStack.push(key);
}
function unregisterDismissible(key) {
  for (let i8 = dismissibleStack.length - 1; i8 >= 0; i8--) {
    if (dismissibleStack[i8] === key) {
      dismissibleStack.splice(i8, 1);
      break;
    }
  }
}
function isTopDismissible(key) {
  return dismissibleStack.length > 0 && dismissibleStack[dismissibleStack.length - 1] === key;
}

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.GWSUX3V5.js
var RequiredValidator = (options = {}) => {
  let { validationElement, validationProperty } = options;
  if (!validationElement) {
    if (typeof document !== "undefined" && "createElement" in document) {
      validationElement = Object.assign(document.createElement("input"), { required: true });
    }
  }
  if (!validationProperty) {
    validationProperty = "value";
  }
  const obj = {
    observedAttributes: ["required"],
    message: validationElement?.validationMessage,
    // @TODO: Add a translation.
    checkValidity(element) {
      const validity = {
        message: "",
        isValid: true,
        invalidKeys: []
      };
      const isRequired = element.required ?? element.hasAttribute("required");
      if (!isRequired) {
        return validity;
      }
      const value = element[validationProperty];
      const isEmpty = !value;
      if (isEmpty) {
        validity.message = typeof obj.message === "function" ? obj.message(element) : obj.message || "";
        validity.isValid = false;
        validity.invalidKeys.push("valueMissing");
      }
      return validity;
    }
  };
  return obj;
};

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.5LXXXELE.js
var form_control_styles_default = i`
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

    &:not(.has-slotted, .has-hint) {
      display: none;
    }
  }
`;

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.F25QOBDY.js
function waitForEvent(el, eventName) {
  return new Promise((resolve) => {
    function done(event) {
      if (event.target === el) {
        el.removeEventListener(eventName, done);
        resolve();
      }
    }
    el.addEventListener(eventName, done);
  });
}

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.L6CIKOFQ.js
function animateWithClass(el, className) {
  return new Promise((resolve) => {
    const controller = new AbortController();
    const { signal } = controller;
    if (el.classList.contains(className)) {
      return;
    }
    el.classList.add(className);
    let resolved = false;
    let onEnd = () => {
      if (resolved) {
        return;
      }
      resolved = true;
      el.classList.remove(className);
      resolve();
      controller.abort();
    };
    el.addEventListener("animationend", onEnd, { once: true, signal });
    el.addEventListener("animationcancel", onEnd, { once: true, signal });
    requestAnimationFrame(() => {
      if (!resolved && el.getAnimations().length === 0) {
        onEnd();
      }
    });
  });
}

// node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directives/unsafe-html.js
var e8 = class extends i5 {
  constructor(i8) {
    if (super(i8), this.it = A, i8.type !== t4.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(r8) {
    if (r8 === A || null == r8) return this._t = void 0, this.it = r8;
    if (r8 === E) return r8;
    if ("string" != typeof r8) throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (r8 === this.it) return this._t;
    this.it = r8;
    const s4 = [r8];
    return s4.raw = s4, this._t = { _$litType$: this.constructor.resultType, strings: s4, values: [] };
  }
};
e8.directiveName = "unsafeHTML", e8.resultType = 1;
var o9 = e6(e8);

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.HCE4CV72.js
var WaSelect = class extends WebAwesomeFormAssociatedElement {
  constructor() {
    super(...arguments);
    this.assumeInteractionOn = ["blur", "input"];
    this.cachedOptions = null;
    this.hasSlotController = new HasSlotController(this, "hint", "label");
    this.localize = new LocalizeController2(this);
    this.selectionOrder = /* @__PURE__ */ new Map();
    this.typeToSelectString = "";
    this.slotChangePending = false;
    this.displayLabel = "";
    this.selectedOptions = [];
    this.name = "";
    this._defaultValue = null;
    this.size = "m";
    this.placeholder = "";
    this.multiple = false;
    this.maxOptionsVisible = 3;
    this.disabled = false;
    this.withClear = false;
    this.open = false;
    this.appearance = "outlined";
    this.pill = false;
    this.label = "";
    this.placement = "bottom";
    this.hint = "";
    this.withLabel = false;
    this.withHint = false;
    this.required = false;
    this.getTag = (option) => {
      return b2`
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
          data-value=${option.value}
          @wa-remove=${(event) => this.handleTagRemove(event, option)}
        >
          ${option.label}
        </wa-tag>
      `;
    };
    this.handleDocumentFocusIn = (event) => {
      const path = event.composedPath();
      if (this && !path.includes(this)) {
        this.hide();
      }
    };
    this.handleDocumentKeyDown = (event) => {
      const target = event.target;
      const isClearButton = target.closest('[part~="clear-button"]') !== null;
      const isButton = target.closest("wa-button") !== null;
      if (isClearButton || isButton) {
        return;
      }
      if (event.key === "Escape" && this.open && isTopDismissible(this)) {
        event.preventDefault();
        event.stopPropagation();
        this.hide();
        this.displayInput.focus({ preventScroll: true });
      }
      if (event.key === "Enter" || event.key === " " && this.typeToSelectString === "") {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!this.open) {
          this.show();
          return;
        }
        if (this.currentOption && !this.currentOption.disabled) {
          this.valueHasChanged = true;
          this.hasInteracted = true;
          if (this.multiple) {
            this.toggleOptionSelection(this.currentOption);
          } else {
            this.setSelectedOptions(this.currentOption);
          }
          this.updateComplete.then(() => {
            this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
            this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
          });
          if (!this.multiple) {
            this.hide();
            this.displayInput.focus({ preventScroll: true });
          }
        }
        return;
      }
      if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
        const allOptions = this.getAllOptions();
        const currentIndex = allOptions.indexOf(this.currentOption);
        let newIndex = Math.max(0, currentIndex);
        event.preventDefault();
        if (!this.open) {
          this.show();
          if (this.currentOption) {
            return;
          }
        }
        if (event.key === "ArrowDown") {
          newIndex = currentIndex + 1;
          if (newIndex > allOptions.length - 1) newIndex = 0;
        } else if (event.key === "ArrowUp") {
          newIndex = currentIndex - 1;
          if (newIndex < 0) newIndex = allOptions.length - 1;
        } else if (event.key === "Home") {
          newIndex = 0;
        } else if (event.key === "End") {
          newIndex = allOptions.length - 1;
        }
        this.setCurrentOption(allOptions[newIndex]);
      }
      if (event.key?.length === 1 || event.key === "Backspace") {
        const allOptions = this.getAllOptions();
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }
        if (!this.open) {
          if (event.key === "Backspace") {
            return;
          }
          this.show();
        }
        event.stopPropagation();
        event.preventDefault();
        clearTimeout(this.typeToSelectTimeout);
        this.typeToSelectTimeout = window.setTimeout(() => this.typeToSelectString = "", 1e3);
        if (event.key === "Backspace") {
          this.typeToSelectString = this.typeToSelectString.slice(0, -1);
        } else {
          this.typeToSelectString += event.key.toLowerCase();
        }
        for (const option of allOptions) {
          const label = option.label.toLowerCase();
          if (label.startsWith(this.typeToSelectString)) {
            this.setCurrentOption(option);
            break;
          }
        }
      }
    };
    this.handleDocumentMouseDown = (event) => {
      const path = event.composedPath();
      if (this && !path.includes(this)) {
        this.hide();
      }
    };
  }
  static get validators() {
    const validators = o5 ? [] : [
      RequiredValidator({
        validationElement: Object.assign(document.createElement("select"), { required: true })
      })
    ];
    return [...super.validators, ...validators];
  }
  /** Where to anchor native constraint validation */
  get validationTarget() {
    return this.valueInput;
  }
  set defaultValue(val) {
    this._defaultValue = this.convertDefaultValue(val);
  }
  get defaultValue() {
    return this.convertDefaultValue(this._defaultValue);
  }
  rawValuesEqual(a5, b4) {
    if (a5 == null && b4 == null) return true;
    if (a5 == null || b4 == null) return false;
    if (a5.length !== b4.length) return false;
    return a5.every((v3, i8) => v3 === b4[i8]);
  }
  /**
   * @private
   * A converter for defaultValue from array to string if its multiple. Also fixes some hydration issues.
   */
  convertDefaultValue(val) {
    const isMultiple = this.multiple || this.hasAttribute("multiple");
    if (!isMultiple && Array.isArray(val)) {
      val = val[0];
    }
    return val;
  }
  set value(val) {
    let oldValue = this.value;
    if (val instanceof FormData) {
      val = val.getAll(this.name);
    }
    if (val != null && !Array.isArray(val)) {
      val = [val];
    }
    const oldRawValue = this._value;
    this._value = val ?? null;
    if (!this.rawValuesEqual(oldRawValue, this._value)) {
      this.valueHasChanged = true;
      this.requestUpdate("value", oldValue);
    }
  }
  get value() {
    let value = this._value ?? this.defaultValue ?? null;
    if (value != null) {
      value = Array.isArray(value) ? value : [value];
    }
    this.optionValues = new Set(
      this.getAllOptions().filter((option) => !option.disabled).map((option) => option.value)
    );
    let ret = value;
    if (value != null) {
      ret = value.filter((v3) => this.optionValues.has(v3));
      ret = this.multiple ? ret : ret[0];
      ret = ret ?? null;
    }
    return ret;
  }
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  connectedCallback() {
    super.connectedCallback();
    this.processSlotChange();
    this.open = false;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeOpenListeners();
    this.cachedOptions = null;
  }
  updateDefaultValue() {
    const allOptions = this.getAllOptions();
    const defaultSelectedOptions = allOptions.filter((el) => el.hasAttribute("selected") || el.defaultSelected);
    if (defaultSelectedOptions.length > 0) {
      const selectedValues2 = defaultSelectedOptions.map((el) => el.value);
      this._defaultValue = this.multiple ? selectedValues2 : selectedValues2[0];
    }
    if (this.hasAttribute("value")) {
      this._defaultValue = this.getAttribute("value") || null;
    }
  }
  addOpenListeners() {
    document.addEventListener("focusin", this.handleDocumentFocusIn);
    document.addEventListener("keydown", this.handleDocumentKeyDown);
    document.addEventListener("mousedown", this.handleDocumentMouseDown);
    registerDismissible(this);
    if (this.getRootNode() !== document) {
      this.getRootNode().addEventListener("focusin", this.handleDocumentFocusIn);
    }
  }
  removeOpenListeners() {
    document.removeEventListener("focusin", this.handleDocumentFocusIn);
    document.removeEventListener("keydown", this.handleDocumentKeyDown);
    document.removeEventListener("mousedown", this.handleDocumentMouseDown);
    unregisterDismissible(this);
    if (this.getRootNode() !== document) {
      this.getRootNode().removeEventListener("focusin", this.handleDocumentFocusIn);
    }
  }
  handleFocus() {
    this.displayInput.setSelectionRange(0, 0);
  }
  handleLabelClick() {
    this.displayInput.focus();
  }
  handleComboboxClick(event) {
    event.preventDefault();
  }
  handleComboboxMouseDown(event) {
    const path = event.composedPath();
    const isButton = path.some((el) => el instanceof Element && el.tagName.toLowerCase() === "wa-button");
    if (this.disabled || isButton) {
      return;
    }
    event.preventDefault();
    this.displayInput.focus({ preventScroll: true });
    this.open = !this.open;
  }
  handleComboboxKeyDown(event) {
    event.stopPropagation();
    this.handleDocumentKeyDown(event);
  }
  handleClearClick(event) {
    event.stopPropagation();
    this.hasInteracted = true;
    this.valueHasChanged = true;
    if (this.value !== null) {
      this.displayLabel = "";
      this.selectionOrder.clear();
      this.setSelectedOptions([]);
      this.displayInput.focus({ preventScroll: true });
      this.updateComplete.then(() => {
        this.dispatchEvent(new WaClearEvent());
        this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      });
    }
  }
  handleClearMouseDown(event) {
    event.stopPropagation();
    event.preventDefault();
  }
  handleOptionClick(event) {
    const target = event.target;
    const option = target.closest("wa-option");
    if (option && !option.disabled) {
      this.hasInteracted = true;
      this.valueHasChanged = true;
      if (this.multiple) {
        this.toggleOptionSelection(option);
      } else {
        this.setSelectedOptions(option);
      }
      this.updateComplete.then(() => this.displayInput.focus({ preventScroll: true }));
      this.requestUpdate("value");
      this.updateComplete.then(() => {
        this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      });
      if (!this.multiple) {
        this.hide();
        this.displayInput.focus({ preventScroll: true });
      }
    }
  }
  /* @internal - used by options to update labels */
  handleDefaultSlotChange() {
    if (this.slotChangePending) return;
    this.slotChangePending = true;
    queueMicrotask(() => {
      this.slotChangePending = false;
      this.processSlotChange();
    });
  }
  processSlotChange() {
    if (!customElements.get("wa-option")) {
      customElements.whenDefined("wa-option").then(() => this.handleDefaultSlotChange());
    }
    if (this.didSSR && !this.hasUpdated) {
      this.updateComplete.then(() => {
        this.handleDefaultSlotChange();
      });
      return;
    }
    this.cachedOptions = null;
    const allOptions = this.getAllOptions();
    this.updateDefaultValue();
    let value = this.value;
    if (value == null || !this.valueHasChanged && !this.hasInteracted) {
      this.selectionChanged();
      return;
    }
    if (!Array.isArray(value)) {
      value = [value];
    }
    const selectedOptions = allOptions.filter((el) => value.includes(el.value));
    this.setSelectedOptions(selectedOptions);
  }
  handleTagRemove(event, directOption) {
    event.stopPropagation();
    if (this.disabled) return;
    this.hasInteracted = true;
    this.valueHasChanged = true;
    let option = directOption;
    if (!option) {
      const tagElement = event.target.closest("wa-tag[data-value]");
      if (tagElement) {
        const value = tagElement.dataset.value;
        option = this.selectedOptions.find((opt) => opt.value === value);
      }
    }
    if (option) {
      this.toggleOptionSelection(option, false);
      this.updateComplete.then(() => {
        this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      });
    }
  }
  // Gets an array of all `<wa-option>` elements
  getAllOptions() {
    if (this.cachedOptions) return this.cachedOptions;
    if (!this?.querySelectorAll) {
      return [];
    }
    this.cachedOptions = [...this.querySelectorAll("wa-option")];
    return this.cachedOptions;
  }
  // Gets the first `<wa-option>` element
  getFirstOption() {
    return this.querySelector("wa-option");
  }
  // Sets the current option, which is the option the user is currently interacting with (e.g. via keyboard). Only one
  // option may be "current" at a time.
  setCurrentOption(option) {
    const allOptions = this.getAllOptions();
    allOptions.forEach((el) => {
      el.current = false;
      el.tabIndex = -1;
    });
    if (option) {
      this.currentOption = option;
      option.current = true;
      option.tabIndex = 0;
      option.focus({ preventScroll: true });
      if (this.open && !this.listbox.hidden) {
        scrollIntoView(option, this.listbox, "vertical", "auto");
      }
    }
  }
  // Sets the selected option(s)
  setSelectedOptions(option) {
    const allOptions = this.getAllOptions();
    const newSelectedOptions = Array.isArray(option) ? option : [option];
    allOptions.forEach((el) => {
      if (newSelectedOptions.includes(el)) {
        return;
      }
      el.selected = false;
    });
    if (newSelectedOptions.length) {
      newSelectedOptions.forEach((el) => el.selected = true);
    }
    this.selectionChanged();
  }
  // Toggles an option's selected state
  toggleOptionSelection(option, force) {
    if (force === true || force === false) {
      option.selected = force;
    } else {
      option.selected = !option.selected;
    }
    this.selectionChanged();
  }
  // @internal This method must be called whenever the selection changes. It will update the selected options cache, the
  // current value, and the display value. The option component uses it internally to update labels as they change.
  selectionChanged() {
    const options = this.getAllOptions();
    const newSelectedOptions = options.filter((el) => {
      if (!this.hasInteracted && !this.valueHasChanged) {
        const defaultValue = this.defaultValue;
        const defaultValues = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
        return el.hasAttribute("selected") || el.defaultSelected || el.selected || defaultValues?.includes(el.value);
      }
      return el.selected;
    });
    const newSelectedValues = new Set(newSelectedOptions.map((el) => el.value));
    for (const value of this.selectionOrder.keys()) {
      if (!newSelectedValues.has(value)) {
        this.selectionOrder.delete(value);
      }
    }
    const maxOrder = this.selectionOrder.size > 0 ? Math.max(...this.selectionOrder.values()) : -1;
    let nextOrder = maxOrder + 1;
    for (const option of newSelectedOptions) {
      if (!this.selectionOrder.has(option.value)) {
        this.selectionOrder.set(option.value, nextOrder++);
      }
    }
    this.selectedOptions = newSelectedOptions.sort((a5, b4) => {
      const orderA = this.selectionOrder.get(a5.value) ?? 0;
      const orderB = this.selectionOrder.get(b4.value) ?? 0;
      return orderA - orderB;
    });
    let selectedValues2 = new Set(this.selectedOptions.map((el) => el.value));
    if (selectedValues2.size > 0 || this._value) {
      const oldValue = this._value;
      if (this._value == null) {
        let value = this.defaultValue ?? [];
        this._value = Array.isArray(value) ? value : [value];
      }
      this._value = this._value?.filter((value) => !this.optionValues?.has(value)) ?? null;
      this._value?.unshift(...selectedValues2);
      this.requestUpdate("value", oldValue);
    }
    if (this.multiple) {
      if (this.placeholder && !this.value?.length) {
        this.displayLabel = "";
      } else {
        this.displayLabel = this.localize.term("numOptionsSelected", this.selectedOptions.length);
      }
    } else {
      const selectedOption = this.selectedOptions[0];
      this.displayLabel = selectedOption?.label ?? "";
    }
    this.updateComplete.then(() => {
      this.updateValidity();
    });
  }
  get tags() {
    return this.selectedOptions.map((option, index) => {
      if (index < this.maxOptionsVisible || this.maxOptionsVisible <= 0) {
        const tag = this.getTag(option, index);
        if (!tag) return null;
        return typeof tag === "string" ? o9(tag) : tag;
      } else if (index === this.maxOptionsVisible) {
        return b2`
          <wa-tag
            part="tag"
            exportparts="
              base:tag__base,
              content:tag__content,
              remove-button:tag__remove-button,
              remove-button__base:tag__remove-button__base
            "
            >+${this.selectedOptions.length - index}</wa-tag
          >
        `;
      }
      return null;
    });
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("value") || changedProperties.has("displayLabel")) {
      this.customStates.set("blank", !this.value && !this.displayLabel);
    }
  }
  handleDisabledChange() {
    if (this.disabled && this.open) {
      this.open = false;
    }
  }
  handleValueChange() {
    const allOptions = this.getAllOptions();
    const value = Array.isArray(this.value) ? this.value : [this.value];
    const selectedOptions = allOptions.filter((el) => value.includes(el.value));
    this.setSelectedOptions(selectedOptions);
    this.updateValidity();
  }
  async handleOpenChange() {
    if (this.open && !this.disabled) {
      this.setCurrentOption(this.selectedOptions[0] || this.getFirstOption());
      const waShowEvent = new WaShowEvent();
      this.dispatchEvent(waShowEvent);
      if (waShowEvent.defaultPrevented) {
        this.open = false;
        return;
      }
      this.addOpenListeners();
      this.listbox.hidden = false;
      this.popup.active = true;
      requestAnimationFrame(() => {
        this.setCurrentOption(this.currentOption);
      });
      await animateWithClass(this.popup.popup, "show");
      if (this.currentOption) {
        scrollIntoView(this.currentOption, this.listbox, "vertical", "auto");
      }
      this.dispatchEvent(new WaAfterShowEvent());
    } else {
      const waHideEvent = new WaHideEvent();
      this.dispatchEvent(waHideEvent);
      if (waHideEvent.defaultPrevented) {
        this.open = false;
        return;
      }
      this.removeOpenListeners();
      await animateWithClass(this.popup.popup, "hide");
      this.listbox.hidden = true;
      this.popup.active = false;
      this.dispatchEvent(new WaAfterHideEvent());
    }
  }
  /** Shows the listbox. */
  async show() {
    if (this.open || this.disabled) {
      this.open = false;
      return void 0;
    }
    this.open = true;
    return waitForEvent(this, "wa-after-show");
  }
  /** Hides the listbox. */
  async hide() {
    if (!this.open || this.disabled) {
      this.open = false;
      return void 0;
    }
    this.open = false;
    return waitForEvent(this, "wa-after-hide");
  }
  /** Sets focus on the control. */
  focus(options) {
    this.displayInput.focus(options);
  }
  /** Removes focus from the control. */
  blur() {
    this.displayInput.blur();
  }
  formResetCallback() {
    this.selectionOrder.clear();
    this.value = this.defaultValue;
    super.formResetCallback();
    this.handleValueChange();
    this.updateComplete.then(() => {
      this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }
  render() {
    const hasLabelSlot = this.hasSlotController.test("label", "withLabel");
    const hasHintSlot = this.hasSlotController.test("hint", "withHint");
    const hasLabel = this.label ? true : !!hasLabelSlot;
    const hasHint = this.hint ? true : !!hasHintSlot;
    const hasClearIcon = (this.hasUpdated || o5) && this.withClear && !this.disabled && (this.displayLabel || this.value && this.value.length > 0);
    return b2`
      <div
        part="form-control"
        class=${e7({
      "form-control": true,
      "form-control-has-label": hasLabel
    })}
      >
        <label
          id="label"
          part="form-control-label label"
          class=${e7({
      label: true,
      "has-label": hasLabel
    })}
          aria-hidden=${hasLabel ? "false" : "true"}
          @click=${this.handleLabelClick}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <wa-popup
            class=${e7({
      select: true,
      open: this.open,
      disabled: this.disabled,
      enabled: !this.disabled,
      multiple: this.multiple
    })}
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
                aria-expanded=${this.open ? "true" : "false"}
                aria-haspopup="listbox"
                aria-labelledby="label"
                aria-disabled=${this.disabled ? "true" : "false"}
                aria-describedby="hint"
                role="combobox"
                tabindex="0"
                @focus=${this.handleFocus}
              />

              <!-- Tags need to wait for first hydration before populating otherwise it will create a hydration mismatch. -->
              ${this.multiple && this.hasUpdated ? b2`<div part="tags" class="tags" @wa-remove=${this.handleTagRemove}>${this.tags}</div>` : ""}

              <input
                class="value-input"
                type="text"
                ?disabled=${this.disabled}
                ?required=${this.required}
                .value=${Array.isArray(this.value) ? this.value.join(", ") : this.value}
                tabindex="-1"
                aria-hidden="true"
                @focus=${() => this.focus()}
              />

              ${hasClearIcon ? b2`
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
                  ` : ""}

              <slot name="end" part="end" class="end"></slot>

              <slot name="expand-icon" part="expand-icon" class="expand-icon">
                <wa-icon library="system" name="chevron-down" variant="solid"></wa-icon>
              </slot>
            </div>

            <div
              id="listbox"
              role="listbox"
              aria-expanded=${this.open ? "true" : "false"}
              aria-multiselectable=${this.multiple ? "true" : "false"}
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
          class=${e7({
      "has-slotted": hasHint
    })}
          aria-hidden=${hasHint ? "false" : "true"}
          >${this.hint}</slot
        >
      </div>
    `;
  }
};
WaSelect.css = [select_styles_default, form_control_styles_default, size_styles_default];
__decorateClass([
  e5(".select")
], WaSelect.prototype, "popup", 2);
__decorateClass([
  e5(".combobox")
], WaSelect.prototype, "combobox", 2);
__decorateClass([
  e5(".display-input")
], WaSelect.prototype, "displayInput", 2);
__decorateClass([
  e5(".value-input")
], WaSelect.prototype, "valueInput", 2);
__decorateClass([
  e5(".listbox")
], WaSelect.prototype, "listbox", 2);
__decorateClass([
  r5()
], WaSelect.prototype, "displayLabel", 2);
__decorateClass([
  r5()
], WaSelect.prototype, "currentOption", 2);
__decorateClass([
  r5()
], WaSelect.prototype, "selectedOptions", 2);
__decorateClass([
  n4({ reflect: true })
], WaSelect.prototype, "name", 2);
__decorateClass([
  n4({
    attribute: false
  })
], WaSelect.prototype, "defaultValue", 1);
__decorateClass([
  n4({ attribute: "value", reflect: false })
], WaSelect.prototype, "value", 1);
__decorateClass([
  n4({ reflect: true })
], WaSelect.prototype, "size", 2);
__decorateClass([
  watch("size")
], WaSelect.prototype, "handleSizeChange", 1);
__decorateClass([
  n4()
], WaSelect.prototype, "placeholder", 2);
__decorateClass([
  n4({ type: Boolean, reflect: true })
], WaSelect.prototype, "multiple", 2);
__decorateClass([
  n4({ attribute: "max-options-visible", type: Number })
], WaSelect.prototype, "maxOptionsVisible", 2);
__decorateClass([
  n4({ type: Boolean })
], WaSelect.prototype, "disabled", 2);
__decorateClass([
  n4({ attribute: "with-clear", type: Boolean })
], WaSelect.prototype, "withClear", 2);
__decorateClass([
  n4({ type: Boolean, reflect: true })
], WaSelect.prototype, "open", 2);
__decorateClass([
  n4({ reflect: true })
], WaSelect.prototype, "appearance", 2);
__decorateClass([
  n4({ type: Boolean, reflect: true })
], WaSelect.prototype, "pill", 2);
__decorateClass([
  n4()
], WaSelect.prototype, "label", 2);
__decorateClass([
  n4({ reflect: true })
], WaSelect.prototype, "placement", 2);
__decorateClass([
  n4({ attribute: "hint" })
], WaSelect.prototype, "hint", 2);
__decorateClass([
  n4({ attribute: "with-label", type: Boolean })
], WaSelect.prototype, "withLabel", 2);
__decorateClass([
  n4({ attribute: "with-hint", type: Boolean })
], WaSelect.prototype, "withHint", 2);
__decorateClass([
  n4({ type: Boolean, reflect: true })
], WaSelect.prototype, "required", 2);
__decorateClass([
  n4({ attribute: false })
], WaSelect.prototype, "getTag", 2);
__decorateClass([
  watch("disabled", { waitUntilFirstUpdate: true })
], WaSelect.prototype, "handleDisabledChange", 1);
__decorateClass([
  watch("value", { waitUntilFirstUpdate: true })
], WaSelect.prototype, "handleValueChange", 1);
__decorateClass([
  watch("open", { waitUntilFirstUpdate: true })
], WaSelect.prototype, "handleOpenChange", 1);
WaSelect = __decorateClass([
  t3("wa-select")
], WaSelect);
WaSelect.disableWarning?.("change-in-update");

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.HPULLNVR.js
var WaRemoveEvent = class extends Event {
  constructor() {
    super("wa-remove", { bubbles: true, cancelable: false, composed: true });
  }
};

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.4AHPL3WP.js
var tag_styles_default = i`
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
`;

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.37OOIOGE.js
var WaTag = class extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController2(this);
    this.variant = "neutral";
    this.appearance = "filled-outlined";
    this.size = "m";
    this.pill = false;
    this.withRemove = false;
  }
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  handleRemoveClick() {
    this.dispatchEvent(new WaRemoveEvent());
  }
  render() {
    return b2`
      <slot part="content" class="content"></slot>

      ${this.withRemove ? b2`
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
          ` : ""}
    `;
  }
};
WaTag.css = [tag_styles_default, variants_styles_default, size_styles_default];
__decorateClass([
  n4({ reflect: true })
], WaTag.prototype, "variant", 2);
__decorateClass([
  n4({ reflect: true })
], WaTag.prototype, "appearance", 2);
__decorateClass([
  n4({ reflect: true })
], WaTag.prototype, "size", 2);
__decorateClass([
  watch("size")
], WaTag.prototype, "handleSizeChange", 1);
__decorateClass([
  n4({ type: Boolean, reflect: true })
], WaTag.prototype, "pill", 2);
__decorateClass([
  n4({ attribute: "with-remove", type: Boolean })
], WaTag.prototype, "withRemove", 2);
WaTag = __decorateClass([
  t3("wa-tag")
], WaTag);

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.ZWQCGLB5.js
var WaRepositionEvent = class extends Event {
  constructor() {
    super("wa-reposition", { bubbles: true, cancelable: false, composed: true });
  }
};

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.HS5AYC6E.js
var popup_styles_default = i`
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
`;

// node_modules/.pnpm/@floating-ui+utils@0.2.12/node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var min = Math.min;
var max = Math.max;
var round = Math.round;
var floor = Math.floor;
var createCoords = (v3) => ({
  x: v3,
  y: v3
});
var oppositeSideMap = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function clamp(start, value, end) {
  return max(start, min(value, end));
}
function evaluate(value, param) {
  return typeof value === "function" ? value(param) : value;
}
function getSide(placement) {
  return placement.split("-")[0];
}
function getAlignment(placement) {
  return placement.split("-")[1];
}
function getOppositeAxis(axis) {
  return axis === "x" ? "y" : "x";
}
function getAxisLength(axis) {
  return axis === "y" ? "height" : "width";
}
function getSideAxis(placement) {
  const firstChar = placement[0];
  return firstChar === "t" || firstChar === "b" ? "y" : "x";
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.includes("start") ? placement.replace("start", "end") : placement.replace("end", "start");
}
var lrPlacement = ["left", "right"];
var rlPlacement = ["right", "left"];
var tbPlacement = ["top", "bottom"];
var btPlacement = ["bottom", "top"];
function getSideList(side, isStart, rtl) {
  switch (side) {
    case "top":
    case "bottom":
      if (rtl) return isStart ? rlPlacement : lrPlacement;
      return isStart ? lrPlacement : rlPlacement;
    case "left":
    case "right":
      return isStart ? tbPlacement : btPlacement;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === "start", rtl);
  if (alignment) {
    list = list.map((side) => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  const side = getSide(placement);
  return oppositeSideMap[side] + placement.slice(side.length);
}
function expandPaddingObject(padding) {
  var _padding$top, _padding$right, _padding$bottom, _padding$left;
  return {
    top: (_padding$top = padding.top) != null ? _padding$top : 0,
    right: (_padding$right = padding.right) != null ? _padding$right : 0,
    bottom: (_padding$bottom = padding.bottom) != null ? _padding$bottom : 0,
    left: (_padding$left = padding.left) != null ? _padding$left : 0
  };
}
function getPaddingObject(padding) {
  return typeof padding !== "number" ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  const {
    x: x3,
    y: y4,
    width,
    height
  } = rect;
  return {
    width,
    height,
    top: y4,
    left: x3,
    right: x3 + width,
    bottom: y4 + height,
    x: x3,
    y: y4
  };
}

// node_modules/.pnpm/@floating-ui+core@1.8.0/node_modules/@floating-ui/core/dist/floating-ui.core.mjs
function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === "y";
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case "top":
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case "bottom":
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case "right":
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case "left":
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  const alignment = getAlignment(placement);
  if (alignment) {
    coords[alignmentAxis] += commonAlign * (alignment === "end" ? 1 : -1) * (rtl && isVertical ? -1 : 1);
  }
  return coords;
}
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x: x3,
    y: y4,
    platform: platform2,
    rects,
    elements,
    strategy
  } = state;
  const {
    boundary = "clippingAncestors",
    rootBoundary = "viewport",
    elementContext = "floating",
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === "floating" ? "reference" : "floating";
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform2.getClippingRect({
    element: ((_await$platform$isEle = await (platform2.isElement == null ? void 0 : platform2.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform2.getDocumentElement == null ? void 0 : platform2.getDocumentElement(elements.floating)),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === "floating" ? {
    x: x3,
    y: y4,
    width: rects.floating.width,
    height: rects.floating.height
  } : rects.reference;
  const offsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(elements.floating));
  const offsetScale = await (platform2.isElement == null ? void 0 : platform2.isElement(offsetParent)) && await (platform2.getScale == null ? void 0 : platform2.getScale(offsetParent)) || {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform2.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform2.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements,
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}
var MAX_RESET_COUNT = 50;
var computePosition = async (reference, floating, config) => {
  const {
    placement = "bottom",
    strategy = "absolute",
    middleware = [],
    platform: platform2
  } = config;
  const platformWithDetectOverflow = platform2.detectOverflow ? platform2 : {
    ...platform2,
    detectOverflow
  };
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(floating));
  let rects = await platform2.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x: x3,
    y: y4
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let resetCount = 0;
  const middlewareData = {};
  for (let i8 = 0; i8 < middleware.length; i8++) {
    const currentMiddleware = middleware[i8];
    if (!currentMiddleware) {
      continue;
    }
    const {
      name,
      fn: fn2
    } = currentMiddleware;
    const {
      x: nextX,
      y: nextY,
      data,
      reset
    } = await fn2({
      x: x3,
      y: y4,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform: platformWithDetectOverflow,
      elements: {
        reference,
        floating
      }
    });
    x3 = nextX != null ? nextX : x3;
    y4 = nextY != null ? nextY : y4;
    middlewareData[name] = {
      ...middlewareData[name],
      ...data
    };
    if (reset && resetCount < MAX_RESET_COUNT) {
      resetCount++;
      if (typeof reset === "object") {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform2.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({
          x: x3,
          y: y4
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i8 = -1;
    }
  }
  return {
    x: x3,
    y: y4,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};
var arrow = (options) => ({
  name: "arrow",
  options,
  async fn(state) {
    const {
      x: x3,
      y: y4,
      placement,
      rects,
      platform: platform2,
      elements,
      middlewareData
    } = state;
    const {
      element,
      padding = 0
    } = evaluate(options, state) || {};
    if (element == null) {
      return {};
    }
    const paddingObject = getPaddingObject(padding);
    const coords = {
      x: x3,
      y: y4
    };
    const axis = getAlignmentAxis(placement);
    const length = getAxisLength(axis);
    const arrowDimensions = await platform2.getDimensions(element);
    const isYAxis = axis === "y";
    const minProp = isYAxis ? "top" : "left";
    const maxProp = isYAxis ? "bottom" : "right";
    const clientProp = isYAxis ? "clientHeight" : "clientWidth";
    const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
    const startDiff = coords[axis] - rects.reference[axis];
    const arrowOffsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(element));
    let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;
    if (!clientSize || !await (platform2.isElement == null ? void 0 : platform2.isElement(arrowOffsetParent))) {
      clientSize = elements.floating[clientProp] || rects.floating[length];
    }
    const centerToReference = endDiff / 2 - startDiff / 2;
    const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
    const minPadding = min(paddingObject[minProp], largestPossiblePadding);
    const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);
    const max2 = clientSize - arrowDimensions[length] - maxPadding;
    const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
    const offset3 = clamp(minPadding, center, max2);
    const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset3 && rects.reference[length] / 2 - (center < minPadding ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
    const alignmentOffset = shouldAddOffset ? center < minPadding ? center - minPadding : center - max2 : 0;
    return {
      [axis]: coords[axis] + alignmentOffset,
      data: {
        [axis]: offset3,
        centerOffset: center - offset3 - alignmentOffset,
        ...shouldAddOffset && {
          alignmentOffset
        }
      },
      reset: shouldAddOffset
    };
  }
});
var flip = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "flip",
    options,
    async fn(state) {
      var _middlewareData$arrow, _middlewareData$flip;
      const {
        placement,
        middlewareData,
        rects,
        initialPlacement,
        platform: platform2,
        elements
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true,
        fallbackPlacements: specifiedFallbackPlacements,
        fallbackStrategy = "bestFit",
        fallbackAxisSideDirection = "none",
        flipAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state);
      if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      const side = getSide(placement);
      const initialSideAxis = getSideAxis(initialPlacement);
      const isBasePlacement = getSide(initialPlacement) === initialPlacement;
      const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
      const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
      if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
        fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
      }
      const placements2 = [initialPlacement, ...fallbackPlacements];
      const overflow = await platform2.detectOverflow(state, detectOverflowOptions);
      const overflows = [];
      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
      if (checkMainAxis) {
        overflows.push(overflow[side]);
      }
      if (checkCrossAxis) {
        const sides2 = getAlignmentSides(placement, rects, rtl);
        overflows.push(overflow[sides2[0]], overflow[sides2[1]]);
      }
      overflowsData = [...overflowsData, {
        placement,
        overflows
      }];
      if (!overflows.every((side2) => side2 <= 0)) {
        var _middlewareData$flip2, _overflowsData$filter;
        const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
        const nextPlacement = placements2[nextIndex];
        if (nextPlacement) {
          const ignoreCrossAxisOverflow = checkCrossAxis === "alignment" ? initialSideAxis !== getSideAxis(nextPlacement) : false;
          if (!ignoreCrossAxisOverflow || // We leave the current main axis only if every placement on that axis
          // overflows the main axis.
          overflowsData.every((d4) => getSideAxis(d4.placement) === initialSideAxis ? d4.overflows[0] > 0 : true)) {
            return {
              data: {
                index: nextIndex,
                overflows: overflowsData
              },
              reset: {
                placement: nextPlacement
              }
            };
          }
        }
        let resetPlacement = (_overflowsData$filter = overflowsData.filter((d4) => d4.overflows[0] <= 0).sort((a5, b4) => a5.overflows[1] - b4.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
        if (!resetPlacement) {
          switch (fallbackStrategy) {
            case "bestFit": {
              var _overflowsData$filter2;
              const placement2 = (_overflowsData$filter2 = overflowsData.filter((d4) => {
                if (hasFallbackAxisSideDirection) {
                  const currentSideAxis = getSideAxis(d4.placement);
                  return currentSideAxis === initialSideAxis || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  currentSideAxis === "y";
                }
                return true;
              }).map((d4) => [d4.placement, d4.overflows.filter((overflow2) => overflow2 > 0).reduce((acc, overflow2) => acc + overflow2, 0)]).sort((a5, b4) => a5[1] - b4[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
              if (placement2) {
                resetPlacement = placement2;
              }
              break;
            }
            case "initialPlacement":
              resetPlacement = initialPlacement;
              break;
          }
        }
        if (placement !== resetPlacement) {
          return {
            reset: {
              placement: resetPlacement
            }
          };
        }
      }
      return {};
    }
  };
};
var originSides = /* @__PURE__ */ new Set(["left", "top"]);
async function convertValueToCoords(state, options) {
  const {
    placement,
    platform: platform2,
    elements
  } = state;
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === "y";
  const mainAxisMulti = originSides.has(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state);
  let {
    mainAxis,
    crossAxis,
    alignmentAxis
  } = typeof rawValue === "number" ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: rawValue.mainAxis || 0,
    crossAxis: rawValue.crossAxis || 0,
    alignmentAxis: rawValue.alignmentAxis
  };
  if (alignment && typeof alignmentAxis === "number") {
    crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}
var offset = function(options) {
  if (options === void 0) {
    options = 0;
  }
  return {
    name: "offset",
    options,
    async fn(state) {
      var _middlewareData$offse, _middlewareData$arrow;
      const {
        x: x3,
        y: y4,
        placement,
        middlewareData
      } = state;
      const diffCoords = await convertValueToCoords(state, options);
      if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      return {
        x: x3 + diffCoords.x,
        y: y4 + diffCoords.y,
        data: {
          ...diffCoords,
          placement
        }
      };
    }
  };
};
var shift = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "shift",
    options,
    async fn(state) {
      const {
        x: x3,
        y: y4,
        placement,
        platform: platform2
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = false,
        limiter = {
          fn: (_ref) => {
            let {
              x: x4,
              y: y5
            } = _ref;
            return {
              x: x4,
              y: y5
            };
          }
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const coords = {
        x: x3,
        y: y4
      };
      const overflow = await platform2.detectOverflow(state, detectOverflowOptions);
      const crossAxis = getSideAxis(placement);
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      const clampCoord = (axis, coord) => clamp(coord + overflow[axis === "y" ? "top" : "left"], coord, coord - overflow[axis === "y" ? "bottom" : "right"]);
      if (checkMainAxis) {
        mainAxisCoord = clampCoord(mainAxis, mainAxisCoord);
      }
      if (checkCrossAxis) {
        crossAxisCoord = clampCoord(crossAxis, crossAxisCoord);
      }
      const limitedCoords = limiter.fn({
        ...state,
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      });
      return {
        ...limitedCoords,
        data: {
          x: limitedCoords.x - x3,
          y: limitedCoords.y - y4,
          enabled: {
            [mainAxis]: checkMainAxis,
            [crossAxis]: checkCrossAxis
          }
        }
      };
    }
  };
};
var size = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "size",
    options,
    async fn(state) {
      const {
        placement,
        rects,
        platform: platform2,
        elements
      } = state;
      const {
        apply = () => {
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const overflow = await platform2.detectOverflow(state, detectOverflowOptions);
      const side = getSide(placement);
      const alignment = getAlignment(placement);
      const isYAxis = getSideAxis(placement) === "y";
      const {
        width,
        height
      } = rects.floating;
      let heightSide;
      let widthSide;
      if (side === "top" || side === "bottom") {
        heightSide = side;
        widthSide = alignment === (await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating)) ? "start" : "end") ? "left" : "right";
      } else {
        widthSide = side;
        heightSide = alignment === "end" ? "top" : "bottom";
      }
      const maximumClippingHeight = height - overflow.top - overflow.bottom;
      const maximumClippingWidth = width - overflow.left - overflow.right;
      const overflowAvailableHeight = min(height - overflow[heightSide], maximumClippingHeight);
      const overflowAvailableWidth = min(width - overflow[widthSide], maximumClippingWidth);
      const shiftData = state.middlewareData.shift;
      const noShift = !shiftData;
      let availableHeight = overflowAvailableHeight;
      let availableWidth = overflowAvailableWidth;
      if (shiftData != null && shiftData.enabled.x) {
        availableWidth = maximumClippingWidth;
      }
      if (shiftData != null && shiftData.enabled.y) {
        availableHeight = maximumClippingHeight;
      }
      if (noShift && !alignment) {
        if (isYAxis) {
          availableWidth = width - 2 * max(overflow.left, overflow.right);
        } else {
          availableHeight = height - 2 * max(overflow.top, overflow.bottom);
        }
      }
      await apply({
        ...state,
        availableWidth,
        availableHeight
      });
      const nextDimensions = await platform2.getDimensions(elements.floating);
      if (width !== nextDimensions.width || height !== nextDimensions.height) {
        return {
          reset: {
            rects: true
          }
        };
      }
      return {};
    }
  };
};

// node_modules/.pnpm/@floating-ui+utils@0.2.12/node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function hasWindow() {
  return typeof window !== "undefined";
}
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || "").toLowerCase();
  }
  return "#document";
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (!hasWindow() || typeof ShadowRoot === "undefined") {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle2(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && display !== "inline" && display !== "contents";
}
function isTableElement(element) {
  return /^(table|td|th)$/.test(getNodeName(element));
}
function isTopLayer(element) {
  try {
    if (element.matches(":popover-open")) {
      return true;
    }
  } catch (_e2) {
  }
  try {
    return element.matches(":modal");
  } catch (_e2) {
    return false;
  }
}
var willChangeRe = /transform|translate|scale|rotate|perspective|filter/;
var containRe = /paint|layout|strict|content/;
var isNotNone = (value) => !!value && value !== "none";
var isWebKitValue;
function isContainingBlock(elementOrCss) {
  const css = isElement(elementOrCss) ? getComputedStyle2(elementOrCss) : elementOrCss;
  return isNotNone(css.transform) || isNotNone(css.translate) || isNotNone(css.scale) || isNotNone(css.rotate) || isNotNone(css.perspective) || !isWebKit() && (isNotNone(css.backdropFilter) || isNotNone(css.filter)) || willChangeRe.test(css.willChange || "") || containRe.test(css.contain || "");
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else if (isTopLayer(currentNode)) {
      return null;
    }
    currentNode = getParentNode(currentNode);
  }
  return null;
}
function isWebKit() {
  if (isWebKitValue == null) {
    isWebKitValue = typeof CSS !== "undefined" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none");
  }
  return isWebKitValue;
}
function isLastTraversableNode(node) {
  return /^(html|body|#document)$/.test(getNodeName(node));
}
function getComputedStyle2(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.scrollX,
    scrollTop: element.scrollY
  };
}
function getParentNode(node) {
  if (getNodeName(node) === "html") {
    return node;
  }
  const result = (
    // Step into the shadow DOM of the parent of a slotted node.
    node.assignedSlot || // DOM Element detected.
    node.parentNode || // ShadowRoot detected.
    isShadowRoot(node) && node.host || // Fallback.
    getDocumentElement(node)
  );
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return (node.ownerDocument || node).body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    const frameElement = getFrameElement(win);
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
  } else {
    return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
  }
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}

// node_modules/.pnpm/@floating-ui+dom@1.8.0/node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function getCssDimensions(element) {
  const css = getComputedStyle2(element);
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
  const hasOffset = isHTMLElement(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}
function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}
function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $: $4
  } = getCssDimensions(domElement);
  let x3 = ($4 ? round(rect.width) : rect.width) / width;
  let y4 = ($4 ? round(rect.height) : rect.height) / height;
  if (!x3 || !Number.isFinite(x3)) {
    x3 = 1;
  }
  if (!y4 || !Number.isFinite(y4)) {
    y4 = 1;
  }
  return {
    x: x3,
    y: y4
  };
}
var noOffsets = /* @__PURE__ */ createCoords(0);
function getVisualOffsets(element) {
  const win = getWindow(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  return !!floatingOffsetParent && isFixed && floatingOffsetParent === getWindow(element);
}
function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x3 = (clientRect.left + visualOffsets.x) / scale.x;
  let y4 = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement && offsetParent) {
    const win = getWindow(domElement);
    const offsetWin = isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);
    while (currentIFrame && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle2(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x3 *= iframeScale.x;
      y4 *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x3 += left;
      y4 += top;
      currentWin = getWindow(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }
  return rectToClientRect({
    width,
    height,
    x: x3,
    y: y4
  });
}
function getWindowScrollBarX(element, rect) {
  const leftScroll = getNodeScroll(element).scrollLeft;
  if (!rect) {
    return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
  }
  return rect.left + leftScroll;
}
function getHTMLOffset(documentElement, scroll) {
  const htmlRect = documentElement.getBoundingClientRect();
  const x3 = htmlRect.left + scroll.scrollLeft - getWindowScrollBarX(documentElement, htmlRect);
  const y4 = htmlRect.top + scroll.scrollTop;
  return {
    x: x3,
    y: y4
  };
}
function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    elements,
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isFixed = strategy === "fixed";
  const documentElement = getDocumentElement(offsetParent);
  const topLayer = elements ? isTopLayer(elements.floating) : false;
  if (offsetParent === documentElement || topLayer && isFixed) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  if (isOffsetParentAnElement || !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
  };
}
function getClientRects(element) {
  return element.getClientRects ? Array.from(element.getClientRects()) : [];
}
function getDocumentRect(html) {
  const scroll = getNodeScroll(html);
  const body = html.ownerDocument.body;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x3 = -scroll.scrollLeft + getWindowScrollBarX(html);
  const y4 = -scroll.scrollTop;
  if (getComputedStyle2(body).direction === "rtl") {
    x3 += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x: x3,
    y: y4
  };
}
var SCROLLBAR_MAX = 25;
function getViewportRect(element, strategy, rootBoundary) {
  if (rootBoundary === void 0) {
    rootBoundary = "viewport";
  }
  const isLayoutViewport = rootBoundary === "layoutViewport";
  const win = getWindow(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x3 = 0;
  let y4 = 0;
  if (visualViewport) {
    const layoutRelativeClientCoords = !isWebKit() || strategy === "fixed";
    if (isLayoutViewport) {
      if (!layoutRelativeClientCoords) {
        x3 = -visualViewport.offsetLeft;
        y4 = -visualViewport.offsetTop;
      }
    } else {
      width = visualViewport.width;
      height = visualViewport.height;
      if (layoutRelativeClientCoords) {
        x3 = visualViewport.offsetLeft;
        y4 = visualViewport.offsetTop;
      }
    }
  }
  const windowScrollbarX = getWindowScrollBarX(html);
  if (windowScrollbarX <= 0) {
    const doc = html.ownerDocument;
    const body = doc.body;
    const bodyStyles = getComputedStyle(body);
    const bodyMarginInline = doc.compatMode === "CSS1Compat" ? parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight) || 0 : 0;
    const reservedWidth = Math.abs(html.clientWidth - body.clientWidth - bodyMarginInline);
    const gutter = getComputedStyle(html).scrollbarGutter === "stable both-edges" ? reservedWidth / 2 : reservedWidth;
    if (gutter <= SCROLLBAR_MAX) {
      width -= gutter;
    }
  }
  return {
    width,
    height,
    x: x3,
    y: y4
  };
}
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = getScale(element);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x3 = left * scale.x;
  const y4 = top * scale.y;
  return {
    width,
    height,
    x: x3,
    y: y4
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === "viewport" || clippingAncestor === "layoutViewport") {
    rect = getViewportRect(element, strategy, clippingAncestor);
  } else if (clippingAncestor === "document") {
    rect = getDocumentRect(getDocumentElement(element));
  } else if (isElement(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y,
      width: clippingAncestor.width,
      height: clippingAncestor.height
    };
  }
  return rectToClientRect(rect);
}
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
  let lastKeptComputedStyle = null;
  const elementIsFixed = getComputedStyle2(element).position === "fixed";
  let currentNode = elementIsFixed ? getParentNode(element) : element;
  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle2(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    const lastPosition = lastKeptComputedStyle ? lastKeptComputedStyle.position : elementIsFixed ? "fixed" : "";
    const shouldDropCurrentNode = !currentNodeIsContaining && (lastPosition === "fixed" || lastPosition === "absolute" && computedStyle.position === "static");
    if (shouldDropCurrentNode) {
      result = result.filter((ancestor) => ancestor !== currentNode);
    } else {
      lastKeptComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache.set(element, result);
  return result;
}
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstRect = getClientRectFromClippingAncestor(element, clippingAncestors[0], strategy);
  let top = firstRect.top;
  let right = firstRect.right;
  let bottom = firstRect.bottom;
  let left = firstRect.left;
  for (let i8 = 1; i8 < clippingAncestors.length; i8++) {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestors[i8], strategy);
    top = max(rect.top, top);
    right = min(rect.right, right);
    bottom = min(rect.bottom, bottom);
    left = max(rect.left, left);
  }
  return {
    width: right - left,
    height: bottom - top,
    x: left,
    y: top
  };
}
function getDimensions(element) {
  const {
    width,
    height
  } = getCssDimensions(element);
  return {
    width,
    height
  };
}
function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === "fixed";
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);
  if (isOffsetParentAnElement || !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  if (!isOffsetParentAnElement && documentElement) {
    offsets.x = getWindowScrollBarX(documentElement);
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  const x3 = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
  const y4 = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
  return {
    x: x3,
    y: y4,
    width: rect.width,
    height: rect.height
  };
}
function isStaticPositioned(element) {
  return getComputedStyle2(element).position === "static";
}
function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement(element) || getComputedStyle2(element).position === "fixed") {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  let rawOffsetParent = element.offsetParent;
  if (getDocumentElement(element) === rawOffsetParent) {
    rawOffsetParent = rawOffsetParent.ownerDocument.body;
  }
  return rawOffsetParent;
}
function getOffsetParent(element, polyfill) {
  const win = getWindow(element);
  if (isTopLayer(element)) {
    return win;
  }
  if (!isHTMLElement(element)) {
    let svgOffsetParent = getParentNode(element);
    while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
      if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
        return svgOffsetParent;
      }
      svgOffsetParent = getParentNode(svgOffsetParent);
    }
    return win;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
    return win;
  }
  return offsetParent || getContainingBlock(element) || win;
}
var getElementRects = async function(data) {
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  const floatingDimensions = await getDimensionsFn(data.floating);
  return {
    reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
    floating: {
      x: 0,
      y: 0,
      width: floatingDimensions.width,
      height: floatingDimensions.height
    }
  };
};
function isRTL(element) {
  return getComputedStyle2(element).direction === "rtl";
}
var platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement,
  isRTL
};
function rectsAreEqual(a5, b4) {
  return a5.x === b4.x && a5.y === b4.y && a5.width === b4.width && a5.height === b4.height;
}
function observeMove(element, onMove, ancestorResize) {
  let io = null;
  let timeoutId;
  const root = getDocumentElement(element);
  function cleanup() {
    var _io;
    clearTimeout(timeoutId);
    (_io = io) == null || _io.disconnect();
    io = null;
  }
  function refresh(skip, threshold) {
    if (skip === void 0) {
      skip = false;
    }
    if (threshold === void 0) {
      threshold = 1;
    }
    cleanup();
    const elementRectForRootMargin = element.getBoundingClientRect();
    const {
      left,
      top,
      width,
      height
    } = elementRectForRootMargin;
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = floor(top);
    const insetRight = floor(root.clientWidth - (left + width));
    const insetBottom = floor(root.clientHeight - (top + height));
    const insetLeft = floor(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options = {
      rootMargin,
      threshold: max(0, min(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (!rectsAreEqual(elementRectForRootMargin, element.getBoundingClientRect())) {
        return refresh();
      }
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 1e3);
        } else {
          refresh(false, ratio);
        }
      }
      isFirstUpdate = false;
    }
    try {
      io = new IntersectionObserver(handleObserve, {
        ...options,
        // Handle <iframe>s
        root: root.ownerDocument
      });
    } catch (_e2) {
      io = new IntersectionObserver(handleObserve, options);
    }
    io.observe(element);
  }
  const win = getWindow(element);
  const handleResize = () => refresh(ancestorResize);
  win.addEventListener("resize", handleResize);
  refresh(true);
  return () => {
    win.removeEventListener("resize", handleResize);
    cleanup();
  };
}
function autoUpdate(reference, floating, update2, options) {
  if (options === void 0) {
    options = {};
  }
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = typeof ResizeObserver === "function",
    layoutShift = typeof IntersectionObserver === "function",
    animationFrame = false
  } = options;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [...referenceEl ? getOverflowAncestors(referenceEl) : [], ...floating ? getOverflowAncestors(floating) : []] : [];
  ancestors.forEach((ancestor) => {
    ancestorScroll && ancestor.addEventListener("scroll", update2);
    ancestorResize && ancestor.addEventListener("resize", update2);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update2, ancestorResize) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver((_ref) => {
      let [firstEntry] = _ref;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver && floating) {
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          var _resizeObserver;
          (_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
        });
      }
      update2();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    if (floating) {
      resizeObserver.observe(floating);
    }
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && !rectsAreEqual(prevRefRect, nextRefRect)) {
      update2();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update2();
  return () => {
    var _resizeObserver2;
    ancestors.forEach((ancestor) => {
      ancestorScroll && ancestor.removeEventListener("scroll", update2);
      ancestorResize && ancestor.removeEventListener("resize", update2);
    });
    cleanupIo == null || cleanupIo();
    (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}
var offset2 = offset;
var shift2 = shift;
var flip2 = flip;
var size2 = size;
var arrow2 = arrow;
var computePosition2 = (reference, floating, options) => {
  const cache = /* @__PURE__ */ new Map();
  const mergedOptions = options != null ? options : {};
  const platformWithCache = {
    ...platform,
    ...mergedOptions.platform,
    _c: cache
  };
  return computePosition(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};

// node_modules/.pnpm/composed-offset-position@0.0.6_@floating-ui+utils@0.2.12/node_modules/composed-offset-position/dist/composed-offset-position.browser.min.mjs
function e9(t6) {
  return i7(t6);
}
function r6(t6) {
  return t6.assignedSlot ? t6.assignedSlot : t6.parentNode instanceof ShadowRoot ? t6.parentNode.host : t6.parentNode;
}
function i7(e11) {
  for (let t6 = e11; t6; t6 = r6(t6)) if (t6 instanceof Element && "none" === getComputedStyle(t6).display) return null;
  for (let n6 = r6(e11); n6; n6 = r6(n6)) {
    if (!(n6 instanceof Element)) continue;
    const e12 = getComputedStyle(n6);
    if ("contents" !== e12.display) {
      if ("static" !== e12.position || isContainingBlock(e12)) return n6;
      if ("BODY" === n6.tagName) return n6;
    }
  }
  return null;
}

// node_modules/.pnpm/@awesome.me+webawesome@3.11.0_@floating-ui+utils@0.2.12_@types+react@19.2.18/node_modules/@awesome.me/webawesome/dist/chunks/chunk.64OG2H45.js
function isVirtualElement(e11) {
  return e11 !== null && typeof e11 === "object" && "getBoundingClientRect" in e11 && ("contextElement" in e11 ? e11 instanceof Element : true);
}
var SUPPORTS_POPOVER = Boolean(globalThis?.HTMLElement?.prototype.hasOwnProperty("popover"));
var WaPopup = class extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController2(this);
    this.SUPPORTS_POPOVER = false;
    this.active = false;
    this.placement = "top";
    this.boundary = "viewport";
    this.distance = 0;
    this.skidding = 0;
    this.arrow = false;
    this.arrowPlacement = "anchor";
    this.arrowPadding = 10;
    this.flip = false;
    this.flipFallbackPlacements = "";
    this.flipFallbackStrategy = "best-fit";
    this.flipPadding = 0;
    this.shift = false;
    this.shiftPadding = 0;
    this.autoSizePadding = 0;
    this.hoverBridge = false;
    this.updateHoverBridge = () => {
      if (this.hoverBridge && this.anchorEl && this.popup) {
        const anchorRect = this.anchorEl.getBoundingClientRect();
        const popupRect = this.popup.getBoundingClientRect();
        const isVertical = this.placement.includes("top") || this.placement.includes("bottom");
        let topLeftX = 0;
        let topLeftY = 0;
        let topRightX = 0;
        let topRightY = 0;
        let bottomLeftX = 0;
        let bottomLeftY = 0;
        let bottomRightX = 0;
        let bottomRightY = 0;
        if (isVertical) {
          if (anchorRect.top < popupRect.top) {
            topLeftX = anchorRect.left;
            topLeftY = anchorRect.bottom;
            topRightX = anchorRect.right;
            topRightY = anchorRect.bottom;
            bottomLeftX = popupRect.left;
            bottomLeftY = popupRect.top;
            bottomRightX = popupRect.right;
            bottomRightY = popupRect.top;
          } else {
            topLeftX = popupRect.left;
            topLeftY = popupRect.bottom;
            topRightX = popupRect.right;
            topRightY = popupRect.bottom;
            bottomLeftX = anchorRect.left;
            bottomLeftY = anchorRect.top;
            bottomRightX = anchorRect.right;
            bottomRightY = anchorRect.top;
          }
        } else {
          if (anchorRect.left < popupRect.left) {
            topLeftX = anchorRect.right;
            topLeftY = anchorRect.top;
            topRightX = popupRect.left;
            topRightY = popupRect.top;
            bottomLeftX = anchorRect.right;
            bottomLeftY = anchorRect.bottom;
            bottomRightX = popupRect.left;
            bottomRightY = popupRect.bottom;
          } else {
            topLeftX = popupRect.right;
            topLeftY = popupRect.top;
            topRightX = anchorRect.left;
            topRightY = anchorRect.top;
            bottomLeftX = popupRect.right;
            bottomLeftY = popupRect.bottom;
            bottomRightX = anchorRect.left;
            bottomRightY = anchorRect.bottom;
          }
        }
        this.style.setProperty("--hover-bridge-top-left-x", `${topLeftX}px`);
        this.style.setProperty("--hover-bridge-top-left-y", `${topLeftY}px`);
        this.style.setProperty("--hover-bridge-top-right-x", `${topRightX}px`);
        this.style.setProperty("--hover-bridge-top-right-y", `${topRightY}px`);
        this.style.setProperty("--hover-bridge-bottom-left-x", `${bottomLeftX}px`);
        this.style.setProperty("--hover-bridge-bottom-left-y", `${bottomLeftY}px`);
        this.style.setProperty("--hover-bridge-bottom-right-x", `${bottomRightX}px`);
        this.style.setProperty("--hover-bridge-bottom-right-y", `${bottomRightY}px`);
      }
    };
  }
  async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;
    this.SUPPORTS_POPOVER = SUPPORTS_POPOVER;
    this.start();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.stop();
  }
  async updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("active")) {
      if (this.active) {
        this.start();
      } else {
        this.stop();
      }
    }
    if (changedProperties.has("anchor")) {
      this.handleAnchorChange();
    }
    if (this.active) {
      await this.updateComplete;
      this.reposition();
    }
  }
  async handleAnchorChange() {
    await this.stop();
    if (this.anchor && typeof this.anchor === "string") {
      const root = this.getRootNode();
      this.anchorEl = root.getElementById(this.anchor);
    } else if (this.anchor instanceof Element || isVirtualElement(this.anchor)) {
      this.anchorEl = this.anchor;
    } else {
      this.anchorEl = this.querySelector('[slot="anchor"]');
    }
    if (this.anchorEl instanceof HTMLSlotElement) {
      this.anchorEl = this.anchorEl.assignedElements({ flatten: true })[0];
    }
    if (this.anchorEl) {
      this.start();
    }
  }
  start() {
    if (!this.anchorEl || !this.active || !this.isConnected) {
      return;
    }
    this.popup?.showPopover?.();
    this.cleanup = autoUpdate(this.anchorEl, this.popup, () => {
      this.reposition();
    });
  }
  async stop() {
    return new Promise((resolve) => {
      this.popup?.hidePopover?.();
      if (this.cleanup) {
        this.cleanup();
        this.cleanup = void 0;
        this.removeAttribute("data-current-placement");
        this.style.removeProperty("--auto-size-available-width");
        this.style.removeProperty("--auto-size-available-height");
        requestAnimationFrame(() => resolve());
      } else {
        resolve();
      }
    });
  }
  /** Forces the popup to recalculate and reposition itself. */
  reposition() {
    if (!this.active || !this.anchorEl || !this.popup) {
      return;
    }
    const middleware = [
      // The offset middleware goes first
      offset2({ mainAxis: this.distance, crossAxis: this.skidding })
    ];
    if (this.sync) {
      middleware.push(
        size2({
          apply: ({ rects }) => {
            const syncWidth = this.sync === "width" || this.sync === "both";
            const syncHeight = this.sync === "height" || this.sync === "both";
            this.popup.style.width = syncWidth ? `${rects.reference.width}px` : "";
            this.popup.style.height = syncHeight ? `${rects.reference.height}px` : "";
          }
        })
      );
    } else {
      this.popup.style.width = "";
      this.popup.style.height = "";
    }
    let defaultBoundary;
    if (this.SUPPORTS_POPOVER && !isVirtualElement(this.anchor) && this.boundary === "scroll") {
      defaultBoundary = getOverflowAncestors(this.anchorEl).filter((el) => el instanceof Element);
    }
    if (this.flip) {
      middleware.push(
        flip2({
          boundary: this.flipBoundary || defaultBoundary,
          // @ts-expect-error - We're converting a string attribute to an array here
          fallbackPlacements: this.flipFallbackPlacements,
          fallbackStrategy: this.flipFallbackStrategy === "best-fit" ? "bestFit" : "initialPlacement",
          padding: this.flipPadding
        })
      );
    }
    if (this.shift) {
      middleware.push(
        shift2({
          boundary: this.shiftBoundary || defaultBoundary,
          padding: this.shiftPadding
        })
      );
    }
    if (this.autoSize) {
      middleware.push(
        size2({
          boundary: this.autoSizeBoundary || defaultBoundary,
          padding: this.autoSizePadding,
          apply: ({ availableWidth, availableHeight }) => {
            if (this.autoSize === "vertical" || this.autoSize === "both") {
              this.style.setProperty("--auto-size-available-height", `${availableHeight}px`);
            } else {
              this.style.removeProperty("--auto-size-available-height");
            }
            if (this.autoSize === "horizontal" || this.autoSize === "both") {
              this.style.setProperty("--auto-size-available-width", `${availableWidth}px`);
            } else {
              this.style.removeProperty("--auto-size-available-width");
            }
          }
        })
      );
    } else {
      this.style.removeProperty("--auto-size-available-width");
      this.style.removeProperty("--auto-size-available-height");
    }
    if (this.arrow) {
      middleware.push(
        arrow2({
          element: this.arrowEl,
          padding: this.arrowPadding
        })
      );
    }
    const getOffsetParent2 = this.SUPPORTS_POPOVER ? (element) => platform.getOffsetParent(element, e9) : platform.getOffsetParent;
    computePosition2(this.anchorEl, this.popup, {
      placement: this.placement,
      middleware,
      strategy: this.SUPPORTS_POPOVER ? "absolute" : "fixed",
      platform: {
        ...platform,
        getOffsetParent: getOffsetParent2
      }
    }).then(({ x: x3, y: y4, middlewareData, placement }) => {
      const isRtl = this.localize.dir() === "rtl";
      const staticSide = { top: "bottom", right: "left", bottom: "top", left: "right" }[placement.split("-")[0]];
      this.setAttribute("data-current-placement", placement);
      Object.assign(this.popup.style, {
        left: `${x3}px`,
        top: `${y4}px`
      });
      if (this.arrow) {
        const arrowX = middlewareData.arrow.x;
        const arrowY = middlewareData.arrow.y;
        let top = "";
        let right = "";
        let bottom = "";
        let left = "";
        if (this.arrowPlacement === "start") {
          const value = typeof arrowX === "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
          top = typeof arrowY === "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
          right = isRtl ? value : "";
          left = isRtl ? "" : value;
        } else if (this.arrowPlacement === "end") {
          const value = typeof arrowX === "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
          right = isRtl ? "" : value;
          left = isRtl ? value : "";
          bottom = typeof arrowY === "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
        } else if (this.arrowPlacement === "center") {
          left = typeof arrowX === "number" ? `calc(50% - var(--arrow-size-diagonal))` : "";
          top = typeof arrowY === "number" ? `calc(50% - var(--arrow-size-diagonal))` : "";
        } else {
          left = typeof arrowX === "number" ? `${arrowX}px` : "";
          top = typeof arrowY === "number" ? `${arrowY}px` : "";
        }
        Object.assign(this.arrowEl.style, {
          top,
          right,
          bottom,
          left,
          [staticSide]: "calc(var(--arrow-base-offset) - var(--arrow-size-diagonal))"
        });
      }
    });
    requestAnimationFrame(() => this.updateHoverBridge());
    this.dispatchEvent(new WaRepositionEvent());
  }
  render() {
    return b2`
      <slot name="anchor" @slotchange=${this.handleAnchorChange}></slot>

      <span
        part="hover-bridge"
        class=${e7({
      "popup-hover-bridge": true,
      "popup-hover-bridge-visible": this.hoverBridge && this.active
    })}
      ></span>

      <div
        popover="manual"
        part="popup"
        class=${e7({
      popup: true,
      "popup-active": this.active,
      "popup-fixed": !this.SUPPORTS_POPOVER,
      "popup-has-arrow": this.arrow
    })}
      >
        <slot></slot>
        ${this.arrow ? b2`<div part="arrow" class="arrow" role="presentation"></div>` : ""}
      </div>
    `;
  }
};
WaPopup.css = popup_styles_default;
__decorateClass([
  e5(".popup")
], WaPopup.prototype, "popup", 2);
__decorateClass([
  e5(".arrow")
], WaPopup.prototype, "arrowEl", 2);
__decorateClass([
  n4({ attribute: false, type: Boolean })
], WaPopup.prototype, "SUPPORTS_POPOVER", 2);
__decorateClass([
  n4()
], WaPopup.prototype, "anchor", 2);
__decorateClass([
  n4({ type: Boolean, reflect: true })
], WaPopup.prototype, "active", 2);
__decorateClass([
  n4({ reflect: true })
], WaPopup.prototype, "placement", 2);
__decorateClass([
  n4()
], WaPopup.prototype, "boundary", 2);
__decorateClass([
  n4({ type: Number })
], WaPopup.prototype, "distance", 2);
__decorateClass([
  n4({ type: Number })
], WaPopup.prototype, "skidding", 2);
__decorateClass([
  n4({ type: Boolean })
], WaPopup.prototype, "arrow", 2);
__decorateClass([
  n4({ attribute: "arrow-placement" })
], WaPopup.prototype, "arrowPlacement", 2);
__decorateClass([
  n4({ attribute: "arrow-padding", type: Number })
], WaPopup.prototype, "arrowPadding", 2);
__decorateClass([
  n4({ type: Boolean })
], WaPopup.prototype, "flip", 2);
__decorateClass([
  n4({
    attribute: "flip-fallback-placements",
    converter: {
      fromAttribute: (value) => {
        return value.split(" ").map((p4) => p4.trim()).filter((p4) => p4 !== "");
      },
      toAttribute: (value) => {
        return value.join(" ");
      }
    }
  })
], WaPopup.prototype, "flipFallbackPlacements", 2);
__decorateClass([
  n4({ attribute: "flip-fallback-strategy" })
], WaPopup.prototype, "flipFallbackStrategy", 2);
__decorateClass([
  n4({ type: Object })
], WaPopup.prototype, "flipBoundary", 2);
__decorateClass([
  n4({ attribute: "flip-padding", type: Number })
], WaPopup.prototype, "flipPadding", 2);
__decorateClass([
  n4({ type: Boolean })
], WaPopup.prototype, "shift", 2);
__decorateClass([
  n4({ type: Object })
], WaPopup.prototype, "shiftBoundary", 2);
__decorateClass([
  n4({ attribute: "shift-padding", type: Number })
], WaPopup.prototype, "shiftPadding", 2);
__decorateClass([
  n4({ attribute: "auto-size" })
], WaPopup.prototype, "autoSize", 2);
__decorateClass([
  n4()
], WaPopup.prototype, "sync", 2);
__decorateClass([
  n4({ type: Object })
], WaPopup.prototype, "autoSizeBoundary", 2);
__decorateClass([
  n4({ attribute: "auto-size-padding", type: Number })
], WaPopup.prototype, "autoSizePadding", 2);
__decorateClass([
  n4({ attribute: "hover-bridge", type: Boolean })
], WaPopup.prototype, "hoverBridge", 2);
WaPopup = __decorateClass([
  t3("wa-popup")
], WaPopup);

// node_modules/.pnpm/fancy-canvas@2.1.0/node_modules/fancy-canvas/size.mjs
function size3(_a) {
  var width = _a.width, height = _a.height;
  if (width < 0) {
    throw new Error("Negative width is not allowed for Size");
  }
  if (height < 0) {
    throw new Error("Negative height is not allowed for Size");
  }
  return {
    width,
    height
  };
}
function equalSizes(first, second) {
  return first.width === second.width && first.height === second.height;
}

// node_modules/.pnpm/fancy-canvas@2.1.0/node_modules/fancy-canvas/device-pixel-ratio.mjs
var Observable = (
  /** @class */
  (function() {
    function Observable2(win) {
      var _this = this;
      this._resolutionListener = function() {
        return _this._onResolutionChanged();
      };
      this._resolutionMediaQueryList = null;
      this._observers = [];
      this._window = win;
      this._installResolutionListener();
    }
    Observable2.prototype.dispose = function() {
      this._uninstallResolutionListener();
      this._window = null;
    };
    Object.defineProperty(Observable2.prototype, "value", {
      get: function() {
        return this._window.devicePixelRatio;
      },
      enumerable: false,
      configurable: true
    });
    Observable2.prototype.subscribe = function(next) {
      var _this = this;
      var observer = { next };
      this._observers.push(observer);
      return {
        unsubscribe: function() {
          _this._observers = _this._observers.filter(function(o11) {
            return o11 !== observer;
          });
        }
      };
    };
    Observable2.prototype._installResolutionListener = function() {
      if (this._resolutionMediaQueryList !== null) {
        throw new Error("Resolution listener is already installed");
      }
      var dppx = this._window.devicePixelRatio;
      this._resolutionMediaQueryList = this._window.matchMedia("all and (resolution: ".concat(dppx, "dppx)"));
      this._resolutionMediaQueryList.addListener(this._resolutionListener);
    };
    Observable2.prototype._uninstallResolutionListener = function() {
      if (this._resolutionMediaQueryList !== null) {
        this._resolutionMediaQueryList.removeListener(this._resolutionListener);
        this._resolutionMediaQueryList = null;
      }
    };
    Observable2.prototype._reinstallResolutionListener = function() {
      this._uninstallResolutionListener();
      this._installResolutionListener();
    };
    Observable2.prototype._onResolutionChanged = function() {
      var _this = this;
      this._observers.forEach(function(observer) {
        return observer.next(_this._window.devicePixelRatio);
      });
      this._reinstallResolutionListener();
    };
    return Observable2;
  })()
);
function createObservable(win) {
  return new Observable(win);
}

// node_modules/.pnpm/fancy-canvas@2.1.0/node_modules/fancy-canvas/canvas-element-bitmap-size.mjs
var DevicePixelContentBoxBinding = (
  /** @class */
  (function() {
    function DevicePixelContentBoxBinding2(canvasElement, transformBitmapSize, options) {
      var _a;
      this._canvasElement = null;
      this._bitmapSizeChangedListeners = [];
      this._suggestedBitmapSize = null;
      this._suggestedBitmapSizeChangedListeners = [];
      this._devicePixelRatioObservable = null;
      this._canvasElementResizeObserver = null;
      this._canvasElement = canvasElement;
      this._canvasElementClientSize = size3({
        width: this._canvasElement.clientWidth,
        height: this._canvasElement.clientHeight
      });
      this._transformBitmapSize = transformBitmapSize !== null && transformBitmapSize !== void 0 ? transformBitmapSize : (function(size4) {
        return size4;
      });
      this._allowResizeObserver = (_a = options === null || options === void 0 ? void 0 : options.allowResizeObserver) !== null && _a !== void 0 ? _a : true;
      this._chooseAndInitObserver();
    }
    DevicePixelContentBoxBinding2.prototype.dispose = function() {
      var _a, _b;
      if (this._canvasElement === null) {
        throw new Error("Object is disposed");
      }
      (_a = this._canvasElementResizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
      this._canvasElementResizeObserver = null;
      (_b = this._devicePixelRatioObservable) === null || _b === void 0 ? void 0 : _b.dispose();
      this._devicePixelRatioObservable = null;
      this._suggestedBitmapSizeChangedListeners.length = 0;
      this._bitmapSizeChangedListeners.length = 0;
      this._canvasElement = null;
    };
    Object.defineProperty(DevicePixelContentBoxBinding2.prototype, "canvasElement", {
      get: function() {
        if (this._canvasElement === null) {
          throw new Error("Object is disposed");
        }
        return this._canvasElement;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(DevicePixelContentBoxBinding2.prototype, "canvasElementClientSize", {
      get: function() {
        return this._canvasElementClientSize;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(DevicePixelContentBoxBinding2.prototype, "bitmapSize", {
      get: function() {
        return size3({
          width: this.canvasElement.width,
          height: this.canvasElement.height
        });
      },
      enumerable: false,
      configurable: true
    });
    DevicePixelContentBoxBinding2.prototype.resizeCanvasElement = function(clientSize) {
      this._canvasElementClientSize = size3(clientSize);
      this.canvasElement.style.width = "".concat(this._canvasElementClientSize.width, "px");
      this.canvasElement.style.height = "".concat(this._canvasElementClientSize.height, "px");
      this._invalidateBitmapSize();
    };
    DevicePixelContentBoxBinding2.prototype.subscribeBitmapSizeChanged = function(listener) {
      this._bitmapSizeChangedListeners.push(listener);
    };
    DevicePixelContentBoxBinding2.prototype.unsubscribeBitmapSizeChanged = function(listener) {
      this._bitmapSizeChangedListeners = this._bitmapSizeChangedListeners.filter(function(l6) {
        return l6 !== listener;
      });
    };
    Object.defineProperty(DevicePixelContentBoxBinding2.prototype, "suggestedBitmapSize", {
      get: function() {
        return this._suggestedBitmapSize;
      },
      enumerable: false,
      configurable: true
    });
    DevicePixelContentBoxBinding2.prototype.subscribeSuggestedBitmapSizeChanged = function(listener) {
      this._suggestedBitmapSizeChangedListeners.push(listener);
    };
    DevicePixelContentBoxBinding2.prototype.unsubscribeSuggestedBitmapSizeChanged = function(listener) {
      this._suggestedBitmapSizeChangedListeners = this._suggestedBitmapSizeChangedListeners.filter(function(l6) {
        return l6 !== listener;
      });
    };
    DevicePixelContentBoxBinding2.prototype.applySuggestedBitmapSize = function() {
      if (this._suggestedBitmapSize === null) {
        return;
      }
      var oldSuggestedSize = this._suggestedBitmapSize;
      this._suggestedBitmapSize = null;
      this._resizeBitmap(oldSuggestedSize);
      this._emitSuggestedBitmapSizeChanged(oldSuggestedSize, this._suggestedBitmapSize);
    };
    DevicePixelContentBoxBinding2.prototype._resizeBitmap = function(newSize) {
      var oldSize = this.bitmapSize;
      if (equalSizes(oldSize, newSize)) {
        return;
      }
      this.canvasElement.width = newSize.width;
      this.canvasElement.height = newSize.height;
      this._emitBitmapSizeChanged(oldSize, newSize);
    };
    DevicePixelContentBoxBinding2.prototype._emitBitmapSizeChanged = function(oldSize, newSize) {
      var _this = this;
      this._bitmapSizeChangedListeners.forEach(function(listener) {
        return listener.call(_this, oldSize, newSize);
      });
    };
    DevicePixelContentBoxBinding2.prototype._suggestNewBitmapSize = function(newSize) {
      var oldSuggestedSize = this._suggestedBitmapSize;
      var finalNewSize = size3(this._transformBitmapSize(newSize, this._canvasElementClientSize));
      var newSuggestedSize = equalSizes(this.bitmapSize, finalNewSize) ? null : finalNewSize;
      if (oldSuggestedSize === null && newSuggestedSize === null) {
        return;
      }
      if (oldSuggestedSize !== null && newSuggestedSize !== null && equalSizes(oldSuggestedSize, newSuggestedSize)) {
        return;
      }
      this._suggestedBitmapSize = newSuggestedSize;
      this._emitSuggestedBitmapSizeChanged(oldSuggestedSize, newSuggestedSize);
    };
    DevicePixelContentBoxBinding2.prototype._emitSuggestedBitmapSizeChanged = function(oldSize, newSize) {
      var _this = this;
      this._suggestedBitmapSizeChangedListeners.forEach(function(listener) {
        return listener.call(_this, oldSize, newSize);
      });
    };
    DevicePixelContentBoxBinding2.prototype._chooseAndInitObserver = function() {
      var _this = this;
      if (!this._allowResizeObserver) {
        this._initDevicePixelRatioObservable();
        return;
      }
      isDevicePixelContentBoxSupported().then(function(isSupported) {
        return isSupported ? _this._initResizeObserver() : _this._initDevicePixelRatioObservable();
      });
    };
    DevicePixelContentBoxBinding2.prototype._initDevicePixelRatioObservable = function() {
      var _this = this;
      if (this._canvasElement === null) {
        return;
      }
      var win = canvasElementWindow(this._canvasElement);
      if (win === null) {
        throw new Error("No window is associated with the canvas");
      }
      this._devicePixelRatioObservable = createObservable(win);
      this._devicePixelRatioObservable.subscribe(function() {
        return _this._invalidateBitmapSize();
      });
      this._invalidateBitmapSize();
    };
    DevicePixelContentBoxBinding2.prototype._invalidateBitmapSize = function() {
      var _a, _b;
      if (this._canvasElement === null) {
        return;
      }
      var win = canvasElementWindow(this._canvasElement);
      if (win === null) {
        return;
      }
      var ratio = (_b = (_a = this._devicePixelRatioObservable) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : win.devicePixelRatio;
      var canvasRects = this._canvasElement.getClientRects();
      var newSize = (
        // eslint-disable-next-line no-negated-condition
        canvasRects[0] !== void 0 ? predictedBitmapSize(canvasRects[0], ratio) : size3({
          width: this._canvasElementClientSize.width * ratio,
          height: this._canvasElementClientSize.height * ratio
        })
      );
      this._suggestNewBitmapSize(newSize);
    };
    DevicePixelContentBoxBinding2.prototype._initResizeObserver = function() {
      var _this = this;
      if (this._canvasElement === null) {
        return;
      }
      this._canvasElementResizeObserver = new ResizeObserver(function(entries) {
        var entry = entries.find(function(entry2) {
          return entry2.target === _this._canvasElement;
        });
        if (!entry || !entry.devicePixelContentBoxSize || !entry.devicePixelContentBoxSize[0]) {
          return;
        }
        var entrySize = entry.devicePixelContentBoxSize[0];
        var newSize = size3({
          width: entrySize.inlineSize,
          height: entrySize.blockSize
        });
        _this._suggestNewBitmapSize(newSize);
      });
      this._canvasElementResizeObserver.observe(this._canvasElement, { box: "device-pixel-content-box" });
    };
    return DevicePixelContentBoxBinding2;
  })()
);
function bindTo(canvasElement, target) {
  if (target.type === "device-pixel-content-box") {
    return new DevicePixelContentBoxBinding(canvasElement, target.transform, target.options);
  }
  throw new Error("Unsupported binding target");
}
function canvasElementWindow(canvasElement) {
  return canvasElement.ownerDocument.defaultView;
}
function isDevicePixelContentBoxSupported() {
  return new Promise(function(resolve) {
    var ro = new ResizeObserver(function(entries) {
      resolve(entries.every(function(entry) {
        return "devicePixelContentBoxSize" in entry;
      }));
      ro.disconnect();
    });
    ro.observe(document.body, { box: "device-pixel-content-box" });
  }).catch(function() {
    return false;
  });
}
function predictedBitmapSize(canvasRect, ratio) {
  return size3({
    width: Math.round(canvasRect.left * ratio + canvasRect.width * ratio) - Math.round(canvasRect.left * ratio),
    height: Math.round(canvasRect.top * ratio + canvasRect.height * ratio) - Math.round(canvasRect.top * ratio)
  });
}

// node_modules/.pnpm/fancy-canvas@2.1.0/node_modules/fancy-canvas/canvas-rendering-target.mjs
var CanvasRenderingTarget2D = (
  /** @class */
  (function() {
    function CanvasRenderingTarget2D2(context, mediaSize, bitmapSize) {
      if (mediaSize.width === 0 || mediaSize.height === 0) {
        throw new TypeError("Rendering target could only be created on a media with positive width and height");
      }
      this._mediaSize = mediaSize;
      if (bitmapSize.width === 0 || bitmapSize.height === 0) {
        throw new TypeError("Rendering target could only be created using a bitmap with positive integer width and height");
      }
      this._bitmapSize = bitmapSize;
      this._context = context;
    }
    CanvasRenderingTarget2D2.prototype.useMediaCoordinateSpace = function(f4) {
      try {
        this._context.save();
        this._context.setTransform(1, 0, 0, 1, 0, 0);
        this._context.scale(this._horizontalPixelRatio, this._verticalPixelRatio);
        return f4({
          context: this._context,
          mediaSize: this._mediaSize
        });
      } finally {
        this._context.restore();
      }
    };
    CanvasRenderingTarget2D2.prototype.useBitmapCoordinateSpace = function(f4) {
      try {
        this._context.save();
        this._context.setTransform(1, 0, 0, 1, 0, 0);
        return f4({
          context: this._context,
          mediaSize: this._mediaSize,
          bitmapSize: this._bitmapSize,
          horizontalPixelRatio: this._horizontalPixelRatio,
          verticalPixelRatio: this._verticalPixelRatio
        });
      } finally {
        this._context.restore();
      }
    };
    Object.defineProperty(CanvasRenderingTarget2D2.prototype, "_horizontalPixelRatio", {
      get: function() {
        return this._bitmapSize.width / this._mediaSize.width;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(CanvasRenderingTarget2D2.prototype, "_verticalPixelRatio", {
      get: function() {
        return this._bitmapSize.height / this._mediaSize.height;
      },
      enumerable: false,
      configurable: true
    });
    return CanvasRenderingTarget2D2;
  })()
);
function tryCreateCanvasRenderingTarget2D(binding, contextOptions) {
  var mediaSize = binding.canvasElementClientSize;
  if (mediaSize.width === 0 || mediaSize.height === 0) {
    return null;
  }
  var bitmapSize = binding.bitmapSize;
  if (bitmapSize.width === 0 || bitmapSize.height === 0) {
    return null;
  }
  var context = binding.canvasElement.getContext("2d", contextOptions);
  if (context === null) {
    return null;
  }
  return new CanvasRenderingTarget2D(context, mediaSize, bitmapSize);
}

// node_modules/.pnpm/lightweight-charts@5.2.0/node_modules/lightweight-charts/dist/lightweight-charts.production.mjs
var e10 = { title: "", visible: true, hitTestTolerance: 3, lastValueVisible: true, priceLineVisible: true, priceLineSource: 0, priceLineWidth: 1, priceLineColor: "", priceLineStyle: 2, baseLineVisible: true, baseLineWidth: 1, baseLineColor: "#B2B5BE", baseLineStyle: 0, priceFormat: { type: "price", precision: 2, minMove: 0.01 } };
var r7;
var h3;
function a4(t6, i8) {
  const n6 = (function(t7, i9) {
    switch (t7) {
      case 0:
      default:
        return [];
      case 1:
        return [i9, i9];
      case 2:
        return [2 * i9, 2 * i9];
      case 3:
        return [6 * i9, 6 * i9];
      case 4:
        return [i9, 4 * i9];
    }
  })(i8, t6.lineWidth);
  return t6.setLineDash(n6), n6;
}
function l5(t6, i8, n6, s4) {
  t6.beginPath();
  const e11 = t6.lineWidth % 2 ? 0.5 : 0;
  t6.moveTo(n6, i8 + e11), t6.lineTo(s4, i8 + e11), t6.stroke();
}
function o10(t6, i8) {
  if (!t6) throw new Error("Assertion failed" + (i8 ? ": " + i8 : ""));
}
function _2(t6) {
  if (void 0 === t6) throw new Error("Value is undefined");
  return t6;
}
function u4(t6) {
  if (null === t6) throw new Error("Value is null");
  return t6;
}
function c5(t6) {
  return u4(_2(t6));
}
!(function(t6) {
  t6[t6.Simple = 0] = "Simple", t6[t6.WithSteps = 1] = "WithSteps", t6[t6.Curved = 2] = "Curved";
})(r7 || (r7 = {})), (function(t6) {
  t6[t6.Solid = 0] = "Solid", t6[t6.Dotted = 1] = "Dotted", t6[t6.Dashed = 2] = "Dashed", t6[t6.LargeDashed = 3] = "LargeDashed", t6[t6.SparseDotted = 4] = "SparseDotted";
})(h3 || (h3 = {}));
var d3 = class {
  constructor() {
    this.t = [];
  }
  i(t6, i8, n6) {
    const s4 = { h: t6, l: i8, o: true === n6 };
    this.t.push(s4);
  }
  _(t6) {
    const i8 = this.t.findIndex(((i9) => t6 === i9.h));
    i8 > -1 && this.t.splice(i8, 1);
  }
  u(t6) {
    this.t = this.t.filter(((i8) => i8.l !== t6));
  }
  p(t6, i8, n6) {
    const s4 = [...this.t];
    this.t = this.t.filter(((t7) => !t7.o)), s4.forEach(((s5) => s5.h(t6, i8, n6)));
  }
  v() {
    return this.t.length > 0;
  }
  m() {
    this.t = [];
  }
};
function f3(t6, ...i8) {
  for (const n6 of i8) for (const i9 in n6) void 0 !== n6[i9] && Object.prototype.hasOwnProperty.call(n6, i9) && !["__proto__", "constructor", "prototype"].includes(i9) && ("object" != typeof n6[i9] || void 0 === t6[i9] || Array.isArray(n6[i9]) ? t6[i9] = n6[i9] : f3(t6[i9], n6[i9]));
  return t6;
}
function p3(t6) {
  return "number" == typeof t6 && isFinite(t6);
}
function v2(t6) {
  return "number" == typeof t6 && t6 % 1 == 0;
}
function m2(t6) {
  return "string" == typeof t6;
}
function w2(t6) {
  return "boolean" == typeof t6;
}
function M2(t6) {
  const i8 = t6;
  if (!i8 || "object" != typeof i8) return i8;
  let n6, s4, e11;
  for (s4 in n6 = Array.isArray(i8) ? [] : {}, i8) i8.hasOwnProperty(s4) && (e11 = i8[s4], n6[s4] = e11 && "object" == typeof e11 ? M2(e11) : e11);
  return n6;
}
function g2(t6) {
  return null !== t6;
}
function b3(t6) {
  return null === t6 ? void 0 : t6;
}
var S3 = "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif";
function x2(t6, i8, n6) {
  return void 0 === i8 && (i8 = S3), `${n6 = void 0 !== n6 ? `${n6} ` : ""}${t6}px ${i8}`;
}
var C2 = class {
  constructor(t6) {
    this.M = { S: 1, C: 5, k: NaN, P: "", T: "", R: "", D: "", I: 0, V: 0, B: 0, A: 0, L: 0 }, this.O = t6;
  }
  N() {
    const t6 = this.M, i8 = this.F(), n6 = this.W();
    return t6.k === i8 && t6.T === n6 || (t6.k = i8, t6.T = n6, t6.P = x2(i8, n6), t6.A = 2.5 / 12 * i8, t6.I = t6.A, t6.V = i8 / 12 * t6.C, t6.B = i8 / 12 * t6.C, t6.L = 0), t6.R = this.H(), t6.D = this.U(), this.M;
  }
  H() {
    return this.O.N().layout.textColor;
  }
  U() {
    return this.O.$();
  }
  F() {
    return this.O.N().layout.fontSize;
  }
  W() {
    return this.O.N().layout.fontFamily;
  }
};
function y3(t6) {
  return t6 < 0 ? 0 : t6 > 255 ? 255 : Math.round(t6) || 0;
}
function k2(t6) {
  return 0.199 * t6[0] + 0.687 * t6[1] + 0.114 * t6[2];
}
var P2 = class {
  constructor(t6, i8) {
    this.j = /* @__PURE__ */ new Map(), this.q = t6, i8 && (this.j = i8);
  }
  Y(t6, i8) {
    if ("transparent" === t6) return t6;
    const n6 = this.K(t6), s4 = n6[3];
    return `rgba(${n6[0]}, ${n6[1]}, ${n6[2]}, ${i8 * s4})`;
  }
  Z(t6) {
    const i8 = this.K(t6);
    return { G: `rgb(${i8[0]}, ${i8[1]}, ${i8[2]})`, X: k2(i8) > 160 ? "black" : "white" };
  }
  J(t6) {
    return k2(this.K(t6));
  }
  tt(t6, i8, n6) {
    const [s4, e11, r8, h4] = this.K(t6), [a5, l6, o11, _3] = this.K(i8), u5 = [y3(s4 + n6 * (a5 - s4)), y3(e11 + n6 * (l6 - e11)), y3(r8 + n6 * (o11 - r8)), (c6 = h4 + n6 * (_3 - h4), c6 <= 0 || c6 > 1 ? Math.min(Math.max(c6, 0), 1) : Math.round(1e4 * c6) / 1e4)];
    var c6;
    return `rgba(${u5[0]}, ${u5[1]}, ${u5[2]}, ${u5[3]})`;
  }
  K(t6) {
    const i8 = this.j.get(t6);
    if (i8) return i8;
    const n6 = (function(t7) {
      const i9 = document.createElement("div");
      i9.style.display = "none", document.body.appendChild(i9), i9.style.color = t7;
      const n7 = window.getComputedStyle(i9).color;
      return document.body.removeChild(i9), n7;
    })(t6), s4 = n6.match(/^rgba?\s*\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)$/);
    if (!s4) {
      if (this.q.length) for (const i9 of this.q) {
        const n7 = i9(t6);
        if (n7) return this.j.set(t6, n7), n7;
      }
      throw new Error(`Failed to parse color: ${t6}`);
    }
    const e11 = [parseInt(s4[1], 10), parseInt(s4[2], 10), parseInt(s4[3], 10), s4[4] ? parseFloat(s4[4]) : 1];
    return this.j.set(t6, e11), e11;
  }
};
var T2 = class {
  constructor() {
    this.it = [];
  }
  nt(t6) {
    this.it = t6;
  }
  st(t6, i8, n6) {
    this.it.forEach(((s4) => {
      s4.st(t6, i8, n6);
    }));
  }
};
var R2 = class {
  st(t6, i8, n6) {
    t6.useBitmapCoordinateSpace(((t7) => this.et(t7, i8, n6)));
  }
};
var D2 = class extends R2 {
  constructor() {
    super(...arguments), this.rt = null;
  }
  ht(t6) {
    this.rt = t6;
  }
  et({ context: t6, horizontalPixelRatio: i8, verticalPixelRatio: n6 }) {
    if (null === this.rt || null === this.rt.lt) return;
    const s4 = this.rt.lt, e11 = this.rt, r8 = Math.max(1, Math.floor(i8)) % 2 / 2, h4 = (h5) => {
      t6.beginPath();
      for (let a5 = s4.to - 1; a5 >= s4.from; --a5) {
        const s5 = e11.ot[a5], l6 = Math.round(s5._t * i8) + r8, o11 = s5.ut * n6, _3 = h5 * n6 + r8;
        t6.moveTo(l6, o11), t6.arc(l6, o11, _3, 0, 2 * Math.PI);
      }
      t6.fill();
    };
    e11.ct > 0 && (t6.fillStyle = e11.dt, h4(e11.ft + e11.ct)), t6.fillStyle = e11.vt, h4(e11.ft);
  }
};
function I2() {
  return { ot: [{ _t: 0, ut: 0, wt: 0, Mt: 0 }], vt: "", dt: "", ft: 0, ct: 0, lt: null };
}
var V2 = { from: 0, to: 1 };
var B2 = class {
  constructor(t6, i8, n6) {
    this.gt = new T2(), this.bt = [], this.St = [], this.xt = true, this.O = t6, this.Ct = i8, this.yt = n6, this.gt.nt(this.bt);
  }
  kt(t6) {
    this.Pt(), this.xt = true;
  }
  Tt() {
    return this.xt && (this.Rt(), this.xt = false), this.gt;
  }
  Pt() {
    const t6 = this.yt.Dt();
    t6.length !== this.bt.length && (this.St = t6.map(I2), this.bt = this.St.map(((t7) => {
      const i8 = new D2();
      return i8.ht(t7), i8;
    })), this.gt.nt(this.bt));
  }
  Rt() {
    const t6 = 2 === this.Ct.N().mode || !this.Ct.It(), i8 = this.yt.Vt(), n6 = this.Ct.Bt(), s4 = this.O.Et();
    this.Pt(), i8.forEach(((i9, e11) => {
      const r8 = this.St[e11], h4 = i9.At(n6), a5 = i9.Lt();
      !t6 && null !== h4 && i9.It() && null !== a5 ? (r8.vt = h4.zt, r8.ft = h4.ft, r8.ct = h4.Ot, r8.ot[0].Mt = h4.Mt, r8.ot[0].ut = i9.Ft().Nt(h4.Mt, a5.Wt), r8.dt = h4.Ht ?? this.O.Ut(r8.ot[0].ut / i9.Ft().$t()), r8.ot[0].wt = n6, r8.ot[0]._t = s4.jt(n6), r8.lt = V2) : r8.lt = null;
    }));
  }
};
var E2 = class extends R2 {
  constructor(t6) {
    super(), this.qt = t6;
  }
  et({ context: t6, bitmapSize: i8, horizontalPixelRatio: n6, verticalPixelRatio: s4 }) {
    if (null === this.qt) return;
    const e11 = this.qt.Yt.It, r8 = this.qt.Kt.It;
    if (!e11 && !r8) return;
    const h4 = Math.round(this.qt._t * n6), o11 = Math.round(this.qt.ut * s4);
    t6.lineCap = "butt", e11 && h4 >= 0 && (t6.lineWidth = Math.floor(this.qt.Yt.ct * n6), t6.strokeStyle = this.qt.Yt.R, t6.fillStyle = this.qt.Yt.R, a4(t6, this.qt.Yt.Zt), (function(t7, i9, n7, s5) {
      t7.beginPath();
      const e12 = t7.lineWidth % 2 ? 0.5 : 0;
      t7.moveTo(i9 + e12, n7), t7.lineTo(i9 + e12, s5), t7.stroke();
    })(t6, h4, 0, i8.height)), r8 && o11 >= 0 && (t6.lineWidth = Math.floor(this.qt.Kt.ct * s4), t6.strokeStyle = this.qt.Kt.R, t6.fillStyle = this.qt.Kt.R, a4(t6, this.qt.Kt.Zt), l5(t6, o11, 0, i8.width));
  }
};
var A2 = class {
  constructor(t6, i8) {
    this.xt = true, this.Gt = { Yt: { ct: 1, Zt: 0, R: "", It: false }, Kt: { ct: 1, Zt: 0, R: "", It: false }, _t: 0, ut: 0 }, this.Xt = new E2(this.Gt), this.Jt = t6, this.yt = i8;
  }
  kt() {
    this.xt = true;
  }
  Tt(t6) {
    return this.xt && (this.Rt(), this.xt = false), this.Xt;
  }
  Rt() {
    const t6 = this.Jt.It(), i8 = this.yt.Qt().N().crosshair, n6 = this.Gt;
    if (2 === i8.mode) return n6.Kt.It = false, void (n6.Yt.It = false);
    n6.Kt.It = t6 && this.Jt.ti(this.yt), n6.Yt.It = t6 && this.Jt.ii(), n6.Kt.ct = i8.horzLine.width, n6.Kt.Zt = i8.horzLine.style, n6.Kt.R = i8.horzLine.color, n6.Yt.ct = i8.vertLine.width, n6.Yt.Zt = i8.vertLine.style, n6.Yt.R = i8.vertLine.color, n6._t = this.Jt.ni(), n6.ut = this.Jt.si();
  }
};
function z2(t6, i8, n6, s4, e11, r8) {
  t6.save(), t6.globalCompositeOperation = "copy", t6.fillStyle = r8, t6.fillRect(i8, n6, s4, e11), t6.restore();
}
function O(t6, i8, n6, s4, e11, r8) {
  t6.beginPath(), t6.roundRect ? t6.roundRect(i8, n6, s4, e11, r8) : (t6.lineTo(i8 + s4 - r8[1], n6), 0 !== r8[1] && t6.arcTo(i8 + s4, n6, i8 + s4, n6 + r8[1], r8[1]), t6.lineTo(i8 + s4, n6 + e11 - r8[2]), 0 !== r8[2] && t6.arcTo(i8 + s4, n6 + e11, i8 + s4 - r8[2], n6 + e11, r8[2]), t6.lineTo(i8 + r8[3], n6 + e11), 0 !== r8[3] && t6.arcTo(i8, n6 + e11, i8, n6 + e11 - r8[3], r8[3]), t6.lineTo(i8, n6 + r8[0]), 0 !== r8[0] && t6.arcTo(i8, n6, i8 + r8[0], n6, r8[0]));
}
function N2(t6, i8, n6, s4, e11, r8, h4 = 0, a5 = [0, 0, 0, 0], l6 = "") {
  if (t6.save(), !h4 || !l6 || l6 === r8) return O(t6, i8, n6, s4, e11, a5), t6.fillStyle = r8, t6.fill(), void t6.restore();
  const o11 = h4 / 2;
  var _3;
  O(t6, i8 + o11, n6 + o11, s4 - h4, e11 - h4, (_3 = -o11, a5.map(((t7) => 0 === t7 ? t7 : t7 + _3)))), "transparent" !== r8 && (t6.fillStyle = r8, t6.fill()), "transparent" !== l6 && (t6.lineWidth = h4, t6.strokeStyle = l6, t6.closePath(), t6.stroke()), t6.restore();
}
function F(t6, i8, n6, s4, e11, r8, h4) {
  t6.save(), t6.globalCompositeOperation = "copy";
  const a5 = t6.createLinearGradient(0, 0, 0, e11);
  a5.addColorStop(0, r8), a5.addColorStop(1, h4), t6.fillStyle = a5, t6.fillRect(i8, n6, s4, e11), t6.restore();
}
var W = class {
  constructor(t6, i8) {
    this.ht(t6, i8);
  }
  ht(t6, i8) {
    this.qt = t6, this.ei = i8;
  }
  $t(t6, i8) {
    return this.qt.It ? t6.k + t6.A + t6.I : 0;
  }
  st(t6, i8, n6, s4) {
    if (!this.qt.It || 0 === this.qt.ri.length) return;
    const e11 = this.qt.R, r8 = this.ei.G, h4 = t6.useBitmapCoordinateSpace(((t7) => {
      const h5 = t7.context;
      h5.font = i8.P;
      const a5 = this.hi(t7, i8, n6, s4), l6 = a5.ai;
      return a5.li ? N2(h5, l6.oi, l6._i, l6.ui, l6.ci, r8, l6.di, [l6.ft, 0, 0, l6.ft], r8) : N2(h5, l6.fi, l6._i, l6.ui, l6.ci, r8, l6.di, [0, l6.ft, l6.ft, 0], r8), this.qt.pi && (h5.fillStyle = e11, h5.fillRect(l6.fi, l6.mi, l6.wi - l6.fi, l6.Mi)), this.qt.gi && (h5.fillStyle = i8.D, h5.fillRect(a5.li ? l6.bi - l6.di : 0, l6._i, l6.di, l6.Si - l6._i)), a5;
    }));
    t6.useMediaCoordinateSpace((({ context: t7 }) => {
      const n7 = h4.xi;
      t7.font = i8.P, t7.textAlign = h4.li ? "right" : "left", t7.textBaseline = "middle", t7.fillStyle = e11, t7.fillText(this.qt.ri, n7.Ci, (n7._i + n7.Si) / 2 + n7.yi);
    }));
  }
  hi(t6, i8, n6, s4) {
    const { context: e11, bitmapSize: r8, mediaSize: h4, horizontalPixelRatio: a5, verticalPixelRatio: l6 } = t6, o11 = this.qt.pi || !this.qt.ki ? i8.C : 0, _3 = this.qt.Pi ? i8.S : 0, u5 = i8.A + this.ei.Ti, c6 = i8.I + this.ei.Ri, d4 = i8.V, f4 = i8.B, p4 = this.qt.ri, v3 = i8.k, m3 = n6.Di(e11, p4), w3 = Math.ceil(n6.Ii(e11, p4)), M3 = v3 + u5 + c6, g3 = i8.S + d4 + f4 + w3 + o11, b4 = Math.max(1, Math.floor(l6));
    let S4 = Math.round(M3 * l6);
    S4 % 2 != b4 % 2 && (S4 += 1);
    const x3 = _3 > 0 ? Math.max(1, Math.floor(_3 * a5)) : 0, C3 = Math.round(g3 * a5), y4 = Math.round(o11 * a5), k3 = this.ei.Vi ?? this.ei.Bi ?? this.ei.Ei, P3 = Math.round(k3 * l6) - Math.floor(0.5 * l6), T3 = Math.floor(P3 + b4 / 2 - S4 / 2), R3 = T3 + S4, D3 = "right" === s4, I3 = D3 ? h4.width - _3 : _3, V3 = D3 ? r8.width - x3 : x3;
    let B3, E3, A3;
    return D3 ? (B3 = V3 - C3, E3 = V3 - y4, A3 = I3 - o11 - d4 - _3) : (B3 = V3 + C3, E3 = V3 + y4, A3 = I3 + o11 + d4), { li: D3, ai: { _i: T3, mi: P3, Si: R3, ui: C3, ci: S4, ft: 2 * a5, di: x3, oi: B3, fi: V3, wi: E3, Mi: b4, bi: r8.width }, xi: { _i: T3 / l6, Si: R3 / l6, Ci: A3, yi: m3 } };
  }
};
var H2 = class {
  constructor(t6) {
    this.Ai = { Ei: 0, G: "#000", Ri: 0, Ti: 0 }, this.Li = { ri: "", It: false, pi: true, ki: false, Ht: "", R: "#FFF", gi: false, Pi: false }, this.zi = { ri: "", It: false, pi: false, ki: true, Ht: "", R: "#FFF", gi: true, Pi: true }, this.xt = true, this.Oi = new (t6 || W)(this.Li, this.Ai), this.Ni = new (t6 || W)(this.zi, this.Ai);
  }
  ri() {
    return this.Fi(), this.Li.ri;
  }
  Ei() {
    return this.Fi(), this.Ai.Ei;
  }
  kt() {
    this.xt = true;
  }
  $t(t6, i8 = false) {
    return Math.max(this.Oi.$t(t6, i8), this.Ni.$t(t6, i8));
  }
  Wi() {
    return this.Ai.Vi ?? null;
  }
  Hi() {
    return this.Ai.Vi ?? this.Ai.Bi ?? this.Ei();
  }
  Ui(t6) {
    this.Ai.Bi = t6 ?? void 0;
  }
  $i() {
    return this.Fi(), this.Li.It || this.zi.It;
  }
  ji() {
    return this.Fi(), this.Li.It;
  }
  Tt(t6) {
    return this.Fi(), this.Li.pi = this.Li.pi && t6.N().ticksVisible, this.zi.pi = this.zi.pi && t6.N().ticksVisible, this.Oi.ht(this.Li, this.Ai), this.Ni.ht(this.zi, this.Ai), this.Oi;
  }
  qi() {
    return this.Fi(), this.Oi.ht(this.Li, this.Ai), this.Ni.ht(this.zi, this.Ai), this.Ni;
  }
  Fi() {
    this.xt && (this.Li.pi = true, this.zi.pi = false, this.Yi(this.Li, this.zi, this.Ai));
  }
};
var U = class extends H2 {
  constructor(t6, i8, n6) {
    super(), this.Jt = t6, this.Ki = i8, this.Zi = n6;
  }
  Yi(t6, i8, n6) {
    if (t6.It = false, 2 === this.Jt.N().mode) return;
    const s4 = this.Jt.N().horzLine;
    if (!s4.labelVisible) return;
    const e11 = this.Ki.Lt();
    if (!this.Jt.It() || this.Ki.Gi() || null === e11) return;
    const r8 = this.Ki.Xi().Z(s4.labelBackgroundColor);
    n6.G = r8.G, t6.R = r8.X;
    const h4 = 2 / 12 * this.Ki.k();
    n6.Ti = h4, n6.Ri = h4;
    const a5 = this.Zi(this.Ki);
    n6.Ei = a5.Ei, t6.ri = this.Ki.Ji(a5.Mt, e11), t6.It = true;
  }
};
var $3 = /[1-9]/g;
var j2 = class {
  constructor() {
    this.qt = null;
  }
  ht(t6) {
    this.qt = t6;
  }
  st(t6, i8) {
    if (null === this.qt || false === this.qt.It || 0 === this.qt.ri.length) return;
    const n6 = t6.useMediaCoordinateSpace((({ context: t7 }) => (t7.font = i8.P, Math.round(i8.Qi.Ii(t7, u4(this.qt).ri, $3)))));
    if (n6 <= 0) return;
    const s4 = i8.tn, e11 = n6 + 2 * s4, r8 = e11 / 2, h4 = this.qt.nn;
    let a5 = this.qt.Ei, l6 = Math.floor(a5 - r8) + 0.5;
    l6 < 0 ? (a5 += Math.abs(0 - l6), l6 = Math.floor(a5 - r8) + 0.5) : l6 + e11 > h4 && (a5 -= Math.abs(h4 - (l6 + e11)), l6 = Math.floor(a5 - r8) + 0.5);
    const o11 = l6 + e11, _3 = Math.ceil(0 + i8.S + i8.C + i8.A + i8.k + i8.I);
    t6.useBitmapCoordinateSpace((({ context: t7, horizontalPixelRatio: n7, verticalPixelRatio: s5 }) => {
      const e12 = u4(this.qt);
      t7.fillStyle = e12.G;
      const r9 = Math.round(l6 * n7), h5 = Math.round(0 * s5), a6 = Math.round(o11 * n7), c6 = Math.round(_3 * s5), d4 = Math.round(2 * n7);
      if (t7.beginPath(), t7.moveTo(r9, h5), t7.lineTo(r9, c6 - d4), t7.arcTo(r9, c6, r9 + d4, c6, d4), t7.lineTo(a6 - d4, c6), t7.arcTo(a6, c6, a6, c6 - d4, d4), t7.lineTo(a6, h5), t7.fill(), e12.pi) {
        const r10 = Math.round(e12.Ei * n7), a7 = h5, l7 = Math.round((a7 + i8.C) * s5);
        t7.fillStyle = e12.R;
        const o12 = Math.max(1, Math.floor(n7)), _4 = Math.floor(0.5 * n7);
        t7.fillRect(r10 - _4, a7, o12, l7 - a7);
      }
    })), t6.useMediaCoordinateSpace((({ context: t7 }) => {
      const n7 = u4(this.qt), e12 = 0 + i8.S + i8.C + i8.A + i8.k / 2;
      t7.font = i8.P, t7.textAlign = "left", t7.textBaseline = "middle", t7.fillStyle = n7.R;
      const r9 = i8.Qi.Di(t7, "Apr0");
      t7.translate(l6 + s4, e12 + r9), t7.fillText(n7.ri, 0, 0);
    }));
  }
};
var q = class {
  constructor(t6, i8, n6) {
    this.xt = true, this.Xt = new j2(), this.Gt = { It: false, G: "#4c525e", R: "white", ri: "", nn: 0, Ei: NaN, pi: true }, this.Ct = t6, this.sn = i8, this.Zi = n6;
  }
  kt() {
    this.xt = true;
  }
  Tt() {
    return this.xt && (this.Rt(), this.xt = false), this.Xt.ht(this.Gt), this.Xt;
  }
  Rt() {
    const t6 = this.Gt;
    if (t6.It = false, 2 === this.Ct.N().mode) return;
    const i8 = this.Ct.N().vertLine;
    if (!i8.labelVisible) return;
    const n6 = this.sn.Et();
    if (n6.Gi()) return;
    t6.nn = n6.nn();
    const s4 = this.Zi();
    if (null === s4) return;
    t6.Ei = s4.Ei;
    const e11 = n6.en(this.Ct.Bt());
    t6.ri = n6.rn(u4(e11)), t6.It = true;
    const r8 = this.sn.Xi().Z(i8.labelBackgroundColor);
    t6.G = r8.G, t6.R = r8.X, t6.pi = n6.N().ticksVisible;
  }
};
var Y = class {
  constructor() {
    this.hn = null, this.an = 0;
  }
  ln() {
    return this.an;
  }
  _n(t6) {
    this.an = t6;
  }
  Ft() {
    return this.hn;
  }
  un(t6) {
    this.hn = t6;
  }
  cn(t6) {
    return [];
  }
  dn() {
    return [];
  }
  It() {
    return true;
  }
};
var K;
!(function(t6) {
  t6[t6.Normal = 0] = "Normal", t6[t6.Magnet = 1] = "Magnet", t6[t6.Hidden = 2] = "Hidden", t6[t6.MagnetOHLC = 3] = "MagnetOHLC";
})(K || (K = {}));
var Z2 = class extends Y {
  constructor(t6, i8) {
    super(), this.yt = null, this.fn = NaN, this.pn = 0, this.vn = false, this.mn = /* @__PURE__ */ new Map(), this.wn = false, this.Mn = /* @__PURE__ */ new WeakMap(), this.gn = /* @__PURE__ */ new WeakMap(), this.bn = NaN, this.Sn = NaN, this.xn = NaN, this.Cn = NaN, this.sn = t6, this.yn = i8;
    this.kn = /* @__PURE__ */ ((t7, i9) => (n7) => {
      const s4 = i9(), e11 = t7();
      if (n7 === u4(this.yt).Pn()) return { Mt: e11, Ei: s4 };
      {
        const t8 = u4(n7.Lt());
        return { Mt: n7.Tn(s4, t8), Ei: s4 };
      }
    })((() => this.fn), (() => this.Sn));
    const n6 = /* @__PURE__ */ ((t7, i9) => () => {
      const n7 = this.sn.Et().Rn(t7()), s4 = i9();
      return n7 && Number.isFinite(s4) ? { wt: n7, Ei: s4 } : null;
    })((() => this.pn), (() => this.ni()));
    this.Dn = new q(this, t6, n6);
  }
  N() {
    return this.yn;
  }
  In(t6, i8) {
    this.xn = t6, this.Cn = i8;
  }
  Vn() {
    this.xn = NaN, this.Cn = NaN;
  }
  Bn() {
    return this.xn;
  }
  En() {
    return this.Cn;
  }
  An(t6, i8, n6) {
    this.wn || (this.wn = true), this.vn = true, this.Ln(t6, i8, n6);
  }
  Bt() {
    return this.pn;
  }
  ni() {
    return this.bn;
  }
  si() {
    return this.Sn;
  }
  It() {
    return this.vn;
  }
  zn() {
    this.vn = false, this.On(), this.fn = NaN, this.bn = NaN, this.Sn = NaN, this.yt = null, this.Vn(), this.Nn();
  }
  Fn(t6) {
    if (!this.yn.doNotSnapToHiddenSeriesIndices) return t6;
    const i8 = this.sn, n6 = i8.Et();
    let s4 = null, e11 = null;
    for (const n7 of i8.Wn()) {
      const i9 = n7.Un().Hn(t6, -1);
      if (i9) {
        if (i9.$n === t6) return t6;
        (null === s4 || i9.$n > s4) && (s4 = i9.$n);
      }
      const r9 = n7.Un().Hn(t6, 1);
      if (r9) {
        if (r9.$n === t6) return t6;
        (null === e11 || r9.$n < e11) && (e11 = r9.$n);
      }
    }
    const r8 = [s4, e11].filter(g2);
    if (0 === r8.length) return t6;
    const h4 = n6.jt(t6), a5 = r8.map(((t7) => Math.abs(h4 - n6.jt(t7))));
    return r8[a5.indexOf(Math.min(...a5))];
  }
  jn(t6) {
    let i8 = this.Mn.get(t6);
    i8 || (i8 = new A2(this, t6), this.Mn.set(t6, i8));
    let n6 = this.gn.get(t6);
    return n6 || (n6 = new B2(this.sn, this, t6), this.gn.set(t6, n6)), [i8, n6];
  }
  ti(t6) {
    return t6 === this.yt && this.yn.horzLine.visible;
  }
  ii() {
    return this.yn.vertLine.visible;
  }
  qn(t6, i8) {
    this.vn && this.yt === t6 || this.mn.clear();
    const n6 = [];
    return this.yt === t6 && n6.push(this.Yn(this.mn, i8, this.kn)), n6;
  }
  dn() {
    return this.vn ? [this.Dn] : [];
  }
  Kn() {
    return this.yt;
  }
  Nn() {
    this.sn.Zn().forEach(((t6) => {
      this.Mn.get(t6)?.kt(), this.gn.get(t6)?.kt();
    })), this.mn.forEach(((t6) => t6.kt())), this.Dn.kt();
  }
  Gn(t6) {
    return t6 && !t6.Pn().Gi() ? t6.Pn() : null;
  }
  Ln(t6, i8, n6) {
    this.Xn(t6, i8, n6) && this.Nn();
  }
  Xn(t6, i8, n6) {
    const s4 = this.bn, e11 = this.Sn, r8 = this.fn, h4 = this.pn, a5 = this.yt, l6 = this.Gn(n6);
    this.pn = t6, this.bn = isNaN(t6) ? NaN : this.sn.Et().jt(t6), this.yt = n6;
    const o11 = null !== l6 ? l6.Lt() : null;
    return null !== l6 && null !== o11 ? (this.fn = i8, this.Sn = l6.Nt(i8, o11)) : (this.fn = NaN, this.Sn = NaN), s4 !== this.bn || e11 !== this.Sn || h4 !== this.pn || r8 !== this.fn || a5 !== this.yt;
  }
  On() {
    const t6 = this.sn.Jn().map(((t7) => t7.Un().Qn())).filter(g2), i8 = 0 === t6.length ? null : Math.max(...t6);
    this.pn = null !== i8 ? i8 : NaN;
  }
  Yn(t6, i8, n6) {
    let s4 = t6.get(i8);
    return void 0 === s4 && (s4 = new U(this, i8, n6), t6.set(i8, s4)), s4;
  }
};
function G(t6) {
  return "left" === t6 || "right" === t6;
}
var X = class _X {
  constructor(t6) {
    this.ts = /* @__PURE__ */ new Map(), this.ns = [], this.ss = t6;
  }
  es(t6, i8) {
    const n6 = (function(t7, i9) {
      return void 0 === t7 ? i9 : { rs: Math.max(t7.rs, i9.rs), hs: t7.hs || i9.hs };
    })(this.ts.get(t6), i8);
    this.ts.set(t6, n6);
  }
  ls() {
    return this.ss;
  }
  _s(t6) {
    const i8 = this.ts.get(t6);
    return void 0 === i8 ? { rs: this.ss } : { rs: Math.max(this.ss, i8.rs), hs: i8.hs };
  }
  us() {
    this.cs(), this.ns = [{ ds: 0 }];
  }
  fs(t6) {
    this.cs(), this.ns = [{ ds: 1, Wt: t6 }];
  }
  ps(t6) {
    this.vs(), this.ns.push({ ds: 5, Wt: t6 });
  }
  cs() {
    this.vs(), this.ns.push({ ds: 6 });
  }
  ws() {
    this.cs(), this.ns = [{ ds: 4 }];
  }
  Ms(t6) {
    this.cs(), this.ns.push({ ds: 2, Wt: t6 });
  }
  gs(t6) {
    this.cs(), this.ns.push({ ds: 3, Wt: t6 });
  }
  bs() {
    return this.ns;
  }
  Ss(t6) {
    for (const i8 of t6.ns) this.xs(i8);
    this.ss = Math.max(this.ss, t6.ss), t6.ts.forEach(((t7, i8) => {
      this.es(i8, t7);
    }));
  }
  static Cs() {
    return new _X(2);
  }
  static ys() {
    return new _X(3);
  }
  xs(t6) {
    switch (t6.ds) {
      case 0:
        this.us();
        break;
      case 1:
        this.fs(t6.Wt);
        break;
      case 2:
        this.Ms(t6.Wt);
        break;
      case 3:
        this.gs(t6.Wt);
        break;
      case 4:
        this.ws();
        break;
      case 5:
        this.ps(t6.Wt);
        break;
      case 6:
        this.vs();
    }
  }
  vs() {
    const t6 = this.ns.findIndex(((t7) => 5 === t7.ds));
    -1 !== t6 && this.ns.splice(t6, 1);
  }
};
var J = class {
  formatTickmarks(t6) {
    return t6.map(((t7) => this.format(t7)));
  }
};
var Q = ".";
function tt(t6, i8) {
  if (!p3(t6)) return "n/a";
  if (!v2(i8)) throw new TypeError("invalid length");
  if (i8 < 0 || i8 > 16) throw new TypeError("invalid length");
  if (0 === i8) return t6.toString();
  return ("0000000000000000" + t6.toString()).slice(-i8);
}
var it = class extends J {
  constructor(t6, i8) {
    if (super(), i8 || (i8 = 1), p3(t6) && v2(t6) || (t6 = 100), t6 < 0) throw new TypeError("invalid base");
    this.Ki = t6, this.ks = i8, this.Ps();
  }
  format(t6) {
    const i8 = t6 < 0 ? "\u2212" : "";
    return t6 = Math.abs(t6), i8 + this.Ts(t6);
  }
  Ps() {
    if (this.Rs = 0, this.Ki > 0 && this.ks > 0) {
      let t6 = this.Ki;
      for (; t6 > 1; ) t6 /= 10, this.Rs++;
    }
  }
  Ts(t6) {
    const i8 = this.Ki / this.ks;
    let n6 = Math.floor(t6), s4 = "";
    const e11 = void 0 !== this.Rs ? this.Rs : NaN;
    if (i8 > 1) {
      let r8 = +(Math.round(t6 * i8) - n6 * i8).toFixed(this.Rs);
      r8 >= i8 && (r8 -= i8, n6 += 1), s4 = Q + tt(+r8.toFixed(this.Rs) * this.ks, e11);
    } else n6 = Math.round(n6 * i8) / i8, e11 > 0 && (s4 = Q + tt(0, e11));
    return n6.toFixed(0) + s4;
  }
};
var nt = class extends it {
  constructor(t6 = 100) {
    super(t6);
  }
  format(t6) {
    return `${super.format(t6)}%`;
  }
};
var st = class extends J {
  constructor(t6) {
    super(), this.Ds = t6;
  }
  format(t6) {
    let i8 = "";
    return t6 < 0 && (i8 = "-", t6 = -t6), t6 < 995 ? i8 + this.Is(t6) : t6 < 999995 ? i8 + this.Is(t6 / 1e3) + "K" : t6 < 999999995 ? (t6 = 1e3 * Math.round(t6 / 1e3), i8 + this.Is(t6 / 1e6) + "M") : (t6 = 1e6 * Math.round(t6 / 1e6), i8 + this.Is(t6 / 1e9) + "B");
  }
  Is(t6) {
    let i8;
    const n6 = Math.pow(10, this.Ds);
    return i8 = (t6 = Math.round(t6 * n6) / n6) >= 1e-15 && t6 < 1 ? t6.toFixed(this.Ds).replace(/\.?0+$/, "") : String(t6), i8.replace(/(\.[1-9]*)0+$/, ((t7, i9) => i9));
  }
};
var et = /[2-9]/g;
var rt = class {
  constructor(t6 = 50) {
    this.Vs = 0, this.Bs = 1, this.Es = 1, this.As = {}, this.Ls = /* @__PURE__ */ new Map(), this.zs = t6;
  }
  Os() {
    this.Vs = 0, this.Ls.clear(), this.Bs = 1, this.Es = 1, this.As = {};
  }
  Ii(t6, i8, n6) {
    return this.Ns(t6, i8, n6).width;
  }
  Di(t6, i8, n6) {
    const s4 = this.Ns(t6, i8, n6);
    return ((s4.actualBoundingBoxAscent || 0) - (s4.actualBoundingBoxDescent || 0)) / 2;
  }
  Ns(t6, i8, n6) {
    const s4 = n6 || et, e11 = String(i8).replace(s4, "0");
    if (this.Ls.has(e11)) return _2(this.Ls.get(e11)).Fs;
    if (this.Vs === this.zs) {
      const t7 = this.As[this.Es];
      delete this.As[this.Es], this.Ls.delete(t7), this.Es++, this.Vs--;
    }
    t6.save(), t6.textBaseline = "middle";
    const r8 = t6.measureText(e11);
    return t6.restore(), 0 === r8.width && i8.length || (this.Ls.set(e11, { Fs: r8, Ws: this.Bs }), this.As[this.Bs] = e11, this.Vs++, this.Bs++), r8;
  }
};
var ht = class {
  constructor(t6) {
    this.Hs = null, this.M = null, this.Us = "right", this.$s = t6;
  }
  js(t6, i8, n6) {
    this.Hs = t6, this.M = i8, this.Us = n6;
  }
  st(t6) {
    null !== this.M && null !== this.Hs && this.Hs.st(t6, this.M, this.$s, this.Us);
  }
};
var at = class {
  constructor(t6, i8, n6) {
    this.qs = t6, this.$s = new rt(50), this.Ys = i8, this.O = n6, this.F = -1, this.Xt = new ht(this.$s);
  }
  Tt() {
    const t6 = this.O.Ks(this.Ys);
    if (null === t6) return null;
    const i8 = t6.Zs(this.Ys) ? t6.Gs() : this.Ys.Ft();
    if (null === i8) return null;
    const n6 = t6.Xs(i8);
    if ("overlay" === n6) return null;
    const s4 = this.O.Js();
    return s4.k !== this.F && (this.F = s4.k, this.$s.Os()), this.Xt.js(this.qs.qi(), s4, n6), this.Xt;
  }
};
var lt = class extends R2 {
  constructor() {
    super(...arguments), this.qt = null;
  }
  ht(t6) {
    this.qt = t6;
  }
  Qs(t6, i8) {
    if (!this.qt?.It) return null;
    const { ut: n6, ct: s4, te: e11 } = this.qt;
    return i8 >= n6 - s4 - 7 && i8 <= n6 + s4 + 7 ? { ie: this.qt, ne: Math.abs(i8 - n6), se: 2, ee: "price-line", te: e11 } : null;
  }
  et({ context: t6, bitmapSize: i8, horizontalPixelRatio: n6, verticalPixelRatio: s4 }) {
    if (null === this.qt) return;
    if (false === this.qt.It) return;
    const e11 = Math.round(this.qt.ut * s4);
    e11 < 0 || e11 > i8.height || (t6.lineCap = "butt", t6.strokeStyle = this.qt.R, t6.lineWidth = Math.floor(this.qt.ct * n6), a4(t6, this.qt.Zt), l5(t6, e11, 0, i8.width));
  }
};
var ot = class {
  constructor(t6) {
    this.re = { ut: 0, R: "rgba(0, 0, 0, 0)", ct: 1, Zt: 0, It: false }, this.he = new lt(), this.xt = true, this.ae = t6, this.le = t6.Qt(), this.he.ht(this.re);
  }
  kt() {
    this.xt = true;
  }
  Tt() {
    return this.ae.It() ? (this.xt && (this.oe(), this.xt = false), this.he) : null;
  }
};
var _t = class extends ot {
  constructor(t6) {
    super(t6);
  }
  oe() {
    this.re.It = false;
    const t6 = this.ae.Ft(), i8 = t6._e()._e;
    if (2 !== i8 && 3 !== i8) return;
    const n6 = this.ae.N();
    if (!n6.baseLineVisible || !this.ae.It()) return;
    const s4 = this.ae.Lt();
    null !== s4 && (this.re.It = true, this.re.ut = t6.Nt(s4.Wt, s4.Wt), this.re.R = n6.baseLineColor, this.re.ct = n6.baseLineWidth, this.re.Zt = n6.baseLineStyle);
  }
};
var ut = class extends R2 {
  constructor() {
    super(...arguments), this.qt = null;
  }
  ht(t6) {
    this.qt = t6;
  }
  ue() {
    return this.qt;
  }
  et({ context: t6, horizontalPixelRatio: i8, verticalPixelRatio: n6 }) {
    const s4 = this.qt;
    if (null === s4) return;
    const e11 = Math.max(1, Math.floor(i8)), r8 = e11 % 2 / 2, h4 = Math.round(s4.ce.x * i8) + r8, a5 = s4.ce.y * n6;
    t6.fillStyle = s4.de, t6.beginPath();
    const l6 = Math.max(2, 1.5 * s4.fe) * i8;
    t6.arc(h4, a5, l6, 0, 2 * Math.PI, false), t6.fill(), t6.fillStyle = s4.pe, t6.beginPath(), t6.arc(h4, a5, s4.ft * i8, 0, 2 * Math.PI, false), t6.fill(), t6.lineWidth = e11, t6.strokeStyle = s4.ve, t6.beginPath(), t6.arc(h4, a5, s4.ft * i8 + e11 / 2, 0, 2 * Math.PI, false), t6.stroke();
  }
};
var ct = [{ me: 0, we: 0.25, Me: 4, ge: 10, be: 0.25, Se: 0, xe: 0.4, Ce: 0.8 }, { me: 0.25, we: 0.525, Me: 10, ge: 14, be: 0, Se: 0, xe: 0.8, Ce: 0 }, { me: 0.525, we: 1, Me: 14, ge: 14, be: 0, Se: 0, xe: 0, Ce: 0 }];
var dt = class {
  constructor(t6) {
    this.Xt = new ut(), this.xt = true, this.ye = true, this.ke = performance.now(), this.Pe = this.ke - 1, this.Te = t6;
  }
  Re() {
    this.Pe = this.ke - 1, this.kt();
  }
  De() {
    if (this.kt(), 2 === this.Te.N().lastPriceAnimation) {
      const t6 = performance.now(), i8 = this.Pe - t6;
      if (i8 > 0) return void (i8 < 650 && (this.Pe += 2600));
      this.ke = t6, this.Pe = t6 + 2600;
    }
  }
  kt() {
    this.xt = true;
  }
  Ie() {
    this.ye = true;
  }
  It() {
    return 0 !== this.Te.N().lastPriceAnimation;
  }
  Ve() {
    switch (this.Te.N().lastPriceAnimation) {
      case 0:
        return false;
      case 1:
        return true;
      case 2:
        return performance.now() <= this.Pe;
    }
  }
  Tt() {
    return this.xt ? (this.Rt(), this.xt = false, this.ye = false) : this.ye && (this.Be(), this.ye = false), this.Xt;
  }
  Rt() {
    this.Xt.ht(null);
    const t6 = this.Te.Qt().Et(), i8 = t6.Ee(), n6 = this.Te.Lt();
    if (null === i8 || null === n6) return;
    const s4 = this.Te.Ae(true);
    if (s4.Le || !i8.ze(s4.$n)) return;
    const e11 = { x: t6.jt(s4.$n), y: this.Te.Ft().Nt(s4.Mt, n6.Wt) }, r8 = s4.R, h4 = this.Te.N().lineWidth, a5 = this.Oe(this.Ne(), r8);
    this.Xt.ht({ de: r8, fe: h4, pe: a5.pe, ve: a5.ve, ft: a5.ft, ce: e11 });
  }
  Be() {
    const t6 = this.Xt.ue();
    if (null !== t6) {
      const i8 = this.Oe(this.Ne(), t6.de);
      t6.pe = i8.pe, t6.ve = i8.ve, t6.ft = i8.ft;
    }
  }
  Ne() {
    return this.Ve() ? performance.now() - this.ke : 2599;
  }
  Fe(t6, i8, n6, s4) {
    const e11 = n6 + (s4 - n6) * i8;
    return this.Te.Qt().Xi().Y(t6, e11);
  }
  Oe(t6, i8) {
    const n6 = t6 % 2600 / 2600;
    let s4;
    for (const t7 of ct) if (n6 >= t7.me && n6 <= t7.we) {
      s4 = t7;
      break;
    }
    o10(void 0 !== s4, "Last price animation internal logic error");
    const e11 = (n6 - s4.me) / (s4.we - s4.me);
    return { pe: this.Fe(i8, e11, s4.be, s4.Se), ve: this.Fe(i8, e11, s4.xe, s4.Ce), ft: (r8 = e11, h4 = s4.Me, a5 = s4.ge, h4 + (a5 - h4) * r8) };
    var r8, h4, a5;
  }
};
var ft = class extends ot {
  constructor(t6) {
    super(t6);
  }
  oe() {
    const t6 = this.re;
    t6.It = false;
    const i8 = this.ae.N();
    if (!i8.priceLineVisible || !this.ae.It()) return;
    const n6 = this.ae.Ae(0 === i8.priceLineSource);
    n6.Le || (t6.It = true, t6.ut = n6.Ei, t6.R = this.ae.We(n6.R), t6.ct = i8.priceLineWidth, t6.Zt = i8.priceLineStyle);
  }
};
var pt = class extends H2 {
  constructor(t6) {
    super(), this.Jt = t6;
  }
  Yi(t6, i8, n6) {
    t6.It = false, i8.It = false;
    const s4 = this.Jt;
    if (!s4.It()) return;
    const e11 = s4.N(), r8 = e11.lastValueVisible, h4 = "" !== s4.He(), a5 = 0 === e11.seriesLastValueMode, l6 = s4.Ae(false);
    if (l6.Le) return;
    r8 && (t6.ri = this.Ue(l6, r8, a5), t6.It = 0 !== t6.ri.length), (h4 || a5) && (i8.ri = this.$e(l6, r8, h4, a5), i8.It = i8.ri.length > 0);
    const o11 = s4.We(l6.R), _3 = this.Jt.Qt().Xi().Z(o11);
    n6.G = _3.G, n6.Ei = l6.Ei, i8.Ht = s4.Qt().Ut(l6.Ei / s4.Ft().$t()), t6.Ht = o11, t6.R = _3.X, i8.R = _3.X;
  }
  $e(t6, i8, n6, s4) {
    let e11 = "";
    const r8 = this.Jt.He();
    return n6 && 0 !== r8.length && (e11 += `${r8} `), i8 && s4 && (e11 += this.Jt.Ft().je() ? t6.qe : t6.Ye), e11.trim();
  }
  Ue(t6, i8, n6) {
    return i8 ? n6 ? this.Jt.Ft().je() ? t6.Ye : t6.qe : t6.ri : "";
  }
};
function vt(t6, i8, n6, s4) {
  const e11 = Number.isFinite(i8), r8 = Number.isFinite(n6);
  return e11 && r8 ? t6(i8, n6) : e11 || r8 ? e11 ? i8 : n6 : s4;
}
var mt = class _mt {
  constructor(t6, i8) {
    this.Ke = t6, this.Ze = i8;
  }
  Ge(t6) {
    return null !== t6 && (this.Ke === t6.Ke && this.Ze === t6.Ze);
  }
  Xe() {
    return new _mt(this.Ke, this.Ze);
  }
  Je() {
    return this.Ke;
  }
  Qe() {
    return this.Ze;
  }
  tr() {
    return this.Ze - this.Ke;
  }
  Gi() {
    return this.Ze === this.Ke || Number.isNaN(this.Ze) || Number.isNaN(this.Ke);
  }
  Ss(t6) {
    return null === t6 ? this : new _mt(vt(Math.min, this.Je(), t6.Je(), -1 / 0), vt(Math.max, this.Qe(), t6.Qe(), 1 / 0));
  }
  ir(t6) {
    if (!p3(t6)) return;
    if (0 === this.Ze - this.Ke) return;
    const i8 = 0.5 * (this.Ze + this.Ke);
    let n6 = this.Ze - i8, s4 = this.Ke - i8;
    n6 *= t6, s4 *= t6, this.Ze = i8 + n6, this.Ke = i8 + s4;
  }
  nr(t6) {
    p3(t6) && (this.Ze += t6, this.Ke += t6);
  }
  sr() {
    return { minValue: this.Ke, maxValue: this.Ze };
  }
  static er(t6) {
    return null === t6 ? null : new _mt(t6.minValue, t6.maxValue);
  }
};
var wt = class _wt {
  constructor(t6, i8) {
    this.rr = t6, this.hr = i8 || null;
  }
  ar() {
    return this.rr;
  }
  lr() {
    return this.hr;
  }
  sr() {
    return { priceRange: null === this.rr ? null : this.rr.sr(), margins: this.hr || void 0 };
  }
  static er(t6) {
    return null === t6 ? null : new _wt(mt.er(t6.priceRange), t6.margins);
  }
};
var Mt = [2, 4, 8, 16, 32, 64, 128, 256, 512];
var gt = "Custom series with conflation reducer must have a priceValueBuilder method";
var bt = class extends ot {
  constructor(t6, i8) {
    super(t6), this._r = i8;
  }
  oe() {
    const t6 = this.re;
    t6.It = false;
    const i8 = this._r.N();
    if (!this.ae.It() || !i8.lineVisible) return;
    const n6 = this._r.ur();
    null !== n6 && (t6.It = true, t6.ut = n6, t6.R = i8.color, t6.ct = i8.lineWidth, t6.Zt = i8.lineStyle, t6.te = this._r.N().id);
  }
};
var St = class extends H2 {
  constructor(t6, i8) {
    super(), this.Te = t6, this._r = i8;
  }
  Yi(t6, i8, n6) {
    t6.It = false, i8.It = false;
    const s4 = this._r.N(), e11 = s4.axisLabelVisible, r8 = "" !== s4.title, h4 = this.Te;
    if (!e11 || !h4.It()) return;
    const a5 = this._r.ur();
    if (null === a5) return;
    r8 && (i8.ri = s4.title, i8.It = true), i8.Ht = h4.Qt().Ut(a5 / h4.Ft().$t()), t6.ri = this.cr(s4.price), t6.It = true;
    const l6 = this.Te.Qt().Xi().Z(s4.axisLabelColor || s4.color);
    n6.G = l6.G;
    const o11 = s4.axisLabelTextColor || l6.X;
    t6.R = o11, i8.R = o11, n6.Ei = a5;
  }
  cr(t6) {
    const i8 = this.Te.Lt();
    return null === i8 ? "" : this.Te.Ft().Ji(t6, i8.Wt);
  }
};
var xt = class {
  constructor(t6, i8) {
    this.Te = t6, this.yn = i8, this.dr = new bt(t6, this), this.qs = new St(t6, this), this.pr = new at(this.qs, t6, t6.Qt());
  }
  vr(t6) {
    f3(this.yn, t6), this.kt(), this.Te.Qt().mr();
  }
  N() {
    return this.yn;
  }
  wr() {
    return this.dr;
  }
  Mr() {
    return this.pr;
  }
  gr() {
    return this.qs;
  }
  kt() {
    this.dr.kt(), this.qs.kt();
  }
  ur() {
    const t6 = this.Te, i8 = t6.Ft();
    if (t6.Qt().Et().Gi() || i8.Gi()) return null;
    const n6 = t6.Lt();
    return null === n6 ? null : i8.Nt(this.yn.price, n6.Wt);
  }
};
var Ct = class {
  constructor() {
    this.br = /* @__PURE__ */ new WeakMap();
  }
  Sr(t6, i8, n6) {
    const s4 = 1 / i8 * n6;
    if (t6 >= s4) return 1;
    const e11 = s4 / t6, r8 = Math.pow(2, Math.floor(Math.log2(e11)));
    return Math.min(r8, 512);
  }
  Cr(t6, i8, n6, s4 = false, e11) {
    if (0 === t6.length || i8 <= 1) return t6;
    const r8 = this.yr(i8);
    if (r8 <= 1) return t6;
    const h4 = this.kr(t6);
    let a5 = h4.Pr.get(r8);
    return void 0 !== a5 || (a5 = this.Tr(t6, r8, n6, s4, e11, h4.Pr), h4.Pr.set(r8, a5)), a5;
  }
  Rr(t6, i8, n6, s4, e11 = false, r8) {
    if (n6 < 1 || 0 === t6.length) return t6;
    const h4 = this.kr(t6), a5 = h4.Pr.get(n6);
    if (!a5) return this.Cr(t6, n6, s4, e11, r8);
    const l6 = this.Dr(t6, i8, n6, a5, e11, s4, r8);
    return h4.Pr.set(n6, l6), l6;
  }
  yr(t6) {
    if (t6 <= 2) return 2;
    for (const i8 of Mt) if (t6 <= i8) return i8;
    return 512;
  }
  Ir(t6) {
    if (0 === t6.length) return 0;
    const i8 = t6[0], n6 = t6[t6.length - 1];
    return 31 * t6.length + 17 * i8.$n + 13 * n6.$n;
  }
  Tr(t6, i8, n6, s4 = false, e11, r8 = /* @__PURE__ */ new Map()) {
    if (2 === i8) return this.Vr(t6, 2, n6, s4, e11);
    const h4 = i8 / 2;
    let a5 = r8.get(h4);
    return a5 || (a5 = this.Tr(t6, h4, n6, s4, e11, r8), r8.set(h4, a5)), this.Br(a5, n6, s4, e11);
  }
  Vr(t6, i8, n6, s4 = false, e11) {
    const r8 = this.Er(t6, i8, n6, s4, e11);
    return this.Ar(r8, s4);
  }
  Br(t6, i8, n6 = false, s4) {
    const e11 = this.Er(t6, 2, i8, n6, s4);
    return this.Ar(e11, n6);
  }
  Er(t6, i8, n6, s4 = false, e11) {
    const r8 = [];
    for (let h4 = 0; h4 < t6.length; h4 += i8) {
      if (t6.length - h4 >= i8) {
        const i9 = this.Lr(t6[h4], t6[h4 + 1], n6, s4, e11);
        i9.zr = false, r8.push(i9);
      } else if (0 === r8.length) r8.push(this.Or(t6[h4], true));
      else {
        const i9 = r8[r8.length - 1];
        r8[r8.length - 1] = this.Nr(i9, t6[h4], n6, s4, e11);
      }
    }
    return r8;
  }
  Fr(t6, i8) {
    return (t6 ?? 1) + (i8 ?? 1);
  }
  Lr(t6, i8, n6, s4 = false, e11) {
    if (!s4 || !n6 || !e11) {
      const n7 = t6.Wt[1] > i8.Wt[1] ? t6.Wt[1] : i8.Wt[1], s5 = t6.Wt[2] < i8.Wt[2] ? t6.Wt[2] : i8.Wt[2];
      return { Wr: t6.$n, Hr: i8.$n, Ur: t6.wt, $r: i8.wt, jr: t6.Wt[0], qr: n7, Yr: s5, Kr: i8.Wt[3], Zr: this.Fr(t6.Zr, i8.Zr), Gr: void 0, zr: false };
    }
    const r8 = n6(this.Xr(t6, e11), this.Xr(i8, e11)), h4 = e11(r8), a5 = h4.length ? h4[h4.length - 1] : 0;
    return { Wr: t6.$n, Hr: i8.$n, Ur: t6.wt, $r: i8.wt, jr: t6.Wt[0], qr: Math.max(t6.Wt[1], a5), Yr: Math.min(t6.Wt[2], a5), Kr: a5, Zr: this.Fr(t6.Zr, i8.Zr), Gr: r8, zr: false };
  }
  Nr(t6, i8, n6, s4 = false, e11) {
    if (!s4 || !n6 || !e11) return { Wr: t6.Wr, Hr: i8.$n, Ur: t6.Ur, $r: i8.wt, jr: t6.jr, qr: t6.qr > i8.Wt[1] ? t6.qr : i8.Wt[1], Yr: t6.Yr < i8.Wt[2] ? t6.Yr : i8.Wt[2], Kr: i8.Wt[3], Zr: t6.Zr + (i8.Zr ?? 1), Gr: t6.Gr, zr: false };
    const r8 = t6.Gr, h4 = this.Xr(i8, e11), a5 = r8 ? { data: r8, index: t6.Wr, originalTime: t6.Ur, time: t6.Ur, priceValues: e11(r8) } : null, l6 = a5 ? n6(a5, h4) : h4.data, o11 = a5 ? e11(l6) : h4.priceValues, _3 = o11.length ? o11[o11.length - 1] : 0;
    return { Wr: t6.Wr, Hr: i8.$n, Ur: t6.Ur, $r: i8.wt, jr: t6.jr, qr: Math.max(t6.qr, _3), Yr: Math.min(t6.Yr, _3), Kr: _3, Zr: t6.Zr + (i8.Zr ?? 1), Gr: l6, zr: false };
  }
  Jr(t6, i8, n6, s4, e11, r8, h4 = false, a5) {
    const l6 = i8 === s4 ? e11 : t6[i8];
    if (n6 - i8 == 1) return this.Or(l6, true);
    const o11 = i8 + 1 === s4 ? e11 : t6[i8 + 1];
    let _3 = this.Lr(l6, o11, r8, h4, a5);
    for (let l7 = i8 + 2; l7 < n6; l7++) {
      const i9 = l7 === s4 ? e11 : t6[l7];
      _3 = this.Nr(_3, i9, r8, h4, a5);
    }
    return _3;
  }
  Xr(t6, i8) {
    const n6 = t6.ue ?? {};
    return { data: t6.ue, index: t6.$n, originalTime: t6.Qr, time: t6.wt, priceValues: i8(n6) };
  }
  th(t6, i8 = false) {
    const n6 = true === i8, s4 = !!t6.Gr;
    return { ...{ $n: t6.Wr, wt: t6.Ur, Qr: t6.Ur, Wt: [n6 ? t6.Kr : t6.jr, t6.qr, t6.Yr, t6.Kr], Zr: t6.Zr }, ue: n6 ? s4 ? t6.Gr : { wt: t6.Ur } : void 0 };
  }
  Ar(t6, i8 = false) {
    return t6.map(((t7) => this.th(t7, i8)));
  }
  Dr(t6, i8, n6, s4, e11 = false, r8, h4) {
    if (0 === s4.length) return s4;
    const a5 = t6.length - 1, l6 = Math.floor(a5 / n6) * n6;
    if (Math.min(l6 + n6, t6.length) - l6 < n6 && t6.length > n6) {
      const s5 = t6.slice();
      return s5[s5.length - 1] = i8, this.Cr(s5, n6, r8, e11, h4);
    }
    if (Math.floor((a5 - 1) / n6) === Math.floor(a5 / n6) || 1 === s4.length) {
      const o11 = Math.min(l6 + n6, t6.length), _3 = o11 - l6;
      if (_3 <= 0) return s4;
      const u5 = 1 === _3 ? this.Or(l6 === a5 ? i8 : t6[l6], true) : this.Jr(t6, l6, o11, a5, i8, r8, e11, h4);
      return s4[s4.length - 1] = this.th(u5, e11), s4;
    }
    {
      const s5 = t6.slice();
      return s5[s5.length - 1] = i8, this.Cr(s5, n6, r8, e11, h4);
    }
  }
  Or(t6, i8 = false) {
    return { Wr: t6.$n, Hr: t6.$n, Ur: t6.wt, $r: t6.wt, jr: t6.Wt[0], qr: t6.Wt[1], Yr: t6.Wt[2], Kr: t6.Wt[3], Zr: t6.Zr ?? 1, Gr: t6.ue, zr: i8 };
  }
  kr(t6) {
    const i8 = this.ih(t6), n6 = this.Ir(t6);
    return i8.nh !== n6 && (i8.Pr.clear(), i8.nh = n6), i8;
  }
  ih(t6) {
    let i8 = this.br.get(t6);
    return void 0 === i8 && (i8 = { nh: this.Ir(t6), Pr: /* @__PURE__ */ new Map() }, this.br.set(t6, i8)), i8;
  }
};
var yt = class extends Y {
  constructor(t6) {
    super(), this.sn = t6;
  }
  Qt() {
    return this.sn;
  }
};
var kt = { Bar: (t6, i8, n6, s4) => {
  const e11 = i8.upColor, r8 = i8.downColor, h4 = u4(t6(n6, s4)), a5 = c5(h4.Wt[0]) <= c5(h4.Wt[3]);
  return { sh: h4.R ?? (a5 ? e11 : r8) };
}, Candlestick: (t6, i8, n6, s4) => {
  const e11 = i8.upColor, r8 = i8.downColor, h4 = i8.borderUpColor, a5 = i8.borderDownColor, l6 = i8.wickUpColor, o11 = i8.wickDownColor, _3 = u4(t6(n6, s4)), d4 = c5(_3.Wt[0]) <= c5(_3.Wt[3]);
  return { sh: _3.R ?? (d4 ? e11 : r8), eh: _3.Ht ?? (d4 ? h4 : a5), rh: _3.hh ?? (d4 ? l6 : o11) };
}, Custom: (t6, i8, n6, s4) => ({ sh: u4(t6(n6, s4)).R ?? i8.color }), Area: (t6, i8, n6, s4) => {
  const e11 = u4(t6(n6, s4));
  return { sh: e11.vt ?? i8.lineColor, vt: e11.vt ?? i8.lineColor, ah: e11.ah ?? i8.topColor, oh: e11.oh ?? i8.bottomColor };
}, Baseline: (t6, i8, n6, s4) => {
  const e11 = u4(t6(n6, s4));
  return { sh: e11.Wt[3] >= i8.baseValue.price ? i8.topLineColor : i8.bottomLineColor, _h: e11._h ?? i8.topLineColor, uh: e11.uh ?? i8.bottomLineColor, dh: e11.dh ?? i8.topFillColor1, fh: e11.fh ?? i8.topFillColor2, ph: e11.ph ?? i8.bottomFillColor1, mh: e11.mh ?? i8.bottomFillColor2 };
}, Line: (t6, i8, n6, s4) => {
  const e11 = u4(t6(n6, s4));
  return { sh: e11.R ?? i8.color, vt: e11.R ?? i8.color };
}, Histogram: (t6, i8, n6, s4) => ({ sh: u4(t6(n6, s4)).R ?? i8.color }) };
var Pt = class {
  constructor(t6) {
    this.wh = (t7, i8) => void 0 !== i8 ? i8.Wt : this.Te.Un().Mh(t7), this.Te = t6, this.gh = kt[t6.bh()];
  }
  Sh(t6, i8) {
    return this.gh(this.wh, this.Te.N(), t6, i8);
  }
};
function Tt(t6, i8, n6, s4, e11 = 0, r8 = i8.length) {
  let h4 = r8 - e11;
  for (; 0 < h4; ) {
    const r9 = h4 >> 1, a5 = e11 + r9;
    s4(i8[a5], n6) === t6 ? (e11 = a5 + 1, h4 -= r9 + 1) : h4 = r9;
  }
  return e11;
}
var Rt = Tt.bind(null, true);
var Dt = Tt.bind(null, false);
var It;
!(function(t6) {
  t6[t6.NearestLeft = -1] = "NearestLeft", t6[t6.None = 0] = "None", t6[t6.NearestRight = 1] = "NearestRight";
})(It || (It = {}));
var Vt = 30;
var Bt = class {
  constructor() {
    this.xh = [], this.Ch = /* @__PURE__ */ new Map(), this.yh = /* @__PURE__ */ new Map(), this.kh = [];
  }
  Ph() {
    return this.Th() > 0 ? this.xh[this.xh.length - 1] : null;
  }
  Rh() {
    return this.Th() > 0 ? this.Dh(0) : null;
  }
  Qn() {
    return this.Th() > 0 ? this.Dh(this.xh.length - 1) : null;
  }
  Th() {
    return this.xh.length;
  }
  Gi() {
    return 0 === this.Th();
  }
  ze(t6) {
    return null !== this.Ih(t6, 0);
  }
  Mh(t6) {
    return this.Hn(t6);
  }
  Hn(t6, i8 = 0) {
    const n6 = this.Ih(t6, i8);
    return null === n6 ? null : { ...this.Vh(n6), $n: this.Dh(n6) };
  }
  Bh() {
    return this.xh;
  }
  Eh(t6, i8, n6) {
    if (this.Gi()) return null;
    let s4 = null;
    for (const e11 of n6) {
      s4 = Et(s4, this.Ah(t6, i8, e11));
    }
    return s4;
  }
  ht(t6) {
    this.yh.clear(), this.Ch.clear(), this.xh = t6, this.kh = t6.map(((t7) => t7.$n));
  }
  Lh() {
    return this.kh;
  }
  Dh(t6) {
    return this.xh[t6].$n;
  }
  Vh(t6) {
    return this.xh[t6];
  }
  Ih(t6, i8) {
    const n6 = this.zh(t6);
    if (null === n6 && 0 !== i8) switch (i8) {
      case -1:
        return this.Oh(t6);
      case 1:
        return this.Nh(t6);
      default:
        throw new TypeError("Unknown search mode");
    }
    return n6;
  }
  Oh(t6) {
    let i8 = this.Fh(t6);
    return i8 > 0 && (i8 -= 1), i8 !== this.xh.length && this.Dh(i8) < t6 ? i8 : null;
  }
  Nh(t6) {
    const i8 = this.Wh(t6);
    return i8 !== this.xh.length && t6 < this.Dh(i8) ? i8 : null;
  }
  zh(t6) {
    const i8 = this.Fh(t6);
    return i8 === this.xh.length || t6 < this.xh[i8].$n ? null : i8;
  }
  Fh(t6) {
    return Rt(this.xh, t6, ((t7, i8) => t7.$n < i8));
  }
  Wh(t6) {
    return Dt(this.xh, t6, ((t7, i8) => t7.$n > i8));
  }
  Hh(t6, i8, n6) {
    let s4 = null;
    for (let e11 = t6; e11 < i8; e11++) {
      const t7 = this.xh[e11].Wt[n6];
      Number.isNaN(t7) || (null === s4 ? s4 = { Uh: t7, $h: t7 } : (t7 < s4.Uh && (s4.Uh = t7), t7 > s4.$h && (s4.$h = t7)));
    }
    return s4;
  }
  Ah(t6, i8, n6) {
    if (this.Gi()) return null;
    let s4 = null;
    const e11 = u4(this.Rh()), r8 = u4(this.Qn()), h4 = Math.max(t6, e11), a5 = Math.min(i8, r8), l6 = Math.ceil(h4 / Vt) * Vt, o11 = Math.max(l6, Math.floor(a5 / Vt) * Vt);
    {
      const t7 = this.Fh(h4), e12 = this.Wh(Math.min(a5, l6, i8));
      s4 = Et(s4, this.Hh(t7, e12, n6));
    }
    let _3 = this.Ch.get(n6);
    void 0 === _3 && (_3 = /* @__PURE__ */ new Map(), this.Ch.set(n6, _3));
    for (let t7 = Math.max(l6 + 1, h4); t7 < o11; t7 += Vt) {
      const i9 = Math.floor(t7 / Vt);
      let e12 = _3.get(i9);
      if (void 0 === e12) {
        const t8 = this.Fh(i9 * Vt), s5 = this.Wh((i9 + 1) * Vt - 1);
        e12 = this.Hh(t8, s5, n6), _3.set(i9, e12);
      }
      s4 = Et(s4, e12);
    }
    {
      const t7 = this.Fh(o11), i9 = this.Wh(a5);
      s4 = Et(s4, this.Hh(t7, i9, n6));
    }
    return s4;
  }
};
function Et(t6, i8) {
  if (null === t6) return i8;
  if (null === i8) return t6;
  return { Uh: Math.min(t6.Uh, i8.Uh), $h: Math.max(t6.$h, i8.$h) };
}
function At() {
  return new Bt();
}
var Lt = { setLineStyle: a4 };
var zt = class {
  constructor(t6) {
    this.jh = t6;
  }
  st(t6, i8, n6) {
    this.jh.draw(t6, Lt);
  }
  qh(t6, i8, n6) {
    this.jh.drawBackground?.(t6, Lt);
  }
};
var Ot = class {
  constructor(t6) {
    this.Ls = null, this.Yh = t6;
  }
  Tt() {
    const t6 = this.Yh.renderer();
    if (null === t6) return null;
    if (this.Ls?.Kh === t6) return this.Ls.Zh;
    const i8 = new zt(t6);
    return this.Ls = { Kh: t6, Zh: i8 }, i8;
  }
  Gh() {
    return this.Yh.zOrder?.() ?? "normal";
  }
};
var Nt = class {
  constructor(t6) {
    this.Xh = null, this.Jh = t6;
  }
  Qh() {
    return this.Jh;
  }
  Nn() {
    this.Jh.updateAllViews?.();
  }
  jn() {
    const t6 = this.Jh.paneViews?.() ?? [];
    if (this.Xh?.Kh === t6) return this.Xh.Zh;
    const i8 = t6.map(((t7) => new Ot(t7)));
    return this.Xh = { Kh: t6, Zh: i8 }, i8;
  }
  Qs(t6, i8) {
    return this.Jh.hitTest?.(t6, i8) ?? null;
  }
};
var Ft = class extends Nt {
  cn() {
    return [];
  }
};
var Wt = class {
  constructor(t6) {
    this.jh = t6;
  }
  st(t6, i8, n6) {
    this.jh.draw(t6, Lt);
  }
  qh(t6, i8, n6) {
    this.jh.drawBackground?.(t6, Lt);
  }
};
var Ht = class {
  constructor(t6) {
    this.Ls = null, this.Yh = t6;
  }
  Tt() {
    const t6 = this.Yh.renderer();
    if (null === t6) return null;
    if (this.Ls?.Kh === t6) return this.Ls.Zh;
    const i8 = new Wt(t6);
    return this.Ls = { Kh: t6, Zh: i8 }, i8;
  }
  Gh() {
    return this.Yh.zOrder?.() ?? "normal";
  }
};
function Ut(t6) {
  return { ri: t6.text(), Ei: t6.coordinate(), Vi: t6.fixedCoordinate?.(), R: t6.textColor(), G: t6.backColor(), It: t6.visible?.() ?? true, pi: t6.tickVisible?.() ?? true };
}
var $t = class {
  constructor(t6, i8) {
    this.Xt = new j2(), this.ta = t6, this.ia = i8;
  }
  Tt() {
    return this.Xt.ht({ nn: this.ia.nn(), ...Ut(this.ta) }), this.Xt;
  }
};
var jt = class extends H2 {
  constructor(t6, i8) {
    super(), this.ta = t6, this.Ki = i8;
  }
  Yi(t6, i8, n6) {
    const s4 = Ut(this.ta);
    n6.G = s4.G, t6.R = s4.R;
    const e11 = 2 / 12 * this.Ki.k();
    n6.Ti = e11, n6.Ri = e11, n6.Ei = s4.Ei, n6.Vi = s4.Vi, t6.ri = s4.ri, t6.It = s4.It, t6.pi = s4.pi;
  }
};
var qt = class extends Nt {
  constructor(t6, i8) {
    super(t6), this.na = null, this.sa = null, this.ea = null, this.ra = null, this.Te = i8;
  }
  dn() {
    const t6 = this.Jh.timeAxisViews?.() ?? [];
    if (this.na?.Kh === t6) return this.na.Zh;
    const i8 = this.Te.Qt().Et(), n6 = t6.map(((t7) => new $t(t7, i8)));
    return this.na = { Kh: t6, Zh: n6 }, n6;
  }
  qn() {
    const t6 = this.Jh.priceAxisViews?.() ?? [];
    if (this.sa?.Kh === t6) return this.sa.Zh;
    const i8 = this.Te.Ft(), n6 = t6.map(((t7) => new jt(t7, i8)));
    return this.sa = { Kh: t6, Zh: n6 }, n6;
  }
  ha() {
    const t6 = this.Jh.priceAxisPaneViews?.() ?? [];
    if (this.ea?.Kh === t6) return this.ea.Zh;
    const i8 = t6.map(((t7) => new Ht(t7)));
    return this.ea = { Kh: t6, Zh: i8 }, i8;
  }
  aa() {
    const t6 = this.Jh.timeAxisPaneViews?.() ?? [];
    if (this.ra?.Kh === t6) return this.ra.Zh;
    const i8 = t6.map(((t7) => new Ht(t7)));
    return this.ra = { Kh: t6, Zh: i8 }, i8;
  }
  la(t6, i8) {
    return this.Jh.autoscaleInfo?.(t6, i8) ?? null;
  }
};
function Yt(t6, i8, n6, s4) {
  t6.forEach(((t7) => {
    i8(t7).forEach(((t8) => {
      t8.Gh() === n6 && s4.push(t8);
    }));
  }));
}
function Kt(t6) {
  return t6.jn();
}
function Zt(t6) {
  return t6.ha();
}
function Gt(t6) {
  return t6.aa();
}
var Xt = ["Area", "Line", "Baseline"];
var Jt = class extends yt {
  constructor(t6, i8, n6, s4, e11) {
    super(t6), this.qt = At(), this.dr = new ft(this), this.oa = [], this._a = new _t(this), this.ua = null, this.ca = null, this.da = null, this.fa = [], this.pa = new Ct(), this.va = /* @__PURE__ */ new Map(), this.ma = null, this.yn = n6, this.wa = i8;
    const r8 = new pt(this);
    if (this.mn = [r8], this.pr = new at(r8, this, t6), Xt.includes(this.wa) && (this.ua = new dt(this)), this.Ma(), this.Yh = s4(this, this.Qt(), e11), "Custom" === this.wa) {
      const t7 = this.Yh;
      t7.ga && this.ba(t7.ga);
    }
  }
  m() {
    null !== this.da && clearTimeout(this.da);
  }
  We(t6) {
    return this.yn.priceLineColor || t6;
  }
  Ae(t6) {
    const i8 = { Le: true }, n6 = this.Ft();
    if (this.Qt().Et().Gi() || n6.Gi() || this.qt.Gi()) return i8;
    const s4 = this.Qt().Et().Ee(), e11 = this.Lt();
    if (null === s4 || null === e11) return i8;
    let r8, h4;
    if (t6) {
      const t7 = this.qt.Ph();
      if (null === t7) return i8;
      r8 = t7, h4 = t7.$n;
    } else {
      const t7 = this.qt.Hn(s4.bi(), -1);
      if (null === t7) return i8;
      if (r8 = this.qt.Mh(t7.$n), null === r8) return i8;
      h4 = t7.$n;
    }
    const a5 = r8.Wt[3], l6 = this.Sa().Sh(h4, { Wt: r8 }), o11 = n6.Nt(a5, e11.Wt);
    return { Le: false, Mt: a5, ri: n6.Ji(a5, e11.Wt), qe: n6.xa(a5), Ye: n6.Ca(a5, e11.Wt), R: l6.sh, Ei: o11, $n: h4 };
  }
  Sa() {
    return null !== this.ca || (this.ca = new Pt(this)), this.ca;
  }
  N() {
    return this.yn;
  }
  vr(t6) {
    const i8 = this.Qt(), { priceScaleId: n6, visible: s4, priceFormat: e11 } = t6;
    void 0 !== n6 && n6 !== this.yn.priceScaleId && i8.ya(this, n6), void 0 !== s4 && s4 !== this.yn.visible && i8.ka();
    const r8 = void 0 !== t6.conflationThresholdFactor;
    f3(this.yn, t6), r8 && (this.va.clear(), this.Qt().mr()), void 0 !== e11 && (this.Ma(), i8.Pa()), i8.Ta(this), i8.Ra(), this.Yh.kt("options");
  }
  ht(t6, i8) {
    this.qt.ht(t6), this.va.clear();
    const n6 = this.Qt().Et().N();
    n6.enableConflation && n6.precomputeConflationOnInit && this.Da(n6.precomputeConflationPriority), this.Yh.kt("data"), null !== this.ua && (i8 && i8.Ia ? this.ua.De() : 0 === t6.length && this.ua.Re());
    const s4 = this.Qt().Ks(this);
    this.Qt().Va(s4), this.Qt().Ta(this), this.Qt().Ra(), this.Qt().mr();
  }
  Ba(t6) {
    const i8 = new xt(this, t6);
    return this.oa.push(i8), this.Qt().Ta(this), i8;
  }
  Ea(t6) {
    const i8 = this.oa.indexOf(t6);
    -1 !== i8 && this.oa.splice(i8, 1), this.Qt().Ta(this);
  }
  Aa() {
    return this.oa;
  }
  bh() {
    return this.wa;
  }
  Lt() {
    const t6 = this.La();
    return null === t6 ? null : { Wt: t6.Wt[3], za: t6.wt };
  }
  La() {
    const t6 = this.Qt().Et().Ee();
    if (null === t6) return null;
    const i8 = t6.Oa();
    return this.qt.Hn(i8, 1);
  }
  Un() {
    return this.qt;
  }
  ba(t6) {
    this.ma = t6, this.va.clear();
  }
  Na() {
    return !!this.Qt().Et().N().enableConflation && this.Fa() > 1;
  }
  Rr(t6) {
    if (!this.Na()) return;
    const i8 = this.Fa();
    if (!this.va.has(i8)) return;
    const n6 = "Custom" === this.wa, s4 = n6 && this.ma || void 0, e11 = n6 && this.Yh.Wa ? (t7) => {
      const i9 = t7, n7 = this.Yh.Wa(i9);
      return Array.isArray(n7) ? n7 : ["number" == typeof n7 ? n7 : 0];
    } : void 0, r8 = this.pa.Rr(this.qt.Bh(), t6, i8, s4, n6, e11), h4 = At();
    h4.ht(r8), this.va.set(i8, h4);
  }
  Ha() {
    const t6 = this.Qt().Et().N().enableConflation;
    if ("Custom" === this.wa && null === this.ma) return this.qt;
    if (!t6) return this.qt;
    const i8 = this.Fa(), n6 = this.va.get(i8);
    if (n6) return n6;
    this.Ua(i8);
    return this.va.get(i8) ?? this.qt;
  }
  $a(t6) {
    const i8 = this.qt.Mh(t6);
    return null === i8 ? null : "Bar" === this.wa || "Candlestick" === this.wa || "Custom" === this.wa ? { jr: i8.Wt[0], qr: i8.Wt[1], Yr: i8.Wt[2], Kr: i8.Wt[3] } : i8.Wt[3];
  }
  ja(t6) {
    const i8 = [];
    Yt(this.fa, Kt, "top", i8);
    const n6 = this.ua;
    return null !== n6 && n6.It() ? (null === this.da && n6.Ve() && (this.da = setTimeout((() => {
      this.da = null, this.Qt().qa();
    }), 0)), n6.Ie(), i8.unshift(n6), i8) : i8;
  }
  jn() {
    const t6 = [];
    this.Ya() || t6.push(this._a), t6.push(this.Yh, this.dr);
    const i8 = this.oa.map(((t7) => t7.wr()));
    return t6.push(...i8), Yt(this.fa, Kt, "normal", t6), t6;
  }
  Ka() {
    return this.Za(Kt, "bottom");
  }
  Ga(t6) {
    return this.Za(Zt, t6);
  }
  Xa(t6) {
    return this.Za(Gt, t6);
  }
  Ja(t6, i8) {
    return this.fa.map(((n6) => n6.Qs(t6, i8))).filter(((t7) => null !== t7));
  }
  cn() {
    return [this.pr, ...this.oa.map(((t6) => t6.Mr()))];
  }
  qn(t6, i8) {
    if (i8 !== this.hn && !this.Ya()) return [];
    const n6 = [...this.mn];
    for (const t7 of this.oa) n6.push(t7.gr());
    return this.fa.forEach(((t7) => {
      n6.push(...t7.qn());
    })), n6;
  }
  dn() {
    const t6 = [];
    return this.fa.forEach(((i8) => {
      t6.push(...i8.dn());
    })), t6;
  }
  la(t6, i8) {
    if (void 0 !== this.yn.autoscaleInfoProvider) {
      const n6 = this.yn.autoscaleInfoProvider((() => {
        const n7 = this.Qa(t6, i8);
        return null === n7 ? null : n7.sr();
      }));
      return wt.er(n6);
    }
    return this.Qa(t6, i8);
  }
  Kh() {
    const t6 = this.yn.priceFormat;
    return t6.base ?? 1 / t6.minMove;
  }
  tl() {
    return this.il;
  }
  Nn() {
    this.Yh.kt();
    for (const t6 of this.mn) t6.kt();
    for (const t6 of this.oa) t6.kt();
    this.dr.kt(), this._a.kt(), this.ua?.kt(), this.fa.forEach(((t6) => t6.Nn()));
  }
  Ft() {
    return u4(super.Ft());
  }
  At(t6) {
    if (!(("Line" === this.wa || "Area" === this.wa || "Baseline" === this.wa) && this.yn.crosshairMarkerVisible)) return null;
    const i8 = this.qt.Mh(t6);
    if (null === i8) return null;
    return { Mt: i8.Wt[3], ft: this.nl(), Ht: this.sl(), Ot: this.el(), zt: this.rl(t6) };
  }
  He() {
    return this.yn.title;
  }
  It() {
    return this.yn.visible;
  }
  hl(t6) {
    this.fa.push(new qt(t6, this));
  }
  al(t6) {
    this.fa = this.fa.filter(((i8) => i8.Qh() !== t6));
  }
  ll() {
    if ("Custom" === this.wa) return (t6) => this.Yh.Wa(t6);
  }
  ol() {
    if ("Custom" === this.wa) return (t6) => this.Yh._l(t6);
  }
  ul() {
    return this.qt.Lh();
  }
  Ya() {
    return !G(this.Ft().cl());
  }
  Qa(t6, i8) {
    if (!v2(t6) || !v2(i8) || this.qt.Gi()) return null;
    const n6 = "Line" === this.wa || "Area" === this.wa || "Baseline" === this.wa || "Histogram" === this.wa ? [3] : [2, 1], s4 = this.qt.Eh(t6, i8, n6);
    let e11 = null !== s4 ? new mt(s4.Uh, s4.$h) : null, r8 = null;
    if ("Histogram" === this.bh()) {
      const t7 = this.yn.base, i9 = new mt(t7, t7);
      e11 = null !== e11 ? e11.Ss(i9) : i9;
    }
    return this.fa.forEach(((n7) => {
      const s5 = n7.la(t6, i8);
      if (s5?.priceRange) {
        const t7 = new mt(s5.priceRange.minValue, s5.priceRange.maxValue);
        e11 = null !== e11 ? e11.Ss(t7) : t7;
      }
      s5?.margins && (r8 = s5.margins);
    })), new wt(e11, r8);
  }
  nl() {
    switch (this.wa) {
      case "Line":
      case "Area":
      case "Baseline":
        return this.yn.crosshairMarkerRadius;
    }
    return 0;
  }
  sl() {
    switch (this.wa) {
      case "Line":
      case "Area":
      case "Baseline": {
        const t6 = this.yn.crosshairMarkerBorderColor;
        if (0 !== t6.length) return t6;
      }
    }
    return null;
  }
  el() {
    switch (this.wa) {
      case "Line":
      case "Area":
      case "Baseline":
        return this.yn.crosshairMarkerBorderWidth;
    }
    return 0;
  }
  rl(t6) {
    switch (this.wa) {
      case "Line":
      case "Area":
      case "Baseline": {
        const t7 = this.yn.crosshairMarkerBackgroundColor;
        if (0 !== t7.length) return t7;
      }
    }
    return this.Sa().Sh(t6).sh;
  }
  Ma() {
    switch (this.yn.priceFormat.type) {
      case "custom": {
        const t6 = this.yn.priceFormat.formatter;
        this.il = { format: t6, formatTickmarks: this.yn.priceFormat.tickmarksFormatter ?? ((i8) => i8.map(t6)) };
        break;
      }
      case "volume":
        this.il = new st(this.yn.priceFormat.precision);
        break;
      case "percent":
        this.il = new nt(this.yn.priceFormat.precision);
        break;
      default: {
        const t6 = Math.pow(10, this.yn.priceFormat.precision);
        this.il = new it(t6, this.yn.priceFormat.minMove * t6);
      }
    }
    null !== this.hn && this.hn.dl();
  }
  Za(t6, i8) {
    const n6 = [];
    return Yt(this.fa, t6, i8, n6), n6;
  }
  Fa() {
    const { fl: t6, pl: i8, vl: n6 } = this.ml();
    return this.pa.Sr(t6, i8, n6);
  }
  ml() {
    const t6 = this.Qt().Et(), i8 = t6.fl(), n6 = window.devicePixelRatio || 1, s4 = t6.N().conflationThresholdFactor;
    return { fl: i8, pl: n6, vl: this.yn.conflationThresholdFactor ?? s4 ?? 1 };
  }
  wl(t6) {
    const i8 = this.qt.Bh();
    let n6;
    if ("Custom" === this.wa && null !== this.ma) {
      const s5 = this.ll();
      if (!s5) throw new Error(gt);
      n6 = this.pa.Cr(i8, t6, this.ma, true, ((t7) => s5(t7)));
    } else n6 = this.pa.Cr(i8, t6);
    const s4 = At();
    return s4.ht(n6), s4;
  }
  Ua(t6) {
    const i8 = this.wl(t6);
    this.va.set(t6, i8);
  }
  Da(t6) {
    if ("Custom" === this.wa && (null === this.ma || !this.ll())) return;
    this.va.clear();
    const i8 = this.Qt().Et().Ml();
    for (const n6 of i8) {
      const i9 = () => {
        this.gl(n6);
      }, s4 = "object" == typeof window && window || "object" == typeof self && self;
      s4?.Sl?.bl ? s4.Sl.bl((() => {
        i9();
      }), { se: t6 }) : Promise.resolve().then((() => i9()));
    }
  }
  gl(t6) {
    if (this.va.has(t6)) return;
    if (0 === this.qt.Bh().length) return;
    const i8 = this.wl(t6);
    this.va.set(t6, i8);
  }
};
var Qt = [3];
var ti = [0, 1, 2, 3];
var ii = class {
  constructor(t6) {
    this.yn = t6;
  }
  xl(t6, i8, n6) {
    let s4 = t6;
    if (0 === this.yn.mode) return s4;
    const e11 = n6.Pn(), r8 = e11.Lt();
    if (null === r8) return s4;
    const h4 = e11.Nt(t6, r8), a5 = n6.Cl().filter(((t7) => t7 instanceof Jt)).reduce(((t7, s5) => {
      if (n6.Zs(s5) || !s5.It()) return t7;
      const e12 = s5.Ft(), r9 = s5.Un();
      if (e12.Gi() || !r9.ze(i8)) return t7;
      const h5 = r9.Mh(i8);
      if (null === h5) return t7;
      const a6 = c5(s5.Lt()), l7 = 3 === this.yn.mode ? ti : Qt;
      return t7.concat(l7.map(((t8) => e12.Nt(h5.Wt[t8], a6.Wt))));
    }), []);
    if (0 === a5.length) return s4;
    a5.sort(((t7, i9) => Math.abs(t7 - h4) - Math.abs(i9 - h4)));
    const l6 = a5[0];
    return s4 = e11.Tn(l6, r8), s4;
  }
};
function ni(t6, i8, n6) {
  return Math.min(Math.max(t6, i8), n6);
}
function si(t6, i8, n6) {
  return i8 - t6 <= n6;
}
var ri = class extends R2 {
  constructor() {
    super(...arguments), this.qt = null;
  }
  ht(t6) {
    this.qt = t6;
  }
  et({ context: t6, bitmapSize: i8, horizontalPixelRatio: n6, verticalPixelRatio: s4 }) {
    if (null === this.qt) return;
    const e11 = Math.max(1, Math.floor(n6));
    t6.lineWidth = e11, (function(t7, i9) {
      t7.save(), t7.lineWidth % 2 && t7.translate(0.5, 0.5), i9(), t7.restore();
    })(t6, (() => {
      const r8 = u4(this.qt);
      if (r8.yl) {
        t6.strokeStyle = r8.kl, a4(t6, r8.Pl), t6.beginPath();
        for (const s5 of r8.Tl) {
          const r9 = Math.round(s5.Rl * n6);
          t6.moveTo(r9, -e11), t6.lineTo(r9, i8.height + e11);
        }
        t6.stroke();
      }
      if (r8.Dl) {
        t6.strokeStyle = r8.Il, a4(t6, r8.Vl), t6.beginPath();
        for (const n7 of r8.Bl) {
          const r9 = Math.round(n7.Rl * s4);
          t6.moveTo(-e11, r9), t6.lineTo(i8.width + e11, r9);
        }
        t6.stroke();
      }
    }));
  }
};
var hi = class {
  constructor(t6) {
    this.Xt = new ri(), this.xt = true, this.yt = t6;
  }
  kt() {
    this.xt = true;
  }
  Tt() {
    if (this.xt) {
      const t6 = this.yt.Qt().N().grid, i8 = { Dl: t6.horzLines.visible, yl: t6.vertLines.visible, Il: t6.horzLines.color, kl: t6.vertLines.color, Vl: t6.horzLines.style, Pl: t6.vertLines.style, Bl: this.yt.Pn().El(), Tl: (this.yt.Qt().Et().El() || []).map(((t7) => ({ Rl: t7.coord }))) };
      this.Xt.ht(i8), this.xt = false;
    }
    return this.Xt;
  }
};
var ai = class {
  constructor(t6) {
    this.Yh = new hi(t6);
  }
  wr() {
    return this.Yh;
  }
};
var li = { Al: 4, Ll: 1e-4 };
function oi(t6, i8) {
  const n6 = 100 * (t6 - i8) / i8;
  return i8 < 0 ? -n6 : n6;
}
function _i(t6, i8) {
  const n6 = oi(t6.Je(), i8), s4 = oi(t6.Qe(), i8);
  return new mt(n6, s4);
}
function ui(t6, i8) {
  const n6 = 100 * (t6 - i8) / i8 + 100;
  return i8 < 0 ? -n6 : n6;
}
function ci(t6, i8) {
  const n6 = ui(t6.Je(), i8), s4 = ui(t6.Qe(), i8);
  return new mt(n6, s4);
}
function di(t6, i8) {
  const n6 = Math.abs(t6);
  if (n6 < 1e-15) return 0;
  const s4 = Math.log10(n6 + i8.Ll) + i8.Al;
  return t6 < 0 ? -s4 : s4;
}
function fi(t6, i8) {
  const n6 = Math.abs(t6);
  if (n6 < 1e-15) return 0;
  const s4 = Math.pow(10, n6 - i8.Al) - i8.Ll;
  return t6 < 0 ? -s4 : s4;
}
function pi(t6, i8) {
  if (null === t6) return null;
  const n6 = di(t6.Je(), i8), s4 = di(t6.Qe(), i8);
  return new mt(n6, s4);
}
function vi(t6, i8) {
  if (null === t6) return null;
  const n6 = fi(t6.Je(), i8), s4 = fi(t6.Qe(), i8);
  return new mt(n6, s4);
}
function mi(t6) {
  if (null === t6) return li;
  const i8 = Math.abs(t6.Qe() - t6.Je());
  if (i8 >= 1 || i8 < 1e-15) return li;
  const n6 = Math.ceil(Math.abs(Math.log10(i8))), s4 = li.Al + n6;
  return { Al: s4, Ll: 1 / Math.pow(10, s4) };
}
var wi = class {
  constructor(t6, i8) {
    if (this.zl = t6, this.Ol = i8, (function(t7) {
      if (t7 < 0) return false;
      if (t7 > 1e18) return true;
      for (let i9 = t7; i9 > 1; i9 /= 10) if (i9 % 10 != 0) return false;
      return true;
    })(this.zl)) this.Nl = [2, 2.5, 2];
    else {
      this.Nl = [];
      for (let t7 = this.zl; 1 !== t7; ) {
        if (t7 % 2 == 0) this.Nl.push(2), t7 /= 2;
        else {
          if (t7 % 5 != 0) throw new Error("unexpected base");
          this.Nl.push(2, 2.5), t7 /= 5;
        }
        if (this.Nl.length > 100) throw new Error("something wrong with base");
      }
    }
  }
  Fl(t6, i8, n6) {
    const s4 = 0 === this.zl ? 0 : 1 / this.zl;
    let e11 = Math.pow(10, Math.max(0, Math.ceil(Math.log10(t6 - i8)))), r8 = 0, h4 = this.Ol[0];
    for (; ; ) {
      const t7 = si(e11, s4, 1e-14) && e11 > s4 + 1e-14, i9 = si(e11, n6 * h4, 1e-14), a6 = si(e11, 1, 1e-14);
      if (!(t7 && i9 && a6)) break;
      e11 /= h4, h4 = this.Ol[++r8 % this.Ol.length];
    }
    if (e11 <= s4 + 1e-14 && (e11 = s4), e11 = Math.max(1, e11), this.Nl.length > 0 && (a5 = e11, l6 = 1, o11 = 1e-14, Math.abs(a5 - l6) < o11)) for (r8 = 0, h4 = this.Nl[0]; si(e11, n6 * h4, 1e-14) && e11 > s4 + 1e-14; ) e11 /= h4, h4 = this.Nl[++r8 % this.Nl.length];
    var a5, l6, o11;
    return e11;
  }
};
var Mi = class {
  constructor(t6, i8, n6, s4) {
    this.Wl = [], this.Ki = t6, this.zl = i8, this.Hl = n6, this.Ul = s4;
  }
  Fl(t6, i8) {
    if (t6 < i8) throw new Error("high < low");
    const n6 = this.Ki.$t(), s4 = (t6 - i8) * this.$l() / n6, e11 = new wi(this.zl, [2, 2.5, 2]), r8 = new wi(this.zl, [2, 2, 2.5]), h4 = new wi(this.zl, [2.5, 2, 2]), a5 = [];
    return a5.push(e11.Fl(t6, i8, s4), r8.Fl(t6, i8, s4), h4.Fl(t6, i8, s4)), (function(t7) {
      if (t7.length < 1) throw Error("array is empty");
      let i9 = t7[0];
      for (let n7 = 1; n7 < t7.length; ++n7) t7[n7] < i9 && (i9 = t7[n7]);
      return i9;
    })(a5);
  }
  jl() {
    const t6 = this.Ki, i8 = t6.Lt();
    if (null === i8) return void (this.Wl = []);
    const n6 = t6.$t(), s4 = this.Hl(n6 - 1, i8), e11 = this.Hl(0, i8), r8 = this.Ki.N().entireTextOnly ? this.ql() / 2 : 0, h4 = r8, a5 = n6 - 1 - r8, l6 = Math.max(s4, e11), o11 = Math.min(s4, e11);
    if (l6 === o11) return void (this.Wl = []);
    const _3 = this.Fl(l6, o11);
    if (this.Yl(i8, _3, l6, o11, h4, a5), t6.Kl() && this.Zl(_3, o11, l6)) {
      const t7 = this.Ki.Gl();
      this.Xl(i8, _3, h4, a5, t7, 2 * t7);
    }
    const u5 = this.Wl.map(((t7) => t7.Jl)), c6 = this.Ki.Ql(u5);
    for (let t7 = 0; t7 < this.Wl.length; t7++) this.Wl[t7].io = c6[t7];
  }
  El() {
    return this.Wl;
  }
  ql() {
    return this.Ki.k();
  }
  $l() {
    return Math.ceil(this.ql() * this.Ki.N().tickMarkDensity);
  }
  Yl(t6, i8, n6, s4, e11, r8) {
    const h4 = this.Wl, a5 = this.Ki;
    let l6 = n6 % i8;
    l6 += l6 < 0 ? i8 : 0;
    const o11 = n6 >= s4 ? 1 : -1;
    let _3 = null, u5 = 0;
    for (let c6 = n6 - l6; c6 > s4; c6 -= i8) {
      const n7 = this.Ul(c6, t6, true);
      null !== _3 && Math.abs(n7 - _3) < this.$l() || (n7 < e11 || n7 > r8 || (u5 < h4.length ? (h4[u5].Rl = n7, h4[u5].io = a5.no(c6), h4[u5].Jl = c6) : h4.push({ Rl: n7, io: a5.no(c6), Jl: c6 }), u5++, _3 = n7, a5.so() && (i8 = this.Fl(c6 * o11, s4))));
    }
    h4.length = u5;
  }
  Xl(t6, i8, n6, s4, e11, r8) {
    const h4 = this.Wl, a5 = this.eo(t6, n6, e11, r8), l6 = this.eo(t6, s4, -r8, -e11), o11 = this.Ul(0, t6, true) - this.Ul(i8, t6, true);
    h4.length > 0 && h4[0].Rl - a5.Rl < o11 / 2 && h4.shift(), h4.length > 0 && l6.Rl - h4[h4.length - 1].Rl < o11 / 2 && h4.pop(), h4.unshift(a5), h4.push(l6);
  }
  eo(t6, i8, n6, s4) {
    const e11 = (n6 + s4) / 2, r8 = this.Hl(i8 + n6, t6), h4 = this.Hl(i8 + s4, t6), a5 = Math.min(r8, h4), l6 = Math.max(r8, h4), o11 = Math.max(0.1, this.Fl(l6, a5)), _3 = this.Hl(i8 + e11, t6), u5 = _3 - _3 % o11, c6 = this.Ul(u5, t6, true);
    return { io: this.Ki.no(u5), Rl: c6, Jl: u5 };
  }
  Zl(t6, i8, n6) {
    let s4 = c5(this.Ki.ar());
    return this.Ki.so() && (s4 = vi(s4, this.Ki.ro())), s4.Je() - i8 < t6 && n6 - s4.Qe() < t6;
  }
};
function gi(t6) {
  return t6.slice().sort(((t7, i8) => u4(t7.ln()) - u4(i8.ln())));
}
var bi;
!(function(t6) {
  t6[t6.Normal = 0] = "Normal", t6[t6.Logarithmic = 1] = "Logarithmic", t6[t6.Percentage = 2] = "Percentage", t6[t6.IndexedTo100 = 3] = "IndexedTo100";
})(bi || (bi = {}));
var Si = new nt();
var xi = new it(100, 1);
var Ci = class {
  constructor(t6, i8, n6, s4, e11) {
    this.ho = 0, this.ao = null, this.rr = null, this.lo = null, this.oo = { _o: false, uo: null }, this.co = false, this.do = 0, this.fo = 0, this.po = new d3(), this.vo = new d3(), this.mo = [], this.wo = null, this.Mo = null, this.bo = null, this.So = null, this.xo = null, this.il = xi, this.Co = mi(null), this.yo = t6, this.yn = i8, this.ko = n6, this.Po = s4, this.To = e11, this.Ro = new Mi(this, 100, this.Do.bind(this), this.Io.bind(this));
  }
  cl() {
    return this.yo;
  }
  N() {
    return this.yn;
  }
  vr(t6) {
    if (f3(this.yn, t6), this.dl(), void 0 !== t6.mode && this.Vo({ _e: t6.mode }), void 0 !== t6.scaleMargins) {
      const i8 = _2(t6.scaleMargins.top), n6 = _2(t6.scaleMargins.bottom);
      if (i8 < 0 || i8 > 1) throw new Error(`Invalid top margin - expect value between 0 and 1, given=${i8}`);
      if (n6 < 0 || n6 > 1) throw new Error(`Invalid bottom margin - expect value between 0 and 1, given=${n6}`);
      if (i8 + n6 > 1) throw new Error(`Invalid margins - sum of margins must be less than 1, given=${i8 + n6}`);
      this.Bo(), this.bo = null;
    }
  }
  Eo() {
    return this.yn.autoScale;
  }
  Ao() {
    return this.co;
  }
  so() {
    return 1 === this.yn.mode;
  }
  je() {
    return 2 === this.yn.mode;
  }
  Lo() {
    return 3 === this.yn.mode;
  }
  ro() {
    return this.Co;
  }
  _e() {
    return { hs: this.yn.autoScale, zo: this.yn.invertScale, _e: this.yn.mode };
  }
  Vo(t6) {
    const i8 = this._e();
    let n6 = null;
    void 0 !== t6.hs && (this.yn.autoScale = t6.hs), void 0 !== t6._e && (this.yn.mode = t6._e, 2 !== t6._e && 3 !== t6._e || (this.yn.autoScale = true), this.oo._o = false), 1 === i8._e && t6._e !== i8._e && (!(function(t7, i9) {
      if (null === t7) return false;
      const n7 = fi(t7.Je(), i9), s5 = fi(t7.Qe(), i9);
      return isFinite(n7) && isFinite(s5);
    })(this.rr, this.Co) ? this.yn.autoScale = true : (n6 = vi(this.rr, this.Co), null !== n6 && this.Oo(n6))), 1 === t6._e && t6._e !== i8._e && (n6 = pi(this.rr, this.Co), null !== n6 && this.Oo(n6));
    const s4 = i8._e !== this.yn.mode;
    s4 && (2 === i8._e || this.je()) && this.dl(), s4 && (3 === i8._e || this.Lo()) && this.dl(), void 0 !== t6.zo && i8.zo !== t6.zo && (this.yn.invertScale = t6.zo, this.No()), this.vo.p(i8, this._e());
  }
  Fo() {
    return this.vo;
  }
  k() {
    return this.ko.fontSize;
  }
  $t() {
    return this.ho;
  }
  Wo(t6) {
    this.ho !== t6 && (this.ho = t6, this.Bo(), this.bo = null);
  }
  Ho() {
    if (this.ao) return this.ao;
    const t6 = this.$t() - this.Uo() - this.$o();
    return this.ao = t6, t6;
  }
  ar() {
    return this.jo(), this.rr;
  }
  Oo(t6, i8) {
    const n6 = this.rr;
    (i8 || null === n6 && null !== t6 || null !== n6 && !n6.Ge(t6)) && (this.bo = null, this.rr = t6);
  }
  qo(t6) {
    this.Oo(t6), this.Yo(null !== t6);
  }
  Gi() {
    return this.jo(), 0 === this.ho || !this.rr || this.rr.Gi();
  }
  Ko(t6) {
    return this.zo() ? t6 : this.$t() - 1 - t6;
  }
  Nt(t6, i8) {
    return this.je() ? t6 = oi(t6, i8) : this.Lo() && (t6 = ui(t6, i8)), this.Io(t6, i8);
  }
  Zo(t6, i8, n6) {
    this.jo();
    const s4 = this.$o(), e11 = u4(this.ar()), r8 = e11.Je(), h4 = e11.Qe(), a5 = this.Ho() - 1, l6 = this.zo(), o11 = a5 / (h4 - r8), _3 = void 0 === n6 ? 0 : n6.from, c6 = void 0 === n6 ? t6.length : n6.to, d4 = this.Go();
    for (let n7 = _3; n7 < c6; n7++) {
      const e12 = t6[n7], h5 = e12.Mt;
      if (isNaN(h5)) continue;
      let a6 = h5;
      null !== d4 && (a6 = d4(e12.Mt, i8));
      const _4 = s4 + o11 * (a6 - r8), u5 = l6 ? _4 : this.ho - 1 - _4;
      e12.ut = u5;
    }
  }
  Xo(t6, i8, n6) {
    this.jo();
    const s4 = this.$o(), e11 = u4(this.ar()), r8 = e11.Je(), h4 = e11.Qe(), a5 = this.Ho() - 1, l6 = this.zo(), o11 = a5 / (h4 - r8), _3 = void 0 === n6 ? 0 : n6.from, c6 = void 0 === n6 ? t6.length : n6.to, d4 = this.Go();
    for (let n7 = _3; n7 < c6; n7++) {
      const e12 = t6[n7];
      let h5 = e12.jr, a6 = e12.qr, _4 = e12.Yr, u5 = e12.Kr;
      null !== d4 && (h5 = d4(e12.jr, i8), a6 = d4(e12.qr, i8), _4 = d4(e12.Yr, i8), u5 = d4(e12.Kr, i8));
      let c7 = s4 + o11 * (h5 - r8), f4 = l6 ? c7 : this.ho - 1 - c7;
      e12.Jo = f4, c7 = s4 + o11 * (a6 - r8), f4 = l6 ? c7 : this.ho - 1 - c7, e12.Qo = f4, c7 = s4 + o11 * (_4 - r8), f4 = l6 ? c7 : this.ho - 1 - c7, e12.t_ = f4, c7 = s4 + o11 * (u5 - r8), f4 = l6 ? c7 : this.ho - 1 - c7, e12.i_ = f4;
    }
  }
  Tn(t6, i8) {
    const n6 = this.Do(t6, i8);
    return this.n_(n6, i8);
  }
  n_(t6, i8) {
    let n6 = t6;
    return this.je() ? n6 = (function(t7, i9) {
      return i9 < 0 && (t7 = -t7), t7 / 100 * i9 + i9;
    })(n6, i8) : this.Lo() && (n6 = (function(t7, i9) {
      return t7 -= 100, i9 < 0 && (t7 = -t7), t7 / 100 * i9 + i9;
    })(n6, i8)), n6;
  }
  Cl() {
    return this.mo;
  }
  Dt() {
    return this.Mo || (this.Mo = gi(this.mo)), this.Mo;
  }
  s_(t6) {
    -1 === this.mo.indexOf(t6) && (this.mo.push(t6), this.dl(), this.e_());
  }
  r_(t6) {
    const i8 = this.mo.indexOf(t6);
    if (-1 === i8) throw new Error("source is not attached to scale");
    this.mo.splice(i8, 1), 0 === this.mo.length && (this.Vo({ hs: true }), this.Oo(null)), this.dl(), this.e_();
  }
  Lt() {
    let t6 = null;
    for (const i8 of this.mo) {
      const n6 = i8.Lt();
      null !== n6 && ((null === t6 || n6.za < t6.za) && (t6 = n6));
    }
    return null === t6 ? null : t6.Wt;
  }
  zo() {
    return this.yn.invertScale;
  }
  El() {
    const t6 = null === this.Lt();
    if (null !== this.bo && (t6 || this.bo.h_ === t6)) return this.bo.El;
    this.Ro.jl();
    const i8 = this.Ro.El();
    return this.bo = { El: i8, h_: t6 }, this.po.p(), i8;
  }
  a_() {
    return this.po;
  }
  l_(t6) {
    this.je() || this.Lo() || null === this.So && null === this.lo && (this.Gi() || (this.So = this.ho - t6, this.lo = u4(this.ar()).Xe()));
  }
  o_(t6) {
    if (this.je() || this.Lo()) return;
    if (null === this.So) return;
    this.Vo({ hs: false }), (t6 = this.ho - t6) < 0 && (t6 = 0);
    let i8 = (this.So + 0.2 * (this.ho - 1)) / (t6 + 0.2 * (this.ho - 1));
    const n6 = u4(this.lo).Xe();
    i8 = Math.max(i8, 0.1), n6.ir(i8), this.Oo(n6);
  }
  __() {
    this.je() || this.Lo() || (this.So = null, this.lo = null);
  }
  u_(t6) {
    this.Eo() || null === this.xo && null === this.lo && (this.Gi() || (this.xo = t6, this.lo = u4(this.ar()).Xe()));
  }
  c_(t6) {
    if (this.Eo()) return;
    if (null === this.xo) return;
    const i8 = u4(this.ar()).tr() / (this.Ho() - 1);
    let n6 = t6 - this.xo;
    this.zo() && (n6 *= -1);
    const s4 = n6 * i8, e11 = u4(this.lo).Xe();
    e11.nr(s4), this.Oo(e11, true), this.bo = null;
  }
  d_() {
    this.Eo() || null !== this.xo && (this.xo = null, this.lo = null);
  }
  tl() {
    return this.il || this.dl(), this.il;
  }
  Ji(t6, i8) {
    switch (this.yn.mode) {
      case 2:
        return this.f_(oi(t6, i8));
      case 3:
        return this.tl().format(ui(t6, i8));
      default:
        return this.cr(t6);
    }
  }
  no(t6) {
    switch (this.yn.mode) {
      case 2:
        return this.f_(t6);
      case 3:
        return this.tl().format(t6);
      default:
        return this.cr(t6);
    }
  }
  Ql(t6) {
    switch (this.yn.mode) {
      case 2:
        return this.p_(t6);
      case 3:
        return this.tl().formatTickmarks(t6);
      default:
        return this.v_(t6);
    }
  }
  xa(t6) {
    return this.cr(t6, u4(this.wo).tl());
  }
  Ca(t6, i8) {
    return t6 = oi(t6, i8), this.f_(t6, Si);
  }
  m_() {
    return this.mo;
  }
  w_(t6) {
    this.oo = { uo: t6, _o: false };
  }
  Nn() {
    this.mo.forEach(((t6) => t6.Nn()));
  }
  Kl() {
    return this.yn.ensureEdgeTickMarksVisible && this.Eo();
  }
  Gl() {
    return this.k() / 2;
  }
  dl() {
    this.bo = null;
    let t6 = 1 / 0;
    this.wo = null;
    for (const i9 of this.mo) i9.ln() < t6 && (t6 = i9.ln(), this.wo = i9);
    let i8 = 100;
    null !== this.wo && (i8 = Math.round(this.wo.Kh())), this.il = xi, this.je() ? (this.il = Si, i8 = 100) : this.Lo() ? (this.il = new it(100, 1), i8 = 100) : null !== this.wo && (this.il = this.wo.tl()), this.Ro = new Mi(this, i8, this.Do.bind(this), this.Io.bind(this)), this.Ro.jl();
  }
  e_() {
    this.Mo = null;
  }
  M_() {
    return null === this.wo || this.je() || this.Lo() ? 1 : 1 / this.wo.Kh();
  }
  Xi() {
    return this.To;
  }
  Yo(t6) {
    this.co = t6;
  }
  Uo() {
    return this.zo() ? this.yn.scaleMargins.bottom * this.$t() + this.fo : this.yn.scaleMargins.top * this.$t() + this.do;
  }
  $o() {
    return this.zo() ? this.yn.scaleMargins.top * this.$t() + this.do : this.yn.scaleMargins.bottom * this.$t() + this.fo;
  }
  jo() {
    this.oo._o || (this.oo._o = true, this.g_());
  }
  Bo() {
    this.ao = null;
  }
  Io(t6, i8) {
    if (this.jo(), this.Gi()) return 0;
    t6 = this.so() && t6 ? di(t6, this.Co) : t6;
    const n6 = u4(this.ar()), s4 = this.$o() + (this.Ho() - 1) * (t6 - n6.Je()) / n6.tr();
    return this.Ko(s4);
  }
  Do(t6, i8) {
    if (this.jo(), this.Gi()) return 0;
    const n6 = this.Ko(t6), s4 = u4(this.ar()), e11 = s4.Je() + s4.tr() * ((n6 - this.$o()) / (this.Ho() - 1));
    return this.so() ? fi(e11, this.Co) : e11;
  }
  No() {
    this.bo = null, this.Ro.jl();
  }
  g_() {
    if (this.Ao() && !this.Eo()) return;
    const t6 = this.oo.uo;
    if (null === t6) return;
    let i8 = null;
    const n6 = this.m_();
    let s4 = 0, e11 = 0;
    for (const r9 of n6) {
      if (!r9.It()) continue;
      const n7 = r9.Lt();
      if (null === n7) continue;
      const h5 = r9.la(t6.Oa(), t6.bi());
      let a5 = h5 && h5.ar();
      if (null !== a5) {
        switch (this.yn.mode) {
          case 1:
            a5 = pi(a5, this.Co);
            break;
          case 2:
            a5 = _i(a5, n7.Wt);
            break;
          case 3:
            a5 = ci(a5, n7.Wt);
        }
        if (i8 = null === i8 ? a5 : i8.Ss(u4(a5)), null !== h5) {
          const t7 = h5.lr();
          null !== t7 && (s4 = Math.max(s4, t7.above), e11 = Math.max(e11, t7.below));
        }
      }
    }
    if (this.Kl() && (s4 = Math.max(s4, this.Gl()), e11 = Math.max(e11, this.Gl())), s4 === this.do && e11 === this.fo || (this.do = s4, this.fo = e11, this.bo = null, this.Bo()), null !== i8) {
      if (i8.Je() === i8.Qe()) {
        const t7 = 5 * this.M_();
        this.so() && (i8 = vi(i8, this.Co)), i8 = new mt(i8.Je() - t7, i8.Qe() + t7), this.so() && (i8 = pi(i8, this.Co));
      }
      if (this.so()) {
        const t7 = vi(i8, this.Co), n7 = mi(t7);
        if (r8 = n7, h4 = this.Co, r8.Al !== h4.Al || r8.Ll !== h4.Ll) {
          const s5 = null !== this.lo ? vi(this.lo, this.Co) : null;
          this.Co = n7, i8 = pi(t7, n7), null !== s5 && (this.lo = pi(s5, n7));
        }
      }
      this.Oo(i8);
    } else null === this.rr && (this.Oo(new mt(-0.5, 0.5)), this.Co = mi(null));
    var r8, h4;
  }
  Go() {
    return this.je() ? oi : this.Lo() ? ui : this.so() ? (t6) => di(t6, this.Co) : null;
  }
  b_(t6, i8, n6) {
    return void 0 === i8 ? (void 0 === n6 && (n6 = this.tl()), n6.format(t6)) : i8(t6);
  }
  S_(t6, i8, n6) {
    return void 0 === i8 ? (void 0 === n6 && (n6 = this.tl()), n6.formatTickmarks(t6)) : i8(t6);
  }
  cr(t6, i8) {
    return this.b_(t6, this.Po.priceFormatter, i8);
  }
  v_(t6, i8) {
    const n6 = this.Po.priceFormatter;
    return this.S_(t6, this.Po.tickmarksPriceFormatter ?? (n6 ? (t7) => t7.map(n6) : void 0), i8);
  }
  f_(t6, i8) {
    return this.b_(t6, this.Po.percentageFormatter, i8);
  }
  p_(t6, i8) {
    const n6 = this.Po.percentageFormatter;
    return this.S_(t6, this.Po.tickmarksPercentageFormatter ?? (n6 ? (t7) => t7.map(n6) : void 0), i8);
  }
};
function yi(t6) {
  return t6 instanceof Jt;
}
var ki = class {
  constructor(t6, i8) {
    this.mo = [], this.x_ = /* @__PURE__ */ new Map(), this.ho = 0, this.C_ = 0, this.y_ = 1, this.Mo = null, this.k_ = null, this.P_ = false, this.T_ = new d3(), this.fa = [], this.ia = t6, this.sn = i8, this.R_ = new ai(this);
    const n6 = i8.N();
    this.D_ = this.I_("left", n6.leftPriceScale), this.V_ = this.I_("right", n6.rightPriceScale), this.D_.Fo().i(this.B_.bind(this, this.D_), this), this.V_.Fo().i(this.B_.bind(this, this.V_), this), this.E_(n6);
  }
  E_(t6) {
    if (t6.leftPriceScale && this.D_.vr(t6.leftPriceScale), t6.rightPriceScale && this.V_.vr(t6.rightPriceScale), t6.localization && (this.D_.dl(), this.V_.dl()), t6.overlayPriceScales) {
      const i8 = Array.from(this.x_.values());
      for (const n6 of i8) {
        const i9 = u4(n6[0].Ft());
        i9.vr(t6.overlayPriceScales), t6.localization && i9.dl();
      }
    }
  }
  A_(t6) {
    switch (t6) {
      case "left":
        return this.D_;
      case "right":
        return this.V_;
    }
    return this.x_.has(t6) ? _2(this.x_.get(t6))[0].Ft() : null;
  }
  m() {
    this.Qt().L_().u(this), this.D_.Fo().u(this), this.V_.Fo().u(this), this.mo.forEach(((t6) => {
      t6.m && t6.m();
    })), this.fa = this.fa.filter(((t6) => {
      const i8 = t6.Qh();
      return i8.detached && i8.detached(), false;
    })), this.T_.p();
  }
  z_() {
    return this.y_;
  }
  O_(t6) {
    this.y_ = t6;
  }
  Qt() {
    return this.sn;
  }
  nn() {
    return this.C_;
  }
  $t() {
    return this.ho;
  }
  N_(t6) {
    this.C_ = t6, this.F_();
  }
  Wo(t6) {
    this.ho = t6, this.D_.Wo(t6), this.V_.Wo(t6), this.mo.forEach(((i8) => {
      if (this.Zs(i8)) {
        const n6 = i8.Ft();
        null !== n6 && n6.Wo(t6);
      }
    })), this.F_();
  }
  W_(t6) {
    this.P_ = t6;
  }
  H_() {
    return this.P_;
  }
  U_() {
    return this.mo.filter(yi);
  }
  Cl() {
    return this.mo;
  }
  Zs(t6) {
    const i8 = t6.Ft();
    return null === i8 || this.D_ !== i8 && this.V_ !== i8;
  }
  s_(t6, i8, n6) {
    this.j_(t6, i8, n6 ? t6.ln() : this.mo.length);
  }
  r_(t6, i8) {
    const n6 = this.mo.indexOf(t6);
    o10(-1 !== n6, "removeDataSource: invalid data source"), this.mo.splice(n6, 1), i8 || this.mo.forEach(((t7, i9) => t7._n(i9)));
    const s4 = u4(t6.Ft()).cl();
    if (this.x_.has(s4)) {
      const i9 = _2(this.x_.get(s4)), n7 = i9.indexOf(t6);
      -1 !== n7 && (i9.splice(n7, 1), 0 === i9.length && this.x_.delete(s4));
    }
    const e11 = t6.Ft();
    e11 && e11.Cl().indexOf(t6) >= 0 && (e11.r_(t6), this.q_(e11)), this.Y_();
  }
  Xs(t6) {
    return t6 === this.D_ ? "left" : t6 === this.V_ ? "right" : "overlay";
  }
  K_() {
    return this.D_;
  }
  Z_() {
    return this.V_;
  }
  G_(t6, i8) {
    t6.l_(i8);
  }
  X_(t6, i8) {
    t6.o_(i8), this.F_();
  }
  J_(t6) {
    t6.__();
  }
  Q_(t6, i8) {
    t6.u_(i8);
  }
  tu(t6, i8) {
    t6.c_(i8), this.F_();
  }
  iu(t6) {
    t6.d_();
  }
  F_() {
    this.mo.forEach(((t6) => {
      t6.Nn();
    }));
  }
  Pn() {
    const [t6, i8] = this.nu();
    let n6 = null;
    return t6.N().visible && 0 !== t6.Cl().length ? n6 = t6 : i8.N().visible && 0 !== i8.Cl().length ? n6 = i8 : 0 !== this.mo.length && (n6 = this.mo[0].Ft()), null === n6 && (n6 = this.Gs() ?? t6), n6;
  }
  Gs() {
    const [t6, i8] = this.nu();
    return t6.N().visible ? t6 : i8.N().visible ? i8 : null;
  }
  q_(t6) {
    null !== t6 && t6.Eo() && this.su(t6);
  }
  eu(t6) {
    const i8 = this.ia.Ee();
    t6.Vo({ hs: true }), null !== i8 && t6.w_(i8), this.F_();
  }
  ru() {
    this.su(this.D_), this.su(this.V_);
  }
  hu() {
    this.q_(this.D_), this.q_(this.V_), this.mo.forEach(((t6) => {
      this.Zs(t6) && this.q_(t6.Ft());
    })), this.F_(), this.sn.mr();
  }
  Dt() {
    return null === this.Mo && (this.Mo = gi(this.mo)), this.Mo;
  }
  au() {
    const t6 = this.Dt(), i8 = this.sn.ou()?.lu, n6 = this.sn.N().hoveredSeriesOnTop, s4 = this.k_;
    if (null !== s4 && s4.Kh === t6 && s4._u === i8 && s4.uu === n6) return s4.cu;
    const e11 = (function(t7, i9, n7) {
      if (!n7) return t7;
      const s5 = t7.indexOf(i9);
      if (-1 === s5 || s5 === t7.length - 1) return t7;
      const e12 = [];
      for (let i10 = 0; i10 < t7.length; i10++) i10 !== s5 && e12.push(t7[i10]);
      return e12.push(t7[s5]), e12;
    })(t6, i8, n6);
    return this.k_ = { Kh: t6, _u: i8, uu: n6, cu: e11 }, e11;
  }
  du(t6, i8) {
    i8 = ni(i8, 0, this.mo.length - 1);
    const n6 = this.mo.indexOf(t6);
    o10(-1 !== n6, "setSeriesOrder: invalid data source"), this.mo.splice(n6, 1), this.mo.splice(i8, 0, t6), this.mo.forEach(((t7, i9) => t7._n(i9))), this.Y_();
    for (const t7 of [this.D_, this.V_]) t7.e_(), t7.dl();
    this.sn.mr();
  }
  Vt() {
    return this.Dt().filter(yi);
  }
  fu() {
    return this.T_;
  }
  pu() {
    return this.R_;
  }
  hl(t6) {
    this.fa.push(new Ft(t6));
  }
  al(t6) {
    this.fa = this.fa.filter(((i8) => i8.Qh() !== t6)), t6.detached && t6.detached(), this.sn.mr();
  }
  vu() {
    return this.fa;
  }
  Ja(t6, i8) {
    return this.fa.map(((n6) => n6.Qs(t6, i8))).filter(((t7) => null !== t7));
  }
  su(t6) {
    const i8 = t6.m_();
    if (i8 && i8.length > 0 && !this.ia.Gi()) {
      const i9 = this.ia.Ee();
      null !== i9 && t6.w_(i9);
    }
    t6.Nn();
  }
  j_(t6, i8, n6) {
    let s4 = this.A_(i8);
    if (null === s4 && (s4 = this.I_(i8, this.sn.N().overlayPriceScales)), this.mo.splice(n6, 0, t6), !G(i8)) {
      const n7 = this.x_.get(i8) || [];
      n7.push(t6), this.x_.set(i8, n7);
    }
    t6._n(n6), s4.s_(t6), t6.un(s4), this.q_(s4), this.Y_();
  }
  Y_() {
    this.Mo = null, this.k_ = null;
  }
  nu() {
    return "left" === this.sn.N().defaultVisiblePriceScaleId ? [this.D_, this.V_] : [this.V_, this.D_];
  }
  B_(t6, i8, n6) {
    i8._e !== n6._e && this.su(t6);
  }
  I_(t6, i8) {
    const n6 = { visible: true, autoScale: true, ...M2(i8) }, s4 = new Ci(t6, n6, this.sn.N().layout, this.sn.N().localization, this.sn.Xi());
    return s4.Wo(this.$t()), s4;
  }
};
function Pi(t6, i8) {
  return null === i8 || (2 === t6.se && 2 !== i8.se || (2 !== i8.se || 2 === t6.se) && (t6.ne !== i8.ne && t6.ne < i8.ne));
}
function Ti(t6) {
  return { te: t6.te, ie: t6.ie };
}
function Ri(t6) {
  return { ne: t6.distance ?? 0, se: t6.hitTestPriority ?? ("marker" === t6.itemType ? 2 : 0), ee: t6.itemType ?? "primitive", mu: t6.cursorStyle, te: t6.externalId };
}
function Di(t6) {
  return { lu: t6.lu, wu: Ti(t6.Mu), mu: t6.Mu.mu, ee: t6.Mu.ee ?? "primitive" };
}
function Ii(t6, i8, n6, s4) {
  let e11 = null;
  for (const r8 of t6) {
    let t7 = r8.Qs?.(i8, n6, s4) ?? null;
    if (null === t7) {
      const e12 = r8.Tt(s4);
      t7 = null !== e12 && e12.Qs ? e12.Qs(i8, n6) : null;
    }
    if (null !== t7) {
      const i9 = { gu: r8, Mu: t7 };
      (null === e11 || Pi(i9.Mu, e11.Mu)) && (e11 = i9);
    }
  }
  return e11;
}
function Vi(t6) {
  return void 0 !== t6.jn;
}
function Bi(t6, i8, n6) {
  const s4 = [t6, ...t6.Dt()].reverse(), e11 = (function(t7, i9, n7) {
    let s5, e12, r9;
    for (const l6 of t7) {
      const t8 = l6.Ja?.(i9, n7) ?? [];
      for (const i10 of t8) {
        const t9 = Ri(i10);
        h5 = i10.zOrder, a5 = s5?.zOrder, (!a5 || "top" === h5 && "top" !== a5 || "normal" === h5 && "bottom" === a5 || i10.zOrder === s5?.zOrder && void 0 !== e12 && Pi(t9, e12) || i10.zOrder === s5?.zOrder && void 0 === e12) && (s5 = i10, e12 = t9, r9 = l6);
      }
    }
    var h5, a5;
    return s5 && r9 && e12 ? { Mu: e12, bu: s5, lu: r9 } : null;
  })(s4, i8, n6);
  if ("top" === e11?.bu.zOrder) return Di(e11);
  let r8 = null, h4 = null;
  for (const a5 of s4) {
    if (e11 && e11.lu === a5 && "bottom" !== e11.bu.zOrder && !e11.bu.isBackground) return r8 ?? Di(e11);
    if (Vi(a5)) {
      const s5 = Ii(a5.jn(t6), i8, n6, t6);
      if (null !== s5) {
        const t7 = { lu: a5, gu: s5.gu, wu: Ti(s5.Mu), mu: s5.Mu.mu, ee: s5.Mu.ee ?? "primitive" };
        (null === r8 || Pi(s5.Mu, h4)) && (r8 = t7, h4 = s5.Mu);
      }
    }
    if (e11 && e11.lu === a5 && "bottom" !== e11.bu.zOrder && e11.bu.isBackground) return r8 ?? Di(e11);
  }
  return null !== r8 ? r8 : e11?.bu ? Di(e11) : null;
}
var Ei = class {
  constructor(t6, i8, n6 = 50) {
    this.Vs = 0, this.Bs = 1, this.Es = 1, this.Ls = /* @__PURE__ */ new Map(), this.As = /* @__PURE__ */ new Map(), this.Su = t6, this.xu = i8, this.zs = n6;
  }
  Cu(t6) {
    const i8 = t6.time, n6 = this.xu.cacheKey(i8), s4 = this.Ls.get(n6);
    if (void 0 !== s4) return s4.yu;
    if (this.Vs === this.zs) {
      const t7 = this.As.get(this.Es);
      this.As.delete(this.Es), this.Ls.delete(_2(t7)), this.Es++, this.Vs--;
    }
    const e11 = this.Su(t6);
    return this.Ls.set(n6, { yu: e11, Ws: this.Bs }), this.As.set(this.Bs, n6), this.Vs++, this.Bs++, e11;
  }
};
var Ai = class {
  constructor(t6, i8) {
    o10(t6 <= i8, "right should be >= left"), this.ku = t6, this.Pu = i8;
  }
  Oa() {
    return this.ku;
  }
  bi() {
    return this.Pu;
  }
  Tu() {
    return this.Pu - this.ku + 1;
  }
  ze(t6) {
    return this.ku <= t6 && t6 <= this.Pu;
  }
  Ge(t6) {
    return this.ku === t6.Oa() && this.Pu === t6.bi();
  }
};
function Li(t6, i8) {
  return null === t6 || null === i8 ? t6 === i8 : t6.Ge(i8);
}
var zi = class {
  constructor() {
    this.Ru = /* @__PURE__ */ new Map(), this.Ls = null, this.Du = false;
  }
  Iu(t6) {
    this.Du = t6, this.Ls = null;
  }
  Vu(t6, i8) {
    this.Bu(i8), this.Ls = null;
    for (let n6 = i8; n6 < t6.length; ++n6) {
      const i9 = t6[n6];
      let s4 = this.Ru.get(i9.timeWeight);
      void 0 === s4 && (s4 = [], this.Ru.set(i9.timeWeight, s4)), s4.push({ index: n6, time: i9.time, weight: i9.timeWeight, originalTime: i9.originalTime });
    }
  }
  Eu(t6, i8, n6, s4, e11) {
    const r8 = Math.ceil(i8 / t6);
    return null !== this.Ls && this.Ls.Au === r8 && e11 === this.Ls.Lu && n6 === this.Ls.zu || (this.Ls = { Lu: e11, zu: n6, El: this.Ou(r8, n6, s4), Au: r8 }), this.Ls.El;
  }
  Bu(t6) {
    if (0 === t6) return void this.Ru.clear();
    const i8 = [];
    this.Ru.forEach(((n6, s4) => {
      t6 <= n6[0].index ? i8.push(s4) : n6.splice(Rt(n6, t6, ((i9) => i9.index < t6)), 1 / 0);
    }));
    for (const t7 of i8) this.Ru.delete(t7);
  }
  Ou(t6, i8, n6) {
    let s4 = [];
    const e11 = (t7) => !i8 || n6.has(t7.index);
    for (const i9 of Array.from(this.Ru.keys()).sort(((t7, i10) => i10 - t7))) {
      if (!this.Ru.get(i9)) continue;
      const n7 = s4;
      s4 = [];
      const r8 = n7.length;
      let h4 = 0;
      const a5 = _2(this.Ru.get(i9)), l6 = a5.length;
      let o11 = 1 / 0, u5 = -1 / 0;
      for (let i10 = 0; i10 < l6; i10++) {
        const l7 = a5[i10], _3 = l7.index;
        for (; h4 < r8; ) {
          const t7 = n7[h4], i11 = t7.index;
          if (!(i11 < _3 && e11(t7))) {
            o11 = i11;
            break;
          }
          h4++, s4.push(t7), u5 = i11, o11 = 1 / 0;
        }
        if (o11 - _3 >= t6 && _3 - u5 >= t6 && e11(l7)) s4.push(l7), u5 = _3;
        else if (this.Du) return n7;
      }
      for (; h4 < r8; h4++) e11(n7[h4]) && s4.push(n7[h4]);
    }
    return s4;
  }
};
var Oi = class _Oi {
  constructor(t6) {
    this.Nu = t6;
  }
  Fu() {
    return null === this.Nu ? null : new Ai(Math.floor(this.Nu.Oa()), Math.ceil(this.Nu.bi()));
  }
  Wu() {
    return this.Nu;
  }
  static Hu() {
    return new _Oi(null);
  }
};
function Ni(t6, i8) {
  return t6.weight > i8.weight ? t6 : i8;
}
var Fi = class {
  constructor(t6, i8, n6, s4) {
    this.C_ = 0, this.Uu = null, this.$u = [], this.xo = null, this.So = null, this.ju = new zi(), this.qu = /* @__PURE__ */ new Map(), this.Yu = Oi.Hu(), this.Ku = true, this.Zu = new d3(), this.Gu = new d3(), this.Xu = new d3(), this.Ju = null, this.Qu = null, this.tc = /* @__PURE__ */ new Map(), this.nc = -1, this.sc = [], this.ec = 1, this.yn = i8, this.Po = n6, this.rc = i8.rightOffset, this.hc = i8.barSpacing, this.sn = t6, this.ac(i8), this.xu = s4, this.lc(), this.ju.Iu(i8.uniformDistribution), this.oc(), this._c();
  }
  N() {
    return this.yn;
  }
  uc(t6) {
    f3(this.Po, t6), this.cc(), this.lc();
  }
  vr(t6, i8) {
    f3(this.yn, t6), this.yn.fixLeftEdge && this.dc(), this.yn.fixRightEdge && this.fc(), void 0 !== t6.barSpacing && this.sn.Ms(t6.barSpacing), void 0 !== t6.rightOffset && this.sn.gs(t6.rightOffset), this.ac(t6), void 0 === t6.minBarSpacing && void 0 === t6.maxBarSpacing || this.sn.Ms(t6.barSpacing ?? this.hc), void 0 !== t6.ignoreWhitespaceIndices && t6.ignoreWhitespaceIndices !== this.yn.ignoreWhitespaceIndices && this._c(), this.cc(), this.lc(), void 0 === t6.enableConflation && void 0 === t6.conflationThresholdFactor || this.oc(), this.Xu.p();
  }
  Rn(t6) {
    return this.$u[t6]?.time ?? null;
  }
  en(t6) {
    return this.$u[t6] ?? null;
  }
  vc(t6, i8) {
    if (this.$u.length < 1) return null;
    if (this.xu.key(t6) > this.xu.key(this.$u[this.$u.length - 1].time)) return i8 ? this.$u.length - 1 : null;
    const n6 = Rt(this.$u, this.xu.key(t6), ((t7, i9) => this.xu.key(t7.time) < i9));
    return this.xu.key(t6) < this.xu.key(this.$u[n6].time) ? i8 ? n6 : null : n6;
  }
  Gi() {
    return 0 === this.C_ || 0 === this.$u.length || null === this.Uu;
  }
  mc() {
    return this.$u.length > 0;
  }
  Ee() {
    return this.wc(), this.Yu.Fu();
  }
  Mc() {
    return this.wc(), this.Yu.Wu();
  }
  gc() {
    const t6 = this.Ee();
    if (null === t6) return null;
    const i8 = { from: t6.Oa(), to: t6.bi() };
    return this.bc(i8);
  }
  bc(t6) {
    const i8 = Math.round(t6.from), n6 = Math.round(t6.to), s4 = u4(this.Sc()), e11 = u4(this.xc());
    return { from: u4(this.en(Math.max(s4, i8))), to: u4(this.en(Math.min(e11, n6))) };
  }
  Cc(t6) {
    return { from: u4(this.vc(t6.from, true)), to: u4(this.vc(t6.to, true)) };
  }
  nn() {
    return this.C_;
  }
  N_(t6) {
    if (!isFinite(t6) || t6 <= 0) return;
    if (this.C_ === t6) return;
    const i8 = this.Mc(), n6 = this.C_;
    if (this.C_ = t6, this.Ku = true, this.yn.lockVisibleTimeRangeOnResize && 0 !== n6) {
      const i9 = this.hc * t6 / n6;
      this.hc = i9;
    }
    if (this.yn.fixLeftEdge && null !== i8 && i8.Oa() <= 0) {
      const i9 = n6 - t6;
      this.rc -= Math.round(i9 / this.hc) + 1, this.Ku = true;
    }
    this.yc(), this.kc();
  }
  jt(t6) {
    if (this.Gi() || !v2(t6)) return 0;
    const i8 = this.Pc() + this.rc - t6;
    return this.C_ - (i8 + 0.5) * this.hc - 1;
  }
  Tc(t6, i8) {
    const n6 = this.Pc(), s4 = void 0 === i8 ? 0 : i8.from, e11 = void 0 === i8 ? t6.length : i8.to;
    for (let i9 = s4; i9 < e11; i9++) {
      const s5 = t6[i9].wt, e12 = n6 + this.rc - s5, r8 = this.C_ - (e12 + 0.5) * this.hc - 1;
      t6[i9]._t = r8;
    }
  }
  Rc(t6, i8) {
    const n6 = Math.ceil(this.Dc(t6));
    return i8 && this.yn.ignoreWhitespaceIndices && !this.Ic(n6) ? this.Vc(n6) : n6;
  }
  gs(t6) {
    this.Ku = true, this.rc = t6, this.kc(), this.sn.Bc(), this.sn.mr();
  }
  fl() {
    return this.hc;
  }
  Ms(t6) {
    const i8 = this.hc;
    if (this.Ec(t6), void 0 !== this.yn.rightOffsetPixels && 0 !== i8) {
      const t7 = this.rc * i8 / this.hc;
      this.rc = t7;
    }
    this.kc(), this.sn.Bc(), this.sn.mr();
  }
  Ac() {
    return this.rc;
  }
  El() {
    if (this.Gi()) return null;
    if (null !== this.Qu) return this.Qu;
    const t6 = this.hc, i8 = 5 * (this.sn.N().layout.fontSize + 4) / 8 * (this.yn.tickMarkMaxCharacterLength || 8), n6 = Math.round(i8 / t6), s4 = u4(this.Ee()), e11 = Math.max(s4.Oa(), s4.Oa() - n6), r8 = Math.max(s4.bi(), s4.bi() - n6), h4 = this.ju.Eu(t6, i8, this.yn.ignoreWhitespaceIndices, this.tc, this.nc), a5 = this.Sc() + n6, l6 = this.xc() - n6, o11 = this.Lc(), _3 = this.yn.fixLeftEdge || o11, c6 = this.yn.fixRightEdge || o11;
    let d4 = 0;
    for (const t7 of h4) {
      if (!(e11 <= t7.index && t7.index <= r8)) continue;
      let n7;
      d4 < this.sc.length ? (n7 = this.sc[d4], n7.coord = this.jt(t7.index), n7.label = this.zc(t7), n7.weight = t7.weight) : (n7 = { needAlignCoordinate: false, coord: this.jt(t7.index), label: this.zc(t7), weight: t7.weight }, this.sc.push(n7)), this.hc > i8 / 2 && !o11 ? n7.needAlignCoordinate = false : n7.needAlignCoordinate = _3 && t7.index <= a5 || c6 && t7.index >= l6, d4++;
    }
    return this.sc.length = d4, this.Qu = this.sc, this.sc;
  }
  Oc() {
    let t6;
    this.Ku = true, this.Ms(this.yn.barSpacing), t6 = void 0 !== this.yn.rightOffsetPixels ? this.yn.rightOffsetPixels / this.fl() : this.yn.rightOffset, this.gs(t6);
  }
  Nc(t6) {
    this.Ku = true, this.Uu = t6, this.kc(), this.dc();
  }
  Fc(t6, i8) {
    const n6 = this.Dc(t6), s4 = this.fl(), e11 = s4 + i8 * (s4 / 10);
    this.Ms(e11), this.yn.rightBarStaysOnScroll || this.gs(this.Ac() + (n6 - this.Dc(t6)));
  }
  l_(t6) {
    this.xo && this.d_(), null === this.So && null === this.Ju && (this.Gi() || (this.So = t6, this.Wc()));
  }
  o_(t6) {
    if (null === this.Ju) return;
    const i8 = ni(this.C_ - t6, 0, this.C_), n6 = ni(this.C_ - u4(this.So), 0, this.C_);
    0 !== i8 && 0 !== n6 && this.Ms(this.Ju.fl * i8 / n6);
  }
  __() {
    null !== this.So && (this.So = null, this.Hc());
  }
  u_(t6) {
    null === this.xo && null === this.Ju && (this.Gi() || (this.xo = t6, this.Wc()));
  }
  c_(t6) {
    if (null === this.xo) return;
    const i8 = (this.xo - t6) / this.fl();
    this.rc = u4(this.Ju).Ac + i8, this.Ku = true, this.kc();
  }
  d_() {
    null !== this.xo && (this.xo = null, this.Hc());
  }
  Uc() {
    this.$c(this.yn.rightOffset);
  }
  $c(t6, i8 = 400) {
    if (!isFinite(t6)) throw new RangeError("offset is required and must be finite number");
    if (!isFinite(i8) || i8 <= 0) throw new RangeError("animationDuration (optional) must be finite positive number");
    const n6 = this.rc, s4 = performance.now();
    this.sn.ps({ jc: (t7) => (t7 - s4) / i8 >= 1, qc: (e11) => {
      const r8 = (e11 - s4) / i8;
      return r8 >= 1 ? t6 : n6 + (t6 - n6) * r8;
    } });
  }
  kt(t6, i8) {
    this.Ku = true, this.$u = t6, this.ju.Vu(t6, i8), this.kc();
  }
  Yc() {
    return this.Zu;
  }
  Kc() {
    return this.Gu;
  }
  Zc() {
    return this.Xu;
  }
  Pc() {
    return this.Uu || 0;
  }
  Gc(t6, i8) {
    const n6 = t6.Tu(), s4 = i8 && this.yn.rightOffsetPixels || 0;
    this.Ec((this.C_ - s4) / n6), this.rc = t6.bi() - this.Pc(), i8 && (this.rc = s4 ? s4 / this.fl() : this.yn.rightOffset), this.kc(), this.Ku = true, this.sn.Bc(), this.sn.mr();
  }
  Xc() {
    const t6 = this.Sc(), i8 = this.xc();
    if (null === t6 || null === i8) return;
    const n6 = !this.yn.rightOffsetPixels && this.yn.rightOffset || 0;
    this.Gc(new Ai(t6, i8 + n6), true);
  }
  Jc(t6) {
    const i8 = new Ai(t6.from, t6.to);
    this.Gc(i8);
  }
  rn(t6) {
    return void 0 !== this.Po.timeFormatter ? this.Po.timeFormatter(t6.originalTime) : this.xu.formatHorzItem(t6.time);
  }
  _c() {
    if (!this.yn.ignoreWhitespaceIndices) return;
    this.tc.clear();
    const t6 = this.sn.Jn();
    for (const i8 of t6) for (const t7 of i8.ul()) this.tc.set(t7, true);
    this.nc++;
  }
  Qc() {
    return this.ec;
  }
  Ml() {
    const t6 = 1 / (window.devicePixelRatio || 1), i8 = this.yn.minBarSpacing;
    if (i8 >= t6) return [1];
    const n6 = [1];
    let s4 = 2;
    for (; s4 <= 512; ) {
      i8 < t6 / s4 && n6.push(s4), s4 *= 2;
    }
    return n6;
  }
  Lc() {
    const t6 = this.sn.N().handleScroll, i8 = this.sn.N().handleScale;
    return !(t6.horzTouchDrag || t6.mouseWheel || t6.pressedMouseMove || t6.vertTouchDrag || i8.axisDoubleClickReset.time || i8.axisPressedMouseMove.time || i8.mouseWheel || i8.pinch);
  }
  Sc() {
    return 0 === this.$u.length ? null : 0;
  }
  xc() {
    return 0 === this.$u.length ? null : this.$u.length - 1;
  }
  td(t6) {
    return (this.C_ - 1 - t6) / this.hc;
  }
  Dc(t6) {
    const i8 = this.td(t6), n6 = this.Pc() + this.rc - i8;
    return Math.round(1e6 * n6) / 1e6;
  }
  Ec(t6) {
    const i8 = this.hc;
    this.hc = t6, this.yc(), i8 !== this.hc && (this.Ku = true, this.nd(), this.oc());
  }
  wc() {
    if (!this.Ku) return;
    if (this.Ku = false, this.Gi()) return void this.sd(Oi.Hu());
    const t6 = this.Pc(), i8 = this.C_ / this.hc, n6 = this.rc + t6, s4 = new Ai(n6 - i8 + 1, n6);
    this.sd(new Oi(s4));
  }
  yc() {
    const t6 = ni(this.hc, this.ed(), this.rd());
    this.hc !== t6 && (this.hc = t6, this.Ku = true);
  }
  rd() {
    return this.yn.maxBarSpacing > 0 ? this.yn.maxBarSpacing : 0.5 * this.C_;
  }
  ed() {
    return this.yn.fixLeftEdge && this.yn.fixRightEdge && 0 !== this.$u.length ? this.C_ / this.$u.length : this.yn.minBarSpacing;
  }
  oc() {
    if (!this.yn.enableConflation) return void (this.ec = 1);
    const t6 = 1 / (window.devicePixelRatio || 1) * (this.yn.conflationThresholdFactor ?? 1);
    if (this.hc >= t6) return void (this.ec = 1);
    const i8 = t6 / this.hc, n6 = Math.pow(2, Math.floor(Math.log2(i8)));
    this.ec = Math.min(n6, 512);
  }
  kc() {
    const t6 = this.hd();
    null !== t6 && this.rc < t6 && (this.rc = t6, this.Ku = true);
    const i8 = this.ad();
    this.rc > i8 && (this.rc = i8, this.Ku = true);
  }
  hd() {
    const t6 = this.Sc(), i8 = this.Uu;
    if (null === t6 || null === i8) return null;
    return t6 - i8 - 1 + (this.yn.fixLeftEdge ? this.C_ / this.hc : Math.min(2, this.$u.length));
  }
  ad() {
    return this.yn.fixRightEdge ? 0 : this.C_ / this.hc - Math.min(2, this.$u.length);
  }
  Wc() {
    this.Ju = { fl: this.fl(), Ac: this.Ac() };
  }
  Hc() {
    this.Ju = null;
  }
  zc(t6) {
    let i8 = this.qu.get(t6.weight);
    return void 0 === i8 && (i8 = new Ei(((t7) => this.ld(t7)), this.xu), this.qu.set(t6.weight, i8)), i8.Cu(t6);
  }
  ld(t6) {
    return this.xu.formatTickmark(t6, this.Po);
  }
  sd(t6) {
    const i8 = this.Yu;
    this.Yu = t6, Li(i8.Fu(), this.Yu.Fu()) || this.Zu.p(), Li(i8.Wu(), this.Yu.Wu()) || this.Gu.p(), this.nd();
  }
  nd() {
    this.Qu = null;
  }
  cc() {
    this.nd(), this.qu.clear();
  }
  lc() {
    this.xu.updateFormatter(this.Po);
  }
  dc() {
    if (!this.yn.fixLeftEdge) return;
    const t6 = this.Sc();
    if (null === t6) return;
    const i8 = this.Ee();
    if (null === i8) return;
    const n6 = i8.Oa() - t6;
    if (n6 < 0) {
      const t7 = this.rc - n6 - 1;
      this.gs(t7);
    }
    this.yc();
  }
  fc() {
    this.kc(), this.yc();
  }
  Ic(t6) {
    return !this.yn.ignoreWhitespaceIndices || (this.tc.get(t6) || false);
  }
  Vc(t6) {
    const i8 = (function* (t7) {
      const i9 = Math.round(t7), n7 = i9 < t7;
      let s4 = 1;
      for (; ; ) n7 ? (yield i9 + s4, yield i9 - s4) : (yield i9 - s4, yield i9 + s4), s4++;
    })(t6), n6 = this.xc();
    for (; n6; ) {
      const t7 = i8.next().value;
      if (this.tc.get(t7)) return t7;
      if (t7 < 0 || t7 > n6) break;
    }
    return t6;
  }
  ac(t6) {
    if (void 0 !== t6.rightOffsetPixels) {
      const i8 = t6.rightOffsetPixels / (t6.barSpacing || this.hc);
      this.sn.gs(i8);
    }
  }
};
var Wi;
var Hi;
var Ui;
var $i;
var ji;
!(function(t6) {
  t6[t6.OnTouchEnd = 0] = "OnTouchEnd", t6[t6.OnNextTap = 1] = "OnNextTap";
})(Wi || (Wi = {}));
var qi = class {
  constructor(t6, i8, n6) {
    this.od = [], this._d = [], this.ud = null, this.C_ = 0, this.dd = null, this.fd = new d3(), this.pd = new d3(), this.vd = null, this.md = t6, this.yn = i8, this.xu = n6, this.To = new P2(this.yn.layout.colorParsers), this.wd = new C2(this), this.ia = new Fi(this, i8.timeScale, this.yn.localization, n6), this.Ct = new Z2(this, i8.crosshair), this.Md = new ii(i8.crosshair), i8.addDefaultPane && (this.gd(0), this.od[0].O_(2)), this.bd = this.Sd(0), this.xd = this.Sd(1);
  }
  Pa() {
    this.Cd(X.ys());
  }
  mr() {
    this.Cd(X.Cs());
  }
  qa() {
    this.Cd(new X(1));
  }
  Ta(t6) {
    const i8 = this.yd(t6);
    this.Cd(i8);
  }
  ou() {
    return this.dd;
  }
  kd(t6) {
    if (this.dd?.lu === t6?.lu && this.dd?.wu?.te === t6?.wu?.te && this.dd?.wu?.ie === t6?.wu?.ie && this.dd?.mu === t6?.mu && this.dd?.ee === t6?.ee) return;
    const i8 = this.dd;
    this.dd = t6, null !== i8 && this.Ta(i8.lu), null !== t6 && t6.lu !== i8?.lu && this.Ta(t6.lu);
  }
  N() {
    return this.yn;
  }
  vr(t6) {
    f3(this.yn, t6), this.od.forEach(((i8) => i8.E_(t6))), void 0 !== t6.timeScale && this.ia.vr(t6.timeScale), void 0 !== t6.localization && this.ia.uc(t6.localization), (t6.leftPriceScale || t6.rightPriceScale) && this.fd.p(), this.bd = this.Sd(0), this.xd = this.Sd(1), this.Pa();
  }
  Pd(t6, i8, n6 = 0) {
    const s4 = this.od[n6];
    if (void 0 === s4) return;
    if ("left" === t6) return f3(this.yn, { leftPriceScale: i8 }), s4.E_({ leftPriceScale: i8 }), this.fd.p(), void this.Pa();
    if ("right" === t6) return f3(this.yn, { rightPriceScale: i8 }), s4.E_({ rightPriceScale: i8 }), this.fd.p(), void this.Pa();
    const e11 = this.Td(t6, n6);
    null !== e11 && (e11.Ft.vr(i8), this.fd.p());
  }
  Td(t6, i8) {
    const n6 = this.od[i8];
    if (void 0 === n6) return null;
    const s4 = n6.A_(t6);
    return null !== s4 ? { Kn: n6, Ft: s4 } : null;
  }
  Et() {
    return this.ia;
  }
  Zn() {
    return this.od;
  }
  Rd() {
    return this.Ct;
  }
  Dd() {
    return this.pd;
  }
  Id(t6, i8) {
    t6.Wo(i8), this.Bc();
  }
  N_(t6) {
    this.C_ = t6, this.ia.N_(this.C_), this.od.forEach(((i8) => i8.N_(t6))), this.Bc();
  }
  Vd(t6) {
    1 !== this.od.length && (o10(t6 >= 0 && t6 < this.od.length, "Invalid pane index"), this.od.splice(t6, 1), this.Pa());
  }
  Bd(t6, i8) {
    if (this.od.length < 2) return;
    o10(t6 >= 0 && t6 < this.od.length, "Invalid pane index");
    const n6 = this.od[t6], s4 = this.od.reduce(((t7, i9) => t7 + i9.z_()), 0), e11 = this.od.reduce(((t7, i9) => t7 + i9.$t()), 0), r8 = e11 - 30 * (this.od.length - 1);
    i8 = Math.min(r8, Math.max(30, i8));
    const h4 = s4 / e11, a5 = n6.$t();
    n6.O_(i8 * h4);
    let l6 = i8 - a5, _3 = this.od.length - 1;
    for (const t7 of this.od) if (t7 !== n6) {
      const i9 = Math.min(r8, Math.max(30, t7.$t() - l6 / _3));
      l6 -= t7.$t() - i9, _3 -= 1;
      const n7 = i9 * h4;
      t7.O_(n7);
    }
    this.Pa();
  }
  Ed(t6, i8) {
    o10(t6 >= 0 && t6 < this.od.length && i8 >= 0 && i8 < this.od.length, "Invalid pane index");
    const n6 = this.od[t6], s4 = this.od[i8];
    this.od[t6] = s4, this.od[i8] = n6, this.Pa();
  }
  Ad(t6, i8) {
    if (o10(t6 >= 0 && t6 < this.od.length && i8 >= 0 && i8 < this.od.length, "Invalid pane index"), t6 === i8) return;
    const [n6] = this.od.splice(t6, 1);
    this.od.splice(i8, 0, n6), this.Pa();
  }
  G_(t6, i8, n6) {
    t6.G_(i8, n6);
  }
  X_(t6, i8, n6) {
    t6.X_(i8, n6), this.Ra(), this.Cd(this.Ld(t6, 2));
  }
  J_(t6, i8) {
    t6.J_(i8), this.Cd(this.Ld(t6, 2));
  }
  Q_(t6, i8, n6) {
    i8.Eo() || t6.Q_(i8, n6);
  }
  tu(t6, i8, n6) {
    i8.Eo() || (t6.tu(i8, n6), this.Ra(), this.Cd(this.Ld(t6, 2)));
  }
  iu(t6, i8) {
    i8.Eo() || (t6.iu(i8), this.Cd(this.Ld(t6, 2)));
  }
  eu(t6, i8) {
    t6.eu(i8), this.Cd(this.Ld(t6, 2));
  }
  zd(t6) {
    this.ia.l_(t6);
  }
  Od(t6, i8) {
    const n6 = this.Et();
    if (n6.Gi() || 0 === i8) return;
    const s4 = n6.nn();
    t6 = Math.max(1, Math.min(t6, s4)), n6.Fc(t6, i8), this.Bc();
  }
  Nd(t6) {
    this.Fd(0), this.Wd(t6), this.Hd();
  }
  Ud(t6) {
    this.ia.o_(t6), this.Bc();
  }
  $d() {
    this.ia.__(), this.mr();
  }
  Fd(t6) {
    this.ia.u_(t6);
  }
  Wd(t6) {
    this.ia.c_(t6), this.Bc();
  }
  Hd() {
    this.ia.d_(), this.mr();
  }
  Jn() {
    return this._d;
  }
  Wn() {
    return null === this.ud && (this.ud = this._d.filter(((t6) => t6.It()))), this.ud;
  }
  ka() {
    this.ud = null;
  }
  jd(t6, i8, n6, s4, e11) {
    this.Ct.In(t6, i8);
    let r8 = NaN, h4 = this.ia.Rc(t6, true);
    const a5 = this.ia.Ee();
    null !== a5 && (h4 = Math.min(Math.max(a5.Oa(), h4), a5.bi())), h4 = this.Ct.Fn(h4);
    const l6 = s4.Pn(), o11 = l6.Lt();
    if (null !== o11 && (r8 = l6.Tn(i8, o11)), r8 = this.Md.xl(r8, h4, s4), this.Ct.An(h4, r8, s4), this.qa(), !e11) {
      const e12 = Bi(s4, t6, i8);
      this.kd(e12 && { lu: e12.lu, wu: e12.wu, mu: e12.mu || null, ee: e12.ee }), this.pd.p(this.Ct.Bt(), { x: t6, y: i8 }, n6);
    }
  }
  qd(t6, i8, n6) {
    const s4 = n6.Pn(), e11 = s4.Lt(), r8 = s4.Nt(t6, u4(e11)), h4 = this.ia.vc(i8, true), a5 = this.ia.jt(u4(h4));
    this.jd(a5, r8, null, n6, true);
  }
  Yd(t6) {
    this.Rd().zn(), this.qa(), t6 || this.pd.p(null, null, null);
  }
  Ra() {
    const t6 = this.Ct.Kn();
    if (null !== t6) {
      const i8 = this.Ct.Bn(), n6 = this.Ct.En();
      this.jd(i8, n6, null, t6);
    }
    this.Ct.Nn();
  }
  Kd(t6, i8, n6) {
    const s4 = this.ia.Rn(0);
    void 0 !== i8 && void 0 !== n6 && this.ia.kt(i8, n6);
    const e11 = this.ia.Rn(0), r8 = this.ia.Pc(), h4 = this.ia.Ee();
    if (null !== h4 && null !== s4 && null !== e11) {
      const i9 = h4.ze(r8), a5 = this.xu.key(s4) > this.xu.key(e11), l6 = null !== t6 && t6 > r8 && !a5, o11 = this.ia.N().allowShiftVisibleRangeOnWhitespaceReplacement, _3 = i9 && (!(void 0 === n6) || o11) && this.ia.N().shiftVisibleRangeOnNewBar;
      if (l6 && !_3) {
        const i10 = t6 - r8;
        this.ia.gs(this.ia.Ac() - i10);
      }
    }
    this.ia.Nc(t6);
  }
  Va(t6) {
    null !== t6 && t6.hu();
  }
  Ks(t6) {
    if ((function(t7) {
      return t7 instanceof ki;
    })(t6)) return t6;
    const i8 = this.od.find(((i9) => i9.Dt().includes(t6)));
    return void 0 === i8 ? null : i8;
  }
  Bc() {
    this.od.forEach(((t6) => t6.hu())), this.Ra();
  }
  m() {
    this.od.forEach(((t6) => t6.m())), this.od.length = 0, this.yn.localization.priceFormatter = void 0, this.yn.localization.percentageFormatter = void 0, this.yn.localization.timeFormatter = void 0;
  }
  Zd() {
    return this.wd;
  }
  Js() {
    return this.wd.N();
  }
  L_() {
    return this.fd;
  }
  Gd(t6, i8) {
    const n6 = this.gd(i8);
    this.Xd(t6, n6), this._d.push(t6), this.ka(), 1 === this._d.length ? this.Pa() : this.mr();
  }
  Jd(t6) {
    const i8 = this.Ks(t6), n6 = this._d.indexOf(t6);
    o10(-1 !== n6, "Series not found");
    const s4 = u4(i8);
    this._d.splice(n6, 1), s4.r_(t6), t6.m && t6.m(), this.ka(), this.ia._c(), this.Qd(s4);
  }
  ya(t6, i8) {
    const n6 = u4(this.Ks(t6));
    n6.r_(t6, true), n6.s_(t6, i8, true);
  }
  Xc() {
    const t6 = X.Cs();
    t6.us(), this.Cd(t6);
  }
  tf(t6) {
    const i8 = X.Cs();
    i8.fs(t6), this.Cd(i8);
  }
  ws() {
    const t6 = X.Cs();
    t6.ws(), this.Cd(t6);
  }
  Ms(t6) {
    const i8 = X.Cs();
    i8.Ms(t6), this.Cd(i8);
  }
  gs(t6) {
    const i8 = X.Cs();
    i8.gs(t6), this.Cd(i8);
  }
  ps(t6) {
    const i8 = X.Cs();
    i8.ps(t6), this.Cd(i8);
  }
  cs() {
    const t6 = X.Cs();
    t6.cs(), this.Cd(t6);
  }
  if() {
    const t6 = this.yn.defaultVisiblePriceScaleId, i8 = this.yn.leftPriceScale.visible;
    return i8 !== this.yn.rightPriceScale.visible ? i8 ? "left" : "right" : t6;
  }
  nf(t6, i8) {
    o10(i8 >= 0, "Index should be greater or equal to 0");
    if (i8 === this.sf(t6)) return;
    const n6 = u4(this.Ks(t6));
    n6.r_(t6);
    const s4 = this.gd(i8);
    this.Xd(t6, s4);
    let e11 = false;
    0 === n6.Cl().length && (e11 = this.Qd(n6)), e11 || this.Pa();
  }
  ef() {
    return this.xd;
  }
  $() {
    return this.bd;
  }
  Ut(t6) {
    const i8 = this.xd, n6 = this.bd;
    if (i8 === n6) return i8;
    if (t6 = Math.max(0, Math.min(100, Math.round(100 * t6))), null === this.vd || this.vd.ah !== n6 || this.vd.oh !== i8) this.vd = { ah: n6, oh: i8, rf: /* @__PURE__ */ new Map() };
    else {
      const i9 = this.vd.rf.get(t6);
      if (void 0 !== i9) return i9;
    }
    const s4 = this.To.tt(n6, i8, t6 / 100);
    return this.vd.rf.set(t6, s4), s4;
  }
  hf(t6) {
    return this.od.indexOf(t6);
  }
  Xi() {
    return this.To;
  }
  af() {
    return this.lf();
  }
  lf(t6) {
    const i8 = new ki(this.ia, this);
    this.od.push(i8);
    const n6 = t6 ?? this.od.length - 1, s4 = X.ys();
    return s4.es(n6, { rs: 0, hs: true }), this.Cd(s4), i8;
  }
  gd(t6) {
    return o10(t6 >= 0, "Index should be greater or equal to 0"), (t6 = Math.min(this.od.length, t6)) < this.od.length ? this.od[t6] : this.lf(t6);
  }
  sf(t6) {
    return this.od.findIndex(((i8) => i8.U_().includes(t6)));
  }
  Ld(t6, i8) {
    const n6 = new X(i8);
    if (null !== t6) {
      const s4 = this.od.indexOf(t6);
      n6.es(s4, { rs: i8 });
    }
    return n6;
  }
  yd(t6, i8) {
    return void 0 === i8 && (i8 = 2), this.Ld(this.Ks(t6), i8);
  }
  Cd(t6) {
    this.md && this.md(t6), this.od.forEach(((t7) => t7.pu().wr().kt()));
  }
  Xd(t6, i8) {
    const n6 = t6.N().priceScaleId, s4 = void 0 !== n6 ? n6 : this.if();
    i8.s_(t6, s4), G(s4) || t6.vr(t6.N());
  }
  Sd(t6) {
    const i8 = this.yn.layout;
    return "gradient" === i8.background.type ? 0 === t6 ? i8.background.topColor : i8.background.bottomColor : i8.background.color;
  }
  Qd(t6) {
    return !t6.H_() && 0 === t6.Cl().length && this.od.length > 1 && (this.od.splice(this.hf(t6), 1), this.Pa(), true);
  }
};
function Yi(t6) {
  if (t6 >= 1) return 0;
  let i8 = 0;
  for (; i8 < 8; i8++) {
    const n6 = Math.round(t6);
    if (Math.abs(n6 - t6) < 1e-8) return i8;
    t6 *= 10;
  }
  return i8;
}
function Ki(t6) {
  return !p3(t6) && !m2(t6);
}
function Zi(t6) {
  return p3(t6);
}
!(function(t6) {
  t6[t6.Disabled = 0] = "Disabled", t6[t6.Continuous = 1] = "Continuous", t6[t6.OnDataUpdate = 2] = "OnDataUpdate";
})(Hi || (Hi = {})), (function(t6) {
  t6[t6.LastBar = 0] = "LastBar", t6[t6.LastVisible = 1] = "LastVisible";
})(Ui || (Ui = {})), (function(t6) {
  t6.Solid = "solid", t6.VerticalGradient = "gradient";
})($i || ($i = {})), (function(t6) {
  t6[t6.Year = 0] = "Year", t6[t6.Month = 1] = "Month", t6[t6.DayOfMonth = 2] = "DayOfMonth", t6[t6.Time = 3] = "Time", t6[t6.TimeWithSeconds = 4] = "TimeWithSeconds";
})(ji || (ji = {}));
var Gi = (t6) => t6.getUTCFullYear();
function Xi(t6, i8, n6) {
  return i8.replace(/yyyy/g, ((t7) => tt(Gi(t7), 4))(t6)).replace(/yy/g, ((t7) => tt(Gi(t7) % 100, 2))(t6)).replace(/MMMM/g, ((t7, i9) => new Date(t7.getUTCFullYear(), t7.getUTCMonth(), 1).toLocaleString(i9, { month: "long" }))(t6, n6)).replace(/MMM/g, ((t7, i9) => new Date(t7.getUTCFullYear(), t7.getUTCMonth(), 1).toLocaleString(i9, { month: "short" }))(t6, n6)).replace(/MM/g, ((t7) => tt(((t8) => t8.getUTCMonth() + 1)(t7), 2))(t6)).replace(/dd/g, ((t7) => tt(((t8) => t8.getUTCDate())(t7), 2))(t6));
}
var Ji = class {
  constructor(t6 = "yyyy-MM-dd", i8 = "default") {
    this._f = t6, this.uf = i8;
  }
  Cu(t6) {
    return Xi(t6, this._f, this.uf);
  }
};
var Qi = class {
  constructor(t6) {
    this.cf = t6 || "%h:%m:%s";
  }
  Cu(t6) {
    return this.cf.replace("%h", tt(t6.getUTCHours(), 2)).replace("%m", tt(t6.getUTCMinutes(), 2)).replace("%s", tt(t6.getUTCSeconds(), 2));
  }
};
var tn = { df: "yyyy-MM-dd", ff: "%h:%m:%s", pf: " ", vf: "default" };
var nn = class {
  constructor(t6 = {}) {
    const i8 = { ...tn, ...t6 };
    this.mf = new Ji(i8.df, i8.vf), this.wf = new Qi(i8.ff), this.Mf = i8.pf;
  }
  Cu(t6) {
    return `${this.mf.Cu(t6)}${this.Mf}${this.wf.Cu(t6)}`;
  }
};
function sn(t6) {
  return 60 * t6 * 60 * 1e3;
}
function en(t6) {
  return 60 * t6 * 1e3;
}
var rn = [{ gf: (hn = 1, 1e3 * hn), bf: 10 }, { gf: en(1), bf: 20 }, { gf: en(5), bf: 21 }, { gf: en(30), bf: 22 }, { gf: sn(1), bf: 30 }, { gf: sn(3), bf: 31 }, { gf: sn(6), bf: 32 }, { gf: sn(12), bf: 33 }];
var hn;
function an(t6, i8) {
  if (t6.getUTCFullYear() !== i8.getUTCFullYear()) return 70;
  if (t6.getUTCMonth() !== i8.getUTCMonth()) return 60;
  if (t6.getUTCDate() !== i8.getUTCDate()) return 50;
  for (let n6 = rn.length - 1; n6 >= 0; --n6) if (Math.floor(i8.getTime() / rn[n6].gf) !== Math.floor(t6.getTime() / rn[n6].gf)) return rn[n6].bf;
  return 0;
}
function ln(t6) {
  let i8 = t6;
  if (m2(t6) && (i8 = _n(t6)), !Ki(i8)) throw new Error("time must be of type BusinessDay");
  const n6 = new Date(Date.UTC(i8.year, i8.month - 1, i8.day, 0, 0, 0, 0));
  return { Sf: Math.round(n6.getTime() / 1e3), xf: i8 };
}
function on(t6) {
  if (!Zi(t6)) throw new Error("time must be of type isUTCTimestamp");
  return { Sf: t6 };
}
function _n(t6) {
  const i8 = new Date(t6);
  if (isNaN(i8.getTime())) throw new Error(`Invalid date string=${t6}, expected format=yyyy-mm-dd`);
  return { day: i8.getUTCDate(), month: i8.getUTCMonth() + 1, year: i8.getUTCFullYear() };
}
function un(t6) {
  m2(t6.time) && (t6.time = _n(t6.time));
}
var cn = class {
  options() {
    return this.yn;
  }
  setOptions(t6) {
    this.yn = t6, this.updateFormatter(t6.localization);
  }
  preprocessData(t6) {
    Array.isArray(t6) ? (function(t7) {
      t7.forEach(un);
    })(t6) : un(t6);
  }
  createConverterToInternalObj(t6) {
    return u4((function(t7) {
      return 0 === t7.length ? null : Ki(t7[0].time) || m2(t7[0].time) ? ln : on;
    })(t6));
  }
  key(t6) {
    return "object" == typeof t6 && "Sf" in t6 ? t6.Sf : this.key(this.convertHorzItemToInternal(t6));
  }
  cacheKey(t6) {
    const i8 = t6;
    return void 0 === i8.xf ? new Date(1e3 * i8.Sf).getTime() : new Date(Date.UTC(i8.xf.year, i8.xf.month - 1, i8.xf.day)).getTime();
  }
  convertHorzItemToInternal(t6) {
    return Zi(i8 = t6) ? on(i8) : Ki(i8) ? ln(i8) : ln(_n(i8));
    var i8;
  }
  updateFormatter(t6) {
    if (!this.yn) return;
    const i8 = t6.dateFormat;
    this.yn.timeScale.timeVisible ? this.Cf = new nn({ df: i8, ff: this.yn.timeScale.secondsVisible ? "%h:%m:%s" : "%h:%m", pf: "   ", vf: t6.locale }) : this.Cf = new Ji(i8, t6.locale);
  }
  formatHorzItem(t6) {
    const i8 = t6;
    return this.Cf.Cu(new Date(1e3 * i8.Sf));
  }
  formatTickmark(t6, i8) {
    const n6 = (function(t7, i9, n7) {
      switch (t7) {
        case 0:
        case 10:
          return i9 ? n7 ? 4 : 3 : 2;
        case 20:
        case 21:
        case 22:
        case 30:
        case 31:
        case 32:
        case 33:
          return i9 ? 3 : 2;
        case 50:
          return 2;
        case 60:
          return 1;
        case 70:
          return 0;
      }
    })(t6.weight, this.yn.timeScale.timeVisible, this.yn.timeScale.secondsVisible), s4 = this.yn.timeScale;
    if (void 0 !== s4.tickMarkFormatter) {
      const e11 = s4.tickMarkFormatter(t6.originalTime, n6, i8.locale);
      if (null !== e11) return e11;
    }
    return (function(t7, i9, n7) {
      const s5 = {};
      switch (i9) {
        case 0:
          s5.year = "numeric";
          break;
        case 1:
          s5.month = "short";
          break;
        case 2:
          s5.day = "numeric";
          break;
        case 3:
          s5.hour12 = false, s5.hour = "2-digit", s5.minute = "2-digit";
          break;
        case 4:
          s5.hour12 = false, s5.hour = "2-digit", s5.minute = "2-digit", s5.second = "2-digit";
      }
      const e11 = void 0 === t7.xf ? new Date(1e3 * t7.Sf) : new Date(Date.UTC(t7.xf.year, t7.xf.month - 1, t7.xf.day));
      return new Date(e11.getUTCFullYear(), e11.getUTCMonth(), e11.getUTCDate(), e11.getUTCHours(), e11.getUTCMinutes(), e11.getUTCSeconds(), e11.getUTCMilliseconds()).toLocaleString(n7, s5);
    })(t6.time, n6, i8.locale);
  }
  maxTickMarkWeight(t6) {
    let i8 = t6.reduce(Ni, t6[0]).weight;
    return i8 > 30 && i8 < 50 && (i8 = 30), i8;
  }
  fillWeightsForPoints(t6, i8) {
    !(function(t7, i9 = 0) {
      if (0 === t7.length) return;
      let n6 = 0 === i9 ? null : t7[i9 - 1].time.Sf, s4 = null !== n6 ? new Date(1e3 * n6) : null, e11 = 0;
      for (let r8 = i9; r8 < t7.length; ++r8) {
        const i10 = t7[r8], h4 = new Date(1e3 * i10.time.Sf);
        null !== s4 && (i10.timeWeight = an(h4, s4)), e11 += i10.time.Sf - (n6 || i10.time.Sf), n6 = i10.time.Sf, s4 = h4;
      }
      if (0 === i9 && t7.length > 1) {
        const i10 = Math.ceil(e11 / (t7.length - 1)), n7 = new Date(1e3 * (t7[0].time.Sf - i10));
        t7[0].timeWeight = an(new Date(1e3 * t7[0].time.Sf), n7);
      }
    })(t6, i8);
  }
  static yf(t6) {
    return f3({ localization: { dateFormat: "dd MMM 'yy" } }, t6 ?? {});
  }
};
var dn = "undefined" != typeof window;
function fn() {
  return !!dn && window.navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
}
function pn() {
  return !!dn && /iPhone|iPad|iPod/.test(window.navigator.platform);
}
function vn(t6, i8) {
  switch (t6) {
    case "custom":
      return void 0 !== i8 ? "custom-object" : "series";
    case "price-line":
      return "custom-price-line";
    case "marker":
      return "series-marker";
    case "primitive":
      return "primitive";
    default:
      return "series";
  }
}
function mn(t6) {
  return t6 + t6 % 2;
}
function wn(t6) {
  dn && void 0 !== window.chrome && t6.addEventListener("mousedown", ((t7) => {
    if (1 === t7.button) return t7.preventDefault(), false;
  }));
}
var Mn = class {
  constructor(t6, i8, n6) {
    this.kf = 0, this.Pf = null, this.Tf = { _t: Number.NEGATIVE_INFINITY, ut: Number.POSITIVE_INFINITY }, this.Rf = 0, this.Df = null, this.If = { _t: Number.NEGATIVE_INFINITY, ut: Number.POSITIVE_INFINITY }, this.Vf = null, this.Bf = false, this.Ef = null, this.Af = null, this.Lf = false, this.zf = false, this.Of = false, this.Nf = null, this.Ff = null, this.Wf = null, this.Hf = null, this.Uf = null, this.$f = null, this.jf = null, this.qf = 0, this.Yf = false, this.Kf = false, this.Zf = false, this.Gf = 0, this.Xf = null, this.Jf = !pn(), this.Qf = (t7) => {
      this.tp(t7);
    }, this.ip = (t7) => {
      if (this.np(t7)) {
        const i9 = this.sp(t7);
        if (++this.Rf, this.Df && this.Rf > 1) {
          const { ep: n7 } = this.rp(Sn(t7), this.If);
          n7 < 30 && !this.Of && this.hp(i9, this.lp.ap), this.op();
        }
      } else {
        const i9 = this.sp(t7);
        if (++this.kf, this.Pf && this.kf > 1) {
          const { ep: n7 } = this.rp(Sn(t7), this.Tf);
          n7 < 5 && !this.zf && this._p(i9, this.lp.up), this.cp();
        }
      }
    }, this.dp = t6, this.lp = i8, this.yn = n6, this.fp();
  }
  m() {
    null !== this.Nf && (this.Nf(), this.Nf = null), null !== this.Ff && (this.Ff(), this.Ff = null), null !== this.Hf && (this.Hf(), this.Hf = null), null !== this.Uf && (this.Uf(), this.Uf = null), null !== this.$f && (this.$f(), this.$f = null), null !== this.Wf && (this.Wf(), this.Wf = null), this.pp(), this.cp();
  }
  vp(t6) {
    this.Hf && this.Hf();
    const i8 = this.mp.bind(this);
    if (this.Hf = () => {
      this.dp.removeEventListener("mousemove", i8);
    }, this.dp.addEventListener("mousemove", i8), this.np(t6)) return;
    const n6 = this.sp(t6);
    this._p(n6, this.lp.wp), this.Jf = true;
  }
  cp() {
    null !== this.Pf && clearTimeout(this.Pf), this.kf = 0, this.Pf = null, this.Tf = { _t: Number.NEGATIVE_INFINITY, ut: Number.POSITIVE_INFINITY };
  }
  op() {
    null !== this.Df && clearTimeout(this.Df), this.Rf = 0, this.Df = null, this.If = { _t: Number.NEGATIVE_INFINITY, ut: Number.POSITIVE_INFINITY };
  }
  mp(t6) {
    if (this.Zf || null !== this.Af) return;
    if (this.np(t6)) return;
    const i8 = this.sp(t6);
    this._p(i8, this.lp.Mp), this.Jf = true;
  }
  gp(t6) {
    const i8 = Cn(t6.changedTouches, u4(this.Xf));
    if (null === i8) return;
    if (this.Gf = xn(t6), null !== this.jf) return;
    if (this.Kf) return;
    this.Yf = true;
    const n6 = this.rp(Sn(i8), u4(this.Af)), { bp: s4, Sp: e11, ep: r8 } = n6;
    if (this.Lf || !(r8 < 5)) {
      if (!this.Lf) {
        const t7 = 0.5 * s4, i9 = e11 >= t7 && !this.yn.xp(), n7 = t7 > e11 && !this.yn.Cp();
        i9 || n7 || (this.Kf = true), this.Lf = true, this.Of = true, this.pp(), this.op();
      }
      if (!this.Kf) {
        const n7 = this.sp(t6, i8);
        this.hp(n7, this.lp.yp), bn(t6);
      }
    }
  }
  kp(t6) {
    if (0 !== t6.button) return;
    const i8 = this.rp(Sn(t6), u4(this.Ef)), { ep: n6 } = i8;
    if (n6 >= 5 && (this.zf = true, this.cp()), this.zf) {
      const i9 = this.sp(t6);
      this._p(i9, this.lp.Pp);
    }
  }
  rp(t6, i8) {
    const n6 = Math.abs(i8._t - t6._t), s4 = Math.abs(i8.ut - t6.ut);
    return { bp: n6, Sp: s4, ep: n6 + s4 };
  }
  Tp(t6) {
    let i8 = Cn(t6.changedTouches, u4(this.Xf));
    if (null === i8 && 0 === t6.touches.length && (i8 = t6.changedTouches[0]), null === i8) return;
    this.Xf = null, this.Gf = xn(t6), this.pp(), this.Af = null, this.$f && (this.$f(), this.$f = null);
    const n6 = this.sp(t6, i8);
    if (this.hp(n6, this.lp.Rp), ++this.Rf, this.Df && this.Rf > 1) {
      const { ep: t7 } = this.rp(Sn(i8), this.If);
      t7 < 30 && !this.Of && this.hp(n6, this.lp.ap), this.op();
    } else this.Of || (this.hp(n6, this.lp.Dp), this.lp.Dp && bn(t6));
    0 === this.Rf && bn(t6), 0 === t6.touches.length && this.Bf && (this.Bf = false, bn(t6));
  }
  tp(t6) {
    if (0 !== t6.button) return;
    const i8 = this.sp(t6);
    if (this.Ef = null, this.Zf = false, this.Uf && (this.Uf(), this.Uf = null), fn()) {
      this.dp.ownerDocument.documentElement.removeEventListener("mouseleave", this.Qf);
    }
    if (!this.np(t6)) if (this._p(i8, this.lp.Ip), ++this.kf, this.Pf && this.kf > 1) {
      const { ep: n6 } = this.rp(Sn(t6), this.Tf);
      n6 < 5 && !this.zf && this._p(i8, this.lp.up), this.cp();
    } else this.zf || this._p(i8, this.lp.Vp);
  }
  pp() {
    null !== this.Vf && (clearTimeout(this.Vf), this.Vf = null);
  }
  Bp(t6) {
    if (null !== this.Xf) return;
    const i8 = t6.changedTouches[0];
    this.Xf = i8.identifier, this.Gf = xn(t6);
    const n6 = this.dp.ownerDocument.documentElement;
    this.Of = false, this.Lf = false, this.Kf = false, this.Af = Sn(i8), this.$f && (this.$f(), this.$f = null);
    {
      const i9 = this.gp.bind(this), s5 = this.Tp.bind(this);
      this.$f = () => {
        n6.removeEventListener("touchmove", i9), n6.removeEventListener("touchend", s5);
      }, n6.addEventListener("touchmove", i9, { passive: false }), n6.addEventListener("touchend", s5, { passive: false }), this.pp(), this.Vf = setTimeout(this.Ep.bind(this, t6), 240);
    }
    const s4 = this.sp(t6, i8);
    this.hp(s4, this.lp.Ap), this.Df || (this.Rf = 0, this.Df = setTimeout(this.op.bind(this), 500), this.If = Sn(i8));
  }
  Lp(t6) {
    if (0 !== t6.button) return;
    const i8 = this.dp.ownerDocument.documentElement;
    fn() && i8.addEventListener("mouseleave", this.Qf), this.zf = false, this.Ef = Sn(t6), this.Uf && (this.Uf(), this.Uf = null);
    {
      const t7 = this.kp.bind(this), n7 = this.tp.bind(this);
      this.Uf = () => {
        i8.removeEventListener("mousemove", t7), i8.removeEventListener("mouseup", n7);
      }, i8.addEventListener("mousemove", t7), i8.addEventListener("mouseup", n7);
    }
    if (this.Zf = true, this.np(t6)) return;
    const n6 = this.sp(t6);
    this._p(n6, this.lp.zp), this.Pf || (this.kf = 0, this.Pf = setTimeout(this.cp.bind(this), 500), this.Tf = Sn(t6));
  }
  fp() {
    this.dp.addEventListener("mouseenter", this.vp.bind(this)), this.dp.addEventListener("touchcancel", this.pp.bind(this));
    {
      const t6 = this.dp.ownerDocument, i8 = (t7) => {
        this.lp.Op && (t7.composed && this.dp.contains(t7.composedPath()[0]) || t7.target && this.dp.contains(t7.target) || this.lp.Op());
      };
      this.Ff = () => {
        t6.removeEventListener("touchstart", i8);
      }, this.Nf = () => {
        t6.removeEventListener("mousedown", i8);
      }, t6.addEventListener("mousedown", i8), t6.addEventListener("touchstart", i8, { passive: true });
    }
    pn() && (this.Wf = () => {
      this.dp.removeEventListener("dblclick", this.ip);
    }, this.dp.addEventListener("dblclick", this.ip)), this.dp.addEventListener("mouseleave", this.Np.bind(this)), this.dp.addEventListener("touchstart", this.Bp.bind(this), { passive: true }), wn(this.dp), this.dp.addEventListener("mousedown", this.Lp.bind(this)), this.Fp(), this.dp.addEventListener("touchmove", (() => {
    }), { passive: false });
  }
  Fp() {
    void 0 === this.lp.Wp && void 0 === this.lp.Hp && void 0 === this.lp.Up || (this.dp.addEventListener("touchstart", ((t6) => this.$p(t6.touches)), { passive: true }), this.dp.addEventListener("touchmove", ((t6) => {
      if (2 === t6.touches.length && null !== this.jf && void 0 !== this.lp.Hp) {
        const i8 = gn(t6.touches[0], t6.touches[1]) / this.qf;
        this.lp.Hp(this.jf, i8), bn(t6);
      }
    }), { passive: false }), this.dp.addEventListener("touchend", ((t6) => {
      this.$p(t6.touches);
    })));
  }
  $p(t6) {
    1 === t6.length && (this.Yf = false), 2 !== t6.length || this.Yf || this.Bf ? this.jp() : this.qp(t6);
  }
  qp(t6) {
    const i8 = this.dp.getBoundingClientRect() || { left: 0, top: 0 };
    this.jf = { _t: (t6[0].clientX - i8.left + (t6[1].clientX - i8.left)) / 2, ut: (t6[0].clientY - i8.top + (t6[1].clientY - i8.top)) / 2 }, this.qf = gn(t6[0], t6[1]), void 0 !== this.lp.Wp && this.lp.Wp(), this.pp();
  }
  jp() {
    null !== this.jf && (this.jf = null, void 0 !== this.lp.Up && this.lp.Up());
  }
  Np(t6) {
    if (this.Hf && this.Hf(), this.np(t6)) return;
    if (!this.Jf) return;
    const i8 = this.sp(t6);
    this._p(i8, this.lp.Yp), this.Jf = !pn();
  }
  Ep(t6) {
    const i8 = Cn(t6.touches, u4(this.Xf));
    if (null === i8) return;
    const n6 = this.sp(t6, i8);
    this.hp(n6, this.lp.Kp), this.Of = true, this.Bf = true;
  }
  np(t6) {
    return t6.sourceCapabilities && void 0 !== t6.sourceCapabilities.firesTouchEvents ? t6.sourceCapabilities.firesTouchEvents : xn(t6) < this.Gf + 500;
  }
  hp(t6, i8) {
    i8 && i8.call(this.lp, t6);
  }
  _p(t6, i8) {
    i8 && i8.call(this.lp, t6);
  }
  sp(t6, i8) {
    const n6 = i8 || t6, s4 = this.dp.getBoundingClientRect() || { left: 0, top: 0 };
    return { clientX: n6.clientX, clientY: n6.clientY, pageX: n6.pageX, pageY: n6.pageY, screenX: n6.screenX, screenY: n6.screenY, localX: n6.clientX - s4.left, localY: n6.clientY - s4.top, ctrlKey: t6.ctrlKey, altKey: t6.altKey, shiftKey: t6.shiftKey, metaKey: t6.metaKey, Zp: !t6.type.startsWith("mouse") && "contextmenu" !== t6.type && "click" !== t6.type, Gp: t6.type, Xp: n6.target, gu: t6.view, Jp: () => {
      "touchstart" !== t6.type && bn(t6);
    } };
  }
};
function gn(t6, i8) {
  const n6 = t6.clientX - i8.clientX, s4 = t6.clientY - i8.clientY;
  return Math.sqrt(n6 * n6 + s4 * s4);
}
function bn(t6) {
  t6.cancelable && t6.preventDefault();
}
function Sn(t6) {
  return { _t: t6.pageX, ut: t6.pageY };
}
function xn(t6) {
  return t6.timeStamp || performance.now();
}
function Cn(t6, i8) {
  for (let n6 = 0; n6 < t6.length; ++n6) if (t6[n6].identifier === i8) return t6[n6];
  return null;
}
var yn = class {
  constructor(t6, i8, n6) {
    this.Qp = null, this.tv = null, this.iv = true, this.nv = null, this.sv = t6, this.ev = t6.rv()[i8], this.hv = t6.rv()[n6], this.av = document.createElement("tr"), this.av.style.height = "1px", this.lv = document.createElement("td"), this.lv.style.position = "relative", this.lv.style.padding = "0", this.lv.style.margin = "0", this.lv.setAttribute("colspan", "3"), this.ov(), this.av.appendChild(this.lv), this.iv = this.sv.N().layout.panes.enableResize, this.iv ? this._v() : (this.Qp = null, this.tv = null);
  }
  m() {
    null !== this.tv && this.tv.m();
  }
  uv() {
    return this.av;
  }
  cv() {
    return size3({ width: this.ev.cv().width, height: 1 });
  }
  dv() {
    return size3({ width: this.ev.dv().width, height: 1 * window.devicePixelRatio });
  }
  fv(t6, i8, n6) {
    const s4 = this.dv();
    t6.fillStyle = this.sv.N().layout.panes.separatorColor, t6.fillRect(i8, n6, s4.width, s4.height);
  }
  kt() {
    this.ov(), this.sv.N().layout.panes.enableResize !== this.iv && (this.iv = this.sv.N().layout.panes.enableResize, this.iv ? this._v() : (null !== this.Qp && (this.lv.removeChild(this.Qp.pv), this.lv.removeChild(this.Qp.vv), this.Qp = null), null !== this.tv && (this.tv.m(), this.tv = null)));
  }
  _v() {
    const t6 = document.createElement("div"), i8 = t6.style;
    i8.position = "fixed", i8.display = "none", i8.zIndex = "49", i8.top = "0", i8.left = "0", i8.width = "100%", i8.height = "100%", i8.cursor = "row-resize", this.lv.appendChild(t6);
    const n6 = document.createElement("div"), s4 = n6.style;
    s4.position = "absolute", s4.zIndex = "50", s4.top = "-4px", s4.height = "9px", s4.width = "100%", s4.backgroundColor = "", s4.cursor = "row-resize", this.lv.appendChild(n6);
    const e11 = { wp: this.mv.bind(this), Yp: this.wv.bind(this), zp: this.Mv.bind(this), Ap: this.Mv.bind(this), Pp: this.gv.bind(this), yp: this.gv.bind(this), Ip: this.bv.bind(this), Rp: this.bv.bind(this) };
    this.tv = new Mn(n6, e11, { xp: () => false, Cp: () => true }), this.Qp = { vv: n6, pv: t6 };
  }
  ov() {
    this.lv.style.background = this.sv.N().layout.panes.separatorColor;
  }
  mv(t6) {
    null !== this.Qp && (this.Qp.vv.style.backgroundColor = this.sv.N().layout.panes.separatorHoverColor);
  }
  wv(t6) {
    null !== this.Qp && null === this.nv && (this.Qp.vv.style.backgroundColor = "");
  }
  Mv(t6) {
    if (null === this.Qp) return;
    const i8 = this.ev.Sv().z_() + this.hv.Sv().z_(), n6 = i8 / (this.ev.cv().height + this.hv.cv().height), s4 = 30 * n6;
    i8 <= 2 * s4 || (this.nv = { xv: t6.pageY, Cv: this.ev.Sv().z_(), yv: i8 - s4, kv: i8, Pv: n6, Tv: s4 }, this.Qp.pv.style.display = "block");
  }
  gv(t6) {
    const i8 = this.nv;
    if (null === i8) return;
    const n6 = (t6.pageY - i8.xv) * i8.Pv, s4 = ni(i8.Cv + n6, i8.Tv, i8.yv);
    this.ev.Sv().O_(s4), this.hv.Sv().O_(i8.kv - s4), this.sv.Qt().Pa();
  }
  bv(t6) {
    null !== this.nv && null !== this.Qp && (this.nv = null, this.Qp.pv.style.display = "none");
  }
};
function kn(t6, i8) {
  return t6.Rv - i8.Rv;
}
function Pn(t6, i8, n6) {
  const s4 = (t6.Rv - i8.Rv) / (t6.wt - i8.wt);
  return Math.sign(s4) * Math.min(Math.abs(s4), n6);
}
var Tn = class {
  constructor(t6, i8, n6, s4) {
    this.Dv = null, this.Iv = null, this.Vv = null, this.Bv = null, this.Ev = null, this.Av = 0, this.Lv = 0, this.zv = t6, this.Ov = i8, this.Nv = n6, this.ks = s4;
  }
  Fv(t6, i8) {
    if (null !== this.Dv) {
      if (this.Dv.wt === i8) return void (this.Dv.Rv = t6);
      if (Math.abs(this.Dv.Rv - t6) < this.ks) return;
    }
    this.Bv = this.Vv, this.Vv = this.Iv, this.Iv = this.Dv, this.Dv = { wt: i8, Rv: t6 };
  }
  me(t6, i8) {
    if (null === this.Dv || null === this.Iv) return;
    if (i8 - this.Dv.wt > 50) return;
    let n6 = 0;
    const s4 = Pn(this.Dv, this.Iv, this.Ov), e11 = kn(this.Dv, this.Iv), r8 = [s4], h4 = [e11];
    if (n6 += e11, null !== this.Vv) {
      const t7 = Pn(this.Iv, this.Vv, this.Ov);
      if (Math.sign(t7) === Math.sign(s4)) {
        const i9 = kn(this.Iv, this.Vv);
        if (r8.push(t7), h4.push(i9), n6 += i9, null !== this.Bv) {
          const t8 = Pn(this.Vv, this.Bv, this.Ov);
          if (Math.sign(t8) === Math.sign(s4)) {
            const i10 = kn(this.Vv, this.Bv);
            r8.push(t8), h4.push(i10), n6 += i10;
          }
        }
      }
    }
    let a5 = 0;
    for (let t7 = 0; t7 < r8.length; ++t7) a5 += h4[t7] / n6 * r8[t7];
    Math.abs(a5) < this.zv || (this.Ev = { Rv: t6, wt: i8 }, this.Lv = a5, this.Av = (function(t7, i9) {
      const n7 = Math.log(i9);
      return Math.log(1 * n7 / -t7) / n7;
    })(Math.abs(a5), this.Nv));
  }
  qc(t6) {
    const i8 = u4(this.Ev), n6 = t6 - i8.wt;
    return i8.Rv + this.Lv * (Math.pow(this.Nv, n6) - 1) / Math.log(this.Nv);
  }
  jc(t6) {
    return null === this.Ev || this.Wv(t6) === this.Av;
  }
  Wv(t6) {
    const i8 = t6 - u4(this.Ev).wt;
    return Math.min(i8, this.Av);
  }
};
var Rn = class {
  constructor(t6, i8) {
    this.Hv = void 0, this.Uv = void 0, this.$v = void 0, this.vn = false, this.jv = t6, this.qv = i8, this.Yv();
  }
  kt() {
    this.Yv();
  }
  Kv() {
    this.Hv && this.jv.removeChild(this.Hv), this.Uv && this.jv.removeChild(this.Uv), this.Hv = void 0, this.Uv = void 0;
  }
  Zv() {
    return this.vn !== this.Gv() || this.$v !== this.Xv();
  }
  Xv() {
    return this.qv.Qt().Xi().J(this.qv.N().layout.textColor) > 160 ? "dark" : "light";
  }
  Gv() {
    return this.qv.N().layout.attributionLogo;
  }
  Jv() {
    const t6 = new URL(location.href);
    return t6.hostname ? "&utm_source=" + t6.hostname + t6.pathname : "";
  }
  Yv() {
    this.Zv() && (this.Kv(), this.vn = this.Gv(), this.vn && (this.$v = this.Xv(), this.Uv = document.createElement("style"), this.Uv.innerText = "a#tv-attr-logo{--fill:#131722;--stroke:#fff;position:absolute;left:10px;bottom:10px;height:19px;width:35px;margin:0;padding:0;border:0;z-index:3;}a#tv-attr-logo[data-dark]{--fill:#D1D4DC;--stroke:#131722;}", this.Hv = document.createElement("a"), this.Hv.href = `https://www.tradingview.com/?utm_medium=lwc-link&utm_campaign=lwc-chart${this.Jv()}`, this.Hv.title = "Charting by TradingView", this.Hv.id = "tv-attr-logo", this.Hv.target = "_blank", this.Hv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="35" height="19" fill="none"><g fill-rule="evenodd" clip-path="url(#a)" clip-rule="evenodd"><path fill="var(--stroke)" d="M2 0H0v10h6v9h21.4l.5-1.3 6-15 1-2.7H23.7l-.5 1.3-.2.6a5 5 0 0 0-7-.9V0H2Zm20 17h4l5.2-13 .8-2h-7l-1 2.5-.2.5-1.5 3.8-.3.7V17Zm-.8-10a3 3 0 0 0 .7-2.7A3 3 0 1 0 16.8 7h4.4ZM14 7V2H2v6h6v9h4V7h2Z"/><path fill="var(--fill)" d="M14 2H2v6h6v9h6V2Zm12 15h-7l6-15h7l-6 15Zm-7-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></g><defs><clipPath id="a"><path fill="var(--stroke)" d="M0 0h35v19H0z"/></clipPath></defs></svg>', this.Hv.toggleAttribute("data-dark", "dark" === this.$v), this.jv.appendChild(this.Uv), this.jv.appendChild(this.Hv)));
  }
};
function Dn(t6, n6) {
  const s4 = u4(t6.ownerDocument).createElement("canvas");
  t6.appendChild(s4);
  const e11 = bindTo(s4, { type: "device-pixel-content-box", options: { allowResizeObserver: true }, transform: (t7, i8) => ({ width: Math.max(t7.width, i8.width), height: Math.max(t7.height, i8.height) }) });
  return e11.resizeCanvasElement(n6), e11;
}
function In(t6) {
  t6.width = 1, t6.height = 1, t6.getContext("2d")?.clearRect(0, 0, 1, 1);
}
function Vn(t6, i8, n6, s4) {
  t6.qh && t6.qh(i8, n6, s4);
}
function Bn(t6, i8, n6, s4) {
  t6.st(i8, n6, s4);
}
function En(t6, i8, n6, s4) {
  const e11 = t6(n6, s4);
  for (const t7 of e11) {
    const n7 = t7.Tt(s4);
    null !== n7 && i8(n7);
  }
}
function An(t6, i8) {
  return (n6) => {
    if (!(function(t7) {
      return void 0 !== t7.Ft;
    })(n6)) return [];
    return (n6.Ft()?.cl() ?? "") !== i8 ? [] : n6.Ga?.(t6) ?? [];
  };
}
function Ln(t6, i8, n6, s4) {
  if (!t6.length) return;
  let e11 = 0;
  const r8 = t6[0].$t(s4, true);
  let h4 = 1 === i8 ? n6 / 2 - (t6[0].Hi() - r8 / 2) : t6[0].Hi() - r8 / 2 - n6 / 2;
  h4 = Math.max(0, h4);
  for (let r9 = 1; r9 < t6.length; r9++) {
    const a5 = t6[r9], l6 = t6[r9 - 1], o11 = l6.$t(s4, false), _3 = a5.Hi(), u5 = l6.Hi();
    if (1 === i8 ? _3 > u5 - o11 : _3 < u5 + o11) {
      const s5 = u5 - o11 * i8;
      a5.Ui(s5);
      const r10 = s5 - i8 * o11 / 2;
      if ((1 === i8 ? r10 < 0 : r10 > n6) && h4 > 0) {
        const s6 = 1 === i8 ? -1 - r10 : r10 - n6, a6 = Math.min(s6, h4);
        for (let n7 = e11; n7 < t6.length; n7++) t6[n7].Ui(t6[n7].Hi() + i8 * a6);
        h4 -= a6;
      }
    } else e11 = r9, h4 = 1 === i8 ? u5 - o11 - _3 : _3 - (u5 + o11);
  }
}
var zn = class {
  constructor(i8, n6, s4, e11) {
    this.Ki = null, this.Qv = null, this.tm = false, this.im = new rt(200), this.nm = null, this.sm = 0, this.rm = false, this.hm = () => {
      this.rm || this.yt.am().Qt().mr();
    }, this.lm = () => {
      this.rm || this.yt.am().Qt().mr();
    }, this.yt = i8, this.yn = n6, this.ko = n6.layout, this.wd = s4, this.om = "left" === e11, this._m = An("normal", e11), this.um = An("top", e11), this.dm = An("bottom", e11), this.lv = document.createElement("div"), this.lv.style.height = "100%", this.lv.style.overflow = "hidden", this.lv.style.width = "25px", this.lv.style.left = "0", this.lv.style.position = "relative", this.fm = Dn(this.lv, size3({ width: 16, height: 16 })), this.fm.subscribeSuggestedBitmapSizeChanged(this.hm);
    const r8 = this.fm.canvasElement;
    r8.style.position = "absolute", r8.style.zIndex = "1", r8.style.left = "0", r8.style.top = "0", this.pm = Dn(this.lv, size3({ width: 16, height: 16 })), this.pm.subscribeSuggestedBitmapSizeChanged(this.lm);
    const h4 = this.pm.canvasElement;
    h4.style.position = "absolute", h4.style.zIndex = "2", h4.style.left = "0", h4.style.top = "0";
    const a5 = { zp: this.Mv.bind(this), Ap: this.Mv.bind(this), Pp: this.gv.bind(this), yp: this.gv.bind(this), Op: this.vm.bind(this), Ip: this.bv.bind(this), Rp: this.bv.bind(this), up: this.wm.bind(this), ap: this.wm.bind(this), wp: this.Mm.bind(this), Yp: this.wv.bind(this) };
    this.tv = new Mn(this.pm.canvasElement, a5, { xp: () => !this.yn.handleScroll.vertTouchDrag, Cp: () => true });
  }
  m() {
    this.tv.m(), this.pm.unsubscribeSuggestedBitmapSizeChanged(this.lm), In(this.pm.canvasElement), this.pm.dispose(), this.fm.unsubscribeSuggestedBitmapSizeChanged(this.hm), In(this.fm.canvasElement), this.fm.dispose(), null !== this.Ki && this.Ki.a_().u(this), this.Ki = null;
  }
  uv() {
    return this.lv;
  }
  k() {
    return this.ko.fontSize;
  }
  gm() {
    const t6 = this.wd.N();
    return this.nm !== t6.P && (this.im.Os(), this.nm = t6.P), t6;
  }
  bm() {
    if (null === this.Ki) return 0;
    let t6 = 0;
    const i8 = this.gm(), n6 = u4(this.fm.canvasElement.getContext("2d", { colorSpace: this.yt.am().N().layout.colorSpace }));
    n6.save();
    const s4 = this.Ki.El();
    n6.font = this.Sm(), s4.length > 0 && (t6 = Math.max(this.im.Ii(n6, s4[0].io), this.im.Ii(n6, s4[s4.length - 1].io)));
    const e11 = this.xm();
    for (let i9 = e11.length; i9--; ) {
      const s5 = this.im.Ii(n6, e11[i9].ri());
      s5 > t6 && (t6 = s5);
    }
    const r8 = this.Ki.Lt();
    if (null !== r8 && null !== this.Qv && (2 !== (h4 = this.yn.crosshair).mode && h4.horzLine.visible && h4.horzLine.labelVisible)) {
      const i9 = this.Ki.Tn(1, r8), s5 = this.Ki.Tn(this.Qv.height - 2, r8);
      t6 = Math.max(t6, this.im.Ii(n6, this.Ki.Ji(Math.floor(Math.min(i9, s5)) + 0.11111111111111, r8)), this.im.Ii(n6, this.Ki.Ji(Math.ceil(Math.max(i9, s5)) - 0.11111111111111, r8)));
    }
    var h4;
    n6.restore();
    const a5 = t6 || 34;
    return mn(Math.ceil(i8.S + i8.C + i8.V + i8.B + 5 + a5));
  }
  Cm(t6) {
    null !== this.Qv && equalSizes(this.Qv, t6) || (this.Qv = t6, this.rm = true, this.fm.resizeCanvasElement(t6), this.pm.resizeCanvasElement(t6), this.rm = false, this.lv.style.width = `${t6.width}px`, this.lv.style.height = `${t6.height}px`);
  }
  ym() {
    return u4(this.Qv).width;
  }
  un(t6) {
    this.Ki !== t6 && (null !== this.Ki && this.Ki.a_().u(this), this.Ki = t6, t6.a_().i(this.po.bind(this), this));
  }
  Ft() {
    return this.Ki;
  }
  Os() {
    const t6 = this.yt.Sv();
    this.yt.am().Qt().eu(t6, u4(this.Ft()));
  }
  km(t6) {
    if (null === this.Qv) return;
    const i8 = { colorSpace: this.yt.am().N().layout.colorSpace };
    if (1 !== t6) {
      this.Pm(), this.fm.applySuggestedBitmapSize();
      const t7 = tryCreateCanvasRenderingTarget2D(this.fm, i8);
      null !== t7 && (t7.useBitmapCoordinateSpace(((t8) => {
        this.Tm(t8), this.Rm(t8);
      })), this.yt.Dm(t7, this.dm), this.Im(t7), this.yt.Dm(t7, this._m), this.Vm(t7));
    }
    this.pm.applySuggestedBitmapSize();
    const n6 = tryCreateCanvasRenderingTarget2D(this.pm, i8);
    null !== n6 && (n6.useBitmapCoordinateSpace((({ context: t7, bitmapSize: i9 }) => {
      t7.clearRect(0, 0, i9.width, i9.height);
    })), this.Bm(n6), this.yt.Dm(n6, this.um));
  }
  dv() {
    return this.fm.bitmapSize;
  }
  fv(t6, i8, n6, s4) {
    const e11 = this.dv();
    if (e11.width > 0 && e11.height > 0 && (t6.drawImage(this.fm.canvasElement, i8, n6), s4)) {
      const s5 = this.pm.canvasElement;
      t6.drawImage(s5, i8, n6);
    }
  }
  kt() {
    this.Ki?.El();
  }
  Mv(t6) {
    if (null === this.Ki || this.Ki.Gi() || !this.yn.handleScale.axisPressedMouseMove.price) return;
    const i8 = this.yt.am().Qt(), n6 = this.yt.Sv();
    this.tm = true, i8.G_(n6, this.Ki, t6.localY);
  }
  gv(t6) {
    if (null === this.Ki || !this.yn.handleScale.axisPressedMouseMove.price) return;
    const i8 = this.yt.am().Qt(), n6 = this.yt.Sv(), s4 = this.Ki;
    i8.X_(n6, s4, t6.localY);
  }
  vm() {
    if (null === this.Ki || !this.yn.handleScale.axisPressedMouseMove.price) return;
    const t6 = this.yt.am().Qt(), i8 = this.yt.Sv(), n6 = this.Ki;
    this.tm && (this.tm = false, t6.J_(i8, n6));
  }
  bv(t6) {
    if (null === this.Ki || !this.yn.handleScale.axisPressedMouseMove.price) return;
    const i8 = this.yt.am().Qt(), n6 = this.yt.Sv();
    this.tm = false, i8.J_(n6, this.Ki);
  }
  wm(t6) {
    this.yn.handleScale.axisDoubleClickReset.price && this.Os();
  }
  Mm(t6) {
    if (null === this.Ki) return;
    !this.yt.am().Qt().N().handleScale.axisPressedMouseMove.price || this.Ki.je() || this.Ki.Lo() || this.Em(1);
  }
  wv(t6) {
    this.Em(0);
  }
  xm() {
    const t6 = [], i8 = null === this.Ki ? void 0 : this.Ki;
    return ((n6) => {
      for (let s4 = 0; s4 < n6.length; ++s4) {
        const e11 = n6[s4].qn(this.yt.Sv(), i8);
        for (let i9 = 0; i9 < e11.length; i9++) t6.push(e11[i9]);
      }
    })(this.yt.Sv().Dt()), t6;
  }
  Tm({ context: t6, bitmapSize: i8 }) {
    const { width: n6, height: s4 } = i8, e11 = this.yt.Sv().Qt(), r8 = e11.$(), h4 = e11.ef();
    r8 === h4 ? z2(t6, 0, 0, n6, s4, r8) : F(t6, 0, 0, n6, s4, r8, h4);
  }
  Rm({ context: t6, bitmapSize: i8, horizontalPixelRatio: n6 }) {
    if (null === this.Qv || null === this.Ki || !this.Ki.N().borderVisible) return;
    t6.fillStyle = this.Ki.N().borderColor;
    const s4 = Math.max(1, Math.floor(this.gm().S * n6));
    let e11;
    e11 = this.om ? i8.width - s4 : 0, t6.fillRect(e11, 0, s4, i8.height);
  }
  Im(t6) {
    if (null === this.Qv || null === this.Ki) return;
    const i8 = this.Ki.El(), n6 = this.Ki.N(), s4 = this.gm(), e11 = this.om ? this.Qv.width - s4.C : 0;
    n6.borderVisible && n6.ticksVisible && t6.useBitmapCoordinateSpace((({ context: t7, horizontalPixelRatio: r8, verticalPixelRatio: h4 }) => {
      t7.fillStyle = n6.borderColor;
      const a5 = Math.max(1, Math.floor(h4)), l6 = Math.floor(0.5 * h4), o11 = Math.round(s4.C * r8);
      t7.beginPath();
      for (const n7 of i8) t7.rect(Math.floor(e11 * r8), Math.round(n7.Rl * h4) - l6, o11, a5);
      t7.fill();
    })), t6.useMediaCoordinateSpace((({ context: t7 }) => {
      t7.font = this.Sm(), t7.fillStyle = n6.textColor ?? this.ko.textColor, t7.textAlign = this.om ? "right" : "left", t7.textBaseline = "middle";
      const r8 = this.om ? Math.round(e11 - s4.V) : Math.round(e11 + s4.C + s4.V), h4 = i8.map(((i9) => this.im.Di(t7, i9.io)));
      for (let n7 = i8.length; n7--; ) {
        const s5 = i8[n7];
        t7.fillText(s5.io, r8, s5.Rl + h4[n7]);
      }
    }));
  }
  Pm() {
    if (null === this.Qv || null === this.Ki) return;
    let t6 = this.Qv.height / 2;
    const i8 = [], n6 = this.Ki.Dt().slice(), s4 = this.yt.Sv(), e11 = this.gm();
    this.Ki === s4.Gs() && this.yt.Sv().Dt().forEach(((t7) => {
      s4.Zs(t7) && n6.push(t7);
    }));
    const r8 = this.Ki.Cl()[0], h4 = this.Ki;
    n6.forEach(((n7) => {
      const e12 = n7.qn(s4, h4);
      e12.forEach(((t7) => {
        t7.$i() && null === t7.Wi() && (t7.Ui(null), i8.push(t7));
      })), r8 === n7 && e12.length > 0 && (t6 = e12[0].Ei());
    }));
    this.Ki.N().alignLabels && this.Am(i8, e11, t6);
  }
  Am(t6, i8, n6) {
    if (null === this.Qv) return;
    const s4 = t6.filter(((t7) => t7.Ei() <= n6)), e11 = t6.filter(((t7) => t7.Ei() > n6));
    s4.sort(((t7, i9) => i9.Ei() - t7.Ei())), s4.length && e11.length && e11.push(s4[0]), e11.sort(((t7, i9) => t7.Ei() - i9.Ei()));
    for (const n7 of t6) {
      const t7 = Math.floor(n7.$t(i8) / 2), s5 = n7.Ei();
      s5 > -t7 && s5 < t7 && n7.Ui(t7), s5 > this.Qv.height - t7 && s5 < this.Qv.height + t7 && n7.Ui(this.Qv.height - t7);
    }
    Ln(s4, 1, this.Qv.height, i8), Ln(e11, -1, this.Qv.height, i8);
  }
  Vm(t6) {
    if (null === this.Qv) return;
    const i8 = this.xm(), n6 = this.gm(), s4 = this.om ? "right" : "left";
    i8.forEach(((i9) => {
      if (i9.ji()) {
        i9.Tt(u4(this.Ki)).st(t6, n6, this.im, s4);
      }
    }));
  }
  Bm(t6) {
    if (null === this.Qv || null === this.Ki) return;
    const i8 = this.yt.am().Qt(), n6 = [], s4 = this.yt.Sv(), e11 = i8.Rd().qn(s4, this.Ki);
    e11.length && n6.push(e11);
    const r8 = this.gm(), h4 = this.om ? "right" : "left";
    n6.forEach(((i9) => {
      i9.forEach(((i10) => {
        i10.Tt(u4(this.Ki)).st(t6, r8, this.im, h4);
      }));
    }));
  }
  Em(t6) {
    this.lv.style.cursor = 1 === t6 ? "ns-resize" : "default";
  }
  po() {
    const t6 = this.bm();
    this.sm < t6 && this.yt.am().Qt().Pa(), this.sm = t6;
  }
  Sm() {
    return x2(this.ko.fontSize, this.ko.fontFamily);
  }
};
function On(t6, i8) {
  return t6.Ka?.(i8) ?? [];
}
function Nn(t6, i8) {
  return t6.jn?.(i8) ?? [];
}
function Fn(t6, i8) {
  return t6.cn?.(i8) ?? [];
}
function Wn(t6, i8) {
  return t6.ja?.(i8) ?? [];
}
var Hn = class _Hn {
  constructor(i8, n6) {
    this.Qv = size3({ width: 0, height: 0 }), this.Lm = null, this.zm = null, this.Om = null, this.Nm = null, this.Fm = false, this.Wm = new d3(), this.Hm = new d3(), this.Um = 0, this.$m = false, this.jm = null, this.qm = false, this.Ym = null, this.Km = null, this.rm = false, this.hm = () => {
      this.rm || null === this.Zm || this.sn().mr();
    }, this.lm = () => {
      this.rm || null === this.Zm || this.sn().mr();
    }, this.qv = i8, this.Zm = n6, this.Zm.fu().i(this.Gm.bind(this), this, true), this.Xm = document.createElement("td"), this.Xm.style.padding = "0", this.Xm.style.position = "relative";
    const s4 = document.createElement("div");
    s4.style.width = "100%", s4.style.height = "100%", s4.style.position = "relative", s4.style.overflow = "hidden", this.Jm = document.createElement("td"), this.Jm.style.padding = "0", this.Qm = document.createElement("td"), this.Qm.style.padding = "0", this.Xm.appendChild(s4), this.fm = Dn(s4, size3({ width: 16, height: 16 })), this.fm.subscribeSuggestedBitmapSizeChanged(this.hm);
    const e11 = this.fm.canvasElement;
    e11.style.position = "absolute", e11.style.zIndex = "1", e11.style.left = "0", e11.style.top = "0", this.pm = Dn(s4, size3({ width: 16, height: 16 })), this.pm.subscribeSuggestedBitmapSizeChanged(this.lm);
    const r8 = this.pm.canvasElement;
    r8.style.position = "absolute", r8.style.zIndex = "2", r8.style.left = "0", r8.style.top = "0", this.av = document.createElement("tr"), this.av.appendChild(this.Jm), this.av.appendChild(this.Xm), this.av.appendChild(this.Qm), this.tw(), this.tv = new Mn(this.pm.canvasElement, this, { xp: () => null === this.jm && !this.qv.N().handleScroll.vertTouchDrag, Cp: () => null === this.jm && !this.qv.N().handleScroll.horzTouchDrag });
  }
  m() {
    null !== this.Lm && this.Lm.m(), null !== this.zm && this.zm.m(), this.Om = null, this.pm.unsubscribeSuggestedBitmapSizeChanged(this.lm), In(this.pm.canvasElement), this.pm.dispose(), this.fm.unsubscribeSuggestedBitmapSizeChanged(this.hm), In(this.fm.canvasElement), this.fm.dispose(), null !== this.Zm && (this.Zm.fu().u(this), this.Zm.m()), this.tv.m();
  }
  Sv() {
    return u4(this.Zm);
  }
  iw(t6) {
    null !== this.Zm && this.Zm.fu().u(this), this.Zm = t6, null !== this.Zm && this.Zm.fu().i(_Hn.prototype.Gm.bind(this), this, true), this.tw(), this.qv.rv().indexOf(this) === this.qv.rv().length - 1 ? (this.Om = this.Om ?? new Rn(this.Xm, this.qv), this.Om.kt()) : (this.Om?.Kv(), this.Om = null);
  }
  am() {
    return this.qv;
  }
  uv() {
    return this.av;
  }
  tw() {
    if (null !== this.Zm && (this.nw(), 0 !== this.sn().Jn().length)) {
      if (null !== this.Lm) {
        const t6 = this.Zm.K_();
        this.Lm.un(u4(t6));
      }
      if (null !== this.zm) {
        const t6 = this.Zm.Z_();
        this.zm.un(u4(t6));
      }
    }
  }
  sw() {
    null !== this.Lm && this.Lm.kt(), null !== this.zm && this.zm.kt();
  }
  z_() {
    return null !== this.Zm ? this.Zm.z_() : 0;
  }
  O_(t6) {
    this.Zm && this.Zm.O_(t6);
  }
  wp(t6) {
    if (!this.Zm) return;
    this.ew();
    const i8 = t6.localX, n6 = t6.localY;
    this.rw(i8, n6, t6);
  }
  zp(t6) {
    this.ew(), this.hw(), this.rw(t6.localX, t6.localY, t6);
  }
  Mp(t6) {
    if (!this.Zm) return;
    this.ew();
    const i8 = t6.localX, n6 = t6.localY;
    this.rw(i8, n6, t6);
  }
  Vp(t6) {
    null !== this.Zm && (this.ew(), this.rw(t6.localX, t6.localY, t6), this.aw(t6));
  }
  up(t6) {
    null !== this.Zm && this.lw(this.Hm, t6);
  }
  ap(t6) {
    this.up(t6);
  }
  Pp(t6) {
    this.ew(), this.ow(t6), this.rw(t6.localX, t6.localY, t6);
  }
  Ip(t6) {
    null !== this.Zm && (this.ew(), this.$m = false, this._w(t6));
  }
  Dp(t6) {
    null !== this.Zm && this.aw(t6);
  }
  Kp(t6) {
    if (this.$m = true, null === this.jm) {
      const i8 = { x: t6.localX, y: t6.localY };
      this.uw(i8, i8, t6);
    }
  }
  Yp(t6) {
    null !== this.Zm && (this.ew(), this.Zm.Qt().kd(null), this.cw());
  }
  dw() {
    return this.Wm;
  }
  fw() {
    return this.Hm;
  }
  Wp() {
    this.Um = 1, this.sn().cs();
  }
  Hp(t6, i8) {
    if (!this.qv.N().handleScale.pinch) return;
    const n6 = 5 * (i8 - this.Um);
    this.Um = i8, this.sn().Od(t6._t, n6);
  }
  Ap(t6) {
    this.$m = false, this.qm = null !== this.jm, this.hw();
    const i8 = this.sn().Rd();
    null !== this.jm && i8.It() && (this.Ym = { x: i8.ni(), y: i8.si() }, this.jm = { x: t6.localX, y: t6.localY });
  }
  yp(t6) {
    if (null === this.Zm) return;
    const i8 = t6.localX, n6 = t6.localY;
    if (null === this.jm) this.ow(t6);
    else {
      this.qm = false;
      const s4 = u4(this.Ym), e11 = s4.x + (i8 - this.jm.x), r8 = s4.y + (n6 - this.jm.y);
      this.rw(e11, r8, t6);
    }
  }
  Rp(t6) {
    0 === this.am().N().trackingMode.exitMode && (this.qm = true), this.pw(), this._w(t6);
  }
  Qs(t6, i8) {
    const n6 = this.Zm;
    return null === n6 ? null : Bi(n6, t6, i8);
  }
  mw(i8, n6) {
    u4("left" === n6 ? this.Lm : this.zm).Cm(size3({ width: i8, height: this.Qv.height }));
  }
  cv() {
    return this.Qv;
  }
  Cm(t6) {
    equalSizes(this.Qv, t6) || (this.Qv = t6, this.rm = true, this.fm.resizeCanvasElement(t6), this.pm.resizeCanvasElement(t6), this.rm = false, this.Xm.style.width = t6.width + "px", this.Xm.style.height = t6.height + "px");
  }
  ww() {
    const t6 = u4(this.Zm);
    t6.q_(t6.K_()), t6.q_(t6.Z_());
    for (const i8 of t6.Cl()) if (t6.Zs(i8)) {
      const n6 = i8.Ft();
      null !== n6 && t6.q_(n6), i8.Nn();
    }
    for (const i8 of t6.vu()) i8.Nn();
  }
  dv() {
    return this.fm.bitmapSize;
  }
  fv(t6, i8, n6, s4) {
    const e11 = this.dv();
    if (e11.width > 0 && e11.height > 0 && (t6.drawImage(this.fm.canvasElement, i8, n6), s4)) {
      const s5 = this.pm.canvasElement;
      null !== t6 && t6.drawImage(s5, i8, n6);
    }
  }
  km(t6) {
    if (0 === t6) return;
    if (null === this.Zm) return;
    t6 > 1 && this.ww(), null !== this.Lm && this.Lm.km(t6), null !== this.zm && this.zm.km(t6);
    const i8 = { colorSpace: this.qv.N().layout.colorSpace };
    if (1 !== t6) {
      this.fm.applySuggestedBitmapSize();
      const t7 = tryCreateCanvasRenderingTarget2D(this.fm, i8);
      null !== t7 && (t7.useBitmapCoordinateSpace(((t8) => {
        this.Tm(t8);
      })), this.Zm && (this.Mw(t7, On), this.gw(t7), this.Mw(t7, Nn), this.Mw(t7, Fn)));
    }
    this.pm.applySuggestedBitmapSize();
    const n6 = tryCreateCanvasRenderingTarget2D(this.pm, i8);
    null !== n6 && (n6.useBitmapCoordinateSpace((({ context: t7, bitmapSize: i9 }) => {
      t7.clearRect(0, 0, i9.width, i9.height);
    })), this.bw(n6), this.Mw(n6, Wn), this.Mw(n6, Fn));
  }
  Sw() {
    return this.Lm;
  }
  xw() {
    return this.zm;
  }
  Dm(t6, i8) {
    this.Mw(t6, i8);
  }
  Gm() {
    null !== this.Zm && this.Zm.fu().u(this), this.Zm = null;
  }
  aw(t6) {
    this.lw(this.Wm, t6);
  }
  lw(t6, i8) {
    const n6 = i8.localX, s4 = i8.localY;
    t6.v() && t6.p(this.sn().Et().Rc(n6), { x: n6, y: s4 }, i8);
  }
  Tm({ context: t6, bitmapSize: i8 }) {
    const { width: n6, height: s4 } = i8, e11 = this.sn(), r8 = e11.$(), h4 = e11.ef();
    r8 === h4 ? z2(t6, 0, 0, n6, s4, h4) : F(t6, 0, 0, n6, s4, r8, h4);
  }
  gw(t6) {
    const i8 = u4(this.Zm), n6 = i8.pu().wr().Tt(i8);
    null !== n6 && n6.st(t6, false);
  }
  bw(t6) {
    this.Cw(t6, Nn, Bn, this.sn().Rd());
  }
  Mw(t6, i8) {
    const n6 = u4(this.Zm), s4 = n6.au(), e11 = n6.vu();
    for (const n7 of e11) this.Cw(t6, i8, Vn, n7);
    for (const n7 of s4) this.Cw(t6, i8, Vn, n7);
    for (const n7 of e11) this.Cw(t6, i8, Bn, n7);
    for (const n7 of s4) this.Cw(t6, i8, Bn, n7);
  }
  Cw(t6, i8, n6, s4) {
    const e11 = u4(this.Zm), r8 = e11.Qt().ou(), h4 = null !== r8 && r8.lu === s4, a5 = null !== r8 && h4 && void 0 !== r8.wu ? r8.wu.ie : void 0;
    En(i8, ((i9) => n6(i9, t6, h4, a5)), s4, e11);
  }
  nw() {
    if (null === this.Zm) return;
    const t6 = this.qv, i8 = this.Zm.K_().N().visible, n6 = this.Zm.Z_().N().visible;
    i8 || null === this.Lm || (this.Jm.removeChild(this.Lm.uv()), this.Lm.m(), this.Lm = null), n6 || null === this.zm || (this.Qm.removeChild(this.zm.uv()), this.zm.m(), this.zm = null);
    const s4 = t6.Qt().Zd();
    i8 && null === this.Lm && (this.Lm = new zn(this, t6.N(), s4, "left"), this.Jm.appendChild(this.Lm.uv())), n6 && null === this.zm && (this.zm = new zn(this, t6.N(), s4, "right"), this.Qm.appendChild(this.zm.uv()));
  }
  yw(t6) {
    return t6.Zp && this.$m || null !== this.jm;
  }
  rw(t6, i8, n6) {
    t6 = Math.max(0, Math.min(t6, this.Qv.width - 1)), i8 = Math.max(0, Math.min(i8, this.Qv.height - 1)), this.sn().jd(t6, i8, n6, u4(this.Zm));
  }
  cw() {
    this.sn().Yd();
  }
  pw() {
    this.qm && (this.jm = null, this.cw());
  }
  uw(t6, i8, n6) {
    this.jm = t6, this.qm = false, this.rw(i8.x, i8.y, n6);
    const s4 = this.sn().Rd();
    this.Ym = { x: s4.ni(), y: s4.si() };
  }
  sn() {
    return this.qv.Qt();
  }
  _w(t6) {
    if (!this.Fm) return;
    const i8 = this.sn(), n6 = this.Sv();
    if (i8.iu(n6, n6.Pn()), this.Nm = null, this.Fm = false, i8.Hd(), null !== this.Km) {
      const t7 = performance.now(), n7 = i8.Et();
      this.Km.me(n7.Ac(), t7), this.Km.jc(t7) || i8.ps(this.Km);
    }
  }
  ew() {
    this.jm = null;
  }
  hw() {
    if (!this.Zm) return;
    if (this.sn().cs(), document.activeElement !== document.body && document.activeElement !== document.documentElement) u4(document.activeElement).blur();
    else {
      const t6 = document.getSelection();
      null !== t6 && t6.removeAllRanges();
    }
    !this.Zm.Pn().Gi() && this.sn().Et().Gi();
  }
  ow(t6) {
    if (null === this.Zm) return;
    const i8 = this.sn(), n6 = i8.Et();
    if (n6.Gi()) return;
    const s4 = this.qv.N(), e11 = s4.handleScroll, r8 = s4.kineticScroll;
    if ((!e11.pressedMouseMove || t6.Zp) && (!e11.horzTouchDrag && !e11.vertTouchDrag || !t6.Zp)) return;
    const h4 = this.Zm.Pn(), a5 = performance.now();
    if (null !== this.Nm || this.yw(t6) || (this.Nm = { x: t6.clientX, y: t6.clientY, Sf: a5, kw: t6.localX, Pw: t6.localY }), null !== this.Nm && !this.Fm && (this.Nm.x !== t6.clientX || this.Nm.y !== t6.clientY)) {
      if (t6.Zp && r8.touch || !t6.Zp && r8.mouse) {
        const t7 = n6.fl();
        this.Km = new Tn(0.2 / t7, 7 / t7, 0.997, 15 / t7), this.Km.Fv(n6.Ac(), this.Nm.Sf);
      } else this.Km = null;
      h4.Gi() || i8.Q_(this.Zm, h4, t6.localY), i8.Fd(t6.localX), this.Fm = true;
    }
    this.Fm && (h4.Gi() || i8.tu(this.Zm, h4, t6.localY), i8.Wd(t6.localX), null !== this.Km && this.Km.Fv(n6.Ac(), a5));
  }
};
var Un = class {
  constructor(i8, n6, s4, e11, r8) {
    this.xt = true, this.Qv = size3({ width: 0, height: 0 }), this.hm = () => this.km(3), this.om = "left" === i8, this.wd = s4.Zd, this.yn = n6, this.Tw = e11, this.Rw = r8, this.lv = document.createElement("div"), this.lv.style.width = "25px", this.lv.style.height = "100%", this.lv.style.overflow = "hidden", this.fm = Dn(this.lv, size3({ width: 16, height: 16 })), this.fm.subscribeSuggestedBitmapSizeChanged(this.hm);
  }
  m() {
    this.fm.unsubscribeSuggestedBitmapSizeChanged(this.hm), In(this.fm.canvasElement), this.fm.dispose();
  }
  uv() {
    return this.lv;
  }
  cv() {
    return this.Qv;
  }
  Cm(t6) {
    equalSizes(this.Qv, t6) || (this.Qv = t6, this.fm.resizeCanvasElement(t6), this.lv.style.width = `${t6.width}px`, this.lv.style.height = `${t6.height}px`, this.xt = true);
  }
  km(t6) {
    if (t6 < 3 && !this.xt) return;
    if (0 === this.Qv.width || 0 === this.Qv.height) return;
    this.xt = false, this.fm.applySuggestedBitmapSize();
    const i8 = tryCreateCanvasRenderingTarget2D(this.fm, { colorSpace: this.yn.layout.colorSpace });
    null !== i8 && i8.useBitmapCoordinateSpace(((t7) => {
      this.Tm(t7), this.Rm(t7);
    }));
  }
  dv() {
    return this.fm.bitmapSize;
  }
  fv(t6, i8, n6) {
    const s4 = this.dv();
    s4.width > 0 && s4.height > 0 && t6.drawImage(this.fm.canvasElement, i8, n6);
  }
  Rm({ context: t6, bitmapSize: i8, horizontalPixelRatio: n6, verticalPixelRatio: s4 }) {
    if (!this.Tw()) return;
    t6.fillStyle = this.yn.timeScale.borderColor;
    const e11 = Math.floor(this.wd.N().S * n6), r8 = Math.floor(this.wd.N().S * s4), h4 = this.om ? i8.width - e11 : 0;
    t6.fillRect(h4, 0, e11, r8);
  }
  Tm({ context: t6, bitmapSize: i8 }) {
    z2(t6, 0, 0, i8.width, i8.height, this.Rw());
  }
};
function $n(t6) {
  return (i8) => i8.Xa?.(t6) ?? [];
}
var jn = $n("normal");
var qn = $n("top");
var Yn = $n("bottom");
var Kn = class {
  constructor(i8, n6) {
    this.Dw = null, this.Iw = null, this.M = null, this.Vw = false, this.Qv = size3({ width: 0, height: 0 }), this.Bw = new d3(), this.im = new rt(5), this.rm = false, this.hm = () => {
      this.rm || this.qv.Qt().mr();
    }, this.lm = () => {
      this.rm || this.qv.Qt().mr();
    }, this.qv = i8, this.xu = n6, this.yn = i8.N().layout, this.Hv = document.createElement("tr"), this.Ew = document.createElement("td"), this.Ew.style.padding = "0", this.Aw = document.createElement("td"), this.Aw.style.padding = "0", this.lv = document.createElement("td"), this.lv.style.height = "25px", this.lv.style.padding = "0", this.Lw = document.createElement("div"), this.Lw.style.width = "100%", this.Lw.style.height = "100%", this.Lw.style.position = "relative", this.Lw.style.overflow = "hidden", this.lv.appendChild(this.Lw), this.fm = Dn(this.Lw, size3({ width: 16, height: 16 })), this.fm.subscribeSuggestedBitmapSizeChanged(this.hm);
    const s4 = this.fm.canvasElement;
    s4.style.position = "absolute", s4.style.zIndex = "1", s4.style.left = "0", s4.style.top = "0", this.pm = Dn(this.Lw, size3({ width: 16, height: 16 })), this.pm.subscribeSuggestedBitmapSizeChanged(this.lm);
    const e11 = this.pm.canvasElement;
    e11.style.position = "absolute", e11.style.zIndex = "2", e11.style.left = "0", e11.style.top = "0", this.Hv.appendChild(this.Ew), this.Hv.appendChild(this.lv), this.Hv.appendChild(this.Aw), this.zw(), this.qv.Qt().L_().i(this.zw.bind(this), this), this.tv = new Mn(this.pm.canvasElement, this, { xp: () => true, Cp: () => !this.qv.N().handleScroll.horzTouchDrag });
  }
  m() {
    this.tv.m(), null !== this.Dw && this.Dw.m(), null !== this.Iw && this.Iw.m(), this.pm.unsubscribeSuggestedBitmapSizeChanged(this.lm), In(this.pm.canvasElement), this.pm.dispose(), this.fm.unsubscribeSuggestedBitmapSizeChanged(this.hm), In(this.fm.canvasElement), this.fm.dispose();
  }
  uv() {
    return this.Hv;
  }
  Ow() {
    return this.Dw;
  }
  Nw() {
    return this.Iw;
  }
  zp(t6) {
    if (this.Vw) return;
    this.Vw = true;
    const i8 = this.qv.Qt();
    !i8.Et().Gi() && this.qv.N().handleScale.axisPressedMouseMove.time && i8.zd(t6.localX);
  }
  Ap(t6) {
    this.zp(t6);
  }
  Op() {
    const t6 = this.qv.Qt();
    !t6.Et().Gi() && this.Vw && (this.Vw = false, this.qv.N().handleScale.axisPressedMouseMove.time && t6.$d());
  }
  Pp(t6) {
    const i8 = this.qv.Qt();
    !i8.Et().Gi() && this.qv.N().handleScale.axisPressedMouseMove.time && i8.Ud(t6.localX);
  }
  yp(t6) {
    this.Pp(t6);
  }
  Ip() {
    this.Vw = false;
    const t6 = this.qv.Qt();
    t6.Et().Gi() && !this.qv.N().handleScale.axisPressedMouseMove.time || t6.$d();
  }
  Rp() {
    this.Ip();
  }
  up() {
    this.qv.N().handleScale.axisDoubleClickReset.time && this.qv.Qt().ws();
  }
  ap() {
    this.up();
  }
  wp() {
    this.qv.Qt().N().handleScale.axisPressedMouseMove.time && this.Em(1);
  }
  Yp() {
    this.Em(0);
  }
  cv() {
    return this.Qv;
  }
  Fw() {
    return this.Bw;
  }
  Ww(i8, s4, e11) {
    equalSizes(this.Qv, i8) || (this.Qv = i8, this.rm = true, this.fm.resizeCanvasElement(i8), this.pm.resizeCanvasElement(i8), this.rm = false, this.lv.style.width = `${i8.width}px`, this.lv.style.height = `${i8.height}px`, this.Bw.p(i8)), null !== this.Dw && this.Dw.Cm(size3({ width: s4, height: i8.height })), null !== this.Iw && this.Iw.Cm(size3({ width: e11, height: i8.height }));
  }
  Hw() {
    const t6 = this.Uw();
    return Math.ceil(t6.S + t6.C + t6.k + t6.A + t6.I + t6.$w);
  }
  kt() {
    this.qv.Qt().Et().El();
  }
  dv() {
    return this.fm.bitmapSize;
  }
  fv(t6, i8, n6, s4) {
    const e11 = this.dv();
    if (e11.width > 0 && e11.height > 0 && (t6.drawImage(this.fm.canvasElement, i8, n6), s4)) {
      const s5 = this.pm.canvasElement;
      t6.drawImage(s5, i8, n6);
    }
  }
  km(t6) {
    if (0 === t6) return;
    const i8 = { colorSpace: this.yn.colorSpace };
    if (1 !== t6) {
      this.fm.applySuggestedBitmapSize();
      const n7 = tryCreateCanvasRenderingTarget2D(this.fm, i8);
      null !== n7 && (n7.useBitmapCoordinateSpace(((t7) => {
        this.Tm(t7), this.Rm(t7), this.jw(n7, Yn);
      })), this.Im(n7), this.jw(n7, jn)), null !== this.Dw && this.Dw.km(t6), null !== this.Iw && this.Iw.km(t6);
    }
    this.pm.applySuggestedBitmapSize();
    const n6 = tryCreateCanvasRenderingTarget2D(this.pm, i8);
    null !== n6 && (n6.useBitmapCoordinateSpace((({ context: t7, bitmapSize: i9 }) => {
      t7.clearRect(0, 0, i9.width, i9.height);
    })), this.qw([...this.qv.Qt().Jn(), this.qv.Qt().Rd()], n6), this.jw(n6, qn));
  }
  jw(t6, i8) {
    const n6 = this.qv.Qt().Jn();
    for (const s4 of n6) En(i8, ((i9) => Vn(i9, t6, false, void 0)), s4, void 0);
    for (const s4 of n6) En(i8, ((i9) => Bn(i9, t6, false, void 0)), s4, void 0);
  }
  Tm({ context: t6, bitmapSize: i8 }) {
    z2(t6, 0, 0, i8.width, i8.height, this.qv.Qt().ef());
  }
  Rm({ context: t6, bitmapSize: i8, verticalPixelRatio: n6 }) {
    if (this.qv.N().timeScale.borderVisible) {
      t6.fillStyle = this.Yw();
      const s4 = Math.max(1, Math.floor(this.Uw().S * n6));
      t6.fillRect(0, 0, i8.width, s4);
    }
  }
  Im(t6) {
    const i8 = this.qv.Qt().Et(), n6 = i8.El();
    if (!n6 || 0 === n6.length) return;
    const s4 = this.xu.maxTickMarkWeight(n6), e11 = this.Uw(), r8 = i8.N();
    r8.borderVisible && r8.ticksVisible && t6.useBitmapCoordinateSpace((({ context: t7, horizontalPixelRatio: i9, verticalPixelRatio: s5 }) => {
      t7.strokeStyle = this.Yw(), t7.fillStyle = this.Yw();
      const r9 = Math.max(1, Math.floor(i9)), h4 = Math.floor(0.5 * i9);
      t7.beginPath();
      const a5 = Math.round(e11.C * s5);
      for (let s6 = n6.length; s6--; ) {
        const e12 = Math.round(n6[s6].coord * i9);
        t7.rect(e12 - h4, 0, r9, a5);
      }
      t7.fill();
    })), t6.useMediaCoordinateSpace((({ context: t7 }) => {
      const i9 = e11.S + e11.C + e11.A + e11.k / 2;
      t7.textAlign = "center", t7.textBaseline = "middle", t7.fillStyle = this.H(), t7.font = this.Sm();
      for (const e12 of n6) if (e12.weight < s4) {
        const n7 = e12.needAlignCoordinate ? this.Kw(t7, e12.coord, e12.label) : e12.coord;
        t7.fillText(e12.label, n7, i9);
      }
      this.qv.N().timeScale.allowBoldLabels && (t7.font = this.Zw());
      for (const e12 of n6) if (e12.weight >= s4) {
        const n7 = e12.needAlignCoordinate ? this.Kw(t7, e12.coord, e12.label) : e12.coord;
        t7.fillText(e12.label, n7, i9);
      }
    }));
  }
  Kw(t6, i8, n6) {
    const s4 = this.im.Ii(t6, n6), e11 = s4 / 2, r8 = Math.floor(i8 - e11) + 0.5;
    return r8 < 0 ? i8 += Math.abs(0 - r8) : r8 + s4 > this.Qv.width && (i8 -= Math.abs(this.Qv.width - (r8 + s4))), i8;
  }
  qw(t6, i8) {
    const n6 = this.Uw();
    for (const s4 of t6) for (const t7 of s4.dn()) t7.Tt().st(i8, n6);
  }
  Yw() {
    return this.qv.N().timeScale.borderColor;
  }
  H() {
    return this.yn.textColor;
  }
  F() {
    return this.yn.fontSize;
  }
  Sm() {
    return x2(this.F(), this.yn.fontFamily);
  }
  Zw() {
    return x2(this.F(), this.yn.fontFamily, "bold");
  }
  Uw() {
    null === this.M && (this.M = { S: 1, L: NaN, A: NaN, I: NaN, tn: NaN, C: 5, k: NaN, P: "", Qi: new rt(), $w: 0 });
    const t6 = this.M, i8 = this.Sm();
    if (t6.P !== i8) {
      const n6 = this.F();
      t6.k = n6, t6.P = i8, t6.A = 3 * n6 / 12, t6.I = 3 * n6 / 12, t6.tn = 9 * n6 / 12, t6.L = 0, t6.$w = 4 * n6 / 12, t6.Qi.Os();
    }
    return this.M;
  }
  Em(t6) {
    this.lv.style.cursor = 1 === t6 ? "ew-resize" : "default";
  }
  zw() {
    const t6 = this.qv.Qt(), i8 = t6.N();
    i8.leftPriceScale.visible || null === this.Dw || (this.Ew.removeChild(this.Dw.uv()), this.Dw.m(), this.Dw = null), i8.rightPriceScale.visible || null === this.Iw || (this.Aw.removeChild(this.Iw.uv()), this.Iw.m(), this.Iw = null);
    const n6 = { Zd: this.qv.Qt().Zd() }, s4 = () => i8.leftPriceScale.borderVisible && t6.Et().N().borderVisible, e11 = () => t6.ef();
    i8.leftPriceScale.visible && null === this.Dw && (this.Dw = new Un("left", i8, n6, s4, e11), this.Ew.appendChild(this.Dw.uv())), i8.rightPriceScale.visible && null === this.Iw && (this.Iw = new Un("right", i8, n6, s4, e11), this.Aw.appendChild(this.Iw.uv()));
  }
};
var Zn = !!dn && !!navigator.userAgentData && navigator.userAgentData.brands.some(((t6) => t6.brand.includes("Chromium"))) && !!dn && (navigator?.userAgentData?.platform ? "Windows" === navigator.userAgentData.platform : navigator.userAgent.toLowerCase().indexOf("win") >= 0);
var Gn = class {
  constructor(t6, i8, n6) {
    var s4;
    this.Gw = [], this.Xw = [], this.Jw = 0, this.ho = 0, this.C_ = 0, this.Qw = 0, this.tM = 0, this.iM = null, this.nM = false, this.Wm = new d3(), this.Hm = new d3(), this.pd = new d3(), this.sM = null, this.eM = null, this.jv = t6, this.yn = i8, this.xu = n6, this.Hv = document.createElement("div"), this.Hv.classList.add("tv-lightweight-charts"), this.Hv.style.overflow = "hidden", this.Hv.style.direction = "ltr", this.Hv.style.width = "100%", this.Hv.style.height = "100%", (s4 = this.Hv).style.userSelect = "none", s4.style.webkitUserSelect = "none", s4.style.msUserSelect = "none", s4.style.MozUserSelect = "none", s4.style.webkitTapHighlightColor = "transparent", this.rM = document.createElement("table"), this.rM.setAttribute("cellspacing", "0"), this.Hv.appendChild(this.rM), this.hM = this.aM.bind(this), Xn(this.yn) && this.lM(true), this.sn = new qi(this.md.bind(this), this.yn, n6), this.Qt().Dd().i(this.oM.bind(this), this), this._M = new Kn(this, this.xu), this.rM.appendChild(this._M.uv());
    const e11 = i8.autoSize && this.uM();
    let r8 = this.yn.width, h4 = this.yn.height;
    if (e11 || 0 === r8 || 0 === h4) {
      const i9 = t6.getBoundingClientRect();
      r8 = r8 || i9.width, h4 = h4 || i9.height;
    }
    this.cM(r8, h4), this.dM(), t6.appendChild(this.Hv), this.fM(), this.sn.Et().Zc().i(this.sn.Pa.bind(this.sn), this), this.sn.L_().i(this.sn.Pa.bind(this.sn), this);
  }
  Qt() {
    return this.sn;
  }
  N() {
    return this.yn;
  }
  rv() {
    return this.Gw;
  }
  pM() {
    return this._M;
  }
  m() {
    this.lM(false), 0 !== this.Jw && window.cancelAnimationFrame(this.Jw), this.sn.Dd().u(this), this.sn.Et().Zc().u(this), this.sn.L_().u(this), this.sn.m();
    for (const t6 of this.Gw) this.rM.removeChild(t6.uv()), t6.dw().u(this), t6.fw().u(this), t6.m();
    this.Gw = [];
    for (const t6 of this.Xw) this.vM(t6);
    this.Xw = [], u4(this._M).m(), null !== this.Hv.parentElement && this.Hv.parentElement.removeChild(this.Hv), this.pd.m(), this.Wm.m(), this.Hm.m(), this.mM();
  }
  cM(i8, n6, s4 = false) {
    if (this.ho === n6 && this.C_ === i8) return;
    const e11 = (function(i9) {
      const n7 = Math.floor(i9.width), s5 = Math.floor(i9.height);
      return size3({ width: n7 - n7 % 2, height: s5 - s5 % 2 });
    })(size3({ width: i8, height: n6 }));
    this.ho = e11.height, this.C_ = e11.width;
    const r8 = this.ho + "px", h4 = this.C_ + "px";
    if (this.wM() || (u4(this.Hv).style.height = r8, u4(this.Hv).style.width = h4), this.rM.style.height = r8, this.rM.style.width = h4, s4) {
      0 !== this.Jw && (window.cancelAnimationFrame(this.Jw), this.Jw = 0), this.nM = false;
      const t6 = X.ys();
      null !== this.iM && (t6.Ss(this.iM), this.iM = null), this.MM(t6, performance.now());
    } else this.sn.Pa();
  }
  km(t6) {
    void 0 === t6 && (t6 = X.ys());
    for (let i8 = 0; i8 < this.Gw.length; i8++) this.Gw[i8].km(t6._s(i8).rs);
    this.yn.timeScale.visible && this._M.km(t6.ls());
  }
  vr(t6) {
    const i8 = Xn(this.yn);
    this.sn.vr(t6);
    const n6 = Xn(this.yn);
    n6 !== i8 && this.lM(n6), t6.layout?.panes && this.gM(), this.fM(), this.bM(t6);
  }
  dw() {
    return this.Wm;
  }
  fw() {
    return this.Hm;
  }
  Dd() {
    return this.pd;
  }
  SM(t6 = false) {
    null !== this.iM && (this.MM(this.iM, performance.now()), this.iM = null);
    const i8 = this.xM(null), n6 = document.createElement("canvas");
    n6.width = i8.width, n6.height = i8.height;
    const s4 = u4(n6.getContext("2d"));
    return this.xM(s4, t6), n6;
  }
  CM(t6) {
    if ("left" === t6 && !this.yM()) return 0;
    if ("right" === t6 && !this.kM()) return 0;
    if (0 === this.Gw.length) return 0;
    return u4("left" === t6 ? this.Gw[0].Sw() : this.Gw[0].xw()).ym();
  }
  wM() {
    return this.yn.autoSize && null !== this.sM;
  }
  vv() {
    return this.Hv;
  }
  PM(t6) {
    this.eM = t6, this.eM ? this.vv().style.setProperty("cursor", t6) : this.vv().style.removeProperty("cursor");
  }
  TM() {
    return this.eM;
  }
  RM(t6) {
    return _2(this.Gw[t6]).cv();
  }
  gM() {
    this.Xw.forEach(((t6) => {
      t6.kt();
    }));
  }
  bM(t6) {
    (void 0 !== t6.autoSize || !this.sM || void 0 === t6.width && void 0 === t6.height) && (t6.autoSize && !this.sM && this.uM(), false === t6.autoSize && null !== this.sM && this.mM(), t6.autoSize || void 0 === t6.width && void 0 === t6.height || this.cM(t6.width || this.C_, t6.height || this.ho));
  }
  xM(i8, n6) {
    let s4 = 0, e11 = 0;
    const r8 = this.Gw[0], h4 = (t6, s5) => {
      let e12 = 0;
      for (let r9 = 0; r9 < this.Gw.length; r9++) {
        const h5 = this.Gw[r9], a6 = u4("left" === t6 ? h5.Sw() : h5.xw()), l6 = a6.dv();
        if (null !== i8 && a6.fv(i8, s5, e12, n6), e12 += l6.height, r9 < this.Gw.length - 1) {
          const t7 = this.Xw[r9], n7 = t7.dv();
          null !== i8 && t7.fv(i8, s5, e12), e12 += n7.height;
        }
      }
    };
    if (this.yM()) {
      h4("left", 0);
      s4 += u4(r8.Sw()).dv().width;
    }
    for (let t6 = 0; t6 < this.Gw.length; t6++) {
      const r9 = this.Gw[t6], h5 = r9.dv();
      if (null !== i8 && r9.fv(i8, s4, e11, n6), e11 += h5.height, t6 < this.Gw.length - 1) {
        const n7 = this.Xw[t6], r10 = n7.dv();
        null !== i8 && n7.fv(i8, s4, e11), e11 += r10.height;
      }
    }
    if (s4 += r8.dv().width, this.kM()) {
      h4("right", s4);
      s4 += u4(r8.xw()).dv().width;
    }
    const a5 = (t6, n7, s5) => {
      u4("left" === t6 ? this._M.Ow() : this._M.Nw()).fv(u4(i8), n7, s5);
    };
    if (this.yn.timeScale.visible) {
      const t6 = this._M.dv();
      if (null !== i8) {
        let s5 = 0;
        this.yM() && (a5("left", s5, e11), s5 = u4(r8.Sw()).dv().width), this._M.fv(i8, s5, e11, n6), s5 += t6.width, this.kM() && a5("right", s5, e11);
      }
      e11 += t6.height;
    }
    return size3({ width: s4, height: e11 });
  }
  DM() {
    let i8 = 0, n6 = 0, s4 = 0;
    for (const t6 of this.Gw) this.yM() && (n6 = Math.max(n6, u4(t6.Sw()).bm(), this.yn.leftPriceScale.minimumWidth)), this.kM() && (s4 = Math.max(s4, u4(t6.xw()).bm(), this.yn.rightPriceScale.minimumWidth)), i8 += t6.z_();
    n6 = mn(n6), s4 = mn(s4);
    const e11 = this.C_, r8 = this.ho, h4 = Math.max(e11 - n6 - s4, 0), a5 = 1 * this.Xw.length, l6 = this.yn.timeScale.visible;
    let o11 = l6 ? Math.max(this._M.Hw(), this.yn.timeScale.minimumHeight) : 0;
    var _3;
    o11 = (_3 = o11) + _3 % 2;
    const c6 = a5 + o11, d4 = r8 < c6 ? 0 : r8 - c6, f4 = d4 / i8;
    let p4 = 0;
    const v3 = window.devicePixelRatio || 1;
    for (let i9 = 0; i9 < this.Gw.length; ++i9) {
      const e12 = this.Gw[i9];
      e12.iw(this.sn.Zn()[i9]);
      let r9 = 0, a6 = 0;
      a6 = i9 === this.Gw.length - 1 ? Math.ceil((d4 - p4) * v3) / v3 : Math.round(e12.z_() * f4 * v3) / v3, r9 = Math.max(a6, 2), p4 += r9, e12.Cm(size3({ width: h4, height: r9 })), this.yM() && e12.mw(n6, "left"), this.kM() && e12.mw(s4, "right"), e12.Sv() && this.sn.Id(e12.Sv(), r9);
    }
    this._M.Ww(size3({ width: l6 ? h4 : 0, height: o11 }), l6 ? n6 : 0, l6 ? s4 : 0), this.sn.N_(h4), this.Qw !== n6 && (this.Qw = n6), this.tM !== s4 && (this.tM = s4);
  }
  lM(t6) {
    t6 ? this.Hv.addEventListener("wheel", this.hM, { passive: false }) : this.Hv.removeEventListener("wheel", this.hM);
  }
  IM(t6) {
    switch (t6.deltaMode) {
      case t6.DOM_DELTA_PAGE:
        return 120;
      case t6.DOM_DELTA_LINE:
        return 32;
    }
    return Zn ? 1 / window.devicePixelRatio : 1;
  }
  aM(t6) {
    if (!(0 !== t6.deltaX && this.yn.handleScroll.mouseWheel || 0 !== t6.deltaY && this.yn.handleScale.mouseWheel)) return;
    const i8 = this.IM(t6), n6 = i8 * t6.deltaX / 100, s4 = -i8 * t6.deltaY / 100;
    if (t6.cancelable && t6.preventDefault(), 0 !== s4 && this.yn.handleScale.mouseWheel) {
      const i9 = Math.sign(s4) * Math.min(1, Math.abs(s4)), n7 = t6.clientX - this.Hv.getBoundingClientRect().left;
      this.Qt().Od(n7, i9);
    }
    0 !== n6 && this.yn.handleScroll.mouseWheel && this.Qt().Nd(-80 * n6);
  }
  MM(t6, i8) {
    const n6 = t6.ls();
    3 === n6 && this.VM(), 3 !== n6 && 2 !== n6 || (this.BM(t6), this.EM(t6, i8), this._M.kt(), this.Gw.forEach(((t7) => {
      t7.sw();
    })), 3 === this.iM?.ls() && (this.iM.Ss(t6), this.VM(), this.BM(this.iM), this.EM(this.iM, i8), t6 = this.iM, this.iM = null)), this.km(t6);
  }
  EM(t6, i8) {
    for (const n6 of t6.bs()) this.xs(n6, i8);
  }
  BM(t6) {
    const i8 = this.sn.Zn();
    for (let n6 = 0; n6 < i8.length; n6++) t6._s(n6).hs && i8[n6].ru();
  }
  xs(t6, i8) {
    const n6 = this.sn.Et();
    switch (t6.ds) {
      case 0:
        n6.Xc();
        break;
      case 1:
        n6.Jc(t6.Wt);
        break;
      case 2:
        n6.Ms(t6.Wt);
        break;
      case 3:
        n6.gs(t6.Wt);
        break;
      case 4:
        n6.Oc();
        break;
      case 5:
        t6.Wt.jc(i8) || n6.gs(t6.Wt.qc(i8));
    }
  }
  md(t6) {
    null !== this.iM ? this.iM.Ss(t6) : this.iM = t6, this.nM || (this.nM = true, this.Jw = window.requestAnimationFrame(((t7) => {
      if (this.nM = false, this.Jw = 0, null !== this.iM) {
        const i8 = this.iM;
        this.iM = null, this.MM(i8, t7);
        for (const n6 of i8.bs()) if (5 === n6.ds && !n6.Wt.jc(t7)) {
          this.Qt().ps(n6.Wt);
          break;
        }
      }
    })));
  }
  VM() {
    this.dM();
  }
  vM(t6) {
    this.rM.removeChild(t6.uv()), t6.m();
  }
  dM() {
    const t6 = this.sn.Zn(), i8 = t6.length, n6 = this.Gw.length;
    for (let t7 = i8; t7 < n6; t7++) {
      const t8 = _2(this.Gw.pop());
      this.rM.removeChild(t8.uv()), t8.dw().u(this), t8.fw().u(this), t8.m();
      const i9 = this.Xw.pop();
      void 0 !== i9 && this.vM(i9);
    }
    for (let s4 = n6; s4 < i8; s4++) {
      const i9 = new Hn(this, t6[s4]);
      if (i9.dw().i(this.AM.bind(this, i9), this), i9.fw().i(this.LM.bind(this, i9), this), this.Gw.push(i9), s4 > 0) {
        const t7 = new yn(this, s4 - 1, s4);
        this.Xw.push(t7), this.rM.insertBefore(t7.uv(), this._M.uv());
      }
      this.rM.insertBefore(i9.uv(), this._M.uv());
    }
    for (let n7 = 0; n7 < i8; n7++) {
      const i9 = t6[n7], s4 = this.Gw[n7];
      s4.Sv() !== i9 ? s4.iw(i9) : s4.tw();
    }
    this.fM(), this.DM();
  }
  zM(t6, i8, n6, s4) {
    const e11 = /* @__PURE__ */ new Map();
    if (null !== t6) {
      this.sn.Jn().forEach(((i9) => {
        const n7 = i9.Un().Hn(t6);
        null !== n7 && e11.set(i9, n7);
      }));
    }
    let r8;
    if (null !== t6) {
      const i9 = this.sn.Et().en(t6)?.originalTime;
      void 0 !== i9 && (r8 = i9);
    }
    const h4 = this.Qt().ou(), a5 = this.OM(s4), l6 = (function(t7, i9) {
      const n7 = null !== t7 && t7.lu instanceof Jt ? t7.lu : void 0, s5 = t7?.wu?.te, e12 = void 0 !== i9 && -1 !== i9 ? i9 : void 0;
      return null === t7 || void 0 === t7.ee ? { NM: n7, FM: s5 } : { NM: n7, FM: s5, WM: { ds: t7.ee, HM: (r9 = t7.lu, h5 = t7.ee, r9 instanceof ki ? "pane-primitive" : "marker" === h5 || "primitive" === h5 ? "series-primitive" : "series"), UM: vn(t7.ee, s5), U_: n7, $M: s5, jM: e12 } };
      var r9, h5;
    })(h4, a5);
    return { Qr: r8, $n: t6 ?? void 0, qM: i8 ?? void 0, jM: -1 !== a5 ? a5 : void 0, NM: l6.NM, YM: e11, FM: l6.FM, WM: l6.WM, KM: n6 ?? void 0 };
  }
  OM(t6) {
    let i8 = -1;
    if (t6) i8 = this.Gw.indexOf(t6);
    else {
      const t7 = this.Qt().Rd().Kn();
      null !== t7 && (i8 = this.Qt().Zn().indexOf(t7));
    }
    return i8;
  }
  AM(t6, i8, n6, s4) {
    this.Wm.p((() => this.zM(i8, n6, s4, t6)));
  }
  LM(t6, i8, n6, s4) {
    this.Hm.p((() => this.zM(i8, n6, s4, t6)));
  }
  oM(t6, i8, n6) {
    this.PM(this.Qt().ou()?.mu ?? null), this.pd.p((() => this.zM(t6, i8, n6)));
  }
  fM() {
    const t6 = this.yn.timeScale.visible ? "" : "none";
    this._M.uv().style.display = t6;
  }
  yM() {
    return this.Gw[0].Sv().K_().N().visible;
  }
  kM() {
    return this.Gw[0].Sv().Z_().N().visible;
  }
  uM() {
    return "ResizeObserver" in window && (this.sM = new ResizeObserver(((t6) => {
      const i8 = t6[t6.length - 1];
      if (!i8) return;
      const n6 = i8.contentRect.width, s4 = i8.contentRect.height;
      this.cM(n6, s4, true);
    })), this.sM.observe(this.jv, { box: "border-box" }), true);
  }
  mM() {
    null !== this.sM && this.sM.disconnect(), this.sM = null;
  }
};
function Xn(t6) {
  return Boolean(t6.handleScroll.mouseWheel || t6.handleScale.mouseWheel);
}
function Jn(t6) {
  return void 0 === t6.open && void 0 === t6.value;
}
function Qn(t6) {
  return (function(t7) {
    return void 0 !== t7.open;
  })(t6) || (function(t7) {
    return void 0 !== t7.value;
  })(t6);
}
function ts(t6, i8, n6, s4) {
  const e11 = n6.value, r8 = { $n: i8, wt: t6, Wt: [e11, e11, e11, e11], Qr: s4 };
  return void 0 !== n6.color && (r8.R = n6.color), r8;
}
function is(t6, i8, n6, s4) {
  const e11 = n6.value, r8 = { $n: i8, wt: t6, Wt: [e11, e11, e11, e11], Qr: s4 };
  return void 0 !== n6.lineColor && (r8.vt = n6.lineColor), void 0 !== n6.topColor && (r8.ah = n6.topColor), void 0 !== n6.bottomColor && (r8.oh = n6.bottomColor), r8;
}
function ns(t6, i8, n6, s4) {
  const e11 = n6.value, r8 = { $n: i8, wt: t6, Wt: [e11, e11, e11, e11], Qr: s4 };
  return void 0 !== n6.topLineColor && (r8._h = n6.topLineColor), void 0 !== n6.bottomLineColor && (r8.uh = n6.bottomLineColor), void 0 !== n6.topFillColor1 && (r8.dh = n6.topFillColor1), void 0 !== n6.topFillColor2 && (r8.fh = n6.topFillColor2), void 0 !== n6.bottomFillColor1 && (r8.ph = n6.bottomFillColor1), void 0 !== n6.bottomFillColor2 && (r8.mh = n6.bottomFillColor2), r8;
}
function ss(t6, i8, n6, s4) {
  const e11 = { $n: i8, wt: t6, Wt: [n6.open, n6.high, n6.low, n6.close], Qr: s4 };
  return void 0 !== n6.color && (e11.R = n6.color), e11;
}
function es(t6, i8, n6, s4) {
  const e11 = { $n: i8, wt: t6, Wt: [n6.open, n6.high, n6.low, n6.close], Qr: s4 };
  return void 0 !== n6.color && (e11.R = n6.color), void 0 !== n6.borderColor && (e11.Ht = n6.borderColor), void 0 !== n6.wickColor && (e11.hh = n6.wickColor), e11;
}
function rs(t6, i8, n6, s4, e11) {
  const r8 = _2(e11)(n6), h4 = Math.max(...r8), a5 = Math.min(...r8), l6 = r8[r8.length - 1], o11 = [l6, h4, a5, l6], { time: u5, color: c6, ...d4 } = n6;
  return { $n: i8, wt: t6, Wt: o11, Qr: s4, ue: d4, R: c6 };
}
function hs(t6) {
  return void 0 !== t6.Wt;
}
function as(t6, i8) {
  return void 0 !== i8.customValues && (t6.ZM = i8.customValues), t6;
}
function ls(t6) {
  return (i8, n6, s4, e11, r8, h4) => (function(t7, i9) {
    return i9 ? i9(t7) : Jn(t7);
  })(s4, h4) ? as({ wt: i8, $n: n6, Qr: e11 }, s4) : as(t6(i8, n6, s4, e11, r8), s4);
}
function os(t6) {
  return { Candlestick: ls(es), Bar: ls(ss), Area: ls(is), Baseline: ls(ns), Histogram: ls(ts), Line: ls(ts), Custom: ls(rs) }[t6];
}
function _s(t6) {
  return { $n: 0, GM: /* @__PURE__ */ new Map(), za: t6 };
}
function us(t6, i8) {
  if (void 0 !== t6 && 0 !== t6.length) return { XM: i8.key(t6[0].wt), JM: i8.key(t6[t6.length - 1].wt) };
}
function cs(t6) {
  let i8;
  return t6.forEach(((t7) => {
    void 0 === i8 && (i8 = t7.Qr);
  })), _2(i8);
}
var ds = class {
  constructor(t6) {
    this.QM = /* @__PURE__ */ new Map(), this.tg = /* @__PURE__ */ new Map(), this.ig = /* @__PURE__ */ new Map(), this.ng = [], this.xu = t6;
  }
  m() {
    this.QM.clear(), this.tg.clear(), this.ig.clear(), this.ng = [];
  }
  sg(t6, i8) {
    let n6 = 0 !== this.QM.size, s4 = false;
    const e11 = this.tg.get(t6);
    if (void 0 !== e11) if (1 === this.tg.size) n6 = false, s4 = true, this.QM.clear();
    else for (const i9 of this.ng) i9.pointData.GM.delete(t6) && (s4 = true);
    let r8 = [];
    if (0 !== i8.length) {
      const n7 = i8.map(((t7) => t7.time)), e12 = this.xu.createConverterToInternalObj(i8), h5 = os(t6.bh()), a5 = t6.ll(), l6 = t6.ol();
      r8 = i8.map(((i9, r9) => {
        const o11 = e12(i9.time), _3 = this.xu.key(o11);
        let u5 = this.QM.get(_3);
        void 0 === u5 && (u5 = _s(o11), this.QM.set(_3, u5), s4 = true);
        const c6 = h5(o11, u5.$n, i9, n7[r9], a5, l6);
        return u5.GM.set(t6, c6), c6;
      }));
    }
    n6 && this.eg(), this.rg(t6, r8);
    let h4 = -1;
    if (s4) {
      const t7 = [];
      this.QM.forEach(((i9) => {
        t7.push({ timeWeight: 0, time: i9.za, pointData: i9, originalTime: cs(i9.GM) });
      })), t7.sort(((t8, i9) => this.xu.key(t8.time) - this.xu.key(i9.time))), h4 = this.hg(t7);
    }
    return this.ag(t6, h4, (function(t7, i9, n7) {
      const s5 = us(t7, n7), e12 = us(i9, n7);
      if (void 0 !== s5 && void 0 !== e12) return { lg: false, Ia: s5.JM >= e12.JM && s5.XM >= e12.XM };
    })(this.tg.get(t6), e11, this.xu));
  }
  Jd(t6) {
    return this.sg(t6, []);
  }
  og(t6, i8, n6) {
    if (n6 && t6.Na()) throw new Error("Historical updates are not supported when conflation is enabled. Conflation requires data to be processed in order.");
    const s4 = i8;
    !(function(t7) {
      void 0 === t7.Qr && (t7.Qr = t7.time);
    })(s4), this.xu.preprocessData(i8);
    const e11 = this.xu.createConverterToInternalObj([i8])(i8.time), r8 = this.ig.get(t6);
    if (!n6 && void 0 !== r8 && this.xu.key(e11) < this.xu.key(r8)) throw new Error(`Cannot update oldest data, last time=${r8}, new time=${e11}`);
    let h4 = this.QM.get(this.xu.key(e11));
    if (n6 && void 0 === h4) throw new Error("Cannot update non-existing data point when historicalUpdate is true");
    const a5 = void 0 === h4;
    void 0 === h4 && (h4 = _s(e11), this.QM.set(this.xu.key(e11), h4));
    const l6 = os(t6.bh()), o11 = t6.ll(), _3 = t6.ol(), u5 = l6(e11, h4.$n, i8, s4.Qr, o11, _3), c6 = !n6 && !a5 && void 0 !== r8 && this.xu.key(e11) === this.xu.key(r8);
    h4.GM.set(t6, u5), n6 ? this._g(t6, u5, h4.$n) : c6 && t6.Na() && hs(u5) ? (t6.Rr(u5), this.ug(t6, u5)) : this.ug(t6, u5);
    const d4 = { Ia: hs(u5), lg: n6 };
    if (!a5) return this.ag(t6, -1, d4);
    const f4 = { timeWeight: 0, time: h4.za, pointData: h4, originalTime: cs(h4.GM) }, p4 = Rt(this.ng, this.xu.key(f4.time), ((t7, i9) => this.xu.key(t7.time) < i9));
    this.ng.splice(p4, 0, f4);
    for (let t7 = p4; t7 < this.ng.length; ++t7) fs(this.ng[t7].pointData, t7);
    return this.xu.fillWeightsForPoints(this.ng, p4), this.ag(t6, p4, d4);
  }
  cg(t6, i8) {
    const n6 = this.tg.get(t6);
    if (void 0 === n6 || i8 <= 0) return [[], this.dg()];
    i8 = Math.min(i8, n6.length);
    const s4 = n6.splice(-i8).reverse();
    0 === n6.length ? this.ig.delete(t6) : this.ig.set(t6, n6[n6.length - 1].wt);
    for (const i9 of s4) {
      const n7 = this.QM.get(this.xu.key(i9.wt));
      if (n7 && (n7.GM.delete(t6), 0 === n7.GM.size)) {
        this.QM.delete(this.xu.key(n7.za)), this.ng.splice(n7.$n, 1);
        for (let t7 = n7.$n; t7 < this.ng.length; ++t7) fs(this.ng[t7].pointData, t7);
      }
    }
    return [s4, this.ag(t6, this.ng.length - 1, { lg: false, Ia: false })];
  }
  ug(t6, i8) {
    let n6 = this.tg.get(t6);
    void 0 === n6 && (n6 = [], this.tg.set(t6, n6));
    const s4 = 0 !== n6.length ? n6[n6.length - 1] : null;
    null === s4 || this.xu.key(i8.wt) > this.xu.key(s4.wt) ? hs(i8) && n6.push(i8) : hs(i8) ? n6[n6.length - 1] = i8 : n6.splice(-1, 1), this.ig.set(t6, i8.wt);
  }
  _g(t6, i8, n6) {
    const s4 = this.tg.get(t6);
    if (void 0 === s4) return;
    const e11 = Rt(s4, n6, ((t7, i9) => t7.$n < i9));
    hs(i8) ? s4[e11] = i8 : s4.splice(e11, 1);
  }
  rg(t6, i8) {
    0 !== i8.length ? (this.tg.set(t6, i8.filter(hs)), this.ig.set(t6, i8[i8.length - 1].wt)) : (this.tg.delete(t6), this.ig.delete(t6));
  }
  eg() {
    for (const t6 of this.ng) 0 === t6.pointData.GM.size && this.QM.delete(this.xu.key(t6.time));
  }
  hg(t6) {
    let i8 = -1;
    for (let n6 = 0; n6 < this.ng.length && n6 < t6.length; ++n6) {
      const s4 = this.ng[n6], e11 = t6[n6];
      if (this.xu.key(s4.time) !== this.xu.key(e11.time)) {
        i8 = n6;
        break;
      }
      e11.timeWeight = s4.timeWeight, fs(e11.pointData, n6);
    }
    if (-1 === i8 && this.ng.length !== t6.length && (i8 = Math.min(this.ng.length, t6.length)), -1 === i8) return -1;
    for (let n6 = i8; n6 < t6.length; ++n6) fs(t6[n6].pointData, n6);
    return this.xu.fillWeightsForPoints(t6, i8), this.ng = t6, i8;
  }
  fg() {
    if (0 === this.tg.size) return null;
    let t6 = 0;
    return this.tg.forEach(((i8) => {
      0 !== i8.length && (t6 = Math.max(t6, i8[i8.length - 1].$n));
    })), t6;
  }
  ag(t6, i8, n6) {
    const s4 = this.dg();
    if (-1 !== i8) this.tg.forEach(((i9, e11) => {
      s4.U_.set(e11, { ue: i9, pg: e11 === t6 ? n6 : void 0 });
    })), this.tg.has(t6) || s4.U_.set(t6, { ue: [], pg: n6 }), s4.Et.vg = this.ng, s4.Et.mg = i8;
    else {
      const i9 = this.tg.get(t6);
      s4.U_.set(t6, { ue: i9 || [], pg: n6 });
    }
    return s4;
  }
  dg() {
    return { U_: /* @__PURE__ */ new Map(), Et: { Pc: this.fg() } };
  }
};
function fs(t6, i8) {
  t6.$n = i8, t6.GM.forEach(((t7) => {
    t7.$n = i8;
  }));
}
function ps(t6, i8) {
  return t6._t < i8;
}
function vs(t6, i8) {
  return i8 < t6._t;
}
function ms(t6, i8, n6, s4) {
  return Rt(t6, i8, ps, n6, s4);
}
function ws(t6, i8, n6, s4) {
  return Dt(t6, i8, vs, n6, s4);
}
function Ms(t6, i8, n6) {
  return { ne: t6, se: i8, ee: n6 };
}
function gs(t6, i8, n6, s4) {
  return t6 >= i8 - s4 && t6 <= n6 + s4;
}
function bs(t6, i8, n6, s4, e11, r8) {
  const h4 = e11 - n6, a5 = r8 - s4;
  if (0 === h4 && 0 === a5) return Math.hypot(t6 - n6, i8 - s4);
  const l6 = ((t6 - n6) * h4 + (i8 - s4) * a5) / (h4 * h4 + a5 * a5), o11 = Math.max(0, Math.min(1, l6)), _3 = n6 + h4 * o11, u5 = s4 + a5 * o11;
  return Math.hypot(t6 - _3, i8 - u5);
}
var Ss = [0, 0];
function xs(t6, i8, n6) {
  return void 0 === i8 || i8.wt !== t6.wt - 1 ? t6._t - n6 / 2 : (i8._t + t6._t) / 2;
}
function Cs(t6, i8, n6) {
  return void 0 === i8 || i8.wt !== t6.wt + 1 ? t6._t + n6 / 2 : (t6._t + i8._t) / 2;
}
function ys(t6, i8, n6, s4, e11, r8, h4) {
  if (null === i8 || i8.from >= i8.to || 0 === t6.length) return null;
  const a5 = e11 / 2 + r8, l6 = ms(t6, n6 - a5, i8.from, i8.to), o11 = ws(t6, n6 + a5, l6, i8.to);
  if (l6 >= o11) return null;
  let _3 = Number.POSITIVE_INFINITY;
  for (let a6 = l6; a6 < o11; a6++) {
    const l7 = t6[a6], o12 = a6 > i8.from ? t6[a6 - 1] : void 0, u5 = a6 < i8.to - 1 ? t6[a6 + 1] : void 0, c6 = xs(l7, o12, e11) - r8, d4 = Cs(l7, u5, e11) + r8;
    if (n6 < c6 || n6 > d4) continue;
    h4(l7, Ss);
    const f4 = Ss[0], p4 = Ss[1], v3 = Math.min(f4, p4), m3 = Math.max(f4, p4), w3 = v3 - r8, M3 = m3 + r8;
    if (s4 >= v3 && s4 <= m3) _3 = Math.min(_3, 0);
    else if (s4 >= w3 && s4 <= M3) {
      const t7 = Math.min(Math.abs(s4 - v3), Math.abs(m3 - s4));
      _3 = Math.min(_3, t7);
    }
  }
  return Number.isFinite(_3) ? Ms(_3, 0, "series-range") : null;
}
function ks(t6, i8) {
  return t6.wt < i8;
}
function Ps(t6, i8) {
  return i8 < t6.wt;
}
function Ts(t6, i8, n6) {
  const s4 = i8.Oa(), e11 = i8.bi(), r8 = Rt(t6, s4, ks), h4 = Dt(t6, e11, Ps);
  if (!n6) return { from: r8, to: h4 };
  let a5 = r8, l6 = h4;
  return r8 > 0 && r8 < t6.length && t6[r8].wt >= s4 && (a5 = r8 - 1), h4 > 0 && h4 < t6.length && t6[h4 - 1].wt <= e11 && (l6 = h4 + 1), { from: a5, to: l6 };
}
var Rs = class {
  constructor(t6, i8, n6) {
    this.wg = true, this.Mg = true, this.gg = true, this.bg = [], this.Sg = null, this.xg = -1, this.ae = t6, this.le = i8, this.Cg = n6;
  }
  kt(t6) {
    this.wg = true, "data" === t6 && (this.Mg = true), "options" === t6 && (this.gg = true);
  }
  Tt() {
    return this.ae.It() ? (this.yg(), null === this.Sg ? null : this.kg) : null;
  }
  Qs(t6, i8) {
    return this.ae.It() ? (this.yg(), null === this.Sg ? null : this.Pg(t6, i8)) : null;
  }
  Pg(t6, i8) {
    return null;
  }
  Tg() {
    this.bg = this.bg.map(((t6) => ({ ...t6, ...this.ae.Sa().Sh(t6.wt) })));
  }
  Rg() {
    this.Sg = null;
  }
  yg() {
    const t6 = this.le.Et(), i8 = t6.N().enableConflation ? t6.Qc() : 0;
    i8 !== this.xg && (this.Mg = true, this.xg = i8), this.Mg && (this.Dg(), this.Mg = false), this.gg && (this.Tg(), this.gg = false), this.wg && (this.Ig(), this.wg = false);
  }
  Ig() {
    const t6 = this.ae.Ft(), i8 = this.le.Et();
    if (this.Rg(), i8.Gi() || t6.Gi()) return;
    const n6 = i8.Ee();
    if (null === n6) return;
    if (0 === this.ae.Un().Th()) return;
    const s4 = this.ae.Lt();
    null !== s4 && (this.Sg = Ts(this.bg, n6, this.Cg), this.Vg(t6, i8, s4.Wt), this.Bg());
  }
};
var Ds = class {
  constructor(t6, i8) {
    this.Eg = t6, this.Ki = i8;
  }
  st(t6, i8, n6) {
    this.Eg.draw(t6, this.Ki, i8, n6);
  }
};
function Is(t6) {
  switch (t6) {
    case "point":
      return 2;
    case "range":
      return 0;
    default:
      return 1;
  }
}
var Vs = class extends Rs {
  constructor(t6, i8, n6) {
    super(t6, i8, false), this.Yh = n6, this.Eg = this.Yh.renderer(), this.kg = new Ds(this.Eg, ((t7) => this.Ag(t7)));
  }
  get ga() {
    return this.Yh.conflationReducer;
  }
  Wa(t6) {
    return this.Yh.priceValueBuilder(t6);
  }
  _l(t6) {
    return this.Yh.isWhitespace(t6);
  }
  Pg(t6, i8) {
    const n6 = this.Eg.hitTest?.(t6, i8, ((t7) => this.Ag(t7)));
    if (null != n6) return { ne: (s4 = n6).distance, se: Is(s4.type), ee: "custom", mu: s4.cursorStyle, te: s4.objectId, ie: s4.hitTestData };
    var s4;
    const e11 = ys(this.bg, this.Sg, t6, i8, this.le.Et().fl(), this.ae.N().hitTestTolerance, ((t7, i9) => {
      const n7 = t7.Lg;
      let s5 = NaN, e12 = NaN;
      if (void 0 !== n7 && !this.Yh.isWhitespace(n7)) for (const t8 of this.Yh.priceValueBuilder(n7)) {
        const i10 = this.Ag(t8);
        null !== i10 && (s5 = Number.isNaN(s5) ? i10 : Math.min(s5, i10), e12 = Number.isNaN(e12) ? i10 : Math.max(e12, i10));
      }
      i9[0] = s5, i9[1] = e12;
    }));
    return null === e11 ? null : { ...e11, ee: "custom" };
  }
  Dg() {
    const t6 = this.ae.Sa();
    this.bg = this.ae.Ha().Bh().map(((i8) => ({ wt: i8.$n, _t: NaN, ...t6.Sh(i8.$n), Lg: i8.ue })));
  }
  Vg(t6, i8) {
    i8.Tc(this.bg, b3(this.Sg));
  }
  Bg() {
    this.Yh.update({ bars: this.bg.map(Bs), barSpacing: this.le.Et().fl(), visibleRange: this.Sg, conflationFactor: this.le.Et().Qc() }, this.ae.N());
  }
  Ag(t6) {
    const i8 = this.ae.Lt();
    return null === i8 ? null : this.ae.Ft().Nt(t6, i8.Wt);
  }
};
function Bs(t6) {
  return { x: t6._t, time: t6.wt, originalData: t6.Lg, barColor: t6.sh };
}
var Es = { color: "#2196f3" };
var As = (t6, i8, n6) => {
  const s4 = c5(n6);
  return new Vs(t6, i8, s4);
};
function Ls(t6) {
  const i8 = { value: t6.Wt[3], time: t6.Qr };
  return void 0 !== t6.ZM && (i8.customValues = t6.ZM), i8;
}
function zs(t6) {
  const i8 = Ls(t6);
  return void 0 !== t6.R && (i8.color = t6.R), i8;
}
function Os(t6) {
  const i8 = Ls(t6);
  return void 0 !== t6.vt && (i8.lineColor = t6.vt), void 0 !== t6.ah && (i8.topColor = t6.ah), void 0 !== t6.oh && (i8.bottomColor = t6.oh), i8;
}
function Ns(t6) {
  const i8 = Ls(t6);
  return void 0 !== t6._h && (i8.topLineColor = t6._h), void 0 !== t6.uh && (i8.bottomLineColor = t6.uh), void 0 !== t6.dh && (i8.topFillColor1 = t6.dh), void 0 !== t6.fh && (i8.topFillColor2 = t6.fh), void 0 !== t6.ph && (i8.bottomFillColor1 = t6.ph), void 0 !== t6.mh && (i8.bottomFillColor2 = t6.mh), i8;
}
function Fs(t6) {
  const i8 = { open: t6.Wt[0], high: t6.Wt[1], low: t6.Wt[2], close: t6.Wt[3], time: t6.Qr };
  return void 0 !== t6.ZM && (i8.customValues = t6.ZM), i8;
}
function Ws(t6) {
  const i8 = Fs(t6);
  return void 0 !== t6.R && (i8.color = t6.R), i8;
}
function Hs(t6) {
  const i8 = Fs(t6), { R: n6, Ht: s4, hh: e11 } = t6;
  return void 0 !== n6 && (i8.color = n6), void 0 !== s4 && (i8.borderColor = s4), void 0 !== e11 && (i8.wickColor = e11), i8;
}
function Us(t6) {
  return { Area: Os, Line: zs, Baseline: Ns, Histogram: zs, Bar: Ws, Candlestick: Hs, Custom: $s }[t6];
}
function $s(t6) {
  const i8 = t6.Qr;
  return { ...t6.ue, time: i8 };
}
var js = { vertLine: { color: "#9598A1", width: 1, style: 3, visible: true, labelVisible: true, labelBackgroundColor: "#131722" }, horzLine: { color: "#9598A1", width: 1, style: 3, visible: true, labelVisible: true, labelBackgroundColor: "#131722" }, mode: 1, doNotSnapToHiddenSeriesIndices: false };
var qs = { vertLines: { color: "#D6DCDE", style: 0, visible: true }, horzLines: { color: "#D6DCDE", style: 0, visible: true } };
var Ys = { background: { type: "solid", color: "#FFFFFF" }, textColor: "#191919", fontSize: 12, fontFamily: S3, panes: { enableResize: true, separatorColor: "#E0E3EB", separatorHoverColor: "rgba(178, 181, 189, 0.2)" }, attributionLogo: true, colorSpace: "srgb", colorParsers: [] };
var Ks = { autoScale: true, mode: 0, invertScale: false, alignLabels: true, borderVisible: true, borderColor: "#2B2B43", entireTextOnly: false, visible: false, ticksVisible: false, scaleMargins: { bottom: 0.1, top: 0.2 }, minimumWidth: 0, ensureEdgeTickMarksVisible: false, tickMarkDensity: 2.5 };
var Zs = { rightOffset: 0, barSpacing: 6, minBarSpacing: 0.5, maxBarSpacing: 0, fixLeftEdge: false, fixRightEdge: false, lockVisibleTimeRangeOnResize: false, rightBarStaysOnScroll: false, borderVisible: true, borderColor: "#2B2B43", visible: true, timeVisible: false, secondsVisible: true, shiftVisibleRangeOnNewBar: true, allowShiftVisibleRangeOnWhitespaceReplacement: false, ticksVisible: false, uniformDistribution: false, minimumHeight: 0, allowBoldLabels: true, ignoreWhitespaceIndices: false, enableConflation: false, conflationThresholdFactor: 1, precomputeConflationOnInit: false, precomputeConflationPriority: "background" };
function Gs() {
  return { addDefaultPane: true, hoveredSeriesOnTop: true, width: 0, height: 0, autoSize: false, layout: Ys, crosshair: js, grid: qs, overlayPriceScales: { ...Ks }, leftPriceScale: { ...Ks, visible: false }, rightPriceScale: { ...Ks, visible: true }, defaultVisiblePriceScaleId: "right", timeScale: Zs, localization: { locale: dn ? navigator.language : "", dateFormat: "dd MMM 'yy" }, handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: true }, handleScale: { axisPressedMouseMove: { time: true, price: true }, axisDoubleClickReset: { time: true, price: true }, mouseWheel: true, pinch: true }, kineticScroll: { mouse: false, touch: true }, trackingMode: { exitMode: 1 } };
}
var Xs = class {
  constructor(t6, i8, n6) {
    this.sv = t6, this.zg = i8, this.Og = n6 ?? 0;
  }
  applyOptions(t6) {
    this.sv.Qt().Pd(this.zg, t6, this.Og);
  }
  options() {
    return this.Ki().N();
  }
  width() {
    return G(this.zg) ? this.sv.CM(this.zg) : 0;
  }
  setVisibleRange(t6) {
    this.setAutoScale(false), this.Ki().qo(new mt(t6.from, t6.to));
  }
  getVisibleRange() {
    let t6, i8, n6 = this.Ki().ar();
    if (null === n6) return null;
    if (this.Ki().so()) {
      const s4 = this.Ki().M_(), e11 = Yi(s4);
      n6 = vi(n6, this.Ki().ro()), t6 = Number((Math.round(n6.Je() / s4) * s4).toFixed(e11)), i8 = Number((Math.round(n6.Qe() / s4) * s4).toFixed(e11));
    } else t6 = n6.Je(), i8 = n6.Qe();
    return { from: t6, to: i8 };
  }
  setAutoScale(t6) {
    this.applyOptions({ autoScale: t6 });
  }
  Ki() {
    return u4(this.sv.Qt().Td(this.zg, this.Og)).Ft;
  }
};
var Js = class {
  constructor(t6, i8, n6, s4) {
    this.sv = t6, this.yt = n6, this.Ng = i8, this.Fg = s4;
  }
  getHeight() {
    return this.yt.$t();
  }
  setHeight(t6) {
    const i8 = this.sv.Qt(), n6 = i8.hf(this.yt);
    i8.Bd(n6, t6);
  }
  getStretchFactor() {
    return this.yt.z_();
  }
  setStretchFactor(t6) {
    this.yt.O_(t6), this.sv.Qt().Pa();
  }
  paneIndex() {
    return this.sv.Qt().hf(this.yt);
  }
  moveTo(t6) {
    const i8 = this.paneIndex();
    i8 !== t6 && (o10(t6 >= 0 && t6 < this.sv.rv().length, "Invalid pane index"), this.sv.Qt().Ad(i8, t6));
  }
  getSeries() {
    return this.yt.U_().map(((t6) => this.Ng(t6))) ?? [];
  }
  getHTMLElement() {
    const t6 = this.sv.rv();
    return t6 && 0 !== t6.length && t6[this.paneIndex()] ? t6[this.paneIndex()].uv() : null;
  }
  attachPrimitive(t6) {
    this.yt.hl(t6), t6.attached && t6.attached({ chart: this.Fg, requestUpdate: () => this.yt.Qt().Pa() });
  }
  detachPrimitive(t6) {
    this.yt.al(t6);
  }
  priceScale(t6) {
    if (null === this.yt.A_(t6)) throw new Error(`Cannot find price scale with id: ${t6}`);
    return new Xs(this.sv, t6, this.paneIndex());
  }
  setPreserveEmptyPane(t6) {
    this.yt.W_(t6);
  }
  preserveEmptyPane() {
    return this.yt.H_();
  }
  addCustomSeries(t6, i8 = {}, n6 = 0) {
    return this.Fg.addCustomSeries(t6, i8, n6);
  }
  addSeries(t6, i8 = {}) {
    return this.Fg.addSeries(t6, i8, this.paneIndex());
  }
};
var Qs = { color: "#FF0000", price: 0, lineStyle: 2, lineWidth: 1, lineVisible: true, axisLabelVisible: true, title: "", axisLabelColor: "", axisLabelTextColor: "" };
var te = class {
  constructor(t6) {
    this._r = t6;
  }
  applyOptions(t6) {
    this._r.vr(t6);
  }
  options() {
    return this._r.N();
  }
  Wg() {
    return this._r;
  }
};
var ie = class {
  constructor(t6, i8, n6, s4, e11, r8) {
    this.Hg = new d3(), this.ae = t6, this.Ug = i8, this.$g = n6, this.xu = e11, this.Fg = s4, this.jg = r8;
  }
  m() {
    this.Hg.m();
  }
  priceFormatter() {
    return this.ae.tl();
  }
  priceToCoordinate(t6) {
    const i8 = this.ae.Lt();
    return null === i8 ? null : this.ae.Ft().Nt(t6, i8.Wt);
  }
  coordinateToPrice(t6) {
    const i8 = this.ae.Lt();
    return null === i8 ? null : this.ae.Ft().Tn(t6, i8.Wt);
  }
  barsInLogicalRange(t6) {
    if (null === t6) return null;
    const i8 = new Oi(new Ai(t6.from, t6.to)).Fu(), n6 = this.ae.Un();
    if (n6.Gi()) return null;
    const s4 = n6.Hn(i8.Oa(), 1), e11 = n6.Hn(i8.bi(), -1), r8 = u4(n6.Rh()), h4 = u4(n6.Qn());
    if (null !== s4 && null !== e11 && s4.$n > e11.$n) return { barsBefore: t6.from - r8, barsAfter: h4 - t6.to };
    const a5 = { barsBefore: null === s4 || s4.$n === r8 ? t6.from - r8 : s4.$n - r8, barsAfter: null === e11 || e11.$n === h4 ? h4 - t6.to : h4 - e11.$n };
    return null !== s4 && null !== e11 && (a5.from = s4.Qr, a5.to = e11.Qr), a5;
  }
  setData(t6) {
    this.xu, this.ae.bh(), this.Ug.qg(this.ae, t6), this.Yg("full");
  }
  update(t6, i8 = false) {
    this.ae.bh(), this.Ug.Kg(this.ae, t6, i8), this.Yg("update");
  }
  pop(t6 = 1) {
    const i8 = this.Ug.Zg(this.ae, t6);
    0 !== i8.length && this.Yg("update");
    const n6 = Us(this.seriesType());
    return i8.map(((t7) => n6(t7)));
  }
  dataByIndex(t6, i8) {
    const n6 = this.ae.Un().Hn(t6, i8);
    if (null === n6) return null;
    return Us(this.seriesType())(n6);
  }
  data() {
    const t6 = Us(this.seriesType());
    return this.ae.Un().Bh().map(((i8) => t6(i8)));
  }
  subscribeDataChanged(t6) {
    this.Hg.i(t6);
  }
  unsubscribeDataChanged(t6) {
    this.Hg._(t6);
  }
  applyOptions(t6) {
    this.ae.vr(t6);
  }
  options() {
    return M2(this.ae.N());
  }
  priceScale() {
    return this.$g.priceScale(this.ae.Ft().cl(), this.getPane().paneIndex());
  }
  createPriceLine(t6) {
    const i8 = f3(M2(Qs), t6), n6 = this.ae.Ba(i8);
    return new te(n6);
  }
  removePriceLine(t6) {
    this.ae.Ea(t6.Wg());
  }
  priceLines() {
    return this.ae.Aa().map(((t6) => new te(t6)));
  }
  seriesType() {
    return this.ae.bh();
  }
  lastValueData(t6) {
    const i8 = this.ae.Ae(t6);
    return i8.Le ? { noData: true } : { noData: false, price: i8.Mt, color: i8.R };
  }
  attachPrimitive(t6) {
    this.ae.hl(t6), t6.attached && t6.attached({ chart: this.Fg, series: this, requestUpdate: () => this.ae.Qt().Pa(), horzScaleBehavior: this.xu });
  }
  detachPrimitive(t6) {
    this.ae.al(t6), t6.detached && t6.detached(), this.ae.Qt().Pa();
  }
  getPane() {
    const t6 = this.ae, i8 = u4(this.ae.Qt().Ks(t6));
    return this.jg(i8);
  }
  moveToPane(t6) {
    this.ae.Qt().nf(this.ae, t6);
  }
  seriesOrder() {
    const t6 = this.ae.Qt().Ks(this.ae);
    return null === t6 ? -1 : t6.U_().indexOf(this.ae);
  }
  setSeriesOrder(t6) {
    const i8 = this.ae.Qt().Ks(this.ae);
    null !== i8 && i8.du(this.ae, t6);
  }
  Yg(t6) {
    this.Hg.v() && this.Hg.p(t6);
  }
};
var ne = class {
  constructor(t6, i8, n6) {
    this.Gg = new d3(), this.Gu = new d3(), this.Bw = new d3(), this.sn = t6, this.ia = t6.Et(), this._M = i8, this.ia.Yc().i(this.Xg.bind(this)), this.ia.Kc().i(this.Jg.bind(this)), this._M.Fw().i(this.Qg.bind(this)), this.xu = n6;
  }
  m() {
    this.ia.Yc().u(this), this.ia.Kc().u(this), this._M.Fw().u(this), this.Gg.m(), this.Gu.m(), this.Bw.m();
  }
  scrollPosition() {
    return this.ia.Ac();
  }
  scrollToPosition(t6, i8) {
    i8 ? this.ia.$c(t6, 1e3) : this.sn.gs(t6);
  }
  scrollToRealTime() {
    this.ia.Uc();
  }
  getVisibleRange() {
    const t6 = this.ia.gc();
    return null === t6 ? null : { from: t6.from.originalTime, to: t6.to.originalTime };
  }
  setVisibleRange(t6) {
    const i8 = { from: this.xu.convertHorzItemToInternal(t6.from), to: this.xu.convertHorzItemToInternal(t6.to) }, n6 = this.ia.Cc(i8);
    this.sn.tf(n6);
  }
  getVisibleLogicalRange() {
    const t6 = this.ia.Mc();
    return null === t6 ? null : { from: t6.Oa(), to: t6.bi() };
  }
  setVisibleLogicalRange(t6) {
    o10(t6.from <= t6.to, "The from index cannot be after the to index."), this.sn.tf(t6);
  }
  resetTimeScale() {
    this.sn.ws();
  }
  fitContent() {
    this.sn.Xc();
  }
  logicalToCoordinate(t6) {
    const i8 = this.sn.Et();
    return i8.Gi() ? null : i8.jt(t6);
  }
  coordinateToLogical(t6) {
    return this.ia.Gi() ? null : this.ia.Rc(t6);
  }
  timeToIndex(t6, i8) {
    const n6 = this.xu.convertHorzItemToInternal(t6);
    return this.ia.vc(n6, i8);
  }
  timeToCoordinate(t6) {
    const i8 = this.timeToIndex(t6, false);
    return null === i8 ? null : this.ia.jt(i8);
  }
  coordinateToTime(t6) {
    const i8 = this.sn.Et(), n6 = i8.Rc(t6), s4 = i8.en(n6);
    return null === s4 ? null : s4.originalTime;
  }
  width() {
    return this._M.cv().width;
  }
  height() {
    return this._M.cv().height;
  }
  subscribeVisibleTimeRangeChange(t6) {
    this.Gg.i(t6);
  }
  unsubscribeVisibleTimeRangeChange(t6) {
    this.Gg._(t6);
  }
  subscribeVisibleLogicalRangeChange(t6) {
    this.Gu.i(t6);
  }
  unsubscribeVisibleLogicalRangeChange(t6) {
    this.Gu._(t6);
  }
  subscribeSizeChange(t6) {
    this.Bw.i(t6);
  }
  unsubscribeSizeChange(t6) {
    this.Bw._(t6);
  }
  applyOptions(t6) {
    this.ia.vr(t6);
  }
  options() {
    return { ...M2(this.ia.N()), barSpacing: this.ia.fl() };
  }
  Xg() {
    this.Gg.v() && this.Gg.p(this.getVisibleRange());
  }
  Jg() {
    this.Gu.v() && this.Gu.p(this.getVisibleLogicalRange());
  }
  Qg(t6) {
    this.Bw.p(t6.width, t6.height);
  }
};
function se(t6) {
  return (function(t7) {
    if (w2(t7.handleScale)) {
      const i9 = t7.handleScale;
      t7.handleScale = { axisDoubleClickReset: { time: i9, price: i9 }, axisPressedMouseMove: { time: i9, price: i9 }, mouseWheel: i9, pinch: i9 };
    } else if (void 0 !== t7.handleScale) {
      const { axisPressedMouseMove: i9, axisDoubleClickReset: n6 } = t7.handleScale;
      w2(i9) && (t7.handleScale.axisPressedMouseMove = { time: i9, price: i9 }), w2(n6) && (t7.handleScale.axisDoubleClickReset = { time: n6, price: n6 });
    }
    const i8 = t7.handleScroll;
    w2(i8) && (t7.handleScroll = { horzTouchDrag: i8, vertTouchDrag: i8, mouseWheel: i8, pressedMouseMove: i8 });
  })(t6), t6;
}
var ee = class {
  constructor(t6, i8, n6) {
    this.tb = /* @__PURE__ */ new Map(), this.ib = /* @__PURE__ */ new Map(), this.nb = new d3(), this.sb = new d3(), this.eb = new d3(), this.od = /* @__PURE__ */ new WeakMap(), this.rb = new ds(i8);
    const s4 = void 0 === n6 ? M2(Gs()) : f3(M2(Gs()), se(n6));
    this.hb = i8, this.sv = new Gn(t6, s4, i8), this.sv.dw().i(((t7) => {
      this.nb.v() && this.nb.p(this.ab(t7()));
    }), this), this.sv.fw().i(((t7) => {
      this.sb.v() && this.sb.p(this.ab(t7()));
    }), this), this.sv.Dd().i(((t7) => {
      this.eb.v() && this.eb.p(this.ab(t7()));
    }), this);
    const e11 = this.sv.Qt();
    this.lb = new ne(e11, this.sv.pM(), this.hb);
  }
  remove() {
    this.sv.dw().u(this), this.sv.fw().u(this), this.sv.Dd().u(this), this.lb.m(), this.sv.m(), this.tb.clear(), this.ib.clear(), this.nb.m(), this.sb.m(), this.eb.m(), this.rb.m();
  }
  resize(t6, i8, n6) {
    this.autoSizeActive() || this.sv.cM(t6, i8, n6);
  }
  addCustomSeries(t6, i8 = {}, n6 = 0) {
    const s4 = ((t7) => ({ type: "Custom", isBuiltIn: false, defaultOptions: { ...Es, ...t7.defaultOptions() }, ob: As, _b: t7 }))(c5(t6));
    return this.ub(s4, i8, n6);
  }
  addSeries(t6, i8 = {}, n6 = 0) {
    return this.ub(t6, i8, n6);
  }
  removeSeries(t6) {
    const i8 = _2(this.tb.get(t6)), n6 = this.rb.Jd(i8);
    this.sv.Qt().Jd(i8), this.cb(n6), this.tb.delete(t6), this.ib.delete(i8);
  }
  qg(t6, i8) {
    this.cb(this.rb.sg(t6, i8));
  }
  Kg(t6, i8, n6) {
    this.cb(this.rb.og(t6, i8, n6));
  }
  Zg(t6, i8) {
    const [n6, s4] = this.rb.cg(t6, i8);
    return 0 !== n6.length && this.cb(s4), n6;
  }
  subscribeClick(t6) {
    this.nb.i(t6);
  }
  unsubscribeClick(t6) {
    this.nb._(t6);
  }
  subscribeCrosshairMove(t6) {
    this.eb.i(t6);
  }
  unsubscribeCrosshairMove(t6) {
    this.eb._(t6);
  }
  subscribeDblClick(t6) {
    this.sb.i(t6);
  }
  unsubscribeDblClick(t6) {
    this.sb._(t6);
  }
  priceScale(t6, i8 = 0) {
    return new Xs(this.sv, t6, i8);
  }
  timeScale() {
    return this.lb;
  }
  applyOptions(t6) {
    this.sv.vr(se(t6));
  }
  options() {
    return this.sv.N();
  }
  takeScreenshot(t6 = false, i8 = false) {
    let n6, s4;
    try {
      i8 || (n6 = this.sv.Qt().N().crosshair.mode, this.sv.vr({ crosshair: { mode: 2 } })), s4 = this.sv.SM(t6);
    } finally {
      i8 || void 0 === n6 || this.sv.Qt().vr({ crosshair: { mode: n6 } });
    }
    return s4;
  }
  addPane(t6 = false) {
    const i8 = this.sv.Qt().af();
    return i8.W_(t6), this.fb(i8);
  }
  removePane(t6) {
    this.sv.Qt().Vd(t6);
  }
  swapPanes(t6, i8) {
    this.sv.Qt().Ed(t6, i8);
  }
  autoSizeActive() {
    return this.sv.wM();
  }
  chartElement() {
    return this.sv.vv();
  }
  panes() {
    return this.sv.Qt().Zn().map(((t6) => this.fb(t6)));
  }
  paneSize(t6 = 0) {
    const i8 = this.sv.RM(t6);
    return { height: i8.height, width: i8.width };
  }
  setCrosshairPosition(t6, i8, n6) {
    const s4 = this.tb.get(n6);
    if (void 0 === s4) return;
    const e11 = this.sv.Qt().Ks(s4);
    null !== e11 && this.sv.Qt().qd(t6, i8, e11);
  }
  clearCrosshairPosition() {
    this.sv.Qt().Yd(true);
  }
  horzBehaviour() {
    return this.hb;
  }
  ub(t6, i8 = {}, n6 = 0) {
    o10(void 0 !== t6.ob), (function(t7) {
      if (void 0 === t7 || "custom" === t7.type) return;
      const i9 = t7;
      void 0 !== i9.minMove && void 0 === i9.precision && (i9.precision = Yi(i9.minMove));
    })(i8.priceFormat), "Candlestick" === t6.type && (function(t7) {
      void 0 !== t7.borderColor && (t7.borderUpColor = t7.borderColor, t7.borderDownColor = t7.borderColor), void 0 !== t7.wickColor && (t7.wickUpColor = t7.wickColor, t7.wickDownColor = t7.wickColor);
    })(i8);
    const s4 = f3(M2(e10), M2(t6.defaultOptions), i8), r8 = t6.ob, h4 = new Jt(this.sv.Qt(), t6.type, s4, r8, t6._b);
    this.sv.Qt().Gd(h4, n6);
    const a5 = new ie(h4, this, this, this, this.hb, ((t7) => this.fb(t7)));
    return this.tb.set(a5, h4), this.ib.set(h4, a5), a5;
  }
  cb(t6) {
    const i8 = this.sv.Qt();
    i8.Kd(t6.Et.Pc, t6.Et.vg, t6.Et.mg), t6.U_.forEach(((t7, i9) => i9.ht(t7.ue, t7.pg))), i8.Et()._c(), i8.Bc();
  }
  pb(t6) {
    return _2(this.ib.get(t6));
  }
  mb(t6) {
    return void 0 !== t6 && this.ib.has(t6) ? this.pb(t6) : void 0;
  }
  ab(t6) {
    const i8 = /* @__PURE__ */ new Map();
    t6.YM.forEach(((t7, n7) => {
      const s5 = n7.bh(), e11 = Us(s5)(t7);
      if ("Custom" !== s5) o10(Qn(e11));
      else {
        const t8 = n7.ol();
        o10(!t8 || false === t8(e11));
      }
      i8.set(this.pb(n7), e11);
    }));
    const n6 = this.mb(t6.NM), s4 = void 0 === t6.WM ? void 0 : { type: t6.WM.ds, sourceKind: t6.WM.HM, objectKind: t6.WM.UM, series: this.mb(t6.WM.U_), objectId: t6.WM.$M, paneIndex: t6.WM.jM };
    return { time: t6.Qr, logical: t6.$n, point: t6.qM, paneIndex: t6.jM, hoveredInfo: s4, hoveredSeries: n6, hoveredObjectId: t6.FM, seriesData: i8, sourceEvent: t6.KM };
  }
  fb(t6) {
    let i8 = this.od.get(t6);
    return i8 || (i8 = new Js(this.sv, ((t7) => this.pb(t7)), t6, this), this.od.set(t6, i8)), i8;
  }
};
function re(t6) {
  if (m2(t6)) {
    const i8 = document.getElementById(t6);
    return o10(null !== i8, `Cannot find element in DOM with id=${t6}`), i8;
  }
  return t6;
}
function he(t6, i8, n6) {
  const s4 = re(t6), e11 = new ee(s4, i8, n6);
  return i8.setOptions(e11.options()), e11;
}
function ae(t6, i8) {
  return he(t6, new cn(), cn.yf(i8));
}
function oe(t6, i8, n6, s4) {
  return Math.hypot(n6 - t6, s4 - i8);
}
function _e(t6, i8, n6, s4, e11, r8, h4, a5 = 0) {
  if (0 === i8.length || s4.from >= i8.length || s4.to <= 0) return;
  const { context: l6, horizontalPixelRatio: o11, verticalPixelRatio: _3 } = t6, u5 = i8[s4.from];
  let c6 = r8(t6, u5), d4 = u5;
  if (s4.to - s4.from < 2) {
    const i9 = e11 / 2;
    l6.beginPath();
    const n7 = { _t: u5._t - i9, ut: u5.ut }, s5 = { _t: u5._t + i9, ut: u5.ut };
    l6.moveTo(n7._t * o11, n7.ut * _3), l6.lineTo(s5._t * o11, s5.ut * _3), h4(t6, c6, n7, s5);
  } else {
    const e12 = a5 > 0;
    let f4 = 0;
    const p4 = (i9, n7) => {
      if (h4(t6, c6, d4, n7), l6.beginPath(), c6 = i9, d4 = n7, e12) {
        const t7 = f4 % a5;
        l6.lineDashOffset = t7, f4 = t7;
      }
    };
    let v3 = d4;
    l6.beginPath(), l6.moveTo(u5._t * o11, u5.ut * _3);
    for (let h5 = s4.from + 1; h5 < s4.to; ++h5) {
      v3 = i8[h5];
      const s5 = v3._t * o11, a6 = v3.ut * _3, u6 = r8(t6, v3);
      switch (n6) {
        case 0:
          if (l6.lineTo(s5, a6), e12) {
            const t7 = i8[h5 - 1], n7 = t7._t * o11, e13 = t7.ut * _3;
            f4 += oe(n7, e13, s5, a6);
          }
          break;
        case 1: {
          const t7 = i8[h5 - 1], n7 = t7.ut * _3;
          l6.lineTo(s5, n7), e12 && (f4 += Math.abs(v3._t - t7._t) * o11), u6 !== c6 && (p4(u6, v3), l6.lineTo(s5, n7)), l6.lineTo(s5, a6), e12 && (f4 += Math.abs(v3.ut - t7.ut) * _3);
          break;
        }
        case 2: {
          const [t7, n7] = fe(i8, h5 - 1, h5), r9 = t7._t * o11, u7 = t7.ut * _3, c7 = n7._t * o11, d5 = n7.ut * _3;
          if (l6.bezierCurveTo(r9, u7, c7, d5, s5, a6), e12) {
            const t8 = i8[h5 - 1], n8 = t8._t * o11, e13 = t8.ut * _3, l7 = oe(n8, e13, s5, a6), p5 = oe(n8, e13, r9, u7) + oe(r9, u7, c7, d5) + oe(c7, d5, s5, a6);
            f4 += (l7 + p5) / 2;
          }
          break;
        }
      }
      1 !== n6 && u6 !== c6 && (p4(u6, v3), l6.moveTo(s5, a6));
    }
    (d4 !== v3 || d4 === v3 && 1 === n6) && h4(t6, c6, d4, v3), e12 && (l6.lineDashOffset = 0);
  }
}
var ue = 6;
function ce(t6, i8) {
  return { _t: t6._t - i8._t, ut: t6.ut - i8.ut };
}
function de(t6, i8) {
  return { _t: t6._t / i8, ut: t6.ut / i8 };
}
function fe(t6, i8, n6) {
  const s4 = Math.max(0, i8 - 1), e11 = Math.min(t6.length - 1, n6 + 1);
  var r8, h4;
  return [(r8 = t6[i8], h4 = de(ce(t6[n6], t6[s4]), ue), { _t: r8._t + h4._t, ut: r8.ut + h4.ut }), ce(t6[n6], de(ce(t6[e11], t6[i8]), ue))];
}
function pe(t6, i8) {
  const n6 = t6.context;
  n6.strokeStyle = i8, n6.stroke();
}
var ve = class extends R2 {
  constructor() {
    super(...arguments), this.rt = null;
  }
  ht(t6) {
    this.rt = t6;
  }
  et(t6) {
    if (null === this.rt) return;
    const { ot: i8, lt: n6, wb: s4, Mb: e11, ct: r8, Zt: h4, gb: l6 } = this.rt;
    if (null === n6) return;
    const o11 = t6.context;
    o11.lineCap = "butt", o11.lineWidth = r8 * t6.verticalPixelRatio;
    const _3 = a4(o11, h4);
    o11.lineJoin = "round";
    const u5 = this.bb.bind(this), c6 = (function(t7) {
      return t7.reduce(((t8, i9) => t8 + i9), 0);
    })(_3);
    void 0 !== e11 && _e(t6, i8, e11, n6, s4, u5, pe, c6), l6 && (function(t7, i9, n7, s5, e12) {
      if (s5.to - s5.from <= 0) return;
      const { horizontalPixelRatio: r9, verticalPixelRatio: h5, context: a5 } = t7;
      let l7 = null;
      const o12 = Math.max(1, Math.floor(r9)) % 2 / 2, _4 = n7 * h5 + o12;
      for (let n8 = s5.to - 1; n8 >= s5.from; --n8) {
        const s6 = i9[n8];
        if (s6) {
          const i10 = e12(t7, s6);
          i10 !== l7 && (null !== l7 && a5.fill(), a5.beginPath(), a5.fillStyle = i10, l7 = i10);
          const n9 = Math.round(s6._t * r9) + o12, u6 = s6.ut * h5;
          a5.moveTo(n9, u6), a5.arc(n9, u6, _4, 0, 2 * Math.PI);
        }
      }
      a5.fill();
    })(t6, i8, l6, n6, u5);
  }
};
var me = class extends ve {
  bb(t6, i8) {
    return i8.vt;
  }
};
function we(t6, i8, n6, s4, e11) {
  const r8 = 1 - e11;
  return r8 * r8 * r8 * t6 + 3 * r8 * r8 * e11 * i8 + 3 * r8 * e11 * e11 * n6 + e11 * e11 * e11 * s4;
}
function Me(t6, i8, n6, s4, e11) {
  if (2 === n6) {
    const [n7, r8] = fe(s4, e11 - 1, e11);
    return [Math.min(t6._t, i8._t, n7._t, r8._t), Math.max(t6._t, i8._t, n7._t, r8._t)];
  }
  return [Math.min(t6._t, i8._t), Math.max(t6._t, i8._t)];
}
function ge(t6, i8, n6, s4, e11, r8, h4, a5) {
  switch (e11) {
    case 1: {
      const e12 = bs(t6, i8, n6._t, n6.ut, s4._t, n6.ut), r9 = bs(t6, i8, s4._t, n6.ut, s4._t, s4.ut), h5 = Math.min(e12, r9);
      return h5 <= a5 ? h5 : null;
    }
    case 2: {
      const [e12, l6] = fe(r8, h4 - 1, h4), o11 = (function(t7, i9, n7) {
        let s5 = Number.POSITIVE_INFINITY, e13 = n7[0];
        for (let r9 = 1; r9 <= 12; r9++) {
          const h5 = r9 / 12, a6 = { _t: we(n7[0]._t, n7[1]._t, n7[2]._t, n7[3]._t, h5), ut: we(n7[0].ut, n7[1].ut, n7[2].ut, n7[3].ut, h5) };
          s5 = Math.min(s5, bs(t7, i9, e13._t, e13.ut, a6._t, a6.ut)), e13 = a6;
        }
        return s5;
      })(t6, i8, [n6, e12, l6, s4]);
      return o11 <= a5 ? o11 : null;
    }
    default: {
      const e12 = bs(t6, i8, n6._t, n6.ut, s4._t, s4.ut);
      return e12 <= a5 ? e12 : null;
    }
  }
}
var be = class extends Rs {
  constructor(t6, i8) {
    super(t6, i8, true);
  }
  Vg(t6, i8, n6) {
    i8.Tc(this.bg, b3(this.Sg)), t6.Zo(this.bg, n6, b3(this.Sg));
  }
  Sb(t6, i8) {
    return { wt: t6, Mt: i8, _t: NaN, ut: NaN };
  }
  Dg() {
    const t6 = this.ae.Sa();
    this.bg = this.ae.Ha().Bh().map(((i8) => {
      let n6;
      if ((i8.Zr ?? 1) > 1) {
        const t7 = i8.Wt[1], s4 = i8.Wt[2], e11 = i8.Wt[3];
        n6 = Math.abs(t7 - e11) > Math.abs(s4 - e11) ? t7 : s4;
      } else n6 = i8.Wt[3];
      return this.xb(i8.$n, n6, t6);
    }));
  }
};
var Se = class extends be {
  Pg(t6, i8) {
    const n6 = this.ae.N();
    return (function(t7, i9, n7, s4, e11, r8, h4, a5 = 0, l6 = 0) {
      if (null === i9 || i9.from >= i9.to || 0 === t7.length) return null;
      const o11 = Math.max(r8 / 2, h4 ?? 0) + l6;
      let _3 = Number.POSITIVE_INFINITY;
      if (void 0 !== h4) {
        const e12 = h4 + l6, r9 = ms(t7, n7 - e12, i9.from, i9.to), a6 = ws(t7, n7 + e12, r9, i9.to);
        for (let i10 = r9; i10 < a6; i10++) {
          const e13 = t7[i10];
          if (!gs(n7, e13._t, e13._t, h4 + l6)) continue;
          const r10 = Math.hypot(n7 - e13._t, s4 - e13.ut);
          r10 <= h4 + l6 && (_3 = Math.min(_3, r10));
        }
      }
      if (i9.to - i9.from < 2) {
        const e12 = t7[i9.from], r9 = Math.max(a5 / 2, o11), h5 = bs(n7, s4, e12._t - r9, e12.ut, e12._t + r9, e12.ut);
        return h5 <= o11 && (_3 = Math.min(_3, h5)), Number.isFinite(_3) ? Ms(_3, 2, "series-point") : null;
      }
      let u5 = Number.POSITIVE_INFINITY;
      const c6 = ms(t7, n7 - o11, i9.from, i9.to), d4 = ws(t7, n7 + o11, c6, i9.to), f4 = Math.max(i9.from + 1, c6), p4 = Math.min(i9.to, d4 + 1);
      for (let i10 = f4; i10 < p4; i10++) {
        const r9 = t7[i10 - 1], h5 = t7[i10], [a6, l7] = Me(r9, h5, e11, t7, i10);
        if (!gs(n7, a6, l7, o11)) continue;
        const _4 = ge(n7, s4, r9, h5, e11, t7, i10, o11);
        null !== _4 && (u5 = Math.min(u5, _4));
      }
      return Number.isFinite(_3) ? Ms(_3, 2, "series-point") : Number.isFinite(u5) ? Ms(u5, 1, "series-line") : null;
    })(this.bg, this.Sg, t6, i8, n6.lineType, n6.lineVisible ? n6.lineWidth : 1, n6.pointMarkersVisible ? n6.pointMarkersRadius || n6.lineWidth / 2 + 2 : void 0, this.le.Et().fl(), n6.hitTestTolerance);
  }
};
var xe = class extends Se {
  constructor() {
    super(...arguments), this.kg = new me();
  }
  xb(t6, i8, n6) {
    return { ...this.Sb(t6, i8), ...n6.Sh(t6) };
  }
  Bg() {
    const t6 = this.ae.N(), i8 = { ot: this.bg, Zt: t6.lineStyle, Mb: t6.lineVisible ? t6.lineType : void 0, ct: t6.lineWidth, gb: t6.pointMarkersVisible ? t6.pointMarkersRadius || t6.lineWidth / 2 + 2 : void 0, lt: this.Sg, wb: this.le.Et().fl() };
    this.kg.ht(i8);
  }
};
var Ce = { type: "Line", isBuiltIn: true, defaultOptions: { color: "#2196f3", lineStyle: 0, lineWidth: 3, lineType: 0, lineVisible: true, crosshairMarkerVisible: true, crosshairMarkerRadius: 4, crosshairMarkerBorderColor: "", crosshairMarkerBorderWidth: 2, crosshairMarkerBackgroundColor: "", lastPriceAnimation: 0, pointMarkersVisible: false }, ob: (t6, i8) => new xe(t6, i8) };
var qr = { ...e10, color: "#2196f3" };

// src/ts/index.ts
var METRICS = [
  "median",
  "mean",
  "min",
  "max",
  "ops",
  "peak_memory"
];
var VIEWS = ["overview", "trend", "comparison"];
var CONTROLS = [
  "view",
  "metric",
  "x-axis",
  "benchmark",
  "machine",
  "python",
  "memory",
  "theme"
];
var SERIES_COLORS = [
  ["--_benched-accent-color", "#3e96ff"],
  ["--wa-color-orange-60", "#f46a45"],
  ["--wa-color-green-60", "#00ac49"],
  ["--wa-color-purple-60", "#b678f5"],
  ["--wa-color-pink-60", "#e66ba3"],
  ["--wa-color-cyan-60", "#00a3c0"],
  ["--wa-color-indigo-60", "#808aff"],
  ["--wa-color-yellow-60", "#da7e00"],
  ["--wa-color-red-60", "#f3676c"]
];
function selectedValue(event) {
  const value = event.currentTarget.value;
  return typeof value === "string" ? value : "";
}
function formatValue(value) {
  return value == null ? "\u2014" : value.toLocaleString(void 0, { maximumSignificantDigits: 6 });
}
function pythonFeatureVersion(value) {
  const match = value?.match(/^(\d+)\.(\d+)/);
  return match ? `${match[1]}.${match[2]}` : value ?? "unknown";
}
function memoryBucket(run) {
  const value = run?.machine.metadata?.memory_gib;
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "unknown";
}
function memoryLabel(value) {
  return value === "unknown" ? "Unknown" : `${value} GiB`;
}
function selectedValues(attribute, available) {
  if (attribute === null) return new Set(available);
  return new Set(
    attribute.split(",").filter((value) => available.includes(value))
  );
}
function chartPriceFormat(values) {
  const maximum = Math.max(
    0,
    ...values.filter(Number.isFinite).map((value) => Math.abs(value))
  );
  const precision = maximum === 0 ? 2 : Math.min(12, Math.max(0, 2 - Math.floor(Math.log10(maximum))));
  return {
    type: "price",
    precision,
    minMove: 10 ** -precision
  };
}
function validateReport(value) {
  if (typeof value !== "object" || value === null) {
    throw new Error("report must be an object");
  }
  const report = value;
  if (report.schema_version !== 1) {
    throw new Error(
      `unsupported report schema version ${String(report.schema_version)}`
    );
  }
  if (!Array.isArray(report.runs) || !Array.isArray(report.benchmarks) || !Array.isArray(report.warnings)) {
    throw new Error("report is missing runs, benchmarks, or warnings");
  }
  return report;
}
function table(headers, rows, label) {
  const element = document.createElement("table");
  element.className = "benched-table";
  element.setAttribute("aria-label", label);
  const head = element.createTHead().insertRow();
  for (const header of headers) {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = header;
    head.append(cell);
  }
  const body = element.createTBody();
  for (const row of rows) {
    const tableRow = body.insertRow();
    for (const value of row) {
      const cell = tableRow.insertCell();
      cell.textContent = value;
    }
  }
  return element;
}
var BenchedReport = class extends HTMLElement {
  static get observedAttributes() {
    return [
      "src",
      "view",
      "metric",
      "benchmark",
      "machine",
      "python",
      "memory",
      "x-axis",
      "hide-controls",
      "data-theme"
    ];
  }
  report;
  charts = /* @__PURE__ */ new Map();
  chartResizeObserver;
  chartVisibilityObserver;
  chartRenderers = /* @__PURE__ */ new Map();
  request;
  media;
  themeObserver;
  inheritedChartStyle;
  theme = "light";
  handleMediaChange = (event) => {
    if (this.inheritsTheme()) {
      this.setTheme(this.inheritedTheme());
    } else if (!this.savedTheme() && !this.getAttribute("data-theme")) {
      this.setTheme(event.matches ? "dark" : "light");
    }
  };
  handleThemeChange = (event) => {
    if (!this.inheritsTheme()) {
      this.setTheme(event.detail);
    }
  };
  connectedCallback() {
    this.media = matchMedia("(prefers-color-scheme: dark)");
    this.theme = this.preferredTheme();
    this.applyTheme();
    this.media.addEventListener("change", this.handleMediaChange);
    window.addEventListener("benched-theme-change", this.handleThemeChange);
    this.observeInheritedTheme();
    void this.load();
  }
  disconnectedCallback() {
    this.request?.abort();
    this.removeChart();
    this.media?.removeEventListener("change", this.handleMediaChange);
    window.removeEventListener("benched-theme-change", this.handleThemeChange);
    this.themeObserver?.disconnect();
  }
  attributeChangedCallback(name, previous, current) {
    if (!this.isConnected || previous === current) return;
    if (name === "src") {
      void this.load();
    } else if (name === "data-theme") {
      const theme = this.preferredTheme();
      const changed = theme !== this.theme;
      this.setTheme(theme);
      if (!changed && this.report) this.render();
    } else if (this.report) {
      this.render();
    }
  }
  set data(value) {
    this.request?.abort();
    this.report = validateReport(value);
    if (this.isConnected) this.render();
  }
  get data() {
    return this.report;
  }
  get view() {
    const value = this.getAttribute("view");
    return value && VIEWS.includes(value) ? value : "overview";
  }
  get metric() {
    const value = this.getAttribute("metric");
    return value && METRICS.includes(value) ? value : "median";
  }
  get xAxis() {
    return this.getAttribute("x-axis") === "time" ? "time" : "version";
  }
  get hiddenControls() {
    const values = this.getAttribute("hide-controls")?.split(",") ?? [];
    return new Set(
      values.map((value) => value.trim()).filter(
        (value) => CONTROLS.includes(value)
      )
    );
  }
  savedTheme() {
    try {
      const value = localStorage.getItem("benched-theme");
      return value === "light" || value === "dark" ? value : null;
    } catch {
      return null;
    }
  }
  preferredTheme() {
    const attribute = this.getAttribute("data-theme");
    if (attribute === "light" || attribute === "dark") return attribute;
    if (attribute === "inherit") return this.inheritedTheme();
    return this.savedTheme() ?? (this.media?.matches ? "dark" : "light");
  }
  inheritsTheme() {
    return this.getAttribute("data-theme") === "inherit";
  }
  inheritedTheme() {
    const parent = this.parentElement ?? document.documentElement;
    for (let element = parent; element; element = element.parentElement) {
      const match = getComputedStyle(element).backgroundColor.match(
        /^rgba?\(\s*([\d.]+)[, ]+\s*([\d.]+)[, ]+\s*([\d.]+)(?:[, /]+\s*([\d.]+))?\s*\)$/
      );
      if (!match || match[4] !== void 0 && Number(match[4]) === 0)
        continue;
      const brightness = Number(match[1]) * 0.2126 + Number(match[2]) * 0.7152 + Number(match[3]) * 0.0722;
      return brightness < 128 ? "dark" : "light";
    }
    const schemes = getComputedStyle(parent).colorScheme.split(/\s+/);
    if (schemes[0] === "dark" || schemes[0] === "light") return schemes[0];
    return this.media?.matches ? "dark" : "light";
  }
  observeInheritedTheme() {
    this.themeObserver?.disconnect();
    this.inheritedChartStyle = this.chartStyleSignature();
    this.themeObserver = new MutationObserver(() => {
      if (!this.inheritsTheme()) return;
      const theme = this.inheritedTheme();
      if (theme !== this.theme) {
        this.setTheme(theme);
        this.inheritedChartStyle = this.chartStyleSignature();
        return;
      }
      const chartStyle = this.chartStyleSignature();
      if (chartStyle === this.inheritedChartStyle) return;
      this.inheritedChartStyle = chartStyle;
      if (this.report) this.render();
    });
    for (let element = this.parentElement; element; element = element.parentElement) {
      this.themeObserver.observe(element, {
        attributes: true,
        attributeFilter: ["class", "style", "data-theme"]
      });
    }
  }
  chartStyleSignature() {
    const style = getComputedStyle(this);
    return [
      style.color,
      style.getPropertyValue("--_benched-grid-color"),
      ...SERIES_COLORS.map(([property]) => style.getPropertyValue(property))
    ].join("\0");
  }
  applyTheme() {
    this.classList.toggle("wa-dark", this.theme === "dark");
    this.classList.toggle("wa-light", this.theme === "light");
    this.dataset.resolvedTheme = this.theme;
  }
  setTheme(theme) {
    if (theme !== "light" && theme !== "dark") return;
    if (this.theme === theme) {
      this.applyTheme();
      return;
    }
    this.theme = theme;
    this.applyTheme();
    if (this.report) this.render();
  }
  toggleTheme() {
    const theme = this.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("benched-theme", theme);
    } catch {
    }
    window.dispatchEvent(
      new CustomEvent("benched-theme-change", { detail: theme })
    );
  }
  async load() {
    this.request?.abort();
    const source = this.getAttribute("src");
    if (!source) {
      this.report = void 0;
      this.renderMessage("No report data source.");
      return;
    }
    this.renderMessage("Loading report\u2026", "status");
    const request = new AbortController();
    this.request = request;
    try {
      const response = await fetch(source, { signal: request.signal });
      if (!response.ok)
        throw new Error(`${response.status} ${response.statusText}`);
      this.report = validateReport(await response.json());
      this.render();
    } catch (error) {
      if (request.signal.aborted) return;
      const detail = error instanceof Error ? error.message : String(error);
      this.report = void 0;
      this.renderMessage(`Unable to load report: ${detail}`, "alert");
    }
  }
  renderMessage(message, role = "status") {
    this.removeChart();
    const callout = document.createElement("wa-callout");
    callout.className = "benched-message";
    callout.setAttribute(
      "appearance",
      role === "alert" ? "accent" : "outlined"
    );
    callout.setAttribute("role", role);
    callout.textContent = message;
    this.replaceChildren(callout);
  }
  renderViewMessage(container, message) {
    const callout = document.createElement("wa-callout");
    callout.className = "benched-message benched-view-message";
    callout.setAttribute("appearance", "outlined");
    callout.setAttribute("role", "status");
    callout.textContent = message;
    container.replaceChildren(callout);
  }
  render() {
    this.removeChart();
    const report = this.report;
    if (!report) return;
    if (report.benchmarks.length === 0) {
      this.renderMessage("No benchmark data matches this report.");
      return;
    }
    this.innerHTML = `
      <wa-card class="benched-card" appearance="outlined" with-header>
        <div slot="header" class="benched-header">
          <div><strong>Benched report</strong><small></small></div>
          <div class="benched-controls" aria-label="Report controls"></div>
        </div>
        <div class="benched-warnings"></div>
        <section class="benched-view" aria-live="polite"></section>
      </wa-card>
    `;
    const summary = this.querySelector(".benched-header small");
    if (summary)
      summary.textContent = `${report.runs.length} runs \xB7 ${report.benchmarks.length} benchmarks`;
    this.renderControls();
    this.renderWarnings();
    const container = this.querySelector(".benched-view");
    if (!container) return;
    if (this.view === "overview") this.renderOverview(container);
    if (this.view === "trend") this.renderTrend(container);
    if (this.view === "comparison") this.renderComparison(container);
  }
  select(label, className, values, current) {
    const select = document.createElement("wa-select");
    select.className = className;
    select.setAttribute("label", label);
    select.setAttribute("size", "small");
    for (const [value, text] of values) {
      const option = document.createElement("wa-option");
      option.setAttribute("value", value);
      option.textContent = text;
      select.append(option);
    }
    select.value = current;
    return select;
  }
  filterPanel(label, className, values, selected, update2) {
    const fieldset = document.createElement("fieldset");
    fieldset.className = `benched-filter-panel ${className}`;
    const legend = document.createElement("legend");
    legend.textContent = label;
    const buttons = document.createElement("div");
    for (const [value, text] of values) {
      const button = document.createElement("wa-button");
      const active = selected.has(value);
      button.setAttribute("size", "small");
      button.setAttribute("appearance", active ? "filled" : "outlined");
      button.setAttribute("variant", active ? "brand" : "neutral");
      button.setAttribute("aria-pressed", String(active));
      button.textContent = text;
      button.addEventListener("click", () => {
        const next = new Set(selected);
        if (next.has(value)) {
          if (next.size === 1) return;
          next.delete(value);
        } else {
          next.add(value);
        }
        update2(next);
      });
      buttons.append(button);
    }
    fieldset.append(legend, buttons);
    return fieldset;
  }
  updateSelectionAttribute(name, selected, available) {
    if (selected.size === available.length) {
      this.removeAttribute(name);
    } else {
      this.setAttribute(
        name,
        available.filter((value) => selected.has(value)).join(",")
      );
    }
  }
  renderControls() {
    const report = this.report;
    const hidden = this.hiddenControls;
    const controls = this.querySelector(
      ".benched-controls"
    );
    const machines = [
      ...new Set(
        report.runs.map((run) => run.machine.id).filter((value) => Boolean(value))
      )
    ].sort();
    const activeMachines = selectedValues(
      this.getAttribute("machine"),
      machines
    );
    const pythonVersions = [
      ...new Set(
        report.runs.map((run) => pythonFeatureVersion(run.environment.python_version)).filter((value) => Boolean(value))
      )
    ].sort();
    const pythonAttribute = this.getAttribute("python");
    const activePython = selectedValues(
      pythonAttribute?.split(",").map((value) => pythonFeatureVersion(value)).join(",") ?? null,
      pythonVersions
    );
    const memoryValues = [
      ...new Set(
        report.runs.map((run) => memoryBucket(run)).filter((value) => value !== "unknown")
      )
    ].sort((left, right) => Number(left) - Number(right));
    const activeMemory = selectedValues(
      this.getAttribute("memory"),
      memoryValues
    );
    const visibleBenchmarks = this.visibleBenchmarks();
    const requestedBenchmark = this.getAttribute("benchmark") ?? "";
    const unavailableSelection = report.benchmarks.find(
      (benchmark2) => benchmark2.benchmark_id === requestedBenchmark && !visibleBenchmarks.includes(benchmark2)
    );
    const benchmarks = unavailableSelection ? [unavailableSelection, ...visibleBenchmarks] : visibleBenchmarks;
    const activeBenchmarkIndex = benchmarks.findIndex(
      (benchmark2) => benchmark2.benchmark_id === requestedBenchmark
    );
    const view = this.select(
      "View",
      "benched-view-select",
      VIEWS.map((value) => [value, value[0].toUpperCase() + value.slice(1)]),
      this.view
    );
    const metric = this.select(
      "Metric",
      "benched-metric-select",
      METRICS.map((value) => [value, value]),
      this.metric
    );
    const xAxis = this.select(
      "X axis",
      "benched-x-axis-select",
      [
        ["version", "Package version"],
        ["time", "Time"]
      ],
      this.xAxis
    );
    const machine = this.filterPanel(
      "Machine",
      "benched-machine-select",
      machines.map((value) => [value, value]),
      activeMachines,
      (selected) => this.updateSelectionAttribute("machine", selected, machines)
    );
    const python = this.filterPanel(
      "Python",
      "benched-python-select",
      pythonVersions.map((value) => [value, value]),
      activePython,
      (selected) => this.updateSelectionAttribute("python", selected, pythonVersions)
    );
    const memory = this.filterPanel(
      "Memory",
      "benched-memory-select",
      memoryValues.map((value) => [value, memoryLabel(value)]),
      activeMemory,
      (selected) => this.updateSelectionAttribute("memory", selected, memoryValues)
    );
    const benchmark = this.select(
      "Benchmark",
      "benched-benchmark-select",
      [
        ["all", "All benchmarks"],
        ...benchmarks.map(
          (value, index) => [`benchmark-${index}`, value.name]
        )
      ],
      activeBenchmarkIndex < 0 ? "all" : `benchmark-${activeBenchmarkIndex}`
    );
    const theme = document.createElement("wa-button");
    theme.className = "benched-theme-toggle";
    theme.setAttribute("appearance", "plain");
    theme.setAttribute("size", "small");
    theme.setAttribute(
      "aria-label",
      `Switch to ${this.theme === "dark" ? "light" : "dark"} mode`
    );
    theme.setAttribute(
      "title",
      `Switch to ${this.theme === "dark" ? "light" : "dark"} mode`
    );
    theme.innerHTML = this.theme === "dark" ? `<svg data-icon="sun" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"></path>
          </svg>` : `<svg data-icon="moon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"></path>
          </svg>`;
    benchmark.toggleAttribute("disabled", benchmarks.length === 0);
    view.addEventListener(
      "change",
      (event) => this.setAttribute("view", selectedValue(event))
    );
    metric.addEventListener(
      "change",
      (event) => this.setAttribute("metric", selectedValue(event))
    );
    xAxis.addEventListener(
      "change",
      (event) => this.setAttribute("x-axis", selectedValue(event))
    );
    benchmark.addEventListener("change", (event) => {
      const value = selectedValue(event);
      const selected = benchmarks[Number(value.replace("benchmark-", ""))];
      selected ? this.setAttribute("benchmark", selected.benchmark_id) : this.removeAttribute("benchmark");
    });
    theme.addEventListener("click", () => this.toggleTheme());
    if (!hidden.has("view")) controls.append(view);
    if (this.view !== "overview" && !hidden.has("metric"))
      controls.append(metric);
    if (this.view === "trend" && !hidden.has("x-axis")) controls.append(xAxis);
    if (!hidden.has("benchmark")) controls.append(benchmark);
    if (!hidden.has("theme") && !this.inheritsTheme()) controls.append(theme);
    const filters = document.createElement("div");
    filters.className = "benched-filter-panels";
    if (!hidden.has("machine")) filters.append(machine);
    if (!hidden.has("python")) filters.append(python);
    if (memoryValues.length > 0 && !hidden.has("memory"))
      filters.append(memory);
    if (filters.childElementCount > 0) controls.append(filters);
    if (controls.childElementCount === 0) controls.remove();
  }
  renderWarnings() {
    const report = this.report;
    const container = this.querySelector(
      ".benched-warnings"
    );
    for (const warning of report.warnings) {
      const callout = document.createElement("wa-callout");
      callout.setAttribute("appearance", "outlined");
      callout.textContent = warning;
      container.append(callout);
    }
  }
  activeMachines() {
    const report = this.report;
    const available = [
      ...new Set(report.runs.map((run) => run.machine.id).filter(Boolean))
    ];
    return selectedValues(this.getAttribute("machine"), available);
  }
  activePythonVersions() {
    const report = this.report;
    const available = [
      ...new Set(
        report.runs.map(
          (run) => pythonFeatureVersion(run.environment.python_version)
        )
      )
    ];
    const attribute = this.getAttribute("python");
    const normalized = attribute?.split(",").map((value) => pythonFeatureVersion(value)).join(",");
    return selectedValues(normalized ?? null, available);
  }
  activeMemory() {
    const report = this.report;
    const available = [
      ...new Set(
        report.runs.map((run) => memoryBucket(run)).filter((value) => value !== "unknown")
      )
    ];
    return selectedValues(this.getAttribute("memory"), available);
  }
  activeRuns() {
    const report = this.report;
    const machines = this.activeMachines();
    const pythonVersions = this.activePythonVersions();
    const memory = this.activeMemory();
    const filterMachines = this.hasAttribute("machine");
    const filterPython = this.hasAttribute("python");
    const filterMemory = this.hasAttribute("memory");
    return report.runs.filter(
      (run) => (!filterMachines || machines.has(run.machine.id ?? "")) && (!filterPython || pythonVersions.has(
        pythonFeatureVersion(run.environment.python_version)
      )) && (!filterMemory || memory.has(memoryBucket(run)))
    );
  }
  visibleBenchmarks() {
    const report = this.report;
    if (!this.hasAttribute("machine") && !this.hasAttribute("python") && !this.hasAttribute("memory"))
      return report.benchmarks;
    const runIds = new Set(this.activeRuns().map((run) => run.run_id));
    return report.benchmarks.filter(
      (benchmark) => benchmark.series.some((point) => runIds.has(point.run_id))
    );
  }
  activeBenchmark() {
    const benchmarks = this.visibleBenchmarks();
    const requested = this.getAttribute("benchmark");
    return benchmarks.find((benchmark) => benchmark.benchmark_id === requested);
  }
  displayedBenchmarks() {
    const benchmarks = this.visibleBenchmarks();
    const requested = this.getAttribute("benchmark");
    if (!requested) return benchmarks;
    const selected = benchmarks.find(
      (benchmark) => benchmark.benchmark_id === requested
    );
    return selected ? [selected] : [];
  }
  points(benchmark) {
    const runIds = new Set(this.activeRuns().map((run) => run.run_id));
    return benchmark.series.filter((point) => runIds.has(point.run_id));
  }
  pointsBySeries(benchmark) {
    const report = this.report;
    const runs = new Map(report.runs.map((run) => [run.run_id, run]));
    const groups = /* @__PURE__ */ new Map();
    for (const point of this.points(benchmark)) {
      const run = runs.get(point.run_id);
      const machine = run?.machine.id ?? "unknown";
      const python = pythonFeatureVersion(run?.environment.python_version);
      const memory = memoryBucket(run);
      const key = `${machine}\0${python}\0${memory}`;
      const label = `${machine} \xB7 Python ${python}${memory === "unknown" ? "" : ` \xB7 ${memoryLabel(memory)}`}`;
      const group = groups.get(key) ?? {
        label,
        machine,
        python,
        memory,
        points: []
      };
      group.points.push(point);
      groups.set(key, group);
    }
    return [...groups.values()].sort(
      (left, right) => left.label.localeCompare(right.label)
    );
  }
  renderOverview(container) {
    const runs = this.activeRuns();
    const benchmarks = this.visibleBenchmarks();
    if (runs.length === 0 || benchmarks.length === 0) {
      this.renderViewMessage(
        container,
        "No benchmark data matches the selected filters."
      );
      return;
    }
    const machines = new Set(runs.map((run) => run.machine.id).filter(Boolean));
    const pythonVersions = new Set(
      runs.map((run) => pythonFeatureVersion(run.environment.python_version))
    );
    const stats = [
      ["Runs", String(runs.length)],
      ["Benchmarks", String(benchmarks.length)],
      ["Machines", String(machines.size)],
      ["Python Versions", String(pythonVersions.size)]
    ];
    const grid = document.createElement("div");
    grid.className = "benched-summary-grid";
    for (const [label, value] of stats) {
      const card = document.createElement("wa-card");
      const output = document.createElement("strong");
      const caption = document.createElement("span");
      output.textContent = value;
      caption.textContent = label;
      card.append(output, caption);
      grid.append(card);
    }
    const heading = document.createElement("h2");
    heading.textContent = "Benchmarks";
    const list = document.createElement("ul");
    list.className = "benched-benchmark-list";
    const runById = new Map(runs.map((run) => [run.run_id, run]));
    for (const benchmark of benchmarks) {
      const points = this.points(benchmark);
      const contexts = points.map((point) => runById.get(point.run_id)).filter((run) => Boolean(run));
      const benchmarkMachines = new Set(contexts.map((run) => run.machine.id));
      const benchmarkPythons = new Set(
        contexts.map(
          (run) => pythonFeatureVersion(run.environment.python_version)
        )
      );
      const item = document.createElement("li");
      const link = document.createElement("a");
      const detail = document.createElement("span");
      link.href = `#${encodeURIComponent(benchmark.benchmark_id)}`;
      link.textContent = benchmark.name;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        this.setAttribute("benchmark", benchmark.benchmark_id);
        this.setAttribute("view", "trend");
      });
      detail.textContent = `${points.length} points \xB7 ${benchmarkMachines.size} machines \xB7 ${benchmarkPythons.size} Python versions`;
      item.append(link, detail);
      list.append(item);
    }
    container.append(grid, heading, list);
  }
  renderTrend(container) {
    if (!this.hasAttribute("benchmark")) {
      this.renderTrendMatrix(container);
      return;
    }
    const benchmark = this.activeBenchmark();
    if (!benchmark) {
      this.renderViewMessage(
        container,
        "No benchmark data matches the selected filters."
      );
      return;
    }
    const report = this.report;
    const runs = new Map(report.runs.map((run) => [run.run_id, run]));
    const groups = this.pointsBySeries(benchmark).map((group) => ({
      ...group,
      points: group.points.filter(
        (point) => point.metrics[this.metric] != null
      )
    })).filter((group) => group.points.length > 0);
    const points = groups.flatMap((group) => group.points);
    if (points.length === 0) {
      this.renderViewMessage(
        container,
        `No ${this.metric} data matches the selected filters.`
      );
      return;
    }
    const title = document.createElement("h2");
    title.textContent = benchmark.name;
    const value = document.createElement("output");
    value.className = "benched-chart-value";
    value.setAttribute("aria-live", "polite");
    value.textContent = groups.length === 1 ? `${groups[0].label} \xB7 ${this.metric}: ${formatValue(groups[0].points[groups[0].points.length - 1]?.metrics[this.metric])} ${benchmark.unit}` : `${groups.length} series \xB7 ${this.metric}`;
    const legend = document.createElement("div");
    legend.className = "benched-chart-legend";
    legend.setAttribute("aria-label", "Chart series");
    const chartContainer = document.createElement("div");
    chartContainer.className = "benched-chart";
    chartContainer.setAttribute(
      "aria-label",
      `${benchmark.name} ${this.metric} by ${this.xAxis === "version" ? "package version" : "time"}`
    );
    container.append(title, value, legend, chartContainer);
    const style = getComputedStyle(this);
    const axisLabels = /* @__PURE__ */ new Map();
    const versionCoordinates = /* @__PURE__ */ new Map();
    if (this.xAxis === "version") {
      const orderedRuns = points.map((point) => runs.get(point.run_id)).filter((run) => Boolean(run)).sort((left, right) => left.started_at.localeCompare(right.started_at));
      for (const run of orderedRuns) {
        const version = run.subject.version ?? run.subject.revision ?? run.run_id;
        if (versionCoordinates.has(version)) continue;
        const coordinate = versionCoordinates.size + 1;
        versionCoordinates.set(version, coordinate);
        axisLabels.set(coordinate, version);
      }
    }
    const pointTime = (point) => {
      const run = runs.get(point.run_id);
      if (this.xAxis === "version") {
        const version = run?.subject.version ?? run?.subject.revision ?? point.run_id;
        return versionCoordinates.get(version);
      }
      return Math.floor(
        Date.parse(run?.started_at ?? "") / 1e3
      );
    };
    const chart = ae(chartContainer, {
      autoSize: true,
      height: 480,
      handleScale: false,
      handleScroll: false,
      layout: {
        attributionLogo: false,
        background: { type: $i.Solid, color: "transparent" },
        textColor: style.color
      },
      grid: {
        vertLines: {
          color: style.getPropertyValue("--_benched-grid-color").trim() || "#d8dee9"
        },
        horzLines: {
          color: style.getPropertyValue("--_benched-grid-color").trim() || "#d8dee9"
        }
      },
      localization: this.xAxis === "version" ? {
        timeFormatter: (time) => axisLabels.get(Number(time)) ?? "unknown"
      } : void 0,
      timeScale: this.xAxis === "version" ? {
        tickMarkFormatter: (time) => axisLabels.get(Number(time)) ?? ""
      } : void 0
    });
    const priceFormat = chartPriceFormat(
      points.map((point) => point.metrics[this.metric])
    );
    const series = groups.map((group, index) => {
      const [property, fallback2] = SERIES_COLORS[index % SERIES_COLORS.length];
      const color = style.getPropertyValue(property).trim() || fallback2;
      const line = chart.addSeries(Ce, {
        color,
        priceFormat,
        title: group.label
      });
      const values = /* @__PURE__ */ new Map();
      for (const point of group.points) {
        values.set(pointTime(point), point.metrics[this.metric]);
      }
      line?.setData(
        [...values].sort(([left], [right]) => Number(left) - Number(right)).map(([time, pointValue]) => ({ time, value: pointValue }))
      );
      const item = document.createElement("span");
      const swatch = document.createElement("i");
      swatch.style.backgroundColor = color;
      item.append(swatch, group.label);
      legend.append(item);
      return { line, label: group.label };
    });
    chart.subscribeCrosshairMove((event) => {
      for (const item of series) {
        if (!item.line) continue;
        const datum = event.seriesData.get(item.line);
        if (datum && "value" in datum) {
          value.textContent = `${item.label} \xB7 ${this.metric}: ${formatValue(datum.value)} ${benchmark.unit}`;
          break;
        }
      }
    });
    this.trackChart(chartContainer, chart);
    const exactValues = groups.flatMap(
      (group) => group.points.map((point) => {
        const run = runs.get(point.run_id);
        return { group, point, run };
      })
    ).sort(
      (left, right) => (right.run?.started_at ?? "").localeCompare(left.run?.started_at ?? "")
    );
    const accessibleRows = exactValues.slice(0, 100).map(({ group, point, run }) => [
      run?.started_at ?? point.run_id,
      run?.subject.version ?? "\u2014",
      group.machine,
      run?.environment.python_version ?? group.python,
      memoryLabel(group.memory),
      formatValue(point.metrics[this.metric])
    ]);
    const details = document.createElement("details");
    details.className = "benched-exact-values";
    details.open = exactValues.length <= 100;
    const summary = document.createElement("summary");
    summary.textContent = `Recent values (${accessibleRows.length} of ${exactValues.length})`;
    details.append(
      summary,
      table(
        ["Run", "Package", "Machine", "Python", "Memory", this.metric],
        accessibleRows,
        `${benchmark.name} recent trend values`
      )
    );
    container.append(details);
  }
  renderTrendMatrix(container) {
    const benchmarks = this.visibleBenchmarks();
    const activeRuns = this.activeRuns();
    if (activeRuns.length === 0 || benchmarks.length === 0) {
      this.renderViewMessage(
        container,
        "No benchmark data matches the selected filters."
      );
      return;
    }
    const heading = document.createElement("h2");
    heading.textContent = "Benchmark trends";
    const description = document.createElement("p");
    description.className = "benched-trend-description";
    description.textContent = `Each line averages ${this.metric} across selected results at each ${this.xAxis === "version" ? "package version" : "day"}.`;
    const grid = document.createElement("div");
    grid.className = "benched-trend-grid";
    container.append(heading, description, grid);
    const runs = new Map(activeRuns.map((run) => [run.run_id, run]));
    const axisLabels = /* @__PURE__ */ new Map();
    const versionCoordinates = /* @__PURE__ */ new Map();
    if (this.xAxis === "version") {
      for (const run of [...activeRuns].sort(
        (left, right) => left.started_at.localeCompare(right.started_at)
      )) {
        const version = run.subject.version ?? run.subject.revision ?? run.run_id;
        if (versionCoordinates.has(version)) continue;
        const coordinate = versionCoordinates.size + 1;
        versionCoordinates.set(version, coordinate);
        axisLabels.set(coordinate, version);
      }
    }
    const pointTime = (point) => {
      const run = runs.get(point.run_id);
      if (this.xAxis === "version") {
        const version = run?.subject.version ?? run?.subject.revision ?? point.run_id;
        return versionCoordinates.get(version);
      }
      const timestamp = Date.parse(run?.started_at ?? "");
      return Math.floor(timestamp / 864e5) * 86400;
    };
    const style = getComputedStyle(this);
    const [property, fallback2] = SERIES_COLORS[0];
    const color = style.getPropertyValue(property).trim() || fallback2;
    for (const benchmark of benchmarks) {
      const values = /* @__PURE__ */ new Map();
      const points = this.points(benchmark).filter(
        (point) => point.metrics[this.metric] != null
      );
      for (const point of points) {
        const time = pointTime(point);
        const bucket = values.get(time) ?? [];
        bucket.push(point.metrics[this.metric]);
        values.set(time, bucket);
      }
      const data = [...values].sort(([left], [right]) => Number(left) - Number(right)).map(([time, bucket]) => ({
        time,
        value: bucket.reduce((total, value) => total + value, 0) / bucket.length
      }));
      const card = document.createElement("wa-card");
      card.className = "benched-trend-card";
      card.setAttribute("appearance", "outlined");
      card.setAttribute("with-header", "");
      const header = document.createElement("div");
      header.className = "benched-trend-card-header";
      header.setAttribute("slot", "header");
      const link = document.createElement("a");
      link.href = `#${encodeURIComponent(benchmark.benchmark_id)}`;
      link.textContent = benchmark.name;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        this.setAttribute("benchmark", benchmark.benchmark_id);
      });
      const latest = document.createElement("span");
      latest.textContent = data.length ? `${formatValue(data[data.length - 1].value)} ${benchmark.unit}` : `No ${this.metric} data`;
      header.append(link, latest);
      const chartContainer = document.createElement("div");
      chartContainer.className = "benched-mini-chart";
      chartContainer.setAttribute(
        "aria-label",
        `${benchmark.name} aggregate ${this.metric} by ${this.xAxis === "version" ? "package version" : "time"}`
      );
      card.append(header, chartContainer);
      grid.append(card);
      if (data.length === 0) continue;
      this.renderChartWhenVisible(chartContainer, () => {
        const chart = ae(chartContainer, {
          autoSize: true,
          height: 240,
          handleScale: false,
          handleScroll: false,
          layout: {
            attributionLogo: false,
            background: { type: $i.Solid, color: "transparent" },
            textColor: style.color
          },
          grid: {
            vertLines: {
              color: style.getPropertyValue("--_benched-grid-color").trim() || "#d8dee9"
            },
            horzLines: {
              color: style.getPropertyValue("--_benched-grid-color").trim() || "#d8dee9"
            }
          },
          localization: this.xAxis === "version" ? {
            timeFormatter: (time) => axisLabels.get(Number(time)) ?? "unknown"
          } : void 0,
          timeScale: this.xAxis === "version" ? {
            tickMarkFormatter: (time) => axisLabels.get(Number(time)) ?? ""
          } : void 0
        });
        const line = chart.addSeries(Ce, {
          color,
          priceFormat: chartPriceFormat(data.map((point) => point.value))
        });
        line.setData(data);
        this.trackChart(chartContainer, chart);
      });
    }
  }
  renderComparison(container) {
    const rows = this.displayedBenchmarks().flatMap(
      (benchmark) => this.pointsBySeries(benchmark).map((group) => {
        const values = group.points.map((point) => point.metrics[this.metric]).filter((value) => value != null);
        const base = values[values.length - 2];
        const head = values[values.length - 1];
        const change = base == null || head == null || base === 0 ? null : (head - base) / base * 100;
        return [
          benchmark.name,
          group.label,
          formatValue(base),
          formatValue(head),
          change == null ? "\u2014" : `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`
        ];
      })
    );
    if (rows.length === 0) {
      this.renderViewMessage(
        container,
        "No benchmark data matches the selected filters."
      );
      return;
    }
    container.append(
      table(
        [
          "Benchmark",
          "Context",
          `Previous ${this.metric}`,
          `Latest ${this.metric}`,
          "Change"
        ],
        rows,
        "Latest benchmark comparison"
      )
    );
  }
  trackChart(container, chart) {
    this.charts.set(container, chart);
    this.chartResizeObserver ??= new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.charts.get(entry.target)?.timeScale().fitContent();
      }
    });
    this.chartResizeObserver.observe(container);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.charts.get(container) === chart)
          chart.timeScale().fitContent();
      });
    });
  }
  renderChartWhenVisible(container, renderChart) {
    if (!("IntersectionObserver" in window)) {
      renderChart();
      return;
    }
    this.chartRenderers.set(container, renderChart);
    this.chartVisibilityObserver ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target;
          if (entry.isIntersecting) {
            if (!this.charts.has(target)) this.chartRenderers.get(target)?.();
          } else {
            this.removeTrackedChart(target);
          }
        }
      },
      { rootMargin: "480px 0px" }
    );
    this.chartVisibilityObserver.observe(container);
  }
  removeTrackedChart(container) {
    const chart = this.charts.get(container);
    if (!chart) return;
    this.chartResizeObserver?.unobserve(container);
    chart.remove();
    this.charts.delete(container);
  }
  removeChart() {
    this.chartVisibilityObserver?.disconnect();
    this.chartVisibilityObserver = void 0;
    this.chartRenderers.clear();
    this.chartResizeObserver?.disconnect();
    this.chartResizeObserver = void 0;
    for (const chart of this.charts.values()) chart.remove();
    this.charts.clear();
  }
};
if (!customElements.get("benched-report")) {
  customElements.define("benched-report", BenchedReport);
}
export {
  BenchedReport,
  chartPriceFormat
};
/*! Bundled license information:

@awesome.me/webawesome/dist/chunks/chunk.RPQJAXXR.js:
@awesome.me/webawesome/dist/chunks/chunk.G5ZZIGWB.js:
@awesome.me/webawesome/dist/chunks/chunk.LCEGCF5S.js:
@awesome.me/webawesome/dist/chunks/chunk.XNTP7DEQ.js:
@awesome.me/webawesome/dist/chunks/chunk.PZAN6FPN.js:
@awesome.me/webawesome/dist/chunks/chunk.7VGCIHDG.js:
@awesome.me/webawesome/dist/chunks/chunk.AOKMSJXD.js:
@awesome.me/webawesome/dist/chunks/chunk.4DBVVTNI.js:
@awesome.me/webawesome/dist/components/callout/callout.js:
@awesome.me/webawesome/dist/chunks/chunk.R7QX4M6R.js:
@awesome.me/webawesome/dist/chunks/chunk.VC3BPUZJ.js:
@awesome.me/webawesome/dist/chunks/chunk.KBXNFZQL.js:
@awesome.me/webawesome/dist/chunks/chunk.RWNXKUCF.js:
@awesome.me/webawesome/dist/chunks/chunk.3CFUTVFX.js:
@awesome.me/webawesome/dist/chunks/chunk.KQHZRDPB.js:
@awesome.me/webawesome/dist/chunks/chunk.56IHH3HP.js:
@awesome.me/webawesome/dist/chunks/chunk.AFPI375Q.js:
@awesome.me/webawesome/dist/chunks/chunk.W7A2VLCT.js:
@awesome.me/webawesome/dist/chunks/chunk.DVA7QY5T.js:
@awesome.me/webawesome/dist/chunks/chunk.YDQCS2HK.js:
@awesome.me/webawesome/dist/chunks/chunk.WDIIGUNP.js:
@awesome.me/webawesome/dist/chunks/chunk.O74G5RVH.js:
@awesome.me/webawesome/dist/chunks/chunk.HGBRCPUS.js:
@awesome.me/webawesome/dist/chunks/chunk.KKI7M5DP.js:
@awesome.me/webawesome/dist/chunks/chunk.LDM2MW63.js:
@awesome.me/webawesome/dist/chunks/chunk.W7QZX2CB.js:
@awesome.me/webawesome/dist/chunks/chunk.ZCZ2WKQR.js:
@awesome.me/webawesome/dist/components/button/button.js:
@awesome.me/webawesome/dist/chunks/chunk.ATI2KDM5.js:
@awesome.me/webawesome/dist/chunks/chunk.S37D42WK.js:
@awesome.me/webawesome/dist/components/card/card.js:
@awesome.me/webawesome/dist/chunks/chunk.C3KOHXUM.js:
@awesome.me/webawesome/dist/chunks/chunk.B632VLM3.js:
@awesome.me/webawesome/dist/components/option/option.js:
@awesome.me/webawesome/dist/chunks/chunk.ZCRHF4FU.js:
@awesome.me/webawesome/dist/chunks/chunk.VQZ46MYI.js:
@awesome.me/webawesome/dist/chunks/chunk.4ZAKP7NY.js:
@awesome.me/webawesome/dist/chunks/chunk.MQODJ75V.js:
@awesome.me/webawesome/dist/chunks/chunk.PX3HMKF7.js:
@awesome.me/webawesome/dist/chunks/chunk.3NKIHICW.js:
@awesome.me/webawesome/dist/chunks/chunk.JTOY5KP3.js:
@awesome.me/webawesome/dist/chunks/chunk.52WA2DJO.js:
@awesome.me/webawesome/dist/chunks/chunk.GWSUX3V5.js:
@awesome.me/webawesome/dist/chunks/chunk.5LXXXELE.js:
@awesome.me/webawesome/dist/chunks/chunk.F25QOBDY.js:
@awesome.me/webawesome/dist/chunks/chunk.L6CIKOFQ.js:
@awesome.me/webawesome/dist/chunks/chunk.HCE4CV72.js:
@awesome.me/webawesome/dist/chunks/chunk.HPULLNVR.js:
@awesome.me/webawesome/dist/chunks/chunk.4AHPL3WP.js:
@awesome.me/webawesome/dist/chunks/chunk.37OOIOGE.js:
@awesome.me/webawesome/dist/chunks/chunk.ZWQCGLB5.js:
@awesome.me/webawesome/dist/chunks/chunk.HS5AYC6E.js:
@awesome.me/webawesome/dist/chunks/chunk.64OG2H45.js:
@awesome.me/webawesome/dist/components/select/select.js:
  (*! Copyright 2026 Fonticons, Inc. - https://webawesome.com/license *)

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
   * TradingView Lightweight Charts™ v5.2.0
   * Copyright (c) 2026 TradingView, Inc.
   * Licensed under Apache License 2.0 https://www.apache.org/licenses/LICENSE-2.0
   *)
*/
//# sourceMappingURL=index.js.map
