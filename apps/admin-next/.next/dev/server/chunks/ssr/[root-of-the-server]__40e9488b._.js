module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/components/I18nProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "I18nProvider",
    ()=>I18nProvider,
    "useI18n",
    ()=>useI18n
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
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
const I18nContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function I18nProvider({ children }) {
    const [lang, setLangState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('id');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const saved = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }, []);
    function setLang(next) {
        setLangState(next);
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            lang,
            setLang,
            t: (key)=>DICT[key]?.[lang] || DICT[key]?.id || String(key)
        }), [
        lang
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(I18nContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/I18nProvider.tsx",
        lineNumber: 144,
        columnNumber: 10
    }, this);
}
function useI18n() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(I18nContext);
    if (!ctx) throw new Error('useI18n must be used within I18nProvider');
    return ctx;
}
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__40e9488b._.js.map