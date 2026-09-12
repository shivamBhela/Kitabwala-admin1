export interface DelhiveryShipment {
  awb_number: string;
  order_id: string;
  status: 'Manifested' | 'Picked Up' | 'In Transit' | 'Delivered';
  tracking_url: string;
  created_at: string;
}

export const delhiveryService = {
  createShipment: async (orderId: string): Promise<DelhiveryShipment> => {
    // Mocking an API call to Delhivery
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          awb_number: `DLV${Math.floor(Math.random() * 1000000000)}`,
          order_id: orderId,
          status: 'Manifested',
          tracking_url: `https://delhivery.com/track/DLV${Math.floor(Math.random() * 1000000000)}`,
          created_at: new Date().toISOString(),
        });
      }, 1500);
    });
  },

  trackShipment: async (awbNumber: string): Promise<{ status: string; location: string; timestamp: string }[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { status: 'Manifested', location: 'Muzaffarpur Hub', timestamp: new Date(Date.now() - 86400000).toISOString() },
          { status: 'In Transit', location: 'Patna Sorting Center', timestamp: new Date(Date.now() - 43200000).toISOString() },
          { status: 'Out for Delivery', location: 'Local Hub', timestamp: new Date().toISOString() },
        ]);
      }, 1000);
    });
  }
};
