import { Gender, PrismaClient, VerificationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

export const prisma = new PrismaClient();

export async function main() {
  console.log('Starting seed...');

  // Validate required environment variables
  const requiredEnvVars = [
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'ADMIN_NAME',
    'ADMIN_PHONE',
    'ADMIN_CITY',
    'ADMIN_COUNTRY',
  ] as const;

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  // Create roles
  const roles = [
    {
      name: 'ADMIN',
      description: 'Administrator role with full system access',
    },
    {
      name: 'PATIENT',
      description: 'Patient role for accessing healthcare services',
    },
    {
      name: 'DOCTOR',
      description: 'Doctor role for conducting consultations and prescribing medicines',
    },
    {
      name: 'PHARMACIST',
      description: 'Pharmacist role for managing prescriptions and dispensing medicines',
    },
    {
      name: 'LABORATORY_STAFF',
      description: 'Laboratory staff role for performing and reporting lab tests',
    },
  ];

  console.log('Creating roles...');
  const createdRoles: Record<string, any> = {};

  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
      },
      create: role,
    });
    createdRoles[role.name] = createdRole;
    console.log(`Role "${role.name}" created/updated`);
  }

  // Get admin credentials from environment variables
  const adminEmail = process.env.ADMIN_EMAIL!;
  const adminPassword = process.env.ADMIN_PASSWORD!;
  const adminName = process.env.ADMIN_NAME!;
  const adminPhone = process.env.ADMIN_PHONE!;
  const adminCity = process.env.ADMIN_CITY!;
  const adminCountry = process.env.ADMIN_COUNTRY!;

  // Create admin user (inactive)
  console.log('Creating admin user...');

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      roleId: createdRoles['ADMIN'].id,
      name: adminName,
      email: adminEmail,
      phoneNumber: adminPhone,
      passwordHash: hashedPassword,
      gender: Gender.PREFER_NOT_TO_SAY,
      country: adminCountry,
      city: adminCity,
      verificationStatus: VerificationStatus.VERIFIED,
      isEmailVerified: true,
      active: true,
      isAccountSuspended: false,
    },
  });

  console.log('Admin user created (active)');
  console.log('Email:', adminEmail);
  console.log('Password:', adminPassword);
  console.log('Remember to change the password after first login!');
  console.log('User ID:', adminUser.id);
  console.log('');
  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
