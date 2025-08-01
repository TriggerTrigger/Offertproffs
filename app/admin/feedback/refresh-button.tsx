'use client';

export default function RefreshButton() {
  return (
    <button
      onClick={() => {
        window.location.href = `/admin/feedback?t=${Date.now()}`;
      }}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
    >
      Force Refresh
    </button>
  );
} 