import React from 'react';

export const metadata = {
  title: 'POS Devices Monitoring - Cafe-X HQ',
};

export default function DevicesPage() {
  return (
    <div className="card">
      <h2>POS Devices Monitoring</h2>
      <p className="text-gray-600 mb-4">
        Pantau status *online/offline* dan riwayat sinkronisasi tablet kasir di semua cabang.
      </p>

      <table className="table w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2">Device ID</th>
            <th className="p-2">Cabang</th>
            <th className="p-2">Status</th>
            <th className="p-2">Baterai</th>
            <th className="p-2">Terakhir Sinkronisasi</th>
            <th className="p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b hover:bg-gray-50">
            <td className="p-2 font-mono text-sm">POS-SENOPATI-01</td>
            <td className="p-2 font-bold">Cafe-X Senopati</td>
            <td className="p-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Online</span>
            </td>
            <td className="p-2">85%</td>
            <td className="p-2 text-sm">Baru saja</td>
            <td className="p-2"><button className="text-blue-500 underline text-sm">Force Sync</button></td>
          </tr>
          <tr className="border-b hover:bg-gray-50">
            <td className="p-2 font-mono text-sm">POS-KEMANG-01</td>
            <td className="p-2 font-bold">Cafe-X Kemang</td>
            <td className="p-2">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">Offline</span>
            </td>
            <td className="p-2">12%</td>
            <td className="p-2 text-sm text-red-500 font-semibold">2 jam yang lalu</td>
            <td className="p-2"><button className="text-blue-500 underline text-sm">Ping</button></td>
          </tr>
          <tr className="border-b hover:bg-gray-50">
            <td className="p-2 font-mono text-sm">POS-KEMANG-02</td>
            <td className="p-2 font-bold">Cafe-X Kemang</td>
            <td className="p-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Online</span>
            </td>
            <td className="p-2">100%</td>
            <td className="p-2 text-sm">10 menit yang lalu</td>
            <td className="p-2"><button className="text-blue-500 underline text-sm">Force Sync</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
