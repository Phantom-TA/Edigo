import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { db } from '@/app/_configs/db';
import { Users } from '@/app/_configs/Schema';
import { eq } from 'drizzle-orm';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    // Get headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: 'Missing svix headers' },
        { status: 400 }
      );
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Verify the webhook signature (only if webhook secret is configured)
    if (webhookSecret) {
      const wh = new Webhook(webhookSecret);
      let evt;

      try {
        evt = wh.verify(body, {
          'svix-id': svix_id,
          'svix-timestamp': svix_timestamp,
          'svix-signature': svix_signature,
        }) as any;
      } catch (err) {
        console.error('Error verifying webhook:', err);
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }
    }

    const { type, data } = payload;

    // Handle user.created event
    if (type === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = data;

      const email = email_addresses?.[0]?.email_address || '';
      const fullName = `${first_name || ''} ${last_name || ''}`.trim() || 'User';

      // Check if user already exists (might have been created via role selection)
      const existingUser = await db
        .select()
        .from(Users)
        .where(eq(Users.clerkId, id))
        .limit(1);

      if (existingUser.length === 0) {
        // Create user with default STUDENT role
        // They will be prompted to select role on first login
        await db.insert(Users).values({
          clerkId: id,
          email,
          fullName,
          profileImage: image_url || null,
          role: 'STUDENT', // Default role
        });
      }
    }

    // Handle user.updated event
    if (type === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = data;

      const email = email_addresses?.[0]?.email_address || '';
      const fullName = `${first_name || ''} ${last_name || ''}`.trim() || 'User';

      // Update user in database
      await db
        .update(Users)
        .set({
          email,
          fullName,
          profileImage: image_url || null,
          updatedAt: new Date(),
        })
        .where(eq(Users.clerkId, id));
    }

    // Handle user.deleted event
    if (type === 'user.deleted') {
      const { id } = data;

      // Note: Consider soft delete instead of hard delete in production
      // For now, we'll keep the user data but could mark as deleted
      console.log(`User ${id} deleted from Clerk`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
