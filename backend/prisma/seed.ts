/**
 * Dev seed data for Phase 1 (auth + Same-Day Analytics). Safe to re-run —
 * wipes and recreates everything below in FK-safe order.
 *
 * Usage: npm run db:seed (also runs automatically after `prisma migrate dev`
 * via the "prisma.seed" entry in package.json).
 */
import {
  PrismaClient,
  DeliveryZone,
  BookFormat,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  VendorProfile,
  Product,
  User,
  DeliveryPerson,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { generateUserCode } from '../src/modules/users/user-code.service';

const prisma = new PrismaClient();

const ZONE_RATE: Record<DeliveryZone, number> = { local: 39, rest_bihar: 49, south_india: 59, rest_india: 59 };
const FREE_THRESHOLD: Record<DeliveryZone, number> = { local: 500, rest_bihar: 599, south_india: 699, rest_india: 799 };

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)];
}
function daysAgo(n: number, hour = randInt(8, 21)): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, randInt(0, 59), randInt(0, 59), 0);
  return d;
}

let orderSeq = 0;
function nextOrderNumber(): string {
  orderSeq += 1;
  return `KW-${new Date().getFullYear()}-${String(orderSeq).padStart(5, '0')}`;
}

async function createUser(role: 'admin' | 'vendor' | 'customer' | 'delivery_person', data: Record<string, unknown>) {
  return prisma.$transaction(async (tx) => {
    const user_code = await generateUserCode(tx, role);
    return tx.user.create({ data: { ...data, role, user_code } as never });
  });
}

async function wipe() {
  await prisma.couponUsage.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.vendorOrderItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.orderAddress.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.twoFactorAuth.deleteMany();
  await prisma.adminActionLog.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.deliveryPerson.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.pincode.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();
}

async function seedGeography() {
  const [muzaffarpur, patna, boringRoad, others] = await Promise.all([
    prisma.city.create({ data: { name: 'Muzaffarpur', slug: 'muzaffarpur' } }),
    prisma.city.create({ data: { name: 'Patna', slug: 'patna' } }),
    prisma.city.create({ data: { name: 'Boring Road', slug: 'boring-road' } }),
    prisma.city.create({ data: { name: 'Others', slug: 'others' } }),
  ]);

  const pincodes = await Promise.all([
    prisma.pincode.create({
      data: { pincode: '842001', city_id: muzaffarpur.id, delivery_zone: 'local', is_same_day_eligible: true },
    }),
    prisma.pincode.create({
      data: { pincode: '842002', city_id: muzaffarpur.id, delivery_zone: 'local', is_same_day_eligible: true },
    }),
    prisma.pincode.create({
      data: { pincode: '800001', city_id: patna.id, delivery_zone: 'rest_bihar' },
    }),
    prisma.pincode.create({
      data: { pincode: '800013', city_id: boringRoad.id, delivery_zone: 'rest_bihar' },
    }),
    prisma.pincode.create({
      data: {
        pincode: '560001',
        city_id: others.id,
        delivery_zone: 'south_india',
        cod_type: 'partial_cod',
        partial_cod_amount: 200,
      },
    }),
    prisma.pincode.create({
      data: { pincode: '140001', city_id: others.id, delivery_zone: 'rest_india', cod_type: 'prepaid_only' },
    }),
  ]);

  return { cities: { muzaffarpur, patna, boringRoad, others }, pincodes };
}

async function seedAdmins() {
  const superAdminPassword = await bcrypt.hash(process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'ChangeMe123!', 12);
  const superAdminUser = await createUser('admin', {
    display_name: 'Super Admin',
    phone: process.env.SEED_SUPER_ADMIN_PHONE ?? '+919999999999',
    phone_verified: true,
    password_hash: superAdminPassword,
    auth_provider: 'phone',
  });
  await prisma.adminProfile.create({ data: { user_id: superAdminUser.id, admin_role: 'super_admin' } });

  // A second staff account with NO analytics permission, so the 403/RBAC path is exercisable end-to-end.
  const supportPassword = await bcrypt.hash('SupportOnly123!', 12);
  const supportUser = await createUser('admin', {
    display_name: 'Support Staff',
    phone: '+919999999998',
    phone_verified: true,
    password_hash: supportPassword,
    auth_provider: 'phone',
  });
  await prisma.adminProfile.create({ data: { user_id: supportUser.id, admin_role: 'support' } });

  console.log(`  super_admin login: ${superAdminUser.phone} / (see SEED_SUPER_ADMIN_PASSWORD in .env)`);
  console.log(`  support (no analytics access) login: ${supportUser.phone} / SupportOnly123!`);
  return { superAdminUser, supportUser };
}

