import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Renaming social_accounts table to user_sso...');

  try {
    await prisma.$executeRawUnsafe('ALTER TABLE social_accounts RENAME TO user_sso;');
    console.log('✅ Table renamed successfully!');
  } catch (error: any) {
    if (error.message.includes('does not exist')) {
      console.log('ℹ️  Table already renamed or doesn not exist');
    } else {
      console.error('❌ Error renaming table:', error);
      throw error;
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
