(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/I18nProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "I18nProvider",
    ()=>I18nProvider,
    "useI18n",
    ()=>useI18n
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
const DICT = {
    appName: {
        id: 'Cafe-X Admin',
        en: 'Cafe-X Admin'
    },
    opsConsole: {
        id: 'Ops Console',
        en: 'Ops Console'
    },
    user: {
        id: 'User',
        en: 'User'
    },
    role: {
        id: 'Role',
        en: 'Role'
    },
    logout: {
        id: 'Keluar',
        en: 'Logout'
    },
    api: {
        id: 'API',
        en: 'API'
    },
    dashboard: {
        id: 'Dashboard',
        en: 'Dashboard'
    },
    products: {
        id: 'Produk',
        en: 'Products'
    },
    tables: {
        id: 'Meja',
        en: 'Tables'
    },
    shifts: {
        id: 'Shift',
        en: 'Shifts'
    },
    orders: {
        id: 'Order',
        en: 'Orders'
    },
    reports: {
        id: 'Laporan',
        en: 'Reports'
    },
    kitchen: {
        id: 'Dapur',
        en: 'Kitchen'
    },
    loginAdmin: {
        id: 'Login Admin',
        en: 'Admin Login'
    },
    username: {
        id: 'Username',
        en: 'Username'
    },
    password: {
        id: 'Password',
        en: 'Password'
    },
    login: {
        id: 'Masuk',
        en: 'Login'
    },
    search: {
        id: 'Cari',
        en: 'Search'
    },
    reset: {
        id: 'Reset',
        en: 'Reset'
    },
    refresh: {
        id: 'Muat ulang',
        en: 'Refresh'
    },
    newProduct: {
        id: 'Produk Baru',
        en: 'New Product'
    },
    addProduct: {
        id: 'Tambah Produk',
        en: 'Add Product'
    },
    editProduct: {
        id: 'Edit Produk',
        en: 'Edit Product'
    },
    create: {
        id: 'Buat',
        en: 'Create'
    },
    update: {
        id: 'Simpan',
        en: 'Update'
    },
    cancel: {
        id: 'Batal',
        en: 'Cancel'
    },
    deactivate: {
        id: 'Nonaktifkan',
        en: 'Deactivate'
    },
    active: {
        id: 'Aktif',
        en: 'Active'
    },
    inactive: {
        id: 'Nonaktif',
        en: 'Inactive'
    },
    rotateQr: {
        id: 'Rotasi QR',
        en: 'Rotate QR'
    },
    copyToken: {
        id: 'Salin Token',
        en: 'Copy Token'
    },
    openShift: {
        id: 'Buka Shift',
        en: 'Open Shift'
    },
    closeShift: {
        id: 'Tutup Shift',
        en: 'Close Shift'
    },
    loadSummary: {
        id: 'Muat Ringkasan',
        en: 'Load Summary'
    },
    loadShift: {
        id: 'Muat Shift',
        en: 'Load Shift'
    },
    loadLatestShift: {
        id: 'Muat Ringkasan Shift Terakhir',
        en: 'Load Latest Shift Summary'
    },
    openedAt: {
        id: 'Dibuka',
        en: 'Opened'
    },
    closedAt: {
        id: 'Ditutup',
        en: 'Closed'
    },
    openingCash: {
        id: 'Kas Awal',
        en: 'Opening Cash'
    },
    closingCash: {
        id: 'Kas Akhir',
        en: 'Closing Cash'
    },
    expectedCash: {
        id: 'Kas Seharusnya',
        en: 'Expected Cash'
    },
    variance: {
        id: 'Selisih',
        en: 'Variance'
    },
    orderSummary: {
        id: 'Ringkasan Order',
        en: 'Order Summary'
    },
    ordersTotal: {
        id: 'Total Order',
        en: 'Orders Total'
    },
    voidCanceled: {
        id: 'Void/Dibatalkan',
        en: 'Void/Canceled'
    },
    paymentsByMethod: {
        id: 'Pembayaran per Metode',
        en: 'Payments by Method'
    },
    method: {
        id: 'Metode',
        en: 'Method'
    },
    count: {
        id: 'Jumlah',
        en: 'Count'
    },
    total: {
        id: 'Total',
        en: 'Total'
    },
    date: {
        id: 'Tanggal',
        en: 'Date'
    },
    sales: {
        id: 'Penjualan',
        en: 'Sales'
    },
    status: {
        id: 'Status',
        en: 'Status'
    },
    table: {
        id: 'Meja',
        en: 'Table'
    },
    created: {
        id: 'Dibuat',
        en: 'Created'
    },
    action: {
        id: 'Aksi',
        en: 'Action'
    },
    detail: {
        id: 'Detail',
        en: 'Detail'
    },
    preparing: {
        id: 'Siapkan',
        en: 'Preparing'
    },
    ready: {
        id: 'Siap',
        en: 'Ready'
    },
    start: {
        id: 'Mulai',
        en: 'Start'
    },
    new: {
        id: 'Baru',
        en: 'New'
    },
    kitchenBoard: {
        id: 'Board Dapur',
        en: 'Kitchen Board'
    },
    dashboardSubtitle: {
        id: 'Ringkasan operasional outlet',
        en: 'Outlet operational summary'
    },
    productsSubtitle: {
        id: 'Kelola katalog menu, stok, dan harga',
        en: 'Manage menu catalog, stock, and pricing'
    },
    tablesSubtitle: {
        id: 'Kelola meja dan QR order',
        en: 'Manage tables and QR order'
    },
    shiftsSubtitle: {
        id: 'Buka/tutup shift dan variance kas',
        en: 'Open/close shift and cash variance'
    },
    reportsSubtitle: {
        id: 'Ringkasan transaksi dan shift',
        en: 'Transaction and shift summary'
    },
    ordersSubtitle: {
        id: 'Monitor dan update status order',
        en: 'Monitor and update order status'
    },
    kitchenSubtitle: {
        id: 'Board status dapur',
        en: 'Kitchen status board'
    },
    totalTables: {
        id: 'Total meja',
        en: 'Total tables'
    },
    searchTable: {
        id: 'Cari meja',
        en: 'Search table'
    },
    searchProduct: {
        id: 'Cari menu...',
        en: 'Search menu...'
    },
    searchOrder: {
        id: 'Cari order / meja',
        en: 'Search order / table'
    },
    allStatus: {
        id: 'Semua status',
        en: 'All status'
    },
    category: {
        id: 'Kategori',
        en: 'Category'
    },
    price: {
        id: 'Harga',
        en: 'Price'
    },
    stock: {
        id: 'Stok',
        en: 'Stock'
    },
    imageUrlOptional: {
        id: 'URL gambar (opsional)',
        en: 'Image URL (optional)'
    },
    printQr: {
        id: 'Cetak QR',
        en: 'Print QR'
    },
    printQrA6: {
        id: 'Cetak QR (A6)',
        en: 'Print QR (A6)'
    },
    printQrA5: {
        id: 'Cetak QR (A5)',
        en: 'Print QR (A5)'
    },
    bulkPrintA6: {
        id: 'Cetak Semua (A6)',
        en: 'Bulk Print (A6)'
    },
    bulkPrintA5: {
        id: 'Cetak Semua (A5)',
        en: 'Bulk Print (A5)'
    },
    scanMe: {
        id: 'SCAN ME',
        en: 'SCAN ME'
    },
    scanInstruction: {
        id: 'Scan QR untuk pesan langsung dari meja',
        en: 'Scan the QR to order from your table'
    },
    batchPrintA4: {
        id: 'Batch A4',
        en: 'Batch A4'
    },
    batchPrintA5: {
        id: 'Batch A5',
        en: 'Batch A5'
    },
    batchPrintA6: {
        id: 'Batch A6',
        en: 'Batch A6'
    },
    footerLabel: {
        id: 'Info',
        en: 'Info'
    },
    selectBatch: {
        id: 'Pilih untuk batch',
        en: 'Select for batch'
    },
    clearSelection: {
        id: 'Bersihkan pilihan',
        en: 'Clear selection'
    },
    outletBrand: {
        id: 'Brand Outlet',
        en: 'Outlet Branding'
    },
    outletName: {
        id: 'Nama Outlet',
        en: 'Outlet Name'
    },
    outletCode: {
        id: 'Kode Outlet',
        en: 'Outlet Code'
    },
    brandName: {
        id: 'Nama Brand',
        en: 'Brand Name'
    },
    brandColor: {
        id: 'Warna Brand',
        en: 'Brand Color'
    },
    contactPhone: {
        id: 'Kontak',
        en: 'Contact'
    },
    save: {
        id: 'Simpan',
        en: 'Save'
    },
    settings: {
        id: 'Pengaturan',
        en: 'Settings'
    },
    outlets: {
        id: 'Outlet',
        en: 'Outlets'
    },
    allCategories: {
        id: 'Semua kategori',
        en: 'All categories'
    },
    name: {
        id: 'Nama',
        en: 'Name'
    },
    code: {
        id: 'Kode',
        en: 'Code'
    },
    noteRotate: {
        id: 'Rotasi QR akan menonaktifkan token lama.',
        en: 'QR rotation will deactivate the old token.'
    }
};
const KEY = 'cafex_admin_lang';
const I18nContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function I18nProvider({ children }) {
    _s();
    const [lang, setLangState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('id');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "I18nProvider.useEffect": ()=>{
            const saved = ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem(KEY) : "TURBOPACK unreachable";
            if (saved === 'id' || saved === 'en') setLangState(saved);
        }
    }["I18nProvider.useEffect"], []);
    function setLang(next) {
        setLangState(next);
        if ("TURBOPACK compile-time truthy", 1) localStorage.setItem(KEY, next);
    }
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "I18nProvider.useMemo[value]": ()=>({
                lang,
                setLang,
                t: ({
                    "I18nProvider.useMemo[value]": (key)=>DICT[key]?.[lang] || DICT[key]?.id || String(key)
                })["I18nProvider.useMemo[value]"]
            })
    }["I18nProvider.useMemo[value]"], [
        lang
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(I18nContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/I18nProvider.tsx",
        lineNumber: 144,
        columnNumber: 10
    }, this);
}
_s(I18nProvider, "u/Zj5422IpMMDf3JmiQL7G0Ytqw=");
_c = I18nProvider;
function useI18n() {
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(I18nContext);
    if (!ctx) throw new Error('useI18n must be used within I18nProvider');
    return ctx;
}
_s1(useI18n, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "I18nProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
]);

//# sourceMappingURL=_ee1389fe._.js.map