const VENDOR_SEEDS = [
  { name: 'Sharma Book Depot', slug: 'sharma-book-depot', city: 'Muzaffarpur' },
  { name: 'Bihar Stationery Mart', slug: 'bihar-stationery-mart', city: 'Patna' },
  { name: 'NCERT Central Store', slug: 'ncert-central-store', city: 'Patna' },
  { name: 'Campus Books & More', slug: 'campus-books-more', city: 'Muzaffarpur' },
];

async function seedVendors() {
  const vendors: VendorProfile[] = [];
  for (const seed of VENDOR_SEEDS) {
    const user = await createUser('vendor', {
      display_name: seed.name,
      phone: `+9190000${String(vendors.length + 1).padStart(5, '0')}`,
      phone_verified: true,
      auth_provider: 'phone',
    });
    const profile = await prisma.vendorProfile.create({
      data: {
        user_id: user.id,
        store_name: seed.name,
        store_slug: seed.slug,
        city: seed.city,
        state: 'Bihar',
        is_verified: true,
      },
    });
    vendors.push(profile);
  }
  return vendors;
}

const PRODUCT_TITLES: { title: string; format: BookFormat; gst: number; price: number }[] = [
  { title: 'NCERT Mathematics Class 10', format: 'physical', gst: 0, price: 145 },
  { title: 'NCERT Science Class 9', format: 'physical', gst: 0, price: 130 },
  { title: "Lucent's General Knowledge", format: 'physical', gst: 0, price: 220 },
  { title: 'R.S. Aggarwal Quantitative Aptitude', format: 'physical', gst: 0, price: 410 },
  { title: 'Oswaal CBSE Sample Papers Class 12', format: 'physical', gst: 0, price: 320 },
  { title: 'Wren and Martin English Grammar', format: 'physical', gst: 0, price: 180 },
  { title: 'NCERT Physics Class 11', format: 'physical', gst: 0, price: 155 },
  { title: 'Arihant SSC CGL Guide', format: 'physical', gst: 0, price: 460 },
  { title: 'Disha IIT JEE Main Guide', format: 'physical', gst: 0, price: 599 },
  { title: 'Pearson Guide to Objective Arithmetic', format: 'physical', gst: 0, price: 350 },
  { title: 'NCERT Chemistry Class 12', format: 'physical', gst: 0, price: 160 },
  { title: 'Tata McGraw Hill Biology', format: 'physical', gst: 0, price: 380 },
  { title: 'NEET Biology Objective', format: 'physical', gst: 0, price: 425 },
  { title: 'UPSC Prelims CSAT Manual', format: 'physical', gst: 0, price: 510 },
  { title: 'BPSC Bihar GK Guide', format: 'physical', gst: 0, price: 275 },
  { title: 'JEE Advanced Physics Problems', format: 'physical', gst: 0, price: 540 },
  { title: 'NCERT Hindi Class 8', format: 'physical', gst: 0, price: 95 },
  { title: 'NCERT Social Science Class 7', format: 'physical', gst: 0, price: 110 },
  { title: 'Oxford School Atlas', format: 'physical', gst: 0, price: 299 },
  { title: 'Cambridge IELTS Practice Tests', format: 'physical', gst: 0, price: 650 },
  { title: 'Campus Notebook Set of 5', format: 'physical', gst: 18, price: 210 },
  { title: 'Classmate Long Notebook', format: 'physical', gst: 18, price: 60 },
  { title: 'Faber-Castell Geometry Box', format: 'physical', gst: 18, price: 150 },
  { title: 'Camlin Pencil Box Set', format: 'physical', gst: 18, price: 90 },
];

