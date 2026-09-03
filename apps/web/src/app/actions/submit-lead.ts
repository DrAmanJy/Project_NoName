'use server';

import nodemailer from 'nodemailer';

interface LeadInput {
  name: string;
  phone: string;
  currentlyLived: string;
}

export async function submitLeadAction(data: LeadInput) {
  try {
    const { name, phone, currentlyLived } = data;

    // Server-side validation
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Name must be at least 2 characters.' };
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!phone || cleanPhone.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit phone number.' };
    }

    if (!currentlyLived || !currentlyLived.trim()) {
      return { success: false, error: 'Please specify the country you currently live in.' };
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || gmailUser;

    // Check if configuration is missing
    if (!gmailUser || !gmailAppPassword) {
      console.warn(
        'Warning: GMAIL_USER or GMAIL_APP_PASSWORD environment variables are missing. Logging lead details locally:',
        { name, phone, currentlyLived }
      );
      // Simulate success in local development if environment variables are not set yet
      return {
        success: true,
        message: 'Lead received successfully (Simulated - SMTP credentials not configured).',
      };
    }

    // Configure the transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // Email content construction
    const mailOptions = {
      from: `"LifestudioCanada Leads" <${gmailUser}>`,
      to: adminEmail,
      subject: `New Lead: Fill to Get Paid - ${name}`,
      text: `
New Lead Details:
----------------
Name: ${name}
Phone: ${phone}
Currently Lived: ${currentlyLived}
Submitted At: ${new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' })} (EST)
      `,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #DD413A; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 16px; border-bottom: 2px solid #f4f4f5; padding-bottom: 12px;">
            New Lead: Fill to Get Paid
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 10px 0; font-size: 14px; font-weight: 600; color: #71717a; width: 140px;">Full Name:</td>
              <td style="padding: 10px 0; font-size: 15px; font-weight: 700; color: #09090b;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 14px; font-weight: 600; color: #71717a; border-top: 1px solid #f4f4f5;">Phone Number:</td>
              <td style="padding: 10px 0; font-size: 15px; font-weight: 700; color: #09090b; border-top: 1px solid #f4f4f5;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 14px; font-weight: 600; color: #71717a; border-top: 1px solid #f4f4f5;">Currently Lived:</td>
              <td style="padding: 10px 0; font-size: 15px; font-weight: 700; color: #09090b; border-top: 1px solid #f4f4f5;">${currentlyLived}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 14px; font-weight: 600; color: #71717a; border-top: 1px solid #f4f4f5;">Submitted At:</td>
              <td style="padding: 10px 0; font-size: 13px; color: #71717a; border-top: 1px solid #f4f4f5;">
                ${new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' })} (EST)
              </td>
            </tr>
          </table>
          <div style="font-size: 11px; color: #a1a1aa; text-align: center; border-top: 1px solid #f4f4f5; padding-top: 12px; margin-top: 8px;">
            This lead was submitted via the LifestudioCanada "Fill to Get Paid" form.
          </div>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error('Error sending lead email:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while submitting your details. Please try again later.',
    };
  }
}
