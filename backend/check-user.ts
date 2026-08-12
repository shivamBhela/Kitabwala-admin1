import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const phone = '1234567890';
  const password = '0987654321';
  
  const user = await prisma.user.findUnique({
    where: { phone }
  });

  if (!user) {
    console.log(`User with phone ${phone} not found!`);
  } else {
    console.log('User found:', {
      id: user.id,
      phone: user.phone,
      role: user.role,
      has_password_hash: !!user.password_hash
    });
    
    if (user.password_hash) {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      console.log('Password match:', isMatch);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