async function seedProducts(vendors: { id: number }[]) {
  const products: Product[] = [];
  for (let i = 0; i < PRODUCT_TITLES.length; i++) {
    const seed = PRODUCT_TITLES[i];
    const vendor = vendors[i % vendors.length];
    const product = await prisma.product.create({
      data: {
        vendor_id: vendor.id,
        title: seed.title,
        slug: `${seed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`,
        regular_price: seed.price,
        base_price: seed.price,
        gst_rate: seed.gst,
        sku: `SKU-${1000 + i}`,
        book_format: seed.format,
        condition: 'new_condition',
        stock_quantity: randInt(20, 200),
        sold_count: randInt(0, 150),
      },
    });
    products.push(product);
  }
  return products;
}

async function seedCoupons() {
  return Promise.all([
    prisma.coupon.create({
      data: { code: 'KITABWALAH', description: '10% off, no minimum', type: 'percentage', value: 10 },
    }),
    prisma.coupon.create({
      data: {
        code: 'NEW10',
        description: '10% off, min ₹199',
        type: 'percentage',
        value: 10,
        min_order_amount: 199,
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'BIRTHDAY10',
        description: '10% off in birthday month, max ₹50',
        type: 'percentage',
        value: 10,
        max_discount_amount: 50,
        is_birthday_coupon: true,
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'WELCOME30',
        description: '₹30 off first order, min ₹299',
        type: 'fixed_amount',
        value: 30,
        min_order_amount: 299,
        is_first_order_only: true,
      },
    }),
  ]);
}

async function seedCustomers() {
  const customers: User[] = [];
  // 12 long-standing customers (created well before "today")
  for (let i = 0; i < 12; i++) {
    const user = await createUser('customer', {
      display_name: `Customer ${i + 1}`,
      phone: `+9188888${String(i + 1).padStart(5, '0')}`,
      phone_verified: true,
      auth_provider: 'phone',
      created_at: daysAgo(randInt(31, 400)),
    });
    customers.push(user);
  }
  // 3 brand-new customers (created today), to populate "today's new users"
  for (let i = 0; i < 3; i++) {
    const user = await createUser('customer', {
      display_name: `New Customer ${i + 1}`,
      phone: `+9177777${String(i + 1).padStart(5, '0')}`,
      phone_verified: true,
      auth_provider: 'phone',
    });
    customers.push(user);
  }
  return customers;
}

async function seedDeliveryPersons() {
  const persons: DeliveryPerson[] = [];
  for (let i = 0; i < 2; i++) {
    const user = await createUser('delivery_person', {
      display_name: `Delivery Agent ${i + 1}`,
      phone: `+9166666${String(i + 1).padStart(5, '0')}`,
      phone_verified: true,
      auth_provider: 'phone',
    });
    const person = await prisma.deliveryPerson.create({
      data: { user_id: user.id, name: user.display_name, phone: user.phone as string, vehicle_type: 'bike' },
    });
    persons.push(person);
  }
  return persons;
}

interface OrderContext {
  vendors: { id: number }[];
  products: { id: number; vendor_id: number; title: string; base_price: unknown; gst_rate: unknown }[];
  customers: { id: number; created_at: Date }[];
  pincodes: { id: number; pincode: string; delivery_zone: DeliveryZone; is_same_day_eligible: boolean }[];
  coupons: { id: number; code: string; type: 'percentage' | 'fixed_amount'; value: unknown; min_order_amount: unknown; max_discount_amount: unknown }[];
  deliveryPersons: { id: number }[];
  superAdminId: number;
}

const STATUS_POOL: OrderStatus[] = ['delivered', 'delivered', 'delivered', 'delivered', 'cancelled', 'returned', 'processing', 'shipped'];
const PAYMENT_METHOD_POOL: PaymentMethod[] = ['razorpay', 'razorpay', 'cod', 'wallet', 'cashfree'];

