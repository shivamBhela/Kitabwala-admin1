import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const newPhone = '1234567890';
  const newPassword = '0987654321';
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { id: 1 },
    data: { 
      phone: newPhone,
      password_hash: hashedPassword
    }
  });

  console.log(`Successfully updated admin phone to ${newPhone} and password to ${newPassword}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
