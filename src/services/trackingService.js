/**
 * Aksena Tracking Service
 * Handles AWB (Resi) tracking simulation or integration
 */

const courierNames = {
  'jne': 'JNE Express',
  'jnt': 'J&T Express',
  'sicepat': 'SiCepat Ekspres',
  'tiki': 'TIKI',
  'pos': 'POS Indonesia'
};

const mockTrackingData = (awb) => {
  const couriers = Object.keys(courierNames);
  const courier = couriers[Math.floor(Math.random() * couriers.length)];
  
  return {
    summary: {
      awb,
      courier: courierNames[courier],
      status: 'On Process',
      origin: 'Jakarta',
      destination: 'Surabaya',
      receiver: 'Budi Santoso',
      date: new Date().toLocaleDateString('id-ID')
    },
    history: [
      { date: '2026-04-07 09:00', location: 'Jakarta', desc: 'Pesanan telah diproses oleh penjual' },
      { date: '2026-04-07 14:30', location: 'Jakarta', desc: 'Paket telah diserahkan ke kurir' },
      { date: '2026-04-07 20:15', location: 'Jakarta Gateway', desc: 'Paket sedang dalam transit' },
      { date: '2026-04-08 05:45', location: 'Jakarta Gateway', desc: 'Paket telah keluar dari pusat transit' },
      { date: '2026-04-08 22:10', location: 'Surabaya Hub', desc: 'Paket telah tiba di pusat distribusi Surabaya' },
      { date: '2026-04-09 08:30', location: 'Surabaya', desc: 'Paket sedang dibawa oleh kurir ke alamat tujuan' }
    ]
  };
};

export const trackingService = {
  /**
   * Get tracking info for an AWB
   * In production, this would call Binderbyte or RajaOngkir API
   */
  trackAWB: async (awb) => {
    // Artificial delay for realism
    await new Promise(r => setTimeout(r, 1200));
    
    // Logic: If AWB starts with 'AKSN', return real-looking mock data
    if (awb && awb.length > 5) {
      return { success: true, data: mockTrackingData(awb) };
    }
    
    return { success: false, message: 'Nomor resi tidak ditemukan atau belum terdaftar.' };
  }
};