/** Creates one fully-formed order (items, address, vendor commission rows, shipment) and returns it. */
async function createOrder(
  ctx: OrderContext,
  opts: { createdAt: Date; status: OrderStatus; withCoupon?: boolean; paymentStatus?: PaymentStatus },
) {
  const customer = pick(ctx.customers);
  const pincode = pick(ctx.pincodes);
  const itemCount = randInt(1, 3);
  const chosenProducts = Array.from({ length: itemCount }, () => pick(ctx.products));

  let subtotal = 0;
  let gstAmount = 0;
  const itemsData = chosenProducts.map((product) => {
    const qty = randInt(1, 2);
    const unitPrice = Number(product.base_price);
    const gstRate = Number(product.gst_rate);
    const totalPrice = unitPrice * qty;
    const itemGst = Math.round(totalPrice * (gstRate / 100));
    subtotal += totalPrice;
    gstAmount += itemGst;
    return { product, qty, unitPrice, totalPrice, gstRate, itemGst };
  });

  const zone = pincode.delivery_zone;
  const isFree = subtotal > FREE_THRESHOLD[zone];
  const shippingAmount = isFree ? 0 : ZONE_RATE[zone];
  const shippingGst = Math.round(shippingAmount * 0.18);
  const paymentMethod = pick(PAYMENT_METHOD_POOL);
  const codCharge = paymentMethod === 'cod' ? 7 : 0;

  let discountAmount = 0;
  let coupon: OrderContext['coupons'][number] | undefined;
  if (opts.withCoupon && ctx.coupons.length > 0) {
    coupon = pick(ctx.coupons);
    const minOrder = coupon.min_order_amount ? Number(coupon.min_order_amount) : 0;
    if (subtotal >= minOrder) {
      discountAmount =
        coupon.type === 'percentage'
          ? Math.min(subtotal * (Number(coupon.value) / 100), coupon.max_discount_amount ? Number(coupon.max_discount_amount) : Infinity)
          : Number(coupon.value);
      discountAmount = Math.round(discountAmount);
    } else {
      coupon = undefined;
    }
  }

  const total = Math.max(0, subtotal + shippingAmount + codCharge + gstAmount + shippingGst - discountAmount);
  const paymentStatus: PaymentStatus = opts.paymentStatus ?? (opts.status === 'cancelled' ? 'failed' : 'paid');
  const deliveryType = pincode.is_same_day_eligible && Math.random() < 0.7 ? 'same_day' : 'normal';

  const order = await prisma.order.create({
    data: {
      order_number: nextOrderNumber(),
      user_id: customer.id,
      status: opts.status,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      subtotal,
      shipping_amount: shippingAmount,
      cod_charge: codCharge,
      discount_amount: discountAmount,
      gst_amount: gstAmount,
      shipping_gst_amount: shippingGst,
      wallet_amount_used: 0,
      total,
      coupon_id: coupon?.id,
      coupon_code: coupon?.code,
      is_cod: paymentMethod === 'cod',
      delivery_type: deliveryType,
      pincode: pincode.pincode,
      delivered_at: opts.status === 'delivered' ? opts.createdAt : undefined,
      cancelled_at: opts.status === 'cancelled' ? opts.createdAt : undefined,
      created_at: opts.createdAt,
      updated_at: opts.createdAt,
    },
  });

  await prisma.orderAddress.create({
    data: {
      order_id: order.id,
      address_type: 'shipping',
      first_name: customer.id.toString(),
      pincode: pincode.pincode,
      country: 'India',
      created_at: opts.createdAt,
    },
  });

  for (const item of itemsData) {
    const orderItem = await prisma.orderItem.create({
      data: {
        order_id: order.id,
        product_id: item.product.id,
        vendor_id: item.product.vendor_id,
        product_name: item.product.title,
        unit_price: item.unitPrice,
        quantity: item.qty,
        total_price: item.totalPrice,
        gst_rate: item.gstRate,
        gst_amount: item.itemGst,
        status: opts.status === 'cancelled' ? 'cancelled' : opts.status === 'returned' ? 'returned' : 'active',
        created_at: opts.createdAt,
        updated_at: opts.createdAt,
      },
    });

    const commissionRate = 10;
    const commissionAmount = Math.round(item.totalPrice * (commissionRate / 100));
    await prisma.vendorOrderItem.create({
      data: {
        order_id: order.id,
        order_item_id: orderItem.id,
        vendor_id: item.product.vendor_id,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        vendor_earning: item.totalPrice - commissionAmount,
        status: opts.status,
        settlement_status: opts.status === 'delivered' ? 'completed' : 'pending',
        created_at: opts.createdAt,
        updated_at: opts.createdAt,
      },
    });
  }

  if (opts.status !== 'cancelled') {
    await prisma.shipment.create({
      data: {
        order_id: order.id,
        delivery_person_id: deliveryType === 'same_day' ? pick(ctx.deliveryPersons).id : undefined,
        delivery_type: deliveryType,
        status: opts.status === 'delivered' ? 'delivered' : opts.status === 'shipped' ? 'in_transit' : 'pending',
        created_at: opts.createdAt,
        updated_at: opts.createdAt,
      },
    });
  }

  if (coupon) {
    await prisma.couponUsage.create({
      data: {
        coupon_id: coupon.id,
        user_id: customer.id,
        order_id: order.id,
        discount_applied: discountAmount,
        used_at: opts.createdAt,
      },
    });
    await prisma.coupon.update({ where: { id: coupon.id }, data: { used_count: { increment: 1 } } });
  }

  return { order, itemsData };
}

