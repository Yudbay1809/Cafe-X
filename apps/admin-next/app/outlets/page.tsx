import React from 'react';

export const metadata = {
  title: 'Multi-Outlet Management - Cafe-X HQ',
};

export default function OutletsPage() {
  return (
    <div className="card">
      <h2>Multi-Outlet Management</h2>
      <p className="text-gray-600 mb-4">
        Kelola seluruh cabang Cafe-X dari satu tempat. Tambahkan cabang baru, atur konfigurasi pajak daerah, dan tetapkan Master Menu untuk tiap cabang.
      </p>

      <table className="table w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2">ID</th>
            <th className="p-2">Nama Cabang</th>
            <th className="p-2">Alamat</th>
            <th className="p-2">Status</th>
            <th className="p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b hover:bg-gray-50">
            <td className="p-2">1</td>
            <td className="p-2 font-bold">Cafe-X Senopati (Pusat)</td>
            <td className="p-2">Jl. Senopati No. 12, Jaksel</td>
            <td className="p-2"><span className="text-green-600 font-bold">Active</span></td>
            <td className="p-2"><button className="text-blue-500 underline">Edit</button></td>
          </tr>
          <tr className="border-b hover:bg-gray-50">
            <td className="p-2">2</td>
            <td className="p-2 font-bold">Cafe-X Kemang</td>
            <td className="p-2">Jl. Kemang Raya No. 45, Jaksel</td>
            <td className="p-2"><span className="text-green-600 font-bold">Active</span></td>
            <td className="p-2"><button className="text-blue-500 underline">Edit</button></td>
          </tr>
          <tr className="border-b hover:bg-gray-50">
            <td className="p-2">3</td>
            <td className="p-2 font-bold">Cafe-X PIK</td>
            <td className="p-2">Pantai Indah Kapuk, Jakut</td>
            <td className="p-2"><span className="text-orange-500 font-bold">Preparing</span></td>
            <td className="p-2"><button className="text-blue-500 underline">Edit</button></td>
          </tr>
        </tbody>
      </table>
      
      <div className="mt-6">
        <button className="primary">Tambah Cabang Baru</button>
      </div>
    </div>
  );
}
