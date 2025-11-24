import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@crestcat.com' },
    update: {},
    create: {
      email: 'admin@crestcat.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
      balance: 0,
      hasDimeAccount: true,
      dimeBankAccountNumber: 'ADMIN001',
      dimeBankAccountName: 'Admin Account',
    },
  });
  console.log('✓ Admin user created:', admin.email);

  // Create test user
  const userPassword = await bcrypt.hash('User@123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
      emailVerified: true,
      balance: 5000,
      hasDimeAccount: true,
      dimeBankAccountNumber: 'DIME12345678',
      dimeBankAccountName: 'Test User',
    },
  });
  console.log('✓ Test user created:', user.email);

  // Create assets
  const goldAsset = await prisma.asset.upsert({
    where: { symbol: 'XAU' },
    update: {},
    create: {
      name: 'Gold',
      symbol: 'XAU',
      type: 'GOLD',
      description: 'Invest in physical gold with guaranteed returns',
      currentPrice: 2034.50,
      minInvestment: 100,
      imageUrl: '/assets/gold.png',
      benefits: JSON.parse(JSON.stringify([
        'Hedge against inflation and currency devaluation',
        'Safe-haven asset during economic uncertainty',
        'Highly liquid and globally recognized',
        'Portfolio diversification and wealth preservation',
        'No counterparty risk - tangible asset ownership'
      ])),
      priceHistory: JSON.parse(JSON.stringify([
        { timestamp: Date.now() - 86400000 * 7, price: 2000 },
        { timestamp: Date.now() - 86400000 * 6, price: 2010 },
        { timestamp: Date.now() - 86400000 * 5, price: 2015 },
        { timestamp: Date.now() - 86400000 * 4, price: 2020 },
        { timestamp: Date.now() - 86400000 * 3, price: 2025 },
        { timestamp: Date.now() - 86400000 * 2, price: 2030 },
        { timestamp: Date.now() - 86400000, price: 2032 },
        { timestamp: Date.now(), price: 2034.50 },
      ])),
      isActive: true,
    },
  });
  console.log('✓ Gold asset created');

  const silverAsset = await prisma.asset.upsert({
    where: { symbol: 'XAG' },
    update: {},
    create: {
      name: 'Silver',
      symbol: 'XAG',
      type: 'SILVER',
      description: 'Invest in silver for steady growth and portfolio diversification',
      currentPrice: 24.12,
      minInvestment: 50,
      imageUrl: '/assets/silver.png',
      benefits: JSON.parse(JSON.stringify([
        'Industrial demand driving long-term growth',
        'More affordable entry point than gold',
        'Essential component in green energy technologies',
        'Historical store of value with high upside potential',
        'Lower volatility compared to cryptocurrencies'
      ])),
      priceHistory: JSON.parse(JSON.stringify([
        { timestamp: Date.now() - 86400000 * 7, price: 23.5 },
        { timestamp: Date.now() - 86400000 * 6, price: 23.7 },
        { timestamp: Date.now() - 86400000 * 5, price: 23.8 },
        { timestamp: Date.now() - 86400000 * 4, price: 23.9 },
        { timestamp: Date.now() - 86400000 * 3, price: 24.0 },
        { timestamp: Date.now() - 86400000 * 2, price: 24.05 },
        { timestamp: Date.now() - 86400000, price: 24.10 },
        { timestamp: Date.now(), price: 24.12 },
      ])),
      isActive: true,
    },
  });
  console.log('✓ Silver asset created');

  const btcAsset = await prisma.asset.upsert({
    where: { symbol: 'BTC' },
    update: {},
    create: {
      name: 'Bitcoin',
      symbol: 'BTC',
      type: 'CRYPTO',
      description: 'Invest in the leading cryptocurrency for high-growth potential',
      currentPrice: 43250.00,
      minInvestment: 10,
      imageUrl: '/assets/bitcoin.png',
      benefits: JSON.parse(JSON.stringify([
        'Decentralized digital currency with limited supply',
        'High growth potential with institutional adoption',
        '24/7 trading with global market access',
        'Borderless transactions and financial freedom',
        'Protection against traditional market correlation'
      ])),
      priceHistory: JSON.parse(JSON.stringify([
        { timestamp: Date.now() - 86400000 * 7, price: 41000 },
        { timestamp: Date.now() - 86400000 * 6, price: 41500 },
        { timestamp: Date.now() - 86400000 * 5, price: 42000 },
        { timestamp: Date.now() - 86400000 * 4, price: 42200 },
        { timestamp: Date.now() - 86400000 * 3, price: 42500 },
        { timestamp: Date.now() - 86400000 * 2, price: 42800 },
        { timestamp: Date.now() - 86400000, price: 43000 },
        { timestamp: Date.now(), price: 43250 },
      ])),
      isActive: true,
    },
  });
  console.log('✓ Bitcoin asset created');

  const reitAsset = await prisma.asset.upsert({
    where: { symbol: 'REIT' },
    update: {},
    create: {
      name: 'Real Estate',
      symbol: 'REIT',
      type: 'REAL_ESTATE',
      description: 'Invest in commercial and residential real estate properties',
      currentPrice: 156.80,
      minInvestment: 200,
      imageUrl: '/assets/realestate.png',
      benefits: JSON.parse(JSON.stringify([
        'Regular dividend income from rental properties',
        'Tangible asset backed by physical property',
        'Tax advantages and depreciation benefits',
        'Professional property management included',
        'Diversification across multiple properties'
      ])),
      priceHistory: JSON.parse(JSON.stringify([
        { timestamp: Date.now() - 86400000 * 7, price: 155.0 },
        { timestamp: Date.now() - 86400000 * 6, price: 155.5 },
        { timestamp: Date.now() - 86400000 * 5, price: 155.8 },
        { timestamp: Date.now() - 86400000 * 4, price: 156.0 },
        { timestamp: Date.now() - 86400000 * 3, price: 156.2 },
        { timestamp: Date.now() - 86400000 * 2, price: 156.5 },
        { timestamp: Date.now() - 86400000, price: 156.7 },
        { timestamp: Date.now(), price: 156.80 },
      ])),
      isActive: true,
    },
  });
  console.log('✓ Real Estate asset created');

  // Create sample investment for test user
  const investment = await prisma.investment.create({
    data: {
      userId: user.id,
      assetId: goldAsset.id,
      amount: 1000,
      quantity: 1000 / goldAsset.currentPrice,
      purchasePrice: goldAsset.currentPrice,
      currentValue: 1000,
      profitLoss: 0,
      depositMethod: 'USDT',
      isActive: true,
    },
  });
  console.log('✓ Sample investment created');

  // Create sample transaction
  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: 'DEPOSIT',
      status: 'COMPLETED',
      amount: 1000,
      description: 'Investment in Gold',
      metadata: JSON.parse(JSON.stringify({ investmentId: investment.id })),
    },
  });
  console.log('✓ Sample transaction created');

  // Create system settings
  await prisma.systemSettings.upsert({
    where: { key: 'deposit_accounts' },
    update: {},
    create: {
      key: 'deposit_accounts',
      value: JSON.parse(JSON.stringify({
        usdt: {
          network: 'TRC20',
          address: 'TXYZa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5',
          qrCode: '/qr/usdt.png',
        },
        bank: {
          name: 'crestcat Bank',
          accountNumber: '1234567890',
          routingNumber: '987654321',
        },
      })),
      description: 'Deposit account details for users',
    },
  });
  console.log('✓ System settings created');

  // Create default deposit methods
  await prisma.systemSettings.upsert({
    where: { key: 'depositMethods' },
    update: {},
    create: {
      key: 'depositMethods',
      value: JSON.parse(JSON.stringify([
        {
          id: 'usdt-trc20',
          name: 'USDT (TRC20)',
          isActive: true,
          accountDetails: {
            label: 'USDT (TRC20) Address',
            address: 'TXYZa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5',
            network: 'TRC20',
            instructions: 'Send USDT to the address above using TRC20 network only. Copy transaction ID after sending.'
          }
        },
        {
          id: 'bank-transfer',
          name: 'Bank Transfer',
          isActive: true,
          accountDetails: {
            bankName: 'crestcat Bank',
            accountNumber: '1234567890',
            accountName: 'Crest Investment',
            routingNumber: '987654321',
            swiftCode: 'INVPZAJJ',
            branchCode: '250655',
            instructions: 'Use your email as reference when making the transfer.'
          }
        },
        {
          id: 'paypal',
          name: 'PayPal',
          isActive: true,
          accountDetails: {
            email: 'payments@crestinvestment.com',
            instructions: 'Send payment to the email above and include your registered email in the notes.'
          }
        }
      ])),
      description: 'Available deposit methods and account details for investments'
    }
  });
  console.log('✓ Default deposit methods created');

  console.log('✅ Database seeding completed!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@crestcat.com / Admin@123456');
  console.log('User:  user@test.com / User@123456');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