async function seedReturn(ctx: OrderContext, orderId: number, orderItemId: number, amount: number, when: Date) {
  await prisma.returnRequest.create({
    data: {
      order_id: orderId,
      order_item_id: orderItemId,
      user_id: pick(ctx.customers).id,
      reason: 'wrong_item',
      status: 'completed',
      refund_amount: amount,
      refund_method: 'original_payment',
      reviewed_by_id: ctx.superAdminId,
      reviewed_at: when,
      created_at: when,
      updated_at: when,
    },
  });
}

async function seedOrders(ctx: OrderContext) {
  const historicalReturnCandidates: { orderId: number; orderItemId: number; amount: number; when: Date }[] = [];

  // 29 days of history
  for (let day = 29; day >= 1; day--) {
    const ordersToday = randInt(1, 4);
    for (let i = 0; i < ordersToday; i++) {
      const status = pick(STATUS_POOL);
      const createdAt = daysAgo(day);
      const { order, itemsData } = await createOrder(ctx, {
        createdAt,
        status,
        withCoupon: Math.random() < 0.25,
      });
      if (status === 'returned' && itemsData.length > 0) {
        const item = await prisma.orderItem.findFirst({ where: { order_id: order.id } });
        if (item) {
          historicalReturnCandidates.push({
            orderId: order.id,
            orderItemId: item.id,
            amount: Number(item.total_price),
            when: createdAt,
          });
        }
      }
    }
  }

  // Backfill ReturnRequest rows for a handful of historical "returned" orders
  for (const candidate of historicalReturnCandidates.slice(0, 5)) {
    await seedReturn(ctx, candidate.orderId, candidate.orderItemId, candidate.amount, candidate.when);
  }

  // Today: a deliberately varied set so every Same-Day Analytics metric is non-zero
  const now = new Date();
  const todayOrders: { orderId: number; orderItemId: number; amount: number }[] = [];

  for (const status of ['pending', 'confirmed', 'confirmed', 'processing', 'processing', 'shipped', 'delivered'] as OrderStatus[]) {
    const { order, itemsData } = await createOrder(ctx, {
      createdAt: new Date(now.getTime() - randInt(0, 8) * 60 * 60 * 1000),
      status,
      withCoupon: Math.random() < 0.4,
    });
    if (itemsData.length > 0) {
      const item = await prisma.orderItem.findFirst({ where: { order_id: order.id } });
      if (item) todayOrders.push({ orderId: order.id, orderItemId: item.id, amount: Number(item.total_price) });
    }
  }
  // One cancelled order today, to prove the analytics exclusion filter works
  await createOrder(ctx, { createdAt: now, status: 'cancelled', paymentStatus: 'failed' });

  // One refund completed today, so "today's refund cost" is non-zero
  const refundTarget = todayOrders[0];
  if (refundTarget) {
    await seedReturn(ctx, refundTarget.orderId, refundTarget.orderItemId, refundTarget.amount, now);
  }
}

async function main() {
  console.log('Wiping existing data...');
  await wipe();

  console.log('Seeding geography (cities + pincodes)...');
  const { pincodes } = await seedGeography();

  console.log('Seeding admin staff...');
  const { superAdminUser } = await seedAdmins();

  console.log('Seeding vendors...');
  const vendors = await seedVendors();

  console.log('Seeding products...');
  const products = await seedProducts(vendors);

  console.log('Seeding coupons...');
  const coupons = await seedCoupons();

  console.log('Seeding customers...');
  const customers = await seedCustomers();

  console.log('Seeding delivery persons...');
  const deliveryPersons = await seedDeliveryPersons();

  console.log('Seeding orders (30 days of history + today)...');
  await seedOrders({
    vendors,
    products,
    customers,
    pincodes,
    coupons: coupons as unknown as OrderContext['coupons'],
    deliveryPersons,
    superAdminId: superAdminUser.id,
  });

  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
