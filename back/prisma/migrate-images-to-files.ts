import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateImagesToFiles() {
  console.log('Starting migration: Converting image URLs to File references...\n');

  try {
    // 1. Migrate Banner images
    console.log('📋 Migrating Banner images...');
    const bannersRaw = await prisma.$queryRaw<any[]>`
      SELECT id, image_url, created_by
      FROM banners
      WHERE image_url IS NOT NULL AND image_url != ''
    `;

    console.log(`Found ${bannersRaw.length} banners with image_url`);

    for (const banner of bannersRaw) {
      console.log(`  Processing banner: ${banner.id}`);

      // Create File record
      const file = await prisma.file.create({
        data: {
          fileType: 'BANNER',
          originalName: banner.image_url.split('/').pop() || 'banner-image',
          savedName: banner.image_url.split('/').pop() || 'banner-image',
          filePath: banner.image_url,
          fileSize: 0, // Unknown size for existing URLs
          mimeType: 'image/jpeg', // Default assumption
          url: banner.image_url,
          uploadedBy: banner.created_by,
        },
      });

      console.log(`  Created File: ${file.id} for URL: ${banner.image_url}`);

      // Update banner to reference the File
      await prisma.$executeRaw`
        UPDATE banners
        SET image_id = ${file.id}
        WHERE id = ${banner.id}
      `;

      console.log(`  Updated banner ${banner.id} with image_id: ${file.id}`);
    }

    // 2. Migrate Popup images
    console.log('\n📋 Migrating Popup images...');
    const popupsRaw = await prisma.$queryRaw<any[]>`
      SELECT id, image_url, created_by
      FROM popups
      WHERE image_url IS NOT NULL AND image_url != ''
    `;

    console.log(`Found ${popupsRaw.length} popups with image_url`);

    for (const popup of popupsRaw) {
      console.log(`  Processing popup: ${popup.id}`);

      // Create File record
      const file = await prisma.file.create({
        data: {
          fileType: 'POPUP',
          originalName: popup.image_url.split('/').pop() || 'popup-image',
          savedName: popup.image_url.split('/').pop() || 'popup-image',
          filePath: popup.image_url,
          fileSize: 0, // Unknown size for existing URLs
          mimeType: 'image/jpeg', // Default assumption
          url: popup.image_url,
          uploadedBy: popup.created_by,
        },
      });

      console.log(`  Created File: ${file.id} for URL: ${popup.image_url}`);

      // Update popup to reference the File
      await prisma.$executeRaw`
        UPDATE popups
        SET image_id = ${file.id}
        WHERE id = ${popup.id}
      `;

      console.log(`  Updated popup ${popup.id} with image_id: ${file.id}`);
    }

    // 3. Check Events (in case there are any)
    console.log('\n📋 Checking Event images...');
    const eventsRaw = await prisma.$queryRaw<any[]>`
      SELECT id, image_url, created_by
      FROM events
      WHERE image_url IS NOT NULL AND image_url != ''
    `;

    if (eventsRaw.length > 0) {
      console.log(`Found ${eventsRaw.length} events with image_url`);

      for (const event of eventsRaw) {
        console.log(`  Processing event: ${event.id}`);

        // Create File record
        const file = await prisma.file.create({
          data: {
            fileType: 'EVENT',
            originalName: event.image_url.split('/').pop() || 'event-image',
            savedName: event.image_url.split('/').pop() || 'event-image',
            filePath: event.image_url,
            fileSize: 0,
            mimeType: 'image/jpeg',
            url: event.image_url,
            uploadedBy: event.created_by,
          },
        });

        console.log(`  Created File: ${file.id} for URL: ${event.image_url}`);

        await prisma.$executeRaw`
          UPDATE events
          SET image_id = ${file.id}
          WHERE id = ${event.id}
        `;

        console.log(`  Updated event ${event.id} with image_id: ${file.id}`);
      }
    } else {
      console.log('No events with image_url found');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext step: Run "npx prisma db push --accept-data-loss" to apply schema changes');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateImagesToFiles()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
